// ============================================
// CACHING MIDDLEWARE v1.0 - Phase 5.2 Caching Strategy
// ============================================
// Comprehensive middleware for automatic API response caching, database caching,
// and intelligent cache invalidation with performance tracking

import {
  cacheManager,
  type CacheNamespace,
  type CacheTag,
} from '@server/shared/CacheManager';
import { logger } from '@shared/utils/logger';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

interface CachedRequest extends Request {
  cacheKey?: string;
  cacheNamespace?: CacheNamespace;
  cacheTTL?: number;
  cacheTags?: CacheTag[];
  cacheStrategy?:
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only';
  skipCache?: boolean;
}

interface CacheOptions {
  ttl?: number; // seconds
  namespace?: CacheNamespace;
  tags?: CacheTag[];
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  strategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  varyBy?: string[]; // Headers/params to vary cache by
}

/**
 * API Response Caching Middleware
 * Automatically cache API responses with smart invalidation
 */
export function apiCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    namespace = 'api',
    tags = [],
    keyGenerator,
    condition,
    strategy = 'cache-first',
    varyBy = [],
  } = options;

  return async (req: CachedRequest, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests by default
    if (req.method !== 'GET' && !condition) {
      return next();
    }

    // Check condition if provided
    if (condition && !condition(req, res)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : generateApiCacheKey(req, varyBy);

    req.cacheKey = cacheKey;
    req.cacheNamespace = namespace;
    req.cacheTTL = ttl;
    req.cacheTags = [...tags, `route:${req.route?.path || req.path}`];
    req.cacheStrategy = strategy;

    const startTime = Date.now();

    try {
      // Try to get from cache first (for cache-first strategy)
      if (strategy === 'cache-first' || strategy === 'cache-only') {
        const cachedResponse = await cacheManager.get(cacheKey, namespace);

        if (cachedResponse) {
          const cacheTime = Date.now() - startTime;

          // Set cache headers
          res.set({
            'X-Cache': 'HIT',
            'X-Cache-Time': `${cacheTime}ms`,
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${ttl}`,
          });

          logger.debug(
            `🎯 [ApiCache] Cache hit: ${req.method} ${req.path} (${cacheTime}ms)`,
            'CacheMiddleware'
          );

          return res.json(cachedResponse);
        }

        // If cache-only and no cache, return error
        if (strategy === 'cache-only') {
          return res.status(404).json({
            error: 'Resource not found in cache',
            cacheKey,
            strategy: 'cache-only',
          });
        }
      }

      // Proceed to route handler for cache miss or network-first strategy
      const originalSend = res.send;
      const originalJson = res.json;

      // Override res.json to intercept response
      res.json = function (data) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheTime = Date.now() - startTime;

          // Store in cache asynchronously
          cacheManager
            .set(cacheKey, data, ttl, namespace, req.cacheTags)
            .catch(error => {
              logger.error(
                '❌ [ApiCache] Failed to cache response',
                'CacheMiddleware',
                error
              );
            });

          // Set cache headers
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Time': `${cacheTime}ms`,
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${ttl}`,
          });

          logger.debug(
            `💾 [ApiCache] Response cached: ${req.method} ${req.path} (${cacheTime}ms)`,
            'CacheMiddleware'
          );
        }

        return originalJson.call(this, data);
      };

      // Override res.send for non-JSON responses
      res.send = function (data) {
        if (
          res.statusCode >= 200 &&
          res.statusCode < 300 &&
          typeof data === 'string'
        ) {
          cacheManager
            .set(cacheKey, data, ttl, namespace, req.cacheTags)
            .catch(error => {
              logger.error(
                '❌ [ApiCache] Failed to cache response',
                'CacheMiddleware',
                error
              );
            });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(
        '❌ [ApiCache] Caching middleware error',
        'CacheMiddleware',
        error
      );
      next(); // Continue without caching
    }
  };
}

/**
 * Database Query Caching Wrapper
 * Cache database query results with automatic invalidation
 */
export function cacheQuery<T = any>(
  queryKey: string,
  queryFunction: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: CacheTag[];
    namespace?: CacheNamespace;
    tenant?: string;
  } = {}
): Promise<T> {
  const {
    ttl = 600, // 10 minutes default for DB queries
    tags = [],
    namespace = 'database',
    tenant,
  } = options;

  const fullKey = tenant ? `${tenant}:${queryKey}` : queryKey;
  const cacheTags = [...tags, 'database-query'];

  return cacheManager.getOrSet(
    fullKey,
    async () => {
      const startTime = Date.now();

      try {
        // Execute the database query function safely
        const queryResult = await queryFunction();
        const queryTime = Date.now() - startTime;

        logger.debug(
          `📊 [DbCache] Query executed and cached: ${queryKey} (${queryTime}ms)`,
          'CacheMiddleware'
        );

        return queryResult;
      } catch (error) {
        logger.error(
          '❌ [DbCache] Query execution failed',
          'CacheMiddleware',
          error
        );
        throw error;
      }
    },
    ttl,
    namespace,
    cacheTags
  );
}

/**
 * Hotel Data Caching Middleware
 * Specific caching for hotel research and configuration data
 */
export function hotelDataCacheMiddleware(
  options: {
    ttl?: number;
    autoInvalidate?: boolean;
  } = {}
) {
  const { ttl = 1800 } = options; // 30 minutes default

  return apiCacheMiddleware({
    ttl,
    namespace: 'hotel',
    tags: ['hotel-data'],
    condition: req => {
      // Cache hotel research and configuration endpoints
      return (
        req.path.includes('/hotel') ||
        req.path.includes('/research') ||
        req.path.includes('/assistant')
      );
    },
    keyGenerator: req => {
      const tenantId = req.headers['x-tenant-id'] || 'default';
      return `hotel:${tenantId}:${req.path}:${generateParamsHash(req.query)}`;
    },
    varyBy: ['x-tenant-id', 'authorization'],
  });
}

/**
 * Analytics Data Caching Middleware
 * Cache analytics data with shorter TTL due to frequent updates
 */
export function analyticsCacheMiddleware(
  options: {
    ttl?: number;
  } = {}
) {
  const { ttl = 120 } = options; // 2 minutes for analytics

  return apiCacheMiddleware({
    ttl,
    namespace: 'analytics',
    tags: ['analytics-data'],
    condition: req => {
      return req.path.includes('/analytics') || req.path.includes('/hotel-dashboard') || req.path.includes('/saas-dashboard');
    },
    keyGenerator: req => {
      const tenantId = req.headers['x-tenant-id'] || 'default';
      const timeWindow = req.query.period || 'day';
      return `analytics:${tenantId}:${req.path}:${timeWindow}:${generateParamsHash(req.query)}`;
    },
    varyBy: ['x-tenant-id'],
  });
}

/**
 * Static Data Caching Middleware
 * Long-term caching for static/configuration data
 */
export function staticDataCacheMiddleware(
  options: {
    ttl?: number;
  } = {}
) {
  const { ttl = 3600 } = options; // 1 hour for static data

  return apiCacheMiddleware({
    ttl,
    namespace: 'static',
    tags: ['static-data'],
    condition: req => {
      return (
        req.path.includes('/config') ||
        req.path.includes('/features') ||
        req.path.includes('/health')
      );
    },
    keyGenerator: req => `static:${req.path}:${generateParamsHash(req.query)}`,
  });
}

/**
 * Cache Invalidation Middleware
 * Automatically invalidate cache on data mutations
 */
export function cacheInvalidationMiddleware(
  options: {
    patterns?: Array<{
      methods: string[];
      pathPattern: RegExp;
      invalidateTags: CacheTag[];
      invalidateNamespaces?: CacheNamespace[];
    }>;
  } = {}
) {
  const defaultPatterns = [
    {
      methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      pathPattern: /\/hotel\//,
      invalidateTags: ['hotel-data'],
      invalidateNamespaces: ['hotel' as CacheNamespace],
    },
    {
      methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      pathPattern: /\/analytics\//,
      invalidateTags: ['analytics-data'],
    },
    {
      methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      pathPattern: /\/requests?\//,
      invalidateTags: ['hotel-data', 'analytics-data'],
    },
    {
      methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      pathPattern: /\/calls?\//,
      invalidateTags: ['voice-data', 'analytics-data'],
    },
  ];

  const patterns = options.patterns || defaultPatterns;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to trigger invalidation on success
    const setupInvalidation = () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Find matching patterns
        const matchingPatterns = patterns.filter(
          pattern =>
            pattern.methods.includes(req.method) &&
            pattern.pathPattern.test(req.path)
        );

        // Invalidate cache for matching patterns
        matchingPatterns.forEach(async pattern => {
          try {
            // Invalidate by tags
            if (pattern.invalidateTags.length > 0) {
              await cacheManager.clearByTags(pattern.invalidateTags);
              logger.debug(
                `🧹 [CacheInvalidation] Cleared tags: ${pattern.invalidateTags.join(', ')}`,
                'CacheMiddleware'
              );
            }

            // Invalidate by namespaces
            if (pattern.invalidateNamespaces) {
              for (const namespace of pattern.invalidateNamespaces) {
                await cacheManager.clearNamespace(namespace);
                logger.debug(
                  `🧹 [CacheInvalidation] Cleared namespace: ${namespace}`,
                  'CacheMiddleware'
                );
              }
            }
          } catch (error) {
            logger.error(
              '❌ [CacheInvalidation] Failed to invalidate cache',
              'CacheMiddleware',
              error
            );
          }
        });
      }
    };

    res.json = function (data) {
      setupInvalidation();
      return originalJson.call(this, data);
    };

    res.send = function (data) {
      setupInvalidation();
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Conditional Caching Middleware
 * Cache based on custom conditions
 */
export function conditionalCacheMiddleware(
  condition: (req: Request) => boolean,
  cacheOptions: CacheOptions
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return apiCacheMiddleware(cacheOptions)(req, res, next);
    }
    next();
  };
}

