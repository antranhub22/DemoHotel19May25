// ============================================================================
// ADMIN MODULE: METRICS ROUTES v2.0 - Advanced Metrics & KPI Management
// ============================================================================
// Comprehensive metrics API for performance monitoring, business KPIs, and alerting
// Enhanced with Advanced Metrics Collection v2.0

import express, { Request, Response } from 'express';

// ✅ Import Advanced Metrics System
import {
  advancedMetricsCollector,
  getCurrentMetricsSnapshot,
  getSystemHealthFromMetrics,
  recordBusinessKPI,
  recordPerformanceMetrics,
} from '@server/shared/AdvancedMetricsCollector';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// METRICS OVERVIEW & SNAPSHOTS
// ============================================

/**
 * GET /api/admin/metrics/snapshot - Current metrics snapshot
 */
router.get('/snapshot', async (req: Request, res: Response) => {
  try {
    logger.api('📊 [Metrics] Current snapshot requested', 'MetricsAPI');

    const snapshot = getCurrentMetricsSnapshot();

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: snapshot,
      _metadata: {
        endpoint: 'metrics-snapshot',
        version: '2.0.0',
        features: ['performance-tracking', 'business-kpis', 'real-time-alerts'],
      },
    });
  } catch (error) {
    logger.error('❌ [Metrics] Snapshot request failed', 'MetricsAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get metrics snapshot',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

/**
 * GET /api/admin/metrics/health - System health based on metrics
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🏥 [Metrics] System health from metrics requested',
      'MetricsAPI'
    );

    const health = getSystemHealthFromMetrics();

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: health,
      _metadata: {
        endpoint: 'metrics-health',
        version: '2.0.0',
        healthScore: health.score,
      },
    });
  } catch (error) {
    logger.error('❌ [Metrics] Health request failed', 'MetricsAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get system health from metrics',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

/**
 * GET /api/admin/metrics/diagnostics - Metrics system diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api('🔧 [Metrics] Diagnostics requested', 'MetricsAPI');

    const diagnostics = advancedMetricsCollector.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'metrics-diagnostics',
        version: '2.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Metrics] Diagnostics request failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get metrics diagnostics',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

// ============================================
// PERFORMANCE METRICS
// ============================================

/**
 * POST /api/admin/metrics/performance - Record performance metrics
 */
router.post('/performance', async (req: Request, res: Response) => {
  try {
    const {
      module,
      endpoint,
      operation,
      responseTime,
      memoryUsage,
      cpuUsage,
      errorRate,
      throughput,
    } = req.body;

    logger.api(
      `📈 [Metrics] Recording performance metrics for ${module}:${operation}`,
      'MetricsAPI'
    );

    // Validate required fields
    if (!module || !operation || responseTime === undefined) {
      return (res as any).status(400).json({
        success: false,
        error: 'Missing required fields: module, operation, responseTime',
        version: '2.0.0',
      });
    }

    recordPerformanceMetrics({
      module,
      endpoint,
      operation,
      responseTime: Number(responseTime),
      memoryUsage: Number(memoryUsage) || 0,
      cpuUsage: Number(cpuUsage) || 0,
      errorRate: Number(errorRate) || 0,
      throughput: Number(throughput) || 0,
    });

    (res as any).status(201).json({
      success: true,
      message: 'Performance metrics recorded successfully',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      '❌ [Metrics] Performance metrics recording failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to record performance metrics',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

/**
 * GET /api/admin/metrics/performance/history - Performance metrics history
 */
router.get('/performance/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const module = req.query.module as string;

    logger.api(
      `📊 [Metrics] Performance history requested (${hours}h)`,
      'MetricsAPI',
      { module }
    );

    if (module) {
      const moduleMetrics = advancedMetricsCollector.getModuleMetrics(
        module,
        hours
      );
      (res as any).status(200).json({
        success: true,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        data: moduleMetrics,
        _metadata: {
          endpoint: 'performance-history',
          module,
          hours,
        },
      });
    } else {
      const history = advancedMetricsCollector.getMetricsHistory(hours);
      (res as any).status(200).json({
        success: true,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        data: history,
        _metadata: {
          endpoint: 'performance-history',
          hours,
        },
      });
    }
  } catch (error) {
    logger.error(
      '❌ [Metrics] Performance history request failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance history',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

// ============================================
// BUSINESS KPIs
// ============================================

/**
 * POST /api/admin/metrics/kpi - Record business KPI
 */
router.post('/kpi', async (req: Request, res: Response) => {
  try {
    const { name, value, unit, category, target, trend, module } = req.body;

    logger.api(`💼 [Metrics] Recording business KPI: ${name}`, 'MetricsAPI');

    // Validate required fields
    if (!name || value === undefined || !unit || !category || !module) {
      return (res as any).status(400).json({
        success: false,
        error: 'Missing required fields: name, value, unit, category, module',
        version: '2.0.0',
      });
    }

    // Validate category
    const validCategories = [
      'revenue',
      'operations',
      'customer_satisfaction',
      'performance',
      'growth',
    ];
    if (!validCategories.includes(category)) {
      return (res as any).status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        version: '2.0.0',
      });
    }

    recordBusinessKPI({
      name,
      value: Number(value),
      unit,
      category,
      target: target ? Number(target) : undefined,
      trend: trend || 'stable',
      module,
    });

    (res as any).status(201).json({
      success: true,
      message: 'Business KPI recorded successfully',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      '❌ [Metrics] Business KPI recording failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to record business KPI',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

/**
 * GET /api/admin/metrics/kpi/summary - Business KPI summary
 */
router.get('/kpi/summary', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const category = req.query.category as string;

    logger.api(`💼 [Metrics] KPI summary requested (${hours}h)`, 'MetricsAPI', {
      category,
    });

    const snapshot = getCurrentMetricsSnapshot();
    let kpis = snapshot.business.kpis;

    // Filter by category if specified
    if (category) {
      kpis = kpis.filter(kpi => kpi.category === category);
    }

    // Group KPIs by name and calculate summary
    const kpiSummary: Record<string, any> = {};
    kpis.forEach(kpi => {
      if (!kpiSummary[kpi.name]) {
        kpiSummary[kpi.name] = {
          name: kpi.name,
          unit: kpi.unit,
          category: kpi.category,
          module: kpi.module,
          current: kpi.value,
          target: kpi.target,
          trend: kpi.trend,
          values: [],
        };
      }
      kpiSummary[kpi.name].values.push({
        value: kpi.value,
        timestamp: kpi.timestamp,
      });
    });

    // Calculate additional stats for each KPI
    Object.values(kpiSummary).forEach((kpi: any) => {
      if (kpi.values.length > 1) {
        const sortedValues = kpi.values.sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const first = sortedValues[0].value;
        const last = sortedValues[sortedValues.length - 1].value;

        kpi.change = last - first;
        kpi.changePercent = first !== 0 ? ((last - first) / first) * 100 : 0;
        kpi.average =
          kpi.values.reduce((sum: number, v: any) => sum + v.value, 0) /
          kpi.values.length;
        kpi.min = Math.min(...kpi.values.map((v: any) => v.value));
        kpi.max = Math.max(...kpi.values.map((v: any) => v.value));
      }
    });

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: {
        summary: Object.values(kpiSummary),
        trends: snapshot.business.trends,
        totalKPIs: Object.keys(kpiSummary).length,
      },
      _metadata: {
        endpoint: 'kpi-summary',
        hours,
        category,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Metrics] KPI summary request failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get KPI summary',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================

/**
 * GET /api/admin/metrics/alerts - Get active alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const severity = req.query.severity as string;
    const module = req.query.module as string;

    logger.api('🚨 [Metrics] Alerts requested', 'MetricsAPI', {
      severity,
      module,
    });

    const snapshot = getCurrentMetricsSnapshot();
    let alerts = snapshot.alerts.active;

    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Filter by module if specified
    if (module) {
      alerts = alerts.filter(alert => alert.module === module);
    }

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: {
        active: alerts,
        summary: snapshot.alerts.summary,
        resolved: snapshot.alerts.resolved.slice(0, 10), // Last 10 resolved
      },
      _metadata: {
        endpoint: 'alerts',
        filters: { severity, module },
      },
    });
  } catch (error) {
    logger.error('❌ [Metrics] Alerts request failed', 'MetricsAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get alerts',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

/**
 * PUT /api/admin/metrics/alerts/:alertId/resolve - Resolve an alert
 */
router.put('/alerts/:alertId/resolve', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { reason } = req.body;

    logger.api(`✅ [Metrics] Resolving alert: ${alertId}`, 'MetricsAPI');

    const resolved = advancedMetricsCollector.resolveAlert(alertId, reason);

    if (resolved) {
      (res as any).status(200).json({
        success: true,
        message: 'Alert resolved successfully',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
    } else {
      (res as any).status(404).json({
        success: false,
        error: 'Alert not found or already resolved',
        version: '2.0.0',
      });
    }
  } catch (error) {
    logger.error('❌ [Metrics] Alert resolution failed', 'MetricsAPI', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

// ============================================
// REAL-TIME DASHBOARD DATA
// ============================================

/**
 * GET /api/admin/metrics/dashboard - Real-time dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '24h';

    logger.api(
      `📊 [Metrics] Dashboard data requested (${period})`,
      'MetricsAPI'
    );

    const snapshot = getCurrentMetricsSnapshot();
    const health = getSystemHealthFromMetrics();
    const diagnostics = advancedMetricsCollector.getDiagnostics();

    // Calculate period-specific data
    const hours =
      period === '1h' ? 1 : period === '6h' ? 6 : period === '12h' ? 12 : 24;
    const history = advancedMetricsCollector.getMetricsHistory(hours);

    const dashboardData = {
      overview: {
        systemHealth: health,
        totalMetrics: diagnostics.stats.totalMetrics,
        activeAlerts: diagnostics.stats.activeAlerts,
        collectionActive: diagnostics.collectionActive,
      },
      performance: {
        current: snapshot.performance.overall,
        byModule: snapshot.performance.byModule,
        history: history.performance.slice(-50), // Last 50 data points
      },
      business: {
        kpis: snapshot.business.kpis,
        trends: snapshot.business.trends,
        history: history.business.slice(-20), // Last 20 KPI entries
      },
      alerts: {
        active: snapshot.alerts.active,
        summary: snapshot.alerts.summary,
        recent: history.alerts.slice(-10), // Last 10 alerts
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: dashboardData,
      _metadata: {
        endpoint: 'dashboard',
        period,
        dataPoints: {
          performance: history.performance.length,
          business: history.business.length,
          alerts: history.alerts.length,
        },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Metrics] Dashboard data request failed',
      'MetricsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      details: (error as Error).message,
      version: '2.0.0',
    });
  }
});

export default router;
