import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
    css: true,
    exclude: [
      "node_modules",
      "tests/e2e/**", // ensure Playwright tests are not picked up by Vitest
    ],
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    coverage: {
      enabled: false,
    },
  },
});
