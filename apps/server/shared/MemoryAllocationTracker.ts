/**
 * 🔍 DETAILED MEMORY ALLOCATION TRACKER
 *
 * Tracks memory usage before/after major operations to identify
 * exactly which code sections are consuming the most memory.
 */

import { logger } from "@shared/utils/logger";
import * as fs from "fs";
import * as path from "path";
import * as v8 from "v8";
import { TimerManager } from "../utils/TimerManager";

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  timestamp: number;
  operation?: string;
  context?: Record<string, any>;
}

export interface MemoryDelta {
  heapUsedDelta: number;
  heapTotalDelta: number;
  externalDelta: number;
  rssDelta: number;
  arrayBuffersDelta: number;
  durationMs: number;
  operation: string;
  context?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

export interface OperationProfile {
  operationName: string;
  totalCalls: number;
  avgMemoryDelta: number;
  maxMemoryDelta: number;
  totalMemoryAllocated: number;
  avgDuration: number;
  maxDuration: number;
  lastCalled: number;
  failures: number;
}

class MemoryAllocationTracker {
  private static instance: MemoryAllocationTracker;
  private profiles = new Map<string, OperationProfile>();
  private activeOperations = new Map<string, MemorySnapshot>();
  private memoryHistory: MemorySnapshot[] = [];
  private alertThresholds = {
    lowMB: 10, // 10MB allocation
    mediumMB: 25, // 25MB allocation
    highMB: 50, // 50MB allocation
    criticalMB: 100, // 100MB allocation
  };
  private maxHistorySize = 1000;
  private heapSnapshotDir = path.join(process.cwd(), "heap-snapshots");

  constructor() {
    this.ensureSnapshotDir();
    this.startPeriodicMemoryCheck();
  }

  static getInstance(): MemoryAllocationTracker {
    if (!MemoryAllocationTracker.instance) {
      MemoryAllocationTracker.instance = new MemoryAllocationTracker();
    }
    return MemoryAllocationTracker.instance;
  }

  /**
   * Start tracking memory usage for an operation
   */
  startOperation(
    operationId: string,
    operationName: string,
    context?: Record<string, any>,
  ): string {
    const snapshot = this.takeMemorySnapshot(operationName, context);
    this.activeOperations.set(operationId, snapshot);

    logger.debug("🔍 Memory tracking started", "MemoryTracker", {
      operationId,
      operationName,
      context,
      initialMemory: {
        heapUsed: `${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(snapshot.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(snapshot.rss / 1024 / 1024).toFixed(2)}MB`,
      },
    });

    return operationId;
  }

  /**
   * Stop tracking and calculate memory delta
   */
  endOperation(
    operationId: string,
    success: boolean = true,
  ): MemoryDelta | null {
    const startSnapshot = this.activeOperations.get(operationId);
    if (!startSnapshot) {
      logger.warn("⚠️ No start snapshot found for operation", "MemoryTracker", {
        operationId,
      });
      return null;
    }

    const endSnapshot = this.takeMemorySnapshot();
    this.activeOperations.delete(operationId);

    const delta = this.calculateMemoryDelta(startSnapshot, endSnapshot);

    // Update operation profile
    this.updateOperationProfile(
      startSnapshot.operation || "unknown",
      delta,
      success,
    );

    // Check for memory spikes
    this.checkForMemorySpike(delta);

    logger.debug("🔍 Memory tracking completed", "MemoryTracker", {
      operationId,
      operation: startSnapshot.operation,
      memoryDelta: {
        heapUsed: `${(delta.heapUsedDelta / 1024 / 1024).toFixed(2)}MB`,
        external: `${(delta.externalDelta / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(delta.rssDelta / 1024 / 1024).toFixed(2)}MB`,
      },
      duration: `${delta.durationMs}ms`,
      severity: delta.severity,
    });

    return delta;
  }

  /**
   * Track a function with automatic memory monitoring
   */
  async trackFunction<T>(
    operationName: string,
    fn: () => Promise<T> | T,
    context?: Record<string, any>,
  ): Promise<T> {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.startOperation(operationId, operationName, context);

    try {
      const result = await fn();
      this.endOperation(operationId, true);
      return result;
    } catch (error) {
      this.endOperation(operationId, false);
      throw error;
    }
  }

  /**
   * Take a memory snapshot
   */
  private takeMemorySnapshot(
    operation?: string,
    context?: Record<string, any>,
  ): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers,
      timestamp: Date.now(),
      operation,
      context,
    };

