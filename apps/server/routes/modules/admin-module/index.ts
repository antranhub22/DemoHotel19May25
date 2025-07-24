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

export default router;
