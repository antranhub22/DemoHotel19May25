// ✅ DEBUG: Test endpoint to verify OpenAI summary generation
import { generateCallSummaryOptimized } from '@server/openai';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

/**
 * Test OpenAI summary generation with sample data
 * GET /api/test-openai/summary
 */
router.get('/summary', async (req, res) => {
  try {
    logger.debug('[TEST-OPENAI] Testing summary generation...', 'Component');

    // Sample transcript data similar to actual voice calls
    const sampleTranscripts = [
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
      {
        role: 'assistant',
        content:
          'Absolutely! Your order will be delivered to room 201 within 30 minutes. Is there anything else I can help you with?',
      },
      {
        role: 'user',
        content: 'No, that is all. Thank you!',
      },
    ];

    logger.debug('[TEST-OPENAI] Sample transcripts prepared', 'Component', {
      transcriptCount: sampleTranscripts.length,
    });

    // Test the optimized function
    const result = await generateCallSummaryOptimized(sampleTranscripts, 'en');

    logger.success('[TEST-OPENAI] Summary generation completed', 'Component', {
      summaryLength: result.summary.length,
      serviceRequestsCount: result.serviceRequests.length,
    });

    // Return detailed results
    return res.status(200).json({
      success: true,
      test: 'OpenAI Summary Generation',
      input: {
        transcriptCount: sampleTranscripts.length,
        language: 'en',
        sampleData: sampleTranscripts,
      },
      output: {
        summary: result.summary,
        serviceRequests: result.serviceRequests,
        summaryLength: result.summary.length,
        serviceRequestsCount: result.serviceRequests.length,
      },
      environment: {
        hasOpenAI: !!process.env.VITE_OPENAI_API_KEY,
        apiKeySet: process.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing',
        projectId: process.env.VITE_OPENAI_PROJECT_ID ? 'Present' : 'Missing',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      '[TEST-OPENAI] Error testing summary generation:',
      'Component',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Failed to test OpenAI summary generation',
      details: error,
      environment: {
        hasOpenAI: !!process.env.VITE_OPENAI_API_KEY,
        apiKeySet: process.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing',
        projectId: process.env.VITE_OPENAI_PROJECT_ID ? 'Present' : 'Missing',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Test basic summary fallback (when OpenAI is not available)
 * GET /api/test-openai/fallback
 */
router.get('/fallback', async (req, res) => {
  try {
    const { generateBasicSummary } = await import('@server/openai');

    const sampleTranscripts = [
      { role: 'user', content: 'Hi, I am in room 201 and want to order food' },
      { role: 'assistant', content: 'What would you like to order?' },
      { role: 'user', content: '2 burgers please' },
    ];

    const fallbackSummary = generateBasicSummary(sampleTranscripts);

    return res.status(200).json({
      success: true,
      test: 'Fallback Summary Generation',
      fallbackSummary,
      summaryLength: fallbackSummary.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('[TEST-OPENAI] Error testing fallback:', 'Component', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test fallback summary',
      details: error,
    });
  }
});

export default router;
