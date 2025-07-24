import { Request, Response } from 'express';
import {
  getOverview,
  getServiceDistribution,
  getHourlyActivity,
  getDashboardAnalytics,
} from '@server/analytics';
import { logger } from '@shared/utils/logger';

/**
 * Analytics Controller - Optimized with Tenant Filtering
 *
 * Handles all analytics-related HTTP requests and responses.
 * Business logic is delegated to analytics service with proper tenant isolation.
 */
export class AnalyticsController {
  /**
   * Get analytics overview with tenant filtering
   */
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id;
      const timeRange = AnalyticsController.parseTimeRange(req.query);

      logger.api(
        '📊 [AnalyticsController] Getting overview',
        'AnalyticsController',
        { userId: req.user?.id, tenantId }
      );

      const overview = await getOverview({ tenantId, timeRange });

      logger.success(
        '📊 [AnalyticsController] Overview retrieved successfully',
        'AnalyticsController',
        {
          tenantId,
          totalCalls: overview.totalCalls,
          callsThisMonth: overview.callsThisMonth,
        }
      );

      (res as any).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get overview',
        'AnalyticsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve analytics overview',
      });
    }
  }

  /**
   * Get service distribution with tenant filtering
   */
  static async getServiceDistribution(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id;
      const timeRange = AnalyticsController.parseTimeRange(req.query);

      logger.api(
        '📊 [AnalyticsController] Getting service distribution',
        'AnalyticsController',
        { userId: req.user?.id, tenantId }
      );

      const distribution = await getServiceDistribution({
        tenantId,
        timeRange,
      });

      logger.success(
        '📊 [AnalyticsController] Service distribution retrieved',
        'AnalyticsController',
        {
          tenantId,
          servicesCount: distribution.length,
        }
      );

      (res as any).json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get service distribution',
        'AnalyticsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve service distribution',
      });
    }
  }

  /**
   * Get hourly activity with tenant filtering
   */
  static async getHourlyActivity(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id;
      const timeRange = AnalyticsController.parseTimeRange(req.query);

      logger.api(
        '📊 [AnalyticsController] Getting hourly activity',
        'AnalyticsController',
        { userId: req.user?.id, tenantId }
      );

      const activity = await getHourlyActivity({ tenantId, timeRange });

      logger.success(
        '📊 [AnalyticsController] Hourly activity retrieved',
        'AnalyticsController',
        {
          tenantId,
          dataPoints: activity.length,
        }
      );

      (res as any).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get hourly activity',
        'AnalyticsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve hourly activity',
      });
    }
  }

  /**
   * ✅ NEW: Get comprehensive dashboard analytics
   * Optimized endpoint that returns all analytics in one call
   */
  static async getDashboardAnalytics(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id;
      const timeRange = AnalyticsController.parseTimeRange(req.query);

      logger.api(
        '📊 [AnalyticsController] Getting comprehensive dashboard analytics',
        'AnalyticsController',
        { userId: req.user?.id, tenantId }
      );

      const startTime = Date.now();
      const analytics = await getDashboardAnalytics({ tenantId, timeRange });
      const executionTime = Date.now() - startTime;

      logger.success(
        '📊 [AnalyticsController] Dashboard analytics retrieved successfully',
        'AnalyticsController',
        {
          tenantId,
          executionTime,
          dataPoints: {
            overview: Object.keys(analytics.overview).length,
            serviceDistribution: analytics.serviceDistribution.length,
            hourlyActivity: analytics.hourlyActivity.length,
            languageDistribution: analytics.languageDistribution.length,
          },
        }
      );

      (res as any).json({
        success: true,
        data: analytics,
        metadata: {
          executionTime,
          tenantId: tenantId || 'all',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error(
        '❌ [AnalyticsController] Failed to get dashboard analytics',
        'AnalyticsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve dashboard analytics',
      });
    }
  }

  /**
   * ✅ UTILITY: Parse time range from query parameters
   */
  private static parseTimeRange(
    query: any
  ): { start: Date; end: Date } | undefined {
    const { startDate, endDate, days } = query;

    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    if (days) {
      const daysNumber = parseInt(days, 10);
      if (!isNaN(daysNumber) && daysNumber > 0) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - daysNumber);
        return { start, end };
      }
    }

    return undefined;
  }
}
