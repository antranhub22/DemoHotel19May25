/**
 * ✅ MEMORY FIX: Timer Manager - Track and cleanup all timers/intervals
 * Prevents memory leaks from untracked setTimeout/setInterval calls
 */

import { logger } from "../../packages/shared/utils/logger";

interface TrackedTimer {
  id: NodeJS.Timeout;
  type: "timeout" | "interval";
  name: string;
  createdAt: Date;
  delay: number;
  callback?: string; // Stringified callback for debugging
}

interface TimerStats {
  totalTimers: number;
  activeTimeouts: number;
  activeIntervals: number;
  oldestTimer: Date | null;
  memoryEstimateMB: number;
}

/**
 * ✅ MEMORY FIX: TimerManager - Global timer tracking and cleanup
 */
export class TimerManager {
  private static instance: TimerManager | null = null;
  private timers = new Map<NodeJS.Timeout, TrackedTimer>();
  private isShuttingDown = false;

  private constructor() {
    // Setup cleanup handlers
    this.setupCleanupHandlers();
  }

  static getInstance(): TimerManager {
    if (!this.instance) {
      this.instance = new TimerManager();
      logger.debug("TimerManager instance created", "TimerManager");
    }
    return this.instance;
  }

  /**
   * ✅ MEMORY FIX: Tracked setTimeout replacement
   */
  static setTimeout(
    callback: () => void,
    delay: number,
    name?: string,
  ): NodeJS.Timeout {
    const instance = this.getInstance();

    if (instance.isShuttingDown) {
      logger.warn(
        "TimerManager is shutting down, ignoring setTimeout",
        "TimerManager",
      );
      return setTimeout(callback, delay); // Fallback to native
    }

    const wrappedCallback = () => {
      try {
        // Remove from tracking when timer executes
        instance.timers.delete(timer);
        callback();
      } catch (error) {
        logger.error("Timer callback error", "TimerManager", error);
        instance.timers.delete(timer);
      }
    };

    const timer = setTimeout(wrappedCallback, delay);

    const trackedTimer: TrackedTimer = {
      id: timer,
      type: "timeout",
      name: name || "anonymous",
      createdAt: new Date(),
      delay,
      callback: callback.toString().substring(0, 100), // First 100 chars for debugging
    };

    instance.timers.set(timer, trackedTimer);

    logger.debug(
      `Tracked setTimeout: ${trackedTimer.name} (${delay}ms)`,
      "TimerManager",
      { totalTimers: instance.timers.size },
    );

    return timer;
  }

  /**
   * ✅ MEMORY FIX: Tracked setInterval replacement
   */
  static setInterval(
    callback: () => void,
    delay: number,
    name?: string,
  ): NodeJS.Timeout {
    const instance = this.getInstance();

    if (instance.isShuttingDown) {
      logger.warn(
        "TimerManager is shutting down, ignoring setInterval",
        "TimerManager",
      );
      return setInterval(callback, delay); // Fallback to native
    }

    const wrappedCallback = () => {
      try {
        callback();
      } catch (error) {
        logger.error("Interval callback error", "TimerManager", error);
        // Don't remove from tracking for intervals - they continue running
      }
    };

    const timer = setInterval(wrappedCallback, delay);

    const trackedTimer: TrackedTimer = {
      id: timer,
      type: "interval",
      name: name || "anonymous",
      createdAt: new Date(),
      delay,
      callback: callback.toString().substring(0, 100),
    };

    instance.timers.set(timer, trackedTimer);

    logger.debug(
      `Tracked setInterval: ${trackedTimer.name} (${delay}ms)`,
      "TimerManager",
      { totalTimers: instance.timers.size },
    );

    return timer;
  }

  /**
   * ✅ MEMORY FIX: Tracked clearTimeout
   */
  static clearTimeout(timer: NodeJS.Timeout): void {
    const instance = this.getInstance();

    clearTimeout(timer);
    const trackedTimer = instance.timers.get(timer);

    if (trackedTimer) {
      instance.timers.delete(timer);
      logger.debug(`Cleared setTimeout: ${trackedTimer.name}`, "TimerManager", {
        totalTimers: instance.timers.size,
      });
    }
  }

  /**
   * ✅ MEMORY FIX: Tracked clearInterval
   */
  static clearInterval(timer: NodeJS.Timeout): void {
    const instance = this.getInstance();

    clearInterval(timer);
    const trackedTimer = instance.timers.get(timer);

    if (trackedTimer) {
      instance.timers.delete(timer);
      logger.debug(
        `Cleared setInterval: ${trackedTimer.name}`,
        "TimerManager",
        { totalTimers: instance.timers.size },
      );
    }
  }

