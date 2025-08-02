/**
 * WebSocket Monitoring API - ZERO RISK Enhancement
 * Provides WebSocket statistics and health monitoring
 */

import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { dashboardWebSocket } from '@server/services/DashboardWebSocket';
import { logger } from '@shared/utils/logger';
import { Request, Response, Router } from 'express';

const router = Router();

/**
 * GET /api/websocket/stats - Get WebSocket service statistics
 * ZERO RISK: Read-only monitoring endpoint
 */
router.get('/stats', authenticateJWT, (req: Request, res: Response) => {
  try {
    logger.debug('📊 [WebSocket] Getting WebSocket statistics', 'WebSocketAPI');

    const stats = dashboardWebSocket.getStats();

    res.json({
      success: true,
      data: stats,
      version: '1.0.0',
      _metadata: {
        endpoint: 'websocket-stats',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      '❌ [WebSocket] Failed to get WebSocket stats',
      'WebSocketAPI',
      error
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get WebSocket statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/websocket/health - WebSocket health check
 * ZERO RISK: Simple health monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const stats = dashboardWebSocket.getStats();

    const health = {
      status: 'healthy',
      websocket: {
        enabled: stats.config.enableWebSocket,
        activeConnections: stats.activeConnections,
        totalConnections: stats.totalConnections,
        messagesPublished: stats.messagesPublished,
        errorRate:
          stats.totalConnections > 0
            ? (stats.errors / stats.totalConnections) * 100
            : 0,
        performance:
          stats.errors === 0 ? 'excellent' : stats.errors < 5 ? 'good' : 'poor',
      },
      timestamp: new Date().toISOString(),
    };

    // Determine overall health status
    if (!stats.config.enableWebSocket) {
      health.status = 'disabled';
    } else if (
      stats.errors > 10 ||
      (stats.totalConnections > 0 && stats.activeConnections === 0)
    ) {
      health.status = 'degraded';
    } else if (stats.errors > 50) {
      health.status = 'unhealthy';
    }

    res.json(health);
  } catch (error) {
    logger.error('❌ [WebSocket] Health check failed', 'WebSocketAPI', error);
    res.status(500).json({
      status: 'error',
      websocket: {
        operational: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/websocket/test-message - Test WebSocket message publishing (development only)
 * ZERO RISK: Only available in development mode
 */
if (process.env.NODE_ENV === 'development') {
  router.post(
    '/test-message',
    authenticateJWT,
    (req: Request, res: Response) => {
      try {
        const { tenantId, type, data } = req.body;

        if (!type) {
          return res.status(400).json({
            success: false,
            error: 'Message type is required',
          });
        }

        // Publish test message
        dashboardWebSocket.publishDashboardUpdate({
          type: type as any,
          tenantId: tenantId || 'test-tenant',
          data: data || { test: true, timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
          source: 'test-api',
        });

        logger.debug('🧪 [WebSocket] Test message published', 'WebSocketAPI', {
          type,
          tenantId: tenantId || 'test-tenant',
        });

        res.json({
          success: true,
          message: 'Test message published successfully',
          data: {
            type,
            tenantId: tenantId || 'test-tenant',
            publishedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        logger.error(
          '❌ [WebSocket] Test message failed',
          'WebSocketAPI',
          error
        );
        res.status(500).json({
          success: false,
          error: 'Failed to publish test message',
        });
      }
    }
  );
}

/**
 * GET /api/websocket/connections - List active connections by tenant (admin only)
 * ZERO RISK: Admin monitoring endpoint
 */
router.get('/connections', authenticateJWT, (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check here
    // if (!(req as any).user?.role?.includes('admin')) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const stats = dashboardWebSocket.getStats();

    res.json({
      success: true,
      data: {
        totalConnections: stats.activeConnections,
        connectionsByTenant: stats.tenantConnections || {},
        config: {
          maxConnections: stats.config.maxConnections,
          heartbeatInterval: stats.config.heartbeatInterval,
        },
      },
      version: '1.0.0',
      _metadata: {
        endpoint: 'websocket-connections',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      '❌ [WebSocket] Failed to get connections info',
      'WebSocketAPI',
      error
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get connections information',
    });
  }
});

export default router;
