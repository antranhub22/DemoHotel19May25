import { chromium } from '@playwright/test';
import { setupTestDatabase, cleanupTestDatabase } from '../../utils/setup-test-db';

/**
 * Global Setup for E2E Tests
 * 
 * Initializes test environment before running E2E tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 Starting E2E Test Global Setup...');

  // 1. Setup test database
  const dbPath = './test-e2e.db';
  
  try {
    // Clean up any existing test database
    cleanupTestDatabase(dbPath);
    
    // Create fresh test database with seed data
    const { testTenantId } = await setupTestDatabase(dbPath);
    
    console.log(`✅ Test database created: ${dbPath}`);
    console.log(`✅ Test tenant ID: ${testTenantId}`);
    
    // Store test tenant ID for tests
    process.env.TEST_TENANT_ID = testTenantId;
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }

  // 2. Verify browser installation
  try {
    const browser = await chromium.launch();
    await browser.close();
    console.log('✅ Browser setup verified');
  } catch (error) {
    console.error('❌ Browser setup failed:', error);
    throw error;
  }

  // 3. Wait for web server to be ready
  console.log('⏳ Waiting for web server...');
  const maxWaitTime = 60000; // 60 seconds
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'HEAD',
      });
      
      if (response.ok) {
        console.log('✅ Web server is ready');
        break;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 E2E Test Global Setup Complete!');
}

export default globalSetup; 