#!/usr/bin/env node

/**
 * END-TO-END UNIFIED AUTH SYSTEM TEST
 * Tests all unified auth endpoints with different scenarios
 */

const BASE_URL = 'http://localhost:10000';

// Test credentials
const TEST_CREDENTIALS = [
  { username: 'admin', password: 'admin123', expectedRole: 'admin' },
  { username: 'frontdesk', password: 'frontdesk123', expectedRole: 'front-desk' },
  { username: 'manager', password: 'manager123', expectedRole: 'hotel-manager' }
];

/**
 * Make HTTP request with error handling
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  console.log(`\n🌐 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📦 Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`   ❌ Request failed:`, error.message);
    return { error };
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log('\n🏥 === HEALTH CHECK ===');
  
  const { response } = await makeRequest('/api/health');
  
  if (response?.status === 200) {
    console.log('   ✅ Server is running');
    return true;
  } else {
    console.log('   ❌ Server is not responding');
    return false;
  }
}

/**
 * Test 2: Login Flow
 */
async function testLoginFlow(credentials) {
  console.log(`\n🔐 === LOGIN TEST: ${credentials.username} ===`);
  
  // Test unified login endpoint
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  if (response?.status === 200 && data.success && data.token) {
    console.log(`   ✅ Login successful for ${credentials.username}`);
    console.log(`   🎫 Token: ${data.token.substring(0, 20)}...`);
    console.log(`   👤 Role: ${data.user?.role}`);
    
    // Verify role matches expected
    if (data.user?.role === credentials.expectedRole) {
      console.log(`   ✅ Role verification passed`);
    } else {
      console.log(`   ⚠️ Role mismatch: expected ${credentials.expectedRole}, got ${data.user?.role}`);
    }
    
    return data.token;
  } else {
    console.log(`   ❌ Login failed for ${credentials.username}`);
    return null;
  }
}

/**
 * Test 3: Protected Endpoint Access
 */
async function testProtectedEndpoint(token, username) {
  console.log(`\n🔒 === PROTECTED ENDPOINT TEST: ${username} ===`);
  
  // Test /api/auth/me endpoint
  const { response, data } = await makeRequest('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response?.status === 200) {
    console.log(`   ✅ Protected endpoint access successful`);
    console.log(`   👤 User info: ${data.user?.username} (${data.user?.role})`);
    return true;
  } else {
    console.log(`   ❌ Protected endpoint access failed`);
    return false;
  }
}

/**
 * Test 4: Legacy Endpoint Backward Compatibility
 */
async function testBackwardCompatibility() {
  console.log('\n🔄 === BACKWARD COMPATIBILITY TEST ===');
  
  // Test legacy staff login endpoint
  const { response, data } = await makeRequest('/api/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  if (response?.status === 200 && data.deprecated) {
    console.log('   ✅ Legacy endpoint works with deprecation warning');
    console.log(`   ⚠️ Deprecation notice: ${data.migration}`);
    return true;
  } else if (response?.status === 404) {
    console.log('   ℹ️ Legacy endpoint not found (expected if removed)');
    return true;
  } else {
    console.log('   ❌ Legacy endpoint failed unexpectedly');
    return false;
  }
}

/**
 * Test 5: Token Refresh Flow
 */
async function testTokenRefresh(token) {
  console.log('\n🔄 === TOKEN REFRESH TEST ===');
  
  const { response, data } = await makeRequest('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: 'dummy-refresh-token' })
  });
  
  if (response?.status === 200 || response?.status === 401) {
    console.log('   ✅ Refresh endpoint responds correctly');
    return true;
  } else {
    console.log('   ❌ Refresh endpoint failed');
    return false;
  }
}

/**
 * Test 6: Invalid Token Handling
 */
async function testInvalidToken() {
  console.log('\n🚫 === INVALID TOKEN TEST ===');
  
  const { response, data } = await makeRequest('/api/auth/me', {
    headers: {
      'Authorization': 'Bearer invalid-token-12345'
    }
  });
  
  if (response?.status === 401) {
    console.log('   ✅ Invalid token correctly rejected');
    return true;
  } else {
    console.log('   ❌ Invalid token handling failed');
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 UNIFIED AUTH SYSTEM - END-TO-END TESTING');
  console.log('===============================================');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Wait for server to be ready
  console.log('\n⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 1: Health Check
  results.total++;
  if (await testHealthCheck()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n❌ Server not ready, aborting tests');
    return results;
  }
  
  // Test 2: Login for each user type
  const tokens = {};
  for (const creds of TEST_CREDENTIALS) {
    results.total++;
    const token = await testLoginFlow(creds);
    if (token) {
      results.passed++;
      tokens[creds.username] = token;
    } else {
      results.failed++;
    }
  }
  
  // Test 3: Protected endpoints
  for (const [username, token] of Object.entries(tokens)) {
    results.total++;
    if (await testProtectedEndpoint(token, username)) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Test 4: Backward compatibility
  results.total++;
  if (await testBackwardCompatibility()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 5: Token refresh
  const firstToken = Object.values(tokens)[0];
  if (firstToken) {
    results.total++;
    if (await testTokenRefresh(firstToken)) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Test 6: Invalid token handling
  results.total++;
  if (await testInvalidToken()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Final results
  console.log('\n📊 === TEST RESULTS SUMMARY ===');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Unified auth system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the output above.');
  }
  
  return results;
}

// Run tests if called directly
runAllTests().catch(console.error); 