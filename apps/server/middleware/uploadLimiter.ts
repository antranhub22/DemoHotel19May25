// ============================================================================
// 🛡️ UPLOAD LIMITER MIDDLEWARE - Prevents Memory Spikes from Concurrent Uploads
// ============================================================================

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import { TimerManager } from "../utils/TimerManager";

// ============================================================================
// UPLOAD LIMITER CONFIGURATION
// ============================================================================

interface UploadStats {
  activeUploads: number;
  totalUploads: number;
  rejectedUploads: number;
  peakConcurrency: number;
  averageUploadSize: number;
  lastReset: number;
}

interface UploadLimiterConfig {
  maxConcurrentUploads: number;
  maxUploadSizeBytes: number;
  trackingWindowMs: number;
  enableDetailedLogging: boolean;
}

// ============================================================================
// UPLOAD LIMITER CLASS
// ============================================================================

class UploadLimiter {
  private stats: UploadStats;
  private config: UploadLimiterConfig;
  private activeUploadIds: Set<string>;
  private uploadSizes: number[];

  constructor(config: Partial<UploadLimiterConfig> = {}) {
    this.config = {
      maxConcurrentUploads: 3, // Max 3 concurrent uploads
      maxUploadSizeBytes: 1024 * 1024, // 1MB per file (matches express.json limit)
      trackingWindowMs: 60000, // 1 minute tracking window
      enableDetailedLogging: true,
      ...config,
    };

    this.stats = {
      activeUploads: 0,
      totalUploads: 0,
      rejectedUploads: 0,
      peakConcurrency: 0,
      averageUploadSize: 0,
      lastReset: Date.now(),
    };

    this.activeUploadIds = new Set();
    this.uploadSizes = [];

    this.startStatsReset();
  }

