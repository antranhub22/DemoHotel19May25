import { Request, Response } from 'express';
import { logger } from '@shared/utils/logger';
import {
  getOverview,
  getServiceDistribution,
  getHourlyActivity,
} from '@server/analytics';

/**
 * Analytics Controller
 *
 * Handles all analytics-related HTTP requests and responses.
 * Business logic is delegated to analytics service.
 */
export class AnalyticsController {
  /**
   * Get analytics overview
   */
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '📊 [AnalyticsController] Getting overview',
        'AnalyticsController',
        { userId: req.user?.id }
      );

      const overview = await getOverview();

      logger.success(
        '📊 [AnalyticsController] Overview retrieved successfully',
        'AnalyticsController',
        {
          dataPoints: Object.keys(overview).length,
        }
      );

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      logger.error('❌ [AnalyticsController] Failed to get overview', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics overview',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Get service distribution analytics
   */
  static async getServiceDistribution(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      logger.api(
        '📊 [AnalyticsController] Getting service distribution',
        'AnalyticsController',
        { userId: req.user?.id }
      );

      const distribution = await getServiceDistribution();

      logger.success(
        '📊 [AnalyticsController] Service distribution retrieved',
        'AnalyticsController',
        {
          servicesCount: distribution.length,
        }
      );

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get service distribution',
        error
      );
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve service distribution',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Get hourly activity analytics
   */
  static async getHourlyActivity(req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '📊 [AnalyticsController] Getting hourly activity',
        'AnalyticsController',
        { userId: req.user?.id }
      );

      const activity = await getHourlyActivity();

      logger.success(
        '📊 [AnalyticsController] Hourly activity retrieved',
        'AnalyticsController',
        {
          dataPoints: activity.length,
        }
      );

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get hourly activity',
        error
      );
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve hourly activity',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}
