// ============================================================================
// ADMIN MODULE: MONITORING DASHBOARD ROUTES v1.0 - Real-time Dashboard API
// ============================================================================
// API endpoints for real-time monitoring dashboard, metrics visualization, alert management,
// WebSocket integration, and comprehensive system monitoring

import express, { Request, Response } from 'express';

// ✅ Import Monitoring Dashboard System
import {
  MonitoringDashboard,
  createDashboardAlert,
  type DashboardMetrics,
} from '@server/shared/MonitoringDashboard';

import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// DASHBOARD OVERVIEW & METRICS
// ============================================

/**
 * GET /api/admin/monitoring-dashboard - Get dashboard overview
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.api(
      '📊 [MonitoringDashboard] Dashboard overview requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const [currentMetrics, stats, diagnostics] = await Promise.all([
      dashboard.getCurrentMetrics(),
      dashboard.getDashboardStats(),
      dashboard.getDiagnostics(),
    ]);

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        overview: {
          status: currentMetrics.performance.overall.grade,
          score: currentMetrics.performance.overall.score,
          trend: currentMetrics.performance.overall.trend,
          uptime: currentMetrics.system.uptime,
        },
        metrics: currentMetrics,
        statistics: stats,
        diagnostics,
        summary: {
          systemHealth:
            currentMetrics.system.cpu.usage < 80 ? 'healthy' : 'warning',
          databaseHealth: currentMetrics.database.health.status,
          applicationHealth:
            currentMetrics.application.requests.rate > 0
              ? 'active'
              : 'inactive',
          alertsActive: currentMetrics.alerts.active,
        },
      },
      _metadata: {
        endpoint: 'dashboard-overview',
        performanceScore: currentMetrics.performance.overall.score,
        alertsActive: currentMetrics.alerts.active,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Dashboard overview request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get dashboard overview',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/metrics - Get current metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const includeHistory = req.query.includeHistory === 'true';
    const timeRange = req.query.timeRange as string;

    logger.api(
      '📈 [MonitoringDashboard] Current metrics requested',
      'MonitoringDashboardAPI',
      {
        includeHistory,
        timeRange,
      }
    );

    const dashboard = MonitoringDashboard.getInstance();
    const currentMetrics = await dashboard.getCurrentMetrics();

    let history: DashboardMetrics[] = [];
    if (includeHistory) {
      if (timeRange) {
        const hours = parseInt(timeRange) || 1;
        const start = new Date(Date.now() - hours * 60 * 60 * 1000);
        const end = new Date();
        history = dashboard.getMetricsHistory({ start, end });
      } else {
        history = dashboard.getMetricsHistory();
      }
    }

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        current: currentMetrics,
        history: includeHistory ? history : undefined,
        trends: includeHistory ? calculateTrends(history) : undefined,
      },
      _metadata: {
        endpoint: 'dashboard-metrics',
        includeHistory,
        historyPoints: history.length,
        timeRange,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Metrics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get dashboard metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/metrics/system - Get system metrics
 */
