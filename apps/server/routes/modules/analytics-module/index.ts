// ============================================================================
// ANALYTICS MODULE: MAIN ROUTER v2.0 - Analytics & Business Intelligence
// ============================================================================
// Central router for all analytics functionality including performance metrics,
// business intelligence, and comprehensive reporting capabilities
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import express from 'express';
import { isFeatureEnabled } from '@server/shared/FeatureFlags';
import { logger } from '@shared/utils/logger';

// ✅ Import analytics module routes
import analyticsRoutes from './analytics.routes';

// ✅ ENHANCED v2.0: Import modular architecture components

const router = express.Router();

// ============================================
// ANALYTICS MODULE INITIALIZATION
// ============================================

/**
 * Initialize Analytics Module with ServiceContainer registration
 */
const initializeAnalyticsModule = () => {
  try {
    logger.debug(
      '📊 [Analytics-Module] Initializing analytics module v2.0',
      'AnalyticsModule'
    );

    // Analytics module services are registered via AnalyticsController
    // This module primarily routes to enhanced controllers

    logger.success(
      '✅ [Analytics-Module] Analytics module v2.0 initialized successfully',
      'AnalyticsModule'
    );
  } catch (error) {
    logger.error(
      '❌ [Analytics-Module] Failed to initialize analytics module',
      'AnalyticsModule',
      error
    );
  }
};

// Initialize on module load
initializeAnalyticsModule();

// ============================================
// ANALYTICS MODULE ROUTE MOUNTING
// ============================================

/**
 * Performance analytics and business intelligence
 * Mounted at: /api/analytics/*
 */
router.use('/', analyticsRoutes);

export default router;
