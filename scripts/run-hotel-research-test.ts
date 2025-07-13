#!/usr/bin/env tsx

import { HotelResearchFlowTest } from '../tests/test-hotel-research-flow';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Test Scenarios Configuration
// ============================================

const TEST_SCENARIOS = {
  // Full production-like test with real APIs
  production: {
    databaseUrl: process.env.DATABASE_URL,
    useMockData: false,
    skipApiCalls: false,
    verbose: true,
    testTimeout: 60000,
    description: 'Full production-like test with real API calls'
  },

  // Development test with SQLite and real APIs
  development: {
    testDbPath: './dev-hotel-research-test.db',
    useMockData: false,
    skipApiCalls: false,
    verbose: true,
    testTimeout: 30000,
    description: 'Development test with SQLite and real APIs'
  },

  // Mock test (safe, no API calls, uses mock data)
  mock: {
    testDbPath: './mock-hotel-research-test.db',
    useMockData: true,
    skipApiCalls: true,
    verbose: true,
    testTimeout: 15000,
    description: 'Mock test with fake data (no API calls)'
  },

  // Quick smoke test (basic functionality check)
  smoke: {
    testDbPath: './smoke-hotel-research-test.db',
    useMockData: true,
    skipApiCalls: true,
    verbose: false,
    testTimeout: 10000,
    description: 'Quick smoke test for CI/CD'
  },

  // API-only test (focuses on API integrations)
  apiOnly: {
    testDbPath: './api-hotel-research-test.db',
    useMockData: false,
    skipApiCalls: false,
    verbose: true,
    testTimeout: 45000,
    description: 'API integration focused test'
  },

  // Error scenarios test
  errorScenarios: {
    testDbPath: './error-hotel-research-test.db',
    useMockData: false,
    skipApiCalls: false,
    verbose: true,
    testTimeout: 30000,
    description: 'Error scenarios and edge cases test'
  }
};

// ============================================
// Test Runner Class
// ============================================

class HotelResearchTestRunner {
  private resultsDir: string;

  constructor() {
    this.resultsDir = path.join(process.cwd(), 'test-results', 'hotel-research');
    this.ensureResultsDirectory();
  }

