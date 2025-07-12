import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as sqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize database connection based on environment
let db: any;
let pool: any;

// Use SQLite for development if no DATABASE_URL is provided
if (!DATABASE_URL && !isProduction) {
  console.log('⏳ Using SQLite database for development');
  const sqlite = new Database('./dev.db');
  db = sqliteDrizzle(sqlite, { schema });
} else if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
} else {
  // Debug: print out the final connection string
  console.log('⏳ Connecting to database with URL:', DATABASE_URL);
  
  pool = new Pool({
    connectionString: DATABASE_URL,
    // Internal VPC connection typically does not require SSL
    ssl: { rejectUnauthorized: false }
  });
  db = drizzle(pool, { schema });
}

export { db, pool };
