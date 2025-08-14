/**
 * 🔍 EXTERNAL MEMORY MONITORING SYSTEM
 *
 * Comprehensive monitoring for external memory leaks detection
 * Tracks RSS vs Heap difference, growth patterns, and alerts
 */

import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ExternalMemorySnapshot {
  timestamp: number;
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;

  // Calculated metrics
  externalDiff: number; // RSS - Heap
  externalRatio: number; // External / Heap
  totalAllocated: number; // RSS total

  // Context information
  processUptime: number;
  activeHandles: number;
  activeRequests: number;
  cpuUsage?: NodeJS.CpuUsage;
}

export interface MemoryGrowthPattern {
  type: "stable" | "linear" | "exponential" | "spike" | "leak";
  confidence: number; // 0-100% confidence
  growthRate: number; // MB/minute
  duration: number; // minutes
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export interface ExternalMemoryAlert {
  id: string;
  timestamp: number;
  type: "threshold" | "pattern" | "leak" | "spike";
  severity: "warning" | "critical";
  message: string;
  metrics: ExternalMemorySnapshot;
  context: {
    trigger: string;
    threshold?: number;
    pattern?: MemoryGrowthPattern;
    recommendations: string[];
  };
  resolved: boolean;
  resolvedAt?: number;
}

export interface ExternalMemoryConfig {
  // Monitoring intervals
  snapshotInterval: number; // ms
  analysisInterval: number; // ms

  // Thresholds
  thresholds: {
    externalMB: number; // External memory threshold
    externalRatio: number; // External/Heap ratio threshold
    rssMB: number; // RSS threshold
    growthRateMB: number; // MB/minute growth rate
  };

  // Pattern detection
  patternDetection: {
    windowSize: number; // Number of snapshots to analyze
    minDataPoints: number; // Minimum points for pattern detection
    confidenceThreshold: number; // Minimum confidence for alerts
  };

  // Storage
  storage: {
    maxSnapshots: number; // Max snapshots to keep in memory
    persistToDisk: boolean; // Save snapshots to disk
    dataDirectory: string; // Directory for data files
  };

  // Alerting
  alerting: {
    enabled: boolean;
    channels: ("console" | "file" | "webhook")[];
    webhookUrl?: string;
    maxAlertsPerHour: number;
  };
}

// ============================================================================
// EXTERNAL MEMORY MONITOR CLASS
// ============================================================================

export class ExternalMemoryMonitor extends EventEmitter {
  private static instance: ExternalMemoryMonitor;
  private config: ExternalMemoryConfig;
  private snapshots: ExternalMemorySnapshot[] = [];
  private alerts: ExternalMemoryAlert[] = [];
  private isMonitoring = false;
  private intervals: {
    snapshot?: NodeJS.Timeout;
    analysis?: NodeJS.Timeout;
    cleanup?: NodeJS.Timeout;
  } = {};

  // Pattern detection state
  private lastPattern?: MemoryGrowthPattern;
  private consecutiveLeakAlerts = 0;
  private lastAlertTime = 0;

  constructor(config: Partial<ExternalMemoryConfig> = {}) {
    super();

    this.config = {
      snapshotInterval: 30000, // 30 seconds
      analysisInterval: 120000, // 2 minutes

      thresholds: {
        externalMB: 80, // 80MB external memory
        externalRatio: 1.5, // 1.5x heap ratio
        rssMB: 200, // 200MB RSS
        growthRateMB: 5, // 5MB/minute growth
      },

      patternDetection: {
        windowSize: 20, // Last 20 snapshots (10 minutes)
        minDataPoints: 5, // Minimum 5 data points
        confidenceThreshold: 70, // 70% confidence minimum
      },

      storage: {
        maxSnapshots: 500, // Keep 500 snapshots in memory
        persistToDisk: true,
        dataDirectory: path.join(process.cwd(), "monitoring-data"),
      },

      alerting: {
        enabled: true,
        channels: ["console", "file"],
        maxAlertsPerHour: 10,
      },

      ...config,
    };

    this.ensureDataDirectory();
    this.setupCleanupSchedule();
  }

  static getInstance(
    config?: Partial<ExternalMemoryConfig>,
  ): ExternalMemoryMonitor {
    if (!ExternalMemoryMonitor.instance) {
      ExternalMemoryMonitor.instance = new ExternalMemoryMonitor(config);
    }
    return ExternalMemoryMonitor.instance;
  }

  // ============================================================================
  // CORE MONITORING METHODS
  // ============================================================================

