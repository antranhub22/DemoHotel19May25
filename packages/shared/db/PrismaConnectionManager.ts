// 🔄 PRISMA CONNECTION MANAGER WITH POOLING & MONITORING
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

/**
 * Prisma Connection Pool Configuration
 * Environment-specific optimizations for optimal performance
 */
interface PrismaConnectionConfig {
  connectionLimit: number;
  queryTimeout: number;
  transactionMaxWait: number;
  poolTimeout: number;
  binaryTargets: string[];
  logLevel: "info" | "query" | "warn" | "error";
}

/**
 * Get optimized Prisma configuration based on environment
 */
function getPrismaConnectionConfig(): PrismaConnectionConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";
  const isRender = process.env.RENDER === "true";

  if (isProduction && isRender) {
    // 🚀 Render Production: Conservative configuration for free tier
    return {
      connectionLimit: 5, // Reduced for Render free tier limits
      queryTimeout: 30000, // 30 seconds query timeout
      transactionMaxWait: 15000, // 15 seconds transaction timeout
      poolTimeout: 20000, // 20 seconds pool timeout
      binaryTargets: ["native", "linux-musl"],
      logLevel: "warn", // Less verbose in production
    };
  } else if (isProduction) {
    // 🏢 Production: High-performance configuration
    return {
      connectionLimit: 15,
      queryTimeout: 60000,
      transactionMaxWait: 30000,
      poolTimeout: 30000,
      binaryTargets: ["native"],
      logLevel: "error",
    };
  } else if (isDevelopment) {
    // 🛠️ Development: Balanced performance with debugging
    return {
      connectionLimit: 10,
      queryTimeout: 45000,
      transactionMaxWait: 20000,
      poolTimeout: 25000,
      binaryTargets: ["native"],
      logLevel: "info",
    };
  } else {
    // 🧪 Testing/Local: Minimal configuration
    return {
      connectionLimit: 5,
      queryTimeout: 15000,
      transactionMaxWait: 10000,
      poolTimeout: 15000,
      binaryTargets: ["native"],
      logLevel: "query",
    };
  }
}

/**
 * Prisma Connection Health Metrics
 */
export interface PrismaMetrics {
  isConnected: boolean;
  connectionCount: number;
  queryCount: number;
  errorCount: number;
  avgQueryTime: number;
  lastError?: string;
  lastErrorTime?: Date;
  lastQuery?: string;
  lastQueryTime?: Date;
  uptime: number;
}

/**
 * Advanced Prisma Connection Manager Class
 */
export class PrismaConnectionManager {
  private static instance: PrismaConnectionManager;
  private prisma: PrismaClient | null = null;
  private isConnected = false;
  private startTime = Date.now();
  private metrics: PrismaMetrics = {
    isConnected: false,
    connectionCount: 0,
    queryCount: 0,
    errorCount: 0,
    avgQueryTime: 0,
    uptime: 0,
  };

  private constructor() {}

  /**
   * Singleton pattern for connection manager
   */
  static getInstance(): PrismaConnectionManager {
    if (!PrismaConnectionManager.instance) {
      PrismaConnectionManager.instance = new PrismaConnectionManager();
    }
    return PrismaConnectionManager.instance;
  }

  /**
   * Initialize Prisma client with advanced configuration
   */
  async initialize(): Promise<PrismaClient> {
    if (this.isConnected && this.prisma) {
      return this.prisma;
    }

    const config = getPrismaConnectionConfig();
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      throw new Error(
        "❌ DATABASE_URL environment variable is required for Prisma",
      );
    }

