// ============================================
// METRICS MIDDLEWARE v2.0 - Automatic Performance Tracking
// ============================================
// Middleware for automatic collection of performance metrics from all API requests
// Integrated with Advanced Metrics Collection system

import { recordPerformanceMetrics } from '@server/shared/AdvancedMetricsCollector';
import { logger } from '@shared/utils/logger';
import { NextFunction, Request, Response } from 'express';

interface MetricsRequest extends Request {
  startTime?: number;
  module?: string;
}

/**
 * Performance metrics tracking middleware
 * Automatically records response time, memory usage, and error rates for all requests
 */
export const metricsMiddleware = (
  req: MetricsRequest,
  res: Response,
  next: NextFunction
) => {
  // Record start time
  req.startTime = Date.now();

  // Determine module from request path
  req.module = determineModule(req.path);

  // Track response completion
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - (req.startTime || Date.now());
    const memoryUsage = Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    );
    const isError = res.statusCode >= 400;

    // Record performance metrics
    try {
      recordPerformanceMetrics({
        module: req.module || 'unknown',
        endpoint: req.path,
        operation: `${req.method}:${req.path}`,
        responseTime,
        memoryUsage,
        cpuUsage: 0, // CPU usage is expensive to calculate per request
        errorRate: isError ? 1 : 0,
        throughput: 1, // One request processed
      });

      // Log slow requests
      if (responseTime > 2000) {
        logger.warn(
          `🐌 [Metrics] Slow request detected: ${req.method} ${req.path} (${responseTime}ms)`,
          'MetricsMiddleware',
          {
            module: req.module,
            responseTime,
            statusCode: res.statusCode,
          }
        );
      }

      // Log errors
      if (isError) {
        logger.warn(
          `❌ [Metrics] Error response: ${req.method} ${req.path} (${res.statusCode})`,
          'MetricsMiddleware',
          {
            module: req.module,
            responseTime,
            statusCode: res.statusCode,
          }
        );
      }
    } catch (error) {
      logger.error(
        '❌ [Metrics] Failed to record performance metrics',
        'MetricsMiddleware',
        error
      );
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Determine module name from request path
 */
function determineModule(path: string): string {
  if (path.startsWith('/api/core/')) return 'core-module';
  if (path.startsWith('/api/hotel/')) return 'hotel-module';
  if (path.startsWith('/api/voice/')) return 'voice-module';
  if (path.startsWith('/api/analytics-module/')) return 'analytics-module';
  if (path.startsWith('/api/analytics/')) return 'analytics-module';
  if (path.startsWith('/api/admin/')) return 'admin-module';
  if (path.startsWith('/api/health')) return 'core-module';
  if (path.startsWith('/api/request')) return 'hotel-module';
  if (path.startsWith('/api/staff')) return 'hotel-module';
  if (path.startsWith('/api/saas-dashboard')) return 'saas-module';
  if (path.startsWith('/api/hotel-dashboard')) return 'hotel-module';
  if (path.startsWith('/api/email')) return 'hotel-module';
  if (path.startsWith('/api/calls')) return 'voice-module';
  if (path.startsWith('/auth')) return 'auth-module';
  if (path.startsWith('/public')) return 'public-module';

  return 'unknown-module';
}

/**
 * Business metrics middleware for specific endpoints
 */
export const businessMetricsMiddleware = (
  kpiName: string,
  category:
    | 'revenue'
    | 'operations'
    | 'customer_satisfaction'
    | 'performance'
    | 'growth'
) => {
  return (req: MetricsRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (data) {
      // Record business KPI based on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const {
            recordBusinessKPI,
          } = require('@server/shared/AdvancedMetricsCollector');

          let value = 1; // Default: count successful operations
          let unit = 'operations';

          // Customize based on KPI type
          switch (kpiName) {
            case 'booking-conversion':
              value = 1;
              unit = 'conversions';
              break;
            case 'customer-satisfaction':
              // Extract rating from response if available
              try {
                const responseData = JSON.parse(data);
                if (responseData.rating) {
                  value = responseData.rating;
                  unit = 'rating';
                }
              } catch {
                value = 5; // Default good rating
                unit = 'rating';
              }
              break;
            case 'response-efficiency': {
              const responseTime = Date.now() - (req.startTime || Date.now());
              value = responseTime < 1000 ? 100 : responseTime < 2000 ? 80 : 60;
              unit = '%';
              break;
            }
            default:
              value = 1;
              unit = 'count';
          }

          recordBusinessKPI({
            name: kpiName,
            value,
            unit,
            category,
            trend: 'stable',
            module: req.module || 'unknown',
          });
        } catch (error) {
          logger.error(
            '❌ [Metrics] Failed to record business KPI',
            'MetricsMiddleware',
            error
          );
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Module-specific metrics middleware
 */
export const moduleMetricsMiddleware = (moduleName: string) => {
  return (req: MetricsRequest, _res: Response, next: NextFunction) => {
    req.module = moduleName;
    next();
  };
};

/**
 * Critical endpoint monitoring middleware
 */
export const criticalEndpointMiddleware = (
  req: MetricsRequest,
  res: Response,
  next: NextFunction
) => {
  const criticalPaths = [
    '/api/health',
    '/api/core/health',
    '/api/hotel/requests',
    '/api/voice/calls',
    '/auth/login',
    '/auth/verify',
  ];

  if (criticalPaths.some(path => req.path.startsWith(path))) {
    const originalSend = res.send;
    res.send = function (data) {
      const responseTime = Date.now() - (req.startTime || Date.now());

      // Create alert for critical endpoint issues
      if (res.statusCode >= 500 || responseTime > 5000) {
        try {
          const {
            advancedMetricsCollector,
          } = require('@server/shared/AdvancedMetricsCollector');

          advancedMetricsCollector.createAlert({
            type: 'performance',
            severity: res.statusCode >= 500 ? 'critical' : 'high',
            title: 'Critical Endpoint Issue',
            message: `Critical endpoint ${req.path} ${res.statusCode >= 500 ? 'failed' : 'slow'}: ${res.statusCode >= 500 ? res.statusCode : responseTime + 'ms'}`,
            module: req.module || 'unknown',
            threshold: res.statusCode >= 500 ? 500 : 5000,
            currentValue: res.statusCode >= 500 ? res.statusCode : responseTime,
            metadata: {
              endpoint: req.path,
              method: req.method,
              userAgent: req.headers['user-agent'],
            },
          });
        } catch (error) {
          logger.error(
            '❌ [Metrics] Failed to create critical endpoint alert',
            'MetricsMiddleware',
            error
          );
        }
      }

      return originalSend.call(this, data);
    };
  }

  next();
};
