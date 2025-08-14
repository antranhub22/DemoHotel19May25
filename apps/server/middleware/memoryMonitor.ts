/**
 * 🔍 MEMORY LEAK MONITOR
 *
 * Monitors memory usage and alerts when thresholds are exceeded
 * Designed to prevent external memory leaks like the 119MB leak detected
 */

import { logger } from "@shared/utils/logger";

interface MemoryStats {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryHistory: MemoryStats[] = [];
  private alertThresholds = {
    rss: 150 * 1024 * 1024, // 150MB RSS threshold
    external: 80 * 1024 * 1024, // 80MB external threshold
    heap: 100 * 1024 * 1024, // 100MB heap threshold
  };
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      logger.warn("Memory monitoring already started", "MemoryMonitor");
      return;
    }

    this.isMonitoring = true;

    // Initial check
    this.checkMemoryUsage();

    // Periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    logger.info("🔍 Memory monitoring started", "MemoryMonitor", {
      interval: `${intervalMs / 1000}s`,
      thresholds: {
        rss: `${this.alertThresholds.rss / 1024 / 1024}MB`,
        external: `${this.alertThresholds.external / 1024 / 1024}MB`,
        heap: `${this.alertThresholds.heap / 1024 / 1024}MB`,
      },
    });
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    logger.info("🔍 Memory monitoring stopped", "MemoryMonitor");
  }

  /**
   * Check current memory usage and alert if needed
   */
  private checkMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    const stats: MemoryStats = {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      timestamp: Date.now(),
    };

    // Add to history
    this.memoryHistory.push(stats);

    // Keep only last 100 entries (memory cleanup)
    if (this.memoryHistory.length > 100) {
      this.memoryHistory = this.memoryHistory.slice(-50);
    }

    // Check thresholds and alert
    this.checkAlerts(stats);

    // Log memory status (debug level to avoid spam)
    logger.debug("📊 Memory status", "MemoryMonitor", {
      rss: `${(stats.rss / 1024 / 1024).toFixed(1)}MB`,
      heap: `${(stats.heapUsed / 1024 / 1024).toFixed(1)}MB`,
      external: `${(stats.external / 1024 / 1024).toFixed(1)}MB`,
      total: `${(stats.rss / 1024 / 1024).toFixed(1)}MB`,
    });
  }

  /**
   * Check if memory usage exceeds thresholds
   */
  private checkAlerts(stats: MemoryStats): void {
    const rssMB = stats.rss / 1024 / 1024;
    const externalMB = stats.external / 1024 / 1024;
    const heapMB = stats.heapUsed / 1024 / 1024;

    // RSS threshold alert
    if (stats.rss > this.alertThresholds.rss) {
      logger.warn("🚨 RSS memory threshold exceeded", "MemoryMonitor", {
        current: `${rssMB.toFixed(1)}MB`,
        threshold: `${this.alertThresholds.rss / 1024 / 1024}MB`,
        external: `${externalMB.toFixed(1)}MB`,
        heap: `${heapMB.toFixed(1)}MB`,
        action: "Consider restarting application or investigating memory leaks",
      });
    }

    // External memory threshold alert
    if (stats.external > this.alertThresholds.external) {
      logger.warn("🚨 External memory threshold exceeded", "MemoryMonitor", {
        current: `${externalMB.toFixed(1)}MB`,
        threshold: `${this.alertThresholds.external / 1024 / 1024}MB`,
        possibleCauses:
          "Native modules, database connections, file handles, crypto contexts",
        action:
          "Check for connection leaks, close file handles, cleanup native resources",
      });
    }

    // Heap threshold alert
    if (stats.heapUsed > this.alertThresholds.heap) {
      logger.warn("🚨 Heap memory threshold exceeded", "MemoryMonitor", {
        current: `${heapMB.toFixed(1)}MB`,
        threshold: `${this.alertThresholds.heap / 1024 / 1024}MB`,
        action: "Consider garbage collection or reviewing object retention",
      });
    }

    // External memory leak detection (external > heap ratio)
    const externalRatio = stats.external / stats.heapUsed;
    if (externalRatio > 1.5 && stats.external > 30 * 1024 * 1024) {
      // External > 1.5x heap and > 30MB
      logger.warn(
        "🚨 Potential external memory leak detected",
        "MemoryMonitor",
        {
          external: `${externalMB.toFixed(1)}MB`,
          heap: `${heapMB.toFixed(1)}MB`,
          ratio: `${externalRatio.toFixed(2)}x`,
          recommendation:
            "Check native modules, database connections, file operations",
        },
      );
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    current: MemoryStats;
    history: MemoryStats[];
    thresholds: typeof this.alertThresholds;
    isMonitoring: boolean;
  } {
    const current = this.memoryHistory[this.memoryHistory.length - 1] || {
      ...process.memoryUsage(),
      timestamp: Date.now(),
    };

    return {
      current,
      history: this.memoryHistory.slice(-20), // Last 20 entries
      thresholds: this.alertThresholds,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): boolean {
    if (global.gc) {
      logger.info("🗑️ Forcing garbage collection", "MemoryMonitor");
      global.gc();
      return true;
    } else {
      logger.warn(
        "Garbage collection not available (run with --expose-gc)",
        "MemoryMonitor",
      );
      return false;
    }
  }

  /**
   * Get memory trend analysis
   */
  getMemoryTrend(minutes: number = 10): {
    trend: "increasing" | "stable" | "decreasing";
    avgGrowthMB: number;
    samples: number;
  } {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentSamples = this.memoryHistory.filter(
      (s) => s.timestamp > cutoff,
    );

    if (recentSamples.length < 2) {
      return { trend: "stable", avgGrowthMB: 0, samples: 0 };
    }

    const first = recentSamples[0];
    const last = recentSamples[recentSamples.length - 1];
    const growthMB = (last.rss - first.rss) / 1024 / 1024;
    const timeMinutes = (last.timestamp - first.timestamp) / (1000 * 60);
    const avgGrowthMB = timeMinutes > 0 ? growthMB / timeMinutes : 0;

    let trend: "increasing" | "stable" | "decreasing" = "stable";
    if (avgGrowthMB > 1) trend = "increasing";
    else if (avgGrowthMB < -1) trend = "decreasing";

    return {
      trend,
      avgGrowthMB: parseFloat(avgGrowthMB.toFixed(2)),
      samples: recentSamples.length,
    };
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();

// Auto-start monitoring in production
if (process.env.NODE_ENV === "production") {
  memoryMonitor.startMonitoring(60000); // Check every minute in production
} else {
  memoryMonitor.startMonitoring(30000); // Check every 30 seconds in development
}
