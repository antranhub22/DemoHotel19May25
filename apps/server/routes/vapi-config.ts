import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from "@server/utils/apiHelpers";
import { logger } from "@shared/utils/logger";
import express from "express";

const router = express.Router();

// ============================================
// VAPI CONFIGURATION ROUTES
// ============================================

/**
 * Get Vapi configuration for specific language
 * GET /api/vapi/config/:language
 */
router.get("/config/:language", async (req, res) => {
  try {
    const { language } = req.params;

    if (!language) {
      return commonErrors.validation(res, "Language parameter is required");
    }

    logger.debug(
      `🔧 [VapiConfig] Getting configuration for language: ${language}`,
      "VapiConfig",
    );

    // Get Vapi configuration based on language
    const config = getVapiConfigByLanguage(language);

    // Check if we have valid configuration
    const hasValidConfig = config.publicKey && config.assistantId;

    const responseData = {
      language,
      publicKey: config.publicKey || "",
      assistantId: config.assistantId || "",
      fallback: !hasValidConfig,
      availableLanguages: ["en", "vi", "fr", "zh", "ru", "ko"],
    };

    logger.debug(
      `✅ [VapiConfig] Configuration for ${language}:`,
      "VapiConfig",
      {
        publicKey: config.publicKey
          ? `${config.publicKey.substring(0, 15)}...`
          : "MISSING",
        assistantId: config.assistantId
          ? `${config.assistantId.substring(0, 15)}...`
          : "MISSING",
        fallback: responseData.fallback,
      },
    );

    if (!hasValidConfig) {
      logger.warn(
        `⚠️ [VapiConfig] Incomplete configuration for ${language}, falling back to default`,
        "VapiConfig",
      );
    }

    return apiResponse.success(
      res,
      responseData,
      `Vapi configuration retrieved for ${language}`,
      {
        configurationStatus: hasValidConfig ? "complete" : "fallback",
        requestedLanguage: language,
      },
    );
  } catch (error) {
    logger.error(
      `❌ [VapiConfig] Error getting configuration for ${req.params.language}:`,
      "VapiConfig",
      error,
    );

    return apiResponse.error(
      res,
      500,
      ErrorCodes.VAPI_ERROR,
      "Failed to get Vapi configuration",
      {
        language: req.params.language,
        fallbackApplied: true,
      },
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
  // Use ONE shared public key for all languages (as agreed)
  const sharedPublicKey = process.env.VITE_VAPI_PUBLIC_KEY || "";

  // Language-specific assistant IDs
  const assistantIdMapping: Record<string, string> = {
    en: process.env.VITE_VAPI_ASSISTANT_ID || "",
    vi: process.env.VITE_VAPI_ASSISTANT_ID_VI || "",
    fr: process.env.VITE_VAPI_ASSISTANT_ID_FR || "",
    zh: process.env.VITE_VAPI_ASSISTANT_ID_ZH || "",
    ru: process.env.VITE_VAPI_ASSISTANT_ID_RU || "",
    ko: process.env.VITE_VAPI_ASSISTANT_ID_KO || "",
  };

  const code = (language || "en").toLowerCase();
  const assistantId = assistantIdMapping[code] ?? assistantIdMapping.en;

  if (!assistantId) {
    logger.warn(
      `⚠️ [VapiConfig] Missing assistantId for ${code}. Falling back to default assistantId`,
      "VapiConfig",
    );
  }

  return {
    publicKey: sharedPublicKey,
    assistantId: assistantId || assistantIdMapping.en || "",
  };
}

export default router;
