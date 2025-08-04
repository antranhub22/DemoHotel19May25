import { PrismaClient } from "@prisma/client";
import { apiResponse, commonErrors } from "@server/utils/apiHelpers";
import {
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from "@server/utils/pagination";
import { insertCallSummarySchema } from "@shared/schema";
import { logger } from "@shared/utils/logger";
import express from "express";

// ✅ DETAILED MIGRATION: Initialize Prisma client for call_summaries operations
const prisma = new PrismaClient();

const router = express.Router();

// ============================================
// CALL SUMMARIES ROUTES - RESTful Design
// ============================================

// GET /api/summaries/:callId - Get summaries for a specific call
router.get("/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, "Call ID is required");
    }

    // ✅ NEW: Add pagination for call-specific summaries
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: 10, // Smaller limit for single call
      maxLimit: 50,
      defaultSort: "timestamp",
      allowedSortFields: ["timestamp", "room_number", "duration"],
      allowedFilters: ["room_number"],
      defaultSearchFields: ["content"],
    });

    const { page, limit, offset, sort, order, filters, search } = queryParams;

    logger.debug(
      `🔍 [SUMMARIES] Getting summaries for call: ${callId} (page: ${page})`,
      "Summaries",
    );

    // ✅ DETAILED MIGRATION: Build Prisma where conditions properly
    const whereConditions: any = { call_id: callId };

    // Add filter conditions using Prisma syntax
    if (filters.room_number) {
      whereConditions.room_number = filters.room_number;
    }

    // Add search conditions using Prisma full-text search
    if (search) {
      whereConditions.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ✅ DETAILED MIGRATION: Prisma ordering and pagination
    const orderBy: any = {};
    const sortField =
      sort === "room_number"
        ? "room_number"
        : sort === "duration"
          ? "duration"
          : "timestamp";
    orderBy[sortField] = order || "desc";

    // Execute Prisma queries with proper error handling
    const [summaries, total] = await Promise.all([
      prisma.call_summaries.findMany({
        where: whereConditions,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.call_summaries.count({
        where: whereConditions,
      }),
    ]);

    logger.debug(
      `📋 [SUMMARIES] Found ${summaries.length} summaries for call: ${callId}`,
      "Summaries",
    );

    // ✅ FRONTEND COMPATIBILITY: Return single summary object if only requesting without pagination params
    // This matches what CallDetails.tsx expects
    if (
      summaries.length === 1 &&
      !search &&
      Object.keys(filters).length === 0
    ) {
      const summary = summaries[0];
      return apiResponse.success(
        res,
        {
          id: summary.id,
          callId: summary.call_id,
          content: summary.content,
          timestamp: summary.timestamp,
          roomNumber: summary.room_number,
          duration: summary.duration,
        },
        `Retrieved summary for call ${callId}`,
      );
    }

    // For multiple summaries or when using filters/search, return full array response
    return apiResponse.success(
      res,
      summaries,
      `Retrieved ${summaries.length} summaries for call`,
      {
        callId,
        count: summaries.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
        search: search || null,
        filters: Object.keys(filters).length > 0 ? filters : null,
      },
    );
  } catch (error) {
    logger.error(
      "❌ [SUMMARIES] Error fetching summaries:",
      "Summaries",
      error,
    );
    return commonErrors.database(res, "Failed to fetch summaries", error);
  }
});

// POST /api/summaries/ - Create a new call summary
router.post("/", async (req, res) => {
  try {
    const { callId, content, roomNumber, duration } = req.body;

    if (!callId || !content) {
      return commonErrors.missingFields(res, ["callId", "content"]);
    }

    logger.debug(
      `📋 [SUMMARIES] Creating summary for call: ${callId}`,
      "Summaries",
    );

    try {
      // Validate and store summary
      const validatedData = insertCallSummarySchema.parse({
        call_id: callId,
        content,
        room_number: roomNumber || null,
        duration: duration || null,
        timestamp: new Date(),
      });

      // ✅ DETAILED MIGRATION: Create summary using Prisma
      const newSummary = await prisma.call_summaries.create({
        data: validatedData,
      });

      logger.debug(
        `✅ [SUMMARIES] Summary created successfully for call: ${callId}`,
        "Summaries",
      );

      return apiResponse.created(
        res,
        {
          id: newSummary.id,
          callId,
          roomNumber,
          duration,
          createdAt: newSummary.timestamp,
        },
        "Call summary created successfully",
      );
    } catch (validationError) {
      return commonErrors.validation(
        res,
        "Invalid summary data",
        validationError,
      );
    }
  } catch (error) {
    logger.error("❌ [SUMMARIES] Error creating summary:", "Summaries", error);
    return commonErrors.database(res, "Failed to create summary", error);
  }
});

