#!/usr/bin/env node

/**
 * 🔧 COMPREHENSIVE 500 ERROR DEBUG SCRIPT
 * Identifies and fixes all potential causes of request 500 errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 DEBUGGING 500 REQUEST ERRORS...\n');

// ============================================
// 1. ENVIRONMENT VARIABLES CHECK
// ============================================
console.log('📋 1. CHECKING ENVIRONMENT VARIABLES:');

const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'PORT'
];

const envIssues = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`   ❌ ${varName}: Missing`);
    envIssues.push(varName);
  } else {
    console.log(`   ✅ ${varName}: ${varName === 'DATABASE_URL' ? value.substring(0, 30) + '...' : value}`);
  }
});

if (envIssues.length > 0) {
  console.log(`\n⚠️  Missing environment variables: ${envIssues.join(', ')}`);
  console.log('💡 Solution: Create .env file with required variables\n');
}

// ============================================
// 2. DATABASE CONNECTION CHECK
// ============================================
console.log('🗄️  2. CHECKING DATABASE CONNECTION:');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('   ❌ DATABASE_URL not set');
} else if (databaseUrl.includes('sqlite://')) {
  console.log('   ⚠️  Using SQLite (development mode)');
} else if (databaseUrl.includes('postgresql://')) {
  console.log('   ✅ PostgreSQL URL detected');
  console.log('   📡 Testing connection...');
  
  // Test database connection
  testDatabaseConnection(databaseUrl);
} else {
  console.log('   ❌ Unknown database format');
}

// ============================================
// 3. REQUEST SERVICE CHECK
// ============================================
console.log('\n📝 3. CHECKING REQUEST SERVICE:');

const requestServicePath = path.join(__dirname, 'apps/server/services/RequestService.ts');
const requestControllerPath = path.join(__dirname, 'apps/server/controllers/requestController.ts');

if (fs.existsSync(requestServicePath)) {
  console.log('   ✅ RequestService.ts exists');
} else {
  console.log('   ❌ RequestService.ts missing');
}

if (fs.existsSync(requestControllerPath)) {
  console.log('   ✅ requestController.ts exists');
} else {
  console.log('   ❌ requestController.ts missing');
}

// ============================================
// 4. MIDDLEWARE CHECK
// ============================================
console.log('\n🛡️  4. CHECKING MIDDLEWARE:');

const middlewarePath = path.join(__dirname, 'apps/server/middleware');
if (fs.existsSync(middlewarePath)) {
  const middlewareFiles = fs.readdirSync(middlewarePath);
  console.log(`   ✅ Middleware directory exists with ${middlewareFiles.length} files`);
  
  // Check for problematic middleware
  const problematicMiddleware = [
    'authMiddleware.ts',
    'debuggingMiddleware.ts',
    'requestValidation.ts'
  ];
  
  problematicMiddleware.forEach(file => {
    if (middlewareFiles.includes(file)) {
      console.log(`   ⚠️  ${file} found - potential 500 error source`);
    }
  });
} else {
  console.log('   ❌ Middleware directory missing');
}

// ============================================
// 5. ROUTES CHECK
// ============================================
console.log('\n🛣️  5. CHECKING ROUTES:');

const routesPath = path.join(__dirname, 'apps/server/routes');
if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath, { recursive: true });
  console.log(`   ✅ Routes directory exists with ${routeFiles.length} files`);
} else {
  console.log('   ❌ Routes directory missing');
}

// ============================================
// 6. DEPENDENCY CHECK
// ============================================
console.log('\n📦 6. CHECKING DEPENDENCIES:');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const criticalDeps = [
      'express',
      'drizzle-orm', 
      'pg',
      'better-sqlite3'
    ];
    
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`   ❌ ${dep}: Missing`);
      }
    });
  } catch (error) {
    console.log('   ❌ Error reading package.json');
  }
} else {
  console.log('   ❌ package.json not found');
}

// ============================================
// 7. SOLUTIONS SUMMARY
// ============================================
console.log('\n💡 SOLUTIONS TO FIX 500 ERRORS:');
console.log('======================================');

if (envIssues.length > 0) {
  console.log('🔧 1. Fix Environment Variables:');
  console.log('   - Create/update .env file');
  console.log('   - Add missing variables:', envIssues.join(', '));
  console.log('');
}

console.log('🔧 2. Fix Database Connection:');
console.log('   - Get latest DATABASE_URL from Render Dashboard');
console.log('   - Update .env file with correct URL');
console.log('   - Run: node test-database-connection.js');
console.log('');

console.log('🔧 3. Restart Application:');
console.log('   - Stop current server');
console.log('   - Run: npm install (if needed)');
console.log('   - Run: npm run dev or npm start');
console.log('');

console.log('🔧 4. Test API Endpoints:');
console.log('   - Check: GET /api/requests');
console.log('   - Check: POST /api/requests');
console.log('   - Monitor server logs for errors');

// ============================================
// HELPER FUNCTIONS
// ============================================

async function testDatabaseConnection(url) {
  try {
    const { Client } = require('pg');
    const client = new Client({ connectionString: url });
    
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    if (error.code === '28P01') {
      console.log('   💡 Solution: Update DATABASE_URL from Render Dashboard');
    }
  }
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Update DATABASE_URL in .env file');
console.log('2. Run: node test-database-connection.js');  
console.log('3. Start server: npm run dev');
console.log('4. Test API: curl http://localhost:10000/api/requests');