  private ensureResultsDirectory(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async runScenario(scenarioName: keyof typeof TEST_SCENARIOS): Promise<boolean> {
    console.log(`\n🧪 Running hotel research test scenario: ${scenarioName}`);
    console.log(`📝 Description: ${TEST_SCENARIOS[scenarioName].description}\n`);

    const config = TEST_SCENARIOS[scenarioName];
    const test = new HotelResearchFlowTest(config);

    try {
      const results = await test.runCompleteTest();
      
      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = path.join(this.resultsDir, `${scenarioName}-${timestamp}.json`);
      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

      // Generate and save report
      const reportFile = path.join(this.resultsDir, `${scenarioName}-${timestamp}.md`);
      fs.writeFileSync(reportFile, test.generateReport());

      console.log(`\n📊 Results saved to: ${resultsFile}`);
      console.log(`📋 Report saved to: ${reportFile}`);

      if (results.success) {
        console.log(`\n✅ Scenario '${scenarioName}' completed successfully!`);
        console.log(`🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`);
        console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
      } else {
        console.log(`\n❌ Scenario '${scenarioName}' failed!`);
        console.log(`🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`);
        console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
        console.log(`❌ Failed Tests: ${results.testsFailed}/${results.testsRun}`);
      }

      return results.success;
    } catch (error) {
      console.error(`\n💥 Scenario '${scenarioName}' crashed:`, error.message);
      return false;
    }
  }

  async runAllScenarios(): Promise<void> {
    console.log('🧪 Running all hotel research test scenarios...\n');

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: {} as Record<string, boolean>,
      startTime: Date.now()
    };

    for (const [scenarioName, _] of Object.entries(TEST_SCENARIOS)) {
      results.total++;
      const success = await this.runScenario(scenarioName as keyof typeof TEST_SCENARIOS);
      
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      results.scenarios[scenarioName] = success;
    }

    const duration = Date.now() - results.startTime;

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 HOTEL RESEARCH TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Scenarios: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${(results.passed / results.total * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
    
    console.log('\nScenario Results:');
    for (const [scenario, success] of Object.entries(results.scenarios)) {
      console.log(`  ${scenario.padEnd(15)}: ${success ? '✅' : '❌'}`);
    }

    // Save summary
    const summaryFile = path.join(this.resultsDir, `summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Summary saved to: ${summaryFile}`);

    // Exit with error code if any tests failed
    if (results.failed > 0) {
      console.log('\n❌ Some hotel research tests failed. Please review the results before proceeding.');
      process.exit(1);
    } else {
      console.log('\n✅ All hotel research tests passed! The system is working correctly.');
      process.exit(0);
    }
  }

  async runQuickTest(): Promise<void> {
    console.log('🚀 QUICK HOTEL RESEARCH TEST\n');
    
    // Run mock test first (fastest)
    console.log('1️⃣ Running mock test...');
    const mockSuccess = await this.runScenario('mock');
    
    if (!mockSuccess) {
      console.log('❌ Mock test failed! Basic functionality is broken.');
      process.exit(1);
    }

    // Run smoke test
    console.log('\n2️⃣ Running smoke test...');
    const smokeSuccess = await this.runScenario('smoke');

    if (!smokeSuccess) {
      console.log('❌ Smoke test failed! Core functionality issues detected.');
      process.exit(1);
    }

    console.log('\n✅ QUICK TEST PASSED!');
    console.log('🎉 Hotel research flow is working correctly.');
  }

  async runApiTest(): Promise<void> {
    console.log('🌐 API INTEGRATION TEST\n');
    
    // Check if API keys are configured
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.log('⚠️ Google Places API key not configured. Some tests will be skipped.');
    }

    if (!process.env.VAPI_API_KEY) {
      console.log('⚠️ Vapi API key not configured. Some tests will be skipped.');
    }

    // Run API-focused test
    console.log('🔍 Running API integration test...');
    const apiSuccess = await this.runScenario('apiOnly');

    if (!apiSuccess) {
      console.log('❌ API integration test failed! Check API configurations.');
      process.exit(1);
    }

    console.log('\n✅ API INTEGRATION TEST PASSED!');
    console.log('🎉 All API integrations are working correctly.');
  }

  async runErrorTest(): Promise<void> {
    console.log('🚨 ERROR SCENARIOS TEST\n');
    
    // Run error scenarios test
    console.log('💥 Running error scenarios test...');
    const errorSuccess = await this.runScenario('errorScenarios');

    if (!errorSuccess) {
      console.log('❌ Error scenarios test failed! Error handling needs improvement.');
      process.exit(1);
    }

    console.log('\n✅ ERROR SCENARIOS TEST PASSED!');
    console.log('🎉 Error handling is working correctly.');
  }

  generateTestMatrix(): void {
    console.log(`
🧪 HOTEL RESEARCH TEST MATRIX
=============================

Available Test Scenarios:
${Object.entries(TEST_SCENARIOS).map(([name, config]) => 
  `
📋 ${name.toUpperCase()}
   Description: ${config.description}
   Mock Data: ${config.useMockData ? 'Yes' : 'No'}
   API Calls: ${config.skipApiCalls ? 'No' : 'Yes'}
   Timeout: ${config.testTimeout}ms
`).join('')}

Test Coverage:
✅ Hotel Research Flow (Complete End-to-End)
✅ Google Places API Integration
✅ Knowledge Base Generation
✅ Vapi Assistant Creation
✅ Database Storage & Retrieval
✅ Mock Data Testing
✅ Error Scenarios
✅ API Rate Limiting
✅ Tenant Isolation

Usage Examples:
  npm run test:hotel-research scenario mock
  npm run test:hotel-research scenario production
  npm run test:hotel-research quick
  npm run test:hotel-research api
  npm run test:hotel-research errors
  npm run test:hotel-research all
`);
  }

  async validateEnvironment(): Promise<boolean> {
    console.log('🔍 Validating test environment...\n');

    const checks = [
      { name: 'Database URL', check: () => !!process.env.DATABASE_URL, required: false },
      { name: 'Google Places API Key', check: () => !!process.env.GOOGLE_PLACES_API_KEY, required: false },
      { name: 'Vapi API Key', check: () => !!process.env.VAPI_API_KEY, required: false },
      { name: 'OpenAI API Key', check: () => !!process.env.VITE_OPENAI_API_KEY, required: false },
      { name: 'Test Directory', check: () => fs.existsSync(this.resultsDir), required: true },
      { name: 'Node.js Version', check: () => process.version.startsWith('v18') || process.version.startsWith('v20'), required: true }
    ];

    let allPassed = true;
    let criticalFailed = false;

    for (const check of checks) {
      const passed = check.check();
      const status = passed ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`${status} ${check.name}: ${passed ? 'OK' : 'MISSING'}`);
      
      if (!passed) {
        allPassed = false;
        if (check.required) {
          criticalFailed = true;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    if (criticalFailed) {
      console.log('❌ ENVIRONMENT VALIDATION FAILED');
      console.log('Critical requirements are missing. Cannot proceed with tests.');
      return false;
    } else if (!allPassed) {
      console.log('⚠️ ENVIRONMENT VALIDATION PARTIAL');
      console.log('Some optional components are missing. Some tests may be skipped.');
      return true;
    } else {
      console.log('✅ ENVIRONMENT VALIDATION PASSED');
      console.log('All requirements are met. Ready to run tests.');
      return true;
    }
  }
}

// ============================================
// CLI Interface
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const scenario = args[1] as keyof typeof TEST_SCENARIOS;

  const runner = new HotelResearchTestRunner();

  switch (command) {
    case 'scenario':
      if (!scenario || !(scenario in TEST_SCENARIOS)) {
        console.error('❌ Invalid scenario. Available scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
        process.exit(1);
      }
      await runner.runScenario(scenario);
      break;

    case 'all':
      await runner.runAllScenarios();
      break;

    case 'quick':
      await runner.runQuickTest();
      break;

    case 'api':
      await runner.runApiTest();
      break;

    case 'errors':
      await runner.runErrorTest();
      break;

    case 'matrix':
      runner.generateTestMatrix();
      break;

    case 'validate':
      await runner.validateEnvironment();
      break;

    default:
      console.log(`
🧪 Hotel Research Flow Test Runner

Usage:
  npm run test:hotel-research <command> [options]

Commands:
  scenario <name>     Run specific test scenario
  all                 Run all test scenarios
  quick               Run quick test (mock + smoke)
  api                 Run API integration test
  errors              Run error scenarios test
  matrix              Show test matrix
  validate            Validate test environment

Available scenarios:
${Object.entries(TEST_SCENARIOS).map(([name, config]) => 
  `  ${name.padEnd(15)} - ${config.description}`
).join('\n')}

Examples:
  npm run test:hotel-research scenario mock
  npm run test:hotel-research scenario production
  npm run test:hotel-research quick
  npm run test:hotel-research api
  npm run test:hotel-research all
  npm run test:hotel-research validate

Environment Variables:
  DATABASE_URL              - PostgreSQL connection string
  GOOGLE_PLACES_API_KEY     - Google Places API key
  VAPI_API_KEY              - Vapi.ai API key
  VITE_OPENAI_API_KEY       - OpenAI API key
      `);
      process.exit(1);
  }
}

// Run the CLI
main().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});

export { HotelResearchTestRunner, TEST_SCENARIOS }; 