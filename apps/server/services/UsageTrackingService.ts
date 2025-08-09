/**
 * SaaS Provider Domain - Usage Tracking Service
 * Real-time usage monitoring, analytics, and limit enforcement
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface UsageMetrics {
  totalCalls: number;
  currentMonthCalls: number;
  currentMonthMinutes: number;
  currentMonthApiCalls: number;
  remainingCalls: number;
  remainingMinutes: number;
  activeStaffMembers: number;
  storageUsed: number; // in MB
  lastUpdated: Date;
}

export interface UsageEvent {
  id?: string;
  tenantId: string;
  eventType:
    | "call_started"
    | "call_ended"
    | "api_request"
    | "feature_used"
    | "subscription_changed"
    | "subscription_cancelled"
    | "subscription_reactivated"
    | "payment_processed";
  metadata: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

export interface UsageAlert {
  id: string;
  tenantId: string;
  type:
    | "approaching_limit"
    | "limit_exceeded"
    | "trial_ending"
    | "payment_failed";
  metric: "calls" | "minutes" | "api_calls" | "storage" | "trial_days";
  currentValue: number;
  limitValue: number;
  threshold: number;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================
// USAGE TRACKING SERVICE
// ============================================

export class UsageTrackingService extends EventEmitter {
  private prisma: PrismaClient;
  private cacheTimeout = 300000; // 5 minutes
  private usageCache = new Map<
    string,
    { data: UsageMetrics; expiry: number }
  >();
  private processingQueue: UsageEvent[] = [];
  private isProcessing = false;

  constructor() {
    super();
    this.prisma = new PrismaClient();

    // Start background processing
    this.startBackgroundProcessing();

    logger.info("[UsageTrackingService] Initialized with real-time processing");
  }

  // ============================================
  // REAL-TIME USAGE TRACKING
  // ============================================

  /**
   * Track a usage event
   */
  async trackEvent(
    tenantId: string,
    eventType: UsageEvent["eventType"],
    metadata: Record<string, any> = {},
    timestamp: Date = new Date(),
  ): Promise<void> {
    try {
      const event: UsageEvent = {
        tenantId,
        eventType,
        metadata,
        timestamp,
        processed: false,
      };

      // Add to processing queue for async processing
      this.processingQueue.push(event);

      // Immediately update cache for real-time response
      await this.updateCacheFromEvent(event);

      // Emit event for real-time subscriptions
      this.emit("usage_event", event);

      logger.debug("[UsageTrackingService] Event tracked", {
        tenantId,
        eventType,
        queueSize: this.processingQueue.length,
      });
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error tracking event", error);
      throw error;
    }
  }

  /**
   * Get current usage statistics
   */
  async getCurrentUsage(tenantId: string): Promise<UsageMetrics> {
    try {
      // Check cache first
      const cached = this.usageCache.get(tenantId);
      if (cached && cached.expiry > Date.now()) {
        logger.debug("[UsageTrackingService] Returning cached usage", {
          tenantId,
        });
        return cached.data;
      }

      // Calculate current usage from database
      const usage = await this.calculateCurrentUsage(tenantId);

      // Update cache
      this.usageCache.set(tenantId, {
        data: usage,
        expiry: Date.now() + this.cacheTimeout,
      });

      logger.debug("[UsageTrackingService] Current usage calculated", {
        tenantId,
        calls: usage.currentMonthCalls,
        minutes: usage.currentMonthMinutes,
      });

      return usage;
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error getting current usage", error);
      throw error;
    }
  }

  /**
   * Get usage history with pagination
   */
  async getUsageHistory(
    tenantId: string,
    period: string = "current_month",
    page: number = 1,
    limit: number = 50,
  ): Promise<any[]> {
    try {
      const offset = (page - 1) * limit;
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get usage events from database
      const events = await this.prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          event_type,
          COUNT(*) as count,
          SUM(CASE WHEN metadata->>'duration' IS NOT NULL THEN (metadata->>'duration')::integer ELSE 0 END) as total_minutes
        FROM usage_events 
        WHERE tenant_id = ${tenantId}
          AND timestamp >= ${startDate}
          AND timestamp <= ${endDate}
        GROUP BY DATE(timestamp), event_type
        ORDER BY date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      return events as any[];
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error getting usage history", error);
      throw error;
    }
  }

  // ============================================
  // LIMIT ENFORCEMENT
  // ============================================

  /**
   * Check if tenant has exceeded limits
   */
  async checkLimits(tenantId: string, limits: any): Promise<UsageAlert[]> {
    try {
      const usage = await this.getCurrentUsage(tenantId);
      const alerts: UsageAlert[] = [];

      // Check call limits
      if (usage.currentMonthCalls >= limits.maxCalls * 0.8) {
        alerts.push(
          this.createUsageAlert(
            tenantId,
            "calls",
            usage.currentMonthCalls,
            limits.maxCalls,
            usage.currentMonthCalls >= limits.maxCalls
              ? "limit_exceeded"
              : "approaching_limit",
          ),
        );
      }

      // Check minute limits
      if (usage.currentMonthMinutes >= limits.maxMonthlyMinutes * 0.8) {
        alerts.push(
          this.createUsageAlert(
            tenantId,
            "minutes",
            usage.currentMonthMinutes,
            limits.maxMonthlyMinutes,
            usage.currentMonthMinutes >= limits.maxMonthlyMinutes
              ? "limit_exceeded"
              : "approaching_limit",
          ),
        );
      }

      // Check API call limits
      if (usage.currentMonthApiCalls >= limits.maxApiCalls * 0.8) {
        alerts.push(
          this.createUsageAlert(
            tenantId,
            "api_calls",
            usage.currentMonthApiCalls,
            limits.maxApiCalls,
            usage.currentMonthApiCalls >= limits.maxApiCalls
              ? "limit_exceeded"
              : "approaching_limit",
          ),
        );
      }

      // Save alerts to database
      if (alerts.length > 0) {
        await this.saveUsageAlerts(alerts);
      }

      return alerts;
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error checking limits", error);
      throw error;
    }
  }

  /**
   * Check if action is allowed based on current usage
   */
  async isActionAllowed(
    tenantId: string,
    actionType: "call" | "api_request" | "feature_access",
    limits: any,
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const usage = await this.getCurrentUsage(tenantId);

      switch (actionType) {
        case "call":
          if (usage.currentMonthCalls >= limits.maxCalls) {
            return { allowed: false, reason: "Monthly call limit exceeded" };
          }
          break;

        case "api_request":
          if (usage.currentMonthApiCalls >= limits.maxApiCalls) {
            return {
              allowed: false,
              reason: "Monthly API call limit exceeded",
            };
          }
          break;

        case "feature_access":
          // Additional feature-specific checks can be added here
          break;
      }

      return { allowed: true };
    } catch (error: any) {
      logger.error(
        "[UsageTrackingService] Error checking action allowance",
        error,
      );
      return { allowed: false, reason: "Unable to verify usage limits" };
    }
  }

  // ============================================
  // BACKGROUND PROCESSING
  // ============================================

  /**
   * Start background processing of usage events
   */
  private startBackgroundProcessing(): void {
    setInterval(async () => {
      if (this.isProcessing || this.processingQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        const events = this.processingQueue.splice(0, 100); // Process in batches
        await this.processUsageEvents(events);

        logger.debug("[UsageTrackingService] Processed usage events batch", {
          count: events.length,
          queueRemaining: this.processingQueue.length,
        });
      } catch (error: any) {
        logger.error(
          "[UsageTrackingService] Error processing usage events",
          error,
        );
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process usage events and save to database
   */
  private async processUsageEvents(events: UsageEvent[]): Promise<void> {
    if (events.length === 0) return;

    try {
      // Group events by tenant for efficient processing
      const eventsByTenant = events.reduce(
        (acc, event) => {
          if (!acc[event.tenantId]) {
            acc[event.tenantId] = [];
          }
          acc[event.tenantId].push(event);
          return acc;
        },
        {} as Record<string, UsageEvent[]>,
      );

      // Process events for each tenant
      for (const [tenantId, tenantEvents] of Object.entries(eventsByTenant)) {
        await this.processTenantEvents(tenantId, tenantEvents);
      }
    } catch (error: any) {
      logger.error(
        "[UsageTrackingService] Error processing usage events batch",
        error,
      );
      throw error;
    }
  }

  /**
   * Process events for a specific tenant
   */
  private async processTenantEvents(
    tenantId: string,
    events: UsageEvent[],
  ): Promise<void> {
    try {
      // Save events to database
      await this.saveEventsToDatabase(events);

      // Update aggregated usage statistics
      await this.updateAggregatedUsage(tenantId, events);

      // Check for limit violations
      // This would trigger alerts if needed
      // await this.checkAndTriggerAlerts(tenantId);
    } catch (error: any) {
      logger.error(
        "[UsageTrackingService] Error processing tenant events",
        error,
      );
      throw error;
    }
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Update cache from real-time event
   */
  private async updateCacheFromEvent(event: UsageEvent): Promise<void> {
    const cached = this.usageCache.get(event.tenantId);
    if (!cached) return;

    const usage = cached.data;

    switch (event.eventType) {
      case "call_started":
        // Don't increment here, wait for call_ended
        break;

      case "call_ended":
        usage.currentMonthCalls += 1;
        usage.totalCalls += 1;
        if (event.metadata.duration) {
          usage.currentMonthMinutes += Math.round(event.metadata.duration / 60);
        }
        break;

      case "api_request":
        usage.currentMonthApiCalls += 1;
        break;
    }

    usage.lastUpdated = new Date();

    // Update cache
    this.usageCache.set(event.tenantId, {
      data: usage,
      expiry: cached.expiry, // Keep original expiry
    });
  }

  /**
   * Calculate current usage from database
   */
  private async calculateCurrentUsage(tenantId: string): Promise<UsageMetrics> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    try {
      // Get current month statistics
      const monthlyStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(CASE WHEN event_type = 'call_ended' THEN 1 END) as monthly_calls,
          SUM(CASE WHEN event_type = 'call_ended' AND metadata->>'duration' IS NOT NULL 
                   THEN (metadata->>'duration')::integer ELSE 0 END) / 60 as monthly_minutes,
          COUNT(CASE WHEN event_type = 'api_request' THEN 1 END) as monthly_api_calls
        FROM usage_events 
        WHERE tenant_id = ${tenantId} 
          AND timestamp >= ${currentMonth}
      `;

      // Get total statistics
      const totalStats = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as total_calls
        FROM usage_events 
        WHERE tenant_id = ${tenantId} 
          AND event_type = 'call_ended'
      `;

      // Get storage usage (simplified calculation)
      const storageStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) * 0.5 as storage_mb  -- Estimate 0.5MB per call record
        FROM call_summaries cs
        JOIN call c ON c.call_id_vapi = cs.call_id
        WHERE c.tenant_id = ${tenantId}
      `;

      // Get active staff count
      const staffStats = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as active_staff
        FROM staff 
        WHERE tenant_id = ${tenantId} 
          AND is_active = true
      `;

      const monthlyData = monthlyStats[0] || {};
      const totalData = totalStats[0] || {};
      const storageData = storageStats[0] || {};
      const staffData = staffStats[0] || {};

      return {
        totalCalls: parseInt(totalData.total_calls) || 0,
        currentMonthCalls: parseInt(monthlyData.monthly_calls) || 0,
        currentMonthMinutes:
          Math.round(parseFloat(monthlyData.monthly_minutes)) || 0,
        currentMonthApiCalls: parseInt(monthlyData.monthly_api_calls) || 0,
        remainingCalls: 0, // Will be calculated by controller based on limits
        remainingMinutes: 0, // Will be calculated by controller based on limits
        activeStaffMembers: parseInt(staffData.active_staff) || 0,
        storageUsed: Math.round(parseFloat(storageData.storage_mb)) || 0,
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error calculating usage", error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private createUsageAlert(
    tenantId: string,
    metric: string,
    currentValue: number,
    limitValue: number,
    type: "approaching_limit" | "limit_exceeded",
  ): UsageAlert {
    const percentage = Math.round((currentValue / limitValue) * 100);

    return {
      id: `${metric}-${tenantId}-${Date.now()}`,
      tenantId,
      type,
      metric: metric as any,
      currentValue,
      limitValue,
      threshold: type === "limit_exceeded" ? 100 : 80,
      message: `${metric.toUpperCase()}: ${percentage}% of limit used (${currentValue}/${limitValue})`,
      severity:
        type === "limit_exceeded"
          ? "critical"
          : percentage >= 95
            ? "critical"
            : "warning",
      createdAt: new Date(),
    };
  }

  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (period) {
      case "current_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last_7_days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last_30_days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }

  private async saveEventsToDatabase(events: UsageEvent[]): Promise<void> {
    try {
      // Create usage_events table records
      const eventData = events.map((event) => ({
        tenant_id: event.tenantId,
        event_type: event.eventType,
        metadata: JSON.stringify(event.metadata),
        timestamp: event.timestamp,
        processed: true,
      }));

      // Batch insert using raw SQL for better performance
      if (eventData.length > 0) {
        await this.prisma.$executeRaw`
          INSERT INTO usage_events (tenant_id, event_type, metadata, timestamp, processed)
          VALUES ${eventData.map((e) => `(${e.tenant_id}, ${e.event_type}, ${e.metadata}, ${e.timestamp}, ${e.processed})`).join(", ")}
        `;
      }
    } catch (error: any) {
      logger.error(
        "[UsageTrackingService] Error saving events to database",
        error,
      );
      throw error;
    }
  }

  private async updateAggregatedUsage(
    tenantId: string,
    events: UsageEvent[],
  ): Promise<void> {
    // Update aggregated usage statistics in a separate table for faster queries
    // This could be implemented based on specific requirements
  }

  private async saveUsageAlerts(alerts: UsageAlert[]): Promise<void> {
    try {
      // Save alerts to database for persistence and notification
      // This would integrate with notification systems
      for (const alert of alerts) {
        logger.warn("[UsageTrackingService] Usage alert generated", {
          tenantId: alert.tenantId,
          type: alert.type,
          metric: alert.metric,
          severity: alert.severity,
          message: alert.message,
        });
      }
    } catch (error: any) {
      logger.error("[UsageTrackingService] Error saving usage alerts", error);
    }
  }

  // ============================================
  // CLEANUP & SHUTDOWN
  // ============================================

  async shutdown(): Promise<void> {
    logger.info("[UsageTrackingService] Shutting down...");

    // Process remaining events
    if (this.processingQueue.length > 0) {
      await this.processUsageEvents(this.processingQueue.splice(0));
    }

    // Close database connection
    await this.prisma.$disconnect();

    logger.info("[UsageTrackingService] Shutdown complete");
  }
}
