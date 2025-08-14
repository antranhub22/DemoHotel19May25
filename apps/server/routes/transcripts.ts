import { GuestAuthService } from "@server/services/guestAuthService";
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from "@server/utils/apiHelpers";
import {
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from "@server/utils/pagination";
// ✅ COMPLETED MIGRATION: Now using Prisma only
import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import express from "express";
import { z } from "zod";

const router = express.Router();

// ✅ PRISMA ONLY: Migration completed successfully
const prisma = new PrismaClient();

// ✅ PRISMA HELPERS: Convert complex Drizzle queries to Prisma
async function getTranscriptsPrisma(params: {
  tenantId: string;
  limit: number;
  offset: number;
  sort: string;
  order: string;
  filters: any;
  search?: string;
  dateRange: { from?: Date; to?: Date };
}) {
  const { tenantId, limit, offset, sort, order, filters, search, dateRange } =
    params;

  // Build Prisma where conditions
  const whereConditions: any = {
    tenant_id: tenantId,
  };

  // Add filters
  if (filters.call_id) whereConditions.call_id = filters.call_id;
  if (filters.role) whereConditions.role = filters.role;

  // Add search
  if (search) {
    whereConditions.content = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Add date range
  if (dateRange.from || dateRange.to) {
    whereConditions.timestamp = {};
    if (dateRange.from) whereConditions.timestamp.gte = dateRange.from;
    if (dateRange.to) whereConditions.timestamp.lte = dateRange.to;
  }

  // Execute queries in parallel for performance
  const [transcripts, totalCount] = await Promise.all([
    prisma.transcript.findMany({
      where: whereConditions,
      orderBy: {
        [sort === "created_at" ? "timestamp" : sort]: order,
      },
      skip: offset,
      take: limit,
    }),
    prisma.transcript.count({
      where: whereConditions,
    }),
  ]);

  return { transcripts, total: totalCount };
}

async function getCallTranscriptsPrisma(params: {
  callId: string;
  tenantId: string;
  limit: number;
  offset: number;
  sort: string;
  order: string;
  filters: any;
  search?: string;
}) {
  const { callId, tenantId, limit, offset, sort, order, filters, search } =
    params;

  const whereConditions: any = {
    call_id: callId,
    tenant_id: tenantId,
  };

  if (filters.role) whereConditions.role = filters.role;
  if (search) {
    whereConditions.content = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [transcripts, totalCount] = await Promise.all([
    prisma.transcript.findMany({
      where: whereConditions,
      orderBy: {
        [sort]: order,
      },
      skip: offset,
      take: limit,
    }),
    prisma.transcript.count({
      where: whereConditions,
    }),
  ]);

  return { transcripts, total: totalCount };
}

// Validation schema
const insertTranscriptSchema = z.object({
  call_id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.date(),
  tenant_id: z.string(),
});

// ✅ SECURITY FIX: Extract tenant ID from request hostname
const extractTenantIdFromRequest = (req: express.Request): string => {
  const hostname = req.get("host") || "";
  const subdomain = GuestAuthService.extractSubdomain(hostname);

  if (subdomain) {
    return `tenant-${subdomain}`;
  }

  // Fallback to default but log warning
  logger.warn(
    `⚠️ [TRANSCRIPTS] Could not extract tenant from hostname: ${hostname}`,
    "Component",
  );
  return "tenant-default";
};

// ✅ NEW: Get all transcripts with advanced pagination, filtering, and search
router.get("/", async (req, res) => {
  try {
    const tenantId = extractTenantIdFromRequest(req);

    // Parse query with advanced features
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.limit,
      maxLimit: 100,
      defaultSort: GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.sort,
      allowedSortFields: ["timestamp", "created_at", "call_id", "role"],
      allowedFilters: [...GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.allowedFilters],
      defaultSearchFields: [...GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.searchFields],
    });

    const { page, limit, offset, sort, order, filters, dateRange, search } =
      queryParams;

    logger.debug(
      `📋 [TRANSCRIPTS] Getting transcripts with pagination (page: ${page}, limit: ${limit}, search: "${search}")`,
      "Component",
    );

    // ✅ PRISMA ONLY: All query logic moved to Prisma helpers

    // ✅ PRISMA ONLY: Clean implementation without fallbacks
    logger.debug("🔄 [TRANSCRIPTS] Using Prisma implementation");
    const result = await getTranscriptsPrisma({
      tenantId,
      limit,
      offset,
      sort,
      order,
      filters,
      search,
      dateRange,
    });
    const transcripts = result.transcripts;
    const total = result.total;

    logger.debug(
      `✅ [TRANSCRIPTS] Retrieved ${transcripts.length} transcripts (total: ${total}, tenant: ${tenantId})`,
      "Component",
    );

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts`,
      {
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
        tenantId,
      },
    );
  } catch (error) {
    logger.error(
      "❌ [TRANSCRIPTS] Failed to fetch transcripts:",
      "Component",
      error,
    );
    return commonErrors.database(res, "Failed to fetch transcripts", error);
  }
});

// Get transcripts for a specific call
router.get("/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, "Call ID is required");
    }

    // ✅ SECURITY: Get tenant ID from hostname for proper isolation
    const tenantId = extractTenantIdFromRequest(req);

    // ✅ NEW: Add pagination for call-specific transcripts
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: 100, // Higher limit for single call
      maxLimit: 500,
      defaultSort: "timestamp",
      allowedSortFields: ["timestamp", "role"],
      allowedFilters: ["role"],
      defaultSearchFields: ["content"],
    });

    const { page, limit, offset, sort, order, filters, search } = queryParams;

    logger.debug(
      `📋 [TRANSCRIPTS] Getting transcripts for call: ${callId}, tenant: ${tenantId} (page: ${page})`,
      "Component",
    );

    // ✅ PRISMA ONLY: All query logic moved to Prisma helpers

    // ✅ PRISMA ONLY: Clean call-specific query implementation
    logger.debug("🔄 [TRANSCRIPTS] Using Prisma for call-specific query");
    const result = await getCallTranscriptsPrisma({
      callId,
      tenantId,
      limit,
      offset,
      sort,
      order,
      filters,
      search,
    });
    const transcripts = result.transcripts;
    const total = result.total;

    logger.debug(
      `✅ [TRANSCRIPTS] Found ${transcripts.length} transcripts for call: ${callId}, tenant: ${tenantId}`,
      "Component",
    );

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts for call`,
      {
        callId,
        tenantId,
        count: transcripts.length,
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
      },
    );
  } catch (error) {
    logger.error(
      "❌ [TRANSCRIPTS] Failed to fetch transcripts:",
      "Component",
      error,
    );
    return commonErrors.database(res, "Failed to fetch transcripts", error);
  }
});

