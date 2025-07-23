import express from 'express';
import { RequestController } from '@server/controllers/requestController';
import { authenticateJWT } from '@auth/middleware/auth.middleware';

const router = express.Router();

// ============================================
// REQUEST/ORDER ENDPOINTS - USING CONTROLLERS
// ============================================

// ✅ POST /api/request - Create new request (WITH AUTO TRANSFORMATION)
router.post('/', authenticateJWT, RequestController.createRequest);

// ✅ GET /api/request - Get all requests
router.get('/', authenticateJWT, RequestController.getAllRequests);

// ✅ GET /api/request/:id - Get specific request
router.get('/:id', authenticateJWT, RequestController.getRequestById);

// ✅ PATCH /api/request/:id/status - Update request status
router.patch(
  '/:id/status',
  authenticateJWT,
  RequestController.updateRequestStatus
);

export default router;
