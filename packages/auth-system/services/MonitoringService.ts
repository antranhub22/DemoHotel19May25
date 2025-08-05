// ============================================
// PRODUCTION MONITORING & ALERTING SERVICE
// ============================================
// Real-time monitoring and alerting for authentication system

import type { AuditLogEntry, SecurityAlert } from "@auth/types";
import { EmailService } from "./EmailService";

interface MonitoringConfig {
  enableEmailAlerts: boolean;
  enableSlackAlerts: boolean;
  enableWebhookAlerts: boolean;
  alertThresholds: {
    criticalFailures: number;
    suspiciousActivityWindow: number;
    maxFailuresPerIP: number;
  };
}

interface AlertChannel {
  name: string;
  send(alert: SecurityAlert): Promise<boolean>;
  isAvailable(): boolean;
}

interface MetricData {
  timestamp: number;
  value: number;
  tags: Record<string, string>;
}

export class MonitoringService {
  private static config: MonitoringConfig;
  private static alertChannels: AlertChannel[] = [];
  private static metrics: Map<string, MetricData[]> = new Map();
  private static isInitialized = false;

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize monitoring service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.config = {
      enableEmailAlerts: process.env.ENABLE_EMAIL_ALERTS !== "false",
      enableSlackAlerts: !!process.env.SLACK_WEBHOOK_URL,
      enableWebhookAlerts: !!process.env.MONITORING_WEBHOOK_URL,
      alertThresholds: {
        criticalFailures: parseInt(
          process.env.CRITICAL_FAILURE_THRESHOLD || "10",
        ),
        suspiciousActivityWindow: parseInt(
          process.env.SUSPICIOUS_ACTIVITY_WINDOW || "300000",
        ), // 5 minutes
        maxFailuresPerIP: parseInt(process.env.MAX_FAILURES_PER_IP || "5"),
      },
    };

    // Initialize alert channels
    this.alertChannels = [
      new EmailAlertChannel(),
      new SlackAlertChannel(),
      new WebhookAlertChannel(),
      new ConsoleAlertChannel(), // Always available fallback
    ];

    // Filter available channels
    this.alertChannels = this.alertChannels.filter((channel) =>
      channel.isAvailable(),
    );

