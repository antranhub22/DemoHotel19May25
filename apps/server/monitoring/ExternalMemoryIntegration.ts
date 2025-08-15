/**
 * 🔧 EXTERNAL MEMORY LEAK DETECTION INTEGRATION
 *
 * Integration module for external memory leak detection system.
 * Handles initialization, WebSocket setup, and graceful shutdown.
 */

import { logger } from "@shared/utils/logger";
import { Server as SocketIOServer } from "socket.io";
import { createExternalMemoryAPI } from "./ExternalMemoryAPI";
import {
  getRealTimeExternalMemoryMonitor,
  RealTimeExternalMemoryMonitor,
} from "./RealTimeExternalMemoryMonitor";

// ============================================
// WEBSOCKET DASHBOARD INTEGRATION
// ============================================

export class ExternalMemoryWebSocketDashboard {
  private monitor: RealTimeExternalMemoryMonitor;
  private io?: SocketIOServer;
  private dashboardNamespace?: any;
  private connectedClients = new Set<string>();

  constructor() {
    this.monitor = getRealTimeExternalMemoryMonitor();
    this.setupEventListeners();
  }

  public initialize(io: SocketIOServer): void {
    this.io = io;
    this.dashboardNamespace = io.of("/external-memory-dashboard");

    this.dashboardNamespace.on("connection", (socket: any) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);

      logger.info(
        `External memory dashboard client connected: ${clientId}`,
        "ExternalMemoryDashboard",
      );

      // Send initial data
      socket.emit("initialData", this.monitor.getCurrentStatus());
      socket.emit("detailedReport", this.monitor.getDetailedReport());

      socket.on("disconnect", () => {
        this.connectedClients.delete(clientId);
        logger.info(
          `External memory dashboard client disconnected: ${clientId}`,
          "ExternalMemoryDashboard",
        );
      });

      socket.on("requestManualCleanup", (data: any) => {
        const { types = ["gc_force"], aggressive = false } = data;
        const cleanup = this.monitor.manualCleanup(types, aggressive);
        socket.emit("cleanupTriggered", cleanup);
      });

      socket.on("requestSnapshot", () => {
        const snapshot = this.monitor.forceSnapshot();
        socket.emit("snapshotCaptured", snapshot);
      });

      socket.on("requestDetailedReport", () => {
        socket.emit("detailedReport", this.monitor.getDetailedReport());
      });
    });

    logger.success(
      "✅ External Memory Dashboard WebSocket initialized",
      "ExternalMemoryDashboard",
    );
  }

  private setupEventListeners(): void {
    // Real-time updates for connected clients
    this.monitor.on("snapshotCaptured", (snapshot) => {
      this.broadcastToClients("snapshotUpdate", snapshot);
    });

    this.monitor.on("alertGenerated", (alert) => {
      this.broadcastToClients("newAlert", alert);
    });

    this.monitor.on("growthPatternDetected", (pattern) => {
      this.broadcastToClients("newPattern", pattern);
    });

    this.monitor.on("cleanupTriggered", (cleanup) => {
      this.broadcastToClients("cleanupStarted", cleanup);
    });

    this.monitor.on("cleanupCompleted", (cleanup) => {
      this.broadcastToClients("cleanupCompleted", cleanup);
    });
  }

  private broadcastToClients(event: string, data: any): void {
    if (this.dashboardNamespace && this.connectedClients.size > 0) {
      this.dashboardNamespace.emit(event, data);
    }
  }

  public shutdown(): void {
    if (this.dashboardNamespace) {
      this.dashboardNamespace.disconnectSockets();
    }
    this.connectedClients.clear();
    logger.info(
      "External Memory Dashboard shut down",
      "ExternalMemoryDashboard",
    );
  }
}

// ============================================
// MAIN INTEGRATION MANAGER
// ============================================

export class ExternalMemorySystem {
  private monitor: RealTimeExternalMemoryMonitor;
  private dashboard: ExternalMemoryWebSocketDashboard;
  private apiRouter: any;
  private isInitialized = false;

  constructor() {
    this.monitor = getRealTimeExternalMemoryMonitor({
      // Production-optimized configuration
      samplingInterval: 3000, // 3 seconds
      alertCheckInterval: 10000, // 10 seconds
      cleanupCheckInterval: 60000, // 1 minute

      // Thresholds optimized for production
      externalMemoryThreshold: 150, // 150MB
      externalRatioThreshold: 4.0, // 4:1 ratio
      growthRateThreshold: 1.0, // 1MB/s
      sustainedGrowthDuration: 600000, // 10 minutes

      // Auto cleanup enabled with conservative settings
      enableAutoCleanup: true,
      autoCleanupThreshold: 200, // 200MB
      aggressiveCleanupThreshold: 400, // 400MB
      maxAutoCleanupFrequency: 600000, // 10 minutes

      // Alerting enabled
      enableRealTimeAlerts: true,
      alertCooldownPeriod: 120000, // 2 minutes
      enableEmergencyAlerts: true,
      emergencyThreshold: 600, // 600MB

      // Data retention
      maxSnapshots: 500, // 500 snapshots (~25 minutes at 3s intervals)
      maxPatterns: 25,
      maxAlerts: 50,

      // Integration
      enableDashboardIntegration: true,
      enableExternalNotifications: false,
    });

    this.dashboard = new ExternalMemoryWebSocketDashboard();
    this.apiRouter = createExternalMemoryAPI();
  }

