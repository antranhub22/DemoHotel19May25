// ============================================================================
// 🛡️ SAFE BOUNDED COLLECTIONS - Prevent Memory Leaks from Unbounded Growth
// ============================================================================

import { logger } from "@shared/utils/logger";

// ============================================================================
// CONFIGURATION
// ============================================================================

interface BoundedConfig {
  maxSize: number;
  warningThreshold: number;
  evictionPolicy: "fifo" | "lifo" | "lru";
  onEviction?: (evictedItem: any, reason: string) => void;
}

const DEFAULT_CONFIG: BoundedConfig = {
  maxSize: 1000,
  warningThreshold: 0.8, // 80%
  evictionPolicy: "fifo",
};

// ============================================================================
// BOUNDED ARRAY CLASS
// ============================================================================

export class BoundedArray<T> extends Array<T> {
  private config: BoundedConfig;
  private accessTimes: Map<number, number>;

  constructor(config: Partial<BoundedConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.accessTimes = new Map();

    logger.debug("🛡️ BoundedArray created", "BoundedArray", {
      maxSize: this.config.maxSize,
      evictionPolicy: this.config.evictionPolicy,
    });
  }

  /**
   * Safe push with automatic eviction
   */
  push(...items: T[]): number {
    for (const item of items) {
      // Check if we need to evict before adding
      if (this.length >= this.config.maxSize) {
        this.evictItems(1);
      }

      const newLength = super.push(item);
      this.trackAccess(newLength - 1);

      // Warning threshold check
      if (this.length >= this.config.maxSize * this.config.warningThreshold) {
        logger.warn("⚠️ BoundedArray approaching size limit", "BoundedArray", {
          currentSize: this.length,
          maxSize: this.config.maxSize,
          utilization: `${Math.round((this.length / this.config.maxSize) * 100)}%`,
        });
      }
    }

    return this.length;
  }

  /**
   * Safe unshift with automatic eviction
   */
  unshift(...items: T[]): number {
    // Evict from end if needed
    const itemsToEvict = Math.max(
      0,
      this.length + items.length - this.config.maxSize,
    );
    if (itemsToEvict > 0) {
      this.evictItems(itemsToEvict, "end");
    }

    const newLength = super.unshift(...items);

    // Update access tracking
    this.accessTimes.clear(); // Reset access times after unshift
    for (let i = 0; i < Math.min(items.length, this.length); i++) {
      this.trackAccess(i);
    }

    return newLength;
  }

  /**
   * Access tracking for LRU
   */
  private trackAccess(index: number): void {
    if (this.config.evictionPolicy === "lru") {
      this.accessTimes.set(index, Date.now());
    }
  }

  /**
   * Evict items based on policy
   */
  private evictItems(count: number, from: "start" | "end" = "auto"): void {
    const itemsToEvict = Math.min(count, this.length);

    if (itemsToEvict === 0) return;

    let evictedItems: T[] = [];

    if (from === "auto") {
      switch (this.config.evictionPolicy) {
        case "fifo":
          evictedItems = this.splice(0, itemsToEvict);
          break;
        case "lifo":
          evictedItems = this.splice(-itemsToEvict, itemsToEvict);
          break;
        case "lru":
          evictedItems = this.evictLRU(itemsToEvict);
          break;
      }
    } else if (from === "start") {
      evictedItems = this.splice(0, itemsToEvict);
    } else {
      evictedItems = this.splice(-itemsToEvict, itemsToEvict);
    }

    // Call eviction callback
    if (this.config.onEviction) {
      for (const item of evictedItems) {
        this.config.onEviction(item, "size_limit");
      }
    }

    logger.debug("🗑️ BoundedArray evicted items", "BoundedArray", {
      evictedCount: evictedItems.length,
      newSize: this.length,
      policy: this.config.evictionPolicy,
    });
  }

