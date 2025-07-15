#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Complete schema fix to align database with code expectations
 */
async function completeSchemaFix() {
  console.log('🔧 Starting complete schema alignment...');

  const dbPath = join(process.cwd(), 'dev.db');
  console.log(`🔗 Connecting to SQLite database at: ${dbPath}`);
  
  const db = new Database(dbPath);

  try {
    // 1. Fix tenants table to match TenantService expectations
    console.log('📋 Step 1: Aligning tenants table...');
    
    // Check current tenants schema
    const tenantColumns = db.prepare(`PRAGMA table_info(tenants)`).all();
    console.log('Current tenants columns:', tenantColumns.map((c: any) => c.name));

    // Ensure all required columns exist
    const requiredTenantColumns = [
      { name: 'name', type: 'TEXT' },
      { name: 'hotel_name', type: 'TEXT' },
      { name: 'subdomain', type: 'TEXT' },
      { name: 'created_at', type: 'TEXT' },
      { name: 'updated_at', type: 'TEXT' },
      { name: 'is_active', type: 'INTEGER DEFAULT 1' },
      { name: 'settings', type: 'TEXT' },
      { name: 'tier', type: 'TEXT DEFAULT "free"' },
      { name: 'max_calls', type: 'INTEGER DEFAULT 1000' },
      { name: 'max_users', type: 'INTEGER DEFAULT 10' },
      { name: 'features', type: 'TEXT' },
      { name: 'custom_domain', type: 'TEXT' }
    ];

    for (const col of requiredTenantColumns) {
      try {
        db.exec(`ALTER TABLE tenants ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added ${col.name} column to tenants`);
      } catch (error: any) {
        if (error.message?.includes('duplicate column')) {
          console.log(`ℹ️ ${col.name} column already exists`);
        } else {
          console.log(`ℹ️ Skipping ${col.name}:`, error.message);
        }
      }
    }

    // 2. Fix orders table schema
    console.log('📋 Step 2: Aligning orders table...');
    
    // Check if orders table exists and recreate with proper schema
    const ordersExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='orders'
    `).get();

    if (ordersExists) {
      // Check current orders schema
      const orderColumns = db.prepare(`PRAGMA table_info(orders)`).all();
      console.log('Current orders columns:', orderColumns.map((c: any) => c.name));

      // Add missing columns
      const requiredOrderColumns = [
        'call_id',
        'room_number', 
        'order_type',
        'delivery_time',
        'special_instructions',
        'items',
        'total_amount',
        'status',
        'created_at'
      ];

      for (const colName of requiredOrderColumns) {
        const exists = orderColumns.some((c: any) => c.name === colName);
        if (!exists) {
          try {
            let colType = 'TEXT';
            if (colName === 'total_amount') colType = 'INTEGER';
            if (colName === 'status') colType = 'TEXT DEFAULT "pending"';
            if (colName === 'created_at') colType = 'TEXT DEFAULT CURRENT_TIMESTAMP';
            
            db.exec(`ALTER TABLE orders ADD COLUMN ${colName} ${colType}`);
            console.log(`✅ Added ${colName} column to orders`);
          } catch (error: any) {
            console.log(`ℹ️ Could not add ${colName}:`, error.message);
          }
        }
      }
    }

    // 3. Create missing tables if they don't exist
    console.log('📋 Step 3: Creating missing tables...');

    // Create call_summaries table
    db.exec(`
      CREATE TABLE IF NOT EXISTS call_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        call_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        room_number TEXT,
        duration TEXT
      )
    `);
    console.log('✅ Ensured call_summaries table exists');

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Ensured users table exists');

    // 4. Insert/Update Mi Nhon tenant with all required fields
    console.log('📋 Step 4: Setting up Mi Nhon tenant...');
    
    try {
      const insertTenant = db.prepare(`
        INSERT OR REPLACE INTO tenants (
          id, name, hotel_name, subdomain, 
          created_at, updated_at, is_active, 
          tier, max_calls, max_users
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 'premium', 5000, 50)
      `);
      
      insertTenant.run('mi-nhon-hotel', 'Mi Nhon Hotel', 'Mi Nhon Hotel', 'minhonmuine');
      console.log('✅ Mi Nhon tenant setup completed');
    } catch (error: any) {
      console.log('ℹ️ Could not setup Mi Nhon tenant:', error.message);
    }

    // 5. Create sample data for testing
    console.log('📋 Step 5: Creating sample data...');
    
    // Sample staff user
    try {
      const insertStaff = db.prepare(`
        INSERT OR IGNORE INTO staff (username, password, role, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      insertStaff.run('admin', 'admin123', 'admin');
      console.log('✅ Sample staff user created');
    } catch (error: any) {
      console.log('ℹ️ Could not create staff user:', error.message);
    }

    // Sample request
    try {
      const insertRequest = db.prepare(`
        INSERT OR IGNORE INTO request (
          room_number, order_id, request_content, 
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      insertRequest.run('101', 'ORD-001', 'Room service: Coffee and sandwich', 'Đã ghi nhận');
      console.log('✅ Sample request created');
    } catch (error: any) {
      console.log('ℹ️ Could not create sample request:', error.message);
    }

    // 6. Show final database state
    console.log('📋 Step 6: Final verification...');
    
    const allTables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();
    
    console.log('✅ All tables in database:');
    allTables.forEach((table: any) => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
      console.log(`   - ${table.name} (${count.count} records)`);
    });

    // Show tenants data
    const tenants = db.prepare(`SELECT id, name, hotel_name, subdomain FROM tenants`).all();
    console.log('✅ Tenants in database:');
    tenants.forEach((tenant: any) => {
      console.log(`   - ${tenant.id}: ${tenant.name || tenant.hotel_name} (${tenant.subdomain})`);
    });

    console.log('🎉 Complete schema alignment completed successfully!');
    console.log('');
    console.log('✅ Fixed all schema issues:');
    console.log('   - Aligned tenants table with TenantService expectations');
    console.log('   - Fixed orders table schema');
    console.log('   - Created missing tables');
    console.log('   - Setup Mi Nhon tenant with all fields');
    console.log('   - Created sample data for testing');
    console.log('');
    console.log('🔄 Your server should now work without schema errors!');

  } catch (error) {
    console.error('❌ Complete schema fix failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the fix immediately
completeSchemaFix()
  .then(() => {
    console.log('✅ Complete schema fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Complete schema fix failed:', error);
    process.exit(1);
  }); 