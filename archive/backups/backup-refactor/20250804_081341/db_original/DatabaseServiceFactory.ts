/**
 * 🏭 DATABASE SERVICE FACTORY
 *
 * Factory pattern để switch giữa Drizzle và Prisma
 * based on environment variables và feature flags
 */

import { logger } from "@shared/utils/logger";
import { DatabaseConnectionManager } from "./connectionManager";
import { DatabaseProvider, IDatabaseService } from "./IDatabaseService";
import { PrismaConnectionManager } from "./PrismaConnectionManager";

// Import services
import { PrismaDatabaseService } from "../services/PrismaDatabaseService";
// import { DrizzleDatabaseService } from '../services/DrizzleDatabaseService'; // TODO: Create later

/**
 * Environment Configuration Interface
 */
interface DatabaseEnvironmentConfig {
  usePrisma: boolean;
  provider: DatabaseProvider;
  enableDualMode: boolean;
  enableQueryLogging: boolean;
  enablePerformanceMetrics: boolean;
  fallbackToDrizzle: boolean;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseEnvironmentConfig {
  const usePrisma =
    process.env.USE_PRISMA === "true" ||
    process.env.PRISMA_ENABLED === "true" ||
    process.env.ENABLE_PRISMA === "1";

  const enableDualMode =
    process.env.DUAL_ORM_MODE === "true" ||
    process.env.ENABLE_DUAL_ORM === "true";

  const enableQueryLogging =
    process.env.DB_QUERY_LOGGING === "true" ||
    process.env.NODE_ENV === "development";

  const enablePerformanceMetrics =
    process.env.DB_PERFORMANCE_METRICS === "true" ||
    process.env.NODE_ENV !== "production";

  const fallbackToDrizzle = process.env.FALLBACK_TO_DRIZZLE !== "false";

  return {
    usePrisma,
    provider: usePrisma ? DatabaseProvider.PRISMA : DatabaseProvider.DRIZZLE,
    enableDualMode,
    enableQueryLogging,
    enablePerformanceMetrics,
    fallbackToDrizzle,
  };
}

/**
 * Database Service Factory Class
 */
export class DatabaseServiceFactory {
  private static instance: DatabaseServiceFactory;
  private static config: DatabaseEnvironmentConfig;
  private static drizzleConnectionManager: DatabaseConnectionManager;
  private static prismaConnectionManager: PrismaConnectionManager;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseServiceFactory {
    if (!DatabaseServiceFactory.instance) {
      DatabaseServiceFactory.instance = new DatabaseServiceFactory();
      DatabaseServiceFactory.config = getDatabaseConfig();

      logger.info("🏭 Database Service Factory initialized");
      logger.info(
        `📊 Configuration: ${JSON.stringify(DatabaseServiceFactory.config, null, 2)}`,
      );
    }
    return DatabaseServiceFactory.instance;
  }

