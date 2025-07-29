#!/usr/bin/env tsx

/**
 * Production Migration Script
 * Apply missing service columns to request table
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required!');
  process.exit(1);
}

async function applyMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🚀 Starting production migration...');

    // Read migration file
    const migrationPath = join(
      process.cwd(),
      'tools/migrations/0011_add_missing_request_service_columns.sql'
    );
    const migrationSQL = readFileSync(migrationPath, 'utf8');

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
      AND column_name IN ('service_id', 'guest_name', 'phone_number', 'total_amount', 'currency')
      ORDER BY column_name;
    `);

    console.log('📊 Verification - New columns:');
    result.rows.forEach(row => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
