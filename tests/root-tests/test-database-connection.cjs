#!/usr/bin/env node

/**
 * Test Database Connection
 * Debug DATABASE_URL and test connection
 */

const { Pool } = require('pg');

// Test different DATABASE_URL formats
const testUrls = [
  // Original from image
  "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a:5432/minhonhotelen1",
  
  // With .render.com suffix
  "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a.render.com:5432/minhonhotelen1",
  
  // With .oregon-postgres.render.com (common Render format)
  "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a.oregon-postgres.render.com:5432/minhonhotelen1",
  
  // With .singapore-postgres.render.com
  "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a.singapore-postgres.render.com:5432/minhonhotelen1",
  
  // With .frankfurt-postgres.render.com
  "postgresql://minhonhotelen1_user:Fjos7A0kclGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a.frankfurt-postgres.render.com:5432/minhonhotelen1"
];

async function testConnection(databaseUrl, index) {
  console.log(`\n🔍 Testing DATABASE_URL ${index + 1}:`);
  console.log(`📋 ${databaseUrl}`);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Connection successful!');
    console.log(`⏰ Current time: ${result.rows[0].current_time}`);
    console.log(`📊 Database: ${result.rows[0].db_version.split(' ')[0]}`);
    
    // Test if request table exists
    const tableResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY ordinal_position;
    `);
    
    console.log(`📋 Request table has ${tableResult.rows.length} columns`);
    
    // Check for missing columns
    const missingColumns = ['service_id', 'guest_name', 'phone_number', 'total_amount', 'currency'];
    const existingColumns = tableResult.rows.map(row => row.column_name);
    
    const missing = missingColumns.filter(col => !existingColumns.includes(col));
    if (missing.length > 0) {
      console.log(`❌ Missing columns: ${missing.join(', ')}`);
    } else {
      console.log('✅ All required columns exist!');
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    await pool.end();
    return false;
  }
}

async function runTests() {
  console.log('🎯 Testing Database Connections');
  console.log('==============================');
  
  for (let i = 0; i < testUrls.length; i++) {
    const success = await testConnection(testUrls[i], i);
    if (success) {
      console.log('\n🎉 Found working DATABASE_URL!');
      console.log(`💡 Use this DATABASE_URL: ${testUrls[i]}`);
      console.log('\n🚀 Now run the migration:');
      console.log(`export DATABASE_URL="${testUrls[i]}"`);
      console.log('node fix-production-database.js');
      return;
    }
  }
  
  console.log('\n❌ None of the DATABASE_URL formats worked.');
  console.log('💡 Please check your Render dashboard for the correct DATABASE_URL.');
  console.log('🔗 Go to: https://dashboard.render.com/web/srv-d015p73uibrs73a20dog');
  console.log('📋 Navigate to Environment tab and copy the DATABASE_URL value.');
}

runTests(); 