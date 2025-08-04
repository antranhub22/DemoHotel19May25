/**
 * 🏨 PRISMA TENANT SERVICE
 *
 * Modern tenant management service using Prisma ORM
 * Replaces Drizzle-based TenantService with enhanced features:
 * - Type-safe operations
 * - Better performance with connection pooling
 * - Enhanced error handling
 * - Relationship management
 * - Metrics and monitoring
 */

import { PrismaClient } from "@prisma/client";
import { CreateTenantInput, UpdateTenantInput } from "../db/IDatabaseService";
import { PrismaConnectionManager } from "../db/PrismaConnectionManager";
import { logger } from "../utils/logger";

// ============================================
// Types & Interfaces for Tenant Management
// ============================================

export interface TenantConfig {
  hotelName: string;
  subdomain: string;
  customDomain?: string;
  subscriptionPlan: "trial" | "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "expired" | "cancelled";
  trialEndsAt?: Date;
  maxVoices?: number;
  maxLanguages?: number;
  voiceCloning?: boolean;
  multiLocation?: boolean;
  whiteLabel?: boolean;
  dataRetentionDays?: number;
  monthlyCallLimit?: number;
  email?: string;
  phone?: string;
  address?: string;
}

export interface TenantUsage {
  callsThisMonth: number;
  voicesUsed: number;
  languagesUsed: number;
  storageUsed: number;
  dataRetentionDays: number;
  requestsThisMonth: number;
  totalRequests: number;
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

export interface TenantEntity {
  id: string;
  hotel_name: string;
  subdomain: string | null;
  custom_domain: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  trial_ends_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  max_voices: number | null;
  max_languages: number | null;
  voice_cloning: boolean | null;
  multi_location: boolean | null;
  white_label: boolean | null;
  data_retention_days: number | null;
  monthly_call_limit: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  domain: string | null;
}

export interface TenantWithRelations extends TenantEntity {
  hotel_profiles: any[];
  requestCount?: number;
  callCount?: number;
}

// ============================================
// Performance Metrics Interface
// ============================================
interface TenantServiceMetrics {
  operationCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  slowestOperation: number;
  fastestOperation: number;
  errorCount: number;
  lastError?: string;
  lastErrorTime?: Date;
  cacheHitRate: number;
  cacheMisses: number;
  cacheHits: number;
}

// ============================================
// Prisma Tenant Service Implementation
// ============================================

export class PrismaTenantService {
  private prismaManager: PrismaConnectionManager;
  private prisma: PrismaClient;
  private metrics: TenantServiceMetrics;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private instanceId: string;

  // Configuration
  private readonly cacheTimeoutMs = 300000; // 5 minutes
  private readonly enableCaching = true;
  private readonly enableMetrics = true;

  constructor(prismaManager: PrismaConnectionManager) {
    this.prismaManager = prismaManager;
    this.prisma = prismaManager.getClient();
    this.instanceId = `prisma-tenant-service-${Date.now()}`;

    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
      cacheHitRate: 0,
      cacheMisses: 0,
      cacheHits: 0,
    };

    logger.info(
      `🏨 PrismaTenantService initialized - Instance: ${this.instanceId}, Caching: ${this.enableCaching}, Metrics: ${this.enableMetrics}`,
    );
  }

  // ============================================
  // PERFORMANCE & UTILITY METHODS
  // ============================================

  /**
   * Start performance timer for operations
   */
  private startPerformanceTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.updateMetrics(duration);

