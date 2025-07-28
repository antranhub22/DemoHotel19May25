import { GuestAuthService } from '@server/services/guestAuthService';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
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
  logger.warn(
    `⚠️ [TRANSCRIPTS] Could not extract tenant from hostname: ${hostname}`,
    'Component'
  );
  return 'tenant-default';
};

// Get transcripts for a specific call
router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return commonErrors.validation(res, 'Call ID is required');
    }

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

    return apiResponse.success(
      res,
      transcripts,
      `Retrieved ${transcripts.length} transcripts for call`,
      { callId, tenantId, count: transcripts.length }
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Failed to fetch transcripts:',
      'Component',
      error
    );
    return commonErrors.database(res, 'Failed to fetch transcripts', error);
  }
});

// Store transcript data
router.post('/', async (req, res) => {
  try {
    const { callId, role, content, timestamp } = req.body;

    // Validation
    if (!callId || !role || !content) {
      return commonErrors.missingFields(res, ['callId', 'role', 'content']);
    }

    // ✅ SECURITY FIX: Extract tenant ID from hostname instead of trusting client
    const tenantId = extractTenantIdFromRequest(req);

    logger.debug(
      `📝 [TRANSCRIPTS] Storing transcript - Call: ${callId}, Role: ${role}, Tenant: ${tenantId}, Content length: ${content.length}`,
      'Component'
    );

    try {
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

      return apiResponse.created(
        res,
        {
          callId,
          role,
          tenantId,
          storedAt: new Date().toISOString(),
        },
        'Transcript stored successfully'
      );
    } catch (validationError) {
      logger.error(
        '❌ [TRANSCRIPTS] Validation error:',
        'Component',
        validationError
      );
      return apiResponse.error(
        res,
        400,
        ErrorCodes.VALIDATION_ERROR,
        'Invalid transcript data',
        validationError
      );
    }
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Error storing transcript:',
      'Component',
      error
    );
    return apiResponse.error(
      res,
      500,
      ErrorCodes.TRANSCRIPT_STORAGE_ERROR,
      'Failed to store transcript',
      error
    );
  }
});

// Test transcript endpoint
router.post('/test-transcript', async (req, res) => {
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

    return apiResponse.created(
      res,
      {
        callId,
        role,
        content,
        timestamp: new Date().toISOString(),
        tenantId: 'mi-nhon-hotel',
      },
      'Test transcript created successfully'
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSCRIPTS] Failed to create test transcript:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to create test transcript',
      error
    );
  }
});

export default router;
