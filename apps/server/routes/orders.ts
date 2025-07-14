import { Router, Request, Response } from 'express';
import { storage } from '@server/storage';
import { insertOrderSchema } from '@shared/schema';
import { verifyJWT } from '@server/middleware/auth';
import { db } from '@shared/db';
import { request as requestTable } from '@shared/db';
import { z } from 'zod';

const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  console.error(defaultMessage, error);
  res.status(500).json({ 
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Create new order
router.post('/', async (req, res) => {
  try {
    const orderData = insertOrderSchema.parse({
      ...req.body,
      roomNumber: req.body.roomNumber || 'unknown',
    });
    const order = await storage.createOrder(orderData);
    
    // Sync to request table for Staff UI
    try {
      await db.insert(requestTable).values({
        id: `REQ-${Date.now()}-${Math.random()}`,
        type: (orderData as any).orderType || 'service_request',
        roomNumber: (order as any).roomNumber || (orderData as any).roomNumber || 'unknown',
        orderId: (order as any).id?.toString() || `ORD-${Date.now()}`,
        guestName: 'Guest',
        requestContent: Array.isArray((orderData as any).items) && (orderData as any).items.length > 0
          ? (orderData as any).items.map((i: any) => `${i.name || 'Item'} x${i.quantity || 1}`).join(', ')
          : (orderData as any).orderType || (order as any).requestContent || 'Service Request',
        status: 'Đã ghi nhận',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (syncErr) {
      console.error('Failed to sync order to request table:', syncErr);
    }
    
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid order data', details: error.errors });
    } else {
      handleApiError(res, error, 'Failed to create order');
    }
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    handleApiError(res, error, 'Failed to retrieve order');
  }
});

// Get orders by room number
router.get('/room/:roomNumber', async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const orders = await storage.getOrdersByRoomNumber(roomNumber);
    res.json(orders);
  } catch (error) {
    handleApiError(res, error, 'Failed to retrieve orders by room');
  }
});

// Update order status (with JWT verification)
router.patch('/:id/status', verifyJWT, async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    handleApiError(res, error, 'Failed to update order status');
  }
});

// Update order status (alternative endpoint)
router.post('/:id/update-status', verifyJWT, async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', {
        orderId,
        status,
        updatedAt: new Date()
      });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    handleApiError(res, error, 'Failed to update order status');
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await storage.getAllOrders({});
    res.json(orders);
  } catch (error) {
    handleApiError(res, error, 'Failed to retrieve orders');
  }
});

// Delete all orders
router.delete('/all', async (req, res) => {
  try {
    await storage.deleteAllOrders();
    res.json({ success: true, message: 'All orders deleted successfully' });
  } catch (error) {
    handleApiError(res, error, 'Failed to delete all orders');
  }
});

export default router; 