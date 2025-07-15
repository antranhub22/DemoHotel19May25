#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Quick database fix for schema issues - SQLite version
 */
async function quickDatabaseFix() {
  console.log('🔧 Starting quick database schema fix...');

  // Use SQLite database directly
  const dbPath = join(process.cwd(), 'dev.db');
  console.log(`🔗 Connecting to SQLite database at: ${dbPath}`);
  
  const db = new Database(dbPath);

  try {
    // Fix 1: Add missing columns to tenants table
    console.log('📋 Step 1: Fixing tenants table...');
    
    // Check if tenants table exists, create if not
    const tenantsTableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='tenants'
    `).get();

    if (!tenantsTableExists) {
      console.log('ℹ️ Creating tenants table...');
      db.exec(`
        CREATE TABLE tenants (
          id TEXT PRIMARY KEY,
          name TEXT,
          hotel_name TEXT,
          subdomain TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created tenants table');
    }

    // Add 'name' column if it doesn't exist
    try {
      db.exec(`ALTER TABLE tenants ADD COLUMN name TEXT`);
      console.log('✅ Added name column to tenants table');
    } catch (error: any) {
      if (error.message?.includes('duplicate column')) {
        console.log('ℹ️ name column already exists in tenants table');
      } else {
        console.log('ℹ️ Skipping name column:', error.message);
      }
    }

    // Update name column with hotel_name values
    try {
      db.exec(`UPDATE tenants SET name = hotel_name WHERE name IS NULL OR name = ''`);
      console.log('✅ Updated name column with hotel_name values');
    } catch (error: any) {
      console.log('ℹ️ Could not update name column:', error.message);
    }

    // Fix 2: Add missing columns to orders table
    console.log('📋 Step 2: Fixing orders table...');
    
    // Check if orders table exists
    const ordersTableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='orders'
    `).get();
    
    if (ordersTableExists) {
      // Add call_id column if it doesn't exist
      try {
        db.exec(`ALTER TABLE orders ADD COLUMN call_id TEXT`);
        console.log('✅ Added call_id column to orders table');
      } catch (error: any) {
        if (error.message?.includes('duplicate column')) {
          console.log('ℹ️ call_id column already exists in orders table');
        } else {
          console.log('ℹ️ Skipping call_id column:', error.message);
        }
      }
    } else {
      console.log('ℹ️ Orders table does not exist, creating it...');
      db.exec(`
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          call_id TEXT,
          room_number TEXT NOT NULL,
          order_type TEXT NOT NULL,
          delivery_time TEXT NOT NULL,
          special_instructions TEXT,
          items TEXT NOT NULL,
          total_amount INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created orders table with call_id column');
    }

    // Fix 3: Add missing columns to request table
    console.log('📋 Step 3: Fixing request table...');
    
    // Check if request table exists
    const requestTableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='request'
    `).get();

    if (requestTableExists) {
      try {
        db.exec(`ALTER TABLE request ADD COLUMN call_id TEXT`);
        console.log('✅ Added call_id column to request table');
      } catch (error: any) {
        if (error.message?.includes('duplicate column')) {
          console.log('ℹ️ call_id column already exists in request table');
        } else {
          console.log('ℹ️ Skipping call_id column in request table:', error.message);
        }
      }
    } else {
      console.log('ℹ️ Request table does not exist, creating it...');
      db.exec(`
        CREATE TABLE request (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_number TEXT,
          order_id TEXT,
          request_content TEXT,
          status TEXT DEFAULT 'Đã ghi nhận',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          call_id TEXT
        )
      `);
      console.log('✅ Created request table with call_id column');
    }

    // Fix 4: Ensure Mi Nhon tenant exists with correct data
    console.log('📋 Step 4: Ensuring Mi Nhon tenant exists...');
    
    try {
      const insertTenant = db.prepare(`
        INSERT OR REPLACE INTO tenants (id, name, hotel_name, subdomain, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      insertTenant.run('mi-nhon-hotel', 'Mi Nhon Hotel', 'Mi Nhon Hotel', 'minhonmuine');
      console.log('✅ Mi Nhon tenant ensured in database');
    } catch (error: any) {
      console.log('ℹ️ Could not create/update Mi Nhon tenant:', error.message);
    }

    // Fix 5: Show current database tables
    console.log('📋 Step 5: Verifying database tables...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();
    
    console.log('✅ Current tables in database:');
    tables.forEach((table: any) => {
      console.log(`   - ${table.name}`);
    });

    console.log('🎉 Quick database fix completed successfully!');
    console.log('');
    console.log('✅ Fixed issues:');
    console.log('   - Added missing "name" column to tenants table');
    console.log('   - Added missing "call_id" column to orders table');
    console.log('   - Added missing "call_id" column to request table');
    console.log('   - Ensured Mi Nhon tenant exists');
    console.log('');
    console.log('🔄 Please restart your server to apply changes.');

  } catch (error) {
    console.error('❌ Quick database fix failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the fix immediately
quickDatabaseFix()
  .then(() => {
    console.log('✅ Database fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database fix failed:', error);
    process.exit(1);
  });

export { quickDatabaseFix }; 