// @ts-nocheck - Temporarily disable TypeScript checking for this file
import crypto from 'crypto';
import { EventEmitter } from 'events';
import csrf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { logger } from '../../packages/shared/utils/logger';

// ============================================
// Types & Interfaces
// ============================================

export interface SecurityConfig {
  inputSanitization: {
    enabled: boolean;
    maxInputLength: number;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
    sanitizeQueries: boolean;
    sanitizeBody: boolean;
    sanitizeHeaders: boolean;
  };
  xssProtection: {
    enabled: boolean;
    mode: 'block' | 'filter' | 'report';
    reportUri?: string;
    contentSecurityPolicy: {
      enabled: boolean;
      directives: Record<string, string[]>;
    };
  };
  sqlInjectionProtection: {
    enabled: boolean;
    patterns: string[];
    blockSuspiciousQueries: boolean;
    logAttempts: boolean;
  };
  csrfProtection: {
    enabled: boolean;
    exemptions: string[];
    cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };
  requestFiltering: {
    enabled: boolean;
    maxRequestSize: string;
    allowedMethods: string[];
    blockedUserAgents: string[];
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
  responseFiltering: {
    enabled: boolean;
    removeServerHeaders: boolean;
    addSecurityHeaders: boolean;
    sanitizeErrorMessages: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    message: string;
    skipSuccessfulRequests: boolean;
  };
  auditLogging: {
    enabled: boolean;
    logFailedAttempts: boolean;
    logSuccessfulRequests: boolean;
    includeRequestBody: boolean;
    includeResponseBody: boolean;
  };
}

export interface SecurityContext {
  requestId: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  userId?: string;
  tenantId?: string;
  threats: SecurityThreat[];
  sanitized: boolean;
  filtered: boolean;
}

export interface SecurityThreat {
  type:
    | 'xss'
    | 'sql_injection'
    | 'csrf'
    | 'rate_limit'
    | 'suspicious_pattern'
    | 'blocked_ip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  payload?: any;
  action: 'blocked' | 'filtered' | 'logged';
  timestamp: Date;
}

export interface SecurityMetrics {
  totalRequests: number;
  threatsDetected: number;
  threatsBlocked: number;
  requestsSanitized: number;
  xssAttempts: number;
  sqlInjectionAttempts: number;
  csrfAttempts: number;
  rateLimitHits: number;
  blockedIPs: Set<string>;
  suspiciousUserAgents: Set<string>;
}

export interface SecurityAuditLog {
  timestamp: Date;
  requestId: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  userId?: string;
  tenantId?: string;
  threats: SecurityThreat[];
  action: 'allowed' | 'blocked' | 'filtered';
  responseCode: number;
  processingTime: number;
}

// ============================================
// Default Configuration
// ============================================

const defaultSecurityConfig: SecurityConfig = {
  inputSanitization: {
    enabled: true,
    maxInputLength: 10000,
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'title'],
      '*': ['class', 'id'],
    },
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
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'wss:', 'https:'],
      },
    },
  },
  sqlInjectionProtection: {
    enabled: true,
    patterns: [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /union([^a]|a[^l]|al[^l]|all[^s]|alls[^e]|allse[^l]|allsel[^e]|allsele[^c]|allselec[^t])/i,
    ],
    blockSuspiciousQueries: true,
    logAttempts: true,
  },
  csrfProtection: {
    enabled: true,
    exemptions: ['^/api/auth/login$', '^/api/health$', '^/api/.*/webhook$'],
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
  requestFiltering: {
    enabled: true,
    maxRequestSize: '10mb',
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    blockedUserAgents: [
      /bot/i,
      /spider/i,
      /crawler/i,
      /scanner/i,
      /nikto/i,
      /sqlmap/i,
    ],
    ipWhitelist: [],
    ipBlacklist: [],
  },
  responseFiltering: {
    enabled: true,
    removeServerHeaders: true,
    addSecurityHeaders: true,
    sanitizeErrorMessages: true,
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
    logSuccessfulRequests: false,
    includeRequestBody: false,
    includeResponseBody: false,
  },
};

// ============================================
// Security Hardening Class
// ============================================

