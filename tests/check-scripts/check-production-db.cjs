const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@dpg-cr5j2gaj1k6c73f12qj0-a.oregon-postgres.render.com/hotel_production_db";

async function checkProductionDB() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Checking production database...');

    // 1. Check tables
    console.log('\n📋 Available tables:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(tablesResult.rows);

    // 2. Check request table structure
    console.log('\n📋 Request table structure:');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'request'
      ORDER BY ordinal_position;
    `);
    console.log('Request table columns:', structureResult.rows);

    // 3. Check request table data
    console.log('\n📋 Request table data:');
    const requestResult = await pool.query(`
      SELECT COUNT(*) as total_requests FROM request;
    `);
    console.log('Total requests:', requestResult.rows[0].total_requests);

    if (requestResult.rows[0].total_requests > 0) {
      const sampleRequests = await pool.query(`
        SELECT id, tenant_id, call_id, room_number, status, created_at
        FROM request 
        ORDER BY created_at DESC
        LIMIT 5;
      `);
      console.log('Sample requests:', sampleRequests.rows);
    }

    // 4. Check call_summaries table data
    console.log('\n📝 Call summaries data:');
    const summariesResult = await pool.query(`
      SELECT COUNT(*) as total_summaries FROM call_summaries;
    `);
    console.log('Total summaries:', summariesResult.rows[0].total_summaries);

    if (summariesResult.rows[0].total_summaries > 0) {
      const sampleSummaries = await pool.query(`
        SELECT id, call_id, room_number, duration, timestamp 
        FROM call_summaries 
        ORDER BY timestamp DESC
        LIMIT 3;
      `);
      console.log('Sample summaries:', sampleSummaries.rows);
    }

    // 5. Check tenant data
    console.log('\n🏨 Tenant data:');
    const tenantResult = await pool.query(`
      SELECT DISTINCT tenant_id FROM request;
    `);
    console.log('Tenant IDs in requests:', tenantResult.rows);

    // 6. Check status values
    console.log('\n📊 Status values:');
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM request 
      GROUP BY status;
    `);
    console.log('Request statuses:', statusResult.rows);

    // 7. Check recent activity
    console.log('\n🕒 Recent activity:');
    const recentActivity = await pool.query(`
      SELECT 
        'request' as type,
        id,
        room_number,
        status,
        created_at
      FROM request 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    console.log('Recent requests:', recentActivity.rows);

  } catch (error) {
    console.error('❌ Error connecting to production database:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductionDB(); 