// 🔍 DEBUG WINDOW FUNCTIONS
console.log('🔍 [DEBUG] Testing Window Functions...');

// Test window functions availability
console.log('\n📋 Window Functions Check:');
console.log('- window.triggerSummaryPopup:', typeof window.triggerSummaryPopup);
console.log('- window.updateSummaryPopup:', typeof window.updateSummaryPopup);
console.log('- window.resetSummarySystem:', typeof window.resetSummarySystem);
console.log('- window.storeCallId:', typeof window.storeCallId);

// Test manual trigger
if (typeof window.triggerSummaryPopup === 'function') {
  console.log('\n🎯 [DEBUG] Testing manual trigger...');
  try {
    window.triggerSummaryPopup();
    console.log('✅ Manual trigger successful');
  } catch (error) {
    console.error('❌ Manual trigger failed:', error);
  }
} else {
  console.error('❌ window.triggerSummaryPopup not available!');
  console.log('🔧 [DEBUG] Checking useConfirmHandler mount status...');

  // Check if VoiceAssistant is mounted and useConfirmHandler is working
  const voiceAssistantElements = document.querySelectorAll(
    '[data-component="VoiceAssistant"]'
  );
  console.log(
    '- VoiceAssistant elements found:',
    voiceAssistantElements.length
  );

  // Check PopupProvider
  const popupProviders = document.querySelectorAll('[data-provider="popup"]');
  console.log('- PopupProvider elements found:', popupProviders.length);
}
