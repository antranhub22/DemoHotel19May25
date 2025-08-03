#!/usr/bin/env node

/**
 * Compare Drizzle Schema vs Database Schema
 * Find mismatches that cause 42703 errors
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required!');
    process.exit(1);
}

// Drizzle schema definition (from packages/shared/db/schema.ts)
const drizzleSchema = {
    id: 'serial',
    tenant_id: 'text',
    call_id: 'text',
    room_number: 'varchar(10)',
    order_id: 'varchar(50)',
    request_content: 'varchar(1000)',
    status: 'varchar(50)',
    created_at: 'timestamp',
    updated_at: 'timestamp',
    description: 'varchar(500)',
    priority: 'varchar(20)',
    assigned_to: 'varchar(100)',
    guest_name: 'varchar(100)',
    phone_number: 'varchar(20)',
    total_amount: 'real',
    currency: 'varchar(10)',
    estimated_completion: 'timestamp',
    actual_completion: 'timestamp',
    special_instructions: 'varchar(500)',
    urgency: 'varchar(20)',
    order_type: 'varchar(50)',
    delivery_time: 'varchar(100)', // ⚠️ Drizzle: varchar, DB: timestamp
    items: 'text'
};

async function compareSchemas() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Comparing Drizzle Schema vs Database Schema');
        console.log('==============================================');

        // Get actual database schema
        const dbSchemaResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY ordinal_position;
    `);

        const dbSchema = {};
        dbSchemaResult.rows.forEach(row => {
            let type = row.data_type;
            if (row.character_maximum_length) {
                type += `(${row.character_maximum_length})`;
            }
            dbSchema[row.column_name] = type;
        });

        console.log('\n📋 Database Schema (Actual):');
        Object.entries(dbSchema).forEach(([col, type]) => {
            console.log(`  - ${col}: ${type}`);
        });

        console.log('\n📋 Drizzle Schema (Expected):');
        Object.entries(drizzleSchema).forEach(([col, type]) => {
            console.log(`  - ${col}: ${type}`);
        });

        console.log('\n🔍 Mismatches Found:');
        let hasMismatches = false;

        // Check for missing columns in database
        Object.keys(drizzleSchema).forEach(col => {
            if (!dbSchema[col]) {
                console.log(`  ❌ Missing in DB: ${col} (${drizzleSchema[col]})`);
                hasMismatches = true;
            }
        });

        // Check for missing columns in Drizzle
        Object.keys(dbSchema).forEach(col => {
            if (!drizzleSchema[col]) {
                console.log(`  ❌ Missing in Drizzle: ${col} (${dbSchema[col]})`);
                hasMismatches = true;
            }
        });

        // Check for type mismatches
        Object.keys(drizzleSchema).forEach(col => {
            if (dbSchema[col] && drizzleSchema[col] !== dbSchema[col]) {
                console.log(`  ⚠️ Type mismatch for ${col}:`);
                console.log(`    Drizzle: ${drizzleSchema[col]}`);
                console.log(`    Database: ${dbSchema[col]}`);
                hasMismatches = true;
            }
        });

        if (!hasMismatches) {
            console.log('  ✅ No mismatches found!');
        }

        // Test specific problematic fields
        console.log('\n🧪 Testing specific fields:');
        const testFields = ['delivery_time', 'items', 'total_amount'];

        for (const field of testFields) {
            const drizzleType = drizzleSchema[field];
            const dbType = dbSchema[field];

            console.log(`  ${field}:`);
            console.log(`    Drizzle: ${drizzleType}`);
            console.log(`    Database: ${dbType}`);

            if (drizzleType !== dbType) {
                console.log(`    ⚠️ MISMATCH - This could cause 42703 errors!`);
            } else {
                console.log(`    ✅ Match`);
            }
        }

        console.log('\n💡 Recommendations:');
        if (hasMismatches) {
            console.log('  1. Update Drizzle schema to match database');
            console.log('  2. Or run migration to update database schema');
            console.log('  3. Check for data type conversions in code');
        } else {
            console.log('  ✅ Schemas match - 42703 error might be from other causes');
        }

    } catch (error) {
        console.error('❌ Comparison failed:', error.message);
    } finally {
        await pool.end();
    }
}

compareSchemas(); 