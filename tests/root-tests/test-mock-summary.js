// Test script để verify summary popup với mock transcript
console.log('🧪 Testing summary popup with mock transcript...');

function testMockSummaryFlow() {
  console.log('📞 [TEST] Starting mock call...');

  // Step 1: Simulate call start (this will trigger mock transcripts)
  if (typeof window.startCall === 'function') {
    console.log('✅ [TEST] startCall function found');

    // Start call with Vietnamese language
    window.startCall('vi').then(() => {
      console.log('✅ [TEST] Mock call started');

      // Step 2: Wait for mock transcripts to be generated
      setTimeout(() => {
        console.log('⏳ [TEST] Waiting for mock transcripts...');

        // Step 3: End call after transcripts are generated
        setTimeout(() => {
          console.log('🛑 [TEST] Ending mock call...');

          if (typeof window.endCall === 'function') {
            window.endCall().then(() => {
              console.log('✅ [TEST] Mock call ended');

              // Step 4: Check if summary popup appeared
              setTimeout(() => {
                console.log('🔍 [TEST] Checking for summary popup...');

                const summaryElements = document.querySelectorAll(
                  '[data-popup-type="summary"], .summary-popup, [class*="summary"]'
                );
                console.log(
                  '📋 [TEST] Found summary elements:',
                  summaryElements.length
                );

                if (summaryElements.length > 0) {
                  console.log('🎉 [TEST] SUCCESS: Summary popup found!');
                } else {
                  console.log('❌ [TEST] FAILED: No summary popup found');
                }
              }, 2000);
            });
          } else {
            console.log('❌ [TEST] endCall function not found');
          }
        }, 8000); // Wait for all 6 mock transcripts
      }, 2000);
    });
  } else {
    console.log('❌ [TEST] startCall function not found');
  }
}

// Run the test
testMockSummaryFlow();
