#!/usr/bin/env node

/**
 * Dashboard Database Indexes Installer - ZERO RISK
 * Safely applies performance indexes for dashboard queries
 */

const fs = require('fs');
const path = require('path');

// Database connection helpers
let db;

async function initDatabase() {
  try {
    // Try to use existing database connection
    if (process.env.DATABASE_URL) {
      // PostgreSQL connection
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      console.log('🔗 Connecting to PostgreSQL database...');
      await pool.query('SELECT 1');
      console.log('✅ PostgreSQL connection successful');
      return pool;
    } else {
      // SQLite fallback
      console.log('📁 Using SQLite database...');
      const Database = require('better-sqlite3');
      const dbPath = path.join(__dirname, '../apps/dev.db');
      
      if (!fs.existsSync(dbPath)) {
        throw new Error(`SQLite database not found at ${dbPath}`);
      }
      
      const sqliteDb = new Database(dbPath);
      console.log('✅ SQLite connection successful');
      
      // Wrapper to make SQLite compatible with async/await
      return {
        query: async (sql) => {
          try {
            if (sql.includes('CONCURRENTLY')) {
              // SQLite doesn't support CONCURRENTLY, remove it
              sql = sql.replace(/CONCURRENTLY/g, '');
            }
            if (sql.includes('IF NOT EXISTS')) {
              // Split multiple statements for SQLite
              const statements = sql.split(';').filter(s => s.trim());
              for (const statement of statements) {
                if (statement.trim()) {
                  sqliteDb.exec(statement.trim());
                }
              }
              return { rows: [] };
            } else {
              const result = sqliteDb.prepare(sql).all();
              return { rows: result };
            }
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`⚠️ Index already exists, skipping: ${error.message}`);
              return { rows: [] };
            }
            throw error;
          }
        },
        end: () => sqliteDb.close()
      };
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function applyIndexes() {
  console.log('🚀 Dashboard Indexes Installer Starting...\n');

  try {
    // Initialize database connection
    db = await initDatabase();

    // Read SQL file
    const sqlFile = path.join(__dirname, '../database-optimizations/add-dashboard-indexes.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('📖 SQL file loaded successfully\n');

    // Extract CREATE INDEX statements
    const indexStatements = sqlContent
      .split('\n')
      .filter(line => line.trim().startsWith('CREATE INDEX CONCURRENTLY'))
      .map(line => line.trim().replace(/;$/, ''));

    if (indexStatements.length === 0) {
      console.log('⚠️ No index statements found in SQL file');
      return;
    }

    console.log(`📊 Found ${indexStatements.length} index statements to execute\n`);

    // Apply each index with error handling
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < indexStatements.length; i++) {
      const statement = indexStatements[i];
      const indexName = statement.match(/idx_[a-z_]+/)?.[0] || `index_${i + 1}`;

      try {
        console.log(`⏳ Creating index: ${indexName}...`);
        
        await db.query(statement);
        
        console.log(`✅ Created: ${indexName}`);
        results.success++;
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Skipped (already exists): ${indexName}`);
          results.skipped++;
        } else {
          console.error(`❌ Failed: ${indexName} - ${error.message}`);
          results.failed++;
          results.errors.push({ index: indexName, error: error.message });
        }
      }
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Successfully created: ${results.success} indexes`);
    console.log(`⚠️ Skipped (existing): ${results.skipped} indexes`);
    console.log(`❌ Failed: ${results.failed} indexes`);

    if (results.errors.length > 0) {
      console.log('\n⚠️ ERRORS:');
      results.errors.forEach(({ index, error }) => {
        console.log(`  - ${index}: ${error}`);
      });
    }

    // Verify indexes
    await verifyIndexes();

    console.log('\n🎉 Dashboard indexes installation completed!');

  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (db && db.end) {
      await db.end();
    }
  }
}

async function verifyIndexes() {
  try {
    console.log('\n🔍 Verifying indexes...');

    // Check if indexes exist
    const verifyQuery = process.env.DATABASE_URL 
      ? `
        SELECT indexname, tablename
        FROM pg_indexes 
        WHERE indexname LIKE 'idx_%optimized%' 
           OR indexname LIKE 'idx_%dashboard%'
           OR indexname LIKE 'idx_%today%'
        ORDER BY tablename, indexname;
      `
      : `
        SELECT name as indexname, tbl_name as tablename
        FROM sqlite_master 
        WHERE type = 'index' 
          AND (name LIKE 'idx_%optimized%' 
               OR name LIKE 'idx_%dashboard%'
               OR name LIKE 'idx_%today%')
        ORDER BY tbl_name, name;
      `;

    const result = await db.query(verifyQuery);
    const indexes = result.rows || [];

    if (indexes.length > 0) {
      console.log('✅ Verified indexes:');
      indexes.forEach(idx => {
        console.log(`  - ${idx.indexname} on ${idx.tablename}`);
      });
    } else {
      console.log('⚠️ No dashboard indexes found');
    }

  } catch (error) {
    console.warn('⚠️ Index verification failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  applyIndexes().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { applyIndexes, verifyIndexes };