    try {
      logger.info("🔄 Initializing Prisma connection manager...");

      // Create Prisma client with optimized configuration
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: DATABASE_URL,
          },
        },
        log: [
          { level: "query", emit: "event" },
          { level: "error", emit: "event" },
          { level: "info", emit: "event" },
          { level: "warn", emit: "event" },
        ],
        errorFormat: "pretty",
        transactionOptions: {
          maxWait: config.transactionMaxWait,
          timeout: config.queryTimeout,
        },
      });

      // Set up event listeners for metrics
      this.setupEventListeners();

      // Test connection
      await this.testConnection();

      this.isConnected = true;
      this.metrics.isConnected = true;
      this.metrics.connectionCount++;

      logger.info("✅ Prisma connection manager initialized successfully");
      logger.info(`🔧 Configuration: ${JSON.stringify(config, null, 2)}`);

      return this.prisma;
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Unknown error";
      this.metrics.lastErrorTime = new Date();

      logger.error("❌ Failed to initialize Prisma connection:", error);
      throw new Error(`Prisma initialization failed: ${error}`);
    }
  }

  /**
   * Set up Prisma event listeners for monitoring
   */
  private setupEventListeners(): void {
    if (!this.prisma) return;

    // Query logging and metrics
    this.prisma.$on("query", (e) => {
      this.metrics.queryCount++;
      this.metrics.lastQuery = e.query;
      this.metrics.lastQueryTime = new Date();

      // Calculate average query time
      const queryTime = e.duration;
      this.metrics.avgQueryTime =
        (this.metrics.avgQueryTime * (this.metrics.queryCount - 1) +
          queryTime) /
        this.metrics.queryCount;

      if (queryTime > 1000) {
        logger.warn(
          `🐌 Slow Prisma query (${queryTime}ms): ${e.query.substring(0, 100)}...`,
        );
      }
    });

    // Error logging
    this.prisma.$on("error", (e) => {
      this.metrics.errorCount++;
      this.metrics.lastError = e.message;
      this.metrics.lastErrorTime = new Date();
      logger.error("❌ Prisma error:", e);
    });

    // Info logging
    this.prisma.$on("info", (e) => {
      logger.info("ℹ️ Prisma info:", e.message);
    });

    // Warning logging
    this.prisma.$on("warn", (e) => {
      logger.warn("⚠️ Prisma warning:", e.message);
    });
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error("Prisma client not initialized");
    }

    try {
      // Simple connection test
      await this.prisma.$queryRaw`SELECT 1 as connection_test`;
      logger.info("✅ Prisma database connection test successful");
    } catch (error) {
      logger.error("❌ Prisma database connection test failed:", error);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    if (!this.prisma || !this.isConnected) {
      throw new Error(
        "❌ Prisma connection not initialized. Call initialize() first.",
      );
    }
    return this.prisma;
  }

  /**
   * Health check for monitoring
   */
  async healthCheck(): Promise<boolean> {
    if (!this.prisma || !this.isConnected) {
      return false;
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("❌ Prisma health check failed:", error);
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Health check failed";
      this.metrics.lastErrorTime = new Date();
      return false;
    }
  }

  /**
   * Get connection metrics for monitoring
   */
  getMetrics(): PrismaMetrics {
    this.metrics.uptime = Date.now() - this.startTime;
    return { ...this.metrics };
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        this.metrics.isConnected = false;
        logger.info("✅ Prisma connection closed gracefully");
      } catch (error) {
        logger.error("❌ Error during Prisma disconnect:", error);
        throw error;
      } finally {
        this.prisma = null;
      }
    }
  }

  /**
   * Execute raw SQL query with error handling
   */
  async executeRaw<T = any>(query: string, params?: any[]): Promise<T> {
    const client = this.getClient();
    const startTime = Date.now();

    try {
      const result = params
        ? await client.$queryRawUnsafe(query, ...params)
        : await client.$queryRawUnsafe(query);

      const duration = Date.now() - startTime;
      if (duration > 1000) {
        logger.warn(
          `🐌 Slow raw query (${duration}ms): ${query.substring(0, 100)}...`,
        );
      }

      return result as T;
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Raw query failed";
      this.metrics.lastErrorTime = new Date();

      logger.error(
        `❌ Raw query failed: ${query}`,
        "PrismaConnectionManager",
        error,
      );
      throw error;
    }
  }

  /**
   * Begin transaction with error handling
   */
  async beginTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    const client = this.getClient();

    try {
      return await client.$transaction(callback);
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : "Transaction failed";
      this.metrics.lastErrorTime = new Date();

      logger.error("❌ Transaction failed:", error);
      throw error;
    }
  }

  /**
   * Reset connection (for testing purposes)
   */
  async reset(): Promise<void> {
    await this.disconnect();
    this.metrics = {
      isConnected: false,
      connectionCount: 0,
      queryCount: 0,
      errorCount: 0,
      avgQueryTime: 0,
      uptime: 0,
    };
    this.startTime = Date.now();
  }
}

// Export singleton instance
export const prismaConnectionManager = PrismaConnectionManager.getInstance();
