// ============================================================================
// VOICE MODULE: MAIN ROUTER v2.0 - Voice Assistant & Call Management
// ============================================================================
// Central router for all voice assistant functionality including call management,
// transcript processing, and real-time voice interaction features
// Integrated with ServiceContainer v2.0 and FeatureFlags for enhanced capabilities

import { logger } from '@shared/utils/logger';
import express from 'express';

// ✅ Import voice module routes
import callsRoutes from './calls.routes';

// ✅ ENHANCED v2.0: Import modular architecture components
import { isFeatureEnabled } from '@server/shared/FeatureFlags';

const router = express.Router();

// ============================================
// VOICE MODULE INITIALIZATION
// ============================================

/**
 * Initialize Voice Module with ServiceContainer registration
 */
const initializeVoiceModule = () => {
  try {
    logger.debug(
      '🎙️ [Voice-Module] Initializing voice module v2.0',
      'VoiceModule'
    );

    // Voice module services are registered via CallsController
    // This module primarily routes to enhanced controllers

    logger.success(
      '✅ [Voice-Module] Voice module v2.0 initialized successfully',
      'VoiceModule'
    );
  } catch (error) {
    logger.error(
      '❌ [Voice-Module] Failed to initialize voice module',
      'VoiceModule',
      error
    );
  }
};

// Initialize on module load
initializeVoiceModule();

// ============================================
// VOICE MODULE ROUTE MOUNTING
// ============================================

/**
 * Call management and voice interaction
 * Mounted at: /api/voice/calls/*
 */
router.use('/calls', callsRoutes);

// ============================================
// VOICE MODULE METADATA ENDPOINTS
// ============================================

/**
 * GET /api/voice - Voice module information
 */
router.get('/', (req, res) => {
  logger.api('🎙️ [Voice-Module] Root endpoint accessed', 'VoiceModule');

  (res as any).json({
    module: 'voice-module',
    version: '2.0.0',
    description: 'Voice assistant and call management functionality',
    architecture: 'Modular v2.0',
    status: 'active',

    features: {
      callManagement: isFeatureEnabled('call-management'),
      transcriptProcessing: isFeatureEnabled('transcript-processing'),
      realTimeVoice: isFeatureEnabled('real-time-voice'),
      multiLanguageSupport: isFeatureEnabled('multi-language-voice'),
    },

    endpoints: {
      calls: '/api/voice/calls',
    },

    integrations: {
      serviceContainer: true,
      featureFlags: true,
      vapiAI: true,
      openAI: true,
    },

    timestamp: new Date().toISOString(),
  });
});

export default router;
