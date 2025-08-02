import { db } from '@shared/db';
import { request } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { and, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';

export interface RequestAnalytics {
  pending: number;
  inProgress: number;
  completed: number;
  totalToday: number;
  totalAll: number;
  avgCompletionTime: number; // in minutes
  satisfactionScore: number; // calculated from completion time
}

export class RequestAnalyticsService {
  /**
   * Get real-time request analytics for dashboard
   */
  async getRequestAnalytics(tenantId: string): Promise<RequestAnalytics> {
    try {
      logger.debug(
        '📋 [RequestAnalytics] Getting request analytics',
        'RequestAnalytics',
        { tenantId }
      );

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      // Parallel queries for performance
      const [
        pendingResult,
        inProgressResult,
        completedResult,
        todayResult,
        totalResult,
        completionTimeResult,
      ] = await Promise.all([
        // Pending requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              eq(request.status, 'Đã ghi nhận')
            )
          ),

        // In progress requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              eq(request.status, 'Đang thực hiện')
            )
          ),

        // Completed requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              eq(request.status, 'Hoàn thiện')
            )
          ),

        // Today's requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              gte(request.created_at, startOfDay),
              lte(request.created_at, endOfDay)
            )
          ),

        // Total requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(eq(request.tenant_id, tenantId)),

        // Average completion time for completed requests
        db
          .select({
            avgCompletionTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${request.actual_completion} - ${request.created_at})) / 60)`,
          })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              eq(request.status, 'Hoàn thiện'),
              isNotNull(request.actual_completion)
            )
          ),
      ]);

      // Calculate metrics
      const pending = pendingResult[0]?.count || 0;
      const inProgress = inProgressResult[0]?.count || 0;
      const completed = completedResult[0]?.count || 0;
      const totalToday = todayResult[0]?.count || 0;
      const totalAll = totalResult[0]?.count || 0;
      const avgCompletionTime = completionTimeResult[0]?.avgCompletionTime || 0;

      // Calculate satisfaction score based on completion time
      const satisfactionScore =
        this.calculateSatisfactionScore(avgCompletionTime);

      const analytics: RequestAnalytics = {
        pending,
        inProgress,
        completed,
        totalToday,
        totalAll,
        avgCompletionTime: Math.round(avgCompletionTime),
        satisfactionScore,
      };

      logger.debug(
        '📋 [RequestAnalytics] Analytics calculated',
        'RequestAnalytics',
        {
          tenantId,
          pending,
          inProgress,
          completed,
          totalToday,
          satisfactionScore,
        }
      );

      return analytics;
    } catch (error) {
      logger.error(
        '❌ [RequestAnalytics] Failed to get request analytics',
        'RequestAnalytics',
        error
      );

      // Return safe fallback
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalToday: 0,
        totalAll: 0,
        avgCompletionTime: 0,
        satisfactionScore: 4.5, // Default satisfaction score
      };
    }
  }

  /**
   * Calculate satisfaction score based on completion time
   * Lower completion time = higher satisfaction
   */
  private calculateSatisfactionScore(avgCompletionTimeMinutes: number): number {
    if (avgCompletionTimeMinutes === 0) return 4.5; // Default score

    // Score calculation logic:
    // - < 15 minutes: 5.0 (excellent)
    // - 15-30 minutes: 4.5 (very good)
    // - 30-60 minutes: 4.0 (good)
    // - 60-120 minutes: 3.5 (fair)
    // - > 120 minutes: 3.0 (poor)

    if (avgCompletionTimeMinutes < 15) return 5.0;
    if (avgCompletionTimeMinutes < 30) return 4.5;
    if (avgCompletionTimeMinutes < 60) return 4.0;
    if (avgCompletionTimeMinutes < 120) return 3.5;
    return 3.0;
  }

  /**
   * Get request trend (comparing current period vs previous period)
   */
  async getRequestTrend(tenantId: string): Promise<string> {
    try {
      const now = new Date();
      const currentPeriodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
      const previousPeriodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      );
      const previousPeriodEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );

      const [currentPeriod, previousPeriod] = await Promise.all([
        // Current period requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              gte(request.created_at, currentPeriodStart)
            )
          ),

        // Previous period requests
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(request)
          .where(
            and(
              eq(request.tenant_id, tenantId),
              gte(request.created_at, previousPeriodStart),
              lte(request.created_at, previousPeriodEnd)
            )
          ),
      ]);

      const current = currentPeriod[0]?.count || 0;
      const previous = previousPeriod[0]?.count || 0;

      if (previous === 0) return '+0.0';

      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';

      return `${sign}${change.toFixed(1)}`;
    } catch (error) {
      logger.warn(
        '⚠️ [RequestAnalytics] Failed to get request trend',
        'RequestAnalytics',
        error
      );
      return '+0.0';
    }
  }
}

export const requestAnalytics = new RequestAnalyticsService();
