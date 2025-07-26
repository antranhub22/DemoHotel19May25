// ============================================
// API GATEWAY MIDDLEWARE v1.0 - Application Integration
// ============================================
// Express middleware integration for API Gateway functionality including
// rate limiting, authentication, caching, and request analytics

import { APIGateway, type GatewayConfig } from '@server/shared/APIGateway';
import { logger } from '@shared/utils/logger';
import { NextFunction, Request, Response } from 'express';

// Default gateway configuration
const defaultGatewayConfig: GatewayConfig = {
  rateLimiting: {
    enabled: true,
    strategies: [
      {
        name: 'global_rate_limit',
        type: 'fixed_window',
        windowSize: 60, // 1 minute
        maxRequests: 1000,
        targets: [{ type: 'global' }],
        actions: [
          { threshold: 80, action: 'warn' },
          { threshold: 100, action: 'block', duration: 60 },
        ],
      },
      {
        name: 'api_key_rate_limit',
        type: 'sliding_window',
        windowSize: 3600, // 1 hour
        maxRequests: 10000,
        targets: [{ type: 'apikey' }],
        actions: [
          { threshold: 90, action: 'throttle' },
          { threshold: 100, action: 'block', duration: 300 },
        ],
      },
    ],
    storage: 'memory',
    globalLimits: {
      requestsPerMinute: 1000,
      requestsPerHour: 50000,
      requestsPerDay: 1000000,
      burstLimit: 100,
    },
    keyGenerators: {
      ip: true,
      apiKey: true,
      userId: true,
      tenantId: true,
      custom: false,
    },
    exemptions: ['127.0.0.1', '::1'], // Localhost exemptions
  },
  authentication: {
    strategies: [
      {
        name: 'jwt_auth',
        type: 'jwt',
        priority: 1,
        config: {
          secretKey: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET,
          algorithms: ['HS256'],
          issuer: 'hotel-management-system',
        },
        endpoints: ['^/api/(?!auth|health).*'],
      },
      {
        name: 'api_key_auth',
        type: 'apikey',
        priority: 2,
        config: {
          headerName: 'X-API-Key',
          queryParam: 'api_key',
        },
        endpoints: ['^/api/(?!auth|health).*'],
      },
    ],
    exemptions: [
      '^/api/auth/.*',
      '^/api/.*/health$',
      '^/api/core/health$',
      '^/api/guest/.*',
      '^/api/temp-public/.*',
      '^/api/transcripts.*', // ✅ FIX: Allow transcript API for realtime voice data
      '^/api/request.*', // ✅ FIX: Allow voice assistant request API
      '^/docs/.*',
      '^/swagger/.*',
    ],
    tokenValidation: {
      verifyExpiration: true,
      verifySignature: true,
      verifyIssuer: true,
      allowedIssuers: ['hotel-management-system'],
    },
    sessionManagement: {
      enabled: true,
      maxSessions: 5,
      sessionTimeout: 60, // minutes
    },
  },
  versioning: {
    enabled: true,
    strategies: [
      { type: 'header', parameter: 'X-API-Version' },
      { type: 'query', parameter: 'version' },
      { type: 'path', parameter: 'version', prefix: '/api' },
    ],
    defaultVersion: 'v1',
    supportedVersions: ['v1', 'v2'],
    deprecationWarnings: [
      {
        version: 'v1',
        deprecationDate: new Date('2024-12-31'),
        sunsetDate: new Date('2025-06-30'),
        migrationGuide: 'https://docs.hotel.com/api/v2-migration',
      },
    ],
  },
  routing: {
    rules: [
      {
        id: 'hotel-api',
        pattern: '^/api/hotel/.*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        targets: [
          {
            id: 'hotel-service',
            url: 'http://localhost:10000',
            weight: 100,
            health: 'healthy',
            priority: 1,
            timeout: 30000,
          },
        ],
        middleware: ['auth', 'rate-limit', 'cache'],
        transformation: 'hotel_transform',
        caching: 'hotel_cache',
        rateLimit: 'api_key_rate_limit',
      },
      {
        id: 'voice-api',
        pattern: '^/api/voice/.*',
        methods: ['GET', 'POST'],
        targets: [
          {
            id: 'voice-service',
            url: 'http://localhost:10000',
            weight: 100,
            health: 'healthy',
            priority: 1,
            timeout: 30000,
          },
        ],
        middleware: ['auth', 'rate-limit'],
        rateLimit: 'api_key_rate_limit',
      },
      {
        id: 'analytics-api',
        pattern: '^/api/analytics/.*',
        methods: ['GET'],
        targets: [
          {
            id: 'analytics-service',
            url: 'http://localhost:10000',
            weight: 100,
            health: 'healthy',
            priority: 1,
            timeout: 30000,
          },
        ],
        middleware: ['auth', 'cache'],
        caching: 'analytics_cache',
      },
      {
        id: 'admin-api',
        pattern: '^/api/admin/.*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        targets: [
          {
            id: 'admin-service',
            url: 'http://localhost:10000',
            weight: 100,
            health: 'healthy',
            priority: 1,
            timeout: 30000,
          },
        ],
        middleware: ['auth', 'rate-limit'],
        rateLimit: 'api_key_rate_limit',
      },
    ],
    loadBalancing: {
      strategy: 'round_robin',
      healthCheckInterval: 30,
      maxRetries: 3,
      retryDelay: 1000,
    },
    healthChecks: {
      enabled: true,
      endpoint: '/health',
      interval: 30,
      timeout: 5000,
      healthyThreshold: 2,
      unhealthyThreshold: 3,
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 50, // 50%
      recoveryTimeout: 60,
      monitoringWindow: 300,
    },
  },
  transformation: {
    enabled: true,
    rules: [
      {
        id: 'add_correlation_id',
        name: 'Add Correlation ID',
        type: 'request',
        pattern: '.*',
        transformations: [
          {
            type: 'header',
            action: 'add',
            target: 'X-Correlation-ID',
            value: '${generateUUID()}',
          },
        ],
      },
      {
        id: 'add_tenant_context',
        name: 'Add Tenant Context',
        type: 'request',
        pattern: '^/api/hotel/.*',
        transformations: [
          {
            type: 'header',
            action: 'add',
            target: 'X-Tenant-ID',
            value: '${extractTenantFromAuth()}',
          },
        ],
      },
    ],
  },
  caching: {
    enabled: true,
    strategies: [
      {
        id: 'hotel_cache',
        pattern: '^/api/hotel/hotels.*',
        methods: ['GET'],
        ttl: 600, // 10 minutes
        varyBy: ['authorization', 'x-tenant-id'],
        conditions: [
          {
            type: 'header',
            field: 'cache-control',
            operator: 'exists',
          },
        ],
      },
      {
        id: 'analytics_cache',
        pattern: '^/api/analytics/.*',
        methods: ['GET'],
        ttl: 300, // 5 minutes
        varyBy: ['authorization', 'x-tenant-id'],
        conditions: [
          {
            type: 'query',
            field: 'no-cache',
            operator: 'exists',
          },
        ],
      },
    ],
    storage: 'memory',
    defaultTTL: 300,
    maxSize: 256, // MB
  },
  analytics: {
    enabled: true,
    metrics: [
      {
        name: 'gateway_requests_total',
        type: 'counter',
        labels: ['method', 'route', 'status_code'],
        description: 'Total number of requests through the gateway',
      },
      {
        name: 'gateway_request_duration',
        type: 'histogram',
        labels: ['method', 'route'],
        description: 'Request duration in milliseconds',
      },
      {
        name: 'gateway_rate_limit_hits',
        type: 'counter',
        labels: ['strategy', 'action'],
        description: 'Rate limit hits by strategy and action',
      },
      {
        name: 'gateway_cache_hits',
        type: 'counter',
        labels: ['strategy', 'hit_miss'],
        description: 'Cache hits and misses by strategy',
      },
    ],
    retention: 7, // days
    sampling: 100, // 100% sampling
    realTimeUpdates: true,
  },
  security: {
    cors: {
      enabled: true,
      origins: [
        'http://localhost:3000',
        'https://app.hotel.com',
        'https://admin.hotel.com',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Tenant-ID'],
      credentials: true,
      maxAge: 86400, // 24 hours
    },
    headers: {
      enabled: true,
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    validation: {
      enabled: true,
      maxBodySize: 10 * 1024 * 1024, // 10MB
      maxHeaderSize: 8 * 1024, // 8KB
      maxQueryParams: 50,
      requiredHeaders: ['User-Agent'],
    },
    filtering: {
      enabled: true,
      blacklist: [
        {
          type: 'ip',
          pattern: '^192\\.168\\.1\\.100$',
          action: 'block',
        },
      ],
      whitelist: [
        {
          type: 'ip',
          pattern: '^127\\.0\\.0\\.1$',
          action: 'allow',
        },
      ],
      geoBlocking: {
        enabled: false,
        allowedCountries: [],
        blockedCountries: [],
        action: 'block',
      },
    },
  },
};

// Initialize API Gateway
let gatewayInstance: APIGateway | null = null;

/**
 * Initialize API Gateway with configuration
 */
export async function initializeAPIGatewayMiddleware(
  customConfig?: Partial<GatewayConfig>
): Promise<void> {
  try {
    logger.info(
      '🌐 [APIGatewayMiddleware] Initializing API Gateway middleware',
      'APIGatewayMiddleware'
    );

    const config = customConfig
      ? { ...defaultGatewayConfig, ...customConfig }
      : defaultGatewayConfig;

    gatewayInstance = APIGateway.getInstance(config);
    await gatewayInstance.initialize();

    logger.success(
      '✅ [APIGatewayMiddleware] API Gateway middleware initialized',
      'APIGatewayMiddleware'
    );
  } catch (error) {
    logger.error(
      '❌ [APIGatewayMiddleware] Failed to initialize API Gateway middleware',
      'APIGatewayMiddleware',
      error
    );
    throw error;
  }
}

/**
 * Create API Gateway middleware for Express
 */
export function createAPIGatewayMiddleware() {
  if (!gatewayInstance) {
    throw new Error(
      'API Gateway middleware not initialized. Call initializeAPIGatewayMiddleware() first.'
    );
  }

  return gatewayInstance.createMiddleware();
}

/**
 * Rate limiting middleware (can be used independently)
 */
export function rateLimitMiddleware(
  options: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    onLimitReached?: (req: Request, res: Response) => void;
  } = {}
) {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 100,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    onLimitReached,
  } = options;

  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create request record
    let record = requests.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requests.set(key, record);
    }

    // Increment request count
    record.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        maxRequests - record.count
      ).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
    });

    // Check if limit exceeded
    if (record.count > maxRequests) {
      logger.warn(
        '🚦 [APIGatewayMiddleware] Rate limit exceeded',
        'APIGatewayMiddleware',
        {
          key,
          count: record.count,
          limit: maxRequests,
        }
      );

      if (onLimitReached) {
        onLimitReached(req, res);
      }

      return res.status(429).json({
        error: {
          message: 'Rate limit exceeded',
          retryAfter: new Date(record.resetTime).toISOString(),
          limit: maxRequests,
          remaining: 0,
        },
      });
    }

    next();
  };
}

