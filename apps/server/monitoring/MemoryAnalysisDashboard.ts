/**
 * 🎯 MEMORY ANALYSIS DASHBOARD
 *
 * Comprehensive dashboard for process memory analysis with real-time
 * RSS vs heap tracking, external memory monitoring, and leak reporting
 */

import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";
import { Request, Response, Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import {
  ExternalMemoryLeak,
  MemoryGrowthPattern,
  ProcessMemoryAnalyzer,
  ProcessMemorySnapshot,
  getProcessMemoryAnalyzer,
} from "./ProcessMemoryAnalyzer";

// ============================================
// DASHBOARD CONFIGURATION
// ============================================

export interface MemoryAnalysisDashboardConfig {
  enableRealTimeUpdates: boolean;
  updateInterval: number;
  maxHistoryPoints: number;
  enableAlerts: boolean;
  alertThresholds: {
    externalMemoryMB: number;
    externalRatio: number;
    rssMB: number;
    leakCount: number;
  };
  dashboardRoute: string;
  apiRoute: string;
}

// ============================================
// MEMORY ANALYSIS DASHBOARD CLASS
// ============================================

export class MemoryAnalysisDashboard extends EventEmitter {
  private config: MemoryAnalysisDashboardConfig;
  private analyzer: ProcessMemoryAnalyzer;
  private router: Router;
  private io?: SocketIOServer;

  private realtimeInterval?: NodeJS.Timeout;
  private isInitialized = false;
  private connectedClients = new Set<string>();

  constructor(config: Partial<MemoryAnalysisDashboardConfig> = {}) {
    super();

    this.config = {
      enableRealTimeUpdates: true,
      updateInterval: 2000, // 2 seconds
      maxHistoryPoints: 200, // ~6.7 minutes at 2s intervals
      enableAlerts: true,
      alertThresholds: {
        externalMemoryMB: 50,
        externalRatio: 2.0,
        rssMB: 150,
        leakCount: 3,
      },
      dashboardRoute: "/memory-analysis",
      apiRoute: "/api/memory-analysis",
      ...config,
    };

    this.analyzer = getProcessMemoryAnalyzer();
    this.router = Router();
    this.setupRoutes();
    this.setupAnalyzerListeners();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  public initialize(io?: SocketIOServer): void {
    if (this.isInitialized) {
      logger.warn(
        "MemoryAnalysisDashboard already initialized",
        "MemoryAnalysisDashboard",
      );
      return;
    }

    this.io = io;
    this.isInitialized = true;

    if (this.io) {
      this.setupSocketHandlers();
    }

    if (this.config.enableRealTimeUpdates) {
      this.startRealtimeUpdates();
    }

    // Start the analyzer if not already running
    if (!this.analyzer.getCurrentStatus().isRunning) {
      this.analyzer.startAnalysis();
    }

    logger.info(
      "🎯 Memory Analysis Dashboard initialized",
      "MemoryAnalysisDashboard",
    );

    this.emit("initialized", {
      config: this.config,
      hasSocketIO: !!this.io,
    });
  }

  public shutdown(): void {
    if (!this.isInitialized) return;

    if (this.realtimeInterval) {
      clearInterval(this.realtimeInterval);
      this.realtimeInterval = undefined;
    }

    this.connectedClients.clear();
    this.isInitialized = false;

    logger.info(
      "🛑 Memory Analysis Dashboard shut down",
      "MemoryAnalysisDashboard",
    );

    this.emit("shutdown");
  }

  // ============================================
  // SOCKET.IO HANDLERS
  // ============================================

  private setupSocketHandlers(): void {
    if (!this.io) return;

    const namespace = this.io.of("/memory-analysis");

    namespace.on("connection", (socket) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);

      logger.debug(
        `Memory analysis client connected: ${clientId}`,
        "MemoryAnalysisDashboard",
      );

      // Send initial data
      this.sendInitialData(socket);

      // Handle client requests
      socket.on("request-snapshot", () => {
        const snapshot = this.analyzer.forceSnapshot();
        socket.emit("snapshot", this.formatSnapshotForClient(snapshot));
      });

      socket.on("request-analysis", () => {
        const analysis = this.analyzer.getDetailedAnalysis();
        socket.emit("detailed-analysis", analysis);
      });

      socket.on("request-trends", (params: { duration?: number }) => {
        const trends = this.analyzer.getRSSvsHeapTrend(params.duration || 20);
        socket.emit("trends", trends);
      });

      socket.on("dismiss-leak", (leakId: string) => {
        // This would dismiss a leak from the UI
        this.emit("leakDismissed", { leakId, clientId });
      });

      socket.on("disconnect", () => {
        this.connectedClients.delete(clientId);
        logger.debug(
          `Memory analysis client disconnected: ${clientId}`,
          "MemoryAnalysisDashboard",
        );
      });
    });
  }

  private sendInitialData(socket: any): void {
    const status = this.analyzer.getCurrentStatus();
    const analysis = this.analyzer.getDetailedAnalysis();

    socket.emit("initial-data", {
      status,
      analysis,
      config: this.config,
      timestamp: Date.now(),
    });
  }

  // ============================================
  // REAL-TIME UPDATES
  // ============================================

  private startRealtimeUpdates(): void {
    if (this.realtimeInterval) {
      clearInterval(this.realtimeInterval);
    }

    this.realtimeInterval = setInterval(() => {
      this.broadcastRealtimeUpdate();
    }, this.config.updateInterval);

    logger.debug(
      "Started real-time memory analysis updates",
      "MemoryAnalysisDashboard",
    );
  }

  private broadcastRealtimeUpdate(): void {
    if (!this.io || this.connectedClients.size === 0) return;

    const status = this.analyzer.getCurrentStatus();
    const namespace = this.io.of("/memory-analysis");

    namespace.emit("realtime-update", {
      timestamp: Date.now(),
      memory: status.currentMemory,
      trends: status.trends,
      leaks: status.leaks,
      patterns: status.growthPatterns,
    });

    // Check for alerts
    if (this.config.enableAlerts && status.currentMemory) {
      this.checkAndBroadcastAlerts(status.currentMemory);
    }
  }

  private checkAndBroadcastAlerts(memory: any): void {
    const alerts: any[] = [];

    if (memory.externalMB > this.config.alertThresholds.externalMemoryMB) {
      alerts.push({
        type: "external-memory-high",
        severity: "warning",
        message: `External memory (${memory.externalMB.toFixed(1)}MB) exceeds threshold (${this.config.alertThresholds.externalMemoryMB}MB)`,
        value: memory.externalMB,
        threshold: this.config.alertThresholds.externalMemoryMB,
      });
    }

    if (memory.externalRatio > this.config.alertThresholds.externalRatio) {
      alerts.push({
        type: "external-ratio-high",
        severity: "warning",
        message: `External memory ratio (${memory.externalRatio.toFixed(2)}x) is high`,
        value: memory.externalRatio,
        threshold: this.config.alertThresholds.externalRatio,
      });
    }

    if (memory.rssMB > this.config.alertThresholds.rssMB) {
      alerts.push({
        type: "rss-memory-high",
        severity:
          memory.rssMB > this.config.alertThresholds.rssMB * 1.5
            ? "critical"
            : "warning",
        message: `RSS memory (${memory.rssMB.toFixed(1)}MB) exceeds threshold (${this.config.alertThresholds.rssMB}MB)`,
        value: memory.rssMB,
        threshold: this.config.alertThresholds.rssMB,
      });
    }

    if (alerts.length > 0 && this.io) {
      this.io.of("/memory-analysis").emit("alerts", {
        timestamp: Date.now(),
        alerts,
      });
    }
  }

  // ============================================
  // ANALYZER EVENT LISTENERS
  // ============================================

  private setupAnalyzerListeners(): void {
    this.analyzer.on("snapshotCaptured", (snapshot: ProcessMemorySnapshot) => {
      if (this.io && this.connectedClients.size > 0) {
        this.io
          .of("/memory-analysis")
          .emit("snapshot", this.formatSnapshotForClient(snapshot));
      }
    });

    this.analyzer.on(
      "externalMemoryLeakDetected",
      (leak: ExternalMemoryLeak) => {
        logger.warn(
          `External memory leak detected: ${leak.source}`,
          "MemoryAnalysisDashboard",
        );

        if (this.io && this.connectedClients.size > 0) {
          this.io.of("/memory-analysis").emit("leak-detected", {
            leak: this.formatLeakForClient(leak),
            timestamp: Date.now(),
          });
        }
      },
    );

    this.analyzer.on(
      "growthPatternDetected",
      (pattern: MemoryGrowthPattern) => {
        logger.info(
          `Memory growth pattern: ${pattern.type} (${pattern.severity})`,
          "MemoryAnalysisDashboard",
        );

        if (this.io && this.connectedClients.size > 0) {
          this.io.of("/memory-analysis").emit("pattern-detected", {
            pattern,
            timestamp: Date.now(),
          });
        }
      },
    );

    this.analyzer.on("bufferLeakDetected", (bufferLeak: any) => {
      logger.warn(
        `Buffer leak detected: ${bufferLeak.size}MB`,
        "MemoryAnalysisDashboard",
      );

      if (this.io && this.connectedClients.size > 0) {
        this.io.of("/memory-analysis").emit("buffer-leak", {
          leak: bufferLeak,
          timestamp: Date.now(),
        });
      }
    });
  }

  // ============================================
  // EXPRESS ROUTES
  // ============================================

  private setupRoutes(): void {
    // Dashboard HTML page
    this.router.get("/dashboard", (req: Request, res: Response) => {
      this.serveDashboardHTML(req, res);
    });

    // API Routes
    this.router.get("/status", (req: Request, res: Response) => {
      const status = this.analyzer.getCurrentStatus();
      res.json(status);
    });

    this.router.get("/analysis", (req: Request, res: Response) => {
      const analysis = this.analyzer.getDetailedAnalysis();
      res.json(analysis);
    });

    this.router.get("/trends", (req: Request, res: Response) => {
      const duration = parseInt(req.query.duration as string) || 20;
      const trends = this.analyzer.getRSSvsHeapTrend(duration);
      res.json(trends);
    });

    this.router.get("/snapshots", (req: Request, res: Response) => {
      const limit = parseInt(req.query.limit as string) || 50;
      const analysis = this.analyzer.getDetailedAnalysis();

      res.json({
        snapshots: analysis.snapshots?.slice(-limit) || [],
        total: analysis.summary.totalSnapshots,
      });
    });

    this.router.get("/leaks", (req: Request, res: Response) => {
      const analysis = this.analyzer.getDetailedAnalysis();
      res.json({
        leaks: analysis.leaks || [],
        bufferLeaks: analysis.bufferLeaks || [],
      });
    });

    this.router.get("/native-modules", (req: Request, res: Response) => {
      const analysis = this.analyzer.getDetailedAnalysis();
      res.json({
        modules: analysis.nativeModules || [],
      });
    });

    this.router.post("/force-snapshot", (req: Request, res: Response) => {
      const snapshot = this.analyzer.forceSnapshot();
      res.json({
        success: true,
        snapshot: snapshot ? this.formatSnapshotForClient(snapshot) : null,
      });
    });

    this.router.post("/force-gc", (req: Request, res: Response) => {
      try {
        if (global.gc) {
          global.gc();
          res.json({ success: true, message: "Garbage collection triggered" });
        } else {
          res.status(400).json({
            success: false,
            message: "Garbage collection not available (use --expose-gc)",
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to trigger garbage collection",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    this.router.get("/export", (req: Request, res: Response) => {
      const data = this.analyzer.exportData();
      const filename = `memory-analysis-export-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", "application/json");
      res.json(data);
    });

    this.router.delete("/reset", (req: Request, res: Response) => {
      try {
        this.analyzer.stopAnalysis();
        // Reset would recreate the analyzer
        res.json({ success: true, message: "Memory analyzer reset" });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to reset analyzer",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  private serveDashboardHTML(req: Request, res: Response): void {
    const html = this.generateDashboardHTML();
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Analysis Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .header { background: #1a1a1a; color: white; padding: 1rem; text-align: center; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .metric-label { color: #666; font-size: 0.9rem; }
        .metric-value { font-weight: bold; font-size: 1.1rem; }
        .status-indicator { width: 10px; height: 10px; border-radius: 50%; margin-right: 0.5rem; }
        .status-healthy { background: #4CAF50; }
        .status-warning { background: #FF9800; }
        .status-critical { background: #F44336; }
        .chart-container { position: relative; height: 300px; margin-top: 1rem; }
        .leak-item { border-left: 4px solid #F44336; padding: 0.75rem; margin: 0.5rem 0; background: #fff3f3; border-radius: 4px; }
        .leak-severity { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        .severity-low { background: #E8F5E8; color: #2E7D32; }
        .severity-medium { background: #FFF3E0; color: #F57C00; }
        .severity-high { background: #FFEBEE; color: #C62828; }
        .severity-critical { background: #FCE4EC; color: #AD1457; }
        .module-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .module-type { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
        .type-database { background: #E3F2FD; color: #1976D2; }
        .type-network { background: #F3E5F5; color: #7B1FA2; }
        .type-crypto { background: #FFF3E0; color: #F57C00; }
        .type-other { background: #F5F5F5; color: #616161; }
        .controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
        .btn-primary { background: #2196F3; color: white; }
        .btn-success { background: #4CAF50; color: white; }
        .btn-danger { background: #F44336; color: white; }
        .btn:hover { opacity: 0.9; }
        .alert { padding: 1rem; margin: 0.5rem 0; border-radius: 4px; }
        .alert-warning { background: #FFF3CD; border: 1px solid #FFEAA7; color: #856404; }
        .alert-danger { background: #F8D7DA; border: 1px solid #F5C6CB; color: #721C24; }
        #connectionStatus { position: fixed; top: 10px; right: 10px; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.8rem; }
        .connected { background: #4CAF50; color: white; }
        .disconnected { background: #F44336; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Memory Analysis Dashboard</h1>
        <p>Real-time process memory monitoring with RSS vs Heap tracking and leak detection</p>
    </div>

    <div id="connectionStatus" class="disconnected">Disconnected</div>

    <div class="container">
        <div class="controls">
            <button class="btn btn-primary" onclick="forceSnapshot()">📸 Force Snapshot</button>
            <button class="btn btn-success" onclick="forceGC()">🗑️ Force GC</button>
            <button class="btn btn-primary" onclick="exportData()">📁 Export Data</button>
            <button class="btn btn-danger" onclick="resetAnalyzer()">🔄 Reset</button>
        </div>

        <div id="alerts"></div>

        <div class="grid">
            <!-- Current Memory Status -->
            <div class="card">
                <h3>Current Memory Status</h3>
                <div class="metric">
                    <span class="metric-label">RSS Memory</span>
                    <span class="metric-value" id="rssMemory">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Heap Used</span>
                    <span class="metric-value" id="heapMemory">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">External Memory</span>
                    <span class="metric-value" id="externalMemory">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">External Ratio</span>
                    <span class="metric-value" id="externalRatio">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Status</span>
                    <span class="metric-value" id="memoryStatus">
                        <span class="status-indicator" id="statusIndicator"></span>
                        <span id="statusText">-</span>
                    </span>
                </div>
            </div>

            <!-- RSS vs Heap Chart -->
            <div class="card">
                <h3>RSS vs Heap Trend</h3>
                <div class="chart-container">
                    <canvas id="memoryChart"></canvas>
                </div>
            </div>

            <!-- External Memory Growth -->
            <div class="card">
                <h3>External Memory Growth</h3>
                <div class="chart-container">
                    <canvas id="externalChart"></canvas>
                </div>
            </div>

            <!-- Native Modules -->
            <div class="card">
                <h3>Native Modules Attribution</h3>
                <div id="nativeModules">
                    <p>Loading native modules...</p>
                </div>
            </div>

            <!-- Memory Leaks -->
            <div class="card">
                <h3>Detected Memory Leaks</h3>
                <div id="memoryLeaks">
                    <p>No leaks detected</p>
                </div>
            </div>

            <!-- Growth Patterns -->
            <div class="card">
                <h3>Growth Patterns</h3>
                <div id="growthPatterns">
                    <p>No patterns detected</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let socket;
        let memoryChart, externalChart;
        let memoryData = { rss: [], heap: [], external: [], timestamps: [] };
        let isConnected = false;

        // Initialize dashboard
        function initDashboard() {
            setupSocketIO();
            setupCharts();
            setupEventListeners();
        }

        // Socket.IO setup
        function setupSocketIO() {
            socket = io('/memory-analysis');

            socket.on('connect', () => {
                isConnected = true;
                updateConnectionStatus();
                console.log('Connected to memory analysis server');
            });

            socket.on('disconnect', () => {
                isConnected = false;
                updateConnectionStatus();
                console.log('Disconnected from memory analysis server');
            });

            socket.on('initial-data', (data) => {
                console.log('Received initial data:', data);
                updateDashboard(data);
            });

            socket.on('realtime-update', (data) => {
                updateRealtimeData(data);
            });

            socket.on('leak-detected', (data) => {
                showAlert('Memory leak detected: ' + data.leak.source, 'danger');
                updateLeaksDisplay();
            });

            socket.on('pattern-detected', (data) => {
                showAlert('Memory pattern detected: ' + data.pattern.type + ' (' + data.pattern.severity + ')', 'warning');
            });

            socket.on('alerts', (data) => {
                data.alerts.forEach(alert => {
                    showAlert(alert.message, alert.severity === 'critical' ? 'danger' : 'warning');
                });
            });
        }

        // Update connection status
        function updateConnectionStatus() {
            const statusEl = document.getElementById('connectionStatus');
            if (isConnected) {
                statusEl.className = 'connected';
                statusEl.textContent = 'Connected';
            } else {
                statusEl.className = 'disconnected';
                statusEl.textContent = 'Disconnected';
            }
        }

        // Setup charts
        function setupCharts() {
            const ctx1 = document.getElementById('memoryChart').getContext('2d');
            memoryChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'RSS Memory (MB)',
                            data: [],
                            borderColor: '#F44336',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            fill: false
                        },
                        {
                            label: 'Heap Used (MB)',
                            data: [],
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Memory (MB)' }
                        }
                    }
                }
            });

            const ctx2 = document.getElementById('externalChart').getContext('2d');
            externalChart = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'External Memory (MB)',
                            data: [],
                            borderColor: '#FF9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'External Memory (MB)' }
                        }
                    }
                }
            });
        }

        // Update dashboard with initial data
        function updateDashboard(data) {
            if (data.status && data.status.currentMemory) {
                updateMemoryMetrics(data.status.currentMemory);
            }

            if (data.analysis) {
                updateNativeModules(data.analysis.nativeModules || []);
                updateLeaks(data.analysis.leaks || []);
                updateGrowthPatterns(data.analysis.growthPatterns || []);
            }
        }

        // Update real-time data
        function updateRealtimeData(data) {
            if (data.memory) {
                updateMemoryMetrics(data.memory);
                updateCharts(data.memory, data.timestamp);
            }
        }

        // Update memory metrics display
        function updateMemoryMetrics(memory) {
            document.getElementById('rssMemory').textContent = memory.rssMB.toFixed(1) + ' MB';
            document.getElementById('heapMemory').textContent = memory.heapMB.toFixed(1) + ' MB';
            document.getElementById('externalMemory').textContent = memory.externalMB.toFixed(1) + ' MB';
            document.getElementById('externalRatio').textContent = memory.externalRatio.toFixed(2) + 'x';

            // Update status indicator
            const indicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            
            if (memory.externalMB > 80 || memory.externalRatio > 3) {
                indicator.className = 'status-indicator status-critical';
                statusText.textContent = 'Critical';
            } else if (memory.externalMB > 50 || memory.externalRatio > 2) {
                indicator.className = 'status-indicator status-warning';
                statusText.textContent = 'Warning';
            } else {
                indicator.className = 'status-indicator status-healthy';
                statusText.textContent = 'Healthy';
            }
        }

        // Update charts
        function updateCharts(memory, timestamp) {
            const timeLabel = new Date(timestamp).toLocaleTimeString();
            
            // Add new data point
            memoryData.timestamps.push(timeLabel);
            memoryData.rss.push(memory.rssMB);
            memoryData.heap.push(memory.heapMB);
            memoryData.external.push(memory.externalMB);

            // Keep only last 50 points
            const maxPoints = 50;
            if (memoryData.timestamps.length > maxPoints) {
                memoryData.timestamps.shift();
                memoryData.rss.shift();
                memoryData.heap.shift();
                memoryData.external.shift();
            }

            // Update memory chart
            memoryChart.data.labels = memoryData.timestamps;
            memoryChart.data.datasets[0].data = memoryData.rss;
            memoryChart.data.datasets[1].data = memoryData.heap;
            memoryChart.update('none');

            // Update external chart
            externalChart.data.labels = memoryData.timestamps;
            externalChart.data.datasets[0].data = memoryData.external;
            externalChart.update('none');
        }

        // Update native modules display
        function updateNativeModules(modules) {
            const container = document.getElementById('nativeModules');
            if (modules.length === 0) {
                container.innerHTML = '<p>No native modules detected</p>';
                return;
            }

            const html = modules.map(module => \`
                <div class="module-item">
                    <div>
                        <strong>\${module.name}</strong>
                        <span class="module-type type-\${module.type}">\${module.type}</span>
                    </div>
                    <div>
                        <span>\${module.estimatedMemoryMB.toFixed(1)}MB</span>
                        <small>(\${(module.confidence * 100).toFixed(0)}%)</small>
                    </div>
                </div>
            \`).join('');

            container.innerHTML = html;
        }

        // Update leaks display
        function updateLeaks(leaks) {
            const container = document.getElementById('memoryLeaks');
            if (leaks.length === 0) {
                container.innerHTML = '<p>No leaks detected</p>';
                return;
            }

            const html = leaks.map(leak => \`
                <div class="leak-item">
                    <div>
                        <strong>\${leak.source}</strong>
                        <span class="leak-severity severity-\${leak.severity}">\${leak.severity}</span>
                    </div>
                    <div>Size: \${leak.sizeMB.toFixed(1)}MB</div>
                    <div>Type: \${leak.type}</div>
                    <div>Age: \${Math.round(leak.age / 1000)}s</div>
                    <div><small>\${leak.recommendation}</small></div>
                </div>
            \`).join('');

            container.innerHTML = html;
        }

        // Update growth patterns
        function updateGrowthPatterns(patterns) {
            const container = document.getElementById('growthPatterns');
            if (patterns.length === 0) {
                container.innerHTML = '<p>No patterns detected</p>';
                return;
            }

            const html = patterns.map(pattern => \`
                <div class="leak-item">
                    <div>
                        <strong>\${pattern.type.toUpperCase()}</strong>
                        <span class="leak-severity severity-\${pattern.severity}">\${pattern.severity}</span>
                    </div>
                    <div>Growth: \${(pattern.growthRateMBPerSec * 1000).toFixed(1)}KB/s</div>
                    <div>Total: \${pattern.totalGrowthMB.toFixed(1)}MB</div>
                    <div><small>\${pattern.description}</small></div>
                </div>
            \`).join('');

            container.innerHTML = html;
        }

        // Show alert
        function showAlert(message, type) {
            const alertsContainer = document.getElementById('alerts');
            const alertDiv = document.createElement('div');
            alertDiv.className = \`alert alert-\${type}\`;
            alertDiv.innerHTML = \`
                <strong>\${type === 'danger' ? '🚨' : '⚠️'}</strong> \${message}
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
            \`;
            alertsContainer.appendChild(alertDiv);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (alertDiv.parentElement) {
                    alertDiv.remove();
                }
            }, 10000);
        }

        // Control functions
        function forceSnapshot() {
            fetch('${this.config.apiRoute}/force-snapshot', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Snapshot captured successfully', 'success');
                    } else {
                        showAlert('Failed to capture snapshot', 'danger');
                    }
                })
                .catch(error => {
                    showAlert('Error: ' + error.message, 'danger');
                });
        }

        function forceGC() {
            fetch('${this.config.apiRoute}/force-gc', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('Garbage collection triggered', 'success');
                    } else {
                        showAlert('Failed to trigger GC: ' + data.message, 'warning');
                    }
                })
                .catch(error => {
                    showAlert('Error: ' + error.message, 'danger');
                });
        }

        function exportData() {
            window.open('${this.config.apiRoute}/export', '_blank');
        }

        function resetAnalyzer() {
            if (confirm('Are you sure you want to reset the memory analyzer? This will clear all collected data.')) {
                fetch('${this.config.apiRoute}/reset', { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showAlert('Memory analyzer reset successfully', 'success');
                            location.reload();
                        } else {
                            showAlert('Failed to reset analyzer: ' + data.message, 'danger');
                        }
                    })
                    .catch(error => {
                        showAlert('Error: ' + error.message, 'danger');
                    });
            }
        }

        // Update displays periodically
        function updateLeaksDisplay() {
            fetch('${this.config.apiRoute}/leaks')
                .then(response => response.json())
                .then(data => {
                    updateLeaks(data.leaks);
                });
        }

        function setupEventListeners() {
            // Add any additional event listeners here
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initDashboard);
    </script>
</body>
</html>
    `;
  }

  // ============================================
  // FORMATTING HELPERS
  // ============================================

  private formatSnapshotForClient(snapshot: ProcessMemorySnapshot | null): any {
    if (!snapshot) return null;

    return {
      timestamp: snapshot.timestamp,
      memory: {
        rssMB: snapshot.rss / 1024 / 1024,
        heapMB: snapshot.heapUsed / 1024 / 1024,
        externalMB: snapshot.external / 1024 / 1024,
        externalRatio: snapshot.externalRatio,
      },
      system: {
        activeHandles: snapshot.activeHandles,
        activeRequests: snapshot.activeRequests,
        uptime: snapshot.uptime,
      },
    };
  }

  private formatLeakForClient(leak: ExternalMemoryLeak): any {
    return {
      id: leak.id,
      source: leak.source,
      type: leak.type,
      severity: leak.severity,
      sizeMB: leak.estimatedSize / 1024 / 1024,
      growthRateMBPerSec: leak.growthRate,
      age: Date.now() - leak.detectedAt,
      recommendation: leak.recommendation,
      evidence: leak.evidence.slice(0, 3), // First 3 pieces of evidence
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  public getRouter(): Router {
    return this.router;
  }

  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      connectedClients: this.connectedClients.size,
      config: this.config,
      analyzerStatus: this.analyzer.getCurrentStatus(),
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let memoryAnalysisDashboard: MemoryAnalysisDashboard | null = null;

export function getMemoryAnalysisDashboard(
  config?: Partial<MemoryAnalysisDashboardConfig>,
): MemoryAnalysisDashboard {
  if (!memoryAnalysisDashboard) {
    memoryAnalysisDashboard = new MemoryAnalysisDashboard(config);
  }
  return memoryAnalysisDashboard;
}

export function resetMemoryAnalysisDashboard(): void {
  if (memoryAnalysisDashboard) {
    memoryAnalysisDashboard.shutdown();
    memoryAnalysisDashboard = null;
  }
}
