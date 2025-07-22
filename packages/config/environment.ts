/**
 * ===============================================
 * 🏨 HOTEL VOICE ASSISTANT SAAS PLATFORM
 * Environment Configuration & Validation
 * ===============================================
 */

interface EnvironmentConfig {
  // Core Settings
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CLIENT_URL: string;

  // Database
  DATABASE_URL: string;

  // Authentication
  JWT_SECRET: string;
  STAFF_ACCOUNTS: string;

  // OpenAI
  VITE_OPENAI_API_KEY: string;
  VITE_OPENAI_PROJECT_ID?: string;

  // Vapi Voice Assistant
  VITE_VAPI_PUBLIC_KEY: string;
  VITE_VAPI_ASSISTANT_ID: string;

  // Multi-language Vapi Support
  VITE_VAPI_PUBLIC_KEY_VI?: string;
  VITE_VAPI_ASSISTANT_ID_VI?: string;
  VITE_VAPI_PUBLIC_KEY_FR?: string;
  VITE_VAPI_ASSISTANT_ID_FR?: string;
  VITE_VAPI_PUBLIC_KEY_ZH?: string;
  VITE_VAPI_ASSISTANT_ID_ZH?: string;
  VITE_VAPI_PUBLIC_KEY_RU?: string;
  VITE_VAPI_ASSISTANT_ID_RU?: string;
  VITE_VAPI_PUBLIC_KEY_KO?: string;
  VITE_VAPI_ASSISTANT_ID_KO?: string;

  // SaaS Features
  VAPI_API_KEY: string;
  GOOGLE_PLACES_API_KEY: string;
  TALK2GO_DOMAIN: string;

  // Optional Research APIs
  YELP_API_KEY?: string;
  TRIPADVISOR_API_KEY?: string;
  SOCIAL_MEDIA_SCRAPER_API_KEY?: string;

  // Email Services
  GMAIL_APP_PASSWORD?: string;
  MAILJET_API_KEY?: string;
  MAILJET_SECRET_KEY?: string;
  SUMMARY_EMAILS?: string;

  // Multi-tenant
  MINHON_TENANT_ID?: string;
  SUBDOMAIN_SUFFIX?: string;

  // External Services
  WS_TEST_URL?: string;
  WS_TEST_CALLID?: string;
  VITE_API_HOST?: string;

  // Reference Data
  REFERENCE_MAP?: string;

  // Development Tools
  REPL_ID?: string;

  // Production Settings
  SSL_CERT_PATH?: string;
  SSL_KEY_PATH?: string;
  CDN_URL?: string;
  SENTRY_DSN?: string;
  GOOGLE_ANALYTICS_ID?: string;

  // Storage
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_BUCKET_NAME?: string;

  // Feature Flags
  ENABLE_HOTEL_RESEARCH?: boolean;
  ENABLE_DYNAMIC_ASSISTANT_CREATION?: boolean;
  ENABLE_MULTI_LANGUAGE_SUPPORT?: boolean;
  ENABLE_ANALYTICS_DASHBOARD?: boolean;
  ENABLE_BILLING_SYSTEM?: boolean;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;

  // Cache
  REDIS_URL?: string;
  REDIS_PASSWORD?: string;

  // Logging
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  LOG_FORMAT?: string;

  // Security
  CORS_ORIGIN?: string;
  SESSION_SECRET?: string;
  SESSION_TIMEOUT?: number;

  // Testing
  TEST_DATABASE_URL?: string;
  TEST_GOOGLE_PLACES_API_KEY?: string;
  TEST_VAPI_API_KEY?: string;
  TEST_OPENAI_API_KEY?: string;
}

/**
 * Required environment variables for basic functionality
 */
const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'VITE_OPENAI_API_KEY',
  'VITE_VAPI_PUBLIC_KEY',
  'VITE_VAPI_ASSISTANT_ID',
] as const;

/**
 * Required environment variables for SaaS features
 */
const SAAS_REQUIRED_VARS = [
  'VAPI_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'TALK2GO_DOMAIN',
] as const;

/**
 * Environment variable validation errors
 */
export class EnvironmentValidationError extends Error {
  constructor(
    message: string,
    public missingVars: string[]
  ) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Parse boolean environment variable
 */
function parseBoolean(
  value: string | undefined,
  defaultValue: boolean = false
): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse number environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // Core Settings
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: parseNumber(process.env.PORT, 10000),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

    // Authentication
    JWT_SECRET:
      process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production',
    STAFF_ACCOUNTS: process.env.STAFF_ACCOUNTS || 'admin@hotel.com:password123',

    // OpenAI
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
    VITE_OPENAI_PROJECT_ID: process.env.VITE_OPENAI_PROJECT_ID,

    // Vapi Voice Assistant
    VITE_VAPI_PUBLIC_KEY: process.env.VITE_VAPI_PUBLIC_KEY || '',
    VITE_VAPI_ASSISTANT_ID: process.env.VITE_VAPI_ASSISTANT_ID || '',

