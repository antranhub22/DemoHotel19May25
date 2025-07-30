/// <reference types="vite/client" />

// Type declaration for import.meta

import { useAssistant } from '@/context';
import { ActiveOrder } from '@/types/core';
import { logger } from '@shared/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const assistant = useAssistant();
  const retryRef = useRef(0);

  // Initialize Socket.IO connection
  const initSocket = useCallback(() => {
    logger.debug(
      'useWebSocket env VITE_API_HOST:',
      'Component',
      import.meta.env.VITE_API_HOST
    );

    // ✅ ENHANCED: Better cleanup of existing socket
    if (socket !== null) {
      // Clear any pending reconnection timeout
      if ((socket as any).reconnectTimeout) {
        clearTimeout((socket as any).reconnectTimeout);
      }

      // Disconnect existing socket
      if (socket.connected) {
        socket.disconnect();
      }
    }

    // ✅ IMPROVED: Better Socket.IO URL construction for production
    let socketUrl: string;

    // Production environment detection
    if (
      import.meta.env.PROD ||
      window.location.hostname.includes('.onrender.com') ||
      window.location.hostname.includes('.talk2go.online')
    ) {
      // Use current host for production
      socketUrl = window.location.origin;
    } else {
      // Development environment
      const apiHost = import.meta.env.VITE_API_HOST || window.location.host;
      socketUrl = `http://${apiHost}`;
    }

    logger.debug('Attempting Socket.IO connection to', 'Component', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: import.meta.env.PROD ? 15000 : 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    // ✅ NEW: Add connection timeout for production stability
    const connectionTimeout = setTimeout(
      () => {
        if (!newSocket.connected) {
          logger.warn(
            'Socket.IO connection timeout, disconnecting...',
            'Component'
          );
          newSocket.disconnect();
        }
      },
      import.meta.env.PROD ? 15000 : 10000
    ); // Longer timeout for production

    newSocket.on('connect', () => {
      logger.debug('Socket.IO connection established', 'Component');
      clearTimeout(connectionTimeout); // Clear timeout on successful connection
      setConnected(true);
      retryRef.current = 0; // reset retry count

      // Send initial message with call ID if available
      if (assistant.callDetails) {
        try {
          newSocket.emit('init', {
            callId: assistant.callDetails.id,
          });
          logger.debug(
            'Sent init message with call ID',
            'Component',
            assistant.callDetails.id
          );
        } catch (error) {
          logger.warn('Failed to send init message:', 'Component', error);
        }
      }
    });

    newSocket.on('message', data => {
      try {
        logger.debug('[useWebSocket] Message received:', 'Component', data);

        // Handle transcript messages
        if (data.type === 'transcript') {
          logger.debug('[useWebSocket] Transcript message:', 'Component', data);
          assistant.addTranscript({
            callId: data.callId,
            role: data.role,
            content: data.content,
            tenantId: 'default',
          });
        }

        // Handle connection messages
        if (data.type === 'connected') {
          logger.debug(
            '[useWebSocket] Connected to server:',
            'Component',
            data.message
          );
        }

        // Handle order status update (realtime from staff UI)
        if (
          data.type === 'order_status_update' &&
          (data.orderId || data.reference) &&
          data.status
        ) {
          logger.debug(
            '[useWebSocket] Order status update:',
            'Component',
            data
          );
          assistant.setActiveOrders((prevOrders: ActiveOrder[]) =>
            prevOrders.map(order => {
              if (
                order.reference === data.reference ||
                order.reference === data.orderId
              ) {
                return {
                  ...order,
                  status: data.status,
                  updatedAt: new Date().toISOString(),
                };
              }
              return order;
            })
          );
        }

        // ✅ NEW: Call summary received from webhook - OpenAI processed
        if (data.type === 'call-summary-received') {
          logger.debug(
            '[useWebSocket] Call summary received from webhook:',
            'Component',
            data
          );

          // Update assistant context with OpenAI processed data
          if (data.summary) {
            assistant.setCallSummary({
              callId: data.callId || 'unknown',
              tenantId: 'default',
              content: data.summary,
              timestamp: data.timestamp,
            });
          }

          // Update service requests from OpenAI
          if (data.serviceRequests && Array.isArray(data.serviceRequests)) {
            assistant.setServiceRequests(data.serviceRequests);
          }
        }

        // Handle error messages
        if (data.type === 'error') {
          logger.error('[useWebSocket] Server error:', 'Component', data);
        }
      } catch (error) {
        logger.error(
          '[useWebSocket] Error processing message:',
          'Component',
          error
        );
      }
    });

    newSocket.on('disconnect', reason => {
      logger.debug('Socket.IO connection closed', 'Component', { reason });
      setConnected(false);

      // ✅ IMPROVED: Only reconnect if disconnect was not intentional
      if (reason !== 'io client disconnect' && retryRef.current < 3) {
        // Reduced from 5 to 3 attempts
        const delay = Math.min(Math.pow(2, retryRef.current) * 1000, 10000); // Cap at 10s
        logger.debug(
          `Reconnecting Socket.IO in ${delay}ms (attempt ${retryRef.current + 1}/3)`,
          'Component'
        );

        const timeoutId = setTimeout(() => {
          // ✅ NEW: Only reconnect if component is still mounted and we don't already have a connection
          if (!socket || !socket.connected) {
            initSocket();
          }
        }, delay);

        retryRef.current++;

        // ✅ NEW: Store timeout ID for cleanup
        (newSocket as any).reconnectTimeout = timeoutId;
      } else if (retryRef.current >= 3) {
        logger.warn(
          'Max Socket.IO reconnection attempts reached (3/3)',
          'Component'
        );

        // ✅ NEW: Stop retry attempts and provide user feedback
        logger.error(
          'Socket.IO connection failed permanently. Please refresh the page.',
          'Component'
        );
      }
    });

    newSocket.on('connect_error', error => {
      logger.error('Socket.IO connection error:', 'Component', error);
      setConnected(false);
    });

    newSocket.on('error', error => {
      logger.error('Socket.IO runtime error:', 'Component', error);
      setConnected(false);
    });

    // Set up event listeners for Socket.IO specific events
    newSocket.on('order_status_update', data => {
      logger.debug('[useWebSocket] Order status update:', 'Component', data);
      assistant.setActiveOrders((prevOrders: ActiveOrder[]) =>
        prevOrders.map(order => {
          if (
            order.reference === data.reference ||
            order.reference === data.orderId
          ) {
            return {
              ...order,
              status: data.status,
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        })
      );
    });

    newSocket.on('transcript', data => {
      logger.debug('[useWebSocket] Transcript received:', 'Component', data);
      assistant.addTranscript({
        callId: data.callId,
        role: data.role,
        content: data.content,
        tenantId: data.tenantId || 'default',
      });
    });

    setSocket(newSocket);
  }, [assistant.callDetails, socket]);

  // ✅ IMPROVED: Manual reconnect function with reset
  const reconnect = useCallback(() => {
    logger.debug('Manual reconnect requested', 'Component');
    retryRef.current = 0; // Reset retry count for manual reconnect
    if (socket) {
      // Force disconnect current connection
      socket.disconnect();
    }
    setTimeout(initSocket, 1000); // Give time for cleanup
  }, [initSocket, socket]);

  // Initialize Socket.IO on mount
  useEffect(() => {
    let mounted = true;

    // Only initialize if component is still mounted
    if (mounted) {
      initSocket();
    }

    return () => {
      mounted = false;
      // Cleanup current socket if exists
      if (socket) {
        if ((socket as any).reconnectTimeout) {
          clearTimeout((socket as any).reconnectTimeout);
        }
        if (socket.connected) {
          socket.disconnect();
        }
      }
    };
  }, []); // ✅ FIXED: Empty dependencies to run only once

  // ✅ IMPROVED: Re-send init with better error handling
  useEffect(() => {
    if (socket && connected && assistant.callDetails?.id) {
      logger.debug(
        'Sending init message with callId after availability',
        'Component',
        assistant.callDetails.id
      );
      if (socket.connected) {
        try {
          socket.emit('init', {
            callId: assistant.callDetails.id,
          });
        } catch (error) {
          logger.warn(
            'Failed to send delayed init message:',
            'Component',
            error
          );
        }
      }
    }
  }, [assistant.callDetails?.id, socket, connected]);

  // Send message function
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && socket.connected) {
        try {
          socket.emit('message', message);
          logger.debug('Message sent via Socket.IO:', 'Component', message);
        } catch (error) {
          logger.error(
            'Failed to send message via Socket.IO:',
            'Component',
            error
          );
        }
      } else {
        logger.warn(
          'Socket.IO not connected, cannot send message',
          'Component'
        );
      }
    },
    [socket]
  );

  return { connected, sendMessage, reconnect };
}