// GET /api/summaries/recent/:hours - Get summaries from the last X hours
router.get("/recent/:hours", async (req, res) => {
  try {
    const { hours } = req.params;
    const hoursNumber = parseInt(hours, 10);

    if (isNaN(hoursNumber) || hoursNumber <= 0) {
      return commonErrors.validation(res, "Hours must be a positive number");
    }

    logger.debug(
      `📋 [SUMMARIES] Getting recent summaries from last ${hoursNumber} hours`,
      "Summaries",
    );

    // Use storage method to get recent summaries
    const storage = new (await import("@server/storage")).DatabaseStorage();
    const summaries = await storage.getRecentCallSummaries(hoursNumber);

    // Transform summaries to match frontend expectations
    const transformedSummaries = summaries.map((summary) => ({
      id: summary.id,
      callId: summary.call_id,
      content: summary.content,
      timestamp: summary.timestamp,
      roomNumber: summary.room_number,
      duration: summary.duration,
    }));

    logger.debug(
      `✅ [SUMMARIES] Found ${transformedSummaries.length} recent summaries`,
      "Summaries",
    );

    return apiResponse.success(
      res,
      {
        summaries: transformedSummaries,
        count: transformedSummaries.length,
        timeframe: hoursNumber,
      },
      `Retrieved ${transformedSummaries.length} summaries from last ${hoursNumber} hours`,
    );
  } catch (error) {
    logger.error(
      "❌ [SUMMARIES] Error fetching recent summaries:",
      "Summaries",
      error,
    );
    return commonErrors.database(
      res,
      "Failed to fetch recent summaries",
      error,
    );
  }
});

// GET /api/summaries/ - Get all summaries with advanced pagination, filtering, and search
router.get("/", async (req, res) => {
  try {
    // Parse query with advanced features
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: GUEST_JOURNEY_DEFAULTS.SUMMARIES.limit,
      maxLimit: 100,
      defaultSort: GUEST_JOURNEY_DEFAULTS.SUMMARIES.sort,
      allowedSortFields: ["timestamp", "call_id", "room_number", "duration"],
      allowedFilters: [...GUEST_JOURNEY_DEFAULTS.SUMMARIES.allowedFilters],
      defaultSearchFields: [...GUEST_JOURNEY_DEFAULTS.SUMMARIES.searchFields],
    });

    const {
      page,
      limit,
      offset,
      sort,
      order,
      filters,
      dateRange,
      search,
      tenantId,
    } = queryParams;

    logger.debug(
      `📋 [SUMMARIES] Getting summaries with pagination (page: ${page}, limit: ${limit}, search: "${search}")`,
      "Summaries",
    );

    // Build WHERE conditions
    const whereConditions = [];

    // Add tenant filtering if provided
    if (tenantId) {
      // Note: Assuming tenant filtering via call relationship
      logger.debug(
        `🏨 [SUMMARIES] Filtering by tenant: ${tenantId}`,
        "Summaries",
      );
      // TODO: Add JOIN with calls table for tenant filtering when schema supports it
    }

    // ✅ SMART MIGRATION: Use direct Prisma where object instead of complex helpers
    const whereClause: any = {};

    // Add filters directly
    if (filters.call_id) whereClause.call_id = filters.call_id;
    if (filters.room_number) whereClause.room_number = filters.room_number;
    if (filters.duration) whereClause.duration = parseInt(filters.duration);

    // Add search using Prisma
    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Add date range
    if (dateRange.from || dateRange.to) {
      const dateFilter: any = {};
      if (dateRange.from) dateFilter.gte = new Date(dateRange.from);
      if (dateRange.to) dateFilter.lte = new Date(dateRange.to);
      whereClause.timestamp = dateFilter;
    }

    // ✅ SMART MIGRATION: Direct Prisma orderBy
    const orderClause: any = {};
    const sortField =
      sort === "call_id"
        ? "call_id"
        : sort === "room_number"
          ? "room_number"
          : sort === "duration"
            ? "duration"
            : "timestamp";
    orderClause[sortField] = order || "desc";

    // ✅ SMART MIGRATION: Get paginated data using Prisma
    const summaries = await prisma.call_summaries.findMany({
      where: whereClause,
      orderBy: orderClause,
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    // ✅ DETAILED MIGRATION: Get count using Prisma
    const totalCount = await prisma.call_summaries.count({
      where: whereClause,
    });

    // Count query already executed above

    // Total count already calculated above

    logger.debug(
      `✅ [SUMMARIES] Retrieved ${summaries.length} summaries (total: ${totalCount})`,
      "Summaries",
    );

    return apiResponse.success(
      res,
      summaries,
      `Retrieved ${summaries.length} summaries`,
      {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
        search: search || null,
        filters: Object.keys(filters).length > 0 ? filters : null,
        sorting: { sort, order },
        tenantId: tenantId || null,
      },
    );
  } catch (error) {
    logger.error(
      "❌ [SUMMARIES] Error fetching summaries:",
      "Summaries",
      error,
    );
    return commonErrors.database(res, "Failed to fetch summaries", error);
  }
});

// DELETE /api/summaries/:id - Delete a specific summary (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return commonErrors.validation(res, "Summary ID is required");
    }

    logger.debug(`🗑️ [SUMMARIES] Deleting summary: ${id}`, "Summaries");

    // ✅ DETAILED MIGRATION: Delete using Prisma with error handling
    try {
      const deletedSummary = await prisma.call_summaries.delete({
        where: {
          id: parseInt(id),
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return commonErrors.notFound(res, "Summary", id);
      }
      throw error;
    }

    logger.debug(
      `✅ [SUMMARIES] Summary deleted successfully: ${id}`,
      "Summaries",
    );

    return apiResponse.success(
      res,
      { deletedId: id, deletedAt: new Date().toISOString() },
      "Summary deleted successfully",
    );
  } catch (error) {
    logger.error("❌ [SUMMARIES] Error deleting summary:", "Summaries", error);
    return commonErrors.database(res, "Failed to delete summary", error);
  }
});

export default router;
