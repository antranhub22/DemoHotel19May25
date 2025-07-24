#!/usr/bin/env node

/**
 * Temporary Test Mode Setup
 * Modifies .env to disable API-dependent features for testing basic functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up temporary test mode...\n');

const envPath = path.join(__dirname, '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Backup original .env
  const backupPath = path.join(__dirname, '.env.backup');
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, envContent);
    console.log('✅ Created backup: .env.backup');
  }
  
  // Add/update test mode flags
  const testModeConfig = `

# ================================================================
# 🧪 TEMPORARY TEST MODE (API keys disabled)
# ================================================================
ENABLE_VOICE_ASSISTANT=false
ENABLE_MULTI_LANGUAGE=false
ENABLE_OPENAI_FEATURES=false
ENABLE_VAPI_FEATURES=false
ENABLE_HOTEL_RESEARCH=false

# Test mode - use mock data instead of real APIs
USE_MOCK_DATA=true
TEST_MODE=true

# Features that work without APIs
ENABLE_STAFF_DASHBOARD=true
ENABLE_ANALYTICS=true
ENABLE_AUTH_SYSTEM=true
ENABLE_DATABASE_FEATURES=true
`;

  // Remove existing test mode section if it exists
  envContent = envContent.replace(/\n# ={20,}[^#]*🧪 TEMPORARY TEST MODE.*?# ={20,}/gs, '');
  
  // Add new test mode section
  envContent = envContent.trim() + testModeConfig;
  
  // Write updated .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Updated .env with test mode configuration');
  console.log('');
  console.log('🎯 Test Mode Features Enabled:');
  console.log('   ✅ Staff Dashboard');
  console.log('   ✅ User Authentication');  
  console.log('   ✅ Database Operations');
  console.log('   ✅ Analytics Dashboard');
  console.log('   ✅ Customer Requests Management');
  console.log('');
  console.log('🚫 Disabled (require API keys):');
  console.log('   ❌ Voice Assistant');
  console.log('   ❌ OpenAI Integration');
  console.log('   ❌ Multi-language Support');
  console.log('   ❌ Hotel Research');
  console.log('');
  console.log('🚀 Now you can test the system with:');
  console.log('   npm run dev');
  console.log('');
  console.log('🔑 Login credentials for testing:');
  console.log('   Username: admin   Password: admin123');
  console.log('   Username: manager Password: manager123');
  console.log('');
  console.log('📱 Available Pages to Test:');
  console.log('   • http://localhost:5173/staff - Staff Dashboard');
  console.log('   • http://localhost:5173/analytics - Analytics');
  console.log('   • http://localhost:5173/unified-dashboard - Unified Dashboard');
  console.log('');
  console.log('🔄 To restore original configuration:');
  console.log('   node restore-env.cjs');
  
} catch (error) {
  console.error('❌ Error setting up test mode:', error.message);
  process.exit(1);
} 