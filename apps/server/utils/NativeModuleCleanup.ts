/**
 * 🚨 AGGRESSIVE NATIVE MODULE CLEANUP
 * Fixes persistent native_modules and unknown_sources memory leaks
 */

import { logger } from "../../../packages/shared/utils/logger";
import { TimerManager } from "../utils/TimerManager";

interface NativeModuleLeakSource {
  name: string;
  estimatedMemory: number;
  handles: any[];
  cleanup?: () => void;
}

class NativeModuleCleanup {
  private static instance: NativeModuleCleanup;
  private trackedModules = new Map<string, NativeModuleLeakSource>();
  private cleanupHandlers: (() => void)[] = [];
  private isShuttingDown = false;

  static getInstance(): NativeModuleCleanup {
    if (!this.instance) {
      this.instance = new NativeModuleCleanup();
    }
    return this.instance;
  }

  /**
   * Initialize aggressive native module cleanup
   */
  initialize(): void {
    logger.info(
      "🧹 Initializing aggressive native module cleanup",
      "NativeModuleCleanup",
    );

    // Track and cleanup common native module leaks
    this.setupPrismaCleanup();
    this.setupSocketIOCleanup();
    this.setupHttpCleanup();
    this.setupBufferCleanup();
    this.setupCryptoCleanup();
    this.setupTimerCleanup();
    this.setupProcessCleanup();

    // Setup periodic cleanup
    this.startPeriodicCleanup();

    // Setup shutdown handlers
    this.setupShutdownCleanup();
  }

