// ============================================
// PRODUCTION RATE LIMITING MIDDLEWARE
// ============================================
// Advanced rate limiting with database storage and security features

import { SECURITY_CONFIG } from "@auth/config";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
import { NextFunction, Request, Response } from "express";
import { AuditLogger } from "../services/AuditLogger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface RateLimitData {
  identifier: string;
  limitType: string;
  requestCount: number;
  windowStart: Date;
  expiresAt: Date;
}

export class RateLimitingMiddleware {
  // ============================================
  // RATE LIMITING FACTORY METHODS
  // ============================================

  /**
   * Create login rate limiter
   */
  static createLoginLimiter() {
    return this.createRateLimiter({
      windowMs: SECURITY_CONFIG.LOGIN_RATE_WINDOW,
      maxRequests: SECURITY_CONFIG.LOGIN_RATE_LIMIT,
      keyGenerator: (req: Request) => this.getClientIdentifier(req),
      onLimitReached: async (req: Request, res: Response) => {
        await this.handleLoginRateLimit(req, res);
      },
    });
  }

  /**
   * Create registration rate limiter
   */
  static createRegistrationLimiter() {
    return this.createRateLimiter({
      windowMs: SECURITY_CONFIG.REGISTRATION_RATE_WINDOW,
      maxRequests: SECURITY_CONFIG.REGISTRATION_RATE_LIMIT,
      keyGenerator: (req: Request) => this.getClientIdentifier(req),
      onLimitReached: async (req: Request, res: Response) => {
        await this.handleRegistrationRateLimit(req, res);
      },
    });
  }

  /**
   * Create password reset rate limiter
   */
  static createPasswordResetLimiter() {
    return this.createRateLimiter({
      windowMs: SECURITY_CONFIG.PASSWORD_RESET_RATE_WINDOW,
      maxRequests: SECURITY_CONFIG.PASSWORD_RESET_RATE_LIMIT,
      keyGenerator: (req: Request) =>
        req.body.email || this.getClientIdentifier(req),
      onLimitReached: async (req: Request, res: Response) => {
        await this.handlePasswordResetRateLimit(req, res);
      },
    });
  }

