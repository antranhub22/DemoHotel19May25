const axios = require('axios');

const API_BASE = 'https://minhonmuine.talk2go.online';

async function testProductionDatabase() {
    console.log('🔍 TESTING PRODUCTION DATABASE CONNECTION');
    console.log('==========================================');

    // Test 1: Check if server is accessible
    console.log('\n1️⃣ Testing server accessibility...');
    try {
        const response = await axios.get(`${API_BASE}`, {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log(`✅ Server accessible: ${response.status}`);
    } catch (error) {
        console.log(`❌ Server not accessible: ${error.message}`);
        return;
    }

    // Test 2: Check environment variables
    console.log('\n2️⃣ Testing environment variables...');
    try {
        const response = await axios.get(`${API_BASE}/api/debug/env`, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            const data = response.data;
            console.log('✅ Environment check successful');
            console.log(`📊 DATABASE_URL: ${data.data.DATABASE_URL}`);
            console.log(`📏 Length: ${data.data.DATABASE_URL_LENGTH}`);
            console.log(`🔗 Prefix: ${data.data.DATABASE_URL_PREFIX}`);
        } else {
            console.log(`❌ Environment check failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Environment check error: ${error.message}`);
    }

    // Test 3: Test API endpoints
    console.log('\n3️⃣ Testing API endpoints...');
    const endpoints = [
        '/api/request',
        '/api/calls',
        '/api/transcripts'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${API_BASE}${endpoint}`, {
                timeout: 10000,
                validateStatus: () => true
            });
            console.log(`${endpoint}: ${response.status} - ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
            
            if (response.status === 500) {
                console.log(`   Error: ${response.data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`${endpoint}: ERROR - ${error.message}`);
        }
    }

    // Test 4: Check server logs (if possible)
    console.log('\n4️⃣ Checking server status...');
    try {
        const response = await axios.get(`${API_BASE}/test-direct`, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            console.log('✅ Direct endpoint working');
            console.log('📋 Server info:', response.data);
        } else {
            console.log(`❌ Direct endpoint failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Direct endpoint error: ${error.message}`);
    }

    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('• If DATABASE_URL is "SET" but APIs return 500, the database connection is failing');
    console.log('• If DATABASE_URL is "NOT SET", you need to configure it in Render.com');
    console.log('• Check Render.com dashboard > Environment Variables > DATABASE_URL');
    console.log('• The DATABASE_URL should look like: postgresql://username:password@host:port/database');
}

// Run the test
testProductionDatabase().catch(console.error); 