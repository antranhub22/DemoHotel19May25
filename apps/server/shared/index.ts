// ============================================
// SHARED UTILITIES INDEX - Modular Architecture v2.0
// ============================================
// Central export for all cross-cutting concerns and utilities
// Enhanced with Logging & Metrics v2.0 integration

// Core utilities
export * from './FeatureFlags';
export * from './ModuleLifecycleManager';
export * from './ServiceContainer';

// ✅ NEW v2.0: Enhanced Logging & Metrics System
export * from './EnhancedLogger';
export * from './MetricsCollector';
export * from './MonitoringIntegration';

// Import for usage in health check
import {
  MODULE_REGISTRY,
  checkAllModulesHealth,
  getAvailableModules,
} from '../modules';
import { EnhancedLogger } from './EnhancedLogger'; // ✅ NEW v2.0
import { FeatureFlags } from './FeatureFlags';
import { MetricsCollector } from './MetricsCollector'; // ✅ NEW v2.0
import { ModuleLifecycleManager } from './ModuleLifecycleManager';
import { MonitoringIntegration } from './MonitoringIntegration'; // ✅ NEW v2.0
import { ServiceContainer } from './ServiceContainer';

// Re-export existing shared utilities for convenience
export { generateId, generateShortId } from '@shared/utils/idGenerator';
export { logger } from '@shared/utils/logger';

// Module system exports
export { MODULE_REGISTRY, checkAllModulesHealth, getAvailableModules };

// ✅ ENHANCED v2.0: Architecture health check with comprehensive monitoring
export const getArchitectureHealth = () => {
  return {
    modular: {
      modules: getAvailableModules(),
      moduleHealth: checkAllModulesHealth(),
    },
    services: {
      container: ServiceContainer.getHealthStatus(),
    },
    features: {
      flags: FeatureFlags.getStatus(),
    },
    lifecycle: {
      systemHealth: ModuleLifecycleManager.getSystemHealth(),
      modulesStatus: ModuleLifecycleManager.getModulesStatus(),
      diagnostics: ModuleLifecycleManager.getDiagnostics(),
    },
    // ✅ NEW v2.0: Enhanced Logging & Metrics Health
    monitoring: {
      logger: EnhancedLogger.getHealthStatus(),
      metrics: MetricsCollector.getHealthSummary(),
      integration: MonitoringIntegration.getMonitoringStatus(),
      overall: MonitoringIntegration.getMonitoringStatus().health,
    },
    timestamp: new Date().toISOString(),
    architecture: 'Modular v2.0 with Enhanced Logging & Metrics',
  };
};

// ✅ NEW v2.0: Initialize monitoring integration on import
let monitoringInitialized = false;

export const initializeMonitoring = async (config?: any) => {
  if (monitoringInitialized) {
    return;
  }

  try {
    // Initialize monitoring integration
    await MonitoringIntegration.initialize({
      enableEnhancedLogging: true,
      enableMetricsCollection: true,
      enablePerformanceTracing: true,
      enableAutoAlerts: true,
      logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      metricsInterval: 30000,
      ...config,
    });

    monitoringInitialized = true;

    // Create integrated logger for reporting
    const systemLogger = EnhancedLogger.createModuleLogger('System', '2.0.0');
    systemLogger.success(
      '🎉 Enhanced Logging & Metrics v2.0 initialized successfully',
      {
        architecture: 'Modular v2.0',
        components: [
          'EnhancedLogger',
          'MetricsCollector',
          'MonitoringIntegration',
        ],
      }
    );
  } catch (error) {
    console.error('❌ Failed to initialize monitoring system:', error);
    // Don't throw error in production - graceful degradation
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
};

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

// 📋 TO RE-ENABLE MONITORING AFTER DEPLOYMENT:
// 1. Uncomment the above code block
// 2. Set ENABLE_MONITORING=true in environment
// 3. Rebuild and deploy
