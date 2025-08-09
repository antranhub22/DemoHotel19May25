/**
 * SaaS Provider Domain - Tenant Management API Routes
 * RESTful endpoints for tenant operations, subscription management, and usage tracking
 */

import { logger } from "@shared/utils/logger";
import express from "express";
import { TenantController } from "../../controllers/TenantController";
import { logApiUsage } from "../../middleware/apiUsage";
import { authenticateJWT } from "../../middleware/auth";
import { rateLimitByTenant } from "../../middleware/rateLimit";
import { validateTenantAccess } from "../../middleware/tenantAccess";

const router = express.Router();
const tenantController = new TenantController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Apply API usage logging for analytics
router.use(logApiUsage);

// ============================================
// TENANT INFORMATION & CONTEXT
// ============================================

/**
 * GET /api/tenant/current
 * Get current tenant information based on authentication context
 */
router.get("/current", async (req, res) => {
  try {
    logger.debug("[TenantAPI] GET /current - Fetching current tenant", {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
    });

    const result = await tenantController.getCurrentTenant(req, res);
    return result;
  } catch (error: any) {
    logger.error("[TenantAPI] Error fetching current tenant", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tenant information",
      message: error.message,
    });
  }
});

/**
 * GET /api/tenant/:tenantId/profile
 * Get detailed tenant profile (admin only)
 */
router.get(
  "/:tenantId/profile",
  validateTenantAccess(["admin"]),
  async (req, res) => {
    try {
      const result = await tenantController.getTenantProfile(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error fetching tenant profile", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tenant profile",
        message: error.message,
      });
    }
  },
);

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * PUT /api/tenant/:tenantId/subscription
 * Update tenant subscription plan
 */
router.put(
  "/:tenantId/subscription",
  validateTenantAccess(["admin", "manager"]),
  rateLimitByTenant(10, 60 * 1000), // 10 requests per minute
  async (req, res) => {
    try {
      logger.debug(
        "[TenantAPI] PUT /:tenantId/subscription - Updating subscription",
        {
          tenantId: req.params.tenantId,
          newPlan: req.body.subscriptionPlan,
          billingCycle: req.body.billingCycle,
        },
      );

      const result = await tenantController.updateSubscription(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error updating subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to update subscription",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/tenant/:tenantId/subscription/cancel
 * Cancel tenant subscription
 */
router.post(
  "/:tenantId/subscription/cancel",
  validateTenantAccess(["admin"]),
  rateLimitByTenant(5, 60 * 1000), // 5 requests per minute
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] POST /:tenantId/subscription/cancel", {
        tenantId: req.params.tenantId,
        reason: req.body.reason,
      });

      const result = await tenantController.cancelSubscription(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error cancelling subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel subscription",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/tenant/:tenantId/subscription/reactivate
 * Reactivate cancelled subscription
 */
router.post(
  "/:tenantId/subscription/reactivate",
  validateTenantAccess(["admin"]),
  rateLimitByTenant(5, 60 * 1000), // 5 requests per minute
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] POST /:tenantId/subscription/reactivate", {
        tenantId: req.params.tenantId,
        plan: req.body.subscriptionPlan,
      });

      const result = await tenantController.reactivateSubscription(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error reactivating subscription", error);
      res.status(500).json({
        success: false,
        error: "Failed to reactivate subscription",
        message: error.message,
      });
    }
  },
);

// ============================================
// USAGE TRACKING & ANALYTICS
// ============================================

/**
 * GET /api/tenant/:tenantId/usage/current
 * Get real-time usage statistics
 */
router.get(
  "/:tenantId/usage/current",
  validateTenantAccess(["admin", "manager", "staff"]),
  rateLimitByTenant(60, 60 * 1000), // 60 requests per minute for real-time updates
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] GET /:tenantId/usage/current", {
        tenantId: req.params.tenantId,
      });

      const result = await tenantController.getCurrentUsage(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error fetching current usage", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch usage statistics",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/tenant/:tenantId/usage/history
 * Get historical usage data with pagination
 */
router.get(
  "/:tenantId/usage/history",
  validateTenantAccess(["admin", "manager"]),
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] GET /:tenantId/usage/history", {
        tenantId: req.params.tenantId,
        period: req.query.period,
        page: req.query.page,
        limit: req.query.limit,
      });

      const result = await tenantController.getUsageHistory(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error fetching usage history", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch usage history",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/tenant/:tenantId/usage/track
 * Track specific usage events (calls, API requests, etc.)
 */
router.post(
  "/:tenantId/usage/track",
  validateTenantAccess(["admin", "manager", "staff"]),
  rateLimitByTenant(300, 60 * 1000), // 300 requests per minute for high-frequency tracking
  async (req, res) => {
    try {
      const result = await tenantController.trackUsageEvent(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error tracking usage event", error);
      res.status(500).json({
        success: false,
        error: "Failed to track usage event",
        message: error.message,
      });
    }
  },
);

// ============================================
// FEATURE ACCESS & LIMITS
// ============================================

/**
 * GET /api/tenant/:tenantId/features
 * Get available features and their status
 */
router.get(
  "/:tenantId/features",
  validateTenantAccess(["admin", "manager", "staff"]),
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] GET /:tenantId/features", {
        tenantId: req.params.tenantId,
      });

      const result = await tenantController.getFeatureAccess(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error fetching feature access", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch feature access",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/tenant/:tenantId/features/check
 * Check access to specific feature
 */
router.post(
  "/:tenantId/features/check",
  validateTenantAccess(["admin", "manager", "staff"]),
  rateLimitByTenant(120, 60 * 1000), // 120 requests per minute for feature checks
  async (req, res) => {
    try {
      const result = await tenantController.checkFeatureAccess(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error checking feature access", error);
      res.status(500).json({
        success: false,
        error: "Failed to check feature access",
        message: error.message,
      });
    }
  },
);

// ============================================
// BILLING & INVOICES
// ============================================

/**
 * GET /api/tenant/:tenantId/billing/invoices
 * Get billing history and invoices
 */
router.get(
  "/:tenantId/billing/invoices",
  validateTenantAccess(["admin", "manager"]),
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] GET /:tenantId/billing/invoices", {
        tenantId: req.params.tenantId,
        page: req.query.page,
        limit: req.query.limit,
      });

      const result = await tenantController.getBillingInvoices(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error fetching billing invoices", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch billing invoices",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/tenant/:tenantId/billing/payment
 * Process payment for subscription
 */
router.post(
  "/:tenantId/billing/payment",
  validateTenantAccess(["admin"]),
  rateLimitByTenant(10, 60 * 1000), // 10 payment attempts per minute
  async (req, res) => {
    try {
      logger.debug("[TenantAPI] POST /:tenantId/billing/payment", {
        tenantId: req.params.tenantId,
        amount: req.body.amount,
        paymentMethodId: req.body.paymentMethodId,
      });

      const result = await tenantController.processPayment(req, res);
      return result;
    } catch (error: any) {
      logger.error("[TenantAPI] Error processing payment", error);
      res.status(500).json({
        success: false,
        error: "Failed to process payment",
        message: error.message,
      });
    }
  },
);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Global error handler for tenant routes
router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("[TenantAPI] Unhandled error in tenant routes", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      tenantId: req.params.tenantId,
      userId: req.user?.id,
    });

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  },
);

export default router;
