// ============================================
// METRICS COLLECTOR v2.0 - Modular Architecture
// ============================================
// Comprehensive metrics collection system for performance monitoring,
// system health tracking, and real-time analytics integration
// Works with EnhancedLogger, ServiceContainer, FeatureFlags, and ModuleLifecycle

import { EnhancedLogger } from "./EnhancedLogger";
import { TimerManager } from "../utils/TimerManager";

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface SystemMetrics {
  timestamp: Date;
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    loadAverage: number[];
    platformInfo: {
      platform: string;
      arch: string;
      nodeVersion: string;
      pid: number;
    };
  };
  application: {
    requestCount: number;
    responseTime: {
      average: number;
      p50: number;
      p95: number;
      p99: number;
    };
    errorRate: number;
    throughput: number;
    activeConnections: number;
  };
  modules: {
    [moduleName: string]: ModuleMetrics;
  };
  database: {
    connectionCount: number;
    queryCount: number;
    averageQueryTime: number;
    slowQueries: number;
    connectionHealth: "healthy" | "degraded" | "critical";
  };
  custom: Record<string, any>;
}

export interface ModuleMetrics {
  name: string;
  state: "running" | "degraded" | "failed" | "stopped";
  uptime: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  memoryUsage: number;
  lastHealthCheck: Date;
  customMetrics: Record<string, number>;
}

export interface PerformanceTrace {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata: Record<string, any>;
  spans: PerformanceSpan[];
}

export interface PerformanceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  metadata: Record<string, any>;
}

export interface MetricsAlert {
  id: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  context: Record<string, any>;
}

// ============================================
// METRICS COLLECTOR CLASS
// ============================================

/**
 * Advanced Metrics Collection System v2.0
 *
 * Features:
 * - Real-time system metrics collection
 * - Application performance monitoring
 * - Module-specific metrics tracking
 * - Performance tracing and profiling
 * - Automated alerting system
 * - Historical data aggregation
 * - Integration with Enhanced Logger
 * - Custom metrics support
 */
export class MetricsCollector {
  private static isInitialized = false;
  private static collectInterval: NodeJS.Timeout | null = null;
  private static metrics: SystemMetrics[] = [];
  private static maxMetricsHistory = 1000; // Keep 1000 metric snapshots
  private static performanceTraces = new Map<string, PerformanceTrace>();
  private static customCounters = new Map<string, number>();
  private static customGauges = new Map<string, number>();
  private static customHistograms = new Map<string, number[]>();
  private static alerts: MetricsAlert[] = [];
  private static alertThresholds = new Map<
    string,
    { threshold: number; comparison: "gt" | "lt" }
  >();

  // Request tracking
  private static requestCount = 0;
  private static responseTimes: number[] = [];
  private static errorCount = 0;
  private static lastRequestTime = Date.now();

  // Module tracking
  private static moduleMetrics = new Map<string, ModuleMetrics>();

  // Logger instance
  private static logger = EnhancedLogger.createModuleLogger(
    "MetricsCollector",
    "2.0.0",
  );

  // ============================================
  // INITIALIZATION AND CONFIGURATION
  // ============================================

  /**
   * Initialize the metrics collection system
   */
  static initialize(
    options: {
      collectInterval?: number;
      maxHistory?: number;
      autoStart?: boolean;
    } = {},
  ): void {
    if (this.isInitialized) {
      this.logger.warn("MetricsCollector already initialized");
      return;
    }

    const {
      collectInterval = 30000,
      maxHistory = 1000,
      autoStart = true,
    } = options;

    this.maxMetricsHistory = maxHistory;
    this.setupDefaultAlerts();

    this.logger.info("🔧 MetricsCollector v2.0 initializing...", {
      collectInterval,
      maxHistory,
      autoStart,
    });

    if (autoStart) {
      this.startCollection(collectInterval);
    }

    this.isInitialized = true;
    this.logger.success("✅ MetricsCollector v2.0 initialized successfully");
  }

  /**
   * Start metrics collection
   */
  static startCollection(interval: number = 30000): void {
    if (this.collectInterval) {
      this.logger.warn("Metrics collection already running");
      return;
    }

    this.logger.info(
      `🚀 Starting metrics collection (interval: ${interval}ms)`,
    );

    // Collect initial metrics
    this.collectMetrics();

    // Set up periodic collection
    this.collectInterval = TimerManager.setInterval(
      () => {
        this.collectMetrics();
      },
      interval,
      "auto-generated-interval-42",
    );

    this.logger.success("✅ Metrics collection started");
  }