export class SecurityHardening extends EventEmitter {
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private auditLogs: SecurityAuditLog[] = [];
  private rateLimiter: any;
  private csrfProtection: any;

  constructor(config: Partial<SecurityConfig> = {}) {
    super();
    this.config = { ...defaultSecurityConfig, ...config };
    this.metrics = this.initializeMetrics();
    this.setupRateLimiter();
    this.setupCSRFProtection();

    logger.info(
      '🛡️ SecurityHardening initialized with comprehensive protection',
      'SecurityHardening'
    );
  }

  // ============================================
  // Initialization Methods
  // ============================================

  private initializeMetrics(): SecurityMetrics {
    return {
      totalRequests: 0,
      threatsDetected: 0,
      threatsBlocked: 0,
      requestsSanitized: 0,
      xssAttempts: 0,
      sqlInjectionAttempts: 0,
      csrfAttempts: 0,
      rateLimitHits: 0,
      blockedIPs: new Set(),
      suspiciousUserAgents: new Set(),
    };
  }

  private setupRateLimiter() {
    if (!this.config.rateLimiting.enabled) return;

    this.rateLimiter = rateLimit({
      windowMs: this.config.rateLimiting.windowMs,
      max: this.config.rateLimiting.maxRequests,
      message: {
        error: this.config.rateLimiting.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(this.config.rateLimiting.windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: req => {
        return (
          this.config.rateLimiting.skipSuccessfulRequests &&
          req.res &&
          req.res.statusCode < 400
        );
      },
      onLimitReached: req => {
        this.metrics.rateLimitHits++;
        this.logSecurityEvent(req, {
          type: 'rate_limit',
          severity: 'medium',
          description: 'Rate limit exceeded',
          action: 'blocked',
          timestamp: new Date(),
        });
      },
    });
  }

  private setupCSRFProtection() {
    if (!this.config.csrfProtection.enabled) return;

    this.csrfProtection = csrf({
      cookie: this.config.csrfProtection.cookieOptions,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    });
  }

  // ============================================
  // Main Middleware Factory
  // ============================================

  createMiddleware() {
    return [
      this.requestFilteringMiddleware.bind(this),
      this.inputSanitizationMiddleware.bind(this),
      this.xssProtectionMiddleware.bind(this),
      this.sqlInjectionProtectionMiddleware.bind(this),
      this.csrfProtectionMiddleware.bind(this),
      this.rateLimitingMiddleware.bind(this),
      this.auditLoggingMiddleware.bind(this),
      this.responseFilteringMiddleware.bind(this),
    ];
  }

  // ============================================
  // Individual Middleware Functions
  // ============================================

  private async requestFilteringMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.requestFiltering.enabled) return next();

    const context = this.createSecurityContext(req);
    this.metrics.totalRequests++;

    try {
      // Check HTTP method
      if (!this.config.requestFiltering.allowedMethods.includes(req.method)) {
        return this.blockRequest(
          res,
          'METHOD_NOT_ALLOWED',
          'HTTP method not allowed',
          context
        );
      }

      // Check User Agent
      const userAgent = req.get('User-Agent') || '';
      for (const pattern of this.config.requestFiltering.blockedUserAgents) {
        if (pattern.test(userAgent)) {
          this.metrics.suspiciousUserAgents.add(userAgent);
          return this.blockRequest(
            res,
            'BLOCKED_USER_AGENT',
            'Suspicious user agent blocked',
            context
          );
        }
      }

      // Check IP whitelist/blacklist
      const clientIP = this.getClientIP(req);
      if (this.config.requestFiltering.ipBlacklist.includes(clientIP)) {
        this.metrics.blockedIPs.add(clientIP);
        return this.blockRequest(
          res,
          'BLOCKED_IP',
          'IP address blocked',
          context
        );
      }

      if (
        this.config.requestFiltering.ipWhitelist.length > 0 &&
        !this.config.requestFiltering.ipWhitelist.includes(clientIP)
      ) {
        return this.blockRequest(
          res,
          'IP_NOT_WHITELISTED',
          'IP address not whitelisted',
          context
        );
      }

      // Attach security context to request
      (req as any).securityContext = context;
      next();
    } catch (error) {
      logger.error('Request filtering error:', 'SecurityHardening', error);
      next(error);
    }
  }

