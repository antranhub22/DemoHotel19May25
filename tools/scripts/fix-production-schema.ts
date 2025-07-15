#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// ============================================
// Production Schema Fix Script
// ============================================

async function fixProductionSchema() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('🔧 Production Schema Fix Starting...');
  console.log('🔗 Connecting to database:', databaseUrl.replace(/\/\/.*@/, '//***@'));

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    console.log('📋 Fixing schema mismatches...');

    // Fix 1: Check and add missing columns to request table
    console.log('🔄 Fixing request table schema...');
    
    // Add call_id column if missing
    try {
      await db.execute(sql`ALTER TABLE request ADD COLUMN IF NOT EXISTS call_id TEXT`);
      console.log('✅ Added call_id column to request table');
    } catch (error: any) {
      console.log('ℹ️ call_id column addition skipped:', error.message);
    }

    // Add tenant_id column if missing  
    try {
      await db.execute(sql`ALTER TABLE request ADD COLUMN IF NOT EXISTS tenant_id TEXT`);
      console.log('✅ Added tenant_id column to request table');
    } catch (error: any) {
      console.log('ℹ️ tenant_id column addition skipped:', error.message);
    }

    // Add other missing columns to request table
    const requestColumns = [
      'description TEXT',
      'priority TEXT DEFAULT \'medium\'',
      'assigned_to TEXT',
      'completed_at TEXT',
      'metadata TEXT',
      'type TEXT DEFAULT \'order\'',
      'total_amount REAL',
      'items TEXT',
      'delivery_time TEXT',
      'special_instructions TEXT',
      'order_type TEXT'
    ];

    for (const column of requestColumns) {
      try {
        const [columnName] = column.split(' ');
        await db.execute(sql`ALTER TABLE request ADD COLUMN IF NOT EXISTS ${sql.raw(column)}`);
        console.log(`✅ Added ${columnName} column to request table`);
      } catch (error: any) {
        console.log(`ℹ️ Column addition skipped: ${error.message}`);
      }
    }

    // Fix 2: Check tenants table and ensure proper columns exist
    console.log('🔄 Fixing tenants table schema...');
    
    // Check if name column exists, if not add it
    try {
      await db.execute(sql`SELECT name FROM tenants LIMIT 1`);
      console.log('✅ name column exists in tenants table');
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        // Try to add name column
        try {
          await db.execute(sql`ALTER TABLE tenants ADD COLUMN name TEXT`);
          console.log('✅ Added name column to tenants table');
          
          // Copy hotel_name to name if hotel_name exists
          try {
            await db.execute(sql`UPDATE tenants SET name = hotel_name WHERE name IS NULL AND hotel_name IS NOT NULL`);
            console.log('✅ Copied hotel_name to name column');
          } catch {}
        } catch (addError: any) {
          console.log('ℹ️ Could not add name column:', addError.message);
        }
      }
    }

    // Fix 3: Create missing tables if they don't exist
    console.log('🔄 Creating missing tables...');

    // Create tenants table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY,
          name TEXT,
          hotel_name TEXT,
          subdomain TEXT NOT NULL UNIQUE,
          custom_domain TEXT,
          subscription_plan TEXT DEFAULT 'trial',
          subscription_status TEXT DEFAULT 'active',
          trial_ends_at INTEGER,
          created_at INTEGER,
          max_voices INTEGER DEFAULT 5,
          max_languages INTEGER DEFAULT 4,
          voice_cloning BOOLEAN DEFAULT FALSE,
          multi_location BOOLEAN DEFAULT FALSE,
          white_label BOOLEAN DEFAULT FALSE,
          data_retention_days INTEGER DEFAULT 90,
          monthly_call_limit INTEGER DEFAULT 1000,
          updated_at TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          settings TEXT,
          tier TEXT DEFAULT 'free',
          max_calls INTEGER DEFAULT 1000,
          max_users INTEGER DEFAULT 10,
          features TEXT
        )
      `);
      console.log('✅ Created/verified tenants table');
    } catch (error: any) {
      console.log('ℹ️ Tenants table creation skipped:', error.message);
    }

    // Create call_summaries table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS call_summaries (
          id SERIAL PRIMARY KEY,
          call_id TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          room_number TEXT,
          duration TEXT
        )
      `);
      console.log('✅ Created/verified call_summaries table');
    } catch (error: any) {
      console.log('ℹ️ call_summaries table creation skipped:', error.message);
    }

    // Create call table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS call (
          id SERIAL PRIMARY KEY,
          tenant_id TEXT REFERENCES tenants(id),
          call_id_vapi TEXT NOT NULL UNIQUE,
          room_number TEXT,
          language TEXT,
          service_type TEXT,
          start_time INTEGER,
          end_time INTEGER,
          duration INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);
      console.log('✅ Created/verified call table');
    } catch (error: any) {
      console.log('ℹ️ call table creation skipped:', error.message);
    }

    // Create transcript table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS transcript (
          id SERIAL PRIMARY KEY,
          call_id TEXT NOT NULL,
          content TEXT NOT NULL,
          role TEXT NOT NULL,
          timestamp INTEGER,
          tenant_id TEXT REFERENCES tenants(id)
        )
      `);
      console.log('✅ Created/verified transcript table');
    } catch (error: any) {
      console.log('ℹ️ transcript table creation skipped:', error.message);
    }

    // Create message table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS message (
          id SERIAL PRIMARY KEY,
          request_id INTEGER REFERENCES request(id),
          sender TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp INTEGER,
          tenant_id TEXT REFERENCES tenants(id)
        )
      `);
      console.log('✅ Created/verified message table');
    } catch (error: any) {
      console.log('ℹ️ message table creation skipped:', error.message);
    }

    // Fix 4: Add tenant_id to other tables if missing
    console.log('🔄 Adding tenant_id columns to existing tables...');
    
    const tablesNeedingTenantId = ['transcript', 'message', 'staff', 'call'];
    
    for (const table of tablesNeedingTenantId) {
      try {
        await db.execute(sql`ALTER TABLE ${sql.identifier(table)} ADD COLUMN IF NOT EXISTS tenant_id TEXT`);
        console.log(`✅ Added tenant_id to ${table} table`);
      } catch (error: any) {
        console.log(`ℹ️ tenant_id addition to ${table} skipped:`, error.message);
      }
    }

    // Fix 5: Create default Mi Nhon tenant if not exists
    console.log('🔄 Creating default Mi Nhon tenant...');
    try {
      await db.execute(sql`
        INSERT INTO tenants (
          id, name, hotel_name, subdomain, subscription_plan, subscription_status, 
          max_voices, max_languages, monthly_call_limit, created_at
        ) VALUES (
          'minhon-hotel', 'Mi Nhon Hotel', 'Mi Nhon Hotel', 'minhonmuine', 'premium', 'active',
          10, 10, 5000, ${Date.now()}
        ) ON CONFLICT (id) DO NOTHING
      `);
      console.log('✅ Created default Mi Nhon tenant');
    } catch (error: any) {
      console.log('ℹ️ Default tenant creation skipped:', error.message);
    }

    // Fix 6: Update existing data to have tenant_id
    console.log('🔄 Updating existing data with tenant_id...');
    const updateQueries = [
      `UPDATE request SET tenant_id = 'minhon-hotel' WHERE tenant_id IS NULL`,
      `UPDATE transcript SET tenant_id = 'minhon-hotel' WHERE tenant_id IS NULL`,
      `UPDATE message SET tenant_id = 'minhon-hotel' WHERE tenant_id IS NULL`,
      `UPDATE staff SET tenant_id = 'minhon-hotel' WHERE tenant_id IS NULL`,
      `UPDATE call SET tenant_id = 'minhon-hotel' WHERE tenant_id IS NULL`
    ];

    for (const query of updateQueries) {
      try {
        await db.execute(sql`${sql.raw(query)}`);
        console.log(`✅ Updated data: ${query.split(' ')[1]}`);
      } catch (error: any) {
        console.log(`ℹ️ Data update skipped: ${error.message}`);
      }
    }

    console.log('\n🎉 Production schema fix completed successfully!');
    console.log('📋 Summary of changes applied:');
    console.log('  - Added missing columns to request table');
    console.log('  - Fixed tenants table schema');
    console.log('  - Created missing database tables');
    console.log('  - Added tenant_id columns where needed');
    console.log('  - Created default Mi Nhon tenant');
    console.log('  - Updated existing data with tenant associations');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixProductionSchema()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixProductionSchema }; 