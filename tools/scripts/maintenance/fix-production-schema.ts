#!/usr/bin/env tsx

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Production Database Schema Fix Script
// Run this to fix missing columns on Render production database

async function fixProductionSchema() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not found');
    process.exit(1);
  }

  console.log('🔧 Starting Production Database Schema Fix...');
  console.log('📍 Database:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    console.log('🔗 Testing database connection...');
    const client = await pool.connect();
    
    // Check current schema state
    console.log('📊 Checking current schema state...');
    
    const staffColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'staff' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current staff table columns:');
    staffColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check if migration is needed
    const hasFirstName = staffColumns.rows.some(row => row.column_name === 'first_name');
    const hasLastName = staffColumns.rows.some(row => row.column_name === 'last_name');
    
    if (hasFirstName && hasLastName) {
      console.log('✅ Schema appears to be up to date - no migration needed');
      client.release();
      return;
    }

    console.log('🚨 Missing columns detected - running migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/0007_fix_production_staff_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Run migration in transaction
    console.log('🔄 Running migration in transaction...');
    await client.query('BEGIN');
    
    try {
      // Split SQL into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.includes('INSERT INTO migration_log')) {
          // Skip migration log insert if table doesn't exist
          try {
            await client.query(statement);
          } catch (error) {
            console.log('⚠️ Skipping migration log (table may not exist)');
          }
        } else {
          console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!');
      
      // Verify changes
      console.log('🔍 Verifying migration results...');
      const newStaffColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name IN ('first_name', 'last_name', 'display_name')
        ORDER BY column_name;
      `);
      
      console.log('✅ New columns added:');
      newStaffColumns.rows.forEach(row => {
        console.log(`  ✓ ${row.column_name}: ${row.data_type}`);
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('🎉 Production schema fix completed!');
  console.log('🚀 You can now redeploy your application - the schema errors should be resolved.');
}

// Run if called directly
if (require.main === module) {
  fixProductionSchema().catch(console.error);
}

export { fixProductionSchema }; 