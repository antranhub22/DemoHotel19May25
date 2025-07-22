import { Router } from 'express';
import { authenticateJWT } from '../../../packages/auth-system/middleware/auth.middleware';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

// Get analytics overview
router.get('/overview', authenticateJWT, AnalyticsController.getOverview);

// Get service distribution analytics
router.get(
  '/service-distribution',
  authenticateJWT,
  AnalyticsController.getServiceDistribution
);

// Get hourly activity analytics
router.get(
  '/hourly-activity',
  authenticateJWT,
  AnalyticsController.getHourlyActivity
);

export default router;
