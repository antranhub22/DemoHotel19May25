// 🚨 EMERGENCY MEMORY CONFIGURATION - MUST BE FIRST
process.env.NODE_OPTIONS = "--max-old-space-size=768 --expose-gc";

// ✅ MEMORY FIX: Smart conditional GC - only when memory is high
if (global.gc) {
  const manualGc = global.gc;
  let lastGC = 0;

  setInterval(() => {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const memoryThreshold = 300; // 300MB threshold

      // Only GC if memory usage is high AND enough time has passed
      if (heapUsedMB > memoryThreshold && Date.now() - lastGC > 120000) {
        manualGc();
        lastGC = Date.now();

        // Log only when GC actually happens (reduce console spam)
        const afterMemUsage = process.memoryUsage();
        const afterMB = afterMemUsage.heapUsed / 1024 / 1024;
        console.log(
          `🔄 [MEMORY] Smart GC triggered - Before: ${heapUsedMB.toFixed(1)}MB → After: ${afterMB.toFixed(1)}MB`,
        );
      }
    } catch (error) {
      // Silent error handling to reduce console spam
    }
  }, 60000); // Check every 60 seconds instead of 30
} else {
  console.warn(
    "🚨 [EMERGENCY] global.gc not available - start with --expose-gc flag",
  );
}

import { memoryMonitor } from "@server/middleware/memoryMonitor";
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
import express, { NextFunction, Response, type Request } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";

// ✅ CRITICAL: Initialize FeatureFlags early to prevent 500 errors
import { FeatureFlags } from "@server/shared/FeatureFlags";
FeatureFlags.initialize();

// 🔥 CRITICAL FIX: Disable old process kill switch - conflicts with new optimized system
// import "./middleware/processKillSwitch"; // DISABLED - using memoryOptimization.ts instead

// 🚨 CRITICAL FIX: Disable old nuclear memory fix - conflicts with new optimized system
// import "./middleware/nuclearMemoryFix"; // DISABLED - using memoryOptimization.ts instead

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
// ✅ MEMORY FIX: Reduced from 10MB to 1MB to prevent memory spikes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

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
// ✅ UPLOAD LIMITER: Prevent memory spikes from concurrent uploads
import uploadLimiter from "./middleware/uploadLimiter";
// ✅ STREAMING OPTIMIZATION: Handle large payloads efficiently
import streamingOptimization from "./middleware/streamingOptimization";
// ✅ EXTERNAL MEMORY MONITORING: Comprehensive external memory tracking
import {
  externalMemoryDashboard,
  externalMemoryRoutes,
} from "./monitoring/ExternalMemoryDashboard";
import { getExternalMemorySystem } from "./monitoring/ExternalMemoryIntegration";
import { externalMemoryLogger } from "./monitoring/ExternalMemoryLogger";
import { externalMemoryMonitor } from "./monitoring/ExternalMemoryMonitor";

// ✅ MEMORY OPTIMIZATION: Use new unified memory management system
app.use(memoryOptimizationMiddleware);
app.use(responseCompressionMiddleware);
app.use(responseOptimization.fullStack);

// ✅ STREAMING OPTIMIZATION: Handle large payloads with streaming
app.use("/api/webhook", streamingOptimization);
app.use("/api/vapi", streamingOptimization);

// ✅ UPLOAD PROTECTION: Apply upload limits to file upload routes
app.use("/api/upload", uploadLimiter);
app.use("/api/files", uploadLimiter);

// ✅ EXTERNAL MEMORY MONITORING: Add monitoring routes
app.use("/api/memory", externalMemoryRoutes);
app.use("/api/external-memory", getExternalMemorySystem().getAPIRouter());

// ✅ Enable process-level memory protection
import "@tools/process/manager";

// ✅ MEMORY PATTERN FIXES: Apply global memory safety fixes
import { applyAllMemoryFixes } from "./utils/memoryPatternFixes";
applyAllMemoryFixes();

// ✅ ADVANCED MEMORY TRACKING: Initialize comprehensive memory monitoring
import memoryLoggingMiddleware from "./middleware/memoryLoggingMiddleware";
import { heapAnalyzer } from "./shared/HeapAnalyzer";
import {
  integrateWithMemoryTracker,
  memorySpikeDetector,
} from "./shared/MemorySpikeDetector";

