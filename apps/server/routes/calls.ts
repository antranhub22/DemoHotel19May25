import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { db } from '@shared/db';
import { call } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';

const router = Router();

// Get transcripts by call ID
router.get('/transcripts/:callId', async (req: Request, res: Response) => {
  try {
    const callId = req.params.callId;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

    logger.api(`📞 [Calls] Getting transcripts for call: ${callId}`, 'Routes');

    const transcripts = await storage.getTranscriptsByCallId(callId);

    logger.success('📞 [Calls] Transcripts retrieved successfully', 'Routes', {
      callId,
      transcriptCount: transcripts.length,
    });

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts for call`,
      { callId, count: transcripts.length }
    );
  } catch (error) {
    logger.error('❌ [Calls] Failed to get transcripts', 'Routes', error);
    return commonErrors.database(res, 'Failed to retrieve transcripts', error);
  }
});

// Update call duration when call ends
router.post('/call-end', async (req: Request, res: Response) => {
  try {
    const { callId, duration } = req.body;

    if (!callId || duration === undefined) {
      return commonErrors.missingFields(res, ['callId', 'duration']);
    }

    if (typeof duration !== 'number' || duration < 0) {
      return commonErrors.validation(res, 'Duration must be a positive number');
    }

    logger.api(
      `📞 [Calls] Ending call: ${callId} with duration: ${duration}s`,
      'Routes'
    );

    // Update call duration and end time using existing schema fields
    await db
      .update(call)
      .set({
        duration: Math.floor(duration),
        end_time: new Date(),
      })
      .where(eq(call.call_id_vapi, callId));

    logger.success(`📞 [Calls] Call ended successfully`, 'Routes', {
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
      'Call ended successfully'
    );
  } catch (error) {
    logger.error('❌ [Calls] Error ending call', 'Routes', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.CALL_NOT_FOUND,
      'Failed to end call',
      error
    );
  }
});

// Create call endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { call_id_vapi, room_number, language, service_type, tenant_id } =
      req.body;

    if (!call_id_vapi) {
      return commonErrors.missingFields(res, ['call_id_vapi']);
    }

    logger.api(`📞 [Calls] Creating call: ${call_id_vapi}`, 'Routes', {
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
        language: language || 'en',
        service_type: service_type || null,
        tenant_id: tenant_id || null,
        start_time: new Date(),
      })
      .returning();

    logger.success('📞 [Calls] Call created successfully', 'Routes', {
      callId: newCall.call_id_vapi,
      room_number: newCall.room_number,
    });

    return apiResponse.created(res, newCall, 'Call created successfully');
  } catch (error) {
    logger.error('❌ [Calls] Error creating call', 'Routes', error);
    return commonErrors.database(res, 'Failed to create call', error);
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req: Request, res: Response) => {
  try {
    const { callId, role, content } = req.body;

    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ['callId', 'role', 'content']);
    }

    logger.api(
      `📞 [Calls] Creating test transcript for call: ${callId}`,
      'Routes',
      {
        role,
        contentLength: content.length,
      }
    );

    // Store transcript in database
    await storage.addTranscript({
      callId,
      role,
      content,
      tenantId: 'default',
      timestamp: Date.now(),
    });

    logger.success(
      '📞 [Calls] Test transcript created successfully',
      'Routes',
      {
        callId,
        role,
      }
    );

    return apiResponse.created(
      res,
      {
        callId,
        role,
        content,
        tenantId: 'default',
        timestamp: new Date().toISOString(),
      },
      'Test transcript stored successfully'
    );
  } catch (error) {
    logger.error('❌ [Calls] Failed to store test transcript', 'Routes', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      'Failed to store test transcript',
      error
    );
  }
});

export default router;
