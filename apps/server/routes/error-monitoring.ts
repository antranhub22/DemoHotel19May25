/**
 * Error Monitoring API - ZERO RISK Enhancement
 * Provides error tracking and health monitoring endpoints
 */

import { authenticateJWT } from "@auth/middleware/auth.middleware";
import { errorTracking } from "@server/services/ErrorTracking";
import { logger } from "@shared/utils/logger";
import { Request, Response, Router } from "express";

const router = Router();

/**
 * GET /api/errors/stats - Get error statistics
 * ZERO RISK: Read-only monitoring endpoint
 */
router.get("/stats", authenticateJWT, (req: Request, res: Response) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 24; // Default 24 hours

    logger.debug(
      `📊 [Errors] Getting error stats for ${timeRange} hours`,
      "ErrorAPI",
    );

    const stats = errorTracking.getErrorStats(timeRange);

    res.json({
      success: true,
      data: stats,
      version: "1.0.0",
      _metadata: {
        endpoint: "error-stats",
        timeRange: `${timeRange}h`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("❌ [Errors] Failed to get error stats", "ErrorAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get error statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/errors/health - System health based on error rates
 * ZERO RISK: Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  try {
    logger.debug("🏥 [Errors] Getting system health status", "ErrorAPI");

    const health = errorTracking.getHealthStatus();

    res.json({
      ...health,
      timestamp: new Date().toISOString(),
      _metadata: {
        endpoint: "error-health",
        version: "1.0.0",
      },
    });
  } catch (error) {
    logger.error("❌ [Errors] Health check failed", "ErrorAPI", error);
    res.status(500).json({
      status: "error",
      details: {
        error: error instanceof Error ? error.message : "Health check failed",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/errors/recent - Get recent errors with pagination
 * ZERO RISK: Read-only endpoint with filtering
 */
router.get("/recent", authenticateJWT, (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100
    const component = req.query.component as string;
    const severity = req.query.severity as string;

    logger.debug("📋 [Errors] Getting recent errors", "ErrorAPI", {
      limit,
      component,
      severity,
    });

    const stats = errorTracking.getErrorStats(24);
    let errors = stats.recentErrors;

    // Apply filters
    if (component) {
      errors = errors.filter(
        (error) => error.component.toLowerCase() === component.toLowerCase(),
      );
    }

    if (severity) {
      errors = errors.filter((error) => error.severity === severity);
    }

    // Apply limit
    errors = errors.slice(-limit);

    res.json({
      success: true,
      data: {
        errors,
        total: errors.length,
        filters: { component, severity, limit },
      },
      version: "1.0.0",
      _metadata: {
        endpoint: "recent-errors",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("❌ [Errors] Failed to get recent errors", "ErrorAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recent errors",
    });
  }
});

/**
 * POST /api/errors/report - Report a new error (for client-side reporting)
 * LOW RISK: Allows controlled error reporting from frontend
 */
router.post("/report", authenticateJWT, (req: Request, res: Response) => {
  try {
    const { component, operation, error, context, severity } = req.body;

    // Validation
    if (!component || !operation || !error) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: component, operation, error",
      });
    }

    // Extract user info from JWT
    const userId = (req as any).user?.id;
    const tenantId = (req as any).user?.tenantId;

    // Report error with user context
    const errorId = errorTracking.reportError(
      component,
      operation,
      error,
      {
        ...context,
        userId,
        tenantId,
        source: "client-report",
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      },
      severity,
    );

    logger.debug("📝 [Errors] Client error reported", "ErrorAPI", {
      errorId,
      component,
      operation,
      userId,
      tenantId,
    });

    res.json({
      success: true,
      data: {
        errorId,
        message: "Error reported successfully",
      },
      version: "1.0.0",
    });
  } catch (error) {
    logger.error("❌ [Errors] Failed to report error", "ErrorAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to report error",
    });
  }
});

/**
 * PUT /api/errors/:errorId/resolve - Mark error as resolved
 * LOW RISK: Updates error status only
 */
router.put(
  "/:errorId/resolve",
  authenticateJWT,
  (req: Request, res: Response) => {
    try {
      const { errorId } = req.params;
      const { notes } = req.body;

      if (!errorId) {
        return res.status(400).json({
          success: false,
          error: "Error ID is required",
        });
      }

      const userId = (req as any).user?.id;
      const resolved = errorTracking.resolveError(errorId, userId);

      if (resolved) {
        logger.debug("✅ [Errors] Error resolved", "ErrorAPI", {
          errorId,
          resolvedBy: userId,
          notes,
        });

        res.json({
          success: true,
          data: {
            errorId,
            resolved: true,
            resolvedBy: userId,
            resolvedAt: new Date().toISOString(),
          },
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Error not found or already resolved",
        });
      }
    } catch (error) {
      logger.error("❌ [Errors] Failed to resolve error", "ErrorAPI", error);
      res.status(500).json({
        success: false,
        error: "Failed to resolve error",
      });
    }
  },
);

/**
 * DELETE /api/errors/cleanup - Clean up old errors (admin only)
 * LOW RISK: Maintenance endpoint
 */
router.delete("/cleanup", authenticateJWT, (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    // if (!(req as any).user?.role?.includes('admin')) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const daysOld = parseInt(req.query.days as string) || 7; // Default 7 days

    if (daysOld < 1 || daysOld > 90) {
      return res.status(400).json({
        success: false,
        error: "Days must be between 1 and 90",
      });
    }

    const clearedCount = errorTracking.clearOldErrors(daysOld);

    logger.info(`🧹 [Errors] Cleanup completed`, "ErrorAPI", {
      daysOld,
      clearedCount,
      requestedBy: (req as any).user?.id,
    });

    res.json({
      success: true,
      data: {
        clearedCount,
        daysOld,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("❌ [Errors] Cleanup failed", "ErrorAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup errors",
    });
  }
});

/**
 * GET /api/errors/dashboard - Dashboard-specific error overview
 * ZERO RISK: Specialized endpoint for dashboard error monitoring
 */
router.get("/dashboard", authenticateJWT, (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId;

    logger.debug("📊 [Errors] Getting dashboard error overview", "ErrorAPI", {
      tenantId,
    });

    const stats = errorTracking.getErrorStats(24);

    // Filter for dashboard-related errors
    const dashboardErrors = stats.recentErrors.filter(
      (error) =>
        error.component === "Dashboard" ||
        error.component === "WebSocket" ||
        error.context?.category === "dashboard",
    );

    // Get dashboard health
    const health = errorTracking.getHealthStatus();

    const dashboardOverview = {
      health: health.status,
      totalDashboardErrors: dashboardErrors.length,
      errorsByType: {
        dashboard: dashboardErrors.filter((e) => e.component === "Dashboard")
          .length,
        websocket: dashboardErrors.filter((e) => e.component === "WebSocket")
          .length,
        database: dashboardErrors.filter((e) => e.component === "Database")
          .length,
      },
      recentErrors: dashboardErrors.slice(-5), // Last 5 dashboard errors
      recommendations: getDashboardRecommendations(dashboardErrors),
    };

    res.json({
      success: true,
      data: dashboardOverview,
      version: "1.0.0",
      _metadata: {
        endpoint: "dashboard-errors",
        tenantId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      "❌ [Errors] Failed to get dashboard error overview",
      "ErrorAPI",
      error,
    );
    res.status(500).json({
      success: false,
      error: "Failed to get dashboard error overview",
    });
  }
});

/**
 * Generate dashboard-specific recommendations based on error patterns
 */
function getDashboardRecommendations(errors: any[]): string[] {
  const recommendations: string[] = [];

  const websocketErrors = errors.filter(
    (e) => e.component === "WebSocket",
  ).length;
  const databaseErrors = errors.filter(
    (e) => e.component === "Database",
  ).length;
  const cacheErrors = errors.filter((e) => e.error.includes("cache")).length;

  if (websocketErrors > 5) {
    recommendations.push(
      "Consider enabling WebSocket fallback mode for more stable connections",
    );
  }

  if (databaseErrors > 3) {
    recommendations.push(
      "Check database connection pooling and query optimization",
    );
  }

  if (cacheErrors > 2) {
    recommendations.push(
      "Review cache configuration and consider increasing cache TTL",
    );
  }

  if (errors.length === 0) {
    recommendations.push(
      "Dashboard system running smoothly with no recent errors",
    );
  }

  return recommendations;
}

export default router;
