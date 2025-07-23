#!/usr/bin/env tsx

/**
 * Quick API connectivity test
 * Tests if API endpoints return JSON instead of HTML
 */

const BASE_URL = 'https://minhonmuine.talk2go.online';

async function testApiEndpoint(endpoint: string) {
  try {
    console.log(`Testing: ${BASE_URL}${endpoint}`);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
      const data = await response.json();
      console.log(`✅ ${endpoint} - OK (JSON response)`);
      return true;
    } else {
      const text = await response.text();
      if (text.includes('<!DOCTYPE')) {
        console.log(`❌ ${endpoint} - FAIL (HTML response instead of JSON)`);
        return false;
      } else {
        console.log(`⚠️  ${endpoint} - Unknown content type: ${contentType}`);
        return false;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`❌ ${endpoint} - TIMEOUT: Request timed out after 10s`);
    } else {
      console.log(`❌ ${endpoint} - ERROR: ${error}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing API connectivity...\n');

  const endpoints = [
    '/api/health',
    '/api/health/database',
    '/api/health/environment',
    '/api/health/assets',
    '/api/dashboard/overview',
    '/api/staff/login',
  ];

  const results: { endpoint: string; success: boolean }[] = [];

  for (const endpoint of endpoints) {
    const success = await testApiEndpoint(endpoint);
    results.push({ endpoint, success });
    console.log(''); // Empty line for readability
  }

  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All API endpoints returning JSON correctly!');
  } else {
    console.log('⚠️  Some endpoints still returning HTML instead of JSON');
    console.log('Wait for Render rebuild to complete and try again');
  }
}

runTests().catch(console.error);
