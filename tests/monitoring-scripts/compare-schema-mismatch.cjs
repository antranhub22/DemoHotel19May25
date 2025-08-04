#!/usr/bin/env node

/**
 * Compare Prisma Schema vs Database Schema
 * Helps identify schema mismatches between Prisma and actual database
 */

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

// Initialize Prisma client
const prisma = new PrismaClient();

// Get database schema from Prisma
const prismaSchema = {
    // Define expected schema based on Prisma models
    id: 'uuid',
    hotel_name: 'varchar(255)',
    subdomain: 'varchar(50)',
    custom_domain: 'varchar(100)',
    subscription_plan: 'varchar(20)',
    subscription_status: 'varchar(20)',
    trial_ends_at: 'timestamp',
    created_at: 'timestamp',
    max_voices: 'integer',
    max_languages: 'integer',
    voice_cloning: 'boolean',
    multi_location: 'boolean',
    white_label: 'boolean',
    data_retention_days: 'integer',
    monthly_call_limit: 'integer',
    name: 'varchar(255)',
    updated_at: 'timestamp',
    is_active: 'boolean',
    settings: 'jsonb',
    tier: 'varchar(20)',
    max_calls: 'integer',
    max_users: 'integer',
    features: 'jsonb'
};

async function compareSchemas() {
    try {
        // Get database schema from PostgreSQL
        const pool = new Pool();
        const { rows } = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'tenants'
    `);

        // Convert database schema to comparable format
        const dbSchema = {};
        rows.forEach(row => {
            let type = row.data_type;
            if (row.character_maximum_length) {
                type = `${type}(${row.character_maximum_length})`;
            }
            dbSchema[row.column_name] = type;
        });

        console.log('🔍 Comparing Prisma Schema vs Database Schema');
        console.log('===========================================');

        // Compare schemas
        let mismatches = 0;
        let missing = 0;

        console.log('\n📋 Prisma Schema (Expected):');
        Object.entries(prismaSchema).forEach(([col, type]) => {
            console.log(`  ${col}: ${type}`);
        });

        console.log('\n📋 Database Schema (Actual):');
        Object.entries(dbSchema).forEach(([col, type]) => {
            console.log(`  ${col}: ${type}`);
        });

        console.log('\n🔍 Missing Columns:');
        Object.keys(prismaSchema).forEach(col => {
            if (!dbSchema[col]) {
                console.log(`  ❌ Missing in DB: ${col} (${prismaSchema[col]})`);
                missing++;
            }
        });

        // Check for missing columns in Prisma
        Object.keys(dbSchema).forEach(col => {
            if (!prismaSchema[col]) {
                console.log(`  ❌ Missing in Prisma: ${col} (${dbSchema[col]})`);
                missing++;
            }
        });

        console.log('\n🔍 Type Mismatches:');
        Object.keys(prismaSchema).forEach(col => {
            if (dbSchema[col] && prismaSchema[col] !== dbSchema[col]) {
                console.log(`  ❌ Type mismatch for ${col}:`);
                console.log(`    Prisma: ${prismaSchema[col]}`);
                console.log(`    DB: ${dbSchema[col]}`);
                mismatches++;
            }
        });

        // Check specific fields that often cause issues
        console.log('\n🔍 Common Issues Check:');
        const criticalFields = ['delivery_time', 'created_at', 'updated_at'];
        criticalFields.forEach(field => {
            const prismaType = prismaSchema[field];
            const dbType = dbSchema[field];

            console.log(`\n  Checking ${field}:`);
            console.log(`    Prisma: ${prismaType}`);
            console.log(`    DB: ${dbType}`);

            if (prismaType !== dbType) {
                console.log('    ⚠️ Type mismatch!');
            }
        });

        console.log('\n📊 Summary:');
        console.log(`  Missing Columns: ${missing}`);
        console.log(`  Type Mismatches: ${mismatches}`);

        if (missing > 0 || mismatches > 0) {
            console.log('\n⚠️ Action Required:');
            console.log('  1. Update Prisma schema to match database');
            console.log('  2. Run prisma generate');
            console.log('  3. Run prisma migrate dev');
            process.exit(1);
        } else {
            console.log('\n✅ Schemas match!');
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

compareSchemas();