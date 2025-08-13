/**
 * Emergency Memory Cleanup - Production Hotfix
 * This module provides aggressive memory cleanup for critical situations
 */

import { logger } from "@shared/utils/logger";
import { CacheManager } from "../shared/CacheManager";

interface CleanupStats {
  before: {
    heapUsed: number;
    heapTotal: number;
    usage: number;
  };
  after: {
    heapUsed: number;
    heapTotal: number;
    usage: number;
  };
  freed: number;
  actions: string[];
}

class EmergencyCleanup {
  private static instance: EmergencyCleanup;
  private activeIntervals: Set<NodeJS.Timeout> = new Set();
  private activeMaps: Map<string, Map<any, any>> = new Map();
  private activeSets: Map<string, Set<any>> = new Map();

  static getInstance(): EmergencyCleanup {
    if (!this.instance) {
      this.instance = new EmergencyCleanup();
    }
    return this.instance;
  }

  registerInterval(interval: NodeJS.Timeout, name?: string): void {
    this.activeIntervals.add(interval);
    logger.debug(`Registered interval: ${name || "unknown"}`);
  }

  registerMap(map: Map<any, any>, name: string): void {
    this.activeMaps.set(name, map);
    logger.debug(`Registered map: ${name}`);
  }

  registerSet(set: Set<any>, name: string): void {
    this.activeSets.set(name, set);
    logger.debug(`Registered set: ${name}`);
  }

  async performEmergencyCleanup(): Promise<CleanupStats> {
    const beforeStats = this.getMemoryStats();
    const actions: string[] = [];

    try {
      // 1. Clear all registered caches
      const cacheManager = CacheManager.getInstance();
      await cacheManager.clearAll();
      actions.push("Cleared CacheManager");

      // 2. Clear all registered Maps
      for (const [name, map] of this.activeMaps.entries()) {
        const sizeBefore = map.size;
        map.clear();
        actions.push(`Cleared Map ${name} (${sizeBefore} entries)`);
      }

      // 3. Clear all registered Sets
      for (const [name, set] of this.activeSets.entries()) {
        const sizeBefore = set.size;
        set.clear();
        actions.push(`Cleared Set ${name} (${sizeBefore} entries)`);
      }

      // 4. Clear require cache selectively (safe modules only)
      this.cleanupRequireCache();
      actions.push("Cleaned require cache");

      // 5. Force multiple GC cycles
      await this.forceGarbageCollection();
      actions.push("Forced garbage collection");

      // 6. Clear global references
      this.clearGlobalReferences();
      actions.push("Cleared global references");

      const afterStats = this.getMemoryStats();
      const freed = beforeStats.heapUsed - afterStats.heapUsed;

      const cleanupStats: CleanupStats = {
        before: beforeStats,
        after: afterStats,
        freed,
        actions,
      };

      logger.error(
        "🚨 [EMERGENCY] Memory cleanup completed",
        "EmergencyCleanup",
        {
          freedMB: `${freed.toFixed(2)}MB`,
          beforeUsage: `${beforeStats.usage.toFixed(2)}%`,
          afterUsage: `${afterStats.usage.toFixed(2)}%`,
          actions: actions.length,
        },
      );

      return cleanupStats;
    } catch (error) {
      logger.error("Emergency cleanup failed", "EmergencyCleanup", error);
      throw error;
    }
  }

  private getMemoryStats() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      usage: (usage.heapUsed / usage.heapTotal) * 100,
    };
  }

  private cleanupRequireCache(): void {
    const safeModules = [
      "prisma",
      "express",
      "jsonwebtoken",
      "bcrypt",
      "cors",
      "helmet",
      "compression",
      "dotenv",
    ];

    let cleaned = 0;
    for (const key of Object.keys(require.cache)) {
      // Only clean user modules, not node_modules or core modules
      if (key.includes("/apps/") || key.includes("/packages/")) {
        const isSafe = safeModules.some((module) => key.includes(module));
        if (!isSafe) {
          delete require.cache[key];
          cleaned++;
        }
      }
    }

    logger.debug(`Cleaned ${cleaned} require cache entries`);
  }

  private async forceGarbageCollection(): Promise<void> {
    if (global.gc) {
      // Multiple GC cycles for thorough cleanup
      global.gc();
      await new Promise((resolve) => setTimeout(resolve, 100));
      global.gc();
      await new Promise((resolve) => setTimeout(resolve, 100));
      global.gc();
    } else {
      // ✅ CRITICAL FIX: Remove memory bomb - was creating 1M objects!
      // Just wait for natural GC instead of forcing memory pressure
      logger.debug(
        "No manual GC available, relying on natural collection",
        "EmergencyCleanup",
      );
    }
  }

  private clearGlobalReferences(): void {
    // Clear global timer references
    if (typeof global !== "undefined") {
      const globalAny = global as any;

      // Clear common global references that might hold memory
      for (const key of Object.keys(globalAny)) {
        if (key.startsWith("__temp_") || key.startsWith("__cache_")) {
          delete globalAny[key];
        }
      }
    }
  }

  async forceMemoryCleanup(): Promise<void> {
    try {
      logger.warn("🚨 [EMERGENCY] Initiating force memory cleanup");

      const stats = await this.performEmergencyCleanup();

      if (stats.freed > 0) {
        logger.info(
          `✅ [EMERGENCY] Successfully freed ${stats.freed.toFixed(2)}MB`,
          "EmergencyCleanup",
        );
      } else {
        logger.warn(
          "⚠️ [EMERGENCY] No significant memory freed - may need process restart",
          "EmergencyCleanup",
        );
      }
    } catch (error) {
      logger.error("Force memory cleanup failed", "EmergencyCleanup", error);
    }
  }
}

export const emergencyCleanup = EmergencyCleanup.getInstance();
export default EmergencyCleanup;
