import analyticsRoutes from '@server/routes/analytics';
import callsRoutes from '@server/routes/calls';
import dashboardRoutes from '@server/routes/dashboard';
import emailRoutes from '@server/routes/email';
import healthRoutes from '@server/routes/health';
import requestRoutes from '@server/routes/request';
import staffRoutes from '@server/routes/staff';
import express from 'express';
// import { logger } from '@shared/utils/logger'; // Not used currently
import unifiedAuthRoutes from '@auth/routes/auth.routes';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT

// ✅ NEW v2.0: Enhanced feature flags management API
import featureFlagsRoutes from '@server/routes/feature-flags';

const router = express.Router();

// ============================================
// MAIN API ROUTES WITH ENHANCED ARCHITECTURE
// ============================================

// ✅ AUTH ROUTES - COMPLETELY OUTSIDE /api/* PREFIX (no rate limiting, no middleware)
router.use('/auth', unifiedAuthRoutes);

// ✅ API ROUTES - ALL routes under /api/* PREFIX get rate limiting + middleware
router.use('/api/analytics', analyticsRoutes);
router.use('/api/calls', callsRoutes);
router.use('/api/dashboard', dashboardRoutes);
router.use('/api/email', emailRoutes);
router.use('/api/health', healthRoutes);
router.use('/api/request', requestRoutes);
router.use('/api/staff', staffRoutes);

// ✅ NEW v2.0: Enhanced feature flags management API
router.use('/api/feature-flags', featureFlagsRoutes);

// ✅ PUBLIC ROUTES - For development and testing
router.use('/public', tempPublicRoutes);

export default router;
