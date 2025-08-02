#!/usr/bin/env node

/**
 * Fix Production Database - Add Missing Service Columns
 * This script applies the missing service columns to the request table
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required!');
  console.error(
    'Please set DATABASE_URL to your production database connection string'
  );
  process.exit(1);
}

async function fixProductionDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🚀 Starting production database fix...');
    console.log('📋 Target: Add missing service columns to request table');

    // Read migration file
    const migrationPath = path.join(
      process.cwd(),
      'tools/migrations/0011_add_missing_request_service_columns.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(
      '📋 Applying migration: 0011_add_missing_request_service_columns.sql'
    );

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');

    // Verify the columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      AND column_name IN ('service_id', 'guest_name', 'phone_number', 'total_amount', 'currency', 'special_instructions', 'urgency', 'order_type', 'delivery_time', 'items')
      ORDER BY column_name;
    `);

    console.log('📊 Verification - New columns:');
    result.rows.forEach(row => {
      console.log(
        `  ✅ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    console.log('\n🎉 Production database fix completed successfully!');
    console.log(
      '📝 The OpenAI summary generation should now work without database errors.'
    );
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('💡 Error details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixProductionDatabase();
