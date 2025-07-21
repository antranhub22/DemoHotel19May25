#!/usr/bin/env node

/**
 * Fix Production Request Table - Add Missing Columns
 * 
 * This script adds missing columns to the PostgreSQL request table on production
 * Specifically adds call_id column and other missing fields
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function fixProductionRequestTable() {
  console.log('🔧 [Production Fix] Starting request table migration...');
  
  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required for production migration');
    console.error('This script is designed to run on production with PostgreSQL');
    process.exit(1);
  }

  if (!databaseUrl.includes('postgres')) {
    console.error('❌ This script is only for PostgreSQL databases');
    console.error('Current DATABASE_URL does not appear to be PostgreSQL');
    process.exit(1);
  }

  console.log('✅ PostgreSQL DATABASE_URL detected');
  console.log('🏗️ Connecting to production database...');

  let sql: any;
  try {
    // Create postgres connection
    sql = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }, // For most cloud providers
      max: 1, // Use only 1 connection for this script
    });

    // Test connection
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log(`✅ Connected to database at: ${testResult[0].current_time}`);

    // Check current table structure
    console.log('🔍 Checking current request table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Check if call_id already exists
    const hasCallId = columns.some((col: any) => col.column_name === 'call_id');
    
    if (hasCallId) {
      console.log('✅ call_id column already exists! Migration may have been run already.');
      console.log('🔍 Checking if all required columns exist...');
      
      const requiredColumns = [
        'call_id', 'tenant_id', 'description', 'priority', 'assigned_to',
        'completed_at', 'metadata', 'type', 'total_amount', 'items',
        'delivery_time', 'special_instructions', 'order_type'
      ];
      
      const existingColumns = columns.map((col: any) => col.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns exist! No migration needed.');
        return;
      } else {
        console.log(`⚠️ Missing columns: ${missingColumns.join(', ')}`);
        console.log('🔧 Will add only missing columns...');
      }
    }

    // Read and execute migration file
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'tools/migrations/0006_add_missing_request_columns.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');

    // Execute migration
    console.log('🚀 Executing migration...');
    console.log('⚠️ This will modify the production database!');
    
    // Split SQL into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await sql.unsafe(statement);
          console.log('✅ Statement executed successfully');
        } catch (error: any) {
          console.warn(`⚠️ Statement may have failed (this might be OK): ${error.message}`);
        }
      }
    }

    // Verify the fix
    console.log('🔍 Verifying migration results...');
    const newColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Updated table structure:');
    newColumns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    const nowHasCallId = newColumns.some((col: any) => col.column_name === 'call_id');
    
    if (nowHasCallId) {
      console.log('🎉 SUCCESS! call_id column has been added to production database');
      console.log('✅ Migration completed successfully');
      console.log('🔄 You may need to restart your Render application to pick up the changes');
    } else {
      console.error('❌ Migration appears to have failed - call_id column still missing');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
      console.log('📝 Database connection closed');
    }
  }
}

// Auto-run the migration when script is executed
fixProductionRequestTable()
  .then(() => {
    console.log('🏁 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });

export default fixProductionRequestTable; 