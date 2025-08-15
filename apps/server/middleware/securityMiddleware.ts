import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/utils/logger";
import { TimerManager } from "../utils/TimerManager";

// ✅ NEW: Phase 5 - Advanced security middleware
interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  cors: {
    enabled: boolean;
    origin: string[];
    credentials: boolean;
  };
  helmet: {
    enabled: boolean;
    contentSecurityPolicy: boolean;
    hsts: boolean;
  };
  inputSanitization: {
    enabled: boolean;
    maxInputLength: number;
  };
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  cors: {
    enabled: true,
    origin: ["http://localhost:3000", "https://yourdomain.com"],
    credentials: true,
  },
  helmet: {
    enabled: true,
    contentSecurityPolicy: true,
    hsts: true,
  },
  inputSanitization: {
    enabled: true,
    maxInputLength: 10000,
  },
};

// ✅ NEW: Phase 5 - Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ✅ NEW: Phase 5 - Advanced rate limiting middleware
export const advancedRateLimiting = (config: Partial<SecurityConfig> = {}) => {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!securityConfig.rateLimiting.enabled) {
      return next();
    }

    const clientId = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = securityConfig.rateLimiting.windowMs;

    const clientData = rateLimitStore.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      // Increment existing entry
      clientData.count++;

      if (clientData.count > securityConfig.rateLimiting.maxRequests) {
        logger.warn(
          "🚫 [SecurityMiddleware] Rate limit exceeded",
          "SecurityMiddleware",
          {
            clientId,
            count: clientData.count,
            maxRequests: securityConfig.rateLimiting.maxRequests,
          },
        );

        return res.status(429).json({
          success: false,
          error: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        });
      }
    }

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", securityConfig.rateLimiting.maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      securityConfig.rateLimiting.maxRequests - (clientData?.count || 1),
    );
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil((clientData?.resetTime || now + windowMs) / 1000),
    );

    next();
  };
};

// ✅ NEW: Phase 5 - Input sanitization middleware
export const inputSanitization = (config: Partial<SecurityConfig> = {}) => {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!securityConfig.inputSanitization.enabled) {
      return next();
    }

    const sanitizeValue = (value: any): any => {
      if (typeof value === "string") {
        // ✅ NEW: Phase 5 - Basic XSS protection
        let sanitized = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "")
          .trim();

        // ✅ NEW: Phase 5 - Length validation
        if (
          sanitized.length > securityConfig.inputSanitization.maxInputLength
        ) {
          throw new Error(`Input too long: ${sanitized.length} characters`);
        }

        return sanitized;
      }

      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }

      if (typeof value === "object" && value !== null) {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }

      return value;
    };

    try {
      // ✅ NEW: Phase 5 - Sanitize request body
      if (req.body) {
        req.body = sanitizeValue(req.body);
      }

      // ✅ NEW: Phase 5 - Sanitize query parameters
      if (req.query) {
        req.query = sanitizeValue(req.query);
      }

      // ✅ NEW: Phase 5 - Sanitize URL parameters
      if (req.params) {
        req.params = sanitizeValue(req.params);
      }

      next();
    } catch (error) {
      logger.warn(
        "🚫 [SecurityMiddleware] Input sanitization failed",
        "SecurityMiddleware",
        { error: error instanceof Error ? error.message : "Unknown error" },
      );

      return res.status(400).json({
        success: false,
        error: "Invalid input detected",
        code: "INPUT_SANITIZATION_FAILED",
      });
    }
  };
};

// ✅ NEW: Phase 5 - Security headers middleware
export const securityHeaders = (config: Partial<SecurityConfig> = {}) => {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!securityConfig.helmet.enabled) {
      return next();
    }

    // ✅ NEW: Phase 5 - Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    if (securityConfig.helmet.hsts) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }

    if (securityConfig.helmet.contentSecurityPolicy) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      );
    }

    next();
  };
};

// ✅ NEW: Phase 5 - Request logging middleware
export const securityLogging = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();
  const clientId = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";

  // ✅ NEW: Phase 5 - Log suspicious requests
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
  ];

  const isSuspicious = suspiciousPatterns.some(
    (pattern) =>
      pattern.test(req.url) || pattern.test(JSON.stringify(req.body)),
  );

  if (isSuspicious) {
    logger.warn(
      "🚨 [SecurityMiddleware] Suspicious request detected",
      "SecurityMiddleware",
      {
        clientId,
        userAgent,
        url: req.url,
        method: req.method,
        body: req.body,
        headers: req.headers,
      },
    );
  }

  // ✅ NEW: Phase 5 - Response logging
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.info(
      "📊 [SecurityMiddleware] Request processed",
      "SecurityMiddleware",
      {
        clientId,
        method: req.method,
        url: req.url,
        statusCode,
        duration,
        userAgent,
        suspicious: isSuspicious,
      },
    );
  });

  next();
};

// ✅ NEW: Phase 5 - CORS middleware
export const corsMiddleware = (config: Partial<SecurityConfig> = {}) => {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!securityConfig.cors.enabled) {
      return next();
    }

    const origin = req.headers.origin;

    if (origin && securityConfig.cors.origin.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );

    if (securityConfig.cors.credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    next();
  };
};

// ✅ NEW: Phase 5 - Combined security middleware
export const createSecurityMiddleware = (
  config: Partial<SecurityConfig> = {},
) => {
  return [
    securityHeaders(config),
    corsMiddleware(config),
    advancedRateLimiting(config),
    inputSanitization(config),
    securityLogging,
  ];
};

// ✅ NEW: Phase 5 - Security utilities
export const securityUtils = {
  // ✅ NEW: Phase 5 - Generate secure tokens
  generateSecureToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  // ✅ NEW: Phase 5 - Validate API key
  validateApiKey(apiKey: string): boolean {
    // Implement your API key validation logic here
    return apiKey && apiKey.length >= 32;
  },

  // ✅ NEW: Phase 5 - Check request origin
  isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
    return allowedOrigins.includes(origin);
  },

  // ✅ NEW: Phase 5 - Clean rate limit store
  cleanRateLimitStore(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
};

// ✅ NEW: Phase 5 - Clean up rate limit store every hour
TimerManager.setInterval(
  () => {
    securityUtils.cleanRateLimitStore();
  },
  60 * 60 * 1000,
  "auto-generated-interval-7",
); // 1 hour
