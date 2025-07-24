// ============================================
// WEBSOCKET DASHBOARD v1.0 - Real-time Dashboard Updates
// ============================================
// WebSocket integration for real-time monitoring dashboard with live metrics streaming,
// alert notifications, and interactive dashboard updates

import { logger } from '@shared/utils/logger';
import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { MonitoringDashboard } from './MonitoringDashboard';

// WebSocket interfaces
export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'alert_action' | 'config_update';
  data?: any;
  timestamp: string;
  messageId: string;
}

export interface WebSocketResponse {
  type:
    | 'metrics'
    | 'alert'
    | 'status'
    | 'error'
    | 'pong'
    | 'subscription_confirmed';
  data?: any;
  timestamp: string;
  messageId?: string;
}

export interface WebSocketSubscription {
  type:
    | 'metrics'
    | 'alerts'
    | 'performance'
    | 'system'
    | 'database'
    | 'application'
    | 'business'
    | 'all';
  frequency?: number; // seconds
  filters?: {
    category?: string;
    severity?: string;
    module?: string;
  };
}

export interface WebSocketClient {
  id: string;
  userId?: string;
  permissions: string[];
  subscriptions: WebSocketSubscription[];
  lastActivity: Date;
  connection: WebSocket;
  isAlive: boolean;
}

/**
 * WebSocket Dashboard Manager
 * Real-time WebSocket integration for monitoring dashboard
 */
export class WebSocketDashboard extends EventEmitter {
  private static instance: WebSocketDashboard;
  private wss?: WebSocketServer;
  private clients = new Map<string, WebSocketClient>();
  private monitoringDashboard?: MonitoringDashboard;
  private heartbeatInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private isInitialized = false;

  private constructor() {
    super();
  }

  static getInstance(): WebSocketDashboard {
    if (!this.instance) {
      this.instance = new WebSocketDashboard();
    }
    return this.instance;
  }

  /**
   * Initialize WebSocket dashboard
   */
  async initialize(port: number = 8080): Promise<void> {
    try {
      logger.info(
        '🔌 [WebSocketDashboard] Initializing WebSocket dashboard server',
        'WebSocketDashboard'
      );

      // Initialize WebSocket server
      this.wss = new WebSocketServer({
        port,
        perMessageDeflate: false, // Disable compression for better performance
      });

      // Get monitoring dashboard instance
      this.monitoringDashboard = MonitoringDashboard.getInstance();

      // Setup WebSocket event handlers
      this.setupWebSocketHandlers();

      // Start heartbeat mechanism
      this.startHeartbeat();

      // Start metrics streaming
      this.startMetricsStreaming();

      // Setup monitoring dashboard event listeners
      this.setupDashboardEventListeners();

      this.isInitialized = true;
      logger.success(
        `✅ [WebSocketDashboard] WebSocket dashboard server started on port ${port}`,
        'WebSocketDashboard'
      );
    } catch (error) {
      logger.error(
        '❌ [WebSocketDashboard] Failed to initialize WebSocket dashboard',
        'WebSocketDashboard',
        error
      );
      throw error;
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: WebSocketResponse, subscriptionType?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [clientId, client] of this.clients) {
      if (client.connection.readyState === WebSocket.OPEN) {
        // Check if client is subscribed to this type of message
        if (
          !subscriptionType ||
          this.isClientSubscribed(client, subscriptionType)
        ) {
          try {
            client.connection.send(messageStr);
            client.lastActivity = new Date();
          } catch (error) {
            logger.error(
              '❌ [WebSocketDashboard] Failed to send message to client',
              'WebSocketDashboard',
              {
                clientId,
                error: (error as Error).message,
              }
            );
            this.removeClient(clientId);
          }
        }
      }
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, message: WebSocketResponse): void {
    const client = this.clients.get(clientId);
    if (client && client.connection.readyState === WebSocket.OPEN) {
      try {
        client.connection.send(JSON.stringify(message));
        client.lastActivity = new Date();
      } catch (error) {
        logger.error(
          '❌ [WebSocketDashboard] Failed to send message to specific client',
          'WebSocketDashboard',
          {
            clientId,
            error: (error as Error).message,
          }
        );
        this.removeClient(clientId);
      }
    }
  }

  /**
   * Get connected clients statistics
   */
  getClientStats(): {
    total: number;
    bySubscription: { [type: string]: number };
    byPermission: { [permission: string]: number };
    activeInLast5Min: number;
  } {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const bySubscription: { [type: string]: number } = {};
    const byPermission: { [permission: string]: number } = {};
    let activeInLast5Min = 0;

    for (const client of this.clients.values()) {
      // Count subscriptions
      client.subscriptions.forEach(sub => {
        bySubscription[sub.type] = (bySubscription[sub.type] || 0) + 1;
      });

      // Count permissions
      client.permissions.forEach(permission => {
        byPermission[permission] = (byPermission[permission] || 0) + 1;
      });

      // Count active clients
      if (client.lastActivity >= fiveMinutesAgo) {
        activeInLast5Min++;
      }
    }

    return {
      total: this.clients.size,
      bySubscription,
      byPermission,
      activeInLast5Min,
    };
  }

  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      serverRunning: !!this.wss,
      connectedClients: this.clients.size,
      heartbeatActive: !!this.heartbeatInterval,
      metricsStreamingActive: !!this.metricsInterval,
      clientStats: this.getClientStats(),
    };
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const clientIP = request.socket.remoteAddress;