  /**
   * Create upload limiter middleware
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const uploadId = this.generateUploadId(req);

      try {
        // Check upload limits before processing
        if (!this.canAcceptUpload(req)) {
          this.stats.rejectedUploads++;

          logger.warn("🚫 Upload rejected - limits exceeded", "UploadLimiter", {
            activeUploads: this.stats.activeUploads,
            maxConcurrent: this.config.maxConcurrentUploads,
            uploadId,
            clientIP: req.ip,
          });

          return res.status(429).json({
            error: "Too many concurrent uploads",
            message: `Maximum ${this.config.maxConcurrentUploads} concurrent uploads allowed`,
            retryAfter: 5000, // 5 seconds
            stats: this.getPublicStats(),
          });
        }

        // Register upload start
        this.registerUploadStart(uploadId, req);

        // Add cleanup to response finish
        const cleanup = () => {
          this.registerUploadEnd(uploadId, req);
        };

        res.on("finish", cleanup);
        res.on("close", cleanup);
        res.on("error", cleanup);

        next();
      } catch (error) {
        logger.error("⚠️ Upload limiter error", "UploadLimiter", {
          error: error instanceof Error ? error.message : "Unknown error",
          uploadId,
        });

        // Fail open - don't block uploads on limiter errors
        next();
      }
    };
  }

  /**
   * Check if upload can be accepted
   */
  private canAcceptUpload(req: Request): boolean {
    // Check concurrent uploads
    if (this.stats.activeUploads >= this.config.maxConcurrentUploads) {
      return false;
    }

    // Check content length if available
    const contentLength = req.headers["content-length"];
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > this.config.maxUploadSizeBytes) {
        logger.warn(
          "🚫 Upload rejected - size limit exceeded",
          "UploadLimiter",
          {
            size,
            maxSize: this.config.maxUploadSizeBytes,
          },
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Register upload start
   */
  private registerUploadStart(uploadId: string, req: Request): void {
    this.activeUploadIds.add(uploadId);
    this.stats.activeUploads++;
    this.stats.totalUploads++;

    if (this.stats.activeUploads > this.stats.peakConcurrency) {
      this.stats.peakConcurrency = this.stats.activeUploads;
    }

    if (this.config.enableDetailedLogging) {
      logger.debug("📤 Upload started", "UploadLimiter", {
        uploadId,
        activeUploads: this.stats.activeUploads,
        clientIP: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }
  }

  /**
   * Register upload end
   */
  private registerUploadEnd(uploadId: string, req: Request): void {
    if (this.activeUploadIds.has(uploadId)) {
      this.activeUploadIds.delete(uploadId);
      this.stats.activeUploads--;

      // Track upload size if available
      const contentLength = req.headers["content-length"];
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        this.uploadSizes.push(size);
        this.updateAverageUploadSize();
      }

      if (this.config.enableDetailedLogging) {
        logger.debug("✅ Upload completed", "UploadLimiter", {
          uploadId,
          activeUploads: this.stats.activeUploads,
        });
      }
    }
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(req: Request): string {
    const timestamp = Date.now();
    const clientIP = req.ip || "unknown";
    const userAgent = req.headers["user-agent"]?.slice(0, 20) || "unknown";
    return `${timestamp}-${clientIP}-${userAgent}`.replace(
      /[^a-zA-Z0-9-]/g,
      "-",
    );
  }

  /**
   * Update average upload size
   */
  private updateAverageUploadSize(): void {
    if (this.uploadSizes.length === 0) return;

    const total = this.uploadSizes.reduce((sum, size) => sum + size, 0);
    this.stats.averageUploadSize = Math.round(total / this.uploadSizes.length);

    // Keep only recent upload sizes (max 100)
    if (this.uploadSizes.length > 100) {
      this.uploadSizes = this.uploadSizes.slice(-100);
    }
  }

  /**
   * Start periodic stats reset
   */
  private startStatsReset(): void {
    TimerManager.setInterval(
      () => {
        this.resetStats();
      },
      this.config.trackingWindowMs,
      "auto-generated-interval-8",
    );
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    const now = Date.now();
    const elapsed = now - this.stats.lastReset;

    logger.info("📊 Upload limiter stats", "UploadLimiter", {
      period: `${elapsed / 1000}s`,
      totalUploads: this.stats.totalUploads,
      rejectedUploads: this.stats.rejectedUploads,
      peakConcurrency: this.stats.peakConcurrency,
      averageUploadSize: `${(this.stats.averageUploadSize / 1024).toFixed(1)}KB`,
      currentActive: this.stats.activeUploads,
    });

    // Reset counters but keep active uploads
    this.stats.totalUploads = 0;
    this.stats.rejectedUploads = 0;
    this.stats.peakConcurrency = this.stats.activeUploads;
    this.stats.lastReset = now;
    this.uploadSizes = [];
  }

  /**
   * Get public stats for API responses
   */
  private getPublicStats() {
    return {
      activeUploads: this.stats.activeUploads,
      maxConcurrentUploads: this.config.maxConcurrentUploads,
      maxUploadSizeBytes: this.config.maxUploadSizeBytes,
    };
  }

  /**
   * Get detailed stats for monitoring
   */
  getStats(): UploadStats & { config: UploadLimiterConfig } {
    return {
      ...this.stats,
      config: this.config,
    };
  }

  /**
   * Emergency stop all uploads
   */
  emergencyStop(): void {
    logger.warn(
      "🚨 Emergency stop - clearing all upload tracking",
      "UploadLimiter",
    );
    this.activeUploadIds.clear();
    this.stats.activeUploads = 0;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const uploadLimiter = new UploadLimiter();

// Register cleanup on process exit
process.on("SIGTERM", () => {
  uploadLimiter.emergencyStop();
});

process.on("SIGINT", () => {
  uploadLimiter.emergencyStop();
});

// ============================================================================
// EXPORTS
// ============================================================================

export default uploadLimiter.middleware();
export { UploadLimiter, uploadLimiter };
export type { UploadLimiterConfig, UploadStats };
