import express, { Request, Response, Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@shared/db';
import { call, transcript } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { storage } from '@server/storage';

const router = Router();

// Get transcripts by call ID
router.get('/transcripts/:callId', async (req: Request, res: Response) => {
  try {
    const callId = req.params.callId;

    logger.api(`📞 [Calls] Getting transcripts for call: ${callId}`, 'Routes');

    const transcripts = await storage.getTranscriptsByCallId(callId);

    logger.success('📞 [Calls] Transcripts retrieved successfully', 'Routes', {
      callId,
      transcriptCount: transcripts.length,
    });

    res.json({
      success: true,
      data: transcripts,
    });
  } catch (error) {
    logger.error('❌ [Calls] Failed to get transcripts', 'Routes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transcripts',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as any)?.message || String(error)
          : undefined,
    });
  }
});

// Update call duration when call ends
router.post('/call-end', async (req: Request, res: Response) => {
  try {
    const { callId, duration } = req.body;

    if (!callId || duration === undefined) {
      res.status(400).json({
        success: false,
        error: 'callId and duration are required',
      });
      return;
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

    res.json({
      success: true,
      duration: Math.floor(duration),
    });
  } catch (error) {
    logger.error('❌ [Calls] Error ending call', 'Routes', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create call endpoint
router.post('/calls', async (req: Request, res: Response) => {
  try {
    const { call_id_vapi, room_number, language, service_type, tenant_id } =
      req.body;

    if (!call_id_vapi) {
      res.status(400).json({
        success: false,
        error: 'call_id_vapi is required',
      });
      return;
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

    res.json({
      success: true,
      data: newCall,
    });
  } catch (error) {
    logger.error('❌ [Calls] Error creating call', 'Routes', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req: Request, res: Response) => {
  try {
    const { callId, role, content } = req.body;

    if (!callId || !role || !content) {
      res.status(400).json({
        success: false,
        error: 'Call ID, role, and content are required',
      });
      return;
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

    res.json({
      success: true,
      message: 'Test transcript stored successfully',
    });
  } catch (error) {
    logger.error('❌ [Calls] Failed to store test transcript', 'Routes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store test transcript',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as any)?.message || String(error)
          : undefined,
    });
  }
});

export default router;
