/**
 * 🔬 FUNCTION-LEVEL MEMORY PROFILER
 *
 * Provides decorators and utilities for detailed memory profiling
 * of specific functions and code sections.
 */

import { logger } from "@shared/utils/logger";
import { memoryTracker } from "@server/shared/MemoryAllocationTracker";

export interface ProfiledFunction {
  name: string;
  callCount: number;
  totalMemoryAllocated: number;
  avgMemoryPerCall: number;
  maxMemoryPerCall: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  lastCalled: Date;
  failures: number;
}

class MemoryProfiler {
  private static instance: MemoryProfiler;
  private functionProfiles = new Map<string, ProfiledFunction>();
  private isProfilingEnabled = true;

  static getInstance(): MemoryProfiler {
    if (!MemoryProfiler.instance) {
      MemoryProfiler.instance = new MemoryProfiler();
    }
    return MemoryProfiler.instance;
  }

  /**
   * Enable/disable profiling (useful for production performance)
   */
  setProfilingEnabled(enabled: boolean): void {
    this.isProfilingEnabled = enabled;
    logger.info(
      `🔬 Memory profiling ${enabled ? "enabled" : "disabled"}`,
      "MemoryProfiler",
    );
  }

  /**
   * Profile a function with detailed memory tracking
   */
  async profileFunction<T>(
    functionName: string,
    fn: () => Promise<T> | T,
    options: {
      logLevel?: "debug" | "info" | "warn" | "error";
      context?: Record<string, any>;
      trackArgs?: boolean;
    } = {},
  ): Promise<T> {
    if (!this.isProfilingEnabled) {
      return await fn();
    }

    const startTime = Date.now();
    const operationId = `profile_${functionName}_${startTime}_${Math.random().toString(36).substr(2, 6)}`;

    try {
      // Start memory tracking
      memoryTracker.startOperation(operationId, functionName, {
        ...options.context,
        profiledFunction: true,
        timestamp: new Date().toISOString(),
      });

      // Execute function
      const result = await fn();

      // End tracking and update stats
      const delta = memoryTracker.endOperation(operationId, true);
      if (delta) {
        this.updateFunctionProfile(functionName, delta, true);
        this.logProfiledExecution(
          functionName,
          delta,
          options.logLevel || "debug",
        );
      }

      return result;
    } catch (error) {
      // Handle failure
      const delta = memoryTracker.endOperation(operationId, false);
      if (delta) {
        this.updateFunctionProfile(functionName, delta, false);
      }

      logger.error(
        `❌ Profiled function failed: ${functionName}`,
        "MemoryProfiler",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          duration: Date.now() - startTime,
        },
      );

      throw error;
    }
  }

  /**
   * Update function profile statistics
   */
  private updateFunctionProfile(
    functionName: string,
    delta: any,
    success: boolean,
  ): void {
    const existing = this.functionProfiles.get(functionName);
    const memoryDelta = Math.max(0, delta.heapUsedDelta); // Only count positive allocations

    if (!existing) {
      this.functionProfiles.set(functionName, {
        name: functionName,
        callCount: 1,
        totalMemoryAllocated: memoryDelta,
        avgMemoryPerCall: memoryDelta,
        maxMemoryPerCall: memoryDelta,
        totalDuration: delta.durationMs,
        avgDuration: delta.durationMs,
        maxDuration: delta.durationMs,
        lastCalled: new Date(),
        failures: success ? 0 : 1,
      });
    } else {
      const newCallCount = existing.callCount + 1;
      const newTotalMemory = existing.totalMemoryAllocated + memoryDelta;
      const newTotalDuration = existing.totalDuration + delta.durationMs;

      existing.callCount = newCallCount;
      existing.totalMemoryAllocated = newTotalMemory;
      existing.avgMemoryPerCall = newTotalMemory / newCallCount;
      existing.maxMemoryPerCall = Math.max(
        existing.maxMemoryPerCall,
        memoryDelta,
      );
      existing.totalDuration = newTotalDuration;
      existing.avgDuration = newTotalDuration / newCallCount;
      existing.maxDuration = Math.max(existing.maxDuration, delta.durationMs);
      existing.lastCalled = new Date();
      existing.failures += success ? 0 : 1;
    }
  }

  /**
   * Log profiled execution with appropriate level
   */
  private logProfiledExecution(
    functionName: string,
    delta: any,
    logLevel: string,
  ): void {
    const heapDeltaMB = delta.heapUsedDelta / 1024 / 1024;
    const logData = {
      function: functionName,
      memoryAllocated: `${heapDeltaMB.toFixed(2)}MB`,
      duration: `${delta.durationMs}ms`,
      severity: delta.severity,
    };

    switch (logLevel) {
      case "error":
        logger.error(
          `🔬 Profiled function execution`,
          "MemoryProfiler",
          logData,
        );
        break;
      case "warn":
        logger.warn(
          `🔬 Profiled function execution`,
          "MemoryProfiler",
          logData,
        );
        break;
      case "info":
        logger.info(
          `🔬 Profiled function execution`,
          "MemoryProfiler",
          logData,
        );
        break;
      case "debug":
      default:
        logger.debug(
          `🔬 Profiled function execution`,
          "MemoryProfiler",
          logData,
        );
        break;
    }
  }

  /**
   * Get top memory consuming functions
   */
  getTopMemoryConsumers(limit: number = 10): ProfiledFunction[] {
    return Array.from(this.functionProfiles.values())
      .sort((a, b) => b.totalMemoryAllocated - a.totalMemoryAllocated)
      .slice(0, limit);
  }

  /**
   * Get functions with highest average memory usage
   */
  getHighestAverageMemoryFunctions(limit: number = 10): ProfiledFunction[] {
    return Array.from(this.functionProfiles.values())
      .sort((a, b) => b.avgMemoryPerCall - a.avgMemoryPerCall)
      .slice(0, limit);
  }

  /**
   * Get slowest functions
   */
  getSlowestFunctions(limit: number = 10): ProfiledFunction[] {
    return Array.from(this.functionProfiles.values())
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  /**
   * Generate comprehensive profiling report
   */
  generateProfilingReport(): any {
    const topMemoryConsumers = this.getTopMemoryConsumers(10);
    const highestAverage = this.getHighestAverageMemoryFunctions(10);
    const slowest = this.getSlowestFunctions(10);

    return {
      timestamp: new Date().toISOString(),
      profilingEnabled: this.isProfilingEnabled,
      totalFunctionsTracked: this.functionProfiles.size,

      topMemoryConsumers: topMemoryConsumers.map((profile) => ({
        function: profile.name,
        totalMemory: `${(profile.totalMemoryAllocated / 1024 / 1024).toFixed(2)}MB`,
        callCount: profile.callCount,
        avgMemoryPerCall: `${(profile.avgMemoryPerCall / 1024 / 1024).toFixed(2)}MB`,
        maxMemoryPerCall: `${(profile.maxMemoryPerCall / 1024 / 1024).toFixed(2)}MB`,
        failureRate: `${((profile.failures / profile.callCount) * 100).toFixed(1)}%`,
      })),

      highestAverageMemory: highestAverage.map((profile) => ({
        function: profile.name,
        avgMemoryPerCall: `${(profile.avgMemoryPerCall / 1024 / 1024).toFixed(2)}MB`,
        callCount: profile.callCount,
        lastCalled: profile.lastCalled.toISOString(),
      })),

      slowestFunctions: slowest.map((profile) => ({
        function: profile.name,
        avgDuration: `${profile.avgDuration.toFixed(1)}ms`,
        maxDuration: `${profile.maxDuration.toFixed(1)}ms`,
        callCount: profile.callCount,
      })),
    };
  }

  /**
   * Clear profiling data (useful for testing or memory cleanup)
   */
  clearProfiles(): void {
    this.functionProfiles.clear();
    logger.info("🧹 Memory profiling data cleared", "MemoryProfiler");
  }

  /**
   * Get specific function profile
   */
  getFunctionProfile(functionName: string): ProfiledFunction | undefined {
    return this.functionProfiles.get(functionName);
  }
}

