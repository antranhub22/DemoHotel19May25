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
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'build', '*.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-refresh', 'import'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // Import resolver settings for path aliases
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
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

    // TypeScript Rules (BASIC)
    '@typescript-eslint/no-unused-vars': ['warn', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',

    // React Rules (Basic)
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // 🔗 IMPORT RULES (PHASE 1: WARNINGS ONLY)
    'import/no-unresolved': ['warn', {
      ignore: [
        '^node:',
        '^react$',
        '^react-dom',
        '^vite',
        '^@vitejs/',
        '\\?.*$',
        '\\.(css|scss|sass|less)$',
        '\\.(png|jpg|jpeg|gif|svg)$'
      ]
    }],

    'import/no-cycle': ['warn', {
      maxDepth: 10,
      ignoreExternal: true
    }],

    'import/no-self-import': 'error',

    // Duplicate import detection  
    'no-duplicate-imports': 'warn',
    'import/no-duplicates': 'warn',

    // Import order enforcement (start with warnings)
    'import/order': ['warn', {
      groups: [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'never',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],

    // Additional import rules
    'import/named': 'warn',
    'import/default': 'warn',

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
      // Relaxed rules for configuration files
      files: ['*.config.{ts,js}', '*.setup.{ts,js}', '.eslintrc.cjs'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off'
      }
    },
    {
      // Relaxed rules for test files
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/tests/**'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      // Relaxed rules for type definition files
      files: ['**/*.d.ts'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off'
      }
    },
    {
      // Build and tool files
      files: ['tools/**/*.{ts,js}', 'scripts/**/*.{ts,js}'],
      rules: {
        'import/no-unused-modules': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
};
