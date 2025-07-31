#!/usr/bin/env node

/**
 * Emergency Production Database Fix
 * Apply missing columns to request table on Render
 */

const { Pool } = require('pg');

async function fixProductionDatabase() {
  console.log('🚨 EMERGENCY: Fixing production database...');

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('📋 Checking current request table structure...');

    // Check existing columns
    const existingColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY column_name;
    `);

    console.log('📊 Current columns:');
    existingColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Check if missing columns exist
    const missingColumns = [
      'service_id',
      'guest_name',
      'phone_number',
      'total_amount',
      'currency',
    ];
    const existingColumnNames = existingColumns.rows.map(
      row => row.column_name
    );

    const needToAdd = missingColumns.filter(
      col => !existingColumnNames.includes(col)
    );

    if (needToAdd.length === 0) {
      console.log('✅ All required columns already exist!');
      return;
    }

    console.log('❌ Missing columns:', needToAdd);

    // Add missing columns
    console.log('🔧 Adding missing columns...');

    for (const column of needToAdd) {
      let sql = '';
      switch (column) {
        case 'service_id':
          sql = 'ALTER TABLE request ADD COLUMN service_id VARCHAR(255);';
          break;
        case 'guest_name':
          sql = 'ALTER TABLE request ADD COLUMN guest_name VARCHAR(255);';
          break;
        case 'phone_number':
          sql = 'ALTER TABLE request ADD COLUMN phone_number VARCHAR(50);';
          break;
        case 'total_amount':
          sql = 'ALTER TABLE request ADD COLUMN total_amount DECIMAL(10,2);';
          break;
        case 'currency':
          sql =
            "ALTER TABLE request ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';";
          break;
      }

      if (sql) {
        console.log(`  Adding ${column}...`);
        await pool.query(sql);
        console.log(`  ✅ Added ${column}`);
      }
    }

    console.log('✅ All missing columns added successfully!');

    // Verify
    const finalCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      AND column_name IN ('service_id', 'guest_name', 'phone_number', 'total_amount', 'currency')
      ORDER BY column_name;
    `);

    console.log('📊 Verification - New columns:');
    finalCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('❌ Failed to fix database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixProductionDatabase();
