/**
 * Performance Metrics API - ZERO RISK Enhancement
 * Provides performance analytics endpoint without affecting existing functionality
 */

import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { performanceMonitor } from '@server/middleware/performanceMonitoring';
import { logger } from '@shared/utils/logger';
import { Request, Response, Router } from 'express';

const router = Router();

/**
 * GET /api/performance/metrics - Get performance analytics
 * ZERO RISK: New endpoint, doesn't affect existing functionality
 */
router.get('/metrics', authenticateJWT, (req: Request, res: Response) => {
  try {
    // Get time range from query params (default: 1 hour)
    const timeRangeMinutes = parseInt(req.query.timeRange as string) || 60;
    const timeRangeMs = timeRangeMinutes * 60 * 1000;

    logger.debug(
      `📊 [Performance] Getting metrics for ${timeRangeMinutes} minutes`,
      'PerformanceAPI'
    );

    const analytics = performanceMonitor.getAnalytics(timeRangeMs);

    if (!analytics) {
      return res.json({
        success: true,
        data: {
          message: 'No performance data available',
          timeRange: timeRangeMinutes,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: analytics,
      version: '1.0.0',
      _metadata: {
        endpoint: 'performance-metrics',
        timeRange: timeRangeMinutes,
        collected: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Failed to get metrics',
      'PerformanceAPI',
      error
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/performance/health - Simple health check with basic metrics
 * ZERO RISK: Read-only endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const analytics = performanceMonitor.getAnalytics(300000); // Last 5 minutes

    const healthStatus = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      performance: analytics
        ? {
            averageResponseTime: Math.round(analytics.averageResponseTime),
            successRate: Math.round(analytics.successRate),
            totalRequests: analytics.totalRequests,
          }
        : null,
      timestamp: new Date().toISOString(),
    };

    // Set status based on performance
    if (analytics) {
      if (analytics.averageResponseTime > 2000 || analytics.successRate < 90) {
        healthStatus.status = 'degraded';
      } else if (
        analytics.averageResponseTime > 5000 ||
        analytics.successRate < 50
      ) {
        healthStatus.status = 'unhealthy';
      }
    }

    res.json(healthStatus);
  } catch (error) {
    logger.error(
      '❌ [Performance] Health check failed',
      'PerformanceAPI',
      error
    );
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/performance/clear - Clear metrics (development only)
 * ZERO RISK: Only available in development
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/clear', authenticateJWT, (req: Request, res: Response) => {
    try {
      performanceMonitor.clear();
      logger.debug('🧹 [Performance] Metrics cleared', 'PerformanceAPI');

      res.json({
        success: true,
        message: 'Performance metrics cleared',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear metrics',
      });
    }
  });
}

export default router;
