// ✅ Enhanced Database Connection with Prisma
import { PrismaConnectionManager } from "./PrismaConnectionManager";

/**
 * Get Prisma database instance
 */
export async function getDatabase() {
  return PrismaConnectionManager.getInstance().getClient();
}

/**
 * Synchronous database access (for backwards compatibility)
 */
function getDatabaseSync() {
  try {
    return PrismaConnectionManager.getInstance().getClient();
  } catch (error) {
    console.warn(
      "⚠️ Database not initialized synchronously. Consider using getDatabase() instead.",
    );
    throw error;
  }
}

// For backward compatibility - maintain existing sync access pattern
// But now returns Prisma client instead of Drizzle
export const db = new Proxy({} as any, {
  get(_target, prop) {
    try {
      const database = getDatabaseSync();
      return database[prop];
    } catch (error) {
      console.error(
        "❌ Database access failed. Ensure connection is initialized first.",
      );
      throw error;
    }
  },
});

// ✅ Enhanced Database Utilities with Connection Management

/**
 * Initialize database connection explicitly
 * Recommended for application startup
 */
export async function initializeDatabase() {
  console.log("🚀 Initializing Prisma database connection...");
  const prismaManager = PrismaConnectionManager.getInstance();
  await prismaManager.initialize();
  const database = prismaManager.getClient();
  console.log("✅ Database initialization complete");
  return database;
}

/**
 * Get connection pool health metrics
 */
export function getDatabaseMetrics() {
  return PrismaConnectionManager.getInstance().getMetrics();
}

/**
 * Perform database health check
 */
export async function checkDatabaseHealth() {
  return await PrismaConnectionManager.getInstance().healthCheck();
}

/**
 * Gracefully shutdown database connections
 * Important for clean application shutdown
 */
export async function shutdownDatabase() {
  console.log("🔄 Shutting down database connections...");
  await PrismaConnectionManager.getInstance().disconnect();
  console.log("✅ Database shutdown complete");
}

/**
 * Force database reconnection (for recovery scenarios)
 */
export async function reconnectDatabase() {
  console.log("🔄 Reconnecting to database...");
  const prismaManager = PrismaConnectionManager.getInstance();
  await prismaManager.disconnect();
  await prismaManager.initialize();
  const database = prismaManager.getClient();
  console.log("✅ Database reconnection complete");
  return database;
}

// Export Prisma client and connection manager
export { PrismaClient } from "@prisma/client";
export { PrismaConnectionManager } from "./PrismaConnectionManager";

// ✅ POSTGRESQL-OPTIMIZED UTILITIES
export const getCurrentTimestamp = (): Date => {
  return new Date();
};

// PostgreSQL-compatible date conversion
export const convertToDate = (
  value: string | number | Date | null,
): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "number") {
    // Handle both seconds and milliseconds
    const timestamp = value < 10000000000 ? value * 1000 : value;
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

// Safe number conversion for PostgreSQL
export const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export * from "./transformers";

// ✅ Setup graceful shutdown handling
const setupGracefulShutdown = () => {
  const shutdownHandler = async (signal: string) => {
    console.log(`📡 Received ${signal}. Initiating graceful shutdown...`);
    try {
      await shutdownDatabase();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdownHandler("SIGINT"));
  process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
  process.on("SIGUSR2", () => shutdownHandler("SIGUSR2")); // For nodemon
};

// Setup graceful shutdown in non-test environments
if (process.env.NODE_ENV !== "test") {
  setupGracefulShutdown();
}
