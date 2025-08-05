// =============================================================================
// Hotel Management SaaS Platform - Production Monitoring System
// Comprehensive monitoring with APM, infrastructure, and business metrics
// =============================================================================

import { EventEmitter } from "events";
import { promises as fs } from "fs";
import * as os from "os";

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Monitoring Configuration Interface                                      │
// └─────────────────────────────────────────────────────────────────────────┘

export interface MonitoringConfig {
  enabled: boolean;
  environment: string;
  serviceName: string;
  version: string;

  metrics: {
    collection: {
      interval: number;
      retention: number;
      batchSize: number;
    };
    thresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      responseTime: number;
      errorRate: number;
      requestRate: number;
    };
  };

  apm: {
    enabled: boolean;
    serviceName: string;
    environment: string;
    serverUrl?: string;
    secretToken?: string;
    captureBody: string;
    captureHeaders: boolean;
    logLevel: string;
  };

  infrastructure: {
    collectSystemMetrics: boolean;
    collectDatabaseMetrics: boolean;
    collectRedisMetrics: boolean;
    collectCustomMetrics: boolean;
    prometheusEndpoint: string;
  };

  business: {
    trackUserSessions: boolean;
    trackBookings: boolean;
    trackRequests: boolean;
    trackRevenue: boolean;
    trackErrors: boolean;
    customEvents: string[];
  };

  alerting: {
    enabled: boolean;
    channels: {
      slack?: {
        webhook: string;
        channel: string;
        username: string;
      };
      email?: {
        smtp: string;
        from: string;
        to: string[];
      };
      webhook?: {
        url: string;
        method: string;
        headers: Record<string, string>;
      };
    };
    rules: AlertRule[];
  };

  dashboards: {
    grafana?: {
      url: string;
      apiKey: string;
      orgId: number;
    };
    custom: boolean;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: "gt" | "lt" | "eq" | "ne";
  threshold: number;
  duration: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  channels: string[];
}

export interface MetricData {
  timestamp: number;
  name: string;
  value: number;
  tags: Record<string, string>;
  type: "counter" | "gauge" | "histogram" | "summary";
}

export interface BusinessEvent {
  timestamp: number;
  event: string;
  userId?: string;
  tenantId?: string;
  metadata: Record<string, any>;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  metadata: Record<string, any>;
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Core Monitoring System                                                 │
// └─────────────────────────────────────────────────────────────────────────┘

export class ProductionMonitoringSystem extends EventEmitter {
  private config: MonitoringConfig;
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private isRunning: boolean = false;
  private intervals: NodeJS.Timeout[] = [];

  // APM Integration
  private apmAgent: any;

  // System metrics
  private systemMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkStats: any;
    processStats: any;
  } = {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkStats: {},
    processStats: {},
  };

  // Business metrics
  private businessMetrics: {
    activeSessions: number;
    bookingsToday: number;
    requestsToday: number;
    revenueToday: number;
    errorsToday: number;
  } = {
    activeSessions: 0,
    bookingsToday: 0,
    requestsToday: 0,
    revenueToday: 0,
    errorsToday: 0,
  };

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;