  public async initialize(io: SocketIOServer): Promise<void> {
    if (this.isInitialized) {
      logger.warn(
        "External Memory System already initialized",
        "ExternalMemorySystem",
      );
      return;
    }

    try {
      logger.info(
        "🚀 Initializing External Memory Leak Detection System",
        "ExternalMemorySystem",
      );

      // Initialize WebSocket dashboard
      this.dashboard.initialize(io);

      // Start monitoring
      this.monitor.startMonitoring();

      // Setup event logging
      this.setupSystemEventLogging();

      this.isInitialized = true;

      logger.success(
        "✅ External Memory Leak Detection System Active",
        "ExternalMemorySystem",
      );

      // Log initial status
      const status = this.monitor.getCurrentStatus();
      logger.info(
        `External Memory Monitor: ${status.currentMemory?.externalMB.toFixed(1)}MB external, ` +
          `${status.currentMemory?.externalRatio.toFixed(2)}:1 ratio`,
        "ExternalMemorySystem",
      );
    } catch (error) {
      logger.error(
        "Failed to initialize External Memory System",
        "ExternalMemorySystem",
        error,
      );
      throw error;
    }
  }

  private setupSystemEventLogging(): void {
    // Log critical alerts
    this.monitor.on("alertGenerated", (alert) => {
      if (alert.severity === "critical" || alert.severity === "emergency") {
        logger.error(
          `🚨 External Memory Alert: ${alert.title}`,
          "ExternalMemorySystem",
          {
            severity: alert.severity,
            currentMemory: `${alert.currentExternalMB.toFixed(1)}MB`,
            threshold: alert.thresholdExceeded,
            message: alert.message,
            affectedResources: alert.affectedResources,
          },
        );
      } else {
        logger.warn(
          `⚠️ External Memory Alert: ${alert.title}`,
          "ExternalMemorySystem",
          { message: alert.message },
        );
      }
    });

    // Log significant patterns
    this.monitor.on("growthPatternDetected", (pattern) => {
      if (pattern.severity === "high" || pattern.severity === "critical") {
        logger.warn(
          `📈 External Memory Pattern: ${pattern.type} (${pattern.severity})`,
          "ExternalMemorySystem",
          {
            growthRate: `${(pattern.growthRate * 1000).toFixed(1)}KB/s`,
            totalGrowth: `${pattern.totalGrowth.toFixed(1)}MB`,
            confidence: `${(pattern.confidence * 100).toFixed(1)}%`,
            duration: `${(pattern.duration / 60000).toFixed(1)}min`,
          },
        );
      }
    });

    // Log cleanup results
    this.monitor.on("cleanupCompleted", (cleanup) => {
      const released = cleanup.actualRelease || cleanup.estimatedRelease;
      if (cleanup.success) {
        logger.info(
          `🧹 Cleanup Completed: ${cleanup.type} (${cleanup.trigger})`,
          "ExternalMemorySystem",
          {
            memoryReleased: `${released.toFixed(1)}MB`,
            duration: `${cleanup.duration}ms`,
            success: cleanup.success,
          },
        );
      } else {
        logger.warn(
          `⚠️ Cleanup Failed: ${cleanup.type}`,
          "ExternalMemorySystem",
          {
            errors: cleanup.errors,
            duration: `${cleanup.duration}ms`,
          },
        );
      }
    });
  }

  public getAPIRouter() {
    return this.apiRouter;
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      logger.info(
        "🛑 Shutting down External Memory System",
        "ExternalMemorySystem",
      );

      // Stop monitoring
      this.monitor.stopMonitoring();

      // Shutdown dashboard
      this.dashboard.shutdown();

      // Get final report
      const finalStatus = this.monitor.getCurrentStatus();
      logger.info(
        `External Memory System shutdown - Final stats: ` +
          `${finalStatus.totalSnapshots} snapshots, ${finalStatus.totalAlerts} alerts, ` +
          `${finalStatus.totalCleanups} cleanups`,
        "ExternalMemorySystem",
      );

      this.isInitialized = false;

      logger.success(
        "✅ External Memory System shutdown complete",
        "ExternalMemorySystem",
      );
    } catch (error) {
      logger.error(
        "Error during External Memory System shutdown",
        "ExternalMemorySystem",
        error,
      );
    }
  }

  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      monitorStatus: this.monitor.getCurrentStatus(),
      dashboardConnections: this.dashboard
        ? (this.dashboard as any).connectedClients?.size || 0
        : 0,
    };
  }

  public forceCleanup(
    types: string[] = ["gc_force"],
    aggressive: boolean = false,
  ) {
    return this.monitor.manualCleanup(types, aggressive);
  }

  public captureSnapshot() {
    return this.monitor.forceSnapshot();
  }

  public getDetailedReport() {
    return this.monitor.getDetailedReport();
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let externalMemorySystem: ExternalMemorySystem | null = null;

export function getExternalMemorySystem(): ExternalMemorySystem {
  if (!externalMemorySystem) {
    externalMemorySystem = new ExternalMemorySystem();
  }
  return externalMemorySystem;
}

export function resetExternalMemorySystem(): void {
  if (externalMemorySystem) {
    externalMemorySystem.shutdown();
    externalMemorySystem = null;
  }
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export { createExternalMemoryAPI } from "./ExternalMemoryAPI";
export { getRealTimeExternalMemoryMonitor } from "./RealTimeExternalMemoryMonitor";
