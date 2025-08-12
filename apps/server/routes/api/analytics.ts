/**
 * SaaS Provider Domain - Analytics API Routes
 * Analytics and reporting endpoints for usage tracking and insights
 */

import { logger } from "@shared/utils/logger";
import express from "express";
import { z } from "zod";
import {
  apiUsageTracker,
  getEndpointStats,
  getTenantUsageMetrics,
  logApiUsage,
  trackEndpointUsage,
} from "../../middleware/apiUsage";
import { authenticateJWT } from "../../middleware/auth";
import {
  rateLimitByTenant,
  rateLimitForFeature,
} from "../../middleware/rateLimit";
import { validateTenantAccess } from "../../middleware/tenantAccess";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Apply API usage logging
router.use(logApiUsage());

// ============================================
// VALIDATION SCHEMAS
// ============================================

const FeatureUsageSchema = z.object({
  feature: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

const ReportRequestSchema = z.object({
  type: z.enum(["usage", "features", "performance"]),
  period: z.enum(["last_7d", "last_30d", "last_90d", "custom"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

// ============================================
// FEATURE USAGE TRACKING
// ============================================

/**
 * POST /api/analytics/feature-usage
 * Track feature usage for analytics
 */
router.post(
  "/feature-usage",
  validateTenantAccess(["admin", "manager", "staff"]),
  rateLimitByTenant(300, 60 * 1000), // 300 requests per minute for high-frequency tracking
  trackEndpointUsage("feature-usage-tracking"),
  async (req, res) => {
    try {
      const validation = FeatureUsageSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
      }

      const { feature, metadata, timestamp } = validation.data;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      logger.debug("[AnalyticsAPI] Tracking feature usage", {
        tenantId,
        feature,
        userId: req.user?.id,
      });

      // Track the feature usage event
      await apiUsageTracker.trackUsage({
        tenantId,
        userId: req.user?.id,
        endpoint: `/api/analytics/feature-usage/${feature}`,
        method: "POST",
        statusCode: 200,
        responseTime: 0,
        requestSize: JSON.stringify(req.body).length,
        responseSize: 0,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata: {
          feature,
          ...metadata,
        },
      });

      res.json({
        success: true,
        message: "Feature usage tracked successfully",
        feature,
        timestamp: new Date(),
      });
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error tracking feature usage", error);
      res.status(500).json({
        success: false,
        error: "Failed to track feature usage",
        message: error.message,
      });
    }
  },
);

// ============================================
// USAGE ANALYTICS
// ============================================

/**
 * GET /api/analytics/usage/metrics
 * Get usage metrics for current tenant
 */
router.get(
  "/usage/metrics",
  validateTenantAccess(["admin", "manager"]),
  rateLimitByTenant(60, 60 * 1000), // 60 requests per minute
  async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;
      const period = (req.query.period as string) || "current_month";

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      logger.debug("[AnalyticsAPI] Getting usage metrics", {
        tenantId,
        period,
        userId: req.user?.id,
      });

      const metrics = await getTenantUsageMetrics(tenantId, period);

      res.json({
        success: true,
        metrics,
        period,
        tenantId,
        generatedAt: new Date(),
      });
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error getting usage metrics", error);
      res.status(500).json({
        success: false,
        error: "Failed to get usage metrics",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/analytics/usage/endpoints
 * Get endpoint usage statistics
 */
router.get(
  "/usage/endpoints",
  validateTenantAccess(["admin", "manager"]),
  rateLimitByTenant(30, 60 * 1000), // 30 requests per minute
  async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;
      const period = (req.query.period as string) || "current_month";

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      logger.debug("[AnalyticsAPI] Getting endpoint stats", {
        tenantId,
        period,
        userId: req.user?.id,
      });

      const endpointStats = await getEndpointStats(tenantId, period);

      res.json({
        success: true,
        endpoints: endpointStats,
        period,
        tenantId,
        generatedAt: new Date(),
      });
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error getting endpoint stats", error);
      res.status(500).json({
        success: false,
        error: "Failed to get endpoint statistics",
        message: error.message,
      });
    }
  },
);

// ============================================
// REPORTING
// ============================================

/**
 * POST /api/analytics/reports/generate
 * Generate usage and analytics reports
 */
router.post(
  "/reports/generate",
  validateTenantAccess(["admin", "manager"]),
  rateLimitForFeature("data_export", 10, 60 * 1000), // Feature-specific rate limit
  async (req, res) => {
    try {
      const validation = ReportRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
      }

      const { type, period, startDate, endDate, format } = validation.data;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      logger.debug("[AnalyticsAPI] Generating report", {
        tenantId,
        type,
        period,
        format,
        userId: req.user?.id,
      });

      // Generate report based on type
      let reportData;
      switch (type) {
        case "usage":
          reportData = await generateUsageReport(
            tenantId,
            period,
            startDate,
            endDate,
          );
          break;
        case "features":
          reportData = await generateFeatureReport(
            tenantId,
            period,
            startDate,
            endDate,
          );
          break;
        case "performance":
          reportData = await generatePerformanceReport(
            tenantId,
            period,
            startDate,
            endDate,
          );
          break;
        default:
          throw new Error("Invalid report type");
      }

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${type}-report-${new Date().toISOString().split("T")[0]}.csv"`,
        );
        res.send(convertToCSV(reportData));
      } else {
        res.json({
          success: true,
          report: {
            type,
            period,
            data: reportData,
            generatedAt: new Date(),
            tenantId,
          },
        });
      }
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error generating report", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate report",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/analytics/reports/history
 * Get report generation history
 */
router.get(
  "/reports/history",
  validateTenantAccess(["admin", "manager"]),
  rateLimitByTenant(30, 60 * 1000),
  async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      // This would fetch report history from database
      // For now, return mock data
      const reportHistory = [];

      res.json({
        success: true,
        reports: reportHistory,
        pagination: {
          page,
          limit,
          total: reportHistory.length,
        },
      });
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error getting report history", error);
      res.status(500).json({
        success: false,
        error: "Failed to get report history",
        message: error.message,
      });
    }
  },
);

// ============================================
// REAL-TIME ANALYTICS
// ============================================

/**
 * GET /api/analytics/realtime/dashboard
 * Get real-time dashboard data
 */
router.get(
  "/realtime/dashboard",
  validateTenantAccess(["admin", "manager"]),
  rateLimitByTenant(120, 60 * 1000), // Higher limit for real-time updates
  async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: "Tenant context required",
        });
      }

      // Get real-time metrics
      const realtimeData = await getRealTimeDashboardData(tenantId);

      res.json({
        success: true,
        dashboard: realtimeData,
        timestamp: new Date(),
      });
    } catch (error: any) {
      logger.error("[AnalyticsAPI] Error getting real-time dashboard", error);
      res.status(500).json({
        success: false,
        error: "Failed to get real-time dashboard data",
        message: error.message,
      });
    }
  },
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function generateUsageReport(
  tenantId: string,
  period: string,
  _startDate?: string,
  _endDate?: string,
): Promise<any> {
  // Implementation for usage report generation
  const metrics = await getTenantUsageMetrics(tenantId, period);
  const endpoints = await getEndpointStats(tenantId, period);

  return {
    summary: metrics,
    endpoints: endpoints,
    period: period,
  };
}

