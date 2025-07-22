import { Router } from 'express';
import { CallsController } from '../controllers/callsController';

const router = Router();

// Get transcripts by call ID
router.get('/transcripts/:callId', CallsController.getTranscriptsByCallId);

// Update call duration when call ends
router.post('/call-end', CallsController.endCall);

// Create call endpoint - now enabled with proper schema fields
router.post('/calls', CallsController.createCall);

// Test transcript endpoint
router.post('/test-transcript', CallsController.createTestTranscript);

export default router;
