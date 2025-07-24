// ============================================================================
// VOICE MODULE: CALLS ROUTES v2.0 - Call Management & Voice Interaction
// ============================================================================
// Voice call lifecycle management with enhanced ServiceContainer integration
// Handles call creation, transcript processing, and real-time voice features

import express from 'express';

// Import existing calls route logic
import callsRouter from '@server/routes/calls';

const router = express.Router();

// ============================================
// VOICE CALLS ROUTES - MODULAR v2.0
// ============================================
// Re-export existing calls functionality under the voice module structure

// Mount all existing calls routes under this modular structure
router.use('/', callsRouter);

export default router;
