/**
 * 📊 EXTERNAL MEMORY DASHBOARD
 *
 * Real-time dashboard for external memory monitoring
 * WebSocket-based updates with charts and alerts
 */

import { logger } from "@shared/utils/logger";
import { Request, Response, Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import {
  ExternalMemoryAlert,
  ExternalMemorySnapshot,
  externalMemoryMonitor,
} from "./ExternalMemoryMonitor";

// ============================================================================
// DASHBOARD CONTROLLER
// ============================================================================

export class ExternalMemoryDashboard {
  private static instance: ExternalMemoryDashboard;
  private io?: SocketIOServer;
  private connectedClients = new Set<string>();
  private updateInterval?: NodeJS.Timeout;

  static getInstance(): ExternalMemoryDashboard {
    if (!ExternalMemoryDashboard.instance) {
      ExternalMemoryDashboard.instance = new ExternalMemoryDashboard();
    }
    return ExternalMemoryDashboard.instance;
  }

  /**
   * Initialize dashboard with Socket.IO
   */
  initialize(io: SocketIOServer): void {
    this.io = io;
    this.setupSocketHandlers();
    this.setupEventListeners();
    this.startRealtimeUpdates();

    logger.info(
      "📊 External Memory Dashboard initialized",
      "ExternalMemoryDashboard",
    );
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);

      logger.debug("📊 Dashboard client connected", "ExternalMemoryDashboard", {
        clientId,
      });

      // Send initial data
      this.sendInitialData(socket);

      // Handle client requests
      socket.on("memory:request-status", () => {
        this.sendCurrentStatus(socket);
      });

      socket.on("memory:request-history", (params: { count?: number }) => {
        this.sendMemoryHistory(socket, params.count || 50);
      });

      socket.on("memory:request-alerts", () => {
        this.sendActiveAlerts(socket);
      });

      socket.on("memory:resolve-alert", (alertId: string) => {
        const resolved = externalMemoryMonitor.resolveAlert(alertId);
        if (resolved) {
          socket.emit("memory:alert-resolved", { alertId });
          // Broadcast to all clients
          this.broadcastAlertResolved(alertId);
        }
      });

      socket.on("memory:force-analysis", () => {
        const pattern = externalMemoryMonitor.forceAnalysis();
        socket.emit("memory:analysis-result", pattern);
      });

      socket.on("memory:export-data", () => {
        const data = externalMemoryMonitor.exportData();
        socket.emit("memory:data-export", data);
      });

      socket.on("disconnect", () => {
        this.connectedClients.delete(clientId);
        logger.debug(
          "📊 Dashboard client disconnected",
          "ExternalMemoryDashboard",
          { clientId },
        );
      });
    });
  }

  /**
   * Setup external memory monitor event listeners
   */
  private setupEventListeners(): void {
    // Forward monitor events to dashboard clients
    externalMemoryMonitor.on(
      "snapshot:taken",
      (snapshot: ExternalMemorySnapshot) => {
        this.broadcastSnapshot(snapshot);
      },
    );

    externalMemoryMonitor.on("alert:created", (alert: ExternalMemoryAlert) => {
      this.broadcastAlert(alert);
    });

    externalMemoryMonitor.on("pattern:detected", (pattern) => {
      this.broadcastPattern(pattern);
    });
  }

  /**
   * Start real-time updates
   */
  private startRealtimeUpdates(): void {
    // Send status updates every 30 seconds
    this.updateInterval = setInterval(() => {
      if (this.connectedClients.size > 0) {
        this.broadcastStatusUpdate();
      }
    }, 30000);
  }

  /**
   * Send initial data to new client
   */
  private sendInitialData(socket: any): void {
    const status = externalMemoryMonitor.getCurrentStatus();
    const recentSnapshots = externalMemoryMonitor.getRecentSnapshots(50);
    const activeAlerts = externalMemoryMonitor.getActiveAlerts();
    const growthSummary = externalMemoryMonitor.getGrowthSummary(60);

    socket.emit("memory:initial-data", {
      status,
      snapshots: recentSnapshots,
      alerts: activeAlerts,
      growth: growthSummary,
    });
  }

  /**
   * Send current status to client
   */
  private sendCurrentStatus(socket: any): void {
    const status = externalMemoryMonitor.getCurrentStatus();
    socket.emit("memory:status", status);
  }

  /**
   * Send memory history to client
   */
  private sendMemoryHistory(socket: any, count: number): void {
    const snapshots = externalMemoryMonitor.getRecentSnapshots(count);
    socket.emit("memory:history", { snapshots, count });
  }

  /**
   * Send active alerts to client
   */
  private sendActiveAlerts(socket: any): void {
    const alerts = externalMemoryMonitor.getActiveAlerts();
    socket.emit("memory:alerts", alerts);
  }

  /**
   * Broadcast new snapshot to all clients
   */
  private broadcastSnapshot(snapshot: ExternalMemorySnapshot): void {
    if (!this.io || this.connectedClients.size === 0) return;

    this.io.emit("memory:snapshot", snapshot);
  }

  /**
   * Broadcast new alert to all clients
   */
  private broadcastAlert(alert: ExternalMemoryAlert): void {
    if (!this.io || this.connectedClients.size === 0) return;

    this.io.emit("memory:alert", alert);
  }

  /**
   * Broadcast pattern detection to all clients
   */
  private broadcastPattern(pattern: any): void {
    if (!this.io || this.connectedClients.size === 0) return;

    this.io.emit("memory:pattern", pattern);
  }

  /**
   * Broadcast status update to all clients
   */
  private broadcastStatusUpdate(): void {
    if (!this.io || this.connectedClients.size === 0) return;

    const status = externalMemoryMonitor.getCurrentStatus();
    const growthSummary = externalMemoryMonitor.getGrowthSummary(30);

    this.io.emit("memory:status-update", {
      status,
      growth: growthSummary,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast alert resolved to all clients
   */
  private broadcastAlertResolved(alertId: string): void {
    if (!this.io || this.connectedClients.size === 0) return;

    this.io.emit("memory:alert-resolved", { alertId });
  }

  /**
   * Get dashboard statistics
   */
  getStats(): {
    connectedClients: number;
    isActive: boolean;
    monitorStatus: any;
  } {
    return {
      connectedClients: this.connectedClients.size,
      isActive: !!this.io,
      monitorStatus: externalMemoryMonitor.getCurrentStatus(),
    };
  }

  /**
   * Shutdown dashboard
   */
  shutdown(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    this.connectedClients.clear();

    logger.info(
      "📊 External Memory Dashboard shutdown",
      "ExternalMemoryDashboard",
    );
  }
}

// ============================================================================
// REST API ROUTES
// ============================================================================

export const externalMemoryRoutes = Router();

// Get current memory status
externalMemoryRoutes.get("/status", (req: Request, res: Response) => {
  try {
    const status = externalMemoryMonitor.getCurrentStatus();
    res.json({
      success: true,
      data: status,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to get memory status", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get memory status",
    });
  }
});

// Get memory history
externalMemoryRoutes.get("/history", (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 50;
    const snapshots = externalMemoryMonitor.getRecentSnapshots(count);

    res.json({
      success: true,
      data: {
        snapshots,
        count: snapshots.length,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to get memory history", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get memory history",
    });
  }
});

// Get active alerts
externalMemoryRoutes.get("/alerts", (req: Request, res: Response) => {
  try {
    const alerts = externalMemoryMonitor.getActiveAlerts();

    res.json({
      success: true,
      data: alerts,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to get alerts", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get alerts",
    });
  }
});

// Get growth summary
externalMemoryRoutes.get("/growth", (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 30;
    const growth = externalMemoryMonitor.getGrowthSummary(minutes);

    res.json({
      success: true,
      data: growth,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to get growth summary", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to get growth summary",
    });
  }
});

// Resolve alert
externalMemoryRoutes.post(
  "/alerts/:alertId/resolve",
  (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const resolved = externalMemoryMonitor.resolveAlert(alertId);

      if (resolved) {
        res.json({
          success: true,
          message: "Alert resolved successfully",
          alertId,
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Alert not found or already resolved",
        });
      }
    } catch (error) {
      logger.error("Failed to resolve alert", "ExternalMemoryAPI", error);
      res.status(500).json({
        success: false,
        error: "Failed to resolve alert",
      });
    }
  },
);

