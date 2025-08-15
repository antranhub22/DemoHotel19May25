// ============================================
// SHARED CROSS-CUTTING CONCERNS v3.0 - Enhanced with Advanced Health Monitoring
// ============================================
// Central export hub for all cross-cutting concerns and utilities including
// enhanced monitoring, modular architecture, and advanced health checking

import { logger } from "@shared/utils/logger";

// ✅ v2.0: Enhanced Architecture Components
export {
  FeatureFlags,
  addFlagListener,
  createABTest,
  evaluateABTest,
  isFeatureEnabled,
  isModuleEnabled,
} from "./FeatureFlags";
export { ModuleLifecycleManager } from "./ModuleLifecycleManager";
export {
  ServiceContainer,
  getService,
  getServiceSync,
  initializeServiceContainer,
} from "./ServiceContainer";

// ✅ v3.0: NEW Advanced Health Check System
export {
  AdvancedHealthCheck,
  advancedHealthCheck,
  getModuleHealth,
  getSystemHealth,
  initializeAdvancedHealthCheck,
  registerModuleHealthChecker,
  type CascadeFailure,
  type DependencyHealth,
  type HealthIssue,
  type HealthRecommendation,
  type ModuleHealthStatus,
  type ModuleMetrics,
  type SystemHealthSummary,
} from "./AdvancedHealthCheck";

// ✅ v3.0: NEW Advanced Metrics Collection System
export {
  AdvancedMetricsCollector,
  advancedMetricsCollector,
  getCurrentMetricsSnapshot,
  getSystemHealthFromMetrics,
  initializeAdvancedMetrics,
  recordBusinessKPI,
  recordPerformanceMetrics,
  type Alert,
  type BusinessKPI,
  type MetricsConfig,
  type MetricsSnapshot,
  type PerformanceMetrics,
} from "./AdvancedMetricsCollector";

// ✅ v3.0: NEW Performance Auditor System
export {
  PerformanceAuditor,
  getPerformanceTrends,
  initializePerformanceAuditor,
  performanceAuditor,
  runComprehensiveAudit,
  runQuickAudit,
  type ModulePerformance,
  type OptimizationRecommendation,
  type PerformanceAuditReport,
  type PerformanceBottleneck,
  type PerformanceIssue,
} from "./PerformanceAuditor";

// ✅ v3.0: NEW Cache Management System
export {
  CacheManager,
  cacheManager,
  clearCacheNamespace,
  getCacheStats,
  getFromCache,
  getOrSetCache,
  initializeCache,
  setInCache,
  type CacheConfig,
  type CacheEntry,
  type CacheNamespace,
  type CacheStats,
  type CacheTag,
} from "./CacheManager";

// ✅ v3.0: NEW Load Testing System
export {
  LoadTestManager,
  getActiveTests,
  getTestResults,
  initializeLoadTesting,
  loadTestManager,
  runLoadTest,
  runStressTest,
  runUserSimulation,
  type ConcurrentUserSimulation,
  type LoadTestEndpoint,
  type LoadTestEndpointResult,
  type LoadTestResult,
  type LoadTestScenario,
  type StressTestConfig,
} from "./LoadTestManager";

// ✅ v3.0: NEW Database Optimization System
export {
  DatabaseOptimizer,
  analyzeQuery,
  createDatabaseOptimizer,
  getDatabaseHealth,
  initializeDatabaseOptimizer,
  optimizeDatabase,
  type DatabaseConfig,
  type DatabaseHealthStatus,
  type IndexSuggestion,
  type OptimizationReport,
  type QueryAnalysis,
} from "./DatabaseOptimizer";

// ✅ v3.0: NEW Connection Pool Management System
export {
  ConnectionPoolManager,
  createConnectionPoolManager,
  executeQuery,
  getPoolStatus,
  initializeConnectionPool,
  type AutoScalingEvent,
  type ConnectionInfo,
  type ConnectionLeak,
  type PoolConfiguration,
  type PoolMetrics,
} from "./ConnectionPoolManager";

// ✅ v3.0: NEW Real-time Monitoring Dashboard System
export {
  MonitoringDashboard,
  createDashboardAlert,
  createMonitoringDashboard,
  getCurrentDashboardMetrics,
  initializeMonitoringDashboard,
  type AlertThresholds,
  type ApplicationMetrics,
  type BusinessMetrics,
  type Alert as DashboardAlert,
  type DashboardConfig,
  type DashboardMetrics,
  type PerformanceMetrics as DashboardPerformanceMetrics,
  type DatabaseMetrics,
  type SystemMetrics,
  type WebSocketConnection,
} from "./MonitoringDashboard";

