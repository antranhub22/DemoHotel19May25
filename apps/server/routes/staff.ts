import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { performanceMiddleware } from '@server/middleware/performanceMonitoring';
import { CacheKeys, dashboardCache } from '@server/services/DashboardCache';
import { dashboardWebSocket } from '@server/services/DashboardWebSocket';
import { GuestAuthService } from '@server/services/guestAuthService';
import { db } from '@shared/db';
import { request as requestTable } from '@shared/db/schema';
import { deleteAllRequests } from '@shared/utils';
import { logger } from '@shared/utils/logger';
import { desc, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';

// Legacy types for backward compatibility
interface StaffRequest {
  id: number;
  roomNumber: string;
  customerName: string;
  requestType: string;
  requestContent: string;
  status: string;
  createdAt: any;
  updatedAt: any;
  priority: string;
  totalAmount: number;
  callId: string;
  assignedTo: string | null;
  customer: string;
  request: string;
  timestamp: any;
}

interface StaffMessage {
  id: number;
  requestId: number;
  content: string;
  timestamp: Date;
  sender: string;
  created_at: Date;
  updated_at: Date;
}

// Import legacy models for backward compatibility
const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  logger.error(defaultMessage, 'Component', error);
  res.status(500).json({
    error: defaultMessage,
    details:
      process.env.NODE_ENV === 'development'
        ? (error as any)?.message || String(error)
        : undefined,
  });
}

// ✅ NEW: Helper function to extract tenant ID from hostname
function extractTenantFromRequest(req: Request): string {
  try {
    const hostname = req.get('host') || '';

    // Try to extract from authentication first (if available)
    const authTenantId = (req as any).tenant?.id;
    if (
      authTenantId &&
      authTenantId !== 'default' &&
      authTenantId !== 'mi-nhon-hotel'
    ) {
      logger.debug(
        `👥 [STAFF] Using auth tenant ID: ${authTenantId}`,
        'Component'
      );
      return authTenantId;
    }

    // Extract from hostname (same logic as guest routes)
    const subdomain = GuestAuthService.extractSubdomain(hostname);
    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      logger.debug(
        `👥 [STAFF] Extracted tenant from hostname: ${subdomain}`,
        'Component'
      );
      return subdomain;
    }

    // Fallback for development/testing
    const fallbackTenant = 'mi-nhon-hotel';
    logger.warn(
      `👥 [STAFF] Using fallback tenant: ${fallbackTenant} for hostname: ${hostname}`,
      'Component'
    );
    return fallbackTenant;
  } catch (error) {
    logger.error(
      '❌ [STAFF] Error extracting tenant from request:',
      'Component',
      error
    );
    return 'mi-nhon-hotel'; // Safe fallback
  }
}

// Dummy data for legacy compatibility
const requestList: StaffRequest[] = [];
const messageList: StaffMessage[] = [];

// ============================================
// STAFF MANAGEMENT ENDPOINTS
// ============================================