/**
 * Cache Warming Middleware
 * Pre-populate cache with commonly accessed data
 */
export function cacheWarmingMiddleware(
  warmingFunctions: Array<{
    key: string;
    factory: () => Promise<any>;
    ttl: number;
    namespace: CacheNamespace;
    tags: CacheTag[];
  }>
) {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    // Run cache warming in background (don't block request)
    setImmediate(async () => {
      for (const warming of warmingFunctions) {
        try {
          await cacheManager.getOrSet(
            warming.key,
            warming.factory,
            warming.ttl,
            warming.namespace,
            warming.tags
          );

          logger.debug(
            `🔥 [CacheWarming] Warmed cache: ${warming.key}`,
            'CacheMiddleware'
          );
        } catch (error) {
          logger.error(
            '❌ [CacheWarming] Failed to warm cache',
            'CacheMiddleware',
            error
          );
        }
      }
    });

    next();
  };
}

// Helper functions

function generateApiCacheKey(req: Request, varyBy: string[] = []): string {
  const baseKey = `${req.method}:${req.path}`;

  // Add query parameters
  const queryHash = generateParamsHash(req.query);

  // Add varying headers
  const varyData: any = {};
  varyBy.forEach(header => {
    varyData[header] = req.headers[header.toLowerCase()] || req.query[header];
  });
  const varyHash = generateParamsHash(varyData);

  return `${baseKey}:${queryHash}:${varyHash}`;
}

