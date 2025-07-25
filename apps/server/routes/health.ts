// ============================================================================
// Health Check and Monitoring Endpoints
// Provides comprehensive health checks for deployment and monitoring
// ============================================================================

import express, { type Request, Response } from 'express';
import { HealthController } from '@server/controllers/healthController';

// ✅ ENHANCED: Import modular architecture health check v2.0
import { getArchitectureHealth } from '@server/shared';
import { ServiceContainer } from '@server/shared/ServiceContainer';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// EXISTING HEALTH ENDPOINTS (unchanged)
// ============================================

// Basic health check
router.get('/health', HealthController.getHealth);

// Detailed health check
router.get('/health/detailed', HealthController.getDetailedHealth);

// Database health check
router.get('/health/database', HealthController.getDatabaseHealth);

// ============================================
// ENHANCED: MODULAR ARCHITECTURE HEALTH ENDPOINT V2.0
// ============================================

/**
 * GET /api/health/architecture - Enhanced architecture health with ServiceContainer v2.0
 */
router.get('/architecture', async (_req: Request, res: Response) => {
  try {
    logger.api('🏗️ [Health] Architecture health requested', 'Health');

    // ✅ ENHANCED: Get architecture health with await
    const architectureHealth = await getArchitectureHealth();

    // ✅ ENHANCED: Get ServiceContainer v2.0 health
    const containerHealth = ServiceContainer.getHealthStatus();
    const dependencyGraph = ServiceContainer.getDependencyGraph();
    const serviceHealth = await ServiceContainer.healthCheck();

    // Determine overall health status
    const overallStatus = architectureHealth.overall.status;

    (res as any).status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '3.0',
      architecture: {
        ...architectureHealth,
        // ✅ ENHANCED: Add ServiceContainer v2.0 details
        services: {
          ...architectureHealth.services,
          container: containerHealth,
          health: serviceHealth,
          dependencyGraph,
        },
      },
      summary: {
        overallStatus: architectureHealth.overall.status,
        servicesHealthy: Object.values(architectureHealth.services).filter(
          (s: any) => s.status === 'healthy'
        ).length,
        totalServices: Object.keys(architectureHealth.services).length,
        registeredServices: containerHealth.registeredServices,
        instantiatedServices: containerHealth.instantiatedServices,
        healthyServices: Object.values(serviceHealth).filter(Boolean).length,
        containerVersion: containerHealth.version,
        advancedHealthEnabled: !!architectureHealth.advancedHealth?.initialized,
      },
    });
  } catch (error) {
    logger.error('❌ [Health] Architecture health failed', 'Health', error);
    (res as any).status(500).json({
      status: 'unhealthy',
      error: 'Architecture health check failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
      version: '3.0',
    });
  }
});

// ============================================
// ENHANCED: FEATURE FLAGS ENDPOINT V2.0
// ============================================

/**
 * GET /api/health/features - Check feature flags status
 */
router.get('/features', async (_req: Request, res: Response) => {
  try {
    const { FeatureFlags } = await import('@server/shared/FeatureFlags');
    const featureStatus = FeatureFlags.getStatus();

    (res as any).status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0',
      features: featureStatus,
    });
  } catch (error) {
    (res as any).status(500).json({
      status: 'unhealthy',
      error: 'Failed to check feature flags',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================
// NEW: SERVICE CONTAINER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/health/services - Get ServiceContainer v2.0 status
 */
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const containerHealth = ServiceContainer.getHealthStatus();
    const serviceHealth = await ServiceContainer.healthCheck();
    const dependencyGraph = ServiceContainer.getDependencyGraph();

    (res as any).status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0',
      container: containerHealth,
      serviceHealth,
      dependencyGraph,
      summary: {
        registeredServices: containerHealth.registeredServices,
        instantiatedServices: containerHealth.instantiatedServices,
        healthyServices: Object.values(serviceHealth).filter(Boolean).length,
        unhealthyServices: Object.values(serviceHealth).filter(h => !h).length,
        initializationOrder: containerHealth.initializationOrder,
      },
    });
  } catch (error) {
    (res as any).status(500).json({
      status: 'unhealthy',
      error: 'Failed to check service container status',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/dependencies - Get service dependency graph
 */
router.get('/dependencies', async (_req: Request, res: Response) => {
  try {
    const dependencyGraph = ServiceContainer.getDependencyGraph();
    const initializationOrder =
      ServiceContainer.getHealthStatus().initializationOrder;

    (res as any).status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0',
      dependencyGraph,
      initializationOrder,
      analysis: {
        totalServices: Object.keys(dependencyGraph).length,
        servicesWithDependencies: Object.values(dependencyGraph).filter(
          (service: any) => service.dependencies.length > 0
        ).length,
        servicesWithDependents: Object.values(dependencyGraph).filter(
          (service: any) => service.dependents.length > 0
        ).length,
      },
    });
  } catch (error) {
    (res as any).status(500).json({
      status: 'unhealthy',
      error: 'Failed to get dependency graph',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
