/**
 * SaaS Provider Domain - Tenant Management Service
 * Business logic for tenant operations, subscription management, and platform analytics
 */

import { AppDispatch, RootState } from "@/store";
import logger from '@shared/utils/logger';
import {
  addUsageAlert,
  checkFeatureAccess,
  fetchCurrentTenant,
  fetchPlatformMetrics,
  setCurrentTenant,
  setError,
  setLoading,
  updateRealTimeUsage,
  updateSubscriptionPlan,
} from "../store/tenantSlice";
import {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionStatus,
  TenantData,
  UsageAlert,
} from "../types/saasProvider.types";

export class TenantManagementService {
  private dispatch: AppDispatch;
  private getState: () => RootState;

  constructor(dispatch: AppDispatch, getState: () => RootState) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  // ============================================
  // TENANT DETECTION & INITIALIZATION
  // ============================================

  /**
   * Initialize tenant context based on subdomain/domain detection
   */
  async initializeTenantContext(): Promise<void> {
    logger.debug("[TenantManagementService] Initializing tenant context");

    try {
      this.dispatch(setLoading(true));

      // Detect tenant from URL
      const tenantInfo = this.detectTenantFromUrl();
      if (!tenantInfo) {
        throw new Error("Unable to detect tenant from URL");
      }

      // Fetch tenant data from API
      const result = await this.dispatch(fetchCurrentTenant());

      if (fetchCurrentTenant.fulfilled.match(result)) {
        logger.debug(
          "[TenantManagementService] Tenant context initialized successfully",
        );

        // Initialize real-time usage tracking
        this.startUsageTracking(result.payload.id);

        // Check for usage alerts
        this.checkUsageLimits(result.payload);
      } else {
        throw new Error("Failed to fetch tenant data");
      }
    } catch (error: any) {
      logger.error(
        "[TenantManagementService] Failed to initialize tenant context",
        error,
      );
      this.dispatch(setError(error.message));
    }
  }

