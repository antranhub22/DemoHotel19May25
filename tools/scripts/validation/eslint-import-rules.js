#!/usr/bin/env node

/**
 * 🔧 ESLint Import Rules Configuration
 *
 * This module provides ESLint configuration for import/export consistency
 * that complements our validation system with real-time feedback.
 *
 * Features:
 * - TypeScript path alias support (@/, @shared/, @server/, etc.)
 * - Import/export consistency rules
 * - Real-time error detection in IDEs
 * - Integration with existing validation tools
 */

export const importRulesConfig = {
  // Required plugins for import rules
  plugins: ['import', '@typescript-eslint'],

  // Extends configurations
  extends: [
    '@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],

  // Parser options for TypeScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },

  // Settings for import plugin
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      alias: {
        map: [
          ['@', './apps/client/src'],
          ['@shared', './packages/shared'],
          ['@server', './apps/server'],
          ['@types', './packages/types'],
          ['@config', './packages/config'],
          ['@tools', './tools'],
          ['@tests', './tests'],
          ['@auth', './packages/auth-system'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },

  // Import/Export consistency rules
  rules: {
    // Core import validation
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          // Built-in Node.js modules
          '^node:',
          // External packages that might not have types
          '^react$',
          '^react-dom',
          '^vite',
          // Dynamic imports that ESLint can't resolve
          '\\?.*$',
        ],
      },
    ],

    // Circular dependency detection
    'import/no-cycle': [
      'error',
      {
        maxDepth: 10,
        ignoreExternal: true,
      },
    ],

    // Unused module detection
    'import/no-unused-modules': [
      'warn',
      {
        unusedExports: true,
        missingExports: true,
        ignoreExports: [
          // Entry points and configuration files
          '**/index.{ts,tsx,js,jsx}',
          '**/main.{ts,tsx,js,jsx}',
          '**/*.config.{ts,js}',
          '**/*.setup.{ts,js}',
          // Test files
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}',
          // Type definition files
          '**/*.d.ts',
          // Build output
          '**/dist/**',
          '**/build/**',
        ],
      },
    ],

    // Self-import prevention
    'import/no-self-import': 'error',

    // Duplicate import detection
    'no-duplicate-imports': 'error',
    'import/no-duplicates': 'error',

    // TypeScript unused variables
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Import order enforcement
    'import/order': [
      'warn',
      {
        groups: [
          'builtin', // Node.js built-ins
          'external', // npm packages
          'internal', // Path aliases (@/, @shared/, etc.)
          'parent', // ../
          'sibling', // ./
          'index', // ./index
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@shared/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@server/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@types/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@config/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Prevent importing from parent directories
    'import/no-relative-parent-imports': 'warn',

    // Ensure imports point to files that export the imported names
    'import/named': 'error',

    // Ensure default import corresponds to default export
    'import/default': 'error',

    // Ensure imported namespaces contain dereferenced properties
    'import/namespace': 'error',

    // Prevent unnecessary path segments
    'import/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true,
      },
    ],

    // Prevent importing modules from devDependencies in production code
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}',
          '**/test/**',
          '**/tests/**',
          '**/*.config.{ts,js}',
          '**/*.setup.{ts,js}',
          '**/tools/**',
          '**/scripts/**',
        ],
        optionalDependencies: false,
        peerDependencies: true,
      },
    ],
  },

  // Override rules for specific file patterns
  overrides: [
    {
      // Relaxed rules for configuration files
      files: ['*.config.{ts,js}', '*.setup.{ts,js}'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // Relaxed rules for test files
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
      rules: {
        'import/no-unused-modules': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      // Relaxed rules for type definition files
      files: ['**/*.d.ts'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // Server-specific rules
      files: ['apps/server/**/*.{ts,js}'],
      rules: {
        'import/no-nodejs-modules': 'off', // Allow Node.js modules in server
      },
    },
    {
      // Client-specific rules
      files: ['apps/client/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'import/no-nodejs-modules': 'error', // Prevent Node.js modules in client
      },
    },
  ],
};

// Gradual migration strategy
export const gradualMigrationConfig = {
  // Phase 1: Warnings only (current implementation)
  phase1: {
    'import/no-unresolved': 'warn',
    'import/no-cycle': 'warn',
    'import/no-unused-modules': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-duplicate-imports': 'warn',
  },

  // Phase 2: Errors for critical issues
  phase2: {
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-unused-modules': 'warn', // Still warning
    '@typescript-eslint/no-unused-vars': 'warn', // Still warning
    'no-duplicate-imports': 'error',
  },

  // Phase 3: Full enforcement (final)
  phase3: {
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'error',
    'import/no-self-import': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-duplicate-imports': 'error',
    'import/order': 'error',
  },
};

// Integration with existing validation tools
export const integrationConfig = {
  // NPM scripts to run both ESLint and validation tools
  scripts: {
    'lint:imports': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
    'validate:full':
      'npm run lint:imports && npm run check:imports:quick && npm run check:deps',
    'validate:ci':
      'npm run lint:imports && npm run check:imports:ci && npm run check:deps:security',
  },

  // Pre-commit hook integration
  preCommit: ['npm run lint:imports', 'npm run check:imports:quick'],

  // VS Code settings for optimal experience
  vscodeSettings: {
    'eslint.validate': [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
    ],
    'eslint.run': 'onType',
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true,
    },
  },
};

export default importRulesConfig;