    if (config.apm.enabled) {
      this.initializeAPM();
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ APM Integration                                                         │
  // └─────────────────────────────────────────────────────────────────────────┘

  private initializeAPM(): void {
    try {
      // Initialize Elastic APM (or similar)
      const apm = require("elastic-apm-node");

      this.apmAgent = apm.start({
        serviceName: this.config.apm.serviceName,
        environment: this.config.apm.environment,
        serverUrl: this.config.apm.serverUrl,
        secretToken: this.config.apm.secretToken,
        captureBody: this.config.apm.captureBody,
        captureHeaders: this.config.apm.captureHeaders,
        logLevel: this.config.apm.logLevel,
        active: true,
        instrument: true,
        captureExceptions: true,
        captureSpanStackTraces: true,
      });

      console.log(
        `APM initialized for service: ${this.config.apm.serviceName}`,
      );
    } catch (error) {
      console.warn("APM initialization failed:", error.message);
    }
  }

  public createTransaction(name: string, type: string): any {
    if (this.apmAgent) {
      return this.apmAgent.startTransaction(name, type);
    }
    return null;
  }

  public createSpan(name: string, type: string): any {
    if (this.apmAgent) {
      return this.apmAgent.startSpan(name, type);
    }
    return null;
  }

  public captureError(error: Error, metadata?: Record<string, any>): void {
    if (this.apmAgent) {
      this.apmAgent.captureError(error, metadata);
    }
    this.recordBusinessEvent("error", undefined, undefined, {
      error: error.message,
      ...metadata,
    });
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ System Metrics Collection                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  private async collectSystemMetrics(): Promise<void> {
    try {
      // CPU Usage
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;

      cpus.forEach((cpu) => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
      });

      this.systemMetrics.cpuUsage = 100 - (100 * totalIdle) / totalTick;

      // Memory Usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      this.systemMetrics.memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

      // Process Memory
      const memUsage = process.memoryUsage();
      this.systemMetrics.processStats = {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      };

      // Disk Usage (simplified)
      this.systemMetrics.diskUsage = await this.getDiskUsage();

      // Record metrics
      this.recordMetric("system_cpu_usage", this.systemMetrics.cpuUsage, {
        type: "system",
      });
      this.recordMetric("system_memory_usage", this.systemMetrics.memoryUsage, {
        type: "system",
      });
      this.recordMetric("process_memory_rss", memUsage.rss, {
        type: "process",
      });
      this.recordMetric("process_memory_heap_used", memUsage.heapUsed, {
        type: "process",
      });
    } catch (error) {
      console.error("Error collecting system metrics:", error);
    }
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const stats = await fs.stat("/");
      // This is a simplified approach - in production, use proper disk monitoring
      return 50; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Application Metrics Collection                                         │
  // └─────────────────────────────────────────────────────────────────────────┘

  public recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
    type: MetricData["type"] = "gauge",
  ): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      name,
      value,
      tags: {
        service: this.config.serviceName,
        environment: this.config.environment,
        version: this.config.version,
        ...tags,
      },
      type,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);

    // Maintain retention limit
    const retentionLimit = this.config.metrics.collection.retention;
    if (metricHistory.length > retentionLimit) {
      metricHistory.splice(0, metricHistory.length - retentionLimit);
    }

    // Check alert rules
    this.checkAlertRules(name, value, tags);

