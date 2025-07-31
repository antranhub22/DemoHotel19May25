const axios = require('axios');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        // Test 1: Check if database is accessible
        console.log('\n1️⃣ Testing database health...');
        const healthResponse = await axios.get('https://minhonmuine.talk2go.online/api/health', {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log('Health Status:', healthResponse.status);
        console.log('Health Data:', healthResponse.data);

        // Test 2: Try to create a test request
        console.log('\n2️⃣ Testing request creation...');
        const createResponse = await axios.post('https://minhonmuine.talk2go.online/api/request', {
            room_number: 'TEST-001',
            request_content: 'Test request for debugging',
            order_type: 'room-service',
            status: 'Đã ghi nhận'
        }, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json',
                'X-Test': 'true'
            }
        });
        console.log('Create Status:', createResponse.status);
        console.log('Create Data:', JSON.stringify(createResponse.data, null, 2));

        // Test 3: Try to get requests again
        console.log('\n3️⃣ Testing request retrieval...');
        const getResponse = await axios.get('https://minhonmuine.talk2go.online/api/request', {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json',
                'X-Test': 'true'
            }
        });
        console.log('Get Status:', getResponse.status);
        console.log('Get Data:', JSON.stringify(getResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDatabaseConnection(); 