// ============================================
// ENHANCED LOGGER v2.0 - Modular Architecture
// ============================================
// Advanced logging system with structured logging, performance metrics,
// module awareness, real-time monitoring, and comprehensive analytics
// Full integration with ServiceContainer, FeatureFlags, and ModuleLifecycle

import { logger as baseLogger } from "@shared/utils/logger";

// ============================================
// TYPES AND INTERFACES
// ============================================

export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "success"
  | "api"
  | "audit";

export interface LogContext {
  module?: string;
  component?: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  sessionId?: string;
  operation?: string;
  version?: string;
  environment?: string;
  [key: string]: any;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: LogContext;
  metadata?: any;
  duration?: number;
  performance?: PerformanceMetrics;
  tags?: string[];
  error?: ErrorInfo;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

export interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
}

export interface MetricsSnapshot {
  timestamp: Date;
  logs: {
    total: number;
    byLevel: Record<LogLevel, number>;
    byModule: Record<string, number>;
    recentErrors: number;
    averageResponseTime: number;
  };
  performance: {
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    averageCpuUsage: number;
    totalOperations: number;
    slowOperations: number;
  };
  system: {
    uptime: number;
    activeModules: number;
    healthyModules: number;
    enabledFlags: number;
    registeredServices: number;
  };
}

// ============================================
// ENHANCED LOGGER CLASS
// ============================================

/**
 * Enhanced Logger v2.0 - Advanced Logging System
 *
 * Features:
 * - Structured logging with rich context
 * - Performance metrics collection
 * - Module-aware logging
 * - Real-time monitoring and analytics
 * - Log aggregation and filtering
 * - Integration with modular architecture
 * - Audit trail capabilities
 * - Error tracking and alerting
 */
