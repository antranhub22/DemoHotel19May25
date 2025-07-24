import type { Request, Response } from 'express'; // ✅ FIXED: Add Response import
import { logger } from '@shared/utils/logger';
import { request as requestTable } from '@shared/db';
import { eq, and } from 'drizzle-orm';
import { requestMapper } from '@shared/db/transformers';

/**
 * Request Controller
 *
 * Handles all request/order-related HTTP requests and responses.
 * Includes automatic camelCase ↔ snake_case transformation for frontend compatibility.
 */
export class RequestController {
  /**
   * Create new request/order
   * POST /api/request
   */
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.api(
        '📝 [RequestController] Creating new request (camelCase)',
        'RequestController',
        req.body
      );

      // ✅ TRANSFORM: camelCase frontend data → snake_case database data
      const transformedData = requestMapper.toDatabase(req.body);
      logger.debug(
        '🔄 [RequestController] Transformed to snake_case',
        'RequestController',
        transformedData
      );

      // Extract data from transformed body (now all snake_case)
      const {
        call_id,
        room_number,
        order_type,
        delivery_time,
        special_instructions,
        items,
        // total_amount, // Available but not used in this method
        status = 'Đã ghi nhận',
        // Alternative field names for backward compatibility
        type,
        request_content,
      } = transformedData;

      // ✅ FIX: Determine final status - prioritize client value
      const finalStatus = status || 'Đã ghi nhận';

      // Build request content from items or use provided content
      let content = request_content || special_instructions;

      if (!content && items && Array.isArray(items) && items.length > 0) {
        content = items
          .map((item: any) => `${item.name || 'Item'} x${item.quantity || 1}`)
          .join(', ');
      }

      if (!content) {
        content = order_type || type || 'Service Request';
      }

      // Create request record compatible with schema (id will be auto-generated)
      const newRequest = {
        tenant_id: (req as any).tenant?.id || 'default-tenant',
        call_id: call_id || `CALL-${Date.now()}`,
        room_number: room_number || 'unknown',
        order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        request_content,
        status: finalStatus,
        created_at: Math.floor(Date.now() / 1000), // Unix timestamp
        updated_at: Math.floor(Date.now() / 1000), // Set initial updated_at
        description: special_instructions || null, // Use specialInstructions as description
        priority: 'medium', // Default priority
        assigned_to: null, // Will be assigned by staff later
      };

      logger.debug(
        '💾 [RequestController] Inserting request',
        'RequestController',
        newRequest
      );

      // Insert into database and get the generated ID
      const insertResult = await db
        .insert(requestTable)
        .values(newRequest)
        .returning();
      const createdRequest = insertResult[0];

      // ✅ TRANSFORM: snake_case database response → camelCase frontend response
      const frontendResponse = requestMapper.toFrontend(createdRequest);

      // Return success response
      const response = {
        success: true,
        data: {
          ...frontendResponse,
          // Backward compatibility fields
          reference: newRequest.order_id,
          estimatedTime: delivery_time || 'asap',
        },
      };

      logger.success(
        '📝 [RequestController] Request created successfully (camelCase)',
        'RequestController',
        {
          orderId: newRequest.order_id,
          roomNumber: newRequest.room_number,
        }
      );

      (res as any).status(201).json(response);
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to create request',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to create request',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * Get all requests
   * GET /api/request
   */
  static async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id;

      logger.api(
        '📋 [RequestController] Getting all requests',
        'RequestController',
        { tenantId }
      );

      let requests;
      if (tenantId) {
        requests = await db
          .select()
          .from(requestTable)
          .where(eq(requestTable.tenant_id, tenantId))
          .orderBy(requestTable.created_at);
      } else {
        requests = await db
          .select()
          .from(requestTable)
          .orderBy(requestTable.created_at);
      }

      logger.success(
        '📋 [RequestController] Requests retrieved successfully',
        'RequestController',
        {
          requestCount: requests.length,
          tenantId,
        }
      );

      (res as any).json({ success: true, data: requests });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to fetch requests',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch requests',
      });
    }
  }

  /**
   * Get specific request by ID
   * GET /api/request/:id
   */
  static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id, 10);

      if (isNaN(requestId)) {
        (res as any).status(400).json({
          success: false,
          error: 'Invalid request ID format',
        });
        return;
      }

      const tenantId = (req as any).tenant?.id;

      logger.api(
        `📄 [RequestController] Getting request by ID: ${requestId}`,
        'RequestController',
        { tenantId }
      );

      // Build query with proper condition chaining
      const whereConditions = [eq(requestTable.id, requestId)];
      if (tenantId) {
        whereConditions.push(eq(requestTable.tenant_id, tenantId));
      }

      const query = db
        .select()
        .from(requestTable)
        .where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions)
        );

      const request = await query;

      if (!request || request.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      logger.success(
        `📄 [RequestController] Request found`,
        'RequestController',
        {
          requestId,
          orderId: request[0].order_id,
        }
      );

      (res as any).json({ success: true, data: request[0] });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to fetch request',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch request',
      });
    }
  }

  /**
   * Update request status
   * PATCH /api/request/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { status, assignedTo } = req.body;

      if (isNaN(requestId)) {
        (res as any).status(400).json({
          success: false,
          error: 'Invalid request ID format',
        });
        return;
      }

      if (!status) {
        (res as any).status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      const tenantId = (req as any).tenant?.id;

      logger.api(
        `📝 [RequestController] Updating request ${requestId} status to: ${status}`,
        'RequestController',
        {
          tenantId,
          assignedTo,
        }
      );

      // Update the request with proper condition chaining
      const updateConditions = [eq(requestTable.id, requestId)];
      if (tenantId) {
        updateConditions.push(eq(requestTable.tenant_id, tenantId));
      }

      const updateData: any = {
        status,
        updated_at: Math.floor(Date.now() / 1000),
      };

      if (assignedTo !== undefined) {
        updateData.assigned_to = assignedTo;
      }

      await db
        .update(requestTable)
        .set(updateData)
        .where(
          updateConditions.length === 1
            ? updateConditions[0]
            : and(...updateConditions)
        );

      // WebSocket notification (if available)
      const io = (req as any).app?.get('io');
      if (io) {
        io.emit('requestStatusUpdate', {
          requestId,
          status,
          assignedTo,
          timestamp: new Date().toISOString(),
        });
        logger.debug(
          `📡 [RequestController] WebSocket notification sent for request ${requestId}`,
          'RequestController'
        );
      }

      logger.success(
        `📝 [RequestController] Request status updated successfully`,
        'RequestController',
        {
          requestId,
          newStatus: status,
          assignedTo,
        }
      );

      (res as any).json({
        success: true,
        message: 'Request status updated successfully',
        data: {
          requestId,
          status,
          assignedTo,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to update request status',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to update request status',
      });
    }
  }
}
