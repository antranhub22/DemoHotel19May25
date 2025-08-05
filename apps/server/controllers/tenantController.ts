/**
 * SaaS Provider Domain - Tenant Controller
 * Handles HTTP requests for tenant management, subscription, and usage operations
 */

import { Request, Response } from "express";
import { TenantService } from "../services/tenantService";
import PrismaTenantService from "../../../packages/shared/services/PrismaTenantService";
import { PrismaConnectionManager } from "../../../packages/shared/db/PrismaConnectionManager";
import { StripeService } from "../services/StripeService";
import { UsageTrackingService } from "../services/UsageTrackingService";
import { FeatureGatingService } from "../services/FeatureGatingService";
import { logger } from "@shared/utils/logger";
import { z } from "zod";

// ============================================
// REQUEST VALIDATION SCHEMAS
// ============================================

const UpdateSubscriptionSchema = z.object({
  subscriptionPlan: z.enum(["trial", "basic", "premium", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly"),
});

const CancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
  feedback: z.string().optional(),
});

const TrackUsageSchema = z.object({
  eventType: z.enum([
    "call_started",
    "call_ended",
    "api_request",
    "feature_used",
  ]),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

const CheckFeatureSchema = z.object({
  feature: z.string(),
  context: z.record(z.any()).optional(),
});

const ProcessPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  paymentMethodId: z.string(),
  description: z.string().optional(),
});

// ============================================
// TENANT CONTROLLER CLASS
// ============================================

export class TenantController {
  private tenantService: TenantService;
  private prismaTenantService: PrismaTenantService;
  private stripeService: StripeService;
  private usageTrackingService: UsageTrackingService;
  private featureGatingService: FeatureGatingService;

  constructor() {
    this.tenantService = new TenantService();

    // Initialize Prisma services
    const prismaManager = new PrismaConnectionManager();
    this.prismaTenantService = new PrismaTenantService(prismaManager);

    // Initialize SaaS services
    this.stripeService = new StripeService();
    this.usageTrackingService = new UsageTrackingService();
    this.featureGatingService = new FeatureGatingService();

    logger.info("[TenantController] Initialized with all required services");
  }

  // ============================================
  // TENANT INFORMATION & CONTEXT
  // ============================================

