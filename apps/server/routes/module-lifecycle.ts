// ============================================
// MODULE LIFECYCLE MANAGEMENT API - v2.0
// ============================================
// REST API for monitoring and managing module lifecycle
// Provides comprehensive module health, status, and control capabilities

import express, { type Request, Response } from 'express';
import { ModuleLifecycleManager } from '@server/shared/ModuleLifecycleManager';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// MODULE STATUS & MONITORING ENDPOINTS
// ============================================

/**
 * GET /api/module-lifecycle/status - Get all modules status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const modulesStatus = ModuleLifecycleManager.getModulesStatus();
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        systemHealth,
        modules: modulesStatus,
        summary: {
          totalModules: systemHealth.totalModules,
          runningModules: systemHealth.runningModules,
          degradedModules: systemHealth.degradedModules,
          failedModules: systemHealth.failedModules,
          stoppedModules: systemHealth.stoppedModules,
          overallStatus: systemHealth.overallStatus,
        },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to get status',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve module status',
      details: error.message,
    });
  }
});

/**
 * GET /api/module-lifecycle/diagnostics - Get comprehensive diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    const diagnostics = ModuleLifecycleManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to get diagnostics',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve diagnostics',
      details: error.message,
    });
  }
});

/**
 * GET /api/module-lifecycle/health - Get system health overview
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    const httpStatus =
      systemHealth.overallStatus === 'critical'
        ? 503
        : systemHealth.overallStatus === 'degraded'
          ? 200
          : 200;

    (res as any).status(httpStatus).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      status: systemHealth.overallStatus,
      health: systemHealth,
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to get health',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve system health',
      details: error.message,
    });
  }
});

/**
 * GET /api/module-lifecycle/modules/:moduleName - Get specific module status
 */
router.get('/modules/:moduleName', async (req: Request, res: Response) => {
  try {
    const { moduleName } = req.params;
    const moduleStatus = ModuleLifecycleManager.getModuleStatus(moduleName);

    if (!moduleStatus) {
      (res as any).status(404).json({
        success: false,
        error: `Module '${moduleName}' not found`,
      });
      return;
    }

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        module: moduleName,
        status: moduleStatus,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to get module status',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve module status',
      details: error.message,
    });
  }
});

// ============================================
// MODULE HEALTH CHECK ENDPOINTS
// ============================================

/**
 * POST /api/module-lifecycle/modules/:moduleName/health-check - Trigger health check
 */
router.post(
  '/modules/:moduleName/health-check',
  async (req: Request, res: Response) => {
    try {
      const { moduleName } = req.params;
      const moduleStatus = ModuleLifecycleManager.getModuleStatus(moduleName);

      if (!moduleStatus) {
        (res as any).status(404).json({
          success: false,
          error: `Module '${moduleName}' not found`,
        });
        return;
      }

      const isHealthy =
        await ModuleLifecycleManager.performHealthCheck(moduleName);
      const updatedStatus = ModuleLifecycleManager.getModuleStatus(moduleName);

      logger.info(
        `🔍 [ModuleLifecycle API] Manual health check triggered for: ${moduleName}`,
        'ModuleLifecycleAPI',
        { moduleName, isHealthy, state: updatedStatus?.state }
      );

      (res as any).status(200).json({
        success: true,
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
          module: moduleName,
          healthy: isHealthy,
          status: updatedStatus,
        },
      });
    } catch (error) {
      logger.error(
        '❌ [ModuleLifecycle API] Health check failed',
        'ModuleLifecycleAPI',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to perform health check',
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/module-lifecycle/health-check-all - Trigger health check for all modules
 */
router.post('/health-check-all', async (req: Request, res: Response) => {
  try {
    const modulesStatus = ModuleLifecycleManager.getModulesStatus();
    const results = {};

    for (const moduleName of Object.keys(modulesStatus)) {
      try {
        const isHealthy =
          await ModuleLifecycleManager.performHealthCheck(moduleName);
        results[moduleName] = {
          healthy: isHealthy,
          checked: true,
        };
      } catch (error) {
        results[moduleName] = {
          healthy: false,
          checked: false,
          error: error.message,
        };
      }
    }

    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    logger.info(
      '🔍 [ModuleLifecycle API] System-wide health check completed',
      'ModuleLifecycleAPI',
      {
        totalModules: Object.keys(results).length,
        overallStatus: systemHealth.overallStatus,
      }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        results,
        systemHealth,
        summary: {
          totalChecked: Object.keys(results).length,
          healthyModules: Object.values(results).filter((r: any) => r.healthy)
            .length,
          unhealthyModules: Object.values(results).filter(
            (r: any) => !r.healthy
          ).length,
        },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] System health check failed',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to perform system health check',
      details: error.message,
    });
  }
});

// ============================================
// MODULE LIFECYCLE CONTROL ENDPOINTS
// ============================================

/**
 * POST /api/module-lifecycle/start-all - Start all modules
 */
router.post('/start-all', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    logger.info(
      '🚀 [ModuleLifecycle API] Starting all modules...',
      'ModuleLifecycleAPI'
    );

    await ModuleLifecycleManager.startAllModules();

    const endTime = Date.now();
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    logger.success(
      `✅ [ModuleLifecycle API] All modules startup completed (${endTime - startTime}ms)`,
      'ModuleLifecycleAPI',
      {
        duration: endTime - startTime,
        overallStatus: systemHealth.overallStatus,
      }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: 'Module startup sequence completed',
      data: {
        duration: endTime - startTime,
        systemHealth,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to start modules',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to start modules',
      details: error.message,
    });
  }
});

