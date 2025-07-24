// ============================================================================
// ADMIN MODULE: DATABASE OPTIMIZATION ROUTES v1.0 - Database Performance & Management
// ============================================================================
// API endpoints for database optimization, connection pool management, query analysis,
// index recommendations, and performance monitoring with real-time analytics

import express, { Request, Response } from 'express';

// ✅ Import Database Optimization System
import {
  DatabaseOptimizer,
  analyzeQuery,
  getDatabaseHealth,
  optimizeDatabase,
} from '@server/shared/DatabaseOptimizer';

import {
  ConnectionPoolManager,
  executeQuery,
  getPoolStatus,
  type AutoScalingEvent,
  type PoolMetrics,
} from '@server/shared/ConnectionPoolManager';

import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// DATABASE ANALYSIS & OPTIMIZATION
// ============================================

/**
 * POST /api/admin/database/optimize - Run database optimization analysis
 */
router.post('/optimize', async (_req: Request, res: Response) => {
  try {
    logger.api(
      '🔍 [DatabaseOpt] Database optimization requested',
      'DatabaseOptimizationAPI'
    );

    const startTime = Date.now();
    const report = await optimizeDatabase();
    const executionTime = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: report,
      _metadata: {
        endpoint: 'database-optimize',
        executionTime,
        optimizationOpportunities: report.summary.optimizationOpportunities,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Database optimization failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to run database optimization',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/database/analyze-query - Analyze specific query performance
 */
router.post('/analyze-query', async (req: Request, res: Response) => {
  try {
    const { query, params } = req.body;

    logger.api(
      '🔬 [DatabaseOpt] Query analysis requested',
      'DatabaseOptimizationAPI',
      {
        queryType: query?.trim().split(' ')[0]?.toUpperCase(),
      }
    );

    if (!query) {
      return (res as any).status(400).json({
        success: false,
        error: 'Query is required for analysis',
        version: '1.0.0',
      });
    }

    const startTime = Date.now();
    const analysis = await analyzeQuery(query, params);
    const executionTime = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: analysis,
      _metadata: {
        endpoint: 'query-analysis',
        executionTime,
        queryComplexity: analysis.complexity,
        recommendationCount: analysis.recommendations.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Query analysis failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to analyze query',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/health - Get database health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    logger.api(
      '🏥 [DatabaseOpt] Database health check requested',
      'DatabaseOptimizationAPI'
    );

    const healthStatus = await getDatabaseHealth();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: healthStatus,
      _metadata: {
        endpoint: 'database-health',
        healthScore: healthStatus.score,
        status: healthStatus.status,
        issueCount: healthStatus.issues.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Database health check failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get database health status',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/slow-queries - Get slow query analysis
 */
router.get('/slow-queries', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const complexity = req.query.complexity as string;

    logger.api(
      `📊 [DatabaseOpt] Slow queries requested (limit: ${limit})`,
      'DatabaseOptimizationAPI'
    );

    const optimizer = DatabaseOptimizer.getInstance();
    let slowQueries = optimizer.getSlowQueries(limit);

    // Filter by complexity if specified
    if (complexity) {
      slowQueries = slowQueries.filter(q => q.complexity === complexity);
    }

    // Calculate summary statistics
    const summary = {
      totalSlowQueries: slowQueries.length,
      averageExecutionTime:
        slowQueries.length > 0
          ? slowQueries.reduce((sum, q) => sum + q.executionTime, 0) /
            slowQueries.length
          : 0,
      complexityBreakdown: slowQueries.reduce(
        (acc, q) => {
          acc[q.complexity] = (acc[q.complexity] || 0) + 1;
          return acc;
        },
        {} as { [key: string]: number }
      ),
      totalRecommendations: slowQueries.reduce(
        (sum, q) => sum + q.recommendations.length,
        0
      ),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        slowQueries,
        summary,
        filters: { limit, complexity },
      },
      _metadata: {
        endpoint: 'slow-queries',
        returned: slowQueries.length,
        avgExecutionTime: summary.averageExecutionTime,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Slow queries request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get slow queries',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/index-suggestions - Get index optimization recommendations
 */
router.get('/index-suggestions', async (req: Request, res: Response) => {
  try {
    const priority = req.query.priority as string;
    const impact = req.query.impact as string;

    logger.api(
      '📋 [DatabaseOpt] Index suggestions requested',
      'DatabaseOptimizationAPI'
    );

    const optimizer = DatabaseOptimizer.getInstance();
    let suggestions = await optimizer.optimizeIndexes();

    // Filter by priority if specified
    if (priority) {
      const priorityNum = parseInt(priority);
      suggestions = suggestions.filter(s => s.priority <= priorityNum);
    }

    // Filter by impact if specified
    if (impact) {
      suggestions = suggestions.filter(s => s.estimatedImpact === impact);
    }

    // Group suggestions by table
    const suggestionsByTable = suggestions.reduce(
      (acc, suggestion) => {
        if (!acc[suggestion.table]) {
          acc[suggestion.table] = [];
        }
        acc[suggestion.table].push(suggestion);
        return acc;
      },
      {} as { [table: string]: any[] }
    );

    const summary = {
      totalSuggestions: suggestions.length,
      highImpactSuggestions: suggestions.filter(
        s => s.estimatedImpact === 'high'
      ).length,
      tablesCovered: Object.keys(suggestionsByTable).length,
      indexTypeBreakdown: suggestions.reduce(
        (acc, s) => {
          acc[s.type] = (acc[s.type] || 0) + 1;
          return acc;
        },
        {} as { [type: string]: number }
      ),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        suggestions,
        suggestionsByTable,
        summary,
        filters: { priority, impact },
      },
      _metadata: {
        endpoint: 'index-suggestions',
        returned: suggestions.length,
        highImpact: summary.highImpactSuggestions,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Index suggestions request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get index suggestions',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// CONNECTION POOL MANAGEMENT
// ============================================

/**
 * GET /api/admin/database/pool/status - Get connection pool status
 */
router.get('/pool/status', async (_req: Request, res: Response) => {
  try {
    logger.api(
      '🔗 [DatabaseOpt] Connection pool status requested',
      'DatabaseOptimizationAPI'
    );

    const poolStatus = getPoolStatus();
    const poolManager = ConnectionPoolManager.getInstance();
    const diagnostics = poolManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        status: poolStatus,
        diagnostics,
        health: {
          score: poolStatus.health.score,
          status: poolStatus.health.status,
          issues: poolStatus.health.issues,
        },
      },
      _metadata: {
        endpoint: 'pool-status',
        totalConnections: diagnostics.totalConnections,
        healthScore: poolStatus.health.score,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Pool status request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get connection pool status',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/pool/metrics - Get connection pool metrics
 */
router.get('/pool/metrics', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const timeRange = req.query.timeRange as string;

    logger.api(
      `📊 [DatabaseOpt] Pool metrics requested (limit: ${limit})`,
      'DatabaseOptimizationAPI'
    );

    const poolManager = ConnectionPoolManager.getInstance();
    let metrics = poolManager.getMetrics(limit);

    // Filter by time range if specified
    if (timeRange) {
      const now = new Date();
      const rangeMs = parseTimeRange(timeRange);
      const cutoffTime = new Date(now.getTime() - rangeMs);
      metrics = metrics.filter(m => m.timestamp >= cutoffTime);
    }

    // Calculate trends
    const trends = calculateMetricsTrends(metrics);

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        metrics,
        trends,
        summary: {
          dataPoints: metrics.length,
          timeRange: timeRange || 'latest',
          avgConnectionUsage: trends.connectionUsage.average,
          avgThroughput: trends.throughput.average,
        },
      },
      _metadata: {
        endpoint: 'pool-metrics',
        returned: metrics.length,
        timeRange,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Pool metrics request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get connection pool metrics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/pool/leaks - Get connection leak detection
 */
router.get('/pool/leaks', async (_req: Request, res: Response) => {
  try {
    logger.api(
      '🔍 [DatabaseOpt] Connection leaks requested',
      'DatabaseOptimizationAPI'
    );

    const poolManager = ConnectionPoolManager.getInstance();
    const leaks = poolManager.getConnectionLeaks();

    // Analyze leak patterns
    const leakAnalysis = {
      totalLeaks: leaks.length,
      activeLeaks: leaks.filter(
        l => Date.now() - l.acquiredAt.getTime() < 3600000
      ).length, // 1 hour
      averageDuration:
        leaks.length > 0
          ? leaks.reduce((sum, l) => sum + l.duration, 0) / leaks.length
          : 0,
      longestLeak:
        leaks.length > 0 ? Math.max(...leaks.map(l => l.duration)) : 0,
      leaksByQuery: leaks.reduce(
        (acc, leak) => {
          const query = leak.query || 'unknown';
          acc[query] = (acc[query] || 0) + 1;
          return acc;
        },
        {} as { [query: string]: number }
      ),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        leaks,
        analysis: leakAnalysis,
        recommendations: generateLeakRecommendations(leakAnalysis),
      },
      _metadata: {
        endpoint: 'connection-leaks',
        totalLeaks: leaks.length,
        activeLeaks: leakAnalysis.activeLeaks,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Connection leaks request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get connection leaks',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/database/pool/auto-scaling - Get auto-scaling events
 */
router.get('/pool/auto-scaling', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    logger.api(
      `📈 [DatabaseOpt] Auto-scaling events requested (limit: ${limit})`,
      'DatabaseOptimizationAPI'
    );

    const poolManager = ConnectionPoolManager.getInstance();
    const events = poolManager.getAutoScalingEvents(limit);

    // Analyze scaling patterns
    const scalingAnalysis = {
      totalEvents: events.length,
      scaleUpEvents: events.filter(e => e.action === 'scale_up').length,
      scaleDownEvents: events.filter(e => e.action === 'scale_down').length,
      averageScaleUpAmount: calculateAverageScaling(events, 'scale_up'),
      averageScaleDownAmount: calculateAverageScaling(events, 'scale_down'),
      mostCommonReasons: analyzeScalingReasons(events),
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        events,
        analysis: scalingAnalysis,
        recommendations: generateScalingRecommendations(scalingAnalysis),
      },
      _metadata: {
        endpoint: 'auto-scaling-events',
        returned: events.length,
        totalEvents: scalingAnalysis.totalEvents,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Auto-scaling events request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get auto-scaling events',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// QUERY EXECUTION & TESTING
// ============================================

/**
 * POST /api/admin/database/execute-query - Execute and analyze query (ADMIN ONLY)
 */
router.post('/execute-query', async (req: Request, res: Response) => {
  try {
    const { query, params, tags, dryRun } = req.body;

    logger.api(
      '🔧 [DatabaseOpt] Query execution requested',
      'DatabaseOptimizationAPI',
      {
        queryType: query?.trim().split(' ')[0]?.toUpperCase(),
        dryRun: !!dryRun,
      }
    );

    if (!query) {
      return (res as any).status(400).json({
        success: false,
        error: 'Query is required for execution',
        version: '1.0.0',
      });
    }

    // Security check - only allow read-only queries in production
    if (process.env.NODE_ENV === 'production' && !isReadOnlyQuery(query)) {
      return (res as any).status(403).json({
        success: false,
        error: 'Only read-only queries allowed in production',
        version: '1.0.0',
      });
    }

    const startTime = Date.now();

    if (dryRun) {
      // Only analyze, don't execute
      const analysis = await analyzeQuery(query, params);

      (res as any).status(200).json({
        success: true,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          analysis,
          executed: false,
          dryRun: true,
        },
        _metadata: {
          endpoint: 'execute-query-dryrun',
          analysisTime: Date.now() - startTime,
          version: '1.0.0',
        },
      });
    } else {
      // Execute and analyze
      const [result, analysis] = await Promise.all([
        executeQuery(query, params, tags),
        analyzeQuery(query, params),
      ]);

      const executionTime = Date.now() - startTime;

      (res as any).status(200).json({
        success: true,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          result,
          analysis,
          executed: true,
          dryRun: false,
        },
        _metadata: {
          endpoint: 'execute-query',
          executionTime,
          rowsAffected: result.rows,
          version: '1.0.0',
        },
      });
    }
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Query execution failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to execute query',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// DIAGNOSTICS & CONFIGURATION
// ============================================

/**
 * GET /api/admin/database/diagnostics - Get database optimization diagnostics
 */
router.get('/diagnostics', async (_req: Request, res: Response) => {
  try {
    logger.api(
      '🔧 [DatabaseOpt] Diagnostics requested',
      'DatabaseOptimizationAPI'
    );

    const optimizer = DatabaseOptimizer.getInstance();
    const poolManager = ConnectionPoolManager.getInstance();

    const diagnostics = {
      optimizer: optimizer.getDiagnostics(),
      connectionPool: poolManager.getDiagnostics(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      configuration: {
        databaseType: process.env.DATABASE_URL?.includes('postgresql')
          ? 'postgresql'
          : 'sqlite',
        nodeEnv: process.env.NODE_ENV,
        poolingEnabled: !!poolManager,
        optimizationEnabled: !!optimizer,
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'database-diagnostics',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [DatabaseOpt] Diagnostics request failed',
      'DatabaseOptimizationAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get database diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// Helper functions

function parseTimeRange(timeRange: string): number {
  const units: { [key: string]: number } = {
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  const match = timeRange.match(/^(\d+)([mhd])$/);
  if (!match) return 60 * 60 * 1000; // Default 1 hour

  const [, amount, unit] = match;
  return parseInt(amount) * (units[unit] || units.h);
}

function calculateMetricsTrends(metrics: PoolMetrics[]): any {
  if (metrics.length === 0) {
    return {
      connectionUsage: { average: 0, trend: 'stable' },
      throughput: { average: 0, trend: 'stable' },
      errorRate: { average: 0, trend: 'stable' },
    };
  }

  const connectionUsages = metrics.map(m => m.resource.connectionUsagePercent);
  const throughputs = metrics.map(m => m.performance.throughput);
  const errorRates = metrics.map(m => m.performance.errorRate);

  return {
    connectionUsage: {
      average:
        connectionUsages.reduce((sum, val) => sum + val, 0) /
        connectionUsages.length,
      trend: calculateTrend(connectionUsages),
    },
    throughput: {
      average:
        throughputs.reduce((sum, val) => sum + val, 0) / throughputs.length,
      trend: calculateTrend(throughputs),
    },
    errorRate: {
      average:
        errorRates.reduce((sum, val) => sum + val, 0) / errorRates.length,
      trend: calculateTrend(errorRates),
    },
  };
}

function calculateTrend(
  values: number[]
): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (changePercent > 5) return 'increasing';
  if (changePercent < -5) return 'decreasing';
  return 'stable';
}

function generateLeakRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];

  if (analysis.totalLeaks > 0) {
    recommendations.push(
      'Implement proper connection release in finally blocks'
    );
    recommendations.push('Add connection timeout monitoring');
    recommendations.push('Review long-running query patterns');
  }

  if (analysis.averageDuration > 300000) {
    // 5 minutes
    recommendations.push('Reduce query timeout limits');
    recommendations.push('Implement query cancellation mechanisms');
  }

  if (Object.keys(analysis.leaksByQuery).length > 0) {
    recommendations.push('Focus on optimizing most problematic queries');
  }

  return recommendations;
}

function calculateAverageScaling(
  events: AutoScalingEvent[],
  action: string
): number {
  const filteredEvents = events.filter(e => e.action === action);
  if (filteredEvents.length === 0) return 0;

  const amounts = filteredEvents.map(e => Math.abs(e.to - e.from));
  return amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
}

function analyzeScalingReasons(events: AutoScalingEvent[]): {
  [reason: string]: number;
} {
  return events.reduce(
    (acc, event) => {
      const reason = event.reason.split(' ')[0]; // Get first word as category
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as { [reason: string]: number }
  );
}

function generateScalingRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];

  if (analysis.scaleUpEvents > analysis.scaleDownEvents * 2) {
    recommendations.push('Consider increasing minimum pool size');
    recommendations.push('Review connection usage patterns');
  }

  if (analysis.averageScaleUpAmount > 10) {
    recommendations.push('Implement more gradual scaling increments');
  }

  if (analysis.totalEvents > 50) {
    recommendations.push('Fine-tune auto-scaling thresholds');
  }

  return recommendations;
}

function isReadOnlyQuery(query: string): boolean {
  const upperQuery = query.trim().toUpperCase();
  const readOnlyPatterns = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'WITH'];
  const writePatterns = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'TRUNCATE',
  ];

  const startsWithReadOnly = readOnlyPatterns.some(pattern =>
    upperQuery.startsWith(pattern)
  );
  const containsWrite = writePatterns.some(pattern =>
    upperQuery.includes(pattern)
  );

  return startsWithReadOnly && !containsWrite;
}

export default router;
