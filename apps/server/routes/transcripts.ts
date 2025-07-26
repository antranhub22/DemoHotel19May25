import { GuestAuthService } from '@server/services/guestAuthService';
import { db } from '@shared/db';
import { transcript } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const insertTranscriptSchema = z.object({
  call_id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  tenant_id: z.string(),
});

// ✅ SECURITY FIX: Extract tenant ID from request hostname
const extractTenantIdFromRequest = (req: express.Request): string => {
  const hostname = req.get('host') || '';
  const subdomain = GuestAuthService.extractSubdomain(hostname);

  if (subdomain) {
    return `tenant-${subdomain}`;
  }

  // Fallback to default but log warning
  logger.warn(`⚠️ [TRANSCRIPTS] Could not extract tenant from hostname: ${hostname}`, 'Component');
  return 'tenant-default';
};

// Error handler
const handleApiError = (
  res: express.Response,
  error: unknown,
  defaultMessage: string
) => {
  logger.error(`❌ [TRANSCRIPTS] ${defaultMessage}:`, 'Component', error);
  res.status(500).json({
    error: defaultMessage,
    details: error instanceof Error ? error.message : String(error),
  });
};

// Get transcripts for a specific call
router.get(
  '/:callId',
  (req: express.Request, res: express.Response) => {
    const handleRequest = async () => {
      try {
        const { callId } = req.params;

        // ✅ SECURITY: Get tenant ID from hostname for proper isolation
        const tenantId = extractTenantIdFromRequest(req);

        logger.debug(
          `📋 [TRANSCRIPTS] Getting transcripts for call: ${callId}, tenant: ${tenantId}`,
          'Component'
        );

        const transcripts = await db
          .select()
          .from(transcript)
          .where(eq(transcript.call_id, callId))
          .where(eq(transcript.tenant_id, tenantId)); // ✅ SECURITY: Filter by tenant

        logger.debug(
          `✅ [TRANSCRIPTS] Found ${transcripts.length} transcripts for call: ${callId}, tenant: ${tenantId}`,
          'Component'
        );
        res.json({ success: true, data: transcripts });
      } catch (error) {
        handleApiError(res, error, 'Failed to fetch transcripts');
      }
    };

    handleRequest();
  }
);

// Store transcript data
router.post('/', (req: express.Request, res: express.Response) => {
  const handleRequest = async () => {
    try {
      const { callId, role, content, timestamp } = req.body;

      if (!callId || !role || !content) {
        return res.status(400).json({
          error: 'Missing required fields: callId, role, content',
        });
      }

      // ✅ SECURITY FIX: Extract tenant ID from hostname instead of trusting client
      const tenantId = extractTenantIdFromRequest(req);

      logger.debug(
        `📝 [TRANSCRIPTS] Storing transcript - Call: ${callId}, Role: ${role}, Tenant: ${tenantId}, Content length: ${content.length}`,
        'Component'
      );

      const validatedData = insertTranscriptSchema.parse({
        call_id: callId,
        role,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        tenant_id: tenantId, // ✅ SECURITY: Use server-side detected tenant ID
      });

      await db.insert(transcript).values(validatedData);

      logger.debug(
        `✅ [TRANSCRIPTS] Transcript stored successfully for call: ${callId}, tenant: ${tenantId}`,
        'Component'
      );
      res.json({ success: true, tenantId }); // ✅ Return tenant ID for verification
    } catch (error) {
      logger.error(
        '❌ [TRANSCRIPTS] Error storing transcript:',
        'Component',
        error
      );
      res.status(500).json({ error: 'Failed to store transcript' });
    }
  };

  handleRequest();
});

// Test transcript endpoint
router.post(
  '/test-transcript',
  (req: express.Request, res: express.Response) => {
    const handleRequest = async () => {
      try {
        const {
          callId = 'test-call-123',
          role = 'user',
          content = 'Test transcript content',
        } = req.body;

        logger.debug(
          `🧪 [TRANSCRIPTS] Creating test transcript for call: ${callId}`,
          'Component'
        );

        const validatedData = insertTranscriptSchema.parse({
          call_id: callId,
          role,
          content,
          timestamp: new Date(),
          tenant_id: 'mi-nhon-hotel',
        });

        await db.insert(transcript).values(validatedData);

        logger.debug(
          `✅ [TRANSCRIPTS] Test transcript created for call: ${callId}`,
          'Component'
        );
        res.json({
          success: true,
          message: 'Test transcript created successfully',
          transcript: {
            callId,
            role,
            content,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        handleApiError(res, error, 'Failed to create test transcript');
      }
    };

    handleRequest();
  }
);

export default router;