  /**
   * Stop metrics collection
   */
  static stopCollection(): void {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
      this.logger.info("🛑 Metrics collection stopped");
    }
  }

  // ============================================
  // METRICS COLLECTION
  // ============================================

  /**
   * Collect comprehensive system metrics
   */
  static collectMetrics(): SystemMetrics {
    const timestamp = new Date();

    try {
      // Collect system metrics
      const systemMetrics = this.collectSystemMetrics();

      // Collect application metrics
      const applicationMetrics = this.collectApplicationMetrics();

      // Collect module metrics
      const moduleMetrics = this.collectModuleMetrics();

      // Collect database metrics (simulated for now)
      const databaseMetrics = this.collectDatabaseMetrics();

      const metrics: SystemMetrics = {
        timestamp,
        system: systemMetrics,
        application: applicationMetrics,
        modules: moduleMetrics,
        database: databaseMetrics,
        custom: this.collectCustomMetrics(),
      };

      // Store metrics
      this.storeMetrics(metrics);

      // Check for alerts
      this.checkAlerts(metrics);

      // Log metrics summary
      this.logger.debug("📊 Metrics collected", {
        memoryUsage: `${Math.round(systemMetrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        requestCount: applicationMetrics.requestCount,
        errorRate: `${applicationMetrics.errorRate.toFixed(2)}%`,
        activeModules: Object.keys(moduleMetrics).length,
      });

      return metrics;
    } catch (error) {
      this.logger.error("❌ Failed to collect metrics", error);
      throw error;
    }
  }

  /**
   * Collect system-level metrics
   */
  private static collectSystemMetrics(): SystemMetrics["system"] {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const loadAverage = require("os").loadavg();

    return {
      uptime,
      memoryUsage,
      cpuUsage,
      loadAverage,
      platformInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
      },
    };
  }

  /**
   * Collect application-level metrics
   */
  private static collectApplicationMetrics(): SystemMetrics["application"] {
    const now = Date.now();
    const timeWindow = now - this.lastRequestTime;
    const throughput =
      timeWindow > 0 ? this.requestCount / (timeWindow / 1000) : 0;

    // Calculate response time percentiles
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const length = sortedResponseTimes.length;

    const responseTime = {
      average:
        length > 0 ? this.responseTimes.reduce((a, b) => a + b, 0) / length : 0,
      p50: length > 0 ? sortedResponseTimes[Math.floor(length * 0.5)] : 0,
      p95: length > 0 ? sortedResponseTimes[Math.floor(length * 0.95)] : 0,
      p99: length > 0 ? sortedResponseTimes[Math.floor(length * 0.99)] : 0,
    };

    const errorRate =
      this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      requestCount: this.requestCount,
      responseTime,
      errorRate,
      throughput,
      activeConnections: 0, // TODO: Implement connection tracking
    };
  }

  /**
   * Collect module-specific metrics
   */
  private static collectModuleMetrics(): {
    [moduleName: string]: ModuleMetrics;
  } {
    const metrics = {};

    for (const [moduleName, moduleMetric] of this.moduleMetrics.entries()) {
      metrics[moduleName] = {
        ...moduleMetric,
        lastHealthCheck: new Date(),
      };
    }

    return metrics;
  }

  /**
   * Collect database metrics (simulated)
   */
  private static collectDatabaseMetrics(): SystemMetrics["database"] {
    // TODO: Implement actual database metrics collection
    return {
      connectionCount: 5,
      queryCount: this.getCustomCounter("db_queries") || 0,
      averageQueryTime: this.getCustomGauge("db_avg_query_time") || 0,
      slowQueries: this.getCustomCounter("db_slow_queries") || 0,
      connectionHealth: "healthy",
    };
  }

  /**
   * Collect custom metrics
   */
  private static collectCustomMetrics(): Record<string, any> {
    const custom = {};

    // Add counters
    for (const [key, value] of this.customCounters.entries()) {
      custom[key] = value;
    }

    // Add gauges
    for (const [key, value] of this.customGauges.entries()) {
      custom[key] = value;
    }

    // Add histogram summaries
    for (const [key, values] of this.customHistograms.entries()) {
      if (values.length > 0) {
        custom[`${key}_count`] = values.length;
        custom[`${key}_sum`] = values.reduce((a, b) => a + b, 0);
        custom[`${key}_avg`] =
          values.reduce((a, b) => a + b, 0) / values.length;
        custom[`${key}_min`] = Math.min(...values);
        custom[`${key}_max`] = Math.max(...values);
      }
    }

    return custom;
  }

  // ============================================
  // REQUEST AND RESPONSE TRACKING
  // ============================================

  /**
   * Record a request
   */
  static recordRequest(metadata: Record<string, any> = {}): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.requestCount++;
    this.lastRequestTime = Date.now();

    this.logger.debug("📥 Request recorded", { requestId, ...metadata });
    return requestId;
  }

  /**
   * Record a response
   */
  static recordResponse(
    requestId: string,
    responseTime: number,
    success: boolean = true,
  ): void {
    this.responseTimes.push(responseTime);

    if (!success) {
      this.errorCount++;
    }

    // Keep only recent response times (last 1000)
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    this.logger.debug("📤 Response recorded", {
      requestId,
      responseTime: `${responseTime}ms`,
      success,
    });
  }

  // ============================================
  // MODULE METRICS TRACKING
  // ============================================

  /**
   * Register a module for metrics tracking
   */
  static registerModule(
    moduleName: string,
    initialMetrics: Partial<ModuleMetrics> = {},
  ): void {
    const moduleMetric: ModuleMetrics = {
      name: moduleName,
      state: "running",
      uptime: 0,
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      lastHealthCheck: new Date(),
      customMetrics: {},
      ...initialMetrics,
    };

    this.moduleMetrics.set(moduleName, moduleMetric);
    this.logger.info(`📊 Module registered for metrics: ${moduleName}`, {
      moduleMetric,
    });
  }

  /**
   * Update module metrics
   */
  static updateModuleMetrics(
    moduleName: string,
    updates: Partial<ModuleMetrics>,
  ): void {
    const existing = this.moduleMetrics.get(moduleName);
    if (!existing) {
      this.logger.warn(`Module not registered: ${moduleName}`);
      return;
    }

    const updated = { ...existing, ...updates };
    this.moduleMetrics.set(moduleName, updated);
  }

  /**
   * Record module request
   */
  static recordModuleRequest(moduleName: string, responseTime?: number): void {
    const module = this.moduleMetrics.get(moduleName);
    if (!module) return;

    module.requestCount++;

    if (responseTime !== undefined) {
      module.averageResponseTime =
        (module.averageResponseTime + responseTime) / 2;
    }

    this.moduleMetrics.set(moduleName, module);
  }

  /**
   * Record module error
   */
  static recordModuleError(moduleName: string): void {
    const module = this.moduleMetrics.get(moduleName);
    if (!module) return;

    module.errorCount++;
    this.moduleMetrics.set(moduleName, module);
  }

  // ============================================
  // PERFORMANCE TRACING
  // ============================================

  /**
   * Start a performance trace
   */
  static startTrace(name: string, metadata: Record<string, any> = {}): string {
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trace: PerformanceTrace = {
      id: traceId,
      name,
      startTime: performance.now(),
      metadata,
      spans: [],
    };

    this.performanceTraces.set(traceId, trace);
    this.logger.debug(`🔍 Performance trace started: ${name}`, {
      traceId,
      metadata,
    });

    return traceId;
  }

  /**
   * End a performance trace
   */
  static endTrace(
    traceId: string,
    metadata: Record<string, any> = {},
  ): number | null {
    const trace = this.performanceTraces.get(traceId);
    if (!trace) {
      this.logger.warn(`Performance trace not found: ${traceId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.metadata = { ...trace.metadata, ...metadata };

    this.logger.debug(`🏁 Performance trace completed: ${trace.name}`, {
      traceId,
      duration: `${duration.toFixed(2)}ms`,
      spanCount: trace.spans.length,
    });

    // Clean up completed trace
    this.performanceTraces.delete(traceId);

    return duration;
  }

  /**
   * Add a span to a trace
   */
  static addSpan(
    traceId: string,
    spanName: string,
    startTime: number,
    endTime: number,
    metadata: Record<string, any> = {},
  ): void {
    const trace = this.performanceTraces.get(traceId);
    if (!trace) return;

    const span: PerformanceSpan = {
      id: `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: spanName,
      startTime,
      endTime,
      duration: endTime - startTime,
      metadata,
    };

    trace.spans.push(span);
  }

  // ============================================
  // CUSTOM METRICS
  // ============================================

  /**
   * Increment a counter
   */
  static incrementCounter(name: string, value: number = 1): void {
    const current = this.customCounters.get(name) || 0;
    this.customCounters.set(name, current + value);
  }

  /**
   * Set a gauge value
   */
  static setGauge(name: string, value: number): void {
    this.customGauges.set(name, value);
  }

  /**
   * Record a histogram value
   */
  static recordHistogram(name: string, value: number): void {
    if (!this.customHistograms.has(name)) {
      this.customHistograms.set(name, []);
    }

    const values = this.customHistograms.get(name)!;
    values.push(value);

    // Keep only recent values (last 1000)
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Get counter value
   */
  static getCustomCounter(name: string): number {
    return this.customCounters.get(name) || 0;
  }

  /**
   * Get gauge value
   */
  static getCustomGauge(name: string): number {
    return this.customGauges.get(name) || 0;
  }

  /**
   * Get histogram values
   */
  static getCustomHistogram(name: string): number[] {
    return this.customHistograms.get(name) || [];
  }

  // ============================================
  // ALERTING SYSTEM
  // ============================================

  /**
   * Set up default alert thresholds
   */
  private static setupDefaultAlerts(): void {
    this.setAlertThreshold("memory_usage_mb", 500, "gt"); // > 500MB
    this.setAlertThreshold("error_rate_percent", 5, "gt"); // > 5%
    this.setAlertThreshold("response_time_p95", 1000, "gt"); // > 1000ms
    this.setAlertThreshold("cpu_usage_percent", 80, "gt"); // > 80%
  }

  /**
   * Set an alert threshold
   */
  static setAlertThreshold(
    metricName: string,
    threshold: number,
    comparison: "gt" | "lt",
  ): void {
    this.alertThresholds.set(metricName, { threshold, comparison });
    this.logger.debug(
      `🚨 Alert threshold set: ${metricName} ${comparison} ${threshold}`,
    );
  }

  /**
   * Check metrics against alert thresholds
   */
  private static checkAlerts(metrics: SystemMetrics): void {
    const memoryUsageMB = metrics.system.memoryUsage.heapUsed / 1024 / 1024;
    const errorRate = metrics.application.errorRate;
    const responseTimeP95 = metrics.application.responseTime.p95;

    // Check memory usage
    this.checkMetricAlert("memory_usage_mb", memoryUsageMB, {
      metric: "Memory Usage",
      value: memoryUsageMB,
      unit: "MB",
    });

    // Check error rate
    this.checkMetricAlert("error_rate_percent", errorRate, {
      metric: "Error Rate",
      value: errorRate,
      unit: "%",
    });

    // Check response time
    this.checkMetricAlert("response_time_p95", responseTimeP95, {
      metric: "Response Time P95",
      value: responseTimeP95,
      unit: "ms",
    });
  }

  /**
   * Check a specific metric against its threshold
   */
  private static checkMetricAlert(
    metricName: string,
    value: number,
    context: Record<string, any>,
  ): void {
    const alertConfig = this.alertThresholds.get(metricName);
    if (!alertConfig) return;

    const { threshold, comparison } = alertConfig;
    let triggered = false;

    if (comparison === "gt" && value > threshold) {
      triggered = true;
    } else if (comparison === "lt" && value < threshold) {
      triggered = true;
    }

    if (triggered) {
      const severity = this.determineSeverity(metricName, value, threshold);
      const alert: MetricsAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity,
        metric: metricName,
        value,
        threshold,
        message: `${context.metric} is ${value.toFixed(2)}${context.unit}, exceeding threshold of ${threshold}${context.unit}`,
        context,
      };

      this.alerts.push(alert);

      // Keep only recent alerts (last 100)
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }

      this.logger.warn(`🚨 Alert triggered: ${alert.message}`, { alert });
    }
  }

  /**
   * Determine alert severity
   */
  private static determineSeverity(
    _metricName: string,
    value: number,
    threshold: number,
  ): MetricsAlert["severity"] {
    const ratio = value / threshold;

    if (ratio > 2) return "critical";
    if (ratio > 1.5) return "high";
    if (ratio > 1.2) return "medium";
    return "low";
  }

  // ============================================
  // DATA RETRIEVAL AND ANALYSIS
  // ============================================

  /**
   * Get current metrics
   */
  static getCurrentMetrics(): SystemMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  /**
   * Get metrics history
   */
  static getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get metrics for time range
   */
  static getMetricsInRange(startTime: Date, endTime: Date): SystemMetrics[] {
    return this.metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime,
    );
  }

  /**
   * Get recent alerts
   */
  static getRecentAlerts(limit: number = 50): MetricsAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get system health summary
   */
  static getHealthSummary(): {
    overall: "healthy" | "degraded" | "critical";
    components: {
      memory: "healthy" | "warning" | "critical";
      cpu: "healthy" | "warning" | "critical";
      responseTime: "healthy" | "warning" | "critical";
      errorRate: "healthy" | "warning" | "critical";
      modules: "healthy" | "warning" | "critical";
    };
    recentAlerts: number;
    uptime: number;
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      return {
        overall: "critical",
        components: {
          memory: "critical",
          cpu: "critical",
          responseTime: "critical",
          errorRate: "critical",
          modules: "critical",
        },
        recentAlerts: 0,
        uptime: 0,
      };
    }

    const memoryUsageMB = current.system.memoryUsage.heapUsed / 1024 / 1024;
    const memory: "healthy" | "warning" | "critical" =
      memoryUsageMB > 500
        ? "critical"
        : memoryUsageMB > 300
          ? "warning"
          : "healthy";

    const errorRate = current.application.errorRate;
    const errorHealth: "healthy" | "warning" | "critical" =
      errorRate > 5 ? "critical" : errorRate > 2 ? "warning" : "healthy";

    const responseTime = current.application.responseTime.p95;
    const responseHealth: "healthy" | "warning" | "critical" =
      responseTime > 1000
        ? "critical"
        : responseTime > 500
          ? "warning"
          : "healthy";

    const moduleStates = Object.values(current.modules);
    const failedModules = moduleStates.filter(
      (m) => m.state === "failed",
    ).length;
    const degradedModules = moduleStates.filter(
      (m) => m.state === "degraded",
    ).length;
    const moduleHealth: "healthy" | "warning" | "critical" =
      failedModules > 0
        ? "critical"
        : degradedModules > 0
          ? "warning"
          : "healthy";

    const components = {
      memory,
      cpu: "healthy" as const, // TODO: Implement CPU monitoring
      responseTime: responseHealth,
      errorRate: errorHealth,
      modules: moduleHealth,
    };

    const criticalCount = Object.values(components).filter(
      (c) => c === "critical",
    ).length;
    const warningCount = Object.values(components).filter(
      (c) => c === "warning",
    ).length;

    const overall =
      criticalCount > 0
        ? "critical"
        : warningCount > 0
          ? "degraded"
          : "healthy";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAlerts = this.alerts.filter(
      (a) => a.timestamp >= oneHourAgo,
    ).length;

    return {
      overall,
      components,
      recentAlerts,
      uptime: current.system.uptime,
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Store metrics with rotation
   */
  private static storeMetrics(metrics: SystemMetrics): void {
    this.metrics.push(metrics);

    // Rotate metrics if we exceed the limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  /**
   * Clear all metrics (for testing)
   */
  static clearMetrics(): void {
    this.metrics = [];
    this.alerts = [];
    this.customCounters.clear();
    this.customGauges.clear();
    this.customHistograms.clear();
    this.moduleMetrics.clear();
    this.performanceTraces.clear();
  }

  /**
   * Get collector status
   */
  static getStatus(): {
    initialized: boolean;
    collecting: boolean;
    metricsCount: number;
    alertsCount: number;
    modulesTracked: number;
    activeTraces: number;
  } {
    return {
      initialized: this.isInitialized,
      collecting: this.collectInterval !== null,
      metricsCount: this.metrics.length,
      alertsCount: this.alerts.length,
      modulesTracked: this.moduleMetrics.size,
      activeTraces: this.performanceTraces.size,
    };
  }
}
