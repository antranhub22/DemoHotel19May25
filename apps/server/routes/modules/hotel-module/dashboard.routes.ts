// ============================================================================
// HOTEL MODULE: DASHBOARD ROUTES v2.0 - Hotel Management Dashboard
// ============================================================================
// Hotel configuration, research, and assistant generation functionality
// Enhanced with ServiceContainer v2.0 and FeatureFlags integration

import express from 'express';

// Import existing dashboard route logic
import dashboardRouter from '@server/routes/dashboard';

const router = express.Router();

// ============================================
// HOTEL DASHBOARD ROUTES - MODULAR v2.0
// ============================================
// Re-export existing dashboard functionality under the hotel module structure

// Mount all existing dashboard routes under this modular structure
router.use('/', dashboardRouter);

export default router;
