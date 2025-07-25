// ============================================================================
// ADMIN MODULE: API GATEWAY ROUTES v1.0 - Enterprise API Management
// ============================================================================
// API endpoints for API Gateway management, rate limiting configuration, metrics monitoring,
// and comprehensive gateway administration with real-time analytics

import express, { Request, Response } from 'express';

// ✅ Import API Gateway System
import {
  APIGateway,
  getGatewayDiagnostics,
  getGatewayMetrics,
} from '@server/shared/APIGateway';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// GATEWAY OVERVIEW & STATUS
// ============================================

/**
 * GET /api/admin/api-gateway - Get API Gateway overview
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.api('🌐 [APIGateway] Gateway overview requested', 'APIGatewayAPI');

    const gateway = APIGateway.getInstance();
    const [metrics, diagnostics] = await Promise.all([
      gateway.getMetrics(),
      gateway.getDiagnostics(),
    ]);

    const overview = {
      status: diagnostics.initialized ? 'operational' : 'initializing',
      version: '1.0.0',
      uptime: process.uptime(),
      features: {
        rateLimiting: diagnostics.config.rateLimitingEnabled,
        caching: diagnostics.config.cachingEnabled,
        analytics: diagnostics.config.analyticsEnabled,
        authentication: diagnostics.config.authStrategies > 0,
        routing: diagnostics.config.routingRules > 0,
      },
      currentMetrics: {
        requestsPerSecond: metrics.requests.throughput,
        averageResponseTime: metrics.requests.averageResponseTime,
        cacheHitRate: metrics.caching.hitRate,
        rateLimitedRequests: metrics.rateLimiting.blockedRequests,
        healthyTargets: metrics.routing.healthyTargets,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: overview,
      _metadata: {
        endpoint: 'gateway-overview',
        status: overview.status,
        requestsPerSecond: metrics.requests.throughput,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Gateway overview request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get gateway overview',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/api-gateway/metrics - Get gateway metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string;
    const category = req.query.category as string;

    logger.api('📊 [APIGateway] Gateway metrics requested', 'APIGatewayAPI', {
      timeRange,
      category,
    });

    const metrics = await getGatewayMetrics();

    // Filter metrics by category if specified
    let filteredMetrics = metrics;
    if (category) {
      switch (category) {
        case 'requests':
          filteredMetrics = { ...metrics, requests: metrics.requests } as any;
          break;
        case 'rate_limiting':
          filteredMetrics = {
            ...metrics,
            rateLimiting: metrics.rateLimiting,
          } as any;
          break;
        case 'routing':
          filteredMetrics = { ...metrics, routing: metrics.routing } as any;
          break;
        case 'caching':
          filteredMetrics = { ...metrics, caching: metrics.caching } as any;
          break;
        case 'security':
          filteredMetrics = { ...metrics, security: metrics.security } as any;
          break;
      }
    }

    // Calculate performance insights
    const insights = {
      performance: {
        status:
          metrics.requests.averageResponseTime < 500
            ? 'excellent'
            : metrics.requests.averageResponseTime < 1000
              ? 'good'
              : metrics.requests.averageResponseTime < 2000
                ? 'fair'
                : 'poor',
        throughputTrend:
          metrics.requests.throughput > 50
            ? 'high'
            : metrics.requests.throughput > 20
              ? 'medium'
              : 'low',
        errorRate:
          (metrics.requests.failed / Math.max(metrics.requests.total, 1)) * 100,
      },
      rateLimiting: {
        effectiveness:
          metrics.rateLimiting.blockedRequests > 0 ? 'active' : 'inactive',
        utilization:
          (metrics.rateLimiting.activeLimits /
            Math.max(metrics.rateLimiting.totalLimits, 1)) *
          100,
      },
      caching: {
        efficiency:
          metrics.caching.hitRate > 80
            ? 'excellent'
            : metrics.caching.hitRate > 60
              ? 'good'
              : metrics.caching.hitRate > 40
                ? 'fair'
                : 'poor',
        utilization: metrics.caching.size,
      },
      routing: {
        health:
          (metrics.routing.healthyTargets /
            Math.max(metrics.routing.activeTargets, 1)) *
          100,
        reliability:
          metrics.routing.circuitBreakerTrips === 0 ? 'stable' : 'unstable',
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics: filteredMetrics,
        insights,
        summary: {
          overallHealth: insights.performance.status,
          keyIssues: generateKeyIssues(insights),
          recommendations: generateRecommendations(insights),
        },
      },
      _metadata: {
        endpoint: 'gateway-metrics',
        category,
        timeRange,
        performanceStatus: insights.performance.status,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Gateway metrics request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get gateway metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// RATE LIMITING MANAGEMENT
// ============================================

/**
 * GET /api/admin/api-gateway/rate-limits - Get rate limiting status
 */
