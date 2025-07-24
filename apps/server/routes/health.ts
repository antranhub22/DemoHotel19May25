// ============================================================================
// Health Check and Monitoring Endpoints
// Provides comprehensive health checks for deployment and monitoring
// ============================================================================

import { HealthController } from '@server/controllers/healthController';
import express, { type Request, Response } from 'express';

// ✅ ENHANCED: Import modular architecture health check v2.0
import { getArchitectureHealth } from '@server/shared';
import { ServiceContainer } from '@server/shared/ServiceContainer';

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
 * GET /api/health/architecture - Check enhanced modular architecture health
 * Tests modules, ServiceContainer v2.0, and feature flags
 */
router.get('/architecture', async (_req: Request, res: Response) => {
  try {
    const architectureHealth = getArchitectureHealth();

    // ✅ ENHANCED: Get ServiceContainer v2.0 health
    const containerHealth = ServiceContainer.getHealthStatus();
    const dependencyGraph = ServiceContainer.getDependencyGraph();
    const serviceHealth = await ServiceContainer.healthCheck();

    // Determine overall health status
    const moduleHealths = Object.values(
      architectureHealth.modular.moduleHealth
    );
    const allModulesHealthy = moduleHealths.every(
      (health: any) => health.status === 'healthy'
    );

    const allServicesHealthy = Object.values(serviceHealth).every(
      (healthy: boolean) => healthy
    );

    const overallStatus =
      allModulesHealthy && allServicesHealthy ? 'healthy' : 'degraded';

    (res as any).status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '2.0',
      architecture: {
        ...architectureHealth,
        // ✅ ENHANCED: Add ServiceContainer v2.0 details
        services: {
          container: containerHealth,
          health: serviceHealth,
          dependencyGraph,
        },
      },
      summary: {
        totalModules: architectureHealth.modular.modules.length,
        healthyModules: moduleHealths.filter((h: any) => h.status === 'healthy')
          .length,
        registeredServices: containerHealth.registeredServices,
        instantiatedServices: containerHealth.instantiatedServices,
        healthyServices: Object.values(serviceHealth).filter(Boolean).length,
        enabledFeatures: architectureHealth.features.flags.enabledFlags,
        containerVersion: containerHealth.version,
      },
    });
  } catch (error) {
    (res as any).status(500).json({
      status: 'unhealthy',
      error: 'Failed to check architecture health',
      details: error.message,
      timestamp: new Date().toISOString(),
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
