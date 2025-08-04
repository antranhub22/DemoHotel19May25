import { PrismaClient } from "@prisma/client";
import { storage } from "@server/storage";
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from "@server/utils/apiHelpers";
import {
  buildDateRangeConditions,
  buildSearchConditions,
  buildWhereConditions,
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from "@server/utils/pagination";
import { logger } from "@shared/utils/logger";
import { Request, Response, Router } from "express";

const router = Router();

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

    // Build WHERE conditions
    const whereConditions = [];

    // Add tenant filtering if provided
    if (tenantId) {
      whereConditions.push(eq(call.tenant_id, tenantId));
    }

    // Add filter conditions
    const filterConditions = buildWhereConditions(filters, {
      room_number: call.room_number,
      language: call.language,
      service_type: call.service_type,
      tenant_id: call.tenant_id,
    });
    whereConditions.push(...filterConditions);

    // Add search conditions
    if (search) {
      const searchConditions = buildSearchConditions(
        search,
        ["room_number", "service_type"],
        {
          room_number: call.room_number,
          service_type: call.service_type,
        },
      );
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions));
      }
    }

    // Add date range conditions
    if (dateRange.from || dateRange.to) {
      const dateConditions = buildDateRangeConditions(
        dateRange,
        call.start_time,
      );
      whereConditions.push(...dateConditions);
    }

    // Build query
    const whereClause =
      whereConditions.length > 0
        ? whereConditions.length > 1
          ? and(...whereConditions)
          : whereConditions[0]
        : undefined;

    // Order by - fix column reference
    const sortColumn =
      sort === "start_time"
        ? call.start_time
        : sort === "end_time"
          ? call.end_time
          : sort === "duration"
            ? call.duration
            : sort === "room_number"
              ? call.room_number
              : sort === "language"
                ? call.language
                : call.start_time;

    const orderClause = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get paginated data
    const calls = await db
      .select()
      .from(call)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountQuery = db.select({ count: call.id }).from(call);

    if (whereClause) {
      totalCountQuery.where(whereClause);
    }

    const totalCountResult = await totalCountQuery;
    const total = totalCountResult.length;

    logger.debug(
      `✅ [CALLS] Retrieved ${calls.length} calls (total: ${total})`,
      "Routes",
    );

    return apiResponse.success(res, calls, `Retrieved ${calls.length} calls`, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
      search: search || null,
      filters: Object.keys(filters).length > 0 ? filters : null,
      sorting: { sort, order },
      tenantId: tenantId || null,
    });
  } catch (error) {
    logger.error("❌ [CALLS] Failed to get calls:", "Routes", error);
    return commonErrors.database(res, "Failed to retrieve calls", error);
  }
});