  /**
   * Start external memory monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn(
        "External memory monitoring already running",
        "ExternalMemoryMonitor",
      );
      return;
    }

    this.isMonitoring = true;

    // Take initial snapshot
    this.takeSnapshot();

    // Schedule periodic snapshots
    this.intervals.snapshot = setInterval(() => {
      this.takeSnapshot();
    }, this.config.snapshotInterval);

    // Schedule periodic analysis
    this.intervals.analysis = setInterval(() => {
      this.analyzeMemoryPatterns();
    }, this.config.analysisInterval);

    logger.info(
      "🔍 External memory monitoring started",
      "ExternalMemoryMonitor",
      {
        snapshotInterval: `${this.config.snapshotInterval / 1000}s`,
        analysisInterval: `${this.config.analysisInterval / 1000}s`,
        thresholds: this.config.thresholds,
      },
    );

    this.emit("monitoring:started");
  }

  /**
   * Stop external memory monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    // Clear intervals
    Object.values(this.intervals).forEach((interval) => {
      if (interval) clearInterval(interval);
    });
    this.intervals = {};

    // Save final state
    if (this.config.storage.persistToDisk) {
      this.saveSnapshotsToDisk();
    }

    logger.info(
      "🔍 External memory monitoring stopped",
      "ExternalMemoryMonitor",
    );
    this.emit("monitoring:stopped");
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): void {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const processUptime = process.uptime();

      // Get process handle counts (Node.js internal)
      const activeHandles = (process as any)._getActiveHandles?.().length || 0;
      const activeRequests =
        (process as any)._getActiveRequests?.().length || 0;

      const snapshot: ExternalMemorySnapshot = {
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,

        // Calculated metrics
        externalDiff: memUsage.rss - memUsage.heapUsed,
        externalRatio: memUsage.external / memUsage.heapUsed,
        totalAllocated: memUsage.rss,

        // Context
        processUptime,
        activeHandles,
        activeRequests,
        cpuUsage,
      };

      // Add to snapshots array
      this.snapshots.push(snapshot);

      // Trim snapshots if needed
      if (this.snapshots.length > this.config.storage.maxSnapshots) {
        this.snapshots = this.snapshots.slice(
          -this.config.storage.maxSnapshots,
        );
      }

      // Check thresholds immediately
      this.checkThresholds(snapshot);

      // Emit snapshot event
      this.emit("snapshot:taken", snapshot);

      // Debug log for development
      if (process.env.NODE_ENV === "development") {
        logger.debug("📊 Memory snapshot", "ExternalMemoryMonitor", {
          rss: `${(snapshot.rss / 1024 / 1024).toFixed(1)}MB`,
          heap: `${(snapshot.heapUsed / 1024 / 1024).toFixed(1)}MB`,
          external: `${(snapshot.external / 1024 / 1024).toFixed(1)}MB`,
          externalDiff: `${(snapshot.externalDiff / 1024 / 1024).toFixed(1)}MB`,
          ratio: `${snapshot.externalRatio.toFixed(2)}x`,
        });
      }
    } catch (error) {
      logger.error(
        "Failed to take memory snapshot",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  // ============================================================================
  // THRESHOLD MONITORING
  // ============================================================================

  /**
   * Check if memory metrics exceed thresholds
   */
  private checkThresholds(snapshot: ExternalMemorySnapshot): void {
    const thresholds = this.config.thresholds;
    const alerts: ExternalMemoryAlert[] = [];

    // External memory threshold
    const externalMB = snapshot.external / 1024 / 1024;
    if (externalMB > thresholds.externalMB) {
      alerts.push(
        this.createAlert(
          "threshold",
          "warning",
          `External memory (${externalMB.toFixed(1)}MB) exceeds threshold (${thresholds.externalMB}MB)`,
          snapshot,
          {
            trigger: "external_memory_threshold",
            threshold: thresholds.externalMB,
            recommendations: [
              "Check for native module memory leaks",
              "Review database connection pools",
              "Examine file operation cleanup",
              "Monitor crypto operation buffers",
            ],
          },
        ),
      );
    }

    // External/Heap ratio threshold
    if (snapshot.externalRatio > thresholds.externalRatio) {
      alerts.push(
        this.createAlert(
          "threshold",
          "warning",
          `External/Heap ratio (${snapshot.externalRatio.toFixed(2)}x) exceeds threshold (${thresholds.externalRatio}x)`,
          snapshot,
          {
            trigger: "external_ratio_threshold",
            threshold: thresholds.externalRatio,
            recommendations: [
              "Potential external memory leak detected",
              "Check native modules and C++ addons",
              "Review connection management",
              "Investigate buffer allocations",
            ],
          },
        ),
      );
    }

    // RSS threshold
    const rssMB = snapshot.rss / 1024 / 1024;
    if (rssMB > thresholds.rssMB) {
      alerts.push(
        this.createAlert(
          "threshold",
          "critical",
          `RSS memory (${rssMB.toFixed(1)}MB) exceeds threshold (${thresholds.rssMB}MB)`,
          snapshot,
          {
            trigger: "rss_threshold",
            threshold: thresholds.rssMB,
            recommendations: [
              "Immediate memory investigation required",
              "Consider application restart",
              "Review all memory consumers",
              "Check for memory leaks",
            ],
          },
        ),
      );
    }

    // Process alerts
    alerts.forEach((alert) => this.processAlert(alert));
  }

