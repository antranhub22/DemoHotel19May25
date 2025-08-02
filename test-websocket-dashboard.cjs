const io = require('socket.io-client');

console.log('🧪 Testing WebSocket Dashboard Connection...');

// Test different URLs
const testUrls = [
    'http://localhost:10000',
    'http://localhost:3000',
    'https://minhonmuine.talk2go.online',
];

testUrls.forEach((url, index) => {
    console.log(`\n🔌 Testing connection ${index + 1}/${testUrls.length}: ${url}`);

    try {
        const socket = io(url, {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            reconnection: false,
        });

        socket.on('connect', () => {
            console.log(`✅ SUCCESS: Connected to ${url}`);

            // Test dashboard subscription
            socket.emit('dashboard:subscribe', {
                tenantId: 'mi-nhon-hotel',
                timestamp: new Date().toISOString(),
            });

            // Listen for dashboard updates
            socket.on('dashboard:update', (data) => {
                console.log('📊 Dashboard update received:', data);
            });

            // Listen for initial data
            socket.on('dashboard:initial_data', (data) => {
                console.log('📊 Initial dashboard data received:', data);
            });

            // Listen for fallback message
            socket.on('dashboard:fallback', (data) => {
                console.log('⚠️ Dashboard fallback message:', data);
            });

            // Test ping
            socket.emit('dashboard:ping');
            socket.on('dashboard:pong', (data) => {
                console.log('🏓 Pong received:', data);
            });

            // Disconnect after 10 seconds
            setTimeout(() => {
                console.log('🔌 Disconnecting from test...');
                socket.disconnect();
            }, 10000);
        });

        socket.on('connect_error', (error) => {
            console.log(`❌ FAILED: ${url} - ${error.message}`);
        });

        socket.on('error', (error) => {
            console.log(`❌ ERROR: ${url} - ${error}`);
        });

    } catch (error) {
        console.log(`❌ EXCEPTION: ${url} - ${error}`);
    }
});

console.log('\n🧪 Test script completed. Check console for results.'); 