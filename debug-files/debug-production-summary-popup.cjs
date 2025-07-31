const axios = require('axios');

const API_BASE = 'https://minhonmuine.talk2go.online';

async function debugProductionSummaryPopup() {
    console.log('🔍 DEBUGGING PRODUCTION SUMMARY POPUP ISSUES');
    console.log('=============================================');

    // Test 1: Check if the application is accessible
    console.log('\n1️⃣ Testing application accessibility...');
    try {
        const response = await axios.get(`${API_BASE}`, {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log(`✅ Application accessible: ${response.status}`);
    } catch (error) {
        console.log(`❌ Application not accessible: ${error.message}`);
        return;
    }

    // Test 2: Check API endpoints
    console.log('\n2️⃣ Testing API endpoints...');
    const endpoints = [
        '/api/health',
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
        } catch (error) {
            console.log(`${endpoint}: ERROR - ${error.message}`);
        }
    }

    // Test 3: Check database connection via API
    console.log('\n3️⃣ Testing database connection...');
    try {
        const response = await axios.post(`${API_BASE}/api/request`, {
            serviceType: 'test',
            requestText: 'Debug test request',
            roomNumber: '999',
            guestName: 'Debug User',
            priority: 'low'
        }, {
            timeout: 15000,
            validateStatus: () => true
        });
        console.log(`Database test: ${response.status} - ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
        if (response.data.error) {
            console.log(`Error details: ${response.data.error}`);
        }
    } catch (error) {
        console.log(`Database test failed: ${error.message}`);
    }

    // Test 4: Check summary popup triggers
    console.log('\n4️⃣ Testing summary popup functionality...');
    try {
        // Test call end webhook
        const webhookResponse = await axios.post(`${API_BASE}/api/webhook/call-end`, {
            callId: 'debug-call-123',
            duration: 120,
            transcript: 'Test conversation for summary popup',
            roomNumber: '999',
            language: 'en'
        }, {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log(`Webhook test: ${webhookResponse.status}`);
    } catch (error) {
        console.log(`Webhook test failed: ${error.message}`);
    }

    // Test 5: Check environment variables
    console.log('\n5️⃣ Checking environment configuration...');
    try {
        const envResponse = await axios.get(`${API_BASE}/api/health`, {
            headers: {
                'X-Debug-Env': 'true'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        console.log(`Environment check: ${envResponse.status}`);
    } catch (error) {
        console.log(`Environment check failed: ${error.message}`);
    }

    console.log('\n📋 SUMMARY OF ISSUES:');
    console.log('1. API 500 errors indicate database connection issues');
    console.log('2. Summary popup may not trigger due to API failures');
    console.log('3. Production environment may have missing DATABASE_URL');
    console.log('4. Authentication middleware may be blocking requests');

    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Check DATABASE_URL environment variable in production');
    console.log('2. Verify PostgreSQL connection in production');
    console.log('3. Review authentication middleware configuration');
    console.log('4. Test summary popup triggers in development first');
}

debugProductionSummaryPopup().catch(console.error); 