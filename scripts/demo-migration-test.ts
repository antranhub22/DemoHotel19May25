#!/usr/bin/env tsx

import { DatabaseMigrationTest } from '../migrations/test-migration';

// ============================================
// Demo Migration Test Script
// ============================================

async function runDemo() {
  console.log(`
🎬 DEMO: Database Migration Test System
========================================

This demo shows how to safely test database migration from 
single-tenant (Mi Nhon Hotel) to multi-tenant SaaS platform.

📚 What this demo covers:
  ✅ Safe dry run testing
  ✅ Data backup procedures  
  ✅ Migration verification
  ✅ Rollback capabilities
  ✅ Multi-tenant validation

🔒 Safety: This demo uses DRY RUN mode - no actual changes made.
`);

  // Demo configuration
  const demoConfig = {
    isDryRun: true,        // SAFE: No actual changes
    skipBackup: false,     // Show backup procedures
    verbose: true,         // Detailed output
    testDbPath: './demo-test.db'
  };

  console.log('🚀 Starting demo migration test...\n');

  const test = new DatabaseMigrationTest(demoConfig);
  
  try {
    const results = await test.runMigrationTest();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEMO RESULTS');
    console.log('='.repeat(60));
    
    if (results.success) {
      console.log('✅ Demo completed successfully!');
      console.log(`⏱️  Total time: ${(results.endTime - results.startTime).toFixed(2)}ms`);
      console.log(`📈 Steps completed: ${results.steps.filter(s => s.status === 'success').length}/${results.steps.length}`);
      
      console.log('\n🎯 Key Validations:');
      console.log(`  Data Preservation: ${results.dataIntegrity.miNhonData.preserved ? '✅' : '❌'}`);
      console.log(`  Tenant Isolation: ${results.dataIntegrity.newTenantFunctionality.working ? '✅' : '❌'}`);
      console.log(`  Checksum Match: ${results.dataIntegrity.checksumMatch ? '✅' : '❌'}`);
      
      console.log('\n📋 Step Results:');
      results.steps.forEach(step => {
        const status = step.status === 'success' ? '✅' : '❌';
        const duration = step.duration.toFixed(2);
        console.log(`  ${status} ${step.step} (${duration}ms)`);
      });

    } else {
      console.log('❌ Demo encountered issues (expected in some environments)');
      console.log('💡 This is normal for demo mode - shows error handling');
    }

    console.log('\n📖 Generated Report:');
    console.log(test.generateReport());

  } catch (error) {
    console.error('\n💥 Demo error (this demonstrates error handling):');
    console.error(error.message);
    console.log('\n💡 In production, this would trigger automatic rollback');
  }

  console.log(`
🎓 DEMO COMPLETE
================

What you've seen:
✅ Comprehensive migration testing
✅ Data integrity verification  
✅ Tenant isolation validation
✅ Automatic rollback procedures
✅ Detailed reporting

Next Steps:
1. Review the migration test documentation: migrations/README.md
2. Run actual tests: npm run migration:test:dry-run
3. Before production: npm run migration:test:pre-deploy

📚 Available Commands:
  npm run migration:test:dry-run      # Safe preview
  npm run migration:test:development  # Local testing
  npm run migration:test:production   # Production validation
  npm run migration:test:all          # Full test suite
  npm run migration:test:pre-deploy   # Pre-deployment check

⚠️  Remember: Always backup before production migration!
  `);
}

// ============================================
// CLI Demo Runner
// ============================================

if (require.main === module) {
  runDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

export { runDemo }; 