import { Request, Response } from 'express';
import { logger } from '@shared/utils/logger';
import { checkDatabaseHealth, getDatabaseMetrics } from '@shared/db';
/**
 * Health Check Controller with Database Connection Pool Monitoring
 *
 * Provides comprehensive health information including:
 * - Database connection status
 * - Connection pool metrics
 * - System performance indicators
 */
export class HealthController {
  /**
   * Basic health check endpoint
   * GET /api/health
   */
  static async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '🏥 [HealthController] Basic health check requested',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform basic database health check
      const isDatabaseHealthy = await checkDatabaseHealth();

      const responseTime = Date.now() - startTime;

      const healthStatus = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime,
        database: {
          status: isDatabaseHealthy ? 'connected' : 'disconnected',
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
        },
      };

      const statusCode = isDatabaseHealthy ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Health check completed',
        'HealthController',
        {
          status: healthStatus.status,
          responseTime,
          databaseHealthy: isDatabaseHealthy,
        }
      );

      (res as any).status(statusCode).json(healthStatus);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Health check failed',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * Detailed health check with connection pool metrics
   * GET /api/health/detailed
   */
  static async getDetailedHealth(_req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '🏥 [HealthController] Detailed health check requested',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform database health check
      const isDatabaseHealthy = await checkDatabaseHealth();

      // Get connection pool metrics
      const poolMetrics = getDatabaseMetrics();

      const responseTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      const detailedHealth = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,

        // System Information
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          environment: process.env.NODE_ENV || 'unknown',
        },

        // Memory Usage
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024), // MB
        },

        // Database Health
        database: {
          status: isDatabaseHealthy ? 'connected' : 'disconnected',
          type: process.env.DATABASE_URL?.startsWith('sqlite://')
            ? 'SQLite'
            : 'PostgreSQL',
          pool:
            poolMetrics.totalConnections > 0
              ? {
                  totalConnections: poolMetrics.totalConnections,
                  idleConnections: poolMetrics.idleConnections,
                  activeConnections: poolMetrics.activeConnections,
                  waitingCount: poolMetrics.waitingCount,
                  errorCount: poolMetrics.errorCount,
                  lastError: poolMetrics.lastError,
                  lastErrorTime: poolMetrics.lastErrorTime,
                  utilization:
                    poolMetrics.totalConnections > 0
                      ? Math.round(
                          (poolMetrics.activeConnections /
                            poolMetrics.totalConnections) *
                            100
                        )
                      : 0,
                }
              : null,
        },

        // Performance Indicators
        performance: {
          healthCheckTime: responseTime,
          databaseResponseTime: responseTime, // In this case, same as health check
          cpuUsage: process.cpuUsage(),
        },
      };

      const statusCode = isDatabaseHealthy ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Detailed health check completed',
        'HealthController',
        {
          status: detailedHealth.status,
          responseTime,
          poolConnections: poolMetrics.totalConnections,
          memoryUsage: detailedHealth.memory.heapUsed,
        }
      );

      (res as any).status(statusCode).json(detailedHealth);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Detailed health check failed',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * Database-specific health check
   * GET /api/health/database
   */
  static async getDatabaseHealth(_req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '🏥 [HealthController] Database health check requested',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform database health check
      const isDatabaseHealthy = await checkDatabaseHealth();

      // Get detailed pool metrics
      const poolMetrics = getDatabaseMetrics();

      const responseTime = Date.now() - startTime;

      const databaseHealth = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        type: process.env.DATABASE_URL?.startsWith('sqlite://')
          ? 'SQLite'
          : 'PostgreSQL',

        connectionPool:
          poolMetrics.totalConnections > 0
            ? {
                // Connection Counts
                total: poolMetrics.totalConnections,
                idle: poolMetrics.idleConnections,
                active: poolMetrics.activeConnections,
                waiting: poolMetrics.waitingCount,

                // Health Metrics
                errorCount: poolMetrics.errorCount,
                lastError: poolMetrics.lastError || null,
                lastErrorTime: poolMetrics.lastErrorTime || null,

                // Performance Metrics
                utilization: Math.round(
                  (poolMetrics.activeConnections /
                    poolMetrics.totalConnections) *
                    100
                ),
                efficiency:
                  poolMetrics.idleConnections > 0 &&
                  poolMetrics.waitingCount === 0
                    ? 'optimal'
                    : poolMetrics.waitingCount > 0
                      ? 'overloaded'
                      : 'underutilized',

                // Status Assessment
                isHealthy:
                  poolMetrics.errorCount === 0 && poolMetrics.waitingCount < 5,
                recommendations:
                  HealthController.getPoolRecommendations(poolMetrics),
              }
            : {
                status: 'No pool metrics available (likely SQLite)',
                isHealthy: isDatabaseHealthy,
              },

        // Configuration Info
        environment: process.env.NODE_ENV || 'unknown',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
      };

      const statusCode = isDatabaseHealthy ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Database health check completed',
        'HealthController',
        {
          status: databaseHealth.status,
          responseTime,
          poolStatus: databaseHealth.connectionPool,
        }
      );

      (res as any).status(statusCode).json(databaseHealth);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Database health check failed',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * Get pool optimization recommendations based on metrics
   */
  private static getPoolRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.waitingCount > 5) {
      recommendations.push(
        'Consider increasing max pool size - high waiting count detected'
      );
    }

    if (metrics.activeConnections === 0 && metrics.idleConnections > 5) {
      recommendations.push(
        'Consider decreasing min pool size - too many idle connections'
      );
    }

    if (metrics.errorCount > 10) {
      recommendations.push(
        'Investigate connection errors - high error count detected'
      );
    }

    const utilization =
      (metrics.activeConnections / metrics.totalConnections) * 100;
    if (utilization > 90) {
      recommendations.push('Pool utilization very high - consider scaling');
    } else if (utilization < 10) {
      recommendations.push(
        'Pool utilization very low - consider optimizing min connections'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Connection pool is performing optimally');
    }

    return recommendations;
  }

  /**
   * Readiness probe for Kubernetes/container orchestration
   * GET /api/health/ready
   */
  static async getReadiness(_req: Request, res: Response): Promise<void> {
    try {
      const isDatabaseHealthy = await checkDatabaseHealth();

      if (isDatabaseHealthy) {
        (res as any).status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        (res as any).status(503).json({
          status: 'not ready',
          reason: 'Database not accessible',
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      (res as any).status(503).json({
        status: 'not ready',
        reason: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Liveness probe for Kubernetes/container orchestration
   * GET /api/health/live
   */
  static async getLiveness(_req: Request, res: Response): Promise<void> {
    // Basic liveness check - if server can respond, it's alive
    (res as any).status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