  /**
   * ✅ MEMORY FIX: Clear all tracked timers
   */
  static clearAll(): void {
    const instance = this.getInstance();

    if (instance.timers.size === 0) {
      logger.debug("No timers to clear", "TimerManager");
      return;
    }

    let timeoutsCleared = 0;
    let intervalsCleared = 0;

    for (const [timer, trackedTimer] of instance.timers) {
      try {
        if (trackedTimer.type === "timeout") {
          clearTimeout(timer);
          timeoutsCleared++;
        } else {
          clearInterval(timer);
          intervalsCleared++;
        }
      } catch (error) {
        logger.warn("Error clearing timer", "TimerManager", {
          name: trackedTimer.name,
          error,
        });
      }
    }

    instance.timers.clear();

    logger.info("🧹 All timers cleared", "TimerManager", {
      timeoutsCleared,
      intervalsCleared,
      totalCleared: timeoutsCleared + intervalsCleared,
    });
  }

  /**
   * Get timer statistics
   */
  static getStats(): TimerStats {
    const instance = this.getInstance();

    let activeTimeouts = 0;
    let activeIntervals = 0;
    let oldestTimer: Date | null = null;

    for (const trackedTimer of instance.timers.values()) {
      if (trackedTimer.type === "timeout") {
        activeTimeouts++;
      } else {
        activeIntervals++;
      }

      if (!oldestTimer || trackedTimer.createdAt < oldestTimer) {
        oldestTimer = trackedTimer.createdAt;
      }
    }

    return {
      totalTimers: instance.timers.size,
      activeTimeouts,
      activeIntervals,
      oldestTimer,
      memoryEstimateMB: instance.timers.size * 0.001, // ~1KB per timer estimate
    };
  }

  /**
   * Get detailed timer list for debugging
   */
  static getDetailedTimers(): TrackedTimer[] {
    const instance = this.getInstance();
    return Array.from(instance.timers.values());
  }

  /**
   * Clear old timers (timeouts older than specified age)
   */
  static clearOldTimers(maxAgeMs: number = 300000): void {
    // 5 minutes default
    const instance = this.getInstance();
    const cutoffTime = new Date(Date.now() - maxAgeMs);
    let clearedCount = 0;

    for (const [timer, trackedTimer] of instance.timers) {
      if (
        trackedTimer.type === "timeout" &&
        trackedTimer.createdAt < cutoffTime
      ) {
        try {
          clearTimeout(timer);
          instance.timers.delete(timer);
          clearedCount++;
        } catch (error) {
          logger.warn("Error clearing old timer", "TimerManager", {
            name: trackedTimer.name,
            error,
          });
        }
      }
    }

    if (clearedCount > 0) {
      logger.info("🧹 Cleared old timers", "TimerManager", {
        clearedCount,
        maxAgeMinutes: maxAgeMs / 60000,
        remainingTimers: instance.timers.size,
      });
    }
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  private setupCleanupHandlers(): void {
    // Prevent multiple handler registrations
    if ((global as any).__timerManagerCleanupHandlersSetup) {
      return;
    }
    (global as any).__timerManagerCleanupHandlersSetup = true;

    const cleanupHandler = () => {
      this.isShuttingDown = true;
      TimerManager.clearAll();
    };

    process.on("SIGTERM", cleanupHandler);
    process.on("SIGINT", cleanupHandler);
    process.on("beforeExit", cleanupHandler);

    logger.debug("TimerManager cleanup handlers registered", "TimerManager");
  }

  /**
   * Start periodic cleanup of old timers
   */
  static startPeriodicCleanup(intervalMs: number = 300000): NodeJS.Timeout {
    // 5 minutes
    const cleanupInterval = this.setInterval(
      () => {
        this.clearOldTimers();
        const stats = this.getStats();

        if (stats.totalTimers > 50) {
          // Alert if too many timers
          logger.warn("High timer count detected", "TimerManager", stats);
        }
      },
      intervalMs,
      "TimerManager-PeriodicCleanup",
    );

    logger.info("🧹 TimerManager periodic cleanup started", "TimerManager", {
      intervalMinutes: intervalMs / 60000,
    });

    return cleanupInterval;
  }
}

// ============================================
// GLOBAL REPLACEMENTS - Use these instead of native functions
// ============================================

/**
 * ✅ MEMORY FIX: Global replacements for setTimeout/setInterval
 * Use these in your code instead of native functions
 */
export const managedSetTimeout = TimerManager.setTimeout;
export const managedSetInterval = TimerManager.setInterval;
export const managedClearTimeout = TimerManager.clearTimeout;
export const managedClearInterval = TimerManager.clearInterval;
