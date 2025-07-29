#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Validates that all required API keys are properly configured
 */

require('dotenv').config();

console.log('🔍 Hotel Voice Assistant - Environment Check\n');

const checks = [
  {
    name: 'OpenAI API Key',
    env: 'VITE_OPENAI_API_KEY',
    required: true,
    validator: (value) => value && value.startsWith('sk-') && value.length > 10 && !value.includes('development'),
    instruction: 'Get from https://platform.openai.com/ → API Keys'
  },
  {
    name: 'Vapi Public Key',
    env: 'VITE_VAPI_PUBLIC_KEY',
    required: true,
    validator: (value) => value && value.length > 10 && !value.includes('development'),
    instruction: 'Get from https://vapi.ai/ → Dashboard → Public Key'
  },
  {
    name: 'Vapi Assistant ID',
    env: 'VITE_VAPI_ASSISTANT_ID',
    required: true,
    validator: (value) => value && value.length > 10 && !value.includes('development'),
    instruction: 'Get from https://vapi.ai/ → Dashboard → Assistant ID'
  },
  {
    name: 'Vapi API Key',
    env: 'VAPI_API_KEY',
    required: true,
    validator: (value) => value && value.length > 10 && !value.includes('your-actual') && !value.includes('development'),
    instruction: 'Get from https://vapi.ai/ → Dashboard → API Key (for dynamic creation)'
  },
  {
    name: 'Database URL',
    env: 'DATABASE_URL',
    required: true,
    validator: (value) => value && (value.startsWith('file:') || value.startsWith('postgres')),
    instruction: 'Should be "file:./dev.db" for development'
  },
  {
    name: 'JWT Secret',
    env: 'JWT_SECRET',
    required: true,
    validator: (value) => value && value.length >= 32,
    instruction: 'Should be at least 32 characters long'
  },
  {
    name: 'Google Places API Key',
    env: 'GOOGLE_PLACES_API_KEY',
    required: false,
    validator: (value) => !value || (value.length > 10 && !value.includes('your-') && !value.includes('dev-')),
    instruction: 'Optional: Get from https://console.cloud.google.com/ → Google Places API'
  }
];

let allPassed = true;
let criticalFailed = false;

checks.forEach(check => {
  const value = process.env[check.env];
  const isValid = check.validator(value);
  const status = isValid ? '✅' : (check.required ? '❌' : '⚠️');

  console.log(`${status} ${check.name}:`);

  if (isValid) {
    if (value.length > 20) {
      console.log(`   ${value.substring(0, 15)}...${value.substring(value.length - 5)}`);
    } else {
      console.log(`   ${value}`);
    }
  } else {
    if (check.required) {
      criticalFailed = true;
      console.log(`   ❌ MISSING or INVALID`);
      console.log(`   📋 ${check.instruction}`);
      if (value && value.includes('development')) {
        console.log(`   🔧 Current value is placeholder: ${value.substring(0, 30)}...`);
      }
    } else {
      console.log(`   ⚠️  Optional - not configured`);
      console.log(`   📋 ${check.instruction}`);
    }
  }

  console.log('');

  if (!isValid && check.required) {
    allPassed = false;
  }
});

console.log('═'.repeat(60));

if (criticalFailed) {
  console.log('❌ CRITICAL ISSUES FOUND!');
  console.log('');
  console.log('🔧 TO FIX:');
  console.log('1. Open .env file in root directory');
  console.log('2. Replace placeholder values with real API keys');
  console.log('3. Follow instructions above to get missing keys');
  console.log('4. Restart development server: npm run dev');
  console.log('');
  console.log('📚 For detailed guide, see: fix-environment.md');
  process.exit(1);
} else if (!allPassed) {
  console.log('⚠️  Some optional configurations missing');
  console.log('✅ Core functionality should work');
  console.log('');
  console.log('🚀 Ready to start: npm run dev');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('🚀 Environment is properly configured');
  console.log('');
  console.log('Ready to start development server: npm run dev');
  process.exit(0);
} 