const { Client } = require('pg');

async function testDatabaseUrl() {
    console.log('🔍 TESTING DATABASE_URL IN PRODUCTION');
    console.log('=====================================');

    // Test 1: Check if DATABASE_URL is set
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.log('❌ DATABASE_URL is not set');
        return;
    }

    console.log('✅ DATABASE_URL is set');
    console.log(`📏 Length: ${databaseUrl.length}`);
    console.log(`🔗 Prefix: ${databaseUrl.substring(0, 30)}...`);
    console.log(`🌐 Type: ${databaseUrl.includes('postgresql://') ? 'PostgreSQL' : 'Unknown'}`);

    // Test 2: Try to connect to database
    console.log('\n🔌 Testing database connection...');
    
    try {
        const client = new Client({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await client.connect();
        console.log('✅ Database connection successful!');

        // Test 3: Run a simple query
        console.log('\n📊 Testing database query...');
        const result = await client.query('SELECT 1 as test, NOW() as timestamp');
        console.log('✅ Query successful!');
        console.log('📋 Result:', result.rows[0]);

        // Test 4: Check if our tables exist
        console.log('\n🗂️ Checking database tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('✅ Tables found:', tablesResult.rows.map(row => row.table_name));

        await client.end();
        console.log('\n🎉 All database tests passed!');

    } catch (error) {
        console.log('❌ Database connection failed:');
        console.log('Error:', error.message);
        console.log('Code:', error.code);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 This usually means the database server is not accessible');
        } else if (error.code === 'ENOTFOUND') {
            console.log('💡 This usually means the database host is not found');
        } else if (error.code === '28P01') {
            console.log('💡 This usually means invalid username/password');
        }
    }
}

// Run the test
testDatabaseUrl().catch(console.error); 