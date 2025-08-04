// ============================================
// REQUEST MODULE - Modular Architecture v2.0 with Lifecycle Management
// ============================================
// Organizes existing request functionality with enhanced lifecycle management
// Includes startup/shutdown hooks, health monitoring, and graceful degradation

// Re-export existing controllers and services
export { RequestController } from "@server/controllers/requestController";

// ✅ NEW v2.0: Import lifecycle management
import { FeatureFlags } from "@server/shared/FeatureFlags";
import {
  ModuleLifecycleManager,
  type ModuleDefinition,
  type ModuleLifecycleHooks,
} from "@server/shared/ModuleLifecycleManager";
import { ServiceContainer } from "@server/shared/ServiceContainer";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
import { logger } from "@shared/utils/logger";

// ============================================
// MODULE LIFECYCLE HOOKS
// ============================================

const requestModuleHooks: ModuleLifecycleHooks = {
  async onStartup() {
    logger.info("🚀 [RequestModule] Starting up...", "RequestModule");

    // Initialize RequestController flag listeners
    const { RequestController } = await import(
      "@server/controllers/requestController"
    );
    RequestController.initialize();

    // Register services with ServiceContainer
    try {
      const { TenantService } = await import("@server/services/tenantService");
      ServiceContainer.register("TenantService", TenantService, {
        module: "request-module",
        singleton: true,
        dependencies: ["tenant-module"],
      });
      logger.debug("✅ [RequestModule] Services registered", "RequestModule");
    } catch (error) {
      logger.warn(
        "⚠️ [RequestModule] Failed to register some services",
        "RequestModule",
        error,
      );
    }

    // Validate database connection
    try {
      // Simple query to validate database connectivity using Prisma
      const prisma = PrismaConnectionManager.getInstance().getClient();
      await prisma.$queryRaw`SELECT 1`;
      logger.debug(
        "✅ [RequestModule] Database connection validated",
        "RequestModule",
      );
    } catch (error) {
      logger.error(
        "❌ [RequestModule] Database connection failed",
        "RequestModule",
        error,
      );
      throw new Error("Database connection required for request module");
    }

    logger.success(
      "✅ [RequestModule] Startup completed successfully",
      "RequestModule",
    );
  },

  async onShutdown() {
    logger.info("🛑 [RequestModule] Shutting down...", "RequestModule");

    // No specific cleanup needed for request module
    // Controllers are stateless and don't need explicit cleanup

    logger.success("✅ [RequestModule] Shutdown completed", "RequestModule");
  },

  async onHealthCheck(): Promise<boolean> {
    try {
      // Check if feature flag is enabled
      if (!FeatureFlags.isEnabled("request-module")) {
        return false;
      }

      // Check database connectivity
      const prisma = PrismaConnectionManager.getInstance().getClient();
      await prisma.$queryRaw`SELECT 1`;

      // Check if TenantService is available (optional dependency)
      const hasTenantService = ServiceContainer.has("TenantService");
      if (!hasTenantService) {
        logger.warn(
          "⚠️ [RequestModule] TenantService not available",
          "RequestModule",
        );
        // This is degraded but not failed state
      }

      return true;
    } catch (error) {
      logger.error(
        "❌ [RequestModule] Health check failed",
        "RequestModule",
        error,
      );
      return false;
    }
  },

  async onDegraded() {
    logger.warn("⚠️ [RequestModule] Entering degraded state", "RequestModule");

    // In degraded state, we might:
    // - Disable non-essential features
    // - Switch to simplified processing
    // - Increase logging for debugging

    // For now, just log the state change
    logger.info(
      "🔄 [RequestModule] Operating in degraded mode",
      "RequestModule",
    );
  },

  async onRecovered() {
    logger.info(
      "💚 [RequestModule] Recovered from degraded state",
      "RequestModule",
    );

    // Re-enable full functionality
    logger.success(
      "✅ [RequestModule] Full functionality restored",
      "RequestModule",
    );
  },

  async onDependencyFailed(failedDependency: string) {
    logger.warn(
      `⚠️ [RequestModule] Dependency failed: ${failedDependency}`,
      "RequestModule",
      { failedDependency },
    );

    if (failedDependency === "tenant-module") {
      // Critical dependency failed - we need to handle this gracefully
      logger.error(
        "💀 [RequestModule] Critical dependency failed - tenant isolation compromised",
        "RequestModule",
      );

      // We might want to:
      // - Stop accepting new requests
      // - Return error responses
      // - Alert administrators
    }
  },
};

// ============================================
// MODULE DEFINITION
// ============================================

export const RequestModuleDefinition: ModuleDefinition = {
  name: "request-module",
  version: "2.0.0",
  description: "Request/Order management module with lifecycle management",
  dependencies: ["tenant-module"], // Critical dependency
  optionalDependencies: [], // No optional dependencies
  priority: 20, // Medium priority (lower numbers start first)
  healthCheckInterval: 30000, // 30 seconds
  maxFailures: 3, // Allow 3 failures before marking as failed
  gracefulShutdownTimeout: 5000, // 5 seconds
  lifecycle: requestModuleHooks,
  featureFlag: "request-module", // Controlled by feature flag
};

// ============================================
// MODULE METADATA (backwards compatible)
// ============================================

export const RequestModuleInfo = {
  name: "request-module",
  version: "2.0.0",
  description:
    "Request/Order management module with enhanced lifecycle management",
  dependencies: ["tenant-module", "auth-module"],
  endpoints: [
    "POST /api/request",
    "GET /api/request",
    "GET /api/request/:id",
    "PATCH /api/request/:id/status",
  ],
  features: [
    "request-creation",
    "request-management",
    "camelCase-transformation",
    "tenant-isolation",
    "lifecycle-management",
    "health-monitoring",
    "graceful-degradation",
  ],
};

// ============================================
// MODULE HEALTH CHECK (backwards compatible)
// ============================================

export const checkRequestModuleHealth = () => {
  const lifecycleManager =
    ModuleLifecycleManager.getModuleStatus("request-module");

  return {
    status: lifecycleManager?.state || "unknown",
    timestamp: new Date().toISOString(),
    module: RequestModuleInfo.name,
    version: RequestModuleInfo.version,
    lifecycle: {
      state: lifecycleManager?.state,
      startedAt: lifecycleManager?.startedAt,
      lastHealthCheck: lifecycleManager?.lastHealthCheck,
      healthCheckCount: lifecycleManager?.healthCheckCount,
      failureCount: lifecycleManager?.failureCount,
      metrics: lifecycleManager?.metrics,
    },
  };
};

// ============================================
// AUTO-REGISTRATION WITH LIFECYCLE MANAGER
// ============================================

// Auto-register this module with the lifecycle manager when imported
try {
  ModuleLifecycleManager.registerModule(RequestModuleDefinition);
  logger.debug(
    "🔄 [RequestModule] Registered with ModuleLifecycleManager",
    "RequestModule",
    { version: RequestModuleDefinition.version },
  );
} catch (error) {
  logger.error(
    "❌ [RequestModule] Failed to register with ModuleLifecycleManager",
    "RequestModule",
    error,
  );
}
