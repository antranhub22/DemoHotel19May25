import express from 'express';
import {
  insertTranscriptSchema,
  insertCallSummarySchema,
} from '@shared/schema';
import { db } from '@shared/db';
import { call, transcript, call_summaries } from '@shared/db';
import { logger } from '@shared/utils/logger';
import { translateToVietnamese } from '../openai';
import {
  getOverview,
  getServiceDistribution,
  getHourlyActivity,
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
      return (res as any).status(400).json({
        error: 'Missing required fields: callId, role, content',
      });
    }

    logger.debug(
      '📝 [API] Storing transcript - Call: ${callId}, Role: ${role}, Content length: ${content.length}',
      'Component'
    );

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
      '✅ [API] Transcript stored successfully for call: ${callId}',
      'Component'
    );
    (res as any).json({ success: true });
  } catch (error) {
    logger.error('❌ [API] Error storing transcript:', 'Component', error);
    (res as any).status(500).json({ error: 'Failed to store transcript' });
  }
});

// Get transcripts for a call
router.get('/transcripts/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    logger.debug(
      '🔍 [API] Getting transcripts for call: ${callId}',
      'Component'
    );

    const transcripts = await db
      .select()
      .from(transcript)
      .where(eq(transcript.call_id, callId))
      .orderBy(transcript.timestamp);

    logger.debug(
      '📝 [API] Found ${transcripts.length} transcripts for call: ${callId}',
      'Component'
    );
    (res as any).json(transcripts);
  } catch (error) {
    logger.error('❌ [API] Error fetching transcripts:', 'Component', error);
    (res as any).status(500).json({ error: 'Failed to fetch transcripts' });
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
      return (res as any).status(400).json({
        error: 'callId and duration are required',
      });
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
      '✅ [API] Updated call duration for ${callId}: ${duration} seconds',
      'Component'
    );
    (res as any).json({ success: true, duration });
  } catch (error) {
    logger.error('❌ [API] Error updating call duration:', 'Component', error);
    (res as any).status(500).json({ error: 'Internal server error' });
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
      return (res as any).status(400).json({
        error: 'callId and content are required',
      });
    }

    logger.debug('📋 [API] Storing summary for call: ${callId}', 'Component');

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
      '✅ [API] Summary stored successfully for call: ${callId}',
      'Component'
    );
    (res as any).json({ success: true });
  } catch (error) {
    logger.error('❌ [API] Error storing summary:', 'Component', error);
    (res as any).status(500).json({ error: 'Failed to store summary' });
  }
});

// Get summary for a call
router.get('/summaries/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    logger.debug('🔍 [API] Getting summary for call: ${callId}', 'Component');

    const summaries = await db
      .select()
      .from(call_summaries)
      .where(eq(call_summaries.call_id, callId))
      .orderBy(call_summaries.timestamp);

    logger.debug(
      '📋 [API] Found ${summaries.length} summaries for call: ${callId}',
      'Component'
    );
    (res as any).json(summaries);
  } catch (error) {
    logger.error('❌ [API] Error fetching summaries:', 'Component', error);
    (res as any).status(500).json({ error: 'Failed to fetch summaries' });
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
    (res as any).json(overview);
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching analytics overview:',
      'Component',
      error
    );
    (res as any)
      .status(500)
      .json({ error: 'Failed to fetch analytics overview' });
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
    (res as any).json(distribution);
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching service distribution:',
      'Component',
      error
    );
    (res as any)
      .status(500)
      .json({ error: 'Failed to fetch service distribution' });
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
    (res as any).json(activity);
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching hourly activity:',
      'Component',
      error
    );
    (res as any).status(500).json({ error: 'Failed to fetch hourly activity' });
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
      return (res as any).status(400).json({ error: 'Text is required' });
    }

    logger.debug(
      '🌐 [API] Translating text to Vietnamese: ${text.substring(0, 50)}...',
      'Component'
    );

    const translatedText = await translateToVietnamese(text);
    (res as any).json({ translatedText });
  } catch (error) {
    logger.error('❌ [API] Error translating text:', 'Component', error);
    (res as any).status(500).json({ error: 'Translation failed' });
  }
});

export default router;
