/**
 * 🧠 HEAP SNAPSHOT ANALYZER & LEAK DETECTOR
 *
 * Analyzes heap snapshots to detect memory leaks by comparing
 * snapshots over time and identifying growing object counts.
 */

import { logger } from "@shared/utils/logger";
import * as fs from "fs";
import * as path from "path";
import * as v8 from "v8";

export interface HeapSnapshotInfo {
  id: string;
  timestamp: Date;
  filepath: string;
  reason: string;
  fileSize: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

export interface HeapComparison {
  snapshot1: HeapSnapshotInfo;
  snapshot2: HeapSnapshotInfo;
  timeDifference: number;
  memoryGrowth: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  suspectedLeaks: SuspectedLeak[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface SuspectedLeak {
  objectType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  growthRate: number; // MB per hour
  recommendation: string;
}

class HeapAnalyzer {
  private static instance: HeapAnalyzer;
  private snapshots: HeapSnapshotInfo[] = [];
  private snapshotDir: string;
  private maxSnapshots = 20; // Keep last 20 snapshots
  private isEnabled = true;

  // Memory growth thresholds for leak detection
  private leakThresholds = {
    lowMBPerHour: 5, // 5MB/hour
    mediumMBPerHour: 15, // 15MB/hour
    highMBPerHour: 50, // 50MB/hour
    criticalMBPerHour: 100, // 100MB/hour
  };

  constructor() {
    this.snapshotDir = path.join(process.cwd(), "heap-snapshots");
    this.ensureSnapshotDir();
    this.loadExistingSnapshots();
    this.setupPeriodicAnalysis();
  }

  static getInstance(): HeapAnalyzer {
    if (!HeapAnalyzer.instance) {
      HeapAnalyzer.instance = new HeapAnalyzer();
    }
    return HeapAnalyzer.instance;
  }

  /**
   * Enable/disable heap analysis
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info(
      `🧠 Heap analysis ${enabled ? "enabled" : "disabled"}`,
      "HeapAnalyzer",
    );
  }

  /**
   * Configure leak detection thresholds
   */
  configureThresholds(thresholds: Partial<typeof this.leakThresholds>): void {
    this.leakThresholds = { ...this.leakThresholds, ...thresholds };
    logger.info("🔧 Heap analysis thresholds configured", "HeapAnalyzer", {
      lowThreshold: `${this.leakThresholds.lowMBPerHour}MB/hour`,
      mediumThreshold: `${this.leakThresholds.mediumMBPerHour}MB/hour`,
      highThreshold: `${this.leakThresholds.highMBPerHour}MB/hour`,
      criticalThreshold: `${this.leakThresholds.criticalMBPerHour}MB/hour`,
    });
  }

  /**
   * Take a heap snapshot and add to analysis queue
   */
  async takeSnapshot(
    reason: string = "manual",
  ): Promise<HeapSnapshotInfo | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const timestamp = new Date();
      const id = `heap_${reason}_${timestamp.getTime()}`;
      const filename = `${id}.heapsnapshot`;
      const filepath = path.join(this.snapshotDir, filename);

      // Capture current memory usage
      const memoryUsage = process.memoryUsage();

      // Generate heap snapshot
      v8.writeHeapSnapshot(filepath);

      // Get file size
      const stats = fs.statSync(filepath);

      const snapshotInfo: HeapSnapshotInfo = {
        id,
        timestamp,
        filepath,
        reason,
        fileSize: stats.size,
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
      };

      // Add to snapshots list
      this.snapshots.push(snapshotInfo);
      this.limitSnapshots();

      logger.info("📸 Heap snapshot created", "HeapAnalyzer", {
        id,
        reason,
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        totalSnapshots: this.snapshots.length,
      });

      // Analyze if we have enough snapshots
      if (this.snapshots.length >= 2) {
        await this.analyzeRecentSnapshots();
      }

      return snapshotInfo;
    } catch (error) {
      logger.error("❌ Failed to create heap snapshot", "HeapAnalyzer", {
        reason,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Compare two heap snapshots for leak detection
   */
  async compareSnapshots(
    snapshot1: HeapSnapshotInfo,
    snapshot2: HeapSnapshotInfo,
  ): Promise<HeapComparison> {
    const timeDiffMs =
      snapshot2.timestamp.getTime() - snapshot1.timestamp.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

    const memoryGrowth = {
      heapUsed: snapshot2.memoryUsage.heapUsed - snapshot1.memoryUsage.heapUsed,
      heapTotal:
        snapshot2.memoryUsage.heapTotal - snapshot1.memoryUsage.heapTotal,
      external: snapshot2.memoryUsage.external - snapshot1.memoryUsage.external,
      rss: snapshot2.memoryUsage.rss - snapshot1.memoryUsage.rss,
    };

    const suspectedLeaks = this.detectSuspectedLeaks(
      memoryGrowth,
      timeDiffHours,
    );
    const riskLevel = this.calculateRiskLevel(memoryGrowth, timeDiffHours);

    const comparison: HeapComparison = {
      snapshot1,
      snapshot2,
      timeDifference: timeDiffMs,
      memoryGrowth,
      suspectedLeaks,
      riskLevel,
    };

    logger.info("🔍 Heap snapshots compared", "HeapAnalyzer", {
      timeDifference: `${(timeDiffMs / 1000 / 60).toFixed(1)} minutes`,
      heapGrowth: `${(memoryGrowth.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      rssGrowth: `${(memoryGrowth.rss / 1024 / 1024).toFixed(2)}MB`,
      riskLevel,
      suspectedLeaksCount: suspectedLeaks.length,
    });

    return comparison;
  }

  /**
   * Detect suspected memory leaks based on growth patterns
   */
  private detectSuspectedLeaks(
    memoryGrowth: any,
    timeDiffHours: number,
  ): SuspectedLeak[] {
    const leaks: SuspectedLeak[] = [];

    if (timeDiffHours <= 0) return leaks;

    // Calculate growth rates per hour
    const heapGrowthMBPerHour =
      memoryGrowth.heapUsed / 1024 / 1024 / timeDiffHours;
    const externalGrowthMBPerHour =
      memoryGrowth.external / 1024 / 1024 / timeDiffHours;
    const rssGrowthMBPerHour = memoryGrowth.rss / 1024 / 1024 / timeDiffHours;

    // Check heap memory growth
    if (heapGrowthMBPerHour > this.leakThresholds.lowMBPerHour) {
      leaks.push({
        objectType: "JavaScript Objects",
        description: `Heap memory growing at ${heapGrowthMBPerHour.toFixed(1)}MB/hour`,
        severity: this.getSeverityForGrowthRate(heapGrowthMBPerHour),
        growthRate: heapGrowthMBPerHour,
        recommendation:
          "Check for unclosed event listeners, circular references, or large object accumulations",
      });
    }

    // Check external memory growth (buffers, etc.)
    if (externalGrowthMBPerHour > this.leakThresholds.lowMBPerHour) {
      leaks.push({
        objectType: "External Memory (Buffers)",
        description: `External memory growing at ${externalGrowthMBPerHour.toFixed(1)}MB/hour`,
        severity: this.getSeverityForGrowthRate(externalGrowthMBPerHour),
        growthRate: externalGrowthMBPerHour,
        recommendation:
          "Check for Buffer leaks, unclosed streams, or external resource management",
      });
    }

    // Check RSS growth (total process memory)
    if (rssGrowthMBPerHour > this.leakThresholds.mediumMBPerHour) {
      leaks.push({
        objectType: "Process Memory (RSS)",
        description: `Process memory growing at ${rssGrowthMBPerHour.toFixed(1)}MB/hour`,
        severity: this.getSeverityForGrowthRate(rssGrowthMBPerHour),
        growthRate: rssGrowthMBPerHour,
        recommendation:
          "Check for native module leaks, child processes, or system resource leaks",
      });
    }

    // Detect specific patterns
    this.detectSpecificLeakPatterns(memoryGrowth, timeDiffHours, leaks);

    return leaks;
  }

  /**
   * Detect specific leak patterns
   */
  private detectSpecificLeakPatterns(
    memoryGrowth: any,
    timeDiffHours: number,
    leaks: SuspectedLeak[],
  ): void {
    const heapGrowthMB = memoryGrowth.heapUsed / 1024 / 1024;
    const externalGrowthMB = memoryGrowth.external / 1024 / 1024;

    // Pattern: High external growth vs heap growth (Buffer/Stream leaks)
    if (externalGrowthMB > heapGrowthMB * 2 && externalGrowthMB > 10) {
      leaks.push({
        objectType: "Stream/Buffer Objects",
        description: "External memory growing much faster than heap memory",
        severity: "high",
        growthRate: externalGrowthMB / timeDiffHours,
        recommendation:
          "Check for unclosed streams, large buffers not being released, or file handle leaks",
      });
    }

    // Pattern: Consistent linear growth (classic memory leak)
    if (heapGrowthMB > 0 && timeDiffHours > 1) {
      const growthRate = heapGrowthMB / timeDiffHours;
      if (growthRate > 5 && growthRate < 100) {
        // Steady leak pattern
        leaks.push({
          objectType: "Steady Leak Pattern",
          description: "Consistent linear memory growth detected",
          severity: growthRate > 20 ? "high" : "medium",
          growthRate,
          recommendation:
            "Check for event listeners, timers, or cached objects not being cleaned up",
        });
      }
    }
  }

  /**
   * Get severity level for growth rate
   */
  private getSeverityForGrowthRate(
    growthRateMBPerHour: number,
  ): "low" | "medium" | "high" | "critical" {
    if (growthRateMBPerHour >= this.leakThresholds.criticalMBPerHour)
      return "critical";
    if (growthRateMBPerHour >= this.leakThresholds.highMBPerHour) return "high";
    if (growthRateMBPerHour >= this.leakThresholds.mediumMBPerHour)
      return "medium";
    return "low";
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(
    memoryGrowth: any,
    timeDiffHours: number,
  ): "low" | "medium" | "high" | "critical" {
    if (timeDiffHours <= 0) return "low";

    const heapGrowthMBPerHour =
      memoryGrowth.heapUsed / 1024 / 1024 / timeDiffHours;
    const totalGrowthMBPerHour = memoryGrowth.rss / 1024 / 1024 / timeDiffHours;

    if (
      heapGrowthMBPerHour >= this.leakThresholds.criticalMBPerHour ||
      totalGrowthMBPerHour >= this.leakThresholds.criticalMBPerHour
    ) {
      return "critical";
    }

    if (
      heapGrowthMBPerHour >= this.leakThresholds.highMBPerHour ||
      totalGrowthMBPerHour >= this.leakThresholds.highMBPerHour
    ) {
      return "high";
    }

    if (
      heapGrowthMBPerHour >= this.leakThresholds.mediumMBPerHour ||
      totalGrowthMBPerHour >= this.leakThresholds.mediumMBPerHour
    ) {
      return "medium";
    }

    return "low";
  }

  /**
   * Analyze recent snapshots for trends
   */
  private async analyzeRecentSnapshots(): Promise<void> {
    if (this.snapshots.length < 2) return;

    const latest = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];

    const comparison = await this.compareSnapshots(previous, latest);

    // Log if significant issues found
    if (
      comparison.riskLevel === "critical" ||
      comparison.riskLevel === "high"
    ) {
      logger.error("🚨 HIGH RISK memory leak detected", "HeapAnalyzer", {
        riskLevel: comparison.riskLevel,
        timeDifference: `${(comparison.timeDifference / 1000 / 60).toFixed(1)} minutes`,
        heapGrowth: `${(comparison.memoryGrowth.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        suspectedLeaks: comparison.suspectedLeaks.map((leak) => ({
          type: leak.objectType,
          severity: leak.severity,
          growthRate: `${leak.growthRate.toFixed(1)}MB/hour`,
        })),
      });
    } else if (comparison.suspectedLeaks.length > 0) {
      logger.warn("⚠️ Potential memory leaks detected", "HeapAnalyzer", {
        riskLevel: comparison.riskLevel,
        leaksFound: comparison.suspectedLeaks.length,
      });
    }
  }

  /**
   * Setup periodic heap analysis
   */
  private setupPeriodicAnalysis(): void {
    // Take snapshot every 30 minutes in production
    if (process.env.NODE_ENV === "production") {
      setInterval(
        () => {
          this.takeSnapshot("periodic_production");
        },
        30 * 60 * 1000,
      );
    }

    // Take snapshot every 10 minutes in development
    if (process.env.NODE_ENV === "development") {
      setInterval(
        () => {
          this.takeSnapshot("periodic_development");
        },
        10 * 60 * 1000,
      );
    }
  }

  /**
   * Load existing snapshots from disk
   */
  private loadExistingSnapshots(): void {
    try {
      if (!fs.existsSync(this.snapshotDir)) return;

      const files = fs
        .readdirSync(this.snapshotDir)
        .filter((file) => file.endsWith(".heapsnapshot"))
        .map((file) => {
          const filepath = path.join(this.snapshotDir, file);
          const stats = fs.statSync(filepath);

          // Parse snapshot info from filename
          const parts = file.replace(".heapsnapshot", "").split("_");
          const timestamp = new Date(parseInt(parts[parts.length - 1]));
          const reason = parts.slice(1, -1).join("_");

          return {
            id: file.replace(".heapsnapshot", ""),
            timestamp,
            filepath,
            reason,
            fileSize: stats.size,
            memoryUsage: {
              heapUsed: 0,
              heapTotal: 0,
              external: 0,
              rss: 0,
            },
          };
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      this.snapshots = files.slice(-this.maxSnapshots);

      logger.info("📂 Loaded existing heap snapshots", "HeapAnalyzer", {
        snapshotsFound: files.length,
        snapshotsLoaded: this.snapshots.length,
      });
    } catch (error) {
      logger.warn("⚠️ Could not load existing snapshots", "HeapAnalyzer", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Ensure snapshot directory exists
   */
  private ensureSnapshotDir(): void {
    try {
      if (!fs.existsSync(this.snapshotDir)) {
        fs.mkdirSync(this.snapshotDir, { recursive: true });
      }
    } catch (error) {
      logger.error("❌ Could not create snapshot directory", "HeapAnalyzer", {
        directory: this.snapshotDir,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Limit number of snapshots kept
   */
  private limitSnapshots(): void {
    while (this.snapshots.length > this.maxSnapshots) {
      const removed = this.snapshots.shift();

      // Delete old snapshot file
      if (removed && fs.existsSync(removed.filepath)) {
        try {
          fs.unlinkSync(removed.filepath);
        } catch (error) {
          logger.warn("⚠️ Could not delete old snapshot file", "HeapAnalyzer", {
            filepath: removed.filepath,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }
  }

  /**
   * Get heap analysis report
   */
  generateHeapReport(): any {
    const recentComparisons = [];

    // Generate comparisons for recent snapshots
    for (let i = 1; i < Math.min(this.snapshots.length, 5); i++) {
      const snapshot1 = this.snapshots[this.snapshots.length - i - 1];
      const snapshot2 = this.snapshots[this.snapshots.length - i];

      // Calculate basic comparison without async
      const timeDiff =
        snapshot2.timestamp.getTime() - snapshot1.timestamp.getTime();
      const heapGrowth =
        snapshot2.memoryUsage.heapUsed - snapshot1.memoryUsage.heapUsed;

      recentComparisons.push({
        timespan: `${(timeDiff / 1000 / 60).toFixed(1)} minutes`,
        heapGrowth: `${(heapGrowth / 1024 / 1024).toFixed(2)}MB`,
        timestamp: snapshot2.timestamp.toISOString(),
      });
    }

    return {
      timestamp: new Date().toISOString(),
      isEnabled: this.isEnabled,
      totalSnapshots: this.snapshots.length,
      snapshotDirectory: this.snapshotDir,

      recentSnapshots: this.snapshots.slice(-5).map((snapshot) => ({
        id: snapshot.id,
        timestamp: snapshot.timestamp.toISOString(),
        reason: snapshot.reason,
        fileSize: `${(snapshot.fileSize / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(snapshot.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      })),

      recentComparisons,

      thresholds: {
        low: `${this.leakThresholds.lowMBPerHour}MB/hour`,
        medium: `${this.leakThresholds.mediumMBPerHour}MB/hour`,
        high: `${this.leakThresholds.highMBPerHour}MB/hour`,
        critical: `${this.leakThresholds.criticalMBPerHour}MB/hour`,
      },
    };
  }

  /**
   * Clear heap analysis data
   */
  clearAnalysisData(): void {
    // Delete all snapshot files
    this.snapshots.forEach((snapshot) => {
      if (fs.existsSync(snapshot.filepath)) {
        try {
          fs.unlinkSync(snapshot.filepath);
        } catch (error) {
          logger.warn("⚠️ Could not delete snapshot file", "HeapAnalyzer", {
            filepath: snapshot.filepath,
          });
        }
      }
    });

    this.snapshots = [];
    logger.info("🧹 Heap analysis data cleared", "HeapAnalyzer");
  }

  /**
   * Get snapshots list
   */
  getSnapshots(): HeapSnapshotInfo[] {
    return [...this.snapshots];
  }
}

// Export singleton instance
export const heapAnalyzer = HeapAnalyzer.getInstance();

// Helper function to trigger heap snapshot
export async function captureHeapSnapshot(
  reason: string = "manual",
): Promise<HeapSnapshotInfo | null> {
  return heapAnalyzer.takeSnapshot(reason);
}
