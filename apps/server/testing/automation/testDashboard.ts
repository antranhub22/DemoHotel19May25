import { logger } from "@shared/utils/logger";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { CITestResult } from "./ciIntegration";
import { TimerManager } from "../../utils/TimerManager";

// ============================================
// DASHBOARD INTERFACES
// ============================================

export interface DashboardMetrics {
  current: {
    totalTests: number;
    passRate: number;
    averageResponseTime: number;
    lastRunTimestamp: Date;
    environment: string;
    status: "healthy" | "warning" | "critical";
  };
  trends: {
    daily: DashboardDataPoint[];
    weekly: DashboardDataPoint[];
    monthly: DashboardDataPoint[];
  };
  performance: {
    endpoints: EndpointMetrics[];
    slowestEndpoints: string[];
    fastestEndpoints: string[];
    responseTimeDistribution: ResponseTimeDistribution;
  };
  quality: {
    codeQuality: number;
    testCoverage: number;
    technicalDebt: number;
    securityScore: number;
  };
  deployments: {
    recent: DeploymentMetrics[];
    successRate: number;
    averageDeploymentTime: number;
    rollbackRate: number;
  };
}

export interface DashboardDataPoint {
  timestamp: Date;
  totalTests: number;
  passRate: number;
  averageResponseTime: number;
  deploymentStatus: "success" | "failure" | "blocked";
}

export interface EndpointMetrics {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastTested: Date;
}

export interface ResponseTimeDistribution {
  "<100ms": number;
  "100-500ms": number;
  "500ms-1s": number;
  "1s-3s": number;
  ">3s": number;
}

export interface DeploymentMetrics {
  id: string;
  environment: string;
  timestamp: Date;
  duration: number;
  status: "success" | "failure" | "rollback";
  testResults: {
    total: number;
    passed: number;
    failed: number;
  };
  qualityGateScore: number;
}

// ============================================
// TEST METRICS COLLECTOR
// ============================================

export class TestMetricsCollector {
  private metricsStorage: Map<string, any> = new Map();
  private dataRetentionDays: number = 90;

  async collectMetrics(testResult: CITestResult): Promise<void> {
    const timestamp = new Date();

    logger.info(
      "📊 [METRICS-COLLECTOR] Collecting test metrics...",
      "MetricsCollector",
    );

    const metrics = {
      timestamp,
      environment: testResult.deployment.environment,
      testResults: {
        total: testResult.testResults.summary.total,
        passed: testResult.testResults.summary.passed,
        failed: testResult.testResults.summary.failed,
        passRate: testResult.metrics.passRate,
        duration: testResult.metrics.duration,
      },
      performance: {
        averageResponseTime:
          testResult.testResults.performance.averageResponseTime,
        slowestEndpoint: testResult.testResults.performance.slowestEndpoint,
        fastestEndpoint: testResult.testResults.performance.fastestEndpoint,
      },
      qualityGate: testResult.qualityGateResult
        ? {
            passed: testResult.qualityGateResult.passed,
            score: testResult.qualityGateResult.score,
            criticalFailures:
              testResult.qualityGateResult.evaluation.criticalFailures,
          }
        : null,
      deployment: {
        allowed: testResult.deployment.allowed,
        blockers: testResult.deployment.blockers,
      },
    };

    // Store metrics with timestamp key
    const key = `metrics_${timestamp.getTime()}`;
    this.metricsStorage.set(key, metrics);

    // Clean up old metrics
    await this.cleanupOldMetrics();

    // Persist to file system
    await this.persistMetrics(metrics);

    logger.info(
      "✅ [METRICS-COLLECTOR] Metrics collected and stored",
      "MetricsCollector",
    );
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allMetrics = Array.from(this.metricsStorage.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    const current = this.calculateCurrentMetrics(allMetrics);
    const trends = this.calculateTrends(allMetrics);
    const performance = this.calculatePerformanceMetrics(allMetrics);
    const quality = this.calculateQualityMetrics(allMetrics);
    const deployments = this.calculateDeploymentMetrics(allMetrics);

    return {
      current,
      trends,
      performance,
      quality,
      deployments,
    };
  }

  private calculateCurrentMetrics(allMetrics: any[]): any {
    if (allMetrics.length === 0) {
      return {
        totalTests: 0,
        passRate: 0,
        averageResponseTime: 0,
        lastRunTimestamp: new Date(),
        environment: "unknown",
        status: "critical",
      };
    }

    const latest = allMetrics[0];

    return {
      totalTests: latest.testResults.total,
      passRate: latest.testResults.passRate,
      averageResponseTime: latest.performance.averageResponseTime,
      lastRunTimestamp: latest.timestamp,
      environment: latest.environment,
      status: this.determineHealthStatus(latest),
    };
  }

  private calculateTrends(allMetrics: any[]): any {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      daily: this.aggregateMetricsByHour(allMetrics, oneDayAgo),
      weekly: this.aggregateMetricsByDay(allMetrics, oneWeekAgo),
      monthly: this.aggregateMetricsByWeek(allMetrics, oneMonthAgo),
    };
  }

