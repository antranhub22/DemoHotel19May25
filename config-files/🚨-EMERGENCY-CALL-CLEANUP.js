// 🚨 EMERGENCY CALL CLEANUP SCRIPT
// Fix stuck "Listening" state và stop 401 spam
// Paste vào Console của https://minhonmuine.talk2go.online

console.log('🚨 EMERGENCY CALL CLEANUP STARTING...');

// 1. Force end stuck call
function forceEndCall() {
  console.log('🛑 Step 1: Force ending stuck call...');

  try {
    // Method A: Click end button if exists
    const endButton =
      document.querySelector('[data-testid="end-call"]') ||
      document.querySelector('.end-call-button') ||
      document.querySelector('button:contains("end")') ||
      document.querySelector('button[title*="end"]');

    if (endButton) {
      console.log('✅ Found end button, clicking...');
      endButton.click();
      return true;
    }

    // Method B: Access global Vapi instance
    if (window.vapi) {
      console.log('✅ Found global vapi instance, stopping...');
      window.vapi.stop();
      return true;
    }

    // Method C: Find React component instance
    const voiceButton =
      document.querySelector('.voice-button') ||
      document.querySelector('[class*="voice"]');
    if (voiceButton && voiceButton._reactInternalFiber) {
      console.log('✅ Found React component, forcing state change...');
      // Force component re-render
      voiceButton.click();
      return true;
    }

    console.log('❌ No direct method found, trying DOM manipulation...');
    return false;
  } catch (error) {
    console.error('❌ Error force ending call:', error);
    return false;
  }
}

// 2. Clear all intervals/timeouts
function clearAllTimers() {
  console.log('🧹 Step 2: Clearing all timers...');

  // Clear all intervals
  let intervalId = setInterval(() => {}, 1000);
  for (let i = 1; i < intervalId; i++) {
    clearInterval(i);
  }

  // Clear all timeouts
  let timeoutId = setTimeout(() => {}, 1000);
  for (let i = 1; i < timeoutId; i++) {
    clearTimeout(i);
  }

  console.log('✅ All timers cleared');
}

// 3. Stop 401 request spam
function stopRequestSpam() {
  console.log('🚫 Step 3: Stopping 401 request spam...');

  // Override fetch to block failing requests temporarily
  const originalFetch = window.fetch;
  let blockedCount = 0;

  window.fetch = function (...args) {
    const url = args[0];

    // Block known failing endpoints temporarily
    if (url && (url.includes('minhonmuine') || url.includes('/api/'))) {
      if (blockedCount < 10) {
        // Block first 10 requests to stop spam
        blockedCount++;
        console.log(`🚫 Blocked request ${blockedCount}/10: ${url}`);
        return Promise.reject(new Error('Temporarily blocked to stop spam'));
      }
    }

    return originalFetch.apply(this, args);
  };

  // Restore original fetch after 10 seconds
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log('✅ Fetch restored to normal');
  }, 10000);
}

// 4. Reset call state
function resetCallState() {
  console.log('🔄 Step 4: Resetting call state...');

  try {
    // Clear localStorage call state
    Object.keys(localStorage).forEach(key => {
      if (
        key.includes('call') ||
        key.includes('vapi') ||
        key.includes('voice')
      ) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared: ${key}`);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (
        key.includes('call') ||
        key.includes('vapi') ||
        key.includes('voice')
      ) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Cleared: ${key}`);
      }
    });

    console.log('✅ Call state reset');
  } catch (error) {
    console.error('❌ Error resetting state:', error);
  }
}

// 5. Main cleanup function
async function emergencyCleanup() {
  console.log('🚨 STARTING EMERGENCY CLEANUP SEQUENCE...');

  // Step 1: Force end call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2: Clear timers
  clearAllTimers();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 3: Stop request spam
  stopRequestSpam();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 4: Reset state
  resetCallState();
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('✅ EMERGENCY CLEANUP COMPLETED!');
  console.log('🔄 Refresh page in 5 seconds for clean state...');

  // Auto refresh after 5 seconds
  setTimeout(() => {
    console.log('🔄 Refreshing page for clean state...');
    window.location.reload();
  }, 5000);
}

// Execute cleanup
emergencyCleanup();

// Manual refresh button
console.log('📝 Manual Commands:');
console.log('🔄 Refresh now: window.location.reload()');
console.log('🛑 Force end: forceEndCall()');
console.log('🧹 Clear timers: clearAllTimers()');
