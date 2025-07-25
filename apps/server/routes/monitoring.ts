// ============================================
// MONITORING API ROUTES v2.0 - Enhanced Logging & Metrics
// ============================================
// REST API endpoints for accessing Enhanced Logger, Metrics Collector,
// and Monitoring Integration data with comprehensive observability

import express, { type Request, Response } from 'express';
import { EnhancedLogger } from '@server/shared/EnhancedLogger';
import { MetricsCollector } from '@server/shared/MetricsCollector';
import { MonitoringIntegration } from '@server/shared/MonitoringIntegration';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// ENHANCED LOGGER ENDPOINTS
// ============================================

/**
 * GET /api/monitoring/logs - Get filtered logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const {
      level,
      module,
      component,
      userId,
      tenantId,
      since,
      until,
      limit = 100,
      offset = 0,
      search,
    } = req.query;

    const options: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (level) options.level = (level as string).split(',');
    if (module) options.module = module as string;
    if (component) options.component = component as string;
    if (userId) options.userId = userId as string;
    if (tenantId) options.tenantId = tenantId as string;
    if (since) options.since = new Date(since as string);
    if (until) options.until = new Date(until as string);
    if (search) options.search = search as string;

    const logs = EnhancedLogger.getLogs(options);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        logs,
        total: logs.length,
        filters: options,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get logs',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/errors - Get recent errors
 */
