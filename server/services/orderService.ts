import { storage } from '../storage';
import { insertOrderSchema } from '@shared/schema';
import { db } from '../../src/db';
import { request as requestTable } from '../../src/db/schema';
import { z } from 'zod';

export class OrderService {
  /**
   * Create new order
   */
  static async createOrder(orderData: any): Promise<any> {
    try {
      const validatedData = insertOrderSchema.parse({
        ...orderData,
        roomNumber: orderData.roomNumber || 'unknown',
      });
      
      const order = await storage.createOrder(validatedData);
      
      // Sync to request table for Staff UI
      await this.syncOrderToRequest(order, validatedData);
      
      return order;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid order data: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<any> {
    try {
      const order = await storage.getOrderById(parseInt(orderId));
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw new Error('Failed to retrieve order');
    }
  }

  /**
   * Get orders by room number
   */
  static async getOrdersByRoomNumber(roomNumber: string): Promise<any[]> {
    try {
      return await storage.getOrdersByRoomNumber(roomNumber);
    } catch (error) {
      console.error('Error getting orders by room:', error);
      throw new Error('Failed to retrieve orders by room');
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      if (!status) {
        throw new Error('Status is required');
      }
      
      const updatedOrder = await storage.updateOrderStatus(parseInt(orderId), status);
      
      if (!updatedOrder) {
        throw new Error('Order not found');
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Get all orders
   */
  static async getAllOrders(): Promise<any> {
    try {
      const allOrders = await storage.getAllOrders({});
      
      const totalOrders = allOrders.length;
      const ordersByStatus = allOrders.reduce((acc: any, order: any) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalOrders,
        ordersByStatus,
        averageOrderValue: totalOrders > 0 
          ? allOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) / totalOrders 
          : 0
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw new Error('Failed to get order statistics');
    }
  }

  /**
   * Delete all orders
   */
  static async deleteAllOrders(): Promise<void> {
    try {
      await storage.deleteAllOrders();
    } catch (error) {
      console.error('Error deleting all orders:', error);
      throw new Error('Failed to delete all orders');
    }
  }

  /**
   * Sync order to request table for Staff UI
   */
  private static async syncOrderToRequest(order: any, orderData: any): Promise<void> {
    try {
      await db.insert(requestTable).values({
        roomNumber: (order as any).roomNumber || (orderData as any).roomNumber || 'unknown',
        orderId: (order as any).id?.toString() || `ORD-${Date.now()}`,
        guestName: 'Guest',
        requestContent: this.formatRequestContent(orderData),
        status: 'Đã ghi nhận',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (syncErr) {
      console.error('Failed to sync order to request table:', syncErr);
      // Don't throw error, just log it
    }
  }

  /**
   * Format request content from order data
   */
  private static formatRequestContent(orderData: any): string {
    if (Array.isArray((orderData as any).items) && (orderData as any).items.length > 0) {
      return (orderData as any).items
        .map((i: any) => `${i.name || 'Item'} x${i.quantity || 1}`)
        .join(', ');
    }
    
    return (orderData as any).orderType || (orderData as any).requestContent || 'Service Request';
  }

  /**
   * Get order statistics
   */
  static async getOrderStatistics(): Promise<any> {
    try {
      const allOrders = await storage.getAllOrders({});
      
      const totalOrders = allOrders.length;
      const ordersByStatus = allOrders.reduce((acc: any, order: any) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalOrders,
        ordersByStatus,
        averageOrderValue: totalOrders > 0 
          ? allOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) / totalOrders 
          : 0
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw new Error('Failed to get order statistics');
    }
  }
} 