#!/usr/bin/env tsx

import { DatabaseMigrationTest } from '../../migrations/test-migration';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Test Configurations
// ============================================

const TEST_SCENARIOS = {
  // Full production-like test
  production: {
    databaseUrl: process.env.DATABASE_URL,
    isDryRun: false,
    skipBackup: false,
    verbose: true,
    description: 'Full production-like migration test with PostgreSQL',
  },

  // SQLite development test
  development: {
    testDbPath: './dev-migration-test.db',
    isDryRun: false,
    skipBackup: false,
    verbose: true,
    description: 'Development migration test with SQLite',
  },

  // Dry run test (safe preview)
  dryRun: {
    databaseUrl: process.env.DATABASE_URL,
    isDryRun: true,
    skipBackup: true,
    verbose: true,
    description: 'Dry run migration test (no actual changes)',
  },

  // Quick smoke test
  smoke: {
    isDryRun: true,
    skipBackup: true,
    verbose: false,
    description: 'Quick smoke test for CI/CD',
  },
};

// ============================================
// Test Runner Class
// ============================================

class MigrationTestRunner {
  private resultsDir: string;

  constructor() {
    this.resultsDir = './test-results/migration';
    fs.mkdirSync(this.resultsDir, { recursive: true });
  }

  async runScenario(
    scenarioName: keyof typeof TEST_SCENARIOS
  ): Promise<boolean> {
    console.log(`\n🚀 Running migration test scenario: ${scenarioName}`);
    console.log(
      `📝 Description: ${TEST_SCENARIOS[scenarioName].description}\n`
    );

    const config = TEST_SCENARIOS[scenarioName];
    const test = new DatabaseMigrationTest(config);

    try {
      const results = await test.runMigrationTest();

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
      fs.writeFileSync(reportFile, test.generateReport());

      console.log(`\n📊 Results saved to: ${resultsFile}`);
      console.log(`📋 Report saved to: ${reportFile}`);

      if (results.success) {
        console.log(`\n✅ Scenario '${scenarioName}' completed successfully!`);
      } else {
        console.log(`\n❌ Scenario '${scenarioName}' failed!`);
      }

      return results.success;
    } catch (error) {
      console.error(`\n💥 Scenario '${scenarioName}' crashed:`, (error as any)?.message || String(error));
      return false;
    }
  }

  async runAllScenarios(): Promise<void> {
    console.log('🧪 Running all migration test scenarios...\n');

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: {} as Record<string, boolean>,
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

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Scenarios: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(
      `Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`
    );

    console.log('\nScenario Results:');
    for (const [scenario, success] of Object.entries(results.scenarios)) {
      console.log(`  ${scenario}: ${success ? '✅' : '❌'}`);
    }

    // Save summary
    const summaryFile = path.join(
      this.resultsDir,
      `summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Summary saved to: ${summaryFile}`);

    // Exit with error code if any tests failed
    if (results.failed > 0) {
      console.log(
        '\n❌ Some migration tests failed. Please review the results before proceeding.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ All migration tests passed! Ready for production deployment.'
      );
      process.exit(0);
    }
  }

  async runPreDeploymentCheck(): Promise<void> {
    console.log('🚨 PRE-DEPLOYMENT MIGRATION CHECK\n');

    // Run dry run first
    console.log('1️⃣ Running dry run test...');
    const dryRunSuccess = await this.runScenario('dryRun');

    if (!dryRunSuccess) {
      console.log('❌ Dry run failed! Aborting pre-deployment check.');
      process.exit(1);
    }

    // Run production test if dry run passes
    console.log('\n2️⃣ Running production test...');
    const productionSuccess = await this.runScenario('production');

    if (!productionSuccess) {
      console.log('❌ Production test failed! DO NOT DEPLOY.');
      process.exit(1);
    }

    console.log('\n✅ PRE-DEPLOYMENT CHECK PASSED!');
    console.log('🚀 Migration is ready for production deployment.');

    // Generate deployment checklist
    this.generateDeploymentChecklist();
  }

  private generateDeploymentChecklist(): void {
    const checklist = `
# 🚀 PRODUCTION MIGRATION DEPLOYMENT CHECKLIST

## Pre-Deployment Steps
- [x] Migration test passed
- [ ] Database backup completed
- [ ] Rollback plan prepared
- [ ] Maintenance window scheduled
- [ ] Team notified

## Deployment Steps
1. **Schedule maintenance window**
   - Notify users of upcoming maintenance
   - Set up maintenance page

2. **Create production backup**
   \`\`\`bash
   # PostgreSQL backup
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
   \`\`\`

3. **Run migration**
   \`\`\`bash
   npm run migration:run
   \`\`\`

4. **Verify migration**
   \`\`\`bash
   npm run migration:verify
   \`\`\`

5. **Test application**
   - Verify Mi Nhon Hotel functionality
   - Test basic voice assistant features
   - Check dashboard access

## Post-Deployment Steps
- [ ] Application tested and working
- [ ] Performance metrics normal
- [ ] Error logs reviewed
- [ ] Team notified of completion

## Rollback Plan (if needed)
\`\`\`bash
# Stop application
npm run stop

# Restore backup
psql $DATABASE_URL < backup-TIMESTAMP.sql

# Restart application
npm run start
\`\`\`

## Emergency Contacts
- Database Team: [contact]
- DevOps Team: [contact]
- Product Team: [contact]

---
Generated: ${new Date().toISOString()}
    `.trim();

    const checklistFile = path.join(this.resultsDir, 'deployment-checklist.md');
    fs.writeFileSync(checklistFile, checklist);
    console.log(`📋 Deployment checklist saved to: ${checklistFile}`);
  }
}

// ============================================
// CLI Interface
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const scenario = args[1] as keyof typeof TEST_SCENARIOS;

  const runner = new MigrationTestRunner();

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

    case 'pre-deploy':
      await runner.runPreDeploymentCheck();
      break;

    default:
      console.log(`
🧪 Migration Test Runner

Usage:
  npm run migration:test scenario <scenario>  - Run specific test scenario
  npm run migration:test all                 - Run all test scenarios  
  npm run migration:test pre-deploy          - Run pre-deployment check

Available scenarios:
${Object.entries(TEST_SCENARIOS)
  .map(([name, config]) => `  ${name.padEnd(12)} - ${config.description}`)
  .join('\n')}

Examples:
  npm run migration:test scenario dryRun
  npm run migration:test scenario production
  npm run migration:test all
  npm run migration:test pre-deploy
      `);
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MigrationTestRunner, TEST_SCENARIOS };
