/**
 * Dashboard Cache Service - ZERO RISK Enhancement
 * Transparent caching layer with automatic fallback to original data sources
 */

import { errorTracking } from "@server/services/ErrorTracking";
import { logger } from "@shared/utils/logger";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  size?: number; // Track entry size for LRU eviction
  accessCount?: number; // Track access frequency for LRU
  lastAccessed?: number; // Track last access time for LRU
}

export interface CacheConfig {
  defaultTTL: number; // milliseconds
  maxSize: number; // maximum number of entries
  maxMemoryMB: number; // maximum memory usage in MB
  cleanupInterval: number; // cleanup interval in milliseconds
  evictionPolicy: "lru" | "lfu" | "fifo"; // eviction strategy
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private totalMemoryUsage = 0; // Track memory usage in bytes
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    cleanups: 0,
    evictions: 0,
    memoryUsageMB: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 60000, // 1 minute default
      maxSize: 500, // Reduced from 1000 to 500 entries max
      maxMemoryMB: 50, // 50MB memory limit
      cleanupInterval: 300000, // 5 minutes cleanup
      evictionPolicy: "lru", // LRU by default
      ...config,
    };

    // Start automatic cleanup
    this.startCleanup();

    logger.debug("💾 [DashboardCache] Initialized", "Cache", {
      defaultTTL: this.config.defaultTTL,
      maxSize: this.config.maxSize,
      maxMemoryMB: this.config.maxMemoryMB,
      evictionPolicy: this.config.evictionPolicy,
      cleanupInterval: this.config.cleanupInterval,
    });
  }

  /**
   * Get data with automatic fallback
   * ZERO RISK: If cache fails, automatically calls fallback function
   */
  async get<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = this.cache.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < cached.ttl) {
        this.stats.hits++;

        // ✅ LRU TRACKING: Update access information
        cached.accessCount = (cached.accessCount || 0) + 1;
        cached.lastAccessed = now;

        logger.debug("🎯 [DashboardCache] Cache HIT", "Cache", {
          key,
          age: now - cached.timestamp,
          ttl: cached.ttl,
          accessCount: cached.accessCount,
        });

        return cached.data as T;
      }

      // Cache miss or expired - get fresh data
      this.stats.misses++;

      logger.debug(
        "🔄 [DashboardCache] Cache MISS - fetching fresh data",
        "Cache",
        {
          key,
          expired: cached ? now - cached.timestamp >= cached.ttl : false,
          exists: !!cached,
        },
      );

      const freshData = await fallbackFn();

      // Store in cache
      this.set(key, freshData, ttl);

      return freshData;
    } catch (error) {
      // ✅ ZERO RISK: If cache operations fail, still return data
      logger.warn(
        "⚠️ [DashboardCache] Cache operation failed, using fallback",
        "Cache",
        {
          key,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );

      try {
        return await fallbackFn();
      } catch (fallbackError) {
        logger.error(
          "❌ [DashboardCache] Fallback function also failed",
          "Cache",
          {
            key,
            fallbackError:
              fallbackError instanceof Error
                ? fallbackError.message
                : "Unknown error",
          },
        );

        // ✅ ENHANCEMENT: Report critical cache error
        errorTracking.reportError(
          "Cache",
          "fallback_failure",
          fallbackError instanceof Error
            ? fallbackError
            : new Error("Fallback failed"),
          { key, operation: "cache_get" },
          "high", // Cache failures are high severity
        );

        throw fallbackError;
      }
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const actualTTL = ttl || this.config.defaultTTL;

      // ✅ MEMORY-AWARE EVICTION: Check both size and memory limits
      const entrySize = this.estimateSize(data);
      const memoryUsageMB = this.totalMemoryUsage / (1024 * 1024);

      // Evict if necessary before adding new entry
      while (
        (this.cache.size >= this.config.maxSize ||
          memoryUsageMB > this.config.maxMemoryMB) &&
        this.cache.size > 0
      ) {
        this.evictByPolicy();
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: actualTTL,
        key,
        size: entrySize,
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      this.cache.set(key, entry);
      this.totalMemoryUsage += entrySize;
      this.stats.sets++;
      this.stats.memoryUsageMB = this.totalMemoryUsage / (1024 * 1024);

      logger.debug("💾 [DashboardCache] Data cached", "Cache", {
        key,
        ttl: actualTTL,
        size: this.cache.size,
        entrySize: `${(entrySize / 1024).toFixed(1)}KB`,
        totalMemoryMB: this.stats.memoryUsageMB.toFixed(1),
      });
    } catch (error) {
      // Silent fail - cache errors should not break the app
      logger.warn("⚠️ [DashboardCache] Failed to set cache", "Cache", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      const deleted = this.cache.delete(key);
      if (deleted && entry) {
        this.totalMemoryUsage -= entry.size || 0;
        this.stats.deletes++;
        this.stats.memoryUsageMB = this.totalMemoryUsage / (1024 * 1024);
        logger.debug("🗑️ [DashboardCache] Cache entry deleted", "Cache", {
          key,
          freedMemoryKB: entry.size
            ? (entry.size / 1024).toFixed(1)
            : "unknown",
        });
      }
      return deleted;
    } catch (error) {
      logger.warn("⚠️ [DashboardCache] Failed to delete cache entry", "Cache", {
        key,
        error,
      });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      logger.debug("🧹 [DashboardCache] Cache cleared", "Cache", {
        previousSize: size,
      });
    } catch (error) {
      logger.warn("⚠️ [DashboardCache] Failed to clear cache", "Cache", error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      let deletedCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp >= entry.ttl) {
          this.cache.delete(key);
          deletedCount++;
        }
      }

      this.stats.cleanups++;

      if (deletedCount > 0) {
        logger.debug("🧹 [DashboardCache] Cleanup completed", "Cache", {
          deletedEntries: deletedCount,
          remainingSize: this.cache.size,
        });
      }
    } catch (error) {
      logger.warn("⚠️ [DashboardCache] Cleanup failed", "Cache", error);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer (for shutdown)
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
    logger.debug("🛑 [DashboardCache] Cache destroyed", "Cache");
  }
}

// Singleton instance with optimized settings for dashboard
export const dashboardCache = new DashboardCache({
  defaultTTL: 60000, // 1 minute for dashboard data
  maxSize: 500, // 500 entries should be enough
  cleanupInterval: 300000, // 5 minutes cleanup
});

// Export for debugging in development
if (process.env.NODE_ENV === "development") {
  (global as any).dashboardCache = dashboardCache;
}

// Cache key generators for consistency
export const CacheKeys = {
  staffRequests: (tenantId: string) => `staff:requests:${tenantId}`,
  dashboardMetrics: (tenantId: string, timeRange?: string) =>
    `dashboard:metrics:${tenantId}:${timeRange || "default"}`,
  callsSummary: (tenantId: string) => `calls:summary:${tenantId}`,
  systemMetrics: () => "system:metrics",
  performanceStats: () => "performance:stats",
};

export default dashboardCache;
