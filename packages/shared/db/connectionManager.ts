// ✅ Advanced Database Connection Manager with Pooling & Monitoring
import {
  hotelProfiles,
  message,
  request,
  staff,
  tenants,
  transcript,
} from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
/**
 * Advanced Connection Pool Configuration
 * Environment-specific optimizations for optimal performance
 */
interface ConnectionConfig {
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statementTimeout: number;
  query_timeout: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
}

/**
 * Get optimized connection configuration based on environment
 */
function getConnectionConfig(): ConnectionConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isRender = process.env.RENDER === 'true'; // ✅ NEW: Detect Render environment

  if (isProduction && isRender) {
    // 🚀 Render Production: Conservative configuration for free tier
    return {
      max: 5, // Reduced for Render free tier limits
      min: 1, // Minimal connections to avoid exhaustion
      idleTimeoutMillis: 30000, // 30 seconds - shorter for cloud
      connectionTimeoutMillis: 15000, // 15 seconds - longer timeout for cloud
      statementTimeout: 30000, // 30 seconds statement timeout
      query_timeout: 30000, // 30 seconds query timeout
      keepAlive: true, // Keep connections alive
      keepAliveInitialDelayMillis: 10000, // 10 seconds initial delay
    };
  } else if (isProduction) {
    // 🚀 Production: High-performance configuration
    return {
      max: 20, // Higher max connections for production load
      min: 5, // Keep more minimum connections ready
      idleTimeoutMillis: 60000, // 1 minute idle timeout
      connectionTimeoutMillis: 10000, // 10 seconds connection timeout
      statementTimeout: 30000, // 30 seconds statement timeout
      query_timeout: 30000, // 30 seconds query timeout
      keepAlive: true, // Keep connections alive
      keepAliveInitialDelayMillis: 10000, // 10 seconds initial delay
    };
  } else if (isDevelopment) {
    // 🛠️ Development: Balanced configuration
    return {
      max: 10, // Moderate max connections for development
      min: 2, // Minimal minimum connections
      idleTimeoutMillis: 30000, // 30 seconds idle timeout
      connectionTimeoutMillis: 10000, // 10 seconds connection timeout
      statementTimeout: 60000, // 60 seconds for debugging
      query_timeout: 60000, // 60 seconds for complex queries
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    };
  } else {
    // 🧪 Test: Minimal configuration
    return {
      max: 5,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      statementTimeout: 15000,
      query_timeout: 15000,
      keepAlive: false,
      keepAliveInitialDelayMillis: 0,
    };
  }
}

/**
 * Connection Pool Health Metrics
 */
export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingCount: number;
  errorCount: number;
  lastError?: string;
  lastErrorTime?: Date;
}

/**
 * Advanced Connection Manager Class
 */
