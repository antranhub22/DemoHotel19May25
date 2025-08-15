/**
 * SaaS Provider Domain - Rate Limiting Middleware
 * Tenant-based rate limiting with subscription plan enforcement
 */

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import { TimerManager } from "../utils/TimerManager";

// ============================================
// TYPES & INTERFACES
// ============================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  headers?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface SubscriptionLimits {
  trial: { api: number; upload: number; heavy: number };
  basic: { api: number; upload: number; heavy: number };
  premium: { api: number; upload: number; heavy: number };
  enterprise: { api: number; upload: number; heavy: number };
}

// ============================================
// RATE LIMIT STORAGE
// ============================================

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = TimerManager.setInterval(
      () => {
        this.cleanup();
      },
      60000,
      "auto-generated-interval-6",
    );
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      };
      this.store.set(key, newEntry);
      return newEntry;
    }

    // Increment existing entry
    entry.count++;
    this.store.set(key, entry);
    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// ============================================
// RATE LIMIT CONFIGURATIONS
// ============================================

const rateLimitStore = new RateLimitStore();

// Default rate limits by subscription plan (requests per minute)
const SUBSCRIPTION_RATE_LIMITS: SubscriptionLimits = {
  trial: {
    api: 60, // 1 per second
    upload: 10, // 10 uploads per minute
    heavy: 5, // 5 heavy operations per minute
  },
  basic: {
    api: 300, // 5 per second
    upload: 50, // 50 uploads per minute
    heavy: 20, // 20 heavy operations per minute
  },
  premium: {
    api: 1200, // 20 per second
    upload: 200, // 200 uploads per minute
    heavy: 100, // 100 heavy operations per minute
  },
  enterprise: {
    api: 6000, // 100 per second
    upload: 1000, // 1000 uploads per minute
    heavy: 500, // 500 heavy operations per minute
  },
};

// ============================================
// RATE LIMITING FUNCTIONS
// ============================================

/**
 * Generic rate limiter factory
 */
function createRateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = config.keyGenerator
        ? config.keyGenerator(req)
        : getDefaultKey(req);
      const entry = rateLimitStore.increment(key, config.windowMs);

      // Set rate limit headers
      if (config.headers !== false) {
        res.set({
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": Math.max(
            0,
            config.maxRequests - entry.count,
          ).toString(),
          "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
          "X-RateLimit-Window": config.windowMs.toString(),
        });
      }

      // Check if limit exceeded
      if (entry.count > config.maxRequests) {
        logger.warn("[RateLimit] Rate limit exceeded", {
          key,
          count: entry.count,
          limit: config.maxRequests,
          window: config.windowMs,
          path: req.path,
          method: req.method,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        });

        res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message:
            config.message || "Too many requests, please try again later",
          retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000),
          limit: config.maxRequests,
          window: config.windowMs,
        });
        return;
      }

      logger.debug("[RateLimit] Request allowed", {
        key,
        count: entry.count,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
      });

      next();
    } catch (error: any) {
      logger.error("[RateLimit] Error in rate limiting", error);
      // Allow request to proceed on error
      next();
    }
  };
}

/**
 * Tenant-based rate limiting with subscription enforcement
 */
export function rateLimitByTenant(
  maxRequests: number,
  windowMs: number = 60000,
  options: Partial<RateLimitConfig> = {},
) {
  return createRateLimit({
    maxRequests,
    windowMs,
    keyGenerator: (req: Request) => {
      const tenantId = req.user?.tenantId || req.ip;
      const endpoint = req.route?.path || req.path;
      return `tenant:${tenantId}:${endpoint}`;
    },
    message: "Too many requests from this tenant, please try again later",
    ...options,
  });
}

/**
 * Subscription-based rate limiting
 */
export function rateLimitBySubscription(
  limitType: keyof SubscriptionLimits["trial"] = "api",
  windowMs: number = 60000,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        // Apply default rate limit for unauthenticated requests
        return createRateLimit({
          maxRequests: 30,
          windowMs,
          message: "Please authenticate to increase rate limits",
        })(req, res, next);
      }

      const subscriptionPlan =
        user.subscriptionPlan as keyof SubscriptionLimits;
      const limits = SUBSCRIPTION_RATE_LIMITS[subscriptionPlan];

      if (!limits) {
        logger.warn("[RateLimit] Unknown subscription plan", {
          plan: subscriptionPlan,
          userId: user.id,
        });
        // Default to trial limits for unknown plans
        const maxRequests = SUBSCRIPTION_RATE_LIMITS.trial[limitType];
        return createRateLimit({
          maxRequests,
          windowMs,
          keyGenerator: (_req: Request) => `user:${user.id}:${limitType}`,
          message: `Rate limit exceeded for ${limitType} operations`,
        })(req, res, next);
      }

      const maxRequests = limits[limitType];
      return createRateLimit({
        maxRequests,
        windowMs,
        keyGenerator: (_req: Request) => `user:${user.id}:${limitType}`,
        message: `Rate limit exceeded for ${limitType} operations. Upgrade your plan for higher limits.`,
      })(req, res, next);
    } catch (error: any) {
      logger.error("[RateLimit] Error in subscription rate limiting", error);
      next();
    }
  };
}

