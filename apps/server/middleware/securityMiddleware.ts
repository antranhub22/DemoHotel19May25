import { NextFunction, Request, Response } from 'express';
import { SecurityConfig, SecurityHardening } from '../shared/SecurityHardening';

// Use console for logging if logger is not available
const logger = {
  info: (message: string, component: string, data?: any) =>
    console.log(`[${component}] ${message}`, data || ''),
  warn: (message: string, component: string, data?: any) =>
    console.warn(`[${component}] ${message}`, data || ''),
  error: (message: string, component: string, data?: any) =>
    console.error(`[${component}] ${message}`, data || ''),
  debug: (message: string, component: string, data?: any) =>
    console.debug(`[${component}] ${message}`, data || ''),
};

// ============================================
// Security Middleware Integration
// ============================================

export class SecurityMiddleware {
  private securityHardening: SecurityHardening;

  constructor(config?: Partial<SecurityConfig>) {
    this.securityHardening = new SecurityHardening(config);
    this.setupEventHandlers();

    logger.info('🛡️ SecurityMiddleware initialized', 'SecurityMiddleware');
  }

  private setupEventHandlers() {
    this.securityHardening.on('securityEvent', event => {
      logger.warn('🚨 Security Event:', 'SecurityMiddleware', event);
    });

    this.securityHardening.on('securityThreat', event => {
      logger.error('⚠️ Security Threat Detected:', 'SecurityMiddleware', {
        type: event.threat.type,
        severity: event.threat.severity,
        description: event.threat.description,
        ip: this.getClientIP(event.req),
        path: event.req.path,
      });
    });

    this.securityHardening.on('configUpdated', () => {
      logger.info('🔧 Security configuration updated', 'SecurityMiddleware');
    });
  }

  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any).socket?.remoteAddress ||
      '127.0.0.1'
    );
  }

  // ============================================
  // Middleware Factory Methods
  // ============================================

  /**
   * Get complete security middleware stack
   */
  getMiddleware() {
    return this.securityHardening.createMiddleware();
  }

  /**
   * Get lightweight security middleware (for high-performance endpoints)
   */
  getLightweightMiddleware() {
    return [
      this.basicSecurityHeaders.bind(this),
      this.inputValidation.bind(this),
      this.rateLimiting.bind(this),
    ];
  }

  /**
   * Get specific security middleware by type
   */
  getMiddlewareByType(types: string[]) {
    const middleware: any[] = [];
    const allMiddleware = this.securityHardening.createMiddleware();

    const typeMapping: Record<string, number> = {
      'request-filtering': 0,
      'input-sanitization': 1,
      'xss-protection': 2,
      'sql-injection': 3,
      'csrf-protection': 4,
      'rate-limiting': 5,
      'audit-logging': 6,
      'response-filtering': 7,
    };

    for (const type of types) {
      const index = typeMapping[type];
      if (index !== undefined && allMiddleware[index]) {
        middleware.push(allMiddleware[index]);
      }
    }

    return middleware;
  }

  // ============================================
  // Individual Middleware Components
  // ============================================

  basicSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
  }

  inputValidation(req: Request, res: Response, next: NextFunction) {
    try {
      // Basic input length validation
      const maxSize = 1024 * 1024; // 1MB
      const contentLength = parseInt(req.get('content-length') || '0');

      if (contentLength > maxSize) {
        return res.status(413).json({
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: maxSize,
        });
      }

      // Basic content type validation
      if (
        req.method === 'POST' ||
        req.method === 'PUT' ||
        req.method === 'PATCH'
      ) {
        const contentType = req.get('content-type') || '';
        const allowedTypes = [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain',
        ];

        if (!allowedTypes.some(type => contentType.includes(type))) {
          return res.status(415).json({
            error: 'Unsupported media type',
            code: 'UNSUPPORTED_MEDIA_TYPE',
            allowedTypes,
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Input validation error:', 'SecurityMiddleware', error);
      res.status(500).json({
        error: 'Input validation failed',
        code: 'VALIDATION_ERROR',
      });
    }
  }

  rateLimiting(req: Request, res: Response, next: NextFunction) {
    // This is a lightweight version - the full rate limiting is in SecurityHardening
    const ip = this.getClientIP(req);
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 60; // 60 requests per minute

    // Simple in-memory rate limiting (for production, use Redis)
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const key = `rate_limit:${ip}`;
    const requests = this.rateLimitStore.get(key) || [];

    // Clean old requests
    const validRequests = requests.filter(
      (time: number) => now - time < windowMs
    );

    if (validRequests.length >= maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current request
    validRequests.push(now);
    this.rateLimitStore.set(key, validRequests);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - validRequests.length);

    next();
  }

  private rateLimitStore: Map<string, number[]> = new Map();

  // ============================================
  // Route-Specific Security Middleware
  // ============================================

  /**
   * High security middleware for admin routes
   */
  adminSecurity() {
    return [
      this.basicSecurityHeaders.bind(this),
      this.strictRateLimiting.bind(this),
      this.adminInputValidation.bind(this),
      this.auditLogging.bind(this),
    ];
  }

  /**
   * API security middleware for public API endpoints
   */
  apiSecurity() {
    return [
      this.basicSecurityHeaders.bind(this),
      this.apiRateLimiting.bind(this),
      this.inputValidation.bind(this),
      this.apiKeyValidation.bind(this),
    ];
  }

  /**
   * Webhook security middleware
   */
  webhookSecurity() {
    return [
      this.basicSecurityHeaders.bind(this),
      this.webhookValidation.bind(this),
      this.signatureVerification.bind(this),
    ];
  }

  private strictRateLimiting(
    _req: Request,
    _res: Response,
    next: NextFunction
  ) {
    // Stricter rate limiting for admin endpoints

    // Implementation would be similar to rateLimiting but with stricter limits
    next();
  }

  private adminInputValidation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Stricter input validation for admin routes
    try {
      if (req.body) {
        const bodyStr = JSON.stringify(req.body);

        // Check for potentially dangerous patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /eval\(/i,
          /function\(/i,
          /\$\(/i,
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(bodyStr)) {
            return res.status(400).json({
              error: 'Invalid input detected',
              code: 'DANGEROUS_INPUT',
            });
          }
        }
      }

      next();
    } catch (error) {
      logger.error(
        'Admin input validation error:',
        'SecurityMiddleware',
        error
      );
      res.status(500).json({
        error: 'Input validation failed',
        code: 'VALIDATION_ERROR',
      });
    }
  }

  private auditLogging(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const ip = this.getClientIP(req);

    logger.info('🔍 Admin request audit', 'SecurityMiddleware', {
      ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, encoding?: any, _callback?: any) {
      const processingTime = Date.now() - startTime;

      logger.info('📝 Admin request completed', 'SecurityMiddleware', {
        ip,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
      });

      return originalEnd.call(this, chunk, encoding) as any;
    };

    next();
  }

  private apiRateLimiting(_req: Request, _res: Response, next: NextFunction) {
    // Moderate rate limiting for API endpoints

    // Implementation similar to rateLimiting
    next();
  }

  private apiKeyValidation(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.get('X-API-Key') || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        code: 'API_KEY_REQUIRED',
      });
    }

    // Validate API key format
    if (typeof apiKey !== 'string' || apiKey.length < 32) {
      return res.status(401).json({
        error: 'Invalid API key format',
        code: 'INVALID_API_KEY_FORMAT',
      });
    }

    // Here you would typically validate against a database
    // For now, we'll just check it's not empty
    (req as any).apiKey = apiKey;
    next();
  }

  private webhookValidation(req: Request, res: Response, next: NextFunction) {
    // Validate webhook-specific requirements
    const contentType = req.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Webhook must use application/json content type',
        code: 'INVALID_WEBHOOK_CONTENT_TYPE',
      });
    }

    next();
  }

  private signatureVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const signature =
      req.get('X-Webhook-Signature') || req.get('X-Hub-Signature');

    if (!signature) {
      return res.status(401).json({
        error: 'Webhook signature required',
        code: 'WEBHOOK_SIGNATURE_REQUIRED',
      });
    }

    // Here you would verify the webhook signature
    // This is a placeholder implementation
    next();
  }

  // ============================================
  // Management Methods
  // ============================================

  getSecurityMetrics() {
    return this.securityHardening.getMetrics();
  }

  getSecurityReport() {
    return this.securityHardening.generateSecurityReport();
  }

  getAuditLogs(limit?: number) {
    return this.securityHardening.getAuditLogs(limit);
  }

  updateSecurityConfig(config: Partial<SecurityConfig>) {
    this.securityHardening.updateConfig(config);
  }

  getRecentThreats(hours?: number) {
    return this.securityHardening.getRecentThreats(hours);
  }
}

