/// <reference types="vite/client" />

// Type declaration for import.meta

import { useAssistant } from '@/context';
import { ActiveOrder } from '@/types/core';
import { logger } from '@shared/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// ✅ NEW: Type declarations for global window functions
declare global {
  interface Window {
    updateSummaryProgression?: (data: any) => void;
  }
}

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const assistant = useAssistant();
  const retryRef = useRef(0);

  // ✅ MEMORY LEAK FIX: Track timeouts for cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const isCleaningUpRef = useRef(false);
  const mountedRef = useRef(true);

  // ✅ HELPER: Safe timeout with cleanup tracking
  const createSafeTimeout = useCallback(
    (callback: () => void, delay: number): NodeJS.Timeout => {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && !isCleaningUpRef.current) {
          callback();
        }
        timeoutsRef.current.delete(timeoutId);
      }, delay);

      timeoutsRef.current.add(timeoutId);
      return timeoutId;
    },
    []
  );

  // ✅ HELPER: Clear all tracked timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  // ✅ DIRECT TEST: Call initSocket immediately

  // ✅ DIRECT TEST FUNCTION: Manual test for initSocket
  const testDirectConnection = useCallback(() => {
    console.log('🧪 [TEST] ===== TESTING DIRECT WEBSOCKET CONNECTION =====');
    console.log('🧪 [TEST] This is a manual test of WebSocket connection');
    console.log('🧪 [TEST] Environment:', {
      isDev: !import.meta.env.PROD,
      VITE_API_HOST: import.meta.env.VITE_API_HOST,
      currentHost: window.location.host,
      currentOrigin: window.location.origin,
    });

    // Test different URLs
    const testUrls = [
      'http://localhost:3000',
      'http://localhost:5000',
      `http://${import.meta.env.VITE_API_HOST || 'localhost:3000'}`,
      window.location.origin,
    ];

    console.log('🧪 [TEST] Will test these URLs:', testUrls);

    testUrls.forEach((url, index) => {
      setTimeout(() => {
        console.log(
          `🧪 [TEST] Testing connection ${index + 1}/${testUrls.length}: ${url}`
        );
        try {
          const testSocket = io(url, {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            reconnection: false,
          });

          testSocket.on('connect', () => {
            console.log(`✅ [TEST] SUCCESS: Connected to ${url}`);
            testSocket.disconnect();
          });

          testSocket.on('connect_error', error => {
            console.log(`❌ [TEST] FAILED: ${url} - ${error.message}`);
          });
        } catch (error) {
          console.log(`❌ [TEST] ERROR: ${url} - ${error}`);
        }
      }, index * 2000); // Test each URL with 2 second delay
    });
  }, []);

  // ✅ EXPOSE TEST FUNCTION TO WINDOW
  if (typeof window !== 'undefined') {
    (window as any).testWebSocketConnection = testDirectConnection;
    console.log(
      '🧪 [TEST] Added testWebSocketConnection() to window for manual testing'
    );
  }

  // ✅ RACE CONDITION FIX: Track connection attempts
  const isConnectingRef = useRef(false);

  // Initialize Socket.IO connection
  const initSocket = useCallback(() => {
    // ✅ RACE CONDITION FIX: Prevent multiple concurrent connections
    if (isConnectingRef.current) {
      console.log('🔌 [DEBUG] Connection already in progress, skipping...');
      return;
    }

    if (!mountedRef.current || isCleaningUpRef.current) {
      console.log(
        '🔌 [DEBUG] Component unmounted or cleaning up, skipping connection...'
      );
      return;
    }

    isConnectingRef.current = true;

    console.log('🔌 [DEBUG] ===== ATTEMPTING WEBSOCKET CONNECTION =====');
    logger.debug(
      'useWebSocket env VITE_API_HOST:',
      'Component',
      import.meta.env.VITE_API_HOST
    );
    console.log('🔌 [DEBUG] WebSocket connection details:', {
      host: import.meta.env.VITE_API_HOST,
      socketExists: !!socket,
    });

    // ✅ ENHANCED: Better cleanup of existing socket
    if (socket !== null) {
      console.log('🔌 [DEBUG] Cleaning up existing socket...');

      // ✅ MEMORY LEAK FIX: Proper cleanup
      try {
        // Remove all listeners to prevent memory leaks
        socket.removeAllListeners();

        // Clear any pending reconnection timeout
        if ((socket as any).reconnectTimeout) {
          clearTimeout((socket as any).reconnectTimeout);
          delete (socket as any).reconnectTimeout;
        }

        // Disconnect existing socket
        if (socket.connected) {
          socket.disconnect();
        }
      } catch (error) {
        logger.warn('Error during socket cleanup:', 'Component', error);
      }
    }

    // ✅ IMPROVED: Better Socket.IO URL construction for production
    let socketUrl: string;

    // ✅ FIX: WebSocket connection URL matching API server
    if (
      import.meta.env.PROD ||
      window.location.hostname.includes('.onrender.com') ||
      window.location.hostname.includes('.talk2go.online')
    ) {
      // ✅ PRODUCTION: Connect to same server as API
      if (window.location.hostname.includes('talk2go.online')) {
        // Correct hostname typo - use same origin (no explicit port)
        const correctedHostname = window.location.hostname.replace(
          'minhonmune',
          'minhonmuine'
        );
        socketUrl = `https://${correctedHostname}`;
      } else {
        socketUrl = window.location.origin;
      }
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

    // ✅ MEMORY LEAK FIX: Use safe timeout with cleanup tracking
    const connectionTimeout = createSafeTimeout(
      () => {
        if (!newSocket.connected && !isCleaningUpRef.current) {
          logger.warn(
            'Socket.IO connection timeout, disconnecting...',
            'Component'
          );
          newSocket.disconnect();
          isConnectingRef.current = false;
        }
      },
      import.meta.env.PROD ? 15000 : 10000
    ); // Longer timeout for production

    newSocket.on('connect', () => {
      logger.debug('Socket.IO connection established', 'Component');
      console.log(
        '🔌 [DEBUG] WebSocket connected successfully for Summary updates'
      );

      // ✅ CLEANUP: Clear timeout and reset flags
      timeoutsRef.current.delete(connectionTimeout);
      clearTimeout(connectionTimeout);
      isConnectingRef.current = false;
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

    // ✅ FIX: Listen for call-summary-received event directly from server
    newSocket.on('call-summary-received', data => {
      try {
        logger.debug(
          '[useWebSocket] Call summary received from webhook (direct event):',
          'Component',
          data
        );

        console.log(
          '🎉 [DEBUG] ===== WEBSOCKET SUMMARY RECEIVED (DIRECT) ====='
        );
        console.log('🎉 [DEBUG] WebSocket received call-summary-received:', {
          callId: data.callId,
          hasSummary: !!data.summary,
          summaryLength: data.summary?.length || 0,
          hasServiceRequests: !!data.serviceRequests,
          serviceRequestsCount: data.serviceRequests?.length || 0,
          timestamp: data.timestamp,
          fullData: data,
        });

        // ✅ Update assistant context directly
        if (data.summary) {
          const serverCallId = data.callId;
          const storedCallId = (window as any).currentCallId;
          const finalCallId = serverCallId || storedCallId || 'unknown';

          console.log('🔗 [DEBUG] Using callId for summary update:', {
            serverCallId,
            storedCallId,
            finalCallId,
          });

          assistant.setCallSummary({
            callId: finalCallId,
            tenantId: 'default',
            content: data.summary,
            timestamp: data.timestamp,
          });
        }

        if (data.serviceRequests && Array.isArray(data.serviceRequests)) {
          console.log(
            '🔄 [DEBUG] Setting service requests to assistant context:',
            data.serviceRequests
          );
          assistant.setServiceRequests(data.serviceRequests);
        }

        console.log(
          '✅ [DEBUG] Direct call-summary-received processing completed'
        );
      } catch (error) {
        logger.error(
          '[useWebSocket] Error processing call-summary-received (direct):',
          'Component',
          error
        );
      }
    });

    // ✅ Listen for summary-progression event directly
    newSocket.on('summary-progression', data => {
      try {
        logger.debug(
          '[useWebSocket] Summary progression update (direct):',
          'Component',
          data
        );
        console.log('📊 [DEBUG] Summary progression (direct):', data);
      } catch (error) {
        logger.error(
          '[useWebSocket] Error processing summary-progression (direct):',
          'Component',
          error
        );
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

        // ✅ NEW: Summary progression updates
        if (data.type === 'summary-progression') {
          logger.debug(
            '[useWebSocket] Summary progression update:',
            'Component',
            data
          );

          console.log('📊 [DEBUG] WebSocket received summary-progression:', {
            callId: data.callId,
            status: data.status,
            progress: data.progress,
            currentStep: data.currentStep,
            currentStepIndex: data.currentStepIndex,
          });

          // Update progression state if available
          if (window.updateSummaryProgression) {
            window.updateSummaryProgression(data);
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
      isConnectingRef.current = false;

      // ✅ IMPROVED: Only reconnect if component mounted and disconnect was not intentional
      if (
        reason !== 'io client disconnect' &&
        retryRef.current < 3 &&
        mountedRef.current &&
        !isCleaningUpRef.current
      ) {
        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = Math.pow(2, retryRef.current) * 1000;
        const jitter = Math.random() * 1000; // Add randomness
        const delay = Math.min(baseDelay + jitter, 10000); // Cap at 10s

        logger.debug(
          `Reconnecting Socket.IO in ${Math.round(delay)}ms (attempt ${retryRef.current + 1}/3)`,
          'Component'
        );

        // ✅ MEMORY LEAK FIX: Use safe timeout
        const reconnectTimeout = createSafeTimeout(() => {
          // ✅ RACE CONDITION FIX: Check conditions again before reconnecting
          if (
            mountedRef.current &&
            !isCleaningUpRef.current &&
            (!socket || !socket.connected)
          ) {
            retryRef.current++;
            initSocket();
          }
        }, delay);

        // ✅ CLEANUP: Track timeout for proper cleanup
        (newSocket as any).reconnectTimeout = reconnectTimeout;
      } else if (retryRef.current >= 3) {
        logger.warn(
          'Max Socket.IO reconnection attempts reached (3/3)',
          'Component'
        );

        // ✅ ENHANCED: Better user feedback
        logger.error(
          'Socket.IO connection failed permanently. Summary updates may not work. Please refresh the page.',
          'Component'
        );

        // ✅ CLEANUP: Reset for potential manual reconnect
        isConnectingRef.current = false;
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
  }, [assistant.callDetails, createSafeTimeout, clearAllTimeouts]); // ✅ DEPENDENCIES: Include helpers to prevent stale closures

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
  console.log(
    '🔌 [DEBUG] Setting up useEffect for WebSocket initialization...'
  );

  useEffect(() => {
    let mounted = true;

    // Only initialize if component is still mounted
    console.log('🔌 [DEBUG] Mounted status:', mounted);
    if (mounted) {
      console.log('🔌 [DEBUG] About to call initSocket()...');
      initSocket();
    } else {
      console.log('🔌 [DEBUG] Component not mounted, skipping initSocket');
    }

    return () => {
      console.log('🔌 [DEBUG] useEffect cleanup running...');
      mounted = false;

      // ✅ MEMORY LEAK FIX: Comprehensive cleanup
      isCleaningUpRef.current = true;
      mountedRef.current = false;

      // Clear all tracked timeouts
      clearAllTimeouts();

      // Cleanup current socket if exists
      if (socket) {
        try {
          // Clear reconnection timeout if exists
          if ((socket as any).reconnectTimeout) {
            clearTimeout((socket as any).reconnectTimeout);
            delete (socket as any).reconnectTimeout;
          }

          // Remove all listeners to prevent memory leaks
          socket.removeAllListeners();

          // Disconnect socket
          if (socket.connected) {
            socket.disconnect();
          }
        } catch (error) {
          logger.warn('Error during useEffect cleanup:', 'Component', error);
        }
      }

      // Reset connection flags
      isConnectingRef.current = false;
      retryRef.current = 0;
    };
  }, []); // ✅ REVERTED: Back to original empty dependency array

  console.log('🔌 [DEBUG] useEffect setup completed, continuing hook...');

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

  console.log(
    '🔌 [DEBUG] Final state - connected:',
    connected,
    'socket exists:',
    !!socket
  );

  return { connected, sendMessage, reconnect };
}
