// ============================================
// UNIFIED AUDIT LOGGING SERVICE
// ============================================
// Comprehensive audit logging for authentication events and security monitoring

import { SECURITY_CONFIG } from "@auth/config";
import type {
  AuditEventType,
  AuditLogEntry,
  LocationInfo,
  SecurityAlert,
  SecurityAlertType,
} from "@auth/types";
import crypto from "crypto";

export class AuditLogger {
  // ============================================
  // AUDIT LOG STORAGE
  // ============================================

  private static auditLogs = new Map<string, AuditLogEntry>();
  private static securityAlerts = new Map<string, SecurityAlert>();

  // ============================================
  // MAIN LOGGING METHODS
  // ============================================

  /**
   * Log authentication event
   */
  static async logAuthEvent(
    eventType: AuditEventType,
    action: string,
    result: "success" | "failure" | "warning",
    details: {
      userId?: string;
      username?: string;
      email?: string;
      ipAddress: string;
      userAgent: string;
      sessionId?: string;
      resource?: string;
      additionalData?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const logEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        eventType,
        userId: details.userId,
        username: details.username,
        email: details.email,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        sessionId: details.sessionId,
        action,
        resource: details.resource,
        result,
        details: {
          ...details.additionalData,
          timestamp: new Date().toISOString(),
        },
        risk_level: this.calculateRiskLevel(eventType, result, details),
        location: await this.getLocationFromIP(details.ipAddress),
      };

      // Store audit log
      await this.storeAuditLog(logEntry);

      // Check for security violations
      await this.analyzeForSecurityThreats(logEntry);

      // Log to console if enabled
      if (SECURITY_CONFIG.LOG_FAILED_ATTEMPTS || result === "success") {
        this.logToConsole(logEntry);
      }
    } catch (error) {
      console.error("❌ [AuditLogger] Failed to log auth event:", error);
    }
  }

  /**
   * Log login attempt
   */
  static async logLoginAttempt(
    username: string,
    result: "success" | "failure",
    ipAddress: string,
    userAgent: string,
    details: {
      userId?: string;
      email?: string;
      sessionId?: string;
      failureReason?: string;
      deviceFingerprint?: string;
    } = {},
  ): Promise<void> {
    await this.logAuthEvent(
      result === "success" ? "auth.login.success" : "auth.login.failure",
      "login",
      result,
      {
        username,
        userId: details.userId,
        email: details.email,
        ipAddress,
        userAgent,
        sessionId: details.sessionId,
        additionalData: {
          failureReason: details.failureReason,
          deviceFingerprint: details.deviceFingerprint,
        },
      },
    );
  }

  /**
   * Log password change
   */
  static async logPasswordChange(
    userId: string,
    username: string,
    ipAddress: string,
    userAgent: string,
    result: "success" | "failure" = "success",
  ): Promise<void> {
    await this.logAuthEvent("auth.password.change", "password_change", result, {
      userId,
      username,
      ipAddress,
      userAgent,
      additionalData: {
        securityAction: true,
      },
    });
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(
    reason: string,
    ipAddress: string,
    userAgent: string,
    details: {
      userId?: string;
      username?: string;
      threat_level?: "low" | "medium" | "high" | "critical";
      additionalData?: Record<string, any>;
    } = {},
  ): Promise<void> {
    await this.logAuthEvent(
      "auth.suspicious.activity",
      "suspicious_activity_detected",
      "warning",
      {
        userId: details.userId,
        username: details.username,
        ipAddress,
        userAgent,
        additionalData: {
          reason,
          threat_level: details.threat_level || "medium",
          ...details.additionalData,
        },
      },
    );
  }

  // ============================================
  // SECURITY ANALYSIS & ALERTS
  // ============================================

  /**
   * Analyze log entry for security threats
   */
  private static async analyzeForSecurityThreats(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    // Check for multiple failed logins
    if (logEntry.eventType === "auth.login.failure") {
      await this.checkMultipleFailedLogins(logEntry);
    }

    // Check for unusual login patterns
    if (logEntry.eventType === "auth.login.success") {
      await this.checkUnusualLoginPatterns(logEntry);
    }

    // Check for rate limit violations
    if (logEntry.result === "failure" && logEntry.details.rateLimited) {
      await this.checkRateLimitViolations(logEntry);
    }
  }

  /**
   * Check for multiple failed login attempts
   */
  private static async checkMultipleFailedLogins(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    const recentLogs = await this.getRecentLogsByIP(
      logEntry.ipAddress,
      10 * 60 * 1000,
    ); // 10 minutes
    const failedAttempts = recentLogs.filter(
      (log) =>
        log.eventType === "auth.login.failure" &&
        log.ipAddress === logEntry.ipAddress,
    );

    if (failedAttempts.length >= SECURITY_CONFIG.ALERT_MULTIPLE_FAILURES) {
      await this.createSecurityAlert(
        "multiple.failed.logins",
        "critical",
        `Multiple failed login attempts from IP: ${logEntry.ipAddress}`,
        `${failedAttempts.length} failed login attempts detected in the last 10 minutes from IP ${logEntry.ipAddress}`,
        logEntry,
        failedAttempts,
      );
    }
  }

  /**
   * Check for unusual login patterns
   */
  private static async checkUnusualLoginPatterns(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    if (!logEntry.userId) return;

    const userLogs = await this.getRecentLogsByUser(
      logEntry.userId,
      30 * 24 * 60 * 60 * 1000,
    ); // 30 days
    const previousLogins = userLogs.filter(
      (log) =>
        log.eventType === "auth.login.success" &&
        log.userId === logEntry.userId,
    );

    // Check for new location
    if (logEntry.location && previousLogins.length > 0) {
      const previousLocations = previousLogins
        .map((log) => log.location?.country)
        .filter(Boolean);

      if (!previousLocations.includes(logEntry.location.country)) {
        await this.createSecurityAlert(
          "suspicious.location",
          "medium",
          `Login from new location: ${logEntry.location.country}`,
          `User ${logEntry.username} logged in from a new country: ${logEntry.location.country}`,
          logEntry,
          [],
        );
      }
    }
  }

  /**
   * Check for rate limit violations
   */
  private static async checkRateLimitViolations(
    logEntry: AuditLogEntry,
  ): Promise<void> {
    await this.createSecurityAlert(
      "rate.limit.violation",
      "high",
      `Rate limit exceeded from IP: ${logEntry.ipAddress}`,
      `Rate limiting triggered for IP ${logEntry.ipAddress} - possible automated attack`,
      logEntry,
      [],
    );
  }

  /**
   * Create security alert
   */
  private static async createSecurityAlert(
    alertType: SecurityAlertType,
    severity: "low" | "medium" | "high" | "critical",
    title: string,
    description: string,
    triggerEvent: AuditLogEntry,
    relatedEvents: AuditLogEntry[],
  ): Promise<void> {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      alertType,
      severity,
      title,
      description,
      userId: triggerEvent.userId,
      ipAddress: triggerEvent.ipAddress,
      userAgent: triggerEvent.userAgent,
      triggerEvent,
      relatedEvents,
      resolved: false,
    };

    this.securityAlerts.set(alert.id, alert);

    // Log alert to console
    console.warn(`🚨 [SecurityAlert] ${severity.toUpperCase()}: ${title}`);
    console.warn(`   Description: ${description}`);
    console.warn(`   IP: ${triggerEvent.ipAddress}`);
    console.warn(`   User: ${triggerEvent.username || "Unknown"}`);
    console.warn(`   Time: ${triggerEvent.timestamp}`);

    // TODO: Send alert to monitoring system/email
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private static calculateRiskLevel(
    eventType: AuditEventType,
    result: "success" | "failure" | "warning",
    details: any,
  ): "low" | "medium" | "high" | "critical" {
    // High risk events
    if (eventType === "auth.suspicious.activity") return "critical";
    if (eventType === "auth.security.violation") return "critical";
    if (eventType === "auth.account.locked") return "high";

    // Medium risk events
    if (result === "failure") return "medium";
    if (eventType === "auth.password.reset.request") return "medium";

    // Low risk events
    return "low";
  }

  private static async storeAuditLog(logEntry: AuditLogEntry): Promise<void> {
    this.auditLogs.set(logEntry.id, logEntry);

    // In production, this would store to database
    // await db.auditLogs.create({ data: logEntry });
  }

  private static logToConsole(logEntry: AuditLogEntry): void {
    const emoji =
      logEntry.result === "success"
        ? "✅"
        : logEntry.result === "failure"
          ? "❌"
          : "⚠️";
    const risk =
      logEntry.risk_level === "critical"
        ? "🚨"
        : logEntry.risk_level === "high"
          ? "🔴"
          : "";

    console.log(
      `${emoji} ${risk} [Audit] ${logEntry.eventType} - ${logEntry.action}`,
    );
    console.log(
      `   User: ${logEntry.username || "Unknown"} (${logEntry.userId || "N/A"})`,
    );
    console.log(
      `   IP: ${logEntry.ipAddress} | Location: ${logEntry.location?.country || "Unknown"}`,
    );
    console.log(`   Time: ${logEntry.timestamp}`);

    if (logEntry.result === "failure" && logEntry.details.failureReason) {
      console.log(`   Reason: ${logEntry.details.failureReason}`);
    }
  }

  private static async getLocationFromIP(
    ipAddress: string,
  ): Promise<LocationInfo | undefined> {
    // Reuse the location service from UnifiedAuthService
    // This is a placeholder implementation
    if (
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.")
    ) {
      return {
        country: "Local",
        region: "Development",
        city: "localhost",
        timezone: "UTC",
        isp: "Local Network",
      };
    }
    return undefined;
  }

  private static async getRecentLogsByIP(
    ipAddress: string,
    timeWindow: number,
  ): Promise<AuditLogEntry[]> {
    const cutoff = new Date(Date.now() - timeWindow);
    return Array.from(this.auditLogs.values()).filter(
      (log) => log.ipAddress === ipAddress && new Date(log.timestamp) > cutoff,
    );
  }

  private static async getRecentLogsByUser(
    userId: string,
    timeWindow: number,
  ): Promise<AuditLogEntry[]> {
    const cutoff = new Date(Date.now() - timeWindow);
    return Array.from(this.auditLogs.values()).filter(
      (log) => log.userId === userId && new Date(log.timestamp) > cutoff,
    );
  }

  // ============================================
  // PUBLIC QUERY METHODS
  // ============================================

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(
    userId: string,
    limit = 50,
  ): Promise<AuditLogEntry[]> {
    return Array.from(this.auditLogs.values())
      .filter((log) => log.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts(resolved = false): Promise<SecurityAlert[]> {
    return Array.from(this.securityAlerts.values())
      .filter((alert) => alert.resolved === resolved)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(retentionDays = 90): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [logId, log] of this.auditLogs.entries()) {
      if (new Date(log.timestamp) < cutoff) {
        this.auditLogs.delete(logId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 [AuditLogger] Cleaned up ${cleanedCount} old audit logs`);
    }

    return cleanedCount;
  }
}
