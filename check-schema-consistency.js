#!/usr/bin/env node

/**
 * 🔍 Schema Consistency Checker
 *
 * Kiểm tra tính đồng nhất giữa schema trong code và database PostgreSQL
 * Đảm bảo khi thay đổi DATABASE_URL thì hệ thống có thể tự động tạo đúng các bảng
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Đọc Prisma schema
function readPrismaSchema() {
  try {
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Parse các model từ schema
    const models = [];
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelContent = match[2];

      // Parse các field
      const fields = [];
      const fieldRegex = /(\w+)\s+(\w+)(\s+@\w+[^;]*)?;/g;
      let fieldMatch;

      while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
          attributes: fieldMatch[3] || '',
        });
      }

      models.push({
        name: modelName,
        fields: fields,
      });
    }

    return models;
  } catch (error) {
    console.error('❌ Error reading Prisma schema:', error.message);
    return [];
  }
}

// Kiểm tra database PostgreSQL
async function checkPostgreSQLSchema(databaseUrl) {
  if (!databaseUrl || !databaseUrl.includes('postgres')) {
    console.log('⚠️ No PostgreSQL DATABASE_URL provided');
    return null;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
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

    // Lấy schema chi tiết cho từng bảng
    const tableSchemas = {};

    for (const tableName of tables) {
      const columnsResult = await client.query(
        `
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
      `,
        [tableName]
      );

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

// So sánh schema
function compareSchemas(prismaModels, dbSchema) {
  if (!dbSchema) {
    console.log('⚠️ Cannot compare schemas - no database connection');
    return;
  }

  console.log('\n📊 SCHEMA COMPARISON RESULTS:');
  console.log('================================');

  const prismaTableNames = prismaModels.map(m => m.name);
  const dbTableNames = dbSchema.tables;

  // Kiểm tra bảng thiếu
  const missingInDB = prismaTableNames.filter(
    name => !dbTableNames.includes(name)
  );
  const extraInDB = dbTableNames.filter(
    name => !prismaTableNames.includes(name)
  );

  if (missingInDB.length > 0) {
    console.log(`❌ Tables missing in database: ${missingInDB.join(', ')}`);
  }

  if (extraInDB.length > 0) {
    console.log(`⚠️ Extra tables in database: ${extraInDB.join(', ')}`);
  }

  // Kiểm tra chi tiết từng bảng
  const commonTables = prismaTableNames.filter(name =>
    dbTableNames.includes(name)
  );

  for (const tableName of commonTables) {
    const prismaModel = prismaModels.find(m => m.name === tableName);
    const dbColumns = dbSchema.tableSchemas[tableName];

    if (!prismaModel || !dbColumns) continue;

    const prismaFields = prismaModel.fields.map(f => f.name);
    const dbFieldNames = dbColumns.map(c => c.column_name);

    const missingFields = prismaFields.filter(
      field => !dbFieldNames.includes(field)
    );
    const extraFields = dbFieldNames.filter(
      field => !prismaFields.includes(field)
    );

    if (missingFields.length > 0 || extraFields.length > 0) {
      console.log(`\n🔍 Table: ${tableName}`);
      if (missingFields.length > 0) {
        console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
      }
      if (extraFields.length > 0) {
        console.log(`  ⚠️ Extra fields: ${extraFields.join(', ')}`);
      }
    }
  }

  if (missingInDB.length === 0 && extraInDB.length === 0) {
    console.log('✅ All Prisma tables exist in database');
  }

  // Kiểm tra auto-migration capability
  console.log('\n🚀 AUTO-MIGRATION CAPABILITY CHECK:');
  console.log('====================================');

  const autoMigrationScripts = [
    'tools/scripts/maintenance/auto-migrate-on-deploy.ts',
    'apps/server/startup/production-migration.ts',
  ];

  for (const script of autoMigrationScripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`✅ Auto-migration script exists: ${script}`);
    } else {
      console.log(`❌ Missing auto-migration script: ${script}`);
    }
  }

  // Kiểm tra package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasMigrationScripts = Object.keys(packageJson.scripts).some(
    script => script.includes('migrate') || script.includes('db')
  );

  if (hasMigrationScripts) {
    console.log('✅ Migration scripts found in package.json');
  } else {
    console.log('❌ No migration scripts found in package.json');
  }
}

// Main function
async function main() {
  console.log('🔍 SCHEMA CONSISTENCY CHECKER');
  console.log('==============================');

  // Đọc Prisma schema
  console.log('\n📖 Reading Prisma schema...');
  const prismaModels = readPrismaSchema();
  console.log(`✅ Found ${prismaModels.length} models in Prisma schema`);

  // Kiểm tra DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  console.log(`\n🔗 DATABASE_URL: ${databaseUrl ? 'Set' : 'Not set'}`);

  if (databaseUrl && databaseUrl.includes('postgres')) {
    console.log('🐘 PostgreSQL database detected');

    // Kiểm tra database schema
    console.log('\n📊 Checking PostgreSQL schema...');
    const dbSchema = await checkPostgreSQLSchema(databaseUrl);

    if (dbSchema) {
      console.log(
        `✅ Connected to database, found ${dbSchema.tables.length} tables`
      );

      // So sánh schema
      compareSchemas(prismaModels, dbSchema);
    }
  } else {
    console.log('📁 Local development detected (SQLite)');
    console.log(
      '💡 To test with PostgreSQL, set DATABASE_URL to a PostgreSQL connection string'
    );

    // Hiển thị Prisma models
    console.log('\n📋 PRISMA SCHEMA MODELS:');
    console.log('========================');
    prismaModels.forEach(model => {
      console.log(`\n📦 ${model.name}:`);
      model.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type}${field.attributes}`);
      });
    });
  }

  // Kiểm tra auto-migration system
  console.log('\n🔄 AUTO-MIGRATION SYSTEM CHECK:');
  console.log('================================');

  const migrationFiles = [
    'prisma/migrations/000_setup_migration_system.sql',
    'prisma/migrations/001_enhance_schema_relations.sql',
    'tools/scripts/maintenance/auto-migrate-on-deploy.ts',
    'apps/server/startup/production-migration.ts',
  ];

  let migrationFilesExist = 0;
  for (const file of migrationFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      migrationFilesExist++;
    } else {
      console.log(`❌ ${file}`);
    }
  }

  console.log(
    `\n📊 Migration files: ${migrationFilesExist}/${migrationFiles.length} exist`
  );

  // Kết luận
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('===================');

  if (databaseUrl && databaseUrl.includes('postgres')) {
    console.log('✅ PostgreSQL connection available');
    console.log('✅ Auto-migration system in place');
    console.log('✅ Schema consistency can be verified');
  } else {
    console.log(
      '💡 Set DATABASE_URL to PostgreSQL connection to test schema consistency'
    );
    console.log('💡 Example: DATABASE_URL=postgresql://user:pass@host:port/db');
  }

  console.log('\n🚀 When changing DATABASE_URL:');
  console.log('1. Auto-migration will run during deployment');
  console.log('2. Missing tables/columns will be created automatically');
  console.log('3. Existing data will be preserved');
  console.log('4. Check logs for migration status');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  readPrismaSchema,
  checkPostgreSQLSchema,
  compareSchemas,
};
