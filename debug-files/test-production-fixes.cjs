const axios = require('axios');

const API_BASE = 'https://minhonmuine.talk2go.online';

async function testProductionFixes() {
    console.log('🧪 TESTING PRODUCTION FIXES');
    console.log('============================');

    // Test 1: Check if API endpoints are now accessible
    console.log('\n1️⃣ Testing API endpoints after fixes...');
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
                console.log(`❌ ${endpoint} still returning 500 error`);
            } else if (response.status === 200 || response.status === 201) {
                console.log(`✅ ${endpoint} working correctly`);
            }
        } catch (error) {
            console.log(`${endpoint}: ERROR - ${error.message}`);
        }
    }

    // Test 2: Test database connection via POST request
    console.log('\n2️⃣ Testing database connection via POST...');
    try {
        const testRequest = {
            serviceType: 'test',
            requestText: 'Test request for production fix verification',
            roomNumber: '999',
            guestName: 'Test User',
            priority: 'low'
        };

        const response = await axios.post(`${API_BASE}/api/request`, testRequest, {
            timeout: 15000,
            validateStatus: () => true
        });

        console.log(`Database POST test: ${response.status}`);
        if (response.status === 201) {
            console.log('✅ Database connection working - request created successfully');
        } else if (response.status === 500) {
            console.log('❌ Database connection still failing');
            console.log('Error details:', response.data.error);
        } else {
            console.log(`⚠️ Unexpected status: ${response.status}`);
        }
    } catch (error) {
        console.log(`Database POST test failed: ${error.message}`);
    }

    // Test 3: Test summary popup triggers
    console.log('\n3️⃣ Testing summary popup functionality...');
    try {
        // Test call end webhook
        const webhookData = {
            callId: 'test-call-123',
            duration: 120,
            transcript: 'Test conversation for summary popup verification',
            roomNumber: '999',
            language: 'en',
            serviceRequests: [
                {
                    serviceType: 'room-service',
                    requestText: 'Test room service request'
                }
            ]
        };

        const webhookResponse = await axios.post(`${API_BASE}/api/webhook/call-end`, webhookData, {
            timeout: 10000,
            validateStatus: () => true
        });

        console.log(`Webhook test: ${webhookResponse.status}`);
        if (webhookResponse.status === 200) {
            console.log('✅ Webhook endpoint working - summary popup should trigger');
        } else {
            console.log('❌ Webhook endpoint not working');
        }
    } catch (error) {
        console.log(`Webhook test failed: ${error.message}`);
    }

    // Test 4: Check environment configuration
    console.log('\n4️⃣ Checking environment configuration...');
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

    // Test 5: Test frontend summary popup
    console.log('\n5️⃣ Testing frontend summary popup...');
    console.log('📋 To test summary popup in browser:');
    console.log('1. Open https://minhonmuine.talk2go.online');
    console.log('2. Start a voice call');
    console.log('3. End the call');
    console.log('4. Check if summary popup appears');
    console.log('5. Verify popup content and functionality');

    console.log('\n📊 SUMMARY OF FIXES APPLIED:');
    console.log('✅ Enhanced database connection with retry logic');
    console.log('✅ Improved error handling in request controller');
    console.log('✅ Removed strict authentication for voice assistant endpoints');
    console.log('✅ Enhanced summary popup with fallback handling');
    console.log('✅ Added production environment checks');

    console.log('\n🔧 REMAINING ISSUES TO CHECK:');
    console.log('1. Verify DATABASE_URL is set in production environment');
    console.log('2. Test summary popup in actual browser');
    console.log('3. Monitor production logs for any remaining errors');
    console.log('4. Verify all voice assistant features work correctly');

    console.log('\n✅ PRODUCTION FIXES TEST COMPLETED!');
}

testProductionFixes().catch(console.error); 