console.clear();
console.log('🧪 Testing after reload with new debug logs...');

// Tự động tìm và click nút Siri sau 2 giây
setTimeout(() => {
  const siriBtn =
    document.querySelector('#main-siri-button') ||
    document.querySelector('[id*="siri"]') ||
    document.querySelector('.voice-button');

  if (siriBtn) {
    console.log('🎯 Auto-clicking Siri button to trigger debug logs...');
    siriBtn.click();
  } else {
    console.log('❌ Siri button not found');
  }
}, 2000);