  /**
   * LRU eviction logic
   */
  private evictLRU(count: number): T[] {
    if (this.accessTimes.size === 0) {
      // Fallback to FIFO if no access tracking
      return this.splice(0, count);
    }

    // Sort indices by access time (oldest first)
    const sortedIndices = Array.from(this.accessTimes.entries())
      .sort(([, timeA], [, timeB]) => timeA - timeB)
      .map(([index]) => index)
      .slice(0, count);

    // Remove items (sort indices in descending order to avoid index shifts)
    sortedIndices.sort((a, b) => b - a);
    const evictedItems: T[] = [];

    for (const index of sortedIndices) {
      if (index >= 0 && index < this.length) {
        evictedItems.push(...this.splice(index, 1));
        this.accessTimes.delete(index);
      }
    }

    return evictedItems;
  }

  /**
   * Get size statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    utilization: number;
    policy: string;
  } {
    return {
      size: this.length,
      maxSize: this.config.maxSize,
      utilization: Math.round((this.length / this.config.maxSize) * 100),
      policy: this.config.evictionPolicy,
    };
  }

  /**
   * Force cleanup
   */
  forceCleanup(targetSize?: number): number {
    const target = targetSize || Math.floor(this.config.maxSize * 0.5);
    const itemsToRemove = Math.max(0, this.length - target);

    if (itemsToRemove > 0) {
      this.evictItems(itemsToRemove);
    }

    return itemsToRemove;
  }
}

// ============================================================================
// BOUNDED BUFFER CLASS
// ============================================================================

export class BoundedBuffer {
  private chunks: Buffer[];
  private totalSize: number;
  private maxSize: number;
  private maxChunks: number;

  constructor(maxSize: number = 10 * 1024 * 1024, maxChunks: number = 1000) {
    this.chunks = [];
    this.totalSize = 0;
    this.maxSize = maxSize; // 10MB default
    this.maxChunks = maxChunks; // 1000 chunks default

    logger.debug("🛡️ BoundedBuffer created", "BoundedBuffer", {
      maxSize: `${(maxSize / 1024 / 1024).toFixed(1)}MB`,
      maxChunks,
    });
  }

  /**
   * Add chunk with size checking
   */
  push(chunk: Buffer): boolean {
    // Check size limits
    if (this.totalSize + chunk.length > this.maxSize) {
      logger.warn("⚠️ BoundedBuffer size limit exceeded", "BoundedBuffer", {
        currentSize: `${(this.totalSize / 1024).toFixed(1)}KB`,
        chunkSize: `${(chunk.length / 1024).toFixed(1)}KB`,
        maxSize: `${(this.maxSize / 1024 / 1024).toFixed(1)}MB`,
      });
      return false;
    }

    // Check chunk count limit
    if (this.chunks.length >= this.maxChunks) {
      logger.warn("⚠️ BoundedBuffer chunk limit exceeded", "BoundedBuffer", {
        currentChunks: this.chunks.length,
        maxChunks: this.maxChunks,
      });
      return false;
    }

    this.chunks.push(chunk);
    this.totalSize += chunk.length;

    return true;
  }

  /**
   * Get concatenated buffer
   */
  toBuffer(): Buffer {
    if (this.chunks.length === 0) {
      return Buffer.alloc(0);
    }

    if (this.chunks.length === 1) {
      return this.chunks[0];
    }

    return Buffer.concat(this.chunks, this.totalSize);
  }

  /**
   * Get size statistics
   */
  getStats(): {
    chunks: number;
    totalSize: number;
    maxSize: number;
    utilization: number;
    averageChunkSize: number;
  } {
    return {
      chunks: this.chunks.length,
      totalSize: this.totalSize,
      maxSize: this.maxSize,
      utilization: Math.round((this.totalSize / this.maxSize) * 100),
      averageChunkSize:
        this.chunks.length > 0
          ? Math.round(this.totalSize / this.chunks.length)
          : 0,
    };
  }

