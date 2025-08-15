/**
 * 🎯 EXTERNAL MEMORY LEAK DETECTION API
 *
 * REST API endpoints for external memory leak monitoring and management.
 */

import { Router } from "express";
import { getRealTimeExternalMemoryMonitor } from "./RealTimeExternalMemoryMonitor";

export function createExternalMemoryAPI(): Router {
  const router = Router();
  const monitor = getRealTimeExternalMemoryMonitor();

  // Status endpoints
  router.get("/status", (req, res) => {
    try {
      const status = monitor.getCurrentStatus();
      res.json({ success: true, data: status, timestamp: Date.now() });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.get("/report", (req, res) => {
    try {
      const report = monitor.getDetailedReport();
      res.json({ success: true, data: report, timestamp: Date.now() });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.get("/attribution", (req, res) => {
    try {
      const attribution = monitor.getActiveResourceAttribution();
      const attributionArray = Array.from(attribution.entries()).map(
        ([source, data]) => ({
          source,
          ...data,
        }),
      );
      res.json({
        success: true,
        data: attributionArray,
        timestamp: Date.now(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Control endpoints
  router.post("/start", (req, res) => {
    try {
      monitor.startMonitoring();
      res.json({
        success: true,
        message: "External memory monitoring started",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.post("/stop", (req, res) => {
    try {
      monitor.stopMonitoring();
      res.json({
        success: true,
        message: "External memory monitoring stopped",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.post("/snapshot", (req, res) => {
    try {
      const snapshot = monitor.forceSnapshot();
      res.json({
        success: true,
        data: snapshot,
        message: "Memory snapshot captured",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Cleanup endpoints
  router.post("/cleanup", (req, res) => {
    try {
      const { types = ["gc_force"], aggressive = false } = req.body;
      const validTypes = [
        "gc_force",
        "connection_cleanup",
        "buffer_cleanup",
        "handle_cleanup",
        "comprehensive",
      ];
      const invalidTypes = types.filter(
        (type: string) => !validTypes.includes(type),
      );

      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid cleanup types: ${invalidTypes.join(", ")}`,
          validTypes,
        });
      }

      const cleanup = monitor.manualCleanup(types, aggressive);
      res.json({
        success: true,
        data: cleanup,
        message: `Cleanup triggered: ${types.join(", ")}${aggressive ? " (aggressive)" : ""}`,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.post("/cleanup/force-gc", (req, res) => {
    try {
      const { aggressive = false } = req.body;
      const cleanup = monitor.manualCleanup(["gc_force"], aggressive);
      res.json({
        success: true,
        data: cleanup,
        message: `Garbage collection triggered${aggressive ? " (aggressive)" : ""}`,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.post("/cleanup/comprehensive", (req, res) => {
    try {
      const cleanup = monitor.manualCleanup(["comprehensive"], true);
      res.json({
        success: true,
        data: cleanup,
        message: "Comprehensive cleanup triggered",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  router.get("/health", (req, res) => {
    const status = monitor.getCurrentStatus();
    const isHealthy = status.isRunning && status.currentMemory !== null;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? "healthy" : "unhealthy",
      monitoring: status.isRunning,
      uptime: status.uptime,
      timestamp: Date.now(),
    });
  });

  return router;
}
