/**
 * ✅ MEMORY VERIFICATION: Test memory usage before/after fixes
 * Validates that memory leak fixes are working properly
 */

import { logger } from "../../../packages/shared/utils/logger";
import { TimerManager } from "../utils/TimerManager";

interface MemorySnapshot {
  timestamp: string;
  rss: number; // MB
  heapTotal: number; // MB
  heapUsed: number; // MB
  external: number; // MB
  arrayBuffers: number; // MB
  processUptime: number; // seconds
  nodeVersion: string;
}

interface MemoryAnalysis {
  snapshots: MemorySnapshot[];
  trend: "stable" | "increasing" | "decreasing";
  averageGrowth: number; // MB per minute
  peakUsage: MemorySnapshot;
  currentUsage: MemorySnapshot;
  recommendations: string[];
}

export class MemoryVerification {
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private startTime = Date.now();

  /**
   * Start memory verification monitoring
   */
  startVerification(intervalSeconds = 30): void {
    if (this.isMonitoring) {
      logger.warn("Memory verification already running", "MemoryVerification");
      return;
    }

    this.isMonitoring = true;
    this.startTime = Date.now();
    this.snapshots = [];

    // Take initial snapshot
    this.takeSnapshot();

    logger.info("🔍 Memory verification started", "MemoryVerification", {
      interval: `${intervalSeconds}s`,
      initialMemory: this.getCurrentUsage(),
    });

    // Start periodic monitoring
    this.monitoringInterval = TimerManager.setInterval(
      () => {
        this.takeSnapshot();
      },
      intervalSeconds * 1000,
      "auto-generated-interval-62",
    );
  }

  /**
   * Stop memory verification and generate report
   */
  stopVerification(): MemoryAnalysis {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.isMonitoring = false;

    // Take final snapshot
    this.takeSnapshot();

    const analysis = this.analyzeMemoryTrend();

    logger.info("📊 Memory verification completed", "MemoryVerification", {
      duration: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
      snapshots: this.snapshots.length,
      trend: analysis.trend,
      averageGrowth: `${analysis.averageGrowth.toFixed(2)}MB/min`,
    });

    return analysis;
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();

    const snapshot: MemorySnapshot = {
      timestamp: new Date().toISOString(),
      rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
      external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
      arrayBuffers:
        Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100,
      processUptime: Math.round(process.uptime()),
      nodeVersion: process.version,
    };

    this.snapshots.push(snapshot);

    // Keep only last 100 snapshots to prevent memory issues in verification itself
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    if (this.snapshots.length > 1) {
      const previous = this.snapshots[this.snapshots.length - 2];
      const rssDiff = snapshot.rss - previous.rss;
      const timeDiff =
        (new Date(snapshot.timestamp).getTime() -
          new Date(previous.timestamp).getTime()) /
        1000;

      logger.debug("📈 Memory snapshot", "MemoryVerification", {
        rss: `${snapshot.rss}MB`,
        heap: `${snapshot.heapUsed}/${snapshot.heapTotal}MB`,
        external: `${snapshot.external}MB`,
        rssDiff: `${rssDiff > 0 ? "+" : ""}${rssDiff.toFixed(1)}MB`,
        timeDiff: `${timeDiff}s`,
      });
    }

    return snapshot;
  }

