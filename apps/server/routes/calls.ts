import express, { Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@shared/db';
import { call, transcript } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
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
