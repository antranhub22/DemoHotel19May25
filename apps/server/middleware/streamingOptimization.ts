// ============================================================================
// 🌊 STREAMING OPTIMIZATION MIDDLEWARE - Handle Large Payloads Efficiently
// ============================================================================

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import { Readable, Transform, pipeline } from "stream";
import { promisify } from "util";
import { TimerManager } from "../utils/TimerManager";

const pipelineAsync = promisify(pipeline);

// ============================================================================
// STREAMING CONFIGURATION
// ============================================================================

interface StreamingConfig {
  chunkSize: number;
  maxPayloadSize: number;
  enableCompression: boolean;
  enableBackpressure: boolean;
  timeoutMs: number;
}

interface StreamingStats {
  streamsCreated: number;
  bytesProcessed: number;
  averageChunkSize: number;
  compressionRatio: number;
  errors: number;
}

// ============================================================================
// STREAMING OPTIMIZATION CLASS
// ============================================================================

class StreamingOptimization {
  private config: StreamingConfig;
  private stats: StreamingStats;

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = {
      chunkSize: 64 * 1024, // 64KB chunks
      maxPayloadSize: 100 * 1024 * 1024, // 100MB max
      enableCompression: true,
      enableBackpressure: true,
      timeoutMs: 30000, // 30 seconds
      ...config,
    };

    this.stats = {
      streamsCreated: 0,
      bytesProcessed: 0,
      averageChunkSize: 0,
      compressionRatio: 1.0,
      errors: 0,
    };

