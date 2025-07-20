#!/usr/bin/env tsx

import { Pool } from 'pg';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Auto-Migration Script for Production Deployment
 * 
 * This script automatically detects and fixes schema mismatches
 * during deployment process. It's safe to run multiple times.
 */

interface MigrationResult {
  success: boolean;
  migrationsRun: string[];
  error?: string;
}

async function autoMigrateOnDeploy(): Promise<MigrationResult> {
  console.log('🔄 Auto-Migration: Checking database schema...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not found - skipping migration (probably local dev)');
    return { success: true, migrationsRun: [] };
  }

  console.log('📍 Production database detected - running auto-migration...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const migrationsRun: string[] = [];

  try {
    const client = await pool.connect();
    
    // 1. Check if staff table has required columns
    console.log('🔍 Checking staff table schema...');
    const staffColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'staff'
    `);
    
    const existingColumns = staffColumns.rows.map(row => row.column_name);
    const requiredColumns = ['first_name', 'last_name', 'display_name', 'phone', 'email', 'permissions', 'is_active'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`🚨 Missing columns detected: ${missingColumns.join(', ')}`);
      console.log('🔧 Running staff table migration...');
      
      const migrationSQL = `
        -- Add missing staff columns
        ALTER TABLE staff 
        ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(255),
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS permissions TEXT DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

        -- Update existing records
        UPDATE staff 
        SET 
          first_name = COALESCE(first_name, SPLIT_PART(username, '.', 1)),
          last_name = COALESCE(last_name, SPLIT_PART(username, '.', 2)),
          display_name = COALESCE(display_name, username),
          permissions = COALESCE(permissions, '[]'),
          is_active = COALESCE(is_active, true)
        WHERE first_name IS NULL OR last_name IS NULL OR display_name IS NULL;
      `;
      
      await client.query('BEGIN');
      try {
        await client.query(migrationSQL);
        await client.query('COMMIT');
        migrationsRun.push('staff_table_columns');
        console.log('✅ Staff table migration completed');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } else {
      console.log('✅ Staff table schema is up to date');
    }

    // 2. Check tenants table
    console.log('🔍 Checking tenants table schema...');
    const tenantsColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
    `);
    
    const existingTenantColumns = tenantsColumns.rows.map(row => row.column_name);
    const requiredTenantColumns = ['hotel_name', 'subscription_plan', 'subscription_status'];
    const missingTenantColumns = requiredTenantColumns.filter(col => !existingTenantColumns.includes(col));
    
    if (missingTenantColumns.length > 0) {
      console.log(`🚨 Missing tenant columns: ${missingTenantColumns.join(', ')}`);
      console.log('🔧 Running tenants table migration...');
      
      const tenantMigrationSQL = `
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial',
        ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS max_voices INTEGER DEFAULT 5,
        ADD COLUMN IF NOT EXISTS max_languages INTEGER DEFAULT 4,
        ADD COLUMN IF NOT EXISTS voice_cloning BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS multi_location BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS white_label BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 90,
        ADD COLUMN IF NOT EXISTS monthly_call_limit INTEGER DEFAULT 1000;

        -- Update hotel_name from existing name column if available
        UPDATE tenants 
        SET hotel_name = COALESCE(hotel_name, name, 'Hotel')
        WHERE hotel_name IS NULL;
      `;
      
      await client.query('BEGIN');
      try {
        await client.query(tenantMigrationSQL);
        await client.query('COMMIT');
        migrationsRun.push('tenants_table_columns');
        console.log('✅ Tenants table migration completed');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } else {
      console.log('✅ Tenants table schema is up to date');
    }

    // 3. Ensure indexes exist (only for existing tables)
    console.log('🔍 Checking database indexes...');
    
    // Get list of existing tables
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = existingTables.rows.map(row => row.table_name);
    const indexQueries = [];
    
    // Always create staff indexes (we know staff table exists)
    indexQueries.push('CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id)');
    indexQueries.push('CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username)');
    indexQueries.push('CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email)');
    
    // Only create indexes for tables that exist
    if (tableNames.includes('call')) {
      indexQueries.push('CREATE INDEX IF NOT EXISTS idx_call_tenant_id ON call(tenant_id)');
    }
    if (tableNames.includes('request')) {
      indexQueries.push('CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id)');
    }
    
    // Execute all index creation queries
    for (const query of indexQueries) {
      try {
        await client.query(query);
      } catch (error) {
        console.warn(`⚠️ Failed to create index: ${error.message}`);
      }
    }
    
    console.log('✅ Database indexes ensured');
    
    client.release();
    
    if (migrationsRun.length > 0) {
      console.log('🎉 Auto-migration completed successfully!');
      console.log(`📝 Migrations run: ${migrationsRun.join(', ')}`);
    } else {
      console.log('✅ Database schema is up to date - no migrations needed');
    }
    
    return { success: true, migrationsRun };
    
  } catch (error) {
    console.error('❌ Auto-migration failed:', error);
    return { 
      success: false, 
      migrationsRun,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await pool.end();
  }
}

// Export for use in other scripts
export { autoMigrateOnDeploy };

// Run if called directly (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this file is being run directly
const isMainModule = process.argv[1] === __filename || process.argv[1]?.endsWith('auto-migrate-on-deploy.ts');

if (isMainModule) {
  autoMigrateOnDeploy()
    .then(result => {
      if (!result.success) {
        console.error('Migration failed, but continuing deployment...');
        // Don't exit with error code to allow deployment to continue
      }
    })
    .catch(error => {
      console.error('Migration script error:', error);
      // Don't exit with error code to allow deployment to continue
    });
} 