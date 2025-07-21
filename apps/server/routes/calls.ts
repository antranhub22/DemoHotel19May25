import { Router, Request, Response } from 'express';
import { storage } from '@server/storage';
import { insertTranscriptSchema } from '@shared/schema';
import { db } from '@shared/db';
import { call, transcript } from '@shared/db';
import { eq } from 'drizzle-orm';
import { getCurrentTimestamp } from '@shared/utils';
import { z } from 'zod';

const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  console.error(defaultMessage, error);
  res.status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

// Get transcripts by call ID
router.get('/transcripts/:callId', async (req, res) => {
  try {
    const callId = req.params.callId;
    const transcripts = await storage.getTranscriptsByCallId(callId);
    res.json(transcripts);
  } catch (error) {
    handleApiError(res, error, 'Failed to retrieve transcripts');
  }
});

// Update call duration when call ends
router.post('/call-end', async (req, res) => {
  try {
    const { callId, duration } = req.body;

    if (!callId || duration === undefined) {
      return res.status(400).json({
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

    console.log(`✅ Updated call duration for ${callId}: ${duration} seconds`);
    res.json({ success: true, duration });
  } catch (error) {
    console.error('❌ Error updating call duration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create call endpoint - now enabled with proper schema fields
router.post('/calls', async (req, res) => {
  try {
    const { call_id_vapi, room_number, language, service_type, tenant_id } =
      req.body;

    if (!call_id_vapi) {
      return res.status(400).json({ error: 'call_id_vapi is required' });
    }

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

    console.log(`✅ Created call record:`, newCall);
    res.json({ success: true, call: newCall });
  } catch (error) {
    console.error('❌ Error creating call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req, res) => {
  try {
    const { callId, role, content } = req.body;

    if (!callId || !role || !content) {
      return res.status(400).json({
        error: 'Call ID, role, and content are required',
      });
    }

    // Convert camelCase to snake_case for database schema validation
    // Ensure timestamp is within valid range for PostgreSQL
    const now = Date.now();
    const validTimestamp = Math.min(now, 2147483647000); // PostgreSQL max timestamp

    const transcriptDataForValidation = {
      call_id: callId,
      role,
      content,
      tenant_id: 'default',
      timestamp: validTimestamp, // ✅ FIXED: Use raw timestamp for validation
    };

    // Validate with database schema (expects snake_case)
    const validatedData = insertTranscriptSchema.parse(
      transcriptDataForValidation
    );

    // Auto-create call record if it doesn't exist
    try {
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, callId))
        .limit(1);

      if (existingCall.length === 0) {
        console.log(
          `🔍 [API/calls] No call found for ${callId}, skipping auto-creation due to schema mismatch`
        );

        // TODO: Fix schema mismatch and re-enable call creation
        // await db.insert(call).values({
        //   call_id_vapi: callId,
        //   start_time: Math.floor(validTimestamp / 1000),
        //   tenant_id: 'default'
        // });

        console.log('⚠️ [API/calls] Call record creation skipped');
      }
    } catch (error) {
      console.error('❌ [API/calls] Error checking call record:', error);
    }

    // Store transcript in database with field mapping
    await storage.addTranscript({
      callId,
      role,
      content,
      tenantId: 'default',
      timestamp: validTimestamp, // ✅ FIXED: Let storage.addTranscript handle conversion
    });

    console.log('✅ [API/calls] Transcript stored successfully');

    res.json({
      success: true,
      message: 'Test transcript stored successfully',
      transcript: validatedData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors in test-transcript:', error.errors);
      res.status(400).json({
        error: 'Invalid transcript data',
        details: error.errors,
        receivedFields: Object.keys(req.body),
      });
    } else {
      handleApiError(res, error, 'Failed to store test transcript');
    }
  }
});

export default router;
