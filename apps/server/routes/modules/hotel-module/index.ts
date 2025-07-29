// ============================================================================
// HOTEL MODULE: MAIN ROUTER v2.0 - Hotel Operations & Management
// ============================================================================
// Central router for all hotel-related functionality including guest services,
// staff management, dashboard, and communication features
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import { logger } from '@shared/utils/logger';
import express from 'express';

// Import route modules
import dashboardRoutes from './dashboard.routes';
import emailRoutes from './email.routes';
import requestsRoutes from './requests.routes';
import servicesRoutes from './services.routes'; // ✅ NEW: Services routes
import staffRoutes from './staff.routes';

const router = express.Router();

// ============================================
// Hotel Module Routes
// ============================================

logger.debug(
  '🏨 [Hotel-Module] Initializing hotel module routes',
  'HotelModule'
);

// Mount sub-routes
router.use('/requests', requestsRoutes);
router.use('/staff', staffRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/email', emailRoutes);
router.use('/services', servicesRoutes); // ✅ NEW: Services routes

// ============================================
// GET /api/hotel - Module information
// ============================================
router.get('/', (_req, res) => {
  logger.debug('🏨 [Hotel-Module] Module info requested', 'HotelModule');

  (res as any).json({
    module: 'hotel-module',
    version: '2.0.0',
    description: 'Complete hotel operations and management suite',
    architecture: 'Modular v2.0',
    endpoints: {
      requests: '/api/hotel/requests',
      staff: '/api/hotel/staff',
      dashboard: '/api/hotel/dashboard',
      email: '/api/hotel/email',
      services: '/api/hotel/services', // ✅ NEW: Services endpoint
    },
  });
});

// ============================================
// GET /api/hotel/status - Quick status check
// ============================================
router.get('/status', (_req, res) => {
  logger.debug('🏨 [Hotel-Module] Status check requested', 'HotelModule');

  (res as any).json({
    status: 'healthy',
    module: 'hotel-module',
    timestamp: new Date().toISOString(),
  });
});

export default router;
