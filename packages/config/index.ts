/* ========================================
   CONFIGURATION INDEX
   ======================================== */

// ========================================
// EXPORT ALL CONFIGURATIONS
// ========================================

export * from './app.config';
export * from './database.config';

// ========================================
// CONFIGURATION VALIDATION
// ========================================

import { validateEnvironment } from '@config/app.config';
import { validateDatabaseConfig } from '@config/database.config';

export const validateAllConfigurations = () => {
  const appValidation = validateEnvironment();
  const dbValidation = validateDatabaseConfig();

  const allErrors = [
    ...(appValidation.errors || []),
    ...(dbValidation.errors || []),
  ];

  return {
    success: appValidation.success && dbValidation.success,
    errors: allErrors.length > 0 ? allErrors : null,
  };
};

// ========================================
// CONFIGURATION HELPERS
// ========================================

export const getConfigurationSummary = () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    // Database configuration
    database: process.env.DATABASE_URL
      ? 'postgresql'
      : (() => {
          throw new Error(
            'DATABASE_URL is required. Please set up PostgreSQL.'
          );
        })(),
    features: {
      voiceAssistant: true,
      multiLanguage: true,
      analytics: true,
      staffDashboard: true,
    },
    api: {
      url:
        process.env.VITE_API_URL ||
        (typeof window !== 'undefined' &&
        window.location.hostname.includes('talk2go.online')
          ? `https://${window.location.hostname}`
          : 'http://localhost:3000'),
      version: 'v1',
    },
    hotel: {
      name: 'Mi Nhon Hotel',
      location: 'Mui Ne, Phan Thiet, Vietnam',
      languages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko'],
    },
  };
};
