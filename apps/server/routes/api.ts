import { translateToVietnamese } from '@server/openai';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { call, call_summaries, db, transcript } from '@shared/db';
import {
  insertCallSummarySchema,
  insertTranscriptSchema,
} from '@shared/schema';
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
import express from 'express';
import {
  getHourlyActivity,
  getOverview,
  getServiceDistribution,
} from '../analytics';

const router = express.Router();

// ============================================
// TRANSCRIPTS & CALL MANAGEMENT
// ============================================

// Store transcript endpoint
router.post('/store-transcript', express.json(), async (req, res) => {
  try {
    const { callId, role, content, timestamp, tenantId } = req.body;

    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ['callId', 'role', 'content']);
    }

    logger.debug(
      `📝 [API] Storing transcript - Call: ${callId}, Role: ${role}, Content length: ${content.length}`,
      'Component'
    );

    try {
      // Validate and store transcript
      const validatedData = insertTranscriptSchema.parse({
        call_id: callId,
        role,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        tenant_id: tenantId || 'mi-nhon-hotel',
      });

      await db.insert(transcript).values(validatedData);

      logger.debug(
        `✅ [API] Transcript stored successfully for call: ${callId}`,
        'Component'
      );

      return apiResponse.created(
        res,
        {
          callId,
          role,
          tenantId: tenantId || 'mi-nhon-hotel',
          storedAt: new Date().toISOString(),
        },
        'Transcript stored successfully'
      );
    } catch (validationError) {
      return commonErrors.validation(
        res,
        'Invalid transcript data',
        validationError
      );
    }
  } catch (error) {
    logger.error('❌ [API] Error storing transcript:', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      'Failed to store transcript',
      error
    );
  }
});

// Get transcripts for a call
router.get('/transcripts/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    logger.debug(
      `🔍 [API] Getting transcripts for call: ${callId}`,
      'Component'
    );

    const transcripts = await db
      .select()
      .from(transcript)
      .where(eq(transcript.call_id, callId))
      .orderBy(transcript.timestamp);

    logger.debug(
      `📝 [API] Found ${transcripts.length} transcripts for call: ${callId}`,
      'Component'
    );

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts for call`,
      { callId, count: transcripts.length }
    );
  } catch (error) {
    logger.error('❌ [API] Error fetching transcripts:', 'Component', error);
    return commonErrors.database(res, 'Failed to fetch transcripts', error);
  }
});

// ============================================
// CALL DURATION & END HANDLING
// ============================================

// Update call duration endpoint
router.post('/call-end', express.json(), async (req, res) => {
  try {
    const { callId, duration } = req.body;

    if (!callId || duration === undefined) {
      return commonErrors.missingFields(res, ['callId', 'duration']);
    }

    if (typeof duration !== 'number' || duration < 0) {
      return commonErrors.validation(res, 'Duration must be a positive number');
    }

    // Update call duration and end time using existing schema fields
    await db
      .update(call)
      .set({
        duration: Math.floor(duration),
        end_time: new Date(),
      })
      .where(eq(call.call_id_vapi, callId));

    logger.debug(
      `✅ [API] Updated call duration for ${callId}: ${duration} seconds`,
      'Component'
    );

    return apiResponse.success(
      res,
      {
        callId,
        duration: Math.floor(duration),
        endTime: new Date().toISOString(),
      },
      'Call duration updated successfully'
    );
  } catch (error) {
    logger.error('❌ [API] Error updating call duration:', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.CALL_NOT_FOUND,
      'Failed to update call duration',
      error
    );
  }
});

// ============================================
// SUMMARIES & AI PROCESSING
// ============================================

// Store call summary endpoint
router.post('/store-summary', express.json(), async (req, res) => {
  try {
    const { callId, content, roomNumber, duration } = req.body;

    if (!callId || !content) {
      return commonErrors.missingFields(res, ['callId', 'content']);
    }

    logger.debug(`📋 [API] Storing summary for call: ${callId}`, 'Component');

    try {
      // Validate and store summary
      const validatedData = insertCallSummarySchema.parse({
        call_id: callId,
        content,
        room_number: roomNumber || null,
        duration: duration || null,
        timestamp: new Date(),
      });

      await db.insert(call_summaries).values(validatedData);

      logger.debug(
        `✅ [API] Summary stored successfully for call: ${callId}`,
        'Component'
      );

      return apiResponse.created(
        res,
        {
          callId,
          roomNumber,
          duration,
          storedAt: new Date().toISOString(),
        },
        'Call summary stored successfully'
      );
    } catch (validationError) {
      return commonErrors.validation(
        res,
        'Invalid summary data',
        validationError
      );
    }
  } catch (error) {
    logger.error('❌ [API] Error storing summary:', 'Component', error);
    return commonErrors.database(res, 'Failed to store summary', error);
  }
});

// Get summary for a call
router.get('/summaries/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    logger.debug(`🔍 [API] Getting summary for call: ${callId}`, 'Component');

    const summaries = await db
      .select()
      .from(call_summaries)
      .where(eq(call_summaries.call_id, callId))
      .orderBy(call_summaries.timestamp);

    logger.debug(
      `📋 [API] Found ${summaries.length} summaries for call: ${callId}`,
      'Component'
    );

    return apiResponse.success(
      res,
      summaries,
      `Retrieved ${summaries.length} summaries for call`,
      { callId, count: summaries.length }
    );
  } catch (error) {
    logger.error('❌ [API] Error fetching summaries:', 'Component', error);
    return commonErrors.database(res, 'Failed to fetch summaries', error);
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Analytics overview endpoint
router.get('/analytics/overview', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting analytics overview for tenant: ${tenantId}`,
      'Component'
    );

    const overview = await getOverview();

    return apiResponse.success(
      res,
      overview,
      'Analytics overview retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching analytics overview:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to fetch analytics overview',
      error
    );
  }
});

// Service distribution analytics
router.get('/analytics/service-distribution', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting service distribution for tenant: ${tenantId}`,
      'Component'
    );

    const distribution = await getServiceDistribution();

    return apiResponse.success(
      res,
      distribution,
      'Service distribution retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching service distribution:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to fetch service distribution',
      error
    );
  }
});

// Hourly activity analytics
router.get('/analytics/hourly-activity', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting hourly activity for tenant: ${tenantId}`,
      'Component'
    );

    const activity = await getHourlyActivity();

    return apiResponse.success(
      res,
      activity,
      'Hourly activity retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching hourly activity:',
      'Component',
      error
    );
    return commonErrors.database(res, 'Failed to fetch hourly activity', error);
  }
});

// ============================================
// TRANSLATION SERVICES
// ============================================

// Vietnamese translation endpoint
router.post('/translate-to-vietnamese', express.json(), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return commonErrors.missingFields(res, ['text']);
    }

    if (typeof text !== 'string' || text.length === 0) {
      return commonErrors.validation(res, 'Text must be a non-empty string');
    }

    logger.debug(
      `🌐 [API] Translating text to Vietnamese: ${text.substring(0, 50)}...`,
      'Component'
    );

    const translatedText = await translateToVietnamese(text);

    return apiResponse.success(
      res,
      {
        originalText: text,
        translatedText,
        language: 'vi',
      },
      'Text translated successfully'
    );
  } catch (error) {
    logger.error('❌ [API] Error translating text:', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.EXTERNAL_SERVICE_ERROR,
      'Translation failed',
      error
    );
  }
});

export default router;
