import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertTranscriptSchema } from '@shared/schema';
import { db } from '../../src/db';
import { call, transcript } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

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
    
    // Update call duration in database
    await db
      .update(call)
      .set({ 
        duration: duration || 0,
        endTime: new Date()
      })
      .where(eq(call.callIdVapi, callId));
    
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
    
    // Validate transcript data
    const validatedData = insertTranscriptSchema.parse({
      callId,
      role,
      content
    });
    
    // Auto-create call record if it doesn't exist
    try {
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.callIdVapi, callId))
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
          callIdVapi: callId,
          roomNumber: roomNumber,
          duration: 0,
          language: language,
          createdAt: new Date()
        });
        
        console.log(`Auto-created call record for ${callId} with room ${roomNumber || 'unknown'} and language ${language}`);
      }
    } catch (callError) {
      console.error('Error creating call record:', callError);
    }
    
    // Store transcript in database
    await storage.addTranscript(validatedData);
    
    console.log(`Test transcript stored for call ${callId}: ${role} - ${content.substring(0, 100)}...`);
    
    res.json({ 
      success: true, 
      message: 'Test transcript stored successfully',
      transcript: validatedData
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Zod')) {
      res.status(400).json({ 
        error: 'Invalid transcript data', 
        details: error.message 
      });
    } else {
      handleApiError(res, error, 'Failed to store test transcript');
    }
  }
});

export default router; 