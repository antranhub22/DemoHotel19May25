/**
 * Cache Monitoring API - ZERO RISK Enhancement
 * Provides cache statistics and management without affecting core functionality
 */

import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { dashboardCache } from '@server/services/DashboardCache';
import { logger } from '@shared/utils/logger';
import { Request, Response, Router } from 'express';

const router = Router();

/**
 * GET /api/cache/stats - Get cache statistics
 * ZERO RISK: Read-only operation
 */
router.get('/stats', authenticateJWT, (req: Request, res: Response) => {
  try {
    logger.debug('📊 [Cache] Getting cache statistics', 'CacheAPI');

    const stats = dashboardCache.getStats();

    res.json({
      success: true,
      data: stats,
      version: '1.0.0',
      _metadata: {
        endpoint: 'cache-stats',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('❌ [Cache] Failed to get cache stats', 'CacheAPI', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cache/clear - Clear cache (development only)
 * ZERO RISK: Only available in development mode
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/clear', authenticateJWT, (req: Request, res: Response) => {
    try {
      const beforeStats = dashboardCache.getStats();

      dashboardCache.clear();

      logger.debug('🧹 [Cache] Cache manually cleared', 'CacheAPI', {
        previousSize: beforeStats.size,
        previousHitRate: beforeStats.hitRate,
      });

      res.json({
        success: true,
        message: 'Cache cleared successfully',
        previousStats: beforeStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('❌ [Cache] Failed to clear cache', 'CacheAPI', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
      });
    }
  });

  /**
   * DELETE /api/cache/key/:key - Delete specific cache key (development only)
   */
  router.delete('/key/:key', authenticateJWT, (req: Request, res: Response) => {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Cache key is required',
        });
      }

      const deleted = dashboardCache.delete(key);

      logger.debug('🗑️ [Cache] Cache key deletion attempted', 'CacheAPI', {
        key,
        deleted,
      });

      res.json({
        success: true,
        message: deleted
          ? 'Cache key deleted successfully'
          : 'Cache key not found',
        key,
        deleted,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('❌ [Cache] Failed to delete cache key', 'CacheAPI', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete cache key',
      });
    }
  });
}

/**
 * GET /api/cache/health - Cache health check
 * ZERO RISK: Simple health monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const stats = dashboardCache.getStats();

    const health = {
      status: 'healthy',
      cache: {
        operational: true,
        hitRate: stats.hitRate,
        size: stats.size,
        performance:
          stats.hitRate >= 50 ? 'good' : stats.hitRate >= 20 ? 'fair' : 'poor',
      },
      timestamp: new Date().toISOString(),
    };

    // Determine overall health status
    if (stats.hitRate < 10 && stats.hits + stats.misses > 100) {
      health.status = 'degraded';
      health.cache.performance = 'poor';
    }

    res.json(health);
  } catch (error) {
    logger.error('❌ [Cache] Health check failed', 'CacheAPI', error);
    res.status(500).json({
      status: 'error',
      cache: {
        operational: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
