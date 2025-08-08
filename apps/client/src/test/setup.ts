import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// JSDOM polyfills and globals
// user-event relies on document; prepare minimal globals if needed
Object.defineProperty(globalThis, "navigator", {
  value: { userAgent: "node.js" },
  writable: true,
});

// Provide basic localStorage mock when not present
if (!(globalThis as any).localStorage) {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    length: 0,
  } as unknown as Storage;
}

// Cleanup between tests
afterEach(() => {
  cleanup();
});
