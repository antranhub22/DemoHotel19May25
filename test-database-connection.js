// Test script để kiểm tra kết nối DATABASE_URL PostgreSQL
import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config();

const { Client } = pg;

async function testDatabaseConnection() {
  console.log('🔍 Testing DATABASE_URL connection...');

  // Lấy DATABASE_URL từ environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Please set DATABASE_URL in your .env file');
    return;
  }

  console.log('📋 DATABASE_URL found:', databaseUrl.substring(0, 30) + '...');

  // Kiểm tra xem có phải PostgreSQL không
  const isPostgreSQL =
    databaseUrl.includes('postgresql://') ||
    databaseUrl.includes('postgres://');

  if (!isPostgreSQL) {
    console.log('⚠️ DATABASE_URL is not PostgreSQL format');
    console.log('💡 Current format:', databaseUrl.substring(0, 20));
    return;
  }

  console.log('✅ DATABASE_URL is PostgreSQL format');

  try {
    // Tạo client
    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('🔗 Attempting to connect...');

    // Kết nối
    await client.connect();
    console.log('✅ Database connection successful!');

    // Test query
    const result = await client.query(
      'SELECT NOW() as current_time, version() as db_version'
    );
    console.log('✅ Query successful!');
    console.log('📊 Current time:', result.rows[0].current_time);
    console.log(
      '📊 Database version:',
      result.rows[0].db_version.substring(0, 50) + '...'
    );

    // Kiểm tra tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Tables found:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      console.log(
        '📋 Table names:',
        tablesResult.rows.map(row => row.table_name).join(', ')
      );
    }

    await client.end();
    console.log('✅ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error);

    if (error.code === 'ENOTFOUND') {
      console.log('💡 This might be a DNS resolution issue');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 This might be a connection refused issue');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 This might be a timeout issue');
    }
  }
}

// Chạy test
testDatabaseConnection().catch(console.error);
