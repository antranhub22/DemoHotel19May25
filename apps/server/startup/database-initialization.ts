#!/usr/bin/env tsx
import { logger } from '@shared/utils/logger';
import { initializeDatabase, getDatabaseMetrics } from '@shared/db';

/**
 * Database Initialization Script
 *
 * Handles application startup database initialization with:
 * - Advanced connection pooling
 * - Health monitoring
 * - Error handling and recovery
 * - Graceful startup sequence
 */

/**
 * Initialize database connection on application startup
 */
export async function initializeDatabaseOnStartup(): Promise<void> {
  console.log('🚀 Starting database initialization...');

  try {
    // Set connection timeout for startup
    const initTimeout = setTimeout(() => {
      throw new Error('Database initialization timeout (30 seconds)');
    }, 30000);

    // Initialize database connection with advanced pooling
    const startTime = Date.now();
    await initializeDatabase();
    clearTimeout(initTimeout);

    const initTime = Date.now() - startTime;

    // Get initial metrics
    const metrics = getDatabaseMetrics();

    // Log successful initialization
    logger.success('✅ Database initialized successfully', 'Database', {
      initializationTime: initTime,
      connectionType: process.env.DATABASE_URL?.startsWith('sqlite://')
        ? 'SQLite'
        : 'PostgreSQL',
      environment: process.env.NODE_ENV,
      poolConnections: metrics.totalConnections,
      activeConnections: metrics.activeConnections,
    });

    // Display pool configuration
    if (metrics.totalConnections > 0) {
      console.log('📊 Connection Pool Status:');
      console.log(`   • Total Connections: ${metrics.totalConnections}`);
      console.log(`   • Idle Connections: ${metrics.idleConnections}`);
      console.log(`   • Active Connections: ${metrics.activeConnections}`);
      console.log(`   • Error Count: ${metrics.errorCount}`);

      if (metrics.lastError) {
        console.log(`   ⚠️ Last Error: ${metrics.lastError}`);
      }
    }

    // Setup periodic health logging for startup phase
    setupStartupHealthMonitoring();
  } catch (error) {
    logger.error('❌ Database initialization failed', 'Database', error);

    console.error('\n🚨 Database Initialization Failed:');
    console.error(
      `   Error: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
    );
    console.error('\n💡 Troubleshooting Steps:');
    console.error('   1. Check DATABASE_URL environment variable');
    console.error('   2. Verify database server is running');
    console.error('   3. Confirm network connectivity');
    console.error('   4. Review database permissions');

    // In production, fail fast. In development, provide guidance
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🔥 Production startup failed. Exiting...');
      process.exit(1);
    } else {
      console.error(
        '\n🛠️ Development Mode: Consider using SQLite for local development'
      );
      console.error('   Set DATABASE_URL=sqlite://./apps/dev.db');
    }

    throw error;
  }
}

/**
 * Setup health monitoring during startup phase
 */
function setupStartupHealthMonitoring(): void {
  let healthCheckCount = 0;
  const maxStartupChecks = 3;

  const startupHealthInterval = setInterval(() => {
    try {
      const metrics = getDatabaseMetrics();
      healthCheckCount++;

      logger.debug('📊 Startup Health Check', 'Database', {
        checkNumber: healthCheckCount,
        totalConnections: metrics.totalConnections,
        activeConnections: metrics.activeConnections,
        errorCount: metrics.errorCount,
      });

      // Stop monitoring after successful checks or max attempts
      if (healthCheckCount >= maxStartupChecks) {
        clearInterval(startupHealthInterval);
        console.log('✅ Database startup health monitoring completed');
      }
    } catch (error) {
      logger.error('❌ Startup health check failed', 'Database', error);
      clearInterval(startupHealthInterval);
    }
  }, 5000); // Check every 5 seconds during startup
}

/**
 * Validate database configuration before initialization
 */
export function validateDatabaseConfiguration(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
    errors.push(
      'DATABASE_URL environment variable is required for non-development environments'
    );
  }

  // Check for SQLite in production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.DATABASE_URL?.startsWith('sqlite://')
  ) {
    errors.push(
      'SQLite is not recommended for production use. Please use PostgreSQL.'
    );
  }

  // Check JWT_SECRET for authentication
  if (!process.env.JWT_SECRET) {
    errors.push(
      'JWT_SECRET environment variable is required for authentication'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Pre-startup database environment validation
 */
export function performPreStartupValidation(): void {
  console.log('🔍 Performing pre-startup validation...');

  const validation = validateDatabaseConfiguration();

  if (!validation.isValid) {
    console.error('\n❌ Pre-startup validation failed:');
    validation.errors.forEach((error, index) => {
      console.error(`   ${index + 1}. ${error}`);
    });

    if (process.env.NODE_ENV === 'production') {
      console.error(
        '\n🔥 Production startup aborted due to validation errors.'
      );
      process.exit(1);
    } else {
      console.warn(
        '\n⚠️ Development mode: Some validations failed but continuing...'
      );
    }
  } else {
    console.log('✅ Pre-startup validation passed');
  }
}

/**
 * Complete database startup sequence
 */
export async function startupDatabaseSequence(): Promise<void> {
  console.log('\n🏨 Hotel Voice Assistant - Database Startup Sequence');
  console.log('================================================');

  try {
    // Step 1: Pre-startup validation
    performPreStartupValidation();

    // Step 2: Initialize database
    await initializeDatabaseOnStartup();

    // Step 3: Ready for application startup
    console.log('\n🎉 Database startup sequence completed successfully!');
    console.log('🚀 Application ready to start...\n');
  } catch (error) {
    console.error('\n💥 Database startup sequence failed!');
    throw error;
  }
}

// Run startup sequence if called directly
if (require.main === module) {
  startupDatabaseSequence()
    .then(() => {
      console.log('✨ Startup script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Startup script failed:', error);
      process.exit(1);
    });
}
