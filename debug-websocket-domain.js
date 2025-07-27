// 🔍 DEBUG WEBSOCKET DOMAIN ISSUE

console.clear();
console.log('===== 🔍 WEBSOCKET DOMAIN DEBUG =====');

// Check current location
console.log('1️⃣ CURRENT LOCATION:');
console.log('✅ window.location.host:', window.location.host);
console.log('✅ window.location.hostname:', window.location.hostname);
console.log('✅ window.location.href:', window.location.href);
console.log('✅ window.location.origin:', window.location.origin);

// Check environment
console.log('\n2️⃣ ENVIRONMENT:');
console.log('✅ import.meta.env.PROD:', import.meta.env.PROD);
console.log('✅ import.meta.env.VITE_API_HOST:', import.meta.env.VITE_API_HOST);
console.log(
  '✅ Contains .talk2go.online:',
  window.location.hostname.includes('.talk2go.online')
);
console.log(
  '✅ Contains .onrender.com:',
  window.location.hostname.includes('.onrender.com')
);

// Simulate WebSocket URL construction (same logic as useWebSocket.ts)
console.log('\n3️⃣ WEBSOCKET URL CONSTRUCTION:');
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
let wsUrl;

if (
  import.meta.env.PROD ||
  window.location.hostname.includes('.onrender.com') ||
  window.location.hostname.includes('.talk2go.online')
) {
  // Production path
  wsUrl = `${protocol}//${window.location.host}/ws`;
  console.log('🔧 Using PRODUCTION logic');
} else {
  // Development path
  const apiHost = import.meta.env.VITE_API_HOST || window.location.host;
  wsUrl = `${protocol}//${apiHost}/ws`;
  console.log('🔧 Using DEVELOPMENT logic');
  console.log('📋 apiHost:', apiHost);
}

console.log('🎯 CALCULATED WebSocket URL:', wsUrl);

// Check if this matches what we see in console
console.log('\n4️⃣ COMPARISON:');
console.log('✅ Expected: wss://minhonmuine.talk2go.online/ws');
console.log('❌ Actual from logs: wss://einhonmuine.talk2go.online/ws');
console.log('🔧 Our calculation:', wsUrl);

if (wsUrl === 'wss://minhonmuine.talk2go.online/ws') {
  console.log('🎉 CALCULATION CORRECT - Issue must be elsewhere!');
} else {
  console.log('❌ CALCULATION WRONG - Found the bug!');
}

// Check for any overrides or redirects
console.log('\n5️⃣ CHECKING FOR OVERRIDES:');
console.log('🔍 document.domain:', document.domain);
console.log('🔍 document.location.host:', document.location.host);

// Check VAPI related variables
console.log('\n6️⃣ CHECKING VAPI CONFIGURATION:');
console.log(
  '🔍 VITE_VAPI_PUBLIC_KEY:',
  import.meta.env.VITE_VAPI_PUBLIC_KEY ? 'EXISTS' : 'MISSING'
);
console.log(
  '🔍 VITE_VAPI_ASSISTANT_ID:',
  import.meta.env.VITE_VAPI_ASSISTANT_ID ? 'EXISTS' : 'MISSING'
);
console.log('🔍 window.Vapi:', typeof window.Vapi);

// Monitor WebSocket creation
console.log('\n7️⃣ SETTING UP WEBSOCKET MONITOR:');
const originalWebSocket = window.WebSocket;
window.WebSocket = function (url, protocols) {
  console.log('🚨 NEW WEBSOCKET CREATED:', url);
  if (url.includes('einhonmuine')) {
    console.error(
      '❌ FOUND THE BUG! WebSocket created with wrong domain:',
      url
    );
    console.trace('Stack trace:');
  }
  return new originalWebSocket(url, protocols);
};

console.log('✅ WebSocket monitor setup complete');
console.log('===== END DEBUG =====');
console.log(
  '🔍 Now try clicking Siri button and watch for WebSocket creation logs...'
);
