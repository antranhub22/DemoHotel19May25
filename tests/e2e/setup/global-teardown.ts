import { cleanupTestDatabase } from '@tests/utils/setup-test-db';

/**
 * Global Teardown for E2E Tests
 *
 * Cleans up test environment after running E2E tests
 */
async function globalTeardown() {
  console.log('🧹 Starting E2E Test Global Teardown...');

  // 1. Clean up test database
  try {
    const dbPath = './test-e2e.db';
    cleanupTestDatabase(dbPath);
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }

  // 2. Clean up environment variables
  delete process.env.TEST_TENANT_ID;

  console.log('🎉 E2E Test Global Teardown Complete!');
}

export default globalTeardown;
