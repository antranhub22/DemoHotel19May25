// Debug script để test summary popup flow
console.log('🔍 [DEBUG] Testing Summary Popup Flow...');

// Test 1: Kiểm tra window functions
console.log('📋 [DEBUG] Checking window functions:');
console.log('- window.triggerSummaryPopup:', typeof window.triggerSummaryPopup);
console.log('- window.updateSummaryPopup:', typeof window.updateSummaryPopup);
console.log('- window.resetSummarySystem:', typeof window.resetSummarySystem);
console.log('- window.storeCallId:', typeof window.storeCallId);

// Test 2: Kiểm tra useConfirmHandler
console.log('\n📋 [DEBUG] Checking useConfirmHandler registration:');
if (typeof window.triggerSummaryPopup === 'function') {
  console.log('✅ window.triggerSummaryPopup is available');

  // Test gọi function
  try {
    console.log('🎯 [DEBUG] Testing window.triggerSummaryPopup()...');
    window.triggerSummaryPopup();
    console.log('✅ window.triggerSummaryPopup() called successfully');
  } catch (error) {
    console.error('❌ Error calling window.triggerSummaryPopup():', error);
  }
} else {
  console.log('❌ window.triggerSummaryPopup is NOT available');
}

// Test 3: Kiểm tra popup context
console.log('\n📋 [DEBUG] Checking popup context:');
if (window.usePopupContext) {
  console.log('✅ usePopupContext is available');
} else {
  console.log('❌ usePopupContext is NOT available');
}

// Test 4: Kiểm tra assistant context
console.log('\n📋 [DEBUG] Checking assistant context:');
if (window.useAssistant) {
  console.log('✅ useAssistant is available');
} else {
  console.log('❌ useAssistant is NOT available');
}

// Test 5: Simulate call end
console.log('\n📋 [DEBUG] Simulating call end...');
if (typeof window.triggerSummaryPopup === 'function') {
  console.log('🎯 [DEBUG] Manually triggering summary popup...');
  window.triggerSummaryPopup();
  console.log('✅ Manual trigger completed');
} else {
  console.log('❌ Cannot trigger - function not available');
}

console.log('\n🔍 [DEBUG] Summary Popup Flow Test Completed');
