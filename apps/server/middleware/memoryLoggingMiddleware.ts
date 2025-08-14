/**
 * 🔍 MEMORY LOGGING MIDDLEWARE
 *
 * Tracks memory usage for all API endpoints to identify
 * which routes are causing memory spikes.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/utils/logger";
import { memoryTracker } from "@server/shared/MemoryAllocationTracker";

export interface RequestMemoryContext {
  method: string;
  path: string;
  userAgent?: string;
  contentLength?: number;
  hasBody: boolean;
  queryParams: number;
  routeParams: number;
}

class MemoryLoggingMiddleware {
  private heavyEndpoints = new Set([
    "/api/transcripts",
    "/api/dashboard",
    "/api/upload",
    "/api/files",
    "/api/webhook",
    "/api/analytics",
    "/api/reports",
    "/api/backup",
    "/api/migration",
  ]);

  private skipPaths = new Set([
    "/api/health",
    "/api/ping",
    "/favicon.ico",
    "/robots.txt",
  ]);

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip memory tracking for lightweight endpoints
      if (this.shouldSkipTracking(req)) {
        return next();
      }

      const operationId = this.generateOperationId(req);
      const operationName = this.getOperationName(req);
      const context = this.buildRequestContext(req);

      // Start memory tracking
      memoryTracker.startOperation(operationId, operationName, context);

      // Store operation ID in response locals for cleanup
      res.locals.memoryOperationId = operationId;

      // Override res.end to capture memory after response
      const originalEnd = res.end;
      res.end = function (this: Response, ...args: any[]) {
        // Call original end method
        const result = originalEnd.apply(this, args);

        // Track memory after response is sent
        process.nextTick(() => {
          const delta = memoryTracker.endOperation(
            operationId,
            res.statusCode < 400,
          );

          if (delta) {
            logRequestMemoryUsage(req, res, delta);
          }
        });

        return result;
      };

      next();
    };
  }

  private shouldSkipTracking(req: Request): boolean {
    // Skip static files and health checks
    if (this.skipPaths.has(req.path)) {
      return true;
    }

    // Skip if path starts with static prefixes
    const staticPrefixes = ["/static/", "/assets/", "/public/"];
    if (staticPrefixes.some((prefix) => req.path.startsWith(prefix))) {
      return true;
    }

    // Skip certain file extensions
    const staticExtensions = [
      ".js",
      ".css",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".ico",
      ".svg",
    ];
    if (staticExtensions.some((ext) => req.path.endsWith(ext))) {
      return true;
    }

    return false;
  }

  private generateOperationId(req: Request): string {
    return `${req.method}_${req.path}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private getOperationName(req: Request): string {
    const basePath = req.path.split("/").slice(0, 3).join("/"); // e.g., /api/transcripts
    return `${req.method} ${basePath}`;
  }

  private buildRequestContext(req: Request): RequestMemoryContext {
    return {
      method: req.method,
      path: req.path,
      userAgent: req.get("User-Agent")?.substring(0, 100),
      contentLength: req.get("Content-Length")
        ? parseInt(req.get("Content-Length")!)
        : undefined,
      hasBody: ["POST", "PUT", "PATCH"].includes(req.method),
      queryParams: Object.keys(req.query).length,
      routeParams: Object.keys(req.params).length,
    };
  }

  /**
   * Check if endpoint should have enhanced monitoring
   */
  isHeavyEndpoint(path: string): boolean {
    return (
      this.heavyEndpoints.has(path) ||
      Array.from(this.heavyEndpoints).some((endpoint) =>
        path.startsWith(endpoint),
      )
    );
  }
}

/**
 * Log request memory usage with appropriate level based on allocation
 */
function logRequestMemoryUsage(req: Request, res: Response, delta: any): void {
  const heapDeltaMB = delta.heapUsedDelta / 1024 / 1024;
  const externalDeltaMB = delta.externalDelta / 1024 / 1024;
  const duration = delta.durationMs;

  const logData = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    memoryDelta: {
      heap: `${heapDeltaMB.toFixed(2)}MB`,
      external: `${externalDeltaMB.toFixed(2)}MB`,
      rss: `${(delta.rssDelta / 1024 / 1024).toFixed(2)}MB`,
    },
    duration: `${duration}ms`,
    severity: delta.severity,
    userAgent: req.get("User-Agent")?.substring(0, 50),
    contentLength: req.get("Content-Length"),
  };

  switch (delta.severity) {
    case "critical":
      logger.error(
        "🚨 CRITICAL memory allocation in request",
        "MemoryMiddleware",
        logData,
      );
      break;
    case "high":
      logger.error(
        "⚠️ HIGH memory allocation in request",
        "MemoryMiddleware",
        logData,
      );
      break;
    case "medium":
      logger.warn(
        "⚠️ Significant memory allocation in request",
        "MemoryMiddleware",
        logData,
      );
      break;
    case "low":
    default:
      // Only log if allocation is above 5MB or duration is high
      if (heapDeltaMB > 5 || duration > 5000) {
        logger.info("📊 Request memory usage", "MemoryMiddleware", logData);
      } else {
        logger.debug("📊 Request memory usage", "MemoryMiddleware", logData);
      }
      break;
  }
}

// Export singleton middleware
const memoryLoggingMiddleware = new MemoryLoggingMiddleware();
export default memoryLoggingMiddleware.middleware();

// Export class for testing and manual use
export { MemoryLoggingMiddleware };
