/**
 * ✅ MEMORY FIX: VAPI Manager - Managed singleton with proper cleanup
 * Replaces global instance with managed singleton to prevent WebSocket memory leaks
 */

import Vapi from "@vapi-ai/web";
import { logger } from "../../packages/shared/utils/logger";

if (!process.env.VITE_VAPI_PUBLIC_KEY) {
  throw new Error("VITE_VAPI_PUBLIC_KEY is not set in environment variables");
}

/**
 * ✅ MEMORY FIX: VapiManager - Singleton with cleanup capabilities
 */
class VapiManager {
  private static instance: Vapi | null = null;
  private static isShuttingDown = false;

  /**
   * Get or create VAPI instance
   */
  static getInstance(): Vapi {
    if (this.isShuttingDown) {
      throw new Error(
        "VapiManager is shutting down, cannot create new instances",
      );
    }

    if (!this.instance) {
      logger.debug("Creating new VAPI instance", "VapiManager");
      this.instance = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY!);

      // Setup cleanup on process exit
      this.setupCleanupHandlers();
    }
    return this.instance;
  }

  /**
   * ✅ MEMORY FIX: Comprehensive cleanup for WebSocket connections
   */
  static async cleanup(): Promise<void> {
    if (this.instance && !this.isShuttingDown) {
      this.isShuttingDown = true;

      try {
        logger.info("🧹 Cleaning up VAPI instance", "VapiManager");

        // Try to stop any active call
        try {
          await this.instance.stop();
          logger.debug("VAPI call stopped successfully", "VapiManager");
        } catch (error) {
          logger.warn("Error stopping VAPI call:", "VapiManager", error);
        }

        // Clear any internal listeners/connections if the SDK supports it
        try {
          // Note: The actual cleanup method depends on the VAPI SDK implementation
          // This is a generic approach - may need adjustment based on SDK version
          if (typeof (this.instance as any).cleanup === "function") {
            await (this.instance as any).cleanup();
          }

          // Clear event listeners if available
          if (typeof (this.instance as any).removeAllListeners === "function") {
            (this.instance as any).removeAllListeners();
          }

          logger.debug("VAPI internal cleanup completed", "VapiManager");
        } catch (error) {
          logger.warn(
            "Error during VAPI internal cleanup:",
            "VapiManager",
            error,
          );
        }

        this.instance = null;
        logger.success("✅ VAPI cleanup completed", "VapiManager");
      } catch (error) {
        logger.error("❌ VAPI cleanup failed", "VapiManager", error);
        // Still clear the instance to prevent further usage
        this.instance = null;
      }
    }
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  private static setupCleanupHandlers(): void {
    // Only setup once
    if ((global as any).__vapiCleanupHandlersSetup) {
      return;
    }
    (global as any).__vapiCleanupHandlersSetup = true;

    // Setup process exit handlers
    const cleanupHandler = async () => {
      await this.cleanup();
    };

    process.on("SIGTERM", cleanupHandler);
    process.on("SIGINT", cleanupHandler);
    process.on("beforeExit", cleanupHandler);

    logger.debug("VAPI cleanup handlers registered", "VapiManager");
  }

  /**
   * Get current instance status
   */
  static getStatus(): {
    hasInstance: boolean;
    isShuttingDown: boolean;
  } {
    return {
      hasInstance: this.instance !== null,
      isShuttingDown: this.isShuttingDown,
    };
  }
}

// ============================================
// PUBLIC API - Maintains backward compatibility
// ============================================

/**
 * Get VAPI instance (replaces direct vapi export)
 */
export const getVapi = (): Vapi => VapiManager.getInstance();

/**
 * Cleanup VAPI instance (new)
 */
export const cleanupVapi = (): Promise<void> => VapiManager.cleanup();

/**
 * Get VAPI status (new)
 */
export const getVapiStatus = () => VapiManager.getStatus();

// ============================================
// CALL MANAGEMENT FUNCTIONS
// ============================================

/**
 * Function to start a call
 */
export async function startCall(assistantId: string, assistantOverrides?: any) {
  try {
    const vapi = getVapi();
    const call = await vapi.start(assistantId, assistantOverrides);
    logger.debug("VAPI call started successfully", "VapiManager", {
      assistantId,
    });
    return call;
  } catch (error) {
    logger.error("Error starting call:", "VapiManager", error);
    throw error;
  }
}

/**
 * Function to end a call
 */
export async function endCall() {
  try {
    const vapi = getVapi();
    await vapi.stop();
    logger.debug("VAPI call ended successfully", "VapiManager");
  } catch (error) {
    logger.error("Error ending call:", "VapiManager", error);
    throw error;
  }
}

/**
 * Function to get call status (placeholder)
 */
export async function getCallStatus() {
  try {
    // No direct API in VAPI SDK, return dummy status
    const status = VapiManager.getStatus();
    return {
      status:
        status.hasInstance && !status.isShuttingDown ? "ready" : "unavailable",
      hasInstance: status.hasInstance,
      isShuttingDown: status.isShuttingDown,
    };
  } catch (error) {
    logger.error("Error getting call status:", "VapiManager", error);
    throw error;
  }
}

/**
 * Function to get call transcript (placeholder)
 */
export async function getCallTranscript() {
  try {
    // No direct API in VAPI SDK, return empty array
    return [];
  } catch (error) {
    logger.error("Error getting call transcript:", "VapiManager", error);
    throw error;
  }
}

// ============================================
// BACKWARD COMPATIBILITY (DEPRECATED)
// ============================================

/**
 * @deprecated Use getVapi() instead
 * Legacy export for backward compatibility
 */
export const vapi = new Proxy({} as Vapi, {
  get(_target, prop) {
    logger.warn(
      "Direct vapi access is deprecated. Use getVapi() instead.",
      "VapiManager",
    );
    const instance = getVapi();
    return (instance as any)[prop];
  },
});