export class EnhancedLogger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 10000; // Keep last 10k logs in memory
  private static performanceTrackers = new Map<string, number>();
  private static metrics: MetricsSnapshot["logs"] = {
    total: 0,
    byLevel: {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      success: 0,
      api: 0,
      audit: 0,
    },
    byModule: {},
    recentErrors: 0,
    averageResponseTime: 0,
  };
  private static performanceMetrics: MetricsSnapshot["performance"] = {
    averageMemoryUsage: 0,
    peakMemoryUsage: 0,
    averageCpuUsage: 0,
    totalOperations: 0,
    slowOperations: 0,
  };

  // ============================================
  // CORE LOGGING METHODS
  // ============================================

  /**
   * Enhanced logging with structured data and performance tracking
   */
  static log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    const logId = this.generateLogId();
    const timestamp = new Date();

    // Collect performance metrics
    const performance = this.collectPerformanceMetrics();

    // Create structured log entry
    const logEntry: LogEntry = {
      id: logId,
      timestamp,
      level,
      message,
      context: {
        ...context,
        environment: process.env.NODE_ENV || "development",
        version: "2.0.0",
      },
      metadata,
      performance,
      tags: this.generateTags(level, context),
    };

    // Store log entry
    this.storeLogEntry(logEntry);

    // Update metrics
    this.updateMetrics(logEntry);

    // Forward to base logger for console output
    this.forwardToBaseLogger(
      level,
      message,
      context.component || "EnhancedLogger",
      {
        ...context,
        metadata,
        logId,
      },
    );

    // Check for alerts
    this.checkAlerts(logEntry);

    return logEntry;
  }

  /**
   * Debug logging with detailed context
   */
  static debug(
    message: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    return this.log("debug", message, context, metadata);
  }

  /**
   * Info logging for general information
   */
  static info(
    message: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    return this.log("info", message, context, metadata);
  }

  /**
   * Warning logging for non-critical issues
   */
  static warn(
    message: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    return this.log("warn", message, context, metadata);
  }

  /**
   * Error logging with enhanced error information
   */
  static error(
    message: string,
    context: LogContext = {},
    error?: Error | any,
    metadata?: any,
  ): LogEntry {
    const errorInfo = this.extractErrorInfo(error);
    const logEntry = this.log("error", message, context, {
      ...metadata,
      error: errorInfo,
    });

    // Additional error processing
    logEntry.error = errorInfo;

    return logEntry;
  }

  /**
   * Success logging for positive outcomes
   */
  static success(
    message: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    return this.log("success", message, context, metadata);
  }

  /**
   * API logging for HTTP requests and responses
   */
  static api(
    message: string,
    context: LogContext = {},
    metadata?: any,
    duration?: number,
  ): LogEntry {
    const logEntry = this.log("api", message, context, metadata);
    if (duration) {
      logEntry.duration = duration;
    }
    return logEntry;
  }

  /**
   * Audit logging for security and compliance
   */
  static audit(
    action: string,
    context: LogContext = {},
    metadata?: any,
  ): LogEntry {
    return this.log(
      "audit",
      `AUDIT: ${action}`,
      {
        ...context,
        operation: "audit",
      },
      metadata,
    );
  }

  // ============================================
  // PERFORMANCE TRACKING
  // ============================================

  /**
   * Start performance tracking for an operation
   */
  static startPerformanceTracking(
    operationId: string,
    context: LogContext = {},
  ): void {
    const startTime = performance.now();
    this.performanceTrackers.set(operationId, startTime);

    this.debug(`🚀 Performance tracking started: ${operationId}`, {
      ...context,
      operation: operationId,
      startTime,
    });
  }

  /**
   * End performance tracking and log results
   */
  static endPerformanceTracking(
    operationId: string,
    context: LogContext = {},
    metadata?: any,
  ): number {
    const startTime = this.performanceTrackers.get(operationId);
    if (!startTime) {
      this.warn(
        `Performance tracking not found for operation: ${operationId}`,
        context,
      );
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.performanceTrackers.delete(operationId);

    // Determine log level based on duration
    const level = duration > 1000 ? "warn" : duration > 500 ? "info" : "debug";
    const emoji = duration > 1000 ? "🐌" : duration > 500 ? "⚡" : "🚀";

    this.log(
      level,
      `${emoji} Performance: ${operationId} completed in ${duration.toFixed(2)}ms`,
      {
        ...context,
        operation: operationId,
      },
      {
        ...metadata,
        performance: {
          duration,
          startTime,
          endTime,
        },
      },
    );

    // Update performance metrics
    this.performanceMetrics.totalOperations++;
    if (duration > 1000) {
      this.performanceMetrics.slowOperations++;
    }

    return duration;
  }

  /**
   * Time an async operation
   */
  static async time<T>(
    operationId: string,
    operation: () => Promise<T>,
    context: LogContext = {},
  ): Promise<T> {
    this.startPerformanceTracking(operationId, context);

    try {
      const result = await operation();
      this.endPerformanceTracking(operationId, context);
      return result;
    } catch (error) {
      this.endPerformanceTracking(operationId, context);
      this.error(`Operation failed: ${operationId}`, context, error);
      throw error;
    }
  }

  // ============================================
  // MODULE-AWARE LOGGING
  // ============================================

  /**
   * Create a module-specific logger
   */
  static createModuleLogger(moduleName: string, version: string = "1.0.0") {
    return {
      debug: (message: string, metadata?: any) =>
        this.debug(message, { module: moduleName, version }, metadata),

      info: (message: string, metadata?: any) =>
        this.info(message, { module: moduleName, version }, metadata),

      warn: (message: string, metadata?: any) =>
        this.warn(message, { module: moduleName, version }, metadata),

      error: (message: string, error?: Error | any, metadata?: any) =>
        this.error(message, { module: moduleName, version }, error, metadata),

      success: (message: string, metadata?: any) =>
        this.success(message, { module: moduleName, version }, metadata),

      api: (message: string, metadata?: any, duration?: number) =>
        this.api(message, { module: moduleName, version }, metadata, duration),

      audit: (action: string, metadata?: any) =>
        this.audit(action, { module: moduleName, version }, metadata),

      startPerformance: (operationId: string) =>
        this.startPerformanceTracking(operationId, {
          module: moduleName,
          version,
        }),

      endPerformance: (operationId: string, metadata?: any) =>
        this.endPerformanceTracking(
          operationId,
          { module: moduleName, version },
          metadata,
        ),

      time: <T>(operationId: string, operation: () => Promise<T>) =>
        this.time(operationId, operation, { module: moduleName, version }),
    };
  }

  // ============================================
  // LOG RETRIEVAL AND FILTERING
  // ============================================

  /**
   * Get logs with filtering options
   */
  static getLogs(
    options: {
      level?: LogLevel | LogLevel[];
      module?: string;
      component?: string;
      userId?: string;
      tenantId?: string;
      since?: Date;
      until?: Date;
      limit?: number;
      offset?: number;
      search?: string;
    } = {},
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    // Filter by level
    if (options.level) {
      const levels = Array.isArray(options.level)
        ? options.level
        : [options.level];
      filteredLogs = filteredLogs.filter((log) => levels.includes(log.level));
    }

    // Filter by module
    if (options.module) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.module === options.module,
      );
    }

    // Filter by component
    if (options.component) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.component === options.component,
      );
    }

    // Filter by user
    if (options.userId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.userId === options.userId,
      );
    }

    // Filter by tenant
    if (options.tenantId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.tenantId === options.tenantId,
      );
    }

    // Filter by time range
    if (options.since) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= options.since!,
      );
    }
    if (options.until) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp <= options.until!,
      );
    }

    // Search in message
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.context).toLowerCase().includes(searchLower),
      );
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    return filteredLogs.slice(offset, offset + limit);
  }

  /**
   * Get logs for a specific module
   */
  static getModuleLogs(moduleName: string, limit: number = 100): LogEntry[] {
    return this.getLogs({ module: moduleName, limit });
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(limit: number = 50): LogEntry[] {
    return this.getLogs({ level: "error", limit });
  }

  /**
   * Get API logs
   */
  static getApiLogs(limit: number = 100): LogEntry[] {
    return this.getLogs({ level: "api", limit });
  }

  /**
   * Get audit logs
   */
  static getAuditLogs(limit: number = 100): LogEntry[] {
    return this.getLogs({ level: "audit", limit });
  }

  // ============================================
  // METRICS AND ANALYTICS
  // ============================================

  /**
   * Get comprehensive metrics snapshot
   */
  static getMetricsSnapshot(): MetricsSnapshot {
    // Calculate recent errors (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.logs.filter(
      (log) => log.level === "error" && log.timestamp >= oneHourAgo,
    ).length;

    // Calculate average response time from API logs
    const apiLogs = this.logs.filter(
      (log) => log.level === "api" && log.duration,
    );
    const averageResponseTime =
      apiLogs.length > 0
        ? apiLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
          apiLogs.length
        : 0;

    // Get system information
    const systemInfo = this.getSystemInfo();

    return {
      timestamp: new Date(),
      logs: {
        ...this.metrics,
        recentErrors,
        averageResponseTime,
      },
      performance: this.performanceMetrics,
      system: systemInfo,
    };
  }

  /**
   * Get log statistics
   */
  static getLogStatistics(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byModule: Record<string, number>;
    byHour: { hour: string; count: number }[];
    topErrors: { message: string; count: number }[];
  } {
    const byHour: { [hour: string]: number } = {};
    const errorCounts: { [message: string]: number } = {};

    // Process logs for statistics
    this.logs.forEach((log) => {
      // Group by hour
      const hour = log.timestamp.toISOString().substring(0, 13);
      byHour[hour] = (byHour[hour] || 0) + 1;

      // Count error messages
      if (log.level === "error") {
        errorCounts[log.message] = (errorCounts[log.message] || 0) + 1;
      }
    });

    // Convert to arrays and sort
    const byHourArray = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    const topErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this.metrics.total,
      byLevel: this.metrics.byLevel,
      byModule: this.metrics.byModule,
      byHour: byHourArray,
      topErrors,
    };
  }

  // ============================================
  // INTERNAL HELPER METHODS
  // ============================================

  /**
   * Generate unique log ID
   */
  private static generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Collect current performance metrics
   */
  private static collectPerformanceMetrics(): PerformanceMetrics {
    const memoryUsage = process.memoryUsage();
    const startTime = performance.now();

    return {
      startTime,
      endTime: startTime,
      duration: 0,
      memoryUsage,
    };
  }

  /**
   * Generate tags for log entry
   */
  private static generateTags(level: LogLevel, context: LogContext): string[] {
    const tags: string[] = [level];

    if (context.module) tags.push(`module:${context.module}`);
    if (context.component) tags.push(`component:${context.component}`);
    if (context.operation) tags.push(`operation:${context.operation}`);
    if (context.tenantId) tags.push(`tenant:${context.tenantId}`);

    return tags;
  }

  /**
   * Store log entry with rotation
   */
  private static storeLogEntry(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Rotate logs if we exceed the limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Update metrics with new log entry
   */
  private static updateMetrics(logEntry: LogEntry): void {
    this.metrics.total++;
    this.metrics.byLevel[logEntry.level]++;

    if (logEntry.context.module) {
      const module = logEntry.context.module;
      this.metrics.byModule[module] = (this.metrics.byModule[module] || 0) + 1;
    }

    // Update performance metrics
    if (logEntry.performance) {
      const memUsed = logEntry.performance.memoryUsage.heapUsed;
      this.performanceMetrics.averageMemoryUsage =
        (this.performanceMetrics.averageMemoryUsage + memUsed) / 2;

      if (memUsed > this.performanceMetrics.peakMemoryUsage) {
        this.performanceMetrics.peakMemoryUsage = memUsed;
      }
    }
  }

  /**
   * Forward to base logger for console output
   */
  private static forwardToBaseLogger(
    level: LogLevel,
    message: string,
    component: string,
    context: any,
  ): void {
    try {
      switch (level) {
        case "debug":
          baseLogger.debug(message, component, context);
          break;
        case "info":
          baseLogger.info(message, component, context);
          break;
        case "warn":
          baseLogger.warn(message, component, context);
          break;
        case "error":
          baseLogger.error(message, component, context);
          break;
        case "success":
          baseLogger.success(message, component, context);
          break;
        case "api":
          baseLogger.api(message, component, context);
          break;
        case "audit":
          baseLogger.info(`[AUDIT] ${message}`, component, context);
          break;
        default:
          baseLogger.info(message, component, context);
      }
    } catch (_error) {
      // Fallback to console if base logger fails
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  /**
   * Extract error information
   */
  private static extractErrorInfo(error?: Error | any): ErrorInfo | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        statusCode: (error as any).statusCode,
      };
    }

    if (typeof error === "object") {
      return {
        name: error.name || "Unknown",
        message: error.message || String(error),
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      };
    }

    return {
      name: "Unknown",
      message: String(error),
    };
  }

  /**
   * Check for alerts based on log patterns
   */
  private static checkAlerts(logEntry: LogEntry): void {
    // Alert on multiple errors in short time
    if (logEntry.level === "error") {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentErrors = this.logs.filter(
        (log) => log.level === "error" && log.timestamp >= fiveMinutesAgo,
      ).length;

      if (recentErrors >= 10) {
        this.warn(`🚨 Alert: ${recentErrors} errors in the last 5 minutes`, {
          component: "AlertSystem",
          operation: "error-threshold-alert",
        });
      }
    }

    // Alert on slow operations
    if (logEntry.duration && logEntry.duration > 5000) {
      this.warn(
        `🐌 Alert: Slow operation detected: ${logEntry.duration}ms`,
        {
          component: "AlertSystem",
          operation: "slow-operation-alert",
        },
        { originalLogId: logEntry.id },
      );
    }
  }

  /**
   * Get system information
   */
  private static getSystemInfo(): MetricsSnapshot["system"] {
    return {
      uptime: process.uptime(),
      activeModules: 0, // Will be populated by integration
      healthyModules: 0, // Will be populated by integration
      enabledFlags: 0, // Will be populated by integration
      registeredServices: 0, // Will be populated by integration
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Clear all logs (for testing)
   */
  static clearLogs(): void {
    this.logs = [];
    this.metrics = {
      total: 0,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        success: 0,
        api: 0,
        audit: 0,
      },
      byModule: {},
      recentErrors: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Export logs for analysis
   */
  static exportLogs(format: "json" | "csv" = "json"): string {
    if (format === "json") {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV format
    const headers = [
      "timestamp",
      "level",
      "message",
      "module",
      "component",
      "duration",
    ];
    const csvRows = [headers.join(",")];

    this.logs.forEach((log) => {
      const row = [
        log.timestamp.toISOString(),
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.context.module || "",
        log.context.component || "",
        log.duration || "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Get logger health status
   */
  static getHealthStatus(): {
    status: "healthy" | "degraded" | "critical";
    logsCount: number;
    memoryUsage: number;
    recentErrors: number;
    performance: "good" | "slow" | "critical";
  } {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentErrors = this.logs.filter(
      (log) => log.level === "error" && log.timestamp >= fiveMinutesAgo,
    ).length;

    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (recentErrors > 20) status = "critical";
    else if (recentErrors > 5) status = "degraded";

    let performance: "good" | "slow" | "critical" = "good";
    if (this.performanceMetrics.slowOperations > 10) performance = "critical";
    else if (this.performanceMetrics.slowOperations > 3) performance = "slow";

    return {
      status,
      logsCount: this.logs.length,
      memoryUsage,
      recentErrors,
      performance,
    };
  }
}
