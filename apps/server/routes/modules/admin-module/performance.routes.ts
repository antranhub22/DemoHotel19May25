// ============================================================================
// ADMIN MODULE: PERFORMANCE ROUTES v1.0 - Performance Audit & Optimization
// ============================================================================
// API endpoints for comprehensive performance analysis, audit reports,
// and optimization recommendations

import express, { Request, Response } from 'express';

// ✅ Import Performance Audit System
import {
  getPerformanceTrends,
  performanceAuditor,
  runComprehensiveAudit,
  runQuickAudit,
} from '@server/shared/PerformanceAuditor';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// PERFORMANCE AUDIT ENDPOINTS
// ============================================

/**
 * GET /api/admin/performance/audit/comprehensive - Run comprehensive performance audit
 */
router.get('/audit/comprehensive', async (req: Request, res: Response) => {
  try {
    logger.api(
      '🔍 [Performance] Comprehensive audit requested',
      'PerformanceAPI'
    );

    const startTime = Date.now();
    const auditReport = await runComprehensiveAudit();
    const auditDuration = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: auditReport,
      _metadata: {
        endpoint: 'comprehensive-audit',
        auditDuration,
        version: '1.0.0',
        performanceScore: auditReport.summary.performanceScore,
        overallHealth: auditReport.summary.overallHealth,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Comprehensive audit failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to run comprehensive performance audit',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/performance/audit/quick - Run quick performance check
 */
router.get('/audit/quick', async (req: Request, res: Response) => {
  try {
    logger.api('⚡ [Performance] Quick audit requested', 'PerformanceAPI');

    const startTime = Date.now();
    const quickAudit = await runQuickAudit();
    const auditDuration = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: quickAudit,
      _metadata: {
        endpoint: 'quick-audit',
        auditDuration,
        version: '1.0.0',
        status: quickAudit.status,
        score: quickAudit.score,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Quick audit failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to run quick performance audit',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/performance/history - Get audit history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.api(
      `📊 [Performance] Audit history requested (limit: ${limit})`,
      'PerformanceAPI'
    );

    const auditHistory = performanceAuditor.getAuditHistory();
    const limitedHistory = auditHistory.slice(-limit);

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        audits: limitedHistory,
        totalAudits: auditHistory.length,
        oldestAudit: auditHistory.length > 0 ? auditHistory[0].timestamp : null,
        newestAudit:
          auditHistory.length > 0
            ? auditHistory[auditHistory.length - 1].timestamp
            : null,
      },
      _metadata: {
        endpoint: 'audit-history',
        limit,
        returned: limitedHistory.length,
        total: auditHistory.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Audit history request failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get audit history',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/performance/trends - Get performance trends
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;

    logger.api(
      `📈 [Performance] Performance trends requested (${hours}h)`,
      'PerformanceAPI'
    );

    const trends = getPerformanceTrends(hours);

    // Calculate trend summaries
    const trendSummary = {
      memoryUsage: {
        current:
          trends.memoryUsage.length > 0
            ? trends.memoryUsage[trends.memoryUsage.length - 1].value
            : 0,
        average:
          trends.memoryUsage.length > 0
            ? trends.memoryUsage.reduce((sum, t) => sum + t.value, 0) /
              trends.memoryUsage.length
            : 0,
        min:
          trends.memoryUsage.length > 0
            ? Math.min(...trends.memoryUsage.map(t => t.value))
            : 0,
        max:
          trends.memoryUsage.length > 0
            ? Math.max(...trends.memoryUsage.map(t => t.value))
            : 0,
      },
      responseTime: {
        current:
          trends.responseTime.length > 0
            ? trends.responseTime[trends.responseTime.length - 1].value
            : 0,
        average:
          trends.responseTime.length > 0
            ? trends.responseTime.reduce((sum, t) => sum + t.value, 0) /
              trends.responseTime.length
            : 0,
        min:
          trends.responseTime.length > 0
            ? Math.min(...trends.responseTime.map(t => t.value))
            : 0,
        max:
          trends.responseTime.length > 0
            ? Math.max(...trends.responseTime.map(t => t.value))
            : 0,
      },
      errorRate: {
        current:
          trends.errorRate.length > 0
            ? trends.errorRate[trends.errorRate.length - 1].value
            : 0,
        average:
          trends.errorRate.length > 0
            ? trends.errorRate.reduce((sum, t) => sum + t.value, 0) /
              trends.errorRate.length
            : 0,
        min:
          trends.errorRate.length > 0
            ? Math.min(...trends.errorRate.map(t => t.value))
            : 0,
        max:
          trends.errorRate.length > 0
            ? Math.max(...trends.errorRate.map(t => t.value))
            : 0,
      },
      cpuUsage: {
        current:
          trends.cpuUsage.length > 0
            ? trends.cpuUsage[trends.cpuUsage.length - 1].value
            : 0,
        average:
          trends.cpuUsage.length > 0
            ? trends.cpuUsage.reduce((sum, t) => sum + t.value, 0) /
              trends.cpuUsage.length
            : 0,
        min:
          trends.cpuUsage.length > 0
            ? Math.min(...trends.cpuUsage.map(t => t.value))
            : 0,
        max:
          trends.cpuUsage.length > 0
            ? Math.max(...trends.cpuUsage.map(t => t.value))
            : 0,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        trends,
        summary: trendSummary,
        period: `${hours}h`,
        dataPoints: {
          memoryUsage: trends.memoryUsage.length,
          responseTime: trends.responseTime.length,
          errorRate: trends.errorRate.length,
          cpuUsage: trends.cpuUsage.length,
        },
      },
      _metadata: {
        endpoint: 'performance-trends',
        hours,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Trends request failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance trends',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/performance/diagnostics - Get performance auditor diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api('🔧 [Performance] Diagnostics requested', 'PerformanceAPI');

    const diagnostics = performanceAuditor.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'performance-diagnostics',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Diagnostics request failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// OPTIMIZATION RECOMMENDATIONS
// ============================================

/**
 * GET /api/admin/performance/recommendations - Get current optimization recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const priority = req.query.priority as string;
    const category = req.query.category as string;

    logger.api(
      '💡 [Performance] Optimization recommendations requested',
      'PerformanceAPI',
      { priority, category }
    );

    // Get latest audit report
    const auditHistory = performanceAuditor.getAuditHistory();
    if (auditHistory.length === 0) {
      return (res as any).status(400).json({
        success: false,
        error: 'No audit data available. Run an audit first.',
        version: '1.0.0',
      });
    }

    const latestAudit = auditHistory[auditHistory.length - 1];
    let recommendations = latestAudit.recommendations;

    // Filter by priority if specified
    if (priority) {
      recommendations = recommendations.filter(r => r.priority === priority);
    }

    // Filter by category if specified
    if (category) {
      recommendations = recommendations.filter(r => r.category === category);
    }

    // Group recommendations by priority
    const groupedRecommendations = {
      critical: recommendations.filter(r => r.priority === 'critical'),
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low'),
    };

    // Calculate implementation effort summary
    const effortSummary = {
      low: recommendations.filter(r => r.effort === 'low').length,
      medium: recommendations.filter(r => r.effort === 'medium').length,
      high: recommendations.filter(r => r.effort === 'high').length,
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        recommendations,
        grouped: groupedRecommendations,
        summary: {
          total: recommendations.length,
          byPriority: {
            critical: groupedRecommendations.critical.length,
            high: groupedRecommendations.high.length,
            medium: groupedRecommendations.medium.length,
            low: groupedRecommendations.low.length,
          },
          byEffort: effortSummary,
          categories: [...new Set(recommendations.map(r => r.category))],
        },
        auditInfo: {
          auditTimestamp: latestAudit.timestamp,
          performanceScore: latestAudit.summary.performanceScore,
          overallHealth: latestAudit.summary.overallHealth,
        },
      },
      _metadata: {
        endpoint: 'optimization-recommendations',
        filters: { priority, category },
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Recommendations request failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get optimization recommendations',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// PERFORMANCE DASHBOARD
// ============================================

/**
 * GET /api/admin/performance/dashboard - Get performance dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    logger.api(
      '📊 [Performance] Performance dashboard requested',
      'PerformanceAPI'
    );

    // Run quick audit for current status
    const quickAudit = await runQuickAudit();

    // Get trends for last 24 hours
    const trends = getPerformanceTrends(24);

    // Get audit history
    const auditHistory = performanceAuditor.getAuditHistory();
    const latestComprehensiveAudit =
      auditHistory.length > 0 ? auditHistory[auditHistory.length - 1] : null;

    // Get diagnostics
    const diagnostics = performanceAuditor.getDiagnostics();

    // Calculate dashboard metrics
    const dashboardData = {
      currentStatus: {
        health: quickAudit.status,
        score: quickAudit.score,
        criticalIssues: quickAudit.issues.filter(i => i.severity === 'critical')
          .length,
        recommendations: quickAudit.quickRecommendations,
      },
      trends: {
        memory: trends.memoryUsage.slice(-12), // Last 12 data points
        responseTime: trends.responseTime.slice(-12),
        errorRate: trends.errorRate.slice(-12),
        cpu: trends.cpuUsage.slice(-12),
      },
      lastAudit: latestComprehensiveAudit
        ? {
            timestamp: latestComprehensiveAudit.timestamp,
            performanceScore: latestComprehensiveAudit.summary.performanceScore,
            overallHealth: latestComprehensiveAudit.summary.overallHealth,
            criticalIssues: latestComprehensiveAudit.summary.criticalIssues,
            highPriorityIssues:
              latestComprehensiveAudit.summary.highPriorityIssues,
            totalRecommendations:
              latestComprehensiveAudit.summary.totalRecommendations,
            topBottlenecks: latestComprehensiveAudit.bottlenecks.slice(0, 3),
          }
        : null,
      system: {
        uptime: process.uptime(),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        platform: process.platform,
      },
      auditSystem: {
        initialized: diagnostics.initialized,
        totalAudits: diagnostics.auditHistoryCount,
        hasBaseline: diagnostics.hasBaseline,
        lastAuditTime: diagnostics.lastAuditTime,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: dashboardData,
      _metadata: {
        endpoint: 'performance-dashboard',
        version: '1.0.0',
        dataFreshness: {
          quickAudit: 'real-time',
          trends: '24h',
          comprehensiveAudit: latestComprehensiveAudit
            ? latestComprehensiveAudit.timestamp
            : 'never',
        },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Dashboard request failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance dashboard data',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// AUTOMATIC AUDIT TRIGGERS
// ============================================

/**
 * POST /api/admin/performance/audit/schedule - Schedule automatic audits
 */
router.post('/audit/schedule', async (req: Request, res: Response) => {
  try {
    const { interval, type } = req.body;

    logger.api(
      `⏰ [Performance] Audit scheduling requested`,
      'PerformanceAPI',
      { interval, type }
    );

    // This would implement automatic audit scheduling
    // For now, return a placeholder response

    (res as any).status(200).json({
      success: true,
      message: 'Audit scheduling feature will be implemented in next iteration',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      requested: { interval, type },
      _metadata: {
        endpoint: 'schedule-audit',
        version: '1.0.0',
        status: 'placeholder',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [Performance] Audit scheduling failed',
      'PerformanceAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to schedule audits',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

export default router;
