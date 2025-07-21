// ============================================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ============================================================================

import { performance } from 'perf_hooks';
import { logger } from '@shared/utils/logger';

// ============================================================================
// CACHING SYSTEM
// ============================================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) {
    // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    // Evict expired entries
    this.evictExpired();

    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }
}

// Global cache instance
export const cache = new MemoryCache();

// ============================================================================
// DATABASE QUERY OPTIMIZATION
// ============================================================================

export class QueryOptimizer {
  private static queryCache = new Map<
    string,
    { result: any; timestamp: number }
  >();
  private static readonly CACHE_TTL = 60000; // 1 minute

  static async withCache<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }

    const result = await queryFn();
    this.queryCache.set(key, { result, timestamp: Date.now() });
    return result;
  }

  static clearCache(): void {
    this.queryCache.clear();
  }

  static generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }
}

// ============================================================================
// CONNECTION POOLING
// ============================================================================

export class ConnectionPool {
  private connections: any[] = [];
  private readonly maxConnections: number;
  private readonly minConnections: number;
  private inUse = new Set<any>();

  constructor(maxConnections: number = 10, minConnections: number = 2) {
    this.maxConnections = maxConnections;
    this.minConnections = minConnections;
  }

  async getConnection(): Promise<any> {
    // Return available connection
    const available = this.connections.find(conn => !this.inUse.has(conn));
    if (available) {
      this.inUse.add(available);
      return available;
    }

    // Create new connection if under limit
    if (this.connections.length < this.maxConnections) {
      const newConnection = await this.createConnection();
      this.connections.push(newConnection);
      this.inUse.add(newConnection);
      return newConnection;
    }

    // Wait for available connection
    return new Promise(resolve => {
      const checkForConnection = () => {
        const available = this.connections.find(conn => !this.inUse.has(conn));
        if (available) {
          this.inUse.add(available);
          resolve(available);
        } else {
          setTimeout(checkForConnection, 100);
        }
      };
      checkForConnection();
    });
  }

  releaseConnection(connection: any): void {
    this.inUse.delete(connection);
  }

  private async createConnection(): Promise<any> {
    // Implementation depends on your database driver
    // This is a placeholder
    return {};
  }

  getStats() {
    return {
      total: this.connections.length,
      inUse: this.inUse.size,
      available: this.connections.length - this.inUse.size,
      maxConnections: this.maxConnections,
    };
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class PerformanceMonitor {
  private static metrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      minTime: number;
      maxTime: number;
      avgTime: number;
    }
  >();

  static startTimer(operation: string): () => void {
    const start = performance.now();
    return () => this.endTimer(operation, start);
  }

  private static endTimer(operation: string, start: number): void {
    const duration = performance.now() - start;
    const existing = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.avgTime = existing.totalTime / existing.count;

    this.metrics.set(operation, existing);

    // Log slow operations
    if (duration > 1000) {
      // 1 second threshold
      logger.warn(
        `Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`
      );
    }
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  static resetMetrics(): void {
    this.metrics.clear();
  }
}

// ============================================================================
// ASYNC OPERATIONS OPTIMIZATION
// ============================================================================

export class AsyncOptimizer {
  private static concurrencyLimits = new Map<string, number>();
  private static runningTasks = new Map<string, number>();

  static async withConcurrencyLimit<T>(
    key: string,
    limit: number,
    task: () => Promise<T>
  ): Promise<T> {
    this.concurrencyLimits.set(key, limit);
    const current = this.runningTasks.get(key) || 0;

    if (current >= limit) {
      // Wait for slot to become available
      await new Promise<void>(resolve => {
        const checkLimit = () => {
          const running = this.runningTasks.get(key) || 0;
          if (running < limit) {
            resolve();
          } else {
            setTimeout(checkLimit, 100);
          }
        };
        checkLimit();
      });
    }

    this.runningTasks.set(key, current + 1);
    try {
      return await task();
    } finally {
      this.runningTasks.set(key, (this.runningTasks.get(key) || 1) - 1);
    }
  }

  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    const batches = this.chunkArray(items, batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item =>
          this.withConcurrencyLimit('batch', concurrency, () => processor(item))
        )
      );
      results.push(...batchResults);
    }

    return results;
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

export class MemoryOptimizer {
  private static memoryThreshold = 0.8; // 80% memory usage threshold
  private static lastGC = Date.now();
  private static readonly GC_INTERVAL = 300000; // 5 minutes

  static checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const heapUsed = usage.heapUsed / usage.heapTotal;

    if (heapUsed > this.memoryThreshold) {
      logger.warn(
        `High memory usage detected: ${(heapUsed * 100).toFixed(2)}% (${Math.round(usage.heapUsed / 1024 / 1024)}MB/${Math.round(usage.heapTotal / 1024 / 1024)}MB)`
      );

      // Force garbage collection if available
      if (global.gc && Date.now() - this.lastGC > this.GC_INTERVAL) {
        global.gc();
        this.lastGC = Date.now();
        logger.info('Garbage collection performed');
      }

      // Clear caches
      cache.clear();
      QueryOptimizer.clearCache();
    }
  }

  static getMemoryStats() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsedPercentage: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
    };
  }
}

// ============================================================================
// RESPONSE OPTIMIZATION
// ============================================================================

export class ResponseOptimizer {
  static compressResponse(data: any): any {
    // Remove null/undefined values
    const cleanData = this.removeNullValues(data);

    // Limit array sizes
    if (Array.isArray(cleanData) && cleanData.length > 1000) {
      return cleanData.slice(0, 1000);
    }

    return cleanData;
  }

  private static removeNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeNullValues(item))
        .filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeNullValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return cleaned;
    }

    return obj;
  }

  static paginateResults<T>(
    data: T[],
    page: number = 1,
    limit: number = 20
  ): { data: T[]; pagination: any } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1,
      },
    };
  }
}

// ============================================================================
// MIDDLEWARE FOR PERFORMANCE
// ============================================================================

export const performanceMiddleware = (req: any, res: any, next: any) => {
  const endTimer = PerformanceMonitor.startTimer(`${req.method} ${req.path}`);

  res.on('finish', () => {
    endTimer();

    // Log slow requests
    const duration = performance.now();
    if (duration > 1000) {
      logger.warn(
        `Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms (${res.statusCode})`
      );
    }
  });

  next();
};

export const cacheMiddleware = (ttl: number = 300000) => {
  return (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const originalSend = res.json;
    res.json = function (data: any) {
      cache.set(cacheKey, data, ttl);
      return originalSend.call(this, data);
    };

    next();
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const performanceUtils = {
  cache,
  QueryOptimizer,
  ConnectionPool,
  PerformanceMonitor,
  AsyncOptimizer,
  MemoryOptimizer,
  ResponseOptimizer,
  performanceMiddleware,
  cacheMiddleware,
  debounce,
  throttle,
  memoize,
};
