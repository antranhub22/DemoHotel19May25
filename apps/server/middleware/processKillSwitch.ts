/**
 * 🔥 PROCESS KILL SWITCH - Emergency Memory Protection
 * Automatically restart process when memory usage exceeds critical thresholds
 */

import { logger } from "@shared/utils/logger";
import { TimerManager } from "../utils/TimerManager";

interface ProcessMemoryStats {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  usage: number;
}

class ProcessKillSwitch {
  private static instance: ProcessKillSwitch;
  private readonly KILL_SWITCH_THRESHOLD = 0.95; // 95% = emergency restart
  private readonly WARNING_THRESHOLD = 0.85; // 85% = warning
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private monitoringInterval: NodeJS.Timeout | null = null;
  private warningCount = 0;
  private readonly MAX_WARNINGS = 3; // After 3 warnings, force restart

  static getInstance(): ProcessKillSwitch {
    if (!this.instance) {
      this.instance = new ProcessKillSwitch();
    }
    return this.instance;
  }

  private getMemoryStats(): ProcessMemoryStats {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      usage: (usage.heapUsed / usage.heapTotal) * 100,
    };
  }

  private performEmergencyRestart(
    reason: string,
    stats: ProcessMemoryStats,
  ): void {
    logger.error("🚨 EMERGENCY RESTART TRIGGERED", "ProcessKillSwitch", {
      reason,
      memoryUsage: `${stats.usage.toFixed(2)}%`,
      heapUsed: `${stats.heapUsed}MB`,
      heapTotal: `${stats.heapTotal}MB`,
      rss: `${stats.rss}MB`,
    });

    console.error("🔥 EMERGENCY RESTART: Memory usage too high");
    console.error(`📊 Memory Usage: ${stats.usage.toFixed(2)}%`);
    console.error(`🧠 Heap Used: ${stats.heapUsed}MB / ${stats.heapTotal}MB`);
    console.error(`💾 RSS: ${stats.rss}MB`);
    console.error(`⏰ Restarting in 5 seconds...`);

    // ✅ GRACEFUL: Give time for cleanup and logging
    TimerManager.setTimeout(() => {
      console.error("🔥 KILL SWITCH ACTIVATED - Process exiting...");
      process.exit(1); // Let process manager (PM2, Docker, Render) restart
    }, 5000);
  }

  private checkMemoryUsage(): void {
    try {
      const stats = this.getMemoryStats();

      // 🚨 CRITICAL: Immediate restart
      if (stats.usage > this.KILL_SWITCH_THRESHOLD * 100) {
        this.performEmergencyRestart(
          `Memory usage exceeded kill switch threshold (${this.KILL_SWITCH_THRESHOLD * 100}%)`,
          stats,
        );
        return;
      }

      // ⚠️ WARNING: Count warnings
      if (stats.usage > this.WARNING_THRESHOLD * 100) {
        this.warningCount++;

        logger.warn("⚠️ HIGH MEMORY WARNING", "ProcessKillSwitch", {
          usage: `${stats.usage.toFixed(2)}%`,
          warningCount: this.warningCount,
          maxWarnings: this.MAX_WARNINGS,
          heapUsed: `${stats.heapUsed}MB`,
        });

        // After multiple warnings, force restart
        if (this.warningCount >= this.MAX_WARNINGS) {
          this.performEmergencyRestart(
            `Too many high memory warnings (${this.warningCount}/${this.MAX_WARNINGS})`,
            stats,
          );
          return;
        }
      } else {
        // Reset warning count when memory is back to normal
        if (this.warningCount > 0) {
          logger.info("✅ Memory usage normalized", "ProcessKillSwitch", {
            usage: `${stats.usage.toFixed(2)}%`,
            warningCountReset: this.warningCount,
          });
          this.warningCount = 0;
        }
      }

      // ℹ️ DEBUG: Log memory stats periodically
      if (Math.random() < 0.1) {
        // 10% chance to log (reduce spam)
        logger.debug("📊 Memory Monitor", "ProcessKillSwitch", {
          usage: `${stats.usage.toFixed(2)}%`,
          heapUsed: `${stats.heapUsed}MB`,
          rss: `${stats.rss}MB`,
        });
      }
    } catch (error) {
      logger.error("Failed to check memory usage", "ProcessKillSwitch", error);
    }
  }

  startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.warn(
        "Process kill switch already monitoring",
        "ProcessKillSwitch",
      );
      return;
    }

    logger.info(
      "🔥 Starting process kill switch monitoring",
      "ProcessKillSwitch",
      {
        killThreshold: `${this.KILL_SWITCH_THRESHOLD * 100}%`,
        warningThreshold: `${this.WARNING_THRESHOLD * 100}%`,
        checkInterval: `${this.CHECK_INTERVAL / 1000}s`,
        maxWarnings: this.MAX_WARNINGS,
      },
    );

    this.monitoringInterval = TimerManager.setInterval(
      () => {
        this.checkMemoryUsage();
      },
      this.CHECK_INTERVAL,
      "auto-generated-interval-5",
    );

    // ✅ IMMEDIATE: Check memory on startup
    this.checkMemoryUsage();
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info(
        "🛑 Process kill switch monitoring stopped",
        "ProcessKillSwitch",
      );
    }
  }

  // ✅ MANUAL: Force check (for testing)
  forceCheck(): ProcessMemoryStats {
    const stats = this.getMemoryStats();
    logger.info("🔍 Manual memory check", "ProcessKillSwitch", {
      usage: `${stats.usage.toFixed(2)}%`,
      heapUsed: `${stats.heapUsed}MB`,
      heapTotal: `${stats.heapTotal}MB`,
      rss: `${stats.rss}MB`,
      killThreshold: `${this.KILL_SWITCH_THRESHOLD * 100}%`,
      warningThreshold: `${this.WARNING_THRESHOLD * 100}%`,
    });
    return stats;
  }
}

// ✅ AUTO-START: Start monitoring immediately
const processKillSwitch = ProcessKillSwitch.getInstance();
processKillSwitch.startMonitoring();

// ✅ GRACEFUL SHUTDOWN: Stop monitoring on process exit
process.on("SIGTERM", () => {
  processKillSwitch.stopMonitoring();
});

process.on("SIGINT", () => {
  processKillSwitch.stopMonitoring();
});

export { ProcessKillSwitch };
export default processKillSwitch;