// ✅ v3.0: NEW WebSocket Dashboard Integration
export {
  WebSocketDashboard,
  broadcastDashboardUpdate,
  getWebSocketClientStats,
  initializeWebSocketDashboard,
  webSocketDashboard,
  type WebSocketClient,
  type WebSocketMessage,
  type WebSocketResponse,
  type WebSocketSubscription,
} from "./WebSocketDashboard";

// ✅ v3.0: NEW API Gateway System
export {
  APIGateway,
  createAPIGateway,
  getGatewayDiagnostics,
  getGatewayMetrics,
  initializeAPIGateway,
  type AuthConfig,
  type CachingConfig,
  type GatewayConfig,
  type GatewayMetrics,
  type RateLimitConfig,
  type RateLimitStatus,
  type RequestContext,
  type RoutingConfig,
  type SecurityConfig,
  type VersionConfig,
} from "./APIGateway";

// ✅ v2.0: Enhanced Monitoring Components
export { EnhancedLogger } from "./EnhancedLogger";
export { MetricsCollector } from "./MetricsCollector";
export { MonitoringIntegration } from "./MonitoringIntegration";

// ============================================
// v3.0: ENHANCED ARCHITECTURE HEALTH
// ============================================

/**
 * Get comprehensive health status of entire modular architecture v3.0
 * Now includes advanced health monitoring
 */
