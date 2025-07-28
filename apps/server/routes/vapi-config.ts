import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// ============================================
// VAPI CONFIGURATION ROUTES
// ============================================

/**
 * Get Vapi configuration for specific language
 * GET /api/vapi/config/:language
 */
router.get('/config/:language', async (req, res) => {
  try {
    const { language } = req.params;

    if (!language) {
      return commonErrors.validation(res, 'Language parameter is required');
    }

    logger.debug(
      `🔧 [VapiConfig] Getting configuration for language: ${language}`,
      'VapiConfig'
    );

    // Get Vapi configuration based on language
    const config = getVapiConfigByLanguage(language);

    // Check if we have valid configuration
    const hasValidConfig = config.publicKey && config.assistantId;

    const responseData = {
      language,
      publicKey: config.publicKey || '',
      assistantId: config.assistantId || '',
      fallback: !hasValidConfig,
      availableLanguages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko'],
    };

    logger.debug(
      `✅ [VapiConfig] Configuration for ${language}:`,
      'VapiConfig',
      {
        publicKey: config.publicKey
          ? `${config.publicKey.substring(0, 15)}...`
          : 'MISSING',
        assistantId: config.assistantId
          ? `${config.assistantId.substring(0, 15)}...`
          : 'MISSING',
        fallback: responseData.fallback,
      }
    );

    if (!hasValidConfig) {
      logger.warn(
        `⚠️ [VapiConfig] Incomplete configuration for ${language}, falling back to default`,
        'VapiConfig'
      );
    }

    return apiResponse.success(
      res,
      responseData,
      `Vapi configuration retrieved for ${language}`,
      {
        configurationStatus: hasValidConfig ? 'complete' : 'fallback',
        requestedLanguage: language,
      }
    );
  } catch (error) {
    logger.error(
      `❌ [VapiConfig] Error getting configuration for ${req.params.language}:`,
      'VapiConfig',
      error
    );

    return apiResponse.error(
      res,
      500,
      ErrorCodes.VAPI_ERROR,
      'Failed to get Vapi configuration',
      {
        language: req.params.language,
        fallbackApplied: true,
      }
    );
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get Vapi configuration by language with full support for all languages
 */
function getVapiConfigByLanguage(language: string): {
  publicKey: string;
  assistantId: string;
} {
  // Language-specific environment variable mapping
  const languageMapping: Record<
    string,
    { publicKeyEnv: string; assistantIdEnv: string }
  > = {
    en: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID',
    },
    vi: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY_VI',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID_VI',
    },
    fr: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY_FR',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID_FR',
    },
    zh: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY_ZH',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID_ZH',
    },
    ru: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY_RU',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID_RU',
    },
    ko: {
      publicKeyEnv: 'VITE_VAPI_PUBLIC_KEY_KO',
      assistantIdEnv: 'VITE_VAPI_ASSISTANT_ID_KO',
    },
  };

  // Get language-specific configuration
  const langConfig = languageMapping[language.toLowerCase()];

  if (langConfig) {
    return {
      publicKey: process.env[langConfig.publicKeyEnv] || '',
      assistantId: process.env[langConfig.assistantIdEnv] || '',
    };
  }

  // Fallback to default English configuration
  logger.warn(
    `⚠️ [VapiConfig] Unknown language ${language}, falling back to English`,
    'VapiConfig'
  );

  return {
    publicKey: process.env.VITE_VAPI_PUBLIC_KEY || '',
    assistantId: process.env.VITE_VAPI_ASSISTANT_ID || '',
  };
}

export default router;
