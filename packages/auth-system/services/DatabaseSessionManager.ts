// ============================================
// DATABASE SESSION MANAGER
// ============================================
// Production session management with real database storage

import { SECURITY_CONFIG } from "@auth/config";
import type { LocationInfo, SessionData } from "@auth/types";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";

export class DatabaseSessionManager {
  // ============================================
  // SESSION CRUD OPERATIONS
  // ============================================

  /**
   * Create new session in database
   */
  static async createSession(sessionData: SessionData): Promise<SessionData> {
    const prisma = await PrismaConnectionManager.getInstance();

    const session = await (prisma as any).$executeRaw`
            INSERT INTO user_sessions (
                id, user_id, token_id, device_info, ip_address, user_agent,
                location_info, created_at, last_active_at, expires_at, is_active
            ) VALUES (
                ${sessionData.id}, ${sessionData.userId}, ${sessionData.tokenId},
                ${JSON.stringify(sessionData.deviceInfo)}::jsonb, ${sessionData.ipAddress}::inet,
                ${sessionData.userAgent}, ${JSON.stringify(sessionData.location || {})}::jsonb,
                ${sessionData.createdAt}::timestamptz, ${sessionData.lastActiveAt}::timestamptz,
                ${sessionData.expiresAt}::timestamptz, ${sessionData.isActive}
            )
        `;

    return sessionData;
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string): Promise<SessionData | null> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM user_sessions WHERE id = ${sessionId} LIMIT 1
        `;

    if (result.length === 0) return null;

    return this.mapDbRowToSessionData(result[0]);
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM user_sessions 
            WHERE user_id = ${userId} 
            ORDER BY last_active_at DESC
        `;

    return result.map((row: any) => this.mapDbRowToSessionData(row));
  }

  /**
   * Get active sessions for a user
   */
  static async getActiveUserSessions(userId: string): Promise<SessionData[]> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM user_sessions 
            WHERE user_id = ${userId} 
                AND is_active = true 
                AND expires_at > CURRENT_TIMESTAMP
            ORDER BY last_active_at DESC
        `;

    return result.map((row: any) => this.mapDbRowToSessionData(row));
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionId: string): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).$executeRaw`
            UPDATE user_sessions 
            SET last_active_at = CURRENT_TIMESTAMP
            WHERE id = ${sessionId}
        `;
  }

  /**
   * Terminate session
   */
  static async terminateSession(sessionId: string): Promise<boolean> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$executeRaw`
            UPDATE user_sessions 
            SET is_active = false 
            WHERE id = ${sessionId}
        `;

    return result > 0;
  }

  /**
   * Terminate all user sessions except current
   */
  static async terminateOtherUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$executeRaw`
            UPDATE user_sessions 
            SET is_active = false 
            WHERE user_id = ${userId} 
                AND id != ${currentSessionId}
                AND is_active = true
        `;

    return result;
  }

  /**
   * Enforce session limits for user
   */
  static async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.getActiveUserSessions(userId);

    if (activeSessions.length >= SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS) {
      // Sort by last activity and terminate oldest
      const sessionsToTerminate = activeSessions
        .sort(
          (a, b) =>
            new Date(a.lastActiveAt).getTime() -
            new Date(b.lastActiveAt).getTime(),
        )
        .slice(
          0,
          activeSessions.length - SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS + 1,
        );

      for (const session of sessionsToTerminate) {
        await this.terminateSession(session.id);
        console.log(
          `🔄 [SessionManager] Terminated session ${session.id} due to limit`,
        );
      }
    }
  }

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$executeRaw`
            DELETE FROM user_sessions 
            WHERE expires_at <= CURRENT_TIMESTAMP OR is_active = false
        `;

    if (result > 0) {
      console.log(`🧹 [SessionManager] Cleaned up ${result} expired sessions`);
    }

    return result;
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byDevice: Record<string, number>;
  }> {
    const prisma = await PrismaConnectionManager.getInstance();

    const [totalResult, activeResult, deviceResult] = await Promise.all([
      (prisma as any).$queryRaw`SELECT COUNT(*) as count FROM user_sessions`,
      (prisma as any).$queryRaw`
                SELECT COUNT(*) as count FROM user_sessions 
                WHERE is_active = true AND expires_at > CURRENT_TIMESTAMP
            `,
      (prisma as any).$queryRaw`
                SELECT 
                    device_info->>'type' as device_type,
                    COUNT(*) as count
                FROM user_sessions 
                WHERE is_active = true AND expires_at > CURRENT_TIMESTAMP
                GROUP BY device_info->>'type'
            `,
    ]);

    const total = parseInt(totalResult[0]?.count || "0");
    const active = parseInt(activeResult[0]?.count || "0");

    const byDevice: Record<string, number> = {};
    deviceResult.forEach((row: any) => {
      byDevice[row.device_type || "unknown"] = parseInt(row.count);
    });

    return {
      total,
      active,
      expired: total - active,
      byDevice,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Map database row to SessionData
   */
  private static mapDbRowToSessionData(row: any): SessionData {
    return {
      id: row.id,
      userId: row.user_id,
      tokenId: row.token_id,
      deviceInfo: row.device_info || {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      location: row.location_info || undefined,
      createdAt: row.created_at.toISOString(),
      lastActiveAt: row.last_active_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      isActive: row.is_active,
    };
  }

  /**
   * Check if session exists by token ID
   */
  static async sessionExistsByTokenId(tokenId: string): Promise<boolean> {
    const prisma = await PrismaConnectionManager.getInstance();

    const result = await (prisma as any).$queryRaw`
            SELECT 1 FROM user_sessions 
            WHERE token_id = ${tokenId} 
                AND is_active = true 
                AND expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        `;

    return result.length > 0;
  }

  /**
   * Get sessions by IP address (for security monitoring)
   */
  static async getSessionsByIP(
    ipAddress: string,
    timeWindow: number = 24 * 60 * 60 * 1000,
  ): Promise<SessionData[]> {
    const prisma = await PrismaConnectionManager.getInstance();
    const cutoffTime = new Date(Date.now() - timeWindow).toISOString();

    const result = await (prisma as any).$queryRaw`
            SELECT * FROM user_sessions 
            WHERE ip_address = ${ipAddress}::inet
                AND created_at >= ${cutoffTime}::timestamptz
            ORDER BY created_at DESC
        `;

    return result.map((row: any) => this.mapDbRowToSessionData(row));
  }

  /**
   * Update session location info
   */
  static async updateSessionLocation(
    sessionId: string,
    location: LocationInfo,
  ): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).$executeRaw`
            UPDATE user_sessions 
            SET location_info = ${JSON.stringify(location)}::jsonb
            WHERE id = ${sessionId}
        `;
  }
}
