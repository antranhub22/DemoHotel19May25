/**
 * SaaS Provider Domain - Platform Analytics API Routes
 * Platform-wide analytics and metrics for SaaS administrators
 */

import { logger } from "@shared/utils/logger";
import express from "express";
import { PlatformController } from "../../controllers/PlatformController";
import { logApiUsage } from "../../middleware/apiUsage";
import { authenticateJWT } from "../../middleware/auth";
import { rateLimitBySubscription } from "../../middleware/rateLimit";
import { allowCrossTenantAccess } from "../../middleware/tenantAccess";

const router = express.Router();
const platformController = new PlatformController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Apply cross-tenant access for platform admins
router.use(allowCrossTenantAccess());

// Apply API usage logging
router.use(logApiUsage());

// ============================================
// PLATFORM METRICS & ANALYTICS
// ============================================

/**
 * GET /api/platform/metrics
 * Get platform-wide metrics and KPIs
 */
router.get(
  "/metrics",
  rateLimitBySubscription("api", 60 * 1000), // 1 minute window
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /metrics - Fetching platform metrics", {
        userId: req.user?.id,
        userRole: req.user?.role,
      });

      const result = await platformController.getPlatformMetrics(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching platform metrics", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch platform metrics",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/analytics
 * Get detailed platform analytics with filters
 */
router.get(
  "/analytics",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug(
        "[PlatformAPI] GET /analytics - Fetching platform analytics",
        {
          userId: req.user?.id,
          period: req.query.period,
          metrics: req.query.metrics,
        },
      );

      const result = await platformController.getPlatformAnalytics(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching platform analytics", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch platform analytics",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/revenue
 * Get revenue analytics and forecasting
 */
router.get(
  "/revenue",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /revenue - Fetching revenue analytics", {
        userId: req.user?.id,
        period: req.query.period,
      });

      const result = await platformController.getRevenueAnalytics(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching revenue analytics", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch revenue analytics",
        message: error.message,
      });
    }
  },
);

// ============================================
// TENANT MANAGEMENT
// ============================================

/**
 * GET /api/platform/tenants
 * Get all tenants with pagination and filtering
 */
router.get(
  "/tenants",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /tenants - Fetching all tenants", {
        userId: req.user?.id,
        page: req.query.page,
        limit: req.query.limit,
        filter: req.query.filter,
      });

      const result = await platformController.getAllTenants(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching all tenants", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tenants",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/tenants/:tenantId/details
 * Get detailed tenant information for platform admin
 */
router.get(
  "/tenants/:tenantId/details",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /tenants/:tenantId/details", {
        userId: req.user?.id,
        tenantId: req.params.tenantId,
      });

      const result = await platformController.getTenantDetails(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching tenant details", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tenant details",
        message: error.message,
      });
    }
  },
);

/**
 * PUT /api/platform/tenants/:tenantId/status
 * Update tenant status (suspend, activate, etc.)
 */
router.put(
  "/tenants/:tenantId/status",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] PUT /tenants/:tenantId/status", {
        userId: req.user?.id,
        tenantId: req.params.tenantId,
        newStatus: req.body.status,
      });

      const result = await platformController.updateTenantStatus(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error updating tenant status", error);
      res.status(500).json({
        success: false,
        error: "Failed to update tenant status",
        message: error.message,
      });
    }
  },
);

// ============================================
// USAGE ANALYTICS
// ============================================

/**
 * GET /api/platform/usage/overview
 * Get platform-wide usage overview
 */
router.get(
  "/usage/overview",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /usage/overview", {
        userId: req.user?.id,
        period: req.query.period,
      });

      const result = await platformController.getUsageOverview(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching usage overview", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch usage overview",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/usage/trends
 * Get usage trends and forecasting
 */
router.get(
  "/usage/trends",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /usage/trends", {
        userId: req.user?.id,
        period: req.query.period,
        metric: req.query.metric,
      });

      const result = await platformController.getUsageTrends(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching usage trends", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch usage trends",
        message: error.message,
      });
    }
  },
);

// ============================================
// FEATURE ANALYTICS
// ============================================

/**
 * GET /api/platform/features/adoption
 * Get feature adoption analytics
 */
router.get(
  "/features/adoption",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /features/adoption", {
        userId: req.user?.id,
        period: req.query.period,
      });

      const result = await platformController.getFeatureAdoption(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching feature adoption", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch feature adoption",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/features/usage
 * Get detailed feature usage statistics
 */
router.get(
  "/features/usage",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /features/usage", {
        userId: req.user?.id,
        feature: req.query.feature,
        period: req.query.period,
      });

      const result = await platformController.getFeatureUsage(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching feature usage", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch feature usage",
        message: error.message,
      });
    }
  },
);

// ============================================
// HEALTH & MONITORING
// ============================================

/**
 * GET /api/platform/health
 * Get platform health status
 */
router.get(
  "/health",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /health - Platform health check", {
        userId: req.user?.id,
      });

      const result = await platformController.getPlatformHealth(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error checking platform health", error);
      res.status(500).json({
        success: false,
        error: "Failed to check platform health",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/alerts
 * Get platform-wide alerts and notifications
 */
router.get(
  "/alerts",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /alerts", {
        userId: req.user?.id,
        severity: req.query.severity,
        limit: req.query.limit,
      });

      const result = await platformController.getPlatformAlerts(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching platform alerts", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch platform alerts",
        message: error.message,
      });
    }
  },
);

// ============================================
// SYSTEM ADMINISTRATION
// ============================================

/**
 * POST /api/platform/maintenance
 * Schedule platform maintenance
 */
router.post(
  "/maintenance",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] POST /maintenance", {
        userId: req.user?.id,
        maintenanceType: req.body.type,
        scheduledAt: req.body.scheduledAt,
      });

      const result = await platformController.scheduleMaintenance(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error scheduling maintenance", error);
      res.status(500).json({
        success: false,
        error: "Failed to schedule maintenance",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/system/status
 * Get detailed system status
 */
router.get(
  "/system/status",
  rateLimitBySubscription("api", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /system/status", {
        userId: req.user?.id,
      });

      const result = await platformController.getSystemStatus(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error fetching system status", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch system status",
        message: error.message,
      });
    }
  },
);

// ============================================
// EXPORT & REPORTING
// ============================================

/**
 * POST /api/platform/reports/generate
 * Generate custom platform reports
 */
router.post(
  "/reports/generate",
  rateLimitBySubscription("heavy", 60 * 1000), // Heavy operation limit
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] POST /reports/generate", {
        userId: req.user?.id,
        reportType: req.body.type,
        period: req.body.period,
      });

      const result = await platformController.generateReport(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error generating report", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate report",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/platform/export
 * Export platform data
 */
router.get(
  "/export",
  rateLimitBySubscription("heavy", 60 * 1000),
  async (req, res) => {
    try {
      logger.debug("[PlatformAPI] GET /export", {
        userId: req.user?.id,
        format: req.query.format,
        type: req.query.type,
      });

      const result = await platformController.exportPlatformData(req, res);
      return result;
    } catch (error: any) {
      logger.error("[PlatformAPI] Error exporting platform data", error);
      res.status(500).json({
        success: false,
        error: "Failed to export platform data",
        message: error.message,
      });
    }
  },
);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Global error handler for platform routes
router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("[PlatformAPI] Unhandled error in platform routes", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
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
