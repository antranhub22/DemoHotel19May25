#!/usr/bin/env ts-node

import axios from 'axios';

// Configuration
const BASE_URL = 'https://minhonmuine.talk2go.online';
const TEST_CREDENTIALS = {
  email: 'admin@hotel.com',
  password: 'StrongPassword123'
};

interface AuthResponse {
  token: string;
  user: {
    username: string;
    email: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

interface MeResponse {
  user: {
    username: string;
    email: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

async function testAuthRoutes() {
  console.log('🧪 Testing Authentication Routes...');
  console.log('Base URL:', BASE_URL);
  console.log('Test Credentials:', TEST_CREDENTIALS);
  console.log('');

  try {
    // Test 1: Login
    console.log('1. Testing POST /api/auth/login...');
    const loginResponse = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/login`, TEST_CREDENTIALS, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
      
      const { token, user, tenant } = loginResponse.data;
      
      // Test 2: Me endpoint
      console.log('\n2. Testing GET /api/auth/me...');
      const meResponse = await axios.get<MeResponse>(`${BASE_URL}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        withCredentials: true
      });

      if (meResponse.status === 200) {
        console.log('✅ Me endpoint successful!');
        console.log('Response data:', JSON.stringify(meResponse.data, null, 2));
        
        // Verify data consistency
        console.log('\n3. Verifying data consistency...');
        if (user.username === meResponse.data.user.username && 
            user.tenantId === meResponse.data.user.tenantId) {
          console.log('✅ Data consistency verified!');
        } else {
          console.log('❌ Data inconsistency detected!');
        }
        
        console.log('\n🎉 All authentication tests passed!');
      } else {
        console.log('❌ Me endpoint failed:', meResponse.status);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.status);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
    }
  }
}

// Test other endpoints for comparison
async function testOtherEndpoints() {
  console.log('\n🔍 Testing Other Endpoints for Comparison...');
  
  const endpoints = [
    '/api/health',
    '/api/health/test',
    '/api/staff/requests',
    '/api/orders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        withCredentials: true
      });
      console.log(`✅ ${endpoint}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.statusText}`);
      } else {
        console.log(`❌ ${endpoint}: ${error}`);
      }
    }
  }
}

// Run tests
async function main() {
  await testAuthRoutes();
  await testOtherEndpoints();
}

main().catch(console.error); 