  /**
   * Get current tenant information
   */
  async getCurrentTenant(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: "No tenant context found",
          message: "User is not associated with any tenant",
        });
        return;
      }

      logger.debug("[TenantController] Getting current tenant", {
        userId,
        tenantId,
      });

      // Get tenant data with relationships
      const tenant =
        await this.prismaTenantService.getTenantWithRelations(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        });
        return;
      }

      // Get current usage statistics
      const usage = await this.usageTrackingService.getCurrentUsage(tenantId);

      // Get feature access information
      const features = await this.featureGatingService.getTenantFeatures(
        tenantId,
        tenant.subscription_plan || "trial",
      );

      // Calculate subscription health metrics
      const healthMetrics = await this.calculateTenantHealth(tenant, usage);

      const response = {
        success: true,
        tenant: {
          id: tenant.id,
          hotelName: tenant.hotel_name,
          subdomain: tenant.subdomain,
          customDomain: tenant.custom_domain,
          subscriptionPlan: tenant.subscription_plan,
          subscriptionStatus: tenant.subscription_status,
          trialEndsAt: tenant.trial_ends_at,
          createdAt: tenant.created_at,
          features: features,
          limits: this.getSubscriptionLimits(
            tenant.subscription_plan || "trial",
          ),
          usage: usage,
          health: healthMetrics,
        },
      };

      res.json(response);
      logger.debug("[TenantController] Current tenant retrieved successfully", {
        tenantId,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting current tenant", error);
      res.status(500).json({
        success: false,
        error: "Failed to get tenant information",
        message: error.message,
      });
    }
  }

  /**
   * Get detailed tenant profile (admin only)
   */
  async getTenantProfile(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;

      // Verify admin access
      if (!this.hasAdminAccess(req.user)) {
        res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message: "Admin access required",
        });
        return;
      }

      const tenant =
        await this.prismaTenantService.getTenantWithFullMetrics(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      res.json({
        success: true,
        tenant: tenant,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting tenant profile", error);
      res.status(500).json({
        success: false,
        error: "Failed to get tenant profile",
        message: error.message,
      });
    }
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Update tenant subscription plan
   */
  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = UpdateSubscriptionSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { subscriptionPlan, billingCycle } = validation.data;

      logger.debug("[TenantController] Updating subscription", {
        tenantId,
        newPlan: subscriptionPlan,
        billingCycle,
        userId: req.user?.id,
      });

      // Get current tenant
      const currentTenant =
        await this.prismaTenantService.getTenantById(tenantId);
      if (!currentTenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      // Check if this is an upgrade or downgrade
      const isUpgrade = this.isPlanUpgrade(
        currentTenant.subscription_plan || "trial",
        subscriptionPlan,
      );

      // Handle Stripe subscription update
      let stripeSubscription = null;
      if (subscriptionPlan !== "trial") {
        stripeSubscription = await this.stripeService.updateSubscription(
          tenantId,
          subscriptionPlan,
          billingCycle,
          isUpgrade,
        );
      }

      // Update tenant subscription in database
      const updatedTenant = await this.prismaTenantService.updateTenant(
        tenantId,
        {
          subscription_plan: subscriptionPlan,
          subscription_status:
            subscriptionPlan === "trial" ? "active" : "active",
          updated_at: new Date(),
        },
      );

      // Update feature access
      await this.featureGatingService.updateTenantFeatures(
        tenantId,
        subscriptionPlan,
      );

      // Log subscription change for analytics
      await this.usageTrackingService.trackEvent(
        tenantId,
        "subscription_changed",
        {
          oldPlan: currentTenant.subscription_plan,
          newPlan: subscriptionPlan,
          billingCycle,
          isUpgrade,
          stripeSubscriptionId: stripeSubscription?.id,
        },
      );

      res.json({
        success: true,
        message: `Subscription updated to ${subscriptionPlan}`,
        tenant: updatedTenant,
        stripeSubscription: stripeSubscription,
      });

      logger.info("[TenantController] Subscription updated successfully", {
        tenantId,
        oldPlan: currentTenant.subscription_plan,
        newPlan: subscriptionPlan,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error updating subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to update subscription",
        message: error.message,
      });
    }
  }

  /**
   * Cancel tenant subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = CancelSubscriptionSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { reason, feedback } = validation.data;

      logger.debug("[TenantController] Cancelling subscription", {
        tenantId,
        reason,
        userId: req.user?.id,
      });

      // Get current tenant
      const tenant = await this.prismaTenantService.getTenantById(tenantId);
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      // Cancel Stripe subscription if exists
      if (tenant.subscription_plan !== "trial") {
        await this.stripeService.cancelSubscription(tenantId, reason);
      }

      // Update tenant status
      const updatedTenant = await this.prismaTenantService.updateTenant(
        tenantId,
        {
          subscription_status: "cancelled",
          updated_at: new Date(),
        },
      );

      // Log cancellation for analytics
      await this.usageTrackingService.trackEvent(
        tenantId,
        "subscription_cancelled",
        {
          plan: tenant.subscription_plan,
          reason,
          feedback,
          cancelledAt: new Date(),
        },
      );

      res.json({
        success: true,
        message: "Subscription cancelled successfully",
        tenant: updatedTenant,
      });

      logger.info("[TenantController] Subscription cancelled", {
        tenantId,
        reason,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error cancelling subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel subscription",
        message: error.message,
      });
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const { subscriptionPlan } = req.body;

      logger.debug("[TenantController] Reactivating subscription", {
        tenantId,
        plan: subscriptionPlan,
        userId: req.user?.id,
      });

      // Get current tenant
      const tenant = await this.prismaTenantService.getTenantById(tenantId);
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      // Create new Stripe subscription
      let stripeSubscription = null;
      if (subscriptionPlan !== "trial") {
        stripeSubscription = await this.stripeService.createSubscription(
          tenantId,
          subscriptionPlan,
          "monthly", // Default to monthly
        );
      }

      // Update tenant status
      const updatedTenant = await this.prismaTenantService.updateTenant(
        tenantId,
        {
          subscription_plan: subscriptionPlan,
          subscription_status: "active",
          updated_at: new Date(),
        },
      );

      // Update feature access
      await this.featureGatingService.updateTenantFeatures(
        tenantId,
        subscriptionPlan,
      );

      // Log reactivation for analytics
      await this.usageTrackingService.trackEvent(
        tenantId,
        "subscription_reactivated",
        {
          plan: subscriptionPlan,
          reactivatedAt: new Date(),
          stripeSubscriptionId: stripeSubscription?.id,
        },
      );

      res.json({
        success: true,
        message: "Subscription reactivated successfully",
        tenant: updatedTenant,
        stripeSubscription: stripeSubscription,
      });

      logger.info("[TenantController] Subscription reactivated", {
        tenantId,
        subscriptionPlan,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error reactivating subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to reactivate subscription",
        message: error.message,
      });
    }
  }

  // ============================================
  // USAGE TRACKING & ANALYTICS
  // ============================================

  /**
   * Get real-time usage statistics
   */
  async getCurrentUsage(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;

      logger.debug("[TenantController] Getting current usage", { tenantId });

      const usage = await this.usageTrackingService.getCurrentUsage(tenantId);
      const limits = await this.getSubscriptionLimits(
        req.user?.subscription_plan || "trial",
      );

      // Calculate usage percentages and alerts
      const usageWithPercentages = {
        ...usage,
        percentages: {
          calls: Math.round((usage.currentMonthCalls / limits.maxCalls) * 100),
          minutes: Math.round(
            (usage.currentMonthMinutes / limits.maxMonthlyMinutes) * 100,
          ),
          apiCalls: Math.round(
            (usage.currentMonthApiCalls / limits.maxApiCalls) * 100,
          ),
          storage: Math.round(
            (usage.storageUsed / (limits.dataRetentionDays * 100)) * 100,
          ),
        },
        remaining: {
          calls: Math.max(0, limits.maxCalls - usage.currentMonthCalls),
          minutes: Math.max(
            0,
            limits.maxMonthlyMinutes - usage.currentMonthMinutes,
          ),
          apiCalls: Math.max(
            0,
            limits.maxApiCalls - usage.currentMonthApiCalls,
          ),
        },
        alerts: await this.generateUsageAlerts(tenantId, usage, limits),
      };

      res.json({
        success: true,
        usage: usageWithPercentages,
        limits: limits,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting current usage", error);
      res.status(500).json({
        success: false,
        error: "Failed to get usage statistics",
        message: error.message,
      });
    }
  }

  /**
   * Track usage event
   */
  async trackUsageEvent(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = TrackUsageSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { eventType, metadata, timestamp } = validation.data;

      // Track the usage event
      await this.usageTrackingService.trackEvent(
        tenantId,
        eventType,
        metadata,
        timestamp ? new Date(timestamp) : new Date(),
      );

      res.json({
        success: true,
        message: "Usage event tracked successfully",
      });
    } catch (error: any) {
      logger.error("[TenantController] Error tracking usage event", error);
      res.status(500).json({
        success: false,
        error: "Failed to track usage event",
        message: error.message,
      });
    }
  }

  /**
   * Get usage history with pagination
   */
  async getUsageHistory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const period = (req.query.period as string) || "current_month";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await this.usageTrackingService.getUsageHistory(
        tenantId,
        period,
        page,
        limit,
      );

      res.json({
        success: true,
        history: history,
        pagination: {
          page,
          limit,
          total: history.length,
        },
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting usage history", error);
      res.status(500).json({
        success: false,
        error: "Failed to get usage history",
        message: error.message,
      });
    }
  }

  // ============================================
  // FEATURE ACCESS & LIMITS
  // ============================================

  /**
   * Get feature access information
   */
  async getFeatureAccess(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;

      const tenant = await this.prismaTenantService.getTenantById(tenantId);
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      const features = await this.featureGatingService.getTenantFeatures(
        tenantId,
        tenant.subscription_plan || "trial",
      );

      res.json({
        success: true,
        features: features,
        subscriptionPlan: tenant.subscription_plan,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting feature access", error);
      res.status(500).json({
        success: false,
        error: "Failed to get feature access",
        message: error.message,
      });
    }
  }

  /**
   * Check access to specific feature
   */
  async checkFeatureAccess(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = CheckFeatureSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { feature, context } = validation.data;

      const tenant = await this.prismaTenantService.getTenantById(tenantId);
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      const hasAccess = await this.featureGatingService.checkFeatureAccess(
        tenantId,
        feature,
        tenant.subscription_plan || "trial",
        context,
      );

      // Track feature access attempt
      await this.usageTrackingService.trackEvent(tenantId, "feature_checked", {
        feature,
        hasAccess,
        subscriptionPlan: tenant.subscription_plan,
        context,
      });

      res.json({
        success: true,
        feature: feature,
        hasAccess: hasAccess,
        subscriptionPlan: tenant.subscription_plan,
        requiredPlan: this.getRequiredPlanForFeature(feature),
      });
    } catch (error: any) {
      logger.error("[TenantController] Error checking feature access", error);
      res.status(500).json({
        success: false,
        error: "Failed to check feature access",
        message: error.message,
      });
    }
  }

  // ============================================
  // BILLING & PAYMENTS
  // ============================================

  /**
   * Get billing invoices
   */
  async getBillingInvoices(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const invoices = await this.stripeService.getInvoices(
        tenantId,
        page,
        limit,
      );

      res.json({
        success: true,
        invoices: invoices,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error: any) {
      logger.error("[TenantController] Error getting billing invoices", error);
      res.status(500).json({
        success: false,
        error: "Failed to get billing invoices",
        message: error.message,
      });
    }
  }

  /**
   * Process payment
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = ProcessPaymentSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { amount, currency, paymentMethodId, description } =
        validation.data;

      const paymentResult = await this.stripeService.processPayment(
        tenantId,
        amount,
        currency,
        paymentMethodId,
        description,
      );

      // Log payment for analytics
      await this.usageTrackingService.trackEvent(
        tenantId,
        "payment_processed",
        {
          amount,
          currency,
          paymentIntentId: paymentResult.id,
          status: paymentResult.status,
        },
      );

      res.json({
        success: true,
        payment: paymentResult,
      });
    } catch (error: any) {
      logger.error("[TenantController] Error processing payment", error);
      res.status(500).json({
        success: false,
        error: "Failed to process payment",
        message: error.message,
      });
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private hasAdminAccess(user: any): boolean {
    return user?.role === "admin" || user?.role === "hotel-manager";
  }

  private isPlanUpgrade(currentPlan: string, newPlan: string): boolean {
    const planHierarchy = ["trial", "basic", "premium", "enterprise"];
    return planHierarchy.indexOf(newPlan) > planHierarchy.indexOf(currentPlan);
  }

  private getSubscriptionLimits(plan: string) {
    const limits = {
      trial: {
        maxCalls: 100,
        maxMonthlyMinutes: 500,
        maxApiCalls: 1000,
        maxStaffMembers: 2,
        dataRetentionDays: 30,
      },
      basic: {
        maxCalls: 1000,
        maxMonthlyMinutes: 5000,
        maxApiCalls: 10000,
        maxStaffMembers: 5,
        dataRetentionDays: 90,
      },
      premium: {
        maxCalls: 10000,
        maxMonthlyMinutes: 50000,
        maxApiCalls: 100000,
        maxStaffMembers: 20,
        dataRetentionDays: 180,
      },
      enterprise: {
        maxCalls: 100000,
        maxMonthlyMinutes: 500000,
        maxApiCalls: 1000000,
        maxStaffMembers: 100,
        dataRetentionDays: 365,
      },
    };

    return limits[plan as keyof typeof limits] || limits.trial;
  }

  private getRequiredPlanForFeature(feature: string): string {
    const featureRequirements: Record<string, string> = {
      voice_cloning: "premium",
      white_label: "enterprise",
      multi_location: "premium",
      advanced_analytics: "premium",
      api_access: "basic",
      custom_integrations: "enterprise",
      priority_support: "premium",
      data_export: "basic",
    };

    return featureRequirements[feature] || "basic";
  }

  private async calculateTenantHealth(tenant: any, usage: any) {
    let score = 100;

    // Deduct for high usage
    const limits = this.getSubscriptionLimits(
      tenant.subscription_plan || "trial",
    );
    const callUsageRatio = usage.currentMonthCalls / limits.maxCalls;
    if (callUsageRatio > 0.8) score -= 20;
    if (callUsageRatio > 0.95) score -= 10;

    // Deduct for trial status
    if (tenant.subscription_plan === "trial") score -= 10;

    // Deduct for overdue payments
    if (tenant.subscription_status === "expired") score -= 30;

    // Deduct for approaching trial end
    if (tenant.subscription_plan === "trial" && tenant.trial_ends_at) {
      const daysRemaining = Math.ceil(
        (new Date(tenant.trial_ends_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysRemaining <= 7) score -= 15;
    }

    return {
      score: Math.max(0, score),
      status:
        score >= 80
          ? "excellent"
          : score >= 60
            ? "good"
            : score >= 40
              ? "fair"
              : "needs_attention",
    };
  }

  private async generateUsageAlerts(tenantId: string, usage: any, limits: any) {
    const alerts = [];

    // Call limit alerts
    const callUsageRatio = usage.currentMonthCalls / limits.maxCalls;
    if (callUsageRatio >= 0.8) {
      alerts.push({
        type: "approaching_limit",
        metric: "calls",
        severity: callUsageRatio >= 0.95 ? "critical" : "warning",
        message: `You've used ${Math.round(callUsageRatio * 100)}% of your monthly call limit`,
        currentValue: usage.currentMonthCalls,
        limitValue: limits.maxCalls,
      });
    }

    // Minutes limit alerts
    const minutesUsageRatio =
      usage.currentMonthMinutes / limits.maxMonthlyMinutes;
    if (minutesUsageRatio >= 0.8) {
      alerts.push({
        type: "approaching_limit",
        metric: "minutes",
        severity: minutesUsageRatio >= 0.95 ? "critical" : "warning",
        message: `You've used ${Math.round(minutesUsageRatio * 100)}% of your monthly minutes`,
        currentValue: usage.currentMonthMinutes,
        limitValue: limits.maxMonthlyMinutes,
      });
    }

    return alerts;
  }
}
