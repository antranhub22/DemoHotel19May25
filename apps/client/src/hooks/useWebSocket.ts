import { useState, useEffect, useCallback, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { logger } from '@shared/utils/logger';
import { ActiveOrder, AssistantContextType } from '@/types';

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const assistant = useAssistant(); // ✅ REMOVED: Type casting (types now match after interface removal)
  const retryRef = useRef(0);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    logger.debug('useWebSocket env VITE_API_HOST:', 'Component', import.meta.env.VITE_API_HOST);
    if (socket !== null) {
      socket.close();
    }

    // Always connect WebSocket to the current application origin
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    logger.debug('Attempting WebSocket connection to', 'Component', wsUrl);

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      logger.debug('WebSocket connection established', 'Component');
      setConnected(true);
      retryRef.current = 0; // reset retry count

      // Send initial message with call ID if available
      if (assistant.callDetails) {
        newSocket.send(
          JSON.stringify({
            type: 'init',
            callId: assistant.callDetails.id,
          })
        );
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
          logger.debug('[useWebSocket] Connected to server:', 'Component', data.message);
        }

        // Handle order status update (realtime from staff UI)
        if (
          data.type === 'order_status_update' &&
          (data.orderId || data.reference) &&
          data.status
        ) {
          logger.debug('[useWebSocket] Order status update:', 'Component', data);
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

      // Reconnect with exponential backoff
      if (retryRef.current < 5) {
        const delay = Math.pow(2, retryRef.current) * 1000;
        logger.debug('Reconnecting WebSocket in ${delay}ms (attempt ${retryRef.current + 1})', 'Component');
        setTimeout(initWebSocket, delay);
        retryRef.current++;
      } else {
        logger.warn('Max WebSocket reconnection attempts reached', 'Component');
      }
    };

    newSocket.onerror = event => {
      logger.error('WebSocket encountered error', 'Component', event);
      // Close socket to trigger reconnect logic
      if (newSocket.readyState !== WebSocket.CLOSED) {
        newSocket.close();
      }
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [
    assistant.callDetails,
    assistant.addTranscript,
    assistant.activeOrders,
    assistant.setActiveOrders,
  ]);

  // Send message through WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && connected) {
        socket.send(JSON.stringify(message));
      } else {
        logger.error('Cannot send message, WebSocket not connected', 'Component');
      }
    },
    [socket, connected]
  );

  // Reconnect function
  const reconnect = useCallback(() => {
    if (!connected) {
      initWebSocket();
    }
  }, [connected, initWebSocket]);

  // Initialize WebSocket on mount
  useEffect(() => {
    initWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Re-send init if callDetails.id becomes available after socket is open
  useEffect(() => {
    if (socket && connected && assistant.callDetails?.id) {
      logger.debug('Sending init message with callId after availability', 'Component', assistant.callDetails.id);
      socket.send(
        JSON.stringify({
          type: 'init',
          callId: assistant.callDetails.id,
        })
      );
    }
  }, [assistant.callDetails?.id, socket, connected]);

  return { connected, sendMessage, reconnect };
}
