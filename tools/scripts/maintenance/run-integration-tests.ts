#!/usr/bin/env tsx

import { IntegrationTestSuite } from '../../../tests/integration-test-suite';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Integration Test Scenarios
// ============================================

const TEST_SCENARIOS = {
  // Full production-like integration test
  production: {
    databaseUrl: process.env.DATABASE_URL,
    baseUrl: 'http://localhost:3000',
    useMockData: false,
    verbose: true,
    testTimeout: 120000,
    cleanupOnFailure: false,
    description: 'Full production-like integration test with real APIs',
  },

  // Development integration test with SQLite
  development: {
    testDbPath: './dev-integration-test.db',
    baseUrl: 'http://localhost:3000',
    useMockData: false,
    verbose: true,
    testTimeout: 60000,
    cleanupOnFailure: true,
    description: 'Development integration test with SQLite and real APIs',
  },

  // Mock integration test (safe, no API calls)
  mock: {
    testDbPath: './mock-integration-test.db',
    baseUrl: 'http://localhost:3000',
    useMockData: true,
    verbose: true,
    testTimeout: 30000,
    cleanupOnFailure: true,
    description: 'Mock integration test with fake data (safe, no API calls)',
  },

  // Quick smoke test
  smoke: {
    testDbPath: './smoke-integration-test.db',
    baseUrl: 'http://localhost:3000',
    useMockData: true,
    verbose: false,
    testTimeout: 15000,
    cleanupOnFailure: true,
    description: 'Quick smoke test for CI/CD',
  },

  // Mi Nhon compatibility test only
  compatibility: {
    testDbPath: './compatibility-test.db',
    baseUrl: 'http://localhost:3000',
    useMockData: true,
    verbose: true,
    testTimeout: 20000,
    cleanupOnFailure: true,
    description: 'Mi Nhon Hotel compatibility test only',
  },
};

// ============================================
// Integration Test Runner Class
// ============================================

class IntegrationTestRunner {
  private resultsDir: string;

  constructor() {
    this.resultsDir = path.join(process.cwd(), 'test-results', 'integration');
    this.ensureResultsDirectory();
  }

