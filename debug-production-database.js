// Debug script cho DATABASE_URL trong production
import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config();

const { Client } = pg;

async function debugProductionDatabase() {
  console.log('🔍 Debugging DATABASE_URL in production...');

  // Lấy DATABASE_URL từ environment
  const databaseUrl = process.env.DATABASE_URL;

  console.log('📋 Environment check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   DATABASE_URL exists:', !!databaseUrl);
  console.log('   DATABASE_URL length:', databaseUrl?.length || 0);

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found');
    return;
  }

  // Hiển thị DATABASE_URL (che giấu password)
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('📋 DATABASE_URL (masked):', maskedUrl);

  // Kiểm tra format
  const isPostgreSQL =
    databaseUrl.includes('postgresql://') ||
    databaseUrl.includes('postgres://');
  console.log('📋 Is PostgreSQL format:', isPostgreSQL);

  if (!isPostgreSQL) {
    console.log('⚠️ DATABASE_URL is not PostgreSQL format');
    return;
  }

  // Parse DATABASE_URL để kiểm tra
  try {
    const url = new URL(databaseUrl);
    console.log('📋 Parsed URL components:');
    console.log('   Protocol:', url.protocol);
    console.log('   Hostname:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Username:', url.username);
    console.log('   Has password:', !!url.password);
  } catch (error) {
    console.log('❌ Failed to parse DATABASE_URL:', error.message);
  }

  // Test connection với timeout
  console.log('\n🔗 Testing database connection...');

  try {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000, // 10 seconds
      query_timeout: 10000,
    });

    console.log('📋 Client created, attempting connection...');

    await client.connect();
    console.log('✅ Database connection successful!');

    // Test simple query
    const result = await client.query(
      'SELECT 1 as test, NOW() as current_time'
    );
    console.log('✅ Query successful:', result.rows[0]);

    // Test database version
    const versionResult = await client.query('SELECT version()');
    console.log(
      '📊 Database version:',
      versionResult.rows[0].version.substring(0, 100) + '...'
    );

    // Test tables
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
    console.log('✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);

    // Phân tích lỗi
    if (error.code === 'ENOTFOUND') {
      console.log('💡 DNS resolution issue - check hostname');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - check if database is running');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timeout - check network/firewall');
    } else if (error.code === '28P01') {
      console.log('💡 Authentication failed - check username/password');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist');
    } else if (error.code === '28000') {
      console.log('💡 Invalid authorization specification');
    }
  }
}

// Chạy debug
debugProductionDatabase().catch(console.error);
