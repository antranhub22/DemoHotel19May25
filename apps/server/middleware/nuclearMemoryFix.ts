/**
 * 🚨 NUCLEAR MEMORY FIX - ULTIMATE SOLUTION
 *
 * PROBLEM: Previous RADICAL fix didn't work - still 94.7% memory usage!
 *
 * NEW ROOT CAUSES DISCOVERED:
 * 1. ❌ ProcessKillSwitch threshold too high (95% vs current 94.7%)
 * 2. ❌ Multiple unbounded collections still accumulating
 * 3. ❌ ConnectionPoolManager memory leaks
 * 4. ❌ ServiceContainer not cleaning up properly
 * 5. ❌ PerformanceAuditor accumulating data
 */

import { logger } from "@shared/utils/logger";

interface NuclearMemoryStats {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  usage: number;
  actualUsage: number; // RSS-based calculation
}

class NuclearMemoryManager {
  private static instance: NuclearMemoryManager;

  // 🚨 NUCLEAR: Much more aggressive thresholds
  private readonly KILL_SWITCH_THRESHOLD = 0.85; // 85% vs 95% (10% lower!)
  private readonly CRITICAL_THRESHOLD = 0.7; // 70% vs 65%
  private readonly WARNING_THRESHOLD = 0.6; // 60% vs 50%
  private readonly CHECK_INTERVAL = 15000; // 15s vs 30s (faster response)

  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastForceRestart = 0;
  private consecutiveHighMemory = 0;
  private readonly MAX_CONSECUTIVE_HIGH = 5; // Force restart after 5 consecutive high readings

  static getInstance(): NuclearMemoryManager {
    if (!this.instance) {
      this.instance = new NuclearMemoryManager();
    }
    return this.instance;
  }

