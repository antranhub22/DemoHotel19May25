// ============================================================================
// 🛡️ MEMORY PATTERN FIXES - Apply fixes to existing dangerous patterns
// ============================================================================

import { logger } from "@shared/utils/logger";

// ============================================================================
// ERROR ARRAY FIXES
// ============================================================================

/**
 * Replace dangerous unbounded error arrays with safe bounded ones
 */
function fixErrorArrays() {
  // Monkey patch common error accumulation patterns
  const originalConsoleMethods = {
    warn: console.warn,
    error: console.error,
  };

  // Track error counts
  const errorCounts = new Map<string, number>();
  const MAX_SAME_ERROR = 10;

  console.warn = (...args: any[]) => {
    const errorKey = args.join(" ").slice(0, 100);
    const count = errorCounts.get(errorKey) || 0;

    if (count < MAX_SAME_ERROR) {
      errorCounts.set(errorKey, count + 1);
      originalConsoleMethods.warn(...args);
    } else if (count === MAX_SAME_ERROR) {
      errorCounts.set(errorKey, count + 1);
      originalConsoleMethods.warn(
        `[SUPPRESSED] Previous warning repeated ${MAX_SAME_ERROR} times:`,
        errorKey,
      );
    }
    // Suppress further identical warnings
  };

  console.error = (...args: any[]) => {
    const errorKey = args.join(" ").slice(0, 100);
    const count = errorCounts.get(errorKey) || 0;

    if (count < MAX_SAME_ERROR) {
      errorCounts.set(errorKey, count + 1);
      originalConsoleMethods.error(...args);
    } else if (count === MAX_SAME_ERROR) {
      errorCounts.set(errorKey, count + 1);
      originalConsoleMethods.error(
        `[SUPPRESSED] Previous error repeated ${MAX_SAME_ERROR} times:`,
        errorKey,
      );
    }
    // Suppress further identical errors
  };

  // Reset counts periodically
  setInterval(() => {
    errorCounts.clear();
  }, 300000); // Reset every 5 minutes

  logger.info("🛡️ Error array protection enabled", "MemoryPatternFixes");
}

// ============================================================================
// BUFFER CONCAT FIXES
// ============================================================================

/**
 * Replace dangerous Buffer.concat with bounded buffers
 */
function fixBufferOperations() {
  const originalBufferConcat = Buffer.concat;

  Buffer.concat = function (
    list: readonly Uint8Array[],
    totalLength?: number,
  ): Buffer {
    // Check if concatenation would be too large
    const actualTotalLength =
      totalLength || list.reduce((sum, buf) => sum + buf.length, 0);
    const MAX_BUFFER_SIZE = 100 * 1024 * 1024; // 100MB limit

    if (actualTotalLength > MAX_BUFFER_SIZE) {
      logger.warn(
        "⚠️ Large buffer concatenation detected",
        "MemoryPatternFixes",
        {
          size: `${(actualTotalLength / 1024 / 1024).toFixed(1)}MB`,
          chunks: list.length,
        },
      );

      // Truncate to safe size
      let accumulatedSize = 0;
      const safeBufs: Uint8Array[] = [];

      for (const buf of list) {
        if (accumulatedSize + buf.length <= MAX_BUFFER_SIZE) {
          safeBufs.push(buf);
          accumulatedSize += buf.length;
        } else {
          // Take partial buffer to reach limit
          const remainingSize = MAX_BUFFER_SIZE - accumulatedSize;
          if (remainingSize > 0) {
            safeBufs.push(buf.slice(0, remainingSize));
          }
          break;
        }
      }

      return originalBufferConcat.call(this, safeBufs);
    }

    return originalBufferConcat.call(this, list, totalLength);
  };

  logger.info("🛡️ Buffer operation protection enabled", "MemoryPatternFixes");
}

// ============================================================================
// ARRAY OPERATION FIXES
// ============================================================================

/**
 * Monitor and limit array growth
 */
function fixArrayOperations() {
  const LARGE_ARRAY_THRESHOLD = 10000;
  const monitoredArrays = new WeakSet();

  // Override Array.prototype.push for monitoring
  const originalPush = Array.prototype.push;
  Array.prototype.push = function <T>(this: T[], ...items: T[]): number {
    const result = originalPush.apply(this, items);

    if (this.length > LARGE_ARRAY_THRESHOLD && !monitoredArrays.has(this)) {
      monitoredArrays.add(this);
      logger.warn("⚠️ Large array detected", "MemoryPatternFixes", {
        size: this.length,
        itemsAdded: items.length,
        sampleItem: typeof this[0],
      });
    }

    return result;
  };

  // Override Array.prototype.concat for monitoring
  const originalConcat = Array.prototype.concat;
  Array.prototype.concat = function <T>(
    this: T[],
    ...items: ConcatArray<T>[]
  ): T[] {
    const totalNewItems = items.reduce(
      (sum, arr) => sum + (arr.length || 0),
      0,
    );

    if (this.length + totalNewItems > LARGE_ARRAY_THRESHOLD) {
      logger.warn(
        "⚠️ Large array concatenation detected",
        "MemoryPatternFixes",
        {
          currentSize: this.length,
          newItems: totalNewItems,
          resultSize: this.length + totalNewItems,
        },
      );
    }

    return originalConcat.apply(this, items);
  };

  logger.info("🛡️ Array operation protection enabled", "MemoryPatternFixes");
}

