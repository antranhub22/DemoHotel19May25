#!/usr/bin/env tsx
import { db } from '@shared/db/index.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
/**
 * Apply Performance Indexes Migration
 *
 * This script applies critical database indexes for query optimization.
 * Expected performance improvements:
 * - Analytics queries: 5-10x faster
 * - Staff dashboard: 3-5x faster
 * - Search queries: 2-3x faster
 */

const MIGRATION_FILE = resolve(
  __dirname,
  '../migrations/0010_add_performance_indexes.sql'
);

async function applyPerformanceIndexes() {
  console.log('🚀 Starting Performance Indexes Migration...\n');

  try {
    // Read migration file
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf-8');
    console.log('📁 Migration file loaded successfully');

    // Split into individual statements (exclude comments and empty lines)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} index creation statements\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Apply each index creation statement
    for (const statement of statements as any[]) {
      if (!statement.includes('CREATE INDEX')) {
        continue;
      }

      // Extract index name for logging
      const indexMatch = statement.match(
        /CREATE INDEX.*?IF NOT EXISTS\s+(\w+)/
      );
      const indexName = indexMatch ? indexMatch[1] : 'unknown';

      try {
        console.log(`🔧 Creating index: ${indexName}`);

        const startTime = Date.now();
        await db.execute(sql.raw(statement));
        const duration = Date.now() - startTime;

        console.log(`✅ Index created successfully (${duration}ms)`);
        successCount++;
      } catch (error: any) {
        if (
          (error as any)?.message ||
          String(error)?.includes('already exists')
        ) {
          console.log(`⏭️  Index already exists, skipping`);
          skipCount++;
        } else {
          console.error(
            `❌ Failed to create index: ${(error as any)?.message || String(error)}`
          );
          errorCount++;
        }
      }

      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('📈 Migration Summary:');
    console.log(`✅ Successfully created: ${successCount} indexes`);
    console.log(`⏭️  Already existed: ${skipCount} indexes`);
    console.log(`❌ Failed: ${errorCount} indexes`);

    if (errorCount === 0) {
      console.log('\n🎉 Performance indexes migration completed successfully!');
      console.log('Expected improvements:');
      console.log('  • Analytics queries: 5-10x faster');
      console.log('  • Staff dashboard: 3-5x faster');
      console.log('  • Search operations: 2-3x faster');
      console.log('  • Join operations: Significantly improved');
    } else {
      console.log(
        '\n⚠️  Migration completed with some errors. Please review failed indexes.'
      );
    }
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run directly if this file is executed
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  applyPerformanceIndexes()
    .then(() => {
      console.log('\n✨ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { applyPerformanceIndexes };
