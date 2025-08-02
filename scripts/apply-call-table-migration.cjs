#!/usr/bin/env node

/**
 * Script to apply call table migration to production database
 * Usage: node scripts/apply-call-table-migration.cjs
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a:5432/minhonhotelen1";

async function applyCallTableMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Connecting to production database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Read migration file
    const migrationPath = path.join(__dirname, '../tools/migrations/create_call_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Applying call table migration...');
    
    // Apply migration
    await client.query(migrationSQL);
    
    console.log('✅ Call table migration applied successfully');
    
    // Verify table was created
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'call'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Call table exists in database');
      
      // Check table structure
      const structureCheck = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'call'
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Call table structure:');
      structureCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check indexes
      const indexCheck = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes 
        WHERE tablename = 'call'
      `);
      
      console.log(`📈 Call table indexes (${indexCheck.rows.length}):`);
      indexCheck.rows.forEach(row => {
        console.log(`  - ${row.indexname}`);
      });
      
    } else {
      console.log('❌ Call table was not created');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '23505') {
      console.log('ℹ️  Table already exists (unique constraint violation)');
    }
  } finally {
    await pool.end();
  }
}

// Run migration
applyCallTableMigration().then(() => {
  console.log('🎉 Migration script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
}); 