    logger.debug("🌊 [StreamingOptimization] Initialized", "Streaming", {
      chunkSize: `${this.config.chunkSize / 1024}KB`,
      maxPayloadSize: `${this.config.maxPayloadSize / 1024 / 1024}MB`,
      enableCompression: this.config.enableCompression,
    });
  }

  /**
   * Create streaming middleware for large payloads
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const contentLength = parseInt(
          req.headers["content-length"] || "0",
          10,
        );

        // Only apply streaming for large payloads
        if (contentLength < this.config.chunkSize * 2) {
          return next();
        }

        if (contentLength > this.config.maxPayloadSize) {
          logger.warn("🚫 Payload too large for streaming", "Streaming", {
            contentLength: `${(contentLength / 1024 / 1024).toFixed(1)}MB`,
            maxSize: `${(this.config.maxPayloadSize / 1024 / 1024).toFixed(1)}MB`,
          });

          return res.status(413).json({
            error: "Payload too large",
            maxSize: `${(this.config.maxPayloadSize / 1024 / 1024).toFixed(1)}MB`,
          });
        }

        logger.debug("🌊 Starting streaming for large payload", "Streaming", {
          contentLength: `${(contentLength / 1024).toFixed(1)}KB`,
          route: req.path,
        });

        // Set up streaming response
        this.setupStreamingResponse(req, res);

        next();
      } catch (error) {
        this.stats.errors++;
        logger.error("⚠️ Streaming middleware error", "Streaming", {
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Fail gracefully
        next();
      }
    };
  }

  /**
   * Stream large JSON responses
   */
  streamJSONResponse(res: Response, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stats.streamsCreated++;

        const jsonString = JSON.stringify(data);
        const totalSize = Buffer.byteLength(jsonString, "utf8");

        logger.debug("🌊 Streaming JSON response", "Streaming", {
          size: `${(totalSize / 1024).toFixed(1)}KB`,
          chunks: Math.ceil(totalSize / this.config.chunkSize),
        });

        // Set headers for streaming
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Transfer-Encoding", "chunked");

        if (this.config.enableCompression) {
          res.setHeader("Content-Encoding", "gzip");
        }

        // Create readable stream from JSON string
        const jsonStream = Readable.from(this.chunkString(jsonString));

        // Create transform stream for processing
        const processStream = new Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
          },
        });

        // Set up timeout
        const timeout = TimerManager.setTimeout(
          () => {
            jsonStream.destroy(new Error("Stream timeout"));
            reject(new Error("Streaming timeout"));
          },
          this.config.timeoutMs,
          "auto-generated-timeout-5",
        );

        // Pipe with error handling
        jsonStream
          .pipe(processStream)
          .pipe(res)
          .on("finish", () => {
            clearTimeout(timeout);
            this.stats.bytesProcessed += totalSize;
            resolve();
          })
          .on("error", (error) => {
            clearTimeout(timeout);
            this.stats.errors++;
            reject(error);
          });
      } catch (error) {
        this.stats.errors++;
        reject(error);
      }
    });
  }

  /**
   * Stream file uploads - MEMORY SAFE VERSION
   * Returns a stream instead of accumulating chunks in memory
   */
  createUploadStream(req: Request): NodeJS.ReadableStream {
    let totalSize = 0;
    const maxSize = this.config.maxPayloadSize;

    this.stats.streamsCreated++;

    // Create a pass-through stream for safe piping
    const passThrough = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        totalSize += chunk.length;

        if (totalSize > maxSize) {
          const error = new Error(
            `Upload exceeds ${maxSize} bytes - current: ${totalSize} bytes`,
          );
          this.emit("error", error);
          return callback(error);
        }

        // Log progress for large uploads (every 1MB)
        if (totalSize % (1024 * 1024) === 0) {
          logger.debug("📤 Upload progress", "Streaming", {
            totalSize: `${(totalSize / 1024 / 1024).toFixed(1)}MB`,
            maxSize: `${(maxSize / 1024 / 1024).toFixed(1)}MB`,
          });
        }

        callback(null, chunk);
      },
    });

    // Set timeout for upload
    const timeout = TimerManager.setTimeout(
      () => {
        passThrough.destroy(new Error("Upload timeout"));
      },
      this.config.timeoutMs,
      "auto-generated-timeout-6",
    );

    passThrough.on("end", () => {
      clearTimeout(timeout);
      this.stats.bytesProcessed += totalSize;

      logger.debug("✅ Upload stream completed", "Streaming", {
        totalSize: `${(totalSize / 1024).toFixed(1)}KB`,
      });
    });

    passThrough.on("error", (error) => {
      clearTimeout(timeout);
      this.stats.errors++;
      logger.error("⚠️ Upload stream error", "Streaming", { error });
    });

    // Pipe request to pass-through stream
    req.pipe(passThrough);

    return passThrough;
  }

  /**
   * DEPRECATED: streamFileUpload - use createUploadStream instead
   * This method accumulates all chunks in memory (dangerous for large files)
   */
  async streamFileUpload(req: Request): Promise<Buffer[]> {
    logger.warn(
      "⚠️ DEPRECATED: streamFileUpload accumulates memory - use createUploadStream instead",
      "Streaming",
    );

    // For backward compatibility, but with strict limits
    const chunks: Buffer[] = [];
    let totalSize = 0;
    const SAFE_LIMIT = 10 * 1024 * 1024; // 10MB hard limit for memory accumulation

    return new Promise((resolve, reject) => {
      this.stats.streamsCreated++;

      const timeout = TimerManager.setTimeout(
        () => {
          req.destroy(new Error("Upload timeout"));
          reject(new Error("Upload streaming timeout"));
        },
        this.config.timeoutMs,
        "auto-generated-timeout-7",
      );

      req.on("data", (chunk: Buffer) => {
        totalSize += chunk.length;

        // ✅ MEMORY PROTECTION: Hard limit for memory accumulation
        if (totalSize > SAFE_LIMIT) {
          clearTimeout(timeout);
          req.destroy(new Error("Upload too large for memory accumulation"));
          reject(
            new Error(
              `Upload exceeds safe memory limit ${SAFE_LIMIT} bytes - use streaming instead`,
            ),
          );
          return;
        }

        if (totalSize > this.config.maxPayloadSize) {
          clearTimeout(timeout);
          req.destroy(new Error("Upload too large"));
          reject(
            new Error(`Upload exceeds ${this.config.maxPayloadSize} bytes`),
          );
          return;
        }

        chunks.push(chunk);

        // Log progress less frequently to reduce overhead
        if (chunks.length % 50 === 0) {
          logger.debug("📤 Upload progress", "Streaming", {
            chunks: chunks.length,
            totalSize: `${(totalSize / 1024).toFixed(1)}KB`,
            memoryUsed: `${(totalSize / 1024 / 1024).toFixed(1)}MB`,
          });
        }
      });

      req.on("end", () => {
        clearTimeout(timeout);
        this.stats.bytesProcessed += totalSize;

        logger.debug("✅ Upload stream completed (memory mode)", "Streaming", {
          chunks: chunks.length,
          totalSize: `${(totalSize / 1024).toFixed(1)}KB`,
          memoryUsed: `${(totalSize / 1024 / 1024).toFixed(1)}MB`,
        });

        resolve(chunks);
      });

      req.on("error", (error) => {
        clearTimeout(timeout);
        this.stats.errors++;
        logger.error("⚠️ Upload stream error", "Streaming", { error });
        reject(error);
      });
    });
  }

  /**
   * Setup streaming response headers and configuration
   */
  private setupStreamingResponse(req: Request, res: Response): void {
    // Enable streaming headers
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
    res.setHeader("Cache-Control", "no-cache"); // Disable caching for streams

    if (this.config.enableBackpressure) {
      res.setHeader("X-Stream-Backpressure", "enabled");
    }

    // Add cleanup on connection close
    req.on("close", () => {
      logger.debug("🔌 Streaming connection closed", "Streaming");
    });

    req.on("aborted", () => {
      logger.debug("⚠️ Streaming request aborted", "Streaming");
    });
  }

  /**
   * Split string into chunks for streaming
   */
  private *chunkString(str: string): Generator<Buffer> {
    const totalLength = Buffer.byteLength(str, "utf8");
    let offset = 0;

    while (offset < totalLength) {
      const chunkSize = Math.min(this.config.chunkSize, totalLength - offset);
      const chunk = Buffer.from(str.slice(offset, offset + chunkSize), "utf8");
      offset += chunkSize;
      yield chunk;
    }
  }

  /**
   * Get streaming statistics
   */
  getStats(): StreamingStats & { config: StreamingConfig } {
    return {
      ...this.stats,
      config: this.config,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      streamsCreated: 0,
      bytesProcessed: 0,
      averageChunkSize: 0,
      compressionRatio: 1.0,
      errors: 0,
    };

    logger.debug("📊 Streaming stats reset", "Streaming");
  }

  /**
   * Emergency cleanup
   */
  emergencyCleanup(): void {
    logger.warn("🚨 Streaming emergency cleanup", "Streaming");
    this.resetStats();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if request should use streaming
 */
function shouldUseStreaming(req: Request): boolean {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  const contentType = req.headers["content-type"] || "";

  // Stream for large JSON payloads or file uploads
  return (
    contentLength > 64 * 1024 || // > 64KB
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/octet-stream")
  );
}

/**
 * Create streaming response wrapper
 */
function createStreamingResponse(res: Response, data: any): Promise<void> {
  const streamer = new StreamingOptimization();
  return streamer.streamJSONResponse(res, data);
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const streamingOptimization = new StreamingOptimization();

// Register cleanup on process exit
process.on("SIGTERM", () => {
  streamingOptimization.emergencyCleanup();
});

process.on("SIGINT", () => {
  streamingOptimization.emergencyCleanup();
});

// ============================================================================
// EXPORTS
// ============================================================================

export default streamingOptimization.middleware();
export {
  StreamingOptimization,
  createStreamingResponse,
  shouldUseStreaming,
  streamingOptimization,
};
export type { StreamingConfig, StreamingStats };

// ============================================================================
// MEMORY-SAFE UPLOAD HELPERS
// ============================================================================

/**
 * Create memory-safe upload stream
 */
export function createSafeUploadStream(req: Request): NodeJS.ReadableStream {
  const streamer = new StreamingOptimization();
  return streamer.createUploadStream(req);
}

/**
 * Check if upload should use streaming vs memory accumulation
 */
export function shouldStreamUpload(contentLength: number): boolean {
  const MEMORY_SAFE_LIMIT = 5 * 1024 * 1024; // 5MB
  return contentLength > MEMORY_SAFE_LIMIT;
}
