// ============================================================================
// ADMIN MODULE: MAIN ROUTER v2.0 - System Administration & Management
// ============================================================================
// Central router for all system administration functionality including feature flags,
// module lifecycle management, monitoring, and system administration
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import { logger } from '@shared/utils/logger';
import express from 'express';

// ✅ Import admin module routes
import cacheRoutes from './cache.routes';
import featureFlagsRoutes from './feature-flags.routes';
import loadTestingRoutes from './load-testing.routes';
import metricsRoutes from './metrics.routes';
import moduleLifecycleRoutes from './module-lifecycle.routes';
import monitoringRoutes from './monitoring.routes';
import performanceRoutes from './performance.routes';

// ✅ ENHANCED v2.0: Import modular architecture components
import { isFeatureEnabled } from '@server/shared/FeatureFlags';

const router = express.Router();

// ============================================
// ADMIN MODULE INITIALIZATION
// ============================================

/**
 * Initialize Admin Module with ServiceContainer registration
 */
const initializeAdminModule = () => {
  try {
    logger.debug(
      '⚙️ [Admin-Module] Initializing admin module v2.0',
      'AdminModule'
    );

    // Admin module provides system administration capabilities
    // Services are already registered via existing v2.0 systems

    logger.success(
      '✅ [Admin-Module] Admin module v2.0 initialized successfully',
      'AdminModule'
    );
  } catch (error) {
    logger.error(
      '❌ [Admin-Module] Failed to initialize admin module',
      'AdminModule',
      error
    );
  }
};

// Initialize on module load
initializeAdminModule();

// ============================================
// ADMIN MODULE ROUTE MOUNTING
// ============================================

/**
 * Feature flags and A/B testing management
 * Mounted at: /api/admin/feature-flags/*
 */
router.use('/feature-flags', featureFlagsRoutes);

/**
 * Module lifecycle management and control
 * Mounted at: /api/admin/module-lifecycle/*
 */
router.use('/module-lifecycle', moduleLifecycleRoutes);

/**
 * Enhanced logging, metrics, and monitoring
 * Mounted at: /api/admin/monitoring/*
 */
router.use('/monitoring', monitoringRoutes);

/**
 * Advanced metrics collection and KPI tracking
 * Mounted at: /api/admin/metrics/*
 */
router.use('/metrics', metricsRoutes);

/**
 * Performance audit and optimization recommendations
 * Mounted at: /api/admin/performance/*
 */
router.use('/performance', performanceRoutes);

/**
 * Cache management and monitoring
 * Mounted at: /api/admin/cache/*
 */
router.use('/cache', cacheRoutes);

/**
 * Load testing and performance benchmarking
 * Mounted at: /api/admin/load-testing/*
 */
router.use('/load-testing', loadTestingRoutes);

/**
 * GET /api/admin - Admin module information
 */
router.get('/', (_req, res) => {
  logger.api('⚙️ [Admin-Module] Root endpoint accessed', 'AdminModule');

  (res as any).json({
    module: 'admin-module',
    version: '2.0.0',
    description: 'System administration and management functionality',
    architecture: 'Modular v2.0',
    status: 'active',

    features: {
      featureFlagsManagement: isFeatureEnabled('feature-flags-admin'),
      moduleLifecycleControl: isFeatureEnabled('module-lifecycle-admin'),
      systemMonitoring: isFeatureEnabled('system-monitoring-admin'),
      advancedDiagnostics: isFeatureEnabled('advanced-diagnostics'),
      metricsCollection: isFeatureEnabled('metrics-collection'),
      performanceAudit: isFeatureEnabled('performance-audit') || true, // Always available
      cacheManagement: isFeatureEnabled('cache-management') || true, // Always available
      loadTesting: isFeatureEnabled('load-testing') || true, // Always available
    },

    endpoints: {
      featureFlags: '/api/admin/feature-flags',
      moduleLifecycle: '/api/admin/module-lifecycle',
      monitoring: '/api/admin/monitoring',
      metrics: '/api/admin/metrics',
      performance: '/api/admin/performance',
      cache: '/api/admin/cache',
      loadTesting: '/api/admin/load-testing',
    },

    integrations: {
      serviceContainer: true,
      featureFlags: true,
      enhancedLogging: true,
      metricsCollector: true,
      moduleLifecycleManager: true,
      performanceAuditor: true,
      cacheManager: true,
      loadTestManager: true,
    },

    timestamp: new Date().toISOString(),
  });
});

export default router;
