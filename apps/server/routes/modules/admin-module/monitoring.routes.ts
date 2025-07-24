// ============================================================================
// ADMIN MODULE: MONITORING ROUTES v2.0 - System Monitoring & Observability
// ============================================================================
// Enhanced logging, metrics, and monitoring management with comprehensive admin controls
// Enhanced with ServiceContainer v2.0 integration

import express from 'express';

// Import existing monitoring route logic
import monitoringRouter from '@server/routes/monitoring';

const router = express.Router();

// ============================================
// MONITORING ROUTES - MODULAR v2.0
// ============================================
// Re-export existing monitoring functionality under the admin module structure

// Mount all existing monitoring routes under this modular structure
router.use('/', monitoringRouter);

export default router;