    // Multi-language Vapi Support
    VITE_VAPI_PUBLIC_KEY_VI: process.env.VITE_VAPI_PUBLIC_KEY_VI,
    VITE_VAPI_ASSISTANT_ID_VI: process.env.VITE_VAPI_ASSISTANT_ID_VI,
    VITE_VAPI_PUBLIC_KEY_FR: process.env.VITE_VAPI_PUBLIC_KEY_FR,
    VITE_VAPI_ASSISTANT_ID_FR: process.env.VITE_VAPI_ASSISTANT_ID_FR,
    VITE_VAPI_PUBLIC_KEY_ZH: process.env.VITE_VAPI_PUBLIC_KEY_ZH,
    VITE_VAPI_ASSISTANT_ID_ZH: process.env.VITE_VAPI_ASSISTANT_ID_ZH,
    VITE_VAPI_PUBLIC_KEY_RU: process.env.VITE_VAPI_PUBLIC_KEY_RU,
    VITE_VAPI_ASSISTANT_ID_RU: process.env.VITE_VAPI_ASSISTANT_ID_RU,
    VITE_VAPI_PUBLIC_KEY_KO: process.env.VITE_VAPI_PUBLIC_KEY_KO,
    VITE_VAPI_ASSISTANT_ID_KO: process.env.VITE_VAPI_ASSISTANT_ID_KO,

    // SaaS Features
    VAPI_API_KEY: process.env.VAPI_API_KEY || '',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
    TALK2GO_DOMAIN: process.env.TALK2GO_DOMAIN || 'talk2go.online',

    // Optional Research APIs
    YELP_API_KEY: process.env.YELP_API_KEY,
    TRIPADVISOR_API_KEY: process.env.TRIPADVISOR_API_KEY,
    SOCIAL_MEDIA_SCRAPER_API_KEY: process.env.SOCIAL_MEDIA_SCRAPER_API_KEY,

    // Email Services
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    MAILJET_API_KEY: process.env.MAILJET_API_KEY,
    MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY,
    SUMMARY_EMAILS: process.env.SUMMARY_EMAILS,

    // Multi-tenant
    MINHON_TENANT_ID:
      process.env.MINHON_TENANT_ID || 'minhon-default-tenant-id',
    SUBDOMAIN_SUFFIX: process.env.SUBDOMAIN_SUFFIX || '.talk2go.online',

    // External Services
    WS_TEST_URL: process.env.WS_TEST_URL,
    WS_TEST_CALLID: process.env.WS_TEST_CALLID,
    VITE_API_HOST: process.env.VITE_API_HOST,

    // Reference Data
    REFERENCE_MAP: process.env.REFERENCE_MAP || '{}',

    // Development Tools
    REPL_ID: process.env.REPL_ID,

    // Production Settings
    SSL_CERT_PATH: process.env.SSL_CERT_PATH,
    SSL_KEY_PATH: process.env.SSL_KEY_PATH,
    CDN_URL: process.env.CDN_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,

    // Storage
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,

    // Feature Flags
    ENABLE_HOTEL_RESEARCH: parseBoolean(
      process.env.ENABLE_HOTEL_RESEARCH,
      true
    ),
    ENABLE_DYNAMIC_ASSISTANT_CREATION: parseBoolean(
      process.env.ENABLE_DYNAMIC_ASSISTANT_CREATION,
      true
    ),
    ENABLE_MULTI_LANGUAGE_SUPPORT: parseBoolean(
      process.env.ENABLE_MULTI_LANGUAGE_SUPPORT,
      true
    ),
    ENABLE_ANALYTICS_DASHBOARD: parseBoolean(
      process.env.ENABLE_ANALYTICS_DASHBOARD,
      true
    ),
    ENABLE_BILLING_SYSTEM: parseBoolean(
      process.env.ENABLE_BILLING_SYSTEM,
      false
    ),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    RATE_LIMIT_MAX_REQUESTS: parseNumber(
      process.env.RATE_LIMIT_MAX_REQUESTS,
      100
    ),

    // Cache
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // Logging
    LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
    LOG_FORMAT: process.env.LOG_FORMAT || 'combined',

    // Security
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SESSION_SECRET: process.env.SESSION_SECRET,
    SESSION_TIMEOUT: parseNumber(process.env.SESSION_TIMEOUT, 3600000),

    // Testing
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:./test.db',
    TEST_GOOGLE_PLACES_API_KEY: process.env.TEST_GOOGLE_PLACES_API_KEY,
    TEST_VAPI_API_KEY: process.env.TEST_VAPI_API_KEY,
    TEST_OPENAI_API_KEY: process.env.TEST_OPENAI_API_KEY,
  };

  return config;
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(
  requireSaasFeatures: boolean = false
): void {
  const missingVars: string[] = [];

  // Check basic required variables
  for (const varName of REQUIRED_VARS as any[]) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check SaaS required variables if needed
  if (requireSaasFeatures) {
    for (const varName of SAAS_REQUIRED_VARS as any[]) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
  }

  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      missingVars
    );
  }
}

/**
 * Get environment status report
 */
