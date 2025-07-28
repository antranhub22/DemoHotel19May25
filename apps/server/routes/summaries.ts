import { apiResponse, commonErrors } from '@server/utils/apiHelpers';
import {
  buildDateRangeConditions,
  buildSearchConditions,
  buildWhereConditions,
  GUEST_JOURNEY_DEFAULTS,
  parseCompleteQuery,
} from '@server/utils/pagination';
import { call_summaries, db } from '@shared/db';
import { insertCallSummarySchema } from '@shared/schema';
import { logger } from '@shared/utils/logger';
import { and, asc, desc, eq, or } from 'drizzle-orm';
import express from 'express';

const router = express.Router();

// ============================================
// CALL SUMMARIES ROUTES - RESTful Design
// ============================================

// GET /api/summaries/:callId - Get summaries for a specific call
router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    // ✅ NEW: Add pagination for call-specific summaries
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: 10, // Smaller limit for single call
      maxLimit: 50,
      defaultSort: 'timestamp',
      allowedSortFields: ['timestamp', 'room_number', 'duration'],
      allowedFilters: ['room_number'],
      defaultSearchFields: ['content'],
    });

    const { page, limit, offset, sort, order, filters, search } = queryParams;

    logger.debug(
      `🔍 [SUMMARIES] Getting summaries for call: ${callId} (page: ${page})`,
      'Summaries'
    );

    // Build WHERE conditions
    const whereConditions = [eq(call_summaries.call_id, callId)];

    // Add filter conditions
    if (filters.room_number) {
      whereConditions.push(eq(call_summaries.room_number, filters.room_number));
    }

    // Add search conditions
    if (search) {
      const searchConditions = buildSearchConditions(search, ['content'], {
        content: call_summaries.content,
      });
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions));
      }
    }

    const whereClause = and(...whereConditions);

    // Order by - fix column reference
    const sortColumn =
      sort === 'room_number'
        ? call_summaries.room_number
        : sort === 'duration'
          ? call_summaries.duration
          : call_summaries.timestamp;

    const orderClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const summaries = await db
      .select()
      .from(call_summaries)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: call_summaries.id })
      .from(call_summaries)
      .where(whereClause);
    const total = totalCountResult.length;

    logger.debug(
      `📋 [SUMMARIES] Found ${summaries.length} summaries for call: ${callId}`,
      'Summaries'
    );

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
      '❌ [SUMMARIES] Error fetching summaries:',
      'Summaries',
      error
    );
    return commonErrors.database(res, 'Failed to fetch summaries', error);
  }
});

// POST /api/summaries/ - Create a new call summary
router.post('/', async (req, res) => {
  try {
    const { callId, content, roomNumber, duration } = req.body;

    if (!callId || !content) {
      return commonErrors.missingFields(res, ['callId', 'content']);
    }

    logger.debug(
      `📋 [SUMMARIES] Creating summary for call: ${callId}`,
      'Summaries'
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

      const [newSummary] = await db
        .insert(call_summaries)
        .values(validatedData)
        .returning();

      logger.debug(
        `✅ [SUMMARIES] Summary created successfully for call: ${callId}`,
        'Summaries'
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
        'Call summary created successfully'
      );
    } catch (validationError) {
      return commonErrors.validation(
        res,
        'Invalid summary data',
        validationError
      );
    }
  } catch (error) {
    logger.error('❌ [SUMMARIES] Error creating summary:', 'Summaries', error);
    return commonErrors.database(res, 'Failed to create summary', error);
  }
});

// GET /api/summaries/ - Get all summaries with advanced pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    // Parse query with advanced features
    const queryParams = parseCompleteQuery(req.query, {
      defaultLimit: GUEST_JOURNEY_DEFAULTS.SUMMARIES.limit,
      maxLimit: 100,
      defaultSort: GUEST_JOURNEY_DEFAULTS.SUMMARIES.sort,
      allowedSortFields: ['timestamp', 'call_id', 'room_number', 'duration'],
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
      'Summaries'
    );

    // Build WHERE conditions
    const whereConditions = [];

    // Add tenant filtering if provided
    if (tenantId) {
      // Note: Assuming tenant filtering via call relationship
      logger.debug(
        `🏨 [SUMMARIES] Filtering by tenant: ${tenantId}`,
        'Summaries'
      );
      // TODO: Add JOIN with calls table for tenant filtering when schema supports it
    }

    // Add filter conditions
    const filterConditions = buildWhereConditions(filters, {
      call_id: call_summaries.call_id,
      room_number: call_summaries.room_number,
    });
    whereConditions.push(...filterConditions);

    // Add search conditions
    if (search) {
      const searchConditions = buildSearchConditions(search, ['content'], {
        content: call_summaries.content,
      });
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions));
      }
    }

    // Add date range conditions
    if (dateRange.from || dateRange.to) {
      const dateConditions = buildDateRangeConditions(
        dateRange,
        call_summaries.timestamp
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
      sort === 'call_id'
        ? call_summaries.call_id
        : sort === 'room_number'
          ? call_summaries.room_number
          : sort === 'duration'
            ? call_summaries.duration
            : call_summaries.timestamp;

    const orderClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Get paginated data
    const summaries = await db
      .select()
      .from(call_summaries)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: call_summaries.id })
      .from(call_summaries);

    if (whereClause) {
      totalCountQuery.where(whereClause);
    }

    const totalCountResult = await totalCountQuery;
    const total = totalCountResult.length;

    logger.debug(
      `✅ [SUMMARIES] Retrieved ${summaries.length} summaries (total: ${total})`,
      'Summaries'
    );

    return apiResponse.success(
      res,
      summaries,
      `Retrieved ${summaries.length} summaries`,
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
        tenantId: tenantId || null,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [SUMMARIES] Error fetching summaries:',
      'Summaries',
      error
    );
    return commonErrors.database(res, 'Failed to fetch summaries', error);
  }
});

// DELETE /api/summaries/:id - Delete a specific summary (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return commonErrors.validation(res, 'Summary ID is required');
    }

    logger.debug(`🗑️ [SUMMARIES] Deleting summary: ${id}`, 'Summaries');

    const deletedSummaries = await db
      .delete(call_summaries)
      .where(eq(call_summaries.id, parseInt(id)))
      .returning();

    if (deletedSummaries.length === 0) {
      return commonErrors.notFound(res, 'Summary', id);
    }

    logger.debug(
      `✅ [SUMMARIES] Summary deleted successfully: ${id}`,
      'Summaries'
    );

    return apiResponse.success(
      res,
      { deletedId: id, deletedAt: new Date().toISOString() },
      'Summary deleted successfully'
    );
  } catch (error) {
    logger.error('❌ [SUMMARIES] Error deleting summary:', 'Summaries', error);
    return commonErrors.database(res, 'Failed to delete summary', error);
  }
});

export default router;
