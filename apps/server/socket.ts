import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '@shared/utils/logger';

export function setupSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.debug('Socket connected: ${socket.id}', 'Component');

    // Join a room for a particular order ID (room = orderId)
    socket.on('join_room', (orderId: string) => {
      socket.join(orderId);
      logger.debug('Socket ${socket.id} joined room ${orderId}', 'Component');
    });

    // Listen for staff updates to order status
    socket.on(
      'update_order_status',
      (data: { orderId: string; status: string }) => {
        const { orderId, status } = data;
        logger.debug('Received status update for order ${orderId}: ${status}', 'Component');
        // Broadcast to clients in that room
        io.to(orderId).emit('order_status_update', { orderId, status });
      }
    );

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected: ${socket.id}', 'Component');
    });
  });

  return io;
}
