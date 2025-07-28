import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// ============================================
// VAPI PROXY ROUTES - CORS BYPASS
// ============================================

/**
 * Proxy Vapi start call to bypass CORS
 * POST /api/vapi-proxy/start-call
 */
router.post('/start-call', express.json(), async (req, res) => {
  try {
    const { assistantId, publicKey, ...callOptions } = req.body;

    logger.debug('[VapiProxy] Starting call via server proxy', 'Component', {
      assistantId: assistantId?.substring(0, 15) + '...',
      publicKey: publicKey?.substring(0, 15) + '...',
    });

    // Validate required fields
    if (!assistantId || !publicKey) {
      return commonErrors.missingFields(res, ['assistantId', 'publicKey']);
    }

    // Make request to Vapi API from server
    const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicKey}`,
        'User-Agent': 'MiNhonHotel-VoiceAssistant/1.0',
      },
      body: JSON.stringify({
        assistant: assistantId,
        ...callOptions,
      }),
    });

    const vapiData = await vapiResponse.json();

    if (!vapiResponse.ok) {
      logger.error('[VapiProxy] Vapi API error', 'Component', {
        status: vapiResponse.status,
        error: vapiData,
      });

      return apiResponse.error(
        res,
        vapiResponse.status,
        ErrorCodes.VAPI_ERROR,
        vapiData.message || 'Vapi API error',
        vapiData
      );
    }

    logger.debug('[VapiProxy] Call started successfully', 'Component', {
      callId: vapiData.id,
    });

    return apiResponse.success(
      res,
      vapiData,
      'Call started successfully via proxy',
      {
        callId: vapiData.id,
        assistantId: assistantId?.substring(0, 15) + '...',
      }
    );
  } catch (error) {
    logger.error('[VapiProxy] Error starting call', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.VAPI_ERROR,
      'Failed to start call via proxy',
      error
    );
  }
});

/**
 * Proxy Vapi end call
 * POST /api/vapi-proxy/end-call
 */
router.post('/end-call', express.json(), async (req, res) => {
  try {
    const { callId, publicKey } = req.body;

    logger.debug('[VapiProxy] Ending call via server proxy', 'Component', {
      callId,
    });

    if (!callId || !publicKey) {
      return commonErrors.missingFields(res, ['callId', 'publicKey']);
    }

    const vapiResponse = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'User-Agent': 'MiNhonHotel-VoiceAssistant/1.0',
      },
    });

    if (!vapiResponse.ok) {
      const vapiData = await vapiResponse.json();
      logger.error('[VapiProxy] Error ending call', 'Component', {
        status: vapiResponse.status,
        error: vapiData,
      });

      return apiResponse.error(
        res,
        vapiResponse.status,
        ErrorCodes.VAPI_ERROR,
        vapiData.message || 'Failed to end call',
        vapiData
      );
    }

    logger.debug('[VapiProxy] Call ended successfully', 'Component', {
      callId,
    });

    return apiResponse.success(
      res,
      { callId, endedAt: new Date().toISOString() },
      'Call ended successfully via proxy'
    );
  } catch (error) {
    logger.error('[VapiProxy] Error ending call', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.VAPI_ERROR,
      'Failed to end call via proxy',
      error
    );
  }
});

/**
 * Get Vapi call status
 * GET /api/vapi-proxy/call/:callId
 */
router.get('/call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const { publicKey } = req.query;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    if (!publicKey) {
      return commonErrors.validation(
        res,
        'Public key is required in query params'
      );
    }

    const vapiResponse = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'User-Agent': 'MiNhonHotel-VoiceAssistant/1.0',
      },
    });

    const vapiData = await vapiResponse.json();

    if (!vapiResponse.ok) {
      return apiResponse.error(
        res,
        vapiResponse.status,
        ErrorCodes.VAPI_ERROR,
        vapiData.message || 'Failed to get call status',
        vapiData
      );
    }

    return apiResponse.success(
      res,
      vapiData,
      'Call status retrieved successfully',
      { callId, statusCheckedAt: new Date().toISOString() }
    );
  } catch (error) {
    logger.error('[VapiProxy] Error getting call status', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.VAPI_ERROR,
      'Failed to get call status via proxy',
      error
    );
  }
});

export default router;
