// ============================================================================
// CORE MODULE: MAIN ROUTER v2.0 - Essential System Functionality
// ============================================================================
// Central router for all core system functionality including health monitoring,
// testing utilities, and system administration endpoints
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import { logger } from '@shared/utils/logger';
import express from 'express';

// ✅ Import core module routes
import healthRoutes from './health.routes';
import utilsRoutes from './utils.routes';

// ✅ ENHANCED v2.0: Import modular architecture components
import { FeatureFlags, isFeatureEnabled } from '@server/shared/FeatureFlags';
import { ServiceContainer } from '@server/shared/ServiceContainer';

const router = express.Router();

// ============================================
// CORE MODULE INITIALIZATION
// ============================================

/**
 * Initialize Core Module with ServiceContainer registration
 */
const initializeCoreModule = () => {
  try {
    logger.debug(
      '🔧 [Core-Module] Initializing core module v2.0',
      'CoreModule'
    );

    // Register any core-specific services here if needed
    // Core module primarily uses existing ServiceContainer services

    logger.success(
      '✅ [Core-Module] Core module v2.0 initialized successfully',
      'CoreModule'
    );
  } catch (error) {
    logger.error(
      '❌ [Core-Module] Failed to initialize core module',
      'CoreModule',
      error
    );
  }
};

// Initialize on module load
initializeCoreModule();

// ============================================
// CORE MODULE MIDDLEWARE
// ============================================

/**
 * Core module middleware for request tracking and feature flag evaluation
 */
router.use((req, res, next) => {
  const startTime = Date.now();

  // Add module identifier to request
  (req as any).module = 'core-module';

  // Log module access
  logger.debug(
    `🔧 [Core-Module] Request: ${req.method} ${req.path}`,
    'CoreModule',
    {
      userAgent: req.headers['user-agent'],
      userId: req.headers['x-user-id'],
    }
  );

  // Add response time tracking
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.debug(
      `✅ [Core-Module] Response: ${res.statusCode} in ${responseTime}ms`,
      'CoreModule',
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime,
      }
    );
  });

  next();
});

// ============================================
// CORE MODULE ROUTE MOUNTING
// ============================================

/**
 * Health monitoring and system status routes
 * Mounted at: /api/core/health/*
 */
router.use('/', healthRoutes);

/**
 * Testing and utility routes
 * Mounted at: /api/core/utils/*
 */
router.use('/utils', utilsRoutes);

// ============================================
// CORE MODULE ROOT ENDPOINTS
// ============================================

/**
 * GET /api/core - Core module information and status
 */
router.get('/', (req, res) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    module: 'core-module',
  };

  const enableDetailedInfo = isFeatureEnabled('detailed-module-info', context);

  logger.api('📋 [Core-Module] Module info requested', 'CoreModule', {
    enableDetailedInfo,
  });

  let moduleInfo: any = {
    module: 'core-module',
    version: '2.0.0',
    status: 'operational',
    description: 'Essential system functionality and health monitoring',
    timestamp: new Date().toISOString(),
    routes: {
      health: '/api/core/health/*',
      utils: '/api/core/utils/*',
    },
    capabilities: [
      'System health monitoring',
      'ServiceContainer integration',
      'FeatureFlags evaluation',
      'Development utilities',
      'Kubernetes probe support',
    ],
  };

  if (enableDetailedInfo) {
    const containerHealth = ServiceContainer.getHealthStatus();
    const flagsStatus = FeatureFlags.getStatus();

    moduleInfo.systemStatus = {
      serviceContainer: {
        status: containerHealth.status,
        services: containerHealth.registeredServices,
      },
      featureFlags: {
        total: flagsStatus.summary?.totalFlags || 0,
        enabled: flagsStatus.summary?.enabledFlags || 0,
      },
      uptime: process.uptime(),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }

  (res as any).json({
    success: true,
    data: moduleInfo,
    metadata: {
      features: {
        detailedInfo: enableDetailedInfo,
      },
    },
  });
});