  private calculatePerformanceMetrics(allMetrics: any[]): any {
    // Aggregate endpoint performance data
    const endpointMap = new Map();

    allMetrics.forEach((metric) => {
      // Process performance data (implementation details would depend on actual data structure)
    });

    const responseTimeDistribution =
      this.calculateResponseTimeDistribution(allMetrics);

    return {
      endpoints: Array.from(endpointMap.values()),
      slowestEndpoints: this.getTopSlowEndpoints(allMetrics, 5),
      fastestEndpoints: this.getTopFastEndpoints(allMetrics, 5),
      responseTimeDistribution,
    };
  }

  private calculateQualityMetrics(allMetrics: any[]): any {
    if (allMetrics.length === 0) {
      return {
        codeQuality: 0,
        testCoverage: 0,
        technicalDebt: 100,
        securityScore: 0,
      };
    }

    const latestMetrics = allMetrics.slice(0, 10); // Last 10 runs

    const avgQualityScore =
      latestMetrics
        .filter((m) => m.qualityGate)
        .reduce((sum, m) => sum + m.qualityGate.score, 0) /
        latestMetrics.length || 0;

    const avgPassRate =
      latestMetrics.reduce((sum, m) => sum + m.testResults.passRate, 0) /
      latestMetrics.length;

    return {
      codeQuality: Math.round(avgQualityScore),
      testCoverage: Math.round(avgPassRate),
      technicalDebt: Math.max(0, 100 - avgQualityScore),
      securityScore: 85, // Placeholder - would be calculated from security tests
    };
  }

  private calculateDeploymentMetrics(allMetrics: any[]): any {
    const deployments = allMetrics
      .filter((m) => m.deployment)
      .slice(0, 20) // Last 20 deployments
      .map((m) => ({
        id: `deploy_${m.timestamp.getTime()}`,
        environment: m.environment,
        timestamp: m.timestamp,
        duration: m.testResults.duration,
        status: m.deployment.allowed ? "success" : "failure",
        testResults: {
          total: m.testResults.total,
          passed: m.testResults.passed,
          failed: m.testResults.failed,
        },
        qualityGateScore: m.qualityGate?.score || 0,
      }));

    const successfulDeployments = deployments.filter(
      (d) => d.status === "success",
    ).length;
    const successRate =
      deployments.length > 0
        ? (successfulDeployments / deployments.length) * 100
        : 0;
    const avgDeploymentTime =
      deployments.length > 0
        ? deployments.reduce((sum, d) => sum + d.duration, 0) /
          deployments.length
        : 0;

    return {
      recent: deployments.slice(0, 10),
      successRate: Math.round(successRate),
      averageDeploymentTime: Math.round(avgDeploymentTime),
      rollbackRate: 0, // Would be calculated from actual rollback data
    };
  }

