/**
 * SaaS Provider Domain - Platform Controller
 * Handles platform-wide analytics, tenant management, and system administration
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import { Request, Response } from "express";
import { z } from "zod";

// ============================================
// REQUEST VALIDATION SCHEMAS
// ============================================

const PlatformMetricsQuerySchema = z.object({
  period: z
    .enum(["last_24h", "last_7d", "last_30d", "last_90d", "last_year"])
    .optional()
    .default("last_30d"),
  metrics: z.array(z.string()).optional(),
});

const TenantFilterSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  plan: z
    .enum(["trial", "basic", "premium", "enterprise", "all"])
    .optional()
    .default("all"),
  status: z
    .enum(["active", "inactive", "expired", "cancelled", "all"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["created", "usage", "revenue", "name"])
    .optional()
    .default("created"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const UpdateTenantStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
  reason: z.string().optional(),
});

const GenerateReportSchema = z.object({
  type: z.enum(["revenue", "usage", "tenants", "features"]),
  period: z.enum(["last_30d", "last_90d", "last_year", "custom"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(["json", "csv", "pdf"]).optional().default("json"),
});

// ============================================
// PLATFORM CONTROLLER CLASS
// ============================================

export class PlatformController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info("[PlatformController] Initialized for platform administration");
  }

  // ============================================
  // PLATFORM METRICS & ANALYTICS
  // ============================================

  /**
   * Get platform-wide metrics and KPIs
   */
  async getPlatformMetrics(req: Request, res: Response): Promise<void> {
    try {
      const validation = PlatformMetricsQuerySchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: validation.error.issues,
        });
        return;
      }

      const { period } = validation.data;
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get comprehensive platform metrics
      const metrics = await Promise.all([
        this.getTotalTenants(startDate, endDate),
        this.getRevenueMetrics(startDate, endDate),
        this.getUsageMetrics(startDate, endDate),
        this.getConversionMetrics(startDate, endDate),
        this.getChurnMetrics(startDate, endDate),
        this.getSystemMetrics(),
      ]);

      const [
        tenantMetrics,
        revenueMetrics,
        usageMetrics,
        conversionMetrics,
        churnMetrics,
        systemMetrics,
      ] = metrics;

      const response = {
        success: true,
        metrics: {
          tenants: tenantMetrics,
          revenue: revenueMetrics,
          usage: usageMetrics,
          conversion: conversionMetrics,
          churn: churnMetrics,
          system: systemMetrics,
          period: {
            type: period,
            startDate,
            endDate,
          },
          lastUpdated: new Date(),
        },
      };

      res.json(response);
      logger.debug(
        "[PlatformController] Platform metrics retrieved successfully",
      );
    } catch (error: any) {
      logger.error(
        "[PlatformController] Error getting platform metrics",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get platform metrics",
        message: error.message,
      });
    }
  }

  /**
   * Get detailed platform analytics
   */
  async getPlatformAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || "last_30d";
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get detailed analytics data
      const analytics = await Promise.all([
        this.getTenantGrowth(startDate, endDate),
        this.getDetailedRevenueAnalytics(startDate, endDate),
        this.getFeatureAdoptionStats(startDate, endDate),
        this.getGeographicDistribution(),
        this.getPerformanceMetrics(startDate, endDate),
      ]);

      const [
        tenantGrowth,
        revenueAnalytics,
        featureAdoption,
        geographic,
        performance,
      ] = analytics;

      res.json({
        success: true,
        analytics: {
          tenantGrowth,
          revenue: revenueAnalytics,
          featureAdoption,
          geographic,
          performance,
          period: { type: period, startDate, endDate },
        },
      });
    } catch (error: any) {
      logger.error(
        "[PlatformController] Error getting platform analytics",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get platform analytics",
        message: error.message,
      });
    }
  }

  /**
   * Get revenue analytics and forecasting
   */
  async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || "last_30d";
      const { startDate, endDate } = this.getPeriodDates(period);

      const revenueData = await this.getDetailedRevenueAnalytics(
        startDate,
        endDate,
      );

      res.json({
        success: true,
        revenue: revenueData,
      });
    } catch (error: any) {
      logger.error(
        "[PlatformController] Error getting revenue analytics",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get revenue analytics",
        message: error.message,
      });
    }
  }

  // ============================================
  // TENANT MANAGEMENT
  // ============================================

  /**
   * Get all tenants with pagination and filtering
   */
  async getAllTenants(req: Request, res: Response): Promise<void> {
    try {
      const validation = TenantFilterSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: validation.error.issues,
        });
        return;
      }

      const { page, limit, plan, status, sortBy, sortOrder } = validation.data;
      const offset = (page - 1) * limit;

      // ✅ SECURITY FIX: Use parameterized queries for all dynamic conditions
      let whereClause = "";
      let whereParams: any[] = [];
      const conditions: string[] = [];
      let paramIndex = 1;

      if (plan !== "all") {
        conditions.push(`subscription_plan = $${paramIndex}`);
        whereParams.push(plan);
        paramIndex++;
      }
      if (status !== "all") {
        conditions.push(`subscription_status = $${paramIndex}`);
        whereParams.push(status);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
      }

      // Build sort clause
      let orderClause = "";
      switch (sortBy) {
        case "created":
          orderClause = `ORDER BY created_at ${sortOrder.toUpperCase()}`;
          break;
        case "name":
          orderClause = `ORDER BY hotel_name ${sortOrder.toUpperCase()}`;
          break;
        case "usage":
          orderClause = `ORDER BY (SELECT COUNT(*) FROM api_usage WHERE tenant_id = tenants.id) ${sortOrder.toUpperCase()}`;
          break;
        case "revenue":
          orderClause = `ORDER BY (
            CASE subscription_plan 
              WHEN 'enterprise' THEN 299
              WHEN 'premium' THEN 99
              WHEN 'basic' THEN 29
              ELSE 0
            END
          ) ${sortOrder.toUpperCase()}`;
          break;
        default:
          orderClause = `ORDER BY created_at ${sortOrder.toUpperCase()}`;
      }

      // ✅ SECURITY FIX: Use parameterized query for count
      const countSql = `
        SELECT COUNT(*) as total_count
        FROM tenants 
        ${whereClause}
      `;
      const countResult = await this.prisma.$queryRawUnsafe<any[]>(
        countSql,
        ...whereParams,
      );
      const totalCount = parseInt(countResult[0]?.total_count) || 0;

      // ✅ SECURITY FIX: Use parameterized query for main data query
      const baseSql = `
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM api_usage WHERE tenant_id = t.id AND timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_api_calls,
          (SELECT COUNT(*) FROM call WHERE tenant_id = t.id AND start_time >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_calls,
          (SELECT COUNT(*) FROM staff WHERE tenant_id = t.id AND is_active = true) as active_staff
        FROM tenants t
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const tenants = await this.prisma.$queryRawUnsafe<any[]>(
        baseSql,
        ...whereParams,
        limit,
        offset,
      );

      res.json({
        success: true,
        tenants: tenants.map((tenant) => ({
          id: tenant.id,
          hotelName: tenant.hotel_name,
          subdomain: tenant.subdomain,
          subscriptionPlan: tenant.subscription_plan,
          subscriptionStatus: tenant.subscription_status,
          createdAt: tenant.created_at,
          monthlyApiCalls: parseInt(tenant.monthly_api_calls) || 0,
          monthlyCalls: parseInt(tenant.monthly_calls) || 0,
          activeStaff: parseInt(tenant.active_staff) || 0,
          trialEndsAt: tenant.trial_ends_at,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting all tenants", error);
      res.status(500).json({
        success: false,
        error: "Failed to get tenants",
        message: error.message,
      });
    }
  }

  /**
   * Get detailed tenant information
   */
  async getTenantDetails(req: Request, res: Response): Promise<void> {
    try {
      const tenantIdParam = req.params.tenantId;

      // ✅ SECURITY FIX: Validate tenantId parameter
      if (!tenantIdParam || !/^[a-zA-Z0-9\-_]+$/.test(tenantIdParam)) {
        res.status(400).json({
          success: false,
          error: "Invalid tenant ID format",
        });
        return;
      }

      // ✅ SECURITY FIX: Use parameterized query to prevent SQL injection
      const tenantDetails = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          t.*,
          hp.research_data,
          hp.assistant_config,
          hp.vapi_assistant_id,
          (SELECT COUNT(*) FROM staff WHERE tenant_id = t.id) as total_staff,
          (SELECT COUNT(*) FROM staff WHERE tenant_id = t.id AND is_active = true) as active_staff,
          (SELECT COUNT(*) FROM call WHERE tenant_id = t.id) as total_calls,
          (SELECT COUNT(*) FROM request WHERE tenant_id = t.id) as total_requests,
          (SELECT COUNT(*) FROM api_usage WHERE tenant_id = t.id AND timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_api_usage
        FROM tenants t
        LEFT JOIN hotel_profiles hp ON hp.tenant_id = t.id
        WHERE t.id = $1
        `,
        [tenantIdParam],
      );

      if (tenantDetails.length === 0) {
        res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
        return;
      }

      const tenant = tenantDetails[0];

      // ✅ SECURITY FIX: Get usage trends with parameterized query
      const usageTrends = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as api_calls,
          COUNT(DISTINCT CASE WHEN endpoint LIKE '%/call%' THEN endpoint END) as voice_calls
        FROM api_usage 
        WHERE tenant_id = $1
          AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        `,
        [tenantIdParam],
      );

      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          hotelName: tenant.hotel_name,
          subdomain: tenant.subdomain,
          customDomain: tenant.custom_domain,
          subscriptionPlan: tenant.subscription_plan,
          subscriptionStatus: tenant.subscription_status,
          trialEndsAt: tenant.trial_ends_at,
          createdAt: tenant.created_at,
          updatedAt: tenant.updated_at,
          features: {
            maxVoices: tenant.max_voices,
            maxLanguages: tenant.max_languages,
            voiceCloning: tenant.voice_cloning,
            multiLocation: tenant.multi_location,
            whiteLabel: tenant.white_label,
            dataRetentionDays: tenant.data_retention_days,
            monthlyCallLimit: tenant.monthly_call_limit,
          },
          profile: {
            researchData: tenant.research_data,
            assistantConfig: tenant.assistant_config,
            vapiAssistantId: tenant.vapi_assistant_id,
          },
          stats: {
            totalStaff: parseInt(tenant.total_staff) || 0,
            activeStaff: parseInt(tenant.active_staff) || 0,
            totalCalls: parseInt(tenant.total_calls) || 0,
            totalRequests: parseInt(tenant.total_requests) || 0,
            monthlyApiUsage: parseInt(tenant.monthly_api_usage) || 0,
          },
          usageTrends: usageTrends.map((trend) => ({
            date: trend.date,
            apiCalls: parseInt(trend.api_calls),
            voiceCalls: parseInt(trend.voice_calls),
          })),
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting tenant details", error);
      res.status(500).json({
        success: false,
        error: "Failed to get tenant details",
        message: error.message,
      });
    }
  }

  /**
   * Update tenant status
   */
  async updateTenantStatus(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.params.tenantId;
      const validation = UpdateTenantStatusSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { status, reason } = validation.data;

      // ✅ SECURITY FIX: Use parameterized queries for updates
      const now = new Date();
      await this.prisma.$executeRawUnsafe(
        `
        UPDATE tenants 
        SET subscription_status = $1, updated_at = $2
        WHERE id = $3
        `,
        [status, now, tenantId],
      );

      // ✅ SECURITY FIX: Log the status change with parameterized query
      await this.prisma.$executeRawUnsafe(
        `
        INSERT INTO tenant_status_changes (tenant_id, old_status, new_status, reason, changed_by, created_at)
        VALUES ($1, 
                (SELECT subscription_status FROM tenants WHERE id = $1), 
                $2, 
                $3, 
                $4, 
                $5)
        `,
        [tenantId, status, reason || "", req.user?.id || "system", now],
      );

      res.json({
        success: true,
        message: "Tenant status updated successfully",
        tenantId,
        newStatus: status,
      });

      logger.info("[PlatformController] Tenant status updated", {
        tenantId,
        newStatus: status,
        reason,
        updatedBy: req.user?.id,
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error updating tenant status", error);
      res.status(500).json({
        success: false,
        error: "Failed to update tenant status",
        message: error.message,
      });
    }
  }

  // ============================================
  // USAGE ANALYTICS
  // ============================================

  /**
   * Get platform-wide usage overview
   */
  async getUsageOverview(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || "last_30d";
      const { startDate, endDate } = this.getPeriodDates(period);

      const usageOverview = await this.getUsageMetrics(startDate, endDate);

      res.json({
        success: true,
        usage: usageOverview,
        period: { type: period, startDate, endDate },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting usage overview", error);
      res.status(500).json({
        success: false,
        error: "Failed to get usage overview",
        message: error.message,
      });
    }
  }

  /**
   * Get usage trends and forecasting
   */
  async getUsageTrends(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || "last_30d";
      const metricParam = (req.query.metric as string) || "api_calls";
      const { startDate, endDate } = this.getPeriodDates(period);

      // ✅ SECURITY FIX: Validate metric parameter against allowed values
      const allowedMetrics = ["api_calls", "voice_calls"];
      const metric = allowedMetrics.includes(metricParam)
        ? metricParam
        : "api_calls";

      // ✅ SECURITY FIX: Use safe table and column mapping
      const tableMapping = {
        api_calls: { table: "api_usage", column: "api_calls" },
        voice_calls: { table: "call", column: "total_calls" },
      };

      const { table, column } = tableMapping[metric];

      // Get daily usage trends with parameterized query
      const trends = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as ${column},
          COUNT(DISTINCT tenant_id) as active_tenants
        FROM ${table}
        WHERE timestamp >= $1 AND timestamp <= $2
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `,
        [startDate, endDate],
      );

      // Calculate growth rate
      const growthRate = this.calculateGrowthRate(trends, metric);

      res.json({
        success: true,
        trends: {
          data: trends,
          growthRate,
          metric,
          period: { type: period, startDate, endDate },
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting usage trends", error);
      res.status(500).json({
        success: false,
        error: "Failed to get usage trends",
        message: error.message,
      });
    }
  }

  // ============================================
  // FEATURE ANALYTICS
  // ============================================

  /**
   * Get feature adoption analytics
   */
  async getFeatureAdoption(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || "last_30d";
      const { startDate, endDate } = this.getPeriodDates(period);

      const featureAdoption = await this.getFeatureAdoptionStats(
        startDate,
        endDate,
      );

      res.json({
        success: true,
        featureAdoption,
        period: { type: period, startDate, endDate },
      });
    } catch (error: any) {
      logger.error(
        "[PlatformController] Error getting feature adoption",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get feature adoption",
        message: error.message,
      });
    }
  }

  /**
   * Get detailed feature usage statistics
   */
  async getFeatureUsage(req: Request, res: Response): Promise<void> {
    try {
      const feature = req.query.feature as string;
      const period = (req.query.period as string) || "last_30d";
      const { startDate, endDate } = this.getPeriodDates(period);

      if (!feature) {
        res.status(400).json({
          success: false,
          error: "Feature parameter is required",
        });
        return;
      }

      // ✅ SECURITY FIX: Use parameterized query to prevent SQL injection
      const featureUsage = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as usage_count,
          COUNT(DISTINCT tenant_id) as unique_tenants
        FROM feature_usage 
        WHERE feature_id = $1
          AND timestamp >= $2
          AND timestamp <= $3
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
        `,
        [feature, startDate, endDate],
      );

      res.json({
        success: true,
        featureUsage: {
          feature,
          data: featureUsage,
          period: { type: period, startDate, endDate },
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting feature usage", error);
      res.status(500).json({
        success: false,
        error: "Failed to get feature usage",
        message: error.message,
      });
    }
  }

  // ============================================
  // HEALTH & MONITORING
  // ============================================

  /**
   * Get platform health status
   */
  async getPlatformHealth(res: Response): Promise<void> {
    try {
      const health = await this.getSystemMetrics();

      res.json({
        success: true,
        health: {
          status: health.status,
          uptime: health.uptime,
          database: health.database,
          memory: health.memory,
          cpu: health.cpu,
          lastChecked: new Date(),
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting platform health", error);
      res.status(500).json({
        success: false,
        error: "Failed to get platform health",
        message: error.message,
      });
    }
  }

  /**
   * Get platform alerts
   */
  async getPlatformAlerts(req: Request, res: Response): Promise<void> {
    try {
      const severityParam = (req.query.severity as string) || "all";
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 50, 1),
        1000,
      ); // ✅ Validate limit range

      // ✅ SECURITY FIX: Validate severity parameter against allowed values
      const allowedSeverities = ["low", "medium", "high", "critical", "all"];
      const severity = allowedSeverities.includes(severityParam)
        ? severityParam
        : "all";

      // ✅ SECURITY FIX: Use parameterized query for all dynamic values
      let baseSql: string;
      let queryParams: any[];

      if (severity !== "all") {
        baseSql = `
          SELECT * FROM platform_alerts 
          WHERE severity = $1
          ORDER BY created_at DESC 
          LIMIT $2
        `;
        queryParams = [severity, limit];
      } else {
        baseSql = `
          SELECT * FROM platform_alerts 
          ORDER BY created_at DESC 
          LIMIT $1
        `;
        queryParams = [limit];
      }

      const alerts = await this.prisma.$queryRawUnsafe<any[]>(
        baseSql,
        ...queryParams,
      );

      res.json({
        success: true,
        alerts,
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting platform alerts", error);
      res.status(500).json({
        success: false,
        error: "Failed to get platform alerts",
        message: error.message,
      });
    }
  }

  // ============================================
  // SYSTEM ADMINISTRATION
  // ============================================

  /**
   * Schedule platform maintenance
   */
  async scheduleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { type, scheduledAt, duration, description } = req.body;

      // ✅ SECURITY FIX: Use parameterized query for maintenance schedule
      const now = new Date();
      await this.prisma.$executeRawUnsafe(
        `
        INSERT INTO maintenance_schedule (type, scheduled_at, duration_minutes, description, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          type,
          new Date(scheduledAt),
          duration || 60,
          description || "",
          req.user?.id || "system",
          now,
        ],
      );

      res.json({
        success: true,
        message: "Maintenance scheduled successfully",
        maintenance: {
          type,
          scheduledAt,
          duration,
          description,
        },
      });

      logger.info("[PlatformController] Maintenance scheduled", {
        type,
        scheduledAt,
        duration,
        scheduledBy: req.user?.id,
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error scheduling maintenance", error);
      res.status(500).json({
        success: false,
        error: "Failed to schedule maintenance",
        message: error.message,
      });
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(res: Response): Promise<void> {
    try {
      const systemStatus = await this.getDetailedSystemStatus();

      res.json({
        success: true,
        system: systemStatus,
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error getting system status", error);
      res.status(500).json({
        success: false,
        error: "Failed to get system status",
        message: error.message,
      });
    }
  }

  // ============================================
  // EXPORT & REPORTING
  // ============================================

  /**
   * Generate custom platform reports
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const validation = GenerateReportSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        });
        return;
      }

      const { type, period, startDate, endDate, format } = validation.data;

      // Generate report based on type
      let reportData;
      switch (type) {
        case "revenue":
          reportData = await this.generateRevenueReport(
            period,
            startDate,
            endDate,
          );
          break;
        case "usage":
          reportData = await this.generateUsageReport(
            period,
            startDate,
            endDate,
          );
          break;
        case "tenants":
          reportData = await this.generateTenantReport(
            period,
            startDate,
            endDate,
          );
          break;
        case "features":
          reportData = await this.generateFeatureReport(
            period,
            startDate,
            endDate,
          );
          break;
        default:
          throw new Error("Invalid report type");
      }

      res.json({
        success: true,
        report: {
          type,
          period,
          format,
          data: reportData,
          generatedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error("[PlatformController] Error generating report", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate report",
        message: error.message,
      });
    }
  }

  /**
   * Export platform data
   */
  async exportPlatformData(req: Request, res: Response): Promise<void> {
    try {
      const format = (req.query.format as string) || "json";
      const type = (req.query.type as string) || "summary";

      // Generate export data based on type
      const exportData = await this.generateExportData(type);

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="platform-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
        );
        res.send(this.convertToCSV(exportData));
      } else {
        res.json({
          success: true,
          export: {
            type,
            format,
            data: exportData,
            exportedAt: new Date(),
          },
        });
      }
    } catch (error: any) {
      logger.error("[PlatformController] Error exporting platform data", error);
      res.status(500).json({
        success: false,
        error: "Failed to export platform data",
        message: error.message,
      });
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (period) {
      case "last_24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "last_7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last_30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last_90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "last_year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  private async getTotalTenants(startDate: Date, endDate: Date): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN subscription_plan = 'trial' THEN 1 END) as trial,
        COUNT(CASE WHEN subscription_plan = 'basic' THEN 1 END) as basic,
        COUNT(CASE WHEN subscription_plan = 'premium' THEN 1 END) as premium,
        COUNT(CASE WHEN subscription_plan = 'enterprise' THEN 1 END) as enterprise,
        COUNT(CASE WHEN created_at >= $1 AND created_at <= $2 THEN 1 END) as new_in_period
      FROM tenants
      `,
      [startDate, endDate],
    );

    return result[0] || {};
  }

  private async getRevenueMetrics(
    _startDate: Date,
    _endDate: Date,
  ): Promise<any> {
    // Simplified revenue calculation based on subscription plans
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        SUM(CASE 
          WHEN subscription_plan = 'basic' THEN 29
          WHEN subscription_plan = 'premium' THEN 99
          WHEN subscription_plan = 'enterprise' THEN 299
          ELSE 0
        END) as monthly_recurring_revenue,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_subscriptions
      FROM tenants
      WHERE subscription_status = 'active'
    `;

    return result[0] || {};
  }

  private async getUsageMetrics(startDate: Date, endDate: Date): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        COUNT(*) as total_api_calls,
        COUNT(DISTINCT tenant_id) as active_tenants,
        AVG(response_time) as avg_response_time
      FROM api_usage 
      WHERE timestamp >= $1 AND timestamp <= $2
      `,
      [startDate, endDate],
    );

    return result[0] || {};
  }

  private async getConversionMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        COUNT(CASE WHEN subscription_plan = 'trial' THEN 1 END) as trial_users,
        COUNT(CASE WHEN subscription_plan != 'trial' AND created_at >= $1 THEN 1 END) as conversions
      FROM tenants
      WHERE created_at >= $1 AND created_at <= $2
      `,
      [startDate, endDate],
    );

    const data = result[0] || {};
    const conversionRate =
      data.trial_users > 0 ? (data.conversions / data.trial_users) * 100 : 0;

    return { ...data, conversionRate };
  }

  private async getChurnMetrics(startDate: Date, endDate: Date): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        COUNT(CASE WHEN subscription_status = 'cancelled' THEN 1 END) as churned,
        COUNT(*) as total
      FROM tenants
      WHERE updated_at >= $1 AND updated_at <= $2
      `,
      [startDate, endDate],
    );

    const data = result[0] || {};
    const churnRate = data.total > 0 ? (data.churned / data.total) * 100 : 0;

    return { ...data, churnRate };
  }

  private async getSystemMetrics(): Promise<any> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: "healthy",
      uptime: uptime,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpu: {
        usage: 0, // Would implement actual CPU monitoring
      },
      database: {
        status: "connected",
        connections: 0, // Would implement actual connection monitoring
      },
    };
  }

  private async getTenantGrowth(startDate: Date, endDate: Date): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_tenants
      FROM tenants 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [startDate, endDate],
    );

    return result;
  }

  private async getFeatureAdoptionStats(
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        feature_id,
        COUNT(DISTINCT tenant_id) as unique_users,
        COUNT(*) as total_usage
      FROM feature_usage 
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY feature_id
      ORDER BY unique_users DESC
      `,
      [startDate, endDate],
    );

    return result;
  }

  private async getGeographicDistribution(): Promise<any> {
    // This would require geo-location data from IP addresses or tenant profiles
    return [];
  }

  private async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // ✅ SECURITY FIX: Use parameterized query
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 END) as successful_requests
      FROM api_usage 
      WHERE timestamp >= $1 AND timestamp <= $2
      `,
      [startDate, endDate],
    );

    const data = result[0] || {};
    const successRate =
      data.total_requests > 0
        ? (data.successful_requests / data.total_requests) * 100
        : 0;

    return { ...data, successRate };
  }

  private calculateGrowthRate(trends: any[], metric: string): number {
    if (trends.length < 2) return 0;

    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];

    const latestValue = latest[metric] || 0;
    const previousValue = previous[metric] || 0;

    if (previousValue === 0) return 0;

    return ((latestValue - previousValue) / previousValue) * 100;
  }

  private async getDetailedRevenueAnalytics(
    _startDate: Date,
    _endDate: Date,
  ): Promise<any> {
    // Implement detailed revenue analytics
    return {};
  }

  private async getDetailedSystemStatus(): Promise<any> {
    // Implement detailed system status
    return this.getSystemMetrics();
  }

  private async generateRevenueReport(
    _period: string,
    _startDate?: string,
    _endDate?: string,
  ): Promise<any> {
    // Implement revenue report generation
    return {};
  }

  private async generateUsageReport(
    _period: string,
    _startDate?: string,
    _endDate?: string,
  ): Promise<any> {
    // Implement usage report generation
    return {};
  }

  private async generateTenantReport(
    _period: string,
    _startDate?: string,
    _endDate?: string,
  ): Promise<any> {
    // Implement tenant report generation
    return {};
  }

  private async generateFeatureReport(
    _period: string,
    _startDate?: string,
    _endDate?: string,
  ): Promise<any> {
    // Implement feature report generation
    return {};
  }

  private async generateExportData(_type: string): Promise<any> {
    // Implement export data generation
    return {};
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }
}
