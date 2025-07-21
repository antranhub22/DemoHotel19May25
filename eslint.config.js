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
      '**/*.d.ts', // Skip all TypeScript declaration files
      'packages/types/**', // Skip types package with parsing issues
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
      '*.d.ts', // Skip TypeScript declaration files
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

        // Additional HTML Elements (for forms and tables)
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
      // Console statements: warn only in browser
      'no-console': 'warn',

      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(logger|debug|React|JSX)$',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in development
      '@typescript-eslint/no-empty-function': 'off', // Allow empty functions in development

      // React Rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off', // Disable for development - too noisy
      'react-refresh/only-export-components': 'off', // Disable for development - too noisy

      // Import Rules
      'import/no-unresolved': 'off',
      'import/no-cycle': 'off',

      // General Rules
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-useless-escape': 'off', // Allow escaped characters in regex
      'no-unreachable': 'off', // Allow unreachable code for debugging
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
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      // Server-specific rules: allow console statements
      'no-console': 'off',
    },
  },
];
