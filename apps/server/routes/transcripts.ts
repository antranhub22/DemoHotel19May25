import { Router } from 'express';
// import { storage } from '@server/storage'; // Not used in current implementation
import { insertTranscriptSchema } from '@shared/schema';
import { db } from '@shared/db';
import { call, transcript } from '@shared/db';
import { getCurrentTimestamp } from '@shared/utils';
// import { z } from 'zod'; // Not used currently
import { logger } from '@shared/utils/logger';

const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  logger.error(defaultMessage, 'Component', error);
  res.status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
  });
}

// ============================================
// TRANSCRIPT MANAGEMENT ENDPOINTS
// ============================================

// Get transcripts for a specific call
router.get('/transcripts/:callId', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    logger.debug(`📋 [TRANSCRIPTS] Getting transcripts for call: ${callId}`, 'Component');

    const transcripts = await db
      .select()
      .from(transcript)
      .where(eq(transcript.call_id, callId));

    logger.debug(`✅ [TRANSCRIPTS] Found ${transcripts.length} transcripts for call: ${callId}`, 'Component');
    res.json(transcripts);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch transcripts');
  }
});

// Store transcript data
router.post('/transcripts', async (req: Request, res: Response) => {
  try {
    const { callId, role, content, timestamp, tenantId } = req.body;

    if (!callId || !role || !content) {
      return res.status(400).json({
        error: 'Missing required fields: callId, role, content',
      });
    }

    logger.debug(`📝 [TRANSCRIPTS] Storing transcript - Call: ${callId}, Role: ${role}, Content length: ${content.length}`, 'Component');

    // Validate and store transcript
    const validatedData = insertTranscriptSchema.parse({
      call_id: callId,
      role,
      content,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      tenant_id: tenantId || 'mi-nhon-hotel',
    });

    await db.insert(transcript).values(validatedData);

    // If this is the first transcript for this call, ensure call record exists
    if (role === 'user') {
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, callId))
        .limit(1);

      if (existingCall.length === 0) {
        logger.debug(`🔍 [TRANSCRIPTS] No call record found for ${callId}, creating one`, 'Component');
        
        // Create call record
        await db.insert(call).values({
          call_id_vapi: callId,
          tenant_id: tenantId || 'mi-nhon-hotel',
          language: 'vi', // Default language
          start_time: new Date(),
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
        });
      }
    }

    logger.debug(`✅ [TRANSCRIPTS] Transcript stored successfully for call: ${callId}`, 'Component');
    res.json({ success: true });
  } catch (error) {
    handleApiError(res, error, 'Failed to store transcript');
  }
});

// Test transcript endpoint for debugging
router.post('/test-transcript', async (req: Request, res: Response) => {
  try {
    const { callId = 'test-call-123', role = 'user', content = 'Test transcript content' } = req.body;

    logger.debug(`🧪 [TRANSCRIPTS] Test transcript - Call: ${callId}, Role: ${role}`, 'Component');

    const testData = {
      call_id: callId,
      role,
      content,
      timestamp: new Date(),
      tenant_id: 'mi-nhon-hotel',
    };

    const validatedData = insertTranscriptSchema.parse(testData);
    await db.insert(transcript).values(validatedData);

    logger.debug(`✅ [TRANSCRIPTS] Test transcript stored successfully`, 'Component');
    res.json({ 
      success: true, 
      message: 'Test transcript stored successfully',
      data: testData 
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to store test transcript');
  }
});

export default router; 