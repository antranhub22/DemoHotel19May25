// Paste this script into browser console (F12) on your app
console.log('🔧 Starting Vapi Language Debug...');

const BASE_URL = window.location.origin;
const LANGUAGES = ['en', 'fr', 'vi', 'zh', 'ru', 'ko'];

async function debugVapiLanguages() {
  console.log('📋 Testing all language configurations...');

  for (const lang of LANGUAGES) {
    try {
      const response = await fetch(`${BASE_URL}/api/vapi/config/${lang}`);
      const data = await response.json();

      const status = data.fallback ? '⚠️ FALLBACK' : '✅ SUCCESS';
      const assistantId = data.assistantId
        ? data.assistantId.substring(0, 8) + '...'
        : 'NOT SET';

      console.log(
        `${status} ${lang.toUpperCase()}: Assistant ID: ${assistantId}`
      );

      if (!data.fallback && data.assistantId) {
        console.log(`  ✅ ${lang} correctly configured with unique assistant`);
      } else {
        console.log(`  ❌ ${lang} using fallback (English assistant)`);
      }
    } catch (error) {
      console.error(`❌ ERROR ${lang.toUpperCase()}:`, error.message);
    }
  }
}

// Test language selection in current page
async function testCurrentLanguageSelection() {
  console.log('🌍 Testing current language selection...');

  // Try to find language state in React DevTools or global state
  if (window.React && window.React.version) {
    console.log('⚛️ React detected, version:', window.React.version);
  }

  // Check if getVapiAssistantIdByLanguage function exists
  console.log('🔍 Checking for Vapi functions...');

  // Test French selection specifically
  try {
    const frenchConfig = await fetch(`${BASE_URL}/api/vapi/config/fr`);
    const frenchData = await frenchConfig.json();
    console.log('🇫🇷 French config from API:', frenchData);

    if (frenchData.assistantId === '15ea0d37-d5e3-46d6-a940-bc1e2f97b5d2') {
      console.log('❌ French API returning English assistant - this is wrong!');
    } else {
      console.log('✅ French API returning correct French assistant');
    }
  } catch (error) {
    console.error('Error testing French config:', error);
  }
}

// Check for cache issues
function checkBrowserCache() {
  console.log('🗄️ Checking browser cache...');

  // Check localStorage
  const vapiKeys = Object.keys(localStorage).filter(
    key =>
      key.includes('vapi') ||
      key.includes('language') ||
      key.includes('assistant')
  );

  if (vapiKeys.length > 0) {
    console.log('📦 Found cached Vapi data in localStorage:');
    vapiKeys.forEach(key => {
      console.log(`  ${key}: ${localStorage.getItem(key)}`);
    });
    console.log('💡 Try clearing localStorage: localStorage.clear()');
  } else {
    console.log('✅ No Vapi cache found in localStorage');
  }

  // Check sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(
    key =>
      key.includes('vapi') ||
      key.includes('language') ||
      key.includes('assistant')
  );

  if (sessionKeys.length > 0) {
    console.log('📦 Found cached Vapi data in sessionStorage:');
    sessionKeys.forEach(key => {
      console.log(`  ${key}: ${sessionStorage.getItem(key)}`);
    });
  }
}

// Main debug function
async function runFullDebug() {
  console.clear();
  console.log('🚀 FULL VAPI DEBUG STARTING...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await debugVapiLanguages();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await testCurrentLanguageSelection();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  checkBrowserCache();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('📊 DEBUG COMPLETE');
  console.log(
    '💡 If all APIs show SUCCESS but language selection still fails:'
  );
  console.log(
    '   1. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)'
  );
  console.log('   2. Clear localStorage: localStorage.clear()');
  console.log('   3. Try incognito/private browsing mode');
  console.log('   4. Check browser console for errors when selecting language');
}

// Auto-run debug
runFullDebug();
