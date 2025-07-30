import { extractServiceRequests, generateCallSummary } from '@server/openai';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

/**
 * Generate call summary from transcripts
 * POST /api/openai/summary
 */
router.post('/summary', express.json(), async (req, res) => {
  try {
    const { transcripts, language = 'en' } = req.body;

    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({
        success: false,
        error: 'transcripts array is required',
      });
    }

    logger.debug('[OpenAI] Generating summary from transcripts', 'Component', {
      transcriptCount: transcripts.length,
      language,
    });

    // Generate summary using OpenAI
    const summary = await generateCallSummary(transcripts, language);

    logger.success('[OpenAI] Summary generated successfully', 'Component', {
      summaryLength: summary.length,
    });

    return res.status(200).json({
      success: true,
      summary,
      metadata: {
        transcriptCount: transcripts.length,
        language,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('[OpenAI] Error generating summary:', 'Component', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * Extract service requests from summary
 * POST /api/openai/service-requests
 */
router.post('/service-requests', express.json(), async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'summary string is required',
      });
    }

    logger.debug(
      '[OpenAI] Extracting service requests from summary',
      'Component',
      {
        summaryLength: summary.length,
      }
    );

    // Extract service requests using OpenAI
    const requests = await extractServiceRequests(summary);

    logger.success(
      '[OpenAI] Service requests extracted successfully',
      'Component',
      {
        requestCount: requests.length,
      }
    );

    return res.status(200).json({
      success: true,
      requests,
      metadata: {
        requestCount: requests.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      '[OpenAI] Error extracting service requests:',
      'Component',
      error
    );
    return res.status(500).json({
      success: false,
      error: 'Failed to extract service requests',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

export default router;