  /**
   * Create general API rate limiter
   */
  static createApiLimiter(maxRequests: number = 100, windowMs: number = 60000) {
    return this.createRateLimiter({
      windowMs,
      maxRequests,
      keyGenerator: (req: Request) => this.getClientIdentifier(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    });
  }

  // ============================================
  // CORE RATE LIMITING LOGIC
  // ============================================

  /**
   * Create rate limiter middleware
   */
  private static createRateLimiter(config: RateLimitConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const identifier = config.keyGenerator(req);
        const limitType = this.getLimitTypeFromPath(req.path);

        // Check current rate limit status
        const rateLimitData = await this.getRateLimitData(
          identifier,
          limitType,
          config.windowMs,
        );

        // Check if limit exceeded
        if (rateLimitData.requestCount >= config.maxRequests) {
          // Rate limit exceeded
          await this.logRateLimitViolation(req, rateLimitData);

          if (config.onLimitReached) {
            await config.onLimitReached(req, res);
          }

          return this.sendRateLimitResponse(res, rateLimitData, config);
        }

        // Increment request count
        await this.incrementRateLimit(identifier, limitType, config.windowMs);

        // Add rate limit headers
        this.addRateLimitHeaders(res, rateLimitData, config);

        next();
      } catch (error) {
        console.error(
          "❌ [RateLimit] Error in rate limiting middleware:",
          error,
        );
        // On error, allow request through (fail open)
        next();
      }
    };
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  /**
   * Get current rate limit data for identifier
   */
  private static async getRateLimitData(
    identifier: string,
    limitType: string,
    windowMs: number,
  ): Promise<RateLimitData> {
    const prisma = await PrismaConnectionManager.getInstance();
    const windowStart = new Date(Date.now() - windowMs);

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM rate_limits 
            WHERE identifier = ${identifier} 
                AND limit_type = ${limitType}
                AND window_start >= ${windowStart.toISOString()}::timestamptz
                AND expires_at > CURRENT_TIMESTAMP
            ORDER BY window_start DESC
            LIMIT 1
        `;

    if (result.length > 0) {
      const row = result[0];
      return {
        identifier: row.identifier,
        limitType: row.limit_type,
        requestCount: row.request_count,
        windowStart: row.window_start,
        expiresAt: row.expires_at,
      };
    }

    // No existing record, return zero count
    return {
      identifier,
      limitType,
      requestCount: 0,
      windowStart: new Date(),
      expiresAt: new Date(Date.now() + windowMs),
    };
  }

  /**
   * Increment rate limit counter
   */
  private static async incrementRateLimit(
    identifier: string,
    limitType: string,
    windowMs: number,
  ): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();
    const now = new Date();
    const expiresAt = new Date(Date.now() + windowMs);

    // Use upsert to handle concurrent requests
    await (prisma as any).$executeRaw`
            INSERT INTO rate_limits (id, identifier, limit_type, request_count, window_start, expires_at)
            VALUES (
                ${this.generateRateLimitId(identifier, limitType)},
                ${identifier}, 
                ${limitType}, 
                1, 
                ${now.toISOString()}::timestamptz,
                ${expiresAt.toISOString()}::timestamptz
            )
            ON CONFLICT (identifier, limit_type, window_start) 
            DO UPDATE SET 
                request_count = rate_limits.request_count + 1,
                expires_at = ${expiresAt.toISOString()}::timestamptz
        `;
  }

  // ============================================
  // RESPONSE HANDLING
  // ============================================

  /**
   * Send rate limit exceeded response
   */
  private static sendRateLimitResponse(
    res: Response,
    rateLimitData: RateLimitData,
    config: RateLimitConfig,
  ): void {
    const resetTime = new Date(
      rateLimitData.windowStart.getTime() + config.windowMs,
    );
    const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);

    res.status(429).json({
      success: false,
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: resetTime.toISOString(),
    });
  }

  /**
   * Add rate limit headers to response
   */
  private static addRateLimitHeaders(
    res: Response,
    rateLimitData: RateLimitData,
    config: RateLimitConfig,
  ): void {
    const remaining = Math.max(
      0,
      config.maxRequests - rateLimitData.requestCount - 1,
    );
    const resetTime = new Date(
      rateLimitData.windowStart.getTime() + config.windowMs,
    );

    res.set({
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(resetTime.getTime() / 1000).toString(),
      "X-RateLimit-Window": config.windowMs.toString(),
    });
  }

  // ============================================
  // LOGGING & MONITORING
  // ============================================

  /**
   * Log rate limit violation
   */
  private static async logRateLimitViolation(
    req: Request,
    rateLimitData: RateLimitData,
  ): Promise<void> {
    await AuditLogger.logAuthEvent(
      "auth.rate.limit.exceeded",
      "rate_limit_violation",
      "warning",
      {
        ipAddress: this.getClientIP(req),
        userAgent: req.get("User-Agent") || "Unknown",
        additionalData: {
          limitType: rateLimitData.limitType,
          requestCount: rateLimitData.requestCount,
          path: req.path,
          method: req.method,
          rateLimited: true,
        },
      },
    );
  }

  /**
   * Handle login rate limit
   */
  private static async handleLoginRateLimit(
    req: Request,
    res: Response,
  ): Promise<void> {
    const ipAddress = this.getClientIP(req);

    await AuditLogger.logSuspiciousActivity(
      "Excessive login attempts detected",
      ipAddress,
      req.get("User-Agent") || "Unknown",
      {
        threat_level: "high",
        additionalData: {
          path: req.path,
          attempts: SECURITY_CONFIG.LOGIN_RATE_LIMIT,
          window: SECURITY_CONFIG.LOGIN_RATE_WINDOW,
        },
      },
    );

    console.warn(
      `🚨 [RateLimit] Login rate limit exceeded for IP: ${ipAddress}`,
    );
  }

  /**
   * Handle registration rate limit
   */
  private static async handleRegistrationRateLimit(
    req: Request,
    res: Response,
  ): Promise<void> {
    const ipAddress = this.getClientIP(req);

    await AuditLogger.logSuspiciousActivity(
      "Excessive registration attempts detected",
      ipAddress,
      req.get("User-Agent") || "Unknown",
      {
        threat_level: "medium",
        additionalData: {
          path: req.path,
          attempts: SECURITY_CONFIG.REGISTRATION_RATE_LIMIT,
        },
      },
    );

    console.warn(
      `⚠️ [RateLimit] Registration rate limit exceeded for IP: ${ipAddress}`,
    );
  }

  /**
   * Handle password reset rate limit
   */
  private static async handlePasswordResetRateLimit(
    req: Request,
    res: Response,
  ): Promise<void> {
    const email = req.body.email;
    const ipAddress = this.getClientIP(req);

    await AuditLogger.logSuspiciousActivity(
      "Excessive password reset attempts detected",
      ipAddress,
      req.get("User-Agent") || "Unknown",
      {
        threat_level: "medium",
        additionalData: {
          email,
          attempts: SECURITY_CONFIG.PASSWORD_RESET_RATE_LIMIT,
        },
      },
    );

    console.warn(
      `⚠️ [RateLimit] Password reset rate limit exceeded for: ${email || ipAddress}`,
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get client identifier (IP + User-Agent hash)
   */
  private static getClientIdentifier(req: Request): string {
    const ip = this.getClientIP(req);
    const userAgent = req.get("User-Agent") || "unknown";

    // Create a hash of IP + User-Agent for better tracking
    const crypto = require("crypto");
    const identifier = crypto
      .createHash("sha256")
      .update(`${ip}:${userAgent}`)
      .digest("hex")
      .substring(0, 16);

    return `${ip}:${identifier}`;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      req.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
      req.get("X-Real-IP") ||
      req.get("CF-Connecting-IP") ||
      "127.0.0.1"
    );
  }

  /**
   * Get limit type from request path
   */
  private static getLimitTypeFromPath(path: string): string {
    if (path.includes("/login")) return "login";
    if (path.includes("/register")) return "registration";
    if (path.includes("/forgot-password") || path.includes("/reset-password"))
      return "password_reset";
    return "api";
  }

  /**
   * Generate unique rate limit ID
   */
  private static generateRateLimitId(
    identifier: string,
    limitType: string,
  ): string {
    const crypto = require("crypto");
    return crypto
      .createHash("sha256")
      .update(`${identifier}:${limitType}:${Math.floor(Date.now() / 60000)}`)
      .digest("hex");
  }

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  /**
   * Clean up expired rate limit records
   */
  static async cleanupExpiredRateLimits(): Promise<number> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$executeRaw`
            DELETE FROM rate_limits 
            WHERE expires_at <= CURRENT_TIMESTAMP
        `;

    if (result > 0) {
      console.log(
        `🧹 [RateLimit] Cleaned up ${result} expired rate limit records`,
      );
    }

    return result;
  }

  /**
   * Get rate limiting statistics
   */
  static async getRateLimitStats(): Promise<{
    totalLimits: number;
    activeLimits: number;
    byType: Record<string, number>;
    topIdentifiers: Array<{ identifier: string; count: number }>;
  }> {
    const prisma = await PrismaConnectionManager.getInstance();

    const [totalResult, activeResult, typeResult, identifierResult] =
      await Promise.all([
        (prisma as any).$queryRaw`SELECT COUNT(*) as count FROM rate_limits`,
        (prisma as any).$queryRaw`
                SELECT COUNT(*) as count FROM rate_limits 
                WHERE expires_at > CURRENT_TIMESTAMP
            `,
        (prisma as any).$queryRaw`
                SELECT limit_type, COUNT(*) as count FROM rate_limits 
                WHERE expires_at > CURRENT_TIMESTAMP
                GROUP BY limit_type
            `,
        (prisma as any).$queryRaw`
                SELECT identifier, SUM(request_count) as count FROM rate_limits 
                WHERE expires_at > CURRENT_TIMESTAMP
                GROUP BY identifier
                ORDER BY count DESC
                LIMIT 10
            `,
      ]);

    const byType: Record<string, number> = {};
    typeResult.forEach((row: any) => {
      byType[row.limit_type] = parseInt(row.count);
    });

    const topIdentifiers = identifierResult.map((row: any) => ({
      identifier: row.identifier.split(":")[0], // Just show IP part
      count: parseInt(row.count),
    }));

    return {
      totalLimits: parseInt(totalResult[0]?.count || "0"),
      activeLimits: parseInt(activeResult[0]?.count || "0"),
      byType,
      topIdentifiers,
    };
  }
}