// Get transcripts by call ID
router.get("/transcripts/:callId", async (req: Request, res: Response) => {
  try {
    const callId = req.params.callId;

    if (!callId) {
      return commonErrors.validation(res, "Call ID is required");
    }

    logger.api(`📞 [Calls] Getting transcripts for call: ${callId}`, "Routes");

    const transcripts = await storage.getTranscriptsByCallId(callId);

    logger.success("📞 [Calls] Transcripts retrieved successfully", "Routes", {
      callId,
      transcriptCount: transcripts.length,
    });

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts for call`,
      { callId, count: transcripts.length },
    );
  } catch (error) {
    logger.error("❌ [Calls] Failed to get transcripts", "Routes", error);
    return commonErrors.database(res, "Failed to retrieve transcripts", error);
  }
});

// Update call duration when call ends
router.patch("/:callId/end", async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body;

    if (!callId) {
      return commonErrors.missingFields(res, ["callId"]);
    }

    if (duration === undefined) {
      return commonErrors.missingFields(res, ["duration"]);
    }

    if (typeof duration !== "number" || duration < 0) {
      return commonErrors.validation(res, "Duration must be a positive number");
    }

    logger.api(
      `📞 [Calls] Ending call: ${callId} with duration: ${duration}s`,
      "Routes",
    );

    // Update call duration and end time using existing schema fields
    await db
      .update(call)
      .set({
        duration: Math.floor(duration),
        end_time: new Date(),
      })
      .where(eq(call.call_id_vapi, callId));

    logger.success(`📞 [Calls] Call ended successfully`, "Routes", {
      callId,
      duration: Math.floor(duration),
    });

    return apiResponse.success(
      res,
      {
        callId,
        duration: Math.floor(duration),
        endTime: new Date().toISOString(),
      },
      "Call ended successfully",
    );
  } catch (error) {
    logger.error("❌ [Calls] Error ending call", "Routes", error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.CALL_NOT_FOUND,
      "Failed to end call",
      error,
    );
  }
});

// Create call endpoint
router.post("/", async (req: Request, res: Response) => {
  try {
    const { call_id_vapi, room_number, language, service_type, tenant_id } =
      req.body;

    if (!call_id_vapi) {
      return commonErrors.missingFields(res, ["call_id_vapi"]);
    }

    logger.api(`📞 [Calls] Creating call: ${call_id_vapi}`, "Routes", {
      room_number,
      language,
      service_type,
      tenant_id,
    });

    // Create call record with all supported fields
    const [newCall] = await db
      .insert(call)
      .values({
        call_id_vapi,
        room_number: room_number || null,
        language: language || "en",
        service_type: service_type || null,
        tenant_id: tenant_id || null,
        start_time: new Date(),
      })
      .returning();

    logger.success("📞 [Calls] Call created successfully", "Routes", {
      callId: newCall.call_id_vapi,
      room_number: newCall.room_number,
    });

    return apiResponse.created(res, newCall, "Call created successfully");
  } catch (error) {
    logger.error("❌ [Calls] Error creating call", "Routes", error);
    return commonErrors.database(res, "Failed to create call", error);
  }
});

// ✅ NEW: Get a specific call by ID with enhanced details
router.get("/:callId", async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, "Call ID is required");
    }

    logger.debug(`📞 [CALLS] Getting call details: ${callId}`, "Routes");

    // Get call details
    const calls = await db
      .select()
      .from(call)
      .where(eq(call.call_id_vapi, callId))
      .limit(1);

    if (calls.length === 0) {
      return commonErrors.notFound(res, "Call", callId);
    }

    const callData = calls[0];

    // Get transcript count for this call
    const transcriptCount = await db
      .select({ count: transcript.id })
      .from(transcript)
      .where(eq(transcript.call_id, callId));

    logger.debug(`✅ [CALLS] Call found: ${callId}`, "Routes");

    return apiResponse.success(
      res,
      {
        ...callData,
        transcriptCount: transcriptCount.length,
      },
      "Call retrieved successfully",
      { callId },
    );
  } catch (error) {
    logger.error("❌ [CALLS] Error getting call:", "Routes", error);
    return commonErrors.database(res, "Failed to retrieve call", error);
  }
});

// Test transcript endpoint
router.post("/test-transcript", async (req: Request, res: Response) => {
  try {
    const { callId, role, content } = req.body;

    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ["callId", "role", "content"]);
    }

    logger.api(
      `📞 [Calls] Creating test transcript for call: ${callId}`,
      "Routes",
      {
        role,
        contentLength: content.length,
      },
    );

    // Store transcript in database
    await storage.addTranscript({
      callId,
      role,
      content,
      tenantId: "default",
      timestamp: Date.now(),
    });

    logger.success(
      "📞 [Calls] Test transcript created successfully",
      "Routes",
      {
        callId,
        role,
      },
    );

    return apiResponse.created(
      res,
      {
        callId,
        role,
        content,
        tenantId: "default",
        timestamp: new Date().toISOString(),
      },
      "Test transcript stored successfully",
    );
  } catch (error) {
    logger.error("❌ [Calls] Failed to store test transcript", "Routes", error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      "Failed to store test transcript",
      error,
    );
  }
});

export default router;
