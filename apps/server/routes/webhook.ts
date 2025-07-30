import { extractServiceRequests, generateCallSummary } from '@server/openai';
import { DatabaseStorage } from '@server/storage';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();
const storage = new DatabaseStorage();

/**
 * Webhook endpoint để nhận dữ liệu từ Vapi.ai sau khi cuộc gọi kết thúc
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
    });

    // Extract data according to Vapi.ai format
    const endOfCallReport =
      message?.type === 'end-of-call-report' ? message : null;
    const transcript = message?.messages || []; // Use messages array as transcript
    const callId = message?.call?.id || `call-${Date.now()}`;

    // ✅ STEP 1: Lưu trữ end-of-call-report cho stakeholders
    if (endOfCallReport) {
      try {
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
          {
            callId: callId,
          }
        );
      } catch (error) {
        logger.error(
          '[Webhook] Failed to save end-of-call-report:',
          'Component',
          error
        );
      }
    }

    // ✅ STEP 2: Xử lý full transcript với OpenAI
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      try {
        logger.debug(
          '[Webhook] Processing full transcript with OpenAI',
          'Component',
          {
            transcriptLength: transcript.length,
          }
        );

        // ✅ NEW: Detect language from transcript
        const detectLanguage = (transcript: any[]): string => {
          const allText = transcript
            .map(t => t.content)
            .join(' ')
            .toLowerCase();
          if (allText.includes('xin chào') || allText.includes('cảm ơn'))
            return 'vi';
          if (allText.includes('bonjour') || allText.includes('merci'))
            return 'fr';
          if (allText.includes('привет') || allText.includes('спасибо'))
            return 'ru';
          if (allText.includes('안녕하세요') || allText.includes('감사합니다'))
            return 'ko';
          if (allText.includes('你好') || allText.includes('谢谢')) return 'zh';
          return 'en'; // Default to English
        };

        const language = detectLanguage(transcript);
        console.log(`🔍 [DEBUG] Detected language: ${language}`);

        // Gọi OpenAI để tạo summary từ full transcript
        const summary = await generateCallSummary(transcript, language);

        // Gọi OpenAI để extract service requests từ summary
        const serviceRequests = await extractServiceRequests(summary);

        logger.success('[Webhook] OpenAI processing completed', 'Component', {
          summaryLength: summary?.length || 0,
          serviceRequestsCount: serviceRequests?.length || 0,
        });

        // ✅ STEP 3: Gửi kết quả cho client qua WebSocket
        try {
          // Lấy io instance từ Express app
          const io = (req as any).app.get('io');
          if (io) {
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
                callId: callId,
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

        return res.status(200).json({
          success: true,
          message: 'Webhook processed successfully',
          data: {
            summary,
            serviceRequests,
            callId: callId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        logger.error('[Webhook] OpenAI processing failed:', 'Component', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to process transcript with OpenAI',
        });
      }
    }

    // Nếu không có transcript, vẫn trả về success
    return res.status(200).json({
      success: true,
      message: 'Webhook received (no transcript to process)',
      data: {
        callId: callId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[Webhook] Webhook processing error:', 'Component', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
