// ============================================================================
// CORE MODULE: HEALTH ROUTES v3.0 - Advanced System Health Monitoring
// ============================================================================
// Comprehensive health checks for deployment, monitoring, and diagnostics
// Integrated with AdvancedHealthCheck system, ServiceContainer v2.0, FeatureFlags, and ModuleLifecycle

import { HealthController } from '@server/controllers/healthController';
import express, { type Request, Response } from 'express';

// ✅ v3.0: Import Advanced Health Check System
import {
  advancedHealthCheck,
  getSystemHealth,
} from '@server/shared/AdvancedHealthCheck';

// ✅ ENHANCED v2.0: Import modular architecture components
import { FeatureFlags } from '@server/shared/FeatureFlags';
import { ModuleLifecycleManager } from '@server/shared/ModuleLifecycleManager';
import { ServiceContainer } from '@server/shared/ServiceContainer';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// v3.0 ADVANCED HEALTH ENDPOINTS
// ============================================

/**
 * GET /api/core/health/system - Comprehensive system health with advanced monitoring
 */
router.get('/system', HealthController.getAdvancedSystemHealth);

/**
 * GET /api/core/health/module/:moduleName - Specific module health
 */
router.get('/module/:moduleName', HealthController.getModuleHealthStatus);

/**
 * GET /api/core/health/diagnostics - Health system diagnostics
 */
router.get('/diagnostics', HealthController.getHealthDiagnostics);

/**
 * GET /api/core/health/cascade - Cascade failure analysis
 */
