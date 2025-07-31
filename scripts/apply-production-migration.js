#!/usr/bin/env node

/**
 * Production Migration Script
 * Apply missing request service columns to production database
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function applyProductionMigration() {
  console.log('🚀 Applying production migration...');

  const migrationFile = path.join(
    __dirname,
    '../tools/migrations/0011_add_missing_request_service_columns.sql'
  );

  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found:', migrationFile);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

  console.log('📋 Migration SQL:');
  console.log(migrationSQL);

  console.log('✅ Migration script ready for production deployment');
  console.log('📝 To apply on Render:');
  console.log('1. Go to Render Dashboard');
  console.log('2. Select your service');
  console.log('3. Go to "Shell" tab');
  console.log(
    '4. Run: psql $DATABASE_URL -f tools/migrations/0011_add_missing_request_service_columns.sql'
  );
}

applyProductionMigration().catch(console.error);