  /**
   * Get current memory usage
   */
  getCurrentUsage(): MemorySnapshot {
    const memUsage = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
      external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
      arrayBuffers:
        Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100,
      processUptime: Math.round(process.uptime()),
      nodeVersion: process.version,
    };
  }

  /**
   * Analyze memory trend from snapshots
   */
  private analyzeMemoryTrend(): MemoryAnalysis {
    if (this.snapshots.length < 2) {
      return {
        snapshots: this.snapshots,
        trend: "stable",
        averageGrowth: 0,
        peakUsage: this.snapshots[0] || this.getCurrentUsage(),
        currentUsage:
          this.snapshots[this.snapshots.length - 1] || this.getCurrentUsage(),
        recommendations: ["Need more data points for analysis"],
      };
    }

    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];

    // Calculate time difference in minutes
    const timeDiffMs =
      new Date(lastSnapshot.timestamp).getTime() -
      new Date(firstSnapshot.timestamp).getTime();
    const timeDiffMinutes = timeDiffMs / (1000 * 60);

    // Calculate RSS growth rate (primary metric for external memory leaks)
    const rssGrowth = lastSnapshot.rss - firstSnapshot.rss;
    const averageGrowth = timeDiffMinutes > 0 ? rssGrowth / timeDiffMinutes : 0;

    // Determine trend
    let trend: "stable" | "increasing" | "decreasing" = "stable";
    if (averageGrowth > 0.5) {
      // Growing more than 0.5MB/min
      trend = "increasing";
    } else if (averageGrowth < -0.5) {
      // Decreasing more than 0.5MB/min
      trend = "decreasing";
    }

    // Find peak usage
    const peakUsage = this.snapshots.reduce((peak, snapshot) => {
      return snapshot.rss > peak.rss ? snapshot : peak;
    });

    // Generate recommendations
    const recommendations: string[] = [];

    if (trend === "increasing") {
      if (averageGrowth > 2.0) {
        recommendations.push(
          "⚠️ HIGH memory growth detected (>2MB/min) - investigate immediately",
        );
      } else if (averageGrowth > 1.0) {
        recommendations.push(
          "⚠️ MEDIUM memory growth detected (>1MB/min) - monitor closely",
        );
      } else {
        recommendations.push(
          "ℹ️ LOW memory growth detected (<1MB/min) - may be normal",
        );
      }
    } else if (trend === "stable") {
      recommendations.push(
        "✅ Memory usage is stable - fixes appear effective",
      );
    } else {
      recommendations.push("✅ Memory usage decreasing - excellent results");
    }

    if (lastSnapshot.rss > 300) {
      recommendations.push(
        "⚠️ High RSS usage (>300MB) - consider process restart",
      );
    } else if (lastSnapshot.rss > 200) {
      recommendations.push("ℹ️ Moderate RSS usage (>200MB) - monitor trends");
    }

    if (lastSnapshot.external > 50) {
      recommendations.push(
        "⚠️ High external memory (>50MB) - check native modules",
      );
    }

    return {
      snapshots: this.snapshots,
      trend,
      averageGrowth,
      peakUsage,
      currentUsage: lastSnapshot,
      recommendations,
    };
  }

  /**
   * Generate detailed memory report
   */
  generateReport(): string {
    const analysis = this.analyzeMemoryTrend();
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    let report = "\n";
    report += "====================================\n";
    report += "📊 MEMORY VERIFICATION REPORT\n";
    report += "====================================\n\n";

    report += `📅 Duration: ${duration}s (${Math.round(duration / 60)}min)\n`;
    report += `📈 Snapshots: ${analysis.snapshots.length}\n`;
    report += `🎯 Trend: ${analysis.trend.toUpperCase()}\n`;
    report += `📊 Growth Rate: ${analysis.averageGrowth.toFixed(2)}MB/min\n\n`;

    report += "💾 CURRENT MEMORY USAGE:\n";
    report += `  RSS: ${analysis.currentUsage.rss}MB\n`;
    report += `  Heap: ${analysis.currentUsage.heapUsed}/${analysis.currentUsage.heapTotal}MB\n`;
    report += `  External: ${analysis.currentUsage.external}MB\n`;
    report += `  Array Buffers: ${analysis.currentUsage.arrayBuffers}MB\n\n`;

    report += "📈 PEAK USAGE:\n";
    report += `  RSS: ${analysis.peakUsage.rss}MB\n`;
    report += `  Time: ${analysis.peakUsage.timestamp}\n\n`;

    report += "💡 RECOMMENDATIONS:\n";
    analysis.recommendations.forEach((rec) => {
      report += `  ${rec}\n`;
    });

    report += "\n====================================\n";

    return report;
  }

  /**
   * Force garbage collection and take snapshot (for testing)
   */
  forceGCSnapshot(): MemorySnapshot {
    if (global.gc) {
      logger.debug("🗑️ Forcing garbage collection", "MemoryVerification");
      global.gc();
    } else {
      logger.warn(
        "GC not exposed - run with --expose-gc flag",
        "MemoryVerification",
      );
    }

    return this.takeSnapshot();
  }

  /**
   * Get verification status
   */
  getStatus(): {
    isMonitoring: boolean;
    snapshotCount: number;
    duration: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      snapshotCount: this.snapshots.length,
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}

// Export singleton instance
export const memoryVerification = new MemoryVerification();

// Export for global access in debugging
if (process.env.NODE_ENV === "development") {
  (global as any).memoryVerification = memoryVerification;
}