function generateParamsHash(params: any): string {
  if (!params || Object.keys(params).length === 0) {
    return 'empty';
  }

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result: any, key) => {
      result[key] = params[key];
      return result;
    }, {});

  return crypto
    .createHash('md5')
    .update(JSON.stringify(sortedParams))
    .digest('hex')
    .substring(0, 8);
}

// Specialized caching functions

/**
 * Cache hotel research data
 */
export async function cacheHotelResearch(
  hotelName: string,
  location: string,
  researchFunction: () => Promise<any>,
  ttl: number = 3600 // 1 hour
) {
  const key = `research:${hotelName}:${location}`;
  return cacheQuery(key, researchFunction, {
    ttl,
    tags: ['hotel-research', 'hotel-data'],
    namespace: 'hotel',
  });
}

/**
 * Cache assistant configuration
 */
export async function cacheAssistantConfig(
  tenantId: string,
  configFunction: () => Promise<any>,
  ttl: number = 1800 // 30 minutes
) {
  const key = `assistant-config:${tenantId}`;
  return cacheQuery(key, configFunction, {
    ttl,
    tags: ['assistant-config', 'hotel-data'],
    namespace: 'hotel',
    tenant: tenantId,
  });
}

/**
 * Cache analytics data
 */
export async function cacheAnalyticsData(
  tenantId: string,
  type: string,
  period: string,
  analyticsFunction: () => Promise<any>,
  ttl: number = 300 // 5 minutes
) {
  const key = `analytics:${type}:${period}`;
  return cacheQuery(key, analyticsFunction, {
    ttl,
    tags: ['analytics-data', `analytics-${type}`],
    namespace: 'analytics',
    tenant: tenantId,
  });
}
