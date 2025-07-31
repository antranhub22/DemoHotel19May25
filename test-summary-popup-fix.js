// Test script để kiểm tra summary popup fix
console.log('🔍 [TEST] Testing Summary Popup Fix...');

// Test 1: Kiểm tra window functions sau khi VoiceAssistant mount
setTimeout(() => {
  console.log(
    '\n📋 [TEST] Checking window functions after VoiceAssistant mount:'
  );
  console.log(
    '- window.triggerSummaryPopup:',
    typeof window.triggerSummaryPopup
  );
  console.log('- window.updateSummaryPopup:', typeof window.updateSummaryPopup);
  console.log('- window.resetSummarySystem:', typeof window.resetSummarySystem);
  console.log('- window.storeCallId:', typeof window.storeCallId);

  // Test 2: Simulate call end
  if (typeof window.triggerSummaryPopup === 'function') {
    console.log('\n🎯 [TEST] Simulating call end...');
    try {
      window.triggerSummaryPopup();
      console.log('✅ [TEST] window.triggerSummaryPopup() called successfully');
    } catch (error) {
      console.error(
        '❌ [TEST] Error calling window.triggerSummaryPopup():',
        error
      );
    }
  } else {
    console.log('❌ [TEST] window.triggerSummaryPopup is NOT available');
  }

  // Test 3: Check popup context
  console.log('\n📋 [TEST] Checking popup context:');
  if (window.usePopupContext) {
    console.log('✅ [TEST] usePopupContext is available');
  } else {
    console.log('❌ [TEST] usePopupContext is NOT available');
  }

  // Test 4: Check assistant context
  console.log('\n📋 [TEST] Checking assistant context:');
  if (window.useAssistant) {
    console.log('✅ [TEST] useAssistant is available');
  } else {
    console.log('❌ [TEST] useAssistant is NOT available');
  }

  console.log('\n🔍 [TEST] Summary Popup Fix Test Completed');
}, 2000); // Wait 2 seconds for components to mount
