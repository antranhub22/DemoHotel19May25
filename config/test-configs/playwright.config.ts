import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for DemoHotel19May E2E Testing
 *
 * Comprehensive E2E testing setup for Interface1 and hotel management features
 */
export default defineConfig({
  // Test configuration
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: './test-results/e2e/results.json' }],
    ['junit', { outputFile: './test-results/e2e/results.xml' }],
  ],

  // Global test settings
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Media permissions for voice assistant testing
    permissions: ['microphone', 'camera'],

    // Ignore HTTPS errors for development
    ignoreHTTPSErrors: true,

    // Extended timeout for voice operations
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Output directories
  outputDir: './test-results/e2e/artifacts',

  // Projects for different browsers and devices
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // Tablet testing
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Web server configuration for local development
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      NODE_ENV: 'test',
      VITE_TEST_MODE: 'true',
      DATABASE_URL: 'sqlite://./test-e2e.db',
    },
  },

  // Global setup and teardown
  globalSetup: path.resolve('./tests/e2e/setup/global-setup.ts'),
  globalTeardown: path.resolve('./tests/e2e/setup/global-teardown.ts'),
});
