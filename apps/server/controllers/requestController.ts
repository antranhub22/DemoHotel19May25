import { getDatabase } from '@shared/db';
import { request } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';
import { requestMapper } from '@shared/db/transformers';
import { desc, eq } from 'drizzle-orm'; // ✅ Import drizzle-orm functions

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

      // ✅ FIX: Validate required fields
      if (!roomNumber) {
        (res as any).status(400).json({
          success: false,
          error: 'Room number is required',
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      // ✅ FIX: Use requestMapper for proper field mapping and add default tenant_id
      const requestData = requestMapper.toDatabase({
        tenantId: req.body.tenantId || 'default-tenant', // ✅ Add required tenant_id
        roomNumber: roomNumber,
        requestContent: requestText, // ✅ Map requestText to requestContent
        guestName: guestName,
        priority: priority || 'medium',
        status: 'pending',
        createdAt: new Date(),
        // ✅ Handle serviceType - map to description field as fallback
        description: serviceType ? `Service: ${serviceType}` : undefined,
      });

      // ✅ FIX: Use safe database operation with mapped fields
      const newRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .insert(request)
          .values(requestData)
          .returning();
      });

      // ✅ FIX: Map response back to camelCase for frontend
      const responseData = requestMapper.toFrontend(newRequest[0]);

      const response = {
        success: true,
        data: responseData,
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

      // ✅ FIX: Use safe database operation with correct drizzle syntax
      const requestsData = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .select()
          .from(request)
          .orderBy(desc(request.created_at)) // ✅ Fix: Use desc() function
          .limit(100);
      });

      // ✅ FIX: Map all requests to camelCase for frontend
      const mappedRequests = requestsData.map(req => requestMapper.toFrontend(req));

      logger.success(
        '✅ [RequestController] Requests fetched successfully',
        'RequestController',
        { count: mappedRequests.length }
      );

      (res as any).json({ success: true, data: mappedRequests });
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

      // ✅ FIX: Use safe database operation with correct drizzle syntax
      const requestData = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .select()
          .from(request)
          .where(eq(request.id, parseInt(id))) // ✅ Fix: Use eq() function
          .limit(1);
      });

      if (!requestData || requestData.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      // ✅ FIX: Map to camelCase for frontend
      const mappedRequest = requestMapper.toFrontend(requestData[0]);

      (res as any).json({ success: true, data: mappedRequest });
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

      // ✅ FIX: Use requestMapper for field mapping
      const updateData = requestMapper.toDatabase({
        status: status,
        updatedAt: new Date(),
      });

      // ✅ FIX: Use safe database operation with correct drizzle syntax
      const updatedRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .update(request)
          .set(updateData)
          .where(eq(request.id, parseInt(id))) // ✅ Fix: Use eq() function
          .returning();
      });

      if (!updatedRequest || updatedRequest.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      // ✅ FIX: Map response to camelCase
      const mappedResponse = requestMapper.toFrontend(updatedRequest[0]);

      (res as any).json({ success: true, data: mappedResponse });
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
