// Test script to verify summary popup trigger
console.log('🧪 Testing summary popup trigger...');

// Simulate the call end flow
function testSummaryPopupTrigger() {
  console.log('📞 [TEST] Simulating call end...');

  // Step 1: Check if triggerSummaryPopup function exists
  if (typeof window.triggerSummaryPopup === 'function') {
    console.log('✅ [TEST] triggerSummaryPopup function found');

    // Step 2: Trigger the summary popup
    console.log('🎯 [TEST] Triggering summary popup...');
    window.triggerSummaryPopup();

    console.log('✅ [TEST] Summary popup trigger completed');
  } else {
    console.log('❌ [TEST] triggerSummaryPopup function not found');
  }

  // Step 3: Check if popup was created
  setTimeout(() => {
    console.log('🔍 [TEST] Checking if popup was created...');

    // Check if there are any summary popups in the DOM
    const summaryElements = document.querySelectorAll(
      '[data-popup-type="summary"], .summary-popup, [class*="summary"]'
    );
    console.log('📋 [TEST] Found summary elements:', summaryElements.length);

    // Check console for any errors
    console.log('📊 [TEST] Test completed - check console for results');
  }, 1000);
}

// Run the test
testSummaryPopupTrigger();
