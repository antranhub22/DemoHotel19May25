// ============================================================================
// Health Check and Monitoring Endpoints
// Provides comprehensive health checks for deployment and monitoring
// ============================================================================

import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

// ============================================
// HEALTH CHECK ENDPOINTS WITH CONNECTION POOL MONITORING
// ============================================

// Basic health check - for load balancers and simple monitoring
// GET /api/health
router.get('/', HealthController.getHealth);

// Detailed health check - comprehensive system information
// GET /api/health/detailed
router.get('/detailed', HealthController.getDetailedHealth);

// Database-specific health check - connection pool metrics and database status
// GET /api/health/database
router.get('/database', HealthController.getDatabaseHealth);

// Kubernetes/container orchestration probes
// GET /api/health/ready (readiness probe)
router.get('/ready', HealthController.getReadiness);

// GET /api/health/live (liveness probe)
router.get('/live', HealthController.getLiveness);

export default router;