      logger.info(
        '🔌 [WebSocketDashboard] New client connected',
        'WebSocketDashboard',
        {
          clientId,
          clientIP,
        }
      );

      const client: WebSocketClient = {
        id: clientId,
        permissions: ['read'], // Default permissions
        subscriptions: [],
        lastActivity: new Date(),
        connection: ws,
        isAlive: true,
      };

      this.clients.set(clientId, client);

      // Register with monitoring dashboard
      if (this.monitoringDashboard) {
        this.monitoringDashboard.registerWebSocketConnection({
          id: clientId,
          permissions: client.permissions,
          subscriptions: client.subscriptions.map(s => s.type),
        });
      }

      // Setup client message handlers
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          logger.error(
            '❌ [WebSocketDashboard] Invalid message from client',
            'WebSocketDashboard',
            {
              clientId,
              error: (error as Error).message,
            }
          );
          this.sendToClient(clientId, {
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info(
          '🔌 [WebSocketDashboard] Client disconnected',
          'WebSocketDashboard',
          { clientId }
        );
        this.removeClient(clientId);
      });

      // Handle ping/pong for heartbeat
      ws.on('pong', () => {
        client.isAlive = true;
        client.lastActivity = new Date();
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'status',
        data: {
          message: 'Connected to monitoring dashboard',
          clientId,
          serverTime: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    });

    this.wss.on('error', error => {
      logger.error(
        '❌ [WebSocketDashboard] WebSocket server error',
        'WebSocketDashboard',
        error
      );
    });
  }

