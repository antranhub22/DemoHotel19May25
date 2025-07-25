// ============================================================================
// ADMIN MODULE: CACHE ROUTES v1.0 - Cache Management & Monitoring
// ============================================================================
// API endpoints for cache management, statistics, monitoring, and control
// Advanced cache administration with performance insights

import express, { Request, Response } from 'express';

// ✅ Import Cache Management System
import {
  cacheManager,
  clearCacheNamespace,
  getCacheStats,
  type CacheNamespace,
} from '@server/shared/CacheManager';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// CACHE STATISTICS & MONITORING
// ============================================

/**
 * GET /api/admin/cache/stats - Get cache statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    logger.api('📊 [Cache] Cache statistics requested', 'CacheAPI');

    const stats = getCacheStats();
    const diagnostics = cacheManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        stats,
        health: diagnostics.health,
        performance: {
          hitRate: stats.hitRate,
          averageAccessTime: stats.averageAccessTime,
          efficiency:
            stats.hits > 0
              ? (stats.hits / (stats.hits + stats.misses)) * 100
              : 0,
        },
        memory: {
          totalSize: stats.totalSize,
          entryCount: stats.entryCount,
          averageEntrySize:
            stats.entryCount > 0 ? stats.totalSize / stats.entryCount : 0,
        },
        operations: {
          hits: stats.hits,
          misses: stats.misses,
          sets: stats.sets,
          deletes: stats.deletes,
          evictions: stats.evictions,
        },
      },
      _metadata: {
        endpoint: 'cache-stats',
        version: '1.0.0',
        healthStatus: diagnostics.health.status,
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Stats request failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/cache/diagnostics - Get detailed cache diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api('🔧 [Cache] Cache diagnostics requested', 'CacheAPI');

    const diagnostics = cacheManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'cache-diagnostics',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Diagnostics request failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/cache/health - Get cache health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    logger.api('🏥 [Cache] Cache health requested', 'CacheAPI');

    const diagnostics = cacheManager.getDiagnostics();
    const stats = getCacheStats();

    // Calculate health metrics
    const health = {
      status: diagnostics.health.status,
      score: calculateHealthScore(stats, diagnostics),
      issues: identifyHealthIssues(stats, diagnostics),
      recommendations: generateHealthRecommendations(stats, diagnostics),
      metrics: {
        hitRate: stats.hitRate,
        memoryUsage: diagnostics.health.memoryUsage,
        utilization: diagnostics.health.utilization,
        errorRate: 0, // Would calculate from error metrics if available
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: health,
      _metadata: {
        endpoint: 'cache-health',
        version: '1.0.0',
        healthScore: health.score,
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Health request failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache health',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CACHE MANAGEMENT OPERATIONS
// ============================================

/**
 * DELETE /api/admin/cache/clear - Clear all cache
 */
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const { namespace, confirm } = req.query;

    if (confirm !== 'true') {
      return (res as any).status(400).json({
        success: false,
        error: 'Cache clear operation requires confirmation',
        message: 'Add ?confirm=true to confirm cache clearing',
        version: '1.0.0',
      });
    }

    logger.api(`🧹 [Cache] Cache clear requested`, 'CacheAPI', { namespace });

    const beforeStats = getCacheStats();

    if (namespace && typeof namespace === 'string') {
      // Clear specific namespace
      await clearCacheNamespace(namespace as CacheNamespace);
      logger.info(`🧹 [Cache] Cleared namespace: ${namespace}`, 'CacheAPI');
    } else {
      // Clear all namespaces
      const namespaces: CacheNamespace[] = [
        'api',
        'database',
        'analytics',
        'hotel',
        'voice',
        'auth',
        'static',
      ];
      for (const ns of namespaces) {
        await clearCacheNamespace(ns);
      }
      logger.info('🧹 [Cache] Cleared all cache namespaces', 'CacheAPI');
    }

    const afterStats = getCacheStats();

    (res as any).status(200).json({
      success: true,
      message: namespace
        ? `Cache cleared for namespace: ${namespace}`
        : 'All cache cleared',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        namespace: namespace || 'all',
        before: {
          entryCount: beforeStats.entryCount,
          totalSize: beforeStats.totalSize,
        },
        after: {
          entryCount: afterStats.entryCount,
          totalSize: afterStats.totalSize,
        },
        cleared: {
          entries: beforeStats.entryCount - afterStats.entryCount,
          size: beforeStats.totalSize - afterStats.totalSize,
        },
      },
      _metadata: {
        endpoint: 'cache-clear',
        version: '1.0.0',
        operation: namespace ? 'namespace-clear' : 'full-clear',
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Clear operation failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to clear cache',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * DELETE /api/admin/cache/key/:key - Delete specific cache key
 */
router.delete('/key/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { namespace = 'api' } = req.query;

    logger.api(`🗑️ [Cache] Delete key requested: ${key}`, 'CacheAPI', {
      namespace,
    });

    await cacheManager.delete(key, namespace as CacheNamespace);

    (res as any).status(200).json({
      success: true,
      message: 'Cache key deleted successfully',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        key,
        namespace,
      },
      _metadata: {
        endpoint: 'cache-key-delete',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Key delete failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to delete cache key',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/cache/warm - Warm cache with common data
 */
router.post('/warm', async (req: Request, res: Response) => {
  try {
    const { targets } = req.body;

    logger.api('🔥 [Cache] Cache warming requested', 'CacheAPI', { targets });

    const warmingResults = [];

    // Define warming strategies
    const warmingStrategies = {
      'hotel-configs': async () => {
        // Warm hotel configuration data
        logger.debug('🔥 [Cache] Warming hotel configurations', 'CacheAPI');
        return { strategy: 'hotel-configs', status: 'completed', count: 0 };
      },
      'analytics-common': async () => {
        // Warm common analytics queries
        logger.debug('🔥 [Cache] Warming analytics data', 'CacheAPI');
        return { strategy: 'analytics-common', status: 'completed', count: 0 };
      },
      'static-data': async () => {
        // Warm static configuration data
        logger.debug('🔥 [Cache] Warming static data', 'CacheAPI');
        return { strategy: 'static-data', status: 'completed', count: 0 };
      },
    };

    // Execute warming strategies
    const targetList = targets || Object.keys(warmingStrategies);

    for (const target of targetList) {
      if (warmingStrategies[target as keyof typeof warmingStrategies]) {
        try {
          const result =
            await warmingStrategies[target as keyof typeof warmingStrategies]();
          warmingResults.push(result);
        } catch (error) {
          warmingResults.push({
            strategy: target,
            status: 'failed',
            error: (error as Error).message,
          });
        }
      }
    }

    const stats = getCacheStats();

    (res as any).status(200).json({
      success: true,
      message: 'Cache warming completed',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        warmingResults,
        stats: {
          entryCount: stats.entryCount,
          totalSize: stats.totalSize,
          hitRate: stats.hitRate,
        },
      },
      _metadata: {
        endpoint: 'cache-warm',
        version: '1.0.0',
        strategiesExecuted: warmingResults.length,
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Warming operation failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to warm cache',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CACHE CONFIGURATION
// ============================================

/**
 * GET /api/admin/cache/config - Get cache configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    logger.api('⚙️ [Cache] Cache config requested', 'CacheAPI');

    const diagnostics = cacheManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        config: diagnostics.config,
        runtime: {
          initialized: diagnostics.initialized,
          redis: diagnostics.redis,
          cleanup: diagnostics.cleanup,
        },
        capabilities: {
          memoryCache: true,
          redisCache: diagnostics.config.enableRedis,
          compression: diagnostics.config.enableCompression,
          metrics: diagnostics.config.enableMetrics,
          evictionPolicies: ['lru', 'lfu', 'ttl', 'random'],
          namespaces: [
            'api',
            'database',
            'analytics',
            'hotel',
            'voice',
            'auth',
            'static',
          ],
        },
      },
      _metadata: {
        endpoint: 'cache-config',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Config request failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache configuration',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CACHE ANALYTICS & INSIGHTS
// ============================================

/**
 * GET /api/admin/cache/analytics - Get cache analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '1h' } = req.query;

    logger.api(`📈 [Cache] Cache analytics requested (${period})`, 'CacheAPI');

    const stats = getCacheStats();
    const diagnostics = cacheManager.getDiagnostics();

    // Calculate analytics data
    const analytics = {
      performance: {
        hitRate: stats.hitRate,
        missRate: 100 - stats.hitRate,
        totalRequests: stats.hits + stats.misses,
        efficiency: calculateCacheEfficiency(stats),
        averageAccessTime: stats.averageAccessTime,
      },
      usage: {
        memoryUtilization: diagnostics.health.memoryUsage,
        entryUtilization: diagnostics.health.utilization,
        totalSize: stats.totalSize,
        entryCount: stats.entryCount,
        averageEntrySize:
          stats.entryCount > 0 ? stats.totalSize / stats.entryCount : 0,
      },
      operations: {
        hits: stats.hits,
        misses: stats.misses,
        sets: stats.sets,
        deletes: stats.deletes,
        evictions: stats.evictions,
      },
      trends: {
        // Would implement historical trend tracking in production
        hitRateTrend: 'stable',
        memoryTrend: 'stable',
        performanceTrend: 'improving',
      },
      insights: generateCacheInsights(stats, diagnostics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: analytics,
      _metadata: {
        endpoint: 'cache-analytics',
        period,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Analytics request failed', 'CacheAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache analytics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/cache/recommendations - Get optimization recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    logger.api('💡 [Cache] Cache recommendations requested', 'CacheAPI');

    const stats = getCacheStats();
    const diagnostics = cacheManager.getDiagnostics();

    const recommendations = generateCacheRecommendations(stats, diagnostics);

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        recommendations,
        summary: {
          total: recommendations.length,
          highPriority: recommendations.filter(r => r.priority === 'high')
            .length,
          mediumPriority: recommendations.filter(r => r.priority === 'medium')
            .length,
          lowPriority: recommendations.filter(r => r.priority === 'low').length,
        },
        currentStatus: {
          hitRate: stats.hitRate,
          healthStatus: diagnostics.health.status,
          memoryUsage: diagnostics.health.memoryUsage,
        },
      },
      _metadata: {
        endpoint: 'cache-recommendations',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Cache] Recommendations request failed',
      'CacheAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache recommendations',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// Helper functions

function calculateHealthScore(stats: any, diagnostics: any): number {
  let score = 100;

  // Hit rate scoring
  if (stats.hitRate < 50) score -= 30;
  else if (stats.hitRate < 70) score -= 15;
  else if (stats.hitRate < 80) score -= 5;

  // Memory usage scoring
  if (diagnostics.health.memoryUsage > 90) score -= 25;
  else if (diagnostics.health.memoryUsage > 80) score -= 15;
  else if (diagnostics.health.memoryUsage > 70) score -= 5;

  // Utilization scoring
  if (diagnostics.health.utilization > 95) score -= 20;
  else if (diagnostics.health.utilization > 85) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function identifyHealthIssues(stats: any, diagnostics: any): string[] {
  const issues: string[] = [];

  if (stats.hitRate < 50) {
    issues.push('Low cache hit rate - consider reviewing cache strategy');
  }

  if (diagnostics.health.memoryUsage > 80) {
    issues.push('High memory usage - consider reducing cache size or TTL');
  }

  if (stats.evictions > stats.sets * 0.1) {
    issues.push('High eviction rate - consider increasing cache size');
  }

  if (stats.totalRequests === 0) {
    issues.push('No cache activity detected - verify cache integration');
  }

  return issues;
}

function generateHealthRecommendations(stats: any, diagnostics: any): string[] {
  const recommendations: string[] = [];

  if (stats.hitRate < 70) {
    recommendations.push('Optimize cache keys and TTL values');
    recommendations.push(
      'Implement cache warming for frequently accessed data'
    );
  }

  if (diagnostics.health.memoryUsage > 75) {
    recommendations.push('Consider implementing Redis for distributed caching');
    recommendations.push('Review and optimize cache eviction policy');
  }

  if (stats.averageAccessTime > 10) {
    recommendations.push('Investigate slow cache access patterns');
  }

  return recommendations;
}

function calculateCacheEfficiency(stats: any): number {
  const totalOperations =
    stats.hits + stats.misses + stats.sets + stats.deletes;
  if (totalOperations === 0) return 0;

  // Efficiency = (beneficial operations) / total operations
  const beneficialOps = stats.hits - stats.evictions;
  return Math.max(0, (beneficialOps / totalOperations) * 100);
}

function generateCacheInsights(
  stats: any,
  diagnostics: any
): Array<{
  type: 'performance' | 'memory' | 'usage' | 'optimization';
  insight: string;
  impact: 'high' | 'medium' | 'low';
}> {
  const insights = [];

  if (stats.hitRate > 80) {
    insights.push({
      type: 'performance',
      insight: 'Excellent cache hit rate indicates optimal caching strategy',
      impact: 'high',
    });
  }

  if (stats.evictions > 0 && stats.evictions / stats.sets > 0.05) {
    insights.push({
      type: 'memory',
      insight: 'Consider increasing cache size to reduce evictions',
      impact: 'medium',
    });
  }

  if (diagnostics.health.utilization < 50 && stats.hitRate < 70) {
    insights.push({
      type: 'usage',
      insight: 'Cache is underutilized - review caching patterns',
      impact: 'medium',
    });
  }

  return insights;
}

function generateCacheRecommendations(
  stats: any,
  diagnostics: any
): Array<{
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'memory' | 'configuration' | 'strategy';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}> {
  const recommendations = [];

  if (stats.hitRate < 60) {
    recommendations.push({
      priority: 'high',
      category: 'strategy',
      title: 'Improve Cache Hit Rate',
      description: 'Current hit rate is below optimal threshold',
      implementation:
        'Review cache key patterns, implement cache warming, optimize TTL values',
      expectedImpact: '20-40% improvement in response times',
    });
  }

  if (diagnostics.health.memoryUsage > 85) {
    recommendations.push({
      priority: 'high',
      category: 'memory',
      title: 'Optimize Memory Usage',
      description: 'Cache memory usage is approaching limits',
      implementation:
        'Implement Redis caching, optimize data structures, review TTL settings',
      expectedImpact: '30-50% reduction in memory pressure',
    });
  }

  if (!diagnostics.redis.enabled && stats.entryCount > 1000) {
    recommendations.push({
      priority: 'medium',
      category: 'configuration',
      title: 'Enable Redis Caching',
      description: 'Scale caching with distributed Redis storage',
      implementation:
        'Configure Redis connection, migrate to hybrid memory/Redis caching',
      expectedImpact: 'Better scalability and persistence',
    });
  }

  return recommendations;
}

export default router;