      if (this.enableMetrics) {
        if (duration > 2000) {
          logger.warn(
            `🐌 Slow tenant operation: ${operation} took ${duration}ms`,
          );
        } else {
          logger.debug(
            `⚡ Tenant operation: ${operation} completed in ${duration}ms`,
          );
        }
      }
    };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(duration: number): void {
    this.metrics.operationCount++;
    this.metrics.totalExecutionTime += duration;
    this.metrics.averageExecutionTime =
      this.metrics.totalExecutionTime / this.metrics.operationCount;

    if (duration > this.metrics.slowestOperation) {
      this.metrics.slowestOperation = duration;
    }

    if (duration < this.metrics.fastestOperation) {
      this.metrics.fastestOperation = duration;
    }
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.enableCaching) return null;

    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    this.metrics.cacheHits++;
    this.updateCacheHitRate();
    return cached.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any, ttlMs?: number): void {
    if (!this.enableCaching) return;

    const ttl = ttlMs || this.cacheTimeoutMs;
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.cacheHitRate =
      total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  /**
   * Clear tenant-related caches
   */
  private clearTenantCaches(tenantId?: string): void {
    if (tenantId) {
      // Clear specific tenant caches
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.includes(tenantId),
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      // Clear all tenant caches
      this.cache.clear();
    }
  }

  // ============================================
  // TENANT CRUD OPERATIONS
  // ============================================

  /**
   * Create a new tenant using IDatabaseService interface
   */
  async createTenant(tenantData: CreateTenantInput): Promise<TenantEntity> {
    const endTimer = this.startPerformanceTimer("createTenant_interface");

    try {
      logger.info(
        `🏨 [PrismaTenantService] Creating tenant via interface - Hotel: ${tenantData.hotel_name}, Subdomain: ${tenantData.subdomain}`,
      );

      // Convert interface input to internal config
      const config: TenantConfig = {
        hotelName: tenantData.hotel_name,
        subdomain: tenantData.subdomain || "",
        customDomain: tenantData.domain,
        subscriptionPlan: (tenantData.subscription_plan as any) || "trial",
        subscriptionStatus: "active",
        email: tenantData.email,
        phone: tenantData.phone,
        address: tenantData.address,
      };

      const tenantId = await this.createTenantWithConfig(config);
      const createdTenant = await this.getTenantById(tenantId);

      if (!createdTenant) {
        throw new TenantError(
          "Failed to retrieve created tenant",
          "TENANT_CREATION_FAILED",
          500,
        );
      }

      endTimer();
      return createdTenant;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to create tenant via interface",
        error,
      );
      endTimer();
      throw error;
    }
  }

  /**
   * Create a new tenant with detailed configuration (legacy method)
   */
  async createTenantWithConfig(config: TenantConfig): Promise<string> {
    const endTimer = this.startPerformanceTimer("createTenant");

    try {
      logger.info("🏨 [PrismaTenantService] Creating new tenant", {
        hotelName: config.hotelName,
        subdomain: config.subdomain,
      });

      // Validate subdomain availability
      await this.validateSubdomain(config.subdomain);

      // Set default feature flags and limits based on subscription plan
      const featureFlags = this.getDefaultFeatureFlags(config.subscriptionPlan);
      const subscriptionLimits = this.getSubscriptionLimits(
        config.subscriptionPlan,
      );

      // Generate tenant ID
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create tenant using Prisma transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create tenant
        const tenant = await tx.tenants.create({
          data: {
            id: tenantId,
            hotel_name: config.hotelName,
            subdomain: config.subdomain,
            custom_domain: config.customDomain,
            subscription_plan: config.subscriptionPlan,
            subscription_status: config.subscriptionStatus,
            trial_ends_at: config.trialEndsAt || this.getTrialEndDate(),
            max_voices: subscriptionLimits.maxVoices,
            max_languages: subscriptionLimits.maxLanguages,
            voice_cloning: featureFlags.voiceCloning,
            multi_location: featureFlags.multiLocation,
            white_label: featureFlags.whiteLabel,
            data_retention_days: subscriptionLimits.dataRetentionDays,
            monthly_call_limit: subscriptionLimits.monthlyCallLimit,
            email: config.email,
            phone: config.phone,
            address: config.address,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create default hotel profile
        await tx.hotel_profiles.create({
          data: {
            id: `profile_${tenantId}_${Date.now()}`,
            tenant_id: tenantId,
            research_data: null,
            assistant_config: null,
            vapi_assistant_id: null,
            services_config: null,
            knowledge_base: null,
            system_prompt: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        return tenant;
      });

      // Clear caches
      this.clearTenantCaches();

      logger.success("✅ [PrismaTenantService] Tenant created successfully", {
        tenantId: result.id,
        hotelName: result.hotel_name,
      });

      endTimer();
      return result.id;
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Unknown error";
      this.metrics.lastErrorTime = new Date();

      logger.error("❌ [PrismaTenantService] Failed to create tenant", error);
      endTimer();
      throw new TenantError(
        `Failed to create tenant: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TENANT_CREATION_FAILED",
        500,
      );
    }
  }

  /**
   * Get tenant by ID with optional relations
   */
  async getTenantById(
    tenantId: string,
    includeRelations = false,
  ): Promise<TenantEntity | TenantWithRelations | null> {
    const endTimer = this.startPerformanceTimer("getTenantById");

    try {
      const cacheKey = `tenant_${tenantId}_${includeRelations}`;
      const cached = this.getFromCache<TenantEntity | TenantWithRelations>(
        cacheKey,
      );

      if (cached) {
        endTimer();
        return cached;
      }

      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        include: includeRelations
          ? {
              hotel_profiles: true,
              _count: {
                select: {
                  hotel_profiles: true,
                },
              },
            }
          : undefined,
      });

      if (!tenant) {
        endTimer();
        return null;
      }

      // Map Prisma result to our interface
      const mappedTenant: TenantEntity | TenantWithRelations = {
        id: tenant.id,
        hotel_name: tenant.hotel_name,
        subdomain: tenant.subdomain,
        custom_domain: tenant.custom_domain,
        subscription_plan: tenant.subscription_plan,
        subscription_status: tenant.subscription_status,
        trial_ends_at: tenant.trial_ends_at,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
        max_voices: tenant.max_voices,
        max_languages: tenant.max_languages,
        voice_cloning: tenant.voice_cloning,
        multi_location: tenant.multi_location,
        white_label: tenant.white_label,
        data_retention_days: tenant.data_retention_days,
        monthly_call_limit: tenant.monthly_call_limit,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        domain: tenant.domain,
        ...(includeRelations && {
          hotel_profiles: (tenant as any).hotel_profiles || [],
          requestCount: 0, // TODO: Add proper count when request relations are added
          callCount: 0, // TODO: Add proper count when call relations are added
        }),
      };

      this.setCache(cacheKey, mappedTenant);

      endTimer();
      return mappedTenant;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to get tenant by ID",
        error,
      );
      endTimer();
      throw new TenantError(
        `Failed to get tenant: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TENANT_FETCH_FAILED",
        500,
      );
    }
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    const endTimer = this.startPerformanceTimer("getTenantBySubdomain");

    try {
      const cacheKey = `tenant_subdomain_${subdomain}`;
      const cached = this.getFromCache<TenantEntity>(cacheKey);

      if (cached) {
        endTimer();
        return cached;
      }

      const tenant = await this.prisma.tenants.findFirst({
        where: { subdomain },
      });

      if (!tenant) {
        endTimer();
        return null;
      }

      const mappedTenant: TenantEntity = {
        id: tenant.id,
        hotel_name: tenant.hotel_name,
        subdomain: tenant.subdomain,
        custom_domain: tenant.custom_domain,
        subscription_plan: tenant.subscription_plan,
        subscription_status: tenant.subscription_status,
        trial_ends_at: tenant.trial_ends_at,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
        max_voices: tenant.max_voices,
        max_languages: tenant.max_languages,
        voice_cloning: tenant.voice_cloning,
        multi_location: tenant.multi_location,
        white_label: tenant.white_label,
        data_retention_days: tenant.data_retention_days,
        monthly_call_limit: tenant.monthly_call_limit,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        domain: tenant.domain,
      };

      this.setCache(cacheKey, mappedTenant);

      endTimer();
      return mappedTenant;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to get tenant by subdomain",
        error,
      );
      endTimer();
      throw new TenantError(
        `Failed to get tenant: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TENANT_FETCH_FAILED",
        500,
      );
    }
  }

  /**
   * Get all tenants (IDatabaseService interface)
   */
  async getAllTenants(): Promise<TenantEntity[]> {
    const endTimer = this.startPerformanceTimer("getAllTenants_interface");

    try {
      const result = await this.getAllTenantsWithPagination();
      endTimer();
      return result.tenants;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to get all tenants via interface",
        error,
      );
      endTimer();
      throw error;
    }
  }

  /**
   * Get all tenants with pagination (enhanced method)
   */
  async getAllTenantsWithPagination(
    limit = 50,
    offset = 0,
    filters?: {
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      search?: string;
    },
  ): Promise<{ tenants: TenantEntity[]; total: number }> {
    const endTimer = this.startPerformanceTimer("getAllTenants");

    try {
      const cacheKey = `all_tenants_${limit}_${offset}_${JSON.stringify(filters)}`;
      const cached = this.getFromCache<{
        tenants: TenantEntity[];
        total: number;
      }>(cacheKey);

      if (cached) {
        endTimer();
        return cached;
      }

      const where: any = {};

      // Apply filters
      if (filters?.subscriptionPlan) {
        where.subscription_plan = filters.subscriptionPlan;
      }
      if (filters?.subscriptionStatus) {
        where.subscription_status = filters.subscriptionStatus;
      }
      if (filters?.search) {
        where.OR = [
          { hotel_name: { contains: filters.search, mode: "insensitive" } },
          { subdomain: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [tenants, total] = await Promise.all([
        this.prisma.tenants.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        this.prisma.tenants.count({ where }),
      ]);

      const mappedTenants: TenantEntity[] = tenants.map((tenant) => ({
        id: tenant.id,
        hotel_name: tenant.hotel_name,
        subdomain: tenant.subdomain,
        custom_domain: tenant.custom_domain,
        subscription_plan: tenant.subscription_plan,
        subscription_status: tenant.subscription_status,
        trial_ends_at: tenant.trial_ends_at,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
        max_voices: tenant.max_voices,
        max_languages: tenant.max_languages,
        voice_cloning: tenant.voice_cloning,
        multi_location: tenant.multi_location,
        white_label: tenant.white_label,
        data_retention_days: tenant.data_retention_days,
        monthly_call_limit: tenant.monthly_call_limit,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        domain: tenant.domain,
      }));

      const result = { tenants: mappedTenants, total };
      this.setCache(cacheKey, result);

      logger.info("✅ [PrismaTenantService] Retrieved tenants successfully", {
        count: tenants.length,
        total,
        filters,
      });

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error("❌ [PrismaTenantService] Failed to get all tenants", error);
      endTimer();
      throw new TenantError(
        `Failed to get tenants: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TENANT_FETCH_FAILED",
        500,
      );
    }
  }

  /**
   * Update tenant (IDatabaseService interface)
   */
  async updateTenant(
    id: string,
    data: UpdateTenantInput,
  ): Promise<TenantEntity> {
    const endTimer = this.startPerformanceTimer("updateTenant_interface");

    try {
      // Convert interface input to internal config
      const updates: Partial<TenantConfig> = {
        hotelName: data.hotel_name,
        subdomain: data.subdomain,
        customDomain: data.domain,
        subscriptionPlan: data.subscription_plan as any,
        subscriptionStatus: data.subscription_status as any,
        trialEndsAt: data.trial_ends_at,
        maxVoices: data.max_voices,
        maxLanguages: data.max_languages,
        voiceCloning: data.voice_cloning,
        multiLocation: data.multi_location,
        whiteLabel: data.white_label,
        dataRetentionDays: data.data_retention_days,
        monthlyCallLimit: data.monthly_call_limit,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };

      const result = await this.updateTenantWithConfig(id, updates);
      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to update tenant via interface",
        error,
      );
      endTimer();
      throw error;
    }
  }

  /**
   * Update tenant configuration (enhanced method)
   */
  async updateTenantWithConfig(
    tenantId: string,
    updates: Partial<TenantConfig>,
  ): Promise<TenantEntity> {
    const endTimer = this.startPerformanceTimer("updateTenant");

    try {
      logger.info("🔄 [PrismaTenantService] Updating tenant", {
        tenantId,
        updates: Object.keys(updates),
      });

      const updateData: any = { updated_at: new Date() };

      // Map config updates to database fields
      if (updates.hotelName) updateData.hotel_name = updates.hotelName;
      if (updates.subdomain) {
        await this.validateSubdomain(updates.subdomain, tenantId);
        updateData.subdomain = updates.subdomain;
      }
      if (updates.customDomain) updateData.custom_domain = updates.customDomain;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.address) updateData.address = updates.address;
      if (updates.subscriptionStatus)
        updateData.subscription_status = updates.subscriptionStatus;
      if (updates.trialEndsAt) updateData.trial_ends_at = updates.trialEndsAt;

      // Handle subscription plan changes
      if (updates.subscriptionPlan) {
        updateData.subscription_plan = updates.subscriptionPlan;

        // Update feature flags and limits based on new plan
        const featureFlags = this.getDefaultFeatureFlags(
          updates.subscriptionPlan,
        );
        const limits = this.getSubscriptionLimits(updates.subscriptionPlan);

        updateData.voice_cloning = featureFlags.voiceCloning;
        updateData.multi_location = featureFlags.multiLocation;
        updateData.white_label = featureFlags.whiteLabel;
        updateData.max_voices = limits.maxVoices;
        updateData.max_languages = limits.maxLanguages;
        updateData.monthly_call_limit = limits.monthlyCallLimit;
        updateData.data_retention_days = limits.dataRetentionDays;
      }

      const updatedTenant = await this.prisma.tenants.update({
        where: { id: tenantId },
        data: updateData,
      });

      // Clear caches
      this.clearTenantCaches(tenantId);

      const mappedTenant: TenantEntity = {
        id: updatedTenant.id,
        hotel_name: updatedTenant.hotel_name,
        subdomain: updatedTenant.subdomain,
        custom_domain: updatedTenant.custom_domain,
        subscription_plan: updatedTenant.subscription_plan,
        subscription_status: updatedTenant.subscription_status,
        trial_ends_at: updatedTenant.trial_ends_at,
        created_at: updatedTenant.created_at,
        updated_at: updatedTenant.updated_at,
        max_voices: updatedTenant.max_voices,
        max_languages: updatedTenant.max_languages,
        voice_cloning: updatedTenant.voice_cloning,
        multi_location: updatedTenant.multi_location,
        white_label: updatedTenant.white_label,
        data_retention_days: updatedTenant.data_retention_days,
        monthly_call_limit: updatedTenant.monthly_call_limit,
        email: updatedTenant.email,
        phone: updatedTenant.phone,
        address: updatedTenant.address,
        domain: updatedTenant.domain,
      };

      logger.success("✅ [PrismaTenantService] Tenant updated successfully", {
        tenantId,
      });

      endTimer();
      return mappedTenant;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error("❌ [PrismaTenantService] Failed to update tenant", error);
      endTimer();
      throw new TenantError(
        `Failed to update tenant: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TENANT_UPDATE_FAILED",
        500,
      );
    }
  }

  /**
   * Delete tenant and all associated data
   */
  async deleteTenant(tenantId: string): Promise<boolean> {
    const endTimer = this.startPerformanceTimer("deleteTenant");

    try {
      logger.info("🗑️ [PrismaTenantService] Deleting tenant", { tenantId });

      // Use transaction to ensure data consistency
      await this.prisma.$transaction(async (tx) => {
        // Delete related data first (due to foreign key constraints)

        // Delete transcripts
        await tx.transcript.deleteMany({
          where: { tenant_id: tenantId },
        });

        // Delete hotel profiles
        await tx.hotel_profiles.deleteMany({
          where: { tenant_id: tenantId },
        });

        // Note: When request and call models have proper tenant_id fields,
        // we'll add their deletion here as well

        // Finally delete the tenant
        await tx.tenants.delete({
          where: { id: tenantId },
        });
      });

      // Clear caches
      this.clearTenantCaches(tenantId);

      logger.success("✅ [PrismaTenantService] Tenant deleted successfully", {
        tenantId,
      });

      endTimer();
      return true;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error("❌ [PrismaTenantService] Failed to delete tenant", error);
      endTimer();
      return false;
    }
  }

  // ============================================
  // FEATURE FLAG MANAGEMENT
  // ============================================

  /**
   * Check if tenant has access to a specific feature
   */
  async hasFeatureAccess(
    tenantId: string,
    feature: keyof FeatureFlags,
  ): Promise<boolean> {
    const endTimer = this.startPerformanceTimer("hasFeatureAccess");

    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        endTimer();
        return false;
      }

      const featureFlags = this.getCurrentFeatureFlags(tenant);
      endTimer();
      return featureFlags[feature] || false;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to check feature access",
        error,
      );
      endTimer();
      return false;
    }
  }

  /**
   * Get current feature flags for tenant
   */
  getCurrentFeatureFlags(tenant: TenantEntity): FeatureFlags {
    const plan = tenant.subscription_plan || "trial";
    const baseFlags = this.getDefaultFeatureFlags(plan as any);

    // Override with tenant-specific settings
    return {
      ...baseFlags,
      voiceCloning: tenant.voice_cloning || baseFlags.voiceCloning,
      multiLocation: tenant.multi_location || baseFlags.multiLocation,
      whiteLabel: tenant.white_label || baseFlags.whiteLabel,
    };
  }

  /**
   * Get default feature flags for subscription plan
   */
  private getDefaultFeatureFlags(plan: string): FeatureFlags {
    switch (plan) {
      case "trial":
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
      case "basic":
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
      case "premium":
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
      case "enterprise":
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
        return this.getDefaultFeatureFlags("trial");
    }
  }

  // ============================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ============================================

  /**
   * Get subscription limits for plan
   */
  getSubscriptionLimits(plan: string): SubscriptionLimits {
    switch (plan) {
      case "trial":
        return {
          maxVoices: 2,
          maxLanguages: 2,
          monthlyCallLimit: 100,
          dataRetentionDays: 30,
          maxStaffUsers: 2,
          maxHotelLocations: 1,
        };
      case "basic":
        return {
          maxVoices: 5,
          maxLanguages: 4,
          monthlyCallLimit: 1000,
          dataRetentionDays: 90,
          maxStaffUsers: 5,
          maxHotelLocations: 1,
        };
      case "premium":
        return {
          maxVoices: 15,
          maxLanguages: 8,
          monthlyCallLimit: 5000,
          dataRetentionDays: 365,
          maxStaffUsers: 15,
          maxHotelLocations: 5,
        };
      case "enterprise":
        return {
          maxVoices: -1, // Unlimited
          maxLanguages: -1, // Unlimited
          monthlyCallLimit: -1, // Unlimited
          dataRetentionDays: -1, // Unlimited
          maxStaffUsers: -1, // Unlimited
          maxHotelLocations: -1, // Unlimited
        };
      default:
        return this.getSubscriptionLimits("trial");
    }
  }

  /**
   * Check if tenant is within subscription limits
   */
  async checkSubscriptionLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    violations: string[];
  }> {
    const endTimer = this.startPerformanceTimer("checkSubscriptionLimits");

    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        endTimer();
        return { withinLimits: false, violations: ["Tenant not found"] };
      }

      const limits = this.getSubscriptionLimits(
        tenant.subscription_plan || "trial",
      );
      const usage = await this.getTenantUsage(tenantId);

      const violations: string[] = [];

      // Check monthly call limit
      if (
        limits.monthlyCallLimit > 0 &&
        usage.callsThisMonth >= limits.monthlyCallLimit
      ) {
        violations.push("Monthly call limit exceeded");
      }

      // Check voice limit
      if (limits.maxVoices > 0 && usage.voicesUsed >= limits.maxVoices) {
        violations.push("Voice limit exceeded");
      }

      // Check language limit
      if (
        limits.maxLanguages > 0 &&
        usage.languagesUsed >= limits.maxLanguages
      ) {
        violations.push("Language limit exceeded");
      }

      endTimer();
      return {
        withinLimits: violations.length === 0,
        violations,
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to check subscription limits",
        error,
      );
      endTimer();
      return { withinLimits: false, violations: ["Unable to check limits"] };
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    const endTimer = this.startPerformanceTimer("getTenantUsage");

    try {
      const cacheKey = `tenant_usage_${tenantId}`;
      const cached = this.getFromCache<TenantUsage>(cacheKey);

      if (cached) {
        endTimer();
        return cached;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get transcript count this month (as proxy for calls)
      const transcriptsThisMonth = await this.prisma.transcript.count({
        where: {
          tenant_id: tenantId,
          timestamp: {
            gte: startOfMonth,
          },
        },
      });

      // Get total transcript count
      const totalTranscripts = await this.prisma.transcript.count({
        where: { tenant_id: tenantId },
      });

      // Calculate storage usage (approximate)
      const storageAggregate = await this.prisma.transcript.aggregate({
        where: { tenant_id: tenantId },
        _avg: {
          id: true, // This is a placeholder - in real implementation, we'd calculate text length
        },
        _count: {
          id: true,
        },
      });

      const usage: TenantUsage = {
        callsThisMonth: transcriptsThisMonth,
        voicesUsed: 1, // TODO: Implement proper voice tracking
        languagesUsed: 1, // TODO: Implement language tracking from transcripts
        storageUsed: Math.round(
          ((storageAggregate._count.id || 0) * 500) / 1024,
        ), // Approximate KB
        dataRetentionDays: 90, // TODO: Get from tenant settings
        requestsThisMonth: 0, // TODO: Implement when request model has tenant relations
        totalRequests: 0, // TODO: Implement when request model has tenant relations
      };

      // Cache for 5 minutes (usage data changes frequently)
      this.setCache(cacheKey, usage, 300000);

      endTimer();
      return usage;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to get tenant usage",
        error,
      );
      endTimer();
      return {
        callsThisMonth: 0,
        voicesUsed: 0,
        languagesUsed: 0,
        storageUsed: 0,
        dataRetentionDays: 90,
        requestsThisMonth: 0,
        totalRequests: 0,
      };
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Validate subdomain availability
   */
  private async validateSubdomain(
    subdomain: string,
    excludeTenantId?: string,
  ): Promise<void> {
    // Check format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      throw new TenantError(
        "Subdomain must contain only lowercase letters, numbers, and hyphens",
        "INVALID_SUBDOMAIN_FORMAT",
        400,
      );
    }

    // Check availability
    const where: any = { subdomain };
    if (excludeTenantId) {
      where.NOT = { id: excludeTenantId };
    }

    const existing = await this.prisma.tenants.findFirst({ where });

    if (existing) {
      throw new TenantError("Subdomain already exists", "SUBDOMAIN_TAKEN", 409);
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
  isSubscriptionActive(tenant: TenantEntity): boolean {
    if (tenant.subscription_status !== "active") {
      return false;
    }

    // Check trial expiration
    if (tenant.subscription_plan === "trial" && tenant.trial_ends_at) {
      return new Date() < new Date(tenant.trial_ends_at);
    }

    return true;
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<{
    status: string;
    tenantsCount: number;
    activeSubscriptions: number;
    metrics: TenantServiceMetrics;
  }> {
    const endTimer = this.startPerformanceTimer("getServiceHealth");

    try {
      const [tenantsCount, activeSubscriptions] = await Promise.all([
        this.prisma.tenants.count(),
        this.prisma.tenants.count({
          where: { subscription_status: "active" },
        }),
      ]);

      endTimer();
      return {
        status: "healthy",
        tenantsCount,
        activeSubscriptions,
        metrics: { ...this.metrics },
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaTenantService] Failed to get service health",
        error,
      );
      endTimer();
      return {
        status: "unhealthy",
        tenantsCount: 0,
        activeSubscriptions: 0,
        metrics: { ...this.metrics },
      };
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): TenantServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
      cacheHitRate: 0,
      cacheMisses: 0,
      cacheHits: 0,
    };
    this.cache.clear();
  }

  /**
   * Data cleanup based on retention policy
   */
  async cleanupOldData(tenantId: string): Promise<void> {
    const endTimer = this.startPerformanceTimer("cleanupOldData");

    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        throw new TenantError("Tenant not found", "TENANT_NOT_FOUND", 404);
      }

      const retentionDays = tenant.data_retention_days || 90;

      if (retentionDays <= 0) {
        endTimer();
        return; // Unlimited retention
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      logger.info(
        `🧹 [PrismaTenantService] Cleaning up data older than ${retentionDays} days`,
        {
          tenantId,
          cutoffDate,
        },
      );

      // Delete old transcripts
      const deletedTranscripts = await this.prisma.transcript.deleteMany({
        where: {
          tenant_id: tenantId,
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      // TODO: Add cleanup for other tenant-related data when models are enhanced

      logger.success("✅ [PrismaTenantService] Data cleanup completed", {
        tenantId,
        deletedTranscripts: deletedTranscripts.count,
      });

      endTimer();
    } catch (error) {
      this.metrics.errorCount++;
      logger.error("❌ [PrismaTenantService] Failed to cleanup data", error);
      endTimer();
      throw new TenantError(
        `Failed to cleanup data: ${error instanceof Error ? error.message : "Unknown error"}`,
        "DATA_CLEANUP_FAILED",
        500,
      );
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
    public statusCode: number,
  ) {
    super(message);
    this.name = "TenantError";
  }
}

// ============================================
// Export Service
// ============================================

export default PrismaTenantService;
