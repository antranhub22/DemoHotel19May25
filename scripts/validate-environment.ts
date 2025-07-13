#!/usr/bin/env node

/**
 * ===============================================
 * 🔧 Environment Validation Script
 * ===============================================
 * 
 * This script validates the environment configuration
 * and provides detailed status reports
 */

import { 
  validateEnvironment, 
  getEnvironmentStatus, 
  printEnvironmentStatus,
  loadEnvironmentConfig,
  EnvironmentValidationError,
  ENVIRONMENT_TEMPLATES
} from '../config/environment';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title: string): void {
  console.log('');
  console.log(colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`🔧 ${title}`, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
  console.log('');
}

function printSection(title: string): void {
  console.log(colorize(`\n📋 ${title}`, 'blue'));
  console.log(colorize('-'.repeat(40), 'blue'));
}

async function validateBasicEnvironment(): Promise<void> {
  printSection('Basic Environment Validation');
  
  try {
    validateEnvironment(false);
    console.log(colorize('✅ Basic environment validation passed', 'green'));
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.log(colorize('❌ Basic environment validation failed', 'red'));
      console.log(colorize(`Missing variables: ${error.missingVars.join(', ')}`, 'red'));
      return;
    }
    throw error;
  }
}

async function validateSaasEnvironment(): Promise<void> {
  printSection('SaaS Features Validation');
  
  try {
    validateEnvironment(true);
    console.log(colorize('✅ SaaS environment validation passed', 'green'));
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.log(colorize('❌ SaaS environment validation failed', 'red'));
      console.log(colorize(`Missing variables: ${error.missingVars.join(', ')}`, 'red'));
      return;
    }
    throw error;
  }
}

