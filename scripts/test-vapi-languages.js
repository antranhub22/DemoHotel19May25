#!/usr/bin/env node

/**
 * Test script to verify Vapi language configuration
 * Usage: node scripts/test-vapi-languages.js [production-url]
 */

const BASE_URL = process.argv[2] || 'http://localhost:10000';
const LANGUAGES = ['en', 'fr', 'vi', 'zh', 'ru', 'ko'];

console.log('🧪 Testing Vapi Language Configuration');
console.log('🌐 Base URL:', BASE_URL);
console.log('📋 Testing languages:', LANGUAGES.join(', '));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testLanguage(lang) {
  try {
    const response = await fetch(`${BASE_URL}/api/vapi/config/${lang}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const config = await response.json();
    
    const status = config.fallback ? '⚠️  FALLBACK' : '✅ SUCCESS';
    const publicKey = config.publicKey ? `${config.publicKey.substring(0, 8)}...` : 'NOT SET';
    const assistantId = config.assistantId ? `${config.assistantId.substring(0, 8)}...` : 'NOT SET';
    
    console.log(`${status} ${lang.toUpperCase()}: Public Key: ${publicKey}, Assistant ID: ${assistantId}`);
    
    return {
      language: lang,
      success: true,
      fallback: config.fallback,
      hasConfig: !!(config.publicKey && config.assistantId)
    };
  } catch (error) {
    console.log(`❌ ERROR ${lang.toUpperCase()}: ${error.message}`);
    return {
      language: lang,
      success: false,
      error: error.message
    };
  }
}

async function main() {
  const results = [];
  
  for (const lang of LANGUAGES) {
    const result = await testLanguage(lang);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY:');
  
  const successCount = results.filter(r => r.success && r.hasConfig).length;
  const fallbackCount = results.filter(r => r.success && r.fallback).length;
  const errorCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Configured languages: ${successCount}/${LANGUAGES.length}`);
  console.log(`⚠️  Fallback languages: ${fallbackCount}/${LANGUAGES.length}`);
  console.log(`❌ Error languages: ${errorCount}/${LANGUAGES.length}`);
  
  if (successCount === 0) {
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('1. Check environment variables on Render:');
    console.log('   - VITE_VAPI_ASSISTANT_ID_FR');
    console.log('   - VITE_VAPI_ASSISTANT_ID_VI');
    console.log('   - VITE_VAPI_ASSISTANT_ID_ZH');
    console.log('   - VITE_VAPI_ASSISTANT_ID_RU');
    console.log('   - VITE_VAPI_ASSISTANT_ID_KO');
    console.log('   - VITE_VAPI_PUBLIC_KEY_FR');
    console.log('   - VITE_VAPI_PUBLIC_KEY_VI');
    console.log('   - VITE_VAPI_PUBLIC_KEY_ZH');
    console.log('   - VITE_VAPI_PUBLIC_KEY_RU');
    console.log('   - VITE_VAPI_PUBLIC_KEY_KO');
    console.log('');
    console.log('2. Restart Render service after adding environment variables');
    console.log('3. Check server logs for any errors');
  }
  
  process.exit(successCount > 0 ? 0 : 1);
}

main().catch(console.error); 