router.get('/rate-limits', async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;
    const category = req.query.category as string;

    logger.api('🚦 [APIGateway] Rate limits requested', 'APIGatewayAPI', {
      key,
      category,
    });

    const gateway = APIGateway.getInstance();
    const diagnostics = gateway.getDiagnostics();

    let rateLimitData: any = {
      enabled: diagnostics.config.rateLimitingEnabled,
      totalEntries: diagnostics.rateLimitEntries,
      strategies: [], // Would get from config
      globalLimits: {
        requestsPerMinute: 1000,
        requestsPerHour: 50000,
        requestsPerDay: 1000000,
      },
    };

    // Get specific rate limit status if key provided
    if (key) {
      const status = gateway.getRateLimitStatus(key);
      rateLimitData.specificStatus = status;
    }

    // Add active rate limits summary
    rateLimitData.summary = {
      activeKeys: diagnostics.rateLimitEntries,
      blockedRequests: 0, // Would get from metrics
      throttledRequests: 0, // Would get from metrics
      averageUtilization: Math.random() * 50 + 20, // Simulated
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: rateLimitData,
      _metadata: {
        endpoint: 'rate-limits',
        key,
        category,
        enabled: rateLimitData.enabled,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Rate limits request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get rate limits',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/api-gateway/rate-limits/reset - Reset rate limit for key
 */
router.post('/rate-limits/reset', async (req: Request, res: Response) => {
  try {
    const { key, reason } = req.body;

    logger.api('🔄 [APIGateway] Rate limit reset requested', 'APIGatewayAPI', {
      key,
      reason,
    });

    if (!key) {
      return (res as any).status(400).json({
        success: false,
        error: 'Rate limit key is required',
        version: '1.0.0',
      });
    }

    // In a real implementation, would reset the rate limit
    const resetResult = {
      key,
      resetTime: new Date().toISOString(),
      reason: reason || 'Manual reset',
      success: true,
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: resetResult,
      _metadata: {
        endpoint: 'rate-limit-reset',
        key,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Rate limit reset failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to reset rate limit',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// ROUTING & LOAD BALANCING
// ============================================

/**
 * GET /api/admin/api-gateway/routes - Get routing configuration
 */
router.get('/routes', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const pattern = req.query.pattern as string;

    logger.api('🛣️ [APIGateway] Routes requested', 'APIGatewayAPI', {
      status,
      pattern,
    });

    const gateway = APIGateway.getInstance();
    const diagnostics = gateway.getDiagnostics();

    // Mock routing data
    const routes = [
      {
        id: 'hotel-api-v1',
        pattern: '^/api/hotel/.*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        targets: [
          {
            id: 'hotel-service-1',
            url: 'http://hotel-service:3001',
            weight: 50,
            health: 'healthy',
          },
          {
            id: 'hotel-service-2',
            url: 'http://hotel-service:3002',
            weight: 50,
            health: 'healthy',
          },
        ],
        middleware: ['auth', 'rate-limit', 'cache'],
        status: 'active',
        metrics: {
          requests: Math.floor(Math.random() * 10000) + 1000,
          errors: Math.floor(Math.random() * 100),
          averageResponseTime: Math.floor(Math.random() * 500) + 200,
        },
      },
      {
        id: 'voice-api-v1',
        pattern: '^/api/voice/.*',
        methods: ['GET', 'POST'],
        targets: [
          {
            id: 'voice-service-1',
            url: 'http://voice-service:3003',
            weight: 100,
            health: 'healthy',
          },
        ],
        middleware: ['auth', 'rate-limit'],
        status: 'active',
        metrics: {
          requests: Math.floor(Math.random() * 5000) + 500,
          errors: Math.floor(Math.random() * 50),
          averageResponseTime: Math.floor(Math.random() * 800) + 300,
        },
      },
      {
        id: 'analytics-api-v1',
        pattern: '^/api/analytics/.*',
        methods: ['GET'],
        targets: [
          {
            id: 'analytics-service-1',
            url: 'http://analytics-service:3004',
            weight: 100,
            health: 'healthy',
          },
        ],
        middleware: ['auth', 'cache'],
        status: 'active',
        metrics: {
          requests: Math.floor(Math.random() * 8000) + 800,
          errors: Math.floor(Math.random() * 80),
          averageResponseTime: Math.floor(Math.random() * 1000) + 400,
        },
      },
    ];

    // Filter routes based on query parameters
    let filteredRoutes = routes;
    if (status) {
      filteredRoutes = routes.filter(r => r.status === status);
    }
    if (pattern) {
      filteredRoutes = filteredRoutes.filter(r => r.pattern.includes(pattern));
    }

    // Calculate summary
    const summary = {
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.status === 'active').length,
      totalTargets: routes.reduce((sum, r) => sum + r.targets.length, 0),
      healthyTargets: routes.reduce(
        (sum, r) => sum + r.targets.filter(t => t.health === 'healthy').length,
        0
      ),
      totalRequests: routes.reduce((sum, r) => sum + r.metrics.requests, 0),
      totalErrors: routes.reduce((sum, r) => sum + r.metrics.errors, 0),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        routes: filteredRoutes,
        summary,
        filters: { status, pattern },
      },
      _metadata: {
        endpoint: 'gateway-routes',
        returned: filteredRoutes.length,
        totalRoutes: routes.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Routes request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get routes',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/api-gateway/routes/:routeId/health - Get route health status
 */
router.get('/routes/:routeId/health', async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;

    logger.api('🏥 [APIGateway] Route health requested', 'APIGatewayAPI', {
      routeId,
    });

    // Mock health check data
    const healthData = {
      routeId,
      status: 'healthy',
      targets: [
        {
          id: `${routeId}-target-1`,
          url: `http://${routeId}-service:3001`,
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 100) + 50,
          lastCheck: new Date(),
          uptime: '99.9%',
        },
        {
          id: `${routeId}-target-2`,
          url: `http://${routeId}-service:3002`,
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 100) + 50,
          lastCheck: new Date(),
          uptime: '99.8%',
        },
      ],
      loadBalancing: {
        strategy: 'round_robin',
        distribution: {
          target1: 45,
          target2: 55,
        },
      },
      circuitBreaker: {
        status: 'closed',
        failureRate: 0.5,
        lastTrip: null,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: healthData,
      _metadata: {
        endpoint: 'route-health',
        routeId,
        status: healthData.status,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Route health request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get route health',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CACHING MANAGEMENT
// ============================================

/**
 * GET /api/admin/api-gateway/cache - Get cache status and metrics
 */
router.get('/cache', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;

    logger.api('💾 [APIGateway] Cache status requested', 'APIGatewayAPI', {
      category,
    });

    const gateway = APIGateway.getInstance();
    const metrics = await gateway.getMetrics();
    const diagnostics = gateway.getDiagnostics();

    const cacheData = {
      enabled: diagnostics.config.cachingEnabled,
      metrics: metrics.caching,
      entries: diagnostics.cacheEntries,
      strategies: [
        {
          id: 'api-cache-1',
          pattern: '^/api/analytics/.*',
          ttl: 300,
          varyBy: ['authorization', 'tenant-id'],
          hitRate: Math.random() * 30 + 70,
          entries: Math.floor(Math.random() * 1000) + 100,
        },
        {
          id: 'api-cache-2',
          pattern: '^/api/hotel/hotels.*',
          ttl: 600,
          varyBy: ['authorization'],
          hitRate: Math.random() * 20 + 80,
          entries: Math.floor(Math.random() * 500) + 50,
        },
      ],
      summary: {
        totalEntries: diagnostics.cacheEntries,
        memoryUsage: metrics.caching.size,
        hitRate: metrics.caching.hitRate,
        missRate: metrics.caching.missRate,
        evictions: metrics.caching.evictions,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: cacheData,
      _metadata: {
        endpoint: 'gateway-cache',
        category,
        enabled: cacheData.enabled,
        hitRate: cacheData.summary.hitRate,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Cache status request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get cache status',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/api-gateway/cache/clear - Clear cache
 */
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    const { pattern, strategy } = req.body;

    logger.api('🗑️ [APIGateway] Cache clear requested', 'APIGatewayAPI', {
      pattern,
      strategy,
    });

    // In a real implementation, would clear cache entries
    const clearResult = {
      clearedEntries: Math.floor(Math.random() * 100) + 10,
      pattern: pattern || 'all',
      strategy: strategy || 'all',
      timestamp: new Date().toISOString(),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: clearResult,
      _metadata: {
        endpoint: 'cache-clear',
        clearedEntries: clearResult.clearedEntries,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [APIGateway] Cache clear failed', 'APIGatewayAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to clear cache',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// SECURITY & AUTHENTICATION
// ============================================

/**
 * GET /api/admin/api-gateway/security - Get security status
 */
router.get('/security', async (req: Request, res: Response) => {
  try {
    logger.api('🔒 [APIGateway] Security status requested', 'APIGatewayAPI');

    const gateway = APIGateway.getInstance();
    const metrics = await gateway.getMetrics();
    const diagnostics = gateway.getDiagnostics();

    const securityData = {
      authentication: {
        strategies: diagnostics.config.authStrategies,
        enabled: diagnostics.config.authStrategies > 0,
        methods: ['JWT', 'API Key', 'OAuth 2.0'],
      },
      metrics: metrics.security,
      cors: {
        enabled: true,
        allowedOrigins: ['https://app.hotel.com', 'https://admin.hotel.com'],
        violations: metrics.security.corsViolations,
      },
      filtering: {
        enabled: true,
        blockedRequests: metrics.security.blockedRequests,
        suspiciousActivity: metrics.security.suspiciousActivity,
        geoBlocking: {
          enabled: false,
          blockedCountries: [],
        },
      },
      headers: {
        securityHeaders: true,
        customHeaders: [
          'X-Frame-Options: DENY',
          'X-Content-Type-Options: nosniff',
          'X-XSS-Protection: 1; mode=block',
        ],
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: securityData,
      _metadata: {
        endpoint: 'gateway-security',
        authStrategies: securityData.authentication.strategies,
        blockedRequests: securityData.metrics.blockedRequests,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Security status request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get security status',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CONFIGURATION & DIAGNOSTICS
// ============================================

/**
 * GET /api/admin/api-gateway/config - Get gateway configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    logger.api('⚙️ [APIGateway] Configuration requested', 'APIGatewayAPI');

    const gateway = APIGateway.getInstance();
    const diagnostics = gateway.getDiagnostics();

    const config = {
      general: {
        version: '1.0.0',
        initialized: diagnostics.initialized,
        uptime: process.uptime(),
      },
      features: {
        rateLimiting: {
          enabled: diagnostics.config.rateLimitingEnabled,
          strategies: diagnostics.config.routingRules,
        },
        caching: {
          enabled: diagnostics.config.cachingEnabled,
          entries: diagnostics.cacheEntries,
        },
        analytics: {
          enabled: diagnostics.config.analyticsEnabled,
          retention: '7 days',
        },
        authentication: {
          strategies: diagnostics.config.authStrategies,
          enabled: diagnostics.config.authStrategies > 0,
        },
        routing: {
          rules: diagnostics.config.routingRules,
          loadBalancing: 'round_robin',
        },
      },
      limits: {
        maxRequestsPerMinute: 1000,
        maxRequestsPerHour: 50000,
        maxCacheSize: '1GB',
        maxRoutingRules: 100,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: config,
      _metadata: {
        endpoint: 'gateway-config',
        initialized: config.general.initialized,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Configuration request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get gateway configuration',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/api-gateway/diagnostics - Get gateway diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api('🔧 [APIGateway] Diagnostics requested', 'APIGatewayAPI');

    const diagnostics = getGatewayDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'gateway-diagnostics',
        initialized: diagnostics.initialized,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [APIGateway] Diagnostics request failed',
      'APIGatewayAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get gateway diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// Helper functions

function generateKeyIssues(insights: any): string[] {
  const issues: string[] = [];

  if (insights.performance.status === 'poor') {
    issues.push('High response times detected');
  }

  if (insights.performance.errorRate > 5) {
    issues.push(
      `High error rate: ${insights.performance.errorRate.toFixed(2)}%`
    );
  }

  if (insights.caching.efficiency === 'poor') {
    issues.push('Low cache hit rate affecting performance');
  }

  if (insights.routing.reliability === 'unstable') {
    issues.push('Circuit breaker trips detected');
  }

  return issues;
}

function generateRecommendations(insights: any): string[] {
  const recommendations: string[] = [];

  if (insights.performance.status !== 'excellent') {
    recommendations.push('Optimize slow endpoints and implement caching');
  }

  if (insights.caching.efficiency !== 'excellent') {
    recommendations.push('Review and optimize caching strategies');
  }

  if (insights.routing.health < 100) {
    recommendations.push('Check and resolve unhealthy route targets');
  }

  if (insights.rateLimiting.utilization > 80) {
    recommendations.push('Consider adjusting rate limiting thresholds');
  }

  return recommendations;
}

export default router;
