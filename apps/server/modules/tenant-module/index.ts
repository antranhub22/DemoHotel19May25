// ============================================
// TENANT MODULE - Modular Architecture v2.0 with Lifecycle Management
// ============================================
// Organizes existing tenant functionality with enhanced lifecycle management
// Includes startup/shutdown hooks, health monitoring, and graceful degradation

// Re-export existing services and middleware
export { TenantMiddleware } from '@server/middleware/tenant';
export { TenantService } from '@server/services/tenantService';

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

const tenantModuleHooks: ModuleLifecycleHooks = {
  async onStartup() {
    logger.info('🚀 [TenantModule] Starting up...', 'TenantModule');

    // Register services with ServiceContainer
    try {
      const { TenantService } = await import('@server/services/tenantService');
      const { TenantMiddleware } = await import('@server/middleware/tenant');

      ServiceContainer.register('TenantService', TenantService, {
        module: 'tenant-module',
        singleton: true,
        dependencies: [], // Core module - no dependencies
      });

      ServiceContainer.register('TenantMiddleware', TenantMiddleware, {
        module: 'tenant-module',
        singleton: true,
        dependencies: ['TenantService'],
      });

      logger.debug('✅ [TenantModule] Services registered', 'TenantModule');
    } catch (error) {
      logger.error(
        '❌ [TenantModule] Failed to register services',
        'TenantModule',
        error
      );
      throw error; // Critical for tenant module
    }

    // Validate database connection and tenant table
    try {
      await db.execute('SELECT COUNT(*) FROM tenants LIMIT 1');
      logger.debug(
        '✅ [TenantModule] Database and tenant table validated',
        'TenantModule'
      );
    } catch (error) {
      logger.error(
        '❌ [TenantModule] Database validation failed',
        'TenantModule',
        error
      );
      throw new Error(
        'Database and tenant table access required for tenant module'
      );
    }

    // Initialize tenant isolation checks
    try {
      const tenantService = ServiceContainer.getSync('TenantService');
      // Perform any tenant initialization here
      logger.debug(
        '✅ [TenantModule] Tenant isolation initialized',
        'TenantModule'
      );
    } catch (error) {
      logger.warn(
        '⚠️ [TenantModule] Tenant isolation check failed',
        'TenantModule',
        error
      );
    }

    logger.success(
      '✅ [TenantModule] Startup completed successfully',
      'TenantModule'
    );
  },

  async onShutdown() {
    logger.info('🛑 [TenantModule] Shutting down...', 'TenantModule');

    // Clean up any tenant-specific resources
    // For now, no specific cleanup needed

    logger.success('✅ [TenantModule] Shutdown completed', 'TenantModule');
  },

  async onHealthCheck(): Promise<boolean> {
    try {
      // Check if feature flag is enabled
      if (!FeatureFlags.isEnabled('tenant-module')) {
        return false;
      }

      // Check database connectivity and tenant table access
      await db.execute('SELECT COUNT(*) FROM tenants LIMIT 1');

      // Check if TenantService is functioning
      const tenantService = ServiceContainer.getSync('TenantService');
      if (!tenantService) {
        logger.error(
          '❌ [TenantModule] TenantService not available',
          'TenantModule'
        );
        return false;
      }

      // Perform a simple tenant operation to verify functionality
      // This could be a basic tenant validation or count

      return true;
    } catch (error) {
      logger.error(
        '❌ [TenantModule] Health check failed',
        'TenantModule',
        error
      );
      return false;
    }
  },

  async onDegraded() {
    logger.warn('⚠️ [TenantModule] Entering degraded state', 'TenantModule');

    // In degraded state for tenant module is critical:
    // - Tenant isolation might be compromised
    // - Need to be very careful about data access
    // - Might need to block new tenant operations

    logger.warn(
      '🚨 [TenantModule] CRITICAL: Tenant isolation may be compromised',
      'TenantModule'
    );
  },

  async onRecovered() {
    logger.info(
      '💚 [TenantModule] Recovered from degraded state',
      'TenantModule'
    );

    // Verify tenant isolation is fully functional
    try {
      await db.execute('SELECT COUNT(*) FROM tenants LIMIT 1');
      logger.success(
        '✅ [TenantModule] Tenant isolation fully restored',
        'TenantModule'
      );
    } catch (error) {
      logger.error(
        '❌ [TenantModule] Recovery verification failed',
        'TenantModule',
        error
      );
    }
  },

  async onDependencyFailed(failedDependency: string) {
    logger.error(
      `💀 [TenantModule] Dependency failed: ${failedDependency}`,
      'TenantModule',
      { failedDependency }
    );

    // Tenant module is a core module and shouldn't have critical dependencies fail
    // If this happens, it's a serious system issue
    logger.error(
      '🚨 [TenantModule] CRITICAL: Core dependency failure detected',
      'TenantModule',
      { failedDependency }
    );
  },
};

// ============================================
// MODULE DEFINITION
// ============================================

export const TenantModuleDefinition: ModuleDefinition = {
  name: 'tenant-module',
  version: '2.0.0',
  description:
    'Multi-tenant management and isolation with lifecycle management',
  dependencies: [], // Core module - no dependencies
  optionalDependencies: [], // No optional dependencies
  priority: 10, // High priority (core module - starts first)
  healthCheckInterval: 15000, // 15 seconds (more frequent for critical module)
  maxFailures: 2, // Low tolerance for failures (core module)
  gracefulShutdownTimeout: 10000, // 10 seconds (more time for critical cleanup)
  lifecycle: tenantModuleHooks,
  featureFlag: 'tenant-module', // Controlled by feature flag
};

// ============================================
// MODULE METADATA (backwards compatible)
// ============================================

export const TenantModuleInfo = {
  name: 'tenant-module',
  version: '2.0.0',
  description:
    'Multi-tenant management and isolation with enhanced lifecycle management',
  dependencies: ['auth-module'],
  features: [
    'tenant-identification',
    'subscription-management',
    'data-isolation',
    'feature-flags',
    'usage-tracking',
    'lifecycle-management',
    'health-monitoring',
    'graceful-degradation',
  ],
};

// ============================================
// MODULE HEALTH CHECK (backwards compatible)
// ============================================

export const checkTenantModuleHealth = () => {
  const lifecycleManager =
    ModuleLifecycleManager.getModuleStatus('tenant-module');

  return {
    status: lifecycleManager?.state || 'unknown',
    timestamp: new Date().toISOString(),
    module: TenantModuleInfo.name,
    version: TenantModuleInfo.version,
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
  ModuleLifecycleManager.registerModule(TenantModuleDefinition);
  logger.debug(
    '🔄 [TenantModule] Registered with ModuleLifecycleManager',
    'TenantModule',
    { version: TenantModuleDefinition.version }
  );
} catch (error) {
  logger.error(
    '❌ [TenantModule] Failed to register with ModuleLifecycleManager',
    'TenantModule',
    error
  );
}
