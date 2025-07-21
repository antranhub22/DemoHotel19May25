/* ========================================
   APPLICATION CONFIGURATION
   ======================================== */

import { z } from 'zod';

// ========================================
// ENVIRONMENT SCHEMA
// ========================================

const EnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z
    .string()
    .default('your-super-secret-jwt-key-change-in-production'),
  VAPI_PUBLIC_KEY: z.string().optional(),
  VAPI_ASSISTANT_ID: z.string().optional(),
  VAPI_PUBLIC_KEY_FR: z.string().optional(),
  VAPI_ASSISTANT_ID_FR: z.string().optional(),
  VAPI_PUBLIC_KEY_ZH: z.string().optional(),
  VAPI_ASSISTANT_ID_ZH: z.string().optional(),
  VAPI_PUBLIC_KEY_RU: z.string().optional(),
  VAPI_ASSISTANT_ID_RU: z.string().optional(),
  VAPI_PUBLIC_KEY_KO: z.string().optional(),
  VAPI_ASSISTANT_ID_KO: z.string().optional(),
  VAPI_PUBLIC_KEY_VI: z.string().optional(),
  VAPI_ASSISTANT_ID_VI: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  EMAIL_SERVICE: z.enum(['gmail', 'sendgrid', 'smtp']).default('gmail'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_TO: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// ========================================
// APPLICATION CONFIG
// ========================================

export const appConfig = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    type: 'postgresql' as const, // Always PostgreSQL now
    logging: process.env.NODE_ENV === 'development',
  },

  // Authentication
  auth: {
    jwtSecret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: '24h',
    bcryptRounds: 12,
  },

  // Vapi Configuration
  vapi: {
    publicKey: process.env.VAPI_PUBLIC_KEY,
    assistantId: process.env.VAPI_ASSISTANT_ID,
    languages: {
      en: {
        publicKey: process.env.VAPI_PUBLIC_KEY,
        assistantId: process.env.VAPI_ASSISTANT_ID,
      },
      fr: {
        publicKey: process.env.VAPI_PUBLIC_KEY_FR,
        assistantId: process.env.VAPI_ASSISTANT_ID_FR,
      },
      zh: {
        publicKey: process.env.VAPI_PUBLIC_KEY_ZH,
        assistantId: process.env.VAPI_ASSISTANT_ID_ZH,
      },
      ru: {
        publicKey: process.env.VAPI_PUBLIC_KEY_RU,
        assistantId: process.env.VAPI_ASSISTANT_ID_RU,
      },
      ko: {
        publicKey: process.env.VAPI_PUBLIC_KEY_KO,
        assistantId: process.env.VAPI_ASSISTANT_ID_KO,
      },
      vi: {
        publicKey: process.env.VAPI_PUBLIC_KEY_VI,
        assistantId: process.env.VAPI_ASSISTANT_ID_VI,
      },
    },
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
  },

  // Hotel Configuration
  hotel: {
    name: 'Mi Nhon Hotel',
    location: 'Mui Ne, Phan Thiet, Vietnam',
    phone: '+84 123 456 789',
    email: 'info@minhonhotel.com',
    website: 'https://minhonhotel.com',
    timezone: 'Asia/Ho_Chi_Minh',
    languages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko'],
    defaultLanguage: 'en',
  },

  // Features
  features: {
    voiceAssistant: true,
    multiLanguage: true,
    analytics: true,
    staffDashboard: true,
    emailNotifications: true,
    realTimeUpdates: true,
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    version: 'v1',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Client Configuration
  client: {
    baseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:5173',
    title: 'Mi Nhon Hotel Assistant',
    description: 'Voice assistant for hotel services and information',
    keywords: ['hotel', 'assistant', 'voice', 'vapi', 'mui ne', 'vietnam'],
  },
} as const;

// ========================================
// VALIDATION
// ========================================

export const validateEnvironment = () => {
  try {
    EnvironmentSchema.parse(process.env);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return {
      success: false,
      errors: [{ message: 'Unknown validation error' }],
    };
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getVapiConfig = (language: string = 'en') => {
  const langConfig =
    appConfig.vapi.languages[language as keyof typeof appConfig.vapi.languages];
  return langConfig || appConfig.vapi.languages.en;
};

export const isFeatureEnabled = (
  feature: keyof typeof appConfig.features
): boolean => {
  return appConfig.features[feature];
};

export const getApiUrl = (endpoint: string): string => {
  return `${appConfig.api.baseUrl}/api/${appConfig.api.version}${endpoint}`;
};

export const getClientUrl = (path: string = ''): string => {
  return `${appConfig.client.baseUrl}${path}`;
};

// ========================================
// TYPE DEFINITIONS
// ========================================

export type AppConfig = typeof appConfig;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type VapiLanguage = keyof typeof appConfig.vapi.languages;
export type FeatureKey = keyof typeof appConfig.features;
