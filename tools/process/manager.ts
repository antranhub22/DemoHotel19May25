import {
  getMemoryUsage,
  tryForceGc,
  writeHeapSnapshot,
} from "@server/shared/MemoryTools";
import { resourceTracker } from "@server/shared/ResourceTracker";
import { logger } from "@shared/utils/logger";

export class ProcessManager {
  private static memoryLimitPercent = Number(
    process.env.MEMORY_LIMIT_PERCENT || 80,
  );
  private static criticalLimitPercent = Number(
    process.env.MEMORY_CRITICAL_PERCENT || 90,
  );
  private static checkIntervalMs = Number(
    process.env.MEMORY_CHECK_INTERVAL_MS || 30000,
  );
  private static monitorTimer?: NodeJS.Timeout;

  static initialize(): void {
    resourceTracker.registerProcessShutdownHandlers();
    if (!this.monitorTimer) {
      this.monitorTimer = setInterval(
        () => this.checkMemory(),
        this.checkIntervalMs,
      );
      resourceTracker.registerInterval(
        this.monitorTimer,
        "process-memory-monitor",
      );
    }
  }

  private static checkMemory(): void {
    const mem = getMemoryUsage();
    if (mem.percentUsed >= this.criticalLimitPercent) {
      logger.error("🚨 Critical memory level", "ProcessManager", mem);
      writeHeapSnapshot("pm-critical");
      const forced = tryForceGc();
      if (
        !forced ||
        getMemoryUsage().percentUsed >= this.criticalLimitPercent
      ) {
        logger.error("🔄 Restarting due to critical memory", "ProcessManager");
        // Let PM2/Docker handle restart via exit code 1
        process.exit(1);
      }
      return;
    }
    if (mem.percentUsed >= this.memoryLimitPercent) {
      logger.warn("⚠️ High memory level", "ProcessManager", mem);
      tryForceGc();
    }
  }
}

// Initialize automatically when imported in production
if (process.env.NODE_ENV === "production") {
  try {
    ProcessManager.initialize();
  } catch (error) {
    logger.warn("ProcessManager init failed", "ProcessManager", error);
  }
}