  private async inputSanitizationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.inputSanitization.enabled) return next();

    const context = (req as any).securityContext as SecurityContext;

    try {
      // Sanitize query parameters
      if (this.config.inputSanitization.sanitizeQueries && req.query) {
        req.query = this.sanitizeObject(req.query, context);
      }

      // Sanitize request body
      if (this.config.inputSanitization.sanitizeBody && req.body) {
        req.body = this.sanitizeObject(req.body, context);
      }

      // Sanitize headers if enabled
      if (this.config.inputSanitization.sanitizeHeaders && req.headers) {
        const sanitizedHeaders: any = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            sanitizedHeaders[key] = this.sanitizeString(value, context);
          } else {
            sanitizedHeaders[key] = value;
          }
        }
        req.headers = sanitizedHeaders;
      }

      if (context.sanitized) {
        this.metrics.requestsSanitized++;
      }

      next();
    } catch (error) {
      logger.error('Input sanitization error:', 'SecurityHardening', error);
      next(error);
    }
  }

  private async xssProtectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.xssProtection.enabled) return next();

    const context = (req as any).securityContext as SecurityContext;

    try {
      // Set X-XSS-Protection header
      res.setHeader(
        'X-XSS-Protection',
        this.config.xssProtection.mode === 'block' ? '1; mode=block' : '1'
      );

      // Set Content Security Policy
      if (this.config.xssProtection.contentSecurityPolicy.enabled) {
        const cspDirectives = Object.entries(
          this.config.xssProtection.contentSecurityPolicy.directives
        )
          .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
          .join('; ');
        res.setHeader('Content-Security-Policy', cspDirectives);
      }

      // Check for XSS patterns in request
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>/gi,
      ];

      const requestContent = JSON.stringify({
        query: req.query,
        body: req.body,
      });
      for (const pattern of xssPatterns) {
        if (pattern.test(requestContent)) {
          const threat: SecurityThreat = {
            type: 'xss',
            severity: 'high',
            description: 'XSS pattern detected in request',
            payload: requestContent.match(pattern),
            action: 'blocked',
            timestamp: new Date(),
          };
          context.threats.push(threat);
          this.metrics.xssAttempts++;
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;

          return this.blockRequest(
            res,
            'XSS_DETECTED',
            'Cross-site scripting attempt detected',
            context
          );
        }
      }

      next();
    } catch (error) {
      logger.error('XSS protection error:', 'SecurityHardening', error);
      next(error);
    }
  }

  private async sqlInjectionProtectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.sqlInjectionProtection.enabled) return next();

    const context = (req as any).securityContext as SecurityContext;

    try {
      const requestContent = JSON.stringify({
        query: req.query,
        body: req.body,
      });

      for (const pattern of this.config.sqlInjectionProtection.patterns) {
        if (pattern.test(requestContent)) {
          const threat: SecurityThreat = {
            type: 'sql_injection',
            severity: 'critical',
            description: 'SQL injection pattern detected',
            payload: requestContent.match(pattern),
            action: 'blocked',
            timestamp: new Date(),
          };
          context.threats.push(threat);
          this.metrics.sqlInjectionAttempts++;
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;

          if (this.config.sqlInjectionProtection.logAttempts) {
            logger.warn(
              '🚨 SQL injection attempt detected',
              'SecurityHardening',
              {
                ip: context.ip,
                path: context.path,
                pattern: pattern.toString(),
                payload: threat.payload,
              }
            );
          }

          if (this.config.sqlInjectionProtection.blockSuspiciousQueries) {
            return this.blockRequest(
              res,
              'SQL_INJECTION_DETECTED',
              'SQL injection attempt detected',
              context
            );
          }
        }
      }

      next();
    } catch (error) {
      logger.error(
        'SQL injection protection error:',
        'SecurityHardening',
        error
      );
      next(error);
    }
  }

  private async csrfProtectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.csrfProtection.enabled) return next();

    const context = (req as any).securityContext as SecurityContext;

    try {
      // Check if endpoint is exempt from CSRF protection
      const isExempt = this.config.csrfProtection.exemptions.some(pattern =>
        new RegExp(pattern).test(req.path)
      );

      if (isExempt) {
        return next();
      }

      // Apply CSRF protection
      this.csrfProtection(req, res, (error: any) => {
        if (error) {
          const threat: SecurityThreat = {
            type: 'csrf',
            severity: 'high',
            description: 'CSRF token validation failed',
            action: 'blocked',
            timestamp: new Date(),
          };
          context.threats.push(threat);
          this.metrics.csrfAttempts++;
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;

          return this.blockRequest(
            res,
            'CSRF_TOKEN_INVALID',
            'CSRF token validation failed',
            context
          );
        }
        next();
      });
    } catch (error) {
      logger.error('CSRF protection error:', 'SecurityHardening', error);
      next(error);
    }
  }

  private async rateLimitingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.rateLimiting.enabled || !this.rateLimiter) return next();

    this.rateLimiter(req, res, next);
  }

  private async auditLoggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.auditLogging.enabled) return next();

    const context = (req as any).securityContext as SecurityContext;
    const startTime = Date.now();

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const processingTime = Date.now() - startTime;

      const auditLog: SecurityAuditLog = {
        timestamp: new Date(),
        requestId: context.requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        method: context.method,
        path: context.path,
        userId: context.userId,
        tenantId: context.tenantId,
        threats: context.threats,
        action: context.threats.length > 0 ? 'blocked' : 'allowed',
        responseCode: res.statusCode,
        processingTime,
      };

      (req as any).securityHardening.logAuditEvent(auditLog);

      originalEnd.call(this, chunk, encoding);
    };

    (req as any).securityHardening = this;
    next();
  }

  private async responseFilteringMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!this.config.responseFiltering.enabled) return next();

    try {
      // Remove server identification headers
      if (this.config.responseFiltering.removeServerHeaders) {
        res.removeHeader('Server');
        res.removeHeader('X-Powered-By');
      }

      // Add security headers
      if (this.config.responseFiltering.addSecurityHeaders) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Download-Options', 'noopen');
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains'
        );
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      }

      next();
    } catch (error) {
      logger.error('Response filtering error:', 'SecurityHardening', error);
      next(error);
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private createSecurityContext(req: Request): SecurityContext {
    return {
      requestId: crypto.randomUUID(),
      timestamp: new Date(),
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      tenantId: (req as any).tenant?.id,
      threats: [],
      sanitized: false,
      filtered: false,
    };
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

  private sanitizeObject(obj: any, context: SecurityContext): any {
    if (typeof obj === 'string') {
      const sanitized = this.sanitizeString(obj, context);
      if (sanitized !== obj) {
        context.sanitized = true;
      }
      return sanitized;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, context));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value, context);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(input: string, context: SecurityContext): string {
    if (!input || typeof input !== 'string') return input;

    // Check length
    if (input.length > this.config.inputSanitization.maxInputLength) {
      input = input.substring(0, this.config.inputSanitization.maxInputLength);
      context.sanitized = true;
    }

    // Escape HTML entities
    input = validator.escape(input);

    // Remove potentially dangerous characters
    input = input.replace(/[<>]/g, '');

    return input;
  }

  private blockRequest(
    res: Response,
    code: string,
    message: string,
    context: SecurityContext
  ) {
    this.emit('securityEvent', {
      type: 'request_blocked',
      context,
      code,
      message,
    });

    return res.status(403).json({
      error: this.config.responseFiltering.sanitizeErrorMessages
        ? 'Request blocked for security reasons'
        : message,
      code,
      requestId: context.requestId,
      timestamp: context.timestamp,
    });
  }

  private logSecurityEvent(req: Request, threat: SecurityThreat) {
    const context = (req as any).securityContext as SecurityContext;
    if (context) {
      context.threats.push(threat);
    }

    logger.warn('🚨 Security threat detected', 'SecurityHardening', {
      type: threat.type,
      severity: threat.severity,
      description: threat.description,
      ip: this.getClientIP(req),
      path: req.path,
      userAgent: req.get('User-Agent'),
    });

    this.emit('securityThreat', { threat, req });
  }

  private logAuditEvent(auditLog: SecurityAuditLog) {
    this.auditLogs.push(auditLog);

    // Keep only last 10000 logs in memory
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    if (
      this.config.auditLogging.logFailedAttempts &&
      auditLog.threats.length > 0
    ) {
      logger.warn('🔍 Security audit log', 'SecurityHardening', auditLog);
    }

    if (
      this.config.auditLogging.logSuccessfulRequests &&
      auditLog.threats.length === 0
    ) {
      logger.debug('✅ Request allowed', 'SecurityHardening', {
        requestId: auditLog.requestId,
        method: auditLog.method,
        path: auditLog.path,
        responseCode: auditLog.responseCode,
        processingTime: auditLog.processingTime,
      });
    }
  }

  // ============================================
  // Management & Monitoring Methods
  // ============================================

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getAuditLogs(limit: number = 100): SecurityAuditLog[] {
    return this.auditLogs.slice(-limit);
  }

  getRecentThreats(hours: number = 24): SecurityThreat[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const threats: SecurityThreat[] = [];

    for (const log of this.auditLogs) {
      if (log.timestamp >= cutoff) {
        threats.push(...log.threats);
      }
    }

    return threats.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getThreatsByType(): Record<string, number> {
    const threats = this.getRecentThreats();
    const byType: Record<string, number> = {};

    for (const threat of threats) {
      byType[threat.type] = (byType[threat.type] || 0) + 1;
    }

    return byType;
  }

  updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize components that depend on config
    this.setupRateLimiter();
    this.setupCSRFProtection();

    logger.info(
      '🔧 SecurityHardening configuration updated',
      'SecurityHardening'
    );
    this.emit('configUpdated', this.config);
  }

  generateSecurityReport(): any {
    const metrics = this.getMetrics();
    const threats = this.getRecentThreats();
    const threatsByType = this.getThreatsByType();

    return {
      overview: {
        totalRequests: metrics.totalRequests,
        threatsDetected: metrics.threatsDetected,
        threatsBlocked: metrics.threatsBlocked,
        threatDetectionRate:
          metrics.totalRequests > 0
            ? ((metrics.threatsDetected / metrics.totalRequests) * 100).toFixed(
                2
              ) + '%'
            : '0%',
        requestsSanitized: metrics.requestsSanitized,
      },
      threatBreakdown: threatsByType,
      recentThreats: threats.slice(0, 10),
      securityHealth: {
        status:
          metrics.threatsBlocked > 0 ? 'active_threats_blocked' : 'secure',
        riskLevel: this.calculateRiskLevel(metrics),
        recommendations: this.generateRecommendations(metrics),
      },
      configuration: {
        enabled: true,
        protectionLayers: Object.keys(this.config).filter(
          key => this.config[key as keyof SecurityConfig].enabled
        ),
      },
    };
  }

  private calculateRiskLevel(
    metrics: SecurityMetrics
  ): 'low' | 'medium' | 'high' | 'critical' {
    const threatRate =
      metrics.totalRequests > 0
        ? metrics.threatsDetected / metrics.totalRequests
        : 0;

    if (threatRate > 0.1) return 'critical';
    if (threatRate > 0.05) return 'high';
    if (threatRate > 0.01) return 'medium';
    return 'low';
  }

  private generateRecommendations(metrics: SecurityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.xssAttempts > 0) {
      recommendations.push(
        'Consider implementing stricter Content Security Policy'
      );
    }

    if (metrics.sqlInjectionAttempts > 0) {
      recommendations.push('Review database query parameterization');
    }

    if (metrics.rateLimitHits > metrics.totalRequests * 0.1) {
      recommendations.push('Consider adjusting rate limiting thresholds');
    }

    if (metrics.blockedIPs.size > 10) {
      recommendations.push(
        'Review IP blocking patterns and consider automated blocking'
      );
    }

    return recommendations;
  }
}

// ============================================
// Export Default Instance
// ============================================

export const securityHardening = new SecurityHardening();
export default SecurityHardening;
