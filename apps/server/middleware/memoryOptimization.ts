/**
 * Memory Optimization Middleware for Render Deployment
 * Giảm memory usage và prevent OOM errors
 */

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import * as path from "path";
import * as v8 from "v8";
import { emergencyCleanup } from "./emergencyCleanup";
import { TimerManager } from "../utils/TimerManager";

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  usage: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  // Thresholds are percentages (0-100)
  private readonly MEMORY_THRESHOLD = 50; // Early intervention at 50%
  private readonly CRITICAL_THRESHOLD = 65; // Critical at 65%
  private readonly CHECK_INTERVAL = 60000; // 🔥 OPTIMIZED: 60 seconds to reduce overhead
  private lastGC = 0;
  private gcInterval: NodeJS.Timeout | null = null;
  private samples: Array<{ ts: number; heapUsed: number; rss: number }> = [];
  private readonly MAX_SAMPLES = 120; // keep last 2h if CHECK_INTERVAL=60s

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
    this.gcInterval = TimerManager.setInterval(
      () => {
        this.checkMemoryUsage();
        this.recordSample();
      },
      this.CHECK_INTERVAL,
      "auto-generated-interval-3",
    );
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
      // Generate heap snapshot for diagnostics (best-effort)
      this.safeWriteHeapSnapshot("critical-threshold");
      this.performEmergencyCleanup();
    } else if (stats.usage > this.MEMORY_THRESHOLD) {
      logger.warn("⚠️ [MEMORY] High memory usage detected", "MemoryManager", {
        usage: `${stats.usage.toFixed(2)}%`,
        heapUsed: `${stats.heapUsed}MB`,
      });
      this.performOptimization();
    }
  }

  private recordSample(): void {
    const usage = process.memoryUsage();
    const sample = {
      ts: Date.now(),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
    };
    this.samples.push(sample);
    if (this.samples.length > this.MAX_SAMPLES) {
      this.samples.splice(0, this.samples.length - this.MAX_SAMPLES);
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

  private safeWriteHeapSnapshot(reason: string): void {
    try {
      const filename = `heap-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}-${reason}.heapsnapshot`;
      const outPath = path.join(process.cwd(), filename);
      v8.writeHeapSnapshot(outPath);
      logger.warn("🧠 [MEMORY] Heap snapshot written", "MemoryManager", {
        file: outPath,
        reason,
      });
    } catch (error) {
      logger.debug("Heap snapshot failed (ignored)", "MemoryManager", error);
    }
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
        TimerManager.setTimeout(
          () => manualGc(),
          100,
          "auto-generated-timeout-1",
        ); // Small delay then second GC
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
      // 🔥 RADICAL FIX: Eliminated dangerous memory pressure creation
      // ❌ REMOVED: Creating 10+ MILLION objects was causing the memory leak!
      // Old code was creating: 50 * 200,000 + 1,000 * 1,000 + 100,000 = ~11M objects

      // ✅ SAFE: Simple forced GC if available
      if (global.gc) {
        const beforeStats = this.getMemoryStats();
        global.gc();
        const afterStats = this.getMemoryStats();

        logger.info("🔄 [MEMORY] Safe GC executed", "MemoryManager", {
          before: `${beforeStats.usage.toFixed(2)}%`,
          after: `${afterStats.usage.toFixed(2)}%`,
          freed: `${(beforeStats.heapUsed - afterStats.heapUsed).toFixed(2)}MB`,
        });
      } else {
        // ✅ SAFE: Let Node.js handle GC naturally
        logger.debug(
          "🔄 [MEMORY] Letting Node.js handle GC naturally",
          "MemoryManager",
        );
      }
    } catch (error) {
      logger.warn("Safe GC execution failed", "MemoryManager", error);
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
    // Pre-request sample
    const before = memoryManager.getMemoryReport();
    (req as any).memoryStats = before;

    // Long-running request watchdog
    const watchdog = TimerManager.setTimeout(() => {
      const current = memoryManager.getMemoryReport();
      if (current.usage > memoryManager["CRITICAL_THRESHOLD"]) {
        logger.error(
          "⏱️ [MEMORY] Long-running request under high memory",
          "MemoryOptimizationMiddleware",
          {
            endpoint: req.path,
            method: req.method,
            memoryUsage: `${current.usage.toFixed(2)}%`,
            heapUsed: `${current.heapUsed}MB`,
          },
        );
        // Best-effort emergency cleanup when critical during long requests
        void emergencyCleanup.forceMemoryCleanup();
      }
    }, 15000); // 15s watchdog

    // Finish hook to report deltas
    const cleanup = () => {
      clearTimeout(watchdog);
      const after = memoryManager.getMemoryReport();
      const delta = after.heapUsed - before.heapUsed;
      if (delta > 25 || after.usage > 75) {
        logger.warn(
          "📈 [MEMORY] High-memory request detected",
          "MemoryOptimizationMiddleware",
          {
            endpoint: req.path,
            method: req.method,
            heapDeltaMB: delta,
            before: `${before.heapUsed}MB (${before.usage.toFixed(2)}%)`,
            after: `${after.heapUsed}MB (${after.usage.toFixed(2)}%)`,
          },
        );
      }
    };

    _res.on("finish", cleanup);
    _res.on("close", cleanup);
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
