// ============================================================================
// ANALYTICS MODULE: ANALYTICS ROUTES v2.0 - Performance & Business Intelligence
// ============================================================================
// Analytics and reporting functionality with enhanced A/B testing integration
// Enhanced with ServiceContainer v2.0 and FeatureFlags integration

import express from 'express';

// Import existing analytics route logic
import analyticsRouter from '@server/routes/analytics';

const router = express.Router();

// ============================================
// ANALYTICS ROUTES - MODULAR v2.0
// ============================================
// Re-export existing analytics functionality under the analytics module structure

// Mount all existing analytics routes under this modular structure
router.use('/', analyticsRouter);

export default router;