router.get('/cascade', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🔗 [Health] Cascade failure analysis requested',
      'HealthRoutes'
    );

    const systemHealth = await getSystemHealth();

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: {
        cascadeFailures: systemHealth.cascadeFailures,
        failureCount: systemHealth.cascadeFailures.length,
        criticalFailures: systemHealth.cascadeFailures.filter(
          f => f.severity === 'critical'
        ),
        recommendations: systemHealth.recommendations.filter(
          r => r.type === 'reliability'
        ),
      },
      _metadata: {
        endpoint: 'cascade-analysis',
        version: '3.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Health] Cascade analysis failed', 'HealthRoutes', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to analyze cascade failures',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

/**
 * GET /api/core/health/recommendations - Health recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    logger.api('💡 [Health] Health recommendations requested', 'HealthRoutes');

    const systemHealth = await getSystemHealth();

    // Filter and categorize recommendations
    const recommendations = {
      urgent: systemHealth.recommendations.filter(r => r.priority === 'urgent'),
      high: systemHealth.recommendations.filter(r => r.priority === 'high'),
      medium: systemHealth.recommendations.filter(r => r.priority === 'medium'),
      low: systemHealth.recommendations.filter(r => r.priority === 'low'),
      byType: {
        performance: systemHealth.recommendations.filter(
          r => r.type === 'performance'
        ),
        reliability: systemHealth.recommendations.filter(
          r => r.type === 'reliability'
        ),
        maintenance: systemHealth.recommendations.filter(
          r => r.type === 'maintenance'
        ),
        scaling: systemHealth.recommendations.filter(r => r.type === 'scaling'),
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: {
        recommendations,
        summary: {
          totalRecommendations: systemHealth.recommendations.length,
          urgentCount: recommendations.urgent.length,
          highPriorityCount: recommendations.high.length,
          performanceIssues: recommendations.byType.performance.length,
          reliabilityIssues: recommendations.byType.reliability.length,
        },
        modules: systemHealth.modules
          .filter(m => m.status !== 'healthy')
          .map(m => ({
            name: m.name,
            status: m.status,
            issueCount: m.issues.length,
          })),
      },
      _metadata: {
        endpoint: 'health-recommendations',
        version: '3.0.0',
      },
    });
  } catch (error) {
    logger.error('❌ [Health] Recommendations failed', 'HealthRoutes', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to generate health recommendations',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

/**
 * GET /api/core/health/history/:moduleName - Module health history
 */
router.get('/history/:moduleName', async (req: Request, res: Response) => {
  try {
    const { moduleName } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    logger.api(
      `📈 [Health] Health history requested for: ${moduleName}`,
      'HealthRoutes'
    );

    const history = advancedHealthCheck.getModuleHealthHistory(
      moduleName,
      limit
    );

    if (history.length === 0) {
      return (res as any).status(404).json({
        success: false,
        error: `No health history found for module '${moduleName}'`,
        availableModules:
          advancedHealthCheck.getDiagnostics().registeredCheckers,
        version: '3.0.0',
      });
    }

    // Calculate trends
    const recentHistory = history.slice(-10);
    const avgResponseTime =
      recentHistory.reduce((sum, h) => sum + h.responseTime, 0) /
      recentHistory.length;
    const healthyCount = recentHistory.filter(
      h => h.status === 'healthy'
    ).length;
    const healthPercentage = (healthyCount / recentHistory.length) * 100;

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: {
        module: moduleName,
        history,
        trends: {
          averageResponseTime: Math.round(avgResponseTime),
          healthPercentage: Math.round(healthPercentage),
          totalChecks: history.length,
          recentChecks: recentHistory.length,
          currentStatus: history[history.length - 1]?.status || 'unknown',
        },
      },
      _metadata: {
        endpoint: 'health-history',
        version: '3.0.0',
        module: moduleName,
        limit,
      },
    });
  } catch (error) {
    logger.error('❌ [Health] Health history failed', 'HealthRoutes', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve health history',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

// ============================================
// v2.0 ENHANCED ENDPOINTS (MAINTAINED)
// ============================================

/**
 * GET /api/core/health - Basic health check (v2.0 compatible)
 */
router.get('/health', HealthController.getHealth);

/**
 * GET /api/core/health/detailed - Comprehensive health status
 */
router.get('/detailed', HealthController.getDetailedHealth);

/**
 * GET /api/core/health/database - Database health with connection metrics
 */
router.get('/database', HealthController.getDatabaseHealth);

/**
 * GET /api/core/health/architecture - Modular architecture health
 */
router.get('/architecture', HealthController.getArchitectureHealth);

/**
 * GET /api/core/health/services - External services health
 */
router.get('/services', HealthController.getServicesHealth);

/**
 * GET /api/core/health/ready - Readiness probe for Kubernetes
 */
router.get('/ready', HealthController.getReadiness);

/**
 * GET /api/core/health/live - Liveness probe for Kubernetes
 */
router.get('/live', HealthController.getLiveness);

/**
 * GET /api/core/health/modules - Module lifecycle health
 */
router.get('/modules', async (req: Request, res: Response) => {
  try {
    logger.api('🔄 [Health] Module lifecycle health requested', 'HealthRoutes');

    const moduleStatus = ModuleLifecycleManager.getModulesStatus();
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: {
        systemHealth,
        modules: moduleStatus,
        summary: {
          totalModules: systemHealth.totalModules,
          runningModules: systemHealth.runningModules,
          stoppedModules: systemHealth.stoppedModules,
          degradedModules: systemHealth.degradedModules,
          failedModules: systemHealth.failedModules,
        },
      },
      _metadata: {
        endpoint: 'module-lifecycle',
        version: '3.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Health] Module lifecycle health failed',
      'HealthRoutes',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve module lifecycle health',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

/**
 * GET /api/core/health/container - ServiceContainer status
 */
router.get('/container', async (req: Request, res: Response) => {
  try {
    logger.api('📦 [Health] ServiceContainer health requested', 'HealthRoutes');

    const containerHealth = ServiceContainer.getHealthStatus();

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: containerHealth,
      _metadata: {
        endpoint: 'service-container',
        version: '3.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Health] ServiceContainer health failed',
      'HealthRoutes',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve ServiceContainer health',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

/**
 * GET /api/core/health/features - FeatureFlags health
 */
router.get('/features', async (req: Request, res: Response) => {
  try {
    logger.api('🚩 [Health] FeatureFlags health requested', 'HealthRoutes');

    const featureFlagsHealth = FeatureFlags.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      data: featureFlagsHealth,
      _metadata: {
        endpoint: 'feature-flags',
        version: '3.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Health] FeatureFlags health failed',
      'HealthRoutes',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve FeatureFlags health',
      details: (error as Error).message,
      version: '3.0.0',
    });
  }
});

export default router;
