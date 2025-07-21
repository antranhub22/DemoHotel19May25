import express, { type Request, Response } from 'express';
import { db } from '../db';
import { request as requestTable } from '@shared/db';
import { authenticateJWT } from '../../../packages/auth-system/middleware/auth.middleware';
import { eq, and } from 'drizzle-orm';
import { requestMapper } from '@shared/db/transformers';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ✅ POST /api/request - Create new request (WITH AUTO TRANSFORMATION)
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    logger.debug('📝 [Request API] Creating new request (camelCase):', 'Component', req.body);

    // ✅ TRANSFORM: camelCase frontend data → snake_case database data
    const transformedData = requestMapper.toDatabase(req.body);
    logger.debug('🔄 [Request API] Transformed to snake_case:', 'Component', transformedData);

    // Extract data from transformed body (now all snake_case)
    const {
      call_id,
      room_number,
      order_type,
      delivery_time,
      special_instructions,
      items,
      total_amount,
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
      request_content: content,
      status: finalStatus,
      created_at: Math.floor(Date.now() / 1000), // Unix timestamp
      updated_at: Math.floor(Date.now() / 1000), // Set initial updated_at
      description: special_instructions || null, // Use specialInstructions as description
      priority: 'medium', // Default priority
      assigned_to: null, // Will be assigned by staff later
    };

    logger.debug('💾 [Request API] Inserting request:', 'Component', newRequest);

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

    logger.debug('✅ [Request API] Request created successfully (camelCase):', 'Component', response);
    res.status(201).json(response);
  } catch (error) {
    logger.error('❌ [Request API] Failed to create request:', 'Component', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ✅ GET /api/request - Get all requests
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant?.id;

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

    res.json({ success: true, data: requests });
  } catch (error) {
    logger.error('❌ [Request API] Failed to fetch requests:', 'Component', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests',
    });
  }
});

// ✅ GET /api/request/:id - Get specific request
router.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format',
      });
    }

    const tenantId = (req as any).tenant?.id;

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
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    res.json({ success: true, data: request[0] });
  } catch (error) {
    logger.error('❌ [Request API] Failed to fetch request:', 'Component', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch request',
    });
  }
});

// ✅ PATCH /api/request/:id/status - Update request status
router.patch(
  '/:id/status',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (isNaN(requestId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request ID format',
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const tenantId = (req as any).tenant?.id;

      // Update the request with proper condition chaining
      const updateConditions = [eq(requestTable.id, requestId)];
      if (tenantId) {
        updateConditions.push(eq(requestTable.tenant_id, tenantId));
      }

      await db
        .update(requestTable)
        .set({
          status,
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where(
          updateConditions.length === 1
            ? updateConditions[0]
            : and(...updateConditions)
        );

      res.json({
        success: true,
        message: 'Request status updated successfully',
      });
    } catch (error) {
      logger.error('❌ [Request API] Failed to update request status:', 'Component', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update request status',
      });
    }
  }
);

export default router;
