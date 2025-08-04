/**
 * 📞 CALL REPOSITORY
 *
 * Specialized repository for voice calls with:
 * - Vapi.ai integration support
 * - Call analytics and reporting
 * - Language-based filtering
 * - Performance metrics
 */

import { PrismaClient } from "../../../generated/prisma";
import { logger } from "../utils/logger";
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from "./BaseRepository";

export interface CallFilters {
  language?: string;
  serviceType?: string;
  roomNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minDuration?: number;
  maxDuration?: number;
}

export interface CallAnalytics {
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  byLanguage: Record<string, number>;
  byServiceType: Record<string, number>;
  byHour: Record<string, number>;
  topRooms: Array<{ roomNumber: string; count: number }>;
  successRate: number;
}

export class CallRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, "call", "tenant_id");
  }

  protected getModel() {
    return this.prisma.call;
  }

  /**
   * 🎯 FIND CALLS WITH ADVANCED FILTERING
   */
  async findWithFilters(
    filters: CallFilters & PaginationOptions,
    tenantId: string,
  ): Promise<PaginatedResult<any>> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Finding with filters", "Repository", {
        filters,
        tenantId,
      });

      const {
        language,
        serviceType,
        roomNumber,
        dateFrom,
        dateTo,
        minDuration,
        maxDuration,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortDirection = "desc",
      } = filters;

      // Build complex where clause
      const where: any = {
        tenant_id: tenantId,
      };

      if (language) where.language = language;
      if (serviceType) where.service_type = serviceType;
      if (roomNumber) where.room_number = roomNumber;

      // Date range filtering
      if (dateFrom || dateTo) {
        where.start_time = {};
        if (dateFrom) where.start_time.gte = dateFrom;
        if (dateTo) where.start_time.lte = dateTo;
      }

      // Duration filtering
      if (minDuration !== undefined || maxDuration !== undefined) {
        where.duration = {};
        if (minDuration !== undefined) where.duration.gte = minDuration;
        if (maxDuration !== undefined) where.duration.lte = maxDuration;
      }

      const result = await this.findMany({
        where,
        page,
        limit,
        sortBy,
        sortDirection,
        tenantId,
        select: [
          "id",
          "call_id_vapi",
          "room_number",
          "language",
          "service_type",
          "start_time",
          "end_time",
          "duration",
          "created_at",
        ],
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[CallRepository] Filtered search completed",
        "Repository",
        {
          resultCount: result.data.length,
          total: result.pagination.total,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error("[CallRepository] FindWithFilters error", "Repository", {
        filters,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 FIND CALL BY VAPI ID
   */
  async findByVapiId(
    vapiCallId: string,
    tenantId?: string,
  ): Promise<any | null> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Finding by Vapi ID", "Repository", {
        vapiCallId,
        tenantId,
      });

      const where: any = {
        call_id_vapi: vapiCallId,
      };

      if (tenantId) {
        where.tenant_id = tenantId;
      }

      const result = await this.prisma.call.findUnique({
        where: {
          call_id_vapi: vapiCallId,
        },
        include: {
          tenants: {
            select: {
              id: true,
              hotel_name: true,
              subdomain: true,
            },
          },
        },
      });

      const duration = Date.now() - startTime;
      logger.debug("[CallRepository] FindByVapiId completed", "Repository", {
        found: !!result,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[CallRepository] FindByVapiId error", "Repository", {
        vapiCallId,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET RECENT CALLS
   */
  async findRecentCalls(
    tenantId: string,
    hours: number = 24,
    limit: number = 50,
  ): Promise<any[]> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Finding recent calls", "Repository", {
        tenantId,
        hours,
        limit,
      });

      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - hours);

      const result = await this.prisma.call.findMany({
        where: {
          tenant_id: tenantId,
          created_at: {
            gte: timeThreshold,
          },
        },
        orderBy: {
          created_at: "desc",
        },
        take: limit,
        select: {
          id: true,
          call_id_vapi: true,
          room_number: true,
          language: true,
          service_type: true,
          start_time: true,
          end_time: true,
          duration: true,
          created_at: true,
        },
      });

      const duration = Date.now() - startTime;
      logger.success("[CallRepository] Recent calls retrieved", "Repository", {
        count: result.length,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[CallRepository] FindRecentCalls error", "Repository", {
        tenantId,
        hours,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET CALL ANALYTICS
   */
  async getAnalytics(
    tenantId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<CallAnalytics> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Getting call analytics", "Repository", {
        tenantId,
        dateFrom,
        dateTo,
      });

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom || dateTo) {
        dateFilter.start_time = {};
        if (dateFrom) dateFilter.start_time.gte = dateFrom;
        if (dateTo) dateFilter.start_time.lte = dateTo;
      }

      const where = {
        tenant_id: tenantId,
        ...dateFilter,
      };

      // Execute multiple queries in parallel
      const [
        totalCalls,
        durationStats,
        languageCounts,
        serviceTypeCounts,
        hourlyDistribution,
        topRooms,
        successfulCalls,
      ] = await Promise.all([
        // Total calls
        this.prisma.call.count({ where }),

        // Duration statistics
        this.prisma.call.aggregate({
          where: {
            ...where,
            duration: { not: null },
          },
          _sum: { duration: true },
          _avg: { duration: true },
        }),

        // Language breakdown
        this.prisma.call.groupBy({
          by: ["language"],
          where,
          _count: { language: true },
        }),

        // Service type breakdown
        this.prisma.call.groupBy({
          by: ["service_type"],
          where,
          _count: { service_type: true },
        }),

        // Hourly distribution
        this.prisma.$queryRaw`
          SELECT EXTRACT(HOUR FROM start_time) as hour, COUNT(*) as count
          FROM call 
          WHERE tenant_id = ${tenantId}
          ${dateFrom ? `AND start_time >= ${dateFrom}` : ""}
          ${dateTo ? `AND start_time <= ${dateTo}` : ""}
          GROUP BY EXTRACT(HOUR FROM start_time)
          ORDER BY hour
        `,

        // Top rooms by call count
        this.prisma.call.groupBy({
          by: ["room_number"],
          where: {
            ...where,
            room_number: { not: null },
          },
          _count: { room_number: true },
          orderBy: {
            _count: {
              room_number: "desc",
            },
          },
          take: 10,
        }),

        // Successful calls (calls with duration > 0)
        this.prisma.call.count({
          where: {
            ...where,
            duration: { gt: 0 },
          },
        }),
      ]);

      // Process results
      const byLanguage = languageCounts.reduce(
        (acc, item) => {
          acc[item.language || "Unknown"] = item._count.language;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byServiceType = serviceTypeCounts.reduce(
        (acc, item) => {
          acc[item.service_type || "Unknown"] = item._count.service_type;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byHour = (hourlyDistribution as any[]).reduce(
        (acc, item) => {
          acc[item.hour] = parseInt(item.count);
          return acc;
        },
        {} as Record<string, number>,
      );

      const topRoomsData = topRooms.map((room) => ({
        roomNumber: room.room_number || "Unknown",
        count: room._count.room_number,
      }));

      const duration = Date.now() - startTime;
      logger.success("[CallRepository] Analytics completed", "Repository", {
        totalCalls,
        duration: `${duration}ms`,
      });

      return {
        totalCalls,
        totalDuration: durationStats._sum.duration || 0,
        averageDuration: durationStats._avg.duration || 0,
        byLanguage,
        byServiceType,
        byHour,
        topRooms: topRoomsData,
        successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
      };
    } catch (error) {
      logger.error("[CallRepository] GetAnalytics error", "Repository", {
        tenantId,
        dateFrom,
        dateTo,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 UPDATE CALL DURATION
   */
  async updateDuration(
    callIdVapi: string,
    duration: number,
    endTime?: Date,
  ): Promise<any | null> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Updating call duration", "Repository", {
        callIdVapi,
        duration,
        endTime,
      });

      const updateData: any = {
        duration,
        updated_at: new Date(),
      };

      if (endTime) {
        updateData.end_time = endTime;
      }

      const result = await this.prisma.call.update({
        where: {
          call_id_vapi: callIdVapi,
        },
        data: updateData,
      });

      const updateDuration = Date.now() - startTime;
      logger.success("[CallRepository] Duration updated", "Repository", {
        callIdVapi,
        duration,
        updateDuration: `${updateDuration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[CallRepository] UpdateDuration error", "Repository", {
        callIdVapi,
        duration,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 BATCH CREATE CALLS
   */
  async createBatch(calls: any[], tenantId: string): Promise<number> {
    const startTime = Date.now();

    try {
      logger.debug("[CallRepository] Creating batch calls", "Repository", {
        count: calls.length,
        tenantId,
      });

      const callsData = calls.map((call) => ({
        ...call,
        tenant_id: tenantId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const result = await this.createMany(callsData, tenantId);

      const duration = Date.now() - startTime;
      logger.success("[CallRepository] Batch calls created", "Repository", {
        created: result,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[CallRepository] CreateBatch error", "Repository", {
        count: calls.length,
        tenantId,
        error,
      });
      throw error;
    }
  }
}
