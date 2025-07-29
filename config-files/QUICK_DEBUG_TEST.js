// Copy và paste đoạn này vào Console sau khi hard reload:

console.clear();
console.log('🧪 Testing Siri Button with Debug Logs...');

// Kiểm tra xem có debug logs mới không
setTimeout(() => {
  console.log('🔍 Searching for Siri button...');

  // Tìm nút Siri
  const siriBtn =
    document.querySelector('#main-siri-button') ||
    document.querySelector('#siri-button-container') ||
    document.querySelector('.voice-button');

  if (siriBtn) {
    console.log('✅ Found Siri button, testing click...');
    siriBtn.style.border = '3px solid red';

    // Click nút
    siriBtn.click();

    // Chờ 2 giây rồi kiểm tra logs
    setTimeout(() => {
      console.log('🔍 Checking for new debug logs...');
      console.log('Expected to see: 🚀 [DEBUG] Siri Button Click Event');
      console.log(
        "If you don't see those logs, the new code hasn't loaded yet."
      );
    }, 2000);
  } else {
    console.log('❌ Siri button not found');
  }
}, 1000);
