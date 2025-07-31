const axios = require('axios');

async function testMinimalRequest() {
    console.log('🧪 Testing minimal request...');

    try {
        // Test 1: Simple GET request
        console.log('\n1️⃣ Testing GET /api/request...');
        const getResponse = await axios.get('https://minhonmuine.talk2go.online/api/request', {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('GET Status:', getResponse.status);
        console.log('GET Data:', JSON.stringify(getResponse.data, null, 2));

        // Test 2: Simple POST request with minimal data
        console.log('\n2️⃣ Testing POST /api/request...');
        const postResponse = await axios.post('https://minhonmuine.talk2go.online/api/request', {
            room_number: 'TEST-001',
            request_content: 'Test request'
        }, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('POST Status:', postResponse.status);
        console.log('POST Data:', JSON.stringify(postResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testMinimalRequest(); 