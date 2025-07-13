#!/usr/bin/env tsx

import { HotelResearchFlowTest } from '../tests/test-hotel-research-flow';

// ============================================
// Demo Hotel Research Test Script
// ============================================

async function runDemo() {
  console.log(`
🎬 DEMO: Hotel Research Flow Testing System
==========================================

This demo shows how to safely test the complete hotel research flow:
  🏨 Hotel name input → Research → Knowledge Base → Assistant → Database

📚 What this demo covers:
  ✅ Complete end-to-end flow testing
  ✅ Google Places API integration
  ✅ Knowledge base generation
  ✅ Vapi assistant creation
  ✅ Database storage and retrieval
  ✅ Mock data testing
  ✅ Error scenario handling
  ✅ Tenant isolation validation

🔒 Safety: This demo uses MOCK DATA - no real API calls or charges.
`);

  // Demo configuration - completely safe
  const demoConfig = {
    testDbPath: './demo-hotel-research.db',
    useMockData: true,        // SAFE: Uses mock data
    skipApiCalls: true,       // SAFE: No API calls
    verbose: true,            // Show detailed output
    testTimeout: 15000        // 15 second timeout
  };

  console.log('🚀 Starting demo hotel research flow test...\n');

  const test = new HotelResearchFlowTest(demoConfig);

  try {
    const results = await test.runCompleteTest();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEMO RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    if (results.success) {
      console.log('✅ Status: SUCCESS');
      console.log(`🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`);
      console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
      console.log(`🧪 Tests Run: ${results.testsRun}`);
      console.log(`✅ Tests Passed: ${results.testsPassed}`);
      console.log(`❌ Tests Failed: ${results.testsFailed}`);
    } else {
      console.log('❌ Status: FAILED');
      console.log(`🎯 Success Rate: ${((results.testsPassed / results.testsRun) * 100).toFixed(1)}%`);
      console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
      console.log(`🧪 Tests Run: ${results.testsRun}`);
      console.log(`✅ Tests Passed: ${results.testsPassed}`);
      console.log(`❌ Tests Failed: ${results.testsFailed}`);
    }
    
    console.log('\n📋 Test Coverage Overview:');
    console.log(`Hotel Research: ${results.coverage.hotelResearch.basicResearch ? '✅' : '❌'}`);
    console.log(`Knowledge Base: ${results.coverage.knowledgeBase.generation ? '✅' : '❌'}`);
    console.log(`Vapi Integration: ${results.coverage.vapiIntegration.assistantCreation ? '✅' : '❌'}`);
    console.log(`Database Storage: ${results.coverage.database.storage ? '✅' : '❌'}`);
    console.log(`Tenant Isolation: ${results.coverage.database.tenantIsolation ? '✅' : '❌'}`);
    
    console.log('\n🔍 Test Steps:');
    results.steps.forEach((step, index) => {
      const status = step.status === 'passed' ? '✅' : '❌';
      const duration = step.duration.toFixed(2);
      console.log(`${index + 1}. ${status} ${step.name} (${duration}ms)`);
    });
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ Errors Encountered:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.step}: ${error.message}`);
      });
    }
    
  } catch (error) {
    console.error('\n💥 Demo failed with error:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log(`
🎓 DEMO COMPLETE
================

What you've seen:
✅ Complete hotel research flow testing
✅ Mock data usage for safe testing
✅ Knowledge base generation and validation
✅ Database storage and retrieval testing
✅ Tenant isolation verification
✅ Error handling and resilience testing
✅ Comprehensive test reporting

Next Steps:
1. Review the test documentation: tests/README.md
2. Run actual tests: npm run test:hotel-research:mock
3. Test with real APIs: npm run test:hotel-research:development
4. Before production: npm run test:hotel-research:production

📚 Available Commands:
  npm run test:hotel-research:mock         # Safe mock test
  npm run test:hotel-research:development  # Full development test  
  npm run test:hotel-research:production   # Production validation
  npm run test:hotel-research:quick        # Quick smoke test
  npm run test:hotel-research:api          # API integration test
  npm run test:hotel-research:errors       # Error scenarios test
  npm run test:hotel-research:all          # Complete test suite
  npm run test:hotel-research:validate     # Environment validation

🔍 Understanding the Flow:
1. Hotel Name Input → System validates and processes hotel name
2. Research Phase → Google Places API + Website scraping
3. Knowledge Base → Generates comprehensive hotel knowledge
4. Assistant Creation → Creates Vapi AI assistant with knowledge
5. Database Storage → Stores all data with tenant isolation
6. Verification → Validates data integrity and functionality

🏨 Example Hotels You Can Test:
- "Grand Hotel Saigon" (Vietnam)
- "Hilton Tokyo" (Japan)  
- "Marriott New York" (USA)
- "Hotel de Crillon" (France)
- "The Ritz London" (UK)

⚠️ Important Notes:
- Mock tests are completely safe and free
- Real API tests require valid API keys
- Production tests should be run with caution
- Always validate your environment first

Happy testing! 🎉
  `);
}

// Run the demo
runDemo().catch(error => {
  console.error('💥 Demo crashed:', error);
  process.exit(1);
});

export { runDemo }; 