// Initialize memory spike detection
integrateWithMemoryTracker();

// Apply memory logging middleware globally (before routes)
app.use(memoryLoggingMiddleware);

// Initialize memory monitoring components
memorySpikeDetector.configure({
  mediumThresholdMB: 80, // ⬆️ Increase from 20MB to 80MB
  highThresholdMB: 150, // ⬆️ Increase from 50MB to 150MB
  criticalThresholdMB: 300, // ⬆️ Increase from 100MB to 300MB
  enableHeapSnapshots: false, // ❌ DISABLE in development
});

heapAnalyzer.setEnabled(true);

logger.info("🔍 Advanced memory tracking initialized", "MemoryTracking", {
  spikeDetection: true,
  heapAnalysis: true,
  requestLogging: true,
});

// ✅ NEW v3.0: Advanced Caching Middleware
// Automatic cache invalidation on data mutations
app.use(cacheInvalidationMiddleware());

// Smart caching for different endpoint types
app.use("/api/hotel", hotelDataCacheMiddleware({ ttl: 1800 })); // 30 minutes
app.use("/api/analytics", analyticsCacheMiddleware({ ttl: 120 })); // 2 minutes
app.use("/api/config", staticDataCacheMiddleware({ ttl: 3600 })); // 1 hour
app.use("/api/features", staticDataCacheMiddleware({ ttl: 1800 })); // 30 minutes
app.use("/api/health", staticDataCacheMiddleware({ ttl: 60 })); // 1 minute

