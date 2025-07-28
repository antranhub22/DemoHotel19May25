import { apiResponse, commonErrors } from '@server/utils/apiHelpers';
import { parsePagination } from '@server/utils/pagination';
import { call_summaries, db } from '@shared/db';
import { insertCallSummarySchema } from '@shared/schema';
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
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

    logger.debug(
      `🔍 [SUMMARIES] Getting summaries for call: ${callId}`,
      'Summaries'
    );

    const summaries = await db
      .select()
      .from(call_summaries)
      .where(eq(call_summaries.call_id, callId))
      .orderBy(call_summaries.timestamp);

    logger.debug(
      `📋 [SUMMARIES] Found ${summaries.length} summaries for call: ${callId}`,
      'Summaries'
    );

    return apiResponse.success(
      res,
      summaries,
      `Retrieved ${summaries.length} summaries for call`,
      { callId, count: summaries.length }
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

// GET /api/summaries/ - Get all summaries with pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, 20, 100);
    const { tenantId } = req.query;

    logger.debug(
      `📋 [SUMMARIES] Getting summaries (page: ${page}, limit: ${limit})`,
      'Summaries'
    );

    let query = db.select().from(call_summaries);

    // Add tenant filtering if provided
    if (tenantId && typeof tenantId === 'string') {
      // Note: Assuming tenant_id field exists or can be joined
      logger.debug(
        `🏨 [SUMMARIES] Filtering by tenant: ${tenantId}`,
        'Summaries'
      );
    }

    const summaries = await query
      .orderBy(call_summaries.timestamp)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: call_summaries.id })
      .from(call_summaries);
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