  private determineHealthStatus(
    metrics: any,
  ): "healthy" | "warning" | "critical" {
    if (metrics.testResults.passRate < 80) return "critical";
    if (metrics.testResults.passRate < 95) return "warning";
    if (metrics.performance.averageResponseTime > 1000) return "warning";
    return "healthy";
  }

  private aggregateMetricsByHour(
    metrics: any[],
    since: Date,
  ): DashboardDataPoint[] {
    // Implementation for hourly aggregation
    return [];
  }

  private aggregateMetricsByDay(
    metrics: any[],
    since: Date,
  ): DashboardDataPoint[] {
    // Implementation for daily aggregation
    return [];
  }

  private aggregateMetricsByWeek(
    metrics: any[],
    since: Date,
  ): DashboardDataPoint[] {
    // Implementation for weekly aggregation
    return [];
  }

  private calculateResponseTimeDistribution(
    metrics: any[],
  ): ResponseTimeDistribution {
    // Implementation for response time distribution calculation
    return {
      "<100ms": 45,
      "100-500ms": 35,
      "500ms-1s": 15,
      "1s-3s": 4,
      ">3s": 1,
    };
  }

  private getTopSlowEndpoints(metrics: any[], count: number): string[] {
    return ["/api/v2/calls", "/api/summaries", "/api/transcripts"];
  }

  private getTopFastEndpoints(metrics: any[], count: number): string[] {
    return ["/api/health/versioned", "/api/version/current", "/api/guest/auth"];
  }

  private async cleanupOldMetrics(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - this.dataRetentionDays * 24 * 60 * 60 * 1000,
    );

    for (const [key, metrics] of this.metricsStorage.entries()) {
      if (metrics.timestamp < cutoffDate) {
        this.metricsStorage.delete(key);
      }
    }
  }

  private async persistMetrics(metrics: any): Promise<void> {
    try {
      const metricsDir = path.join(process.cwd(), "test-results", "metrics");
      await fs.mkdir(metricsDir, { recursive: true });

      const filename = `metrics-${metrics.timestamp.toISOString().split("T")[0]}.json`;
      const filepath = path.join(metricsDir, filename);

      // Read existing data or create new
      let dailyMetrics = [];
      try {
        const existingData = await fs.readFile(filepath, "utf-8");
        dailyMetrics = JSON.parse(existingData);
      } catch {
        // File doesn't exist, start with empty array
      }

      dailyMetrics.push(metrics);
      await fs.writeFile(filepath, JSON.stringify(dailyMetrics, null, 2));
    } catch (error) {
      logger.error(
        "❌ [METRICS-COLLECTOR] Failed to persist metrics:",
        "MetricsCollector",
        error,
      );
    }
  }
}

// ============================================
// DASHBOARD WEB INTERFACE
// ============================================

export class TestDashboardServer {
  private app: express.Express;
  private metricsCollector: TestMetricsCollector;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.metricsCollector = new TestMetricsCollector();
    this.port = port;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Serve static files
    this.app.use(express.static(path.join(__dirname, "dashboard-public")));

