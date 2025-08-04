import { PrismaClient } from "@prisma/client";
import { apiResponse, commonErrors } from "@server/utils/apiHelpers";
import {
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from "@server/utils/pagination";
import { logger } from "@shared/utils/logger";
import { Request, Response, Router } from "express";

const router = Router();
const prisma = new PrismaClient();

// ✅ NEW: Get all calls with advanced pagination, filtering, and search
router.get("/", async (req: Request, res: Response) => {
  try {
    // Parse query with advanced features
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: GUEST_JOURNEY_DEFAULTS.CALLS.limit,
      maxLimit: 100,
      defaultSort: GUEST_JOURNEY_DEFAULTS.CALLS.sort,
      allowedSortFields: [
        "start_time",
        "end_time",
        "duration",
        "room_number",
        "language",
      ],
      allowedFilters: [...GUEST_JOURNEY_DEFAULTS.CALLS.allowedFilters],
      defaultSearchFields: [...GUEST_JOURNEY_DEFAULTS.CALLS.searchFields],
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
      `📞 [CALLS] Getting calls with pagination (page: ${page}, limit: ${limit}, search: "${search}")`,
      "Routes",
    );

    // Build WHERE conditions for Prisma
    const whereConditions: any = {};

    // Add tenant filtering if provided
    if (tenantId) {
      whereConditions.tenant_id = tenantId;
    }

    // Add filter conditions
    if (filters.room_number) {
      whereConditions.room_number = filters.room_number;
    }
    if (filters.language) {
      whereConditions.language = filters.language;
    }
    if (filters.service_type) {
      whereConditions.service_type = filters.service_type;
    }

    // Add search conditions
    if (search) {
      whereConditions.OR = [
        { room_number: { contains: search, mode: "insensitive" } },
        { service_type: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add date range conditions
    if (dateRange.from || dateRange.to) {
      if (dateRange.from) {
        whereConditions.start_time = { gte: new Date(dateRange.from) };
      }
      if (dateRange.to) {
        whereConditions.start_time = {
          ...whereConditions.start_time,
          lte: new Date(dateRange.to),
        };
      }
    }

    // Build order by clause
    const orderBy: any = {};
    if (sort) {
      orderBy[sort] = order === "asc" ? "asc" : "desc";
    } else {
      orderBy.start_time = "desc";
    }

    // Execute query with Prisma
    const calls = await prisma.call.findMany({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        tenant: true,
        transcripts: true,
      },
    });

    // Get total count
    const totalCount = await prisma.call.count({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = offset + limit < totalCount;
    const hasPrev = page > 1;

    logger.debug(
      `📞 [CALLS] Found ${calls.length} calls (total: ${totalCount}, pages: ${totalPages})`,
      "Routes",
    );

    return apiResponse.success(res, {
      data: calls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    logger.error("❌ [CALLS] Error getting calls:", error);
    return commonErrors.internal(res, "Failed to get calls", error);
  }
});

// ✅ NEW: Update call status
router.patch("/:callId/status", async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;

    if (!status) {
      return commonErrors.validation(res, "Status is required");
    }

    logger.debug(
      `📞 [CALLS] Updating call ${callId} status to ${status}`,
      "Routes",
    );

    const updatedCall = await prisma.call.update({
      where: { call_id_vapi: callId },
      data: { status },
      include: {
        tenant: true,
        transcripts: true,
      },
    });

    logger.debug(
      `📞 [CALLS] Call ${callId} status updated successfully`,
      "Routes",
    );

    return apiResponse.success(res, {
      data: updatedCall,
      message: "Call status updated successfully",
    });
  } catch (error) {
    logger.error("❌ [CALLS] Error updating call status:", error);
    return commonErrors.internal(res, "Failed to update call status", error);
  }
});

// ✅ NEW: Create new call
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      call_id_vapi,
      tenant_id,
      room_number,
      service_type,
      language,
      start_time,
      end_time,
      duration,
      status,
    } = req.body;

    if (!call_id_vapi || !tenant_id) {
      return commonErrors.missingFields(res, ["call_id_vapi", "tenant_id"]);
    }

    logger.debug(`📞 [CALLS] Creating new call ${call_id_vapi}`, "Routes");

    const newCall = await prisma.call.create({
      data: {
        call_id_vapi,
        tenant_id,
        room_number,
        service_type,
        language,
        start_time: start_time ? new Date(start_time) : new Date(),
        end_time: end_time ? new Date(end_time) : null,
        duration,
        status: status || "active",
      },
      include: {
        tenant: true,
        transcripts: true,
      },
    });

    logger.debug(
      `📞 [CALLS] Call ${call_id_vapi} created successfully`,
      "Routes",
    );

    return apiResponse.success(res, {
      data: newCall,
      message: "Call created successfully",
    });
  } catch (error) {
    logger.error("❌ [CALLS] Error creating call:", error);
    return commonErrors.internal(res, "Failed to create call", error);
  }
});

// ✅ NEW: Get call by ID
router.get("/:callId", async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;

    logger.debug(`📞 [CALLS] Getting call ${callId}`, "Routes");

    const call = await prisma.call.findFirst({
      where: { call_id_vapi: callId },
      include: {
        tenant: true,
        transcripts: true,
      },
    });

    if (!call) {
      return commonErrors.notFound(res, "Call", callId);
    }

    // Get transcript count
    const transcriptCount = await prisma.transcript.count({
      where: { call_id: callId },
    });

    logger.debug(
      `📞 [CALLS] Call ${callId} found with ${transcriptCount} transcripts`,
      "Routes",
    );

    return apiResponse.success(res, {
      data: {
        ...call,
        transcript_count: transcriptCount,
      },
    });
  } catch (error) {
    logger.error("❌ [CALLS] Error getting call:", error);
    return commonErrors.internal(res, "Failed to get call", error);
  }
});

export default router;
