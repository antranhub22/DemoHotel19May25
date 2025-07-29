// ============================================================================
// HOTEL MODULE: EMAIL ROUTES v2.0 - Email Notifications & Communication
// ============================================================================
// Email communication management for guest notifications and staff alerts
// Enhanced with ServiceContainer v2.0 integration

import express from 'express';

// Import existing email route logic
import emailRouter from '@server/routes/emails';

const router = express.Router();

// ============================================
// HOTEL EMAIL ROUTES - MODULAR v2.0
// ============================================
// Re-export existing email functionality under the hotel module structure

// Mount all existing email routes under this modular structure
router.use('/', emailRouter);

export default router;