  private ensureResultsDirectory(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async runScenario(
    scenarioName: keyof typeof TEST_SCENARIOS
  ): Promise<boolean> {
    console.log(`\n🧪 Running integration test scenario: ${scenarioName}`);
    console.log(
      `📝 Description: ${TEST_SCENARIOS[scenarioName].description}\n`
    );

    const config = TEST_SCENARIOS[scenarioName];
    const testSuite = new IntegrationTestSuite(config);

    try {
      const results = await testSuite.runIntegrationTests();

      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = path.join(
        this.resultsDir,
        `${scenarioName}-${timestamp}.json`
      );
      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

      // Generate and save report
      const reportFile = path.join(
        this.resultsDir,
        `${scenarioName}-${timestamp}.md`
      );
      fs.writeFileSync(reportFile, testSuite.generateReport());

      console.log(`\n📊 Results saved to: ${resultsFile}`);
      console.log(`📋 Report saved to: ${reportFile}`);

      if (results.success) {
        console.log(`\n✅ Scenario '${scenarioName}' completed successfully!`);
        console.log(
          `🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`
        );
        console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
        console.log(`🧪 Test Suites: ${results.testSuites.length}`);
        console.log(`📋 Tests Run: ${results.testsRun}`);

        // Print test suite summary
        console.log('\n📊 Test Suite Results:');
        results.testSuites.forEach(suite => {
          const status = suite.status === 'passed' ? '✅' : '❌';
          console.log(
            `  ${status} ${suite.name} (${suite.duration.toFixed(2)}ms)`
          );
        });

        // Print key functionality status
        console.log('\n🔍 Key Functionality Status:');
        console.log(
          `  Mi Nhon Compatibility: ${results.miNhonCompatibility.voiceAssistantWorking ? '✅' : '❌'}`
        );
        console.log(
          `  New Tenant Creation: ${results.newTenantFunctionality.canCreateNewTenant ? '✅' : '❌'}`
        );
        console.log(
          `  Data Isolation: ${results.dataIsolation.dataIsolationVerified ? '✅' : '❌'}`
        );
        console.log(
          `  Dashboard APIs: ${results.dashboardApis.hotelResearchWorks ? '✅' : '❌'}`
        );
        console.log(
          `  Voice Interface: ${results.voiceInterface.miNhonVoiceWorks ? '✅' : '❌'}`
        );
      } else {
        console.log(`\n❌ Scenario '${scenarioName}' failed!`);
        console.log(
          `🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`
        );
        console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
        console.log(
          `❌ Failed Tests: ${results.testsFailed}/${results.testsRun}`
        );

        // Show failed test suites
        console.log('\n❌ Failed Test Suites:');
        results.testSuites
          .filter(suite => suite.status === 'failed')
          .forEach(suite => {
            console.log(`  ❌ ${suite.name}`);
            suite.tests
              .filter(test => test.status === 'failed')
              .forEach(test => {
                console.log(`    ❌ ${test.name}: ${test.error}`);
              });
          });
      }

      return results.success;
    } catch (error) {
      console.error(`\n💥 Scenario '${scenarioName}' crashed:`, error.message);
      return false;
    }
  }

  async runAllScenarios(): Promise<void> {
    console.log('🧪 Running all integration test scenarios...\n');

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: {} as Record<string, boolean>,
      startTime: Date.now(),
    };

    for (const [scenarioName, _] of Object.entries(TEST_SCENARIOS)) {
      results.total++;
      const success = await this.runScenario(
        scenarioName as keyof typeof TEST_SCENARIOS
      );

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
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Scenarios: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(
      `Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`
    );
    console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);

    console.log('\nScenario Results:');
    for (const [scenario, success] of Object.entries(results.scenarios)) {
      console.log(`  ${scenario.padEnd(15)}: ${success ? '✅' : '❌'}`);
    }

    // Save summary
    const summaryFile = path.join(
      this.resultsDir,
      `summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Summary saved to: ${summaryFile}`);

    // Generate deployment checklist if all tests pass
    if (results.failed === 0) {
      this.generateDeploymentChecklist();
    }

    // Exit with error code if any tests failed
    if (results.failed > 0) {
      console.log(
        '\n❌ Some integration tests failed. Please review the results before proceeding.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ All integration tests passed! The system is ready for deployment.'
      );
      process.exit(0);
    }
  }

  async runCompatibilityTest(): Promise<void> {
    console.log('🏨 MI NHON HOTEL COMPATIBILITY TEST\n');

    // Run compatibility-focused test
    console.log('🔍 Running Mi Nhon Hotel compatibility test...');
    const compatibilitySuccess = await this.runScenario('compatibility');

    if (!compatibilitySuccess) {
      console.log(
        '❌ Mi Nhon Hotel compatibility test failed! Migration may have broken existing functionality.'
      );
      process.exit(1);
    }

    console.log('\n✅ MI NHON HOTEL COMPATIBILITY TEST PASSED!');
    console.log(
      '🎉 Mi Nhon Hotel functionality remains unchanged after migration.'
    );
  }

  async runPreDeploymentTest(): Promise<void> {
    console.log('🚨 PRE-DEPLOYMENT INTEGRATION TEST\n');

    // Run critical tests in order
    const criticalTests = ['mock', 'compatibility', 'production'];

    for (const testName of criticalTests) {
      console.log(
        `${criticalTests.indexOf(testName) + 1}️⃣ Running ${testName} test...`
      );
      const success = await this.runScenario(
        testName as keyof typeof TEST_SCENARIOS
      );

      if (!success) {
        console.log(`❌ ${testName} test failed! DO NOT DEPLOY.`);
        process.exit(1);
      }
    }

    console.log('\n✅ PRE-DEPLOYMENT TEST PASSED!');
    console.log('🚀 System is ready for production deployment.');

    // Generate deployment checklist
    this.generateDeploymentChecklist();
  }

