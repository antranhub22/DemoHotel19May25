// ✅ DEBUG: Test webhook with different payload formats
import express from 'express';
import { logger } from '@shared/utils/logger';

const router = express.Router();

/**
 * Test webhook with sample end-of-call-report
 * POST /api/test-webhook/end-of-call
 */
router.post('/end-of-call', async (req, res) => {
  try {
    logger.debug(
      '[TEST-WEBHOOK] Testing end-of-call-report processing...',
      'Component'
    );

    // Sample end-of-call-report payload
    const samplePayload = {
      message: {
        type: 'end-of-call-report',
        call: {
          id: 'test-call-' + Date.now(),
          startedAt: new Date(Date.now() - 120000).toISOString(),
          endedAt: new Date().toISOString(),
        },
        messages: [
          {
            role: 'user',
            content: 'Hi, my name is John. I am staying in room 201.',
          },
          {
            role: 'assistant',
            content: 'Hello John! How can I help you today?',
          },
          {
            role: 'user',
            content:
              'I would like to order 2 beef burgers and 1 orange juice for room service.',
          },
          {
            role: 'assistant',
            content:
              'Perfect! 2 beef burgers and 1 orange juice for room 201. When would you like this delivered?',
          },
          {
            role: 'user',
            content: 'Please deliver within 30 minutes. Thank you!',
          },
        ],
      },
    };

    // Forward to actual webhook
    const webhookResponse = await fetch(
      'http://localhost:10000/api/webhook/vapi',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload),
      }
    );

    const webhookResult = await webhookResponse.json();

    return res.status(200).json({
      success: true,
      test: 'End-of-call webhook test',
      input: samplePayload,
      webhookResponse: {
        status: webhookResponse.status,
        result: webhookResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('[TEST-WEBHOOK] Error testing webhook:', 'Component', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to test webhook',
      details: error,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Test webhook with unknown event type
 * POST /api/test-webhook/unknown-event
 */
router.post('/unknown-event', async (req, res) => {
  try {
    const samplePayload = {
      message: {
        type: 'unknown-event',
        call: {
          id: 'test-call-unknown-' + Date.now(),
        },
        transcript: [
          { role: 'user', content: 'Hi, I want to test unknown event' },
          { role: 'assistant', content: 'This is a test response' },
        ],
      },
    };

    // Forward to actual webhook
    const webhookResponse = await fetch(
      'http://localhost:10000/api/webhook/vapi',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload),
      }
    );

    const webhookResult = await webhookResponse.json();

    return res.status(200).json({
      success: true,
      test: 'Unknown event webhook test',
      input: samplePayload,
      webhookResponse: {
        status: webhookResponse.status,
        result: webhookResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      '[TEST-WEBHOOK] Error testing unknown event:',
      'Component',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Failed to test unknown event webhook',
      details: error,
    });
  }
});

/**
 * Test webhook payload inspection
 * GET /api/test-webhook/inspect
 */
router.get('/inspect', async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Webhook inspector ready',
    instructions: [
      'POST /api/test-webhook/end-of-call - Test end-of-call-report processing',
      'POST /api/test-webhook/unknown-event - Test unknown event handling',
      'Use these endpoints to debug webhook behavior',
    ],
    timestamp: new Date().toISOString(),
  });
});

export default router;