  /**
   * Initialize connection managers based on configuration
   */
  static async initializeConnections(): Promise<void> {
    const config = getDatabaseConfig();

    try {
      if (config.usePrisma || config.enableDualMode) {
        // Initialize Prisma connection
        DatabaseServiceFactory.prismaConnectionManager =
          PrismaConnectionManager.getInstance();
        await DatabaseServiceFactory.prismaConnectionManager.initialize();
        logger.info("✅ Prisma connection manager initialized");
      }

      if (
        !config.usePrisma ||
        config.enableDualMode ||
        config.fallbackToDrizzle
      ) {
        // Initialize Drizzle connection
        DatabaseServiceFactory.drizzleConnectionManager =
          DatabaseConnectionManager.getInstance();
        await DatabaseServiceFactory.drizzleConnectionManager.initialize();
        logger.info("✅ Drizzle connection manager initialized");
      }

      logger.info(
        "🎉 All required database connections initialized successfully",
      );
    } catch (error) {
      logger.error("❌ Failed to initialize database connections:", error);

      // Fallback logic
      if (config.usePrisma && config.fallbackToDrizzle) {
        logger.warn(
          "⚠️ Falling back to Drizzle due to Prisma connection failure",
        );
        try {
          DatabaseServiceFactory.drizzleConnectionManager =
            DatabaseConnectionManager.getInstance();
          await DatabaseServiceFactory.drizzleConnectionManager.initialize();
          logger.info("✅ Fallback to Drizzle successful");
        } catch (fallbackError) {
          logger.error("❌ Fallback to Drizzle also failed:", fallbackError);
          throw new Error("All database connection attempts failed");
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get active database provider
   */
  static getActiveProvider(): DatabaseProvider {
    const config = getDatabaseConfig();

    // Check if Prisma is available and configured
    if (config.usePrisma && DatabaseServiceFactory.prismaConnectionManager) {
      return DatabaseProvider.PRISMA;
    }

    // Check if Drizzle is available
    if (DatabaseServiceFactory.drizzleConnectionManager) {
      return DatabaseProvider.DRIZZLE;
    }

    throw new Error("No database connection available");
  }

  /**
   * Get Prisma connection manager
   */
  static getPrismaManager(): PrismaConnectionManager {
    if (!DatabaseServiceFactory.prismaConnectionManager) {
      throw new Error("Prisma connection manager not initialized");
    }
    return DatabaseServiceFactory.prismaConnectionManager;
  }

  /**
   * Get Drizzle connection manager
   */
  static getDrizzleManager(): DatabaseConnectionManager {
    if (!DatabaseServiceFactory.drizzleConnectionManager) {
      throw new Error("Drizzle connection manager not initialized");
    }
    return DatabaseServiceFactory.drizzleConnectionManager;
  }

  /**
   * Create database service based on configuration
   */
  static async createDatabaseService(): Promise<IDatabaseService> {
    const provider = DatabaseServiceFactory.getActiveProvider();

    switch (provider) {
      case DatabaseProvider.PRISMA:
        logger.info("🔄 Creating unified Prisma database service");
        const prismaManager = DatabaseServiceFactory.getPrismaManager();
        return new PrismaDatabaseService(prismaManager);

      case DatabaseProvider.DRIZZLE:
        logger.info("🔄 Creating Drizzle database service");
        // TODO: Return new DrizzleDatabaseService(DatabaseServiceFactory.getDrizzleManager());
        throw new Error("DrizzleDatabaseService not implemented yet");

      default:
        throw new Error(`Unsupported database provider: ${provider}`);
    }
  }

  /**
   * Health check for all active connections
   */
  static async healthCheck(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    const config = getDatabaseConfig();

    if (config.usePrisma || config.enableDualMode) {
      try {
        results.prisma =
          (await DatabaseServiceFactory.prismaConnectionManager?.healthCheck()) ||
          false;
      } catch (error) {
        logger.error("❌ Prisma health check failed:", error);
        results.prisma = false;
      }
    }

    if (
      !config.usePrisma ||
      config.enableDualMode ||
      config.fallbackToDrizzle
    ) {
      try {
        results.drizzle =
          (await DatabaseServiceFactory.drizzleConnectionManager?.healthCheck()) ||
          false;
      } catch (error) {
        logger.error("❌ Drizzle health check failed:", error);
        results.drizzle = false;
      }
    }

    return results;
  }

  /**
   * Get performance metrics from all active connections
   */
  static getMetrics(): { [key: string]: any } {
    const metrics: { [key: string]: any } = {};
    const config = getDatabaseConfig();

    if (config.usePrisma || config.enableDualMode) {
      try {
        metrics.prisma =
          DatabaseServiceFactory.prismaConnectionManager?.getMetrics();
      } catch (error) {
        logger.error("❌ Failed to get Prisma metrics:", error);
      }
    }

    if (
      !config.usePrisma ||
      config.enableDualMode ||
      config.fallbackToDrizzle
    ) {
      try {
        metrics.drizzle =
          DatabaseServiceFactory.drizzleConnectionManager?.getMetrics();
      } catch (error) {
        logger.error("❌ Failed to get Drizzle metrics:", error);
      }
    }

    return metrics;
  }

  /**
   * Graceful shutdown of all connections
   */
  static async shutdown(): Promise<void> {
    const shutdownPromises: Promise<void>[] = [];

    if (DatabaseServiceFactory.prismaConnectionManager) {
      shutdownPromises.push(
        DatabaseServiceFactory.prismaConnectionManager
          .disconnect()
          .catch((error) => logger.error("❌ Prisma disconnect error:", error)),
      );
    }

    if (DatabaseServiceFactory.drizzleConnectionManager) {
      shutdownPromises.push(
        DatabaseServiceFactory.drizzleConnectionManager
          .disconnect()
          .catch((error) =>
            logger.error("❌ Drizzle disconnect error:", error),
          ),
      );
    }

    await Promise.all(shutdownPromises);
    logger.info("✅ All database connections closed");
  }

  /**
   * Force switch to Prisma (for testing or manual override)
   */
  static async switchToPrisma(): Promise<void> {
    process.env.USE_PRISMA = "true";
    DatabaseServiceFactory.config = getDatabaseConfig();

    if (!DatabaseServiceFactory.prismaConnectionManager) {
      await DatabaseServiceFactory.initializeConnections();
    }

    logger.info("🔄 Switched to Prisma provider");
  }

  /**
   * Force switch to Drizzle (for testing or manual override)
   */
  static async switchToDrizzle(): Promise<void> {
    process.env.USE_PRISMA = "false";
    DatabaseServiceFactory.config = getDatabaseConfig();

    if (!DatabaseServiceFactory.drizzleConnectionManager) {
      await DatabaseServiceFactory.initializeConnections();
    }

    logger.info("🔄 Switched to Drizzle provider");
  }

  /**
   * Enable dual ORM mode (both Prisma and Drizzle active)
   */
  static async enableDualMode(): Promise<void> {
    process.env.DUAL_ORM_MODE = "true";
    DatabaseServiceFactory.config = getDatabaseConfig();

    await DatabaseServiceFactory.initializeConnections();

    logger.info("🔄 Enabled dual ORM mode (Prisma + Drizzle)");
  }
}

// Export singleton instance
export const databaseFactory = DatabaseServiceFactory.getInstance();