/**
 * POST /api/module-lifecycle/stop-all - Stop all modules
 */
router.post('/stop-all', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    logger.info(
      '🛑 [ModuleLifecycle API] Stopping all modules...',
      'ModuleLifecycleAPI'
    );

    await ModuleLifecycleManager.stopAllModules();

    const endTime = Date.now();
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    logger.success(
      `✅ [ModuleLifecycle API] All modules shutdown completed (${endTime - startTime}ms)`,
      'ModuleLifecycleAPI',
      { duration: endTime - startTime }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: 'Module shutdown sequence completed',
      data: {
        duration: endTime - startTime,
        systemHealth,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to stop modules',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to stop modules',
      details: error.message,
    });
  }
});

/**
 * POST /api/module-lifecycle/modules/:moduleName/start - Start specific module
 */
router.post(
  '/modules/:moduleName/start',
  async (req: Request, res: Response) => {
    try {
      const { moduleName } = req.params;
      const startTime = Date.now();

      logger.info(
        `🚀 [ModuleLifecycle API] Starting module: ${moduleName}`,
        'ModuleLifecycleAPI'
      );

      const result = await ModuleLifecycleManager.startModule(moduleName);

      const endTime = Date.now();
      const moduleStatus = ModuleLifecycleManager.getModuleStatus(moduleName);

      logger.success(
        `✅ [ModuleLifecycle API] Module started: ${moduleName} (${endTime - startTime}ms)`,
        'ModuleLifecycleAPI',
        {
          moduleName,
          duration: endTime - startTime,
          state: moduleStatus?.state,
        }
      );

      (res as any).status(200).json({
        success: true,
        version: '2.0',
        timestamp: new Date().toISOString(),
        message: `Module '${moduleName}' started successfully`,
        data: {
          module: moduleName,
          duration: endTime - startTime,
          result,
          status: moduleStatus,
        },
      });
    } catch (error) {
      logger.error(
        `❌ [ModuleLifecycle API] Failed to start module: ${req.params.moduleName}`,
        'ModuleLifecycleAPI',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: `Failed to start module '${req.params.moduleName}'`,
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/module-lifecycle/modules/:moduleName/stop - Stop specific module
 */
router.post(
  '/modules/:moduleName/stop',
  async (req: Request, res: Response) => {
    try {
      const { moduleName } = req.params;
      const startTime = Date.now();

      logger.info(
        `🛑 [ModuleLifecycle API] Stopping module: ${moduleName}`,
        'ModuleLifecycleAPI'
      );

      const result = await ModuleLifecycleManager.stopModule(moduleName);

      const endTime = Date.now();
      const moduleStatus = ModuleLifecycleManager.getModuleStatus(moduleName);

      logger.success(
        `✅ [ModuleLifecycle API] Module stopped: ${moduleName} (${endTime - startTime}ms)`,
        'ModuleLifecycleAPI',
        {
          moduleName,
          duration: endTime - startTime,
          state: moduleStatus?.state,
        }
      );

      (res as any).status(200).json({
        success: true,
        version: '2.0',
        timestamp: new Date().toISOString(),
        message: `Module '${moduleName}' stopped successfully`,
        data: {
          module: moduleName,
          duration: endTime - startTime,
          result,
          status: moduleStatus,
        },
      });
    } catch (error) {
      logger.error(
        `❌ [ModuleLifecycle API] Failed to stop module: ${req.params.moduleName}`,
        'ModuleLifecycleAPI',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: `Failed to stop module '${req.params.moduleName}'`,
        details: error.message,
      });
    }
  }
);

// ============================================
// MODULE METRICS & ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /api/module-lifecycle/metrics - Get module performance metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const modulesStatus = ModuleLifecycleManager.getModulesStatus();
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    const metrics = {
      system: {
        overallStatus: systemHealth.overallStatus,
        totalModules: systemHealth.totalModules,
        statusDistribution: {
          running: systemHealth.runningModules,
          degraded: systemHealth.degradedModules,
          failed: systemHealth.failedModules,
          stopped: systemHealth.stoppedModules,
        },
      },
      modules: Object.entries(modulesStatus).map(([name, status]) => ({
        name,
        state: status.state,
        uptime: status.startedAt ? Date.now() - status.startedAt.getTime() : 0,
        metrics: status.metrics,
        healthCheckSuccessRate: status.metrics.healthCheckSuccessRate,
        lastFailure: status.lastFailure,
      })),
      aggregated: {
        averageStartupTime:
          Object.values(modulesStatus)
            .map(s => s.metrics.startupTime)
            .filter(t => t !== undefined)
            .reduce((a, b) => a + b, 0) /
            Object.values(modulesStatus).filter(s => s.metrics.startupTime)
              .length || 0,

        totalHealthChecks: Object.values(modulesStatus).reduce(
          (sum, s) => sum + s.metrics.totalHealthChecks,
          0
        ),

        totalFailures: Object.values(modulesStatus).reduce(
          (sum, s) => sum + s.metrics.totalFailures,
          0
        ),
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle API] Failed to get metrics',
      'ModuleLifecycleAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
});

export default router;