  async validateEnvironment(): Promise<boolean> {
    console.log('🔍 Validating integration test environment...\n');

    const checks = [
      {
        name: 'Database URL',
        check: () => !!process.env.DATABASE_URL,
        required: false,
      },
      {
        name: 'Server Running',
        check: () => this.checkServerHealth(),
        required: true,
      },
      {
        name: 'Google Places API Key',
        check: () => !!process.env.GOOGLE_PLACES_API_KEY,
        required: false,
      },
      {
        name: 'Vapi API Key',
        check: () => !!process.env.VAPI_API_KEY,
        required: false,
      },
      {
        name: 'OpenAI API Key',
        check: () => !!process.env.VITE_OPENAI_API_KEY,
        required: false,
      },
      {
        name: 'Test Directory',
        check: () => fs.existsSync(this.resultsDir),
        required: true,
      },
      {
        name: 'Node.js Version',
        check: () =>
          process.version.startsWith('v18') ||
          process.version.startsWith('v20'),
        required: true,
      },
    ];

    let allPassed = true;
    let criticalFailed = false;

    for (const check of checks) {
      let passed = false;
      try {
        passed = await check.check();
      } catch (error) {
        passed = false;
      }

      const status = passed ? '✅' : check.required ? '❌' : '⚠️';
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
      console.log(
        'Critical requirements are missing. Cannot proceed with integration tests.'
      );
      return false;
    } else if (!allPassed) {
      console.log('⚠️ ENVIRONMENT VALIDATION PARTIAL');
      console.log(
        'Some optional components are missing. Some tests may be skipped.'
      );
      return true;
    } else {
      console.log('✅ ENVIRONMENT VALIDATION PASSED');
      console.log('All requirements are met. Ready to run integration tests.');
      return true;
    }
  }

  private async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:3000/api/db-test', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  generateTestMatrix(): void {
    console.log(`
🧪 INTEGRATION TEST MATRIX
===========================

Available Test Scenarios:
${Object.entries(TEST_SCENARIOS)
  .map(
    ([name, config]) =>
      `
📋 ${name.toUpperCase()}
   Description: ${config.description}
   Mock Data: ${config.useMockData ? 'Yes' : 'No'}
   Database: ${'databaseUrl' in config && config.databaseUrl ? 'PostgreSQL' : 'SQLite'}
   Timeout: ${config.testTimeout}ms
   Cleanup: ${config.cleanupOnFailure ? 'Yes' : 'No'}
`
  )
  .join('')}

Test Coverage:
✅ Mi Nhon Hotel Compatibility
  - Voice assistant functionality unchanged
  - Existing data preserved
  - All features working
  - No performance degradation
  - API endpoints unchanged

✅ New Tenant Creation
  - End-to-end tenant creation
  - Isolated data storage
  - Setup wizard functionality
  - Assistant generation
  - Feature access control

✅ Multi-Tenant Data Isolation
  - Complete data separation
  - Cross-tenant access blocked
  - Query filtering working
  - Tenant-specific data views

✅ Dashboard APIs
  - Hotel research API
  - Assistant generation API
  - Analytics API
  - Settings API
  - Multi-tenant data correctness

✅ Voice Interface
  - Mi Nhon voice assistant
  - New tenant voice assistants
  - Tenant-specific knowledge
  - Assistant isolation

Usage Examples:
  npm run test:integration scenario mock
  npm run test:integration scenario production
  npm run test:integration compatibility
  npm run test:integration pre-deploy
  npm run test:integration all
`);
  }

  private generateDeploymentChecklist(): void {
    const checklistFile = path.join(
      this.resultsDir,
      `deployment-checklist-${new Date().toISOString().replace(/[:.]/g, '-')}.md`
    );

    const checklist = `
# 🚀 Deployment Checklist - Multi-Tenant Migration

## Pre-Deployment Verification ✅

### Integration Tests
- [ ] All integration test scenarios passed
- [ ] Mi Nhon Hotel compatibility verified
- [ ] New tenant creation working
- [ ] Data isolation confirmed
- [ ] Dashboard APIs functional
- [ ] Voice interface working

### Database Migration
- [ ] Database migration tests passed
- [ ] Backup procedures verified
- [ ] Rollback procedures tested
- [ ] Data integrity confirmed

### API Testing
- [ ] Hotel research flow tested
- [ ] Dashboard endpoints verified
- [ ] Voice assistant APIs working
- [ ] Authentication/authorization tested

## Deployment Steps

### 1. Pre-Deployment
\`\`\`bash
# Run final integration tests
npm run test:integration pre-deploy

# Verify environment
npm run test:integration validate

# Check server status
curl http://localhost:3000/api/db-test
\`\`\`

### 2. Database Migration
\`\`\`bash
# Run database migration
npm run migration:run

# Verify migration
npm run migration:verify
\`\`\`

### 3. Post-Deployment Verification
\`\`\`bash
# Test Mi Nhon Hotel functionality
npm run test:integration compatibility

# Test new tenant creation
npm run test:integration scenario mock

# Full system test
npm run test:integration scenario production
\`\`\`

## Monitoring & Alerts

### Key Metrics to Monitor
- [ ] Mi Nhon Hotel voice assistant uptime
- [ ] New tenant creation success rate
- [ ] Database query performance
- [ ] API response times
- [ ] Error rates by tenant

### Alert Thresholds
- Response time > 2 seconds
- Error rate > 1%
- Database connection failures
- Voice assistant failures

## Rollback Procedures

### If Migration Fails
1. Stop application immediately
2. Restore from backup
3. Verify Mi Nhon Hotel functionality
4. Investigate and fix issues
5. Re-run migration tests

### If Post-Deployment Issues
1. Check monitoring dashboards
2. Review error logs
3. Test specific failing components
4. Apply hotfixes or rollback if needed

## Success Criteria

- [ ] Mi Nhon Hotel works exactly as before
- [ ] New tenants can be created successfully
- [ ] Data is properly isolated between tenants
- [ ] Dashboard functionality works for all tenants
- [ ] Voice interface works for all hotels
- [ ] No performance degradation
- [ ] All automated tests passing

---
Generated on: ${new Date().toISOString()}
Ready for Production Deployment: ✅
`;

    fs.writeFileSync(checklistFile, checklist);
    console.log(`\n📋 Deployment checklist saved to: ${checklistFile}`);
  }
}