// ============================================================================
// STRING OPERATION FIXES
// ============================================================================

/**
 * Monitor dangerous string operations
 */
function fixStringOperations() {
  const LARGE_STRING_THRESHOLD = 1024 * 1024; // 1MB

  // Monitor string concatenation patterns
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function (
    this: string,
    ...strings: string[]
  ): string {
    const totalLength =
      this.length + strings.reduce((sum, s) => sum + s.length, 0);

    if (totalLength > LARGE_STRING_THRESHOLD) {
      logger.warn(
        "⚠️ Large string concatenation detected",
        "MemoryPatternFixes",
        {
          currentLength: this.length,
          newLength: totalLength,
          size: `${(totalLength / 1024).toFixed(1)}KB`,
        },
      );
    }

    return originalStringConcat.apply(this, strings);
  };

  // Monitor repeat operations
  const originalRepeat = String.prototype.repeat;
  String.prototype.repeat = function (this: string, count: number): string {
    const resultLength = this.length * count;

    if (resultLength > LARGE_STRING_THRESHOLD) {
      logger.warn("⚠️ Large string repeat detected", "MemoryPatternFixes", {
        baseLength: this.length,
        repeatCount: count,
        resultSize: `${(resultLength / 1024).toFixed(1)}KB`,
      });

      // Limit to safe size
      const safeCount = Math.floor(LARGE_STRING_THRESHOLD / this.length);
      return originalRepeat.call(this, safeCount);
    }

    return originalRepeat.call(this, count);
  };

  logger.info("🛡️ String operation protection enabled", "MemoryPatternFixes");
}

// ============================================================================
// STREAMING FIXES
// ============================================================================

/**
 * Add memory monitoring to streams
 */
function fixStreamOperations() {
  const { Transform } = require("stream");

  const originalTransform = Transform.prototype._transform;
  Transform.prototype._transform = function (
    chunk: any,
    encoding: string,
    callback: Function,
  ) {
    // Monitor chunk sizes
    if (Buffer.isBuffer(chunk) && chunk.length > 1024 * 1024) {
      // 1MB chunks
      logger.warn("⚠️ Large stream chunk detected", "MemoryPatternFixes", {
        chunkSize: `${(chunk.length / 1024).toFixed(1)}KB`,
        encoding,
      });
    }

    return originalTransform.call(this, chunk, encoding, callback);
  };

  logger.info("🛡️ Stream operation protection enabled", "MemoryPatternFixes");
}

// ============================================================================
// GLOBAL MEMORY MONITORING
// ============================================================================

let memoryCheckInterval: NodeJS.Timeout | null = null;

function startGlobalMemoryMonitoring() {
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
  }

  memoryCheckInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const utilization = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (heapUsedMB > 200) {
      // 200MB threshold
      logger.warn("⚠️ High memory usage detected", "MemoryPatternFixes", {
        heapUsed: `${heapUsedMB.toFixed(1)}MB`,
        heapTotal: `${heapTotalMB.toFixed(1)}MB`,
        utilization: `${utilization.toFixed(1)}%`,
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)}MB`,
      });

      // Force GC if available and memory is very high
      if (global.gc && heapUsedMB > 400) {
        logger.warn("🗑️ Forcing garbage collection", "MemoryPatternFixes");
        global.gc();
      }
    }
  }, 60000); // Check every minute

  logger.info("🛡️ Global memory monitoring started", "MemoryPatternFixes");
}

function stopGlobalMemoryMonitoring() {
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    memoryCheckInterval = null;
    logger.info("🛑 Global memory monitoring stopped", "MemoryPatternFixes");
  }
}

// ============================================================================
// APPLY ALL FIXES
// ============================================================================

function applyAllMemoryFixes() {
  logger.info("🛡️ Applying memory pattern fixes...", "MemoryPatternFixes");

  try {
    fixErrorArrays();
    fixBufferOperations();
    fixArrayOperations();
    fixStringOperations();
    fixStreamOperations();
    startGlobalMemoryMonitoring();

    logger.info(
      "✅ All memory pattern fixes applied successfully",
      "MemoryPatternFixes",
    );
  } catch (error) {
    logger.error("❌ Failed to apply memory fixes", "MemoryPatternFixes", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

// Register cleanup on process exit
process.on("SIGTERM", stopGlobalMemoryMonitoring);
process.on("SIGINT", stopGlobalMemoryMonitoring);
process.on("beforeExit", stopGlobalMemoryMonitoring);

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Apply all
  applyAllMemoryFixes,
  fixArrayOperations,
  fixBufferOperations,
  // Individual fixes
  fixErrorArrays,
  fixStreamOperations,
  fixStringOperations,
  // Monitoring
  startGlobalMemoryMonitoring,
  stopGlobalMemoryMonitoring,
};
