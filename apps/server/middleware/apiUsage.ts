/**
 * SaaS Provider Domain - API Usage Tracking Middleware
 * Comprehensive API usage monitoring and analytics for SaaS billing and insights
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";

// ============================================
// TYPES & INTERFACES
// ============================================

interface ApiUsageData {
  tenantId: string;
  userId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  ipAddress: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface UsageMetrics {
  totalRequests: number;
  totalResponseTime: number;
  averageResponseTime: number;
  successRequests: number;
  errorRequests: number;
  successRate: number;
  requestsPerMinute: number;
  bandwidthUsed: number;
}

interface EndpointStats {
  endpoint: string;
  method: string;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastAccessed: Date;
}

// ============================================
// API USAGE TRACKING
// ============================================

class ApiUsageTracker {
  private prisma: PrismaClient;
  private usageQueue: ApiUsageData[] = [];
  private batchSize = 100;
  private flushInterval = 30000; // 30 seconds
  private processingInterval: NodeJS.Timeout;

  constructor() {
    this.prisma = new PrismaClient();

    // Start background processing
    this.processingInterval = setInterval(() => {
      this.flushUsageData();
    }, this.flushInterval);

    logger.info("[ApiUsageTracker] Initialized with batch processing");
  }

  /**
   * Track API usage
   */
  trackUsage(data: ApiUsageData): void {
    try {
      this.usageQueue.push(data);

      // Flush immediately if queue is full
      if (this.usageQueue.length >= this.batchSize) {
        setImmediate(() => this.flushUsageData());
      }
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error tracking usage", error);
    }
  }

  /**
   * Flush usage data to database
   */
  private async flushUsageData(): Promise<void> {
    if (this.usageQueue.length === 0) return;

    try {
      const batch = this.usageQueue.splice(0, this.batchSize);

      // Insert batch into database
      await this.insertUsageBatch(batch);

      // Update real-time metrics
      await this.updateRealtimeMetrics(batch);

      logger.debug("[ApiUsageTracker] Flushed usage batch", {
        batchSize: batch.length,
        queueRemaining: this.usageQueue.length,
      });
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error flushing usage data", error);
    }
  }

  /**
   * Insert usage batch into database
   */
  private async insertUsageBatch(batch: ApiUsageData[]): Promise<void> {
    try {
      // Create usage records
      const usageRecords = batch.map((data) => ({
        tenant_id: data.tenantId,
        user_id: data.userId,
        endpoint: data.endpoint,
        method: data.method,
        status_code: data.statusCode,
        response_time: data.responseTime,
        request_size: data.requestSize,
        response_size: data.responseSize,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        timestamp: data.timestamp,
        metadata: JSON.stringify(data.metadata || {}),
      }));

      // Batch insert using raw SQL for better performance
      if (usageRecords.length > 0) {
        const values = usageRecords
          .map(
            (record) =>
              `('${record.tenant_id}', ${record.user_id ? `'${record.user_id}'` : "NULL"}, '${record.endpoint}', '${record.method}', ${record.status_code}, ${record.response_time}, ${record.request_size}, ${record.response_size}, ${record.user_agent ? `'${record.user_agent}'` : "NULL"}, '${record.ip_address}', '${record.timestamp.toISOString()}', '${record.metadata}')`,
          )
          .join(", ");

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO api_usage (tenant_id, user_id, endpoint, method, status_code, response_time, request_size, response_size, user_agent, ip_address, timestamp, metadata)
          VALUES ${values}
        `);
      }
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error inserting usage batch", error);
      throw error;
    }
  }

  /**
   * Update real-time metrics
   */
  private async updateRealtimeMetrics(batch: ApiUsageData[]): Promise<void> {
    try {
      // Group by tenant for efficient updates
      const tenantGroups = batch.reduce(
        (acc, data) => {
          if (!acc[data.tenantId]) {
            acc[data.tenantId] = [];
          }
          acc[data.tenantId].push(data);
          return acc;
        },
        {} as Record<string, ApiUsageData[]>,
      );

      // Update metrics for each tenant
      for (const [tenantId, tenantData] of Object.entries(tenantGroups)) {
        await this.updateTenantMetrics(tenantId, tenantData);
      }
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error updating real-time metrics", error);
    }
  }

  /**
   * Update tenant-specific metrics
   */
  private async updateTenantMetrics(
    tenantId: string,
    data: ApiUsageData[],
  ): Promise<void> {
    try {
      const totalRequests = data.length;
      const totalResponseTime = data.reduce(
        (sum, d) => sum + d.responseTime,
        0,
      );
      const successRequests = data.filter(
        (d) => d.statusCode >= 200 && d.statusCode < 400,
      ).length;
      const totalBandwidth = data.reduce(
        (sum, d) => sum + d.requestSize + d.responseSize,
        0,
      );

      // Update or create tenant metrics record
      await this.prisma.$executeRaw`
        INSERT INTO tenant_api_metrics (
          tenant_id, 
          total_requests, 
          total_response_time, 
          success_requests, 
          total_bandwidth, 
          last_updated
        )
        VALUES (
          ${tenantId}, 
          ${totalRequests}, 
          ${totalResponseTime}, 
          ${successRequests}, 
          ${totalBandwidth}, 
          ${new Date()}
        )
        ON CONFLICT (tenant_id) DO UPDATE SET
          total_requests = tenant_api_metrics.total_requests + ${totalRequests},
          total_response_time = tenant_api_metrics.total_response_time + ${totalResponseTime},
          success_requests = tenant_api_metrics.success_requests + ${successRequests},
          total_bandwidth = tenant_api_metrics.total_bandwidth + ${totalBandwidth},
          last_updated = ${new Date()}
      `;
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error updating tenant metrics", error);
    }
  }

  /**
   * Get usage metrics for tenant
   */
  async getTenantUsageMetrics(
    tenantId: string,
    period: string = "current_month",
  ): Promise<UsageMetrics> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);

      const result = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) as total_requests,
          SUM(response_time) as total_response_time,
          AVG(response_time) as average_response_time,
          COUNT(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 END) as success_requests,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests,
          SUM(request_size + response_size) as bandwidth_used
        FROM api_usage 
        WHERE tenant_id = ${tenantId}
          AND timestamp >= ${startDate}
          AND timestamp <= ${endDate}
      `;

      const data = result[0] || {};
      const totalRequests = parseInt(data.total_requests) || 0;
      const successRequests = parseInt(data.success_requests) || 0;
      const errorRequests = parseInt(data.error_requests) || 0;

      const periodDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const requestsPerMinute = totalRequests / (periodDays * 24 * 60);

      return {
        totalRequests,
        totalResponseTime: parseFloat(data.total_response_time) || 0,
        averageResponseTime: parseFloat(data.average_response_time) || 0,
        successRequests,
        errorRequests,
        successRate:
          totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0,
        requestsPerMinute,
        bandwidthUsed: parseInt(data.bandwidth_used) || 0,
      };
    } catch (error: any) {
      logger.error(
        "[ApiUsageTracker] Error getting tenant usage metrics",
        error,
      );
      throw error;
    }
  }

  /**
   * Get endpoint statistics
   */
  async getEndpointStats(
    tenantId: string,
    period: string = "current_month",
  ): Promise<EndpointStats[]> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);

      const result = await this.prisma.$queryRaw<any[]>`
        SELECT 
          endpoint,
          method,
          COUNT(*) as request_count,
          AVG(response_time) as average_response_time,
          (COUNT(CASE WHEN status_code >= 400 THEN 1 END) * 100.0 / COUNT(*)) as error_rate,
          MAX(timestamp) as last_accessed
        FROM api_usage 
        WHERE tenant_id = ${tenantId}
          AND timestamp >= ${startDate}
          AND timestamp <= ${endDate}
        GROUP BY endpoint, method
        ORDER BY request_count DESC
      `;

      return result.map((row) => ({
        endpoint: row.endpoint,
        method: row.method,
        requestCount: parseInt(row.request_count),
        averageResponseTime: parseFloat(row.average_response_time),
        errorRate: parseFloat(row.error_rate),
        lastAccessed: new Date(row.last_accessed),
      }));
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error getting endpoint stats", error);
      throw error;
    }
  }

  /**
   * Check if tenant has exceeded API limits
   */
  async checkApiLimits(
    tenantId: string,
    limits: Record<string, number>,
  ): Promise<{
    exceeded: boolean;
    current: number;
    limit: number;
    resetDate: Date;
  }> {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const result = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as current_usage
        FROM api_usage 
        WHERE tenant_id = ${tenantId}
          AND timestamp >= ${currentMonth}
          AND timestamp < ${nextMonth}
      `;

      const currentUsage = parseInt(result[0]?.current_usage) || 0;
      const limit = limits.monthlyApiCalls || 1000;

      return {
        exceeded: currentUsage >= limit,
        current: currentUsage,
        limit,
        resetDate: nextMonth,
      };
    } catch (error: any) {
      logger.error("[ApiUsageTracker] Error checking API limits", error);
      return {
        exceeded: false,
        current: 0,
        limit: limits.monthlyApiCalls || 1000,
        resetDate: new Date(),
      };
    }
  }

  /**
   * Get period date range
   */
  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (period) {
      case "current_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last_7_days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last_24_hours":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    logger.info("[ApiUsageTracker] Shutting down...");

    clearInterval(this.processingInterval);

    // Flush remaining data
    await this.flushUsageData();

    await this.prisma.$disconnect();

    logger.info("[ApiUsageTracker] Shutdown complete");
  }
}

// ============================================
// MIDDLEWARE IMPLEMENTATION
// ============================================

const apiUsageTracker = new ApiUsageTracker();

/**
 * API usage logging middleware
 */
export function logApiUsage() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const startHrTime = process.hrtime();

    // Capture request data
    const requestData = {
      method: req.method,
      endpoint: req.route?.path || req.path,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
      requestSize: parseInt(req.get("Content-Length") || "0"),
      tenantId: req.user?.tenantId || "anonymous",
      userId: req.user?.id,
      timestamp: new Date(),
    };

    // Override res.end to capture response data
    const originalEnd = res.end;
    let responseSize = 0;

    res.end = function (chunk?: any, encoding?: any) {
      const endTime = Date.now();
      const hrTime = process.hrtime(startHrTime);
      const responseTime = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert to milliseconds

      // Calculate response size
      if (chunk) {
        responseSize = Buffer.isBuffer(chunk)
          ? chunk.length
          : Buffer.byteLength(chunk, encoding);
      }

      // Track API usage
      apiUsageTracker.trackUsage({
        ...requestData,
        statusCode: res.statusCode,
        responseTime: Math.round(responseTime),
        responseSize,
      });

      // Log for debugging
      logger.debug("[ApiUsage] Request tracked", {
        method: requestData.method,
        endpoint: requestData.endpoint,
        statusCode: res.statusCode,
        responseTime: Math.round(responseTime),
        tenantId: requestData.tenantId,
      });

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * API limit enforcement middleware
 */
export function enforceApiLimits() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        // Apply basic limits for unauthenticated requests
        return next();
      }

      // Get subscription limits
      const subscriptionLimits = getSubscriptionLimits(user.subscriptionPlan);

      // Check current usage
      const limitCheck = await apiUsageTracker.checkApiLimits(
        user.tenantId,
        subscriptionLimits,
      );

      if (limitCheck.exceeded) {
        logger.warn("[ApiUsage] API limit exceeded", {
          tenantId: user.tenantId,
          current: limitCheck.current,
          limit: limitCheck.limit,
          endpoint: req.path,
        });

        return res.status(429).json({
          success: false,
          error: "API limit exceeded",
          message: `You have exceeded your monthly API limit of ${limitCheck.limit} requests`,
          current: limitCheck.current,
          limit: limitCheck.limit,
          resetDate: limitCheck.resetDate,
          upgradeMessage:
            "Upgrade your subscription to increase your API limits",
        });
      }

      // Add usage info to response headers
      res.set({
        "X-API-Usage-Current": limitCheck.current.toString(),
        "X-API-Usage-Limit": limitCheck.limit.toString(),
        "X-API-Usage-Remaining": (
          limitCheck.limit - limitCheck.current
        ).toString(),
        "X-API-Usage-Reset": limitCheck.resetDate.toISOString(),
      });

      next();
    } catch (error: any) {
      logger.error("[ApiUsage] Error enforcing API limits", error);
      // Allow request to proceed on error
      next();
    }
  };
}

/**
 * Usage analytics middleware for specific endpoints
 */
export function trackEndpointUsage(
  endpointName: string,
  metadata?: Record<string, any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add custom metadata to request for tracking
    req.usageMetadata = {
      endpointName,
      ...metadata,
    };

    next();
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getSubscriptionLimits(plan: string): Record<string, number> {
  const limits = {
    trial: { monthlyApiCalls: 1000 },
    basic: { monthlyApiCalls: 10000 },
    premium: { monthlyApiCalls: 100000 },
    enterprise: { monthlyApiCalls: 1000000 },
  };

  return limits[plan as keyof typeof limits] || limits.trial;
}

/**
 * Get usage metrics for tenant
 */
export async function getTenantUsageMetrics(
  tenantId: string,
  period: string = "current_month",
): Promise<UsageMetrics> {
  return apiUsageTracker.getTenantUsageMetrics(tenantId, period);
}

/**
 * Get endpoint statistics for tenant
 */
export async function getEndpointStats(
  tenantId: string,
  period: string = "current_month",
): Promise<EndpointStats[]> {
  return apiUsageTracker.getEndpointStats(tenantId, period);
}

// ============================================
// CLEANUP
// ============================================

process.on("SIGTERM", async () => {
  await apiUsageTracker.shutdown();
});

process.on("SIGINT", async () => {
  await apiUsageTracker.shutdown();
});

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      usageMetadata?: Record<string, any>;
    }
  }
}

export { apiUsageTracker };
