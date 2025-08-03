#!/usr/bin/env node

/**
 * Test Fixed Schema
 * Verify that 42703 error is resolved
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required!');
    process.exit(1);
}

async function testFixedSchema() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🧪 Testing Fixed Schema');
        console.log('========================');

        // Test the exact data structure that was failing
        const testData = {
            tenant_id: 'mi-nhon-hotel',
            call_id: 'test-call-fix-123',
            room_number: '10',
            order_id: 'REQ-test-fix-123',
            request_content: 'Test service request after fix',
            status: 'Đã ghi nhận',
            guest_name: 'Test Guest Fixed',
            phone_number: null,
            total_amount: 150.50, // numeric type
            currency: 'VND',
            special_instructions: 'Test instructions after fix',
            order_type: 'service-request',
            delivery_time: new Date('2025-08-02 21:00:00'), // timestamp type
            items: { test: 'data', amount: 150.50 }, // jsonb object
            priority: 'medium',
            urgency: 'normal',
            created_at: new Date(),
            updated_at: new Date()
        };

        console.log('\n📋 Test data structure:');
        Object.entries(testData).forEach(([key, value]) => {
            console.log(`  - ${key}: ${typeof value} = ${JSON.stringify(value)}`);
        });

        console.log('\n🚀 Testing insert with fixed schema...');

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
        ) RETURNING id, room_number, guest_name, total_amount, delivery_time
      `, [
                testData.tenant_id, testData.call_id, testData.room_number,
                testData.order_id, testData.request_content, testData.status,
                testData.guest_name, testData.phone_number, testData.total_amount,
                testData.currency, testData.special_instructions, testData.order_type,
                testData.delivery_time, JSON.stringify(testData.items), testData.priority,
                testData.urgency, testData.created_at, testData.updated_at
            ]);

            console.log('✅ Insert test successful!');
            console.log('📊 Inserted record:');
            console.log(`  - ID: ${insertResult.rows[0].id}`);
            console.log(`  - Room: ${insertResult.rows[0].room_number}`);
            console.log(`  - Guest: ${insertResult.rows[0].guest_name}`);
            console.log(`  - Amount: ${insertResult.rows[0].total_amount}`);
            console.log(`  - Delivery: ${insertResult.rows[0].delivery_time}`);

            // Clean up test data
            await pool.query('DELETE FROM request WHERE id = $1', [insertResult.rows[0].id]);
            console.log('🧹 Test data cleaned up');

            console.log('\n🎉 Schema fix verification completed!');
            console.log('✅ No 42703 errors detected');
            console.log('✅ All data types match database schema');
            console.log('✅ OpenAI summary generation should now work properly');

        } catch (insertError) {
            console.log('❌ Insert test failed:', insertError.message);
            console.log('📋 Error code:', insertError.code);
            console.log('📋 Error detail:', insertError.detail);

            if (insertError.code === '42703') {
                console.log('\n⚠️ Still getting 42703 error - schema mismatch persists');
            } else {
                console.log('\n⚠️ Different error - check data types and constraints');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await pool.end();
    }
}

testFixedSchema(); 