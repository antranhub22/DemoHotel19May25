#!/usr/bin/env node

/**
 * 🚨 EMERGENCY FIX: Create missing tenants table
 * 
 * This script fixes the "relation 'tenants' does not exist" error
 * by creating the tenants table if it doesn't exist.
 * 
 * Usage:
 *   node scripts/fix-tenants-table.cjs
 * 
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS)
 */

const { Client } = require('pg');
require('dotenv').config();

async function fixTenantsTable() {
    console.log('🔧 Emergency Fix: Creating missing tenants table...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Create tenants table if it doesn't exist
        const createTenantsSQL = `
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        hotel_name VARCHAR(200),
        subdomain VARCHAR(50) NOT NULL UNIQUE,
        custom_domain VARCHAR(100),
        subscription_plan VARCHAR(50) DEFAULT 'trial',
        subscription_status VARCHAR(50) DEFAULT 'active',
        trial_ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        max_voices INTEGER DEFAULT 5,
        max_languages INTEGER DEFAULT 4,
        voice_cloning BOOLEAN DEFAULT false,
        multi_location BOOLEAN DEFAULT false,
        white_label BOOLEAN DEFAULT false,
        data_retention_days INTEGER DEFAULT 90,
        monthly_call_limit INTEGER DEFAULT 1000,
        name VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        settings TEXT,
        tier VARCHAR(50) DEFAULT 'free',
        max_calls INTEGER DEFAULT 1000,
        max_users INTEGER DEFAULT 10,
        features TEXT
      );
    `;

        await client.query(createTenantsSQL);
        console.log('✅ Tenants table created successfully');

        // Check if table exists and has data
        const checkResult = await client.query('SELECT COUNT(*) FROM tenants');
        const count = parseInt(checkResult.rows[0].count);
        console.log(`📊 Tenants table now has ${count} records`);

        // If no tenants exist, create a default one
        if (count === 0) {
            console.log('🏨 Creating default tenant...');
            const defaultTenantSQL = `
        INSERT INTO tenants (
          id, 
          hotel_name, 
          subdomain, 
          subscription_plan, 
          subscription_status,
          is_active
        ) VALUES (
          'default',
          'Demo Hotel',
          'demo',
          'trial',
          'active',
          true
        ) ON CONFLICT (id) DO NOTHING;
      `;

            await client.query(defaultTenantSQL);
            console.log('✅ Default tenant created');
        }

        console.log('🎉 Tenants table fix completed successfully!');
        console.log('🚀 You can now restart your application');

    } catch (error) {
        console.error('❌ Error fixing tenants table:', error.message);

        if (error.message.includes('connect')) {
            console.error('💡 Make sure your DATABASE_URL is correct and database is running');
        }

        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run the fix
fixTenantsTable().catch(console.error);