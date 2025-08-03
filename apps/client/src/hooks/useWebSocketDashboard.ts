/**
 * WebSocket Dashboard Hook - MEDIUM RISK with Automatic Fallback
 * Provides real-time dashboard updates with seamless fallback to polling
 */

import type { DashboardData } from '@/pages/unified-dashboard/shared/types/dashboard';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  enableWebSocket: boolean;
  fallbackPollingInterval: number;
  reconnectAttempts: number;
  heartbeatTimeout: number;
}

export interface WebSocketStatus {
  connected: boolean;
  connectionState:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'reconnecting'
    | 'failed';
  transport: 'websocket' | 'polling' | 'fallback';
  lastUpdate: string | null;
  error: string | null;
  reconnectAttempts: number;
}

export interface UseWebSocketDashboardReturn {
  status: WebSocketStatus;
  data: DashboardData | null;
  sendMessage: (event: string, data: any) => void;
  forceReconnect: () => void;
  enableFallback: () => void;
  getStats: () => any;
}

export const useWebSocketDashboard = (
  config: Partial<WebSocketConfig> = {}
): UseWebSocketDashboardReturn => {
  const defaultConfig: WebSocketConfig = {
    enableWebSocket: process.env.NODE_ENV !== 'test', // Disable in tests
    fallbackPollingInterval: 30000, // 30 seconds
    reconnectAttempts: 3,
    heartbeatTimeout: 10000, // 10 seconds
    ...config,
  };

  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    connectionState: 'disconnected',
    transport: 'polling',
    lastUpdate: null,
    error: null,
    reconnectAttempts: 0,
  });

  const [data, setData] = useState<DashboardData | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const forcePollingRef = useRef(false);

  /**
   * Initialize WebSocket connection
   */
  const initializeWebSocket = () => {
    if (!defaultConfig.enableWebSocket || forcePollingRef.current) {
      console.log('🔄 WebSocket disabled, using polling fallback');
      startFallbackPolling();
      return;
    }

    try {
      setStatus(prev => ({
        ...prev,
        connectionState: 'connecting',
        error: null,
      }));

      // Get WebSocket URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      console.log('🔌 Connecting to WebSocket:', wsUrl);

      socketRef.current = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        retries: defaultConfig.reconnectAttempts,
        auth: {
          token: localStorage.getItem('token'),
        },
        // ✅ ENHANCEMENT: Add production-specific options
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: defaultConfig.reconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      setupSocketEventHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setStatus(prev => ({
        ...prev,
        connectionState: 'failed',
        error: error instanceof Error ? error.message : 'Connection failed',
        transport: 'fallback',
      }));
      startFallbackPolling();
    }
  };

  /**
   * Setup WebSocket event handlers
   */
  const setupSocketEventHandlers = () => {
    const socket = socketRef.current;
    if (!socket) return;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ Dashboard WebSocket connected');

      setStatus(prev => ({
        ...prev,
        connected: true,
        connectionState: 'connected',
        transport: socket.io.engine.transport.name as 'websocket' | 'polling',
        error: null,
      }));

      reconnectAttemptsRef.current = 0;
      stopFallbackPolling();

      // Subscribe to dashboard updates
      socket.emit('dashboard:subscribe', {
        timestamp: new Date().toISOString(),
      });

      startHeartbeat();
    });

    // Initial data received
    socket.on('dashboard:initial_data', initialData => {
      console.log('📊 Received initial dashboard data via WebSocket');

      if (initialData.requests && initialData.calls && initialData.system) {
        setData({
          calls: {
            total: initialData.calls.total || 0,
            today: initialData.calls.today || 0,
            answered: initialData.calls.answered || 0,
            avgDuration: initialData.calls.avgDuration || '0 min',
          },
          requests: {
            pending: initialData.requests.pending || 0,
            inProgress: initialData.requests.inProgress || 0,
            completed: initialData.requests.completed || 0,
            totalToday: initialData.requests.totalToday || 0,
          },
          satisfaction: {
            rating: 4.7, // Static for now
            responses: initialData.requests.totalAll || 0,
            trend: '+0.2',
          },
          system: {
            uptime: initialData.system.uptime || 99.9,
            responseTime: initialData.system.responseTime || 150,
            errors: initialData.system.errors || 0,
          },
        });
      }

      setStatus(prev => ({ ...prev, lastUpdate: new Date().toISOString() }));
    });

    // Real-time updates
    socket.on('dashboard:update', update => {
      console.log('🔄 Received dashboard update via WebSocket:', update.type);

      setStatus(prev => ({ ...prev, lastUpdate: new Date().toISOString() }));

      // Update data based on update type
      if (update.type === 'request_update' && update.data) {
        setData(prev =>
          prev
            ? {
                ...prev,
                requests: { ...prev.requests, ...update.data },
              }
            : null
        );
      }
    });

    // Heartbeat response
    socket.on('dashboard:pong', () => {
      resetHeartbeat();
    });

    // Fallback instruction from server
    socket.on('dashboard:fallback', message => {
      console.log('⚠️ Server requested fallback to polling:', message.message);
      startFallbackPolling();
    });

    // Server shutdown notification
    socket.on('dashboard:shutdown', message => {
      console.log('🛑 Server shutting down:', message.message);
      startFallbackPolling();
    });

    // Connection error
    socket.on('connect_error', error => {
      console.error('❌ WebSocket connection error:', error.message);

      reconnectAttemptsRef.current++;

      setStatus(prev => ({
        ...prev,
        connected: false,
        connectionState:
          reconnectAttemptsRef.current < defaultConfig.reconnectAttempts
            ? 'reconnecting'
            : 'failed',
        error: error.message,
        reconnectAttempts: reconnectAttemptsRef.current,
      }));

      if (reconnectAttemptsRef.current >= defaultConfig.reconnectAttempts) {
        console.log(
          '🔄 Max reconnection attempts reached, falling back to polling'
        );
        startFallbackPolling();
      }
    });

    // Disconnection
    socket.on('disconnect', reason => {
      console.log('🔌 WebSocket disconnected:', reason);

      setStatus(prev => ({
        ...prev,
        connected: false,
        connectionState: 'disconnected',
        transport: 'fallback',
      }));

      stopHeartbeat();

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        startFallbackPolling();
      }
    });
  };

  /**
   * Start heartbeat monitoring
   */
  const startHeartbeat = () => {
    heartbeatTimerRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('dashboard:ping');

        // Set timeout for pong response
        setTimeout(() => {
          if (socketRef.current?.connected) {
            console.warn('⚠️ Heartbeat timeout, connection may be unstable');
          }
        }, defaultConfig.heartbeatTimeout);
      }
    }, 30000); // Send ping every 30 seconds
  };

  /**
   * Reset heartbeat timer
   */
  const resetHeartbeat = () => {
    // Heartbeat received, connection is healthy
  };

  /**
   * Stop heartbeat monitoring
   */
  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  /**
   * Start fallback polling mechanism
   */
  const startFallbackPolling = () => {
    if (fallbackTimerRef.current) return; // Already running

    console.log('🔄 Starting fallback polling mechanism');

    setStatus(prev => ({
      ...prev,
      transport: 'fallback',
      connectionState: 'connected', // Consider polling as "connected"
    }));

    const pollDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/staff/requests', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const requests = await response.json();

          // Calculate dashboard data from requests (same logic as useDashboardData)
          const today = new Date().toDateString();
          const requestsToday = requests.filter(
            (req: any) => new Date(req.createdAt).toDateString() === today
          );

          const pending = requests.filter(
            (req: any) => req.status === 'Đã ghi nhận'
          ).length;
          const inProgress = requests.filter(
            (req: any) => req.status === 'Đang thực hiện'
          ).length;
          const completed = requests.filter(
            (req: any) => req.status === 'Hoàn thiện'
          ).length;

          setData({
            calls: {
              total: requests.length,
              today: requestsToday.length,
              answered: requests.length,
              avgDuration: '2.3 min',
            },
            requests: {
              pending,
              inProgress,
              completed,
              totalToday: requestsToday.length,
            },
            satisfaction: {
              rating: 4.7,
              responses: requests.length,
              trend: '+0.2',
            },
            system: { uptime: 99.9, responseTime: 150, errors: 0 },
          });

          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString(),
            error: null,
          }));
        }
      } catch (error) {
        console.error('Fallback polling error:', error);
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Polling failed',
        }));
      }
    };

    // Initial poll
    pollDashboardData();

    // Set up polling interval
    fallbackTimerRef.current = setInterval(
      pollDashboardData,
      defaultConfig.fallbackPollingInterval
    );
  };

  /**
   * Stop fallback polling
   */
  const stopFallbackPolling = () => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  /**
   * Send message via WebSocket (if connected)
   */
  const sendMessage = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, message not sent:', event);
    }
  };

  /**
   * Force reconnection
   */
  const forceReconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    reconnectAttemptsRef.current = 0;
    forcePollingRef.current = false;
    initializeWebSocket();
  };

  /**
   * Enable fallback mode permanently
   */
  const enableFallback = () => {
    forcePollingRef.current = true;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    startFallbackPolling();
  };

  /**
   * Get connection statistics
   */
  const getStats = () => ({
    status,
    config: defaultConfig,
    hasData: !!data,
    reconnectAttempts: reconnectAttemptsRef.current,
    forcedPolling: forcePollingRef.current,
    timestamp: new Date().toISOString(),
  });

  // Initialize connection on mount
  useEffect(() => {
    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      stopHeartbeat();
      stopFallbackPolling();

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    status,
    data,
    sendMessage,
    forceReconnect,
    enableFallback,
    getStats,
  };
};
