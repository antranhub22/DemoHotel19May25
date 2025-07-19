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

  console.log('🔧 [Production Migration] Checking request table schema...');
  
  let sql: any;
  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    // Check if call_id column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'request' AND column_name = 'call_id';
    `;

    if (columns.length > 0) {
      console.log('✅ call_id column already exists - migration not needed');
      return;
    }

    console.log('🚀 Adding missing columns to request table...');

    // Add missing columns with error handling
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

    // Add indexes
    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_request_call_id ON request(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_status ON request(status)`,
      `CREATE INDEX IF NOT EXISTS idx_request_type ON request(type)`
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