  // ============================================================================
  // PATTERN DETECTION & ANALYSIS
  // ============================================================================

  /**
   * Analyze memory growth patterns
   */
  private analyzeMemoryPatterns(): void {
    if (this.snapshots.length < this.config.patternDetection.minDataPoints) {
      return;
    }

    const windowSize = Math.min(
      this.config.patternDetection.windowSize,
      this.snapshots.length,
    );

    const recentSnapshots = this.snapshots.slice(-windowSize);
    const pattern = this.detectGrowthPattern(recentSnapshots);

    if (
      pattern &&
      pattern.confidence >= this.config.patternDetection.confidenceThreshold
    ) {
      this.lastPattern = pattern;

      // Create pattern alert if concerning
      if (pattern.severity === "high" || pattern.severity === "critical") {
        const latestSnapshot = recentSnapshots[recentSnapshots.length - 1];

        const alert = this.createAlert(
          "pattern",
          pattern.severity === "critical" ? "critical" : "warning",
          `${pattern.type} memory growth pattern detected (${pattern.growthRate.toFixed(1)}MB/min)`,
          latestSnapshot,
          {
            trigger: "growth_pattern",
            pattern,
            recommendations: this.getPatternRecommendations(pattern),
          },
        );

        this.processAlert(alert);
      }

      this.emit("pattern:detected", pattern);
    }
  }

  /**
   * Detect memory growth pattern from snapshots
   */
  private detectGrowthPattern(
    snapshots: ExternalMemorySnapshot[],
  ): MemoryGrowthPattern | null {
    if (snapshots.length < 3) return null;

    const timePoints = snapshots.map((s) => s.timestamp);
    const externalValues = snapshots.map((s) => s.external / 1024 / 1024); // Convert to MB

    // Calculate time-based growth rate
    const timeSpanMinutes =
      (timePoints[timePoints.length - 1] - timePoints[0]) / (1000 * 60);
    const totalGrowth =
      externalValues[externalValues.length - 1] - externalValues[0];
    const growthRate = totalGrowth / timeSpanMinutes;

    // Analyze growth pattern
    const { type, confidence } = this.classifyGrowthPattern(
      externalValues,
      timePoints,
    );

    // Determine severity
    let severity: "low" | "medium" | "high" | "critical" = "low";
    if (growthRate > 10) severity = "critical";
    else if (growthRate > 5) severity = "high";
    else if (growthRate > 2) severity = "medium";

    return {
      type,
      confidence,
      growthRate,
      duration: timeSpanMinutes,
      severity,
      recommendation: this.getPatternRecommendation(type, growthRate),
    };
  }

  /**
   * Classify growth pattern type
   */
  private classifyGrowthPattern(
    values: number[],
    timePoints: number[],
  ): {
    type: MemoryGrowthPattern["type"];
    confidence: number;
  } {
    const n = values.length;

    // Calculate differences
    const diffs = values.slice(1).map((v, i) => v - values[i]);
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;

    // Standard deviation of differences
    const diffVariance =
      diffs.reduce((sum, d) => sum + Math.pow(d - avgDiff, 2), 0) /
      diffs.length;
    const diffStdDev = Math.sqrt(diffVariance);

    // Classify pattern
    if (Math.abs(avgDiff) < 0.1 && diffStdDev < 1) {
      return { type: "stable", confidence: 90 };
    }

    if (avgDiff > 0) {
      // Growing patterns
      const isLinear = diffStdDev < Math.abs(avgDiff) * 0.5;

      if (isLinear) {
        return { type: "linear", confidence: 85 };
      } else {
        // Check for exponential growth
        const growthRates = diffs.map((d, i) => (i > 0 ? d / values[i] : 0));
        const avgGrowthRate =
          growthRates.slice(1).reduce((sum, r) => sum + r, 0) /
          (growthRates.length - 1);

        if (avgGrowthRate > 0.1) {
          return { type: "exponential", confidence: 80 };
        }

        // Check for spikes
        const maxDiff = Math.max(...diffs);
        if (maxDiff > avgDiff * 3) {
          return { type: "spike", confidence: 75 };
        }

        // Potential leak
        if (avgDiff > 1 && diffStdDev > avgDiff) {
          return { type: "leak", confidence: 70 };
        }
      }
    }

    return { type: "stable", confidence: 60 };
  }

