// ============================================
// SHARED CROSS-CUTTING CONCERNS v3.0 - Enhanced with Advanced Health Monitoring
// ============================================
// Central export hub for all cross-cutting concerns and utilities including
// enhanced monitoring, modular architecture, and advanced health checking

import { logger } from '@shared/utils/logger';

// ✅ v2.0: Enhanced Architecture Components
export {
  addFlagListener,
  createABTest,
  evaluateABTest,
  FeatureFlags,
  isFeatureEnabled,
  isModuleEnabled,
} from './FeatureFlags';
export { ModuleLifecycleManager } from './ModuleLifecycleManager';
export {
  getService,
  getServiceSync,
  initializeServiceContainer,
  ServiceContainer,
} from './ServiceContainer';

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
} from './AdvancedHealthCheck';

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
} from './AdvancedMetricsCollector';

// ✅ v3.0: NEW Performance Auditor System
export {
  getPerformanceTrends,
  initializePerformanceAuditor,
  PerformanceAuditor,
  performanceAuditor,
  runComprehensiveAudit,
  runQuickAudit,
  type ModulePerformance,
  type OptimizationRecommendation,
  type PerformanceAuditReport,
  type PerformanceBottleneck,
  type PerformanceIssue,
} from './PerformanceAuditor';

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
} from './CacheManager';

// ✅ v2.0: Enhanced Monitoring Components
export { EnhancedLogger } from './EnhancedLogger';
export { MetricsCollector } from './MetricsCollector';
export { MonitoringIntegration } from './MonitoringIntegration';

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
      '🏗️ [Architecture] Getting comprehensive health status v3.0',
      'Architecture'
    );

    // Import dynamically to avoid circular dependencies
    const { ServiceContainer } = await import('./ServiceContainer');
    const { FeatureFlags } = await import('./FeatureFlags');
    const { ModuleLifecycleManager } = await import('./ModuleLifecycleManager');
    const { MonitoringIntegration } = await import('./MonitoringIntegration');
    const { advancedHealthCheck } = await import('./AdvancedHealthCheck');

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
        '⚠️ [Architecture] Advanced health system not fully initialized',
        'Architecture'
      );
    }

    return {
      version: '3.0.0',
      timestamp: new Date().toISOString(),

      // v2.0 Health Status (maintained for compatibility)
      services: {
        container: {
          status: containerHealth.healthy ? 'healthy' : 'unhealthy',
          registeredServices: containerHealth.registeredServices,
          instantiatedServices: containerHealth.instantiatedServices,
          errors: containerHealth.errors.length,
          metrics: containerHealth.metrics,
        },
        featureFlags: {
          status: featureFlagsHealth.isInitialized ? 'healthy' : 'unhealthy',
          totalFlags: featureFlagsHealth.totalFlags,
          enabledFlags: featureFlagsHealth.enabledFlags,
          abTests: featureFlagsHealth.abTests,
        },
        lifecycle: {
          status: lifecycleHealth.isInitialized ? 'healthy' : 'unhealthy',
          totalModules: lifecycleHealth.registeredModules,
          runningModules: lifecycleHealth.runningModules,
          failedModules: lifecycleHealth.failedModules,
        },
        monitoring: {
          status: monitoringHealth.initialized ? 'healthy' : 'unhealthy',
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
            ? 'healthy'
            : 'degraded',
        readiness: 'ready',
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
  } catch (error) {
    logger.error(
      '❌ [Architecture] Failed to get architecture health',
      'Architecture',
      error
    );

    return {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      overall: {
        status: 'unhealthy',
        error: (error as Error).message,
      },
      services: {
        container: { status: 'unknown' },
        featureFlags: { status: 'unknown' },
        lifecycle: { status: 'unknown' },
        monitoring: { status: 'unknown' },
      },
      advancedHealth: {
        initialized: false,
        error: 'Failed to initialize advanced health monitoring',
      },
    };
  }
}

// ============================================
// v3.0: ENHANCED MONITORING INITIALIZATION
// ============================================

/**
 * Initialize complete monitoring system v3.0
 * Now includes advanced health monitoring, metrics collection, performance auditing, and caching
 */
export async function initializeMonitoring() {
  try {
    logger.info(
      '🚀 [Monitoring] Initializing complete monitoring system v3.0',
      'Monitoring'
    );

    // Import all monitoring components
    const { EnhancedLogger } = await import('./EnhancedLogger');
    const { MetricsCollector } = await import('./MetricsCollector');
    const { MonitoringIntegration } = await import('./MonitoringIntegration');
    const { initializeAdvancedHealthCheck } = await import(
      './AdvancedHealthCheck'
    );
    const { initializeAdvancedMetrics } = await import(
      './AdvancedMetricsCollector'
    );
    const { initializePerformanceAuditor } = await import(
      './PerformanceAuditor'
    );
    const { initializeCache } = await import('./CacheManager');

    // Initialize components in order (using available methods)
    // Note: EnhancedLogger and MetricsCollector don't have initialize methods
    logger.debug('📝 [Monitoring] EnhancedLogger ready', 'Monitoring');
    logger.debug('📊 [Monitoring] MetricsCollector ready', 'Monitoring');

    // Initialize MonitoringIntegration (this may have initialize method)
    try {
      await MonitoringIntegration.initialize();
    } catch (error) {
      logger.warn(
        '⚠️ [Monitoring] MonitoringIntegration init failed, continuing',
        'Monitoring'
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
      evictionPolicy: 'lru',
    });

    logger.success(
      '✅ [Monitoring] Complete monitoring system v3.0 initialized with caching',
      'Monitoring'
    );
  } catch (error) {
    logger.error(
      '❌ [Monitoring] Failed to initialize monitoring system',
      'Monitoring',
      error
    );
    if (process.env.NODE_ENV === 'production') {
      // Graceful degradation in production
      logger.warn(
        '⚠️ [Monitoring] Continuing without full monitoring capabilities',
        'Monitoring'
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
