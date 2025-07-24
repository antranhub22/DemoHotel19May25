import analyticsRoutes from '@server/routes/analytics';
import apiRoutes from '@server/routes/api';
import callsRoutes from '@server/routes/calls';
import dashboardRoutes from '@server/routes/dashboard';
import healthRoutes from '@server/routes/health';
import requestRoutes from '@server/routes/request';
import express from 'express';
// import emailRoutes from '@server/routes/email'; // Temporarily disabled due to signature issues
import staffRoutes from '@server/routes/staff';
// import { logger } from '@shared/utils/logger'; // Not used currently
import unifiedAuthRoutes from '@auth/routes/auth.routes';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT
import transcriptsRoutes from '@server/routes/transcripts';

const router = express.Router();

// ✅ PRIORITY: Public routes first (no middleware)
router.use('/api/public', tempPublicRoutes);

// ✅ AUTH ROUTES - COMPLETELY OUTSIDE /api/* PREFIX (no rate limiting, no middleware)
router.use('/auth', unifiedAuthRoutes);

// Mount all route modules (protected routes)
router.use('/api', apiRoutes);
// Note: orders.ts deleted - consolidated into request.ts
router.use('/api', callsRoutes);
router.use('/api', analyticsRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', healthRoutes);
router.use('/api', requestRoutes);
router.use('/api', transcriptsRoutes);
// router.use('/api', emailRoutes); // Temporarily disabled
router.use('/api', staffRoutes); // ✅ EMERGENCY FIX: Enable auth routes

export default router;
