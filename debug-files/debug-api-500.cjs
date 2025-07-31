const axios = require('axios');

const API_BASE = 'https://minhonmuine.talk2go.online';

async function debugApi500() {
    console.log('🔍 DEBUGGING API 500 ERROR');
    console.log('================================');

    try {
        // Test 1: Health check
        console.log('\n1️⃣ Testing health endpoint...');
        try {
            const healthResponse = await axios.get(`${API_BASE}/api/health`, {
                timeout: 10000,
                validateStatus: () => true
            });
            console.log(`Health Status: ${healthResponse.status}`);
            console.log(`Health Data:`, healthResponse.data);
        } catch (error) {
            console.log(`Health Error: ${error.message}`);
        }

        // Test 2: Request endpoint with detailed error
        console.log('\n2️⃣ Testing request endpoint...');
        try {
            const requestResponse = await axios.get(`${API_BASE}/api/request`, {
                timeout: 10000,
                validateStatus: () => true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Debug': 'true'
                }
            });
            console.log(`Request Status: ${requestResponse.status}`);
            console.log(`Request Data:`, JSON.stringify(requestResponse.data, null, 2));
        } catch (error) {
            console.log(`Request Error: ${error.message}`);
            if (error.response) {
                console.log(`Response Status: ${error.response.status}`);
                console.log(`Response Data:`, JSON.stringify(error.response.data, null, 2));
            }
        }

        // Test 3: Check server logs
        console.log('\n3️⃣ Checking server status...');
        try {
            const serverResponse = await axios.get(`${API_BASE}/api/service-health`, {
                timeout: 10000,
                validateStatus: () => true
            });
            console.log(`Server Status: ${serverResponse.status}`);
            console.log(`Server Data:`, serverResponse.data);
        } catch (error) {
            console.log(`Server Error: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugApi500(); 