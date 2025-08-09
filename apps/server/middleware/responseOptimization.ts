/**
 * 🚀 Response Optimization Middleware
 * Quick wins for better performance without breaking changes
 */

import { Request, Response, NextFunction } from "express";
import compression from "compression";
import { logger } from "@shared/utils/logger";

// ============================================================================
// RESPONSE COMPRESSION MIDDLEWARE
// ============================================================================

export const compressionMiddleware = compression({
  // Compress responses over 1KB
  threshold: 1024,

  // Compression level (1-9, 6 is good balance of speed/size)
  level: 6,

  // Only compress these content types
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers["x-no-compression"]) {
      return false;
    }

    // Use compression filter
    return compression.filter(req, res);
  },
});

// ============================================================================
// RESPONSE TIME TRACKING
// ============================================================================

export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  // Set header before response is sent
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  const addResponseTime = () => {
    const duration = Date.now() - startTime;

    // Only set header if response hasn't been sent yet
    if (!res.headersSent) {
      res.set("X-Response-Time", `${duration}ms`);
    }

    // Log slow requests (over 1 second) for optimization
    if (duration > 1000) {
      logger.warn(
        `🐌 Slow request detected: ${req.method} ${req.path} - ${duration}ms`,
        "Performance",
      );
    }
  };

  // Override response methods to add timing header before sending
  res.send = function (body) {
    addResponseTime();
    return originalSend.call(this, body);
  };

  res.json = function (obj) {
    addResponseTime();
    return originalJson.call(this, obj);
  };

  res.end = function (chunk, encoding) {
    addResponseTime();
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// ============================================================================
// CACHE CONTROL HEADERS
// ============================================================================

export const cacheControlMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Only set cache headers if response hasn't been sent yet
  if (!res.headersSent) {
    // Set appropriate cache headers based on route
    if (req.path.startsWith("/api/static") || req.path.includes("assets")) {
      // Static assets - cache for 1 hour
      res.set("Cache-Control", "public, max-age=3600");
    } else if (req.path.startsWith("/api/analytics")) {
      // Analytics data - cache for 5 minutes
      res.set("Cache-Control", "public, max-age=300");
    } else if (req.path.startsWith("/api/hotel")) {
      // Hotel data - cache for 10 minutes
      res.set("Cache-Control", "public, max-age=600");
    } else {
      // Default - no cache for dynamic content
      res.set("Cache-Control", "no-cache, must-revalidate");
    }
  }

  next();
};

// ============================================================================
// SECURITY HEADERS (Quick wins)
// ============================================================================

export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Basic security headers that don't break functionality
  // Only set headers if they haven't been sent yet
  if (!res.headersSent) {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
  }

  next();
};

// ============================================================================
// COMBINED OPTIMIZATION MIDDLEWARE
// ============================================================================

export const responseOptimizationStack = [
  compressionMiddleware,
  responseTimeMiddleware,
  cacheControlMiddleware,
  securityHeadersMiddleware,
];

// ============================================================================
// EXPORT FOR EASY INTEGRATION
// ============================================================================

export default {
  compression: compressionMiddleware,
  responseTime: responseTimeMiddleware,
  cacheControl: cacheControlMiddleware,
  securityHeaders: securityHeadersMiddleware,
  fullStack: responseOptimizationStack,
};
