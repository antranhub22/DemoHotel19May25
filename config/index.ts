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

import { validateEnvironment } from './app.config';
import { validateDatabaseConfig } from './database.config';

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
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
    features: {
      voiceAssistant: true,
      multiLanguage: true,
      analytics: true,
      staffDashboard: true,
    },
    api: {
      url: process.env.VITE_API_URL || 'http://localhost:3000',
      version: 'v1',
    },
    hotel: {
      name: 'Mi Nhon Hotel',
      location: 'Mui Ne, Phan Thiet, Vietnam',
      languages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko'],
    },
  };
}; 