import express from 'express';
import { logger } from '@shared/utils/logger';

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
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: assistantId, publicKey',
            });
        }

        // Make request to Vapi API from server
        const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicKey}`,
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

            return res.status(vapiResponse.status).json({
                success: false,
                error: vapiData.message || 'Vapi API error',
                details: vapiData,
            });
        }

        logger.debug('[VapiProxy] Call started successfully', 'Component', {
            callId: vapiData.id,
        });

        res.json({
            success: true,
            data: vapiData,
        });

    } catch (error) {
        logger.error('[VapiProxy] Error starting call', 'Component', error);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error),
        });
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
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: callId, publicKey',
            });
        }

        const vapiResponse = await fetch(`https://api.vapi.ai/call/${callId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${publicKey}`,
                'User-Agent': 'MiNhonHotel-VoiceAssistant/1.0',
            },
        });

        if (!vapiResponse.ok) {
            const vapiData = await vapiResponse.json();
            logger.error('[VapiProxy] Error ending call', 'Component', {
                status: vapiResponse.status,
                error: vapiData,
            });

            return res.status(vapiResponse.status).json({
                success: false,
                error: vapiData.message || 'Failed to end call',
            });
        }

        logger.debug('[VapiProxy] Call ended successfully', 'Component', {
            callId,
        });

        res.json({
            success: true,
            message: 'Call ended successfully',
        });

    } catch (error) {
        logger.error('[VapiProxy] Error ending call', 'Component', error);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error),
        });
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

        if (!publicKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing publicKey in query params',
            });
        }

        const vapiResponse = await fetch(`https://api.vapi.ai/call/${callId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${publicKey}`,
                'User-Agent': 'MiNhonHotel-VoiceAssistant/1.0',
            },
        });

        const vapiData = await vapiResponse.json();

        if (!vapiResponse.ok) {
            return res.status(vapiResponse.status).json({
                success: false,
                error: vapiData.message || 'Failed to get call status',
            });
        }

        res.json({
            success: true,
            data: vapiData,
        });

    } catch (error) {
        logger.error('[VapiProxy] Error getting call status', 'Component', error);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error),
        });
    }
});

export default router; 