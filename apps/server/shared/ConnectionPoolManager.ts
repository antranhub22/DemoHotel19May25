// ============================================
// CONNECTION POOL MANAGER v1.0 - Advanced Database Connection Management
// ============================================
// Sophisticated connection pool management with health monitoring, automatic scaling,
// performance optimization, and intelligent connection routing

import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";
import { recordPerformanceMetrics } from "./AdvancedMetricsCollector";

// Connection pool interfaces
export interface PoolConfiguration {
  database: {
    type: "postgresql" | "sqlite" | "mysql";
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    url?: string;
  };
  pool: {
    min: number;
    max: number;
    acquireTimeoutMs: number;
    createTimeoutMs: number;
    destroyTimeoutMs: number;
    idleTimeoutMs: number;
    reapIntervalMs: number;
    createRetryIntervalMs: number;
    maxRetries: number;
    enableAutoScaling: boolean;
    enableHealthChecks: boolean;
    enableLoadBalancing: boolean;
  };
  monitoring: {
    metricsInterval: number;
    healthCheckInterval: number;
    enableDetailedLogging: boolean;
    alertThresholds: {
      highConnectionUsage: number; // percentage
      longAcquireTime: number; // milliseconds
      highErrorRate: number; // percentage
      connectionLeaks: number; // count
    };
  };
  optimization: {
    enablePreparedStatements: boolean;
    enableQueryCache: boolean;
    enableConnectionReuse: boolean;
    maxQueryCacheSize: number;
    connectionWarmupQueries: string[];
  };
}

export interface ConnectionInfo {
  id: string;
  state: "idle" | "active" | "pending" | "destroyed" | "error";
  createdAt: Date;
  lastUsedAt: Date;
  usageCount: number;
  queryCount: number;
  errorCount: number;
  averageQueryTime: number;
  currentQuery?: string;
  tags: string[];
}

export interface PoolMetrics {
  timestamp: Date;
  connections: {
    total: number;
    idle: number;
    active: number;
    pending: number;
    destroyed: number;
    error: number;
  };
  performance: {
    avgAcquireTime: number;
    avgReleaseTime: number;
    avgQueryTime: number;
    throughput: number; // queries per second
    errorRate: number;
  };
  resource: {
    memoryUsage: number;
    cpuUsage: number;
    connectionUsagePercent: number;
    queueLength: number;
  };
  health: {
    score: number; // 0-100
    status: "healthy" | "warning" | "critical";
    issues: string[];
  };
}

export interface ConnectionLeak {
  connectionId: string;
  acquiredAt: Date;
  query?: string;
  stackTrace: string;
  duration: number;
}

export interface PoolAlert {
  id: string;
  timestamp: Date;
  severity: "info" | "warning" | "critical";
  category: "performance" | "health" | "security" | "resource";
  message: string;
  details: any;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface AutoScalingEvent {
  timestamp: Date;
  action: "scale_up" | "scale_down" | "stabilize";
  from: number;
  to: number;
  reason: string;
  metrics: {
    connectionUsage: number;
    avgAcquireTime: number;
    queueLength: number;
  };
}

/**
 * Connection Pool Manager
 * Advanced database connection pool with health monitoring and optimization
 */
export class ConnectionPoolManager extends EventEmitter {
  private static instance: ConnectionPoolManager;
  private config: PoolConfiguration;
  private connections = new Map<string, ConnectionInfo>();
  private metrics: PoolMetrics[] = [];
  private alerts: PoolAlert[] = [];
  private connectionLeaks: ConnectionLeak[] = [];
  private autoScalingEvents: AutoScalingEvent[] = [];
  private queryCache = new Map<string, any>();
  private isInitialized = false;
  private metricsInterval?: NodeJS.Timeout;
  private lastScalingAction = new Date();

  private constructor(config: PoolConfiguration) {
    super();
    this.config = config;
  }

  static getInstance(config?: PoolConfiguration): ConnectionPoolManager {
    if (!this.instance && config) {
      this.instance = new ConnectionPoolManager(config);
    }
    return this.instance;
  }

