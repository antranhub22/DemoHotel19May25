/**
 * Dashboard Logger Utility - ZERO RISK Enhancement
 * Provides structured logging for dashboard operations without affecting business logic
 */

export interface DashboardMetrics {
  endpoint: string;
  responseTime: number;
  dataPoints: number;
  success: boolean;
  timestamp: string;
  userId?: string;
  errorDetails?: string;
}

export interface PerformanceMetrics {
  fetchDuration: number;
  calculationDuration: number;
  totalDataPoints: number;
  requestsCount: number;
  cacheHit?: boolean;
}

class DashboardLogger {
  private metrics: DashboardMetrics[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private maxHistorySize = 50; // Keep last 50 entries

  /**
   * Log dashboard data fetch operation
   */
  logDataFetch(metrics: DashboardMetrics): void {
    try {
      // Add to metrics history
      this.metrics.push({
        ...metrics,
        timestamp: new Date().toISOString(),
      });

      // Keep only recent metrics
      if (this.metrics.length > this.maxHistorySize) {
        this.metrics = this.metrics.slice(-this.maxHistorySize);
      }

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        const logLevel = metrics.success ? 'info' : 'error';
        const emoji = metrics.success ? '✅' : '❌';

        console.log(`${emoji} [Dashboard] ${metrics.endpoint}`, {
          responseTime: `${metrics.responseTime}ms`,
          dataPoints: metrics.dataPoints,
          success: metrics.success,
          ...(metrics.errorDetails && { error: metrics.errorDetails }),
        });
      }

      // Store in localStorage for debugging (non-production only)
      if (process.env.NODE_ENV !== 'production') {
        localStorage.setItem(
          'dashboard_metrics',
          JSON.stringify(this.metrics.slice(-10))
        );
      }
    } catch (error) {
      // Silent fail - logging should never break the app
      console.warn('Dashboard logger failed:', error);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(metrics: PerformanceMetrics): void {
    try {
      this.performanceHistory.push({
        ...metrics,
        timestamp: new Date().toISOString(),
      } as any);

      // Keep only recent performance data
      if (this.performanceHistory.length > this.maxHistorySize) {
        this.performanceHistory = this.performanceHistory.slice(
          -this.maxHistorySize
        );
      }

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [Dashboard Performance]', {
          fetchTime: `${metrics.fetchDuration}ms`,
          calcTime: `${metrics.calculationDuration}ms`,
          dataPoints: metrics.totalDataPoints,
          cacheHit: metrics.cacheHit || false,
        });
      }
    } catch (error) {
      // Silent fail
      console.warn('Performance logging failed:', error);
    }
  }

  /**
   * Get performance analytics
   */
  getAnalytics() {
    try {
      const recentMetrics = this.metrics.slice(-20);
      const recentPerformance = this.performanceHistory.slice(-20);

      return {
        totalFetches: recentMetrics.length,
        successRate:
          recentMetrics.length > 0
            ? (recentMetrics.filter(m => m.success).length /
                recentMetrics.length) *
              100
            : 0,
        averageResponseTime:
          recentMetrics.length > 0
            ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
              recentMetrics.length
            : 0,
        averageFetchDuration:
          recentPerformance.length > 0
            ? recentPerformance.reduce((sum, p) => sum + p.fetchDuration, 0) /
              recentPerformance.length
            : 0,
        lastError: recentMetrics.filter(m => !m.success).pop()?.errorDetails,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Failed to get analytics:', error);
      return null;
    }
  }

  /**
   * Clear metrics (for testing/debugging)
   */
  clear(): void {
    this.metrics = [];
    this.performanceHistory = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dashboard_metrics');
    }
  }
}

// Singleton instance
export const dashboardLogger = new DashboardLogger();

// Export for debugging in dev console
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).dashboardLogger = dashboardLogger;
}
