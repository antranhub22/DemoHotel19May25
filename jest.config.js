/** @type {import('jest').Config} */
export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/client/src/$1',
    '^@server/(.*)$': '<rootDir>/apps/server/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@types/(.*)$': '<rootDir>/packages/types/$1',
    '^@config/(.*)$': '<rootDir>/packages/config/$1',
    // Mock static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/tests/mocks/fileMock.js',
  },
  
  // File patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
  ],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true,
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // File extensions to handle
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'apps/client/src/**/*.{ts,tsx}',
    'apps/server/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './apps/client/src/components/interface1/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/documentation/',
  ],
  
  // Module paths to ignore
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Timeout for tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Additional Jest configuration
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Error handling
  bail: false,
  errorOnDeprecated: true,
  
  // Watch mode settings
  watchPathIgnorePatterns: ['node_modules', 'dist', 'build'],
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-results',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
      },
    ],
  ],
  
  // Performance settings
  maxWorkers: '50%',
  
  // ESM support
  preset: 'ts-jest/presets/default-esm',
  
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
}; 