export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private pool: pg.Pool | null = null;
  private db: any = null;
  private sqlite: DatabaseType | null = null;
  private isConnected = false;
  private connectionMetrics: PoolMetrics = {
    totalConnections: 0,
    idleConnections: 0,
    activeConnections: 0,
    waitingCount: 0,
    errorCount: 0,
  };

  private constructor() {}

  /**
   * Singleton pattern for connection manager
   */
  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Initialize database connection with advanced pooling
   */
  async initialize(): Promise<any> {
    if (this.isConnected && this.db) {
      return this.db;
    }

    const DATABASE_URL = process.env.DATABASE_URL;
    const IS_SQLITE = DATABASE_URL?.startsWith('sqlite://');
    const IS_LOCAL = process.env.NODE_ENV === 'local';
    const IS_PRODUCTION = process.env.NODE_ENV === 'production';

    try {
      if (DATABASE_URL && !IS_SQLITE) {
        // 🐘 PostgreSQL with Advanced Connection Pooling
        await this.initializePostgreSQL(DATABASE_URL);
      } else if (DATABASE_URL && IS_SQLITE) {
        // 📁 SQLite Connection
        await this.initializeSQLite(DATABASE_URL);
      } else if (IS_LOCAL || !DATABASE_URL) {
        // ✅ NEW: Enhanced fallback for local development
        logger.info(
          '🔄 [ConnectionManager] No DATABASE_URL found, using default SQLite for local development',
          'ConnectionManager',
          {
            nodeEnv: process.env.NODE_ENV,
            databaseUrl: DATABASE_URL || 'not set',
            fallbackPath: './database-files/dev.db',
          }
        );

        // Try multiple fallback paths
        const fallbackPaths = [
          './database-files/dev.db',
          '../database-files/dev.db',
          './dev.db',
          '../dev.db',
        ];

        for (const path of fallbackPaths) {
          try {
            await this.initializeSQLite(`sqlite://${path}`);
            logger.success(
              `✅ [ConnectionManager] Successfully connected to SQLite at: ${path}`,
              'ConnectionManager'
            );
            return this.db;
          } catch (pathError) {
            logger.debug(
              `⚠️ [ConnectionManager] Failed to connect to: ${path}`,
              'ConnectionManager',
              {
                error:
                  pathError instanceof Error
                    ? pathError.message
                    : 'Unknown error',
              }
            );
          }
        }

        // If all fallbacks fail, create a new database
        logger.warn(
          '⚠️ [ConnectionManager] All fallback paths failed, creating new SQLite database',
          'ConnectionManager'
        );
        await this.initializeSQLite('sqlite://./database-files/dev.db');
      } else if (IS_PRODUCTION) {
        // 🐘 Production requires DATABASE_URL
        throw new Error(
          '❌ DATABASE_URL environment variable is required for production!'
        );
      } else {
        throw new Error(
          '❌ Invalid NODE_ENV. Use "local" for SQLite or "production" for PostgreSQL'
        );
      }

      this.isConnected = true;
      return this.db;
    } catch (error) {
      logger.error(
        '❌ [ConnectionManager] Database initialization failed',
        'ConnectionManager',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: DATABASE_URL || 'not set',
        }
      );

      // ✅ NEW: Enhanced error recovery
      if (!IS_PRODUCTION) {
        logger.info(
          '🔄 [ConnectionManager] Attempting emergency SQLite fallback',
          'ConnectionManager'
        );

        try {
          await this.initializeSQLite('sqlite://./database-files/dev.db');
          this.isConnected = true;
          logger.success(
            '✅ [ConnectionManager] Emergency SQLite fallback successful',
            'ConnectionManager'
          );
          return this.db;
        } catch (fallbackError) {
          logger.error(
            '❌ [ConnectionManager] Emergency fallback also failed',
            'ConnectionManager',
            {
              error:
                fallbackError instanceof Error
                  ? fallbackError.message
                  : 'Unknown error',
            }
          );
        }
      }

      throw error;
    }
  }

  /**
   * Initialize PostgreSQL with advanced pooling
   */
  private async initializePostgreSQL(databaseUrl: string): Promise<void> {
    const config = getConnectionConfig();

    console.log(
      '🐘 Initializing PostgreSQL with advanced connection pooling...'
    );
    console.log(`📊 Pool Config:`, {
      max: config.max,
      min: config.min,
      idle: `${config.idleTimeoutMillis}ms`,
      timeout: `${config.connectionTimeoutMillis}ms`,
      environment: process.env.NODE_ENV,
    });

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,

      // ✅ Advanced Pooling Configuration
      max: config.max,
      min: config.min,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
      statement_timeout: config.statementTimeout,
      query_timeout: config.query_timeout,
      keepAlive: config.keepAlive,
      keepAliveInitialDelayMillis: config.keepAliveInitialDelayMillis,

      // ✅ Additional Performance Settings
      allowExitOnIdle: false,

      // ✅ Connection Health
      application_name: `hotel-voice-assistant-${process.env.NODE_ENV}`,
    });

    // Setup event listeners for monitoring
    this.setupPoolEventListeners();

    // Test connection
    await this.testConnection();

    this.db = drizzle(this.pool, {
      schema: {
        tenants,
        hotelProfiles,
        staff,
        transcript,
        request,
        message,
        call_summaries,
      },
    });

    console.log(`✅ PostgreSQL connection pool initialized successfully`);
  }

  /**
   * Initialize SQLite connection
   */
  private async initializeSQLite(databaseUrl: string): Promise<void> {
    const dbPath = databaseUrl.replace('sqlite://', '');
    console.log(`📁 Initializing SQLite database: ${dbPath}`);

    this.sqlite = new Database(dbPath);

    // SQLite optimizations
    this.sqlite.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = 1000;
      PRAGMA foreign_keys = ON;
      PRAGMA temp_store = MEMORY;
    `);

    this.db = drizzleSqlite(this.sqlite, {
      schema: {
        tenants,
        hotelProfiles,
        staff,
        transcript,
        request,
        message,
        call_summaries,
      },
    });

    console.log(`✅ SQLite database initialized successfully`);
  }

  /**
   * Setup PostgreSQL pool event listeners for monitoring
   */
  private setupPoolEventListeners(): void {
    if (!this.pool) {
      return;
    }

    // Connection events
    this.pool.on('connect', () => {
      console.log('🔗 New database connection established');
      this.updateMetrics();
    });

    this.pool.on('acquire', () => {
      this.updateMetrics();
    });

    this.pool.on('release', () => {
      this.updateMetrics();
    });

    this.pool.on('remove', () => {
      console.log('🗑️ Database connection removed from pool');
      this.updateMetrics();
    });

    // Error handling
    this.pool.on('error', err => {
      console.error('❌ Database pool error:', err);
      this.connectionMetrics.errorCount++;
      this.connectionMetrics.lastError = err.message;
      this.connectionMetrics.lastErrorTime = new Date();
    });
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection test successful');
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Update connection metrics
   */
  private updateMetrics(): void {
    if (!this.pool) {
      return;
    }

    this.connectionMetrics = {
      ...this.connectionMetrics,
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      activeConnections: this.pool.totalCount - this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.pool) {
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
      } else if (this.sqlite) {
        this.sqlite.exec('SELECT 1');
      }

      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get current pool metrics
   */
  getMetrics(): PoolMetrics {
    this.updateMetrics();
    return { ...this.connectionMetrics };
  }

  /**
   * Get database instance
   */
  getDatabase(): any {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down database connection manager...');

    try {
      if (this.pool) {
        await this.pool.end();
        console.log('✅ PostgreSQL pool closed');
      }

      if (this.sqlite) {
        this.sqlite.close();
        console.log('✅ SQLite connection closed');
      }

      this.isConnected = false;
      console.log('✅ Database connection manager shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Force reconnection (for testing/recovery)
   */
  async reconnect(): Promise<any> {
    console.log('🔄 Forcing database reconnection...');
    await this.shutdown();
    return await this.initialize();
  }
}

// Export singleton instance
export const connectionManager = DatabaseConnectionManager.getInstance();
