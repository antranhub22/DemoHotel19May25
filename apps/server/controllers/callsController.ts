import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '@server/storage';
import { call, db } from '@shared/db';
import { insertTranscriptSchema } from '@shared/schema';
import { logger } from '@shared/utils/logger';
// import { transcript } from '@shared/db'; // Used via storage service

/**
 * Calls Controller
 *
 * Handles all call-related HTTP requests and responses.
 * Business logic is delegated to storage and database services.
 */
export class CallsController {
  /**
   * Get transcripts by call ID
   */
  static async getTranscriptsByCallId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const callId = req.params.callId;

      logger.api(
        `📞 [CallsController] Getting transcripts for call: ${callId}`,
        'CallsController'
      );

      const transcripts = await storage.getTranscriptsByCallId(callId);

      logger.success(
        '📞 [CallsController] Transcripts retrieved successfully',
        'CallsController',
        {
          callId,
          transcriptCount: transcripts.length,
        }
      );

      (res as any).json({
        success: true,
        data: transcripts,
      });
    } catch (error) {
      logger.error(
        '❌ [CallsController] Failed to get transcripts',
        'CallsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve transcripts',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as any)?.message || String(error)
            : undefined,
      });
    }
  }

  /**
   * Update call duration when call ends
   */
  static async endCall(req: Request, res: Response): Promise<void> {
    try {
      const { callId, duration } = req.body;

      if (!callId || duration === undefined) {
        (res as any).status(400).json({
          success: false,
          error: 'callId and duration are required',
        });
        return;
      }

      logger.api(
        `📞 [CallsController] Ending call: ${callId} with duration: ${duration}s`,
        'CallsController'
      );

      // Update call duration and end time using existing schema fields
      await db
        .update(call)
        .set({
          duration: Math.floor(duration),
          end_time: new Date(),
        })
        .where(eq(call.call_id_vapi, callId));

      logger.success(
        `📞 [CallsController] Call ended successfully`,
        'CallsController',
        {
          callId,
          duration: Math.floor(duration),
        }
      );

      (res as any).json({
        success: true,
        duration: Math.floor(duration),
      });
    } catch (error) {
      logger.error(
        '❌ [CallsController] Error ending call',
        'CallsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Create new call record
   */
  static async createCall(req: Request, res: Response): Promise<void> {
    try {
      const { call_id_vapi, room_number, language, service_type, tenant_id } =
        req.body;

      if (!call_id_vapi) {
        (res as any).status(400).json({
          success: false,
          error: 'call_id_vapi is required',
        });
        return;
      }

      logger.api(
        `📞 [CallsController] Creating call: ${call_id_vapi}`,
        'CallsController',
        {
          room_number,
          language,
          service_type,
          tenant_id,
        }
      );

      // Create call record with all supported fields
      const [newCall] = await db
        .insert(call)
        .values({
          call_id_vapi,
          room_number: room_number || null,
          language: language || 'en',
          service_type: service_type || null,
          tenant_id: tenant_id || null,
          start_time: new Date(),
        })
        .returning();

      logger.success(
        '📞 [CallsController] Call created successfully',
        'CallsController',
        {
          callId: newCall.call_id_vapi,
          room_number: newCall.room_number,
        }
      );

      (res as any).json({
        success: true,
        data: newCall,
      });
    } catch (error) {
      logger.error(
        '❌ [CallsController] Error creating call',
        'CallsController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Test transcript endpoint for development/testing
   */
  static async createTestTranscript(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { callId, role, content } = req.body;

      if (!callId || !role || !content) {
        (res as any).status(400).json({
          success: false,
          error: 'Call ID, role, and content are required',
        });
        return;
      }

      logger.api(
        `📞 [CallsController] Creating test transcript for call: ${callId}`,
        'CallsController',
        {
          role,
          contentLength: content.length,
        }
      );

      // Convert camelCase to snake_case for database schema validation
      // Ensure timestamp is within valid range for PostgreSQL
      const now = Date.now();
      const validTimestamp = Math.min(now, 2147483647000); // PostgreSQL max timestamp

      const transcriptDataForValidation = {
        call_id: callId,
        role,
        content,
        tenant_id: 'default',
        timestamp: validTimestamp,
      };

      // Validate with database schema (expects snake_case)
      const validatedData = insertTranscriptSchema.parse(
        transcriptDataForValidation
      );

      // Auto-create call record if it doesn't exist
      try {
        const existingCall = await db
          .select()
          .from(call)
          .where(eq(call.call_id_vapi, callId))
          .limit(1);

        if (existingCall.length === 0) {
          logger.debug(
            `🔍 [CallsController] No call found for ${callId}, skipping auto-creation due to schema mismatch`,
            'CallsController'
          );
          // TODO: Fix schema mismatch and re-enable call creation
        }
      } catch (error) {
        logger.error(
          '❌ [CallsController] Error checking call record',
          'CallsController',
          error
        );
      }

      // Store transcript in database with field mapping
      await storage.addTranscript({
        callId,
        role,
        content,
        tenantId: 'default',
        timestamp: validTimestamp,
      });

      logger.success(
        '📞 [CallsController] Test transcript created successfully',
        'CallsController',
        {
          callId,
          role,
        }
      );

      (res as any).json({
        success: true,
        message: 'Test transcript stored successfully',
        data: validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(
          '❌ [CallsController] Zod validation errors in test-transcript',
          'CallsController',
          error.errors
        );
        (res as any).status(400).json({
          success: false,
          error: 'Invalid transcript data',
          details: error.errors,
          receivedFields: Object.keys(req.body),
        });
      } else {
        logger.error(
          '❌ [CallsController] Failed to store test transcript',
          'CallsController',
          error
        );
        (res as any).status(500).json({
          success: false,
          error: 'Failed to store test transcript',
          details:
            process.env.NODE_ENV === 'development'
              ? (error as any)?.message || String(error)
              : undefined,
        });
      }
    }
  }
}
