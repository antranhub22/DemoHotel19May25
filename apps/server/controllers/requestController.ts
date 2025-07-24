import { request as requestTable } from '@shared/db';
import { requestMapper } from '@shared/db/transformers';
import { generateId, generateShortId } from '@shared/utils/idGenerator';
import { logger } from '@shared/utils/logger';
import { and, desc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express'; // ✅ FIXED: Add Response import

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

      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      // Create request record compatible with schema (id will be auto-generated)
      const newRequest = {
        tenant_id: req.tenant.id, // ✅ OPTIMIZED: No fallback - require valid tenant
        call_id: call_id || generateId('call'),
        room_number: room_number || 'unknown',
        order_id: generateShortId('request'), // ✅ OPTIMIZED: Use UUID-based ID generation
        request_content,
        status: finalStatus,
        created_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
        updated_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
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
      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      const tenantId = req.tenant.id;

      logger.api(
        '📋 [RequestController] Getting all requests',
        'RequestController',
        { tenantId }
      );

      // Always filter by tenant for data isolation
      const requests = await db
        .select()
        .from(requestTable)
        .where(eq(requestTable.tenant_id, tenantId))
        .orderBy(desc(requestTable.created_at));

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

      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      const tenantId = req.tenant.id;

      logger.api(
        `📄 [RequestController] Getting request by ID: ${requestId}`,
        'RequestController',
        { tenantId }
      );

      // Always filter by tenant for data isolation - required, not optional
      const request = await db
        .select()
        .from(requestTable)
        .where(
          and(
            eq(requestTable.id, requestId),
            eq(requestTable.tenant_id, tenantId)
          )
        );

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

      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      const tenantId = req.tenant.id;

      logger.api(
        `📝 [RequestController] Updating request ${requestId} status to: ${status}`,
        'RequestController',
        {
          tenantId,
          assignedTo,
        }
      );

      // Always filter by tenant for data isolation - required, not optional
      const updateData: any = {
        status,
        updated_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
      };

      if (assignedTo !== undefined) {
        updateData.assigned_to = assignedTo;
      }

      await db
        .update(requestTable)
        .set(updateData)
        .where(
          and(
            eq(requestTable.id, requestId),
            eq(requestTable.tenant_id, tenantId)
          )
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
