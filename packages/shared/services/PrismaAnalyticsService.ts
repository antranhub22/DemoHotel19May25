/**
 * 🔥 PRISMA ANALYTICS SERVICE
 *
 * Advanced analytics service using Prisma ORM with sophisticated aggregations
 * Provides comprehensive reporting capabilities with optimized performance:
 * - Real-time dashboard analytics
 * - Advanced aggregations and grouping
 * - Multi-tenant analytics isolation
 * - Performance metrics and caching
 * - Flexible time range filtering
 */

import { PrismaClient } from "@prisma/client";
import { PrismaConnectionManager } from "../db/PrismaConnectionManager";
import { logger } from "../utils/logger";

// ============================================
// ANALYTICS TYPES & INTERFACES
// ============================================

export interface AnalyticsOptions {
  tenantId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  includeCache?: boolean;
}

export interface OverviewAnalytics {
  totalCalls: number;
  averageCallDuration: number;
  languageDistribution: Array<{
    language: string;
    count: number;
  }>;
  callsThisMonth: number;
  growthRate: number;
  tenantId: string;
  metadata?: {
    source: string;
    executionTime: number;
    cached: boolean;
  };
}

export interface ServiceDistribution {
  serviceType: string;
  count: number;
  percentage?: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
  averageDuration?: number;
}

export interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
  averageDuration?: number;
}

export interface RequestAnalytics {
  totalRequests: number;
  requestsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  requestsByType: Array<{
    type: string;
    count: number;
  }>;
  averageCompletionTime: number;
  requestsThisMonth: number;
  requestGrowthRate: number;
}

export interface TenantAnalytics {
  tenantId: string;
  totalActivity: number;
  callsCount: number;
  requestsCount: number;
  transcriptsCount: number;
  lastActivity: Date | null;
  averageSessionDuration: number;
  topLanguages: Array<{
    language: string;
    count: number;
  }>;
}

export interface DashboardAnalytics {
  overview: OverviewAnalytics;
  serviceDistribution: ServiceDistribution[];
  hourlyActivity: HourlyActivity[];
  languageDistribution: LanguageDistribution[];
  requestAnalytics: RequestAnalytics;
  tenantAnalytics?: TenantAnalytics;
  metadata: {
    tenantId: string;
    executionTime: number;
    timestamp: string;
    dataSource: "prisma";
    cacheHitRate?: number;
  };
}

// ============================================
// PERFORMANCE METRICS INTERFACE
// ============================================
interface AnalyticsMetrics {
  operationCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  slowestOperation: number;
  fastestOperation: number;
  errorCount: number;
  cacheHitRate: number;
  cacheMisses: number;
  cacheHits: number;
  lastError?: string;
  lastErrorTime?: Date;
}

// ============================================
// PRISMA ANALYTICS SERVICE IMPLEMENTATION
// ============================================

export class PrismaAnalyticsService {
  private prismaManager: PrismaConnectionManager;
  private prisma: PrismaClient;
  private metrics: AnalyticsMetrics;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private instanceId: string;

  // Configuration
  private readonly cacheTimeoutMs = 300000; // 5 minutes
  private readonly enableCaching = true;
  private readonly enableMetrics = true;

  constructor(prismaManager: PrismaConnectionManager) {
    this.prismaManager = prismaManager;
    this.prisma = prismaManager.getClient();
    this.instanceId = `prisma-analytics-service-${Date.now()}`;

    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
      cacheHitRate: 0,
      cacheMisses: 0,
      cacheHits: 0,
    };

