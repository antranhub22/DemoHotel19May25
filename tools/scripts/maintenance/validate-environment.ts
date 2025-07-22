#!/usr/bin/env tsx

/**
 * Environment Variables Validation Script
 * Validates all required environment variables before deployment
 */

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'VITE_OPENAI_API_KEY',
  'VITE_VAPI_PUBLIC_KEY',
  'VITE_VAPI_ASSISTANT_ID',
] as const;

const SAAS_REQUIRED_VARS = [
  'VAPI_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'TALK2GO_DOMAIN',
] as const;

async function main() {
  console.log('🔍 VALIDATING ENVIRONMENT VARIABLES...\n');

  // Check basic required variables
  const missingBasic: string[] = [];
  const presentBasic: string[] = [];

  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingBasic.push(varName);
    } else {
      presentBasic.push(varName);
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
  }

  // Check SaaS optional variables
  const missingSaaS: string[] = [];
  const presentSaaS: string[] = [];

  for (const varName of SAAS_REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingSaaS.push(varName);
    } else {
      presentSaaS.push(varName);
      console.log(`🌟 ${varName}: ${value.substring(0, 10)}...`);
    }
  }

  console.log('\n📊 VALIDATION RESULTS:');
  console.log(
    `✅ Basic variables present: ${presentBasic.length}/${REQUIRED_VARS.length}`
  );
  console.log(
    `🌟 SaaS variables present: ${presentSaaS.length}/${SAAS_REQUIRED_VARS.length}`
  );

  if (missingBasic.length > 0) {
    console.log('\n❌ MISSING REQUIRED VARIABLES:');
    missingBasic.forEach(varName => {
      console.log(`   - ${varName}`);
    });

    console.log('\n📝 TO FIX THIS:');
    console.log('1. Go to Render Dashboard → Your Service → Environment');
    console.log('2. Add the missing variables above');
    console.log('3. Redeploy your service');

    console.log('\n🔐 Generate JWT Secret:');
    const crypto = await import('crypto');
    console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex'));

    process.exit(1);
  }

  if (missingSaaS.length > 0) {
    console.log('\n⚠️  MISSING SAAS VARIABLES (Optional):');
    missingSaaS.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log(
      'These are optional for basic functionality but required for advanced features.'
    );
  }

  console.log('\n🎉 ALL REQUIRED ENVIRONMENT VARIABLES ARE PRESENT!');
  console.log('🚀 Ready for deployment!\n');
}

main().catch(console.error);