router.get('/logs/errors', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const errors = EnhancedLogger.getRecentErrors(parseInt(limit as string));

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        errors,
        count: errors.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get error logs',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve error logs',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/api - Get API logs
 */
router.get('/logs/api', async (req: Request, res: Response) => {
  try {
    const { limit = 100 } = req.query;

    const apiLogs = EnhancedLogger.getApiLogs(parseInt(limit as string));

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        apiLogs,
        count: apiLogs.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get API logs',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve API logs',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/audit - Get audit logs
 */
router.get('/logs/audit', async (req: Request, res: Response) => {
  try {
    const { limit = 100 } = req.query;

    const auditLogs = EnhancedLogger.getAuditLogs(parseInt(limit as string));

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        auditLogs,
        count: auditLogs.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get audit logs',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/statistics - Get log statistics
 */
router.get('/logs/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = EnhancedLogger.getLogStatistics();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: statistics,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get log statistics',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve log statistics',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/health - Get logging system health
 */
router.get('/logs/health', async (req: Request, res: Response) => {
  try {
    const health = EnhancedLogger.getHealthStatus();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get logging health',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve logging health',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/logs/export - Export logs
 */
router.get('/logs/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    const exportData = EnhancedLogger.exportLogs(format as 'json' | 'csv');
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `logs_${new Date().toISOString().slice(0, 10)}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to export logs',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to export logs',
      details: error.message,
    });
  }
});

// ============================================
// METRICS COLLECTOR ENDPOINTS
// ============================================

/**
 * GET /api/monitoring/metrics - Get current metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const currentMetrics = MetricsCollector.getCurrentMetrics();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: currentMetrics,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get metrics',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/metrics/history - Get metrics history
 */
router.get('/metrics/history', async (req: Request, res: Response) => {
  try {
    const { limit = 100 } = req.query;

    const history = MetricsCollector.getMetricsHistory(
      parseInt(limit as string)
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        history,
        count: history.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get metrics history',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics history',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/metrics/range - Get metrics for time range
 */
router.get('/metrics/range', async (req: Request, res: Response) => {
  try {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      (res as any).status(400).json({
        success: false,
        error: 'startTime and endTime are required',
      });
      return;
    }

    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    const metrics = MetricsCollector.getMetricsInRange(start, end);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics,
        count: metrics.length,
        range: { startTime: start, endTime: end },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get metrics range',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics range',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/metrics/alerts - Get recent alerts
 */
router.get('/metrics/alerts', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const alerts = MetricsCollector.getRecentAlerts(parseInt(limit as string));

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        alerts,
        count: alerts.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get alerts',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve alerts',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/metrics/health - Get metrics system health
 */
router.get('/metrics/health', async (req: Request, res: Response) => {
  try {
    const health = MetricsCollector.getHealthSummary();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get metrics health',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics health',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/metrics/status - Get metrics collector status
 */
router.get('/metrics/status', async (req: Request, res: Response) => {
  try {
    const status = MetricsCollector.getStatus();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get metrics status',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve metrics status',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/metrics/collect - Trigger manual metrics collection
 */
router.post('/metrics/collect', async (req: Request, res: Response) => {
  try {
    const metrics = MetricsCollector.collectMetrics();

    logger.info(
      '📊 [Monitoring API] Manual metrics collection triggered',
      'MonitoringAPI'
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: 'Metrics collection triggered successfully',
      data: metrics,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to trigger metrics collection',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to trigger metrics collection',
      details: error.message,
    });
  }
});

// ============================================
// PERFORMANCE TRACKING ENDPOINTS
// ============================================

/**
 * POST /api/monitoring/performance/start - Start performance tracking
 */
router.post('/performance/start', async (req: Request, res: Response) => {
  try {
    const { operationId, metadata = {} } = req.body;

    if (!operationId) {
      (res as any).status(400).json({
        success: false,
        error: 'operationId is required',
      });
      return;
    }

    EnhancedLogger.startPerformanceTracking(operationId, metadata);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Performance tracking started for: ${operationId}`,
      data: { operationId, metadata },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to start performance tracking',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to start performance tracking',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/performance/end - End performance tracking
 */
router.post('/performance/end', async (req: Request, res: Response) => {
  try {
    const { operationId, metadata = {} } = req.body;

    if (!operationId) {
      (res as any).status(400).json({
        success: false,
        error: 'operationId is required',
      });
      return;
    }

    const duration = EnhancedLogger.endPerformanceTracking(
      operationId,
      metadata
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Performance tracking ended for: ${operationId}`,
      data: { operationId, duration, metadata },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to end performance tracking',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to end performance tracking',
      details: error.message,
    });
  }
});

// ============================================
// MONITORING INTEGRATION ENDPOINTS
// ============================================

/**
 * GET /api/monitoring/status - Get comprehensive monitoring status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = MonitoringIntegration.getMonitoringStatus();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      monitoring: status,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to get monitoring status',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring status',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/health-check - Perform comprehensive health check
 */
router.post('/health-check', async (req: Request, res: Response) => {
  try {
    const healthCheck = await MonitoringIntegration.performHealthCheck();

    logger.info(
      '🔍 [Monitoring API] Comprehensive health check performed',
      'MonitoringAPI'
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: 'Health check completed successfully',
      data: healthCheck,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Health check failed',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message,
    });
  }
});

/**
 * GET /api/monitoring/report - Generate comprehensive system report
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    const report = MonitoringIntegration.generateSystemReport();

    logger.info('📊 [Monitoring API] System report generated', 'MonitoringAPI');

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to generate system report',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to generate system report',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/record-operation - Record a performance operation
 */
router.post('/record-operation', async (req: Request, res: Response) => {
  try {
    const { operationName, duration, metadata = {} } = req.body;

    if (!operationName || duration === undefined) {
      (res as any).status(400).json({
        success: false,
        error: 'operationName and duration are required',
      });
      return;
    }

    MonitoringIntegration.recordPerformanceOperation(
      operationName,
      duration,
      metadata
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Performance operation recorded: ${operationName}`,
      data: { operationName, duration, metadata },
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to record performance operation',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to record performance operation',
      details: error.message,
    });
  }
});

// ============================================
// CUSTOM METRICS ENDPOINTS
// ============================================

/**
 * POST /api/monitoring/custom/counter - Increment a custom counter
 */
router.post('/custom/counter', async (req: Request, res: Response) => {
  try {
    const { name, value = 1 } = req.body;

    if (!name) {
      (res as any).status(400).json({
        success: false,
        error: 'name is required',
      });
      return;
    }

    MetricsCollector.incrementCounter(name, value);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Counter '${name}' incremented by ${value}`,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to increment counter',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to increment counter',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/custom/gauge - Set a custom gauge value
 */
router.post('/custom/gauge', async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body;

    if (!name || value === undefined) {
      (res as any).status(400).json({
        success: false,
        error: 'name and value are required',
      });
      return;
    }

    MetricsCollector.setGauge(name, value);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Gauge '${name}' set to ${value}`,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to set gauge',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to set gauge',
      details: error.message,
    });
  }
});

/**
 * POST /api/monitoring/custom/histogram - Record a histogram value
 */
router.post('/custom/histogram', async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body;

    if (!name || value === undefined) {
      (res as any).status(400).json({
        success: false,
        error: 'name and value are required',
      });
      return;
    }

    MetricsCollector.recordHistogram(name, value);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Histogram '${name}' recorded value ${value}`,
    });
  } catch (error) {
    logger.error(
      '❌ [Monitoring API] Failed to record histogram',
      'MonitoringAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to record histogram',
      details: error.message,
    });
  }
});

export default router;