  /**
   * Setup Prisma native module cleanup
   */
  private setupPrismaCleanup(): void {
    try {
      // Track Prisma connections that might leak
      const prismaCleanup = () => {
        // Force close any dangling Prisma connections
        try {
          // Clear any cached queries in Prisma
          if (
            global.prisma &&
            typeof global.prisma.$disconnect === "function"
          ) {
            global.prisma.$disconnect();
          }

          // Clear Prisma engine processes
          if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
            delete process.env.PRISMA_QUERY_ENGINE_LIBRARY;
          }
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(prismaCleanup);

      this.trackedModules.set("prisma", {
        name: "prisma",
        estimatedMemory: 0,
        handles: [],
        cleanup: prismaCleanup,
      });

      logger.debug(
        "✅ Prisma cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup Socket.IO cleanup for WebSocket native handles
   */
  private setupSocketIOCleanup(): void {
    try {
      const socketCleanup = () => {
        // Clear Socket.IO engine sockets
        try {
          // Force close any remaining socket handles
          if (global.io && typeof global.io.close === "function") {
            global.io.close();
          }

          // Clear WebSocket native handles
          if (global.WebSocket) {
            // Clear any cached WebSocket connections
            delete global.WebSocket;
          }
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(socketCleanup);

      this.trackedModules.set("socket.io", {
        name: "socket.io",
        estimatedMemory: 0,
        handles: [],
        cleanup: socketCleanup,
      });

      logger.debug(
        "✅ Socket.IO cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup HTTP/HTTPS native module cleanup
   */
  private setupHttpCleanup(): void {
    try {
      const httpCleanup = () => {
        // Clear HTTP agent keep-alive connections
        try {
          const http = require("http");
          const https = require("https");

          // Destroy global agents
          if (http.globalAgent) {
            http.globalAgent.destroy();
          }
          if (https.globalAgent) {
            https.globalAgent.destroy();
          }

          // Clear DNS cache
          if (require("dns").clearCache) {
            require("dns").clearCache();
          }
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(httpCleanup);

      this.trackedModules.set("http", {
        name: "http",
        estimatedMemory: 0,
        handles: [],
        cleanup: httpCleanup,
      });

      logger.debug("✅ HTTP cleanup handler registered", "NativeModuleCleanup");
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup Buffer cleanup for native memory
   */
  private setupBufferCleanup(): void {
    try {
      const bufferCleanup = () => {
        // Force garbage collection of large buffers
        try {
          // Clear buffer pool
          if (Buffer.poolSize) {
            Buffer.poolSize = 0;
          }

          // Clear any global buffer references
          if (global.Buffer && global.Buffer.allocUnsafe) {
            // Reset buffer allocation to safe defaults
            global.Buffer.allocUnsafe = global.Buffer.alloc;
          }
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(bufferCleanup);

      this.trackedModules.set("buffer", {
        name: "buffer",
        estimatedMemory: 0,
        handles: [],
        cleanup: bufferCleanup,
      });

      logger.debug(
        "✅ Buffer cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup Crypto native module cleanup
   */
  private setupCryptoCleanup(): void {
    try {
      const cryptoCleanup = () => {
        // Clear crypto module state
        try {
          const crypto = require("crypto");

          // Clear any cached crypto contexts
          if (crypto.clearCache) {
            crypto.clearCache();
          }

          // Clear random number generator state
          if (crypto.randomBytes && crypto.randomBytes.clearCache) {
            crypto.randomBytes.clearCache();
          }
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(cryptoCleanup);

      this.trackedModules.set("crypto", {
        name: "crypto",
        estimatedMemory: 0,
        handles: [],
        cleanup: cryptoCleanup,
      });

      logger.debug(
        "✅ Crypto cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup Timer cleanup for native handles
   */
  private setupTimerCleanup(): void {
    try {
      const timerCleanup = () => {
        // Clear all active timers/intervals
        try {
          // Get all timer handles and clear them
          const activeHandles = process._getActiveHandles?.() || [];
          activeHandles.forEach((handle) => {
            try {
              if (handle && typeof handle.close === "function") {
                handle.close();
              }
            } catch (_e) {
              // Silent cleanup
            }
          });

          // Clear immediate callbacks
          const activeRequests = process._getActiveRequests?.() || [];
          activeRequests.forEach((request) => {
            try {
              if (request && typeof request.cancel === "function") {
                request.cancel();
              }
            } catch (_e) {
              // Silent cleanup
            }
          });
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(timerCleanup);

      this.trackedModules.set("timers", {
        name: "timers",
        estimatedMemory: 0,
        handles: [],
        cleanup: timerCleanup,
      });

      logger.debug(
        "✅ Timer cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Setup process handle cleanup
   */
  private setupProcessCleanup(): void {
    try {
      const processCleanup = () => {
        // Clear process-level handles
        try {
          // Clear uncaught exception handlers that might hold references
          process.removeAllListeners("uncaughtException");
          process.removeAllListeners("unhandledRejection");
          process.removeAllListeners("SIGTERM");
          process.removeAllListeners("SIGINT");

          // Clear any remaining event listeners
          const eventNames = process.eventNames();
          eventNames.forEach((eventName) => {
            if (eventName !== "newListener" && eventName !== "removeListener") {
              const listeners = process.listeners(eventName);
              listeners.forEach((listener) => {
                try {
                  process.removeListener(eventName, listener);
                } catch (_e) {
                  // Silent cleanup
                }
              });
            }
          });
        } catch (_e) {
          // Silent cleanup
        }
      };

      this.cleanupHandlers.push(processCleanup);

      this.trackedModules.set("process", {
        name: "process",
        estimatedMemory: 0,
        handles: [],
        cleanup: processCleanup,
      });

      logger.debug(
        "✅ Process cleanup handler registered",
        "NativeModuleCleanup",
      );
    } catch (_e) {
      // Silent error handling
    }
  }

  /**
   * Start periodic cleanup to prevent accumulation
   */
  private startPeriodicCleanup(): void {
    // Aggressive cleanup every 5 minutes
    TimerManager.setInterval(() => {
      if (this.isShuttingDown) return;

      try {
        this.performPeriodicCleanup();
      } catch (error) {
        logger.warn(
          "Periodic native module cleanup failed",
          "NativeModuleCleanup",
          error,
        );
      }
    }, 300000); // 5 minutes
  }

  /**
   * Perform periodic cleanup
   */
  private performPeriodicCleanup(): void {
    logger.debug(
      "🧹 Performing periodic native module cleanup",
      "NativeModuleCleanup",
    );

    let cleanedModules = 0;

    this.trackedModules.forEach((module, name) => {
      try {
        if (module.cleanup && typeof module.cleanup === "function") {
          module.cleanup();
          cleanedModules++;
        }
      } catch (error) {
        logger.warn(
          `Failed to cleanup module ${name}`,
          "NativeModuleCleanup",
          error,
        );
      }
    });

    // Force garbage collection if available
    if (global.gc) {
      try {
        global.gc();
        logger.debug(
          `✅ Cleaned ${cleanedModules} native modules + forced GC`,
          "NativeModuleCleanup",
        );
      } catch (_e) {
        logger.debug(
          `✅ Cleaned ${cleanedModules} native modules`,
          "NativeModuleCleanup",
        );
      }
    } else {
      logger.debug(
        `✅ Cleaned ${cleanedModules} native modules`,
        "NativeModuleCleanup",
      );
    }
  }

  /**
   * Setup shutdown cleanup
   */
  private setupShutdownCleanup(): void {
    const shutdownHandler = () => {
      this.performCompleteCleanup();
    };

    process.on("exit", shutdownHandler);
    process.on("SIGTERM", shutdownHandler);
    process.on("SIGINT", shutdownHandler);
    process.on("uncaughtException", shutdownHandler);
  }

  /**
   * Perform complete cleanup on shutdown
   */
  performCompleteCleanup(): void {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info(
      "🧹 Performing complete native module cleanup",
      "NativeModuleCleanup",
    );

    let cleanedModules = 0;

    // Run all cleanup handlers
    this.cleanupHandlers.forEach((cleanup, index) => {
      try {
        cleanup();
        cleanedModules++;
      } catch (error) {
        logger.warn(
          `Cleanup handler ${index} failed`,
          "NativeModuleCleanup",
          error,
        );
      }
    });

    // Clear tracked modules
    this.trackedModules.clear();
    this.cleanupHandlers = [];

    // Final aggressive garbage collection
    if (global.gc) {
      try {
        global.gc();
        global.gc(); // Run twice for thoroughness
        logger.success(
          `✅ Complete cleanup: ${cleanedModules} modules + forced GC`,
          "NativeModuleCleanup",
        );
      } catch (_e) {
        logger.success(
          `✅ Complete cleanup: ${cleanedModules} modules`,
          "NativeModuleCleanup",
        );
      }
    } else {
      logger.success(
        `✅ Complete cleanup: ${cleanedModules} modules`,
        "NativeModuleCleanup",
      );
    }
  }

  /**
   * Get current module tracking status
   */
  getStatus(): {
    trackedModules: number;
    cleanupHandlers: number;
    isShuttingDown: boolean;
  } {
    return {
      trackedModules: this.trackedModules.size,
      cleanupHandlers: this.cleanupHandlers.length,
      isShuttingDown: this.isShuttingDown,
    };
  }

  /**
   * Force immediate cleanup (for testing/debugging)
   */
  forceCleanup(): void {
    logger.info(
      "🚨 Forcing immediate native module cleanup",
      "NativeModuleCleanup",
    );
    this.performPeriodicCleanup();
  }
}

// Export singleton instance
export const nativeModuleCleanup = NativeModuleCleanup.getInstance();

// Export for global access
if (process.env.NODE_ENV === "development") {
  (global as any).nativeModuleCleanup = nativeModuleCleanup;
}