// Store transcript data
router.post("/", async (req, res) => {
  try {
    const { callId, role, content, timestamp } = req.body;

    // Validation
    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ["callId", "role", "content"]);
    }

    // ✅ SECURITY FIX: Extract tenant ID from hostname instead of trusting client
    const tenantId = extractTenantIdFromRequest(req);

    logger.debug(
      `📝 [TRANSCRIPTS] Storing transcript - Call: ${callId}, Role: ${role}, Tenant: ${tenantId}, Content length: ${content.length}`,
      "Component",
    );

    try {
      const validatedData = insertTranscriptSchema.parse({
        call_id: callId,
        role,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        tenant_id: tenantId, // ✅ SECURITY: Use server-side detected tenant ID
      });

      // ✅ PRISMA ONLY: Clean insert operation
      await prisma.transcript.create({
        data: {
          call_id: validatedData.call_id,
          role: validatedData.role,
          content: validatedData.content,
          timestamp: validatedData.timestamp,
          tenant_id: validatedData.tenant_id,
        },
      });

      logger.debug(
        `✅ [TRANSCRIPTS] Transcript stored successfully for call: ${callId}, tenant: ${tenantId}`,
        "Component",
      );

      return apiResponse.created(
        res,
        {
          callId,
          role,
          tenantId,
          storedAt: new Date().toISOString(),
        },
        "Transcript stored successfully",
      );
    } catch (validationError) {
      logger.error(
        "❌ [TRANSCRIPTS] Validation error:",
        "Component",
        validationError,
      );
      return apiResponse.error(
        res,
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid transcript data",
        validationError,
      );
    }
  } catch (error) {
    logger.error(
      "❌ [TRANSCRIPTS] Error storing transcript:",
      "Component",
      error,
    );
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      "Failed to store transcript",
      error,
    );
  }
});

// Test transcript endpoint
router.post("/test-transcript", async (req, res) => {
  try {
    const {
      callId = "test-call-123",
      role = "user",
      content = "Test transcript content",
    } = req.body;

    logger.debug(
      `🧪 [TRANSCRIPTS] Creating test transcript for call: ${callId}`,
      "Component",
    );

    const validatedData = insertTranscriptSchema.parse({
      call_id: callId,
      role,
      content,
      timestamp: new Date(),
      tenant_id: "mi-nhon-hotel",
    });

    // ✅ PRISMA ONLY: Clean test transcript creation
    await prisma.transcript.create({
      data: {
        call_id: validatedData.call_id,
        role: validatedData.role,
        content: validatedData.content,
        timestamp: validatedData.timestamp,
        tenant_id: validatedData.tenant_id,
      },
    });

    logger.debug(
      `✅ [TRANSCRIPTS] Test transcript created for call: ${callId}`,
      "Component",
    );

    return apiResponse.created(
      res,
      {
        callId,
        role,
        content,
        timestamp: new Date().toISOString(),
        tenantId: "mi-nhon-hotel",
      },
      "Test transcript created successfully",
    );
  } catch (error) {
    logger.error(
      "❌ [TRANSCRIPTS] Failed to create test transcript:",
      "Component",
      error,
    );
    return commonErrors.database(
      res,
      "Failed to create test transcript",
      error,
    );
  }
});

export default router;
