/**
 * Request Analytics Service - Using Prisma
 * Provides analytics for requests data
 */

import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
import { logger } from "@shared/utils/logger";

export class RequestAnalytics {
  private static prisma = PrismaConnectionManager.getInstance().getClient();

  static async getRequestAnalytics(tenantId: string) {
    try {
      logger.debug(
        `📊 [RequestAnalytics] Getting analytics for tenant: ${tenantId}`,
      );

      const [
        totalRequests,
        pendingRequests,
        completedRequests,
        recentRequests,
      ] = await Promise.all([
        // Total requests count
        this.prisma.request.count({
          where: { tenant_id: tenantId },
        }),

        // Pending requests
        this.prisma.request.count({
          where: {
            tenant_id: tenantId,
            status: "Đang xử lý",
          },
        }),

        // Completed requests
        this.prisma.request.count({
          where: {
            tenant_id: tenantId,
            status: "Hoàn thành",
          },
        }),

        // Recent requests (last 24 hours)
        this.prisma.request.count({
          where: {
            tenant_id: tenantId,
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const result = {
        totalRequests,
        pendingRequests,
        completedRequests,
        recentRequests,
        completionRate:
          totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
      };

      logger.info(
        `✅ [RequestAnalytics] Analytics retrieved for tenant: ${tenantId}`,
        result,
      );
      return result;
    } catch (error) {
      logger.error(
        `❌ [RequestAnalytics] Error getting analytics for tenant: ${tenantId}`,
        error,
      );
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        recentRequests: 0,
        completionRate: 0,
      };
    }
  }

  static async getRequestTrend(tenantId: string) {
    try {
      logger.debug(
        `📈 [RequestAnalytics] Getting trend for tenant: ${tenantId}`,
      );

      // Get requests from last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const requests = await this.prisma.request.findMany({
        where: {
          tenant_id: tenantId,
          created_at: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          created_at: true,
          status: true,
        },
      });

      // Group by day
      const dailyStats = {};
      requests.forEach((request) => {
        const day = request.created_at.toISOString().split("T")[0];
        if (!dailyStats[day]) {
          dailyStats[day] = { total: 0, completed: 0 };
        }
        dailyStats[day].total++;
        if (request.status === "Hoàn thành") {
          dailyStats[day].completed++;
        }
      });

      const trend = Object.entries(dailyStats).map(
        ([date, stats]: [string, any]) => ({
          date,
          total: stats.total,
          completed: stats.completed,
          completionRate:
            stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        }),
      );

      logger.info(
        `✅ [RequestAnalytics] Trend retrieved for tenant: ${tenantId}`,
        { dataPoints: trend.length },
      );
      return trend;
    } catch (error) {
      logger.error(
        `❌ [RequestAnalytics] Error getting trend for tenant: ${tenantId}`,
        error,
      );
      return [];
    }
  }
}

export const requestAnalytics = RequestAnalytics;