  /**
   * Detect tenant from current URL (subdomain or custom domain)
   */
  private detectTenantFromUrl(): {
    subdomain?: string;
    customDomain?: string;
  } | null {
    const hostname = window.location.hostname;

    // Check for custom domain
    if (
      !hostname.includes("localhost") &&
      !hostname.includes("render.com") &&
      !hostname.includes("netlify.app")
    ) {
      return { customDomain: hostname };
    }

    // Extract subdomain
    const parts = hostname.split(".");
    if (parts.length >= 3) {
      const subdomain = parts[0];
      if (subdomain !== "www" && subdomain !== "app") {
        return { subdomain };
      }
    }

    // Development fallback
    if (hostname.includes("localhost")) {
      return { subdomain: "minhonmuine" }; // Default development tenant
    }

    return null;
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Update tenant subscription plan
   */
  async updateTenantSubscription(
    tenantId: string,
    newPlan: SubscriptionPlan,
    billingCycle: BillingCycle = "monthly",
  ): Promise<void> {
    logger.debug(
      `[TenantManagementService] Updating subscription for tenant ${tenantId} to ${newPlan}`,
    );

    try {
      const result = await this.dispatch(
        updateSubscriptionPlan({ tenantId, newPlan }),
      );

      if (updateSubscriptionPlan.fulfilled.match(result)) {
        logger.debug(
          "[TenantManagementService] Subscription updated successfully",
        );

        // Trigger feature access updates
        this.updateFeatureAccess(result.payload);

        // Emit subscription change event
        this.emitSubscriptionChangeEvent(tenantId, newPlan);
      } else {
        throw new Error("Failed to update subscription");
      }
    } catch (error: any) {
      logger.error(
        "[TenantManagementService] Failed to update subscription",
        error,
      );
      this.dispatch(setError(error.message));
      throw error;
    }
  }

  /**
   * Cancel tenant subscription
   */
  async cancelSubscription(tenantId: string, reason?: string): Promise<void> {
    logger.debug(
      `[TenantManagementService] Cancelling subscription for tenant ${tenantId}`,
    );

    try {
      const response = await fetch(
        `/api/tenant/${tenantId}/subscription/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const data = await response.json();
      this.dispatch(setCurrentTenant(data.tenant));

      logger.debug(
        "[TenantManagementService] Subscription cancelled successfully",
      );
    } catch (error: any) {
      logger.error(
        "[TenantManagementService] Failed to cancel subscription",
        error,
      );
      this.dispatch(setError(error.message));
      throw error;
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(
    tenantId: string,
    plan: SubscriptionPlan,
  ): Promise<void> {
    logger.debug(
      `[TenantManagementService] Reactivating subscription for tenant ${tenantId}`,
    );

    try {
      const response = await fetch(
        `/api/tenant/${tenantId}/subscription/reactivate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionPlan: plan }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      const data = await response.json();
      this.dispatch(setCurrentTenant(data.tenant));

      logger.debug(
        "[TenantManagementService] Subscription reactivated successfully",
      );
    } catch (error: any) {
      logger.error(
        "[TenantManagementService] Failed to reactivate subscription",
        error,
      );
      this.dispatch(setError(error.message));
      throw error;
    }
  }

  // ============================================
  // FEATURE GATING & ACCESS CONTROL
  // ============================================

  /**
   * Check if tenant can access a specific feature
   */
  canAccessFeature(feature: string): boolean {
    const state = this.getState();
    const tenant = state.tenant.currentTenant;

    if (!tenant) {
      logger.warn(
        "[TenantManagementService] No tenant context for feature access check",
      );
      return false;
    }

    this.dispatch(
      checkFeatureAccess({ feature, tenantPlan: tenant.subscriptionPlan }),
    );

    const featureAccess = state.tenant.featureGating[feature];
    return featureAccess?.enabled || false;
  }

  /**
   * Get feature availability based on subscription plan
   */
  getFeatureAvailability(feature: string): {
    available: boolean;
    requiredPlan: SubscriptionPlan | null;
  } {
    const featureRequirements: Record<string, SubscriptionPlan> = {
      voice_cloning: "premium",
      white_label: "enterprise",
      multi_location: "premium",
      advanced_analytics: "premium",
      api_access: "basic",
      custom_integrations: "enterprise",
      priority_support: "premium",
      data_export: "basic",
    };

    const requiredPlan = featureRequirements[feature] || null;
    const available = this.canAccessFeature(feature);

    return { available, requiredPlan };
  }

  /**
   * Update feature access after subscription changes
   */
  private updateFeatureAccess(tenant: TenantData): void {
    const features = Object.keys(tenant.features);

    features.forEach((feature) => {
      this.dispatch(
        checkFeatureAccess({ feature, tenantPlan: tenant.subscriptionPlan }),
      );
    });
  }

  // ============================================
  // USAGE TRACKING & LIMITS
  // ============================================

  /**
   * Start real-time usage tracking for tenant
   */
  private startUsageTracking(tenantId: string): void {
    // Start polling usage data every 30 seconds
    setInterval(() => {
      this.updateCurrentUsage(tenantId);
    }, 30000);
  }

  /**
   * Update current usage statistics
   */
  async updateCurrentUsage(tenantId: string): Promise<void> {
    try {
      const response = await fetch(`/api/tenant/${tenantId}/usage/current`);
      if (!response.ok) return;

      const usage = await response.json();
      this.dispatch(updateRealTimeUsage({ tenantId, usage }));

      // Check for limit violations
      this.checkUsageLimits(this.getState().tenant.currentTenant!);
    } catch (error) {
      logger.warn(
        "[TenantManagementService] Failed to update current usage",
        error,
      );
    }
  }

  /**
   * Check usage limits and generate alerts
   */
  private checkUsageLimits(tenant: TenantData): void {
    const { usage, limits } = tenant;
    const alerts: UsageAlert[] = [];

    // Check call limits (80% threshold)
    if (usage.currentMonthCalls / limits.maxCalls >= 0.8) {
      alerts.push({
        id: `call-limit-${tenant.id}-${Date.now()}`,
        tenantId: tenant.id,
        type: "approaching_limit",
        metric: "calls",
        currentValue: usage.currentMonthCalls,
        limitValue: limits.maxCalls,
        threshold: 80,
        message: `You've used ${Math.round((usage.currentMonthCalls / limits.maxCalls) * 100)}% of your monthly call limit`,
        severity:
          usage.currentMonthCalls / limits.maxCalls >= 0.95
            ? "critical"
            : "warning",
        createdAt: new Date(),
      });
    }

    // Check minutes limits
    if (usage.currentMonthMinutes / limits.maxMonthlyMinutes >= 0.8) {
      alerts.push({
        id: `minutes-limit-${tenant.id}-${Date.now()}`,
        tenantId: tenant.id,
        type: "approaching_limit",
        metric: "minutes",
        currentValue: usage.currentMonthMinutes,
        limitValue: limits.maxMonthlyMinutes,
        threshold: 80,
        message: `You've used ${Math.round((usage.currentMonthMinutes / limits.maxMonthlyMinutes) * 100)}% of your monthly minutes`,
        severity:
          usage.currentMonthMinutes / limits.maxMonthlyMinutes >= 0.95
            ? "critical"
            : "warning",
        createdAt: new Date(),
      });
    }

    // Check trial expiration
    if (tenant.subscriptionPlan === "trial" && tenant.trialEndsAt) {
      const daysRemaining = Math.ceil(
        (tenant.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (daysRemaining <= 7) {
        alerts.push({
          id: `trial-ending-${tenant.id}-${Date.now()}`,
          tenantId: tenant.id,
          type: "trial_ending",
          metric: "trial_days",
          currentValue: daysRemaining,
          limitValue: 30,
          threshold: 80,
          message: `Your trial expires in ${daysRemaining} days. Upgrade to continue service.`,
          severity: daysRemaining <= 3 ? "critical" : "warning",
          createdAt: new Date(),
        });
      }
    }

    // Dispatch alerts
    alerts.forEach((alert) => {
      this.dispatch(addUsageAlert(alert));
    });
  }

  /**
   * Track feature usage for analytics
   */
  trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    const tenant = this.getState().tenant.currentTenant;
    if (!tenant) return;

    // Send to analytics API
    fetch("/api/analytics/feature-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant.id,
        feature,
        timestamp: new Date(),
        metadata,
      }),
    }).catch((error) => {
      logger.warn(
        "[TenantManagementService] Failed to track feature usage",
        error,
      );
    });
  }

  // ============================================
  // PLATFORM ANALYTICS
  // ============================================

  /**
   * Fetch platform-wide metrics (for SaaS admins)
   */
  async fetchPlatformAnalytics(): Promise<void> {
    try {
      await this.dispatch(fetchPlatformMetrics());
      logger.debug(
        "[TenantManagementService] Platform metrics fetched successfully",
      );
    } catch (error: any) {
      logger.error(
        "[TenantManagementService] Failed to fetch platform metrics",
        error,
      );
      this.dispatch(setError(error.message));
    }
  }

  // ============================================
  // EVENT HANDLING
  // ============================================

  /**
   * Emit subscription change event for other systems
   */
  private emitSubscriptionChangeEvent(
    tenantId: string,
    newPlan: SubscriptionPlan,
  ): void {
    const event = new CustomEvent("tenant:subscription_changed", {
      detail: { tenantId, newPlan, timestamp: new Date() },
    });
    window.dispatchEvent(event);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get tenant display name
   */
  getTenantDisplayName(): string {
    const tenant = this.getState().tenant.currentTenant;
    return tenant?.hotelName || "Unknown Hotel";
  }

  /**
   * Get subscription status color for UI
   */
  getSubscriptionStatusColor(status: SubscriptionStatus): string {
    const colors = {
      active: "green",
      trial: "blue",
      expired: "red",
      cancelled: "gray",
      inactive: "orange",
    };
    return colors[status] || "gray";
  }

  /**
   * Calculate subscription health score
   */
  calculateHealthScore(tenant: TenantData): number {
    let score = 100;

    // Deduct for high usage
    const callUsageRatio =
      tenant.usage.currentMonthCalls / tenant.limits.maxCalls;
    if (callUsageRatio > 0.8) score -= 20;

    // Deduct for trial status
    if (tenant.subscriptionPlan === "trial") score -= 10;

    // Deduct for overdue payments
    if (tenant.subscriptionStatus === "expired") score -= 30;

    // Deduct for approaching trial end
    if (tenant.subscriptionPlan === "trial" && tenant.trialEndsAt) {
      const daysRemaining = Math.ceil(
        (tenant.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (daysRemaining <= 7) score -= 15;
    }

    return Math.max(0, score);
  }
}
