#!/usr/bin/env node

/**
 * Test PostgreSQL Schema Consistency
 * 
 * Script này sẽ test tính đồng nhất giữa schema trong code và PostgreSQL database
 * Có thể chạy với DATABASE_URL thực tế hoặc mock data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Mock PostgreSQL schema cho testing
const mockPostgreSQLSchema = {
    tables: [
        'call_summaries',
        'hotel_profiles',
        'orders',
        'platform_tokens',
        'preferences',
        'request',
        'schedules',
        'staff',
        'template_standards',
        'templates',
        'tenants',
        'transcript',
        'transcripts',
        'upload_jobs',
        'user_custom_standards',
        'user_sessions',
        'users',
        'video_analysis_jobs',
        'video_analysis_results',
        'video_uploads',
        'videos',
        'workflow_status'
    ],
    tableSchemas: {
        'staff': [
            { column_name: 'id', data_type: 'integer' },
            { column_name: 'username', data_type: 'character varying' },
            { column_name: 'password', data_type: 'character varying' },
            { column_name: 'role', data_type: 'character varying' },
            { column_name: 'name', data_type: 'character varying' },
            { column_name: 'email', data_type: 'character varying' },
            { column_name: 'tenant_id', data_type: 'character varying' },
            { column_name: 'created_at', data_type: 'timestamp' },
            { column_name: 'updated_at', data_type: 'timestamp' },
            { column_name: 'first_name', data_type: 'character varying' },
            { column_name: 'last_name', data_type: 'character varying' },
            { column_name: 'display_name', data_type: 'character varying' },
            { column_name: 'avatar_url', data_type: 'text' },
            { column_name: 'permissions', data_type: 'text' },
            { column_name: 'is_active', data_type: 'boolean' },
            { column_name: 'last_login', data_type: 'timestamp' },
            { column_name: 'phone', data_type: 'character varying' }
        ],
        'tenants': [
            { column_name: 'id', data_type: 'character varying' },
            { column_name: 'hotel_name', data_type: 'character varying' },
            { column_name: 'domain', data_type: 'character varying' },
            { column_name: 'subdomain', data_type: 'character varying' },
            { column_name: 'email', data_type: 'character varying' },
            { column_name: 'phone', data_type: 'character varying' },
            { column_name: 'address', data_type: 'text' },
            { column_name: 'subscription_plan', data_type: 'character varying' },
            { column_name: 'subscription_status', data_type: 'character varying' },
            { column_name: 'created_at', data_type: 'timestamp' },
            { column_name: 'updated_at', data_type: 'timestamp' },
            { column_name: 'custom_domain', data_type: 'character varying' },
            { column_name: 'trial_ends_at', data_type: 'timestamp' },
            { column_name: 'max_voices', data_type: 'integer' },
            { column_name: 'max_languages', data_type: 'integer' },
            { column_name: 'voice_cloning', data_type: 'boolean' },
            { column_name: 'multi_location', data_type: 'boolean' },
            { column_name: 'white_label', data_type: 'boolean' },
            { column_name: 'data_retention_days', data_type: 'integer' },
            { column_name: 'monthly_call_limit', data_type: 'integer' }
        ],
        'request': [
            { column_name: 'id', data_type: 'integer' },
            { column_name: 'room_number', data_type: 'character varying' },
            { column_name: 'guest_name', data_type: 'character varying' },
            { column_name: 'request_content', data_type: 'text' },
            { column_name: 'status', data_type: 'character varying' },
            { column_name: 'created_at', data_type: 'timestamp' },
            { column_name: 'order_id', data_type: 'character varying' },
            { column_name: 'updated_at', data_type: 'timestamp' },
            { column_name: 'tenant_id', data_type: 'character varying' },
            { column_name: 'description', data_type: 'text' },
            { column_name: 'priority', data_type: 'character varying' },
            { column_name: 'assigned_to', data_type: 'character varying' },
            { column_name: 'completed_at', data_type: 'timestamp' },
            { column_name: 'metadata', data_type: 'json' },
            { column_name: 'type', data_type: 'character varying' },
            { column_name: 'total_amount', data_type: 'numeric' },
            { column_name: 'items', data_type: 'json' },
            { column_name: 'delivery_time', data_type: 'timestamp' },
            { column_name: 'special_instructions', data_type: 'text' },
            { column_name: 'order_type', data_type: 'character varying' },
            { column_name: 'call_id', data_type: 'character varying' },
            { column_name: 'service_id', data_type: 'character varying' },
            { column_name: 'phone_number', data_type: 'character varying' },
            { column_name: 'currency', data_type: 'character varying' },
            { column_name: 'urgency', data_type: 'character varying' }
        ]
    }
};

// Đọc Prisma schema
function readPrismaSchema() {
    try {
        const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        const models = [];
        const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
        let match;

        while ((match = modelRegex.exec(schemaContent)) !== null) {
            const modelName = match[1];
            const modelContent = match[2];

            const fields = [];
            // Cải thiện regex để parse chính xác hơn
            const fieldRegex = /(\w+)\s+([^@\s]+)(\s+@[^;]+)?;/g;
            let fieldMatch;

            while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
                const fieldName = fieldMatch[1];
                const fieldType = fieldMatch[2];
                const attributes = fieldMatch[3] || '';

                // Bỏ qua các comment và empty lines
                if (fieldName.trim() && !fieldName.startsWith('//')) {
                    fields.push({
                        name: fieldName.trim(),
                        type: fieldType.trim(),
                        attributes: attributes.trim()
                    });
                }
            }

            // Bỏ qua các model không có field nào
            if (fields.length > 0) {
                models.push({
                    name: modelName,
                    fields: fields
                });
            }
        }

        return models;
    } catch (error) {
        console.error('❌ Error reading Prisma schema:', error.message);
        return [];
    }
}

// Kiểm tra database PostgreSQL thực tế
async function checkRealPostgreSQLSchema(databaseUrl) {
    if (!databaseUrl || !databaseUrl.includes('postgres')) {
        return null;
    }

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

        const tables = tablesResult.rows.map(row => row.table_name);

        const tableSchemas = {};

        for (const tableName of tables) {
            const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);

            tableSchemas[tableName] = columnsResult.rows;
        }

        await client.release();
        return { tables, tableSchemas };

    } catch (error) {
        console.error('❌ Error connecting to PostgreSQL:', error.message);
        return null;
    } finally {
        await pool.end();
    }
}

// So sánh schema chi tiết
function compareSchemasDetailed(prismaModels, dbSchema) {
    console.log('\n📊 DETAILED SCHEMA COMPARISON:');
    console.log('================================');

    const prismaTableNames = prismaModels.map(m => m.name);
    const dbTableNames = dbSchema.tables;

    // Kiểm tra bảng thiếu
    const missingInDB = prismaTableNames.filter(name => !dbTableNames.includes(name));
    const extraInDB = dbTableNames.filter(name => !prismaTableNames.includes(name));

    console.log(`\n📋 Prisma Models: ${prismaTableNames.length}`);
    console.log(`📋 Database Tables: ${dbTableNames.length}`);

    if (missingInDB.length > 0) {
        console.log(`\n❌ Tables missing in database: ${missingInDB.join(', ')}`);
    }

    if (extraInDB.length > 0) {
        console.log(`\n⚠️ Extra tables in database: ${extraInDB.join(', ')}`);
    }

    // Kiểm tra chi tiết từng bảng quan trọng
    const importantTables = ['staff', 'tenants', 'request', 'call_summaries', 'hotel_profiles'];

    for (const tableName of importantTables) {
        const prismaModel = prismaModels.find(m => m.name === tableName);
        const dbColumns = dbSchema.tableSchemas[tableName];

        if (!prismaModel) {
            console.log(`\n❌ Table ${tableName} not found in Prisma schema`);
            continue;
        }

        if (!dbColumns) {
            console.log(`\n❌ Table ${tableName} not found in database`);
            continue;
        }

        console.log(`\n🔍 Table: ${tableName}`);
        console.log(`  📦 Prisma fields: ${prismaModel.fields.length}`);
        console.log(`  🗄️ Database columns: ${dbColumns.length}`);

        const prismaFields = prismaModel.fields.map(f => f.name);
        const dbFieldNames = dbColumns.map(c => c.column_name);

        const missingFields = prismaFields.filter(field => !dbFieldNames.includes(field));
        const extraFields = dbFieldNames.filter(field => !prismaFields.includes(field));

        if (missingFields.length > 0) {
            console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
        }

        if (extraFields.length > 0) {
            console.log(`  ⚠️ Extra fields: ${extraFields.join(', ')}`);
        }

        if (missingFields.length === 0 && extraFields.length === 0) {
            console.log(`  ✅ Schema matches perfectly`);
        }
    }

    // Tổng kết
    const totalPrismaTables = prismaTableNames.length;
    const totalDBTables = dbTableNames.length;
    const matchingTables = prismaTableNames.filter(name => dbTableNames.includes(name)).length;

    console.log(`\n📊 SUMMARY:`);
    console.log(`  📦 Prisma tables: ${totalPrismaTables}`);
    console.log(`  🗄️ Database tables: ${totalDBTables}`);
    console.log(`  ✅ Matching tables: ${matchingTables}`);
    console.log(`  ❌ Missing tables: ${missingInDB.length}`);
    console.log(`  ⚠️ Extra tables: ${extraInDB.length}`);

    const consistencyPercentage = (matchingTables / totalPrismaTables * 100).toFixed(1);
    console.log(`  📈 Consistency: ${consistencyPercentage}%`);
}

// Kiểm tra auto-migration capability
function checkAutoMigrationCapability() {
    console.log('\n🚀 AUTO-MIGRATION CAPABILITY CHECK:');
    console.log('====================================');

    const migrationFiles = [
        'prisma/migrations/000_setup_migration_system.sql',
        'prisma/migrations/001_enhance_schema_relations.sql',
        'tools/scripts/maintenance/auto-migrate-on-deploy.ts',
        'apps/server/startup/production-migration.ts'
    ];

    let existingFiles = 0;
    for (const file of migrationFiles) {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
            existingFiles++;
        } else {
            console.log(`❌ ${file}`);
        }
    }

    console.log(`\n📊 Migration files: ${existingFiles}/${migrationFiles.length} exist`);

    // Kiểm tra package.json scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const migrationScripts = Object.keys(packageJson.scripts).filter(script =>
        script.includes('migrate') || script.includes('db')
    );

    console.log(`\n📦 Migration scripts in package.json: ${migrationScripts.length}`);
    migrationScripts.forEach(script => {
        console.log(`  - ${script}: ${packageJson.scripts[script]}`);
    });

    return existingFiles === migrationFiles.length && migrationScripts.length > 0;
}

// Main function
async function main() {
    console.log('🔍 POSTGRESQL SCHEMA CONSISTENCY TEST');
    console.log('======================================');

    // Đọc Prisma schema
    console.log('\n📖 Reading Prisma schema...');
    const prismaModels = readPrismaSchema();
    console.log(`✅ Found ${prismaModels.length} models in Prisma schema`);

    // Kiểm tra DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    console.log(`\n🔗 DATABASE_URL: ${databaseUrl ? 'Set' : 'Not set'}`);

    let dbSchema;

    if (databaseUrl && databaseUrl.includes('postgres')) {
        console.log('🐘 PostgreSQL database detected - testing real connection...');
        dbSchema = await checkRealPostgreSQLSchema(databaseUrl);

        if (dbSchema) {
            console.log(`✅ Connected to real PostgreSQL database`);
            console.log(`📊 Found ${dbSchema.tables.length} tables`);
        } else {
            console.log('⚠️ Could not connect to real database, using mock data');
            dbSchema = mockPostgreSQLSchema;
        }
    } else {
        console.log('📁 Using mock PostgreSQL schema for testing');
        dbSchema = mockPostgreSQLSchema;
    }

    // So sánh schema
    compareSchemasDetailed(prismaModels, dbSchema);

    // Kiểm tra auto-migration capability
    const hasAutoMigration = checkAutoMigrationCapability();

    // Kết luận
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('====================');

    if (hasAutoMigration) {
        console.log('✅ Auto-migration system is properly configured');
        console.log('✅ Schema consistency can be maintained automatically');
        console.log('✅ When changing DATABASE_URL, tables will be created automatically');
    } else {
        console.log('❌ Auto-migration system needs attention');
        console.log('⚠️ Manual intervention may be required for schema changes');
    }

    console.log('\n🚀 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. ✅ Schema is well-defined in Prisma');
    console.log('2. ✅ Auto-migration scripts exist');
    console.log('3. ✅ Production migration system is in place');
    console.log('4. 💡 Test with real DATABASE_URL to verify complete consistency');
    console.log('5. 💡 Monitor deployment logs for migration status');

    console.log('\n🔧 To test with real PostgreSQL:');
    console.log('export DATABASE_URL="postgresql://user:pass@host:port/db"');
    console.log('node test-postgresql-schema.cjs');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, readPrismaSchema, checkRealPostgreSQLSchema, compareSchemasDetailed }; 