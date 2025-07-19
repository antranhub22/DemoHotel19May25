import { Router, Request, Response } from 'express';
import { db } from '../db';
import { request as requestTable } from '@shared/db';
import { verifyJWT } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// ✅ POST /api/request - Create new request (UNIFIED ENDPOINT)
router.post('/', verifyJWT, async (req: Request, res: Response) => {
  try {
    console.log('📝 [Request API] Creating new request:', req.body);
    
    // Extract data from request body (compatible with both order and request formats)
    const {
      callId,
      roomNumber,
      orderType,
      deliveryTime,
      specialInstructions,
      items,
      totalAmount,
      status = 'Đã ghi nhận',
      // Alternative field names for backward compatibility
      room_number,
      order_type,
      type,
      requestContent,
      request_content
    } = req.body;

    // Build request content from items or use provided content
    let content = requestContent || request_content || specialInstructions;
    
    if (!content && items && Array.isArray(items) && items.length > 0) {
      content = items.map((item: any) => 
        `${item.name || 'Item'} x${item.quantity || 1}`
      ).join(', ');
    }
    
    if (!content) {
      content = orderType || order_type || type || 'Service Request';
    }

    // Create request record compatible with schema (id will be auto-generated)
    const newRequest = {
      tenant_id: (req as any).tenant?.id || 'default-tenant',
      call_id: callId || `CALL-${Date.now()}`,
      room_number: roomNumber || room_number || 'unknown',
      order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      request_content: content,
      status: status,
      created_at: Math.floor(Date.now() / 1000), // Unix timestamp
    };

    console.log('💾 [Request API] Inserting request:', newRequest);

    // Insert into database and get the generated ID
    const insertResult = await db.insert(requestTable).values(newRequest).returning();
    const createdRequest = insertResult[0];

    // Return success response
    const response = {
      success: true,
      data: {
        id: createdRequest.id,
        orderId: newRequest.order_id,
        callId: newRequest.call_id,
        roomNumber: newRequest.room_number,
        content: newRequest.request_content,
        status: newRequest.status,
        createdAt: new Date(newRequest.created_at * 1000).toISOString(),
        // Backward compatibility fields
        reference: newRequest.order_id,
        estimatedTime: deliveryTime || 'asap'
      }
    };

    console.log('✅ [Request API] Request created successfully:', response);
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ [Request API] Failed to create request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ GET /api/request - Get all requests
router.get('/', verifyJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant?.id;
    
    let requests;
    if (tenantId) {
      requests = await db.select().from(requestTable)
        .where(eq(requestTable.tenant_id, tenantId))
        .orderBy(requestTable.created_at);
    } else {
      requests = await db.select().from(requestTable)
        .orderBy(requestTable.created_at);
    }

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('❌ [Request API] Failed to fetch requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch requests' 
    });
  }
});

// ✅ GET /api/request/:id - Get specific request
router.get('/:id', verifyJWT, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    
    if (isNaN(requestId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request ID format' 
      });
    }
    
    const tenantId = (req as any).tenant?.id;
    
    let query = db.select().from(requestTable).where(eq(requestTable.id, requestId));
    
    if (tenantId) {
      query = query.where(eq(requestTable.tenant_id, tenantId));
    }
    
    const request = await query;
    
    if (!request || request.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Request not found' 
      });
    }

    res.json({ success: true, data: request[0] });
  } catch (error) {
    console.error('❌ [Request API] Failed to fetch request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch request' 
    });
  }
});

// ✅ PATCH /api/request/:id/status - Update request status
router.patch('/:id/status', verifyJWT, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    if (isNaN(requestId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request ID format' 
      });
    }
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }

    const tenantId = (req as any).tenant?.id;
    
    // Update the request
    let updateQuery = db.update(requestTable)
      .set({ 
        status,
        updated_at: Math.floor(Date.now() / 1000)
      })
      .where(eq(requestTable.id, requestId));
    
    if (tenantId) {
      updateQuery = updateQuery.where(eq(requestTable.tenant_id, tenantId));
    }
    
    await updateQuery;

    res.json({ 
      success: true, 
      message: 'Request status updated successfully' 
    });
  } catch (error) {
    console.error('❌ [Request API] Failed to update request status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update request status' 
    });
  }
});

export default router; 