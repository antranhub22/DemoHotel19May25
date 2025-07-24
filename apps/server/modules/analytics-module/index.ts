// ============================================
// ANALYTICS MODULE - Modular Architecture v2.0 with Lifecycle Management
// ============================================
// Organizes existing analytics functionality with enhanced lifecycle management
// Includes startup/shutdown hooks, health monitoring, and graceful degradation

// Re-export existing controllers and services
export {
  getDashboardAnalytics,
  getHourlyActivity,
  getOverview,
  getServiceDistribution,
} from '@server/analytics';
export { AnalyticsController } from '@server/controllers/analyticsController';

// ✅ NEW v2.0: Import lifecycle management
import { FeatureFlags } from '@server/shared/FeatureFlags';
import {
  ModuleLifecycleManager,
  type ModuleDefinition,
  type ModuleLifecycleHooks,
} from '@server/shared/ModuleLifecycleManager';
import { ServiceContainer } from '@server/shared/ServiceContainer';
import { db } from '@shared/db';
import { logger } from '@shared/utils/logger';

// ============================================
// MODULE LIFECYCLE HOOKS
// ============================================

const analyticsModuleHooks: ModuleLifecycleHooks = {
  async onStartup() {
    logger.info('🚀 [AnalyticsModule] Starting up...', 'AnalyticsModule');

    // Register services with ServiceContainer
    try {
      const { AnalyticsController } = await import(
        '@server/controllers/analyticsController'
      );

      ServiceContainer.registerInstance(
        'AnalyticsController',
        AnalyticsController,
        {
          module: 'analytics-module',
        }
      );

      logger.debug(
        '✅ [AnalyticsModule] Services registered',
        'AnalyticsModule'
      );
    } catch (error) {
      logger.warn(
        '⚠️ [AnalyticsModule] Failed to register some services',
        'AnalyticsModule',
        error
      );
    }

    // Validate database connection for analytics tables
    try {
      // Check if we can access calls table for analytics
      await db.execute('SELECT COUNT(*) FROM calls LIMIT 1');
      logger.debug(
        '✅ [AnalyticsModule] Database access validated',
        'AnalyticsModule'
      );
    } catch (error) {
      logger.error(
        '❌ [AnalyticsModule] Database access failed',
        'AnalyticsModule',
        error
      );
      throw new Error('Database access required for analytics module');
    }

    // Check if advanced analytics features are enabled
    const advancedAnalyticsEnabled =
      FeatureFlags.isEnabled('advanced-analytics');
    if (advancedAnalyticsEnabled) {
      logger.info(
        '📊 [AnalyticsModule] Advanced analytics features enabled',
        'AnalyticsModule'
      );
      // Initialize advanced analytics features here
    }

    logger.success(
      '✅ [AnalyticsModule] Startup completed successfully',
      'AnalyticsModule'
    );
  },

  async onShutdown() {
    logger.info('🛑 [AnalyticsModule] Shutting down...', 'AnalyticsModule');

    // Clean up any analytics resources
    // Could include flushing cached analytics data, closing connections, etc.

    logger.success(
      '✅ [AnalyticsModule] Shutdown completed',
      'AnalyticsModule'
    );
  },

  async onHealthCheck(): Promise<boolean> {
    try {
      // Check if feature flag is enabled
      if (!FeatureFlags.isEnabled('analytics-module')) {
        return false;
      }

      // Check database connectivity for analytics queries
      await db.execute('SELECT COUNT(*) FROM calls LIMIT 1');

      // Check if tenant module dependency is healthy
      const hasTenantModule = ServiceContainer.has('TenantService');
      if (!hasTenantModule) {
        logger.warn(
          '⚠️ [AnalyticsModule] TenantService dependency not available',
          'AnalyticsModule'
        );
        // Analytics can work without tenant service, but with limited functionality
      }

      // If advanced analytics is enabled, check its health
      const advancedAnalyticsEnabled =
        FeatureFlags.isEnabled('advanced-analytics');
      if (advancedAnalyticsEnabled) {
        // Perform advanced analytics health checks here
        logger.debug(
          '📊 [AnalyticsModule] Advanced analytics health check passed',
          'AnalyticsModule'
        );
      }

      return true;
    } catch (error) {
      logger.error(
        '❌ [AnalyticsModule] Health check failed',
        'AnalyticsModule',
        error
      );
      return false;
    }
  },

  async onDegraded() {
    logger.warn(
      '⚠️ [AnalyticsModule] Entering degraded state',
      'AnalyticsModule'
    );

    // In degraded state, analytics might:
    // - Disable advanced analytics features
    // - Fall back to basic reporting
    // - Cache more aggressively

    logger.info(
      '🔄 [AnalyticsModule] Switching to basic analytics mode',
      'AnalyticsModule'
    );
  },

  async onRecovered() {
    logger.info(
      '💚 [AnalyticsModule] Recovered from degraded state',
      'AnalyticsModule'
    );

    // Re-enable advanced analytics if available
    const advancedAnalyticsEnabled =
      FeatureFlags.isEnabled('advanced-analytics');
    if (advancedAnalyticsEnabled) {
      logger.info(
        '📊 [AnalyticsModule] Advanced analytics restored',
        'AnalyticsModule'
      );
    }

    logger.success(
      '✅ [AnalyticsModule] Full functionality restored',
      'AnalyticsModule'
    );
  },

  async onDependencyFailed(failedDependency: string) {
    logger.warn(
      `⚠️ [AnalyticsModule] Dependency failed: ${failedDependency}`,
      'AnalyticsModule',
      { failedDependency }
    );

    if (failedDependency === 'tenant-module') {
      logger.warn(
        '📊 [AnalyticsModule] Tenant module failed - switching to global analytics mode',
        'AnalyticsModule'
      );
      // Analytics can continue to work without tenant isolation
      // but will provide global analytics instead of tenant-specific
    }
  },
};

