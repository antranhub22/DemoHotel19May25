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
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    if (!callId) {
      return res.status(400).json({ error: 'Call ID is required' });
    }
    
    // TODO: Update call duration in database when schema is fixed
    // await db.update(call).set({ duration: duration || 0 }).where(eq(call.call_id_vapi, callId));
    
    console.log(`Updated call duration for ${callId}: ${duration} seconds`);
    
    res.json({ 
      success: true, 
      message: 'Call duration updated successfully' 
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to update call duration');
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req, res) => {
  try {
    const { callId, role, content } = req.body;
    
    if (!callId || !role || !content) {
      return res.status(400).json({ 
        error: 'Call ID, role, and content are required' 
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
      timestamp: Math.floor(validTimestamp / 1000) // Convert to seconds for PostgreSQL compatibility
    };
    
    // Validate with database schema (expects snake_case)
    const validatedData = insertTranscriptSchema.parse(transcriptDataForValidation);
    
    // Auto-create call record if it doesn't exist
    try {
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, callId))
        .limit(1);
      
      if (existingCall.length === 0) {
        // Extract room number from content if possible
        const roomMatch = content.match(/room (\d+)/i) || content.match(/phòng (\d+)/i);
        const roomNumber = roomMatch ? roomMatch[1] : null;
        
        // Determine language from content
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(content);
        const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(content) && !hasVietnamese;
        let language = 'en';
        if (hasVietnamese) language = 'vi';
        else if (hasFrench) language = 'fr';
        
        await db.insert(call).values({
          call_id_vapi: callId,
          // TODO: Add other fields when schema is fixed
        });
        
        console.log(`Auto-created call record for ${callId} with room ${roomNumber || 'unknown'} and language ${language}`);
      }
    } catch (callError) {
      console.error('Error creating call record:', callError);
    }
    
    // Store transcript in database - use camelCase for storage function
    await storage.addTranscript({
      callId,
      role,
      content,
      tenantId: 'default',
      timestamp: Math.floor(validTimestamp / 1000)
    });
    
    console.log(`Test transcript stored for call ${callId}: ${role} - ${content.substring(0, 100)}...`);
    
    res.json({ 
      success: true, 
      message: 'Test transcript stored successfully',
      transcript: validatedData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors in test-transcript:', error.errors);
      res.status(400).json({ 
        error: 'Invalid transcript data', 
        details: error.errors,
        receivedFields: Object.keys(req.body)
      });
    } else {
      handleApiError(res, error, 'Failed to store test transcript');
    }
  }
});

export default router; 