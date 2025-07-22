/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.nuxt'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        'dist/',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/client/src'),
      '@server': path.resolve(__dirname, './apps/server'),
      '@shared': path.resolve(__dirname, './packages/shared'),
      '@types': path.resolve(__dirname, './packages/types'),
      '@config': path.resolve(__dirname, './packages/config'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
