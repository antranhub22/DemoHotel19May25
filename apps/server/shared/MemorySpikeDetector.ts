/**
 * 🚨 MEMORY SPIKE DETECTION & ALERTING SYSTEM
 *
 * Advanced detection system for memory spikes with alerting,
 * automatic heap dumps, and incident tracking.
 */

import { logger } from "@shared/utils/logger";
import { memoryTracker } from "@server/shared/MemoryAllocationTracker";
import * as fs from "fs";
import * as path from "path";

export interface MemorySpike {
  id: string;
  timestamp: Date;
  severity: "medium" | "high" | "critical";
  memoryIncrease: number; // bytes
  totalMemory: number; // bytes
  operation?: string;
  context?: Record<string, any>;
  heapSnapshotPath?: string;
  resolved: boolean;
  resolutionTime?: Date;
  resolutionMethod?: string;
}

export interface AlertConfig {
  mediumThresholdMB: number;
  highThresholdMB: number;
  criticalThresholdMB: number;
  consecutiveSpikesLimit: number;
  totalMemoryThresholdMB: number;
  enableHeapSnapshots: boolean;
  alertCooldownMs: number;
  maxAlerts: number;
}

class MemorySpikeDetector {
  private static instance: MemorySpikeDetector;
  private spikes: MemorySpike[] = [];
  private consecutiveSpikes = 0;
  private lastAlertTime = 0;
  private alertCount = 0;
  private isEnabled = true;

  private config: AlertConfig = {
    mediumThresholdMB: 25,
    highThresholdMB: 50,
    criticalThresholdMB: 100,
    consecutiveSpikesLimit: 3,
    totalMemoryThresholdMB: 500,
    enableHeapSnapshots: true,
    alertCooldownMs: 30000, // 30 seconds
    maxAlerts: 10, // Max alerts per hour
  };

  private alertCallbacks: Array<(spike: MemorySpike) => void> = [];

  constructor() {
    this.startMonitoring();
    this.setupPeriodicCleanup();
  }

  static getInstance(): MemorySpikeDetector {
    if (!MemorySpikeDetector.instance) {
      MemorySpikeDetector.instance = new MemorySpikeDetector();
    }
    return MemorySpikeDetector.instance;
  }

  /**
   * Configure spike detection thresholds
   */
  configure(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("🔧 Memory spike detector configured", "MemorySpikeDetector", {
      mediumThreshold: `${this.config.mediumThresholdMB}MB`,
      highThreshold: `${this.config.highThresholdMB}MB`,
      criticalThreshold: `${this.config.criticalThresholdMB}MB`,
      enableHeapSnapshots: this.config.enableHeapSnapshots,
    });
  }

