/**
 * Memory Optimization Middleware for Render Deployment
 * Giảm memory usage và prevent OOM errors
 */

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import { emergencyCleanup } from "./emergencyCleanup";

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  usage: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private readonly MEMORY_THRESHOLD = 0.6; // 🔥 AGGRESSIVE: 60% threshold for early intervention
  private readonly CRITICAL_THRESHOLD = 0.75; // 🔥 AGGRESSIVE: 75% critical to prevent 96% situations
  private readonly CHECK_INTERVAL = 30000; // 🔥 AGGRESSIVE: 30 seconds for faster response
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
      // 🚀 RENDER COMPATIBILITY: Handle GC gracefully without --expose-gc
      if (!global.gc) {
        logger.debug(
          "ℹ️ [MEMORY] Running without manual GC (Render platform limitation)",
          "MemoryManager",
        );

        // 🔧 ALTERNATIVE: Memory cleanup strategies without manual GC
        const currentStats = this.getMemoryStats();
        if (currentStats.usage > 90) {
          logger.warn(
            "⚠️ [MEMORY] High memory usage detected - triggering emergency cleanup",
            "MemoryManager",
            { usage: `${currentStats.usage.toFixed(2)}%` },
          );

          // Use emergency cleanup for critical situations
          emergencyCleanup.forceMemoryCleanup();
        } else if (currentStats.usage > 80) {
          // Trigger automatic GC for moderate usage
          this.triggerAutomaticGC();
        }
        return;
      }

      // 🔥 AGGRESSIVE GC: More frequent and lower threshold
      if (Date.now() - this.lastGC > 60000) {
        // 60 second interval for responsive memory management
        const beforeStats = this.getMemoryStats();
        if (beforeStats.usage > 65) {
          // GC at 65% to prevent 96% critical situations
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

  private async performEmergencyCleanup(): Promise<void> {
    try {
      const beforeStats = this.getMemoryStats();

      // ✅ EMERGENCY: Render-compatible cleanup strategy
      if (global.gc) {
        // If GC is available, use it
        const manualGc = global.gc;
        manualGc();
        setTimeout(() => manualGc(), 100); // Small delay then second GC
        this.lastGC = Date.now();
      } else {
        // Alternative cleanup - use emergency cleanup for critical situations
        if (beforeStats.usage > 90) {
          await emergencyCleanup.forceMemoryCleanup();
        } else {
          this.triggerAutomaticGC();
        }
      }

      const afterStats = this.getMemoryStats();
      logger.error("🚨 [MEMORY] Emergency cleanup performed", "MemoryManager", {
        strategy: global.gc ? "manual_gc" : "automatic_gc",
        before: `${beforeStats.usage.toFixed(2)}%`,
        after: `${afterStats.usage.toFixed(2)}%`,
        heapBefore: `${beforeStats.heapUsed}MB`,
        heapAfter: `${afterStats.heapUsed}MB`,
        rssBefore: `${beforeStats.rss}MB`,
        rssAfter: `${afterStats.rss}MB`,
      });

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

  private triggerAutomaticGC(): void {
    try {
      // 🔥 ENHANCED RENDER STRATEGY: Multiple techniques to trigger GC

      // 1. Create memory pressure with larger arrays
      const tempArrays: any[] = [];
      for (let i = 0; i < 50; i++) {
        tempArrays.push(new Array(200000).fill(Math.random()));
      }

      // 2. Create nested objects to increase heap pressure
      const tempObjects: any[] = [];
      for (let i = 0; i < 1000; i++) {
        tempObjects.push({
          data: new Array(1000).fill(i),
          nested: { more: new Array(100).fill(i) },
        });
      }

      // 3. Clear all references immediately
      tempArrays.length = 0;
      tempObjects.length = 0;

      // 4. Force multiple event loop cycles
      setTimeout(() => {
        // Second wave of memory pressure
        const temp2 = new Array(100000).fill(0);
        temp2.length = 0;

        setTimeout(() => {
          const afterStats = this.getMemoryStats();
          logger.info(
            "🔄 [MEMORY] Enhanced automatic GC strategy executed",
            "MemoryManager",
            { memoryUsage: `${afterStats.usage.toFixed(2)}%` },
          );
        }, 50);
      }, 50);
    } catch (error) {
      logger.warn("Failed to trigger automatic GC", "MemoryManager", error);
    }
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
    if (stats.usage > 70) {
      // 🔥 AGGRESSIVE: 70% warning to prevent critical situations
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
