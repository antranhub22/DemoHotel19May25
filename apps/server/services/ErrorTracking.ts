/**
 * Enhanced Error Tracking Service - LOW RISK Enhancement
 * Centralized error handling and monitoring for dashboard operations
 */

import { logger } from "../../../packages/shared/utils/logger";

export interface ErrorReport {
  id: string;
  component: string;
  operation: string;
  error: string;
  stack?: string;
  context?: any;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  resolved: boolean;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByComponent: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorReport[];
  topErrors: Array<{ error: string; count: number; lastSeen: string }>;
  timeRange: string;
}

class ErrorTrackingService {
  private errors: ErrorReport[] = [];
  private readonly maxErrors = 1000; // Keep last 1000 errors
  private readonly alertThresholds = {
    low: 50, // 50 low severity errors in timeframe
    medium: 20, // 20 medium severity errors
    high: 10, // 10 high severity errors
    critical: 1, // 1 critical error triggers alert
  };

  /**
   * Report an error with automatic severity detection
   */
  reportError(
    component: string,
    operation: string,
    error: Error | string,
    context?: any,
    severity?: "low" | "medium" | "high" | "critical",
  ): string {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const stack = error instanceof Error ? error.stack : undefined;

      // Auto-detect severity if not provided
      const detectedSeverity =
        severity || this.detectSeverity(errorMessage, component);

      const errorReport: ErrorReport = {
        id: this.generateErrorId(),
        component,
        operation,
        error: errorMessage,
        stack,
        context,
        severity: detectedSeverity,
        timestamp: new Date().toISOString(),
        userId: context?.userId,
        tenantId: context?.tenantId,
        requestId: context?.requestId,
        resolved: false,
      };

      // Store error
      this.errors.push(errorReport);
      this.trimErrors();

      // Log error with appropriate level
      this.logError(errorReport);

      // Check for alert conditions
      this.checkAlertThresholds(detectedSeverity);

      return errorReport.id;
    } catch (trackingError) {
      // Error tracking itself failed - use fallback logging
      logger.error(
        "❌ [ErrorTracking] Failed to report error",
        "ErrorTracking",
        {
          originalError: error instanceof Error ? error.message : error,
          trackingError:
            trackingError instanceof Error
              ? trackingError.message
              : trackingError,
        },
      );
      return "tracking-failed";
    }
  }

  /**
   * Report dashboard-specific error
   */
  reportDashboardError(
    operation: string,
    error: Error | string,
    context?: {
      endpoint?: string;
      tenantId?: string;
      userId?: string;
      responseTime?: number;
      dataSize?: number;
    },
  ): string {
    return this.reportError(
      "Dashboard",
      operation,
      error,
      {
        ...context,
        category: "dashboard",
      },
      this.categorizeDashboardError(error),
    );
  }

  /**
   * Report WebSocket error
   */
  reportWebSocketError(
    operation: string,
    error: Error | string,
    context?: {
      socketId?: string;
      tenantId?: string;
      connectionCount?: number;
    },
  ): string {
    return this.reportError(
      "WebSocket",
      operation,
      error,
      {
        ...context,
        category: "websocket",
      },
      "medium", // WebSocket errors are generally medium severity
    );
  }

  /**
   * Report database error
   */
  reportDatabaseError(
    operation: string,
    error: Error | string,
    context?: {
      query?: string;
      tenantId?: string;
      executionTime?: number;
    },
  ): string {
    return this.reportError(
      "Database",
      operation,
      error,
      {
        ...context,
        category: "database",
      },
      "high", // Database errors are generally high severity
    );
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, resolvedBy?: string): boolean {
    try {
      const error = this.errors.find((e) => e.id === errorId);
      if (error) {
        error.resolved = true;
        error.context = {
          ...error.context,
          resolvedAt: new Date().toISOString(),
          resolvedBy,
        };

        logger.info("✅ [ErrorTracking] Error resolved", "ErrorTracking", {
          errorId,
          component: error.component,
          operation: error.operation,
          resolvedBy,
        });

        return true;
      }
      return false;
    } catch (error) {
      logger.error(
        "❌ [ErrorTracking] Failed to resolve error",
        "ErrorTracking",
        error,
      );
      return false;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeRangeHours: number = 24): ErrorStats {
    try {
      const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
      const recentErrors = this.errors.filter(
        (error) => new Date(error.timestamp) > cutoff && !error.resolved,
      );

      // Count errors by component
      const errorsByComponent: Record<string, number> = {};
      recentErrors.forEach((error) => {
        errorsByComponent[error.component] =
          (errorsByComponent[error.component] || 0) + 1;
      });

      // Count errors by severity
      const errorsBySeverity: Record<string, number> = {};
      recentErrors.forEach((error) => {
        errorsBySeverity[error.severity] =
          (errorsBySeverity[error.severity] || 0) + 1;
      });

      // Get top errors
      const errorCounts = new Map<
        string,
        { count: number; lastSeen: string }
      >();
      recentErrors.forEach((error) => {
        const key = `${error.component}:${error.operation}:${error.error}`;
        const existing = errorCounts.get(key) || {
          count: 0,
          lastSeen: error.timestamp,
        };
        errorCounts.set(key, {
          count: existing.count + 1,
          lastSeen:
            error.timestamp > existing.lastSeen
              ? error.timestamp
              : existing.lastSeen,
        });
      });

      const topErrors = Array.from(errorCounts.entries())
        .map(([error, data]) => ({ error, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalErrors: recentErrors.length,
        errorsByComponent,
        errorsBySeverity,
        recentErrors: recentErrors.slice(-20), // Last 20 errors
        topErrors,
        timeRange: `${timeRangeHours}h`,
      };
    } catch (error) {
      logger.error(
        "❌ [ErrorTracking] Failed to get error stats",
        "ErrorTracking",
        error,
      );
      return {
        totalErrors: 0,
        errorsByComponent: {},
        errorsBySeverity: {},
        recentErrors: [],
        topErrors: [],
        timeRange: `${timeRangeHours}h`,
      };
    }
  }

  /**
   * Get health status based on error rates
   */
  getHealthStatus(): {
    status: "healthy" | "warning" | "critical";
    details: any;
  } {
    try {
      const stats = this.getErrorStats(1); // Last hour

      const criticalErrors = stats.errorsBySeverity.critical || 0;
      const highErrors = stats.errorsBySeverity.high || 0;
      const mediumErrors = stats.errorsBySeverity.medium || 0;

      let status: "healthy" | "warning" | "critical" = "healthy";

      if (criticalErrors > 0) {
        status = "critical";
      } else if (highErrors >= 5 || mediumErrors >= 15) {
        status = "warning";
      }

      return {
        status,
        details: {
          totalErrors: stats.totalErrors,
          criticalErrors,
          highErrors,
          mediumErrors,
          topComponent: Object.keys(stats.errorsByComponent)[0] || "none",
          lastErrorTime: stats.recentErrors[0]?.timestamp || null,
        },
      };
    } catch (error) {
      logger.error(
        "❌ [ErrorTracking] Failed to get health status",
        "ErrorTracking",
        error,
      );
      return {
        status: "warning",
        details: { error: "Health check failed" },
      };
    }
  }

  /**
   * Clear old errors (for maintenance)
   */
  clearOldErrors(daysOld: number = 7): number {
    try {
      const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const initialCount = this.errors.length;

      this.errors = this.errors.filter(
        (error) => new Date(error.timestamp) > cutoff,
      );

      const clearedCount = initialCount - this.errors.length;

      if (clearedCount > 0) {
        logger.info(
          `🧹 [ErrorTracking] Cleared ${clearedCount} old errors`,
          "ErrorTracking",
        );
      }

      return clearedCount;
    } catch (error) {
      logger.error(
        "❌ [ErrorTracking] Failed to clear old errors",
        "ErrorTracking",
        error,
      );
      return 0;
    }
  }

  /**
   * Auto-detect error severity based on message and component
   */
  private detectSeverity(
    errorMessage: string,
    component: string,
  ): "low" | "medium" | "high" | "critical" {
    const message = errorMessage.toLowerCase();

    // Critical patterns
    if (
      message.includes("database connection") ||
      message.includes("out of memory") ||
      message.includes("server crash") ||
      message.includes("authentication failed") ||
      message.includes("permission denied")
    ) {
      return "critical";
    }

    // High severity patterns
    if (
      message.includes("timeout") ||
      message.includes("query failed") ||
      message.includes("connection refused") ||
      message.includes("internal server error") ||
      component === "Database"
    ) {
      return "high";
    }

    // Medium severity patterns
    if (
      message.includes("validation") ||
      message.includes("not found") ||
      message.includes("invalid") ||
      message.includes("websocket") ||
      component === "WebSocket"
    ) {
      return "medium";
    }

    // Default to low
    return "low";
  }

  /**
   * Categorize dashboard-specific errors
   */
  private categorizeDashboardError(
    error: Error | string,
  ): "low" | "medium" | "high" | "critical" {
    const message = (
      error instanceof Error ? error.message : error
    ).toLowerCase();

    if (message.includes("cache") || message.includes("websocket")) {
      return "low"; // Cache/WebSocket errors don't break core functionality
    }

    if (message.includes("api") || message.includes("fetch")) {
      return "medium"; // API errors affect user experience
    }

    if (message.includes("database") || message.includes("query")) {
      return "high"; // Database errors are serious
    }

    return "low"; // Default for dashboard errors
  }

  /**
   * Log error with appropriate level
   */
  private logError(errorReport: ErrorReport): void {
    const logData = {
      errorId: errorReport.id,
      component: errorReport.component,
      operation: errorReport.operation,
      severity: errorReport.severity,
      tenantId: errorReport.tenantId,
      userId: errorReport.userId,
    };

    switch (errorReport.severity) {
      case "critical":
        logger.error(
          `💥 [${errorReport.component}] CRITICAL: ${errorReport.error}`,
          "ErrorTracking",
          logData,
        );
        break;
      case "high":
        logger.error(
          `🔥 [${errorReport.component}] HIGH: ${errorReport.error}`,
          "ErrorTracking",
          logData,
        );
        break;
      case "medium":
        logger.warn(
          `⚠️ [${errorReport.component}] MEDIUM: ${errorReport.error}`,
          "ErrorTracking",
          logData,
        );
        break;
      case "low":
        logger.debug(
          `ℹ️ [${errorReport.component}] LOW: ${errorReport.error}`,
          "ErrorTracking",
          logData,
        );
        break;
    }
  }

  /**
   * Check if error rates exceed alert thresholds
   */
  private checkAlertThresholds(severity: string): void {
    try {
      const stats = this.getErrorStats(1); // Last hour
      const count = stats.errorsBySeverity[severity] || 0;
      const threshold =
        this.alertThresholds[severity as keyof typeof this.alertThresholds];

      if (count >= threshold) {
        logger.warn(
          `🚨 [ErrorTracking] Alert threshold exceeded`,
          "ErrorTracking",
          {
            severity,
            count,
            threshold,
            timeframe: "1 hour",
          },
        );
      }
    } catch (error) {
      logger.error(
        "❌ [ErrorTracking] Alert threshold check failed",
        "ErrorTracking",
        error,
      );
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Trim errors to maintain memory limits
   */
  private trimErrors(): void {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }
}

// Singleton instance
export const errorTracking = new ErrorTrackingService();

// Export for debugging in development
if (process.env.NODE_ENV === "development") {
  (global as any).errorTracking = errorTracking;
}

export default errorTracking;
