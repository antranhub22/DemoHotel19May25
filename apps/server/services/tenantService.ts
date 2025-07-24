import { eq, and, sql } from 'drizzle-orm';
import { db } from '@server/db';
import { tenantMapper, hotelProfileMapper } from '@shared/db/transformers';
import {
  tenants,
  hotelProfiles,
  staff,
  call,
  transcript,
  request,
  message,
} from '@shared/schema';
import { logger } from '@shared/utils/logger';

// ============================================
// Types & Interfaces for Tenant Management
// ============================================

export interface TenantConfig {
  hotelName: string;
  subdomain: string;
  customDomain?: string;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired' | 'cancelled';
  trialEndsAt?: Date;
  maxVoices?: number;
  maxLanguages?: number;
  voiceCloning?: boolean;
  multiLocation?: boolean;
  whiteLabel?: boolean;
  dataRetentionDays?: number;
  monthlyCallLimit?: number;
}

export interface TenantUsage {
  callsThisMonth: number;
  voicesUsed: number;
  languagesUsed: number;
  storageUsed: number;
  dataRetentionDays: number;
}

export interface FeatureFlags {
  voiceCloning: boolean;
  multiLocation: boolean;
  whiteLabel: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  bulkOperations: boolean;
}

export interface SubscriptionLimits {
  maxVoices: number;
  maxLanguages: number;
  monthlyCallLimit: number;
  dataRetentionDays: number;
  maxStaffUsers: number;
  maxHotelLocations: number;
}

// ============================================
// Tenant Management Service
// ============================================

export class TenantService {
  // ============================================
  // Tenant Creation & Management
  // ============================================

