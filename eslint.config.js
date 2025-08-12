import js from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Node.js globals
        process: "readonly",
        console: "readonly",
        setInterval: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",

        // React globals
        React: "readonly",
        ReactNode: "readonly",
        JSX: "readonly",
        RefObject: "readonly",
        MutableRefObject: "readonly",

        // Express types
        Request: "readonly",
        Response: "readonly",
        NextFunction: "readonly",

        // Prisma ORM types
        PrismaClient: "readonly",
        Prisma: "readonly",

        // Vapi types
        VapiClient: "readonly",
        CreateAssistantDTO: "readonly",
        UpdateAssistantDTO: "readonly",
        CallStatus: "readonly",

        // Global utilities
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        Buffer: "readonly",

        // Test globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
        vi: "readonly", // For vitest

        // Vite globals
        import: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    rules: {
      // Console statements: warn only in browser
      "no-console": "off",

      // TypeScript Rules (BASIC)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-inferrable-types": "off",

      // Import Rules
      "import/no-unresolved": "off", // TypeScript handles this
      "import/no-cycle": [
        "warn",
        {
          maxDepth: 10,
          ignoreExternal: true,
        },
      ],
      "import/no-self-import": "error",
      "no-duplicate-imports": "warn",
      "import/no-duplicates": "warn",

      // General Rules
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-undef": "off", // TypeScript handles this
      "prefer-const": "off",
      "no-var": "error",
      "no-useless-escape": "off",
      "no-unreachable": "off",
      "no-debugger": "off",
      eqeqeq: "off",
      curly: "off",
    },
  },
  {
    files: ["*.config.{ts,js}", "*.setup.{ts,js}", ".eslintrc.cjs"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/tests/**",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    ignores: [
      "dist",
      "node_modules",
      "build",
      "*.d.ts",
      "coverage",
      "**/ws_test_client.*",
    ],
  },
];
