import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { AnalyticsController } from '@server/controllers/analyticsController';
import express from 'express';

const router = express.Router();

// ============================================
// OPTIMIZED ANALYTICS ENDPOINTS WITH TENANT FILTERING
// ============================================

// Get analytics overview (with tenant filtering + time range support)
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD OR ?days=30
router.get('/overview', authenticateJWT, AnalyticsController.getOverview);

// Get service distribution analytics (with tenant filtering + time range support)
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD OR ?days=30
router.get(
  '/service-distribution',
  authenticateJWT,
  AnalyticsController.getServiceDistribution
);

// Get hourly activity analytics (with tenant filtering + time range support)
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD OR ?days=30
router.get(
  '/hourly-activity',
  authenticateJWT,
  AnalyticsController.getHourlyActivity
);

// ✅ NEW: Get comprehensive dashboard analytics (all analytics in one optimized call)
// Returns: overview + serviceDistribution + hourlyActivity + languageDistribution
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD OR ?days=30
router.get(
  '/analytics-dashboard',
  authenticateJWT,
  AnalyticsController.getDashboardAnalytics
);

export default router;
