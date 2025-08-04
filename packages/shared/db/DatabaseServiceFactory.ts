/**
 * 🏭 PRISMA DATABASE SERVICE FACTORY
 *
 * ✅ Simplified factory pattern - Prisma only
 * Enhanced performance và simplified architecture
 */

import { logger } from "@shared/utils/logger";
import { DatabaseProvider, IDatabaseService } from "./IDatabaseService";
import { PrismaConnectionManager } from "./PrismaConnectionManager";

// Import services
import { PrismaDatabaseService } from "../services/PrismaDatabaseService";

/**
 * Environment Configuration Interface
 */
interface DatabaseEnvironmentConfig {
  usePrisma: boolean; // Always true
  provider: DatabaseProvider; // Always 'prisma'
  enableQueryLogging: boolean;
  enablePerformanceMetrics: boolean;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseEnvironmentConfig {
  const enableQueryLogging =
    process.env.DB_QUERY_LOGGING === "true" ||
    process.env.NODE_ENV === "development";

  const enablePerformanceMetrics =
    process.env.DB_PERFORMANCE_METRICS === "true" ||
    process.env.NODE_ENV !== "production";

  return {
    usePrisma: true, // Always true after migration
    provider: DatabaseProvider.PRISMA, // Always Prisma
    enableQueryLogging,
    enablePerformanceMetrics,
  };
}

/**
 * Database Service Factory Class
 */
export class DatabaseServiceFactory {
  private static instance: DatabaseServiceFactory;
  private static config: DatabaseEnvironmentConfig;
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
   * ✅ PRISMA ONLY: Initialize Prisma connection manager
   */
  static async initializeConnections(): Promise<void> {
    try {
      // Initialize Prisma connection only
      DatabaseServiceFactory.prismaConnectionManager =
        PrismaConnectionManager.getInstance();
      await DatabaseServiceFactory.prismaConnectionManager.initialize();

      logger.info("✅ Prisma connection manager initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize Prisma connection:", error);
      throw new Error(`Prisma connection initialization failed: ${error}`);
    }
  }

  /**
   * ✅ PRISMA ONLY: Get active database provider
   */
  static getActiveProvider(): DatabaseProvider {
    if (!DatabaseServiceFactory.prismaConnectionManager) {
      throw new Error("Prisma connection not initialized");
    }
    return DatabaseProvider.PRISMA;
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
   * ✅ PRISMA ONLY: Create Prisma database service
   */
  static async createDatabaseService(): Promise<IDatabaseService> {
    logger.info("🔄 Creating Prisma database service");
    const prismaManager = DatabaseServiceFactory.getPrismaManager();
    return new PrismaDatabaseService(prismaManager);
  }

  /**
   * ✅ PRISMA ONLY: Health check for Prisma connection
   */
  static async healthCheck(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    try {
      results.prisma =
        (await DatabaseServiceFactory.prismaConnectionManager?.healthCheck()) ||
        false;
    } catch (error) {
      logger.error("❌ Prisma health check failed:", error);
      results.prisma = false;
    }

    return results;
  }

  /**
   * ✅ PRISMA ONLY: Get performance metrics from Prisma connection
   */
  static getMetrics(): { [key: string]: any } {
    const metrics: { [key: string]: any } = {};

    try {
      metrics.prisma =
        DatabaseServiceFactory.prismaConnectionManager?.getMetrics();
    } catch (error) {
      logger.error("❌ Failed to get Prisma metrics:", error);
    }

    return metrics;
  }

  /**
   * ✅ PRISMA ONLY: Graceful shutdown of Prisma connection
   */
  static async shutdown(): Promise<void> {
    if (DatabaseServiceFactory.prismaConnectionManager) {
      try {
        await DatabaseServiceFactory.prismaConnectionManager.disconnect();
        logger.info("✅ Prisma connection closed successfully");
      } catch (error) {
        logger.error("❌ Prisma disconnect error:", error);
      }
    }
  }

  /**
   * ✅ DEPRECATED: Always using Prisma now - method kept for compatibility
   */
  static async switchToPrisma(): Promise<void> {
    logger.info("ℹ️ Already using Prisma - no action needed");
  }
}

// Export singleton instance
export const databaseFactory = DatabaseServiceFactory.getInstance();