export function getEnvironmentStatus(): {
  basicSetup: boolean;
  saasFeatures: boolean;
  multiLanguage: boolean;
  emailServices: boolean;
  storage: boolean;
  monitoring: boolean;
  missing: string[];
  warnings: string[];
} {
  const config = loadEnvironmentConfig();
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check basic setup
  const basicSetup = REQUIRED_VARS.every(varName => {
    const exists = !!process.env[varName];
    if (!exists) {
      missing.push(varName);
    }
    return exists;
  });

  // Check SaaS features
  const saasFeatures = SAAS_REQUIRED_VARS.every(varName => {
    const exists = !!process.env[varName];
    if (!exists) {
      missing.push(varName);
    }
    return exists;
  });

  // Check multi-language support
  const multiLanguage = !!(
    config.VITE_VAPI_PUBLIC_KEY_VI ||
    config.VITE_VAPI_PUBLIC_KEY_FR ||
    config.VITE_VAPI_PUBLIC_KEY_ZH ||
    config.VITE_VAPI_PUBLIC_KEY_RU ||
    config.VITE_VAPI_PUBLIC_KEY_KO
  );

  // Check email services
  const emailServices = !!(
    config.GMAIL_APP_PASSWORD ||
    (config.MAILJET_API_KEY && config.MAILJET_SECRET_KEY)
  );

  // Check storage
  const storage = !!(config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY);

  // Check monitoring
  const monitoring = !!(config.SENTRY_DSN || config.GOOGLE_ANALYTICS_ID);

  // Add warnings for production
  if (config.NODE_ENV === 'production') {
    if (config.JWT_SECRET === 'fallback-jwt-secret-change-in-production') {
      warnings.push('Using default JWT_SECRET in production');
    }
    if (!config.SSL_CERT_PATH) {
      warnings.push('SSL_CERT_PATH not configured for production');
    }
    if (!emailServices) {
      warnings.push('No email service configured');
    }
    if (!monitoring) {
      warnings.push('No monitoring service configured');
    }
  }

  return {
    basicSetup,
    saasFeatures,
    multiLanguage,
    emailServices,
    storage,
    monitoring,
    missing,
    warnings,
  };
}

/**
 * Print environment status to console
 */
export function printEnvironmentStatus(): void {
  const status = getEnvironmentStatus();

  console.log('🔧 Environment Configuration Status:');
  console.log(
    `✅ Basic Setup: ${status.basicSetup ? 'Ready' : 'Missing requirements'}`
  );
  console.log(
    `🏢 SaaS Features: ${status.saasFeatures ? 'Ready' : 'Missing requirements'}`
  );
  console.log(
    `🌍 Multi-language: ${status.multiLanguage ? 'Enabled' : 'Disabled'}`
  );
  console.log(
    `📧 Email Services: ${status.emailServices ? 'Configured' : 'Not configured'}`
  );
  console.log(
    `💾 Storage: ${status.storage ? 'Configured' : 'Not configured'}`
  );
  console.log(
    `📊 Monitoring: ${status.monitoring ? 'Configured' : 'Not configured'}`
  );

  if (status.missing.length > 0) {
    console.log(`❌ Missing Variables: ${status.missing.join(', ')}`);
  }

  if (status.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${status.warnings.join(', ')}`);
  }
}

/**
 * Default environment configuration
 */
export const environment = loadEnvironmentConfig();

/**
 * Environment variable templates for different scenarios
 */
export const ENVIRONMENT_TEMPLATES = {
  development: {
    NODE_ENV: 'development',
    PORT: '10000',
    CLIENT_URL: 'http://localhost:5173',
    DATABASE_URL: 'file:./dev.db',
    JWT_SECRET: 'dev-jwt-secret-change-in-production',
    TALK2GO_DOMAIN: 'localhost:5173',
    ENABLE_HOTEL_RESEARCH: 'true',
    ENABLE_DYNAMIC_ASSISTANT_CREATION: 'true',
    LOG_LEVEL: 'debug',
  },

  production: {
    NODE_ENV: 'production',
    PORT: '10000',
    CLIENT_URL: 'https://your-frontend-domain.com',
    DATABASE_URL: 'postgresql://username:password@localhost:5432/database',
    JWT_SECRET: 'your-super-secure-jwt-secret',
    TALK2GO_DOMAIN: 'talk2go.online',
    ENABLE_HOTEL_RESEARCH: 'true',
    ENABLE_DYNAMIC_ASSISTANT_CREATION: 'true',
    ENABLE_BILLING_SYSTEM: 'true',
    LOG_LEVEL: 'info',
  },

  testing: {
    NODE_ENV: 'test',
    PORT: '10001',
    CLIENT_URL: 'http://localhost:5174',
    DATABASE_URL: 'file:./test.db',
    JWT_SECRET: 'test-jwt-secret',
    TALK2GO_DOMAIN: 'test.localhost',
    ENABLE_HOTEL_RESEARCH: 'false',
    ENABLE_DYNAMIC_ASSISTANT_CREATION: 'false',
    LOG_LEVEL: 'error',
  },
};