// Get all staff requests
router.get(
  '/staff/requests',
  authenticateJWT,
  performanceMiddleware, // ✅ ENHANCEMENT: Performance monitoring (ZERO RISK)
  async (req: Request, res: Response) => {
    try {
      const tenantId = extractTenantFromRequest(req);
      logger.debug(
        `👥 [STAFF] Getting staff requests for tenant: ${tenantId}`,
        'Component'
      );

      // ✅ ENHANCEMENT: Transparent caching layer (ZERO RISK)
      // If cache fails, automatically falls back to original database logic
      const finalRequests = await dashboardCache.get(
        CacheKeys.staffRequests(tenantId),
        async () => {
          // EXISTING DATABASE LOGIC WRAPPED (UNCHANGED)
          const dbRequests = await db
            .select()
            .from(requestTable)
            .where(eq(requestTable.tenant_id, tenantId))
            .orderBy(desc(requestTable.created_at));

          logger.debug(
            `📊 [STAFF] Found ${dbRequests.length} database requests for tenant: ${tenantId}`,
            'Component'
          );

          // Transform database requests to match expected format (UNCHANGED)
          const transformedRequests = dbRequests.map(req => ({
            id: req.id,
            roomNumber: req.room_number || 'N/A',
            customerName: req.customer_name || 'Guest',
            requestType: req.order_type || req.type || 'Service Request',
            requestContent:
              req.request_content || req.special_instructions || 'No details',
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

          // Fallback to legacy requests if database is empty (UNCHANGED)
          return transformedRequests.length > 0
            ? transformedRequests
            : requestList;
        },
        60000 // 1 minute cache TTL
      );

      logger.debug(
        `✅ [STAFF] Returning ${finalRequests.length} requests to staff interface`,
        'Component'
      );
      res.json(finalRequests);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch staff requests');
    }
  }
);

// Update request status
router.patch(
  '/staff/requests/:id/status',
  authenticateJWT,
  performanceMiddleware, // ✅ ENHANCEMENT: Performance monitoring (ZERO RISK)
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, assignedTo } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Missing status field' });
      }

      logger.debug(
        `📝 [STAFF] Updating request ${id} status to: ${status}`,
        'Component'
      );

      // Update in database
      try {
        await db
          .update(requestTable)
          .set({
            status,
            assigned_to: assignedTo,
            updated_at: new Date(),
          })
          .where(eq(requestTable.id, parseInt(id)));

        logger.debug(
          `✅ [STAFF] Database updated for request ${id}`,
          'Component'
        );
      } catch (dbError) {
        logger.error(
          `❌ [STAFF] Failed to update database for request ${id}`,
          'Component',
          dbError
        );
        return res.status(500).json({
          error: 'Failed to update request status in database',
        });
      }

      // Get request details for guest notification
      let requestDetails = null;
      try {
        const requestQuery = await db
          .select()
          .from(requestTable)
          .where(eq(requestTable.id, parseInt(id)))
          .limit(1);
        requestDetails = requestQuery[0];
      } catch (dbError) {
        logger.warn(
          `⚠️ [STAFF] Could not fetch request details for guest notification`,
          'Component',
          dbError
        );
      }

      // WebSocket notification
      const io = (req as any).app?.get('io');
      if (io) {
        io.emit('requestStatusUpdate', {
          type: 'status-change',
          requestId: id,
          status,
          assignedTo,
          timestamp: new Date().toISOString(),
        });
        logger.debug(
          `📡 [STAFF] WebSocket notification sent for request ${id} status change`,
          'Component'
        );

        // ✅ NEW: Guest notification
        if (requestDetails) {
          io.emit('guestNotification', {
            type: 'status-update',
            requestId: id,
            roomNumber: requestDetails.room_number,
            guestName: requestDetails.guest_name,
            status,
            message: `Yêu cầu của bạn đã được cập nhật: ${status}`,
            timestamp: new Date().toISOString(),
          });
          logger.debug(
            `📱 [STAFF] Guest notification sent for room ${requestDetails.room_number}`,
            'Component'
          );
        }
      }

      // ✅ ENHANCEMENT: Invalidate cache after status update (ZERO RISK)
      const tenantId = extractTenantFromRequest(req);
      dashboardCache.delete(CacheKeys.staffRequests(tenantId));
      logger.debug(
        `🗑️ [STAFF] Cache invalidated for tenant: ${tenantId}`,
        'Component'
      );

      // ✅ ENHANCEMENT: WebSocket real-time update (MEDIUM RISK with safe fallback)
      try {
        dashboardWebSocket.publishDashboardUpdate({
          type: 'request_update',
          tenantId,
          data: {
            requestId: id,
            newStatus: status,
            assignedTo,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
          source: 'staff_status_update',
        });

        logger.debug(
          `📡 [STAFF] WebSocket update sent for request ${id}`,
          'Component'
        );
      } catch (wsError) {
        // Silent fail for WebSocket - doesn't affect main functionality
        logger.warn(
          `⚠️ [STAFF] WebSocket update failed for request ${id}`,
          'Component',
          wsError
        );
      }

      logger.debug(
        `✅ [STAFF] Request ${id} status updated successfully`,
        'Component'
      );
      res.json({
        success: true,
        message: 'Request status updated successfully',
        requestId: id,
        newStatus: status,
        assignedTo,
      });
    } catch (error) {
      handleApiError(res, error, 'Failed to update request status');
    }
  }
);

// Get messages for a specific request
router.get(
  '/staff/requests/:id/messages',
  authenticateJWT,
  (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      logger.debug(
        `💬 [STAFF] Getting messages for request: ${id}`,
        'Component'
      );

      const messages = messageList.filter(msg => msg.requestId === id);

      logger.debug(
        `✅ [STAFF] Found ${messages.length} messages for request: ${id}`,
        'Component'
      );
      res.json(messages);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch request messages');
    }
  }
);

// Send message for a request
router.post(
  '/staff/requests/:id/message',
  authenticateJWT,
  (req: Request, res: Response) => {
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
        timestamp: new Date(), // ✅ FIXED: Add required timestamp property
        created_at: new Date(),
        updated_at: new Date(),
      };

      messageList.push(message);

      logger.debug(
        `✅ [STAFF] Message sent successfully for request: ${id}`,
        'Component'
      );
      res.status(201).json(message);
    } catch (error) {
      handleApiError(res, error, 'Failed to send message');
    }
  }
);

// Delete all requests (admin function)
router.delete(
  '/staff/requests/all',
  authenticateJWT,
  async (_req: Request, res: Response) => {
    try {
      logger.debug(`🗑️ [STAFF] Attempting to delete all requests`, 'Component');

      // Delete all data from request table using API function
      const result = await deleteAllRequests();
      const deletedCount =
        result.success && 'deletedCount' in result
          ? result.deletedCount || 0
          : 0;

      logger.debug(
        `✅ [STAFF] Deleted ${deletedCount} requests from database`,
        'Component'
      );

      res.json({
        success: true,
        message: `Đã xóa ${deletedCount} requests`,
        deletedCount,
      });
    } catch (error) {
      handleApiError(res, error, 'Error deleting all requests');
    }
  }
);

export default router;
