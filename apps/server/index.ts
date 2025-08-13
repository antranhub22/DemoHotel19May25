// 🚨 EMERGENCY MEMORY CONFIGURATION - MUST BE FIRST
process.env.NODE_OPTIONS = "--max-old-space-size=768 --expose-gc";

// Force aggressive garbage collection every 30 seconds
if (global.gc) {
  setInterval(() => {
    try {
      global.gc();
      console.log(
        `🔄 [EMERGENCY] Forced GC - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      );
    } catch (error) {
      console.warn("Emergency GC failed:", error);
    }
  }, 30000);
} else {
  console.warn(
    "🚨 [EMERGENCY] global.gc not available - start with --expose-gc flag",
  );
}

import router from "@server/routes/index";
import { setupSocket } from "@server/socket";
import { runAutoDbFix } from "@server/startup/auto-database-fix";
import { initializeDatabaseOnStartup } from "@server/startup/database-initialization";
import { initializeMonitoringReminder } from "@server/startup/monitoring-reminder";
import { runProductionMigration } from "@server/startup/production-migration";
import { log, serveStatic, setupVite } from "@server/vite";
import { logger } from "@shared/utils/logger";
import { autoMigrateOnDeploy } from "@tools/scripts/maintenance/auto-migrate-on-deploy";
import { seedProductionUsers } from "@tools/scripts/maintenance/seed-production-users";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, type Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";

// ✅ CRITICAL: Initialize FeatureFlags early to prevent 500 errors
import { FeatureFlags } from "@server/shared/FeatureFlags";
FeatureFlags.initialize();

// 🔥 RADICAL MEMORY FIX: Import process kill switch for emergency protection
import "./middleware/processKillSwitch";

// 🚨 NUCLEAR MEMORY FIX: Ultimate memory protection (replaces processKillSwitch)
import "./middleware/nuclearMemoryFix";

// ✅ Import middleware

// ✅ Import metrics middleware for automatic performance tracking
import {
  businessMetricsMiddleware,
  criticalEndpointMiddleware,
  metricsMiddleware,
} from "@server/middleware/metricsMiddleware";

// ✅ Import caching middleware for automatic response caching
import {
  analyticsCacheMiddleware,
  apiCacheMiddleware,
  cacheInvalidationMiddleware,
  hotelDataCacheMiddleware,
  staticDataCacheMiddleware,
} from "@server/middleware/cachingMiddleware";

// ✅ Import API Gateway middleware for authentication and security

// ✅ MONITORING DISABLED: Auto-initialization commented out in shared/index.ts
// Monitoring system fully implemented but temporarily disabled for deployment safety
// To re-enable: Follow MONITORING_RE_ENABLE_GUIDE.md

// ✅ MONITORING REMINDER: Show status and reminders during startup

const app = express();

// Trust proxy for deployment on Render/Heroku/etc
app.set("trust proxy", 1);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "blob:", // ✅ FIX: Allow blob URLs for KrispSDK worklets
          "https://replit.com",
          "https://vapi.ai",
          "https://*.vapi.ai",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/",
          "https://unpkg.com/@vapi-ai/web@latest/dist/",
          // ✅ FIX: Add recharts CDN paths
          "https://cdn.jsdelivr.net/npm/recharts@latest/",
          "https://unpkg.com/recharts@latest/",
        ],
        connectSrc: [
          "'self'",
          "https://api.openai.com",
          "https://api.vapi.ai",
          "https://*.vapi.ai",
          "wss://*.vapi.ai",
          "https://minhonmuine.talk2go.online",
          "https://*.talk2go.online",
          "https://*.onrender.com",
          "https://demohotel19may25.onrender.com",
          "https://minhnhotelben.onrender.com",
          "wss:",
          "ws:",
          "wss://demohotel19may25.onrender.com",
          "wss://minhnhotelben.onrender.com",
          "ws://localhost:*",
          "wss://localhost:*",
          "http://localhost:*",
          "https://localhost:*",
        ],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        mediaSrc: ["'self'", "blob:", "https:"],
        workerSrc: ["'self'", "blob:", "data:"], // ✅ FIX: Allow blob workers for KrispSDK
        objectSrc: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Enhanced CORS configuration for SaaS dashboard
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // In development, allow all origins
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // ✅ FIX: Allow production domains for WebSocket compatibility
      const allowedDomains = [
        "talk2go.online",
        "localhost",
        "127.0.0.1",
        "onrender.com",
        "demohotel19may25.onrender.com",
        "minhnhotelben.onrender.com",
      ];

      const isAllowed = allowedDomains.some(
        (domain) => origin.includes(domain) || origin.endsWith(`.${domain}`),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Tenant-ID",
    ],
    exposedHeaders: ["X-Total-Count", "X-Rate-Limit-Remaining"],
  }),
);

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,

  skip: (_req, _res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

// Apply rate limiting to API routes
app.use("/api", apiLimiter);

// Strict rate limiting for dashboard routes
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs for dashboard
  message: "Too many dashboard requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,

  skip: (_req, _res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

// Apply stricter rate limiting to dashboard routes
app.use("/api/saas-dashboard", dashboardLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ✅ NEW v3.0: Advanced Metrics Collection Middleware
// Track performance metrics for all API requests
app.use("/api", metricsMiddleware);

// Track critical endpoints with enhanced monitoring
app.use(criticalEndpointMiddleware);

// Business metrics for specific endpoints
app.use(
  "/api/hotel/requests",
  businessMetricsMiddleware("booking-conversion", "operations"),
);
app.use(
  "/api/voice/calls",
  businessMetricsMiddleware("call-efficiency", "performance"),
);
app.use(
  "/api/saas-dashboard/generate-assistant",
  businessMetricsMiddleware("assistant-creation", "operations"),
);

// ✅ MEMORY OPTIMIZATION: Add memory management middleware
import {
  memoryOptimizationMiddleware,
  responseCompressionMiddleware,
} from "./middleware/memoryOptimization.js";
// ✅ RESPONSE OPTIMIZATION: Add performance middleware
import responseOptimization from "./middleware/responseOptimization.js";

app.use(memoryOptimizationMiddleware);
app.use(responseCompressionMiddleware);
app.use(responseOptimization.fullStack);

// ✅ NEW v3.0: Advanced Caching Middleware
// Automatic cache invalidation on data mutations
app.use(cacheInvalidationMiddleware());

// Smart caching for different endpoint types
app.use("/api/hotel", hotelDataCacheMiddleware({ ttl: 1800 })); // 30 minutes
app.use("/api/analytics", analyticsCacheMiddleware({ ttl: 120 })); // 2 minutes
app.use("/api/config", staticDataCacheMiddleware({ ttl: 3600 })); // 1 hour
app.use("/api/features", staticDataCacheMiddleware({ ttl: 1800 })); // 30 minutes
app.use("/api/health", staticDataCacheMiddleware({ ttl: 60 })); // 1 minute

// General API response caching (fallback)
app.use(
  "/api",
  apiCacheMiddleware({
    ttl: 300, // 5 minutes default
    namespace: "api",
    strategy: "cache-first",
    varyBy: ["authorization", "x-tenant-id"],
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // ✅ CRITICAL FIX: Initialize database connection BEFORE routes registration
  // This prevents "Database not initialized" race condition errors
  logger.debug("🚀 Initializing database connection...", "Component");
  await initializeDatabaseOnStartup();
  logger.debug("✅ Database connection initialized successfully", "Component");

  // ✅ NOW SAFE: Register routes after database initialization
  logger.debug(
    "⚠️ API Gateway middleware DISABLED for voice assistant testing",
    "Component",
  );

  // ✅ FIX: Register API routes FIRST in production
  // Use the new routes system - NOW SAFE with database ready
  // ✅ FIX: Only register API routes, not root route
  app.use("/api", router);

  // ✅ FIX: Serve static files AFTER API routes in production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  // Create HTTP server for WebSocket support
  const server = http.createServer(app);

  // ✅ FIX: Enable Socket.IO in production for summary events
  // Setup WebSocket server for real-time notifications and save instance on Express app
  const io = setupSocket(server);
  app.set("io", io);

  // Production migration and setup with error handling
  try {
    // Run production migration first (for PostgreSQL schema fixes)
    await runProductionMigration();

    // Auto-migrate database schema (safe for production)
    if (process.env.AUTO_MIGRATE !== "false") {
      logger.debug("🔄 Running auto-migration...", "Component");
      await autoMigrateOnDeploy();
    } else {
      logger.debug(
        "⚠️ Auto-migration disabled by environment variable",
        "Component",
      );
    }

    // Seed default users (safe for production)
    if (process.env.SEED_USERS !== "false") {
      logger.debug("👥 Seeding default users...", "Component");
      await seedProductionUsers();
    } else {
      logger.debug(
        "⚠️ User seeding disabled by environment variable",
        "Component",
      );
    }
  } catch (error) {
    logger.error(
      "⚠️ Error during startup migrations, continuing with server start:",
      "Component",
      error,
    );
    // Continue server startup even if migration fails
  }

  // Auto-fix database on startup (can be disabled with AUTO_DB_FIX=false)
  if (process.env.AUTO_DB_FIX !== "false") {
    logger.debug("🔧 Running auto database fix...", "Component");
    await runAutoDbFix();
  } else {
    logger.debug(
      "⚠️ Auto database fix disabled by environment variable",
      "Component",
    );
  }

  // Initialize monitoring reminder
  await initializeMonitoringReminder();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    (res as any).status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }
  // ✅ FIX: serveStatic already called above for production

  const port = process.env.PORT || 10000;
  server.listen(port, () => {
    logger.debug(`Server is running on port ${port}`, "Component");
    console.log(`🚀 Server started successfully on port ${port}`);
    console.log(`🔗 API available at: http://localhost:${port}/api`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔌 WebSocket available at: ws://localhost:${port}/socket.io/`);

    // ✅ Show monitoring status and reminders after startup
    setTimeout(() => {
      initializeMonitoringReminder();
    }, 1000);
  });
})();

// Export app for testing
export { app };
