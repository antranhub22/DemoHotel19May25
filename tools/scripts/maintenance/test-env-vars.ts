#!/usr/bin/env tsx

console.log('🔍 Testing Environment Variables...\n');

// Test basic Vapi variables
console.log('=== VAPI CONFIGURATION ===');
console.log('VAPI_API_KEY:', process.env.VAPI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_VAPI_PUBLIC_KEY:', process.env.VITE_VAPI_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_VAPI_ASSISTANT_ID:', process.env.VITE_VAPI_ASSISTANT_ID ? '✅ Set' : '❌ Missing');

// Test multi-language Vapi variables
console.log('\n=== MULTI-LANGUAGE VAPI ===');
const languages = ['VI', 'FR', 'ZH', 'RU', 'KO'];
languages.forEach(lang => {
  const pubKey = process.env[`VITE_VAPI_PUBLIC_KEY_${lang}`];
  const assistantId = process.env[`VITE_VAPI_ASSISTANT_ID_${lang}`];
  console.log(`${lang}: Public Key ${pubKey ? '✅' : '❌'}, Assistant ID ${assistantId ? '✅' : '❌'}`);
});

// Test other required variables
console.log('\n=== OTHER REQUIRED VARIABLES ===');
console.log('VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

// Show actual values for debugging (first 10 chars only)
console.log('\n=== ACTUAL VALUES (First 10 chars) ===');
if (process.env.VITE_VAPI_PUBLIC_KEY) {
  console.log('VITE_VAPI_PUBLIC_KEY:', process.env.VITE_VAPI_PUBLIC_KEY.substring(0, 10) + '...');
}
if (process.env.VITE_VAPI_ASSISTANT_ID) {
  console.log('VITE_VAPI_ASSISTANT_ID:', process.env.VITE_VAPI_ASSISTANT_ID.substring(0, 10) + '...');
}
if (process.env.VAPI_API_KEY) {
  console.log('VAPI_API_KEY:', process.env.VAPI_API_KEY.substring(0, 10) + '...');
} 