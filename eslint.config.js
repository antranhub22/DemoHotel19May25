import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,

  // Global ignores (apply to all configs)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vite/**',
      'coverage/**',
      '*.min.js',
      'documentation/**',
      'tools/**',
      'tests/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/ws_test_client.*',
      '**/debug-*.js',
      '**/debug-*.ts',
      '**/*.cjs', // Exclude CommonJS files
    ],
  },

  // Browser Environment (Client-side)
  {
    files: [
      'apps/client/**/*.{js,jsx,ts,tsx}',
      'packages/shared/**/*.{js,jsx,ts,tsx}',
      'packages/auth-system/frontend/**/*.{js,jsx,ts,tsx}',
    ],
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vite/**',
      'coverage/**',
      '*.min.js',
      '*.d.ts',
      'documentation/**',
      'tools/**',
      'scripts/**',
      '*.config.*',
      'tests/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/ws_test_client.*',
      '**/debug-*.js',
      '**/debug-*.ts',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser environment
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        TouchEvent: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        WebSocket: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        RequestInit: 'readonly',
        Response: 'readonly',
        Request: 'readonly',

        // React and JSX globals
        React: 'readonly',
        JSX: 'readonly',

        // Node.js types in browser context
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      // Console statements: warn only in browser
      'no-console': 'warn',

      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in development
      '@typescript-eslint/no-empty-function': 'off', // Allow empty functions in development

      // React Rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Import Rules
      'import/no-unresolved': 'off',
      'import/no-cycle': 'off',

      // General Rules
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Node.js Environment (Server-side)
  {
    files: [
      'apps/server/**/*.{js,jsx,ts,tsx}',
      'packages/auth-system/**/*.{js,jsx,ts,tsx}',
      'packages/config/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js environment
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      // Console statements: allowed in server
      'no-console': 'off',

      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in development
      '@typescript-eslint/no-empty-function': 'off', // Allow empty functions in development

      // Import Rules
      'import/no-unresolved': 'off',
      'import/no-cycle': 'off',

      // General Rules
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
];
