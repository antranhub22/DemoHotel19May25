// ✅ Support both PostgreSQL and SQLite databases
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import pg from 'pg';
const { Pool } = pg;
import Database from 'better-sqlite3';
import {
  tenants,
  hotelProfiles,
  staff,
  call,
  transcript,
  request,
  message,
  call_summaries,
} from './schema';

// Check environment
const DATABASE_URL = process.env.DATABASE_URL;
const IS_SQLITE = DATABASE_URL?.startsWith('sqlite://');
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Create database connection
let db: any;

if (DATABASE_URL) {
  if (IS_SQLITE) {
    // SQLite connection for development
    const dbPath = DATABASE_URL.replace('sqlite://', '');
    const sqlite = new Database(dbPath);
    console.log(`📁 Using SQLite database: ${dbPath}`);

    db = drizzleSqlite(sqlite, {
      schema: {
        tenants,
        hotelProfiles,
        staff,
        call,
        transcript,
        request,
        message,
        call_summaries,
      },
    });
  } else {
    // PostgreSQL connection for production
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    console.log(`🐘 Using PostgreSQL database`);

    db = drizzle(pool, {
      schema: {
        tenants,
        hotelProfiles,
        staff,
        call,
        transcript,
        request,
        message,
        call_summaries,
      },
    });
  }
} else if (IS_DEVELOPMENT) {
  // Default to SQLite in development when no DATABASE_URL
  const sqlite = new Database('./apps/dev.db');
  console.log(`📁 Using SQLite database: ./apps/dev.db (development default)`);

  db = drizzleSqlite(sqlite, {
    schema: {
      tenants,
      hotelProfiles,
      staff,
      call,
      transcript,
      request,
      message,
      call_summaries,
    },
  });
} else {
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

export { db };

// Export all schema tables
export {
  tenants,
  hotelProfiles,
  staff,
  call,
  transcript,
  request,
  message,
  call_summaries,
} from './schema';

// ✅ POSTGRESQL-OPTIMIZED UTILITIES
export const getCurrentTimestamp = (): Date => {
  return new Date();
};

// PostgreSQL-compatible date conversion
export const convertToDate = (
  value: string | number | Date | null
): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'number') {
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

export * from './schema';
export * from './transformers';