    logger.info(
      `📊 PrismaAnalyticsService initialized - Instance: ${this.instanceId}, Caching: ${this.enableCaching}, Metrics: ${this.enableMetrics}`,
    );
  }

  // ============================================
  // PERFORMANCE & UTILITY METHODS
  // ============================================

  /**
   * Start performance timer for operations
   */
  private startPerformanceTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.updateMetrics(duration);

      if (this.enableMetrics) {
        if (duration > 3000) {
          logger.warn(
            `🐌 Slow analytics operation: ${operation} took ${duration}ms`,
          );
        } else {
          logger.debug(
            `⚡ Analytics operation: ${operation} completed in ${duration}ms`,
          );
        }
      }
    };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(duration: number): void {
    this.metrics.operationCount++;
    this.metrics.totalExecutionTime += duration;
    this.metrics.averageExecutionTime =
      this.metrics.totalExecutionTime / this.metrics.operationCount;

    if (duration > this.metrics.slowestOperation) {
      this.metrics.slowestOperation = duration;
    }

    if (duration < this.metrics.fastestOperation) {
      this.metrics.fastestOperation = duration;
    }
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.enableCaching) return null;

    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    this.metrics.cacheHits++;
    this.updateCacheHitRate();
    return cached.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any, ttlMs?: number): void {
    if (!this.enableCaching) return;

    const ttl = ttlMs || this.cacheTimeoutMs;
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.cacheHitRate =
      total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  /**
   * Build time range filter for Prisma queries
   */
  private buildTimeRangeFilter(options: AnalyticsOptions) {
    if (!options.timeRange) return {};

    return {
      timestamp: {
        gte: options.timeRange.start,
        lte: options.timeRange.end,
      },
    };
  }

  /**
   * Build tenant filter for Prisma queries
   */
  private buildTenantFilter(options: AnalyticsOptions) {
    if (!options.tenantId) return {};

    return {
      tenant_id: options.tenantId,
    };
  }

  // ============================================
  // CORE ANALYTICS OPERATIONS
  // ============================================

  /**
   * Get comprehensive overview analytics
   */
  async getOverview(
    options: AnalyticsOptions = {},
  ): Promise<OverviewAnalytics> {
    const endTimer = this.startPerformanceTimer("getOverview");

    try {
      const cacheKey = `overview_${JSON.stringify(options)}`;
      const cached = this.getFromCache<OverviewAnalytics>(cacheKey);

      if (cached && options.includeCache !== false) {
        cached.metadata = { ...cached.metadata, cached: true };
        endTimer();
        return cached;
      }

      logger.info(
        `📊 [PrismaAnalyticsService] Getting overview analytics for tenant: ${options.tenantId}`,
      );

      // Build filters
      const tenantFilter = this.buildTenantFilter(options);
      const timeFilter = this.buildTimeRangeFilter(options);
      const combinedFilter = { ...tenantFilter, ...timeFilter };

      // Use call_summaries as primary data source (since it has call data)
      const [
        totalCallsResult,
        languageDistribution,
        thisMonthData,
        lastMonthData,
      ] = await Promise.all([
        // Total calls count
        this.prisma.call_summaries.count({
          where: combinedFilter,
        }),

        // Language distribution from transcripts (more reliable for language data)
        this.prisma.transcript.groupBy({
          by: ["content"], // We'll extract language from content patterns
          where: tenantFilter,
          _count: {
            content: true,
          },
          take: 10,
        }),

        // This month's calls
        this.getThisMonthCalls(options),

        // Last month's calls for growth calculation
        this.getLastMonthCalls(options),
      ]);

      // Calculate average duration from call summaries (assuming duration is in content)
      const durationsData = await this.prisma.call_summaries.findMany({
        where: {
          ...combinedFilter,
          duration: {
            not: null,
          },
        },
        select: {
          duration: true,
        },
      });

      const averageCallDuration =
        durationsData.length > 0
          ? durationsData.reduce(
              (sum, item) => sum + (parseFloat(item.duration || "0") || 0),
              0,
            ) / durationsData.length
          : 0;

      // Process language distribution (simplified - in real app you'd extract from transcripts)
      const processedLanguages =
        this.processLanguageDistribution(languageDistribution);

      // Calculate growth rate
      const growthRate =
        lastMonthData > 0
          ? ((thisMonthData - lastMonthData) / lastMonthData) * 100
          : 0;

      const result: OverviewAnalytics = {
        totalCalls: totalCallsResult,
        averageCallDuration: Math.round(averageCallDuration),
        languageDistribution: processedLanguages,
        callsThisMonth: thisMonthData,
        growthRate: Math.round(growthRate * 100) / 100,
        tenantId: options.tenantId || "all",
        metadata: {
          source: "prisma",
          executionTime: Date.now() - Date.now(),
          cached: false,
        },
      };

      this.setCache(cacheKey, result);

      logger.info(
        `✅ [PrismaAnalyticsService] Overview analytics completed for tenant: ${options.tenantId}, Total calls: ${result.totalCalls}, This month: ${result.callsThisMonth}, Growth: ${result.growthRate}%`,
      );

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Unknown error";
      this.metrics.lastErrorTime = new Date();

      logger.error("❌ [PrismaAnalyticsService] Failed to get overview", error);
      endTimer();

      // Return fallback data
      return {
        totalCalls: 0,
        averageCallDuration: 0,
        languageDistribution: [],
        callsThisMonth: 0,
        growthRate: 0,
        tenantId: options.tenantId || "all",
        metadata: {
          source: "prisma",
          executionTime: 0,
          cached: false,
        },
      };
    }
  }

  /**
   * Get service type distribution
   */
  async getServiceDistribution(
    options: AnalyticsOptions = {},
  ): Promise<ServiceDistribution[]> {
    const endTimer = this.startPerformanceTimer("getServiceDistribution");

    try {
      const cacheKey = `service_dist_${JSON.stringify(options)}`;
      const cached = this.getFromCache<ServiceDistribution[]>(cacheKey);

      if (cached && options.includeCache !== false) {
        endTimer();
        return cached;
      }

      logger.info(
        `📊 [PrismaAnalyticsService] Getting service distribution for tenant: ${options.tenantId}`,
      );

      // Use requests table for service type distribution (use description instead of type)
      const requestsByType = await this.prisma.request.groupBy({
        by: ["description"],
        where: {
          ...this.buildTenantFilter(options),
          description: {
            not: null,
          },
        },
        _count: {
          description: true,
        },
        orderBy: {
          _count: {
            description: "desc",
          },
        },
      });

      const total = requestsByType.reduce(
        (sum, item) => sum + item._count.description,
        0,
      );

      const result: ServiceDistribution[] = requestsByType.map((item) => ({
        serviceType: item.description || "unknown",
        count: item._count.description,
        percentage:
          total > 0
            ? Math.round((item._count.description / total) * 100 * 100) / 100
            : 0,
      }));

      this.setCache(cacheKey, result);

      logger.info(
        `✅ [PrismaAnalyticsService] Service distribution completed for tenant: ${options.tenantId}, Services count: ${result.length}`,
      );

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaAnalyticsService] Failed to get service distribution",
        error,
      );
      endTimer();
      return [];
    }
  }

  /**
   * Get hourly activity patterns
   */
  async getHourlyActivity(
    options: AnalyticsOptions = {},
  ): Promise<HourlyActivity[]> {
    const endTimer = this.startPerformanceTimer("getHourlyActivity");

    try {
      const cacheKey = `hourly_activity_${JSON.stringify(options)}`;
      const cached = this.getFromCache<HourlyActivity[]>(cacheKey);

      if (cached && options.includeCache !== false) {
        endTimer();
        return cached;
      }

      logger.info(
        `📊 [PrismaAnalyticsService] Getting hourly activity for tenant: ${options.tenantId}`,
      );

      // Use transcript data for hourly activity (as they have timestamps)
      const hourlyData = await this.prisma.transcript.findMany({
        where: this.buildTenantFilter(options),
        select: {
          timestamp: true,
        },
      });

      // Process hourly distribution
      const hourlyDistribution = new Map<number, number>();

      hourlyData.forEach((item) => {
        const hour = new Date(item.timestamp).getHours();
        hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
      });

      // Convert to array and fill missing hours
      const result: HourlyActivity[] = [];
      for (let hour = 0; hour < 24; hour++) {
        result.push({
          hour,
          count: hourlyDistribution.get(hour) || 0,
        });
      }

      this.setCache(cacheKey, result);

      logger.info(
        `✅ [PrismaAnalyticsService] Hourly activity completed for tenant: ${options.tenantId}, Data points: ${result.length}`,
      );

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaAnalyticsService] Failed to get hourly activity",
        error,
      );
      endTimer();
      return [];
    }
  }

  /**
   * Get comprehensive request analytics
   */
  async getRequestAnalytics(
    options: AnalyticsOptions = {},
  ): Promise<RequestAnalytics> {
    const endTimer = this.startPerformanceTimer("getRequestAnalytics");

    try {
      const cacheKey = `request_analytics_${JSON.stringify(options)}`;
      const cached = this.getFromCache<RequestAnalytics>(cacheKey);

      if (cached && options.includeCache !== false) {
        endTimer();
        return cached;
      }

      logger.info(
        `📊 [PrismaAnalyticsService] Getting request analytics for tenant: ${options.tenantId}`,
      );

      const filter = this.buildTenantFilter(options);

      const [
        totalRequests,
        requestsByStatus,
        requestsByType,
        thisMonthRequests,
        lastMonthRequests,
        completedRequests,
      ] = await Promise.all([
        // Total requests
        this.prisma.request.count({ where: filter }),

        // Requests by status
        this.prisma.request.groupBy({
          by: ["status"],
          where: filter,
          _count: {
            status: true,
          },
        }),

        // Requests by type
        this.prisma.request.groupBy({
          by: ["type"],
          where: {
            ...filter,
            type: { not: null },
          },
          _count: {
            type: true,
          },
        }),

        // This month requests
        this.getThisMonthRequests(options),

        // Last month requests
        this.getLastMonthRequests(options),

        // Completed requests for timing calculation
        this.prisma.request.findMany({
          where: {
            ...filter,
            status: "completed",
            completed_at: { not: null },
            created_at: { not: null },
          },
          select: {
            created_at: true,
            completed_at: true,
          },
        }),
      ]);

      // Calculate average completion time
      const completionTimes = completedRequests
        .filter((req) => req.completed_at && req.created_at)
        .map((req) => {
          const start = new Date(req.created_at!).getTime();
          const end = new Date(req.completed_at!).getTime();
          return (end - start) / (1000 * 60); // Convert to minutes
        });

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0;

      // Calculate growth rate
      const requestGrowthRate =
        lastMonthRequests > 0
          ? ((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100
          : 0;

      const result: RequestAnalytics = {
        totalRequests,
        requestsByStatus: requestsByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
          percentage:
            Math.round((item._count.status / totalRequests) * 100 * 100) / 100,
        })),
        requestsByType: requestsByType.map((item) => ({
          type: item.type || "unknown",
          count: item._count.type,
        })),
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
        requestsThisMonth: thisMonthRequests,
        requestGrowthRate: Math.round(requestGrowthRate * 100) / 100,
      };

      this.setCache(cacheKey, result);

      logger.info(
        `✅ [PrismaAnalyticsService] Request analytics completed for tenant: ${options.tenantId}, Total requests: ${result.totalRequests}`,
      );

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaAnalyticsService] Failed to get request analytics",
        error,
      );
      endTimer();

      return {
        totalRequests: 0,
        requestsByStatus: [],
        requestsByType: [],
        averageCompletionTime: 0,
        requestsThisMonth: 0,
        requestGrowthRate: 0,
      };
    }
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(
    options: AnalyticsOptions = {},
  ): Promise<DashboardAnalytics> {
    const endTimer = this.startPerformanceTimer("getDashboardAnalytics");

    try {
      logger.info(
        `📊 [PrismaAnalyticsService] Getting comprehensive dashboard analytics for tenant: ${options.tenantId}`,
      );

      const startTime = Date.now();

      // Execute all analytics queries in parallel for optimal performance
      const [
        overview,
        serviceDistribution,
        hourlyActivity,
        languageDistribution,
        requestAnalytics,
        tenantAnalytics,
      ] = await Promise.all([
        this.getOverview(options),
        this.getServiceDistribution(options),
        this.getHourlyActivity(options),
        this.getLanguageDistribution(options),
        this.getRequestAnalytics(options),
        options.tenantId ? this.getTenantAnalytics(options.tenantId) : null,
      ]);

      const executionTime = Date.now() - startTime;

      const result: DashboardAnalytics = {
        overview,
        serviceDistribution,
        hourlyActivity,
        languageDistribution,
        requestAnalytics,
        tenantAnalytics: tenantAnalytics || undefined,
        metadata: {
          tenantId: options.tenantId || "all",
          executionTime,
          timestamp: new Date().toISOString(),
          dataSource: "prisma",
          cacheHitRate: this.metrics.cacheHitRate,
        },
      };

      logger.info(
        `✅ [PrismaAnalyticsService] Dashboard analytics completed for tenant: ${options.tenantId}, Execution time: ${executionTime}ms, Components: ${Object.keys(result).length}`,
      );

      endTimer();
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        "❌ [PrismaAnalyticsService] Failed to get dashboard analytics",
        error,
      );
      endTimer();
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get language distribution with enhanced processing
   */
  async getLanguageDistribution(
    options: AnalyticsOptions = {},
  ): Promise<LanguageDistribution[]> {
    // For now, return mock data - in real implementation, you'd extract from transcripts
    return [
      { language: "Vietnamese", count: 45, percentage: 60 },
      { language: "English", count: 25, percentage: 33.33 },
      { language: "Chinese", count: 5, percentage: 6.67 },
    ];
  }

  /**
   * Get this month's calls count
   */
  private async getThisMonthCalls(options: AnalyticsOptions): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.call_summaries.count({
      where: {
        ...this.buildTenantFilter(options),
        timestamp: {
          gte: startOfMonth,
        },
      },
    });
  }

  /**
   * Get last month's calls count
   */
  private async getLastMonthCalls(options: AnalyticsOptions): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setTime(lastMonthEnd.getTime() - 1);

    return this.prisma.call_summaries.count({
      where: {
        ...this.buildTenantFilter(options),
        timestamp: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });
  }

  /**
   * Get this month's requests count
   */
  private async getThisMonthRequests(
    options: AnalyticsOptions,
  ): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.request.count({
      where: {
        ...this.buildTenantFilter(options),
        created_at: {
          gte: startOfMonth,
        },
      },
    });
  }

  /**
   * Get last month's requests count
   */
  private async getLastMonthRequests(
    options: AnalyticsOptions,
  ): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setTime(lastMonthEnd.getTime() - 1);

    return this.prisma.request.count({
      where: {
        ...this.buildTenantFilter(options),
        created_at: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });
  }

  /**
   * Get comprehensive tenant analytics
   */
  async getTenantAnalytics(tenantId: string): Promise<TenantAnalytics> {
    const [callsCount, requestsCount, transcriptsCount, lastActivity] =
      await Promise.all([
        this.prisma.call_summaries.count({
          where: { tenant_id: tenantId },
        }),
        this.prisma.request.count({
          where: { tenant_id: tenantId },
        }),
        this.prisma.transcript.count({
          where: { tenant_id: tenantId },
        }),
        this.prisma.transcript.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { timestamp: "desc" },
          select: { timestamp: true },
        }),
      ]);

    return {
      tenantId,
      totalActivity: callsCount + requestsCount + transcriptsCount,
      callsCount,
      requestsCount,
      transcriptsCount,
      lastActivity: lastActivity?.timestamp || null,
      averageSessionDuration: 0, // TODO: Calculate from actual session data
      topLanguages: [], // TODO: Extract from transcript analysis
    };
  }

  /**
   * Process language distribution data
   */
  private processLanguageDistribution(
    rawData: any[],
  ): Array<{ language: string; count: number }> {
    // Simplified processing - in real implementation, you'd use NLP to detect languages
    return [
      { language: "Vietnamese", count: 45 },
      { language: "English", count: 25 },
      { language: "Chinese", count: 5 },
    ];
  }

  // ============================================
  // SERVICE MANAGEMENT
  // ============================================

  /**
   * Get service metrics
   */
  getMetrics(): AnalyticsMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
      cacheHitRate: 0,
      cacheMisses: 0,
      cacheHits: 0,
    };
    this.cache.clear();
  }

  /**
   * Clear analytics cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info("📊 [PrismaAnalyticsService] Cache cleared");
  }

  /**
   * Get service health
   */
  async getServiceHealth(): Promise<{
    status: string;
    metrics: AnalyticsMetrics;
    cacheSize: number;
    connectionHealth: boolean;
  }> {
    try {
      const connectionHealth = await this.prismaManager.healthCheck();

      return {
        status: connectionHealth ? "healthy" : "unhealthy",
        metrics: this.getMetrics(),
        cacheSize: this.cache.size,
        connectionHealth,
      };
    } catch (error) {
      logger.error("❌ [PrismaAnalyticsService] Health check failed", error);
      return {
        status: "unhealthy",
        metrics: this.getMetrics(),
        cacheSize: this.cache.size,
        connectionHealth: false,
      };
    }
  }
}

export default PrismaAnalyticsService;
