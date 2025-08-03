#!/usr/bin/env node

/**
 * Test Real Database Connection
 * 
 * Script này sẽ test kết nối thực tế với PostgreSQL database
 * và so sánh schema với Prisma schema
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Đọc Prisma schema
function readPrismaSchema() {
    try {
        const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        const modelMatches = schemaContent.match(/model\s+(\w+)\s*\{/g);
        const models = [];

        if (modelMatches) {
            modelMatches.forEach(match => {
                const modelName = match.replace('model ', '').replace(' {', '');
                models.push(modelName);
            });
        }

        return models;
    } catch (error) {
        console.error('❌ Error reading Prisma schema:', error.message);
        return [];
    }
}

// Test kết nối database
async function testDatabaseConnection(databaseUrl) {
    console.log('🔗 Testing database connection...');

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        queryTimeoutMillis: 10000
    });

    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL database');

        // Test query đơn giản
        const result = await client.query('SELECT version()');
        console.log('📊 Database version:', result.rows[0].version.split(' ')[0]);

        await client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    } finally {
        await pool.end();
    }
}

// Lấy schema từ database
async function getDatabaseSchema(databaseUrl) {
    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Lấy danh sách bảng
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

        const tables = tablesResult.rows.map(row => row.table_name);

        // Lấy schema chi tiết cho các bảng quan trọng
        const tableSchemas = {};
        const importantTables = ['staff', 'tenants', 'request', 'call_summaries', 'hotel_profiles'];

        for (const tableName of importantTables) {
            if (tables.includes(tableName)) {
                const columnsResult = await client.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);

                tableSchemas[tableName] = columnsResult.rows;
            }
        }

        await client.release();
        return { tables, tableSchemas };

    } catch (error) {
        console.error('❌ Error getting database schema:', error.message);
        return null;
    } finally {
        await pool.end();
    }
}

// So sánh schema
function compareSchemas(prismaModels, dbSchema) {
    if (!dbSchema) {
        console.log('⚠️ Cannot compare schemas - no database connection');
        return;
    }

    console.log('\n📊 SCHEMA COMPARISON RESULTS:');
    console.log('================================');

    const prismaTableNames = prismaModels.map(m => m);
    const dbTableNames = dbSchema.tables;

    console.log(`📦 Prisma Models: ${prismaTableNames.length}`);
    console.log(`🗄️ Database Tables: ${dbTableNames.length}`);

    // Kiểm tra bảng thiếu
    const missingInDB = prismaTableNames.filter(name => !dbTableNames.includes(name));
    const extraInDB = dbTableNames.filter(name => !prismaTableNames.includes(name));

    if (missingInDB.length > 0) {
        console.log(`\n❌ Tables missing in database: ${missingInDB.join(', ')}`);
    }

    if (extraInDB.length > 0) {
        console.log(`\n⚠️ Extra tables in database: ${extraInDB.join(', ')}`);
    }

    // Kiểm tra chi tiết các bảng quan trọng
    const importantTables = ['staff', 'tenants', 'request', 'call_summaries', 'hotel_profiles'];

    console.log('\n🔍 DETAILED TABLE ANALYSIS:');
    console.log('============================');

    for (const tableName of importantTables) {
        const hasInPrisma = prismaTableNames.includes(tableName);
        const hasInDB = dbTableNames.includes(tableName);
        const dbColumns = dbSchema.tableSchemas[tableName];

        console.log(`\n📋 ${tableName}:`);
        console.log(`  📦 In Prisma: ${hasInPrisma ? '✅' : '❌'}`);
        console.log(`  🗄️ In Database: ${hasInDB ? '✅' : '❌'}`);

        if (dbColumns) {
            console.log(`  📊 Columns: ${dbColumns.length}`);
            console.log(`  📝 Column names: ${dbColumns.map(c => c.column_name).join(', ')}`);
        }
    }

    // Tổng kết
    const matchingTables = prismaTableNames.filter(name => dbTableNames.includes(name)).length;
    const consistencyPercentage = (matchingTables / prismaTableNames.length * 100).toFixed(1);

    console.log(`\n📈 CONSISTENCY SUMMARY:`);
    console.log(`  📦 Prisma tables: ${prismaTableNames.length}`);
    console.log(`  🗄️ Database tables: ${dbTableNames.length}`);
    console.log(`  ✅ Matching tables: ${matchingTables}`);
    console.log(`  ❌ Missing tables: ${missingInDB.length}`);
    console.log(`  ⚠️ Extra tables: ${extraInDB.length}`);
    console.log(`  📊 Consistency: ${consistencyPercentage}%`);

    return {
        matchingTables,
        missingTables: missingInDB.length,
        extraTables: extraInDB.length,
        consistencyPercentage: parseFloat(consistencyPercentage)
    };
}

// Main function
async function main() {
    console.log('🔍 REAL DATABASE CONNECTION TEST');
    console.log('=================================');

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.log('❌ DATABASE_URL not set');
        console.log('💡 Set DATABASE_URL environment variable first');
        return;
    }

    console.log(`🔗 DATABASE_URL: ${databaseUrl.substring(0, 20)}...${databaseUrl.substring(databaseUrl.length - 20)}`);

    // 1. Test kết nối
    const connectionSuccess = await testDatabaseConnection(databaseUrl);

    if (!connectionSuccess) {
        console.log('\n❌ Cannot proceed without database connection');
        return;
    }

    // 2. Đọc Prisma schema
    console.log('\n📖 Reading Prisma schema...');
    const prismaModels = readPrismaSchema();
    console.log(`✅ Found ${prismaModels.length} models in Prisma schema`);

    // 3. Lấy database schema
    console.log('\n📊 Getting database schema...');
    const dbSchema = await getDatabaseSchema(databaseUrl);

    if (!dbSchema) {
        console.log('❌ Could not get database schema');
        return;
    }

    console.log(`✅ Found ${dbSchema.tables.length} tables in database`);

    // 4. So sánh schema
    const comparison = compareSchemas(prismaModels, dbSchema);

    // 5. Kết luận
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('====================');

    if (comparison.consistencyPercentage >= 90) {
        console.log('✅ EXCELLENT: Schema consistency is very high');
        console.log('✅ Auto-migration will work perfectly');
        console.log('✅ Changing DATABASE_URL will be seamless');
    } else if (comparison.consistencyPercentage >= 70) {
        console.log('⚠️ GOOD: Schema consistency is acceptable');
        console.log('✅ Auto-migration will handle most cases');
        console.log('💡 Some manual intervention may be needed');
    } else {
        console.log('❌ NEEDS ATTENTION: Schema consistency is low');
        console.log('⚠️ Manual database setup may be required');
        console.log('💡 Consider running migrations manually first');
    }

    // 6. Khuyến nghị
    console.log('\n🚀 RECOMMENDATIONS:');
    console.log('===================');

    if (comparison.missingTables > 0) {
        console.log(`💡 ${comparison.missingTables} tables missing in database`);
        console.log('💡 Run auto-migration to create missing tables');
    }

    if (comparison.extraTables > 0) {
        console.log(`💡 ${comparison.extraTables} extra tables in database`);
        console.log('💡 These tables will be preserved during migration');
    }

    console.log('\n🔧 Next steps:');
    console.log('1. Deploy with auto-migration: npm run deploy:production');
    console.log('2. Monitor deployment logs for migration status');
    console.log('3. Test application functionality after deployment');

    // Tạo báo cáo
    const reportData = {
        timestamp: new Date().toISOString(),
        databaseUrl: databaseUrl.substring(0, 20) + '...' + databaseUrl.substring(databaseUrl.length - 20),
        prismaModels: prismaModels,
        databaseTables: dbSchema.tables,
        comparison: comparison,
        isReadyForProduction: comparison.consistencyPercentage >= 70
    };

    const reportFile = `database-connection-test-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Test report saved to: ${reportFile}`);
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, testDatabaseConnection, getDatabaseSchema, compareSchemas }; 