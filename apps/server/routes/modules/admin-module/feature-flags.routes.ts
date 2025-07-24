// ============================================================================
// ADMIN MODULE: FEATURE FLAGS ROUTES v2.0 - Feature Flag Management
// ============================================================================
// Feature flag and A/B testing management with comprehensive admin controls
// Enhanced with ServiceContainer v2.0 integration

import express from 'express';

// Import existing feature flags route logic
import featureFlagsRouter from '@server/routes/feature-flags';

const router = express.Router();

// ============================================
// FEATURE FLAGS ROUTES - MODULAR v2.0
// ============================================
// Re-export existing feature flags functionality under the admin module structure

// Mount all existing feature flags routes under this modular structure
router.use('/', featureFlagsRouter);

export default router;
