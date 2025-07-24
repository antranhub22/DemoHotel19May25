// ============================================================================
// ADMIN MODULE: MODULE LIFECYCLE ROUTES v2.0 - Module Management
// ============================================================================
// Module lifecycle management and system control with comprehensive admin controls
// Enhanced with ServiceContainer v2.0 integration

import express from 'express';

// Import existing module lifecycle route logic
import moduleLifecycleRouter from '@server/routes/module-lifecycle';

const router = express.Router();

// ============================================
// MODULE LIFECYCLE ROUTES - MODULAR v2.0
// ============================================
// Re-export existing module lifecycle functionality under the admin module structure

// Mount all existing module lifecycle routes under this modular structure
router.use('/', moduleLifecycleRouter);

export default router;