    this.isInitialized = true;
    console.log(
      `📊 [MonitoringService] Initialized with ${this.alertChannels.length} alert channels`,
    );
  }

  // ============================================
  // ALERT MANAGEMENT
  // ============================================

  /**
   * Send security alert through all available channels
   */
  static async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.warn(`🚨 [MonitoringService] Security Alert: ${alert.title}`);

    // Send through all available channels
    const promises = this.alertChannels.map(async (channel) => {
      try {
        const success = await channel.send(alert);
        if (!success) {
          console.error(
            `❌ [MonitoringService] Failed to send alert via ${channel.name}`,
          );
        }
        return success;
      } catch (error) {
        console.error(
          `❌ [MonitoringService] Error sending alert via ${channel.name}:`,
          error,
        );
        return false;
      }
    });

    await Promise.all(promises);
  }

  /**
   * Process audit log for monitoring patterns
   */
  static async processAuditLog(logEntry: AuditLogEntry): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Record metrics
    this.recordMetric("auth.events", 1, {
      event_type: logEntry.eventType,
      result: logEntry.result,
      risk_level: logEntry.risk_level,
    });

    // Check for patterns that require immediate attention
    await this.checkForCriticalPatterns(logEntry);

    // Check for suspicious activity patterns
    await this.checkForSuspiciousActivity(logEntry);
  }

  // ============================================
  // PATTERN DETECTION
  // ============================================

  /**
   * Check for critical security patterns
   */
  private static async checkForCriticalPatterns(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    // Check for multiple failed logins from same IP
    if (logEntry.eventType === "auth.login.failure") {
      const recentFailures = this.getRecentMetrics(
        "failed.logins.by.ip",
        10 * 60 * 1000,
      ); // 10 minutes
      const ipFailures = recentFailures.filter(
        (m) => m.tags.ip === logEntry.ipAddress,
      );

      if (ipFailures.length >= this.config.alertThresholds.maxFailuresPerIP) {
        await this.sendSecurityAlert({
          id: `alert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          alertType: "multiple.failed.logins",
          severity: "critical",
          title: `Multiple Failed Logins from ${logEntry.ipAddress}`,
          description: `${ipFailures.length} failed login attempts detected from IP ${logEntry.ipAddress} in the last 10 minutes`,
          userId: logEntry.userId,
          ipAddress: logEntry.ipAddress,
          userAgent: logEntry.userAgent,
          triggerEvent: logEntry,
          relatedEvents: [],
          resolved: false,
        });
      }
    }

    // Check for account lockouts
    if (logEntry.eventType === "auth.account.locked") {
      await this.sendSecurityAlert({
        id: `alert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        alertType: "account.compromise.suspected",
        severity: "high",
        title: `Account Locked: ${logEntry.username}`,
        description: `User account ${logEntry.username} has been locked due to suspicious activity`,
        userId: logEntry.userId,
        ipAddress: logEntry.ipAddress,
        userAgent: logEntry.userAgent,
        triggerEvent: logEntry,
        relatedEvents: [],
        resolved: false,
      });
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private static async checkForSuspiciousActivity(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    // Check for unusual login times
    if (logEntry.eventType === "auth.login.success") {
      const hour = new Date(logEntry.timestamp).getHours();

      // Flag logins outside business hours (assuming 9-17)
      if (hour < 6 || hour > 22) {
        this.recordMetric("suspicious.activity", 1, {
          type: "unusual_time",
          hour: hour.toString(),
          user_id: logEntry.userId || "unknown",
        });
      }
    }

    // Check for rapid succession events
    if (logEntry.result === "failure") {
      const recentEvents = this.getRecentMetrics("auth.events", 60000); // 1 minute
      const sameIPEvents = recentEvents.filter(
        (m) => m.tags.ip === logEntry.ipAddress,
      );

      if (sameIPEvents.length >= 20) {
        // 20 events in 1 minute
        await this.sendSecurityAlert({
          id: `alert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          alertType: "brute.force.attempt",
          severity: "critical",
          title: `Potential Brute Force Attack from ${logEntry.ipAddress}`,
          description: `${sameIPEvents.length} authentication events detected from IP ${logEntry.ipAddress} in the last minute`,
          userId: logEntry.userId,
          ipAddress: logEntry.ipAddress,
          userAgent: logEntry.userAgent,
          triggerEvent: logEntry,
          relatedEvents: [],
          resolved: false,
        });
      }
    }
  }

  // ============================================
  // METRICS COLLECTION
  // ============================================

  /**
   * Record a metric
   */
  private static recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({
      timestamp: Date.now(),
      value,
      tags,
    });

    // Keep only recent metrics (last hour)
    const cutoff = Date.now() - 60 * 60 * 1000;
    this.metrics.set(
      name,
      metrics.filter((m) => m.timestamp > cutoff),
    );
  }

  /**
   * Get recent metrics
   */
  private static getRecentMetrics(
    name: string,
    timeWindow: number,
  ): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    const cutoff = Date.now() - timeWindow;
    return metrics.filter((m) => m.timestamp > cutoff);
  }

  /**
   * Get system health metrics
   */
  static getHealthMetrics(): {
    totalEvents: number;
    failureRate: number;
    alertChannels: number;
    activeAlerts: number;
    uptime: number;
  } {
    const recentEvents = this.getRecentMetrics("auth.events", 60 * 60 * 1000); // 1 hour
    const failures = recentEvents.filter((m) => m.tags.result === "failure");

    return {
      totalEvents: recentEvents.length,
      failureRate:
        recentEvents.length > 0 ? failures.length / recentEvents.length : 0,
      alertChannels: this.alertChannels.length,
      activeAlerts: 0, // Would need to track active alerts
      uptime: process.uptime(),
    };
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Clean up old metrics
   */
  static cleanupMetrics(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => m.timestamp > cutoff);
      this.metrics.set(name, filtered);
    }
  }
}

// ============================================
// ALERT CHANNELS
// ============================================

/**
 * Email alert channel
 */
class EmailAlertChannel implements AlertChannel {
  name = "email";

  async send(alert: SecurityAlert): Promise<boolean> {
    const adminEmail =
      process.env.SECURITY_ALERT_EMAIL || process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;

    return EmailService.sendSecurityAlert(adminEmail, alert.title, {
      ipAddress: alert.ipAddress,
      location: alert.triggerEvent.location?.country,
      timestamp: alert.timestamp,
      action: alert.triggerEvent.action,
    });
  }

  isAvailable(): boolean {
    return !!(process.env.SECURITY_ALERT_EMAIL || process.env.ADMIN_EMAIL);
  }
}

/**
 * Slack alert channel
 */
class SlackAlertChannel implements AlertChannel {
  name = "slack";
  private webhookUrl = process.env.SLACK_WEBHOOK_URL;

  async send(alert: SecurityAlert): Promise<boolean> {
    if (!this.webhookUrl) return false;

    const payload = {
      text: `🚨 Security Alert: ${alert.title}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: "Severity",
              value: alert.severity.toUpperCase(),
              short: true,
            },
            { title: "IP Address", value: alert.ipAddress, short: true },
            {
              title: "Time",
              value: new Date(alert.timestamp).toLocaleString(),
              short: true,
            },
            { title: "Alert Type", value: alert.alertType, short: true },
            { title: "Description", value: alert.description, short: false },
          ],
        },
      ],
    };

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return response.ok;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "#ffeb3b";
      default:
        return "good";
    }
  }

  isAvailable(): boolean {
    return !!this.webhookUrl;
  }
}

/**
 * Generic webhook alert channel
 */
class WebhookAlertChannel implements AlertChannel {
  name = "webhook";
  private webhookUrl = process.env.MONITORING_WEBHOOK_URL;

  async send(alert: SecurityAlert): Promise<boolean> {
    if (!this.webhookUrl) return false;

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "security_alert",
        data: alert,
      }),
    });

    return response.ok;
  }

  isAvailable(): boolean {
    return !!this.webhookUrl;
  }
}

/**
 * Console alert channel (fallback)
 */
class ConsoleAlertChannel implements AlertChannel {
  name = "console";

  async send(alert: SecurityAlert): Promise<boolean> {
    const emoji =
      alert.severity === "critical"
        ? "🚨"
        : alert.severity === "high"
          ? "⚠️"
          : "ℹ️";

    console.warn(`\n${emoji} SECURITY ALERT ${emoji}`);
    console.warn(`Title: ${alert.title}`);
    console.warn(`Severity: ${alert.severity.toUpperCase()}`);
    console.warn(`Time: ${new Date(alert.timestamp).toLocaleString()}`);
    console.warn(`IP: ${alert.ipAddress}`);
    console.warn(`Description: ${alert.description}`);
    console.warn(`${"─".repeat(80)}\n`);

    return true;
  }

  isAvailable(): boolean {
    return true; // Always available
  }
}
