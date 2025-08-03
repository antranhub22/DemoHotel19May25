// Test script để test call end thực tế
console.log('🔍 [REAL TEST] Testing Real Call End...');

// Test 1: Simulate real call end flow
const simulateCallEnd = () => {
  console.log('\n📞 [REAL TEST] Simulating real call end flow...');

  // Step 1: Check if assistant context is available
  if (typeof window.useAssistant === 'function') {
    console.log('✅ [REAL TEST] Assistant context available');
  } else {
    console.log('❌ [REAL TEST] Assistant context NOT available');
    return;
  }

  // Step 2: Check if endCall function is available
  if (typeof window.endCall === 'function') {
    console.log('✅ [REAL TEST] endCall function available');
  } else {
    console.log('❌ [REAL TEST] endCall function NOT available');
    return;
  }

  // Step 3: Simulate call end
  console.log('🎯 [REAL TEST] Calling endCall()...');
  try {
    window.endCall();
    console.log('✅ [REAL TEST] endCall() called successfully');
  } catch (error) {
    console.error('❌ [REAL TEST] Error calling endCall():', error);
  }

  // Step 4: Wait and check for summary popup
  setTimeout(() => {
    console.log('\n📋 [REAL TEST] Checking for summary popup...');

    // Check if summary popup was created
    const summaryPopup = document.querySelector(
      '[data-testid="summary-popup"]'
    );
    if (summaryPopup) {
      console.log('✅ [REAL TEST] Summary popup found in DOM');
    } else {
      console.log('❌ [REAL TEST] Summary popup NOT found in DOM');
    }

    // Check if window functions are still available
    console.log('\n📋 [REAL TEST] Checking window functions after call end:');
    console.log(
      '- window.triggerSummaryPopup:',
      typeof window.triggerSummaryPopup
    );
    console.log(
      '- window.updateSummaryPopup:',
      typeof window.updateSummaryPopup
    );
  }, 3000);
};

// Test 2: Manual trigger summary popup
const manualTriggerSummary = () => {
  console.log('\n🎯 [REAL TEST] Manually triggering summary popup...');

  if (typeof window.triggerSummaryPopup === 'function') {
    try {
      window.triggerSummaryPopup();
      console.log('✅ [REAL TEST] Manual trigger successful');
    } catch (error) {
      console.error('❌ [REAL TEST] Manual trigger failed:', error);
    }
  } else {
    console.log('❌ [REAL TEST] Manual trigger not available');
  }
};

// Run tests
setTimeout(() => {
  simulateCallEnd();

  // Run manual trigger after 5 seconds
  setTimeout(() => {
    manualTriggerSummary();
  }, 5000);
}, 1000);

console.log('🔍 [REAL TEST] Real Call End Test Started');
