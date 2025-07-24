// ============================================================================
// HOTEL MODULE: STAFF ROUTES v2.0 - Staff Management & RBAC
// ============================================================================
// Staff member management with role-based access control and permissions
// Enhanced with ServiceContainer v2.0 integration

import express from 'express';

// Import existing staff route logic
import staffRouter from '@server/routes/staff';

const router = express.Router();

// ============================================
// HOTEL STAFF ROUTES - MODULAR v2.0
// ============================================
// Re-export existing staff functionality under the hotel module structure

// Mount all existing staff routes under this modular structure
router.use('/', staffRouter);

export default router;
