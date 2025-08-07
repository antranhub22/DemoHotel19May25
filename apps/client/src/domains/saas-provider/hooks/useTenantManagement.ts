/**
 * SaaS Provider Domain - Tenant Management Hook
 * React hook for tenant operations, subscription management, and feature gating
 */

import { AppDispatch } from "@/store";
import logger from '@shared/utils/logger';
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TenantManagementService } from "../services/tenantManagementService";
import {
  clearCurrentTenant,
  removeUsageAlert,
  selectCurrentTenant,
  selectPlatformMetrics,
  selectTenantError,
  selectTenantFeatures,
  selectTenantLimits,
  selectTenantLoading,
  selectTenantUsage,
  selectUsageAlerts,
} from "../store/tenantSlice";
import { BillingCycle, SubscriptionPlan } from "../types/saasProvider.types";

export const useTenantManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const currentTenant = useSelector(selectCurrentTenant);
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);
  const usageAlerts = useSelector(selectUsageAlerts);
  const platformMetrics = useSelector(selectPlatformMetrics);
  const tenantFeatures = useSelector(selectTenantFeatures);
  const tenantLimits = useSelector(selectTenantLimits);
  const tenantUsage = useSelector(selectTenantUsage);

  // Service instance
  const tenantService = useMemo(() => {
    return new TenantManagementService(dispatch, () => store.getState());
  }, [dispatch]);

  // ============================================
  // TENANT INITIALIZATION
  // ============================================

  const initializeTenant = useCallback(async () => {
    try {
      await tenantService.initializeTenantContext();
      logger.debug("[useTenantManagement] Tenant initialized successfully");
    } catch (error: any) {
      logger.error("[useTenantManagement] Failed to initialize tenant", error);
      throw error;
    }
  }, [tenantService]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!currentTenant) {
      initializeTenant();
    }
  }, [currentTenant, initializeTenant]);

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  const updateSubscription = useCallback(
    async (
      newPlan: SubscriptionPlan,
      billingCycle: BillingCycle = "monthly",
    ) => {
      if (!currentTenant) {
        throw new Error("No tenant context available");
      }

      try {
        await tenantService.updateTenantSubscription(
          currentTenant.id,
          newPlan,
          billingCycle,
        );
        logger.debug(
          `[useTenantManagement] Subscription updated to ${newPlan}`,
        );
      } catch (error: any) {
        logger.error(
          "[useTenantManagement] Failed to update subscription",
          error,
        );
        throw error;
      }
    },
    [currentTenant, tenantService],
  );

  const cancelSubscription = useCallback(
    async (reason?: string) => {
      if (!currentTenant) {
        throw new Error("No tenant context available");
      }

      try {
        await tenantService.cancelSubscription(currentTenant.id, reason);
        logger.debug("[useTenantManagement] Subscription cancelled");
      } catch (error: any) {
        logger.error(
          "[useTenantManagement] Failed to cancel subscription",
          error,
        );
        throw error;
      }
    },
    [currentTenant, tenantService],
  );

  const reactivateSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      if (!currentTenant) {
        throw new Error("No tenant context available");
      }

      try {
        await tenantService.reactivateSubscription(currentTenant.id, plan);
        logger.debug("[useTenantManagement] Subscription reactivated");
      } catch (error: any) {
        logger.error(
          "[useTenantManagement] Failed to reactivate subscription",
          error,
        );
        throw error;
      }
    },
    [currentTenant, tenantService],
  );

  // ============================================
  // FEATURE GATING
  // ============================================

  const canAccessFeature = useCallback(
    (feature: string): boolean => {
      return tenantService.canAccessFeature(feature);
    },
    [tenantService],
  );

  const getFeatureAvailability = useCallback(
    (feature: string) => {
      return tenantService.getFeatureAvailability(feature);
    },
    [tenantService],
  );

  const trackFeatureUsage = useCallback(
    (feature: string, metadata?: Record<string, any>) => {
      tenantService.trackFeatureUsage(feature, metadata);
    },
    [tenantService],
  );

  // ============================================
  // USAGE & ANALYTICS
  // ============================================

  const fetchPlatformAnalytics = useCallback(async () => {
    try {
      await tenantService.fetchPlatformAnalytics();
      logger.debug("[useTenantManagement] Platform analytics fetched");
    } catch (error: any) {
      logger.error(
        "[useTenantManagement] Failed to fetch platform analytics",
        error,
      );
      throw error;
    }
  }, [tenantService]);

  const dismissAlert = useCallback(
    (alertId: string) => {
      dispatch(removeUsageAlert(alertId));
    },
    [dispatch],
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const subscriptionInfo = useMemo(() => {
    if (!currentTenant) return null;

    return {
      plan: currentTenant.subscriptionPlan,
      status: currentTenant.subscriptionStatus,
      trialEndsAt: currentTenant.trialEndsAt,
      subscriptionEndsAt: currentTenant.subscriptionEndsAt,
      billingCycle: currentTenant.billingCycle,
      isTrialExpiring:
        currentTenant.subscriptionPlan === "trial" &&
        currentTenant.trialEndsAt &&
        currentTenant.trialEndsAt.getTime() - Date.now() <
          7 * 24 * 60 * 60 * 1000, // 7 days
      daysRemaining: currentTenant.trialEndsAt
        ? Math.ceil(
            (currentTenant.trialEndsAt.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
    };
  }, [currentTenant]);

  const usageStats = useMemo(() => {
    if (!currentTenant || !tenantUsage || !tenantLimits) return null;

    return {
      calls: {
        current: tenantUsage.currentMonthCalls,
        limit: tenantLimits.maxCalls,
        percentage: Math.round(
          (tenantUsage.currentMonthCalls / tenantLimits.maxCalls) * 100,
        ),
        remaining: tenantLimits.maxCalls - tenantUsage.currentMonthCalls,
      },
      minutes: {
        current: tenantUsage.currentMonthMinutes,
        limit: tenantLimits.maxMonthlyMinutes,
        percentage: Math.round(
          (tenantUsage.currentMonthMinutes / tenantLimits.maxMonthlyMinutes) *
            100,
        ),
        remaining:
          tenantLimits.maxMonthlyMinutes - tenantUsage.currentMonthMinutes,
      },
      apiCalls: {
        current: tenantUsage.currentMonthApiCalls,
        limit: tenantLimits.maxApiCalls,
        percentage: Math.round(
          (tenantUsage.currentMonthApiCalls / tenantLimits.maxApiCalls) * 100,
        ),
        remaining: tenantLimits.maxApiCalls - tenantUsage.currentMonthApiCalls,
      },
      storage: {
        current: tenantUsage.storageUsed,
        // Storage limits calculated based on subscription plan
        limit: tenantLimits.dataRetentionDays * 100, // MB per day estimate
        percentage: Math.round(
          (tenantUsage.storageUsed / (tenantLimits.dataRetentionDays * 100)) *
            100,
        ),
      },
    };
  }, [currentTenant, tenantUsage, tenantLimits]);

  const healthScore = useMemo(() => {
    if (!currentTenant) return 0;
    return tenantService.calculateHealthScore(currentTenant);
  }, [currentTenant, tenantService]);

  const availableFeatures = useMemo(() => {
    if (!tenantFeatures) return [];

    return Object.entries(tenantFeatures)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature);
  }, [tenantFeatures]);

  const planUpgradeRecommendation = useMemo(() => {
    if (!currentTenant || !usageStats) return null;

    const { plan } = currentTenant;
    const { calls, minutes } = usageStats;

    // Recommend upgrade if approaching limits
    if (
      (calls.percentage > 80 || minutes.percentage > 80) &&
      plan !== "enterprise"
    ) {
      const nextPlan =
        plan === "trial"
          ? "basic"
          : plan === "basic"
            ? "premium"
            : "enterprise";

      return {
        currentPlan: plan,
        recommendedPlan: nextPlan,
        reason: calls.percentage > 80 ? "call_limit" : "minute_limit",
        urgency:
          calls.percentage > 95 || minutes.percentage > 95 ? "high" : "medium",
      };
    }

    return null;
  }, [currentTenant, usageStats]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getTenantDisplayName = useCallback(() => {
    return tenantService.getTenantDisplayName();
  }, [tenantService]);

  const getSubscriptionStatusColor = useCallback(
    (status?: string) => {
      return tenantService.getSubscriptionStatusColor(
        (status as any) || currentTenant?.subscriptionStatus || "inactive",
      );
    },
    [tenantService, currentTenant],
  );

  const logout = useCallback(() => {
    dispatch(clearCurrentTenant());
    localStorage.removeItem("authToken");
    // Additional logout logic here
  }, [dispatch]);

  return {
    // State
    currentTenant,
    isLoading,
    error,
    usageAlerts,
    platformMetrics,
    tenantFeatures,
    tenantLimits,
    tenantUsage,

    // Computed values
    subscriptionInfo,
    usageStats,
    healthScore,
    availableFeatures,
    planUpgradeRecommendation,

    // Actions
    initializeTenant,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    canAccessFeature,
    getFeatureAvailability,
    trackFeatureUsage,
    fetchPlatformAnalytics,
    dismissAlert,
    logout,

    // Utilities
    getTenantDisplayName,
    getSubscriptionStatusColor,
  };
};

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for feature gating - simplified interface
 */
export const useFeatureGating = () => {
  const { canAccessFeature, getFeatureAvailability, trackFeatureUsage } =
    useTenantManagement();

  return {
    canAccess: canAccessFeature,
    getAvailability: getFeatureAvailability,
    trackUsage: trackFeatureUsage,
  };
};

/**
 * Hook for subscription management
 */
export const useSubscriptionManagement = () => {
  const {
    subscriptionInfo,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    planUpgradeRecommendation,
  } = useTenantManagement();

  return {
    subscription: subscriptionInfo,
    updatePlan: updateSubscription,
    cancel: cancelSubscription,
    reactivate: reactivateSubscription,
    upgradeRecommendation: planUpgradeRecommendation,
  };
};

/**
 * Hook for usage monitoring
 */
export const useUsageMonitoring = () => {
  const { usageStats, usageAlerts, healthScore, dismissAlert } =
    useTenantManagement();

  return {
    stats: usageStats,
    alerts: usageAlerts,
    healthScore,
    dismissAlert,
  };
};

/**
 * Hook for platform analytics (SaaS admin only)
 */
export const usePlatformAnalytics = () => {
  const { platformMetrics, fetchPlatformAnalytics } = useTenantManagement();

  return {
    metrics: platformMetrics,
    fetchMetrics: fetchPlatformAnalytics,
  };
};