router.get('/metrics/system', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🖥️ [MonitoringDashboard] System metrics requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const metrics = await dashboard.getCurrentMetrics();
    const systemMetrics = metrics.system;

    // Add additional system insights
    const insights = {
      cpuStatus:
        systemMetrics.cpu.usage > 80
          ? 'high'
          : systemMetrics.cpu.usage > 60
            ? 'medium'
            : 'normal',
      memoryStatus:
        systemMetrics.memory.usage > 85
          ? 'high'
          : systemMetrics.memory.usage > 70
            ? 'medium'
            : 'normal',
      diskStatus:
        systemMetrics.disk.usage > 90
          ? 'critical'
          : systemMetrics.disk.usage > 80
            ? 'warning'
            : 'normal',
      networkLoad:
        systemMetrics.network.connectionsActive > 100 ? 'high' : 'normal',
      recommendations: generateSystemRecommendations(systemMetrics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics: systemMetrics,
        insights,
        health: {
          overall:
            insights.cpuStatus === 'normal' &&
            insights.memoryStatus === 'normal'
              ? 'healthy'
              : 'warning',
          issues: [
            ...(insights.cpuStatus !== 'normal'
              ? [`CPU usage is ${insights.cpuStatus}`]
              : []),
            ...(insights.memoryStatus !== 'normal'
              ? [`Memory usage is ${insights.memoryStatus}`]
              : []),
            ...(insights.diskStatus !== 'normal'
              ? [`Disk usage is ${insights.diskStatus}`]
              : []),
          ],
        },
      },
      _metadata: {
        endpoint: 'system-metrics',
        cpuUsage: systemMetrics.cpu.usage,
        memoryUsage: systemMetrics.memory.usage,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] System metrics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get system metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/metrics/database - Get database metrics
 */
router.get('/metrics/database', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🗄️ [MonitoringDashboard] Database metrics requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const metrics = await dashboard.getCurrentMetrics();
    const databaseMetrics = metrics.database;

    // Add database-specific insights
    const insights = {
      connectionHealth:
        databaseMetrics.connections.usage > 80
          ? 'critical'
          : databaseMetrics.connections.usage > 60
            ? 'warning'
            : 'healthy',
      queryPerformance:
        databaseMetrics.queries.averageTime > 1000
          ? 'slow'
          : databaseMetrics.queries.averageTime > 500
            ? 'moderate'
            : 'fast',
      cacheEfficiency:
        databaseMetrics.cache.hitRate > 80
          ? 'excellent'
          : databaseMetrics.cache.hitRate > 60
            ? 'good'
            : 'poor',
      recommendations: generateDatabaseRecommendations(databaseMetrics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics: databaseMetrics,
        insights,
        health: {
          overall: databaseMetrics.health.status,
          score: databaseMetrics.health.score,
          issues: databaseMetrics.health.issues,
        },
      },
      _metadata: {
        endpoint: 'database-metrics',
        healthScore: databaseMetrics.health.score,
        connectionUsage: databaseMetrics.connections.usage,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Database metrics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get database metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/metrics/application - Get application metrics
 */
router.get('/metrics/application', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🚀 [MonitoringDashboard] Application metrics requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const metrics = await dashboard.getCurrentMetrics();
    const applicationMetrics = metrics.application;

    // Add application-specific insights
    const insights = {
      requestLoad:
        applicationMetrics.requests.rate > 100
          ? 'high'
          : applicationMetrics.requests.rate > 50
            ? 'medium'
            : 'low',
      errorRate:
        (applicationMetrics.requests.failed /
          applicationMetrics.requests.total) *
        100,
      responseTime:
        applicationMetrics.requests.averageResponseTime > 1000
          ? 'slow'
          : applicationMetrics.requests.averageResponseTime > 500
            ? 'moderate'
            : 'fast',
      cachePerformance:
        applicationMetrics.cache.hitRate > 80
          ? 'excellent'
          : applicationMetrics.cache.hitRate > 60
            ? 'good'
            : 'poor',
      moduleHealth: analyzeModuleHealth(applicationMetrics.modules),
      recommendations: generateApplicationRecommendations(applicationMetrics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics: applicationMetrics,
        insights,
        health: {
          overall:
            insights.errorRate < 5 && insights.responseTime !== 'slow'
              ? 'healthy'
              : 'warning',
          errorRate: insights.errorRate,
          issues: [
            ...(insights.errorRate > 5
              ? [`High error rate: ${insights.errorRate.toFixed(2)}%`]
              : []),
            ...(insights.responseTime === 'slow'
              ? ['Slow response times detected']
              : []),
            ...(insights.cachePerformance === 'poor'
              ? ['Poor cache performance']
              : []),
          ],
        },
      },
      _metadata: {
        endpoint: 'application-metrics',
        requestRate: applicationMetrics.requests.rate,
        errorRate: insights.errorRate,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Application metrics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get application metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/metrics/business - Get business metrics
 */
router.get('/metrics/business', async (req: Request, res: Response) => {
  try {
    logger.api(
      '📊 [MonitoringDashboard] Business metrics requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const metrics = await dashboard.getCurrentMetrics();
    const businessMetrics = metrics.business;

    // Add business-specific insights
    const insights = {
      hotelPerformance:
        businessMetrics.hotels.utilization > 80
          ? 'excellent'
          : businessMetrics.hotels.utilization > 60
            ? 'good'
            : 'needs improvement',
      operationalEfficiency:
        businessMetrics.requests.completionRate > 90
          ? 'excellent'
          : businessMetrics.requests.completionRate > 80
            ? 'good'
            : 'needs improvement',
      voiceServiceQuality:
        businessMetrics.voice.successRate > 95
          ? 'excellent'
          : businessMetrics.voice.successRate > 85
            ? 'good'
            : 'needs improvement',
      customerSatisfaction:
        businessMetrics.satisfaction.score > 8.5
          ? 'excellent'
          : businessMetrics.satisfaction.score > 7
            ? 'good'
            : 'needs improvement',
      recommendations: generateBusinessRecommendations(businessMetrics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics: businessMetrics,
        insights,
        kpis: {
          hotelUtilization: businessMetrics.hotels.utilization,
          requestCompletionRate: businessMetrics.requests.completionRate,
          voiceSuccessRate: businessMetrics.voice.successRate,
          customerSatisfactionScore: businessMetrics.satisfaction.score,
        },
        performance: {
          overall: calculateBusinessPerformanceScore(businessMetrics),
          trends: {
            satisfaction: businessMetrics.satisfaction.trend,
          },
        },
      },
      _metadata: {
        endpoint: 'business-metrics',
        hotelUtilization: businessMetrics.hotels.utilization,
        satisfactionScore: businessMetrics.satisfaction.score,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Business metrics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get business metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// ALERT MANAGEMENT
// ============================================

/**
 * GET /api/admin/monitoring-dashboard/alerts - Get alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const severity = req.query.severity as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const includeResolved = req.query.includeResolved === 'true';

    logger.api(
      '🚨 [MonitoringDashboard] Alerts requested',
      'MonitoringDashboardAPI',
      {
        category,
        severity,
        limit,
        includeResolved,
      }
    );

    const dashboard = MonitoringDashboard.getInstance();
    let alerts = dashboard.getActiveAlerts(category, severity);

    if (includeResolved) {
      // Would include resolved alerts in real implementation
      // For now, just return active alerts
    }

    alerts = alerts.slice(0, limit);

    // Calculate alert statistics
    const statistics = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length,
      },
      byCategory: {
        system: alerts.filter(a => a.category === 'system').length,
        database: alerts.filter(a => a.category === 'database').length,
        application: alerts.filter(a => a.category === 'application').length,
        business: alerts.filter(a => a.category === 'business').length,
      },
      acknowledged: alerts.filter(a => a.acknowledged).length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        alerts,
        statistics,
        filters: { category, severity, limit, includeResolved },
      },
      _metadata: {
        endpoint: 'alerts',
        returned: alerts.length,
        criticalAlerts: statistics.bySeverity.critical,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Alerts request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get alerts',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/monitoring-dashboard/alerts - Create alert
 */
router.post('/alerts', async (req: Request, res: Response) => {
  try {
    const alertData = req.body;

    logger.api(
      '🚨 [MonitoringDashboard] Alert creation requested',
      'MonitoringDashboardAPI',
      {
        severity: alertData.severity,
        category: alertData.category,
      }
    );

    // Validate alert data
    if (
      !alertData.title ||
      !alertData.message ||
      !alertData.severity ||
      !alertData.category
    ) {
      return (res as any).status(400).json({
        success: false,
        error:
          'Missing required alert fields: title, message, severity, category',
        version: '1.0.0',
      });
    }

    const alert = createDashboardAlert({
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity,
      category: alertData.category,
      source: alertData.source || 'manual',
      metadata: alertData.metadata || {},
    });

    (res as any).status(201).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: alert,
      _metadata: {
        endpoint: 'create-alert',
        alertId: alert.id,
        severity: alert.severity,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Alert creation failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to create alert',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * PUT /api/admin/monitoring-dashboard/alerts/:alertId/acknowledge - Acknowledge alert
 */
router.put(
  '/alerts/:alertId/acknowledge',
  async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const { userId } = req.body;

      logger.api(
        '✅ [MonitoringDashboard] Alert acknowledgment requested',
        'MonitoringDashboardAPI',
        {
          alertId,
          userId,
        }
      );

      const dashboard = MonitoringDashboard.getInstance();
      const success = dashboard.acknowledgeAlert(alertId, userId);

      if (!success) {
        return (res as any).status(404).json({
          success: false,
          error: 'Alert not found',
          version: '1.0.0',
        });
      }

      (res as any).status(200).json({
        success: true,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          alertId,
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date().toISOString(),
        },
        _metadata: {
          endpoint: 'acknowledge-alert',
          alertId,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error(
        '❌ [MonitoringDashboard] Alert acknowledgment failed',
        'MonitoringDashboardAPI',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to acknowledge alert',
        details: (error as Error).message,
        version: '1.0.0',
      });
    }
  }
);

/**
 * PUT /api/admin/monitoring-dashboard/alerts/:alertId/resolve - Resolve alert
 */
router.put('/alerts/:alertId/resolve', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;

    logger.api(
      '✅ [MonitoringDashboard] Alert resolution requested',
      'MonitoringDashboardAPI',
      {
        alertId,
        userId,
      }
    );

    const dashboard = MonitoringDashboard.getInstance();
    const success = dashboard.resolveAlert(alertId, userId);

    if (!success) {
      return (res as any).status(404).json({
        success: false,
        error: 'Alert not found',
        version: '1.0.0',
      });
    }

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        alertId,
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date().toISOString(),
      },
      _metadata: {
        endpoint: 'resolve-alert',
        alertId,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Alert resolution failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// PERFORMANCE ANALYTICS
// ============================================

/**
 * GET /api/admin/monitoring-dashboard/performance - Get performance analytics
 */
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string;
    const category = req.query.category as string;

    logger.api(
      '📈 [MonitoringDashboard] Performance analytics requested',
      'MonitoringDashboardAPI',
      {
        timeRange,
        category,
      }
    );

    const dashboard = MonitoringDashboard.getInstance();
    const metrics = await dashboard.getCurrentMetrics();
    const performanceMetrics = metrics.performance;

    // Get historical data for trends
    let history: DashboardMetrics[] = [];
    if (timeRange) {
      const hours = parseInt(timeRange) || 24;
      const start = new Date(Date.now() - hours * 60 * 60 * 1000);
      const end = new Date();
      history = dashboard.getMetricsHistory({ start, end });
    }

    // Calculate performance trends
    const trends = calculatePerformanceTrends(history);

    // Generate performance insights
    const insights = {
      overallHealth: performanceMetrics.overall.grade,
      trendDirection: performanceMetrics.overall.trend,
      keyImprovements: performanceMetrics.recommendations.slice(0, 3),
      criticalIssues: performanceMetrics.bottlenecks.filter(
        b => b.severity === 'critical'
      ),
      optimizationOpportunities: identifyOptimizationOpportunities(metrics),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        current: performanceMetrics,
        trends,
        insights,
        history:
          history.length > 0
            ? history.map(h => ({
                timestamp: h.timestamp,
                score: h.performance.overall.score,
                categories: h.performance.categories,
              }))
            : undefined,
      },
      _metadata: {
        endpoint: 'performance-analytics',
        performanceScore: performanceMetrics.overall.score,
        grade: performanceMetrics.overall.grade,
        historyPoints: history.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Performance analytics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance analytics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CONFIGURATION & MANAGEMENT
// ============================================

/**
 * GET /api/admin/monitoring-dashboard/config - Get dashboard configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    logger.api(
      '⚙️ [MonitoringDashboard] Configuration requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();

    // Get current configuration (would be stored in dashboard instance)
    const config = {
      updateInterval: 30000, // 30 seconds
      retentionPeriod: 24, // 24 hours
      enableRealTimeUpdates: true,
      enableAlerts: true,
      enablePerformanceAnalytics: true,
      features: {
        systemMetrics: true,
        databaseMetrics: true,
        applicationMetrics: true,
        businessMetrics: true,
        alertManagement: true,
        realTimeCharts: true,
        exportReports: true,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: config,
      _metadata: {
        endpoint: 'dashboard-config',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Configuration request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get dashboard configuration',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/monitoring-dashboard/diagnostics - Get dashboard diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🔧 [MonitoringDashboard] Diagnostics requested',
      'MonitoringDashboardAPI'
    );

    const dashboard = MonitoringDashboard.getInstance();
    const diagnostics = dashboard.getDiagnostics();
    const stats = dashboard.getDashboardStats();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        diagnostics,
        statistics: stats,
        health: {
          status: diagnostics.initialized ? 'operational' : 'initializing',
          issues: [
            ...(diagnostics.activeAlertsCount > 10
              ? ['High number of active alerts']
              : []),
            ...(diagnostics.wsConnectionsCount === 0
              ? ['No active WebSocket connections']
              : []),
            ...(!diagnostics.realTimeUpdatesActive
              ? ['Real-time updates not active']
              : []),
          ],
        },
      },
      _metadata: {
        endpoint: 'dashboard-diagnostics',
        initialized: diagnostics.initialized,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [MonitoringDashboard] Diagnostics request failed',
      'MonitoringDashboardAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get dashboard diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// Helper functions

function calculateTrends(history: DashboardMetrics[]) {
  if (history.length < 2) {
    return {
      cpu: 'stable',
      memory: 'stable',
      requests: 'stable',
      errors: 'stable',
    };
  }

  const recent = history.slice(-10);
  const older = history.slice(-20, -10);

  if (recent.length === 0 || older.length === 0) {
    return {
      cpu: 'stable',
      memory: 'stable',
      requests: 'stable',
      errors: 'stable',
    };
  }

  const recentAvgCpu =
    recent.reduce((sum, m) => sum + m.system.cpu.usage, 0) / recent.length;
  const olderAvgCpu =
    older.reduce((sum, m) => sum + m.system.cpu.usage, 0) / older.length;

  const recentAvgMemory =
    recent.reduce((sum, m) => sum + m.system.memory.usage, 0) / recent.length;
  const olderAvgMemory =
    older.reduce((sum, m) => sum + m.system.memory.usage, 0) / older.length;

  const recentAvgRequests =
    recent.reduce((sum, m) => sum + m.application.requests.rate, 0) /
    recent.length;
  const olderAvgRequests =
    older.reduce((sum, m) => sum + m.application.requests.rate, 0) /
    older.length;

  const recentAvgErrors =
    recent.reduce(
      (sum, m) =>
        sum + m.application.requests.failed / m.application.requests.total,
      0
    ) / recent.length;
  const olderAvgErrors =
    older.reduce(
      (sum, m) =>
        sum + m.application.requests.failed / m.application.requests.total,
      0
    ) / older.length;

  return {
    cpu: getTrendDirection(recentAvgCpu, olderAvgCpu),
    memory: getTrendDirection(recentAvgMemory, olderAvgMemory),
    requests: getTrendDirection(recentAvgRequests, olderAvgRequests),
    errors: getTrendDirection(recentAvgErrors, olderAvgErrors, true), // Reverse for errors (lower is better)
  };
}

function getTrendDirection(
  recent: number,
  older: number,
  reverse = false
): 'up' | 'down' | 'stable' {
  const change = ((recent - older) / older) * 100;
  const threshold = 5; // 5% change threshold

  if (Math.abs(change) < threshold) return 'stable';

  if (reverse) {
    return change > threshold ? 'down' : 'up';
  } else {
    return change > threshold ? 'up' : 'down';
  }
}

function generateSystemRecommendations(systemMetrics: any): string[] {
  const recommendations: string[] = [];

  if (systemMetrics.cpu.usage > 80) {
    recommendations.push(
      'Consider scaling horizontally or optimizing CPU-intensive operations'
    );
  }

  if (systemMetrics.memory.usage > 85) {
    recommendations.push(
      'Monitor memory leaks and consider increasing available memory'
    );
  }

  if (systemMetrics.disk.usage > 80) {
    recommendations.push('Clean up disk space or expand storage capacity');
  }

  return recommendations;
}

function generateDatabaseRecommendations(databaseMetrics: any): string[] {
  const recommendations: string[] = [];

  if (databaseMetrics.connections.usage > 80) {
    recommendations.push(
      'Optimize connection pool size or implement connection pooling'
    );
  }

  if (databaseMetrics.queries.averageTime > 1000) {
    recommendations.push('Optimize slow queries and add missing indexes');
  }

  if (databaseMetrics.cache.hitRate < 80) {
    recommendations.push('Improve cache strategy and increase cache size');
  }

  return recommendations;
}

function generateApplicationRecommendations(applicationMetrics: any): string[] {
  const recommendations: string[] = [];

  const errorRate =
    (applicationMetrics.requests.failed / applicationMetrics.requests.total) *
    100;

  if (errorRate > 5) {
    recommendations.push('Investigate and fix high error rate issues');
  }

  if (applicationMetrics.requests.averageResponseTime > 1000) {
    recommendations.push('Optimize API response times and implement caching');
  }

  if (applicationMetrics.cache.hitRate < 70) {
    recommendations.push('Improve application-level caching strategy');
  }

  return recommendations;
}

function generateBusinessRecommendations(businessMetrics: any): string[] {
  const recommendations: string[] = [];

  if (businessMetrics.hotels.utilization < 70) {
    recommendations.push(
      'Implement marketing strategies to increase hotel utilization'
    );
  }

  if (businessMetrics.requests.completionRate < 90) {
    recommendations.push(
      'Improve request processing efficiency and staff training'
    );
  }

  if (businessMetrics.voice.successRate < 90) {
    recommendations.push(
      'Optimize voice assistant performance and error handling'
    );
  }

  if (businessMetrics.satisfaction.score < 7) {
    recommendations.push(
      'Focus on customer satisfaction improvement initiatives'
    );
  }

  return recommendations;
}

function analyzeModuleHealth(modules: any): {
  healthy: number;
  warning: number;
  critical: number;
  total: number;
} {
  const moduleArray = Object.values(modules);

  return {
    healthy: moduleArray.filter(
      (m: any) => m.status === 'active' && m.errors < 5
    ).length,
    warning: moduleArray.filter(
      (m: any) => m.status === 'active' && m.errors >= 5 && m.errors < 20
    ).length,
    critical: moduleArray.filter(
      (m: any) => m.status === 'error' || m.errors >= 20
    ).length,
    total: moduleArray.length,
  };
}

function calculateBusinessPerformanceScore(businessMetrics: any): number {
  const utilizationScore = Math.min(businessMetrics.hotels.utilization, 100);
  const completionScore = businessMetrics.requests.completionRate;
  const voiceScore = businessMetrics.voice.successRate;
  const satisfactionScore = (businessMetrics.satisfaction.score / 10) * 100;

  return Math.round(
    (utilizationScore + completionScore + voiceScore + satisfactionScore) / 4
  );
}

function calculatePerformanceTrends(history: DashboardMetrics[]) {
  if (history.length < 2) {
    return {
      overall: 'stable',
      system: 'stable',
      database: 'stable',
      application: 'stable',
    };
  }

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  if (recent.length === 0 || older.length === 0) {
    return {
      overall: 'stable',
      system: 'stable',
      database: 'stable',
      application: 'stable',
    };
  }

  const recentOverall =
    recent.reduce((sum, m) => sum + m.performance.overall.score, 0) /
    recent.length;
  const olderOverall =
    older.reduce((sum, m) => sum + m.performance.overall.score, 0) /
    older.length;

  const recentSystem =
    recent.reduce((sum, m) => sum + m.performance.categories.system, 0) /
    recent.length;
  const olderSystem =
    older.reduce((sum, m) => sum + m.performance.categories.system, 0) /
    older.length;

  const recentDatabase =
    recent.reduce((sum, m) => sum + m.performance.categories.database, 0) /
    recent.length;
  const olderDatabase =
    older.reduce((sum, m) => sum + m.performance.categories.database, 0) /
    older.length;

  const recentApplication =
    recent.reduce((sum, m) => sum + m.performance.categories.application, 0) /
    recent.length;
  const olderApplication =
    older.reduce((sum, m) => sum + m.performance.categories.application, 0) /
    older.length;

  return {
    overall: getTrendDirection(recentOverall, olderOverall),
    system: getTrendDirection(recentSystem, olderSystem),
    database: getTrendDirection(recentDatabase, olderDatabase),
    application: getTrendDirection(recentApplication, olderApplication),
  };
}

function identifyOptimizationOpportunities(
  metrics: DashboardMetrics
): string[] {
  const opportunities: string[] = [];

  // System optimization opportunities
  if (metrics.system.cpu.usage > 70) {
    opportunities.push(
      'CPU optimization: Consider load balancing or code optimization'
    );
  }

  if (metrics.system.memory.usage > 80) {
    opportunities.push(
      'Memory optimization: Review memory usage patterns and implement caching'
    );
  }

  // Database optimization opportunities
  if (metrics.database.queries.averageTime > 500) {
    opportunities.push(
      'Database optimization: Add indexes and optimize slow queries'
    );
  }

  if (metrics.database.cache.hitRate < 80) {
    opportunities.push('Database caching: Improve query caching strategy');
  }

  // Application optimization opportunities
  const errorRate =
    (metrics.application.requests.failed / metrics.application.requests.total) *
    100;
  if (errorRate > 2) {
    opportunities.push('Error handling: Reduce application error rate');
  }

  if (metrics.application.requests.averageResponseTime > 800) {
    opportunities.push(
      'Response time: Optimize API performance and implement CDN'
    );
  }

  return opportunities;
}

export default router;
