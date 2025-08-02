/**
 * Performance Monitoring Middleware - ZERO RISK Enhancement
 * Tracks API performance metrics without affecting business logic
 */

import { logger } from '@shared/utils/logger';
import { NextFunction, Request, Response } from 'express';

export interface ApiPerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  dataSize: number;
  success: boolean;
  timestamp: string;
  tenantId?: string;
  userId?: string;
  queryCount?: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: ApiPerformanceMetrics[] = [];
  private readonly maxHistorySize = 1000;

  /**
   * Record API performance metrics
   */
  recordMetrics(metrics: ApiPerformanceMetrics): void {
    try {
      this.metrics.push(metrics);

      // Keep only recent metrics
      if (this.metrics.length > this.maxHistorySize) {
        this.metrics = this.metrics.slice(-this.maxHistorySize);
      }

      // Log slow requests (>1000ms)
      if (metrics.responseTime > 1000) {
        logger.warn(
          '🐌 [Performance] Slow API request detected',
          'PerformanceMonitor',
          {
            endpoint: metrics.endpoint,
            method: metrics.method,
            responseTime: `${metrics.responseTime}ms`,
            statusCode: metrics.statusCode,
            tenantId: metrics.tenantId,
          }
        );
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = metrics.success ? '⚡' : '❌';
        logger.debug(
          `${emoji} [API Performance] ${metrics.method} ${metrics.endpoint}`,
          'PerformanceMonitor',
          {
            responseTime: `${metrics.responseTime}ms`,
            statusCode: metrics.statusCode,
            dataSize: `${Math.round(metrics.dataSize / 1024)}KB`,
            memoryUsage: metrics.memoryUsage
              ? `${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`
              : undefined,
          }
        );
      }
    } catch (error) {
      // Silent fail - monitoring should never break the app
      logger.warn('Performance monitoring failed', 'PerformanceMonitor', error);
    }
  }

  /**
   * Get performance analytics
   */
  getAnalytics(timeRange: number = 3600000): any {
    try {
      const cutoff = Date.now() - timeRange; // Default: last hour
      const recentMetrics = this.metrics.filter(
        m => new Date(m.timestamp).getTime() > cutoff
      );

      if (recentMetrics.length === 0) {
        return null;
      }

      const successfulRequests = recentMetrics.filter(m => m.success);
      const failedRequests = recentMetrics.filter(m => !m.success);

      return {
        totalRequests: recentMetrics.length,
        successRate: (successfulRequests.length / recentMetrics.length) * 100,
        averageResponseTime:
          successfulRequests.reduce((sum, m) => sum + m.responseTime, 0) /
            successfulRequests.length || 0,
        slowRequests: recentMetrics.filter(m => m.responseTime > 1000).length,
        errorRate: (failedRequests.length / recentMetrics.length) * 100,
        topEndpoints: this.getTopEndpoints(recentMetrics),
        timeRange: timeRange / 1000 / 60, // in minutes
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn(
        'Failed to get performance analytics',
        'PerformanceMonitor',
        error
      );
      return null;
    }
  }

  private getTopEndpoints(metrics: ApiPerformanceMetrics[]): any[] {
    const endpointStats = new Map<
      string,
      { count: number; avgTime: number; totalTime: number }
    >();

    metrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      const existing = endpointStats.get(key) || {
        count: 0,
        avgTime: 0,
        totalTime: 0,
      };

      existing.count += 1;
      existing.totalTime += m.responseTime;
      existing.avgTime = existing.totalTime / existing.count;

      endpointStats.set(key, existing);
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Clear metrics (for testing)
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Express middleware for performance monitoring
 */
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage().heapUsed;

  // Track original res.json to capture response size
  const originalJson = res.json;
  let responseSize = 0;

  res.json = function (body: any) {
    try {
      responseSize = JSON.stringify(body).length;
    } catch (error) {
      responseSize = 0;
    }
    return originalJson.call(this, body);
  };

  // Monitor response completion
  res.on('finish', () => {
    try {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = endMemory - startMemory;

      // Extract tenant/user info from request
      const tenantId =
        (req as any).user?.tenantId || extractTenantFromRequest(req);
      const userId = (req as any).user?.id;

      const metrics: ApiPerformanceMetrics = {
        endpoint: req.route?.path || req.path,
        method: req.method,
        responseTime: Math.round(responseTime),
        statusCode: res.statusCode,
        dataSize: responseSize,
        success: res.statusCode < 400,
        timestamp: new Date().toISOString(),
        tenantId,
        userId,
        memoryUsage: memoryDelta > 0 ? memoryDelta : undefined,
      };

      performanceMonitor.recordMetrics(metrics);
    } catch (error) {
      // Silent fail - monitoring should never break the app
      logger.warn('Performance middleware failed', 'PerformanceMonitor', error);
    }
  });

  next();
};

/**
 * Helper function to extract tenant ID (same as in staff.ts)
 */
function extractTenantFromRequest(req: Request): string | undefined {
  try {
    // Try to get from JWT token
    if ((req as any).user?.tenantId) {
      return (req as any).user.tenantId;
    }

    // Try to get from subdomain
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];

    if (
      subdomain &&
      subdomain !== 'localhost' &&
      subdomain !== '127' &&
      subdomain !== 'www'
    ) {
      return subdomain;
    }

    return undefined;
  } catch (error) {
    logger.warn(
      'Failed to extract tenant from request',
      'PerformanceMonitor',
      error
    );
    return undefined;
  }
}

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (global as any).performanceMonitor = performanceMonitor;
}
