/* ========================================
   BUILD CONFIGURATION
   ======================================== */

import { z } from 'zod';

// ========================================
// BUILD ENVIRONMENT SCHEMA
// ========================================

const BuildEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_API_URL: z.string().optional(),
  VITE_APP_TITLE: z.string().default('Mi Nhon Hotel Assistant'),
  VITE_APP_DESCRIPTION: z.string().default('Voice assistant for hotel services'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_AUTHOR: z.string().default('Mi Nhon Hotel'),
  VITE_APP_KEYWORDS: z.string().default('hotel,assistant,voice,vapi,mui ne,vietnam'),
  VITE_APP_URL: z.string().default('https://minhonhotel.com'),
  VITE_APP_EMAIL: z.string().default('info@minhonhotel.com'),
  VITE_APP_PHONE: z.string().default('+84 123 456 789'),
  VITE_APP_LOCATION: z.string().default('Mui Ne, Phan Thiet, Vietnam'),
  VITE_APP_TIMEZONE: z.string().default('Asia/Ho_Chi_Minh'),
  VITE_APP_LANGUAGES: z.string().default('en,vi,fr,zh,ru,ko'),
  VITE_APP_DEFAULT_LANGUAGE: z.string().default('en'),
  VITE_APP_FEATURES: z.string().default('voiceAssistant,multiLanguage,analytics,staffDashboard'),
  VITE_APP_THEME: z.string().default('light'),
  VITE_APP_DEBUG: z.string().transform(val => val === 'true').default('false'),
  VITE_APP_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_APP_SENTRY_DSN: z.string().optional(),
  VITE_APP_SENTRY_ENVIRONMENT: z.string().default('development'),
});

// ========================================
// BUILD CONFIG
// ========================================

export const buildConfig = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Application
  app: {
    title: process.env.VITE_APP_TITLE || 'Mi Nhon Hotel Assistant',
    description: process.env.VITE_APP_DESCRIPTION || 'Voice assistant for hotel services',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    author: process.env.VITE_APP_AUTHOR || 'Mi Nhon Hotel',
    keywords: (process.env.VITE_APP_KEYWORDS || 'hotel,assistant,voice,vapi,mui ne,vietnam').split(','),
    url: process.env.VITE_APP_URL || 'https://minhonhotel.com',
    email: process.env.VITE_APP_EMAIL || 'info@minhonhotel.com',
    phone: process.env.VITE_APP_PHONE || '+84 123 456 789',
    location: process.env.VITE_APP_LOCATION || 'Mui Ne, Phan Thiet, Vietnam',
    timezone: process.env.VITE_APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
    languages: (process.env.VITE_APP_LANGUAGES || 'en,vi,fr,zh,ru,ko').split(','),
    defaultLanguage: process.env.VITE_APP_DEFAULT_LANGUAGE || 'en',
    features: (process.env.VITE_APP_FEATURES || 'voiceAssistant,multiLanguage,analytics,staffDashboard').split(','),
    theme: process.env.VITE_APP_THEME || 'light',
    debug: process.env.VITE_APP_DEBUG === 'true',
    analytics: process.env.VITE_APP_ANALYTICS === 'true',
  },

  // API Configuration
  api: {
    url: process.env.VITE_API_URL || 'http://localhost:3000',
    version: 'v1',
    timeout: 30000,
    retries: 3,
  },

  // Sentry Configuration
  sentry: {
    dsn: process.env.VITE_APP_SENTRY_DSN,
    environment: process.env.VITE_APP_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },

  // Build Configuration
  build: {
    // Output
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimization
    minify: process.env.NODE_ENV === 'production',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['clsx', 'tailwind-merge'],
        },
      },
    },

    // Development
    devServer: {
      port: 5173,
      host: 'localhost',
      open: true,
      cors: true,
    },

    // Testing
    test: {
      coverage: {
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          'coverage/',
          '**/*.test.{js,ts}',
          '**/*.spec.{js,ts}',
        ],
      },
    },
  },

  // Vite Configuration
  vite: {
    // Plugins
    plugins: [
      'react',
      'typescript',
      'tailwindcss',
      'autoprefixer',
    ],

    // Resolve
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@utils': '/src/utils',
        '@hooks': '/src/hooks',
        '@services': '/src/services',
        '@types': '/src/types',
        '@assets': '/src/assets',
        '@styles': '/src/styles',
        '@config': '/config',
      },
    },

    // CSS
    css: {
      postcss: {
        plugins: [
          'tailwindcss',
          'autoprefixer',
        ],
      },
    },

    // Server
    server: {
      port: 5173,
      host: 'localhost',
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Preview
    preview: {
      port: 4173,
      host: 'localhost',
      open: true,
    },
  },

  // TypeScript Configuration
  typescript: {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    isolatedModules: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    allowJs: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
  },

  // ESLint Configuration
  eslint: {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
    ],
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'jsx-a11y',
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Prettier Configuration
  prettier: {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
  },
} as const;

// ========================================
// VALIDATION
// ========================================

export const validateBuildEnvironment = () => {
  try {
    BuildEnvironmentSchema.parse(process.env);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Unknown validation error' }] };
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getBuildMode = (): 'development' | 'production' => {
  return buildConfig.env === 'production' ? 'production' : 'development';
};

export const isFeatureEnabled = (feature: string): boolean => {
  return buildConfig.app.features.includes(feature);
};

export const getApiUrl = (): string => {
  return buildConfig.api.url;
};

export const getAppTitle = (): string => {
  return buildConfig.app.title;
};

export const getAppVersion = (): string => {
  return buildConfig.app.version;
};

export const shouldGenerateSourcemap = (): boolean => {
  return buildConfig.build.sourcemap;
};

export const shouldMinify = (): boolean => {
  return buildConfig.build.minify;
};

// ========================================
// TYPE DEFINITIONS
// ========================================

export type BuildConfig = typeof buildConfig;
export type BuildEnvironment = z.infer<typeof BuildEnvironmentSchema>;
export type BuildMode = 'development' | 'production';
export type AppFeature = string; 