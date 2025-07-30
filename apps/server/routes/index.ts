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
import apiRoutes from '@server/routes/api'; // ⚠️ TO BE DEPRECATED - endpoints moved to specific routes
import callsRoutes from '@server/routes/calls';
import dashboardRoutes from '@server/routes/dashboard';
import emailsRoutes from '@server/routes/emails'; // ✅ RENAMED: email.ts → emails.ts (RESTful)
import featureFlagsRoutes from '@server/routes/feature-flags';
import healthRoutes from '@server/routes/health';
import moduleLifecycleRoutes from '@server/routes/module-lifecycle';
import adminModuleRoutes from '@server/routes/modules/admin-module';
import analyticsModuleRoutes from '@server/routes/modules/analytics-module';
import coreModuleRoutes from '@server/routes/modules/core-module';
import hotelModuleRoutes from '@server/routes/modules/hotel-module';
import voiceModuleRoutes from '@server/routes/modules/voice-module';
import summariesRoutes from '@server/routes/summaries'; // ✅ NEW: RESTful summaries
import translationsRoutes from '@server/routes/translations'; // ✅ NEW: RESTful translations

// ✅ NEW v2.2: ADVANCED FILTERING & SORTING API
import advancedCallsRoutes from './advanced-calls'; // ✅ NEW: Advanced filtering API

// ✅ NEW v2.3: API VERSIONING SYSTEM
import versionedApiRoutes from './versioned-api'; // ✅ NEW: API versioning & migration

// ✅ LEGACY: Keep existing imports for backward compatibility
import guestPublicRoutes from '@server/routes/guest-public'; // ✅ NEW: GUEST VOICE ASSISTANT
import monitoringRoutes from '@server/routes/monitoring';
import openaiRoutes from '@server/routes/openai'; // ✅ NEW: OpenAI processing endpoints
import requestRoutes from '@server/routes/request';
import staffRoutes from '@server/routes/staff';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT
import transcriptRoutes from '@server/routes/transcripts'; // ✅ FIX: Add transcript routes
import vapiConfigRoutes from '@server/routes/vapi-config'; // ✅ NEW: VAPI Configuration for language-specific settings
import vapiProxyRoutes from '@server/routes/vapi-proxy'; // ✅ NEW: VAPI CORS BYPASS
import webhookRoutes from '@server/routes/webhook'; // ✅ NEW: VAPI Webhook endpoints

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
// RESTful API ROUTES - GUEST JOURNEY PRIORITY
// ============================================

logger.debug('📡 [Router] Setting up RESTful API routes...', 'MainRouter');

// ✅ GUEST JOURNEY APIs (High Priority - Standardized)
router.use('/api/guest', guestPublicRoutes); // Guest authentication & requests
router.use('/api/transcripts', transcriptRoutes); // Voice transcripts
router.use('/api/calls', callsRoutes); // Call management
router.use('/api/summaries', summariesRoutes); // ✅ NEW: Call summaries (RESTful)
router.use('/api/emails', emailsRoutes); // ✅ RENAMED: Email services (RESTful)
router.use('/api/translations', translationsRoutes); // ✅ NEW: Translation services (RESTful)

// ✅ NEW v2.2: ADVANCED API ROUTES WITH ENHANCED FILTERING
logger.debug(
  '🚀 [Router] Setting up Advanced API v2.2 routes...',
  'MainRouter'
);
router.use('/api/v2/calls', advancedCallsRoutes); // ✅ NEW: Advanced calls with complex filtering & sorting

// ✅ NEW v2.3: API VERSIONING & MIGRATION SYSTEM
logger.debug(
  '🔧 [Router] Setting up API Versioning v2.3 routes...',
  'MainRouter'
);
router.use('/api', versionedApiRoutes); // ✅ NEW: Version management, migration utilities, compatibility

// ✅ VOICE ASSISTANT APIs
router.use('/api/vapi', vapiConfigRoutes); // Vapi configuration by language
router.use('/api/vapi-proxy', vapiProxyRoutes); // Vapi CORS bypass
router.use('/api/openai', openaiRoutes); // ✅ NEW: OpenAI processing endpoints
router.use('/api/webhook', webhookRoutes); // ✅ NEW: VAPI Webhook endpoints

// ============================================
// LEGACY ROUTES (v1.0-v2.0) - Backward Compatible
// ============================================

logger.debug('📡 [Router] Setting up legacy API routes...', 'MainRouter');

// ⚠️ DEPRECATED: General API routes - endpoints moved to specific routes
// Keep for backward compatibility during transition
router.use('/api', apiRoutes);

// Authentication (Unified System)
router.use('/api/auth', unifiedAuthRoutes);
router.use('/api/staff', staffRoutes);

// Business Logic
router.use('/api/request', requestRoutes);

// Analytics & Reporting
router.use('/api/analytics', analyticsRoutes);

// System Routes (NO AUTH REQUIRED - must come before dashboard routes)
router.use('/api/health', healthRoutes);

// Dashboard routes (apply auth globally) - MUST come after specific routes
router.use('/api', dashboardRoutes);

// System Management (v2.0)
router.use('/api/feature-flags', featureFlagsRoutes);
router.use('/api/module-lifecycle', moduleLifecycleRoutes);
router.use('/api/monitoring', monitoringRoutes);

// Development & Testing
router.use('/api/temp-public', tempPublicRoutes);

// ============================================
// ROUTE REGISTRATION SUCCESS
// ============================================

logger.debug(
  '✅ [Router v3.0] All routes registered successfully',
  'MainRouter'
);
logger.debug('📊 [Router] Route structure:', 'MainRouter', {
  modular: ['admin', 'analytics-module', 'core', 'hotel', 'voice'],
  guestJourney: [
    'guest',
    'transcripts',
    'calls',
    'summaries',
    'emails',
    'translations',
  ], // ✅ NEW
  advancedV2: ['v2/calls'], // ✅ NEW v2.2
  versioning: ['versions', 'version/*', 'migration/*', 'compatibility/*'], // ✅ NEW v2.3
  voiceAssistant: ['vapi', 'vapi-proxy'], // ✅ NEW
  legacy: ['api', 'auth', 'request', 'analytics', 'health'],
  system: ['feature-flags', 'module-lifecycle', 'monitoring'],
});

export default router;
