import { db } from '@shared/db';
import { call } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

export interface CallAnalytics {
  total: number;
  today: number;
  answered: number;
  avgDuration: string;
  avgDurationSeconds: number;
  successRate: number;
  peakHours: string[];
}

export class CallAnalyticsService {
  /**
   * Get real-time call analytics for dashboard
   */
  async getCallAnalytics(tenantId: string): Promise<CallAnalytics> {
    try {
      logger.debug(
        '📞 [CallAnalytics] Getting call analytics',
        'CallAnalytics',
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
      const [totalResult, todayResult, answeredResult, durationResult] =
        await Promise.all([
          // Total calls
          db
            .select({ count: sql<number>`COUNT(*)` })
            .from(call)
            .where(eq(call.tenant_id, tenantId)),

          // Today's calls
          db
            .select({ count: sql<number>`COUNT(*)` })
            .from(call)
            .where(
              and(
                eq(call.tenant_id, tenantId),
                gte(call.created_at, startOfDay),
                lte(call.created_at, endOfDay)
              )
            ),

          // Answered calls (duration > 0)
          db
            .select({ count: sql<number>`COUNT(*)` })
            .from(call)
            .where(
              and(eq(call.tenant_id, tenantId), sql`${call.duration} > 0`)
            ),

          // Average duration
          db
            .select({
              avgDuration: sql<number>`AVG(${call.duration})`,
              totalDuration: sql<number>`SUM(${call.duration})`,
            })
            .from(call)
            .where(
              and(
                eq(call.tenant_id, tenantId),
                sql`${call.duration} IS NOT NULL`
              )
            ),
        ]);

      // Calculate metrics
      const total = totalResult[0]?.count || 0;
      const today = todayResult[0]?.count || 0;
      const answered = answeredResult[0]?.count || 0;
      const avgDurationSeconds = durationResult[0]?.avgDuration || 0;
      const successRate = total > 0 ? (answered / total) * 100 : 0;

      // Format average duration
      const avgDuration = this.formatDuration(avgDurationSeconds);

      // Calculate peak hours (simplified for now)
      const peakHours = await this.getPeakHours(tenantId);

      const analytics: CallAnalytics = {
        total,
        today,
        answered,
        avgDuration,
        avgDurationSeconds: Math.round(avgDurationSeconds),
        successRate: Math.round(successRate * 100) / 100,
        peakHours,
      };

      logger.debug('📞 [CallAnalytics] Analytics calculated', 'CallAnalytics', {
        tenantId,
        total,
        today,
        answered,
        avgDuration,
        successRate,
      });

      return analytics;
    } catch (error) {
      logger.error(
        '❌ [CallAnalytics] Failed to get call analytics',
        'CallAnalytics',
        error
      );

      // Return safe fallback
      return {
        total: 0,
        today: 0,
        answered: 0,
        avgDuration: '0 min',
        avgDurationSeconds: 0,
        successRate: 0,
        peakHours: [],
      };
    }
  }

  /**
   * Format duration in seconds to human readable string
   */
  private formatDuration(seconds: number): string {
    if (seconds === 0) return '0 min';

    const minutes = Math.round(seconds / 60);
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get peak hours for calls (simplified implementation)
   */
  private async getPeakHours(tenantId: string): Promise<string[]> {
    try {
      // Get call counts by hour for the last 7 days
      const result = await db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${call.created_at})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(call)
        .where(
          and(
            eq(call.tenant_id, tenantId),
            gte(call.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        )
        .groupBy(sql`EXTRACT(HOUR FROM ${call.created_at})`)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(3);

      return result.map(row => `${row.hour}:00`);
    } catch (error) {
      logger.warn(
        '⚠️ [CallAnalytics] Failed to get peak hours',
        'CallAnalytics',
        error
      );
      return ['9:00', '14:00', '18:00']; // Default peak hours
    }
  }
}

export const callAnalytics = new CallAnalyticsService();
