const axios = require('axios');

async function testSimpleRequest() {
    console.log('🧪 Testing simple request endpoint...');

    try {
        const response = await axios.get('https://minhonmuine.talk2go.online/api/request', {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json',
                'X-Test': 'true'
            }
        });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSimpleRequest(); 