  /**
   * Clear all chunks
   */
  clear(): void {
    this.chunks.length = 0;
    this.totalSize = 0;

    logger.debug("🧹 BoundedBuffer cleared", "BoundedBuffer");
  }

  /**
   * Remove oldest chunks to free space
   */
  trimToSize(targetSize: number): number {
    let removedSize = 0;

    while (this.totalSize > targetSize && this.chunks.length > 0) {
      const chunk = this.chunks.shift();
      if (chunk) {
        this.totalSize -= chunk.length;
        removedSize += chunk.length;
      }
    }

    if (removedSize > 0) {
      logger.debug("🗑️ BoundedBuffer trimmed", "BoundedBuffer", {
        removedSize: `${(removedSize / 1024).toFixed(1)}KB`,
        newSize: `${(this.totalSize / 1024).toFixed(1)}KB`,
        chunksRemaining: this.chunks.length,
      });
    }

    return removedSize;
  }
}

// ============================================================================
// BOUNDED SET CLASS
// ============================================================================

export class BoundedSet<T> extends Set<T> {
  private maxSize: number;
  private accessOrder: T[];

  constructor(maxSize: number = 1000) {
    super();
    this.maxSize = maxSize;
    this.accessOrder = [];

    logger.debug("🛡️ BoundedSet created", "BoundedSet", { maxSize });
  }

  /**
   * Add with automatic eviction
   */
  add(value: T): this {
    // If already exists, move to end
    if (this.has(value)) {
      const index = this.accessOrder.indexOf(value);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(value);
      return this;
    }

    // Evict oldest if at capacity
    if (this.size >= this.maxSize) {
      const oldest = this.accessOrder.shift();
      if (oldest !== undefined) {
        super.delete(oldest);
      }
    }

    super.add(value);
    this.accessOrder.push(value);

    return this;
  }

  /**
   * Delete with access order cleanup
   */
  delete(value: T): boolean {
    const deleted = super.delete(value);
    if (deleted) {
      const index = this.accessOrder.indexOf(value);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    return deleted;
  }

  /**
   * Clear with access order cleanup
   */
  clear(): void {
    super.clear();
    this.accessOrder.length = 0;
  }

  /**
   * Get utilization stats
   */
  getStats(): { size: number; maxSize: number; utilization: number } {
    return {
      size: this.size,
      maxSize: this.maxSize,
      utilization: Math.round((this.size / this.maxSize) * 100),
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create safe bounded array for errors
 */
export function createBoundedErrorArray<T>(
  maxSize: number = 100,
): BoundedArray<T> {
  return new BoundedArray<T>({
    maxSize,
    warningThreshold: 0.9,
    evictionPolicy: "fifo",
    onEviction: (error, reason) => {
      logger.debug("🗑️ Error evicted from bounded array", "BoundedArray", {
        reason,
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    },
  });
}

/**
 * Create safe bounded buffer for streaming
 */
export function createBoundedStreamBuffer(
  maxSize: number = 5 * 1024 * 1024,
): BoundedBuffer {
  return new BoundedBuffer(maxSize, 500); // 5MB, 500 chunks max
}

/**
 * Memory-safe array push with limits
 */
export function safeArrayPush<T>(
  array: T[],
  item: T,
  maxSize: number = 1000,
): { pushed: boolean; evicted?: T } {
  let evicted: T | undefined;

  if (array.length >= maxSize) {
    evicted = array.shift();
  }

  array.push(item);

  return { pushed: true, evicted };
}

/**
 * Memory-safe string concatenation with limits
 */
export function safeStringConcat(
  base: string,
  addition: string,
  maxLength: number = 1024 * 1024, // 1MB
): string {
  const newLength = base.length + addition.length;

  if (newLength > maxLength) {
    // Keep the end of the base string and new addition
    const keepSize = Math.floor(maxLength * 0.7);
    const truncated = base.slice(-keepSize) + addition;
    return truncated.slice(0, maxLength);
  }

  return base + addition;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { BoundedConfig, DEFAULT_CONFIG };
