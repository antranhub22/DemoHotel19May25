import express, { type Request, Response } from 'express';
import { z } from 'zod';
import { sendServiceConfirmation } from '../gmail';
import { sendMobileEmail } from '../mobileMail';
import { db } from '@shared/db';
import { request as requestTable } from '@shared/db';
import { eq, desc } from 'drizzle-orm';
import { getCurrentTimestamp } from '@shared/utils';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// ORDER MANAGEMENT ENDPOINTS
// ============================================

// Get all orders/requests
router.get('/orders', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug('📦 [ORDERS] Getting all orders for tenant: ${tenantId}', 'Component');

    const orders = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.tenant_id, tenantId))
      .orderBy(desc(requestTable.created_at));

    logger.debug('📦 [ORDERS] Found ${orders.length} orders for tenant: ${tenantId}', 'Component');
    res.json(orders);
  } catch (error) {
    logger.error('❌ [ORDERS] Error fetching orders:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new order/request
router.post('/orders', express.json(), async (req, res) => {
  try {
    const {
      roomNumber,
      requestContent,
      description,
      priority = 'medium',
      tenantId = 'mi-nhon-hotel',
      callId,
    } = req.body;

    if (!roomNumber || !requestContent) {
      return res.status(400).json({
        error: 'roomNumber and requestContent are required',
      });
    }

    logger.debug('📦 [ORDERS] Creating new order for room: ${roomNumber}', 'Component');

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create request record
    const [newRequest] = await db
      .insert(requestTable)
      .values({
        room_number: roomNumber,
        request_content: requestContent,
        description: description || requestContent,
        priority,
        tenant_id: tenantId,
        call_id: callId || null,
        order_id: orderId,
        status: 'Đã ghi nhận',
        created_at: new Date(),
      })
      .returning();

    // Send email notification
    try {
      await sendServiceConfirmation(
        'frontdesk@minhonhotel.com', // Default email for order notifications
        {
          serviceType: 'Service Request',
          roomNumber,
          timestamp: new Date(),
          details: requestContent,
          orderReference: orderId,
        }
      );
      logger.debug('📧 [ORDERS] Email notification sent for order: ${orderId}', 'Component');
    } catch (emailError) {
      logger.warn('⚠️ [ORDERS] Email notification failed for order: ${orderId}', 'Component', emailError);
      // Don't fail the request if email fails
    }

    logger.debug('✅ [ORDERS] Order created successfully: ${orderId}', 'Component');
    res.status(201).json({
      success: true,
      order: newRequest,
      orderId,
    });
  } catch (error) {
    logger.error('❌ [ORDERS] Error creating order:', 'Component', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.put('/orders/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    logger.debug('📦 [ORDERS] Updating order ${id} status to: ${status}', 'Component');

    const [updatedOrder] = await db
      .update(requestTable)
      .set({
        status,
        assigned_to: assigned_to || null,
        updated_at: new Date(),
      })
      .where(eq(requestTable.id, parseInt(id)))
      .returning();

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    logger.debug('✅ [ORDERS] Order updated successfully: ${id}', 'Component');
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    logger.error('❌ [ORDERS] Error updating order:', 'Component', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug('📦 [ORDERS] Getting order by ID: ${id}', 'Component');

    const [order] = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    logger.debug('📦 [ORDERS] Found order: ${order.order_id}', 'Component');
    res.json(order);
  } catch (error) {
    logger.error('❌ [ORDERS] Error fetching order:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug('🗑️ [ORDERS] Deleting order: ${id}', 'Component');

    const [deletedOrder] = await db
      .delete(requestTable)
      .where(eq(requestTable.id, parseInt(id)))
      .returning();

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    logger.debug('✅ [ORDERS] Order deleted successfully: ${deletedOrder.order_id}', 'Component');
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    logger.error('❌ [ORDERS] Error deleting order:', 'Component', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
