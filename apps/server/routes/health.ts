// ============================================================================
// Health Check and Monitoring Endpoints
// Provides comprehensive health checks for deployment and monitoring
// ============================================================================

import { HealthController } from '@server/controllers/healthController';
import express, { type Request, Response } from 'express';

// ✅ NEW: Import modular architecture health check
import { getArchitectureHealth } from '@server/shared';

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
// NEW: MODULAR ARCHITECTURE HEALTH ENDPOINT
// ============================================

/**
 * GET /api/health/architecture - Check modular architecture health
 * Tests modules, service container, and feature flags
 */
router.get('/architecture', async (_req: Request, res: Response) => {
  try {
    const architectureHealth = getArchitectureHealth();

    // Determine overall health status
    const moduleHealths = Object.values(
      architectureHealth.modular.moduleHealth
    );
    const allModulesHealthy = moduleHealths.every(
      (health: any) => health.status === 'healthy'
    );

    const overallStatus = allModulesHealthy ? 'healthy' : 'degraded';

    (res as any).status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      architecture: architectureHealth,
      summary: {
        totalModules: architectureHealth.modular.modules.length,
        healthyModules: moduleHealths.filter((h: any) => h.status === 'healthy')
          .length,
        registeredServices:
          architectureHealth.services.container.registeredServices,
        enabledFeatures: architectureHealth.features.flags.enabledFlags,
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
// NEW: FEATURE FLAGS ENDPOINT
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

export default router;