// ✅ MEMORY MONITORING ROUTES (before other routes for priority)
import memoryMonitoringRoutes from "./routes/memory-monitoring";
app.use("/api/memory", memoryMonitoringRoutes);

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
  server.listen(port, async () => {
    logger.debug(`Server is running on port ${port}`, "Component");
    console.log(`🚀 Server started successfully on port ${port}`);
    console.log(`🔗 API available at: http://localhost:${port}/api`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔌 WebSocket available at: ws://localhost:${port}/socket.io/`);
    console.log(
      `🔍 Memory dashboard: http://localhost:${port}/api/memory/dashboard`,
    );

    // ✅ Initialize external memory monitoring dashboard
    externalMemoryDashboard.initialize(io);

    // 🚨 MEMORY FIX: Start monitoring with LIMITED data retention
    try {
      externalMemoryMonitor.startMonitoring();
      // Disable detailed tracking to reduce memory usage
      // externalMemoryLogger.startTracking();
      console.log("📊 External memory monitoring started (LIMITED MODE)");
    } catch (error) {
      console.log("⚠️ External memory monitoring failed to start:", error);
    }

    // ✅ MEMORY FIX: Start memory verification monitoring
    try {
      const {
        memoryVerification,
      } = require("@server/utils/MemoryVerification");
      memoryVerification.startVerification(60); // Every 60 seconds
      logger.info("🔍 Memory verification monitoring started", "Server");
    } catch (_e) {
      void 0;
    }

    // ✅ MEMORY FIX: Initialize aggressive native module cleanup
    try {
      const {
        nativeModuleCleanup,
      } = require("@server/utils/NativeModuleCleanup");
      nativeModuleCleanup.initialize();
      logger.info("🧹 Aggressive native module cleanup initialized", "Server");
    } catch (_e) {
      void 0;
    }

    // 🚨 ULTIMATE MEMORY FIX: Initialize ultimate memory cleanup
    try {
      const {
        ultimateMemoryCleanup,
      } = require("@server/utils/UltimateMemoryCleanup");
      await ultimateMemoryCleanup.initialize();
      logger.info("🚨 ULTIMATE memory cleanup initialized", "Server");
    } catch (_e) {
      void 0;
    }

    // 🚨 MEMORY FIX: Start external memory system with REDUCED retention
    try {
      const externalMemorySystem = getExternalMemorySystem();
      await externalMemorySystem.initialize(io);
      console.log(
        "🚨 Real-time external memory leak detection active (REDUCED MODE)",
      );
      console.log(
        `🎯 External memory leak API: http://localhost:${port}/api/external-memory/status`,
      );
      logger.info(
        "✅ External Memory Leak Detection started with reduced retention",
        "Server",
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize external memory leak detection:",
        error,
      );
    }

    // ✅ Show monitoring status and reminders after startup
    setTimeout(() => {
      initializeMonitoringReminder();
    }, 1000);

    // Graceful shutdown and cleanup to prevent leaks
    const cleanup = async () => {
      try {
        // Stop background systems if available
        try {
          const { createAPIGateway } = require("@server/shared/APIGateway");
          const gateway = createAPIGateway({} as any);
          if (gateway && typeof gateway.stopAnalytics === "function") {
            gateway.stopAnalytics();
          }
        } catch (_e) {
          void 0;
        }

        try {
          const {
            default: MonitoringDashboard,
          } = require("@server/shared/MonitoringDashboard");
          if (
            MonitoringDashboard &&
            typeof MonitoringDashboard.prototype.stop === "function"
          ) {
            // If an instance exists in your app, stop it here (placeholder)
          }
        } catch (_e) {
          void 0;
        }

        // Stop memory monitoring
        try {
          memoryMonitor.stopMonitoring();
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Cleanup VAPI connections
        try {
          const { cleanupVapi } = require("@server/vapi");
          await cleanupVapi();
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Clear all tracked timers
        try {
          const { TimerManager } = require("@server/utils/TimerManager");
          TimerManager.clearAll();
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Shutdown WebSocket services
        try {
          const {
            dashboardWebSocket,
          } = require("@server/services/DashboardWebSocket");
          dashboardWebSocket.shutdown();
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Shutdown WebSocket Dashboard
        try {
          const {
            WebSocketDashboard,
          } = require("@server/shared/WebSocketDashboard");
          const webSocketDashboard = WebSocketDashboard.getInstance();
          if (webSocketDashboard) {
            await webSocketDashboard.shutdown();
          }
        } catch (_e) {
          void 0;
        }

        // ✅ Stop external memory monitoring
        try {
          externalMemoryMonitor.stopMonitoring();
          externalMemoryLogger.stopTracking();
          externalMemoryDashboard.shutdown();
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Stop memory verification and generate report
        try {
          const {
            memoryVerification,
          } = require("@server/utils/MemoryVerification");
          const report = memoryVerification.stopVerification();
          console.log(memoryVerification.generateReport());
          logger.info("📊 Memory verification completed", "Server", {
            trend: report.trend,
            growthRate: `${report.averageGrowth.toFixed(2)}MB/min`,
          });
        } catch (_e) {
          void 0;
        }

        // ✅ MEMORY FIX: Aggressive native module cleanup
        try {
          const {
            nativeModuleCleanup,
          } = require("@server/utils/NativeModuleCleanup");
          nativeModuleCleanup.performCompleteCleanup();
          logger.info(
            "🧹 Aggressive native module cleanup completed",
            "Server",
          );
        } catch (_e) {
          void 0;
        }

        // 🚨 ULTIMATE MEMORY FIX: Complete ultimate cleanup
        try {
          const {
            ultimateMemoryCleanup,
          } = require("@server/utils/UltimateMemoryCleanup");
          await ultimateMemoryCleanup.shutdown();
          logger.info("🚨 ULTIMATE memory cleanup completed", "Server");
        } catch (_e) {
          void 0;
        }

        // 🚨 Stop real-time external memory leak detection
        try {
          const externalMemorySystem = getExternalMemorySystem();
          await externalMemorySystem.shutdown();
        } catch (_e) {
          void 0;
        }

        // 🚨 CRITICAL FIX: Disconnect Prisma client to prevent connection leaks
        try {
          const {
            PrismaConnectionManager,
          } = require("@shared/db/PrismaConnectionManager");
          const prismaManager = PrismaConnectionManager.getInstance();
          await prismaManager.disconnect();
          console.log("✅ Prisma connections closed");
        } catch (_e) {
          console.warn("⚠️ Error closing Prisma connections:", _e);
        }

        // Attempt to free memory
        if (global.gc) {
          const gcNow = global.gc;
          gcNow();
        }
      } catch (_e) {
        void 0;
      }
    };

    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];
    for (const sig of signals) {
      if (process.listenerCount(sig) < 5) {
        process.on(sig, async () => {
          await cleanup();
          server.close(() => process.exit(0));
        });
      }
    }
  });
})();

// Export app for testing
export { app };
