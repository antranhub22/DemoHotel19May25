#!/usr/bin/env node

/**
 * Schema Cleanup Migration Script
 * 
 * Applies the schema cleanup migration to remove deprecated columns
 * from hotel_profiles table
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = 'prisma/migrations/002_remove_deprecated_columns.sql';

console.log('🧹 [Schema Cleanup] Starting deprecated columns removal...');

// Check if migration file exists
if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE);
    process.exit(1);
}

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('💡 Please set DATABASE_URL in your .env file');
    process.exit(1);
}

try {
    console.log('📊 [Schema Cleanup] Running migration...');

    // Apply migration using psql (for PostgreSQL) or sqlite3 (for SQLite)
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
        console.log('🐘 [Schema Cleanup] Detected PostgreSQL database');
        execSync(`psql "${databaseUrl}" -f "${MIGRATION_FILE}"`, { stdio: 'inherit' });
    } else if (databaseUrl.includes('file:')) {
        console.log('📁 [Schema Cleanup] Detected SQLite database');
        const dbPath = databaseUrl.replace('file:', '');
        execSync(`sqlite3 "${dbPath}" < "${MIGRATION_FILE}"`, { stdio: 'inherit' });
    } else {
        console.error('❌ Unsupported database type in DATABASE_URL');
        process.exit(1);
    }

    console.log('✅ [Schema Cleanup] Migration completed successfully!');

    // Generate Prisma client to reflect schema changes
    console.log('🔄 [Schema Cleanup] Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('✅ [Schema Cleanup] Prisma client regenerated');

    // Show summary
    console.log('\n📋 [Schema Cleanup] Summary:');
    console.log('  ✅ Removed 8 deprecated columns from hotel_profiles');
    console.log('  ✅ Created backup table: hotel_profiles_backup_20250120');
    console.log('  ✅ Updated Prisma schema');
    console.log('  ✅ Regenerated Prisma client');
    console.log('\n🎯 [Schema Cleanup] Remaining active columns:');
    console.log('  - research_data (auto-generated hotel data)');
    console.log('  - assistant_config (Vapi configuration)');
    console.log('  - vapi_assistant_id (assistant ID)');
    console.log('  - services_config (hotel services)');
    console.log('  - knowledge_base (AI knowledge base)');
    console.log('  - system_prompt (AI prompts)');

} catch (error) {
    console.error('❌ [Schema Cleanup] Migration failed:', error.message);
    console.log('\n🔧 [Schema Cleanup] Troubleshooting:');
    console.log('  1. Check DATABASE_URL is correct');
    console.log('  2. Ensure database is accessible');
    console.log('  3. Check database permissions');
    console.log('  4. Review migration file syntax');
    process.exit(1);
}