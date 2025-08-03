#!/usr/bin/env node

/**
 * Debug Database Schema
 * Detailed analysis of request table structure
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required!');
    process.exit(1);
}

async function debugDatabaseSchema() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Debugging Database Schema');
        console.log('============================');

        // 1. Check all columns in request table
        console.log('\n📋 1. All columns in request table:');
        const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'request' 
      ORDER BY ordinal_position;
    `);

        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        // 2. Check specific columns that might be missing
        console.log('\n📋 2. Checking specific columns:');
        const specificColumns = [
            'service_id', 'guest_name', 'phone_number', 'total_amount',
            'currency', 'special_instructions', 'urgency', 'order_type',
            'delivery_time', 'items', 'call_id', 'tenant_id'
        ];

        for (const col of specificColumns) {
            const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'request' AND column_name = $1
      `, [col]);

            if (result.rows.length > 0) {
                console.log(`  ✅ ${col}: ${result.rows[0].data_type}`);
            } else {
                console.log(`  ❌ ${col}: MISSING`);
            }
        }

        // 3. Test the exact insert that's failing
        console.log('\n📋 3. Testing insert operation:');
        const testData = {
            tenant_id: 'mi-nhon-hotel',
            call_id: 'test-call-123',
            room_number: '10',
            order_id: 'REQ-test-123',
            request_content: 'Test service request',
            status: 'Đã ghi nhận',
            guest_name: 'Test Guest',
            phone_number: null,
            total_amount: 100.0,
            currency: 'VND',
            special_instructions: 'Test instructions',
            order_type: 'service-request',
            delivery_time: '2025-08-02 20:00:00',
            items: JSON.stringify({ test: 'data' }),
            priority: 'medium',
            urgency: 'normal',
            created_at: new Date(),
            updated_at: new Date()
        };

        try {
            const insertResult = await pool.query(`
        INSERT INTO request (
          tenant_id, call_id, room_number, order_id, request_content, 
          status, guest_name, phone_number, total_amount, currency,
          special_instructions, order_type, delivery_time, items,
          priority, urgency, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING id
      `, [
                testData.tenant_id, testData.call_id, testData.room_number,
                testData.order_id, testData.request_content, testData.status,
                testData.guest_name, testData.phone_number, testData.total_amount,
                testData.currency, testData.special_instructions, testData.order_type,
                testData.delivery_time, testData.items, testData.priority,
                testData.urgency, testData.created_at, testData.updated_at
            ]);

            console.log('  ✅ Insert test successful! ID:', insertResult.rows[0].id);

            // Clean up test data
            await pool.query('DELETE FROM request WHERE id = $1', [insertResult.rows[0].id]);
            console.log('  🧹 Test data cleaned up');

        } catch (insertError) {
            console.log('  ❌ Insert test failed:', insertError.message);
            console.log('  📋 Error code:', insertError.code);
            console.log('  📋 Error detail:', insertError.detail);
        }

        // 4. Check table constraints
        console.log('\n📋 4. Table constraints:');
        const constraintsResult = await pool.query(`
      SELECT constraint_name, constraint_type, column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'request'
      ORDER BY tc.constraint_name;
    `);

        constraintsResult.rows.forEach(row => {
            console.log(`  - ${row.constraint_name}: ${row.constraint_type} on ${row.column_name}`);
        });

        console.log('\n🎉 Database schema analysis completed!');

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    } finally {
        await pool.end();
    }
}

debugDatabaseSchema(); 