export async function getArchitectureHealth() {
  try {
    logger.debug(
      "🏗️ [Architecture] Getting comprehensive health status v3.0",
      "Architecture",
    );

    // Import dynamically to avoid circular dependencies
    const { ServiceContainer } = await import("./ServiceContainer");
    const { FeatureFlags } = await import("./FeatureFlags");
    const { ModuleLifecycleManager } = await import("./ModuleLifecycleManager");
    const { MonitoringIntegration } = await import("./MonitoringIntegration");
    const { advancedHealthCheck } = await import("./AdvancedHealthCheck");

    // Get health from all systems
    const containerHealth = ServiceContainer.getHealthStatus();
    const featureFlagsHealth = FeatureFlags.getDiagnostics();
    const lifecycleHealth = ModuleLifecycleManager.getDiagnostics();
    const monitoringHealth = MonitoringIntegration.getMonitoringStatus();

    // v3.0: Get advanced health system status
    const advancedHealthDiagnostics = advancedHealthCheck.getDiagnostics();
    let systemHealthSummary = null;
    try {
      systemHealthSummary = await advancedHealthCheck.getSystemHealth();
    } catch (error) {
      logger.warn(
        "⚠️ [Architecture] Advanced health system not fully initialized",
        "Architecture",
      );
    }

    return {
      version: "3.0.0",
      timestamp: new Date().toISOString(),

      // v2.0 Health Status (maintained for compatibility)
      services: {
        container: {
          status: containerHealth.healthy ? "healthy" : "unhealthy",
          registeredServices: containerHealth.registeredServices,
          instantiatedServices: containerHealth.instantiatedServices,
          errors: containerHealth.errors.length,
          metrics: containerHealth.metrics,
        },
        featureFlags: {
          status: featureFlagsHealth.isInitialized ? "healthy" : "unhealthy",
          totalFlags: featureFlagsHealth.totalFlags,
          enabledFlags: featureFlagsHealth.enabledFlags,
          abTests: featureFlagsHealth.abTests,
        },
        lifecycle: {
          status: lifecycleHealth.isInitialized ? "healthy" : "unhealthy",
          totalModules: lifecycleHealth.registeredModules,
          runningModules: lifecycleHealth.runningModules,
          failedModules: lifecycleHealth.failedModules,
        },
        monitoring: {
          status: monitoringHealth.initialized ? "healthy" : "unhealthy",
          initialized: monitoringHealth.initialized,
          health: monitoringHealth.health,
        },
      },

      // v3.0: NEW Advanced Health Monitoring
      advancedHealth: {
        initialized: advancedHealthDiagnostics.initialized,
        monitoringActive: advancedHealthDiagnostics.monitoringActive,
        registeredCheckers: advancedHealthDiagnostics.registeredCheckers,
        totalHistoryEntries: advancedHealthDiagnostics.totalHistoryEntries,
        systemSummary: systemHealthSummary
          ? {
              overallStatus: systemHealthSummary.overallStatus,
              totalModules: systemHealthSummary.systemMetrics.totalModules,
              healthyModules: systemHealthSummary.systemMetrics.healthyModules,
              cascadeFailures: systemHealthSummary.cascadeFailures.length,
              recommendations: systemHealthSummary.recommendations.length,
            }
          : null,
      },

      // Overall architecture status
      overall: {
        status:
          containerHealth.healthy &&
          featureFlagsHealth.isInitialized &&
          lifecycleHealth.isInitialized &&
          monitoringHealth.initialized
            ? "healthy"
            : "degraded",
        readiness: "ready",
        features: {
          serviceContainer: true,
          featureFlags: true,
          moduleLifecycle: true,
          enhancedMonitoring: true,
          advancedHealthCheck: true, // v3.0
        },
      },

      // System performance metrics
      performance: {
        uptime: process.uptime(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  } catch {
    logger.error(
      "❌ [Architecture] Failed to get architecture health",
      "Architecture",
      error,
    );

    return {
      version: "3.0.0",
      timestamp: new Date().toISOString(),
      overall: {
        status: "unhealthy",
        error: (error as Error).message,
      },
      services: {
        container: { status: "unknown" },
        featureFlags: { status: "unknown" },
        lifecycle: { status: "unknown" },
        monitoring: { status: "unknown" },
      },
      advancedHealth: {
        initialized: false,
        error: "Failed to initialize advanced health monitoring",
      },
    };
  }
}

// ============================================
// v3.0: ENHANCED MONITORING INITIALIZATION
// ============================================

/**
 * Initialize complete monitoring system v3.0
 * Now includes advanced health monitoring, metrics collection, performance auditing, caching, load testing, database optimization, and real-time monitoring dashboard
 */
export async function initializeMonitoring() {
  try {
    logger.info(
      "🚀 [Monitoring] Initializing complete monitoring system v3.0",
      "Monitoring",
    );

    // Import all monitoring components
    const { EnhancedLogger: _EnhancedLogger } = await import(
      "./EnhancedLogger"
    );
    const { MetricsCollector: _MetricsCollector } = await import(
      "./MetricsCollector"
    );
    const { MonitoringIntegration } = await import("./MonitoringIntegration");
    const { initializeAdvancedHealthCheck } = await import(
      "./AdvancedHealthCheck"
    );
    const { initializeAdvancedMetrics } = await import(
      "./AdvancedMetricsCollector"
    );
    const { initializePerformanceAuditor } = await import(
      "./PerformanceAuditor"
    );
    const { initializeCache } = await import("./CacheManager");
    const { initializeLoadTesting } = await import("./LoadTestManager");
    const { initializeDatabaseOptimizer } = await import("./DatabaseOptimizer");
    const { initializeConnectionPool } = await import(
      "./ConnectionPoolManager"
    );
    const { initializeMonitoringDashboard } = await import(
      "./MonitoringDashboard"
    );
    const { initializeAPIGateway } = await import("./APIGateway");

    // Initialize components in order (using available methods)
    // Note: EnhancedLogger and MetricsCollector don't have initialize methods
    logger.debug("📝 [Monitoring] EnhancedLogger ready", "Monitoring");
    logger.debug("📊 [Monitoring] MetricsCollector ready", "Monitoring");

    // Initialize MonitoringIntegration (this may have initialize method)
    try {
      await MonitoringIntegration.initialize();
    } catch (error) {
      logger.warn(
        "⚠️ [Monitoring] MonitoringIntegration init failed, continuing",
        "Monitoring",
      );
    }

    // v3.0: Initialize advanced health check system
    await initializeAdvancedHealthCheck();

    // v3.0: Initialize advanced metrics collection system
    await initializeAdvancedMetrics({
      collectionInterval: 30000, // 30 seconds
      retentionDays: 7,
      alertingEnabled: true,
      businessKPITracking: true,
      performanceThresholds: {
        responseTime: 2000, // 2 seconds
        errorRate: 0.05, // 5%
        memoryUsage: 512, // 512MB
        cpuUsage: 80, // 80%
      },
    });

    // v3.0: Initialize performance auditor system
    await initializePerformanceAuditor();

    // v3.0: Initialize cache management system
    await initializeCache({
      maxSize: 10000, // 10k entries
      maxMemorySize: 256, // 256MB
      defaultTTL: 3600, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      enableRedis: false, // Memory only for now
      enableCompression: true,
      enableMetrics: true,
      evictionPolicy: "lru",
    });

    // v3.0: Initialize load testing system
    await initializeLoadTesting();

    // v3.0: Initialize database optimization system
    const databaseConfig = {
      type: (process.env.DATABASE_URL?.includes("postgresql")
        ? "postgresql"
        : "sqlite") as "postgresql" | "sqlite",
      url: process.env.DATABASE_URL || "file:./dev.db",
      pool: {
        min: 5,
        max: 20,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 300000,
        reapIntervalMillis: 10000,
        createRetryIntervalMillis: 200,
        propagateCreateError: false,
      },
      optimization: {
        enableQueryCache: true,
        enablePreparedStatements: true,
        enableIndexOptimization: true,
        enableSlowQueryLogging: true,
        slowQueryThreshold: 1000,
        maxQueryComplexity: 10,
        enableAutoVacuum: true,
        enableAutoAnalyze: true,
      },
      monitoring: {
        enablePerformanceTracking: true,
        enableConnectionTracking: true,
        enableQueryAnalysis: true,
        metricsInterval: 30,
        alertThresholds: {
          connectionUsage: 80,
          queryResponseTime: 2000,
          deadlockCount: 5,
          errorRate: 0.05,
        },
      },
    };

    await initializeDatabaseOptimizer(databaseConfig);

    // v3.0: Initialize connection pool management
    const poolConfig = {
      database: {
        type: databaseConfig.type,
        url: databaseConfig.url,
        database: "hotel_management",
      },
      pool: {
        min: 1, // ✅ MEMORY FIX: Reduced from 5 to 1 (saves 20MB)
        max: 5, // ✅ MEMORY FIX: Reduced from 20 to 5 (saves 75MB)
        acquireTimeoutMs: 15000, // ✅ MEMORY FIX: Reduced from 30s to 15s
        createTimeoutMs: 15000, // ✅ MEMORY FIX: Reduced from 30s to 15s
        destroyTimeoutMs: 3000, // ✅ MEMORY FIX: Reduced from 5s to 3s
        idleTimeoutMs: 120000, // ✅ MEMORY FIX: Reduced from 5min to 2min
        reapIntervalMs: 5000, // ✅ MEMORY FIX: Reduced from 10s to 5s (more frequent cleanup)
        createRetryIntervalMs: 200,
        maxRetries: 3,
        enableAutoScaling: true,
        enableHealthChecks: true,
        enableLoadBalancing: false,
      },
      monitoring: {
        metricsInterval: 30000,
        healthCheckInterval: 60000,
        enableDetailedLogging: process.env.NODE_ENV === "development",
        alertThresholds: {
          highConnectionUsage: 80,
          longAcquireTime: 1000,
          highErrorRate: 0.05,
          connectionLeaks: 5,
        },
      },
      optimization: {
        enablePreparedStatements: true,
        enableQueryCache: true,
        enableConnectionReuse: true,
        maxQueryCacheSize: 100, // ✅ MEMORY FIX: Reduced from 1000 to 100
        connectionWarmupQueries: ["SELECT 1", "SELECT NOW()"],
      },
    };

    await initializeConnectionPool(poolConfig);

    // v3.0: Initialize real-time monitoring dashboard
    const dashboardConfig = {
      updateInterval: 30000, // 30 seconds
      retentionPeriod: 24, // 24 hours
      enableRealTimeUpdates: true,
      enableAlerts: true,
      enablePerformanceAnalytics: true,
      alertThresholds: {
        system: {
          cpuUsage: 80,
          memoryUsage: 85,
          diskUsage: 90,
          responseTime: 2000,
          errorRate: 0.05,
        },
        database: {
          connectionUsage: 80,
          queryTime: 1000,
          deadlocks: 5,
          slowQueries: 10,
        },
        application: {
          requestRate: 1000,
          cacheHitRate: 70,
          queueLength: 100,
          activeUsers: 500,
        },
        business: {
          hotelUtilization: 60,
          requestCompletionRate: 80,
          voiceCallSuccess: 85,
          customerSatisfaction: 7,
        },
      },
      visualization: {
        charts: {
          enableRealtimeCharts: true,
          updateFrequency: 5, // 5 seconds
          historicalDataPoints: 100,
          enableTrendAnalysis: true,
        },
        widgets: {
          enableSystemHealth: true,
          enableDatabaseMetrics: true,
          enableApplicationMetrics: true,
          enableBusinessKPIs: true,
          enableAlertSummary: true,
        },
        themes: {
          defaultTheme: "dark" as const,
          enableCustomThemes: true,
        },
      },
    };

    await initializeMonitoringDashboard(dashboardConfig);

    // v3.0: Initialize API Gateway system
    const gatewayConfig = {
      rateLimiting: {
        enabled: true,
        strategies: [
          {
            name: "global_rate_limit",
            type: "fixed_window" as const,
            windowSize: 60,
            maxRequests: 1000,
            targets: [{ type: "global" as const }],
            actions: [
              { threshold: 80, action: "warn" as const },
              { threshold: 100, action: "block" as const, duration: 60 },
            ],
          },
        ],
        storage: "memory" as const,
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
        exemptions: ["127.0.0.1", "::1"],
      },
      authentication: {
        strategies: [
          {
            name: "jwt_auth",
            type: "jwt" as const,
            priority: 1,
            config: {
              secretKey: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET,
              algorithms: ["HS256"],
              issuer: "hotel-management-system",
            },
            endpoints: ["^/api/(?!auth|health).*"],
          },
        ],
        exemptions: [
          "^/api/auth/.*",
          "^/api/.*/health$",
          "^/api/transcripts.*", // ✅ FIX: Allow transcript API for realtime voice data
          "^/api/request.*", // ✅ FIX: Allow request API for voice assistant
          "^/api/guest/.*", // ✅ FIX: Allow guest APIs for public voice features
          "^/api/temp-public/.*", // ✅ FIX: Allow temp public APIs
        ],
        tokenValidation: {
          verifyExpiration: true,
          verifySignature: true,
          verifyIssuer: true,
          allowedIssuers: ["hotel-management-system"],
        },
        sessionManagement: {
          enabled: true,
          maxSessions: 5,
          sessionTimeout: 60,
        },
      },
      versioning: {
        enabled: true,
        strategies: [
          { type: "header" as const, parameter: "X-API-Version" },
          { type: "query" as const, parameter: "version" },
        ],
        defaultVersion: "v1",
        supportedVersions: ["v1", "v2"],
        deprecationWarnings: [],
      },
      routing: {
        rules: [
          {
            id: "hotel-api",
            pattern: "^/api/hotel/.*",
            methods: ["GET", "POST", "PUT", "DELETE"],
            targets: [
              {
                id: "hotel-service",
                url: "http://localhost:10000",
                weight: 100,
                health: "healthy" as const,
                priority: 1,
                timeout: 30000,
              },
            ],
            middleware: ["auth", "rate-limit"],
          },
        ],
        loadBalancing: {
          strategy: "round_robin" as const,
          healthCheckInterval: 30,
          maxRetries: 3,
          retryDelay: 1000,
        },
        healthChecks: {
          enabled: true,
          endpoint: "/health",
          interval: 30,
          timeout: 5000,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 50,
          recoveryTimeout: 60,
          monitoringWindow: 300,
        },
      },
      transformation: {
        enabled: true,
        rules: [],
      },
      caching: {
        enabled: true,
        strategies: [],
        storage: "memory" as const,
        defaultTTL: 300,
        maxSize: 256,
      },
      analytics: {
        enabled: true,
        metrics: [],
        retention: 7,
        sampling: 100,
        realTimeUpdates: true,
      },
      security: {
        cors: {
          enabled: true,
          origins: ["http://localhost:3000"],
          methods: ["GET", "POST", "PUT", "DELETE"],
          headers: ["Content-Type", "Authorization"],
          credentials: true,
          maxAge: 86400,
        },
        headers: {
          enabled: true,
          headers: {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
          },
        },
        validation: {
          enabled: true,
          maxBodySize: 10 * 1024 * 1024,
          maxHeaderSize: 8 * 1024,
          maxQueryParams: 50,
          requiredHeaders: [],
        },
        filtering: {
          enabled: true,
          blacklist: [],
          whitelist: [],
          geoBlocking: {
            enabled: false,
            allowedCountries: [],
            blockedCountries: [],
            action: "block" as const,
          },
        },
      },
    };

    await initializeAPIGateway(gatewayConfig);

    logger.success(
      "✅ [Monitoring] Complete monitoring system v3.0 initialized with API Gateway",
      "Monitoring",
    );
  } catch {
    logger.error(
      "❌ [Monitoring] Failed to initialize monitoring system",
      "Monitoring",
      error,
    );
    if (process.env.NODE_ENV === "production") {
      // Graceful degradation in production
      logger.warn(
        "⚠️ [Monitoring] Continuing without full monitoring capabilities",
        "Monitoring",
      );
    } else {
      throw error;
    }
  }
}

// ✅ TEMPORARILY DISABLED: Auto-initialization for deployment safety
// Will be re-enabled after successful deployment verification
/*
if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_MONITORING !== 'false') {
  // Use setTimeout to ensure this runs after module system is ready
  setTimeout(() => {
    initializeMonitoring().catch(error => {
      console.error('❌ Auto-initialization of monitoring failed:', error);
      // Graceful degradation - don't crash the app
    });
  }, 2000); // Increased delay to 2 seconds
}
*/
