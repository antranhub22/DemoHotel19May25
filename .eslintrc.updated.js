module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    // 🔗 ADD: Import plugin support
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'build', '*.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    // 🔗 ADD: Import plugin
    'import',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // 🔗 ADD: TypeScript project support
    project: './tsconfig.json',
  },

  // 🔗 ADD: Import resolver settings for path aliases
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

  globals: {
    // Node.js globals
    process: 'readonly',
    console: 'readonly',
    setInterval: 'readonly',
    module: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',

    // React globals
    React: 'readonly',
    ReactNode: 'readonly',
    JSX: 'readonly',
    RefObject: 'readonly',
    MutableRefObject: 'readonly',

    // Express types
    Request: 'readonly',
    Response: 'readonly',
    NextFunction: 'readonly',

    // Drizzle ORM types
    db: 'readonly',
    eq: 'readonly',
    sql: 'readonly',
    and: 'readonly',
    or: 'readonly',
    desc: 'readonly',
    asc: 'readonly',
    like: 'readonly',
    ilike: 'readonly',
    inArray: 'readonly',
    notInArray: 'readonly',
    isNull: 'readonly',
    isNotNull: 'readonly',
    exists: 'readonly',
    notExists: 'readonly',

    // Vapi types
    VapiClient: 'readonly',
    CreateAssistantDTO: 'readonly',
    UpdateAssistantDTO: 'readonly',
    CallStatus: 'readonly',

    // Global utilities
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setImmediate: 'readonly',
    clearImmediate: 'readonly',
    Buffer: 'readonly',

    // Test globals (if applicable)
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
    vi: 'readonly', // For vitest

    // Vite globals
    import: 'readonly',
  },
  rules: {
    // Console statements: warn only in browser (stricter)
    'no-console': 'off', // ✅ Allow console.log for debugging

    // TypeScript Rules (BALANCED) - 🔧 Improved from previous "LOOSENED"
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ], // 🔗 CHANGED: Now warns instead of off
    '@typescript-eslint/no-explicit-any': 'warn', // 🔧 Changed to warn
    '@typescript-eslint/no-empty-function': 'off', // ✅ Allow empty functions
    '@typescript-eslint/ban-ts-comment': 'off', // ✅ Allow @ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off', // ✅ Allow ! operator
    '@typescript-eslint/no-inferrable-types': 'off', // ✅ Allow explicit types

    // React Rules (Enhanced)
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'off', // ✅ Less strict

    // 🔗 IMPORT RULES (PHASE 1: GRADUAL MIGRATION)
    // Core import validation
    'import/no-unresolved': [
      'warn',
      {
        ignore: [
          // Built-in Node.js modules
          '^node:',
          // External packages that might not have complete type definitions
          '^react$',
          '^react-dom',
          '^vite',
          '^@vitejs/',
          // Dynamic imports that ESLint can't resolve
          '\\?.*$',
          // Asset imports
          '\\.(css|scss|sass|less)$',
          '\\.(png|jpg|jpeg|gif|svg)$',
        ],
      },
    ], // 🔗 CHANGED: Now warn instead of off

    'import/no-cycle': [
      'warn',
      {
        maxDepth: 10,
        ignoreExternal: true,
      },
    ], // 🔗 CHANGED: Now warn instead of off

    'import/no-unused-modules': [
      'warn',
      {
        unusedExports: true,
        missingExports: false, // Start conservative
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
          // API routes (may be used dynamically)
          '**/routes/**',
          '**/api/**',
        ],
      },
    ], // 🔗 CHANGED: Now warn instead of off

    'import/no-self-import': 'error', // 🔗 NEW: Prevent self imports

    // Duplicate import detection
    'no-duplicate-imports': 'warn', // 🔗 CHANGED: Now warn instead of off
    'import/no-duplicates': 'warn', // 🔗 NEW: ESLint import version

    // Import order enforcement (start with warnings)
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
          {
            pattern: '@auth/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'never', // Start relaxed
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ], // 🔗 CHANGED: Now warn instead of off

    // Additional import rules
    'import/named': 'warn', // 🔗 NEW: Check named imports
    'import/default': 'warn', // 🔗 NEW: Check default imports
    'import/no-useless-path-segments': [
      'warn',
      {
        noUselessIndex: true,
      },
    ], // 🔗 NEW: Prevent unnecessary path segments

    // General Rules (LOOSENED)
    'no-unused-vars': 'off', // ✅ Use TypeScript version instead
    'no-undef': 'off', // ✅ TypeScript handles this
    'prefer-const': 'off', // ✅ Allow let
    'no-var': 'error',
    'no-useless-escape': 'off', // ✅ Allow escapes
    'no-unreachable': 'off', // ✅ Allow unreachable code
    'no-debugger': 'off', // ✅ Allow debugger
    eqeqeq: 'off', // ✅ Allow == instead of ===
    curly: 'off', // ✅ Don't enforce braces
  },

  // Override for specific file types and contexts
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off', // TypeScript handles undefined variables
      },
    },
    {
      files: ['*.cjs', '*.js'],
      env: {
        node: true,
        commonjs: true,
      },
    },
    {
      // 🔗 Relaxed rules for configuration files
      files: ['*.config.{ts,js}', '*.setup.{ts,js}', '.eslintrc.js'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      // 🔗 Relaxed rules for test files
      files: [
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/tests/**',
      ],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // 🔗 Relaxed rules for type definition files
      files: ['**/*.d.ts'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      // 🔗 Server-specific rules
      files: ['apps/server/**/*.{ts,js}'],
      rules: {
        'import/no-nodejs-modules': 'off', // Allow Node.js modules in server
      },
    },
    {
      // 🔗 Build and tool files
      files: ['tools/**/*.{ts,js}', 'scripts/**/*.{ts,js}'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
