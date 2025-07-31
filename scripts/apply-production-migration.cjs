#!/usr/bin/env node

/**
 * Production Migration Script
 * Apply missing request service columns to production database
 */

const fs = require('fs');
const path = require('path');

async function applyProductionMigration() {
  console.log('🚀 Applying production migration...');
  
  const migrationFile = path.join(__dirname, '../tools/migrations/0011_add_missing_request_service_columns.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found:', migrationFile);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  
  console.log('📋 Migration SQL:');
  console.log(migrationSQL);
  
  console.log('\n✅ Migration script ready for production deployment');
  console.log('📝 To apply on Render:');
  console.log('1. Go to Render Dashboard');
  console.log('2. Select your service');
  console.log('3. Go to "Shell" tab');
  console.log('4. Run: psql $DATABASE_URL -f tools/migrations/0011_add_missing_request_service_columns.sql');
  console.log('\n🔧 Or run this command directly:');
  console.log('psql $DATABASE_URL -c "ALTER TABLE request ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(id), ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100), ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20), ADD COLUMN IF NOT EXISTS total_amount REAL, ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT \'VND\', ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP, ADD COLUMN IF NOT EXISTS actual_completion TIMESTAMP, ADD COLUMN IF NOT EXISTS special_instructions VARCHAR(500), ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT \'normal\', ADD COLUMN IF NOT EXISTS order_type VARCHAR(50), ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(100), ADD COLUMN IF NOT EXISTS items TEXT;"');
}

applyProductionMigration().catch(console.error); 