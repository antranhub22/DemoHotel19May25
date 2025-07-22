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
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'build', '*.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    // Node.js globals
    process: 'readonly',
    console: 'readonly',
    setInterval: 'readonly',
    module: 'readonly',

    // React globals
    React: 'readonly',
    ReactNode: 'readonly',
    JSX: 'readonly',

    // Custom types - mark as readonly to avoid errors
    Language: 'readonly',
    ServiceCategory: 'readonly',
    UserRole: 'readonly',
    Permission: 'readonly',

    // Express types
    Request: 'readonly',
    Response: 'readonly',
    NextFunction: 'readonly',

    // Drizzle types
    db: 'readonly',
    eq: 'readonly',
    sql: 'readonly',

    // Custom app types
    useAssistant: 'readonly',
    Staff: 'readonly',
    Transcript: 'readonly',
    CallSummary: 'readonly',
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Relaxed rules for faster development
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'no-undef': 'off', // Turn off for TypeScript files
    'no-unused-vars': 'off', // Let TypeScript handle this
    'no-unreachable': 'warn',
    'no-useless-escape': 'warn',
    'import/order': 'off',
  },
  // Override for TypeScript files
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
  ],
};