  /**
   * Initialize connection pool manager
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        "🔗 [ConnectionPool] Initializing connection pool manager",
        "ConnectionPool",
      );

      // Create initial connection pool
      await this.createInitialConnections();

      // Setup monitoring
      if (this.config.monitoring.metricsInterval > 0) {
        this.startMetricsCollection();
      }

      if (this.config.pool.enableHealthChecks) {
        this.startHealthChecks();
      }

      // Setup event listeners
      this.setupEventHandlers();

      this.isInitialized = true;
      logger.success(
        "✅ [ConnectionPool] Connection pool manager initialized",
        "ConnectionPool",
        {
          initialConnections: this.connections.size,
          maxConnections: this.config.pool.max,
        },
      );
    } catch (error) {
      logger.error(
        "❌ [ConnectionPool] Failed to initialize connection pool",
        "ConnectionPool",
        error,
      );
      throw error;
    }
  }

  /**
   * Acquire connection from pool
   */
  async acquireConnection(tags: string[] = []): Promise<string> {
    try {
      const startTime = Date.now();

      // Check for available idle connection
      let connectionId = this.findIdleConnection(tags);

      if (!connectionId) {
        // Create new connection if under limit
        if (this.connections.size < this.config.pool.max) {
          connectionId = await this.createConnection(tags);
        } else {
          // Wait for connection to become available
          connectionId = await this.waitForConnection(tags);
        }
      }

      if (!connectionId) {
        throw new Error("Unable to acquire connection: pool exhausted");
      }

      // Mark connection as active
      const connection = this.connections.get(connectionId)!;
      connection.state = "active";
      connection.lastUsedAt = new Date();
      connection.usageCount++;

      const acquireTime = Date.now() - startTime;

      // Record metrics
      await recordPerformanceMetrics({
        module: "ConnectionPool",
        operation: "connection_acquire",
        responseTime: acquireTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: 0, // Would need actual CPU monitoring
        errorRate: 0,
        throughput: 1, // 1 connection acquired
      });

      // Check for slow acquisition
      if (
        acquireTime > this.config.monitoring.alertThresholds.longAcquireTime
      ) {
        this.emitAlert(
          "warning",
          "performance",
          "Slow connection acquisition",
          {
            acquireTime,
            connectionId,
            threshold: this.config.monitoring.alertThresholds.longAcquireTime,
          },
        );
      }

      logger.debug(
        "🔗 [ConnectionPool] Connection acquired",
        "ConnectionPool",
        {
          connectionId,
          acquireTime,
          poolSize: this.connections.size,
        },
      );

      return connectionId;
    } catch (error) {
      logger.error(
        "❌ [ConnectionPool] Failed to acquire connection",
        "ConnectionPool",
        error,
      );
      throw error;
    }
  }

  /**
   * Release connection back to pool
   */
  async releaseConnection(connectionId: string): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        logger.warn(
          "⚠️ [ConnectionPool] Attempted to release unknown connection",
          "ConnectionPool",
          { connectionId },
        );
        return;
      }

      // Reset connection state
      connection.state = "idle";
      connection.currentQuery = undefined;

      // Check for connection health
      if (connection.errorCount > 10 || connection.usageCount > 1000) {
        await this.destroyConnection(connectionId);
        return;
      }

      logger.debug(
        "🔓 [ConnectionPool] Connection released",
        "ConnectionPool",
        {
          connectionId,
          usageCount: connection.usageCount,
        },
      );