/**
 * GET /api/core/status - Quick status check for the core module
 */
router.get('/status', (req, res) => {
  logger.api('⚡ [Core-Module] Quick status check', 'CoreModule');

  const containerStatus = ServiceContainer.getHealthStatus().status;
  const overallStatus =
    containerStatus === 'healthy' ? 'operational' : 'degraded';

  (res as any).json({
    success: true,
    status: overallStatus,
    timestamp: new Date().toISOString(),
    module: 'core-module',
    version: '2.0.0',
    serviceContainer: containerStatus,
    uptime: process.uptime(),
  });
});

/**
 * GET /api/core/meta - Module metadata and API documentation
 */
router.get('/meta', (req, res) => {
  logger.api('📖 [Core-Module] Metadata requested', 'CoreModule');

  (res as any).json({
    module: 'core-module',
    version: '2.0.0',
    description: 'Essential system functionality and health monitoring',
    architecture: 'Modular v2.0',

    endpoints: {
      root: [
        'GET /api/core - Module information',
        'GET /api/core/status - Quick status check',
        'GET /api/core/meta - This metadata endpoint',
      ],
      health: [
        'GET /api/core/health - Basic health check',
        'GET /api/core/health/detailed - Comprehensive health',
        'GET /api/core/health/database - Database health',
        'GET /api/core/health/architecture - Architecture health',
        'GET /api/core/health/services - External services health',
        'GET /api/core/health/ready - Readiness probe',
        'GET /api/core/health/live - Liveness probe',
        'GET /api/core/health/modules - Module lifecycle health',
        'GET /api/core/health/container - ServiceContainer status',
        'GET /api/core/health/features - FeatureFlags health',
        'GET /api/core/health/system - Complete system overview',
      ],
      utils: [
        'GET /api/core/utils/ping - Simple ping test',
        'GET /api/core/utils/echo - Echo test (GET)',
        'POST /api/core/utils/echo - Echo test (POST)',
        'GET /api/core/utils/info - System information',
        'GET /api/core/utils/version - Version information',
        'GET /api/core/utils/test-error - Error handling test',
        'GET /api/core/utils/feature-test - Feature flag test',
        'GET /api/core/utils/service-test - ServiceContainer test',
        'GET /api/core/utils/legacy-ping - Legacy compatibility',
      ],
    },

    features: [
      'ServiceContainer v2.0 integration',
      'FeatureFlags v2.0 evaluation',
      'Module lifecycle monitoring',
      'Comprehensive health checks',
      'Development and testing utilities',
      'Kubernetes probe support',
      'System diagnostics and troubleshooting',
    ],

    featureFlags: [
      'detailed-module-info',
      'detailed-module-health',
      'container-diagnostics',
      'flag-diagnostics',
      'system-diagnostics',
      'detailed-ping',
      'system-info',
      'sensitive-system-info',
      'error-testing',
      'service-testing',
    ],

    dependencies: [
      'ServiceContainer v2.0',
      'FeatureFlags v2.0',
      'ModuleLifecycleManager',
      'HealthController',
      'Enhanced Logger',
    ],

    integration: {
      serviceContainer: '✅ Fully integrated',
      featureFlags: '✅ Context-aware evaluation',
      moduleLifecycle: '✅ Health monitoring',
      monitoring: '✅ Comprehensive logging',
      kubernetes: '✅ Probe support',
    },

    businessValue: [
      'System reliability monitoring',
      'Deployment verification',
      'Development productivity tools',
      'Operational visibility',
      'Troubleshooting capabilities',
    ],

    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Core module error handler
 */
router.use((error: any, req: any, res: any, next: any) => {
  logger.error('❌ [Core-Module] Unhandled error', 'CoreModule', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: 'Core module error',
    message: error.message,
    module: 'core-module',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

export default router;
