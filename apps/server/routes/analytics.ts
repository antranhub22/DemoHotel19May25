import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../../packages/auth-system/middleware/auth.middleware';

import {
  getOverview,
  getServiceDistribution,
  getHourlyActivity,
} from '@server/analytics';

const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  console.error(defaultMessage, error);
  res.status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

// Get analytics overview
router.get(
  '/overview',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const overview = await getOverview();
      res.json(overview);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve analytics overview');
    }
  }
);

// Get service distribution analytics
router.get(
  '/service-distribution',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const distribution = await getServiceDistribution();
      res.json(distribution);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve service distribution');
    }
  }
);

// Get hourly activity analytics
router.get(
  '/hourly-activity',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const activity = await getHourlyActivity();
      res.json(activity);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve hourly activity');
    }
  }
);

export default router;