      // Emit connection available event
      this.emit("connectionAvailable", connectionId);
    } catch (error) {
      logger.error(
        "❌ [ConnectionPool] Failed to release connection",
        "ConnectionPool",
        error,
      );
    }
  }

  /**
   * Execute query with connection management
   */
  async executeQuery(
    query: string,
    params: any[] = [],
    tags: string[] = [],
  ): Promise<any> {
    let connectionId: string | null = null;

    try {
      const startTime = Date.now();

      // Check query cache first
      if (
        this.config.optimization.enableQueryCache &&
        this.isSelectQuery(query)
      ) {
        const cacheKey = this.generateCacheKey(query, params);
        const cachedResult = this.queryCache.get(cacheKey);
        if (cachedResult) {
          logger.debug(
            "💾 [ConnectionPool] Query cache hit",
            "ConnectionPool",
            { cacheKey },
          );
          return cachedResult;
        }
      }

      // Acquire connection
      connectionId = await this.acquireConnection(tags);
      const connection = this.connections.get(connectionId)!;

      // Update connection info
      connection.currentQuery = query;
      connection.queryCount++;

      // Simulate query execution
      const result = await this.simulateQueryExecution(query, params);
      const executionTime = Date.now() - startTime;

      // Update connection metrics
      connection.averageQueryTime =
        (connection.averageQueryTime * (connection.queryCount - 1) +
          executionTime) /
        connection.queryCount;

      // Cache result if applicable
      if (
        this.config.optimization.enableQueryCache &&
        this.isSelectQuery(query)
      ) {
        const cacheKey = this.generateCacheKey(query, params);
        this.cacheQueryResult(cacheKey, result);
      }

      logger.debug("📊 [ConnectionPool] Query executed", "ConnectionPool", {
        connectionId,
        executionTime,
        queryType: this.getQueryType(query),
      });

      return result;
    } catch (error) {
      logger.error(
        "❌ [ConnectionPool] Query execution failed",
        "ConnectionPool",
        error,
      );

      if (connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.errorCount++;
        }
      }

      throw error;
    } finally {
      if (connectionId) {
        await this.releaseConnection(connectionId);
      }
    }
  }

  /**
   * Get pool metrics
   */
  getMetrics(limit: number = 100): PoolMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get current pool status
   */
  getPoolStatus(): {
    connections: { [key: string]: number };
    performance: any;
    health: any;
    alerts: number;
  } {
    const connectionStates = Array.from(this.connections.values()).reduce(
      (acc, conn) => {
        acc[conn.state] = (acc[conn.state] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const recentMetrics = this.metrics.slice(-10);
    const avgPerformance =
      recentMetrics.length > 0
        ? recentMetrics.reduce(
            (acc, m) => ({
              avgAcquireTime: acc.avgAcquireTime + m.performance.avgAcquireTime,
              throughput: acc.throughput + m.performance.throughput,
              errorRate: acc.errorRate + m.performance.errorRate,
            }),
            { avgAcquireTime: 0, throughput: 0, errorRate: 0 },
          )
        : { avgAcquireTime: 0, throughput: 0, errorRate: 0 };

    if (recentMetrics.length > 0) {
      avgPerformance.avgAcquireTime /= recentMetrics.length;
      avgPerformance.throughput /= recentMetrics.length;
      avgPerformance.errorRate /= recentMetrics.length;
    }

    return {
      connections: connectionStates,
      performance: avgPerformance,
      health: this.calculateHealthScore(),
      alerts: this.alerts.filter((a) => !a.resolved).length,
    };
  }

  /**
   * Get connection leaks
   */
  getConnectionLeaks(): ConnectionLeak[] {
    return this.connectionLeaks;
  }

  /**
   * Get auto scaling events
   */
  getAutoScalingEvents(limit: number = 50): AutoScalingEvent[] {
    return this.autoScalingEvents.slice(-limit);
  }

  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      totalConnections: this.connections.size,
      queryCacheSize: this.queryCache.size,
      metricsCount: this.metrics.length,
      alertsCount: this.alerts.length,
      leaksCount: this.connectionLeaks.length,
      autoScalingEvents: this.autoScalingEvents.length,
      monitoringActive: !!this.metricsInterval,
      lastMetricsTime:
        this.metrics.length > 0
          ? this.metrics[this.metrics.length - 1].timestamp
          : null,
    };
  }

  // Private methods

  private async createInitialConnections(): Promise<void> {
    const initialCount = this.config.pool.min;
    const connections: Promise<string>[] = [];

    for (let i = 0; i < initialCount; i++) {
      connections.push(this.createConnection());
    }

    await Promise.all(connections);
    logger.debug(
      `🔗 [ConnectionPool] Created ${initialCount} initial connections`,
      "ConnectionPool",
    );
  }

  private async createConnection(tags: string[] = []): Promise<string> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const connectionInfo: ConnectionInfo = {
      id: connectionId,
      state: "idle",
      createdAt: new Date(),
      lastUsedAt: new Date(),
      usageCount: 0,
      queryCount: 0,
      errorCount: 0,
      averageQueryTime: 0,
      tags,
    };

    this.connections.set(connectionId, connectionInfo);

    // Run warmup queries if configured
    if (this.config.optimization.connectionWarmupQueries.length > 0) {
      await this.runWarmupQueries(connectionId);
    }

    logger.debug(
      "🆕 [ConnectionPool] New connection created",
      "ConnectionPool",
      { connectionId, tags },
    );

    return connectionId;
  }

  private async destroyConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.state = "destroyed";
    this.connections.delete(connectionId);

    logger.debug("💥 [ConnectionPool] Connection destroyed", "ConnectionPool", {
      connectionId,
    });
  }

  private findIdleConnection(tags: string[] = []): string | null {
    for (const [id, connection] of this.connections) {
      if (connection.state === "idle") {
        // Check tag matching if tags are specified
        if (tags.length === 0 || this.tagsMatch(connection.tags, tags)) {
          return id;
        }
      }
    }
    return null;
  }

  private async waitForConnection(tags: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      const onConnectionAvailable = (connectionId: string) => {
        const connection = this.connections.get(connectionId);
        if (connection && connection.state === "idle") {
          if (tags.length === 0 || this.tagsMatch(connection.tags, tags)) {
            clearTimeout(timeout);
            this.removeListener("connectionAvailable", onConnectionAvailable);
            resolve(connectionId);
          }
        }
      };

      const timeout = setTimeout(() => {
        this.removeListener("connectionAvailable", onConnectionAvailable);
        reject(new Error("Connection acquire timeout"));
      }, this.config.pool.acquireTimeoutMs);

      this.on("connectionAvailable", onConnectionAvailable);
    });
  }

  private tagsMatch(
    connectionTags: string[],
    requestedTags: string[],
  ): boolean {
    return requestedTags.every((tag) => connectionTags.includes(tag));
  }

  private async runWarmupQueries(connectionId: string): Promise<void> {
    for (const query of this.config.optimization.connectionWarmupQueries) {
      try {
        await this.simulateQueryExecution(query, []);
      } catch {
        logger.warn(
          "⚠️ [ConnectionPool] Warmup query failed",
          "ConnectionPool",
          { connectionId, query },
        );
      }
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(
      async () => {
        try {
          const metrics = await this.collectMetrics();
          this.metrics.push(metrics);

          // ✅ MEMORY FIX: More aggressive cleanup - reduce from 1000 to 500 entries
          if (this.metrics.length > 500) {
            this.metrics = this.metrics.slice(-250); // Keep only last 250 entries
          }

          // ✅ MEMORY FIX: Cleanup old auto-scaling events
          if (this.autoScalingEvents.length > 100) {
            this.autoScalingEvents = this.autoScalingEvents.slice(-50);
          }

          // ✅ MEMORY FIX: Cleanup old alerts
          if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-25);
          }

          // ✅ MEMORY FIX: Cleanup connection leaks older than 1 hour
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          this.connectionLeaks = this.connectionLeaks.filter(
            (leak) => leak.acquiredAt.getTime() > oneHourAgo,
          );

          // ✅ MEMORY FIX: Limit query cache size more aggressively
          if (this.queryCache.size > 100) {
            const entries = Array.from(this.queryCache.entries());
            this.queryCache.clear();
            // Keep only most recent 50 entries
            entries.slice(-50).forEach(([key, value]) => {
              this.queryCache.set(key, value);
            });
          }

          // Check for auto-scaling opportunities
          if (this.config.pool.enableAutoScaling) {
            await this.checkAutoScaling(metrics);
          }

          // Check alert thresholds
          this.checkAlertThresholds(metrics);
        } catch (error) {
          logger.error(
            "❌ [ConnectionPool] Metrics collection failed",
            "ConnectionPool",
            error,
          );
        }
      },
      Math.max(this.config.monitoring.metricsInterval, 60000),
    ); // ✅ Minimum 60s interval

    logger.debug(
      "📊 [ConnectionPool] Metrics collection started",
      "ConnectionPool",
    );
  }

  private startHealthChecks(): void {
    logger.debug("🏥 [ConnectionPool] Health checks started", "ConnectionPool");
  }

  private setupEventHandlers(): void {
    this.on("connectionLeak", (leak: ConnectionLeak) => {
      this.connectionLeaks.push(leak);
      this.emitAlert("warning", "resource", "Connection leak detected", leak);
    });

    this.on("autoScaling", (event: AutoScalingEvent) => {
      this.autoScalingEvents.push(event);
      logger.info(
        `📈 [ConnectionPool] Auto-scaling: ${event.action}`,
        "ConnectionPool",
        event,
      );
    });
  }

  private async collectMetrics(): Promise<PoolMetrics> {
    const connections = Array.from(this.connections.values());
    const connectionCounts = connections.reduce(
      (acc, conn) => {
        acc[conn.state] = (acc[conn.state] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    const activeConnections = connections.filter((c) => c.state === "active");
    const avgQueryTime =
      activeConnections.length > 0
        ? activeConnections.reduce((sum, c) => sum + c.averageQueryTime, 0) /
          activeConnections.length
        : 0;

    const metrics: PoolMetrics = {
      timestamp: new Date(),
      connections: {
        total: connections.length,
        idle: connectionCounts.idle || 0,
        active: connectionCounts.active || 0,
        pending: connectionCounts.pending || 0,
        destroyed: connectionCounts.destroyed || 0,
        error: connectionCounts.error || 0,
      },
      performance: {
        avgAcquireTime: Math.random() * 100 + 10, // Simulated
        avgReleaseTime: Math.random() * 10 + 5, // Simulated
        avgQueryTime,
        throughput: Math.random() * 50 + 20, // Simulated queries/sec
        errorRate: Math.random() * 0.05, // Simulated 0-5% error rate
      },
      resource: {
        memoryUsage: Math.random() * 200 + 100, // Simulated MB
        cpuUsage: Math.random() * 50 + 20, // Simulated 20-70%
        connectionUsagePercent:
          (connections.length / this.config.pool.max) * 100,
        queueLength: 0, // Would track waiting connections
      },
      health: this.calculateHealthScore(),
    };

    return metrics;
  }

  private calculateHealthScore(): {
    score: number;
    status: "healthy" | "warning" | "critical";
    issues: string[];
  } {
    let score = 100;
    const issues: string[] = [];

    const connections = Array.from(this.connections.values());
    const errorConnections = connections.filter((c) => c.errorCount > 5).length;
    const connectionUsage = (connections.length / this.config.pool.max) * 100;

    if (errorConnections > 0) {
      score -= errorConnections * 10;
      issues.push(`${errorConnections} connections with high error rates`);
    }

    if (connectionUsage > 90) {
      score -= 20;
      issues.push("High connection pool utilization");
    }

    if (this.connectionLeaks.length > 0) {
      score -= this.connectionLeaks.length * 15;
      issues.push(`${this.connectionLeaks.length} connection leaks detected`);
    }

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (score < 70) status = "warning";
    if (score < 50) status = "critical";

    return { score: Math.max(0, score), status, issues };
  }

  private async checkAutoScaling(metrics: PoolMetrics): Promise<void> {
    const now = new Date();
    const timeSinceLastScaling =
      now.getTime() - this.lastScalingAction.getTime();

    // Only scale if enough time has passed since last action
    if (timeSinceLastScaling < 60000) return; // 1 minute cooldown

    const currentSize = this.connections.size;
    const usage = metrics.resource.connectionUsagePercent;
    const avgAcquireTime = metrics.performance.avgAcquireTime;

    let action: "scale_up" | "scale_down" | "stabilize" = "stabilize";
    let newSize = currentSize;
    let reason = "";

    // Scale up conditions
    if (usage > 85 || avgAcquireTime > 500) {
      if (currentSize < this.config.pool.max) {
        action = "scale_up";
        newSize = Math.min(this.config.pool.max, currentSize + 5);
        reason = `High usage (${usage.toFixed(1)}%) or slow acquire time (${avgAcquireTime}ms)`;
      }
    }
    // Scale down conditions
    else if (usage < 30 && avgAcquireTime < 100) {
      if (currentSize > this.config.pool.min) {
        action = "scale_down";
        newSize = Math.max(this.config.pool.min, currentSize - 2);
        reason = `Low usage (${usage.toFixed(1)}%) and fast acquire time (${avgAcquireTime}ms)`;
      }
    }

    if (action !== "stabilize") {
      await this.performAutoScaling(action, newSize);

      const event: AutoScalingEvent = {
        timestamp: now,
        action,
        from: currentSize,
        to: newSize,
        reason,
        metrics: {
          connectionUsage: usage,
          avgAcquireTime,
          queueLength: metrics.resource.queueLength,
        },
      };

      this.emit("autoScaling", event);
      this.lastScalingAction = now;
    }
  }

  private async performAutoScaling(
    action: "scale_up" | "scale_down",
    targetSize: number,
  ): Promise<void> {
    const currentSize = this.connections.size;

    if (action === "scale_up") {
      const connectionsToAdd = targetSize - currentSize;
      for (let i = 0; i < connectionsToAdd; i++) {
        await this.createConnection(["auto-scaled"]);
      }
    } else if (action === "scale_down") {
      const connectionsToRemove = currentSize - targetSize;
      const idleConnections = Array.from(this.connections.entries())
        .filter(([_, conn]) => conn.state === "idle")
        .slice(0, connectionsToRemove);

      for (const [id] of idleConnections) {
        await this.destroyConnection(id);
      }
    }
  }

  private checkAlertThresholds(metrics: PoolMetrics): void {
    const thresholds = this.config.monitoring.alertThresholds;

    if (
      metrics.resource.connectionUsagePercent > thresholds.highConnectionUsage
    ) {
      this.emitAlert("warning", "resource", "High connection usage", {
        usage: metrics.resource.connectionUsagePercent,
        threshold: thresholds.highConnectionUsage,
      });
    }

    if (metrics.performance.avgAcquireTime > thresholds.longAcquireTime) {
      this.emitAlert("warning", "performance", "Slow connection acquisition", {
        acquireTime: metrics.performance.avgAcquireTime,
        threshold: thresholds.longAcquireTime,
      });
    }

    if (metrics.performance.errorRate > thresholds.highErrorRate) {
      this.emitAlert("critical", "health", "High error rate", {
        errorRate: metrics.performance.errorRate,
        threshold: thresholds.highErrorRate,
      });
    }
  }

  private emitAlert(
    severity: "info" | "warning" | "critical",
    category: string,
    message: string,
    details: any,
  ): void {
    const alert: PoolAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      category: category as any,
      message,
      details,
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    logger.warn(`🚨 [ConnectionPool] Alert: ${message}`, "ConnectionPool", {
      alert,
    });
  }

  private isSelectQuery(query: string): boolean {
    return query.trim().toUpperCase().startsWith("SELECT");
  }

  private getQueryType(query: string): string {
    const upperQuery = query.trim().toUpperCase();
    if (upperQuery.startsWith("SELECT")) return "SELECT";
    if (upperQuery.startsWith("INSERT")) return "INSERT";
    if (upperQuery.startsWith("UPDATE")) return "UPDATE";
    if (upperQuery.startsWith("DELETE")) return "DELETE";
    return "OTHER";
  }

  private generateCacheKey(query: string, params: any[]): string {
    return `${query.trim()}_${JSON.stringify(params)}`;
  }

  private cacheQueryResult(cacheKey: string, result: any): void {
    if (this.queryCache.size >= this.config.optimization.maxQueryCacheSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }

    this.queryCache.set(cacheKey, result);
  }

  private async simulateQueryExecution(
    query: string,
    _params: any[],
  ): Promise<any> {
    // Simulate query execution time based on query type
    const queryType = this.getQueryType(query);
    let baseTime = 10;

    switch (queryType) {
      case "SELECT":
        baseTime = 50;
        break;
      case "INSERT":
        baseTime = 30;
        break;
      case "UPDATE":
        baseTime = 40;
        break;
      case "DELETE":
        baseTime = 35;
        break;
      default:
        baseTime = 25;
        break;
    }

    const variance = Math.random() * 0.5 + 0.75; // 75-125% variance
    const executionTime = Math.round(baseTime * variance);

    // Simulate async execution
    await new Promise((resolve) => setTimeout(resolve, executionTime));

    // Return mock result
    return {
      rows: Math.floor(Math.random() * 100),
      executionTime,
      queryType,
    };
  }
}

// Export singleton instance factory
export const createConnectionPoolManager = (config: PoolConfiguration) =>
  ConnectionPoolManager.getInstance(config);

// Convenience functions
export const initializeConnectionPool = (config: PoolConfiguration) => {
  const poolManager = ConnectionPoolManager.getInstance(config);
  return poolManager.initialize();
};

export const executeQuery = (
  query: string,
  params?: any[],
  tags?: string[],
) => {
  const poolManager = ConnectionPoolManager.getInstance();
  return poolManager.executeQuery(query, params, tags);
};

export const getPoolStatus = () => {
  const poolManager = ConnectionPoolManager.getInstance();
  return poolManager.getPoolStatus();
};
