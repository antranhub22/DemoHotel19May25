// ============================================
// MAIN API ROUTER v3.0 - MODULAR ARCHITECTURE
// ============================================
// Enhanced with modular route organization aligned with business domains
// Backward compatible with existing API structure
// Integrated with ServiceContainer v2.0, FeatureFlags v2.0, and ModuleLifecycle

import express from 'express';

// ✅ NEW v3.0: MODULAR ROUTE IMPORTS - Business Domain Aligned
import unifiedAuthRoutes from '@auth/routes/auth.routes';
import analyticsRoutes from '@server/routes/analytics';
import apiRoutes from '@server/routes/api'; // CRITICAL FIX: Main API routes
import callsRoutes from '@server/routes/calls';
import dashboardRoutes from '@server/routes/dashboard';
import emailRoutes from '@server/routes/email';
import featureFlagsRoutes from '@server/routes/feature-flags';
import healthRoutes from '@server/routes/health';
import moduleLifecycleRoutes from '@server/routes/module-lifecycle';
import adminModuleRoutes from '@server/routes/modules/admin-module';
import analyticsModuleRoutes from '@server/routes/modules/analytics-module';
import coreModuleRoutes from '@server/routes/modules/core-module';
import hotelModuleRoutes from '@server/routes/modules/hotel-module';
import voiceModuleRoutes from '@server/routes/modules/voice-module';

// ✅ LEGACY: Keep existing imports for backward compatibility
import guestPublicRoutes from '@server/routes/guest-public'; // ✅ NEW: GUEST VOICE ASSISTANT
import monitoringRoutes from '@server/routes/monitoring';
import requestRoutes from '@server/routes/request';
import staffRoutes from '@server/routes/staff';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT
import transcriptRoutes from '@server/routes/transcripts'; // ✅ FIX: Add transcript routes
import vapiProxyRoutes from '@server/routes/vapi-proxy'; // ✅ NEW: VAPI CORS BYPASS

// ✅ v2.0 routes now integrated into admin module, but kept for direct access
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// v3.0 MODULAR ARCHITECTURE ROUTES
// ============================================

logger.debug(
  '🏗️ [Router v3.0] Initializing modular route architecture',
  'MainRouter'
);

// Business domain modules (v3.0)
router.use('/api/admin', adminModuleRoutes);
router.use('/api/analytics-module', analyticsModuleRoutes);
router.use('/api/core', coreModuleRoutes);
router.use('/api/hotel', hotelModuleRoutes);
router.use('/api/voice', voiceModuleRoutes);

// ============================================
// LEGACY ROUTES (v1.0-v2.0) - Backward Compatible
// ============================================

logger.debug('📡 [Router] Setting up legacy API routes...', 'MainRouter');

// Core API routes
router.use('/api', apiRoutes); // ✅ CRITICAL: Main API functionality

// Authentication (Unified System)
router.use('/api/auth', unifiedAuthRoutes);
router.use('/api/staff', staffRoutes);

// Business Logic
router.use('/api/calls', callsRoutes);
router.use('/api/request', requestRoutes);
router.use('/api/email', emailRoutes);
router.use('/api', dashboardRoutes);

// ✅ FIX: Add transcript routes
router.use('/api', transcriptRoutes);

// Analytics & Reporting
router.use('/api/analytics', analyticsRoutes);

// System Routes
router.use('/api/health', healthRoutes);

// ✅ NEW: Vapi Proxy for CORS bypass
router.use('/api/vapi-proxy', vapiProxyRoutes);

// System Management (v2.0)
router.use('/api/feature-flags', featureFlagsRoutes);
router.use('/api/module-lifecycle', moduleLifecycleRoutes);
router.use('/api/monitoring', monitoringRoutes);

// Development & Testing
router.use('/api/temp-public', tempPublicRoutes);

// ✅ NEW: Guest endpoints for voice assistant (no auth required)
router.use('/api/guest', guestPublicRoutes);

// ============================================
// ROUTE REGISTRATION SUCCESS
// ============================================

logger.debug('✅ [Router v3.0] All routes registered successfully', 'MainRouter');
logger.debug('📊 [Router] Route structure:', 'MainRouter', {
  modular: ['admin', 'analytics-module', 'core', 'hotel', 'voice'],
  legacy: ['api', 'auth', 'calls', 'request', 'analytics', 'health'],
  system: ['feature-flags', 'module-lifecycle', 'monitoring'],
  new: ['vapi-proxy'], // ✅ Added
});

export default router;
