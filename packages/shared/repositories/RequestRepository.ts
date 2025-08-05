/**
 * 🛎️ REQUEST REPOSITORY
 *
 * Specialized repository for service requests with:
 * - Advanced filtering and search
 * - Status management
 * - Room-based queries
 * - Analytics support
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from "./BaseRepository";

export interface RequestFilters {
  status?: string;
  roomNumber?: string;
  assignedTo?: string;
  priority?: string;
  orderType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface RequestAnalytics {
  totalRequests: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byOrderType: Record<string, number>;
  averageCompletionTime: number;
  topRooms: Array<{ roomNumber: string; count: number }>;
}

export class RequestRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, "request", "tenant_id");
  }

  protected getModel() {
    return this.prisma.request;
  }

  /**
   * 🎯 FIND REQUESTS WITH ADVANCED FILTERING
   */
  async findWithFilters(
    filters: RequestFilters & PaginationOptions,
    tenantId: string,
  ): Promise<PaginatedResult<any>> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestRepository] Finding with filters", "Repository", {
        filters,
        tenantId,
      });

      const {
        status,
        roomNumber,
        assignedTo,
        priority,
        orderType,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortDirection = "desc",
      } = filters;

      // Build complex where clause
      const where: any = {
        tenant_id: tenantId,
      };

      if (status) where.status = status;
      if (roomNumber) where.room_number = roomNumber;
      if (assignedTo) where.assigned_to = assignedTo;
      if (priority) where.priority = priority;
      if (orderType) where.order_type = orderType;

      // Date range filtering
      if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom) where.created_at.gte = dateFrom;
        if (dateTo) where.created_at.lte = dateTo;
      }

      // Text search across multiple fields
      if (search) {
        where.OR = [
          { request_content: { contains: search, mode: "insensitive" } },
          { guest_name: { contains: search, mode: "insensitive" } },
          { room_number: { contains: search, mode: "insensitive" } },
          { order_id: { contains: search, mode: "insensitive" } },
        ];
      }

      const result = await this.findMany({
        where,
        page,
        limit,
        sortBy,
        sortDirection,
        tenantId,
        include: {
          order_items: true,
          message: {
            select: {
              id: true,
              content: true,
              created_at: true,
            },
            orderBy: {
              created_at: "desc",
            },
            take: 5,
          },
        },
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[RequestRepository] Filtered search completed",
        "Repository",
        {
          resultCount: result.data.length,
          total: result.pagination.total,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error("[RequestRepository] FindWithFilters error", "Repository", {
        filters,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET REQUESTS BY ROOM NUMBER
   */
  async findByRoomNumber(
    roomNumber: string,
    tenantId: string,
    options: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<any>> {
    logger.debug("[RequestRepository] Finding by room number", "Repository", {
      roomNumber,
      tenantId,
    });

    return await this.findWithFilters(
      {
        roomNumber,
        ...options,
      },
      tenantId,
    );
  }

  /**
   * 🎯 GET PENDING REQUESTS FOR STAFF DASHBOARD
   */
  async findPendingRequests(
    tenantId: string,
    assignedTo?: string,
    options: PaginationOptions = { page: 1, limit: 50 },
  ): Promise<PaginatedResult<any>> {
    logger.debug("[RequestRepository] Finding pending requests", "Repository", {
      tenantId,
      assignedTo,
    });

    const filters: RequestFilters & PaginationOptions = {
      status: "Đã ghi nhận", // Pending status
      ...options,
      sortBy: "priority",
      sortDirection: "desc",
    };

    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    return await this.findWithFilters(filters, tenantId);
  }

  /**
   * 🎯 UPDATE REQUEST STATUS WITH AUDIT
   */
  async updateStatus(
    id: number,
    status: string,
    tenantId: string,
    userId?: string,
    notes?: string,
  ): Promise<any | null> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[RequestRepository] Updating request status",
        "Repository",
        {
          id,
          status,
          tenantId,
          userId,
        },
      );

      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      // Set completion time if status indicates completion
      if (status === "Hoàn thành" || status === "Completed") {
        updateData.completed_at = new Date();
      }

      // Update assigned user if provided
      if (userId) {
        updateData.assigned_to = userId;
      }

      const result = await this.update(id, updateData, tenantId);

      // Log status change for audit
      logger.info("[RequestRepository] Request status updated", "Repository", {
        requestId: id,
        oldStatus: "unknown", // Would need to fetch old status first
        newStatus: status,
        userId,
        notes,
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[RequestRepository] Status update completed",
        "Repository",
        {
          id,
          status,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error("[RequestRepository] UpdateStatus error", "Repository", {
        id,
        status,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET ANALYTICS DATA
   */
  async getAnalytics(
    tenantId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<RequestAnalytics> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestRepository] Getting analytics", "Repository", {
        tenantId,
        dateFrom,
        dateTo,
      });

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom || dateTo) {
        dateFilter.created_at = {};
        if (dateFrom) dateFilter.created_at.gte = dateFrom;
        if (dateTo) dateFilter.created_at.lte = dateTo;
      }

      const where = {
        tenant_id: tenantId,
        ...dateFilter,
      };

      // Execute multiple queries in parallel
      const [
        totalRequests,
        statusCounts,
        priorityCounts,
        orderTypeCounts,
        completedRequests,
        topRooms,
      ] = await Promise.all([
        // Total requests
        this.prisma.request.count({ where }),

        // Status breakdown
        this.prisma.request.groupBy({
          by: ["status"],
          where,
          _count: { status: true },
        }),

        // Priority breakdown
        this.prisma.request.groupBy({
          by: ["priority"],
          where,
          _count: { priority: true },
        }),

        // Order type breakdown
        this.prisma.request.groupBy({
          by: ["order_type"],
          where,
          _count: { order_type: true },
        }),

        // Completed requests for completion time calculation
        this.prisma.request.findMany({
          where: {
            ...where,
            completed_at: { not: null },
            created_at: { not: null },
          },
          select: {
            created_at: true,
            completed_at: true,
          },
        }),

        // Top rooms by request count
        this.prisma.request.groupBy({
          by: ["room_number"],
          where,
          _count: { room_number: true },
          orderBy: {
            _count: {
              room_number: "desc",
            },
          },
          take: 10,
        }),
      ]);

      // Process results
      const byStatus = statusCounts.reduce(
        (acc, item) => {
          acc[item.status || "Unknown"] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byPriority = priorityCounts.reduce(
        (acc, item) => {
          acc[item.priority || "Unknown"] = item._count.priority;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byOrderType = orderTypeCounts.reduce(
        (acc, item) => {
          acc[item.order_type || "Unknown"] = item._count.order_type;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Calculate average completion time
      let averageCompletionTime = 0;
      if (completedRequests.length > 0) {
        const totalTime = completedRequests.reduce((sum, req) => {
          if (req.completed_at && req.created_at) {
            return (
              sum + (req.completed_at.getTime() - req.created_at.getTime())
            );
          }
          return sum;
        }, 0);
        averageCompletionTime =
          totalTime / completedRequests.length / (1000 * 60); // Minutes
      }

      const topRoomsData = topRooms.map((room) => ({
        roomNumber: room.room_number || "Unknown",
        count: room._count.room_number,
      }));

      const duration = Date.now() - startTime;
      logger.success("[RequestRepository] Analytics completed", "Repository", {
        totalRequests,
        statusCount: Object.keys(byStatus).length,
        duration: `${duration}ms`,
      });

      return {
        totalRequests,
        byStatus,
        byPriority,
        byOrderType,
        averageCompletionTime,
        topRooms: topRoomsData,
      };
    } catch (error) {
      logger.error("[RequestRepository] GetAnalytics error", "Repository", {
        tenantId,
        dateFrom,
        dateTo,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 CREATE REQUEST WITH ORDER ITEMS
   */
  async createWithOrderItems(
    requestData: any,
    orderItems: any[],
    tenantId: string,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      logger.debug(
        "[RequestRepository] Creating request with order items",
        "Repository",
        {
          tenantId,
          orderItemsCount: orderItems.length,
        },
      );

      const result = await this.executeTransaction(async (tx) => {
        // Create the request
        const request = await tx.request.create({
          data: {
            ...requestData,
            tenant_id: tenantId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create order items if provided
        if (orderItems.length > 0) {
          const orderItemsData = orderItems.map((item) => ({
            ...item,
            request_id: request.id,
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await tx.order_items.createMany({
            data: orderItemsData,
          });
        }

        // Fetch complete request with items
        return await tx.request.findUnique({
          where: { id: request.id },
          include: {
            order_items: true,
          },
        });
      });

      const duration = Date.now() - startTime;
      logger.success(
        "[RequestRepository] Request with order items created",
        "Repository",
        {
          requestId: result?.id,
          orderItemsCount: orderItems.length,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "[RequestRepository] CreateWithOrderItems error",
        "Repository",
        {
          tenantId,
          orderItemsCount: orderItems.length,
          error,
        },
      );
      throw error;
    }
  }
}