async function generateFeatureReport(
  tenantId: string,
  period: string,
  _startDate?: string,
  _endDate?: string,
): Promise<any> {
  // Implementation for feature usage report
  return {
    features: [],
    period: period,
  };
}

async function generatePerformanceReport(
  tenantId: string,
  period: string,
  _startDate?: string,
  _endDate?: string,
): Promise<any> {
  // Implementation for performance report
  return {
    performance: {},
    period: period,
  };
}

async function getRealTimeDashboardData(tenantId: string): Promise<any> {
  // Implementation for real-time dashboard data
  const currentUsage = await getTenantUsageMetrics(tenantId, "last_24_hours");

  return {
    currentUsage,
    activeUsers: 0, // Would implement actual active user tracking
    systemStatus: "operational",
    alerts: [],
  };
}

function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }

  // Handle nested objects by flattening
  const flattenedData = data.map((item) => {
    const flattened: any = {};
    Object.keys(item).forEach((key) => {
      if (typeof item[key] === "object" && item[key] !== null) {
        Object.keys(item[key]).forEach((subKey) => {
          flattened[`${key}_${subKey}`] = item[key][subKey];
        });
      } else {
        flattened[key] = item[key];
      }
    });
    return flattened;
  });

  const headers = Object.keys(flattenedData[0]);
  const csvRows = [headers.join(",")];

  for (const row of flattenedData) {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === "string"
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("[AnalyticsAPI] Unhandled error in analytics routes", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      tenantId: req.user?.tenantId,
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
