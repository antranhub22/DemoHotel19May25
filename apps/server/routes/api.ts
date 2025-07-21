import express, { type Request, Response } from 'express';
import { z } from "zod";
import { generateCallSummary, generateBasicSummary, extractServiceRequests, translateToVietnamese } from "../openai";
import { insertTranscriptSchema, insertCallSummarySchema } from "@shared/schema";
import { dateToString, getCurrentTimestamp } from '@shared/utils';
import { sendServiceConfirmation, sendCallSummary } from "../gmail";
import { sendMobileEmail, sendMobileCallSummary } from "../mobileMail";
import { db } from '@shared/db';
import { request as requestTable, call, transcript } from '@shared/db';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { deleteAllRequests } from '@shared/utils';
import { getOverview, getServiceDistribution, getHourlyActivity } from '../analytics';

const router = express.Router();

// ============================================
// TRANSCRIPTS & CALL MANAGEMENT
// ============================================

// Store transcript endpoint
router.post('/store-transcript', express.json(), async (req, res) => {
  try {
    const { callId, role, content, timestamp, tenantId, isModelOutput } = req.body;
    
    if (!callId || !role || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: callId, role, content' 
      });
    }

    console.log(`📝 [API] Storing transcript - Call: ${callId}, Role: ${role}, Content length: ${content.length}`);

    // Validate and store transcript
    const validatedData = insertTranscriptSchema.parse({
      call_id: callId,
      role,
      content,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      tenant_id: tenantId || 'mi-nhon-hotel'
    });

    await db.insert(transcript).values(validatedData);
    
    console.log(`✅ [API] Transcript stored successfully for call: ${callId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [API] Error storing transcript:', error);
    res.status(500).json({ error: 'Failed to store transcript' });
  }
});

// Get transcripts for a call
router.get('/transcripts/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log(`🔍 [API] Getting transcripts for call: ${callId}`);
    
    const transcripts = await db
      .select()
      .from(transcript)
      .where(eq(transcript.call_id, callId))
      .orderBy(transcript.timestamp);
    
    console.log(`📝 [API] Found ${transcripts.length} transcripts for call: ${callId}`);
    res.json(transcripts);
  } catch (error) {
    console.error('❌ [API] Error fetching transcripts:', error);
    res.status(500).json({ error: 'Failed to fetch transcripts' });
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
      return res.status(400).json({ 
        error: 'callId and duration are required' 
      });
    }

    // Update call duration and end time using existing schema fields
    await db
      .update(call)
      .set({ 
        duration: Math.floor(duration),
        end_time: new Date()
      })
      .where(eq(call.call_id_vapi, callId));
    
    console.log(`✅ [API] Updated call duration for ${callId}: ${duration} seconds`);
    res.json({ success: true, duration });
  } catch (error) {
    console.error('❌ [API] Error updating call duration:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(400).json({ 
        error: 'callId and content are required' 
      });
    }

    console.log(`📋 [API] Storing summary for call: ${callId}`);

    // Validate and store summary
    const validatedData = insertCallSummarySchema.parse({
      call_id: callId,
      content,
      room_number: roomNumber || null,
      duration: duration || null,
      timestamp: new Date()
    });

    await db.insert(call_summaries).values(validatedData);
    
    console.log(`✅ [API] Summary stored successfully for call: ${callId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [API] Error storing summary:', error);
    res.status(500).json({ error: 'Failed to store summary' });
  }
});

// Get summary for a call
router.get('/summaries/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log(`🔍 [API] Getting summary for call: ${callId}`);
    
    const summaries = await db
      .select()
      .from(call_summaries)
      .where(eq(call_summaries.call_id, callId))
      .orderBy(call_summaries.timestamp);
    
    console.log(`📋 [API] Found ${summaries.length} summaries for call: ${callId}`);
    res.json(summaries);
  } catch (error) {
    console.error('❌ [API] Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Analytics overview endpoint
router.get('/analytics/overview', async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || 'mi-nhon-hotel';
    console.log(`📊 [API] Getting analytics overview for tenant: ${tenantId}`);
    
    const overview = await getOverview(tenantId);
    res.json(overview);
  } catch (error) {
    console.error('❌ [API] Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Service distribution analytics
router.get('/analytics/service-distribution', async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || 'mi-nhon-hotel';
    console.log(`📊 [API] Getting service distribution for tenant: ${tenantId}`);
    
    const distribution = await getServiceDistribution(tenantId);
    res.json(distribution);
  } catch (error) {
    console.error('❌ [API] Error fetching service distribution:', error);
    res.status(500).json({ error: 'Failed to fetch service distribution' });
  }
});

// Hourly activity analytics
router.get('/analytics/hourly-activity', async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || 'mi-nhon-hotel';
    console.log(`📊 [API] Getting hourly activity for tenant: ${tenantId}`);
    
    const activity = await getHourlyActivity(tenantId);
    res.json(activity);
  } catch (error) {
    console.error('❌ [API] Error fetching hourly activity:', error);
    res.status(500).json({ error: 'Failed to fetch hourly activity' });
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
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`🌐 [API] Translating text to Vietnamese: ${text.substring(0, 50)}...`);
    
    const translatedText = await translateToVietnamese(text);
    res.json({ translatedText });
  } catch (error) {
    console.error('❌ [API] Error translating text:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router; 