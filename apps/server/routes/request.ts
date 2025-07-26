import express from 'express';
// ✅ REMOVED: authenticateJWT middleware for voice assistant compatibility
// import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { RequestController } from '@server/controllers/requestController';

const router = express.Router();

// ============================================
// REQUEST/ORDER ENDPOINTS - USING CONTROLLERS
// ============================================
// ✅ NOTE: Auth middleware removed to support voice assistant requests

// ✅ POST /api/request - Create new request (NO AUTH for voice assistant)
router.post('/', RequestController.createRequest);

// ✅ GET /api/request - Get all requests (NO AUTH for voice assistant)
router.get('/', RequestController.getAllRequests);

// ✅ GET /api/request/:id - Get specific request (NO AUTH for voice assistant)
router.get('/:id', RequestController.getRequestById);

// ✅ PATCH /api/request/:id/status - Update request status (NO AUTH for voice assistant)
router.patch(
  '/:id/status',
  RequestController.updateRequestStatus
);

export default router;
