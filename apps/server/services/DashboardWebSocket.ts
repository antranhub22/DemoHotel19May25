/**
 * Dashboard WebSocket Service - MEDIUM RISK with Fallback
 * Real-time dashboard updates with automatic fallback to polling
 */

import { CacheKeys, dashboardCache } from '@server/services/DashboardCache';
import { errorTracking } from '@server/services/ErrorTracking';
import { logger } from '@shared/utils/logger';
import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';

export interface DashboardUpdate {
  type: 'request_update' | 'call_update' | 'system_update' | 'cache_update';
  tenantId?: string;
  data: any;
  timestamp: string;
  source?: string;
}

export interface WebSocketConfig {
  enableWebSocket: boolean;
  heartbeatInterval: number;
  maxConnections: number;
  corsOrigins: string[];
  reconnectAttempts: number;
}

class DashboardWebSocketService {
  private io?: SocketIOServer;
  private connections = new Map<string, Set<Socket>>();
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesPublished: 0,
    messagesSent: 0,
    errors: 0,
    lastError: null as string | null,
  };
  private config: WebSocketConfig;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false', // Default enabled
      heartbeatInterval: 30000, // 30 seconds
      maxConnections: 1000,
      corsOrigins: ['*'], // Configure properly in production
      reconnectAttempts: 3,
      ...config,
    };

    logger.info(
      '🔌 [WebSocket] Dashboard WebSocket service initialized',
      'WebSocket',
      {
        enabled: this.config.enableWebSocket,
        heartbeatInterval: this.config.heartbeatInterval,
        maxConnections: this.config.maxConnections,
      }
    );
  }

  /**
   * Initialize WebSocket server with HTTP server
   */
  initialize(httpServer: HttpServer): void {
    if (!this.config.enableWebSocket) {
      logger.info(
        '🚫 [WebSocket] WebSocket disabled, skipping initialization',
        'WebSocket'
      );
      return;
    }

    try {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: this.config.corsOrigins,
          methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      this.setupEventHandlers();
      this.startHeartbeat();

      logger.info(
        '✅ [WebSocket] Dashboard WebSocket server initialized',
        'WebSocket'
      );
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        '❌ [WebSocket] Failed to initialize WebSocket server',
        'WebSocket',
        error
      );

      // ✅ ENHANCEMENT: Report WebSocket initialization failure
      errorTracking.reportWebSocketError(
        'initialize',
        error instanceof Error
          ? error
          : new Error('WebSocket initialization failed'),
        {
          enabled: this.config.enableWebSocket,
          maxConnections: this.config.maxConnections,
        }
      );

      // Continue without WebSocket - app will use polling fallback
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      try {
        this.handleConnection(socket);
      } catch (error) {
        this.stats.errors++;
        logger.error(
          '❌ [WebSocket] Connection handler error',
          'WebSocket',
          error
        );
      }
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(socket: Socket): void {
    const tenantId = this.extractTenantFromSocket(socket);

    // Check connection limits
    if (this.stats.activeConnections >= this.config.maxConnections) {
      logger.warn(
        '⚠️ [WebSocket] Connection limit reached, rejecting connection',
        'WebSocket',
        {
          activeConnections: this.stats.activeConnections,
          maxConnections: this.config.maxConnections,
        }
      );
      socket.disconnect(true);
      return;
    }

    // Add to connections tracking
    if (!this.connections.has(tenantId)) {
      this.connections.set(tenantId, new Set());
    }
    this.connections.get(tenantId)!.add(socket);

    this.stats.totalConnections++;
    this.stats.activeConnections++;

    logger.debug('🔌 [WebSocket] New dashboard connection', 'WebSocket', {
      socketId: socket.id,
      tenantId,
      activeConnections: this.stats.activeConnections,
    });

    // Send initial connection success
    socket.emit('dashboard:connected', {
      success: true,
      tenantId,
      timestamp: new Date().toISOString(),
      features: ['real-time-updates', 'fallback-polling'],
    });

    // Setup socket event handlers
    this.setupSocketHandlers(socket, tenantId);
  }

  /**
   * Setup individual socket event handlers
   */
  private setupSocketHandlers(socket: Socket, tenantId: string): void {
    // Join tenant room for targeted updates
    socket.join(`tenant:${tenantId}`);

    // Handle client requesting initial data
    socket.on('dashboard:subscribe', data => {
      try {
        logger.debug(
          '📊 [WebSocket] Client subscribed to dashboard updates',
          'WebSocket',
          {
            socketId: socket.id,
            tenantId,
            data,
          }
        );

        // Send current cached data immediately
        this.sendCachedDashboardData(socket, tenantId);
      } catch (error) {
        this.stats.errors++;
        logger.error(
          '❌ [WebSocket] Subscribe handler error',
          'WebSocket',
          error
        );
      }
    });

    // Handle ping/pong for connection health
    socket.on('dashboard:ping', () => {
      socket.emit('dashboard:pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on('disconnect', reason => {
      this.handleDisconnection(socket, tenantId, reason);
    });

    // Handle client errors
    socket.on('error', error => {
      this.stats.errors++;
      this.stats.lastError = error.message;
      logger.error('❌ [WebSocket] Socket error', 'WebSocket', {
        socketId: socket.id,
        tenantId,
        error: error.message,
      });
    });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(
    socket: Socket,
    tenantId: string,
    reason: string
  ): void {
    try {
      // Remove from connections tracking
      const tenantConnections = this.connections.get(tenantId);
      if (tenantConnections) {
        tenantConnections.delete(socket);
        if (tenantConnections.size === 0) {
          this.connections.delete(tenantId);
        }
      }

      this.stats.activeConnections = Math.max(
        0,
        this.stats.activeConnections - 1
      );

      logger.debug('🔌 [WebSocket] Dashboard connection closed', 'WebSocket', {
        socketId: socket.id,
        tenantId,
        reason,
        activeConnections: this.stats.activeConnections,
      });
    } catch (error) {
      this.stats.errors++;
      logger.error(
        '❌ [WebSocket] Disconnection handler error',
        'WebSocket',
        error
      );
    }
  }

  /**
   * Send cached dashboard data to newly connected client
   */
  private async sendCachedDashboardData(
    socket: Socket,
    tenantId: string
  ): Promise<void> {
    try {
      // Try to get cached data
      const cachedRequests = await dashboardCache.get(
        CacheKeys.dashboardMetrics(tenantId, 'requests'),
        async () => ({ note: 'No cached data available' })
      );

      const cachedCalls = await dashboardCache.get(
        CacheKeys.callsSummary(tenantId),
        async () => ({ note: 'No cached data available' })
      );

      const cachedSystem = await dashboardCache.get(
        CacheKeys.systemMetrics(),
        async () => ({ note: 'No cached data available' })
      );

      socket.emit('dashboard:initial_data', {
        requests: cachedRequests,
        calls: cachedCalls,
        system: cachedSystem,
        timestamp: new Date().toISOString(),
        source: 'cached',
      });
    } catch (error) {
      logger.warn(
        '⚠️ [WebSocket] Failed to send cached data',
        'WebSocket',
        error
      );

      // Send fallback message
      socket.emit('dashboard:fallback', {
        message: 'WebSocket data unavailable, using polling fallback',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Publish dashboard update to all connected clients
   */
  publishDashboardUpdate(update: DashboardUpdate): void {
    if (!this.io || !this.config.enableWebSocket) {
      return; // Silently skip if WebSocket not available
    }

    try {
      const targetRoom = update.tenantId ? `tenant:${update.tenantId}` : 'all';

      this.io.to(targetRoom).emit('dashboard:update', {
        ...update,
        timestamp: new Date().toISOString(),
      });

      this.stats.messagesPublished++;

      // Count actual messages sent
      const roomConnections = update.tenantId
        ? this.connections.get(update.tenantId)?.size || 0
        : this.stats.activeConnections;

      this.stats.messagesSent += roomConnections;

      logger.debug('📡 [WebSocket] Dashboard update published', 'WebSocket', {
        type: update.type,
        tenantId: update.tenantId,
        targetRoom,
        connectionsSent: roomConnections,
      });
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        '❌ [WebSocket] Failed to publish dashboard update',
        'WebSocket',
        error
      );
    }
  }

  /**
   * Start heartbeat to detect broken connections
   */
  private startHeartbeat(): void {
    if (!this.config.enableWebSocket) return;

    this.heartbeatTimer = setInterval(() => {
      try {
        if (this.io) {
          // Send heartbeat to all connected clients
          this.io.emit('dashboard:heartbeat', {
            timestamp: new Date().toISOString(),
            activeConnections: this.stats.activeConnections,
          });
        }
      } catch (error) {
        logger.error('❌ [WebSocket] Heartbeat error', 'WebSocket', error);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Extract tenant ID from socket connection
   */
  private extractTenantFromSocket(socket: Socket): string {
    try {
      // Try to get from auth token or handshake
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      // Try to get from referer header
      const referer = socket.handshake.headers.referer || '';
      const urlMatch = referer.match(/\/\/([^\.]+)\./);

      if (urlMatch && urlMatch[1] !== 'localhost' && urlMatch[1] !== 'www') {
        return urlMatch[1];
      }

      // Fallback to default tenant
      return 'mi-nhon-hotel';
    } catch (error) {
      logger.warn(
        '⚠️ [WebSocket] Failed to extract tenant from socket',
        'WebSocket',
        error
      );
      return 'mi-nhon-hotel';
    }
  }

  /**
   * Get WebSocket service statistics
   */
  getStats() {
    return {
      ...this.stats,
      config: this.config,
      tenantConnections: Object.fromEntries(
        Array.from(this.connections.entries()).map(([tenant, sockets]) => [
          tenant,
          sockets.size,
        ])
      ),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    try {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }

      if (this.io) {
        // Notify all clients about shutdown
        this.io.emit('dashboard:shutdown', {
          message: 'Server shutting down, switching to polling mode',
          timestamp: new Date().toISOString(),
        });

        // Close all connections
        this.io.close();
      }

      logger.info(
        '🛑 [WebSocket] Dashboard WebSocket service shutdown completed',
        'WebSocket'
      );
    } catch (error) {
      logger.error('❌ [WebSocket] Shutdown error', 'WebSocket', error);
    }
  }
}

// Singleton instance
export const dashboardWebSocket = new DashboardWebSocketService();

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (global as any).dashboardWebSocket = dashboardWebSocket;
}

export default dashboardWebSocket;
