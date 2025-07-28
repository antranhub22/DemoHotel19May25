import { GuestAuthService } from '@server/services/guestAuthService';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import {
  buildDateRangeConditions,
  buildSearchConditions,
  buildWhereConditions,
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from '@server/utils/pagination';
import { db } from '@shared/db';
import { transcript } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { and, asc, desc, eq, or } from 'drizzle-orm';
import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const insertTranscriptSchema = z.object({
  call_id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  tenant_id: z.string(),
});

// ✅ SECURITY FIX: Extract tenant ID from request hostname
const extractTenantIdFromRequest = (req: express.Request): string => {
  const hostname = req.get('host') || '';
  const subdomain = GuestAuthService.extractSubdomain(hostname);

  if (subdomain) {
    return `tenant-${subdomain}`;
  }

  // Fallback to default but log warning
  logger.warn(
    `⚠️ [TRANSCRIPTS] Could not extract tenant from hostname: ${hostname}`,
    'Component'
  );
  return 'tenant-default';
};

// ✅ NEW: Get all transcripts with advanced pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const tenantId = extractTenantIdFromRequest(req);

    // Parse query with advanced features
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.limit,
      maxLimit: 100,
      defaultSort: GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.sort,
      allowedSortFields: ['timestamp', 'created_at', 'call_id', 'role'],
      allowedFilters: [...GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.allowedFilters],
      defaultSearchFields: [...GUEST_JOURNEY_DEFAULTS.TRANSCRIPTS.searchFields],
    });

    const { page, limit, offset, sort, order, filters, dateRange, search } =
      queryParams;

    logger.debug(
      `📋 [TRANSCRIPTS] Getting transcripts with pagination (page: ${page}, limit: ${limit}, search: "${search}")`,
      'Component'
    );

    // Build WHERE conditions
    const whereConditions = [];

    // Always filter by tenant for security
    whereConditions.push(eq(transcript.tenant_id, tenantId));

    // Add filter conditions
    const filterConditions = buildWhereConditions(filters, {
      call_id: transcript.call_id,
      role: transcript.role,
    });
    whereConditions.push(...filterConditions);

    // Add search conditions
    if (search) {
      const searchConditions = buildSearchConditions(search, ['content'], {
        content: transcript.content,
      });
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions));
      }
    }

    // Add date range conditions
    if (dateRange.from || dateRange.to) {
      const dateConditions = buildDateRangeConditions(
        dateRange,
        transcript.timestamp
      );
      whereConditions.push(...dateConditions);
    }

    // Build query
    const whereClause =
      whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    // Order by - fix column reference
    const sortColumn =
      sort === 'timestamp'
        ? transcript.timestamp
        : sort === 'created_at'
          ? transcript.timestamp
          : sort === 'call_id'
            ? transcript.call_id
            : sort === 'role'
              ? transcript.role
              : transcript.timestamp;

    const orderClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Get paginated data
    const transcripts = await db
      .select()
      .from(transcript)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: transcript.id })
      .from(transcript)
      .where(whereClause);
    const total = totalCountResult.length;

    logger.debug(
      `✅ [TRANSCRIPTS] Retrieved ${transcripts.length} transcripts (total: ${total}, tenant: ${tenantId})`,
      'Component'
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
      }
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Failed to fetch transcripts:',
      'Component',
      error
    );
    return commonErrors.database(res, 'Failed to fetch transcripts', error);
  }
});

