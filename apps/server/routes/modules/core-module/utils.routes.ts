// ============================================================================
// CORE MODULE: UTILITY ROUTES v2.0 - Testing & Development Utilities
// ============================================================================
// Development, testing, and utility endpoints for deployment and debugging
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced functionality

import express, { Request, Response } from 'express';

// ✅ ENHANCED v2.0: Import modular architecture components
import { FeatureFlags, isFeatureEnabled } from '@server/shared/FeatureFlags';
import { ServiceContainer } from '@server/shared/ServiceContainer';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// BASIC TESTING ENDPOINTS
// ============================================

/**
 * GET /api/core/utils/ping - Simple ping endpoint for deployment testing
 */
router.get('/ping', (req: Request, res: Response) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    module: 'core-module',
  };

  const enableDetailedPing = isFeatureEnabled('detailed-ping', context);

  logger.api('🏓 [Core-Utils] Ping request received', 'CoreModule', {
    enableDetailedPing,
    userAgent: req.headers['user-agent'],
  });

  let response: any = {
    success: true,
    message: 'Production deployment is working!',
    timestamp: new Date().toISOString(),
    deployment: 'Modular Architecture v2.0',
    server: 'Running',
    module: 'core-module',
    version: '2.0.0',
  };

  if (enableDetailedPing) {
    response.details = {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      pid: process.pid,
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      serviceContainer: {
        status: ServiceContainer.getHealthStatus().status,
        services: ServiceContainer.getRegisteredServices().length,
      },
    };
  }

  (res as any).json(response);
});

/**
 * GET /api/core/utils/echo - Echo endpoint for testing request/response flow
 */
router.get('/echo', (req: Request, res: Response) => {
  const startTime = Date.now();

  logger.api('📢 [Core-Utils] Echo request received', 'CoreModule', {
    query: req.query,
    headers: Object.keys(req.headers),
  });

  const responseTime = Date.now() - startTime;

  (res as any).json({
    success: true,
    message: 'Echo endpoint working correctly',
    timestamp: new Date().toISOString(),
    module: 'core-module',
    version: '2.0.0',
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      },
      responseTime,
    },
  });
});

/**
 * POST /api/core/utils/echo - Echo endpoint for testing POST requests
 */
router.post('/echo', (req: Request, res: Response) => {
  const startTime = Date.now();

  logger.api('📢 [Core-Utils] POST echo request received', 'CoreModule', {
    bodySize: JSON.stringify(req.body).length,
    contentType: req.headers['content-type'],
  });

  const responseTime = Date.now() - startTime;

  (res as any).json({
    success: true,
    message: 'POST echo endpoint working correctly',
    timestamp: new Date().toISOString(),
    module: 'core-module',
    version: '2.0.0',
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: {
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
      },
      responseTime,
    },
  });
});

// ============================================
// SYSTEM INFORMATION ENDPOINTS
// ============================================

/**
 * GET /api/core/utils/info - System information for debugging
 */
router.get('/info', (req: Request, res: Response) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    module: 'core-module',
  };

  const enableSystemInfo = isFeatureEnabled('system-info', context);
  const enableSensitiveInfo = isFeatureEnabled(
    'sensitive-system-info',
    context
  );

  if (!enableSystemInfo) {
    (res as any).status(403).json({
      success: false,
      error: 'System information access disabled',
      code: 'FEATURE_DISABLED',
      module: 'core-module',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.api('ℹ️ [Core-Utils] System info requested', 'CoreModule', {
    enableSensitiveInfo,
  });

  let systemInfo: any = {
    server: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      pid: process.pid,
    },
    application: {
      module: 'core-module',
      version: '2.0.0',
      architecture: 'Modular v2.0',
      environment: process.env.NODE_ENV || 'unknown',
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      arrayBuffers: Math.round(
        process.memoryUsage().arrayBuffers / 1024 / 1024
      ),
    },
    serviceContainer: {
      status: ServiceContainer.getHealthStatus().status,
      version: '2.0.0',
      registeredServices: ServiceContainer.getRegisteredServices().length,
      instantiatedServices:
        ServiceContainer.getHealthStatus().instantiatedServices,
    },
  };

  if (enableSensitiveInfo) {
    systemInfo.environment = {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasVapiKey: !!process.env.VITE_VAPI_PUBLIC_KEY,
      hasOpenAiKey: !!process.env.VITE_OPENAI_API_KEY,
      hasGooglePlacesKey: !!process.env.GOOGLE_PLACES_API_KEY,
    };
    systemInfo.performance = {
      cpuUsage: process.cpuUsage(),
      resourceUsage: process.resourceUsage ? process.resourceUsage() : 'N/A',
    };
  }

  (res as any).json({
    success: true,
    timestamp: new Date().toISOString(),
    module: 'core-module',
    data: systemInfo,
    metadata: {
      features: {
        systemInfo: enableSystemInfo,
        sensitiveInfo: enableSensitiveInfo,
      },
    },
  });
});

/**
 * GET /api/core/utils/version - Application version and build information
 */
router.get('/version', (req: Request, res: Response) => {
  logger.api('🏷️ [Core-Utils] Version info requested', 'CoreModule');

  (res as any).json({
    success: true,
    timestamp: new Date().toISOString(),
    version: {
      application: '2.0.0',
      module: 'core-module',
      architecture: 'Modular Architecture v2.0',
      serviceContainer: '2.0.0',
      featureFlags: '2.0.0',
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
    },
    build: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      commit: process.env.GIT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
    },
    features: [
      'ServiceContainer v2.0',
      'FeatureFlags v2.0',
      'ModuleLifecycle v2.0',
      'Enhanced Logging v2.0',
      'Comprehensive Health Monitoring',
      'Kubernetes Probe Support',
    ],
  });
});