  private getDetailedMemoryStats(): NuclearMemoryStats {
    const usage = process.memoryUsage();

    // 🔥 DUAL CALCULATION: Both heap and RSS-based
    const heapUsage = (usage.heapUsed / usage.heapTotal) * 100;

    // RSS-based calculation (more accurate for actual memory pressure)
    const rssUsage = (usage.rss / (1024 * 1024 * 1024)) * 100; // Assume 1GB limit

    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      usage: heapUsage,
      actualUsage: Math.max(heapUsage, rssUsage), // Use the higher of the two
    };
  }

  private async performNuclearCleanup(): Promise<void> {
    logger.error("🚨 NUCLEAR CLEANUP INITIATED", "NuclearMemoryManager");

    try {
      // 1. 🔥 FORCE MULTIPLE GC CYCLES
      if (global.gc) {
        for (let i = 0; i < 5; i++) {
          global.gc();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // 2. 🔥 CLEAR ALL GLOBAL CACHES AND COLLECTIONS
      await this.clearAllGlobalObjects();

      // 3. 🔥 FORCE CONNECTION POOL CLEANUP
      await this.forceConnectionPoolCleanup();

      // 4. 🔥 CLEAR SERVICE CONTAINER
      await this.clearServiceContainer();

      // 5. 🔥 CLEAR PERFORMANCE AUDITOR
      await this.clearPerformanceAuditor();

      // 6. 🔥 CLEAR ALL TIMERS AND INTERVALS
      this.clearAllTimersAndIntervals();

      logger.error("✅ NUCLEAR CLEANUP COMPLETED", "NuclearMemoryManager");
    } catch (error) {
      logger.error("❌ NUCLEAR CLEANUP FAILED", "NuclearMemoryManager", error);
    }
  }

  private async clearAllGlobalObjects(): Promise<void> {
    try {
      // Clear global objects that might be accumulating
      if (global.gc) global.gc();

      // Clear any global arrays/maps/sets
      const globalObj = global as any;
      for (const key in globalObj) {
        if (
          key.startsWith("__") ||
          key.includes("cache") ||
          key.includes("pool")
        ) {
          try {
            if (Array.isArray(globalObj[key])) {
              globalObj[key].length = 0;
            } else if (globalObj[key] instanceof Map) {
              globalObj[key].clear();
            } else if (globalObj[key] instanceof Set) {
              globalObj[key].clear();
            }
          } catch (e) {
            // Ignore errors for protected properties
          }
        }
      }
    } catch (error) {
      logger.error(
        "Failed to clear global objects",
        "NuclearMemoryManager",
        error,
      );
    }
  }

  private async forceConnectionPoolCleanup(): Promise<void> {
    try {
      // Force cleanup of ConnectionPoolManager
      const { ConnectionPoolManager } = await import(
        "@server/shared/ConnectionPoolManager"
      );
      const poolManager = ConnectionPoolManager.getInstance();

      // Access private properties via reflection to force cleanup
      const poolManagerAny = poolManager as any;

      if (poolManagerAny.metrics) poolManagerAny.metrics.length = 0;
      if (poolManagerAny.alerts) poolManagerAny.alerts.length = 0;
      if (poolManagerAny.connectionLeaks)
        poolManagerAny.connectionLeaks.length = 0;
      if (poolManagerAny.autoScalingEvents)
        poolManagerAny.autoScalingEvents.length = 0;
      if (poolManagerAny.queryCache) poolManagerAny.queryCache.clear();
      if (poolManagerAny.connections) poolManagerAny.connections.clear();

      logger.info(
        "🔥 Forced ConnectionPoolManager cleanup",
        "NuclearMemoryManager",
      );
    } catch (error) {
      logger.warn(
        "Failed to cleanup ConnectionPoolManager",
        "NuclearMemoryManager",
        error,
      );
    }
  }

  private async clearServiceContainer(): Promise<void> {
    try {
      const { ServiceContainer } = await import(
        "@server/shared/ServiceContainer"
      );
      await ServiceContainer.destroyAll();

      // Force clear static maps
      const serviceContainerAny = ServiceContainer as any;
      if (serviceContainerAny.services) serviceContainerAny.services.clear();
      if (serviceContainerAny.instances) serviceContainerAny.instances.clear();

      logger.info("🔥 Forced ServiceContainer cleanup", "NuclearMemoryManager");
    } catch (error) {
      logger.warn(
        "Failed to cleanup ServiceContainer",
        "NuclearMemoryManager",
        error,
      );
    }
  }

  private async clearPerformanceAuditor(): Promise<void> {
    try {
      // Clear PerformanceAuditor data
      const fs = await import("fs/promises");
      const path = await import("path");

      // Clear any performance audit files
      const auditDir = path.join(process.cwd(), "performance-audits");
      try {
        const files = await fs.readdir(auditDir);
        for (const file of files) {
          await fs.unlink(path.join(auditDir, file));
        }
      } catch (e) {
        // Directory might not exist
      }

      logger.info(
        "🔥 Forced PerformanceAuditor cleanup",
        "NuclearMemoryManager",
      );
    } catch (error) {
      logger.warn(
        "Failed to cleanup PerformanceAuditor",
        "NuclearMemoryManager",
        error,
      );
    }
  }

  private clearAllTimersAndIntervals(): void {
    try {
      // Get all active timers and intervals
      const activeHandles = (process as any)._getActiveHandles();
      const activeRequests = (process as any)._getActiveRequests();

      logger.info("🔥 Clearing timers and intervals", "NuclearMemoryManager", {
        activeHandles: activeHandles.length,
        activeRequests: activeRequests.length,
      });

      // Force clear timers (aggressive approach)
      for (let i = 1; i < 10000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    } catch (error) {
      logger.warn("Failed to clear timers", "NuclearMemoryManager", error);
    }
  }

  private performNuclearRestart(
    reason: string,
    stats: NuclearMemoryStats,
  ): void {
    const now = Date.now();

    // Prevent restart loops (minimum 30 seconds between restarts)
    if (now - this.lastForceRestart < 30000) {
      logger.warn(
        "🚨 RESTART COOLDOWN - Skipping restart",
        "NuclearMemoryManager",
        {
          timeSinceLastRestart: `${(now - this.lastForceRestart) / 1000}s`,
        },
      );
      return;
    }

    this.lastForceRestart = now;

    logger.error("🚨 NUCLEAR RESTART TRIGGERED", "NuclearMemoryManager", {
      reason,
      memoryUsage: `${stats.usage.toFixed(2)}%`,
      actualUsage: `${stats.actualUsage.toFixed(2)}%`,
      heapUsed: `${stats.heapUsed}MB`,
      heapTotal: `${stats.heapTotal}MB`,
      rss: `${stats.rss}MB`,
      consecutiveHighMemory: this.consecutiveHighMemory,
    });

    console.error("🚨 NUCLEAR RESTART: Critical memory usage detected!");
    console.error(
      `📊 Memory Usage: ${stats.usage.toFixed(2)}% (Actual: ${stats.actualUsage.toFixed(2)}%)`,
    );
    console.error(`🧠 Heap: ${stats.heapUsed}MB / ${stats.heapTotal}MB`);
    console.error(`💾 RSS: ${stats.rss}MB`);
    console.error(`⚡ Consecutive High Memory: ${this.consecutiveHighMemory}`);
    console.error(`⏰ Nuclear restart in 3 seconds...`);

    // ✅ IMMEDIATE CLEANUP before restart
    this.performNuclearCleanup().finally(() => {
      setTimeout(() => {
        console.error("🚨 NUCLEAR KILL SWITCH ACTIVATED - Process exiting...");
        process.exit(1); // Force immediate restart
      }, 3000);
    });
  }

  private checkMemoryUsage(): void {
    try {
      const stats = this.getDetailedMemoryStats();
      const criticalUsage = Math.max(stats.usage, stats.actualUsage);

      // 🚨 IMMEDIATE RESTART: 85% threshold (vs 95% before)
      if (criticalUsage > this.KILL_SWITCH_THRESHOLD * 100) {
        this.performNuclearRestart(
          `Memory usage exceeded nuclear kill switch (${this.KILL_SWITCH_THRESHOLD * 100}%)`,
          stats,
        );
        return;
      }

      // 🔥 CRITICAL: Perform nuclear cleanup
      if (criticalUsage > this.CRITICAL_THRESHOLD * 100) {
        this.consecutiveHighMemory++;

        logger.error(
          "🔥 CRITICAL MEMORY - Nuclear cleanup",
          "NuclearMemoryManager",
          {
            usage: `${stats.usage.toFixed(2)}%`,
            actualUsage: `${stats.actualUsage.toFixed(2)}%`,
            consecutiveHigh: this.consecutiveHighMemory,
            maxConsecutive: this.MAX_CONSECUTIVE_HIGH,
          },
        );

        // Force restart after too many consecutive high readings
        if (this.consecutiveHighMemory >= this.MAX_CONSECUTIVE_HIGH) {
          this.performNuclearRestart(
            `Too many consecutive high memory readings (${this.consecutiveHighMemory}/${this.MAX_CONSECUTIVE_HIGH})`,
            stats,
          );
          return;
        }

        // Perform immediate nuclear cleanup
        this.performNuclearCleanup();
      } else if (criticalUsage > this.WARNING_THRESHOLD * 100) {
        logger.warn(
          "⚠️ HIGH MEMORY - Preventive action",
          "NuclearMemoryManager",
          {
            usage: `${stats.usage.toFixed(2)}%`,
            actualUsage: `${stats.actualUsage.toFixed(2)}%`,
          },
        );

        // Light cleanup
        if (global.gc) global.gc();
      } else {
        // Reset consecutive counter when memory is normal
        if (this.consecutiveHighMemory > 0) {
          logger.info(
            "✅ Memory normalized - Reset counters",
            "NuclearMemoryManager",
            {
              usage: `${stats.usage.toFixed(2)}%`,
              consecutiveResetCount: this.consecutiveHighMemory,
            },
          );
          this.consecutiveHighMemory = 0;
        }
      }
    } catch (error) {
      logger.error(
        "Failed to check memory usage",
        "NuclearMemoryManager",
        error,
      );
    }
  }

  startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.warn(
        "Nuclear memory manager already monitoring",
        "NuclearMemoryManager",
      );
      return;
    }

    logger.error(
      "🚨 STARTING NUCLEAR MEMORY MONITORING",
      "NuclearMemoryManager",
      {
        killThreshold: `${this.KILL_SWITCH_THRESHOLD * 100}%`,
        criticalThreshold: `${this.CRITICAL_THRESHOLD * 100}%`,
        warningThreshold: `${this.WARNING_THRESHOLD * 100}%`,
        checkInterval: `${this.CHECK_INTERVAL / 1000}s`,
        maxConsecutiveHigh: this.MAX_CONSECUTIVE_HIGH,
      },
    );

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.CHECK_INTERVAL);

    // ✅ IMMEDIATE: Check memory on startup
    this.checkMemoryUsage();
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info(
        "🛑 Nuclear memory monitoring stopped",
        "NuclearMemoryManager",
      );
    }
  }
}

// ✅ AUTO-START: Start nuclear monitoring immediately
const nuclearMemoryManager = NuclearMemoryManager.getInstance();
nuclearMemoryManager.startMonitoring();

// ✅ REPLACE OLD KILL SWITCH: Stop old one and use nuclear version
async function replaceOldKillSwitch() {
  try {
    const { default: processKillSwitch } = await import("./processKillSwitch");
    processKillSwitch.stopMonitoring();
    logger.info(
      "🔄 Replaced ProcessKillSwitch with NuclearMemoryManager",
      "NuclearMemoryManager",
    );
  } catch (error) {
    logger.warn(
      "Could not stop old ProcessKillSwitch",
      "NuclearMemoryManager",
      error,
    );
  }
}

// Execute replacement
replaceOldKillSwitch();

export { NuclearMemoryManager };
export default nuclearMemoryManager;