  private handleClientMessage(
    clientId: string,
    message: WebSocketMessage
  ): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    // Update monitoring dashboard activity
    if (this.monitoringDashboard) {
      this.monitoringDashboard.updateConnectionActivity(clientId);
    }

    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(clientId, message.data);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(clientId, message.data);
        break;

      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          timestamp: new Date().toISOString(),
          messageId: message.messageId,
        });
        break;

      case 'alert_action':
        this.handleAlertAction(clientId, message.data);
        break;

      case 'config_update':
        this.handleConfigUpdate(clientId, message.data);
        break;

      default:
        this.sendToClient(clientId, {
          type: 'error',
          data: { message: `Unknown message type: ${message.type}` },
          timestamp: new Date().toISOString(),
          messageId: message.messageId,
        });
    }
  }

  private handleSubscription(
    clientId: string,
    subscriptionData: WebSocketSubscription
  ): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Validate subscription
    if (!subscriptionData.type) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Subscription type is required' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Add subscription
    client.subscriptions.push(subscriptionData);

    // Update monitoring dashboard
    if (this.monitoringDashboard) {
      this.monitoringDashboard.registerWebSocketConnection({
        id: clientId,
        userId: client.userId,
        permissions: client.permissions,
        subscriptions: client.subscriptions.map(s => s.type),
      });
    }

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      data: {
        subscription: subscriptionData,
        message: `Subscribed to ${subscriptionData.type}`,
      },
      timestamp: new Date().toISOString(),
    });

    logger.debug(
      '📋 [WebSocketDashboard] Client subscribed',
      'WebSocketDashboard',
      {
        clientId,
        subscriptionType: subscriptionData.type,
      }
    );
  }

  private handleUnsubscription(
    clientId: string,
    subscriptionType: string
  ): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove subscription
    client.subscriptions = client.subscriptions.filter(
      s => s.type !== subscriptionType
    );

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      data: {
        message: `Unsubscribed from ${subscriptionType}`,
      },
      timestamp: new Date().toISOString(),
    });

    logger.debug(
      '📋 [WebSocketDashboard] Client unsubscribed',
      'WebSocketDashboard',
      {
        clientId,
        subscriptionType,
      }
    );
  }

  private handleAlertAction(clientId: string, actionData: any): void {
    const client = this.clients.get(clientId);
    if (!client || !this.monitoringDashboard) return;

    // Check permissions
    if (
      !client.permissions.includes('admin') &&
      !client.permissions.includes('alert_management')
    ) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Insufficient permissions for alert actions' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const { alertId, action } = actionData;
      let success = false;

      switch (action) {
        case 'acknowledge':
          success = this.monitoringDashboard.acknowledgeAlert(
            alertId,
            client.userId
          );
          break;
        case 'resolve':
          success = this.monitoringDashboard.resolveAlert(
            alertId,
            client.userId
          );
          break;
        default:
          this.sendToClient(clientId, {
            type: 'error',
            data: { message: `Unknown alert action: ${action}` },
            timestamp: new Date().toISOString(),
          });
          return;
      }

      if (success) {
        this.sendToClient(clientId, {
          type: 'status',
          data: {
            message: `Alert ${action} successful`,
            alertId,
            action,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        this.sendToClient(clientId, {
          type: 'error',
          data: { message: `Alert ${action} failed - alert not found` },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.sendToClient(clientId, {
        type: 'error',
        data: {
          message: 'Alert action failed',
          details: (error as Error).message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleConfigUpdate(clientId: string, configData: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Check permissions
    if (!client.permissions.includes('admin')) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Insufficient permissions for configuration updates' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Handle configuration updates (would implement actual config changes)
    this.sendToClient(clientId, {
      type: 'status',
      data: {
        message: 'Configuration update received',
        config: configData,
      },
      timestamp: new Date().toISOString(),
    });

    logger.info(
      '⚙️ [WebSocketDashboard] Configuration update',
      'WebSocketDashboard',
      {
        clientId,
        configUpdate: configData,
      }
    );
  }

  private removeClient(clientId: string): void {
    this.clients.delete(clientId);

    // Unregister from monitoring dashboard
    if (this.monitoringDashboard) {
      this.monitoringDashboard.unregisterWebSocketConnection(clientId);
    }
  }

  private isClientSubscribed(
    client: WebSocketClient,
    subscriptionType: string
  ): boolean {
    return client.subscriptions.some(
      sub => sub.type === subscriptionType || sub.type === 'all'
    );
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          logger.debug(
            '💔 [WebSocketDashboard] Removing inactive client',
            'WebSocketDashboard',
            { clientId }
          );
          client.connection.terminate();
          this.removeClient(clientId);
        } else {
          client.isAlive = false;
          if (client.connection.readyState === WebSocket.OPEN) {
            client.connection.ping();
          }
        }
      }
    }, 30000); // 30 seconds
  }

  private startMetricsStreaming(): void {
    this.metricsInterval = setInterval(async () => {
      if (!this.monitoringDashboard) return;

      try {
        const metrics = await this.monitoringDashboard.getCurrentMetrics();

        this.broadcast(
          {
            type: 'metrics',
            data: metrics,
            timestamp: new Date().toISOString(),
          },
          'metrics'
        );
      } catch (error) {
        logger.error(
          '❌ [WebSocketDashboard] Metrics streaming failed',
          'WebSocketDashboard',
          error
        );
      }
    }, 30000); // 30 seconds
  }

  private setupDashboardEventListeners(): void {
    if (!this.monitoringDashboard) return;

    // Listen for alert events
    this.monitoringDashboard.on('alert', alert => {
      this.broadcast(
        {
          type: 'alert',
          data: { action: 'created', alert },
          timestamp: new Date().toISOString(),
        },
        'alerts'
      );
    });

    this.monitoringDashboard.on('alertAcknowledged', alert => {
      this.broadcast(
        {
          type: 'alert',
          data: { action: 'acknowledged', alert },
          timestamp: new Date().toISOString(),
        },
        'alerts'
      );
    });

    this.monitoringDashboard.on('alertResolved', alert => {
      this.broadcast(
        {
          type: 'alert',
          data: { action: 'resolved', alert },
          timestamp: new Date().toISOString(),
        },
        'alerts'
      );
    });
  }

  private generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const webSocketDashboard = WebSocketDashboard.getInstance();

// Convenience functions
export const initializeWebSocketDashboard = (port?: number) =>
  webSocketDashboard.initialize(port);
export const broadcastDashboardUpdate = (
  message: WebSocketResponse,
  subscriptionType?: string
) => webSocketDashboard.broadcast(message, subscriptionType);
export const getWebSocketClientStats = () =>
  webSocketDashboard.getClientStats();
