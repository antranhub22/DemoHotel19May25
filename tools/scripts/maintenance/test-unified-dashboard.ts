#!/usr/bin/env tsx

import fetch from 'node-fetch';

// Test configuration
const BASE_URL = 'http://localhost:10000';
const CLIENT_URL = 'http://localhost:3000';

// Test users with their credentials
const TEST_USERS = [
  {
    role: 'hotel-manager',
    username: 'manager',
    password: 'manager123',
    description: 'Hotel Manager (Full Access)',
    expectedPages: [
      '/unified-dashboard',
      '/unified-dashboard/analytics',
      '/unified-dashboard/staff-management',
      '/unified-dashboard/settings',
      '/unified-dashboard/guest-management',
      '/unified-dashboard/requests',
    ],
  },
  {
    role: 'front-desk',
    username: 'frontdesk',
    password: 'frontdesk123',
    description: 'Front Desk Staff (Limited Access)',
    expectedPages: [
      '/unified-dashboard',
      '/unified-dashboard/requests',
      '/unified-dashboard/guest-management',
    ],
  },
  {
    role: 'it-manager',
    username: 'itmanager',
    password: 'itmanager123',
    description: 'IT Manager (Technical Access)',
    expectedPages: [
      '/unified-dashboard',
      '/unified-dashboard/system-monitoring',
      '/unified-dashboard/security',
      '/unified-dashboard/logs',
      '/unified-dashboard/integrations',
    ],
  },
];

// All unified dashboard pages to test
const DASHBOARD_PAGES = [
  {
    path: '/unified-dashboard',
    name: 'Dashboard Home',
    description: 'Main dashboard with role-specific content',
    requiredRoles: ['hotel-manager', 'front-desk', 'it-manager'],
  },
  {
    path: '/unified-dashboard/requests',
    name: 'Customer Requests',
    description: 'Guest service requests management',
    requiredRoles: ['hotel-manager', 'front-desk'],
  },
  {
    path: '/unified-dashboard/analytics',
    name: 'Advanced Analytics',
    description: 'Detailed analytics and reporting',
    requiredRoles: ['hotel-manager'],
  },
  {
    path: '/unified-dashboard/staff-management',
    name: 'Staff Management',
    description: 'Staff accounts and role management',
    requiredRoles: ['hotel-manager'],
  },
  {
    path: '/unified-dashboard/guest-management',
    name: 'Guest Management',
    description: 'Guest information and preferences',
    requiredRoles: ['hotel-manager', 'front-desk'],
  },
  {
    path: '/unified-dashboard/system-monitoring',
    name: 'System Monitoring',
    description: 'System health and performance monitoring',
    requiredRoles: ['it-manager'],
  },
  {
    path: '/unified-dashboard/security',
    name: 'Security Settings',
    description: 'Security configuration and audit logs',
    requiredRoles: ['it-manager'],
  },
  {
    path: '/unified-dashboard/logs',
    name: 'System Logs',
    description: 'Application and system logs viewer',
    requiredRoles: ['it-manager'],
  },
  {
    path: '/unified-dashboard/integrations',
    name: 'Integrations',
    description: 'Third-party service integrations',
    requiredRoles: ['it-manager'],
  },
  {
    path: '/unified-dashboard/settings',
    name: 'Settings',
    description: 'General system and hotel settings',
    requiredRoles: ['hotel-manager'],
  },
];

interface TestResult {
  user: string;
  role: string;
  page: string;
  success: boolean;
  error?: string;
  responseTime?: number;
  statusCode?: number;
}

class UnifiedDashboardTester {
  private results: TestResult[] = [];

