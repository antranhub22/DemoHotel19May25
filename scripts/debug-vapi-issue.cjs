#!/usr/bin/env node

// ================================================================
// 🚨 VAPI SIRI BUTTON DEBUG TOOL
// ================================================================

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}🔍 ${msg}${colors.reset}`),
};

// Load environment variables
function loadEnvFile(envPath = '.env') {
  const fullPath = path.resolve(process.cwd(), envPath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false, variables: {} };
  }

  const envContent = fs.readFileSync(fullPath, 'utf8');
  const variables = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      variables[key.trim()] = value;
    }
  });

  return { exists: true, variables };
}

function diagnoseSiriButtonIssue() {
  console.log(`${colors.bold}${colors.cyan}🚨 SIRI BUTTON / VAPI DEBUG DIAGNOSIS${colors.reset}\n`);
  
  log.section('1. Environment Configuration Check');
  
  const envFile = loadEnvFile();
  if (!envFile.exists) {
    log.error('.env file not found!');
    return;
  }

  const vars = envFile.variables;
  
  // Check Vapi configuration
  log.section('2. Vapi Configuration Analysis');
  
  const vapiPublicKey = vars.VITE_VAPI_PUBLIC_KEY;
  const vapiAssistantId = vars.VITE_VAPI_ASSISTANT_ID;
  
  if (!vapiPublicKey || !vapiAssistantId) {
    log.error('Missing core Vapi configuration!');
    log.info('VITE_VAPI_PUBLIC_KEY: ' + (vapiPublicKey ? 'SET' : 'MISSING'));
    log.info('VITE_VAPI_ASSISTANT_ID: ' + (vapiAssistantId ? 'SET' : 'MISSING'));
    return;
  }
  
  // Check if using development keys
  const isDevelopmentKey = vapiPublicKey.includes('development') || 
                          vapiAssistantId.includes('development') ||
                          vapiPublicKey.includes('dev') ||
                          vapiAssistantId.includes('dev');
  
  if (isDevelopmentKey) {
    log.warning('🚨 USING DEVELOPMENT KEYS - This is likely the problem!');
    log.warning('Development keys will not work in production or may cause errors');
    log.info('Current VITE_VAPI_PUBLIC_KEY: ' + vapiPublicKey.substring(0, 20) + '...');
    log.info('Current VITE_VAPI_ASSISTANT_ID: ' + vapiAssistantId);
    
    log.section('3. Solution: Update to Real Vapi Keys');
    log.info('You need real Vapi keys from your Vapi.ai dashboard:');
    log.info('1. Go to https://app.vapi.ai/');
    log.info('2. Get your actual public key (should start with pk_...)');
    log.info('3. Get your actual assistant ID (should start with asst_...)');
    log.info('4. Update .env file with real values');
    log.info('5. Restart the application');
    
    return;
  }
  
  log.success('Vapi keys appear to be real (not development keys)');
  
  // Check key formats
  log.section('3. Vapi Key Format Validation');
  
  if (!vapiPublicKey.startsWith('pk_')) {
    log.error('Invalid Vapi public key format - should start with pk_');
  } else {
    log.success('Vapi public key format is correct');
  }
  
  if (!vapiAssistantId.startsWith('asst_')) {
    log.error('Invalid Vapi assistant ID format - should start with asst_');
  } else {
    log.success('Vapi assistant ID format is correct');
  }
  
  // Check OpenAI configuration
  log.section('4. OpenAI Configuration Check');
  
  const openaiKey = vars.VITE_OPENAI_API_KEY;
  if (!openaiKey || openaiKey.includes('placeholder') || openaiKey.includes('dev')) {
    log.warning('OpenAI API key may be missing or using development value');
    log.info('Make sure you have a real OpenAI API key set');
  } else if (openaiKey.startsWith('sk-')) {
    log.success('OpenAI API key format appears correct');
  } else {
    log.error('OpenAI API key format is invalid - should start with sk-');
  }
  
  // Check other potential issues
  log.section('5. Common Issues & Solutions');
  
  log.info('💡 If Siri button still crashes after fixing keys:');
  log.info('1. Clear browser cache and localStorage');
  log.info('2. Restart the development server');
  log.info('3. Check browser console for specific error messages');
  log.info('4. Ensure microphone permissions are granted');
  log.info('5. Test in incognito/private browsing mode');
  
  log.section('6. Emergency Debug Commands');
  log.info('Run these in browser console if needed:');
  log.info('- localStorage.clear(); sessionStorage.clear();');
  log.info('- SiriButton.setDebugLevel(2); (enable verbose debugging)');
  log.info('- exportVapiLogs(); (download debug logs)');
  
  // Check browser requirements
  log.section('7. Browser Requirements Check');
  log.info('Make sure your browser supports:');
  log.info('✓ WebRTC (for voice calls)');
  log.info('✓ Microphone access');
  log.info('✓ Modern JavaScript (ES2020+)');
  log.info('✓ WebSocket connections');
  
  log.section('8. Development vs Production');
  const nodeEnv = vars.NODE_ENV || 'development';
  log.info(`Current environment: ${nodeEnv}`);
  
  if (nodeEnv === 'development') {
    log.warning('Running in development mode');
    log.info('Some Vapi features may behave differently in development');
    log.info('Consider testing in production-like environment');
  }
  
  log.section('✅ Next Steps');
  log.success('1. Fix any issues identified above');
  log.success('2. Update environment variables if needed');
  log.success('3. Restart development server: npm run dev');
  log.success('4. Test Siri button again');
  log.success('5. Check browser console for any remaining errors');
}

// Main execution
if (require.main === module) {
  diagnoseSiriButtonIssue();
} 