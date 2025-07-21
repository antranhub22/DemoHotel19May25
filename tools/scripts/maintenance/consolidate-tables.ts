#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Consolidate orders and request tables into a single unified table
 * Since orders table is empty and request is being used, we'll enhance request table
 */
async function consolidateTables() {
  console.log('🔧 Starting table consolidation...');

  const dbPath = join(process.cwd(), 'dev.db');
  console.log(`🔗 Connecting to SQLite database at: ${dbPath}`);
  
  const db = new Database(dbPath);

  try {
    // Step 1: Check current state
    console.log('📋 Step 1: Analyzing current state...');
    
    const ordersCount = db.prepare(`SELECT COUNT(*) as count FROM orders`).get() as { count: number };
    const requestCount = db.prepare(`SELECT COUNT(*) as count FROM request`).get() as { count: number };
    
    console.log(`Orders table: ${ordersCount.count} records`);
    console.log(`Request table: ${requestCount.count} records`);

    // Step 2: Add commercial fields to request table (from orders schema)
    console.log('📋 Step 2: Adding commercial fields to request table...');
    
    const commercialFields = [
      { name: 'total_amount', type: 'REAL', description: 'Order total amount' },
      { name: 'items', type: 'TEXT', description: 'Order items (JSON)' },
      { name: 'delivery_time', type: 'TEXT', description: 'Requested delivery time' },
      { name: 'special_instructions', type: 'TEXT', description: 'Special delivery instructions' },
      { name: 'order_type', type: 'TEXT', description: 'Type of order (room_service, laundry, etc.)' }
    ];

    for (const field of commercialFields) {
      try {
        db.exec(`ALTER TABLE request ADD COLUMN ${field.name} ${field.type}`);
        console.log(`✅ Added ${field.name} column (${field.description})`);
      } catch (error: any) {
        if (error.message?.includes('duplicate column')) {
          console.log(`ℹ️ ${field.name} column already exists`);
        } else {
          console.log(`ℹ️ Could not add ${field.name}:`, error.message);
        }
      }
    }

    // Step 3: Migrate any existing data from orders to request (if any)
    console.log('📋 Step 3: Checking for data migration...');
    
    if (ordersCount.count > 0) {
      console.log(`Found ${ordersCount.count} orders to migrate...`);
      
      const orders = db.prepare(`SELECT * FROM orders`).all();
      const insertRequest = db.prepare(`
        INSERT INTO request (
          id, type, room_number, request_content, total_amount, 
          items, delivery_time, special_instructions, order_type,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const order of orders as any[]) {
        try {
          insertRequest.run(
            `REQ-MIGRATED-${order.id}`,
            'order',
            order.room_number,
            `Migrated order: ${order.order_type}`,
            order.total_amount,
            order.items,
            order.delivery_time,
            order.special_instructions,
            order.order_type,
            order.status || 'pending',
            order.created_at,
            new Date().toISOString()
          );
          console.log(`✅ Migrated order ${order.id}`);
        } catch (error: any) {
          console.log(`❌ Failed to migrate order ${order.id}:`, error.message);
        }
      }
    } else {
      console.log('ℹ️ No orders to migrate (table is empty)');
    }

    // Step 4: Update schema references in code documentation
    console.log('📋 Step 4: Documenting schema consolidation...');
    
    console.log(`
📊 CONSOLIDATED SCHEMA SUMMARY:
================================

✅ UNIFIED TABLE: request
- Handles both service requests AND commercial orders
- Contains all necessary fields for hotel operations

🗑️ DEPRECATED TABLE: orders  
- Will be dropped after code cleanup
- All functionality moved to 'request' table

🔧 NEW FIELDS ADDED TO REQUEST:
- total_amount (REAL) - For order pricing
- items (TEXT) - For order items (JSON format)
- delivery_time (TEXT) - For delivery scheduling  
- special_instructions (TEXT) - For order notes
- order_type (TEXT) - For categorization

💡 BENEFITS:
- Single source of truth for all guest requests
- Eliminates data duplication and sync issues
- Simplified API endpoints
- Consistent staff workflow
    `);

    // Step 5: Verify final schema
    console.log('📋 Step 5: Verifying consolidated schema...');
    const finalSchema = db.prepare(`PRAGMA table_info(request)`).all();
    
    console.log('\n📋 Final request table schema:');
    finalSchema.forEach((col: any) => {
      console.log(`   - ${col.name} (${col.type}${col.notnull ? ' NOT NULL' : ''})`);
    });

    const finalRequestCount = db.prepare(`SELECT COUNT(*) as count FROM request`).get() as { count: number };
    console.log(`\n✅ Final request table contains ${finalRequestCount.count} records`);

  } catch (error) {
    console.error('❌ Consolidation failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the consolidation
consolidateTables()
  .then(() => {
    console.log('✅ Table consolidation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Table consolidation failed:', error);
    process.exit(1);
  });

export { consolidateTables }; 