// 🧪 TEST OFFICIAL VAPI PATTERN - Paste vào Console
// Test này sẽ verify official Vapi setup hoạt động với real credentials

console.log('🧪 Testing Official Vapi Pattern...');
console.log('📖 Following: https://docs.vapi.ai/quickstart/web');

// Real credentials từ REAL_ENV_KEYS.txt
const REAL_CREDENTIALS = {
  publicKey: '4fba1458-6ea8-45c5-9653-76bbb54e64b5',
  assistantId: '18414a64-d242-447a-8162-ce3efd2cc8f1', // English
  assistantIdVi: 'ff0533bb-2106-4d73-bbe2-23e245d19099', // Vietnamese
};

// Test function
async function testOfficialVapi() {
  try {
    console.log('🚀 Step 1: Loading Official Vapi SDK...');

    // Load official Vapi SDK if not already loaded
    if (typeof Vapi === 'undefined') {
      console.log('📦 Loading Vapi SDK from CDN...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vapi-ai/web@latest';

      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ Vapi SDK loaded successfully');
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Failed to load Vapi SDK');
          reject(new Error('Failed to load Vapi SDK'));
        };
        document.head.appendChild(script);
      });
    } else {
      console.log('✅ Vapi SDK already available');
    }

    console.log('🚀 Step 2: Initialize Vapi (Official Pattern)...');
    console.log('📋 Pattern: new Vapi(publicKey)');

    // ✅ OFFICIAL PATTERN: Direct initialization
    const vapi = new Vapi(REAL_CREDENTIALS.publicKey);
    console.log('✅ Vapi instance created successfully');

    console.log('🚀 Step 3: Setup Event Listeners...');

    // ✅ OFFICIAL PATTERN: Event listeners
    vapi.on('call-start', () => {
      console.log('🎙️ SUCCESS: Call started! Official pattern works!');
      console.log('✅ Event: call-start fired correctly');
    });

    vapi.on('call-end', () => {
      console.log('📞 SUCCESS: Call ended! Clean termination');
      console.log('✅ Event: call-end fired correctly');
    });

    vapi.on('message', message => {
      console.log('📨 Message received:', message);
      if (message.type === 'transcript') {
        console.log(`💬 Transcript: ${message.role}: ${message.transcript}`);
      }
    });

    vapi.on('error', error => {
      console.error('❌ Vapi Error:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        type: error.type,
        stack: error.stack,
      });
    });

    vapi.on('speech-start', () => {
      console.log('🗣️ Speech started');
    });

    vapi.on('speech-end', () => {
      console.log('🤐 Speech ended');
    });

    console.log('✅ Event listeners setup complete');

    console.log('🚀 Step 4: Test Call Start (Official Pattern)...');
    console.log('📋 Pattern: vapi.start(assistantId)');
    console.log(`🎯 Using assistant: ${REAL_CREDENTIALS.assistantId}`);

    // ✅ OFFICIAL PATTERN: Direct call start
    await vapi.start(REAL_CREDENTIALS.assistantId);

    console.log('🎉 SUCCESS: Official Vapi pattern works perfectly!');
    console.log('📋 Summary:');
    console.log('  ✅ SDK loaded');
    console.log('  ✅ Instance created');
    console.log('  ✅ Events setup');
    console.log('  ✅ Call started');
    console.log('');
    console.log('🎯 CONCLUSION: Official pattern is MUCH simpler and works!');
    console.log(
      '💡 Recommendation: Replace complex implementation with this simple approach'
    );

    // Return vapi instance for manual testing
    window.testVapi = vapi;
    console.log('🔧 Vapi instance saved as window.testVapi for manual testing');
    console.log('🧪 Try: window.testVapi.stop() to end call');

    return vapi;
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('🔍 Error analysis:');
    console.log('- Check internet connection');
    console.log('- Verify credentials are correct');
    console.log('- Check browser console for additional errors');
    throw error;
  }
}

// Auto-start test
console.log('🚀 Starting Official Vapi Test...');
console.log('⏰ This will take ~5 seconds...');
testOfficialVapi()
  .then(() => {
    console.log('');
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Official Vapi pattern works with your credentials');
    console.log('💡 Next: Update Siri button to use this simple approach');
  })
  .catch(error => {
    console.log('');
    console.log('❌ TEST FAILED');
    console.log('🔍 Debug info:', error.message);
    console.log('💡 Need to investigate credentials or network');
  });

// Helper functions for manual testing
window.vapiTest = {
  start: () => {
    if (window.testVapi) {
      console.log('🚀 Manual start test...');
      window.testVapi.start(REAL_CREDENTIALS.assistantId);
    } else {
      console.log('❌ Run testOfficialVapi() first');
    }
  },

  stop: () => {
    if (window.testVapi) {
      console.log('⏹️ Manual stop test...');
      window.testVapi.stop();
    } else {
      console.log('❌ Run testOfficialVapi() first');
    }
  },

  testVietnamese: () => {
    if (window.testVapi) {
      console.log('🇻🇳 Testing Vietnamese assistant...');
      window.testVapi.start(REAL_CREDENTIALS.assistantIdVi);
    } else {
      console.log('❌ Run testOfficialVapi() first');
    }
  },

  help: () => {
    console.log('🔧 Available test commands:');
    console.log('- vapiTest.start() - Start call with English assistant');
    console.log('- vapiTest.stop() - Stop current call');
    console.log('- vapiTest.testVietnamese() - Test Vietnamese assistant');
    console.log('- vapiTest.help() - Show this help');
  },
};

console.log('');
console.log('🔧 Manual test commands available:');
console.log('- vapiTest.help() - Show available commands');
console.log('- vapiTest.start() - Manual start test');
console.log('- vapiTest.stop() - Manual stop test');
