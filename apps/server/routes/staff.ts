import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { deleteAllRequests } from '@shared/utils';
import { logger } from '@shared/utils/logger';

// Import legacy models for backward compatibility
const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  logger.error(defaultMessage, 'Component', error);
  res.status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
  });
}

// Dummy data for legacy compatibility
const requestList: StaffRequest[] = [];
const messageList: StaffMessage[] = [];

// ============================================
// STAFF MANAGEMENT ENDPOINTS
// ============================================

// Get all staff requests
router.get('/staff/requests', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant?.id || 'mi-nhon-hotel';
    logger.debug(`👥 [STAFF] Getting staff requests for tenant: ${tenantId}`, 'Component');

    // Get from database first
    const dbRequests = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.tenant_id, tenantId))
      .orderBy(desc(requestTable.created_at));

    logger.debug(`📊 [STAFF] Found ${dbRequests.length} database requests for tenant: ${tenantId}`, 'Component');

    // Transform database requests to match expected format
    const transformedRequests = dbRequests.map(req => ({
      id: req.id,
      roomNumber: req.room_number || 'N/A',
      customerName: req.customer_name || 'Guest',
      requestType: req.order_type || req.type || 'Service Request',
      requestContent: req.request_content || req.special_instructions || 'No details',
      status: req.status || 'Đã ghi nhận',
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      priority: req.priority || 'normal',
      totalAmount: req.total_amount || 0,
      callId: req.call_id,
      assignedTo: req.assigned_to,
      // Legacy fields for backward compatibility
      customer: req.customer_name || 'Guest',
      request: req.request_content || 'Service request',
      timestamp: req.created_at,
    }));

    // Fallback to legacy requests if database is empty
    const finalRequests = transformedRequests.length > 0 ? transformedRequests : requestList;

    logger.debug(`✅ [STAFF] Returning ${finalRequests.length} requests to staff interface`, 'Component');
    res.json(finalRequests);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch staff requests');
  }
});

// Update request status
router.patch('/staff/requests/:id/status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const tenantId = (req as any).tenant?.id || 'mi-nhon-hotel';

    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }

    logger.debug(`📝 [STAFF] Updating request ${id} status to: ${status}`, 'Component');

    // Update in database
    const result = await db
      .update(requestTable)
      .set({
        status,
        assigned_to: assignedTo,
        updated_at: new Date(),
      })
      .where(eq(requestTable.id, parseInt(id)));

    // WebSocket notification
    const io = (req as any).app?.get('io');
    if (io) {
      io.emit('requestStatusUpdate', {
        requestId: id,
        status,
        assignedTo,
        timestamp: new Date().toISOString(),
      });
      logger.debug(`📡 [STAFF] WebSocket notification sent for request ${id}`, 'Component');
    }

    logger.debug(`✅ [STAFF] Request ${id} status updated successfully`, 'Component');
    res.json({ 
      success: true, 
      message: 'Request status updated successfully',
      requestId: id,
      newStatus: status,
      assignedTo 
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to update request status');
  }
});

// Get messages for a specific request
router.get('/staff/requests/:id/messages', authenticateJWT, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    logger.debug(`💬 [STAFF] Getting messages for request: ${id}`, 'Component');

    const messages = messageList.filter(msg => msg.requestId === id);
    
    logger.debug(`✅ [STAFF] Found ${messages.length} messages for request: ${id}`, 'Component');
    res.json(messages);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch request messages');
  }
});

// Send message for a request
router.post('/staff/requests/:id/message', authenticateJWT, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    logger.debug(`💬 [STAFF] Sending message for request ${id}`, 'Component');

    const message: StaffMessage = {
      id: messageList.length + 1,
      requestId: id,
      sender: 'staff',
      content,
      created_at: new Date(),
      updated_at: new Date(),
    };

    messageList.push(message);

    logger.debug(`✅ [STAFF] Message sent successfully for request: ${id}`, 'Component');
    res.status(201).json(message);
  } catch (error) {
    handleApiError(res, error, 'Failed to send message');
  }
});

// Delete all requests (admin function)
router.delete('/staff/requests/all', authenticateJWT, async (req: Request, res: Response) => {
  try {
    logger.debug(`🗑️ [STAFF] Attempting to delete all requests`, 'Component');

    // Delete all data from request table using API function
    const result = await deleteAllRequests();
    const deletedCount = result.success && 'deletedCount' in result ? result.deletedCount || 0 : 0;

    logger.debug(`✅ [STAFF] Deleted ${deletedCount} requests from database`, 'Component');

    res.json({
      success: true,
      message: `Đã xóa ${deletedCount} requests`,
      deletedCount,
    });
  } catch (error) {
    handleApiError(res, error, 'Error deleting all requests');
  }
});

export default router; 