/**
 * API versioning middleware
 */
export function apiVersioningMiddleware(
  options: {
    defaultVersion?: string;
    supportedVersions?: string[];
    versionHeader?: string;
    versionQuery?: string;
    strictVersioning?: boolean;
  } = {}
) {
  const {
    defaultVersion = 'v1',
    supportedVersions = ['v1'],
    versionHeader = 'X-API-Version',
    versionQuery = 'version',
    strictVersioning = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Extract version from various sources
    let version =
      req.get(versionHeader) ||
      (req.query[versionQuery] as string) ||
      defaultVersion;

    // Validate version
    if (!supportedVersions.includes(version)) {
      if (strictVersioning) {
        return res.status(400).json({
          error: {
            message: 'Unsupported API version',
            supportedVersions,
            requestedVersion: version,
          },
        });
      } else {
        version = defaultVersion;
      }
    }

    // Add version to request
    (req as any).apiVersion = version;
    res.set('X-API-Version', version);

    logger.debug(
      '📋 [APIGatewayMiddleware] API version resolved',
      'APIGatewayMiddleware',
      {
        requestedVersion:
          req.get(versionHeader) || req.query[versionQuery] || 'none',
        resolvedVersion: version,
      }
    );

    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(
  customHeaders: Record<string, string> = {}
) {
  const defaultHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...customHeaders,
  };

  return (_req: Request, res: Response, next: NextFunction) => {
    // Set security headers
    Object.entries(defaultHeaders).forEach(([name, value]) => {
      res.set(name, value);
    });

    next();
  };
}

/**
 * Request analytics middleware
 */
export function requestAnalyticsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to headers
    res.set('X-Request-ID', requestId);
    (req as any).requestId = requestId;

    // Log request start
    logger.api(
      '📊 [APIGatewayMiddleware] Request started',
      'APIGatewayMiddleware',
      {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      }
    );

    // Hook into response to log completion
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
      const duration = Date.now() - startTime;

      logger.api(
        '📊 [APIGatewayMiddleware] Request completed',
        'APIGatewayMiddleware',
        {
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          responseSize: res.get('Content-Length') || 0,
        }
      );

      // Call original end method with proper typing
      return originalEnd.call(this, chunk, encoding as any, cb);
    } as typeof res.end;

    next();
  };
}

/**
 * Get API Gateway metrics
 */
export async function getAPIGatewayMetrics() {
  if (!gatewayInstance) {
    throw new Error('API Gateway not initialized');
  }
  return gatewayInstance.getMetrics();
}

/**
 * Get API Gateway diagnostics
 */
export function getAPIGatewayDiagnostics() {
  if (!gatewayInstance) {
    throw new Error('API Gateway not initialized');
  }
  return gatewayInstance.getDiagnostics();
}

// Export default configuration for reference
export { defaultGatewayConfig };
