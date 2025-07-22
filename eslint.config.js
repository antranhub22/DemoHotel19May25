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
      'coverage/**',
      'public/**',
      'test-results/**',
      '*.config.js',
      '*.config.ts',
      '.next/**',
      '.vscode/**',
      '.husky/**',
      '**/*.d.ts',
      'scripts/**/*.cjs',
      'scripts/**/*.mjs',
      'apps/server/routes.ts', // Legacy file
      'tests/**/*', // Test files have different rules
      'tools/**/*', // Tool files can be more relaxed
    ],
  },

  // Browser Environment (Client-side) - OPTIMIZED
  {
    files: [
      'apps/client/**/*.{js,jsx,ts,tsx}',
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
      '*.config.*',
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
        // Basic browser APIs
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
        URL: 'readonly',
        // DOM APIs
        DOMRect: 'readonly',
        getComputedStyle: 'readonly',
        // Additional HTML Elements
        HTMLTextAreaElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLLIElement: 'readonly',
        HTMLUListElement: 'readonly',
        HTMLOListElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLTableCaptionElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        // Canvas APIs
        CanvasRenderingContext2D: 'readonly',
        // Browser APIs
        AbortController: 'readonly',
        AbortSignal: 'readonly',
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
      // Console statements: warn only in browser (stricter)
      'no-console': 'warn',

      // TypeScript Rules (Enhanced) - FIXED
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|logger|debug|React|JSX)',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',

      // React Rules (Enhanced)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',

      // Import Rules (Enhanced)
      'import/no-unresolved': 'off',
      'import/no-cycle': 'warn',
      'import/no-unused-modules': 'off',
      'import/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
      }],

      // General Rules (Enhanced)
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-useless-escape': 'warn',
      'no-unreachable': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-imports': 'warn',
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'all'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Node.js Environment (Server-side) - OPTIMIZED
  {
    files: [
      'apps/server/**/*.{js,jsx,ts,tsx}',
      'packages/auth-system/**/*.{js,jsx,ts,tsx}',
      'packages/config/**/*.{js,jsx,ts,tsx}',
      'packages/shared/**/*.{js,jsx,ts,tsx}',
    ],
    ignores: [
      'apps/server/routes.ts', // Legacy file
    ],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        // Node.js specific environment
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      // Server-specific rules: allow console statements
      'no-console': 'off',

      // Enhanced TypeScript rules for server - FIXED
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|logger|debug)',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',

      // Import rules for server
      'import/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
      }],

      // General server rules
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-debugger': 'warn',
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'all'],
    },
  },
];