/**
 * IP-based rate limiting for public endpoints
 */
export function rateLimitByIP(maxRequests: number, windowMs: number = 60000) {
  return createRateLimit({
    maxRequests,
    windowMs,
    keyGenerator: (req: Request) => `ip:${req.ip}`,
    message: "Too many requests from this IP address",
  });
}

/**
 * Global rate limiting for all requests
 */
export function globalRateLimit(
  maxRequests: number = 1000,
  windowMs: number = 60000,
) {
  return createRateLimit({
    maxRequests,
    windowMs,
    keyGenerator: () => "global",
    message: "Server is experiencing high load, please try again later",
  });
}

/**
 * Adaptive rate limiting based on server load
 */
export function adaptiveRateLimit(baseLimit: number, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get system load (simplified - in production you'd use actual metrics)
      const systemLoad = getSystemLoad();
      const adjustedLimit = Math.max(
        1,
        Math.floor(baseLimit * (2 - systemLoad)),
      );

      return createRateLimit({
        maxRequests: adjustedLimit,
        windowMs,
        keyGenerator: getDefaultKey,
        message: `Server is under load. Rate limit temporarily reduced to ${adjustedLimit} requests per minute.`,
      })(req, res, next);
    } catch (error: any) {
      logger.error("[RateLimit] Error in adaptive rate limiting", error);
      next();
    }
  };
}

/**
 * Feature-specific rate limiting
 */
export function rateLimitForFeature(
  feature: string,
  defaultLimit: number,
  windowMs: number = 60000,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return createRateLimit({
          maxRequests: Math.floor(defaultLimit * 0.1), // 10% of default for unauthenticated
          windowMs,
          keyGenerator: (req: Request) => `ip:${req.ip}:${feature}`,
        })(req, res, next);
      }

      // Feature-specific limits based on subscription
      const featureLimits: Record<string, Record<string, number>> = {
        voice_calls: {
          trial: 10,
          basic: 50,
          premium: 200,
          enterprise: 1000,
        },
        api_requests: {
          trial: 30,
          basic: 150,
          premium: 600,
          enterprise: 3000,
        },
        data_export: {
          trial: 1,
          basic: 5,
          premium: 20,
          enterprise: 100,
        },
      };

      const subscriptionPlan = user.subscriptionPlan;
      const featureLimit =
        featureLimits[feature]?.[subscriptionPlan] || defaultLimit;

      return createRateLimit({
        maxRequests: featureLimit,
        windowMs,
        keyGenerator: (_req: Request) => `user:${user.id}:feature:${feature}`,
        message: `Rate limit exceeded for ${feature}. Current plan allows ${featureLimit} requests per minute.`,
      })(req, res, next);
    } catch (error: any) {
      logger.error("[RateLimit] Error in feature rate limiting", error);
      next();
    }
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDefaultKey(req: Request): string {
  const user = req.user;
  if (user) {
    return `user:${user.id}:${req.route?.path || req.path}`;
  }
  return `ip:${req.ip}:${req.route?.path || req.path}`;
}

function getSystemLoad(): number {
  // Simplified system load calculation
  // In production, you'd use actual system metrics
  try {
    const memUsage = process.memoryUsage();
    const heapUsedRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.min(2, heapUsedRatio * 2); // Scale 0-1 to 0-2
  } catch {
    return 1; // Default to normal load
  }
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): {
  count: number;
  resetTime: number;
  remaining: number;
} | null {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return null;
  }

  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, entry.resetTime - Date.now()),
  };
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.store.delete(key);
}

/**
 * Get subscription rate limits
 */
export function getSubscriptionLimits(
  plan: keyof SubscriptionLimits,
): SubscriptionLimits[keyof SubscriptionLimits] {
  return SUBSCRIPTION_RATE_LIMITS[plan] || SUBSCRIPTION_RATE_LIMITS.trial;
}

// ============================================
// CLEANUP
// ============================================

process.on("SIGTERM", () => {
  rateLimitStore.destroy();
});

process.on("SIGINT", () => {
  rateLimitStore.destroy();
});

export { rateLimitStore };
