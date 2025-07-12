#!/usr/bin/env tsx

/**
 * Manual Database Setup Script
 * Executes the SQL setup script directly
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runManualDatabaseSetup() {
  console.log('🔧 Starting manual database setup...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  let pool: Pool | null = null;
  
  try {
    // Create database connection
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connected to database');
    
    // Read SQL file
    const sqlFile = path.join(__dirname, 'setup-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Read SQL setup file');
    
    // Execute SQL
    console.log('🔧 Executing database setup...');
    const result = await pool.query(sql);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Result:', result.rows);
    
    // Test the setup
    console.log('\n🧪 Testing database setup...');
    
    // Check tenants table
    const tenants = await pool.query('SELECT * FROM tenants');
    console.log(`✅ Tenants table: ${tenants.rows.length} records`);
    
    // Check staff table
    const staff = await pool.query('SELECT username, role FROM staff');
    console.log(`✅ Staff table: ${staff.rows.length} records`);
    staff.rows.forEach(row => {
      console.log(`  - ${row.username} (${row.role})`);
    });
    
    // Check hotel_profiles table
    const profiles = await pool.query('SELECT * FROM hotel_profiles');
    console.log(`✅ Hotel profiles table: ${profiles.rows.length} records`);
    
    console.log('\n🎉 Database setup completed and verified!');
    console.log('You can now login with:');
    console.log('  - admin@hotel.com : StrongPassword123');
    console.log('  - manager@hotel.com : StrongPassword456');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runManualDatabaseSetup().catch(console.error); 