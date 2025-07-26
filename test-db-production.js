#!/usr/bin/env node

/**
 * 🗄️ PRODUCTION DATABASE CONNECTION TESTER
 * Quick test script để check DATABASE_URL có hoạt động không
 */

const { Pool } = require('pg');

async function testProductionDatabase() {
    console.log('🔍 Testing Production Database Connection...');
    console.log('================================================');

    // Get database URL from environment or command line
    const dbUrl = process.argv[2] || process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error('❌ No DATABASE_URL provided');
        console.log('Usage: node test-db-production.js [DATABASE_URL]');
        console.log('   or: DATABASE_URL=your_url node test-db-production.js');
        process.exit(1);
    }

    // Mask sensitive info in logs
    const maskedUrl = dbUrl.replace(/\/\/.*:.*@/, '//***:***@');
    console.log(`🔗 Testing URL: ${maskedUrl}`);

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 1, // Only one connection for testing
    });

    try {
        console.log('⏳ Connecting to database...');
        const startTime = Date.now();

        // Test 1: Basic connection
        const client = await pool.connect();
        const connectTime = Date.now() - startTime;
        console.log(`✅ Connection successful (${connectTime}ms)`);

        // Test 2: Basic query
        const queryStart = Date.now();
        const result = await client.query('SELECT version(), now() as current_time');
        const queryTime = Date.now() - queryStart;

        console.log(`✅ Query successful (${queryTime}ms)`);
        console.log(`📊 Database version: ${result.rows[0].version.split(' ')[0]}`);
        console.log(`⏰ Server time: ${result.rows[0].current_time}`);

        // Test 3: Check tables exist
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

        console.log(`📋 Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });

        // Test 4: Check critical tables
        const criticalTables = ['tenants', 'request', 'call', 'transcript'];
        const missingTables = [];

        for (const table of criticalTables) {
            const tableExists = tablesResult.rows.some(row => row.table_name === table);
            if (tableExists) {
                console.log(`✅ Critical table '${table}' exists`);
            } else {
                console.log(`❌ Critical table '${table}' missing`);
                missingTables.push(table);
            }
        }

        // Test 5: Check sample data
        try {
            const tenantCount = await client.query('SELECT COUNT(*) FROM tenants');
            const requestCount = await client.query('SELECT COUNT(*) FROM request');

            console.log(`📊 Data summary:`);
            console.log(`   • Tenants: ${tenantCount.rows[0].count}`);
            console.log(`   • Requests: ${requestCount.rows[0].count}`);
        } catch (err) {
            console.log(`⚠️  Could not get data summary: ${err.message}`);
        }

        client.release();

        // Performance summary
        const totalTime = Date.now() - startTime;
        console.log('\n📈 Performance Summary:');
        console.log(`   • Connection time: ${connectTime}ms`);
        console.log(`   • Query time: ${queryTime}ms`);
        console.log(`   • Total time: ${totalTime}ms`);

        // Health assessment
        console.log('\n🏥 Health Assessment:');
        if (connectTime < 2000 && queryTime < 1000 && missingTables.length === 0) {
            console.log('✅ DATABASE HEALTHY - All checks passed');
        } else if (missingTables.length > 0) {
            console.log('❌ DATABASE UNHEALTHY - Missing critical tables');
            console.log(`   Missing: ${missingTables.join(', ')}`);
        } else if (connectTime > 5000 || queryTime > 3000) {
            console.log('⚠️  DATABASE SLOW - Performance issues detected');
        } else {
            console.log('⚠️  DATABASE DEGRADED - Some issues detected');
        }

    } catch (error) {
        console.error('❌ Database test failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'Unknown'}`);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting:');
            console.log('   • Check if database server is running');
            console.log('   • Verify host and port in DATABASE_URL');
            console.log('   • Check firewall settings');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Troubleshooting:');
            console.log('   • Check hostname in DATABASE_URL');
            console.log('   • Verify DNS resolution');
        } else if (error.message.includes('password authentication failed')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   • Check username and password in DATABASE_URL');
            console.log('   • Verify user permissions');
        }

        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n🔚 Database connection closed');
    }
}

// Run the test
testProductionDatabase().catch(console.error); 