  /**
   * Enable/disable spike detection
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info(
      `🚨 Memory spike detection ${enabled ? "enabled" : "disabled"}`,
      "MemorySpikeDetector",
    );
  }

  /**
   * Add alert callback for custom handling
   */
  onSpike(callback: (spike: MemorySpike) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Check for memory spike and handle appropriately
   */
  checkForSpike(
    memoryDelta: number,
    totalMemory: number,
    operation?: string,
    context?: Record<string, any>,
  ): MemorySpike | null {
    if (!this.isEnabled) {
      return null;
    }

    const memoryDeltaMB = memoryDelta / 1024 / 1024;
    const totalMemoryMB = totalMemory / 1024 / 1024;

    // Determine spike severity
    let severity: "medium" | "high" | "critical" | null = null;

    if (
      memoryDeltaMB >= this.config.criticalThresholdMB ||
      totalMemoryMB >= this.config.totalMemoryThresholdMB
    ) {
      severity = "critical";
    } else if (memoryDeltaMB >= this.config.highThresholdMB) {
      severity = "high";
    } else if (memoryDeltaMB >= this.config.mediumThresholdMB) {
      severity = "medium";
    }

    if (!severity) {
      this.consecutiveSpikes = 0; // Reset consecutive count
      return null;
    }

    // Create spike record
    const spike: MemorySpike = {
      id: `spike_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date(),
      severity,
      memoryIncrease: memoryDelta,
      totalMemory,
      operation,
      context,
      resolved: false,
    };

    this.consecutiveSpikes++;

    // Check alert conditions
    if (this.shouldAlert(spike)) {
      this.handleSpike(spike);
    }

    // Store spike
    this.spikes.push(spike);
    this.limitSpikeHistory();

    return spike;
  }

  /**
   * Determine if we should alert for this spike
   */
  private shouldAlert(spike: MemorySpike): boolean {
    const now = Date.now();

    // Check cooldown period
    if (now - this.lastAlertTime < this.config.alertCooldownMs) {
      return false;
    }

    // Check max alerts per hour
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentAlerts = this.spikes.filter(
      (s) => s.timestamp.getTime() > oneHourAgo,
    ).length;
    if (recentAlerts >= this.config.maxAlerts) {
      return false;
    }

    // Always alert for critical spikes
    if (spike.severity === "critical") {
      return true;
    }

    // Alert for high spikes
    if (spike.severity === "high") {
      return true;
    }

    // Alert for medium spikes if consecutive
    if (
      spike.severity === "medium" &&
      this.consecutiveSpikes >= this.config.consecutiveSpikesLimit
    ) {
      return true;
    }

    return false;
  }

  /**
   * Handle detected spike with appropriate response
   */
  private async handleSpike(spike: MemorySpike): Promise<void> {
    this.lastAlertTime = Date.now();
    this.alertCount++;

    // Log the spike
    this.logSpike(spike);

    // Generate heap snapshot for critical/high spikes
    if (
      (spike.severity === "critical" || spike.severity === "high") &&
      this.config.enableHeapSnapshots
    ) {
      try {
        const snapshotPath = memoryTracker.generateHeapSnapshot(
          `spike_${spike.severity}_${spike.id}`,
        );
        spike.heapSnapshotPath = snapshotPath || undefined;
      } catch (error) {
        logger.error(
          "❌ Failed to generate heap snapshot for spike",
          "MemorySpikeDetector",
          {
            spikeId: spike.id,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        );
      }
    }

    // Trigger custom callbacks
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(spike);
      } catch (error) {
        logger.error(
          "❌ Error in spike alert callback",
          "MemorySpikeDetector",
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        );
      }
    });

    // Auto-resolution attempts for critical spikes
    if (spike.severity === "critical") {
      await this.attemptAutoResolution(spike);
    }
  }

  /**
   * Log spike with appropriate level and detail
   */
  private logSpike(spike: MemorySpike): void {
    const logData = {
      spikeId: spike.id,
      severity: spike.severity,
      memoryIncrease: `${(spike.memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      totalMemory: `${(spike.totalMemory / 1024 / 1024).toFixed(2)}MB`,
      operation: spike.operation,
      consecutiveSpikes: this.consecutiveSpikes,
      context: spike.context,
      heapSnapshotPath: spike.heapSnapshotPath,
    };

    switch (spike.severity) {
      case "critical":
        logger.error(
          "🚨 CRITICAL MEMORY SPIKE DETECTED",
          "MemorySpikeDetector",
          logData,
        );
        break;
      case "high":
        logger.error(
          "⚠️ HIGH MEMORY SPIKE DETECTED",
          "MemorySpikeDetector",
          logData,
        );
        break;
      case "medium":
        logger.warn(
          "⚠️ MEDIUM MEMORY SPIKE DETECTED",
          "MemorySpikeDetector",
          logData,
        );
        break;
    }
  }

  /**
   * Attempt automatic resolution for critical spikes
   */
  private async attemptAutoResolution(spike: MemorySpike): Promise<void> {
    logger.warn(
      "🔧 Attempting auto-resolution for critical memory spike",
      "MemorySpikeDetector",
      {
        spikeId: spike.id,
      },
    );

    try {
      // Force garbage collection
      if (global.gc) {
        const beforeGC = process.memoryUsage();
        global.gc();
        const afterGC = process.memoryUsage();

        const memoryFreed = beforeGC.heapUsed - afterGC.heapUsed;

        logger.info(
          "🗑️ Forced garbage collection completed",
          "MemorySpikeDetector",
          {
            memoryFreed: `${(memoryFreed / 1024 / 1024).toFixed(2)}MB`,
            beforeGC: `${(beforeGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            afterGC: `${(afterGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          },
        );

        // Mark as resolved if significant memory was freed
        if (memoryFreed > spike.memoryIncrease * 0.5) {
          spike.resolved = true;
          spike.resolutionTime = new Date();
          spike.resolutionMethod = "garbage_collection";
        }
      }
    } catch (error) {
      logger.error("❌ Auto-resolution failed", "MemorySpikeDetector", {
        spikeId: spike.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Start continuous memory monitoring
   */
  private startMonitoring(): void {
    let lastMemoryUsage = process.memoryUsage();

    setInterval(() => {
      if (!this.isEnabled) return;

      const currentMemoryUsage = process.memoryUsage();
      const heapDelta = currentMemoryUsage.heapUsed - lastMemoryUsage.heapUsed;

      // Only check for significant increases
      if (heapDelta > 0) {
        this.checkForSpike(
          heapDelta,
          currentMemoryUsage.heapUsed,
          "periodic_monitoring",
          {
            currentHeap: `${(currentMemoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            previousHeap: `${(lastMemoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            rss: `${(currentMemoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
          },
        );
      }

      lastMemoryUsage = currentMemoryUsage;
    }, 30000); // Check every 30 seconds
  }

  /**
   * Periodic cleanup of old spike records
   */
  private setupPeriodicCleanup(): void {
    setInterval(
      () => {
        this.cleanupOldSpikes();
      },
      10 * 60 * 1000,
    ); // Cleanup every 10 minutes
  }

  /**
   * Clean up old spike records
   */
  private cleanupOldSpikes(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const before = this.spikes.length;

    this.spikes = this.spikes.filter(
      (spike) => spike.timestamp.getTime() > oneHourAgo,
    );

    const removed = before - this.spikes.length;
    if (removed > 0) {
      logger.debug("🧹 Cleaned up old memory spikes", "MemorySpikeDetector", {
        removed,
        remaining: this.spikes.length,
      });
    }
  }

  /**
   * Limit spike history to prevent memory buildup
   */
  private limitSpikeHistory(): void {
    const maxSpikes = 1000;
    if (this.spikes.length > maxSpikes) {
      this.spikes = this.spikes.slice(-maxSpikes);
    }
  }

  /**
   * Get recent spikes
   */
  getRecentSpikes(minutes: number = 60): MemorySpike[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.spikes.filter((spike) => spike.timestamp.getTime() > cutoff);
  }

  /**
   * Get spike statistics
   */
  getSpikeStatistics(): any {
    const recent = this.getRecentSpikes(60);
    const critical = recent.filter((s) => s.severity === "critical");
    const high = recent.filter((s) => s.severity === "high");
    const medium = recent.filter((s) => s.severity === "medium");

    return {
      timestamp: new Date().toISOString(),
      totalSpikesLastHour: recent.length,
      spikesBySeveurity: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
      },
      consecutiveSpikes: this.consecutiveSpikes,
      alertCount: this.alertCount,
      lastAlert: this.lastAlertTime
        ? new Date(this.lastAlertTime).toISOString()
        : null,
      isEnabled: this.isEnabled,
      configuration: this.config,
    };
  }

  /**
   * Generate spike report
   */
  generateSpikeReport(): any {
    const recent = this.getRecentSpikes(60);
    const stats = this.getSpikeStatistics();

    return {
      ...stats,
      recentSpikes: recent.map((spike) => ({
        id: spike.id,
        timestamp: spike.timestamp.toISOString(),
        severity: spike.severity,
        memoryIncrease: `${(spike.memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
        totalMemory: `${(spike.totalMemory / 1024 / 1024).toFixed(2)}MB`,
        operation: spike.operation,
        resolved: spike.resolved,
        resolutionMethod: spike.resolutionMethod,
        hasHeapSnapshot: !!spike.heapSnapshotPath,
      })),
    };
  }

  /**
   * Reset spike detection state
   */
  reset(): void {
    this.spikes = [];
    this.consecutiveSpikes = 0;
    this.lastAlertTime = 0;
    this.alertCount = 0;
    logger.info("🔄 Memory spike detector reset", "MemorySpikeDetector");
  }
}

// Export singleton instance
export const memorySpikeDetector = MemorySpikeDetector.getInstance();

// Helper function to integrate with existing memory tracking
export function integrateWithMemoryTracker(): void {
  // Hook into memory tracker to automatically check for spikes
  const originalEndOperation = memoryTracker.endOperation.bind(memoryTracker);

  (memoryTracker as any).endOperation = function (
    operationId: string,
    success: boolean,
  ) {
    const delta = originalEndOperation(operationId, success);

    if (delta && delta.heapUsedDelta > 0) {
      const currentMemory = process.memoryUsage();
      memorySpikeDetector.checkForSpike(
        delta.heapUsedDelta,
        currentMemory.heapUsed,
        delta.operation,
        delta.context,
      );
    }

    return delta;
  };

  logger.info(
    "🔗 Memory spike detector integrated with memory tracker",
    "MemorySpikeDetector",
  );
}
