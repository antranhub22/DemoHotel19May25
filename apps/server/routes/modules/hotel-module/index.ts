// ============================================================================
// HOTEL MODULE: MAIN ROUTER v2.0 - Hotel Operations & Management
// ============================================================================
// Central router for all hotel-related functionality including guest services,
// staff management, dashboard, and communication features
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import { logger } from '@shared/utils/logger';
import express from 'express';

// ✅ Import hotel module routes
import dashboardRoutes from './dashboard.routes';
import emailRoutes from './email.routes';
import requestsRoutes from './requests.routes';
import staffRoutes from './staff.routes';

// ✅ ENHANCED v2.0: Import modular architecture components
import { isFeatureEnabled } from '@server/shared/FeatureFlags';

const router = express.Router();

// ============================================
// HOTEL MODULE INITIALIZATION
// ============================================

/**
 * Initialize Hotel Module with ServiceContainer registration
 */
const initializeHotelModule = () => {
  try {
    logger.debug(
      '🏨 [Hotel-Module] Initializing hotel module v2.0',
      'HotelModule'
    );

    // Hotel module services are already registered via individual controllers
    // This module primarily routes to enhanced controllers

    logger.success(
      '✅ [Hotel-Module] Hotel module v2.0 initialized successfully',
      'HotelModule'
    );
  } catch (error) {
    logger.error(
      '❌ [Hotel-Module] Failed to initialize hotel module',
      'HotelModule',
      error
    );
  }
};

// Initialize on module load
initializeHotelModule();

// ============================================
// HOTEL MODULE ROUTE MOUNTING
// ============================================

/**
 * Guest service requests and order management
 * Mounted at: /api/hotel/requests/*
 */
router.use('/requests', requestsRoutes);

/**
 * Staff management and role-based access
 * Mounted at: /api/hotel/staff/*
 */
router.use('/staff', staffRoutes);

/**
 * Hotel dashboard and configuration
    * Mounted at: /api/hotel/hotel-dashboard/*
 */
router.use('/hotel-dashboard', dashboardRoutes);

/**
 * Email notifications and communication
 * Mounted at: /api/hotel/email/*
 */
router.use('/email', emailRoutes);

// ============================================
// HOTEL MODULE METADATA ENDPOINTS
// ============================================

/**
 * GET /api/hotel - Hotel module information
 */
router.get('/', (_req, res) => {
  logger.api('📊 [Hotel-Module] Root endpoint accessed', 'HotelModule');

  (res as any).json({
    module: 'hotel-module',
    version: '2.0.0',
    description: 'Hotel operations and management functionality',
    architecture: 'Modular v2.0',
    status: 'active',

    features: {
      guestServices: isFeatureEnabled('guest-services'),
      staffManagement: isFeatureEnabled('staff-management'),
      emailNotifications: isFeatureEnabled('email-notifications'),
      advancedDashboard: isFeatureEnabled('advanced-dashboard'),
      realTimeUpdates: isFeatureEnabled('real-time-notifications'),
    },

    endpoints: {
      requests: '/api/hotel/requests',
      staff: '/api/hotel/staff',
      dashboard: '/api/hotel/hotel-dashboard',
      email: '/api/hotel/email',
    },

    integrations: {
      serviceContainer: true,
      featureFlags: true,
      enhancedLogging: true,
      tenantIsolation: true,
    },

    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/hotel/status - Quick status check
 */
router.get('/status', (_req, res) => {
  logger.api('⚡ [Hotel-Module] Status check requested', 'HotelModule');

  (res as any).json({
    module: 'hotel-module',
    status: 'healthy',
    version: '2.0.0',
    uptime: process.uptime(),
    features: {
      requests: 'active',
      staff: 'active',
      dashboard: 'active',
      email: 'active',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/hotel/meta - Module metadata and API documentation
 */
router.get('/meta', (_req, res) => {
  logger.api('📖 [Hotel-Module] Metadata requested', 'HotelModule');

  (res as any).json({
    module: 'hotel-module',
    version: '2.0.0',
    description: 'Complete hotel operations and management suite',
    architecture: 'Modular v2.0',

    businessDomains: [
      'Guest Service Management',
      'Staff Operations',
      'Hotel Administration',
      'Communication Systems',
    ],

    endpoints: {
      root: [
        'GET /api/hotel - Module information',
        'GET /api/hotel/status - Quick status check',
        'GET /api/hotel/meta - This metadata endpoint',
      ],
      requests: [
        'POST /api/hotel/requests - Create service request',
        'GET /api/hotel/requests/:id - Get request details',
        'PATCH /api/hotel/requests/:id/status - Update request status',
        'GET /api/hotel/requests - List requests (paginated)',
      ],
      staff: [
        'GET /api/hotel/staff - List staff members',
        'POST /api/hotel/staff - Create staff member',
        'GET /api/hotel/staff/:id - Get staff details',
        'PATCH /api/hotel/staff/:id - Update staff member',
        'DELETE /api/hotel/staff/:id - Delete staff member',
      ],
      dashboard: [
        'POST /api/hotel/dashboard/research-hotel - Research hotel data',
        'POST /api/hotel/dashboard/generate-assistant - Generate AI assistant',
        'GET /api/hotel/dashboard/hotel-profile - Get hotel profile',
        'PATCH /api/hotel/dashboard/hotel-profile - Update hotel profile',
        'GET /api/hotel/dashboard/analytics - Get dashboard analytics',
      ],
      email: [
        'POST /api/hotel/email/send - Send email notification',
        'GET /api/hotel/email/templates - Get email templates',
        'POST /api/hotel/email/templates - Create email template',
      ],
    },

    features: {
      multiTenant: true,
      realTimeUpdates: true,
      featureFlagsEnabled: true,
      rbacSupport: true,
      auditLogging: true,
      performanceMonitoring: true,
    },

    dependencies: {
      serviceContainer: '2.0.0',
      featureFlags: '2.0.0',
      enhancedLogger: '2.0.0',
      metricsCollector: '2.0.0',
    },

    timestamp: new Date().toISOString(),
  });
});

export default router;
