import { getDatabase } from '@shared/db';
import { request } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';

// ✅ FIX: Enhanced error handling for database operations
async function safeDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error('Database operation failed:', error);

    // Check for specific database errors
    if (
      error instanceof Error &&
      (error.message.includes('connection') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED'))
    ) {
      throw new Error('Database connection error. Please try again.');
    }

    throw error;
  }
}

export class RequestController {
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        '📝 [RequestController] Creating new request - Modular v2.0',
        'RequestController'
      );

      const { serviceType, requestText, roomNumber, guestName, priority } =
        req.body;

      // ✅ FIX: Use safe database operation
      const newRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .insert(request)
          .values({
            serviceType,
            requestText,
            roomNumber,
            guestName,
            priority: priority || 'medium',
            status: 'pending',
            createdAt: new Date(),
          })
          .returning();
      });

      const response = {
        success: true,
        data: newRequest[0],
        _metadata: {
          module: 'request-module',
          version: '2.0.0',
          architecture: 'modular-enhanced',
        },
      };

      logger.success(
        '✅ [RequestController] Request created successfully - Modular v2.0',
        'RequestController',
        response
      );

      (res as any).status(201).json(response);
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to create request - Modular v2.0',
        'RequestController',
        error
      );

      // ✅ FIX: Better error responses
      if (
        error instanceof Error &&
        error.message.includes('Database connection error')
      ) {
        (res as any).status(503).json({
          success: false,
          error: 'Database temporarily unavailable. Please try again.',
          code: 'DATABASE_UNAVAILABLE',
        });
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to create request',
          details:
            error instanceof Error
              ? (error as any)?.message || String(error)
              : 'Unknown error',
          _metadata: {
            module: 'request-module',
            version: '2.0.0',
            architecture: 'modular-enhanced',
          },
        });
      }
    }
  }

  // ✅ NOTE: Other methods (getAllRequests, getRequestById, updateRequestStatus)
  // remain exactly the same for backwards compatibility
  // They can be enhanced incrementally in future versions

  /**
   * Get all requests
   * GET /api/request
   */
  static async getAllRequests(_req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        '📋 [RequestController] Getting all requests...',
        'RequestController'
      );

      // ✅ FIX: Use safe database operation
      const requestsData = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db.query.request.findMany({
          orderBy: { createdAt: 'desc' },
          limit: 100,
        });
      });

      logger.success(
        '✅ [RequestController] Requests fetched successfully',
        'RequestController',
        { count: requestsData.length }
      );

      (res as any).json({ success: true, data: requestsData });
    } catch (error) {
      // ✅ ENHANCED: Better error detection and reporting
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('Database connection error') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('ECONNREFUSED')
      ) {
        logger.error(
          '❌ [RequestController] Database connection error',
          'RequestController',
          error
        );
        (res as any).status(503).json({
          success: false,
          error: 'Database service temporarily unavailable. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
        });
        return;
      }

      logger.error(
        '❌ [RequestController] Failed to fetch requests',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch requests',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  }

  /**
   * Get specific request by ID
   * GET /api/request/:id
   */
  static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(
        `📋 [RequestController] Getting request by ID: ${id}`,
        'RequestController'
      );

      // ✅ FIX: Use safe database operation
      const request = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db.query.request.findFirst({
          where: { id: parseInt(id) },
        });
      });

      if (!request) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      (res as any).json({ success: true, data: request });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to fetch request by ID',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch request',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      });
    }
  }

  /**
   * Update request status
   * PATCH /api/request/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      logger.info(
        `📋 [RequestController] Updating request status: ${id} -> ${status}`,
        'RequestController'
      );

      // ✅ FIX: Use safe database operation
      const updatedRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .update(request)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where({ id: parseInt(id) })
          .returning();
      });

      if (!updatedRequest || updatedRequest.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      (res as any).json({ success: true, data: updatedRequest[0] });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to update request status',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to update request status',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      });
    }
  }
}
