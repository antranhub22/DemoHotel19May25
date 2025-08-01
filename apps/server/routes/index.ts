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
import debugRoutes from '@server/routes/debug'; // ✅ NEW: Debug endpoints for production testing
import guestPublicRoutes from '@server/routes/guest-public'; // ✅ NEW: GUEST VOICE ASSISTANT
import monitoringRoutes from '@server/routes/monitoring';
import openaiRoutes from '@server/routes/openai'; // ✅ NEW: OpenAI processing endpoints
import requestRoutes from '@server/routes/request';
import staffRoutes from '@server/routes/staff';
import tempPublicRoutes from '@server/routes/temp-public'; // TEST DEPLOYMENT
import testOpenaiRoutes from '@server/routes/test-openai'; // ✅ DEBUG: Test OpenAI endpoints
import testWebhookRoutes from '@server/routes/test-webhook'; // ✅ DEBUG: Test webhook endpoints
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
router.use('/api/test-openai', testOpenaiRoutes); // ✅ DEBUG: Test OpenAI endpoints
router.use('/api/test-webhook', testWebhookRoutes); // ✅ DEBUG: Test webhook endpoints
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

// Development & Testing (NO AUTH REQUIRED)
router.use('/api/temp-public', tempPublicRoutes);
router.use('/api/debug', debugRoutes); // ✅ NEW: Debug endpoints for production testing

// ✅ DIRECT TEST ENDPOINTS (NO AUTH REQUIRED) - MUST come BEFORE dashboardRoutes
router.get('/api/test-direct', (req, res) => {
  res.json({
    success: true,
    message: 'Direct test endpoint working - NO AUTH REQUIRED',
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

// ✅ DIRECT DATABASE TEST: Test database connection (NO AUTH REQUIRED)
router.get('/api/test-db-direct', async (_req, res) => {
  try {
    const { Client } = await import('pg');
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL is not set',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      '🔍 Testing DATABASE_URL:',
      databaseUrl.substring(0, 30) + '...'
    );

    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test connection
    await client.connect();
    console.log('✅ Database connection successful');

    // Test simple query
    const result = await client.query('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Query successful:', result.rows[0]);

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('✅ Tables found:', tables);

    await client.end();

    res.json({
      success: true,
      message: 'Database connection and queries successful',
      data: {
        connected: true,
        databaseUrlSet: true,
        databaseUrlLength: databaseUrl.length,
        databaseUrlPrefix: databaseUrl.substring(0, 30) + '...',
        testQuery: result.rows[0],
        tables: tables,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Database connection failed',
      details: {
        code: error.code,
        message: error.message,
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ COMPLETELY BYPASS AUTH: Test endpoints without /api prefix
router.get('/test-db-bypass', async (_req, res) => {
  try {
    const { Client } = await import('pg');
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL is not set',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      '🔍 Testing DATABASE_URL:',
      databaseUrl.substring(0, 30) + '...'
    );

    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test connection
    await client.connect();
    console.log('✅ Database connection successful');

    // Test simple query
    const result = await client.query('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Query successful:', result.rows[0]);

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('✅ Tables found:', tables);

    await client.end();

    res.json({
      success: true,
      message: 'Database connection and queries successful (BYPASS AUTH)',
      data: {
        connected: true,
        databaseUrlSet: true,
        databaseUrlLength: databaseUrl.length,
        databaseUrlPrefix: databaseUrl.substring(0, 30) + '...',
        testQuery: result.rows[0],
        tables: tables,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Database connection failed',
      details: {
        code: error.code,
        message: error.message,
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ SPECIFIC API ROUTES (NO AUTH REQUIRED) - MUST come BEFORE dashboardRoutes
router.use('/api/health', healthRoutes);
router.use('/api/temp-public', tempPublicRoutes);
router.use('/api/debug', debugRoutes);

// System Management (v2.0) - MOVED BEFORE dashboard to avoid catch-all
router.use('/api/feature-flags', featureFlagsRoutes);
router.use('/api/module-lifecycle', moduleLifecycleRoutes);
router.use('/api/monitoring', monitoringRoutes);

// ✅ FIX: Dashboard routes with SPECIFIC path instead of catch-all
router.use('/api/dashboard', dashboardRoutes);

// ✅ FALLBACK: Handle remaining API requests without auth requirement
router.use('/api/*', (req, res, next) => {
  // Log unhandled API requests for debugging
  logger.debug(
    `🔍 [Fallback] Unhandled API request: ${req.method} ${req.path}`,
    'Router'
  );

  // If it's a health check or database related, allow it
  if (
    req.path.includes('/health') ||
    req.path.includes('/test-db') ||
    req.path.includes('/database') ||
    req.path.includes('/core/') ||
    req.path.includes('/modules/')
  ) {
    return next();
  }

  // For other unhandled API requests, return 404
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

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
