/**
 * 📊 MEMORY MONITORING API ENDPOINTS
 *
 * Provides detailed memory monitoring endpoints for tracking
 * memory allocation, profiling, and leak detection.
 */

import { Router, Request, Response } from "express";
import { logger } from "@shared/utils/logger";
import { memoryTracker } from "@server/shared/MemoryAllocationTracker";
import { memoryProfiler } from "@server/shared/MemoryProfiler";
import { memorySpikeDetector } from "@server/shared/MemorySpikeDetector";
import { dbMemoryMonitor } from "@server/shared/DatabaseMemoryMonitor";
import { heapAnalyzer, captureHeapSnapshot } from "@server/shared/HeapAnalyzer";

const router = Router();

/**
 * GET /api/memory/status
 * Get comprehensive memory monitoring status
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const currentMemory = process.memoryUsage();
    const memoryReport = memoryTracker.generateMemoryReport();
    const profilingReport = memoryProfiler.generateProfilingReport();
    const spikeStats = memorySpikeDetector.getSpikeStatistics();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),

      current: {
        heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        arrayBuffers: `${(currentMemory.arrayBuffers / 1024 / 1024).toFixed(2)}MB`,
        utilization: `${((currentMemory.heapUsed / currentMemory.heapTotal) * 100).toFixed(1)}%`,
      },

      tracking: memoryReport,
      profiling: profilingReport,
      spikes: spikeStats,
    });
  } catch (error) {
    logger.error("❌ Failed to get memory status", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get memory status",
    });
  }
});

/**
 * GET /api/memory/top-consumers
 * Get top memory consuming operations
 */
router.get("/top-consumers", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topOperations = memoryTracker.getTopMemoryConsumers(limit);
    const topFunctions = memoryProfiler.getTopMemoryConsumers(limit);
    const topQueries = dbMemoryMonitor.getTopMemoryConsumers(limit);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      limit,

      topOperations: topOperations.map((op) => ({
        operation: op.operationName,
        totalMemory: `${(op.totalMemoryAllocated / 1024 / 1024).toFixed(2)}MB`,
        callCount: op.totalCalls,
        avgMemory: `${(op.avgMemoryDelta / 1024 / 1024).toFixed(2)}MB`,
        maxMemory: `${(op.maxMemoryDelta / 1024 / 1024).toFixed(2)}MB`,
        lastCalled: new Date(op.lastCalled).toISOString(),
      })),

      topFunctions: topFunctions.map((fn) => ({
        function: fn.name,
        totalMemory: `${(fn.totalMemoryAllocated / 1024 / 1024).toFixed(2)}MB`,
        callCount: fn.callCount,
        avgMemory: `${(fn.avgMemoryPerCall / 1024 / 1024).toFixed(2)}MB`,
        maxMemory: `${(fn.maxMemoryPerCall / 1024 / 1024).toFixed(2)}MB`,
      })),

      topQueries: topQueries.map((query) => ({
        queryType: query.queryType,
        maxMemory: `${(query.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
        avgMemory: `${(query.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
        executions: query.totalExecutions,
      })),
    });
  } catch (error) {
    logger.error("❌ Failed to get top consumers", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get top consumers",
    });
  }
});

/**
 * GET /api/memory/history
 * Get recent memory usage history
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 30;

    const recentHistory = memoryTracker.getRecentMemoryHistory(minutes);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      timespan: `${minutes} minutes`,
      dataPoints: recentHistory.length,

      history: recentHistory.map((snapshot) => ({
        timestamp: new Date(snapshot.timestamp).toISOString(),
        heapUsed: `${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(snapshot.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(snapshot.external / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(snapshot.rss / 1024 / 1024).toFixed(2)}MB`,
        operation: snapshot.operation,
      })),
    });
  } catch (error) {
    logger.error("❌ Failed to get memory history", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get memory history",
    });
  }
});

/**
 * GET /api/memory/spikes
 * Get recent memory spikes
 */
