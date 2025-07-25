async function testAuthenticationFix() {
    // Use built-in fetch or import node-fetch dynamically
    let fetch;
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
    } else {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
    }
    console.log('🧪 Testing Authentication Fix...');

    const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

    try {
        // Test 1: Health check (should work without auth)
        console.log('\n1️⃣ Testing health check endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        console.log('Health Status:', healthResponse.status);

        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed:', healthData);
        }

        // Test 2: Login endpoint (should not require prior auth)
        console.log('\n2️⃣ Testing login endpoint...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        console.log('Login Status:', loginResponse.status);

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful');

            if (loginData.token) {
                console.log('✅ Token received');

                // Test 3: Protected endpoint with token
                console.log('\n3️⃣ Testing protected endpoint with token...');
                const protectedResponse = await fetch(`${API_BASE_URL}/api/requests`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Protected endpoint status:', protectedResponse.status);

                if (protectedResponse.ok) {
                    console.log('✅ Protected endpoint accessible with token');
                } else {
                    const errorData = await protectedResponse.json();
                    console.log('❌ Protected endpoint failed:', errorData);
                }
            } else {
                console.log('❌ No token in login response');
            }
        } else {
            const loginError = await loginResponse.json();
            console.log('❌ Login failed:', loginError);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAuthenticationFix(); 