async function testApiConnections(): Promise<void> {
  printSection('API Connections Test');
  
  const config = loadEnvironmentConfig();
  const results: { name: string; status: 'success' | 'failed' | 'skipped'; message: string; }[] = [];
  
  // Test OpenAI API
  if (config.VITE_OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.VITE_OPENAI_API_KEY}`,
        },
      });
      
      if (response.ok) {
        results.push({ name: 'OpenAI API', status: 'success', message: 'Connection successful' });
      } else {
        results.push({ name: 'OpenAI API', status: 'failed', message: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      results.push({ name: 'OpenAI API', status: 'failed', message: (error as Error).message });
    }
  } else {
    results.push({ name: 'OpenAI API', status: 'skipped', message: 'API key not configured' });
  }
  
  // Test Vapi API
  if (config.VAPI_API_KEY) {
    try {
      const response = await fetch('https://api.vapi.ai/assistant', {
        headers: {
          'Authorization': `Bearer ${config.VAPI_API_KEY}`,
        },
      });
      
      if (response.status === 200 || response.status === 401) {
        results.push({ name: 'Vapi API', status: 'success', message: 'Connection successful' });
      } else {
        results.push({ name: 'Vapi API', status: 'failed', message: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      results.push({ name: 'Vapi API', status: 'failed', message: (error as Error).message });
    }
  } else {
    results.push({ name: 'Vapi API', status: 'skipped', message: 'API key not configured' });
  }
  
  // Test Google Places API
  if (config.GOOGLE_PLACES_API_KEY) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=test&inputtype=textquery&key=${config.GOOGLE_PLACES_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        results.push({ name: 'Google Places API', status: 'success', message: 'Connection successful' });
      } else {
        results.push({ name: 'Google Places API', status: 'failed', message: `API Error: ${data.status}` });
      }
    } catch (error) {
      results.push({ name: 'Google Places API', status: 'failed', message: (error as Error).message });
    }
  } else {
    results.push({ name: 'Google Places API', status: 'skipped', message: 'API key not configured' });
  }
  
  // Print results
  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    const color = result.status === 'success' ? 'green' : result.status === 'failed' ? 'red' : 'yellow';
    console.log(`${icon} ${colorize(result.name, color)}: ${result.message}`);
  }
}

async function testDatabaseConnection(): Promise<void> {
  printSection('Database Connection Test');
  
  const config = loadEnvironmentConfig();
  
  try {
    // Test database connection
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { Pool } = await import('pg');
    
    if (config.DATABASE_URL.startsWith('postgresql://')) {
      const pool = new Pool({ connectionString: config.DATABASE_URL });
      const db = drizzle(pool);
      
      await pool.query('SELECT 1');
      await pool.end();
      
      console.log(colorize('✅ PostgreSQL connection successful', 'green'));
    } else {
      // SQLite test
      const { drizzle: drizzleSQLite } = await import('drizzle-orm/better-sqlite3');
      const Database = await import('better-sqlite3');
      
      const sqlite = new Database.default(config.DATABASE_URL.replace('file:', ''));
      const db = drizzleSQLite(sqlite);
      
      sqlite.prepare('SELECT 1').get();
      sqlite.close();
      
      console.log(colorize('✅ SQLite connection successful', 'green'));
    }
  } catch (error) {
    console.log(colorize('❌ Database connection failed', 'red'));
    console.log(colorize(`Error: ${(error as Error).message}`, 'red'));
  }
}

function printEnvironmentTemplate(template: string): void {
  printSection(`${template.toUpperCase()} Environment Template`);
  
  const templateConfig = ENVIRONMENT_TEMPLATES[template as keyof typeof ENVIRONMENT_TEMPLATES];
  
  if (!templateConfig) {
    console.log(colorize('❌ Template not found', 'red'));
    return;
  }
  
  console.log(colorize('Copy these variables to your .env file:', 'cyan'));
  console.log('');
  
  Object.entries(templateConfig).forEach(([key, value]) => {
    console.log(`${colorize(key, 'yellow')}=${colorize(value, 'white')}`);
  });
}

function generateEnvFile(): void {
  printSection('Generate .env File');
  
  const envContent = `# ===============================================
# 🏨 HOTEL VOICE ASSISTANT SAAS PLATFORM
# Environment Configuration
# ===============================================

# Core Settings
NODE_ENV=development
PORT=10000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=file:./dev.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
STAFF_ACCOUNTS=admin@hotel.com:password123

# OpenAI Integration
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_PROJECT_ID=proj_your-openai-project-id-here

# Vapi Voice Assistant
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key-here
VITE_VAPI_ASSISTANT_ID=asst_your-vapi-assistant-id-here

# SaaS Features
VAPI_API_KEY=your-vapi-api-key-for-dynamic-creation
GOOGLE_PLACES_API_KEY=your-google-places-api-key
TALK2GO_DOMAIN=talk2go.online

# Multi-tenant
MINHON_TENANT_ID=minhon-default-tenant-id

# Feature Flags
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
ENABLE_MULTI_LANGUAGE_SUPPORT=true
ENABLE_ANALYTICS_DASHBOARD=true
ENABLE_BILLING_SYSTEM=false

# Optional - Email Services
# GMAIL_APP_PASSWORD=your-gmail-app-password
# MAILJET_API_KEY=your-mailjet-api-key
# MAILJET_SECRET_KEY=your-mailjet-secret-key

# Optional - Additional APIs
# YELP_API_KEY=your-yelp-api-key
# TRIPADVISOR_API_KEY=your-tripadvisor-api-key
# SOCIAL_MEDIA_SCRAPER_API_KEY=your-social-media-api-key

# Optional - Multi-language Support
# VITE_VAPI_PUBLIC_KEY_VI=pk_your-vapi-public-key-vietnamese
# VITE_VAPI_ASSISTANT_ID_VI=asst_your-vapi-assistant-id-vietnamese
# VITE_VAPI_PUBLIC_KEY_FR=pk_your-vapi-public-key-french
# VITE_VAPI_ASSISTANT_ID_FR=asst_your-vapi-assistant-id-french
`;
  
  console.log(colorize('Generated .env template:', 'cyan'));
  console.log('');
  console.log(colorize(envContent, 'white'));
  console.log('');
  console.log(colorize('💡 Copy the above content to your .env file and update with your actual values', 'yellow'));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'validate':
        printHeader('Environment Validation');
        await validateBasicEnvironment();
        break;
        
      case 'validate-saas':
        printHeader('SaaS Environment Validation');
        await validateSaasEnvironment();
        break;
        
      case 'status':
        printHeader('Environment Status');
        printEnvironmentStatus();
        break;
        
      case 'test-apis':
        printHeader('API Connections Test');
        await testApiConnections();
        break;
        
      case 'test-db':
        printHeader('Database Connection Test');
        await testDatabaseConnection();
        break;
        
      case 'health':
        printHeader('Complete Environment Health Check');
        await validateBasicEnvironment();
        await validateSaasEnvironment();
        await testApiConnections();
        await testDatabaseConnection();
        printEnvironmentStatus();
        break;
        
      case 'template':
        const templateName = args[1] || 'development';
        printHeader(`Environment Template: ${templateName}`);
        printEnvironmentTemplate(templateName);
        break;
        
      case 'generate':
        printHeader('Generate .env File');
        generateEnvFile();
        break;
        
      default:
        console.log(colorize('🔧 Environment Validation Tool', 'bright'));
        console.log('');
        console.log(colorize('Available commands:', 'cyan'));
        console.log('  validate       - Validate basic environment');
        console.log('  validate-saas  - Validate SaaS environment');
        console.log('  status         - Show environment status');
        console.log('  test-apis      - Test API connections');
        console.log('  test-db        - Test database connection');
        console.log('  health         - Complete health check');
        console.log('  template <env> - Show environment template');
        console.log('  generate       - Generate .env file template');
        console.log('');
        console.log(colorize('Examples:', 'yellow'));
        console.log('  npm run env:validate');
        console.log('  npm run env:status');
        console.log('  npm run env:health');
        console.log('  npm run env:template production');
        console.log('  npm run env:generate');
    }
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), (error as Error).message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 