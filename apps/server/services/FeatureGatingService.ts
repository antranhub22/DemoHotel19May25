/**
 * SaaS Provider Domain - Feature Gating Service
 * Subscription-based feature access control and enforcement
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";

// ============================================
// TYPES & INTERFACES
// ============================================

export type SubscriptionPlan = "trial" | "basic" | "premium" | "enterprise";

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  requiredPlan: SubscriptionPlan;
  category: "core" | "analytics" | "integration" | "customization" | "support";
  usageTracking: boolean;
  limits?: {
    perMonth?: number;
    perDay?: number;
    concurrent?: number;
  };
  dependencies?: string[]; // Other features this depends on
}

export interface TenantFeatureAccess {
  tenantId: string;
  subscriptionPlan: SubscriptionPlan;
  features: {
    [featureId: string]: {
      enabled: boolean;
      usageCount: number;
      lastUsed: Date | null;
      limitExceeded: boolean;
    };
  };
  lastUpdated: Date;
}

// ============================================
// FEATURE CONFIGURATIONS
// ============================================

const FEATURE_DEFINITIONS: Record<string, FeatureConfig> = {
  // Core Features
  voice_calls: {
    id: "voice_calls",
    name: "Voice Calls",
    description: "Basic voice assistant functionality",
    requiredPlan: "trial",
    category: "core",
    usageTracking: true,
    limits: {
      perMonth: 100, // Will be overridden by subscription limits
    },
  },

  multi_language: {
    id: "multi_language",
    name: "Multi-language Support",
    description: "Support for multiple languages",
    requiredPlan: "trial",
    category: "core",
    usageTracking: false,
  },

  // Basic Features
  api_access: {
    id: "api_access",
    name: "API Access",
    description: "REST API access for integrations",
    requiredPlan: "basic",
    category: "integration",
    usageTracking: true,
    limits: {
      perMonth: 10000,
    },
  },

  data_export: {
    id: "data_export",
    name: "Data Export",
    description: "Export call logs and analytics data",
    requiredPlan: "basic",
    category: "analytics",
    usageTracking: true,
    limits: {
      perMonth: 10,
    },
  },

  basic_analytics: {
    id: "basic_analytics",
    name: "Basic Analytics",
    description: "Standard reporting and analytics",
    requiredPlan: "basic",
    category: "analytics",
    usageTracking: false,
  },

  // Premium Features
  voice_cloning: {
    id: "voice_cloning",
    name: "Voice Cloning",
    description: "Custom voice cloning for personalized experience",
    requiredPlan: "premium",
    category: "customization",
    usageTracking: true,
    limits: {
      perMonth: 5,
      concurrent: 2,
    },
  },

  advanced_analytics: {
    id: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Detailed analytics with custom reports",
    requiredPlan: "premium",
    category: "analytics",
    usageTracking: false,
  },

  multi_location: {
    id: "multi_location",
    name: "Multi-location Support",
    description: "Support for multiple hotel locations",
    requiredPlan: "premium",
    category: "core",
    usageTracking: false,
  },

  priority_support: {
    id: "priority_support",
    name: "Priority Support",
    description: "24/7 priority customer support",
    requiredPlan: "premium",
    category: "support",
    usageTracking: false,
  },

  // Enterprise Features
  white_label: {
    id: "white_label",
    name: "White Label Branding",
    description: "Custom branding and white-label solution",
    requiredPlan: "enterprise",
    category: "customization",
    usageTracking: false,
  },

  custom_integrations: {
    id: "custom_integrations",
    name: "Custom Integrations",
    description: "Custom API integrations and webhooks",
    requiredPlan: "enterprise",
    category: "integration",
    usageTracking: true,
    limits: {
      perMonth: 100,
    },
  },

  team_management: {
    id: "team_management",
    name: "Advanced Team Management",
    description: "Role-based access control and team management",
    requiredPlan: "enterprise",
    category: "core",
    usageTracking: false,
  },

  bulk_operations: {
    id: "bulk_operations",
    name: "Bulk Operations",
    description: "Bulk data import/export and batch operations",
    requiredPlan: "enterprise",
    category: "core",
    usageTracking: true,
    limits: {
      perMonth: 50,
    },
  },

  dedicated_support: {
    id: "dedicated_support",
    name: "Dedicated Support Manager",
    description: "Dedicated customer success manager",
    requiredPlan: "enterprise",
    category: "support",
    usageTracking: false,
  },

  sla_guarantee: {
    id: "sla_guarantee",
    name: "SLA Guarantee",
    description: "99.9% uptime SLA guarantee",
    requiredPlan: "enterprise",
    category: "support",
    usageTracking: false,
  },
};

// ============================================
// SUBSCRIPTION PLAN CONFIGURATIONS
// ============================================

const PLAN_LIMITS: Record<SubscriptionPlan, Record<string, number>> = {
  trial: {
    voice_calls: 100,
    api_access: 1000,
    data_export: 1,
    voice_cloning: 0,
    custom_integrations: 0,
    bulk_operations: 0,
  },
  basic: {
    voice_calls: 1000,
    api_access: 10000,
    data_export: 10,
    voice_cloning: 0,
    custom_integrations: 0,
    bulk_operations: 0,
  },
  premium: {
    voice_calls: 10000,
    api_access: 100000,
    data_export: 50,
    voice_cloning: 5,
    custom_integrations: 10,
    bulk_operations: 10,
  },
  enterprise: {
    voice_calls: 100000,
    api_access: 1000000,
    data_export: 200,
    voice_cloning: 20,
    custom_integrations: 100,
    bulk_operations: 50,
  },
};

// ============================================
// FEATURE GATING SERVICE
// ============================================

export class FeatureGatingService {
  private prisma: PrismaClient;
  private featureCache = new Map<
    string,
    { data: TenantFeatureAccess; expiry: number }
  >();
  private cacheTimeout = 300000; // 5 minutes

  constructor() {
    this.prisma = new PrismaClient();
    logger.info("[FeatureGatingService] Initialized with feature gating");
  }

  // ============================================
  // FEATURE ACCESS CHECKING
  // ============================================

  /**
   * Check if tenant has access to a specific feature
   */
  async checkFeatureAccess(
    tenantId: string,
    featureId: string,
    subscriptionPlan: SubscriptionPlan,
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      logger.debug("[FeatureGatingService] Checking feature access", {
        tenantId,
        featureId,
        subscriptionPlan,
      });

      const feature = FEATURE_DEFINITIONS[featureId];
      if (!feature) {
        logger.warn("[FeatureGatingService] Unknown feature requested", {
          featureId,
        });
        return false;
      }

      // Check subscription plan requirement
      if (!this.hasRequiredPlan(subscriptionPlan, feature.requiredPlan)) {
        logger.debug("[FeatureGatingService] Insufficient subscription plan", {
          required: feature.requiredPlan,
          current: subscriptionPlan,
        });
        return false;
      }

      // Check usage limits if feature has tracking enabled
      if (feature.usageTracking) {
        const hasUsageQuota = await this.checkUsageQuota(
          tenantId,
          featureId,
          subscriptionPlan,
        );
        if (!hasUsageQuota) {
          logger.debug("[FeatureGatingService] Usage quota exceeded", {
            tenantId,
            featureId,
          });
          return false;
        }
      }

      // Check feature dependencies
      if (feature.dependencies) {
        for (const dependencyId of feature.dependencies) {
          const hasDependency = await this.checkFeatureAccess(
            tenantId,
            dependencyId,
            subscriptionPlan,
            context,
          );
          if (!hasDependency) {
            logger.debug("[FeatureGatingService] Feature dependency not met", {
              featureId,
              dependency: dependencyId,
            });
            return false;
          }
        }
      }

      // Track feature access
      await this.trackFeatureAccess(tenantId, featureId);

      return true;
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error checking feature access",
        error,
      );
      return false; // Fail securely
    }
  }

  /**
   * Get all available features for a tenant
   */
  async getTenantFeatures(
    tenantId: string,
    subscriptionPlan: SubscriptionPlan,
  ): Promise<TenantFeatureAccess> {
    try {
      // Check cache first
      const cacheKey = `${tenantId}-${subscriptionPlan}`;
      const cached = this.featureCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }

      // Calculate feature access
      const features: TenantFeatureAccess["features"] = {};

      for (const [featureId, feature] of Object.entries(FEATURE_DEFINITIONS)) {
        const enabled = this.hasRequiredPlan(
          subscriptionPlan,
          feature.requiredPlan,
        );
        const usageCount = await this.getFeatureUsageCount(tenantId, featureId);
        const limitExceeded =
          feature.usageTracking && enabled
            ? await this.isUsageLimitExceeded(
                tenantId,
                featureId,
                subscriptionPlan,
              )
            : false;

        features[featureId] = {
          enabled: enabled && !limitExceeded,
          usageCount,
          lastUsed: await this.getLastFeatureUsage(tenantId, featureId),
          limitExceeded,
        };
      }

      const result: TenantFeatureAccess = {
        tenantId,
        subscriptionPlan,
        features,
        lastUpdated: new Date(),
      };

      // Update cache
      this.featureCache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.cacheTimeout,
      });

      return result;
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error getting tenant features",
        error,
      );
      throw error;
    }
  }

  /**
   * Update tenant features after subscription change
   */
  async updateTenantFeatures(
    tenantId: string,
    newPlan: SubscriptionPlan,
  ): Promise<void> {
    try {
      logger.info(
        "[FeatureGatingService] Updating tenant features for new plan",
        {
          tenantId,
          newPlan,
        },
      );

      // Clear cache to force recalculation
      const cacheKeys = Array.from(this.featureCache.keys()).filter((key) =>
        key.startsWith(`${tenantId}-`),
      );
      cacheKeys.forEach((key) => this.featureCache.delete(key));

      // Log plan change for analytics
      await this.trackFeatureAccess(tenantId, "subscription_change", {
        newPlan,
        timestamp: new Date(),
      });

      logger.info("[FeatureGatingService] Tenant features updated", {
        tenantId,
        newPlan,
      });
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error updating tenant features",
        error,
      );
      throw error;
    }
  }

  // ============================================
  // USAGE TRACKING & LIMITS
  // ============================================

  /**
   * Track feature usage
   */
  async trackFeatureAccess(
    tenantId: string,
    featureId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Create feature usage record
      await this.prisma.$executeRaw`
        INSERT INTO feature_usage (tenant_id, feature_id, metadata, timestamp)
        VALUES (${tenantId}, ${featureId}, ${JSON.stringify(metadata || {})}, ${new Date()})
      `;

      // Update cached usage count
      this.invalidateFeatureCache(tenantId);
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error tracking feature access",
        error,
      );
      // Don't throw error for tracking failures
    }
  }

  /**
   * Check if tenant has usage quota for feature
   */
  private async checkUsageQuota(
    tenantId: string,
    featureId: string,
    subscriptionPlan: SubscriptionPlan,
  ): Promise<boolean> {
    try {
      const feature = FEATURE_DEFINITIONS[featureId];
      if (!feature.usageTracking) {
        return true; // No limits for non-tracked features
      }

      const planLimit = PLAN_LIMITS[subscriptionPlan][featureId] || 0;
      if (planLimit === 0) {
        return false; // Feature not available in this plan
      }

      // Get current month usage
      const currentUsage = await this.getFeatureUsageCount(tenantId, featureId);

      return currentUsage < planLimit;
    } catch (error: any) {
      logger.error("[FeatureGatingService] Error checking usage quota", error);
      return false; // Fail securely
    }
  }

  /**
   * Check if usage limit is exceeded
   */
  private async isUsageLimitExceeded(
    tenantId: string,
    featureId: string,
    subscriptionPlan: SubscriptionPlan,
  ): Promise<boolean> {
    try {
      const planLimit = PLAN_LIMITS[subscriptionPlan][featureId] || 0;
      const currentUsage = await this.getFeatureUsageCount(tenantId, featureId);

      return currentUsage >= planLimit;
    } catch (error: any) {
      logger.error("[FeatureGatingService] Error checking usage limit", error);
      return true; // Fail securely
    }
  }

  /**
   * Get feature usage count for current month
   */
  private async getFeatureUsageCount(
    tenantId: string,
    featureId: string,
  ): Promise<number> {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const result = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as usage_count
        FROM feature_usage 
        WHERE tenant_id = ${tenantId} 
          AND feature_id = ${featureId}
          AND timestamp >= ${currentMonth}
      `;

      return parseInt(result[0]?.usage_count) || 0;
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error getting feature usage count",
        error,
      );
      return 0;
    }
  }

  /**
   * Get last feature usage timestamp
   */
  private async getLastFeatureUsage(
    tenantId: string,
    featureId: string,
  ): Promise<Date | null> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
        SELECT MAX(timestamp) as last_used
        FROM feature_usage 
        WHERE tenant_id = ${tenantId} 
          AND feature_id = ${featureId}
      `;

      return result[0]?.last_used || null;
    } catch (error: any) {
      logger.error(
        "[FeatureGatingService] Error getting last feature usage",
        error,
      );
      return null;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if subscription plan meets requirement
   */
  private hasRequiredPlan(
    currentPlan: SubscriptionPlan,
    requiredPlan: SubscriptionPlan,
  ): boolean {
    const planHierarchy: SubscriptionPlan[] = [
      "trial",
      "basic",
      "premium",
      "enterprise",
    ];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const requiredIndex = planHierarchy.indexOf(requiredPlan);

    return currentIndex >= requiredIndex;
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(featureId: string): FeatureConfig | null {
    return FEATURE_DEFINITIONS[featureId] || null;
  }

  /**
   * Get all available features
   */
  getAllFeatures(): FeatureConfig[] {
    return Object.values(FEATURE_DEFINITIONS);
  }

  /**
   * Get features by category
   */
  getFeaturesByCategory(category: FeatureConfig["category"]): FeatureConfig[] {
    return Object.values(FEATURE_DEFINITIONS).filter(
      (feature) => feature.category === category,
    );
  }

  /**
   * Get plan limits for specific plan
   */
  getPlanLimits(plan: SubscriptionPlan): Record<string, number> {
    return PLAN_LIMITS[plan] || {};
  }

  /**
   * Invalidate feature cache for tenant
   */
  private invalidateFeatureCache(tenantId: string): void {
    const cacheKeys = Array.from(this.featureCache.keys()).filter((key) =>
      key.startsWith(`${tenantId}-`),
    );
    cacheKeys.forEach((key) => this.featureCache.delete(key));
  }

  // ============================================
  // FEATURE ENFORCEMENT MIDDLEWARE
  // ============================================

  /**
   * Create Express middleware for feature enforcement
   */
  createFeatureMiddleware(featureId: string) {
    return async (req: any, res: any, next: any) => {
      try {
        const tenantId = req.user?.tenantId;
        const subscriptionPlan = req.user?.subscriptionPlan || "trial";

        if (!tenantId) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        const hasAccess = await this.checkFeatureAccess(
          tenantId,
          featureId,
          subscriptionPlan,
        );

        if (!hasAccess) {
          const feature = FEATURE_DEFINITIONS[featureId];
          return res.status(403).json({
            success: false,
            error: "Feature access denied",
            message: `This feature requires ${feature?.requiredPlan} plan or higher`,
            feature: {
              id: featureId,
              name: feature?.name,
              requiredPlan: feature?.requiredPlan,
              currentPlan: subscriptionPlan,
            },
          });
        }

        next();
      } catch (error: any) {
        logger.error("[FeatureGatingService] Feature middleware error", error);
        res.status(500).json({
          success: false,
          error: "Feature access check failed",
        });
      }
    };
  }

  // ============================================
  // CLEANUP
  // ============================================

  async shutdown(): Promise<void> {
    logger.info("[FeatureGatingService] Shutting down...");
    await this.prisma.$disconnect();
    logger.info("[FeatureGatingService] Shutdown complete");
  }
}