  async testAuthentication(): Promise<boolean> {
    console.log('🔐 Testing Authentication System...\n');

    let allPassed = true;

    for (const user of TEST_USERS) {
      const startTime = Date.now();

      try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            password: user.password,
            tenantId: 'mi-nhon-hotel',
          }),
        });

        const responseTime = Date.now() - startTime;
        const data = (await response.json()) as any;

        if (response.ok && data.success && data.token) {
          console.log(
            `✅ ${user.description}: Login successful (${responseTime}ms)`
          );
          console.log(`   Token: ${data.token.substring(0, 20)}...`);
          console.log(`   Role: ${data.user?.role}`);
        } else {
          console.log(`❌ ${user.description}: Login failed`);
          console.log(`   Status: ${response.status}`);
          console.log(`   Error: ${data.error || 'Unknown error'}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`💥 ${user.description}: Authentication error - ${error}`);
        allPassed = false;
      }

      console.log('---');
    }

    return allPassed;
  }

  async testPageAccess(): Promise<void> {
    console.log('🌐 Testing Page Access & Permissions...\n');

    for (const user of TEST_USERS) {
      console.log(`\n👤 Testing as ${user.description}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Login to get token
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
          tenantId: 'mi-nhon-hotel',
        }),
      });

      const loginData = (await loginResponse.json()) as any;
      if (!loginResponse.ok || !loginData.token) {
        console.log(`❌ Failed to login as ${user.username}`);
        continue;
      }

      const token = loginData.token;

      // Test each dashboard page
      for (const page of DASHBOARD_PAGES) {
        const shouldHaveAccess = page.requiredRoles.includes(user.role);
        const startTime = Date.now();

        try {
          // Test API endpoint if exists
          const apiPath = page.path.replace(
            '/unified-dashboard',
            '/api/dashboard'
          );
          let apiTestResult = 'N/A';

          if (page.path !== '/unified-dashboard') {
            try {
              const apiResponse = await fetch(`${BASE_URL}${apiPath}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              apiTestResult = apiResponse.ok ? '✅ API' : '❌ API';
            } catch {
              apiTestResult = '⚠️ API';
            }
          }

          const responseTime = Date.now() - startTime;

          this.results.push({
            user: user.username,
            role: user.role,
            page: page.name,
            success: shouldHaveAccess,
            responseTime,
          });

          const accessIcon = shouldHaveAccess ? '✅' : '🚫';
          const accessText = shouldHaveAccess
            ? 'SHOULD ACCESS'
            : 'SHOULD BLOCK';

          console.log(
            `${accessIcon} ${page.name.padEnd(20)} | ${accessText.padEnd(12)} | ${apiTestResult} | ${responseTime}ms`
          );
        } catch (error) {
          console.log(`💥 ${page.name.padEnd(20)} | ERROR: ${error}`);

          this.results.push({
            user: user.username,
            role: user.role,
            page: page.name,
            success: false,
            error: String(error),
          });
        }
      }
    }
  }

  async testDataFlows(): Promise<void> {
    console.log('\n📊 Testing Data Flows & API Integration...\n');

    // Test with Hotel Manager (full access)
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'manager',
        password: 'manager123',
        tenantId: 'mi-nhon-hotel',
      }),
    });

    const loginData = (await loginResponse.json()) as any;
    if (!loginResponse.ok) {
      console.log('❌ Failed to login for data flow testing');
      return;
    }

    const token = loginData.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test key API endpoints
    const apiTests = [
      { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
      { name: 'User Info', endpoint: '/api/auth/me', method: 'GET' },
      {
        name: 'Analytics Overview',
        endpoint: '/api/analytics/overview',
        method: 'GET',
      },
      {
        name: 'Service Distribution',
        endpoint: '/api/analytics/service-distribution',
        method: 'GET',
      },
      {
        name: 'Hourly Activity',
        endpoint: '/api/analytics/hourly-activity',
        method: 'GET',
      },
      {
        name: 'Staff Requests',
        endpoint: '/api/staff/requests',
        method: 'GET',
      },
    ];

    for (const test of apiTests) {
      const startTime = Date.now();

      try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
          method: test.method,
          headers,
        });

        const responseTime = Date.now() - startTime;
        const data = (await response.json()) as any;

        if (response.ok) {
          console.log(
            `✅ ${test.name.padEnd(20)} | Status: ${response.status} | Time: ${responseTime}ms`
          );
        } else {
          console.log(
            `❌ ${test.name.padEnd(20)} | Status: ${response.status} | Error: ${data.error || data.message}`
          );
        }
      } catch (error) {
        console.log(`💥 ${test.name.padEnd(20)} | Network Error: ${error}`);
      }
    }
  }

  generateReport(): void {
    console.log('\n📋 Testing Summary Report');
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
    console.log(
      `   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    // Group results by user role
    const resultsByRole = this.results.reduce(
      (acc, result) => {
        if (!acc[result.role]) acc[result.role] = [];
        acc[result.role].push(result);
        return acc;
      },
      {} as Record<string, TestResult[]>
    );

    console.log(`\n📋 Results by Role:`);
    for (const [role, results] of Object.entries(resultsByRole)) {
      const rolePassed = results.filter(r => r.success).length;
      const roleTotal = results.length;
      console.log(
        `   ${role}: ${rolePassed}/${roleTotal} (${((rolePassed / roleTotal) * 100).toFixed(1)}%)`
      );
    }

    // Show failed tests
    const failedResults = this.results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedResults.forEach(result => {
        console.log(
          `   ${result.user} (${result.role}) -> ${result.page}: ${result.error || 'Access denied'}`
        );
      });
    }

    console.log('\n🎯 Next Steps:');
    console.log('   1. Fix any failed tests above');
    console.log('   2. Test UI/UX manually in browser');
    console.log('   3. Verify responsive design on mobile');
    console.log('   4. Test performance under load');
    console.log('   5. Deploy to staging environment');
  }
}

async function runTests(): Promise<void> {
  console.log('🚀 Starting Unified Dashboard Testing Suite\n');
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  );

  const tester = new UnifiedDashboardTester();

  // Step 1: Test authentication
  const authPassed = await tester.testAuthentication();
  if (!authPassed) {
    console.log('❌ Authentication tests failed. Stopping.');
    return;
  }

  // Step 2: Test page access and permissions
  await tester.testPageAccess();

  // Step 3: Test data flows and API integration
  await tester.testDataFlows();

  // Step 4: Generate comprehensive report
  tester.generateReport();

  console.log('\n✅ Unified Dashboard Testing Suite Completed!');
  console.log(`📱 Open ${CLIENT_URL}/unified-dashboard to test UI manually`);
}

// Run the tests
runTests().catch(console.error);
