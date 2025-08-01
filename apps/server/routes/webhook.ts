import { generateCallSummaryOptimized } from '@server/openai';
import { DatabaseStorage } from '@server/storage';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();
const storage = new DatabaseStorage();

/**
 * ✅ HELPER: Process transcript with OpenAI for summary generation
 */
async function processTranscriptWithOpenAI(
  transcript: any[],
  callId: string,
  req: any
) {
  try {
    logger.debug('[Webhook] Processing transcript with OpenAI', 'Component', {
      transcriptLength: transcript.length,
      callId,
    });

    // Detect language from transcript
    const detectLanguage = (transcript: any[]): string => {
      const allText = transcript
        .map(t => t.content)
        .join(' ')
        .toLowerCase();
      if (allText.includes('xin chào') || allText.includes('cảm ơn'))
        return 'vi';
      if (allText.includes('bonjour') || allText.includes('merci')) return 'fr';
      if (allText.includes('привет') || allText.includes('спасибо'))
        return 'ru';
      if (allText.includes('안녕하세요') || allText.includes('감사합니다'))
        return 'ko';
      if (allText.includes('你好') || allText.includes('谢谢')) return 'zh';
      return 'en'; // Default to English
    };

    const language = detectLanguage(transcript);
    logger.debug(`[Webhook] Detected language: ${language}`, 'Component');

    // ✅ COST OPTIMIZATION: Generate summary AND extract service requests in ONE call
    const { summary, serviceRequests } = await generateCallSummaryOptimized(
      transcript,
      language
    );

    logger.success('[Webhook] OpenAI processing completed', 'Component', {
      summaryLength: summary?.length || 0,
      serviceRequestsCount: serviceRequests?.length || 0,
      callId,
    });

    // Save summary to database
    try {
      // Extract room number from summary
      const roomNumberMatch = summary.match(
        /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/
      );
      const extractedRoomNumber = roomNumberMatch
        ? roomNumberMatch[1] || roomNumberMatch[2]
        : null;

      await storage.addCallSummary({
        call_id: callId,
        content: summary,
        room_number: extractedRoomNumber,
        duration: null, // Will be updated by end-of-call-report
      });

      logger.success(
        '[Webhook] OpenAI summary saved to database',
        'Component',
        {
          callId,
          summaryLength: summary?.length || 0,
          roomNumber: extractedRoomNumber,
        }
      );
    } catch (dbError) {
      logger.error(
        '[Webhook] Failed to save summary to database:',
        'Component',
        dbError
      );
    }

    // Send WebSocket notification
    try {
      // ✅ FIX: Get io from req.app instead of require
      const io = (req as any).app.get('io');
      if (io) {
        // Send progression updates
        io.emit('summary-progression', {
          type: 'summary-progression',
          callId: callId,
          status: 'processing',
          progress: 25,
          currentStep: 'Processing transcript with OpenAI',
          currentStepIndex: 0,
          timestamp: new Date().toISOString(),
        });

        // Send final summary
        io.emit('call-summary-received', {
          type: 'call-summary-received',
          callId: callId,
          summary,
          serviceRequests,
          timestamp: new Date().toISOString(),
        });

        logger.success(
          '[Webhook] WebSocket notification sent successfully',
          'Component',
          {
            callId,
            summaryLength: summary?.length || 0,
            serviceRequestsCount: serviceRequests?.length || 0,
          }
        );
      } else {
        logger.warn(
          '[Webhook] WebSocket io instance not available',
          'Component'
        );
      }
    } catch (wsError) {
      logger.error(
        '[Webhook] Failed to send WebSocket notification:',
        'Component',
        wsError
      );
    }
  } catch (error) {
    logger.error('[Webhook] OpenAI processing failed:', 'Component', error);
    throw error;
  }
}

/**
 * ✅ HELPER: Process end-of-call-report for metadata storage
 */
async function processEndOfCallReport(endOfCallReport: any, callId: string) {
  try {
    logger.debug('[Webhook] Processing end-of-call-report', 'Component', {
      callId,
    });

    // Save end-of-call-report for stakeholders
    await storage.addCallSummary({
      call_id: callId,
      content: JSON.stringify(endOfCallReport),
      room_number: endOfCallReport.call?.customer?.number || null,
      duration:
        endOfCallReport.call?.endedAt && endOfCallReport.call?.startedAt
          ? Math.floor(
              (new Date(endOfCallReport.call.endedAt).getTime() -
                new Date(endOfCallReport.call.startedAt).getTime()) /
                1000
            ).toString()
          : null,
    });

    logger.success(
      '[Webhook] End-of-call-report saved for stakeholders',
      'Component',
      { callId }
    );
  } catch (error) {
    logger.error(
      '[Webhook] Failed to save end-of-call-report:',
      'Component',
      error
    );
    throw error;
  }
}

