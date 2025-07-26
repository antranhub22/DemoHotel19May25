import { RequestController } from '@server/controllers/requestController';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// ==========================================
// GUEST PUBLIC ROUTES - NO AUTHENTICATION
// ==========================================
// These routes allow hotel guests to use voice assistant without login
// Used for room service, housekeeping, concierge requests

// ✅ POST /api/guest/request - Create new guest request (NO AUTH REQUIRED)
router.post('/request', async (req, res) => {
    try {
        logger.debug('🏨 [Guest] Received guest request:', 'GuestAPI', req.body);

        // Add guest metadata to request
        const guestRequest = {
            ...req.body,
            isGuestRequest: true,
            guestSession: req.headers['x-guest-session'] || 'anonymous',
            source: 'voice-assistant',
            tenantId: 'default-tenant', // Use default tenant for guest requests
            submittedAt: new Date().toISOString(),
        };

        // Use existing request controller but bypass auth middleware
        req.body = guestRequest;
        req.user = {
            id: 'guest-user',
            username: 'guest',
            role: 'guest',
            tenantId: 'default-tenant',
        };
        req.tenant = {
            id: 'default-tenant',
            hotelName: 'Mi Nhon Hotel',
            subscriptionPlan: 'premium',
            subscriptionStatus: 'active',
        };

        await RequestController.createRequest(req, res);
    } catch (error) {
        logger.error('❌ [Guest] Guest request error:', 'GuestAPI', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process guest request',
            code: 'GUEST_REQUEST_ERROR',
        });
    }
});

// ✅ GET /api/guest/health - Health check for guest endpoints
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Guest API is working!',
        timestamp: new Date().toISOString(),
        status: 'healthy',
        features: {
            voiceAssistant: true,
            guestRequests: true,
            noAuthRequired: true,
        },
    });
});

// ✅ GET /api/guest/status - Guest service status
router.get('/status', (_req, res) => {
    res.json({
        success: true,
        status: 'operational',
        services: {
            roomService: true,
            housekeeping: true,
            concierge: true,
            voiceAssistant: true,
        },
        hotel: {
            name: 'Mi Nhon Hotel',
            location: 'Mui Ne, Vietnam',
            timezone: 'Asia/Ho_Chi_Minh',
        },
        timestamp: new Date().toISOString(),
    });
});

export default router; 