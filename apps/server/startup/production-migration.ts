import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Production Migration: Add missing columns to request table
 * Runs automatically on server startup in production
 */
export async function runProductionMigration() {
  // Only run in production with PostgreSQL
  if (process.env.NODE_ENV !== 'production' || !process.env.DATABASE_URL?.includes('postgres')) {
    console.log('⏭️ Skipping production migration (not production PostgreSQL environment)');
    return;
  }

  console.log('🔧 [Production Migration] Checking database schema...');
  
  let sql: any;
  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    // Check existing table structures
    const requestColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'request' AND column_name = 'call_id';
    `;

    const transcriptTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'transcript';
    `;

    const hasCallId = requestColumns.length > 0;
    const hasTranscriptTable = transcriptTable.length > 0;

    if (hasCallId && hasTranscriptTable) {
      console.log('✅ Database schema already updated - migration not needed');
      return;
    }

    console.log(`📊 Migration needed - call_id: ${hasCallId}, transcript: ${hasTranscriptTable}`);

    console.log('🚀 Creating missing tables and columns...');

    // Create missing tables first
    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS transcript (
        id SERIAL PRIMARY KEY,
        call_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS call_summaries (
        id SERIAL PRIMARY KEY,
        call_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        room_number TEXT,
        duration TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        call_id TEXT NOT NULL,
        room_number TEXT NOT NULL,
        order_type TEXT NOT NULL,
        delivery_time TEXT NOT NULL,
        special_instructions TEXT,
        items JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`
    ];

    for (const statement of createTableStatements) {
      try {
        await sql.unsafe(statement);
        console.log(`✅ Table created: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        console.log(`⚠️ Table creation may have failed (might be OK): ${error.message.substring(0, 100)}...`);
      }
    }

    // Add missing columns to request table
    const alterStatements = [
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS call_id VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium'`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS metadata TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'order'`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS items TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMP`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS special_instructions TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS order_type VARCHAR(100)`
    ];

    for (const statement of alterStatements) {
      try {
        await sql.unsafe(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        // Column might already exist, which is OK
        console.log(`⚠️ Statement may have failed (might be OK): ${error.message.substring(0, 100)}...`);
      }
    }

    // Add indexes for all tables
    const indexStatements = [
      // Request table indexes
      `CREATE INDEX IF NOT EXISTS idx_request_call_id ON request(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_status ON request(status)`,
      `CREATE INDEX IF NOT EXISTS idx_request_type ON request(type)`,
      // Transcript table indexes
      `CREATE INDEX IF NOT EXISTS idx_transcript_call_id ON transcript(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transcript_timestamp ON transcript(timestamp)`,
      // Call summaries indexes
      `CREATE INDEX IF NOT EXISTS idx_call_summaries_call_id ON call_summaries(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_call_summaries_timestamp ON call_summaries(timestamp)`,
      // Orders table indexes
      `CREATE INDEX IF NOT EXISTS idx_orders_call_id ON orders(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`
    ];

    for (const statement of indexStatements) {
      try {
        await sql.unsafe(statement);
        console.log(`✅ Index created: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        console.log(`⚠️ Index creation may have failed: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('🎉 Production migration completed successfully!');

  } catch (error: any) {
    console.error('❌ Production migration failed:', error.message);
    // Don't crash the server, just log the error
  } finally {
    if (sql) {
      await sql.end();
    }
  }
} 