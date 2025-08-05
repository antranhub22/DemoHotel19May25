// ============================================
// DATABASE AUDIT LOGGER
// ============================================
// Production audit logging with real database storage

import { SECURITY_CONFIG } from "@auth/config";
import type { AuditLogEntry, SecurityAlert } from "@auth/types";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
import crypto from "crypto";

export class DatabaseAuditLogger {
  // ============================================
  // AUDIT LOG OPERATIONS
  // ============================================

  /**
   * Store audit log entry in database
   */
  static async storeAuditLog(logEntry: AuditLogEntry): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).$executeRaw`
            INSERT INTO audit_logs (
                id, timestamp, event_type, user_id, username, email,
                ip_address, user_agent, session_id, action, resource,
                result, details, risk_level, location_info
            ) VALUES (
                ${logEntry.id}, ${logEntry.timestamp}::timestamptz, ${logEntry.eventType},
                ${logEntry.userId}, ${logEntry.username}, ${logEntry.email},
                ${logEntry.ipAddress}::inet, ${logEntry.userAgent}, ${logEntry.sessionId},
                ${logEntry.action}, ${logEntry.resource}, ${logEntry.result},
                ${JSON.stringify(logEntry.details)}::jsonb, ${logEntry.risk_level},
                ${JSON.stringify(logEntry.location || {})}::jsonb
            )
        `;
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 50,
  ): Promise<AuditLogEntry[]> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM audit_logs 
            WHERE user_id = ${userId}
            ORDER BY timestamp DESC 
            LIMIT ${limit}
        `;

    return result.map((row: any) => this.mapDbRowToAuditLogEntry(row));
  }

  /**
   * Get recent logs by IP address
   */
  static async getRecentLogsByIP(
    ipAddress: string,
    timeWindow: number,
  ): Promise<AuditLogEntry[]> {
    const prisma = await PrismaConnectionManager.getInstance();
    const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM audit_logs 
            WHERE ip_address = ${ipAddress}::inet
                AND timestamp >= ${cutoffTime}::timestamptz
            ORDER BY timestamp DESC
        `;

    return result.map((row: any) => this.mapDbRowToAuditLogEntry(row));
  }

  /**
   * Get recent logs by user
   */
  static async getRecentLogsByUser(
    userId: string,
    timeWindow: number,
  ): Promise<AuditLogEntry[]> {
    const prisma = await PrismaConnectionManager.getInstance();
    const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM audit_logs 
            WHERE user_id = ${userId}
                AND timestamp >= ${cutoffTime}::timestamptz
            ORDER BY timestamp DESC
        `;

    return result.map((row: any) => this.mapDbRowToAuditLogEntry(row));
  }

  /**
   * Get failed login attempts by IP
   */
  static async getFailedLoginsByIP(
    ipAddress: string,
    timeWindow: number,
  ): Promise<AuditLogEntry[]> {
    const prisma = await PrismaConnectionManager.getInstance();
    const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM audit_logs 
            WHERE ip_address = ${ipAddress}::inet
                AND event_type = 'auth.login.failure'
                AND timestamp >= ${cutoffTime}::timestamptz
            ORDER BY timestamp DESC
        `;

    return result.map((row: any) => this.mapDbRowToAuditLogEntry(row));
  }

  // ============================================
  // SECURITY ALERT OPERATIONS
  // ============================================

  /**
   * Store security alert in database
   */
  static async storeSecurityAlert(alert: SecurityAlert): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).$executeRaw`
            INSERT INTO security_alerts (
                id, timestamp, alert_type, severity, title, description,
                user_id, ip_address, user_agent, trigger_event_id,
                related_events, action_taken, resolved
            ) VALUES (
                ${alert.id}, ${alert.timestamp}::timestamptz, ${alert.alertType},
                ${alert.severity}, ${alert.title}, ${alert.description},
                ${alert.userId}, ${alert.ipAddress}::inet, ${alert.userAgent},
                ${alert.triggerEvent.id}, ${JSON.stringify(alert.relatedEvents.map((e) => e.id))}::jsonb,
                ${alert.actionTaken}, ${alert.resolved}
            )
        `;
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts(
    resolved: boolean = false,
    limit: number = 100,
  ): Promise<SecurityAlert[]> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT 
                sa.*,
                al.* as trigger_event_data
            FROM security_alerts sa
            LEFT JOIN audit_logs al ON sa.trigger_event_id = al.id
            WHERE sa.resolved = ${resolved}
            ORDER BY sa.timestamp DESC 
            LIMIT ${limit}
        `;

    // Map results back to SecurityAlert objects
    const alertsMap = new Map<string, any>();

    result.forEach((row: any) => {
      if (!alertsMap.has(row.id)) {
        alertsMap.set(row.id, {
          id: row.id,
          timestamp: row.timestamp.toISOString(),
          alertType: row.alert_type,
          severity: row.severity,
          title: row.title,
          description: row.description,
          userId: row.user_id,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          triggerEvent: row.trigger_event_data
            ? this.mapDbRowToAuditLogEntry(row)
            : null,
          relatedEvents: [], // Will be populated separately if needed
          actionTaken: row.action_taken,
          resolved: row.resolved,
        });
      }
    });

    return Array.from(alertsMap.values());
  }

  /**
   * Resolve security alert
   */
  static async resolveSecurityAlert(
    alertId: string,
    resolvedBy: string,
    actionTaken?: string,
  ): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).$executeRaw`
            UPDATE security_alerts 
            SET 
                resolved = true,
                resolved_at = CURRENT_TIMESTAMP,
                resolved_by = ${resolvedBy},
                action_taken = COALESCE(${actionTaken}, action_taken)
            WHERE id = ${alertId}
        `;
  }

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  /**
   * Get audit statistics
   */
  static async getAuditStats(
    timeWindow: number = 24 * 60 * 60 * 1000,
  ): Promise<{
    totalEvents: number;
    successEvents: number;
    failureEvents: number;
    byEventType: Record<string, number>;
    byRiskLevel: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  }> {
    const prisma = await PrismaConnectionManager.getInstance();
    const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

    const [
      totalResult,
      successResult,
      failureResult,
      eventTypeResult,
      riskLevelResult,
      ipResult,
    ] = await Promise.all([
      (prisma as any).$queryRaw`
                SELECT COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz
            `,
      (prisma as any).$queryRaw`
                SELECT COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz AND result = 'success'
            `,
      (prisma as any).$queryRaw`
                SELECT COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz AND result = 'failure'
            `,
      (prisma as any).$queryRaw`
                SELECT event_type, COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz
                GROUP BY event_type
                ORDER BY count DESC
            `,
      (prisma as any).$queryRaw`
                SELECT risk_level, COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz
                GROUP BY risk_level
                ORDER BY count DESC
            `,
      (prisma as any).$queryRaw`
                SELECT ip_address, COUNT(*) as count FROM audit_logs 
                WHERE timestamp >= ${cutoffTime}::timestamptz
                GROUP BY ip_address
                ORDER BY count DESC
                LIMIT 10
            `,
    ]);

    const byEventType: Record<string, number> = {};
    eventTypeResult.forEach((row: any) => {
      byEventType[row.event_type] = parseInt(row.count);
    });

    const byRiskLevel: Record<string, number> = {};
    riskLevelResult.forEach((row: any) => {
      byRiskLevel[row.risk_level] = parseInt(row.count);
    });

    const topIPs = ipResult.map((row: any) => ({
      ip: row.ip_address,
      count: parseInt(row.count),
    }));

    return {
      totalEvents: parseInt(totalResult[0]?.count || "0"),
      successEvents: parseInt(successResult[0]?.count || "0"),
      failureEvents: parseInt(failureResult[0]?.count || "0"),
      byEventType,
      byRiskLevel,
      topIPs,
    };
  }

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$executeRaw`
            DELETE FROM audit_logs 
            WHERE timestamp <= CURRENT_TIMESTAMP - interval '${retentionDays} days'
        `;

    if (result > 0) {
      console.log(
        `🧹 [DatabaseAuditLogger] Cleaned up ${result} old audit logs`,
      );
    }

    return result;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Map database row to AuditLogEntry
   */
  private static mapDbRowToAuditLogEntry(row: any): AuditLogEntry {
    return {
      id: row.id,
      timestamp: row.timestamp.toISOString(),
      eventType: row.event_type,
      userId: row.user_id,
      username: row.username,
      email: row.email,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      action: row.action,
      resource: row.resource,
      result: row.result,
      details: row.details || {},
      risk_level: row.risk_level,
      location: row.location_info || undefined,
    };
  }

  /**
   * Check for suspicious patterns in real-time
   */
  static async checkSuspiciousPatterns(
    logEntry: AuditLogEntry,
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Check for multiple failed logins
    if (logEntry.eventType === "auth.login.failure") {
      const recentFailures = await this.getFailedLoginsByIP(
        logEntry.ipAddress,
        10 * 60 * 1000,
      ); // 10 minutes

      if (recentFailures.length >= SECURITY_CONFIG.ALERT_MULTIPLE_FAILURES) {
        const alert: SecurityAlert = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          alertType: "multiple.failed.logins",
          severity: "critical",
          title: `Multiple failed login attempts from IP: ${logEntry.ipAddress}`,
          description: `${recentFailures.length} failed login attempts detected in the last 10 minutes from IP ${logEntry.ipAddress}`,
          userId: logEntry.userId,
          ipAddress: logEntry.ipAddress,
          userAgent: logEntry.userAgent,
          triggerEvent: logEntry,
          relatedEvents: recentFailures,
          resolved: false,
        };

        await this.storeSecurityAlert(alert);
        alerts.push(alert);
      }
    }

    return alerts;
  }
}
