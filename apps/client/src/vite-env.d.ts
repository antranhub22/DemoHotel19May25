/// <reference types="vite/client" />
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// ✅ FIXED: Extend vitest expect with jest-dom matchers
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<any, void> {}
}

// Module declarations for CSS and image files
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
