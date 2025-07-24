// ============================================
// MAIN API ROUTER v3.0 - MODULAR ARCHITECTURE
// ============================================
// Enhanced with modular route organization aligned with business domains
// Backward compatible with existing API structure
// Integrated with ServiceContainer v2.0, FeatureFlags v2.0, and ModuleLifecycle

import { logger } from '@shared/utils/logger';
import express from 'express';

// ✅ NEW v3.0: MODULAR ROUTE IMPORTS - Business Domain Aligned
import adminModuleRoutes from '@server/routes/modules/admin-module';
import analyticsModuleRoutes from '@server/routes/modules/analytics-module';
import coreModuleRoutes from '@server/routes/modules/core-module';
import hotelModuleRoutes from '@server/routes/modules/hotel-module';
import voiceModuleRoutes from '@server/routes/modules/voice-module';

// ✅ LEGACY: Keep existing imports for backward compatibility
import unifiedAuthRoutes from '@auth/routes/auth.routes';
import analyticsRoutes from '@server/routes/analytics';
import callsRoutes from '@server/routes/calls';
import dashboardRoutes from '@server/routes/dashboard';
import emailRoutes from '@server/routes/email';
import healthRoutes from '@server/routes/health';
import requestRoutes from '@server/routes/request';
import staffRoutes from '@server/routes/staff';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT

// ✅ v2.0 routes now integrated into admin module, but kept for direct access
import featureFlagsRoutes from '@server/routes/feature-flags';
import moduleLifecycleRoutes from '@server/routes/module-lifecycle';
import monitoringRoutes from '@server/routes/monitoring';

const router = express.Router();

// ============================================
// v3.0 MODULAR ARCHITECTURE ROUTES
// ============================================

logger.debug(
  '🏗️ [Router v3.0] Initializing modular route architecture',
  'MainRouter'
);

// ✅ CORE MODULE: Essential system functionality
router.use('/api/core', coreModuleRoutes);

// ✅ HOTEL MODULE: Hotel operations & management
router.use('/api/hotel', hotelModuleRoutes);

// ✅ VOICE MODULE: Voice assistant & call management
router.use('/api/voice', voiceModuleRoutes);

// ✅ ANALYTICS MODULE: Analytics & business intelligence
router.use('/api/analytics-module', analyticsModuleRoutes);

// ✅ ADMIN MODULE: System administration & management
router.use('/api/admin', adminModuleRoutes);

// ============================================
// LEGACY API ROUTES - BACKWARD COMPATIBILITY
// ============================================

logger.debug(
  '🔄 [Router v3.0] Mounting legacy routes for backward compatibility',
  'MainRouter'
);

// ✅ AUTH ROUTES - COMPLETELY OUTSIDE /api/* PREFIX (no rate limiting, no middleware)
router.use('/auth', unifiedAuthRoutes);

// ✅ LEGACY API ROUTES - Keep existing structure for backward compatibility
router.use('/api/analytics', analyticsRoutes);
router.use('/api/calls', callsRoutes);
router.use('/api/dashboard', dashboardRoutes);
router.use('/api/email', emailRoutes);
router.use('/api/health', healthRoutes);
router.use('/api/request', requestRoutes);
router.use('/api/staff', staffRoutes);

// ✅ v2.0 ENHANCED ROUTES - Direct access (also available under /api/admin)
router.use('/api/feature-flags', featureFlagsRoutes);
router.use('/api/module-lifecycle', moduleLifecycleRoutes);
router.use('/api/monitoring', monitoringRoutes);

// ✅ PUBLIC ROUTES - For development and testing
router.use('/public', tempPublicRoutes);

// ============================================
// ROUTE DISCOVERY & DOCUMENTATION
// ============================================

/**
 * GET /api - Main API information and route discovery
 */
router.get('/api', (req, res) => {
  logger.api('📍 [Router v3.0] API discovery endpoint accessed', 'MainRouter');

  (res as any).json({
    api: 'DemoHotel19May',
    version: '3.0.0',
    architecture: 'Modular Business Domain Aligned',
    description: 'Multi-tenant hotel voice assistant SaaS platform',

    modularRoutes: {
      core: '/api/core - Essential system functionality',
      hotel: '/api/hotel - Hotel operations & management',
      voice: '/api/voice - Voice assistant & call management',
      analytics: '/api/analytics-module - Analytics & business intelligence',
      admin: '/api/admin - System administration & management',
    },

    legacyRoutes: {
      analytics: '/api/analytics - Legacy analytics endpoints',
      calls: '/api/calls - Legacy call management',
      dashboard: '/api/dashboard - Legacy dashboard endpoints',
      email: '/api/email - Legacy email endpoints',
      health: '/api/health - Legacy health checks',
      request: '/api/request - Legacy request endpoints',
      staff: '/api/staff - Legacy staff management',
    },

    directAccess: {
      featureFlags: '/api/feature-flags - Feature flag management',
      moduleLifecycle: '/api/module-lifecycle - Module lifecycle control',
      monitoring: '/api/monitoring - Enhanced monitoring & metrics',
    },

    authentication: {
      auth: '/auth - Authentication endpoints (no /api prefix)',
    },

    development: {
      public: '/public - Development and testing endpoints',
    },

    features: {
      modularArchitecture: true,
      backwardCompatibility: true,
      serviceContainer: '2.0.0',
      featureFlags: '2.0.0',
      moduleLifecycle: '2.0.0',
      enhancedMonitoring: '2.0.0',
    },

    migration: {
      status: 'Phase 3 - Route Modularization Complete',
      nextPhase: 'Phase 4 - Advanced Monitoring',
      backwardCompatible: true,
      recommendedApproach:
        'Use modular routes for new development, legacy routes remain functional',
    },

    timestamp: new Date().toISOString(),
  });
});

logger.success(
  '✅ [Router v3.0] Modular route architecture initialized successfully',
  'MainRouter'
);

export default router;
