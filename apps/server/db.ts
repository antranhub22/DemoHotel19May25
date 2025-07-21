import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import * as dotenv from 'dotenv';
import { logger } from '@shared/utils/logger';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL environment variable is required!\n' +
      '📋 Please set up PostgreSQL and provide DATABASE_URL.\n' +
      '🐳 For local development, you can use Docker:\n' +
      '   docker run -d --name hotel-postgres \\\n' +
      '     -e POSTGRES_DB=hotel_dev \\\n' +
      '     -e POSTGRES_USER=hotel_user \\\n' +
      '     -e POSTGRES_PASSWORD=dev_password \\\n' +
      '     -p 5432:5432 postgres:15\n' +
      '🔗 Then set: DATABASE_URL=postgresql://hotel_user:dev_password@localhost:5432/hotel_dev'
  );
}

// ✅ POSTGRESQL-ONLY CONNECTION - Simplified & Robust
logger.loading('🐘 Connecting to PostgreSQL database', 'database', {
  url: DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@'),
});

export const pool = new Pool({
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

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// ✅ CONNECTION HEALTH CHECK
pool.on('connect', () => {
  logger.success('✅ PostgreSQL client connected', 'database');
});

pool.on('error', err => {
  logger.error('❌ PostgreSQL connection error:', 'database', {
    error: err.message,
  });
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.success('🚀 PostgreSQL database connection verified', 'database');
  } catch (error) {
    logger.error('💥 Failed to connect to PostgreSQL database:', 'database', {
      error,
    });
    process.exit(1);
  }
})();