// ============================================
// Default Middleware Instances
// ============================================

// Create default instance with production-ready configuration
export const defaultSecurityConfig: Partial<SecurityConfig> = {
  inputSanitization: {
    enabled: true,
    maxInputLength: 10000,
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: {},
    sanitizeQueries: true,
    sanitizeBody: true,
    sanitizeHeaders: false,
  },
  xssProtection: {
    enabled: true,
    mode: 'block',
    contentSecurityPolicy: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  },
  sqlInjectionProtection: {
    enabled: true,
    patterns: [
      "(\\%27)|(\\')|(\\\-\\\-)|(\\\%23)|(#)",
      "((\\\%3D)|(=))[^\n]*((\\\%27)|(\\')|(\\\-\\\-)|(\\\%3B)|(;))",
      'union.*select',
      'select.*from',
      'insert.*into',
      'delete.*from',
      'update.*set',
      'drop.*table',
    ],
    blockSuspiciousQueries: true,
    logAttempts: true,
  },
  csrfProtection: {
    enabled: false, // Disabled by default for API-first applications
    exemptions: ['^/api/auth/.*', '^/api/health$', '^/api/.*/webhook$'],
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP',
    skipSuccessfulRequests: false,
  },
  auditLogging: {
    enabled: true,
    logFailedAttempts: true,
    logSuccessfulRequests: process.env.NODE_ENV !== 'production',
    includeRequestBody: false,
    includeResponseBody: false,
  },
};

export const securityMiddleware = new SecurityMiddleware(defaultSecurityConfig);

// ============================================
// Convenient Middleware Exports
// ============================================

export const fullSecurity = securityMiddleware.getMiddleware();
export const lightweightSecurity =
  securityMiddleware.getLightweightMiddleware();
export const adminSecurity = securityMiddleware.adminSecurity();
export const apiSecurity = securityMiddleware.apiSecurity();
export const webhookSecurity = securityMiddleware.webhookSecurity();

// Individual middleware components
export const basicSecurityHeaders =
  securityMiddleware.basicSecurityHeaders.bind(securityMiddleware);
export const inputValidation =
  securityMiddleware.inputValidation.bind(securityMiddleware);
export const rateLimiting =
  securityMiddleware.rateLimiting.bind(securityMiddleware);

export default SecurityMiddleware;
