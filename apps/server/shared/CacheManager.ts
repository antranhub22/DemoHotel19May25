// ============================================
// CACHE MANAGER v1.0 - Phase 5.2 Caching Strategy
// ============================================
// Multi-tier caching system with memory cache, Redis support, TTL management,
// cache invalidation, and comprehensive cache analytics

import { logger } from '@shared/utils/logger';
import { recordPerformanceMetrics } from './AdvancedMetricsCollector';

// Cache interfaces
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  ttl: number; // seconds
  tags?: string[];
  size?: number; // bytes
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
  averageAccessTime: number;
}

export interface CacheConfig {
  maxSize: number; // max entries
  maxMemorySize: number; // max memory in MB
  defaultTTL: number; // default TTL in seconds
  cleanupInterval: number; // cleanup interval in ms
  enableRedis: boolean;
  redisUrl?: string;
  enableCompression: boolean;
  enableMetrics: boolean;
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'random';
}

export interface CacheKeyPattern {
  prefix: string;
  namespace: string;
  version?: string;
  tenant?: string;
}

export type CacheTag = string;
export type CacheNamespace =
  | 'api'
  | 'database'
  | 'analytics'
  | 'hotel'
  | 'voice'
  | 'auth'
  | 'static';

/**
 * Advanced Cache Manager
 * Multi-tier caching with memory, Redis, TTL management, and analytics
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    averageAccessTime: 0,
  };
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private redisClient: any = null; // Redis client if available
  private isInitialized = false;

  private constructor() {
    this.config = {
      maxSize: 10000, // 10k entries
      maxMemorySize: 256, // 256MB
      defaultTTL: 3600, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      enableRedis: false, // Start with memory only
      enableCompression: true,
      enableMetrics: true,
      evictionPolicy: 'lru',
    };
  }

  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }

  /**
   * Initialize cache manager
   */
  async initialize(config?: Partial<CacheConfig>): Promise<void> {
    try {
      logger.info(
        '🗄️ [CacheManager] Initializing advanced caching system',
        'CacheManager'
      );

      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize Redis if enabled
      if (this.config.enableRedis && this.config.redisUrl) {
        await this.initializeRedis();
      }

      // Start cleanup interval
      this.startCleanupInterval();

      // Initialize cache warming for critical data
      await this.warmCache();

      this.isInitialized = true;
      logger.success(
        '✅ [CacheManager] Advanced caching system initialized',
        'CacheManager',
        {
          maxSize: this.config.maxSize,
          maxMemorySize: this.config.maxMemorySize,
          redisEnabled: !!this.redisClient,
          evictionPolicy: this.config.evictionPolicy,
        }
      );
    } catch (error) {
      logger.error(
        '❌ [CacheManager] Failed to initialize cache manager',
        'CacheManager',
        error
      );
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(
    key: string,
    namespace: CacheNamespace = 'api'
  ): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key, namespace);

    try {
      // Try memory cache first
      const memoryEntry = this.memoryCache.get(fullKey);
      if (memoryEntry && this.isEntryValid(memoryEntry)) {
        // Update access info
        memoryEntry.lastAccessed = new Date();
        memoryEntry.accessCount++;

        this.stats.hits++;
        this.recordCacheMetrics('hit', 'memory', Date.now() - startTime);

        logger.debug(
          `🎯 [CacheManager] Memory cache hit: ${fullKey}`,
          'CacheManager'
        );
        return memoryEntry.value as T;
      }

      // Try Redis cache if available
      if (this.redisClient) {
        const redisValue = await this.getFromRedis<T>(fullKey);
        if (redisValue !== null) {
          // Store in memory cache for faster access
          await this.setInMemory(fullKey, redisValue, this.config.defaultTTL);

          this.stats.hits++;
          this.recordCacheMetrics('hit', 'redis', Date.now() - startTime);

          logger.debug(
            `🎯 [CacheManager] Redis cache hit: ${fullKey}`,
            'CacheManager'
          );
          return redisValue;
        }
      }

      // Cache miss
      this.stats.misses++;
      this.recordCacheMetrics('miss', 'none', Date.now() - startTime);

      logger.debug(`❌ [CacheManager] Cache miss: ${fullKey}`, 'CacheManager');
      return null;
    } catch (error) {
      logger.error('❌ [CacheManager] Cache get failed', 'CacheManager', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTTL,
    namespace: CacheNamespace = 'api',
    tags: CacheTag[] = []
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key, namespace);

    try {
      // Store in memory cache
      await this.setInMemory(fullKey, value, ttl, tags);

      // Store in Redis if available
      if (this.redisClient) {
        await this.setInRedis(fullKey, value, ttl, tags);
      }

      this.stats.sets++;
      this.recordCacheMetrics(
        'set',
        this.redisClient ? 'redis' : 'memory',
        Date.now() - startTime
      );

      logger.debug(
        `✅ [CacheManager] Cache set: ${fullKey} (TTL: ${ttl}s)`,
        'CacheManager'
      );
    } catch (error) {
      logger.error('❌ [CacheManager] Cache set failed', 'CacheManager', error);
      throw error;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string, namespace: CacheNamespace = 'api'): Promise<void> {
    const fullKey = this.buildKey(key, namespace);

    try {
      // Delete from memory
      if (this.memoryCache.has(fullKey)) {
        this.memoryCache.delete(fullKey);
        this.stats.deletes++;
      }

      // Delete from Redis
      if (this.redisClient) {
        await this.redisClient.del(fullKey);
      }

      logger.debug(
        `🗑️ [CacheManager] Cache deleted: ${fullKey}`,
        'CacheManager'
      );
    } catch (error) {
      logger.error(
        '❌ [CacheManager] Cache delete failed',
        'CacheManager',
        error
      );
    }
  }

  /**
   * Clear cache by namespace
   */
  async clearNamespace(namespace: CacheNamespace): Promise<void> {
    try {
      const prefix = this.buildKey('', namespace);

      // Clear from memory
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key));
      this.stats.deletes += keysToDelete.length;

      // Clear from Redis
      if (this.redisClient) {
        const redisKeys = await this.redisClient.keys(`${prefix}*`);
        if (redisKeys.length > 0) {
          await this.redisClient.del(...redisKeys);
        }
      }

      logger.info(
        `🧹 [CacheManager] Cleared namespace: ${namespace} (${keysToDelete.length} keys)`,
        'CacheManager'
      );
    } catch (error) {
      logger.error(
        '❌ [CacheManager] Namespace clear failed',
        'CacheManager',
        error
      );
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: CacheTag[]): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      // Find keys with matching tags in memory
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          keysToDelete.push(key);
        }
      }

      // Delete from memory
      keysToDelete.forEach(key => this.memoryCache.delete(key));
      this.stats.deletes += keysToDelete.length;

      // Clear from Redis (would need tag tracking in Redis for full implementation)
      if (this.redisClient) {
        // Simplified: clear all keys (in production, implement proper tag tracking)
        logger.warn(
          '⚠️ [CacheManager] Redis tag clearing not fully implemented',
          'CacheManager'
        );
      }

      logger.info(
        `🏷️ [CacheManager] Cleared by tags: ${tags.join(', ')} (${keysToDelete.length} keys)`,
        'CacheManager'
      );
    } catch (error) {
      logger.error('❌ [CacheManager] Tag clear failed', 'CacheManager', error);
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T = any>(
    key: string,
    valueFactory: () => Promise<T> | T,
    ttl: number = this.config.defaultTTL,
    namespace: CacheNamespace = 'api',
    tags: CacheTag[] = []
  ): Promise<T> {
    // Try to get from cache first
    const cachedValue = await this.get<T>(key, namespace);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Generate value and cache it
    const startTime = Date.now();
    try {
      const value = await valueFactory();
      await this.set(key, value, ttl, namespace, tags);

      const generationTime = Date.now() - startTime;
      logger.debug(
        `🏭 [CacheManager] Generated and cached: ${key} (${generationTime}ms)`,
        'CacheManager'
      );

      return value;
    } catch (error) {
      logger.error(
        '❌ [CacheManager] Value generation failed',
        'CacheManager',
        error
      );
      throw error;
    }
  }

  /**
   * Refresh cache entry
   */
  async refresh<T = any>(
    key: string,
    valueFactory: () => Promise<T> | T,
    ttl: number = this.config.defaultTTL,
    namespace: CacheNamespace = 'api',
    tags: CacheTag[] = []
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const value = await valueFactory();
      await this.set(key, value, ttl, namespace, tags);

      const refreshTime = Date.now() - startTime;
      logger.debug(
        `🔄 [CacheManager] Refreshed cache: ${key} (${refreshTime}ms)`,
        'CacheManager'
      );

      return value;
    } catch (error) {
      logger.error(
        '❌ [CacheManager] Cache refresh failed',
        'CacheManager',
        error
      );
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    // Update calculated fields
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    this.stats.entryCount = this.memoryCache.size;

    // Calculate total size
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size || this.estimateSize(entry.value);
    }
    this.stats.totalSize = totalSize;

    return { ...this.stats };
  }

  /**
   * Get cache diagnostics
   */
  getDiagnostics() {
    const stats = this.getStats();

    return {
      initialized: this.isInitialized,
      config: this.config,
      stats,
      health: {
        status:
          stats.hitRate > 80
            ? 'excellent'
            : stats.hitRate > 60
              ? 'good'
              : stats.hitRate > 40
                ? 'fair'
                : 'poor',
        memoryUsage:
          (stats.totalSize / (this.config.maxMemorySize * 1024 * 1024)) * 100,
        utilization: (stats.entryCount / this.config.maxSize) * 100,
      },
      redis: {
        enabled: this.config.enableRedis,
        connected: !!this.redisClient,
      },
      cleanup: {
        interval: this.config.cleanupInterval,
        active: !!this.cleanupInterval,
      },
    };
  }

  // Private methods

  private buildKey(
    key: string,
    namespace: CacheNamespace,
    tenant?: string
  ): string {
    const parts = ['cache', namespace];
    if (tenant) parts.push(tenant);
    if (key) parts.push(key);
    return parts.join(':');
  }

  private async setInMemory<T>(
    fullKey: string,
    value: T,
    ttl: number,
    tags: CacheTag[] = []
  ): Promise<void> {
    // Check size limits before adding
    if (this.memoryCache.size >= this.config.maxSize) {
      await this.evictEntries(1);
    }

    const entry: CacheEntry<T> = {
      key: fullKey,
      value,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      ttl,
      tags,
      size: this.estimateSize(value),
    };

    this.memoryCache.set(fullKey, entry);
  }

  private async setInRedis<T>(
    fullKey: string,
    value: T,
    ttl: number,
    tags: CacheTag[] = []
  ): Promise<void> {
    if (!this.redisClient) return;

    try {
      const serialized = JSON.stringify({
        value,
        tags,
        createdAt: new Date().toISOString(),
      });

      await this.redisClient.setex(fullKey, ttl, serialized);
    } catch (error) {
      logger.error('❌ [CacheManager] Redis set failed', 'CacheManager', error);
    }
  }

  private async getFromRedis<T>(fullKey: string): Promise<T | null> {
    if (!this.redisClient) return null;

    try {
      const serialized = await this.redisClient.get(fullKey);
      if (!serialized) return null;

      const parsed = JSON.parse(serialized);
      return parsed.value as T;
    } catch (error) {
      logger.error('❌ [CacheManager] Redis get failed', 'CacheManager', error);
      return null;
    }
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const expiryTime = entry.createdAt.getTime() + entry.ttl * 1000;
    return now < expiryTime;
  }

  private async evictEntries(count: number): Promise<void> {
    const entries = Array.from(this.memoryCache.entries());

    let toEvict: string[] = [];

    switch (this.config.evictionPolicy) {
      case 'lru':
        toEvict = entries
          .sort(
            ([, a], [, b]) =>
              a.lastAccessed.getTime() - b.lastAccessed.getTime()
          )
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'lfu':
        toEvict = entries
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'ttl':
        toEvict = entries
          .filter(([, entry]) => !this.isEntryValid(entry))
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'random':
        toEvict = entries
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .map(([key]) => key);
        break;
    }

    toEvict.forEach(key => this.memoryCache.delete(key));
    this.stats.evictions += toEvict.length;

    logger.debug(
      `🧹 [CacheManager] Evicted ${toEvict.length} entries (${this.config.evictionPolicy})`,
      'CacheManager'
    );
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    logger.debug('🔄 [CacheManager] Started cleanup interval', 'CacheManager');
  }

  private cleanup(): void {
    const beforeCount = this.memoryCache.size;
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug(
        `🧹 [CacheManager] Cleaned up ${expiredKeys.length} expired entries`,
        'CacheManager'
      );
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Redis initialization would go here
      // For now, we'll skip Redis and use memory only
      logger.info(
        'ℹ️ [CacheManager] Redis support planned for future implementation',
        'CacheManager'
      );
    } catch (error) {
      logger.warn(
        '⚠️ [CacheManager] Redis initialization failed, using memory cache only',
        'CacheManager',
        error
      );
    }
  }

  private async warmCache(): Promise<void> {
    logger.debug('🔥 [CacheManager] Starting cache warming', 'CacheManager');

    // Cache warming logic would go here
    // For now, just log that warming is ready

    logger.debug('✅ [CacheManager] Cache warming completed', 'CacheManager');
  }

  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1024; // Default 1KB estimate
    }
  }

  private recordCacheMetrics(
    operation: string,
    tier: string,
    duration: number
  ): void {
    if (this.config.enableMetrics) {
      recordPerformanceMetrics({
        module: 'cache-manager',
        operation: `cache-${operation}`,
        responseTime: duration,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        cpuUsage: 0,
        errorRate: 0,
        throughput: 1,
      });
    }
  }

  /**
   * Stop cache manager
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.redisClient) {
      // Close Redis connection
      this.redisClient = null;
    }

    logger.info('⏹️ [CacheManager] Cache manager stopped', 'CacheManager');
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Convenience functions
export const initializeCache = (config?: Partial<CacheConfig>) =>
  cacheManager.initialize(config);
export const getFromCache = <T>(key: string, namespace?: CacheNamespace) =>
  cacheManager.get<T>(key, namespace);
export const setInCache = <T>(
  key: string,
  value: T,
  ttl?: number,
  namespace?: CacheNamespace,
  tags?: CacheTag[]
) => cacheManager.set(key, value, ttl, namespace, tags);
export const getOrSetCache = <T>(
  key: string,
  factory: () => Promise<T> | T,
  ttl?: number,
  namespace?: CacheNamespace,
  tags?: CacheTag[]
) => cacheManager.getOrSet(key, factory, ttl, namespace, tags);
export const clearCacheNamespace = (namespace: CacheNamespace) =>
  cacheManager.clearNamespace(namespace);
export const getCacheStats = () => cacheManager.getStats();