    // Store in history (bounded)
    this.memoryHistory.push(snapshot);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    return snapshot;
  }

  /**
   * Calculate memory delta between two snapshots
   */
  private calculateMemoryDelta(
    start: MemorySnapshot,
    end: MemorySnapshot,
  ): MemoryDelta {
    const heapUsedDelta = end.heapUsed - start.heapUsed;
    const heapUsedDeltaMB = heapUsedDelta / 1024 / 1024;

    let severity: "low" | "medium" | "high" | "critical" = "low";
    if (heapUsedDeltaMB > this.alertThresholds.criticalMB) {
      severity = "critical";
    } else if (heapUsedDeltaMB > this.alertThresholds.highMB) {
      severity = "high";
    } else if (heapUsedDeltaMB > this.alertThresholds.mediumMB) {
      severity = "medium";
    }

    return {
      heapUsedDelta,
      heapTotalDelta: end.heapTotal - start.heapTotal,
      externalDelta: end.external - start.external,
      rssDelta: end.rss - start.rss,
      arrayBuffersDelta: end.arrayBuffers - start.arrayBuffers,
      durationMs: end.timestamp - start.timestamp,
      operation: start.operation || "unknown",
      context: start.context,
      severity,
    };
  }

  /**
   * Update operation profile statistics
   */
  private updateOperationProfile(
    operationName: string,
    delta: MemoryDelta,
    success: boolean,
  ): void {
    const existing = this.profiles.get(operationName);

    if (!existing) {
      this.profiles.set(operationName, {
        operationName,
        totalCalls: 1,
        avgMemoryDelta: delta.heapUsedDelta,
        maxMemoryDelta: delta.heapUsedDelta,
        totalMemoryAllocated: Math.max(0, delta.heapUsedDelta),
        avgDuration: delta.durationMs,
        maxDuration: delta.durationMs,
        lastCalled: Date.now(),
        failures: success ? 0 : 1,
      });
    } else {
      const newTotalCalls = existing.totalCalls + 1;
      const newTotalMemory =
        existing.totalMemoryAllocated + Math.max(0, delta.heapUsedDelta);

      existing.totalCalls = newTotalCalls;
      existing.avgMemoryDelta =
        (existing.avgMemoryDelta * existing.totalCalls + delta.heapUsedDelta) /
        newTotalCalls;
      existing.maxMemoryDelta = Math.max(
        existing.maxMemoryDelta,
        delta.heapUsedDelta,
      );
      existing.totalMemoryAllocated = newTotalMemory;
      existing.avgDuration =
        (existing.avgDuration * existing.totalCalls + delta.durationMs) /
        newTotalCalls;
      existing.maxDuration = Math.max(existing.maxDuration, delta.durationMs);
      existing.lastCalled = Date.now();
      existing.failures += success ? 0 : 1;
    }
  }

  /**
   * Check for memory spikes and alert
   */
  private checkForMemorySpike(delta: MemoryDelta): void {
    if (delta.severity === "critical" || delta.severity === "high") {
      logger.error("🚨 MEMORY SPIKE DETECTED", "MemoryTracker", {
        operation: delta.operation,
        heapIncrease: `${(delta.heapUsedDelta / 1024 / 1024).toFixed(2)}MB`,
        severity: delta.severity,
        duration: `${delta.durationMs}ms`,
        context: delta.context,
        timestamp: new Date().toISOString(),
      });

      // Generate heap snapshot for critical spikes
      if (delta.severity === "critical") {
        this.generateHeapSnapshot(`spike_${delta.operation}_${Date.now()}`);
      }
    } else if (delta.severity === "medium") {
      logger.warn("⚠️ Significant memory allocation", "MemoryTracker", {
        operation: delta.operation,
        heapIncrease: `${(delta.heapUsedDelta / 1024 / 1024).toFixed(2)}MB`,
        duration: `${delta.durationMs}ms`,
        context: delta.context,
      });
    }
  }

  /**
   * Generate heap snapshot for analysis
   */
  generateHeapSnapshot(reason: string = "manual"): string | null {
    try {
      const filename = `heap-${reason}-${Date.now()}.heapsnapshot`;
      const filepath = path.join(this.heapSnapshotDir, filename);

      v8.writeHeapSnapshot(filepath);

      logger.info("📸 Heap snapshot generated", "MemoryTracker", {
        reason,
        filepath,
        size: this.getFileSize(filepath),
      });

      return filepath;
    } catch (error) {
      logger.error("❌ Failed to generate heap snapshot", "MemoryTracker", {
        reason,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Get operation profiles sorted by memory usage
   */
  getTopMemoryConsumers(limit: number = 10): OperationProfile[] {
    return Array.from(this.profiles.values())
      .sort((a, b) => b.totalMemoryAllocated - a.totalMemoryAllocated)
      .slice(0, limit);
  }

  /**
   * Get recent memory history
   */
  getRecentMemoryHistory(minutes: number = 10): MemorySnapshot[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.memoryHistory.filter((snapshot) => snapshot.timestamp > cutoff);
  }

  /**
   * Generate comprehensive memory report
   */
  generateMemoryReport(): any {
    const currentMemory = process.memoryUsage();
    const topConsumers = this.getTopMemoryConsumers(10);
    const recentHistory = this.getRecentMemoryHistory(30);

    return {
      timestamp: new Date().toISOString(),
      currentMemory: {
        heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        utilization: `${((currentMemory.heapUsed / currentMemory.heapTotal) * 100).toFixed(1)}%`,
      },
      topMemoryConsumers: topConsumers.map((profile) => ({
        operation: profile.operationName,
        totalCalls: profile.totalCalls,
        totalMemoryAllocated: `${(profile.totalMemoryAllocated / 1024 / 1024).toFixed(2)}MB`,
        avgMemoryDelta: `${(profile.avgMemoryDelta / 1024 / 1024).toFixed(2)}MB`,
        maxMemoryDelta: `${(profile.maxMemoryDelta / 1024 / 1024).toFixed(2)}MB`,
        avgDuration: `${profile.avgDuration.toFixed(1)}ms`,
        failureRate: `${((profile.failures / profile.totalCalls) * 100).toFixed(1)}%`,
      })),
      recentMemoryTrend: recentHistory.slice(-10).map((snapshot) => ({
        timestamp: new Date(snapshot.timestamp).toISOString(),
        heapUsed: `${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        operation: snapshot.operation,
      })),
      activeOperations: this.activeOperations.size,
      totalOperationsTracked: this.profiles.size,
      memoryHistorySize: this.memoryHistory.length,
    };
  }

  /**
   * Periodic memory check to catch gradual leaks
   */
  private startPeriodicMemoryCheck(): void {
    TimerManager.setInterval(
      () => {
        const currentSnapshot = this.takeMemorySnapshot("periodic_check");

        // Check for gradual memory growth
        if (this.memoryHistory.length >= 10) {
          const tenMinutesAgo = this.memoryHistory.find(
            (snapshot) =>
              currentSnapshot.timestamp - snapshot.timestamp >= 10 * 60 * 1000,
          );

          if (tenMinutesAgo) {
            const growth = currentSnapshot.heapUsed - tenMinutesAgo.heapUsed;
            const growthMB = growth / 1024 / 1024;

            if (growthMB > 50) {
              // 50MB growth in 10 minutes
              logger.warn(
                "📈 Gradual memory growth detected",
                "MemoryTracker",
                {
                  growthMB: growthMB.toFixed(2),
                  timespan: "10 minutes",
                  currentHeap: `${(currentSnapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                  previousHeap: `${(tenMinutesAgo.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                },
              );
            }
          }
        }
      },
      2 * 60 * 1000,
    ); // Check every 2 minutes
  }

  /**
   * Ensure heap snapshot directory exists
   */
  private ensureSnapshotDir(): void {
    try {
      if (!fs.existsSync(this.heapSnapshotDir)) {
        fs.mkdirSync(this.heapSnapshotDir, { recursive: true });
      }
    } catch (error) {
      logger.warn(
        "⚠️ Could not create heap snapshot directory",
        "MemoryTracker",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  }

  /**
   * Get file size helper
   */
  private getFileSize(filepath: string): string {
    try {
      const stats = fs.statSync(filepath);
      const sizeMB = stats.size / 1024 / 1024;
      return `${sizeMB.toFixed(2)}MB`;
    } catch {
      return "Unknown";
    }
  }

  /**
   * Clear old profiles and history (cleanup)
   */
  cleanup(): void {
    // Keep only last 500 profiles, remove oldest
    if (this.profiles.size > 500) {
      const sortedProfiles = Array.from(this.profiles.entries()).sort(
        (a, b) => b[1].lastCalled - a[1].lastCalled,
      );

      this.profiles.clear();
      sortedProfiles.slice(0, 500).forEach(([key, profile]) => {
        this.profiles.set(key, profile);
      });
    }

    // Keep only last 1000 memory snapshots
    if (this.memoryHistory.length > 1000) {
      this.memoryHistory = this.memoryHistory.slice(-1000);
    }

    logger.debug("🧹 Memory tracker cleanup completed", "MemoryTracker", {
      profilesCount: this.profiles.size,
      historySize: this.memoryHistory.length,
    });
  }
}

// Export singleton instance
export const memoryTracker = MemoryAllocationTracker.getInstance();

// Export helper decorator for easy function tracking
export function trackMemory(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const trackingName =
      operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return memoryTracker.trackFunction(
        trackingName,
        () => originalMethod.apply(this, args),
        { args: args.length },
      );
    };

    return descriptor;
  };
}

// Export helper for manual tracking
export function trackOperation<T>(
  operationName: string,
  fn: () => Promise<T> | T,
  context?: Record<string, any>,
): Promise<T> {
  return memoryTracker.trackFunction(operationName, fn, context);
}
