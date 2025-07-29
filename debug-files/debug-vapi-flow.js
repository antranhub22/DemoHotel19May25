// 🔍 DEBUG VAPI FLOW - Trace exactly what happens when Siri button is clicked

console.log('===== 🎯 VAPI FLOW DEBUG SCRIPT =====');

// STEP 1: Check environment
console.log('1️⃣ ENVIRONMENT CHECK:');
console.log('VITE_FORCE_VAPI_IN_DEV:', import.meta.env.VITE_FORCE_VAPI_IN_DEV);
console.log(
  'VITE_VAPI_PUBLIC_KEY:',
  import.meta.env.VITE_VAPI_PUBLIC_KEY ? 'EXISTS' : 'MISSING'
);
console.log(
  'VITE_VAPI_ASSISTANT_ID:',
  import.meta.env.VITE_VAPI_ASSISTANT_ID ? 'EXISTS' : 'MISSING'
);

// STEP 2: Check contexts
console.log('\n2️⃣ CONTEXT CHECK:');
try {
  // Check if useAssistant is available
  const assistantContext =
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.reactDevtoolsAgent?.getCurrentContextValues?.();
  console.log('Assistant context available:', !!assistantContext);
} catch (e) {
  console.log('Context check failed:', e.message);
}

// STEP 3: Monkey patch for debugging
console.log('\n3️⃣ MONKEY PATCHING FOR DEBUG:');

// Intercept all console.log calls to track Siri button flow
const originalLog = console.log;
window.__siriDebugLogs = [];

console.log = function (...args) {
  // Store all logs that contain Siri/VAPI keywords
  const message = args.join(' ');
  if (
    message.includes('Siri') ||
    message.includes('VAPI') ||
    message.includes('startCall') ||
    message.includes('DEBUG')
  ) {
    window.__siriDebugLogs.push({
      timestamp: new Date().toISOString(),
      message: message,
      stack: new Error().stack,
    });
  }
  originalLog.apply(console, args);
};

// STEP 4: Check VAPI SDK availability
console.log('\n4️⃣ VAPI SDK CHECK:');
async function checkVapiSDK() {
  try {
    // Try to load VAPI SDK
    const vapiModule = await import(
      'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js'
    );
    console.log('✅ VAPI SDK loaded successfully:', typeof vapiModule.default);

    // Try to create instance
    const publicKey =
      import.meta.env.VITE_VAPI_PUBLIC_KEY ||
      '4fba1458-6ea8-45c5-9653-76bbb54e64b5';
    const vapi = new vapiModule.default(publicKey);
    console.log('✅ VAPI instance created:', typeof vapi);
    console.log('✅ VAPI startCall method:', typeof vapi.startCall);

    return vapi;
  } catch (error) {
    console.error('❌ VAPI SDK check failed:', error);
    return null;
  }
}

// STEP 5: Trace Siri button click
console.log('\n5️⃣ SIRI BUTTON TRACER:');
function traceSiriClick() {
  // Find Siri button
  const siriButton = document.querySelector(
    '[data-testid*="siri"], .siri-button, [class*="siri"]'
  );
  if (!siriButton) {
    console.log('❌ Siri button not found in DOM');
    return;
  }

  console.log('✅ Found Siri button:', siriButton.className);

  // Add click listener to trace flow
  siriButton.addEventListener('click', function (event) {
    console.log('🎯 === SIRI BUTTON CLICKED ===');
    console.log('Event:', event);
    console.log('Target:', event.target);
    console.log('Current logs count:', window.__siriDebugLogs.length);

    // Show recent logs after 2 seconds
    setTimeout(() => {
      console.log('\n📋 RECENT SIRI LOGS:');
      const recentLogs = window.__siriDebugLogs.slice(-10);
      recentLogs.forEach((log, index) => {
        console.log(`${index + 1}. [${log.timestamp}] ${log.message}`);
      });

      if (recentLogs.length === 0) {
        console.log('❌ NO SIRI-RELATED LOGS FOUND!');
        console.log('This means the click handler is not working.');
      }
    }, 2000);
  });
}

// STEP 6: Check React components
console.log('\n6️⃣ REACT COMPONENT CHECK:');
function checkReactComponents() {
  // Check if React DevTools is available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available');

    // Try to find SiriButtonContainer component
    const reactFiber =
      document.querySelector('[data-testid*="interface1"]')
        ?._reactInternalFiber ||
      document.querySelector('[data-testid*="interface1"]')?._reactInternals;

    if (reactFiber) {
      console.log('✅ React fiber found for Interface1');
    } else {
      console.log('❌ React fiber not found');
    }
  } else {
    console.log('❌ React DevTools not available');
  }
}

// STEP 7: Execute all checks
async function executeDebug() {
  console.log('\n🚀 EXECUTING ALL DEBUG CHECKS...');

  checkReactComponents();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', traceSiriClick);
  } else {
    traceSiriClick();
  }

  // Provide helper functions
  window.__debugVapiFlow = {
    logs: () => window.__siriDebugLogs,
    clearLogs: () => {
      window.__siriDebugLogs = [];
    },
    testVapi: () => checkVapiSDK(),
    findSiriButton: () => {
      const selectors = [
        '[data-testid*="siri"]',
        '.siri-button',
        '[class*="siri"]',
        '[onclick*="siri"]',
        'button[class*="microphone"]',
        '.voice-button',
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log('Found element with selector:', selector, element);
          return element;
        }
      }
      console.log('No Siri button found with any selector');
      return null;
    },
  };

  console.log('\n✅ Debug setup complete!');
  console.log('Available commands:');
  console.log('- __debugVapiFlow.logs() - Show all captured logs');
  console.log('- __debugVapiFlow.clearLogs() - Clear log history');
  console.log('- __debugVapiFlow.testVapi() - Test VAPI SDK directly');
  console.log('- __debugVapiFlow.findSiriButton() - Find Siri button in DOM');
}

// Auto-execute when script loads
executeDebug();

console.log('===== 🎯 DEBUG SCRIPT LOADED =====');
