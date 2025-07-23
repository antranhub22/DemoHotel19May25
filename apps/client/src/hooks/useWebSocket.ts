/// <reference types="vite/client" />

// Type declaration for import.meta

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@shared/utils/logger';
import { useAssistant } from '@/context';
import { ActiveOrder } from '@/types/core';
export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const assistant = useAssistant();
  const retryRef = useRef(0);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
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

      // Remove event listeners to prevent memory leaks
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, 'Reconnecting'); // Intentional close
      }
    }

    // ✅ IMPROVED: Better WebSocket URL construction for production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl: string;

    // Production environment detection
    if (
      import.meta.env.PROD ||
      window.location.hostname.includes('.onrender.com') ||
      window.location.hostname.includes('.talk2go.online')
    ) {
      // Use current host for production
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // Development environment
      const apiHost = import.meta.env.VITE_API_HOST || window.location.host;
      wsUrl = `${protocol}//${apiHost}/ws`;
    }

    logger.debug('Attempting WebSocket connection to', 'Component', wsUrl);

    const newSocket = new WebSocket(wsUrl);

    // ✅ NEW: Add connection timeout for production stability
    const connectionTimeout = setTimeout(
      () => {
        if (newSocket.readyState === WebSocket.CONNECTING) {
          logger.warn('WebSocket connection timeout, closing...', 'Component');
          newSocket.close(1006, 'Connection timeout');
        }
      },
      import.meta.env.PROD ? 15000 : 10000
    ); // Longer timeout for production

    newSocket.onopen = () => {
      logger.debug('WebSocket connection established', 'Component');
      clearTimeout(connectionTimeout); // Clear timeout on successful connection
      setConnected(true);
      retryRef.current = 0; // reset retry count

      // Send initial message with call ID if available
      if (assistant.callDetails) {
        try {
          newSocket.send(
            JSON.stringify({
              type: 'init',
              callId: assistant.callDetails.id,
            })
          );
          logger.debug(
            'Sent init message with call ID',
            'Component',
            assistant.callDetails.id
          );
        } catch (error) {
          logger.warn('Failed to send init message:', 'Component', error);
        }
      }
    };

    newSocket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
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
            prevOrders.map((order: ActiveOrder) => {
              // So sánh theo reference (mã order)
              const matchByReference =
                (data.reference && order.reference === data.reference) ||
                (data.orderId && order.reference === data.orderId);
              if (matchByReference) {
                return { ...order, status: data.status };
              }
              return order;
            })
          );
        }
      } catch (error) {
        logger.error('Error parsing WebSocket message:', 'Component', error);
      }
    };

    newSocket.onclose = event => {
      logger.debug('WebSocket connection closed', 'Component', event);
      setConnected(false);

      // ✅ IMPROVED: Only reconnect if close was not intentional
      if (event.code !== 1000 && event.code !== 1001 && retryRef.current < 3) {
        // Reduced from 5 to 3 attempts
        const delay = Math.min(Math.pow(2, retryRef.current) * 1000, 10000); // Cap at 10s
        logger.debug(
          `Reconnecting WebSocket in ${delay}ms (attempt ${retryRef.current + 1}/3)`,
          'Component'
        );

        const timeoutId = setTimeout(() => {
          // ✅ NEW: Only reconnect if component is still mounted and we don't already have a connection
          if (!socket || socket.readyState === WebSocket.CLOSED) {
            initWebSocket();
          }
        }, delay);

        retryRef.current++;

        // ✅ NEW: Store timeout ID for cleanup
        (newSocket as any).reconnectTimeout = timeoutId;
      } else if (retryRef.current >= 3) {
        logger.warn(
          'Max WebSocket reconnection attempts reached (3/3)',
          'Component'
        );

        // ✅ NEW: Stop retry attempts and provide user feedback
        logger.error(
          'WebSocket connection failed permanently. Please refresh the page.',
          'Component'
        );
      }
    };

    newSocket.onerror = event => {
      logger.error('WebSocket encountered error', 'Component', event);
      clearTimeout(connectionTimeout); // Clear timeout on error

      // ✅ IMPROVED: Better error categorization
      const errorType =
        newSocket.readyState === WebSocket.CONNECTING
          ? 'connection'
          : 'runtime';
      logger.error(
        `WebSocket ${errorType} error, state: ${newSocket.readyState}`,
        'Component'
      );

      // Close socket to trigger reconnect logic only if not already closed
      if (
        newSocket.readyState !== WebSocket.CLOSED &&
        newSocket.readyState !== WebSocket.CLOSING
      ) {
        newSocket.close(1006, 'Error occurred');
      }
    };

    setSocket(newSocket);

    return () => {
      clearTimeout(connectionTimeout);
      if (
        newSocket.readyState === WebSocket.OPEN ||
        newSocket.readyState === WebSocket.CONNECTING
      ) {
        newSocket.close(1000, 'Component cleanup');
      }
    };
  }, []); // ✅ FIXED: Remove dependencies to prevent infinite re-creation

  // Send message through WebSocket
  const sendMessage = useCallback(
    (message: unknown) => {
      if (socket && connected && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify(message));
          logger.debug(
            '[useWebSocket] Message sent successfully:',
            'Component',
            (message as { type?: string })?.type
          );
        } catch (error) {
          logger.error(
            'Cannot send message WebSocket error:',
            'Component',
            error
          );
        }
      } else {
        logger.error('Cannot send message WebSocket not ready:', 'Component', {
          hasSocket: !!socket,
          connected,
          readyState: socket?.readyState,
          expectedState: WebSocket.OPEN,
        });
      }
    },
    [socket, connected]
  );

  // ✅ IMPROVED: Manual reconnect function with reset
  const reconnect = useCallback(() => {
    logger.debug('Manual reconnect requested', 'Component');
    retryRef.current = 0; // Reset retry count for manual reconnect
    if (socket) {
      // Force close current connection
      socket.close(1000, 'Manual reconnect');
    }
    setTimeout(initWebSocket, 1000); // Give time for cleanup
  }, [initWebSocket]);

  // Initialize WebSocket on mount
  useEffect(() => {
    let mounted = true;

    // Only initialize if component is still mounted
    if (mounted) {
      initWebSocket();
    }

    return () => {
      mounted = false;
      // Cleanup current socket if exists
      if (socket) {
        if ((socket as any).reconnectTimeout) {
          clearTimeout((socket as any).reconnectTimeout);
        }
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, 'Component unmounting');
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
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(
            JSON.stringify({
              type: 'init',
              callId: assistant.callDetails.id,
            })
          );
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

  return { connected, sendMessage, reconnect };
}
