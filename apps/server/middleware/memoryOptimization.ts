/**
 * Memory Optimization Middleware for Render Deployment
 * Giảm memory usage và prevent OOM errors
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/utils/logger";

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  usage: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private readonly MEMORY_THRESHOLD = 0.85; // 85% usage threshold
  private readonly CRITICAL_THRESHOLD = 0.95; // 95% critical threshold
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
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
      // Force garbage collection if available and enough time has passed
      if (global.gc && Date.now() - this.lastGC > 60000) {
        // 1 minute interval
        global.gc();
        this.lastGC = Date.now();
        logger.info("🗑️ [MEMORY] Garbage collection performed");
      }

      // Clear Node.js caches
      if (require.cache) {
        const beforeCount = Object.keys(require.cache).length;
        // Only clear non-essential modules
        Object.keys(require.cache).forEach((key) => {
          if (
            key.includes("node_modules") &&
            !key.includes("prisma") &&
            !key.includes("express")
          ) {
            delete require.cache[key];
          }
        });
        const afterCount = Object.keys(require.cache).length;
        if (beforeCount > afterCount) {
          logger.info(
            `🧹 [MEMORY] Cleared ${beforeCount - afterCount} cached modules`,
          );
        }
      }
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
      this.performOptimization();

      // Additional emergency measures
      if (global.gc) {
        global.gc();
        global.gc(); // Force twice for better cleanup
        logger.info("🚨 [MEMORY] Emergency garbage collection performed");
      }

      // Log current state after cleanup
      const stats = this.getMemoryStats();
      logger.info("📊 [MEMORY] Post-cleanup stats", "MemoryManager", stats);
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

// Memory optimization middleware
export const memoryOptimizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const memoryManager = MemoryManager.getInstance();

  // Add memory stats to request for debugging
  (req as any).memoryStats = memoryManager.getMemoryReport();

  // Check memory before processing heavy requests
  const stats = memoryManager.getMemoryReport();
  if (stats.usage > 90) {
    logger.warn(
      "⚠️ [MEMORY] High memory usage before request processing",
      "MemoryOptimizationMiddleware",
      {
        endpoint: req.path,
        method: req.method,
        memoryUsage: `${stats.usage.toFixed(2)}%`,
      },
    );
  }

  next();
};

// Response compression middleware to reduce memory usage
export const responseCompressionMiddleware = (
  req: Request,
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
