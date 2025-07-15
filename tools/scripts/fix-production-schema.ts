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

    // Fix 1: Rename hotel_name to name in tenants table
    console.log('🔄 Fixing tenants table schema...');
    try {
      await db.execute(sql`ALTER TABLE tenants RENAME COLUMN hotel_name TO name`);
      console.log('✅ Renamed hotel_name to name in tenants table');
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        console.log('ℹ️ hotel_name column does not exist, checking if name exists...');
        // Check if name column already exists
        try {
          await db.execute(sql`SELECT name FROM tenants LIMIT 1`);
          console.log('✅ name column already exists in tenants table');
        } catch {
          // If name doesn't exist, add it
          await db.execute(sql`ALTER TABLE tenants ADD COLUMN name TEXT`);
          console.log('✅ Added name column to tenants table');
        }
      } else {
        console.log('ℹ️ Tenants table rename skipped:', error.message);
      }
    }

    // Fix 2: Add call_id column to request table if missing
    console.log('🔄 Fixing request table schema...');
    try {
      await db.execute(sql`ALTER TABLE request ADD COLUMN call_id TEXT`);
      console.log('✅ Added call_id column to request table');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ call_id column already exists in request table');
      } else {
        console.log('ℹ️ Request table update skipped:', error.message);
      }
    }

    // Fix 3: Ensure tenants table has required columns
    console.log('🔄 Ensuring tenants table has all required columns...');
    const requiredColumns = [
      { name: 'subdomain', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'settings', type: 'JSONB' },
      { name: 'tier', type: 'TEXT DEFAULT \'free\'' },
      { name: 'max_calls', type: 'INTEGER DEFAULT 1000' },
      { name: 'max_users', type: 'INTEGER DEFAULT 10' },
      { name: 'features', type: 'JSONB' },
      { name: 'custom_domain', type: 'TEXT' }
    ];

    for (const column of requiredColumns) {
      try {
        await db.execute(sql`ALTER TABLE tenants ADD COLUMN ${sql.identifier(column.name)} ${sql.raw(column.type)}`);
        console.log(`✅ Added ${column.name} column to tenants table`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ ${column.name} column already exists`);
        } else {
          console.log(`ℹ️ Failed to add ${column.name}:`, error.message);
        }
      }
    }

    // Fix 4: Update existing Mi Nhon tenant data
    console.log('🔄 Updating Mi Nhon tenant data...');
    try {
      await db.execute(sql`
        UPDATE tenants 
        SET name = 'Mi Nhon Hotel',
            subdomain = 'minhonmuine',
            is_active = TRUE,
            tier = 'premium',
            max_calls = 10000,
            max_users = 50
        WHERE id = 'mi-nhon-hotel'
      `);
      console.log('✅ Updated Mi Nhon tenant data');
    } catch (error: any) {
      console.log('ℹ️ Tenant update skipped:', error.message);
    }

    // Fix 5: Ensure default tenant exists
    console.log('🔄 Ensuring default tenant exists...');
    try {
      await db.execute(sql`
        INSERT INTO tenants (id, name, subdomain, is_active, tier, max_calls, max_users)
        VALUES ('mi-nhon-hotel', 'Mi Nhon Hotel', 'minhonmuine', TRUE, 'premium', 10000, 50)
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('✅ Default tenant ensured');
    } catch (error: any) {
      console.log('ℹ️ Default tenant creation skipped:', error.message);
    }

    console.log('🎉 Production schema fix completed successfully!');

  } catch (error) {
    console.error('❌ Production schema fix failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the fix
fixProductionSchema().catch(console.error); 