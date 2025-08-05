import * as schema from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;

// ✅ LEGACY POSTGRESQL CONNECTION - DEACTIVATED
// This file is kept for backward compatibility but should not be used
// Use @shared/db instead for unified database connection management

console.warn(
  '⚠️ DEPRECATED: apps/server/db.ts is deprecated. Use @shared/db instead.'
);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    '⚠️ DATABASE_URL environment variable not found.\n' +
      '📋 This is expected if using @shared/db connection manager.\n' +
      '🔗 Unified connection manager will handle database initialization.'
  );
}

// ✅ CONDITIONAL POSTGRESQL CONNECTION - Only if explicitly needed
let pool: any = null;
let db: any = null;

export function createLegacyPostgreSQLConnection() {
  if (!DATABASE_URL) {
    throw new Error(
      '❌ DATABASE_URL environment variable is required for PostgreSQL connection'
    );
  }

  if (pool) {
    return { pool, db };
  }

  logger.loading('🐘 Creating legacy PostgreSQL connection', 'database', {
    url: DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@'),
  });

  pool = new Pool({
    connectionString: DATABASE_URL,
    // PostgreSQL connection settings optimized for hotel application
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10, // Maximum pool size
    min: 2, // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  db = drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

  // ✅ CONNECTION HEALTH CHECK
  pool.on('connect', () => {
    logger.success('✅ Legacy PostgreSQL client connected', 'database');
  });

  pool.on('error', (err: Error) => {
    logger.error('❌ Legacy PostgreSQL connection error:', 'database', {
      error: err.message,
    });
  });

  return { pool, db };
}

// ✅ REMOVED: Auto-running IIFE that caused dual connections
// Export initialized values to maintain backward compatibility
export { db, pool };
