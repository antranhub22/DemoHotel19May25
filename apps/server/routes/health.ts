// ============================================================================
// Health Check and Monitoring Endpoints
// Provides comprehensive health checks for deployment and monitoring
// ============================================================================

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { tenants } from '../../../packages/shared/db/schema.js';
import { performance } from 'perf_hooks';

const router = Router();

// ======================== Basic Health Check ========================
/**
 * @route GET /api/health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get('/health', async (_req: Request, res: Response) => {
  const startTime = performance.now();

  try {
    // Basic response with minimal checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Math.round(performance.now() - startTime),
    };

    res.status(200).json(health);
  } catch (_error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Math.round(performance.now() - startTime),
    });
  }
});

// ======================== Detailed Status Check ========================
/**
 * @route GET /api/status
 * @desc Comprehensive status check with external dependencies
 * @access Public
 */
router.get('/status', async (_req: Request, res: Response) => {
  const startTime = performance.now();
  const checks: Record<string, any> = {};

  try {
    // Database connectivity check
    try {
      const dbStart = performance.now();
      await db.select().from(tenants).limit(1);
      checks.database = {
        status: 'healthy',
        responseTime: Math.round(performance.now() - dbStart),
        message: 'Database connection successful',
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        responseTime: Math.round(performance.now() - startTime),
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const maxMemoryMB = 1024; // 1GB threshold
    
    checks.memory = {
      status: memoryUsageMB < maxMemoryMB ? 'healthy' : 'warning',
      usage: {
        heap: `${memoryUsageMB}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
      threshold: `${maxMemoryMB}MB`,
    };

    // Environment variables check
    const requiredEnvVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'DATABASE_URL',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    checks.environment = {
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      required: requiredEnvVars.length,
      present: requiredEnvVars.length - missingVars.length,
      missing: missingVars,
    };

    // External API connectivity (optional checks)
    checks.external_apis = {
      openai: {
        status: process.env.VITE_OPENAI_API_KEY ? 'configured' : 'not_configured',
      },
      vapi: {
        status: process.env.VITE_VAPI_PUBLIC_KEY ? 'configured' : 'not_configured',
      },
      google_places: {
        status: process.env.GOOGLE_PLACES_API_KEY ? 'configured' : 'not_configured',
      },
    };

    // Overall health status
    const isHealthy = 
      checks.database.status === 'healthy' &&
      checks.environment.status === 'healthy' &&
      checks.memory.status !== 'unhealthy';

    const status = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: Math.round(performance.now() - startTime),
      checks,
    };

    res.status(isHealthy ? 200 : 503).json(status);
  } catch (_error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Status check failed',
      responseTime: Math.round(performance.now() - startTime),
      checks,
    });
  }
});

// ======================== Readiness Check ========================
/**
 * @route GET /api/ready
 * @desc Kubernetes-style readiness check
 * @access Public
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const startTime = performance.now();

  try {
    // Check if database is ready
    await db.select().from(tenants).limit(1);

    // Check if required environment variables are set
    const required = ['JWT_SECRET', 'DATABASE_URL'];
    const missing = required.filter(env => !process.env[env]);

    if (missing.length > 0) {
      return res.status(503).json({
        ready: false,
        reason: 'Missing required environment variables',
        missing,
        responseTime: Math.round(performance.now() - startTime),
      });
    }

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
      responseTime: Math.round(performance.now() - startTime),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: 'Database not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Math.round(performance.now() - startTime),
    });
  }
});

// ======================== Liveness Check ========================
/**
 * @route GET /api/live
 * @desc Kubernetes-style liveness check
 * @access Public
 */
router.get('/live', (_req: Request, res: Response) => {
  const startTime = performance.now();

  // Simple liveness check - just verify the process is running
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
    responseTime: Math.round(performance.now() - startTime),
  });
});

// ======================== Metrics Endpoint ========================
/**
 * @route GET /api/metrics
 * @desc Prometheus-style metrics endpoint
 * @access Public
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  const startTime = performance.now();

  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Basic metrics in Prometheus format
    const metrics = [
      `# HELP hotel_voice_assistant_uptime_seconds Process uptime in seconds`,
      `# TYPE hotel_voice_assistant_uptime_seconds counter`,
      `hotel_voice_assistant_uptime_seconds ${process.uptime()}`,
      '',
      `# HELP hotel_voice_assistant_memory_usage_bytes Memory usage in bytes`,
      `# TYPE hotel_voice_assistant_memory_usage_bytes gauge`,
      `hotel_voice_assistant_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}`,
      `hotel_voice_assistant_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}`,
      `hotel_voice_assistant_memory_usage_bytes{type="external"} ${memUsage.external}`,
      `hotel_voice_assistant_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
      '',
      `# HELP hotel_voice_assistant_cpu_usage_microseconds CPU usage in microseconds`,
      `# TYPE hotel_voice_assistant_cpu_usage_microseconds counter`,
      `hotel_voice_assistant_cpu_usage_microseconds{type="user"} ${cpuUsage.user}`,
      `hotel_voice_assistant_cpu_usage_microseconds{type="system"} ${cpuUsage.system}`,
      '',
      `# HELP hotel_voice_assistant_response_time_milliseconds Health check response time`,
      `# TYPE hotel_voice_assistant_response_time_milliseconds gauge`,
      `hotel_voice_assistant_response_time_milliseconds ${Math.round(performance.now() - startTime)}`,
      '',
    ];

    // Add database metrics if available
    try {
      const tenantCount = await db.select().from(tenants);
      metrics.push(
        `# HELP hotel_voice_assistant_tenants_total Total number of tenants`,
        `# TYPE hotel_voice_assistant_tenants_total gauge`,
        `hotel_voice_assistant_tenants_total ${tenantCount.length}`,
        ''
      );
    } catch {
      // Ignore database errors for metrics
    }

    res.set('Content-Type', 'text/plain');
    res.status(200).send(metrics.join('\n'));
  } catch (_error) {
    res.status(503).send('# Metrics unavailable\n');
  }
});

// ======================== Version Information ========================
/**
 * @route GET /api/version
 * @desc Application version and build information
 * @access Public
 */
router.get('/version', (_req: Request, res: Response) => {
  const version = {
    application: 'Hotel Voice Assistant SaaS Platform',
    version: process.env.npm_package_version || '1.0.0',
    build: {
      commit: process.env.GIT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
      buildTime: process.env.BUILD_TIME || 'unknown',
      buildNumber: process.env.BUILD_NUMBER || 'unknown',
    },
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
    },
    features: {
      multi_language: process.env.ENABLE_MULTI_LANGUAGE_SUPPORT === 'true',
      hotel_research: process.env.ENABLE_HOTEL_RESEARCH === 'true',
      analytics: process.env.ENABLE_ANALYTICS_DASHBOARD === 'true',
      dynamic_assistants: process.env.ENABLE_DYNAMIC_ASSISTANT_CREATION === 'true',
    },
  };

  res.status(200).json(version);
});

export default router;
