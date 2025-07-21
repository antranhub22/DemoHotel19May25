#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Final database fix to ensure request table has all required columns
 */
async function finalDatabaseFix() {
  console.log('🔧 Starting final database fix for request table...');

  const dbPath = join(process.cwd(), 'dev.db');
  console.log(`🔗 Connecting to SQLite database at: ${dbPath}`);
  
  const db = new Database(dbPath);

  try {
    // Check current request table schema
    console.log('📋 Checking request table schema...');
    const requestColumns = db.prepare(`PRAGMA table_info(request)`).all();
    console.log('Current request columns:', requestColumns.map((c: any) => c.name));

    // Required columns for request table (matching schema.ts)
    const requiredColumns = [
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'room_number', type: 'TEXT', nullable: true },
      { name: 'order_id', type: 'TEXT', nullable: true },
      { name: 'request_content', type: 'TEXT', nullable: true },
      { name: 'priority', type: 'TEXT', nullable: true, default: "'medium'" },
      { name: 'status', type: 'TEXT', nullable: true, default: "'pending'" },
      { name: 'assigned_to', type: 'TEXT', nullable: true },
      { name: 'completed_at', type: 'TEXT', nullable: true },
      { name: 'metadata', type: 'TEXT', nullable: true }
    ];

    // Add missing columns
    for (const col of requiredColumns) {
      const exists = requestColumns.some((existing: any) => existing.name === col.name);
      if (!exists) {
        let sql = `ALTER TABLE request ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) {
          sql += ` DEFAULT ${col.default}`;
        }
        if (!col.nullable) {
          sql += ` NOT NULL`;
        }
        
        try {
          db.exec(sql);
          console.log(`✅ Added column: ${col.name}`);
        } catch (error: any) {
          console.log(`ℹ️ Column ${col.name} may already exist:`, error.message);
        }
      } else {
        console.log(`✅ Column ${col.name} already exists`);
      }
    }

    // Verify final schema
    console.log('\n📋 Final request table schema:');
    const finalColumns = db.prepare(`PRAGMA table_info(request)`).all();
    finalColumns.forEach((col: any) => {
      console.log(`   - ${col.name} (${col.type}${col.notnull ? ' NOT NULL' : ''})`);
    });

    // Test query
    console.log('\n🧪 Testing query...');
    const testResult = db.prepare(`SELECT COUNT(*) as count FROM request`).get() as { count: number };
    console.log(`✅ Request table accessible with ${testResult.count} records`);

  } catch (error) {
    console.error('❌ Final database fix failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the fix immediately
finalDatabaseFix()
  .then(() => {
    console.log('✅ Final database fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Final database fix failed:', error);
    process.exit(1);
  });

export { finalDatabaseFix }; 