import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iphone-12", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "npm run dev -- --port=5173 --strictPort",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
