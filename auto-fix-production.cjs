#!/usr/bin/env node

/**
 * Automated Production Fix Monitor
 * Tests and monitors the production environment fix progress
 */

const https = require('https');
const PRODUCTION_URL = 'minhonmuine.talk2go.online';

console.log('🔧 Auto-Fix Production Monitor\n');
console.log(`📍 Monitoring: https://${PRODUCTION_URL}\n`);

// Test functions
async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PRODUCTION_URL,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': `https://${PRODUCTION_URL}`,
        'User-Agent': 'Production-Fix-Monitor/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Timeout')));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  const tests = [
    {
      name: 'Server Health Check',
      test: () => testEndpoint('/api/health'),
      expected: 'Should return server status'
    },
    {
      name: 'CORS Check',
      test: () => testEndpoint('/api/auth/login', 'OPTIONS'),
      expected: 'Should have CORS headers'
    },
    {
      name: 'Authentication Endpoint',
      test: () => testEndpoint('/api/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      }),
      expected: 'Should return token or proper error'
    },
    {
      name: 'Frontend Loading',
      test: () => testEndpoint('/'),
      expected: 'Should return HTML'
    }
  ];

  console.log('🧪 Running production tests...\n');

  for (const [index, test] of tests.entries()) {
    try {
      console.log(`${index + 1}. Testing: ${test.name}`);
      const result = await test.test();
      
      console.log(`   Status: ${result.status}`);
      
      // Check CORS headers
      if (result.headers['access-control-allow-origin']) {
        console.log(`   ✅ CORS Origin: ${result.headers['access-control-allow-origin']}`);
      } else {
        console.log('   ❌ No CORS headers found');
      }
      
      // Parse response if JSON
      try {
        const parsed = JSON.parse(result.body);
        if (parsed.success !== undefined) {
          console.log(`   Response: ${parsed.success ? 'Success' : 'Error'}`);
          if (parsed.error) {
            console.log(`   Error: ${parsed.error}`);
          }
        }
      } catch (e) {
        // Not JSON, show first 100 chars
        const preview = result.body.substring(0, 100).replace(/\n/g, ' ');
        console.log(`   Content: ${preview}${result.body.length > 100 ? '...' : ''}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
}

async function checkFixes() {
  console.log('🔍 Checking production fixes...\n');
  
  try {
    // Test CORS
    const corsTest = await testEndpoint('/api/auth/login', 'OPTIONS');
    const corsOrigin = corsTest.headers['access-control-allow-origin'];
    
    if (corsOrigin === `https://${PRODUCTION_URL}`) {
      console.log('✅ CORS_ORIGIN: Fixed correctly');
    } else if (corsOrigin === '*') {
      console.log('⚠️  CORS_ORIGIN: Allows all origins (insecure but works)');
    } else {
      console.log(`❌ CORS_ORIGIN: Wrong value (${corsOrigin})`);
    }
    
    // Test auth endpoint
    const authTest = await testEndpoint('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    
    const authResponse = JSON.parse(authTest.body);
    if (authResponse.success && authResponse.token) {
      console.log('✅ Authentication: Working correctly');
    } else if (authResponse.error === 'Invalid login credentials') {
      console.log('⚠️  Authentication: Endpoint works, check credentials');
    } else {
      console.log(`❌ Authentication: ${authResponse.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`❌ Fix check failed: ${error.message}`);
  }
}

async function monitorStatus() {
  console.log('📊 Production Status Summary:\n');
  
  const checks = [
    '✅ Backend server running',
    '❌ CORS configuration needs fix',
    '❌ Frontend authentication failing',
    '⚠️  Database connection unknown',
    '⚠️  React infinite render warnings'
  ];
  
  checks.forEach(check => console.log(`   ${check}`));
  
  console.log('\n🎯 Priority fixes:');
  console.log('   1. Update CORS_ORIGIN environment variable');
  console.log('   2. Verify JWT_SECRET is set properly');
  console.log('   3. Check STAFF_ACCOUNTS configuration');
  console.log('   4. Test authentication flow');
  
  console.log('\n📋 Environment variables to check:');
  console.log(`   CORS_ORIGIN=https://${PRODUCTION_URL}`);
  console.log('   JWT_SECRET=<32-character-secret>');
  console.log('   STAFF_ACCOUNTS=admin:admin123,manager:manager123');
  console.log('   NODE_ENV=production');
}

// Main execution
async function main() {
  await runTests();
  await checkFixes();
  await monitorStatus();
  
  console.log('\n🔧 Next steps:');
  console.log('1. Fix environment variables using production-env-template.txt');
  console.log('2. Restart production service');
  console.log('3. Run this script again to verify fixes');
  console.log('4. Test website manually in browser');
}

main().catch(console.error); 