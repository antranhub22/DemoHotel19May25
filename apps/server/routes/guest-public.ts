import { RequestController } from '@server/controllers/requestController';
import { GuestAuthService } from '@server/services/guestAuthService';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// ==========================================
// GUEST PUBLIC ROUTES - TENANT-BASED AUTH
// ==========================================
// These routes handle hotel guest voice assistant requests
// - Automatic tenant identification from subdomain
// - Guest session token creation with proper tenant context
// - Maintains data isolation between hotels

// ✅ POST /api/guest/auth - Get guest session token
router.post('/auth', async (req, res) => {
  try {
    const hostname = req.get('host') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    logger.debug('🏨 [Guest] Creating guest session:', 'GuestAPI', {
      hostname,
      ipAddress,
      userAgent: userAgent.substring(0, 50),
    });

    const result = await GuestAuthService.createGuestSession(
      hostname,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return apiResponse.error(
        res,
        400,
        ErrorCodes.GUEST_AUTH_FAILED,
        result.error || 'Failed to create guest session'
      );
    }

    return apiResponse.success(
      res,
      {
        token: result.token,
        session: result.session,
      },
      `Welcome to ${result.session?.hotelName || 'our hotel'}!`
    );
  } catch (error) {
    logger.error('❌ [Guest] Guest auth error:', 'GuestAPI', error);
    return commonErrors.internal(res, 'Failed to create guest session', error);
  }
});

// ✅ POST /api/guest/requests - Create guest request with tenant context
router.post('/requests', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let guestSession = null;

    // Try to get guest session from token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      guestSession = await GuestAuthService.verifyGuestToken(token);
    }

    // If no valid session, create one automatically
    if (!guestSession) {
      const hostname = req.get('host') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';

      const authResult = await GuestAuthService.createGuestSession(
        hostname,
        ipAddress,
        userAgent
      );

      if (!authResult.success || !authResult.session) {
        return apiResponse.error(
          res,
          400,
          ErrorCodes.TENANT_IDENTIFICATION_FAILED,
          'Unable to identify hotel'
        );
      }

      guestSession = {
        sessionId: authResult.session.sessionId,
        tenantId: authResult.session.tenantId,
        role: 'guest' as const,
        type: 'guest-session' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(authResult.session.expiresAt.getTime() / 1000),
      };
    }

    logger.debug('🏨 [Guest] Processing guest request:', 'GuestAPI', {
      tenantId: guestSession.tenantId,
      sessionId: guestSession.sessionId,
      requestType: req.body.orderType || req.body.type,
    });

    // Enhance request with guest context
    const guestRequest = {
      ...req.body,
      isGuestRequest: true,
      guestSession: guestSession.sessionId,
      source: 'voice-assistant',
      tenantId: guestSession.tenantId,
      submittedAt: new Date().toISOString(),
    };

    // Set up mock request context for RequestController
    req.body = guestRequest;
    req.user = {
      id: `guest-${guestSession.sessionId}`,
      username: 'guest',
      role: 'guest',
      tenantId: guestSession.tenantId,
    };

    // We'll let the controller handle tenant loading
    req.tenantId = guestSession.tenantId;

    await RequestController.createRequest(req, res);
  } catch (error) {
    logger.error('❌ [Guest] Guest request error:', 'GuestAPI', error);
    return commonErrors.internal(res, 'Failed to process guest request', error);
  }
});

// ✅ GET /api/guest/health - Health check with tenant info
router.get('/health', async (req, res) => {
  try {
    const hostname = req.get('host') || '';
    const subdomain = GuestAuthService.extractSubdomain(hostname);

    return apiResponse.success(
      res,
      {
        status: 'healthy',
        hotel: {
          subdomain,
          hostname,
          voiceAssistantAvailable: true,
        },
        features: {
          voiceAssistant: true,
          guestRequests: true,
          tenantIsolation: true,
          sessionManagement: true,
        },
      },
      'Guest API is working!'
    );
  } catch (error) {
    logger.error('❌ [Guest] Health check error:', 'GuestAPI', error);
    return commonErrors.internal(res, 'Health check failed', error);
  }
});

// ✅ GET /api/guest/hotel-info - Get hotel information for voice assistant
router.get('/hotel-info', async (req, res) => {
  try {
    const hostname = req.get('host') || '';
    const subdomain = GuestAuthService.extractSubdomain(hostname);

    return apiResponse.success(
      res,
      {
        subdomain,
        hotelName: subdomain
          ? `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Hotel`
          : 'Hotel',
        services: {
          roomService: true,
          housekeeping: true,
          concierge: true,
          maintenance: true,
        },
        languages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko'],
        timezone: 'Asia/Ho_Chi_Minh',
      },
      'Hotel information retrieved successfully'
    );
  } catch (error) {
    logger.error('❌ [Guest] Hotel info error:', 'GuestAPI', error);
    return commonErrors.internal(res, 'Failed to get hotel information', error);
  }
});

export default router;