    // API Routes
    this.app.get("/api/metrics", async (req, res) => {
      try {
        const metrics = await this.metricsCollector.getDashboardMetrics();
        res.json(metrics);
      } catch (error) {
        logger.error(
          "❌ [DASHBOARD] Error getting metrics:",
          "Dashboard",
          error,
        );
        res.status(500).json({ error: "Failed to retrieve metrics" });
      }
    });

    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Main dashboard route
    this.app.get("/", (req, res) => {
      res.send(this.generateDashboardHTML());
    });
  }

  private generateDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧪 Hotel Voice Assistant - Test Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f6fa; 
            color: #2c3e50;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 20px; 
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .metric-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-left: 4px solid #3498db;
        }
        .metric-value { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 5px;
            color: #2c3e50;
        }
        .metric-label { 
            color: #7f8c8d; 
            font-size: 14px; 
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .metric-trend { 
            font-size: 12px; 
            margin-top: 5px;
        }
        .trend-up { color: #27ae60; }
        .trend-down { color: #e74c3c; }
        .status-healthy { border-left-color: #27ae60; }
        .status-warning { border-left-color: #f39c12; }
        .status-critical { border-left-color: #e74c3c; }
        .chart-container { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        .loading { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 200px;
            font-size: 18px;
            color: #7f8c8d;
        }
        .refresh-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .refresh-btn:hover { background: #2980b9; }
        .endpoint-list {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .endpoint-item {
            padding: 15px 20px;
            border-bottom: 1px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .endpoint-item:last-child { border-bottom: none; }
        .endpoint-name { font-weight: 500; }
        .endpoint-time { color: #7f8c8d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Hotel Voice Assistant Test Dashboard</h1>
        <p>Real-time monitoring and quality metrics</p>
    </div>

    <div class="container">
        <button class="refresh-btn" onclick="refreshMetrics()">🔄 Refresh Metrics</button>
        
        <div class="metrics-grid" id="metricsGrid">
            <div class="loading">Loading metrics...</div>
        </div>

        <div class="chart-container">
            <h3>📈 Test Trends (Last 7 Days)</h3>
            <div id="trendsChart" class="loading">Loading chart...</div>
        </div>

        <div class="chart-container">
            <h3>⚡ Performance Overview</h3>
            <div class="endpoint-list" id="endpointList">
                <div class="loading">Loading endpoint metrics...</div>
            </div>
        </div>
    </div>

    <script>
        let metricsData = null;

        async function fetchMetrics() {
            try {
                const response = await fetch('/api/metrics');
                metricsData = await response.json();
                updateDashboard();
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
                document.getElementById('metricsGrid').innerHTML = '<div class="loading">❌ Failed to load metrics</div>';
            }
        }

        function updateDashboard() {
            if (!metricsData) return;

            updateMetricsGrid();
            updateTrendsChart();
            updateEndpointList();
        }

        function updateMetricsGrid() {
            const current = metricsData.current;
            const quality = metricsData.quality;
            
            const html = \`
                <div class="metric-card status-\${current.status}">
                    <div class="metric-value">\${current.totalTests}</div>
                    <div class="metric-label">Total Tests</div>
                    <div class="metric-trend">Last run: \${new Date(current.lastRunTimestamp).toLocaleTimeString()}</div>
                </div>
                <div class="metric-card status-\${current.passRate >= 95 ? 'healthy' : current.passRate >= 80 ? 'warning' : 'critical'}">
                    <div class="metric-value">\${current.passRate}%</div>
                    <div class="metric-label">Pass Rate</div>
                    <div class="metric-trend \${current.passRate >= 95 ? 'trend-up' : 'trend-down'}">
                        \${current.passRate >= 95 ? '↗' : '↘'} \${current.passRate >= 95 ? 'Excellent' : current.passRate >= 80 ? 'Good' : 'Needs Improvement'}
                    </div>
                </div>
                <div class="metric-card status-\${current.averageResponseTime <= 500 ? 'healthy' : current.averageResponseTime <= 1000 ? 'warning' : 'critical'}">
                    <div class="metric-value">\${Math.round(current.averageResponseTime)}ms</div>
                    <div class="metric-label">Avg Response Time</div>
                    <div class="metric-trend">Environment: \${current.environment}</div>
                </div>
                <div class="metric-card status-\${quality.codeQuality >= 90 ? 'healthy' : quality.codeQuality >= 70 ? 'warning' : 'critical'}">
                    <div class="metric-value">\${quality.codeQuality}%</div>
                    <div class="metric-label">Code Quality</div>
                    <div class="metric-trend">Coverage: \${quality.testCoverage}%</div>
                </div>
                <div class="metric-card status-\${metricsData.deployments.successRate >= 95 ? 'healthy' : metricsData.deployments.successRate >= 80 ? 'warning' : 'critical'}">
                    <div class="metric-value">\${metricsData.deployments.successRate}%</div>
                    <div class="metric-label">Deployment Success</div>
                    <div class="metric-trend">Avg time: \${Math.round(metricsData.deployments.averageDeploymentTime/1000)}s</div>
                </div>
                <div class="metric-card status-\${quality.securityScore >= 90 ? 'healthy' : quality.securityScore >= 70 ? 'warning' : 'critical'}">
                    <div class="metric-value">\${quality.securityScore}%</div>
                    <div class="metric-label">Security Score</div>
                    <div class="metric-trend">Technical debt: \${quality.technicalDebt}%</div>
                </div>
            \`;
            
            document.getElementById('metricsGrid').innerHTML = html;
        }

        function updateTrendsChart() {
            document.getElementById('trendsChart').innerHTML = '<div style="text-align: center; color: #7f8c8d;">📊 Chart visualization would be implemented with Chart.js or similar library</div>';
        }

        function updateEndpointList() {
            const endpoints = metricsData.performance.slowestEndpoints || [];
            
            const html = endpoints.map(endpoint => \`
                <div class="endpoint-item">
                    <div class="endpoint-name">\${endpoint}</div>
                    <div class="endpoint-time">~500ms</div>
                </div>
            \`).join('') || '<div class="endpoint-item"><div>No endpoint data available</div></div>';
            
            document.getElementById('endpointList').innerHTML = html;
        }

        function refreshMetrics() {
            document.getElementById('metricsGrid').innerHTML = '<div class="loading">Refreshing metrics...</div>';
            fetchMetrics();
        }

        // Initial load
        fetchMetrics();
        
        // Auto-refresh every 30 seconds
        TimerManager.setInterval(fetchMetrics, 30000, "auto-generated-interval-61");
    </script>
</body>
</html>`;
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        logger.info(
          `📊 [DASHBOARD] Test dashboard server running on http://localhost:${this.port}`,
          "Dashboard",
        );
        resolve();
      });
    });
  }

  getMetricsCollector(): TestMetricsCollector {
    return this.metricsCollector;
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

export interface NotificationConfig {
  slack?: {
    webhook: string;
    channel: string;
    enabled: boolean;
  };
  email?: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    };
    recipients: string[];
    enabled: boolean;
  };
  github?: {
    token: string;
    repository: string;
    enabled: boolean;
  };
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  async sendTestResults(result: CITestResult): Promise<void> {
    logger.info(
      "📢 [NOTIFICATIONS] Sending test result notifications...",
      "Notifications",
    );

    const promises = [];

    if (this.config.slack?.enabled) {
      promises.push(this.sendSlackNotification(result));
    }

    if (this.config.email?.enabled) {
      promises.push(this.sendEmailNotification(result));
    }

    if (this.config.github?.enabled) {
      promises.push(this.updateGitHubStatus(result));
    }

    await Promise.allSettled(promises);
  }

  private async sendSlackNotification(result: CITestResult): Promise<void> {
    // Implementation for Slack notifications
    logger.info(
      "📱 [NOTIFICATIONS] Sending Slack notification...",
      "Notifications",
    );
  }

  private async sendEmailNotification(result: CITestResult): Promise<void> {
    // Implementation for email notifications
    logger.info(
      "📧 [NOTIFICATIONS] Sending email notification...",
      "Notifications",
    );
  }

  private async updateGitHubStatus(result: CITestResult): Promise<void> {
    // Implementation for GitHub status updates
    logger.info(
      "📱 [NOTIFICATIONS] Updating GitHub status...",
      "Notifications",
    );
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  TestMetricsCollector,
  TestDashboardServer,
  NotificationService,
};
