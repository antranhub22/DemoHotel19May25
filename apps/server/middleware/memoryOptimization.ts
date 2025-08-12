/**
 * Memory Optimization Middleware for Render Deployment
 * Giảm memory usage và prevent OOM errors
 */

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  usage: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private readonly MEMORY_THRESHOLD = 0.7; // 🚀 STANDARD: 70% threshold for Render Standard plan (2GB)
  private readonly CRITICAL_THRESHOLD = 0.85; // 🚀 STANDARD: 85% critical for 1536MB limit
  private readonly CHECK_INTERVAL = 60000; // 🚀 STANDARD: 60 seconds optimal for 2GB plan
  private lastGC = 0;
  private gcInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private startMonitoring(): void {
    this.gcInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.CHECK_INTERVAL);
  }

  private checkMemoryUsage(): void {
    const stats = this.getMemoryStats();

    if (stats.usage > this.CRITICAL_THRESHOLD) {
      logger.error(
        "🚨 [MEMORY] Critical memory usage detected!",
        "MemoryManager",
        {
          usage: `${stats.usage.toFixed(2)}%`,
          heapUsed: `${stats.heapUsed}MB`,
          heapTotal: `${stats.heapTotal}MB`,
          rss: `${stats.rss}MB`,
        },
      );
      this.performEmergencyCleanup();
    } else if (stats.usage > this.MEMORY_THRESHOLD) {
      logger.warn("⚠️ [MEMORY] High memory usage detected", "MemoryManager", {
        usage: `${stats.usage.toFixed(2)}%`,
        heapUsed: `${stats.heapUsed}MB`,
      });
      this.performOptimization();
    }
  }

  private getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      usage: (usage.heapUsed / usage.heapTotal) * 100,
    };
  }

  private performOptimization(): void {
    try {
      // 🚨 BUG FIX: Check if GC is available and warn if not
      if (!global.gc) {
        logger.warn(
          "⚠️ [MEMORY] Garbage collection not available! Node.js needs --expose-gc flag",
          "MemoryManager",
        );

        // 🔧 EMERGENCY: Alternative memory cleanup without GC
        const currentStats = this.getMemoryStats();
        if (currentStats.usage > 90) {
          logger.error(
            "🚨 [MEMORY] CRITICAL: Memory >90% but GC unavailable! Performing emergency cleanup",
            "MemoryManager",
            { usage: `${currentStats.usage.toFixed(2)}%` },
          );

          // Force process restart recommendation
          process.emit("SIGTERM", "SIGTERM");
        }
        return;
      }

      // 🔥 AGGRESSIVE GC: More frequent and lower threshold
      if (Date.now() - this.lastGC > 60000) {
        // 60 second interval for responsive memory management
        const beforeStats = this.getMemoryStats();
        if (beforeStats.usage > 75) {
          // GC at 75% to prevent critical situations (Standard plan optimization)
          logger.info(
            "🗑️ [MEMORY] Starting garbage collection...",
            "MemoryManager",
            {
              before: `${beforeStats.usage.toFixed(2)}%`,
              heapUsed: `${beforeStats.heapUsed}MB`,
            },
          );

          global.gc();
          this.lastGC = Date.now();

          const afterStats = this.getMemoryStats();
          logger.info(
            "✅ [MEMORY] Garbage collection completed",
            "MemoryManager",
            {
              before: `${beforeStats.usage.toFixed(2)}%`,
              after: `${afterStats.usage.toFixed(2)}%`,
              freed: `${(beforeStats.heapUsed - afterStats.heapUsed).toFixed(2)}MB`,
            },
          );
        }
      }

      // ✅ REMOVED: require.cache clearing (causes memory leaks and module reload issues)
      // require.cache clearing is dangerous and can cause memory leaks
      // Let Node.js handle module caching naturally

      logger.debug("🔧 [MEMORY] Memory optimization check completed");
    } catch (error) {
      logger.warn(
        "Failed to perform memory optimization",
        "MemoryManager",
        error,
      );
    }
  }

  private performEmergencyCleanup(): void {
    try {
      // ✅ EMERGENCY: More aggressive but safe cleanup
      if (global.gc) {
        const beforeStats = this.getMemoryStats();

        // Force garbage collection twice for emergency cleanup
        global.gc();
        setTimeout(() => global.gc(), 100); // Small delay then second GC

        this.lastGC = Date.now();
        const afterStats = this.getMemoryStats();

        logger.error(
          "🚨 [MEMORY] Emergency garbage collection performed",
          "MemoryManager",
          {
            before: `${beforeStats.usage.toFixed(2)}%`,
            after: `${afterStats.usage.toFixed(2)}%`,
            heapBefore: `${beforeStats.heapUsed}MB`,
            heapAfter: `${afterStats.heapUsed}MB`,
            rssBefore: `${beforeStats.rss}MB`,
            rssAfter: `${afterStats.rss}MB`,
          },
        );
      }

      // ✅ SAFE: Log current state after cleanup
      const finalStats = this.getMemoryStats();
      logger.info("📊 [MEMORY] Post-cleanup stats", "MemoryManager", {
        usage: `${finalStats.usage.toFixed(2)}%`,
        heapUsed: `${finalStats.heapUsed}MB`,
        heapTotal: `${finalStats.heapTotal}MB`,
        rss: `${finalStats.rss}MB`,
      });
    } catch (error) {
      logger.error("Emergency memory cleanup failed", "MemoryManager", error);
    }
  }

  public getMemoryReport(): MemoryStats {
    return this.getMemoryStats();
  }

  public cleanup(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }
}

// ✅ OPTIMIZED: Memory optimization middleware with reduced overhead
export const memoryOptimizationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const memoryManager = MemoryManager.getInstance();

  // ✅ OPTIMIZATION: Only check memory for heavy endpoints to reduce overhead
  const isHeavyEndpoint =
    req.path.includes("/api/transcripts") ||
    req.path.includes("/api/dashboard") ||
    req.path.includes("/api/requests") ||
    req.method === "POST";

  if (isHeavyEndpoint) {
    // Add memory stats to request for debugging heavy operations only
    const stats = memoryManager.getMemoryReport();
    (req as any).memoryStats = stats;

    // Warn if memory is high before heavy processing
    if (stats.usage > 80) {
      // ✅ STANDARD PLAN: 80% warning for 2GB plan
      logger.warn(
        "⚠️ [MEMORY] High memory usage before request processing",
        "MemoryOptimizationMiddleware",
        {
          endpoint: req.path,
          method: req.method,
          memoryUsage: `${stats.usage.toFixed(2)}%`,
          heapUsed: `${stats.heapUsed}MB`,
          rss: `${stats.rss}MB`,
        },
      );
    }
  }

  next();
};

// Response compression middleware to reduce memory usage
export const responseCompressionMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const originalJson = res.json;

  res.json = function (body: any) {
    try {
      // Remove unnecessary fields from responses
      const optimizedBody = optimizeResponse(body);
      return originalJson.call(this, optimizedBody);
    } catch (error) {
      logger.warn("Failed to optimize response", "ResponseCompression", error);
      return originalJson.call(this, body);
    }
  };

  next();
};

// Helper function to optimize response data
function optimizeResponse(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(optimizeResponse);
  }

  const optimized: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Skip empty arrays and objects
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    if (typeof value === "object" && Object.keys(value).length === 0) {
      continue;
    }

    // Recursively optimize nested objects
    optimized[key] = optimizeResponse(value);
  }

  return optimized;
}

export { MemoryManager };
export default memoryOptimizationMiddleware;