/**
 * ✅ FIXED: Webhook endpoint để nhận dữ liệu từ Vapi.ai
 * Handles both 'transcript' and 'end-of-call-report' events separately
 * POST /api/webhook/vapi
 */
router.post('/vapi', express.json(), async (req, res) => {
  try {
    // ✅ FIX: Parse Vapi.ai payload structure correctly
    const message = req.body.message || req.body;

    logger.debug('[Webhook] Received data from Vapi.ai:', 'Component', {
      fullPayload: req.body,
      messageType: message?.type,
      hasCall: !!message?.call,
      hasTranscript: !!message?.transcript,
      hasMessages: !!message?.messages,
      transcriptLength: (message?.transcript || message?.messages || []).length,
      payloadKeys: Object.keys(message || {}),
    });

    // ✅ FIX: Handle both transcript and end-of-call-report events separately
    const isTranscriptEvent = message?.type === 'transcript';
    const isEndOfCallEvent = message?.type === 'end-of-call-report';

    const callId = message?.call?.id || `call-${Date.now()}`;

    // ✅ HANDLE REALTIME TRANSCRIPT EVENT (no OpenAI processing)
    if (isTranscriptEvent) {
      logger.debug(
        '[Webhook] Received realtime transcript event',
        'Component',
        {
          callId,
          transcriptLength:
            message?.transcript?.length || message?.messages?.length || 0,
        }
      );

      // ✅ REALTIME TRANSCRIPT: Only log, do NOT process with OpenAI
      // This is partial, incomplete data sent during the call
      // We'll wait for the final transcript in end-of-call-report

      return res.status(200).json({
        success: true,
        message: 'Realtime transcript received (not processed)',
        callId,
      });
    }

    // ✅ HANDLE END-OF-CALL-REPORT EVENT (with final transcript for OpenAI)
    if (isEndOfCallEvent) {
      logger.debug(
        '[Webhook] Processing end-of-call-report with final transcript',
        'Component',
        {
          callId,
          hasMessages: !!message?.messages,
          messagesLength: message?.messages?.length || 0,
        }
      );

      // ✅ STEP 1: Save end-of-call-report metadata
      await processEndOfCallReport(message, callId);

      // ✅ STEP 2: Extract FINAL TRANSCRIPT for OpenAI processing
      const finalTranscript = message?.messages || [];
      if (
        finalTranscript &&
        Array.isArray(finalTranscript) &&
        finalTranscript.length > 0
      ) {
        logger.debug(
          '[Webhook] Processing FINAL TRANSCRIPT with OpenAI',
          'Component',
          {
            callId,
            transcriptLength: finalTranscript.length,
          }
        );

        // Process final transcript with OpenAI to generate summary
        await processTranscriptWithOpenAI(finalTranscript, callId, req);
      } else {
        logger.warn(
          '[Webhook] No final transcript found in end-of-call-report',
          'Component',
          { callId }
        );
      }

      return res.status(200).json({
        success: true,
        message:
          'End-of-call-report and final transcript processed successfully',
        callId,
      });
    }

    // ✅ FALLBACK: Handle ANY event with transcript data for OpenAI processing
    const transcriptData = message?.transcript || message?.messages || [];
    if (
      transcriptData &&
      Array.isArray(transcriptData) &&
      transcriptData.length > 0
    ) {
      logger.debug(
        '[Webhook] FALLBACK: Processing transcript from unknown event type',
        'Component',
        {
          callId,
          eventType: message?.type || 'unknown',
          transcriptLength: transcriptData.length,
        }
      );

      try {
        // Process with OpenAI even if event type is unknown
        await processTranscriptWithOpenAI(transcriptData, callId, req);

        return res.status(200).json({
          success: true,
          message: 'Fallback transcript processing completed',
          callId,
          eventType: message?.type || 'unknown',
        });
      } catch (error) {
        logger.error(
          '[Webhook] Fallback processing failed:',
          'Component',
          error
        );
      }
    }

    // ✅ FALLBACK: Handle unknown event types
    logger.debug('[Webhook] Checking for unknown event type...', 'Component', {
      messageType: message?.type,
      hasMessages: !!message?.messages,
      callId,
    });

    // ✅ FINAL FALLBACK: Log detailed info for debugging
    logger.warn(
      '[Webhook] No transcript data found in any expected field',
      'Component',
      {
        messageType: message?.type,
        callId,
        hasTranscript: !!message?.transcript,
        hasMessages: !!message?.messages,
        transcriptLength: (message?.transcript || message?.messages || [])
          .length,
        allFields: Object.keys(message || {}),
        rawPayload: JSON.stringify(req.body).substring(0, 500),
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Webhook received but not processed (unknown event type)',
      data: {
        type: message?.type,
        callId: callId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[Webhook] Webhook processing failed:', 'Component', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