// Export singleton instance
export const memoryProfiler = MemoryProfiler.getInstance();

/**
 * Decorator for automatic memory profiling of class methods
 */
export function ProfileMemory(
  options: {
    logLevel?: "debug" | "info" | "warn" | "error";
    functionName?: string;
    enabled?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    if (options.enabled === false) {
      return descriptor; // Skip profiling if explicitly disabled
    }

    const originalMethod = descriptor.value;
    const functionName =
      options.functionName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return memoryProfiler.profileFunction(
        functionName,
        () => originalMethod.apply(this, args),
        {
          logLevel: options.logLevel || "debug",
          context: {
            className: target.constructor.name,
            method: propertyKey,
            argsCount: args.length,
          },
        },
      );
    };

    return descriptor;
  };
}

/**
 * Utility function for manual profiling
 */
export async function profileMemoryUsage<T>(
  functionName: string,
  fn: () => Promise<T> | T,
  logLevel: "debug" | "info" | "warn" | "error" = "debug",
): Promise<T> {
  return memoryProfiler.profileFunction(functionName, fn, { logLevel });
}

/**
 * Block-level memory profiling
 */
export class MemoryBlock {
  private operationId: string;
  private blockName: string;
  private startTime: number;

  constructor(blockName: string, context?: Record<string, any>) {
    this.blockName = blockName;
    this.startTime = Date.now();
    this.operationId = `block_${blockName}_${this.startTime}_${Math.random().toString(36).substr(2, 6)}`;

    memoryTracker.startOperation(this.operationId, `Block: ${blockName}`, {
      ...context,
      blockProfiling: true,
    });

    logger.debug(`🔬 Memory block started: ${blockName}`, "MemoryProfiler");
  }

  end(): void {
    const delta = memoryTracker.endOperation(this.operationId, true);
    const duration = Date.now() - this.startTime;

    if (delta) {
      const heapDeltaMB = delta.heapUsedDelta / 1024 / 1024;

      logger.debug(
        `🔬 Memory block completed: ${this.blockName}`,
        "MemoryProfiler",
        {
          memoryAllocated: `${heapDeltaMB.toFixed(2)}MB`,
          duration: `${duration}ms`,
          severity: delta.severity,
        },
      );

      // Log warning for significant allocations
      if (heapDeltaMB > 10) {
        logger.warn(
          `⚠️ Significant memory allocation in block: ${this.blockName}`,
          "MemoryProfiler",
          {
            memoryAllocated: `${heapDeltaMB.toFixed(2)}MB`,
            duration: `${duration}ms`,
          },
        );
      }
    }
  }
}

/**
 * Convenience function for block profiling
 */
export function createMemoryBlock(
  blockName: string,
  context?: Record<string, any>,
): MemoryBlock {
  return new MemoryBlock(blockName, context);
}
