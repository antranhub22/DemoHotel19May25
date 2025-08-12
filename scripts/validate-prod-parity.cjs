#!/usr/bin/env node

/**
 * ================================================================
 * 🏨 MI NHON HOTEL - PRODUCTION PARITY VALIDATION SCRIPT
 * ================================================================
 * Purpose: Compare local vs production configuration alignment
 * Usage: node scripts/validate-prod-parity.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}🔍 ${msg}${colors.reset}`)
};

// Production reference configuration
const PRODUCTION_REFERENCE = {
  NODE_ENV: 'production',
  PORT: '10000',
  DATABASE_PROVIDER: 'postgresql',
  JWT_SECRET_MIN_LENGTH: 32,
  REQUIRED_KEYS: [
    'NODE_ENV',
    'PORT', 
    'DATABASE_URL',
    'JWT_SECRET',
    'VITE_OPENAI_API_KEY',
    'VITE_VAPI_PUBLIC_KEY',
    'VITE_VAPI_ASSISTANT_ID'
  ],
  PRODUCTION_FEATURES: [
    'ENABLE_HOTEL_RESEARCH',
    'ENABLE_DYNAMIC_ASSISTANT_CREATION', 
    'ENABLE_MULTI_LANGUAGE_SUPPORT',
    'ENABLE_ANALYTICS_DASHBOARD'
  ],
  SECURITY_KEYS: [
    'JWT_SECRET',
    'STAFF_ACCOUNTS',
    'SESSION_SECRET'
  ]
};

// Load environment file
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const variables = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      variables[key.trim()] = value;
    }
  });

  return variables;
}

// Validate configuration alignment
function validateProductionParity() {
  log.section('Production Parity Validation');

  // Load environment files
  const localEnv = loadEnvFile('.env.local');
  const prodLocalEnv = loadEnvFile('.env.production-local');
  const currentEnv = loadEnvFile('.env');

  if (!localEnv) {
    log.error('.env.local not found!');
    return false;
  }

  if (!prodLocalEnv) {
    log.error('.env.production-local not found!');
    return false;
  }

  if (!currentEnv) {
    log.error('.env not found!');
    return false;
  }

  let isValid = true;

  // Check port alignment
  log.section('Port Configuration');
  if (localEnv.PORT === '10000' && prodLocalEnv.PORT === '10000') {
    log.success('Port aligned: 10000 (matches production)');
  } else {
    log.error(`Port mismatch - Local: ${localEnv.PORT}, Prod-Local: ${prodLocalEnv.PORT}`);
    isValid = false;
  }

  // Check database configuration
  log.section('Database Configuration');
  const localDbType = localEnv.DATABASE_URL?.startsWith('postgresql://') ? 'postgresql' : 'other';
  const prodDbType = prodLocalEnv.DATABASE_URL?.startsWith('postgresql://') ? 'postgresql' : 'other';

  if (localDbType === 'postgresql' && prodDbType === 'postgresql') {
    log.success('Database aligned: PostgreSQL (matches production)');
  } else {
    log.error(`Database mismatch - Local: ${localDbType}, Prod-Local: ${prodDbType}`);
    isValid = false;
  }

  // Check JWT Secret security
  log.section('Security Configuration');
  const localJwtLength = localEnv.JWT_SECRET?.length || 0;
  const prodJwtLength = prodLocalEnv.JWT_SECRET?.length || 0;

  if (localJwtLength >= 32 && prodJwtLength >= 32) {
    log.success(`JWT secrets are secure (Local: ${localJwtLength} chars, Prod: ${prodJwtLength} chars)`);
  } else {
    log.error(`JWT secrets too short - Local: ${localJwtLength}, Prod: ${prodJwtLength} (min: 32)`);
    isValid = false;
  }

  // Check required keys alignment
  log.section('Required Variables Alignment');
  let alignedKeys = 0;
  let totalKeys = PRODUCTION_REFERENCE.REQUIRED_KEYS.length;

  PRODUCTION_REFERENCE.REQUIRED_KEYS.forEach(key => {
    const hasLocal = !!localEnv[key];
    const hasProd = !!prodLocalEnv[key];

    if (hasLocal && hasProd) {
      log.success(`${key}: Present in both environments`);
      alignedKeys++;
    } else {
      log.error(`${key}: Missing in ${!hasLocal ? 'local' : 'prod-local'}`);
      isValid = false;
    }
  });

  // Check feature flags alignment
  log.section('Feature Flags Alignment');
  let alignedFeatures = 0;
  PRODUCTION_REFERENCE.PRODUCTION_FEATURES.forEach(feature => {
    const localValue = localEnv[feature];
    const prodValue = prodLocalEnv[feature];

    if (localValue === prodValue) {
      log.success(`${feature}: Aligned (${localValue})`);
      alignedFeatures++;
    } else {
      log.warning(`${feature}: Different values - Local: ${localValue}, Prod: ${prodValue}`);
    }
  });

  // Summary
  log.section('Validation Summary');
  log.info(`Required variables aligned: ${alignedKeys}/${totalKeys}`);
  log.info(`Feature flags aligned: ${alignedFeatures}/${PRODUCTION_REFERENCE.PRODUCTION_FEATURES.length}`);

  if (isValid) {
    log.success('🎉 Production parity validation passed!');
    log.info('✅ Local environment is aligned with production requirements');
  } else {
    log.error('🚨 Production parity validation failed!');
    log.info('💡 Fix the issues above and run validation again');
  }

  return isValid;
}

// Check vite.config.ts alignment
function validateBuildConfiguration() {
  log.section('Build Configuration Alignment');

  try {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

    // Check port configuration
    if (viteConfig.includes('port: 10000')) {
      log.success('Vite dev server port: 10000 (matches production)');
    } else {
      log.error('Vite dev server port not set to 10000');
      return false;
    }

    // Check proxy configuration
    if (viteConfig.includes('target: "http://localhost:10000"')) {
      log.success('Vite proxy target: localhost:10000 (aligned)');
    } else {
      log.warning('Vite proxy target may not be aligned');
    }

    return true;
  } catch (error) {
    log.error(`Failed to read vite.config.ts: ${error.message}`);
    return false;
  }
}

// Main execution
function main() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('================================================================');
  console.log('🏨 MI NHON HOTEL - PRODUCTION PARITY VALIDATOR');
  console.log('================================================================');
  console.log(`${colors.reset}\n`);

  const envValid = validateProductionParity();
  const buildValid = validateBuildConfiguration();

  console.log('\n================================================================');
  if (envValid && buildValid) {
    log.success('🎯 All validations passed! Local environment ready for production parity.');
  } else {
    log.error('🔧 Some validations failed. Please fix the issues above.');
    process.exit(1);
  }
  console.log('================================================================\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateProductionParity, validateBuildConfiguration };