router.get("/spikes", async (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 60;

    const recentSpikes = memorySpikeDetector.getRecentSpikes(minutes);
    const spikeReport = memorySpikeDetector.generateSpikeReport();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      timespan: `${minutes} minutes`,

      spikes: recentSpikes.map((spike) => ({
        id: spike.id,
        timestamp: spike.timestamp.toISOString(),
        severity: spike.severity,
        memoryIncrease: `${(spike.memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
        totalMemory: `${(spike.totalMemory / 1024 / 1024).toFixed(2)}MB`,
        operation: spike.operation,
        resolved: spike.resolved,
        resolutionMethod: spike.resolutionMethod,
      })),

      summary: spikeReport,
    });
  } catch (error) {
    logger.error("❌ Failed to get memory spikes", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get memory spikes",
    });
  }
});

/**
 * GET /api/memory/database
 * Get database operation memory statistics
 */
router.get("/database", async (req: Request, res: Response) => {
  try {
    const dbReport = dbMemoryMonitor.generateDatabaseReport();

    res.json({
      success: true,
      database: dbReport,
    });
  } catch (error) {
    logger.error(
      "❌ Failed to get database memory stats",
      "MemoryMonitoringAPI",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );

    res.status(500).json({
      success: false,
      error: "Failed to get database memory stats",
    });
  }
});

/**
 * GET /api/memory/heap-analysis
 * Get heap analysis and leak detection report
 */
router.get("/heap-analysis", async (req: Request, res: Response) => {
  try {
    const heapReport = heapAnalyzer.generateHeapReport();

    res.json({
      success: true,
      heapAnalysis: heapReport,
    });
  } catch (error) {
    logger.error("❌ Failed to get heap analysis", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get heap analysis",
    });
  }
});

/**
 * POST /api/memory/snapshot
 * Trigger heap snapshot generation
 */
router.post("/snapshot", async (req: Request, res: Response) => {
  try {
    const { reason = "manual_api" } = req.body;

    const snapshot = await captureHeapSnapshot(reason);

    if (snapshot) {
      res.json({
        success: true,
        message: "Heap snapshot created successfully",
        snapshot: {
          id: snapshot.id,
          timestamp: snapshot.timestamp.toISOString(),
          reason: snapshot.reason,
          fileSize: `${(snapshot.fileSize / 1024 / 1024).toFixed(2)}MB`,
          filepath: snapshot.filepath,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create heap snapshot",
      });
    }
  } catch (error) {
    logger.error("❌ Failed to create heap snapshot", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to create heap snapshot",
    });
  }
});

/**
 * POST /api/memory/gc
 * Force garbage collection
 */
router.post("/gc", async (req: Request, res: Response) => {
  try {
    if (!global.gc) {
      return res.status(400).json({
        success: false,
        error: "Garbage collection not available (run with --expose-gc)",
      });
    }

    const beforeGC = process.memoryUsage();
    global.gc();
    const afterGC = process.memoryUsage();

    const memoryFreed = beforeGC.heapUsed - afterGC.heapUsed;

    logger.info(
      "🗑️ Manual garbage collection triggered",
      "MemoryMonitoringAPI",
      {
        memoryFreed: `${(memoryFreed / 1024 / 1024).toFixed(2)}MB`,
        beforeGC: `${(beforeGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        afterGC: `${(afterGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      },
    );

    res.json({
      success: true,
      message: "Garbage collection completed",
      memoryFreed: `${(memoryFreed / 1024 / 1024).toFixed(2)}MB`,
      before: {
        heapUsed: `${(beforeGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(beforeGC.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      },
      after: {
        heapUsed: `${(afterGC.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(afterGC.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      },
    });
  } catch (error) {
    logger.error(
      "❌ Failed to trigger garbage collection",
      "MemoryMonitoringAPI",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );

    res.status(500).json({
      success: false,
      error: "Failed to trigger garbage collection",
    });
  }
});

/**
 * GET /api/memory/config
 * Get current memory monitoring configuration
 */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const config = {
      memoryTracking: {
        enabled: true,
        maxHistorySize: 1000,
      },
      profiling: {
        enabled: true,
      },
      spikeDetection: memorySpikeDetector.getSpikeStatistics().configuration,
      databaseMonitoring: {
        enabled: true,
      },
      heapAnalysis: {
        enabled: true,
        maxSnapshots: 20,
      },
    };

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    logger.error("❌ Failed to get memory config", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to get memory config",
    });
  }
});

/**
 * GET /api/memory/report
 * Generate comprehensive memory monitoring report
 */
router.get("/report", async (req: Request, res: Response) => {
  try {
    const currentMemory = process.memoryUsage();
    const memoryReport = memoryTracker.generateMemoryReport();
    const profilingReport = memoryProfiler.generateProfilingReport();
    const spikeReport = memorySpikeDetector.generateSpikeReport();
    const dbReport = dbMemoryMonitor.generateDatabaseReport();
    const heapReport = heapAnalyzer.generateHeapReport();

    const comprehensiveReport = {
      timestamp: new Date().toISOString(),

      overview: {
        currentMemory: {
          heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          external: `${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`,
          rss: `${(currentMemory.rss / 1024 / 1024).toFixed(2)}MB`,
          utilization: `${((currentMemory.heapUsed / currentMemory.heapTotal) * 100).toFixed(1)}%`,
        },
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${(process.uptime() / 3600).toFixed(1)} hours`,
      },

      tracking: memoryReport,
      profiling: profilingReport,
      spikes: spikeReport,
      database: dbReport,
      heapAnalysis: heapReport,

      recommendations: generateRecommendations({
        currentMemory,
        spikes: spikeReport,
        profiling: profilingReport,
        database: dbReport,
      }),
    };

    res.json({
      success: true,
      report: comprehensiveReport,
    });
  } catch (error) {
    logger.error("❌ Failed to generate memory report", "MemoryMonitoringAPI", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to generate memory report",
    });
  }
});

/**
 * Generate recommendations based on memory analysis
 */
function generateRecommendations(data: any): string[] {
  const recommendations: string[] = [];
  const { currentMemory, spikes, profiling, database } = data;

  // Check memory utilization
  const utilization = (currentMemory.heapUsed / currentMemory.heapTotal) * 100;
  if (utilization > 80) {
    recommendations.push(
      "High memory utilization (>80%). Consider increasing heap size or optimizing memory usage.",
    );
  }

  // Check for recent critical spikes
  if (spikes.spikesBySeveurity?.critical > 0) {
    recommendations.push(
      "Critical memory spikes detected. Review heap snapshots and investigate memory leaks.",
    );
  }

  // Check top memory consumers
  if (profiling.topMemoryConsumers?.length > 0) {
    const topConsumer = profiling.topMemoryConsumers[0];
    if (topConsumer.totalMemory && parseFloat(topConsumer.totalMemory) > 50) {
      recommendations.push(
        `High memory consumption by ${topConsumer.function}. Consider optimization.`,
      );
    }
  }

  // Check database operations
  if (database.summary?.failedOperations > 0) {
    recommendations.push(
      "Failed database operations detected. Review query efficiency and error handling.",
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      "Memory usage appears healthy. Continue monitoring for trends.",
    );
  }

  return recommendations;
}

export default router;
