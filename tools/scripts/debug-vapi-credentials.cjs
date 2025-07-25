#!/usr/bin/env node

/**
 * 🔧 VAPI Credentials Debug Tool - UPDATED WITH RELAXED VALIDATION
 * 
 * Kiểm tra và debug các vấn đề về VAPI authentication token
 * Giúp xác định nguyên nhân gây ra lỗi "Invalid authentication token"
 * 
 * ⚠️  IMPORTANT UPDATE: 
 * - VAPI AI does NOT require credentials to start with pk_ or asst_
 * - Any format that worked before should continue to work
 * - This tool now focuses on actual authentication issues, not format requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 VAPI Credentials Debug Tool - RELAXED VALIDATION');
console.log('==================================================');
console.log('ℹ️  NOTE: No longer enforces pk_ or asst_ format requirements');
console.log('ℹ️  VAPI AI accepts various credential formats\n');

// 1. Kiểm tra Environment Variables
console.log('📋 1. KIỂM TRA ENVIRONMENT VARIABLES');
console.log('====================================');

const requiredVapiVars = [
  'VITE_VAPI_PUBLIC_KEY',
  'VITE_VAPI_ASSISTANT_ID', 
  'VAPI_API_KEY'
];

const optionalVapiVars = [
  'VITE_VAPI_PUBLIC_KEY_VI',
  'VITE_VAPI_ASSISTANT_ID_VI',
  'VITE_VAPI_PUBLIC_KEY_FR', 
  'VITE_VAPI_ASSISTANT_ID_FR',
  'VITE_VAPI_PUBLIC_KEY_ZH',
  'VITE_VAPI_ASSISTANT_ID_ZH',
  'VITE_VAPI_PUBLIC_KEY_RU',
  'VITE_VAPI_ASSISTANT_ID_RU',
  'VITE_VAPI_PUBLIC_KEY_KO',
  'VITE_VAPI_ASSISTANT_ID_KO'
];

let hasRequiredVars = true;
let hasAnyLanguageVars = false;

// Kiểm tra required variables
for (const varName of requiredVapiVars) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    hasRequiredVars = false;
  } else if (value.includes('your-') || value.includes('placeholder')) {
    console.log(`⚠️  ${varName}: PLACEHOLDER VALUE (${value.substring(0, 20)}...)`);
    hasRequiredVars = false;
  } else {
    console.log(`✅ ${varName}: EXISTS (${value.substring(0, 15)}...)`);
  }
}

// Kiểm tra optional language-specific variables
console.log('\n📝 Language-specific Variables:');
for (const varName of optionalVapiVars) {
  const value = process.env[varName];
  if (value) {
    if (value.includes('your-') || value.includes('placeholder')) {
      console.log(`⚠️  ${varName}: PLACEHOLDER VALUE`);
    } else {
      console.log(`✅ ${varName}: EXISTS (${value.substring(0, 15)}...)`);
      hasAnyLanguageVars = true;
    }
  } else {
    console.log(`⚪ ${varName}: NOT SET`);
  }
}

// 2. Basic VAPI Credentials Validation (Relaxed)
console.log('\n🔍 2. BASIC VAPI CREDENTIALS VALIDATION (RELAXED)');
console.log('================================================');
console.log('ℹ️  NOTE: VAPI AI does NOT require specific prefixes like pk_ or asst_');
console.log('ℹ️  Any format that worked before should continue to work!');

function validateVapiFormat() {
  const publicKey = process.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = process.env.VITE_VAPI_ASSISTANT_ID;
  const apiKey = process.env.VAPI_API_KEY;
  
  let hasIssues = false;
  
  // Validate Public Key
  if (publicKey) {
    if (publicKey.length < 10) {
      console.log(`⚠️  Public Key might be too short: ${publicKey.length} characters`);
      console.log(`   Preview: ${publicKey.substring(0, 10)}...`);
      hasIssues = true;
    } else {
      console.log(`✅ Public Key present: ${publicKey.length} characters`);
      console.log(`   Preview: ${publicKey.substring(0, 15)}...`);
      console.log(`   Format: Any format is acceptable`);
    }
  } else {
    console.log('❌ Public Key missing');
    hasIssues = true;
  }
  
  // Validate Assistant ID
  if (assistantId) {
    if (assistantId.length < 10) {
      console.log(`⚠️  Assistant ID might be too short: ${assistantId.length} characters`);
      console.log(`   Preview: ${assistantId.substring(0, 10)}...`);
      hasIssues = true;
    } else {
      console.log(`✅ Assistant ID present: ${assistantId.length} characters`);
      console.log(`   Preview: ${assistantId.substring(0, 15)}...`);
      console.log(`   Format: Any format is acceptable`);
    }
  } else {
    console.log('❌ Assistant ID missing');
    hasIssues = true;
  }
  
  // Validate API Key
  if (apiKey) {
    if (apiKey.length < 15) {
      console.log(`⚠️  API Key might be too short: ${apiKey.length} characters`);
      hasIssues = true;
    } else {
      console.log(`✅ API Key present: ${apiKey.length} characters`);
      console.log(`   Used for: Server-side API calls`);
    }
  } else {
    console.log('⚠️  API Key missing (might be needed for server-side calls)');
  }
  
  if (!hasIssues) {
    console.log('\n🎉 All credentials look reasonable for your format!');
  }
  
  return !hasIssues;
}

const formatValid = validateVapiFormat();

// 3. Test VAPI API Connectivity
console.log('\n🌐 3. TEST VAPI API CONNECTIVITY');
console.log('===============================');

async function testVapiConnectivity() {
  const apiKey = process.env.VAPI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ Cannot test API connectivity - VAPI_API_KEY not set');
    return false;
  }
  
  try {
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ VAPI API connectivity successful`);
      console.log(`📊 Found ${data.length || 0} assistants in your account`);
      return true;
    } else {
      console.log(`❌ VAPI API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`📋 Error details: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ VAPI API connection failed: ${error.message}`);
    return false;
  }
}

// 4. Check Render Environment Setup
console.log('\n☁️ 4. RENDER ENVIRONMENT SETUP');
console.log('==============================');

function checkRenderSetup() {
  // Kiểm tra nếu đang chạy trên Render
  const isRender = process.env.RENDER || process.env.RENDER_SERVICE_NAME;
  
  if (isRender) {
    console.log('✅ Running on Render platform');
    console.log(`📋 Service: ${process.env.RENDER_SERVICE_NAME || 'Unknown'}`);
    console.log(`📋 Region: ${process.env.RENDER_REGION || 'Unknown'}`);
    
    // Kiểm tra Vite build variables
    console.log('\n🔧 Vite Build Environment Check:');
    const viteVars = Object.keys(process.env).filter(key => key.startsWith('VITE_'));
    console.log(`📊 Found ${viteVars.length} VITE_ variables`);
    
    const vapiViteVars = viteVars.filter(key => key.includes('VAPI'));
    console.log(`📊 Found ${vapiViteVars.length} VAPI-related VITE_ variables`);
    
    return true;
  } else {
    console.log('⚪ Not running on Render (local development)');
    return false;
  }
}

checkRenderSetup();

// 5. Generate Fix Recommendations
console.log('\n💡 5. RECOMMENDATIONS');
console.log('=====================');

function generateRecommendations() {
  const recommendations = [];
  
  if (!hasRequiredVars) {
    recommendations.push('🔧 Set missing required VAPI environment variables on Render');
    recommendations.push('   - Go to Render Dashboard > Your Service > Environment');
    recommendations.push('   - Add/update VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID');
  }
  
  if (!formatValid) {
    recommendations.push('🔧 Fix VAPI credential formats:');
    recommendations.push('   - Public Key must start with "pk_"');
    recommendations.push('   - Assistant ID must start with "asst_"');
    recommendations.push('   - Get valid credentials from https://console.vapi.ai/');
  }
  
  recommendations.push('🔧 Verify VAPI account setup:');
  recommendations.push('   1. Login to https://console.vapi.ai/');
  recommendations.push('   2. Go to "API Keys" section');
  recommendations.push('   3. Copy your Public Key (starts with pk_)');
  recommendations.push('   4. Go to "Assistants" section');
  recommendations.push('   5. Copy your Assistant ID (starts with asst_)');
  
  recommendations.push('🔧 Update Render environment variables:');
  recommendations.push('   1. Go to Render Dashboard');
  recommendations.push('   2. Select your service');
  recommendations.push('   3. Go to Environment tab');
  recommendations.push('   4. Update VITE_VAPI_PUBLIC_KEY=pk_your_real_key');
  recommendations.push('   5. Update VITE_VAPI_ASSISTANT_ID=asst_your_real_id');
  recommendations.push('   6. Update VAPI_API_KEY=your_server_api_key');
  recommendations.push('   7. Redeploy your service');
  
  return recommendations;
}

const recommendations = generateRecommendations();
recommendations.forEach(rec => console.log(rec));

// 6. Export Debug Report
console.log('\n📄 6. DEBUG REPORT SUMMARY (RELAXED VALIDATION)');
console.log('===============================================');
console.log('ℹ️  NOTE: This debug tool no longer enforces specific credential formats');
console.log('ℹ️  VAPI AI accepts various formats - use what worked before!');

const debugReport = {
  timestamp: new Date().toISOString(),
  validationType: 'RELAXED - No format requirements',
  note: 'VAPI AI does not require pk_ or asst_ prefixes',
  environment: {
    isRender: !!(process.env.RENDER || process.env.RENDER_SERVICE_NAME),
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform
  },
  vapiCredentials: {
    hasPublicKey: !!process.env.VITE_VAPI_PUBLIC_KEY,
    hasAssistantId: !!process.env.VITE_VAPI_ASSISTANT_ID,
    hasApiKey: !!process.env.VAPI_API_KEY,
    publicKeyLength: process.env.VITE_VAPI_PUBLIC_KEY?.length || 0,
    assistantIdLength: process.env.VITE_VAPI_ASSISTANT_ID?.length || 0,
    hasLanguageSupport: hasAnyLanguageVars,
    formatNote: 'Any format is acceptable'
  },
  issues: [],
  recommendations: recommendations
};

// Add detected issues (only for missing credentials, not format)
if (!hasRequiredVars) {
  debugReport.issues.push('Missing required VAPI environment variables');
}
if (!formatValid) {
  debugReport.issues.push('Credentials might be too short or missing');
}

console.log(JSON.stringify(debugReport, null, 2));

// Run connectivity test
console.log('\n🧪 RUNNING CONNECTIVITY TEST...');
testVapiConnectivity().then(success => {
  if (success) {
    console.log('\n🎉 VAPI API connectivity test PASSED');
  } else {
    console.log('\n❌ VAPI API connectivity test FAILED');
    console.log('   This confirms the authentication token issue');
  }
  
  console.log('\n🔚 Debug completed. Check recommendations above.');
}).catch(err => {
  console.log(`\n💥 Connectivity test error: ${err.message}`);
  console.log('\n🔚 Debug completed. Check recommendations above.');
});