  /**
   * Create a new tenant with default settings
   */
  async createTenant(config: TenantConfig): Promise<string> {
    try {
      logger.debug(`🏨 Creating new tenant: ${config.hotelName}`, 'Component');

      // Validate subdomain availability
      await this.validateSubdomain(config.subdomain);

      // Set default feature flags based on subscription plan
      const featureFlags = this.getDefaultFeatureFlags(config.subscriptionPlan);
      const subscriptionLimits = this.getSubscriptionLimits(
        config.subscriptionPlan
      );

      // Create tenant using field mapper
      const tenantId = `tenant-${Date.now()}`;
      const tenantData = tenantMapper.toDatabase({
        id: tenantId,
        hotelName: config.hotelName,
        subdomain: config.subdomain,
        customDomain: config.customDomain,
        subscriptionPlan: config.subscriptionPlan,
        subscriptionStatus: config.subscriptionStatus,
        trialEndsAt: config.trialEndsAt || this.getTrialEndDate(),
        maxVoices: subscriptionLimits.maxVoices,
        maxLanguages: subscriptionLimits.maxLanguages,
        voiceCloning: featureFlags.voiceCloning,
        multiLocation: featureFlags.multiLocation,
        whiteLabel: featureFlags.whiteLabel,
        dataRetentionDays: subscriptionLimits.dataRetentionDays,
        monthlyCallLimit: subscriptionLimits.monthlyCallLimit,
        createdAt: new Date(),
      });

      const [tenant] = await db.insert(tenants).values(tenantData).returning();

      // Create default hotel profile using field mapper
      const profileData = hotelProfileMapper.toDatabase({
        id: `profile-${tenant.id}`,
        tenantId: tenant.id,
        researchData: null,
        assistantConfig: null,
        vapiAssistantId: null,
        servicesConfig: null,
        knowledgeBase: null,
        systemPrompt: null,
      });

      await db.insert(hotelProfiles).values(profileData);

      logger.debug(`✅ Tenant created successfully: ${tenant.id}`, 'Component');
      return tenant.id;
    } catch (error) {
      logger.error(
        'Failed to create tenant ${config.hotelName}:',
        'Component',
        error
      );
      throw new TenantError(
        `Failed to create tenant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'TENANT_CREATION_FAILED',
        500
      );
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<any> {
    try {
      const [tenant] = await db
        .select({
          id: tenants.id,
          hotel_name: tenants.hotel_name,
          subdomain: tenants.subdomain,
          custom_domain: tenants.custom_domain,
          subscription_plan: tenants.subscription_plan,
          subscription_status: tenants.subscription_status,
          trial_ends_at: tenants.trial_ends_at,
          created_at: tenants.created_at,
          updated_at: tenants.updated_at,
          max_voices: tenants.max_voices,
          max_languages: tenants.max_languages,
          voice_cloning: tenants.voice_cloning,
          multi_location: tenants.multi_location,
          white_label: tenants.white_label,
          data_retention_days: tenants.data_retention_days,
          monthly_call_limit: tenants.monthly_call_limit,
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        throw new TenantError('Tenant not found', 'TENANT_NOT_FOUND', 404);
      }

      return tenant;
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      throw new TenantError(
        `Failed to get tenant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'TENANT_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<any> {
    try {
      const [tenant] = await db
        .select({
          id: tenants.id,
          hotel_name: tenants.hotel_name,
          subdomain: tenants.subdomain,
          custom_domain: tenants.custom_domain,
          subscription_plan: tenants.subscription_plan,
          subscription_status: tenants.subscription_status,
          trial_ends_at: tenants.trial_ends_at,
          created_at: tenants.created_at,
          updated_at: tenants.updated_at,
          max_voices: tenants.max_voices,
          max_languages: tenants.max_languages,
          voice_cloning: tenants.voice_cloning,
          multi_location: tenants.multi_location,
          white_label: tenants.white_label,
          data_retention_days: tenants.data_retention_days,
          monthly_call_limit: tenants.monthly_call_limit,
        })
        .from(tenants)
        .where(eq(tenants.subdomain, subdomain))
        .limit(1);

      if (!tenant) {
        throw new TenantError('Tenant not found', 'TENANT_NOT_FOUND', 404);
      }

      return tenant;
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      throw new TenantError(
        `Failed to get tenant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'TENANT_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(
    tenantId: string,
    updates: Partial<TenantConfig>
  ): Promise<void> {
    try {
      logger.debug(`🔄 Updating tenant: ${tenantId}`, 'Component');

      const updateData: any = {};

      // Only update provided fields
      if (updates.hotelName) {
        updateData.hotelName = updates.hotelName;
      }
      if (updates.customDomain) {
        updateData.customDomain = updates.customDomain;
      }
      if (updates.subscriptionPlan) {
        updateData.subscriptionPlan = updates.subscriptionPlan;
        // Update feature flags and limits based on new plan
        const featureFlags = this.getDefaultFeatureFlags(
          updates.subscriptionPlan
        );
        const limits = this.getSubscriptionLimits(updates.subscriptionPlan);
        Object.assign(updateData, featureFlags, limits);
      }
      if (updates.subscriptionStatus) {
        updateData.subscriptionStatus = updates.subscriptionStatus;
      }
      if (updates.trialEndsAt) {
        updateData.trialEndsAt = updates.trialEndsAt;
      }

      await db.update(tenants).set(updateData).where(eq(tenants.id, tenantId));

      logger.debug(`✅ Tenant updated successfully: ${tenantId}`, 'Component');
    } catch (error) {
      logger.error('Failed to update tenant ${tenantId}:', 'Component', error);
      throw new TenantError(
        `Failed to update tenant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'TENANT_UPDATE_FAILED',
        500
      );
    }
  }

  /**
   * Delete tenant and all associated data
   */
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      logger.debug(`🗑️ Deleting tenant: ${tenantId}`, 'Component');

      // Delete in order due to foreign key constraints
      await db.delete(message).where(eq(message.tenant_id, tenantId));
      await db.delete(transcript).where(eq(transcript.tenant_id, tenantId));
      await db.delete(request).where(eq(request.tenant_id, tenantId));
      await db.delete(call).where(eq(call.tenant_id, tenantId));
      await db.delete(staff).where(eq(staff.tenant_id, tenantId));
      await db
        .delete(hotelProfiles)
        .where(eq(hotelProfiles.tenant_id, tenantId));
      await db.delete(tenants).where(eq(tenants.id, tenantId));

      logger.debug(`✅ Tenant deleted successfully: ${tenantId}`, 'Component');
    } catch (error) {
      logger.error('Failed to delete tenant ${tenantId}:', 'Component', error);
      throw new TenantError(
        `Failed to delete tenant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'TENANT_DELETE_FAILED',
        500
      );
    }
  }

  // ============================================
  // Feature Flag Management
  // ============================================

  /**
   * Check if tenant has access to a specific feature
   */
  async hasFeatureAccess(
    tenantId: string,
    feature: keyof FeatureFlags
  ): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const featureFlags = this.getCurrentFeatureFlags(tenant);
      return featureFlags[feature] || false;
    } catch (error) {
      logger.error(
        'Failed to check feature access for ${tenantId}:',
        'Component',
        error
      );
      return false;
    }
  }

  /**
   * Get current feature flags for tenant
   */
  getCurrentFeatureFlags(tenant: any): FeatureFlags {
    const plan = tenant.subscriptionPlan;
    const baseFlags = this.getDefaultFeatureFlags(plan);

    // Override with tenant-specific settings
    return {
      ...baseFlags,
      voiceCloning: tenant.voiceCloning || baseFlags.voiceCloning,
      multiLocation: tenant.multiLocation || baseFlags.multiLocation,
      whiteLabel: tenant.whiteLabel || baseFlags.whiteLabel,
    };
  }

  /**
   * Get default feature flags for subscription plan
   */
  private getDefaultFeatureFlags(plan: string): FeatureFlags {
    switch (plan) {
      case 'trial':
        return {
          voiceCloning: false,
          multiLocation: false,
          whiteLabel: false,
          advancedAnalytics: false,
          customIntegrations: false,
          prioritySupport: false,
          apiAccess: false,
          bulkOperations: false,
        };
      case 'basic':
        return {
          voiceCloning: false,
          multiLocation: false,
          whiteLabel: false,
          advancedAnalytics: true,
          customIntegrations: false,
          prioritySupport: false,
          apiAccess: true,
          bulkOperations: false,
        };
      case 'premium':
        return {
          voiceCloning: true,
          multiLocation: true,
          whiteLabel: false,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          apiAccess: true,
          bulkOperations: true,
        };
      case 'enterprise':
        return {
          voiceCloning: true,
          multiLocation: true,
          whiteLabel: true,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          apiAccess: true,
          bulkOperations: true,
        };
      default:
        return this.getDefaultFeatureFlags('trial');
    }
  }

  // ============================================
  // Subscription Plan Management
  // ============================================

  /**
   * Get subscription limits for plan
   */
  getSubscriptionLimits(plan: string): SubscriptionLimits {
    switch (plan) {
      case 'trial':
        return {
          maxVoices: 2,
          maxLanguages: 2,
          monthlyCallLimit: 100,
          dataRetentionDays: 30,
          maxStaffUsers: 2,
          maxHotelLocations: 1,
        };
      case 'basic':
        return {
          maxVoices: 5,
          maxLanguages: 4,
          monthlyCallLimit: 1000,
          dataRetentionDays: 90,
          maxStaffUsers: 5,
          maxHotelLocations: 1,
        };
      case 'premium':
        return {
          maxVoices: 15,
          maxLanguages: 8,
          monthlyCallLimit: 5000,
          dataRetentionDays: 365,
          maxStaffUsers: 15,
          maxHotelLocations: 5,
        };
      case 'enterprise':
        return {
          maxVoices: -1, // Unlimited
          maxLanguages: -1, // Unlimited
          monthlyCallLimit: -1, // Unlimited
          dataRetentionDays: -1, // Unlimited
          maxStaffUsers: -1, // Unlimited
          maxHotelLocations: -1, // Unlimited
        };
      default:
        return this.getSubscriptionLimits('trial');
    }
  }

  /**
   * Check if tenant is within subscription limits
   */
  async checkSubscriptionLimits(
    tenantId: string
  ): Promise<{ withinLimits: boolean; violations: string[] }> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const limits = this.getSubscriptionLimits(tenant.subscriptionPlan);
      const usage = await this.getTenantUsage(tenantId);

      const violations: string[] = [];

      // Check monthly call limit
      if (
        limits.monthlyCallLimit > 0 &&
        usage.callsThisMonth >= limits.monthlyCallLimit
      ) {
        violations.push('Monthly call limit exceeded');
      }

      // Check voice limit
      if (limits.maxVoices > 0 && usage.voicesUsed >= limits.maxVoices) {
        violations.push('Voice limit exceeded');
      }

      // Check language limit
      if (
        limits.maxLanguages > 0 &&
        usage.languagesUsed >= limits.maxLanguages
      ) {
        violations.push('Language limit exceeded');
      }

      return {
        withinLimits: violations.length === 0,
        violations,
      };
    } catch (error) {
      logger.error(
        'Failed to check subscription limits for ${tenantId}:',
        'Component',
        error
      );
      return { withinLimits: false, violations: ['Unable to check limits'] };
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get calls this month
      const [callsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(call)
        .where(
          and(
            eq(call.tenant_id, tenantId),
            sql`${call.created_at} >= ${startOfMonth}`
          )
        );

      // Get unique languages used
      const languagesResult = await db
        .selectDistinct({ language: call.language })
        .from(call)
        .where(eq(call.tenant_id, tenantId));

      // Get storage usage (approximate)
      const [storageResult] = await db
        .select({
          transcripts: sql<number>`count(*)`,
          avgLength: sql<number>`avg(length(${transcript.content}))`,
        })
        .from(transcript)
        .where(eq(transcript.tenant_id, tenantId));

      return {
        callsThisMonth: callsResult?.count || 0,
        voicesUsed: 1, // Note: Voice tracking to be implemented in future release
        languagesUsed: languagesResult.filter((l: any) => l.language).length,
        storageUsed: Math.round(
          ((storageResult?.transcripts || 0) *
            (storageResult?.avgLength || 0)) /
            1024
        ), // KB
        dataRetentionDays: 90, // Note: Dynamic tenant settings to be implemented
      };
    } catch (error) {
      logger.error(
        'Failed to get tenant usage for ${tenantId}:',
        'Component',
        error
      );
      return {
        callsThisMonth: 0,
        voicesUsed: 0,
        languagesUsed: 0,
        storageUsed: 0,
        dataRetentionDays: 90,
      };
    }
  }

  // ============================================
  // Data Isolation Utilities
  // ============================================

  /**
   * Get tenant-scoped query filter
   */
  getTenantFilter(tenantId: string) {
    return eq(sql`tenant_id`, tenantId);
  }

  /**
   * Clean up old data based on retention policy
   */
  async cleanupOldData(tenantId: string): Promise<void> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const retentionDays = tenant.dataRetentionDays || 90;

      if (retentionDays <= 0) {
        return;
      } // Unlimited retention

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      logger.debug(
        `🧹 Cleaning up data older than ${retentionDays} days for tenant ${tenantId}`,
        'Component'
      );

      // Delete old transcripts
      await db
        .delete(transcript)
        .where(
          and(
            eq(transcript.tenant_id, tenantId),
            sql`${transcript.timestamp} < ${cutoffDate}`
          )
        );

      // Delete old calls
      await db
        .delete(call)
        .where(
          and(
            eq(call.tenant_id, tenantId),
            sql`${call.created_at} < ${cutoffDate}`
          )
        );

      logger.debug(
        `✅ Data cleanup completed for tenant ${tenantId}`,
        'Component'
      );
    } catch (error) {
      logger.error(
        'Failed to cleanup data for tenant ${tenantId}:',
        'Component',
        error
      );
      throw new TenantError(
        `Failed to cleanup data: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'DATA_CLEANUP_FAILED',
        500
      );
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate subdomain availability
   */
  private async validateSubdomain(subdomain: string): Promise<void> {
    // Check format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      throw new TenantError(
        'Subdomain must contain only lowercase letters, numbers, and hyphens',
        'INVALID_SUBDOMAIN_FORMAT',
        400
      );
    }

    // Check availability
    const [existing] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain))
      .limit(1);

    if (existing) {
      throw new TenantError('Subdomain already exists', 'SUBDOMAIN_TAKEN', 409);
    }
  }

  /**
   * Get trial end date (30 days from now)
   */
  private getTrialEndDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Check if tenant subscription is active
   */
  isSubscriptionActive(tenant: any): boolean {
    if (tenant.subscriptionStatus !== 'active') {
      return false;
    }

    // Check trial expiration
    if (tenant.subscriptionPlan === 'trial' && tenant.trialEndsAt) {
      return new Date() < new Date(tenant.trialEndsAt);
    }

    return true;
  }

  /**
   * Get tenant service health status
   */
  async getServiceHealth(): Promise<{
    status: string;
    tenantsCount: number;
    activeSubscriptions: number;
  }> {
    try {
      const [tenantsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenants);

      const [activeResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenants)
        .where(eq(tenants.subscription_status, 'active'));

      return {
        status: 'healthy',
        tenantsCount: tenantsResult?.count || 0,
        activeSubscriptions: activeResult?.count || 0,
      };
    } catch (error) {
      logger.error('Failed to get service health:', 'Component', error);
      return {
        status: 'unhealthy',
        tenantsCount: 0,
        activeSubscriptions: 0,
      };
    }
  }
}

// ============================================
// Error Handling
// ============================================

export class TenantError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

// ============================================
// Export Service
// ============================================

export default TenantService;