// ============================================
// CLI Interface
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const scenario = args[1] as keyof typeof TEST_SCENARIOS;

  const runner = new IntegrationTestRunner();

  switch (command) {
    case 'scenario':
      if (!scenario || !(scenario in TEST_SCENARIOS)) {
        console.error(
          '❌ Invalid scenario. Available scenarios:',
          Object.keys(TEST_SCENARIOS).join(', ')
        );
        process.exit(1);
      }
      await runner.runScenario(scenario);
      break;

    case 'all':
      await runner.runAllScenarios();
      break;

    case 'compatibility':
      await runner.runCompatibilityTest();
      break;

    case 'pre-deploy':
      await runner.runPreDeploymentTest();
      break;

    case 'matrix':
      runner.generateTestMatrix();
      break;

    case 'validate':
      await runner.validateEnvironment();
      break;

    default:
      console.log(`
🧪 Integration Test Runner

Usage:
  npm run test:integration <command> [options]

Commands:
  scenario <name>     Run specific test scenario
  all                 Run all test scenarios
  compatibility       Run Mi Nhon Hotel compatibility test
  pre-deploy          Run pre-deployment test
  matrix              Show test matrix
  validate            Validate test environment

Available scenarios:
${Object.entries(TEST_SCENARIOS)
  .map(([name, config]) => `  ${name.padEnd(15)} - ${config.description}`)
  .join('\n')}

Examples:
  npm run test:integration scenario mock
  npm run test:integration scenario production
  npm run test:integration compatibility
  npm run test:integration pre-deploy
  npm run test:integration all
  npm run test:integration validate

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
  console.error('💥 Integration test runner crashed:', error);
  process.exit(1);
});

export { IntegrationTestRunner, TEST_SCENARIOS };
