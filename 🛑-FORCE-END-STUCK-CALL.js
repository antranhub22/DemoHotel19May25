// 🛑 EMERGENCY: FORCE END STUCK CALL
// Paste this in console on minhonmuine.talk2go.online

console.log('🛑 EMERGENCY: Force ending stuck call...');

// Method 1: Force end via UI button
function forceEndViaButton() {
    console.log('🔍 Looking for end call button...');

    const endSelectors = [
        '[data-testid="end-call"]',
        '.end-call-button',
        'button:contains("end")',
        'button:contains("stop")',
        'button[title*="end"]',
        '.call-button.active',
        '.voice-button.active'
    ];

    for (const selector of endSelectors) {
        const btn = document.querySelector(selector);
        if (btn) {
            console.log('✅ Found end button:', btn);
            btn.click();
            return true;
        }
    }

    // Try clicking the main voice button (toggle to end)
    const voiceButton = document.querySelector('.voice-button, [class*="voice"], [class*="call"]');
    if (voiceButton) {
        console.log('🔄 Clicking voice button to toggle end:', voiceButton);
        voiceButton.click();
        return true;
    }

    return false;
}

// Method 2: Force end via Vapi instance
function forceEndViaVapi() {
    console.log('🔍 Looking for Vapi instance...');

    // Check window for Vapi instance
    if (window.vapi) {
        console.log('✅ Found window.vapi, ending call...');
        try {
            window.vapi.stop();
            return true;
        } catch (e) {
            console.log('❌ Error stopping vapi:', e);
        }
    }

    // Check for global Vapi class
    if (typeof Vapi !== 'undefined') {
        console.log('✅ Found Vapi class, trying to end...');
        try {
            // This might not work but worth trying
            if (window.currentVapiInstance) {
                window.currentVapiInstance.stop();
                return true;
            }
        } catch (e) {
            console.log('❌ Error with Vapi instance:', e);
        }
    }

    return false;
}

// Method 3: Clear all intervals and timeouts
function clearAllTimers() {
    console.log('🧹 Clearing all timers...');

    // Clear all intervals
    const highestInterval = setInterval(() => { }, 9999);
    for (let i = 1; i <= highestInterval; i++) {
        clearInterval(i);
    }

    // Clear all timeouts  
    const highestTimeout = setTimeout(() => { }, 9999);
    for (let i = 1; i <= highestTimeout; i++) {
        clearTimeout(i);
    }

    console.log('✅ Cleared all timers');
}

// Method 4: Force reset UI state
function forceResetUI() {
    console.log('🎨 Force reset UI state...');

    // Find and hide listening indicators
    const listeningElements = document.querySelectorAll('[class*="listening"], [class*="active"], .call-active');
    listeningElements.forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active', 'listening', 'call-active');
    });

    // Reset voice button state
    const voiceButtons = document.querySelectorAll('.voice-button, [class*="voice"], [class*="call"]');
    voiceButtons.forEach(btn => {
        btn.classList.remove('active', 'listening');
        btn.style.animation = 'none';
    });

    console.log('✅ UI reset completed');
}

// EXECUTE ALL METHODS
console.log('🚀 Starting emergency call termination...');

let fixed = false;

// Try UI button first
if (forceEndViaButton()) {
    console.log('✅ Method 1: Ended via button');
    fixed = true;
}

// Try Vapi instance
if (!fixed && forceEndViaVapi()) {
    console.log('✅ Method 2: Ended via Vapi');
    fixed = true;
}

// Clear timers regardless
clearAllTimers();

// Force reset UI
forceResetUI();

// Final check
setTimeout(() => {
    const stillListening = document.querySelector('[class*="listening"], .call-active');
    if (stillListening) {
        console.log('🔄 Still stuck, refreshing page...');
        location.reload();
    } else {
        console.log('✅ Call successfully terminated!');
    }
}, 2000);

console.log('🎯 Emergency script completed!'); 