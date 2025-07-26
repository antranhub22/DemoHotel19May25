#!/usr/bin/env node

// ================================================================
// 🏨 MI NHON HOTEL - ENVIRONMENT VALIDATOR
// ================================================================

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
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

// Required environment variables by category
const envRequirements = {
  core: {
    title: 'Core Application Settings',
    required: ['NODE_ENV', 'PORT'],
    optional: []
  },
  database: {
    title: 'Database Configuration',
    required: ['DATABASE_URL'],
    optional: []
  },
  auth: {
    title: 'Authentication & Security',
    required: ['JWT_SECRET'],
    optional: ['STAFF_ACCOUNTS']
  },
  ai: {
    title: 'AI & Voice Assistant',
    required: ['VITE_OPENAI_API_KEY', 'VITE_VAPI_PUBLIC_KEY', 'VITE_VAPI_ASSISTANT_ID'],
    optional: [
      'VITE_VAPI_PUBLIC_KEY_VI', 'VITE_VAPI_ASSISTANT_ID_VI',
      'VITE_VAPI_PUBLIC_KEY_FR', 'VITE_VAPI_ASSISTANT_ID_FR',
      'VITE_VAPI_PUBLIC_KEY_ZH', 'VITE_VAPI_ASSISTANT_ID_ZH',
      'VITE_VAPI_PUBLIC_KEY_RU', 'VITE_VAPI_ASSISTANT_ID_RU',
      'VITE_VAPI_PUBLIC_KEY_KO', 'VITE_VAPI_ASSISTANT_ID_KO'
    ]
  },
  email: {
    title: 'Email Services',
    required: [],
    optional: [
      'MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'MAILJET_FROM_EMAIL',
      'GMAIL_USER', 'GMAIL_PASS'
    ]
  },
  external: {
    title: 'External Services',
    required: [],
    optional: ['GOOGLE_PLACES_API_KEY', 'VITE_API_URL', 'CLIENT_URL']
  }
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

// Validate environment variables
function validateEnvironment() {
  log.section('Environment Variables Validation');

  const envFile = loadEnvFile();

  if (!envFile.exists) {
    log.error('.env file not found!');
    log.info('Run: ./scripts/switch-env.sh development');
    return false;
  }

  log.success('.env file found');

  let isValid = true;
  let totalRequired = 0;
  let totalFound = 0;
  let totalOptional = 0;
  let optionalFound = 0;

  Object.entries(envRequirements).forEach(([, config]) => {
    log.section(config.title);

    // Check required variables
    config.required.forEach(varName => {
      totalRequired++;
      if (envFile.variables[varName]) {
        totalFound++;
        const value = envFile.variables[varName];
        const maskedValue = varName.toLowerCase().includes('secret') ||
          varName.toLowerCase().includes('key') ||
          varName.toLowerCase().includes('password')
          ? '*'.repeat(Math.min(value.length, 8))
          : value.length > 50 ? value.substring(0, 50) + '...' : value;

        log.success(`${varName} = ${maskedValue}`);
      } else {
        log.error(`${varName} is required but not set`);
        isValid = false;
      }
    });

    // Check optional variables
    config.optional.forEach(varName => {
      totalOptional++;
      if (envFile.variables[varName]) {
        optionalFound++;
        log.info(`${varName} = configured`);
      } else {
        log.warning(`${varName} = not configured (optional)`);
      }
    });
  });

  // Summary
  log.section('Validation Summary');
  log.info(`Required variables: ${totalFound}/${totalRequired}`);
  log.info(`Optional variables: ${optionalFound}/${totalOptional}`);

  if (isValid) {
    log.success('✅ Environment validation passed!');
  } else {
    log.error('❌ Environment validation failed!');
    log.info('💡 Fix missing variables and run validation again');
  }

  return isValid;
}

// Validate specific formats
function validateFormats() {
  log.section('Format Validation');

  const envFile = loadEnvFile();
  if (!envFile.exists) return false;

  let formatValid = true;
  const vars = envFile.variables;

  // Validate JWT Secret length
  if (vars.JWT_SECRET) {
    if (vars.JWT_SECRET.length < 32) {
      log.error('JWT_SECRET should be at least 32 characters long');
      formatValid = false;
    } else {
      log.success('JWT_SECRET length is adequate');
    }
  }

  // Validate API key formats
  const apiKeyValidations = [
    { key: 'VITE_OPENAI_API_KEY', prefix: 'sk-', name: 'OpenAI API Key' },
    { key: 'VITE_VAPI_PUBLIC_KEY', prefix: null, name: 'Vapi Public Key' },
    { key: 'VITE_VAPI_ASSISTANT_ID', prefix: null, name: 'Vapi Assistant ID' }
  ];

  apiKeyValidations.forEach(({ key, prefix, name }) => {
    if (vars[key]) {
      if (prefix === null || vars[key].startsWith(prefix)) {
        log.success(`${name} format is correct`);
      } else {
        log.error(`${name} should start with '${prefix}'`);
        formatValid = false;
      }
    }
  });

  // Validate DATABASE_URL format
  if (vars.DATABASE_URL) {
    if (vars.DATABASE_URL.startsWith('postgresql://') || vars.DATABASE_URL.startsWith('file:')) {
      log.success('DATABASE_URL format is correct');
    } else {
      log.warning('DATABASE_URL format might be incorrect (should start with postgresql:// or file:)');
    }
  }

  return formatValid;
}

// Check environment file structure
function checkEnvironmentStructure() {
  log.section('Environment Structure Check');

  const envFiles = [
    { name: '.env.example', description: 'Template file', required: true },
    { name: '.env.local', description: 'Local development config', required: false },
    { name: '.env', description: 'Active config', required: true }
  ];

  envFiles.forEach(({ name, description, required }) => {
    if (fs.existsSync(name)) {
      log.success(`${name} exists (${description})`);
    } else if (required) {
      log.error(`${name} missing (${description})`);
    } else {
      log.info(`${name} not found (${description}) - optional`);
    }
  });
}

// Main validation function
function main() {
  console.log(`${colors.bold}${colors.cyan}🏨 Mi Nhon Hotel - Environment Validation${colors.reset}\n`);

  const args = process.argv.slice(2);
  const command = args[0] || 'validate';

  switch (command) {
    case 'validate':
    case 'check':
      checkEnvironmentStructure();
      const isValid = validateEnvironment();
      const formatValid = validateFormats();

      log.section('Final Result');
      if (isValid && formatValid) {
        log.success('🎉 All environment checks passed!');
        log.info('🚀 Ready to start the application');
        process.exit(0);
      } else {
        log.error('🚨 Environment validation failed');
        log.info('📖 Check the errors above and fix them');
        log.info('💡 Run: ./scripts/switch-env.sh development');
        process.exit(1);
      }
      break;

    case 'structure':
      checkEnvironmentStructure();
      break;

    case 'format':
      validateFormats();
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log(`
📖 Environment Validator Usage:

🔍 Commands:
  node scripts/validate-env.js validate    # Full validation (default)
  node scripts/validate-env.js structure   # Check file structure only
  node scripts/validate-env.js format      # Check variable formats only
  node scripts/validate-env.js help        # Show this help

🎯 NPM Scripts:
  npm run validate:env                     # Run validation
  npm run switch:env development           # Switch to development
  npm run switch:env staging               # Switch to staging

🔧 Quick Fixes:
  ./scripts/switch-env.sh development      # Setup development environment
  cp .env.example .env                     # Copy template to active config
      `);
      break;

    default:
      log.error(`Unknown command: ${command}`);
      log.info('Run: node scripts/validate-env.js help');
      process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { loadEnvFile, validateEnvironment, validateFormats }; 