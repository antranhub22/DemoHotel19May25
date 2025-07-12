import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as sqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import Database from 'better-sqlite3';

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize database connection based on environment
let db: any;
let pool: any;

// Use SQLite for development if no DATABASE_URL is provided
if (!DATABASE_URL && !isProduction) {
  console.log('⏳ Using SQLite database for development');
  const sqlite = new Database('./dev.db');
  db = sqliteDrizzle(sqlite);
} else if (!DATABASE_URL) {
  // Default connection string if DATABASE_URL is not provided
  const DEFAULT_DB_URL = 'postgres://postgres:postgres@localhost:5432/minhon';
  const dbUrl = DEFAULT_DB_URL;
  console.log('Database connection using URL:', dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'));

  pool = new Pool({
    connectionString: dbUrl
  });

  // Test connection on startup
  (async () => {
    try {
      const client = await pool.connect();
      console.log('Database connection successful');
      client.release();
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  })();

  db = drizzle(pool);
} else {
  // Log connection information
  console.log('Database connection using URL:', DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'));

  pool = new Pool({
    connectionString: DATABASE_URL
  });

  // Test connection on startup
  (async () => {
    try {
      const client = await pool.connect();
      console.log('Database connection successful');
      client.release();
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  })();

  db = drizzle(pool);
}

export { db, pool }; 