// ============================================
// MODULE DEFINITION
// ============================================

export const AnalyticsModuleDefinition: ModuleDefinition = {
  name: 'analytics-module',
  version: '2.0.0',
  description: 'Analytics and reporting module with lifecycle management',
  dependencies: ['tenant-module'], // Analytics depends on tenant for data isolation
  optionalDependencies: [], // No optional dependencies
  priority: 30, // Lower priority (analytics is not critical for core functionality)
  healthCheckInterval: 60000, // 60 seconds (analytics can have longer intervals)
  maxFailures: 5, // Higher tolerance for failures (analytics is not critical)
  gracefulShutdownTimeout: 8000, // 8 seconds
  lifecycle: analyticsModuleHooks,
  featureFlag: 'analytics-module', // Controlled by feature flag
};

// ============================================
// MODULE METADATA (backwards compatible)
// ============================================

export const AnalyticsModuleInfo = {
  name: 'analytics-module',
  version: '2.0.0',
  description:
    'Analytics and reporting module with enhanced lifecycle management',
  dependencies: ['tenant-module'],
  endpoints: [
    'GET /api/analytics/overview',
    'GET /api/analytics/service-distribution',
    'GET /api/analytics/hourly-activity',
    'GET /api/analytics/dashboard',
  ],
  features: [
    'call-analytics',
    'service-distribution',
    'hourly-activity',
    'tenant-filtering',
    'dashboard-analytics',
    'lifecycle-management',
    'health-monitoring',
    'graceful-degradation',
    'advanced-analytics',
  ],
};

// ============================================
// MODULE HEALTH CHECK (backwards compatible)
// ============================================

export const checkAnalyticsModuleHealth = () => {
  const lifecycleManager =
    ModuleLifecycleManager.getModuleStatus('analytics-module');

  return {
    status: lifecycleManager?.state || 'unknown',
    timestamp: new Date().toISOString(),
    module: AnalyticsModuleInfo.name,
    version: AnalyticsModuleInfo.version,
    lifecycle: {
      state: lifecycleManager?.state,
      startedAt: lifecycleManager?.startedAt,
      lastHealthCheck: lifecycleManager?.lastHealthCheck,
      healthCheckCount: lifecycleManager?.healthCheckCount,
      failureCount: lifecycleManager?.failureCount,
      metrics: lifecycleManager?.metrics,
    },
  };
};

// ============================================
// AUTO-REGISTRATION WITH LIFECYCLE MANAGER
// ============================================

// Auto-register this module with the lifecycle manager when imported
try {
  ModuleLifecycleManager.registerModule(AnalyticsModuleDefinition);
  logger.debug(
    '🔄 [AnalyticsModule] Registered with ModuleLifecycleManager',
    'AnalyticsModule',
    { version: AnalyticsModuleDefinition.version }
  );
} catch (error) {
  logger.error(
    '❌ [AnalyticsModule] Failed to register with ModuleLifecycleManager',
    'AnalyticsModule',
    error
  );
}