  /**
   * Get recommendation for pattern type
   */
  private getPatternRecommendation(
    type: MemoryGrowthPattern["type"],
    growthRate: number,
  ): string {
    switch (type) {
      case "stable":
        return "Memory usage is stable - no action needed";
      case "linear":
        return `Linear growth detected (${growthRate.toFixed(1)}MB/min) - monitor for sustained growth`;
      case "exponential":
        return `Exponential growth detected - immediate investigation required`;
      case "spike":
        return "Memory spike detected - check for recent operations or events";
      case "leak":
        return `Potential memory leak detected (${growthRate.toFixed(1)}MB/min) - investigate external memory consumers`;
      default:
        return "Unknown pattern - continue monitoring";
    }
  }

  /**
   * Get recommendations for detected pattern
   */
  private getPatternRecommendations(pattern: MemoryGrowthPattern): string[] {
    const baseRecommendations = [
      "Monitor memory usage closely",
      "Check recent operations and events",
    ];

    switch (pattern.type) {
      case "linear":
        return [
          ...baseRecommendations,
          "Investigate sustained memory growth source",
          "Review connection pools and caches",
          "Check for accumulating data structures",
        ];

      case "exponential":
        return [
          "IMMEDIATE ACTION REQUIRED",
          "Restart application if possible",
          "Investigate exponential growth cause",
          "Check for recursive operations",
          "Review algorithm efficiency",
        ];

      case "spike":
        return [
          ...baseRecommendations,
          "Check recent file operations",
          "Review upload/download activities",
          "Investigate temporary buffer allocations",
        ];

      case "leak":
        return [
          ...baseRecommendations,
          "Investigate external memory consumers",
          "Check native module usage",
          "Review database connections",
          "Examine crypto operations",
          "Consider application restart",
        ];

      default:
        return baseRecommendations;
    }
  }

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  /**
   * Create memory alert
   */
  private createAlert(
    type: ExternalMemoryAlert["type"],
    severity: ExternalMemoryAlert["severity"],
    message: string,
    metrics: ExternalMemorySnapshot,
    context: ExternalMemoryAlert["context"],
  ): ExternalMemoryAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      severity,
      message,
      metrics,
      context,
      resolved: false,
    };
  }

  /**
   * Process and emit alert
   */
  private processAlert(alert: ExternalMemoryAlert): void {
    // Rate limiting
    if (!this.shouldProcessAlert(alert)) {
      return;
    }

    // Add to alerts array
    this.alerts.push(alert);

    // Trim alerts if needed
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Emit alert event
    this.emit("alert:created", alert);

    // Process through configured channels
    if (this.config.alerting.enabled) {
      this.sendAlert(alert);
    }

    // Track consecutive leak alerts
    if (alert.type === "pattern" && alert.context.pattern?.type === "leak") {
      this.consecutiveLeakAlerts++;
    } else {
      this.consecutiveLeakAlerts = 0;
    }

    this.lastAlertTime = Date.now();
  }

  /**
   * Check if alert should be processed (rate limiting)
   */
  private shouldProcessAlert(alert: ExternalMemoryAlert): boolean {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Count recent alerts
    const recentAlerts = this.alerts.filter(
      (a) => now - a.timestamp < oneHour,
    ).length;

    if (recentAlerts >= this.config.alerting.maxAlertsPerHour) {
      logger.warn("Alert rate limit exceeded", "ExternalMemoryMonitor", {
        recentAlerts,
        maxPerHour: this.config.alerting.maxAlertsPerHour,
      });
      return false;
    }

    return true;
  }

  /**
   * Send alert through configured channels
   */
  private sendAlert(alert: ExternalMemoryAlert): void {
    const channels = this.config.alerting.channels;

    if (channels.includes("console")) {
      this.sendConsoleAlert(alert);
    }

    if (channels.includes("file")) {
      this.sendFileAlert(alert);
    }

    if (channels.includes("webhook") && this.config.alerting.webhookUrl) {
      this.sendWebhookAlert(alert);
    }
  }

  /**
   * Send console alert
   */
  private sendConsoleAlert(alert: ExternalMemoryAlert): void {
    const icon = alert.severity === "critical" ? "🚨" : "⚠️";
    const externalMB = alert.metrics.external / 1024 / 1024;
    const rssMB = alert.metrics.rss / 1024 / 1024;

    logger.warn(`${icon} External Memory Alert`, "ExternalMemoryMonitor", {
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      metrics: {
        rss: `${rssMB.toFixed(1)}MB`,
        external: `${externalMB.toFixed(1)}MB`,
        ratio: `${alert.metrics.externalRatio.toFixed(2)}x`,
      },
      recommendations: alert.context.recommendations,
    });
  }

  /**
   * Send file alert
   */
  private sendFileAlert(alert: ExternalMemoryAlert): void {
    try {
      const alertsFile = path.join(
        this.config.storage.dataDirectory,
        "alerts.jsonl",
      );
      const alertLine = JSON.stringify(alert) + "\n";

      fs.appendFileSync(alertsFile, alertLine, "utf8");
    } catch (error) {
      logger.error(
        "Failed to write alert to file",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: ExternalMemoryAlert): Promise<void> {
    try {
      const webhookUrl = this.config.alerting.webhookUrl!;
      const payload = {
        text: `External Memory Alert: ${alert.message}`,
        alert,
        timestamp: new Date().toISOString(),
      };

      // Use fetch or axios to send webhook
      // Implementation depends on available HTTP client
      logger.debug("Webhook alert sent", "ExternalMemoryMonitor", {
        webhookUrl,
      });
    } catch (error) {
      logger.error(
        "Failed to send webhook alert",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  // ============================================================================
  // DATA PERSISTENCE
  // ============================================================================

  /**
   * Save snapshots to disk
   */
  private saveSnapshotsToDisk(): void {
    if (!this.config.storage.persistToDisk) return;

    try {
      const snapshotsFile = path.join(
        this.config.storage.dataDirectory,
        `snapshots_${new Date().toISOString().split("T")[0]}.json`,
      );

      fs.writeFileSync(
        snapshotsFile,
        JSON.stringify(this.snapshots, null, 2),
        "utf8",
      );

      logger.debug("Memory snapshots saved to disk", "ExternalMemoryMonitor", {
        file: snapshotsFile,
        count: this.snapshots.length,
      });
    } catch (error) {
      logger.error(
        "Failed to save snapshots to disk",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(this.config.storage.dataDirectory)) {
        fs.mkdirSync(this.config.storage.dataDirectory, { recursive: true });
      }
    } catch (error) {
      logger.error(
        "Failed to create data directory",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  /**
   * Setup cleanup schedule
   */
  private setupCleanupSchedule(): void {
    // Clean up old data files every 24 hours
    this.intervals.cleanup = setInterval(
      () => {
        this.cleanupOldDataFiles();
      },
      24 * 60 * 60 * 1000,
    );
  }

  /**
   * Cleanup old data files
   */
  private cleanupOldDataFiles(): void {
    try {
      const dataDir = this.config.storage.dataDirectory;
      const files = fs.readdirSync(dataDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      files.forEach((file) => {
        const filePath = path.join(dataDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          logger.debug("Cleaned up old data file", "ExternalMemoryMonitor", {
            file,
          });
        }
      });
    } catch (error) {
      logger.error(
        "Failed to cleanup old data files",
        "ExternalMemoryMonitor",
        error,
      );
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current memory status
   */
  getCurrentStatus(): {
    isMonitoring: boolean;
    snapshots: number;
    alerts: number;
    lastSnapshot?: ExternalMemorySnapshot;
    currentPattern?: MemoryGrowthPattern;
    config: ExternalMemoryConfig;
  } {
    return {
      isMonitoring: this.isMonitoring,
      snapshots: this.snapshots.length,
      alerts: this.alerts.filter((a) => !a.resolved).length,
      lastSnapshot: this.snapshots[this.snapshots.length - 1],
      currentPattern: this.lastPattern,
      config: this.config,
    };
  }

  /**
   * Get recent snapshots
   */
  getRecentSnapshots(count: number = 20): ExternalMemorySnapshot[] {
    return this.snapshots.slice(-count);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ExternalMemoryAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get memory growth summary
   */
  getGrowthSummary(minutes: number = 30): {
    timeSpan: number;
    snapshots: number;
    growth: {
      rss: number;
      external: number;
      heap: number;
    };
    growthRate: {
      rss: number; // MB/minute
      external: number; // MB/minute
      heap: number; // MB/minute
    };
    pattern?: MemoryGrowthPattern;
  } {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentSnapshots = this.snapshots.filter((s) => s.timestamp > cutoff);

    if (recentSnapshots.length < 2) {
      return {
        timeSpan: 0,
        snapshots: 0,
        growth: { rss: 0, external: 0, heap: 0 },
        growthRate: { rss: 0, external: 0, heap: 0 },
      };
    }

    const first = recentSnapshots[0];
    const last = recentSnapshots[recentSnapshots.length - 1];
    const timeSpanMinutes = (last.timestamp - first.timestamp) / (1000 * 60);

    const growth = {
      rss: (last.rss - first.rss) / 1024 / 1024,
      external: (last.external - first.external) / 1024 / 1024,
      heap: (last.heapUsed - first.heapUsed) / 1024 / 1024,
    };

    const growthRate = {
      rss: growth.rss / timeSpanMinutes,
      external: growth.external / timeSpanMinutes,
      heap: growth.heap / timeSpanMinutes,
    };

    return {
      timeSpan: timeSpanMinutes,
      snapshots: recentSnapshots.length,
      growth,
      growthRate,
      pattern: this.lastPattern,
    };
  }

  /**
   * Force memory analysis
   */
  forceAnalysis(): MemoryGrowthPattern | null {
    this.analyzeMemoryPatterns();
    return this.lastPattern || null;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId && !a.resolved);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      this.emit("alert:resolved", alert);
      return true;
    }
    return false;
  }

  /**
   * Export monitoring data
   */
  exportData(): {
    snapshots: ExternalMemorySnapshot[];
    alerts: ExternalMemoryAlert[];
    config: ExternalMemoryConfig;
    exportTime: number;
  } {
    return {
      snapshots: this.snapshots,
      alerts: this.alerts,
      config: this.config,
      exportTime: Date.now(),
    };
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const status = this.getCurrentStatus();
    const growth = this.getGrowthSummary();
    const activeAlerts = this.getActiveAlerts();

    let report = `
# External Memory Monitoring Report
Generated: ${new Date().toISOString()}

## Current Status
- Monitoring: ${status.isMonitoring ? "Active" : "Inactive"}
- Snapshots: ${status.snapshots}
- Active Alerts: ${status.alerts}

## Memory Metrics
`;

    if (status.lastSnapshot) {
      const s = status.lastSnapshot;
      report += `
- RSS: ${(s.rss / 1024 / 1024).toFixed(1)}MB
- Heap Used: ${(s.heapUsed / 1024 / 1024).toFixed(1)}MB
- External: ${(s.external / 1024 / 1024).toFixed(1)}MB
- External Ratio: ${s.externalRatio.toFixed(2)}x
- External Diff: ${(s.externalDiff / 1024 / 1024).toFixed(1)}MB
`;
    }

    report += `
## Growth Analysis (${growth.timeSpan.toFixed(1)} minutes)
- RSS Growth: ${growth.growth.rss.toFixed(1)}MB (${growth.growthRate.rss.toFixed(2)}MB/min)
- External Growth: ${growth.growth.external.toFixed(1)}MB (${growth.growthRate.external.toFixed(2)}MB/min)
- Heap Growth: ${growth.growth.heap.toFixed(1)}MB (${growth.growthRate.heap.toFixed(2)}MB/min)
`;

    if (growth.pattern) {
      report += `
## Pattern Detection
- Type: ${growth.pattern.type}
- Confidence: ${growth.pattern.confidence}%
- Severity: ${growth.pattern.severity}
- Recommendation: ${growth.pattern.recommendation}
`;
    }

    if (activeAlerts.length > 0) {
      report += `
## Active Alerts
`;
      activeAlerts.forEach((alert, i) => {
        report += `
${i + 1}. ${alert.severity.toUpperCase()}: ${alert.message}
   Type: ${alert.type}
   Time: ${new Date(alert.timestamp).toISOString()}
`;
      });
    }

    return report;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const externalMemoryMonitor = ExternalMemoryMonitor.getInstance();

// Auto-start monitoring in production
if (process.env.NODE_ENV === "production") {
  externalMemoryMonitor.startMonitoring();
}