// Get transcripts for a specific call
router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    // ✅ SECURITY: Get tenant ID from hostname for proper isolation
    const tenantId = extractTenantIdFromRequest(req);

    // ✅ NEW: Add pagination for call-specific transcripts
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: 100, // Higher limit for single call
      maxLimit: 500,
      defaultSort: 'timestamp',
      allowedSortFields: ['timestamp', 'role'],
      allowedFilters: ['role'],
      defaultSearchFields: ['content'],
    });

    const { page, limit, offset, sort, order, filters, search } = queryParams;

    logger.debug(
      `📋 [TRANSCRIPTS] Getting transcripts for call: ${callId}, tenant: ${tenantId} (page: ${page})`,
      'Component'
    );

    // Build WHERE conditions
    const whereConditions = [
      eq(transcript.call_id, callId),
      eq(transcript.tenant_id, tenantId), // ✅ SECURITY: Filter by tenant
    ];

    // Add filter conditions
    if (filters.role) {
      whereConditions.push(eq(transcript.role, filters.role));
    }

    // Add search conditions
    if (search) {
      const searchConditions = buildSearchConditions(search, ['content'], {
        content: transcript.content,
      });
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions));
      }
    }

    const whereClause = and(...whereConditions);

    // Order by - fix column reference
    const sortColumn = sort === 'role' ? transcript.role : transcript.timestamp;
    const orderClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const transcripts = await db
      .select()
      .from(transcript)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: transcript.id })
      .from(transcript)
      .where(whereClause);
    const total = totalCountResult.length;

    logger.debug(
      `✅ [TRANSCRIPTS] Found ${transcripts.length} transcripts for call: ${callId}, tenant: ${tenantId}`,
      'Component'
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
      }
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Failed to fetch transcripts:',
      'Component',
      error
    );
    return commonErrors.database(res, 'Failed to fetch transcripts', error);
  }
});

// Store transcript data
router.post('/', async (req, res) => {
  try {
    const { callId, role, content, timestamp } = req.body;

    // Validation
    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ['callId', 'role', 'content']);
    }

    // ✅ SECURITY FIX: Extract tenant ID from hostname instead of trusting client
    const tenantId = extractTenantIdFromRequest(req);

    logger.debug(
      `📝 [TRANSCRIPTS] Storing transcript - Call: ${callId}, Role: ${role}, Tenant: ${tenantId}, Content length: ${content.length}`,
      'Component'
    );

    try {
      const validatedData = insertTranscriptSchema.parse({
        call_id: callId,
        role,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        tenant_id: tenantId, // ✅ SECURITY: Use server-side detected tenant ID
      });

      await db.insert(transcript).values(validatedData);

      logger.debug(
        `✅ [TRANSCRIPTS] Transcript stored successfully for call: ${callId}, tenant: ${tenantId}`,
        'Component'
      );

      return apiResponse.created(
        res,
        {
          callId,
          role,
          tenantId,
          storedAt: new Date().toISOString(),
        },
        'Transcript stored successfully'
      );
    } catch (validationError) {
      logger.error(
        '❌ [TRANSCRIPTS] Validation error:',
        'Component',
        validationError
      );
      return apiResponse.error(
        res,
        400,
        ErrorCodes.VALIDATION_ERROR,
        'Invalid transcript data',
        validationError
      );
    }
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Error storing transcript:',
      'Component',
      error
    );
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      'Failed to store transcript',
      error
    );
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req, res) => {
  try {
    const {
      callId = 'test-call-123',
      role = 'user',
      content = 'Test transcript content',
    } = req.body;

    logger.debug(
      `🧪 [TRANSCRIPTS] Creating test transcript for call: ${callId}`,
      'Component'
    );

    const validatedData = insertTranscriptSchema.parse({
      call_id: callId,
      role,
      content,
      timestamp: new Date(),
      tenant_id: 'mi-nhon-hotel',
    });

    await db.insert(transcript).values(validatedData);

    logger.debug(
      `✅ [TRANSCRIPTS] Test transcript created for call: ${callId}`,
      'Component'
    );

    return apiResponse.created(
      res,
      {
        callId,
        role,
        content,
        timestamp: new Date().toISOString(),
        tenantId: 'mi-nhon-hotel',
      },
      'Test transcript created successfully'
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Failed to create test transcript:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to create test transcript',
      error
    );
  }
});

export default router;