// Force analysis
externalMemoryRoutes.post("/analyze", (req: Request, res: Response) => {
  try {
    const pattern = externalMemoryMonitor.forceAnalysis();

    res.json({
      success: true,
      data: pattern,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to force analysis", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to force analysis",
    });
  }
});

// Export data
externalMemoryRoutes.get("/export", (req: Request, res: Response) => {
  try {
    const data = externalMemoryMonitor.exportData();

    // Set headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="memory-data-${new Date().toISOString().split("T")[0]}.json"`,
    );

    res.json(data);
  } catch (error) {
    logger.error("Failed to export data", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to export data",
    });
  }
});

// Generate report
externalMemoryRoutes.get("/report", (req: Request, res: Response) => {
  try {
    const report = externalMemoryMonitor.generateReport();

    // Set headers for text download
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="memory-report-${new Date().toISOString().split("T")[0]}.md"`,
    );

    res.send(report);
  } catch (error) {
    logger.error("Failed to generate report", "ExternalMemoryAPI", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate report",
    });
  }
});

// Dashboard HTML page
externalMemoryRoutes.get("/dashboard", (req: Request, res: Response) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>External Memory Monitor - Dashboard</title>
    <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .metric { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .metric-value { 
            font-size: 2em; 
            font-weight: bold; 
            color: #2563eb; 
        }
        .metric-label { 
            color: #6b7280; 
            margin-top: 5px; 
        }
        .charts { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .chart-container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .alerts { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .alert { 
            padding: 10px; 
            margin: 10px 0; 
            border-radius: 4px; 
            border-left: 4px solid; 
        }
        .alert.warning { 
            background: #fef3c7; 
            border-color: #f59e0b; 
        }
        .alert.critical { 
            background: #fee2e2; 
            border-color: #ef4444; 
        }
        .status { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.8em; 
            font-weight: bold; 
        }
        .status.active { 
            background: #dcfce7; 
            color: #166534; 
        }
        .status.inactive { 
            background: #fef2f2; 
            color: #991b1b; 
        }
        button { 
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer; 
        }
        button:hover { 
            background: #1d4ed8; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 External Memory Monitor</h1>
        <p>Real-time monitoring of external memory usage and leak detection</p>
        <span id="connection-status" class="status">Connecting...</span>
        <span id="monitor-status" class="status">Unknown</span>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="metric-value" id="rss-value">--</div>
            <div class="metric-label">RSS Memory (MB)</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="external-value">--</div>
            <div class="metric-label">External Memory (MB)</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="ratio-value">--</div>
            <div class="metric-label">External/Heap Ratio</div>
        </div>
        <div class="metric">
            <div class="metric-value" id="growth-rate">--</div>
            <div class="metric-label">Growth Rate (MB/min)</div>
        </div>
    </div>

    <div class="charts">
        <div class="chart-container">
            <h3>Memory Usage Over Time</h3>
            <canvas id="memory-chart"></canvas>
        </div>
        <div class="chart-container">
            <h3>External Memory Ratio</h3>
            <canvas id="ratio-chart"></canvas>
        </div>
    </div>

    <div class="alerts">
        <h3>Active Alerts</h3>
        <div id="alerts-container">
            <p>No active alerts</p>
        </div>
    </div>

    <script>
        // Socket.IO connection
        const socket = io();
        
        // Chart setup
        const memoryChart = new Chart(document.getElementById('memory-chart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'RSS',
                        data: [],
                        borderColor: '#2563eb',
                        tension: 0.1
                    },
                    {
                        label: 'External',
                        data: [],
                        borderColor: '#dc2626',
                        tension: 0.1
                    },
                    {
                        label: 'Heap',
                        data: [],
                        borderColor: '#059669',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });

        const ratioChart = new Chart(document.getElementById('ratio-chart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'External/Heap Ratio',
                    data: [],
                    borderColor: '#7c3aed',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ratio'
                        }
                    }
                }
            }
        });

        // Socket event handlers
        socket.on('connect', () => {
            document.getElementById('connection-status').textContent = 'Connected';
            document.getElementById('connection-status').className = 'status active';
        });

        socket.on('disconnect', () => {
            document.getElementById('connection-status').textContent = 'Disconnected';
            document.getElementById('connection-status').className = 'status inactive';
        });

        socket.on('memory:initial-data', (data) => {
            updateCharts(data.snapshots);
            updateMetrics(data.status.lastSnapshot, data.growth);
            updateAlerts(data.alerts);
            updateMonitorStatus(data.status.isMonitoring);
        });

        socket.on('memory:snapshot', (snapshot) => {
            addSnapshotToCharts(snapshot);
            updateCurrentMetrics(snapshot);
        });

        socket.on('memory:alert', (alert) => {
            addAlert(alert);
        });

        socket.on('memory:status-update', (data) => {
            updateMetrics(data.status.lastSnapshot, data.growth);
        });

        // Update functions
        function updateCharts(snapshots) {
            const labels = snapshots.map(s => new Date(s.timestamp).toLocaleTimeString());
            const rssData = snapshots.map(s => (s.rss / 1024 / 1024).toFixed(1));
            const externalData = snapshots.map(s => (s.external / 1024 / 1024).toFixed(1));
            const heapData = snapshots.map(s => (s.heapUsed / 1024 / 1024).toFixed(1));
            const ratioData = snapshots.map(s => s.externalRatio.toFixed(2));

            memoryChart.data.labels = labels;
            memoryChart.data.datasets[0].data = rssData;
            memoryChart.data.datasets[1].data = externalData;
            memoryChart.data.datasets[2].data = heapData;
            memoryChart.update();

            ratioChart.data.labels = labels;
            ratioChart.data.datasets[0].data = ratioData;
            ratioChart.update();
        }

        function addSnapshotToCharts(snapshot) {
            const time = new Date(snapshot.timestamp).toLocaleTimeString();
            const rss = (snapshot.rss / 1024 / 1024).toFixed(1);
            const external = (snapshot.external / 1024 / 1024).toFixed(1);
            const heap = (snapshot.heapUsed / 1024 / 1024).toFixed(1);
            const ratio = snapshot.externalRatio.toFixed(2);

            // Add new data point
            memoryChart.data.labels.push(time);
            memoryChart.data.datasets[0].data.push(rss);
            memoryChart.data.datasets[1].data.push(external);
            memoryChart.data.datasets[2].data.push(heap);

            ratioChart.data.labels.push(time);
            ratioChart.data.datasets[0].data.push(ratio);

            // Keep only last 50 points
            if (memoryChart.data.labels.length > 50) {
                memoryChart.data.labels.shift();
                memoryChart.data.datasets.forEach(dataset => dataset.data.shift());
                
                ratioChart.data.labels.shift();
                ratioChart.data.datasets[0].data.shift();
            }

            memoryChart.update();
            ratioChart.update();
        }

        function updateMetrics(snapshot, growth) {
            if (snapshot) {
                document.getElementById('rss-value').textContent = (snapshot.rss / 1024 / 1024).toFixed(1);
                document.getElementById('external-value').textContent = (snapshot.external / 1024 / 1024).toFixed(1);
                document.getElementById('ratio-value').textContent = snapshot.externalRatio.toFixed(2) + 'x';
            }
            
            if (growth) {
                document.getElementById('growth-rate').textContent = growth.growthRate.external.toFixed(2);
            }
        }

        function updateCurrentMetrics(snapshot) {
            document.getElementById('rss-value').textContent = (snapshot.rss / 1024 / 1024).toFixed(1);
            document.getElementById('external-value').textContent = (snapshot.external / 1024 / 1024).toFixed(1);
            document.getElementById('ratio-value').textContent = snapshot.externalRatio.toFixed(2) + 'x';
        }

        function updateAlerts(alerts) {
            const container = document.getElementById('alerts-container');
            container.innerHTML = '';

            if (alerts.length === 0) {
                container.innerHTML = '<p>No active alerts</p>';
                return;
            }

            alerts.forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = \`alert \${alert.severity}\`;
                alertDiv.innerHTML = \`
                    <strong>\${alert.type.toUpperCase()}</strong>: \${alert.message}
                    <br><small>\${new Date(alert.timestamp).toLocaleString()}</small>
                    <button onclick="resolveAlert('\${alert.id}')">Resolve</button>
                \`;
                container.appendChild(alertDiv);
            });
        }

        function addAlert(alert) {
            // Add to existing alerts
            socket.emit('memory:request-alerts');
        }

        function updateMonitorStatus(isMonitoring) {
            const statusEl = document.getElementById('monitor-status');
            statusEl.textContent = isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive';
            statusEl.className = \`status \${isMonitoring ? 'active' : 'inactive'}\`;
        }

        function resolveAlert(alertId) {
            socket.emit('memory:resolve-alert', alertId);
        }

        // Request initial data
        socket.emit('memory:request-status');
    </script>
</body>
</html>
  `;

  res.send(dashboardHTML);
});

export const externalMemoryDashboard = ExternalMemoryDashboard.getInstance();