// ============================================
// DEVELOPMENT & TESTING UTILITIES
// ============================================

/**
 * GET /api/core/utils/test-error - Test error handling and logging
 */
router.get('/test-error', (req: Request, res: Response) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    module: 'core-module',
  };

  const enableErrorTesting = isFeatureEnabled('error-testing', context);

  if (!enableErrorTesting) {
    (res as any).status(403).json({
      success: false,
      error: 'Error testing disabled',
      code: 'FEATURE_DISABLED',
      module: 'core-module',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const errorType = (req.query.type as string) || 'generic';

  logger.api('⚠️ [Core-Utils] Test error triggered', 'CoreModule', {
    errorType,
    userAgent: req.headers['user-agent'],
  });

  try {
    switch (errorType) {
      case 'validation':
        throw new Error(
          'Test validation error - this is intentional for testing'
        );
      case 'database':
        throw new Error(
          'Test database error - this is intentional for testing'
        );
      case 'service':
        throw new Error('Test service error - this is intentional for testing');
      default:
        throw new Error('Test generic error - this is intentional for testing');
    }
  } catch (error) {
    logger.error(
      `❌ [Core-Utils] Test error occurred: ${errorType}`,
      'CoreModule',
      error
    );

    (res as any).status(500).json({
      success: false,
      error: 'Test error occurred successfully',
      type: errorType,
      message: error instanceof Error ? error.message : 'Unknown error',
      module: 'core-module',
      timestamp: new Date().toISOString(),
      note: 'This is a test error for development purposes',
    });
  }
});

/**
 * GET /api/core/utils/feature-test - Test feature flag evaluation
 */
router.get('/feature-test', (req: Request, res: Response) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    tenantId: req.query.tenantId as string,
    module: 'core-module',
  };

  const flagName = (req.query.flag as string) || 'test-flag';

  logger.api('🚩 [Core-Utils] Feature flag test requested', 'CoreModule', {
    flagName,
    context: Object.keys(context),
  });

  const isEnabled = isFeatureEnabled(flagName, context);
  const flagsStatus = FeatureFlags.getStatus();

  (res as any).json({
    success: true,
    timestamp: new Date().toISOString(),
    module: 'core-module',
    flagTest: {
      flagName,
      isEnabled,
      context,
    },
    systemFlags: {
      totalFlags: flagsStatus.summary?.totalFlags || 0,
      enabledFlags: flagsStatus.summary?.enabledFlags || 0,
      moduleFlags: flagsStatus.summary?.moduleFlags || 0,
    },
    note: 'Use ?flag=flag-name&tenantId=tenant-id&userId=user-id to test specific flags',
  });
});

/**
 * GET /api/core/utils/service-test - Test ServiceContainer functionality
 */
router.get('/service-test', (req: Request, res: Response) => {
  const context = {
    userId: req.headers['x-user-id'] as string,
    module: 'core-module',
  };

  const enableServiceTesting = isFeatureEnabled('service-testing', context);

  if (!enableServiceTesting) {
    (res as any).status(403).json({
      success: false,
      error: 'Service testing disabled',
      code: 'FEATURE_DISABLED',
      module: 'core-module',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.api('🔧 [Core-Utils] Service container test requested', 'CoreModule');

  const containerHealth = ServiceContainer.getHealthStatus();
  const registeredServices = ServiceContainer.getRegisteredServices();
  const dependencyGraph = ServiceContainer.getDependencyGraph();

  (res as any).json({
    success: true,
    timestamp: new Date().toISOString(),
    module: 'core-module',
    serviceContainer: {
      status: containerHealth.status,
      version: '2.0.0',
      registeredServices: registeredServices.length,
      instantiatedServices: containerHealth.instantiatedServices,
      services: registeredServices,
      dependencyGraph,
      metrics: containerHealth.metrics,
    },
    note: 'ServiceContainer v2.0 functionality test completed',
  });
});

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * GET /api/core/utils/legacy-ping - Legacy ping endpoint for backward compatibility
 */
router.get('/legacy-ping', (req: Request, res: Response) => {
  logger.api('🔄 [Core-Utils] Legacy ping request', 'CoreModule');

  (res as any).json({
    success: true,
    message: 'Legacy endpoint working - consider upgrading to /ping',
    timestamp: new Date().toISOString(),
    server: 'Running',
    note: 'This is a legacy endpoint. Use /api/core/utils/ping for enhanced features.',
  });
});

// ============================================
// MODULE METADATA
// ============================================

router.get('/meta', (req: Request, res: Response) => {
  (res as any).json({
    module: 'core-utils',
    version: '2.0.0',
    description: 'Testing, development, and utility endpoints',
    endpoints: [
      'GET /ping - Simple ping test',
      'GET /echo - Echo test (GET)',
      'POST /echo - Echo test (POST)',
      'GET /info - System information',
      'GET /version - Version information',
      'GET /test-error - Error handling test',
      'GET /feature-test - Feature flag test',
      'GET /service-test - ServiceContainer test',
      'GET /legacy-ping - Legacy compatibility',
    ],
    features: [
      'ServiceContainer integration',
      'FeatureFlags evaluation',
      'Error testing capabilities',
      'System diagnostics',
      'Development utilities',
    ],
    featureFlags: [
      'detailed-ping',
      'system-info',
      'sensitive-system-info',
      'error-testing',
      'service-testing',
    ],
    dependencies: ['ServiceContainer', 'FeatureFlags'],
    timestamp: new Date().toISOString(),
  });
});

export default router;
