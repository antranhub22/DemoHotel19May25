const axios = require('axios');

const API_BASE = 'https://minhonmuine.talk2go.online';

async function testProductionEnvironment() {
    console.log('🔍 TESTING PRODUCTION ENVIRONMENT VARIABLES');
    console.log('===========================================');

    // Test 1: Check if server is running
    console.log('\n1️⃣ Testing server availability...');
    try {
        const response = await axios.get(`${API_BASE}`, {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log(`✅ Server is running: ${response.status}`);
    } catch (error) {
        console.log(`❌ Server not accessible: ${error.message}`);
        return;
    }

    // Test 2: Check environment variables endpoint
    console.log('\n2️⃣ Testing environment variables...');
    try {
        const response = await axios.get(`${API_BASE}/api/debug/env`, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            console.log('✅ Environment variables endpoint accessible');
            console.log('📋 Environment info:', response.data);
        } else {
            console.log(`⚠️ Environment endpoint returned: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Environment endpoint failed: ${error.message}`);
    }

    // Test 3: Check database connection via API
    console.log('\n3️⃣ Testing database connection via API...');
    try {
        const response = await axios.get(`${API_BASE}/api/debug/db`, {
            timeout: 15000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            console.log('✅ Database connection successful');
            console.log('📋 Database info:', response.data);
        } else {
            console.log(`❌ Database connection failed: ${response.status}`);
            console.log('Error details:', response.data);
        }
    } catch (error) {
        console.log(`❌ Database test failed: ${error.message}`);
    }

    // Test 4: Check specific API endpoints
    console.log('\n4️⃣ Testing specific API endpoints...');
    const endpoints = [
        '/api/request',
        '/api/calls', 
        '/api/transcripts',
        '/api/health'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${API_BASE}${endpoint}`, {
                timeout: 10000,
                validateStatus: () => true
            });
            
            const status = response.status;
            const success = status >= 200 && status < 300;
            const icon = success ? '✅' : '❌';
            
            console.log(`${icon} ${endpoint}: ${status}`);
            
            if (!success && response.data) {
                console.log(`   Error: ${JSON.stringify(response.data).substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }

    // Test 5: Check if DATABASE_URL is properly configured
    console.log('\n5️⃣ Testing DATABASE_URL configuration...');
    try {
        const response = await axios.post(`${API_BASE}/api/debug/test-db`, {
            test: 'connection'
        }, {
            timeout: 15000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            console.log('✅ DATABASE_URL is properly configured');
            console.log('📋 Connection details:', response.data);
        } else {
            console.log(`❌ DATABASE_URL configuration failed: ${response.status}`);
            console.log('Error details:', response.data);
        }
    } catch (error) {
        console.log(`❌ DATABASE_URL test failed: ${error.message}`);
    }

    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('• If you see ❌ for database tests, DATABASE_URL is missing or incorrect');
    console.log('• If you see ❌ for API endpoints, there are server configuration issues');
    console.log('• Check Render dashboard for environment variables configuration');
}

// Run the test
testProductionEnvironment().catch(console.error); 