    // Emit metric event
    this.emit("metric", metric);
  }

  public recordRequestMetrics(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
  ): void {
    const tags = { method, path, status: statusCode.toString() };

    this.recordMetric("http_requests_total", 1, tags, "counter");
    this.recordMetric(
      "http_request_duration_ms",
      responseTime,
      tags,
      "histogram",
    );

    if (statusCode >= 400) {
      this.recordMetric("http_request_errors_total", 1, tags, "counter");
    }
  }

  public recordDatabaseMetrics(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ): void {
    const tags = { operation, table, success: success.toString() };

    this.recordMetric("database_operations_total", 1, tags, "counter");
    this.recordMetric(
      "database_operation_duration_ms",
      duration,
      tags,
      "histogram",
    );

    if (!success) {
      this.recordMetric("database_errors_total", 1, tags, "counter");
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Business Metrics Tracking                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  public recordBusinessEvent(
    event: string,
    userId?: string,
    tenantId?: string,
    metadata: Record<string, any> = {},
  ): void {
    const businessEvent: BusinessEvent = {
      timestamp: Date.now(),
      event,
      userId,
      tenantId,
      metadata,
    };

    // Update business metrics
    this.updateBusinessMetrics(event, metadata);

    // Record as metric
    this.recordMetric(
      `business_event_${event}`,
      1,
      {
        event,
        tenant: tenantId || "unknown",
        user: userId || "anonymous",
      },
      "counter",
    );

    // Emit business event
    this.emit("businessEvent", businessEvent);
  }

  private updateBusinessMetrics(
    event: string,
    metadata: Record<string, any>,
  ): void {
    switch (event) {
      case "user_session_start":
        this.businessMetrics.activeSessions++;
        break;
      case "user_session_end":
        this.businessMetrics.activeSessions = Math.max(
          0,
          this.businessMetrics.activeSessions - 1,
        );
        break;
      case "booking_created":
        this.businessMetrics.bookingsToday++;
        break;
      case "request_created":
        this.businessMetrics.requestsToday++;
        break;
      case "payment_processed":
        if (metadata.amount) {
          this.businessMetrics.revenueToday += metadata.amount;
        }
        break;
      case "error":
        this.businessMetrics.errorsToday++;
        break;
    }

    // Record updated business metrics
    this.recordMetric(
      "business_active_sessions",
      this.businessMetrics.activeSessions,
    );
    this.recordMetric(
      "business_bookings_today",
      this.businessMetrics.bookingsToday,
    );
    this.recordMetric(
      "business_requests_today",
      this.businessMetrics.requestsToday,
    );
    this.recordMetric(
      "business_revenue_today",
      this.businessMetrics.revenueToday,
    );
    this.recordMetric(
      "business_errors_today",
      this.businessMetrics.errorsToday,
    );
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Alert Management                                                       │
  // └─────────────────────────────────────────────────────────────────────────┘

  private checkAlertRules(
    metricName: string,
    value: number,
    tags: Record<string, string>,
  ): void {
    if (!this.config.alerting.enabled) return;

    const relevantRules = this.config.alerting.rules.filter(
      (rule) => rule.enabled && rule.metric === metricName,
    );

    for (const rule of relevantRules) {
      const triggered = this.evaluateAlertCondition(rule, value);

      if (triggered) {
        const existingAlert = this.alerts.get(rule.id);

        if (!existingAlert || existingAlert.resolved) {
          // Create new alert
          const alert: Alert = {
            id: `${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `${rule.name}: ${metricName} ${rule.condition} ${rule.threshold} (current: ${value})`,
            timestamp: Date.now(),
            resolved: false,
            metadata: { metricName, value, threshold: rule.threshold, tags },
          };

          this.alerts.set(rule.id, alert);
          this.sendAlert(alert, rule);
          this.emit("alert", alert);
        }
      } else {
        // Check if alert should be resolved
        const existingAlert = this.alerts.get(rule.id);
        if (existingAlert && !existingAlert.resolved) {
          existingAlert.resolved = true;
          this.sendAlertResolution(existingAlert, rule);
          this.emit("alertResolved", existingAlert);
        }
      }
    }
  }

  private evaluateAlertCondition(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case "gt":
        return value > rule.threshold;
      case "lt":
        return value < rule.threshold;
      case "eq":
        return value === rule.threshold;
      case "ne":
        return value !== rule.threshold;
      default:
        return false;
    }
  }

  private async sendAlert(alert: Alert, rule: AlertRule): Promise<void> {
    for (const channel of rule.channels) {
      try {
        await this.sendToChannel(channel, alert, false);
      } catch (error) {
        console.error(`Failed to send alert to channel ${channel}:`, error);
      }
    }
  }

  private async sendAlertResolution(
    alert: Alert,
    rule: AlertRule,
  ): Promise<void> {
    for (const channel of rule.channels) {
      try {
        await this.sendToChannel(channel, alert, true);
      } catch (error) {
        console.error(
          `Failed to send alert resolution to channel ${channel}:`,
          error,
        );
      }
    }
  }

  private async sendToChannel(
    channel: string,
    alert: Alert,
    isResolution: boolean,
  ): Promise<void> {
    const channels = this.config.alerting.channels;

    const emoji = isResolution ? "✅" : this.getSeverityEmoji(alert.severity);
    const action = isResolution ? "RESOLVED" : "TRIGGERED";
    const message = `${emoji} **${action}** - ${alert.message}`;

    switch (channel) {
      case "slack":
        if (channels.slack) {
          await this.sendSlackAlert(channels.slack, message, alert);
        }
        break;
      case "email":
        if (channels.email) {
          await this.sendEmailAlert(channels.email, message, alert);
        }
        break;
      case "webhook":
        if (channels.webhook) {
          await this.sendWebhookAlert(channels.webhook, message, alert);
        }
        break;
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case "critical":
        return "🚨";
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "📊";
    }
  }

  private async sendSlackAlert(
    config: any,
    message: string,
    alert: Alert,
  ): Promise<void> {
    const payload = {
      channel: config.channel,
      username: config.username,
      text: message,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            { title: "Service", value: this.config.serviceName, short: true },
            {
              title: "Environment",
              value: this.config.environment,
              short: true,
            },
            {
              title: "Timestamp",
              value: new Date(alert.timestamp).toISOString(),
              short: true,
            },
            { title: "Alert ID", value: alert.id, short: true },
          ],
        },
      ],
    };

    const response = await fetch(config.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  private async sendEmailAlert(
    config: any,
    message: string,
    alert: Alert,
  ): Promise<void> {
    // Email implementation would go here
    console.log(`Email alert: ${message}`);
  }

  private async sendWebhookAlert(
    config: any,
    message: string,
    alert: Alert,
  ): Promise<void> {
    const payload = {
      alert,
      message,
      service: this.config.serviceName,
      environment: this.config.environment,
    };

    const response = await fetch(config.url, {
      method: config.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "#ff0000";
      case "high":
        return "#ff6600";
      case "medium":
        return "#ffcc00";
      case "low":
        return "#00ff00";
      default:
        return "#cccccc";
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Prometheus Metrics Export                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  public generatePrometheusMetrics(): string {
    let output = "";

    // System metrics
    output += `# HELP system_cpu_usage CPU usage percentage\n`;
    output += `# TYPE system_cpu_usage gauge\n`;
    output += `system_cpu_usage{service="${this.config.serviceName}",environment="${this.config.environment}"} ${this.systemMetrics.cpuUsage}\n\n`;

    output += `# HELP system_memory_usage Memory usage percentage\n`;
    output += `# TYPE system_memory_usage gauge\n`;
    output += `system_memory_usage{service="${this.config.serviceName}",environment="${this.config.environment}"} ${this.systemMetrics.memoryUsage}\n\n`;

    // Business metrics
    output += `# HELP business_active_sessions Number of active user sessions\n`;
    output += `# TYPE business_active_sessions gauge\n`;
    output += `business_active_sessions{service="${this.config.serviceName}",environment="${this.config.environment}"} ${this.businessMetrics.activeSessions}\n\n`;

    output += `# HELP business_bookings_today Number of bookings today\n`;
    output += `# TYPE business_bookings_today counter\n`;
    output += `business_bookings_today{service="${this.config.serviceName}",environment="${this.config.environment}"} ${this.businessMetrics.bookingsToday}\n\n`;

    // Application metrics
    for (const [metricName, metricData] of this.metrics.entries()) {
      if (metricData.length > 0) {
        const latest = metricData[metricData.length - 1];
        const tagString = Object.entries(latest.tags)
          .map(([key, value]) => `${key}="${value}"`)
          .join(",");

        output += `# HELP ${metricName} Application metric\n`;
        output += `# TYPE ${metricName} ${latest.type}\n`;
        output += `${metricName}{${tagString}} ${latest.value}\n\n`;
      }
    }

    return output;
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Dashboard Data                                                         │
  // └─────────────────────────────────────────────────────────────────────────┘

  public getDashboardData(): any {
    return {
      systemMetrics: this.systemMetrics,
      businessMetrics: this.businessMetrics,
      alerts: Array.from(this.alerts.values()).filter(
        (alert) => !alert.resolved,
      ),
      metrics: this.getRecentMetrics(),
      health: this.getHealthStatus(),
    };
  }

  private getRecentMetrics(): Record<string, MetricData[]> {
    const recent: Record<string, MetricData[]> = {};
    const cutoff = Date.now() - 60 * 60 * 1000; // Last hour

    for (const [name, data] of this.metrics.entries()) {
      recent[name] = data.filter((metric) => metric.timestamp > cutoff);
    }

    return recent;
  }

  private getHealthStatus(): any {
    const thresholds = this.config.metrics.thresholds;

    return {
      overall: this.calculateOverallHealth(),
      components: {
        cpu: {
          status:
            this.systemMetrics.cpuUsage < thresholds.cpuUsage
              ? "healthy"
              : "warning",
          value: this.systemMetrics.cpuUsage,
          threshold: thresholds.cpuUsage,
        },
        memory: {
          status:
            this.systemMetrics.memoryUsage < thresholds.memoryUsage
              ? "healthy"
              : "warning",
          value: this.systemMetrics.memoryUsage,
          threshold: thresholds.memoryUsage,
        },
        errors: {
          status: this.businessMetrics.errorsToday < 10 ? "healthy" : "warning",
          value: this.businessMetrics.errorsToday,
          threshold: 10,
        },
      },
    };
  }

  private calculateOverallHealth(): "healthy" | "warning" | "critical" {
    const activeAlerts = Array.from(this.alerts.values()).filter(
      (alert) => !alert.resolved,
    );

    if (activeAlerts.some((alert) => alert.severity === "critical")) {
      return "critical";
    }

    if (
      activeAlerts.some((alert) => alert.severity === "high") ||
      activeAlerts.length > 5
    ) {
      return "warning";
    }

    return "healthy";
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Lifecycle Management                                                   │
  // └─────────────────────────────────────────────────────────────────────────┘

  public start(): void {
    if (this.isRunning) {
      console.warn("Monitoring system is already running");
      return;
    }

    console.log(
      `Starting production monitoring for ${this.config.serviceName}`,
    );

    this.isRunning = true;

    // Start metrics collection
    if (this.config.infrastructure.collectSystemMetrics) {
      const systemInterval = setInterval(() => {
        this.collectSystemMetrics();
      }, this.config.metrics.collection.interval);

      this.intervals.push(systemInterval);
    }

    // Reset daily business metrics at midnight
    const dailyReset = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.resetDailyMetrics();
      }
    }, 60000); // Check every minute

    this.intervals.push(dailyReset);

    console.log("Production monitoring system started successfully");
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping production monitoring system");

    this.isRunning = false;

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    // Close APM agent
    if (this.apmAgent) {
      this.apmAgent.destroy();
    }

    console.log("Production monitoring system stopped");
  }

  private resetDailyMetrics(): void {
    this.businessMetrics.bookingsToday = 0;
    this.businessMetrics.requestsToday = 0;
    this.businessMetrics.revenueToday = 0;
    this.businessMetrics.errorsToday = 0;

    console.log("Daily business metrics reset");
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Export Methods                                                         │
  // └─────────────────────────────────────────────────────────────────────────┘

  public getMetrics(): Map<string, MetricData[]> {
    return this.metrics;
  }

  public getAlerts(): Map<string, Alert> {
    return this.alerts;
  }

  public getSystemMetrics(): typeof this.systemMetrics {
    return this.systemMetrics;
  }

  public getBusinessMetrics(): typeof this.businessMetrics {
    return this.businessMetrics;
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Monitoring Middleware                                                  │
// └─────────────────────────────────────────────────────────────────────────┘

export function createMonitoringMiddleware(
  monitoring: ProductionMonitoringSystem,
) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Create APM transaction
    const transaction = monitoring.createTransaction(
      `${req.method} ${req.path}`,
      "request",
    );

    // Track request
    monitoring.recordBusinessEvent(
      "http_request",
      req.user?.id,
      req.tenant?.id,
      {
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      },
    );

    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function (chunk: any, encoding: any) {
      const duration = Date.now() - startTime;

      // Record request metrics
      monitoring.recordRequestMetrics(
        req.method,
        req.path,
        res.statusCode,
        duration,
      );

      // End APM transaction
      if (transaction) {
        transaction.end();
      }

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Default Configuration                                                  │
// └─────────────────────────────────────────────────────────────────────────┘

export const createDefaultMonitoringConfig = (
  environment: string = "production",
): MonitoringConfig => ({
  enabled: true,
  environment,
  serviceName: "hotel-management-api",
  version: process.env.VERSION || "1.0.0",

  metrics: {
    collection: {
      interval: 15000, // 15 seconds
      retention: 1000, // Keep last 1000 data points
      batchSize: 100,
    },
    thresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      responseTime: 2000,
      errorRate: 5,
      requestRate: 1000,
    },
  },

  apm: {
    enabled: process.env.APM_ENABLED === "true",
    serviceName: "hotel-management-api",
    environment,
    serverUrl: process.env.APM_SERVER_URL,
    secretToken: process.env.APM_SECRET_TOKEN,
    captureBody: "errors",
    captureHeaders: true,
    logLevel: "info",
  },

  infrastructure: {
    collectSystemMetrics: true,
    collectDatabaseMetrics: true,
    collectRedisMetrics: true,
    collectCustomMetrics: true,
    prometheusEndpoint: "/metrics",
  },

  business: {
    trackUserSessions: true,
    trackBookings: true,
    trackRequests: true,
    trackRevenue: true,
    trackErrors: true,
    customEvents: [
      "voice_assistant_used",
      "payment_processed",
      "booking_modified",
    ],
  },

  alerting: {
    enabled: true,
    channels: {
      slack: process.env.SLACK_WEBHOOK_URL
        ? {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: process.env.SLACK_CHANNEL || "#alerts",
            username: "monitoring-bot",
          }
        : undefined,
    },
    rules: [
      {
        id: "high-cpu",
        name: "High CPU Usage",
        description: "CPU usage is above 80%",
        metric: "system_cpu_usage",
        condition: "gt",
        threshold: 80,
        duration: 300,
        severity: "high",
        enabled: true,
        channels: ["slack"],
      },
      {
        id: "high-memory",
        name: "High Memory Usage",
        description: "Memory usage is above 85%",
        metric: "system_memory_usage",
        condition: "gt",
        threshold: 85,
        duration: 300,
        severity: "high",
        enabled: true,
        channels: ["slack"],
      },
      {
        id: "high-error-rate",
        name: "High Error Rate",
        description: "Error rate is above 5%",
        metric: "http_request_errors_total",
        condition: "gt",
        threshold: 5,
        duration: 180,
        severity: "critical",
        enabled: true,
        channels: ["slack"],
      },
    ],
  },

  dashboards: {
    grafana: process.env.GRAFANA_API_KEY
      ? {
          url: process.env.GRAFANA_URL || "http://localhost:3001",
          apiKey: process.env.GRAFANA_API_KEY,
          orgId: 1,
        }
      : undefined,
    custom: true,
  },
});

export default ProductionMonitoringSystem;
