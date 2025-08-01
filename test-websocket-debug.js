// ✅ WebSocket Connection Debug Script
// Run this in browser console to test WebSocket connections directly

console.log('🔌 [DEBUG SCRIPT] Starting WebSocket connection test...');

// Test function to check if servers are running
async function checkServerStatus() {
  const servers = [
    { name: 'Client Dev Server', url: 'http://localhost:5173', port: 5173 },
    { name: 'Server Dev', url: 'http://localhost:3000', port: 3000 },
    { name: 'Server Prod', url: 'http://localhost:5000', port: 5000 },
  ];

  for (const server of servers) {
    try {
      console.log(`🔍 [DEBUG] Checking ${server.name} at ${server.url}...`);
      const response = await fetch(server.url + '/health', {
        method: 'GET',
        mode: 'no-cors', // Avoid CORS issues for this test
      });
      console.log(`✅ [DEBUG] ${server.name} is responding`);
    } catch (error) {
      console.log(
        `❌ [DEBUG] ${server.name} is not responding: ${error.message}`
      );
    }
  }
}

// Test WebSocket connections directly
function testWebSocketConnections() {
  console.log('🧪 [TEST] Testing WebSocket connections...');

  const testUrls = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
  ];

  testUrls.forEach((url, index) => {
    setTimeout(() => {
      console.log(`🧪 [TEST] Testing WebSocket connection to: ${url}`);

      try {
        // Use Socket.IO if available, otherwise native WebSocket
        if (typeof io !== 'undefined') {
          console.log(`🔌 [TEST] Using Socket.IO for ${url}`);
          const socket = io(url, {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            reconnection: false,
          });

          socket.on('connect', () => {
            console.log(`✅ [TEST] Socket.IO connected to ${url}`);
            socket.disconnect();
          });

          socket.on('connect_error', error => {
            console.log(
              `❌ [TEST] Socket.IO failed to connect to ${url}: ${error.message}`
            );
          });
        } else {
          console.log(`🔌 [TEST] Using native WebSocket for ${url}`);
          const wsUrl =
            url.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket';
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log(`✅ [TEST] Native WebSocket connected to ${url}`);
            ws.close();
          };

          ws.onerror = error => {
            console.log(
              `❌ [TEST] Native WebSocket failed to connect to ${url}:`,
              error
            );
          };
        }
      } catch (error) {
        console.log(`❌ [TEST] Exception testing ${url}:`, error);
      }
    }, index * 2000);
  });
}

// Check environment
console.log('🔍 [DEBUG] Environment check:', {
  currentURL: window.location.href,
  origin: window.location.origin,
  socketIOAvailable: typeof io !== 'undefined',
  isDev: window.location.hostname === 'localhost',
});

// Run tests
checkServerStatus();
setTimeout(() => {
  testWebSocketConnections();
}, 1000);

// Expose functions to window for manual testing
window.testWebSocketDebug = testWebSocketConnections;
window.checkServerStatus = checkServerStatus;

console.log('🧪 [DEBUG] Debug functions available:');
console.log('- testWebSocketDebug() - Test WebSocket connections');
console.log('- checkServerStatus() - Check if servers are running');
console.log(
  '- testWebSocketConnection() - Test from useWebSocket hook (if available)'
);
