import { translateToVietnamese } from '@server/openai';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// ============================================
// TRANSLATION ROUTES - RESTful Design
// ============================================

// POST /api/translations/ - Translate text to target language
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage = 'vi', sourceLanguage = 'auto' } = req.body;

    if (!text) {
      return commonErrors.missingFields(res, ['text']);
    }

    if (typeof text !== 'string' || text.length === 0) {
      return commonErrors.validation(res, 'Text must be a non-empty string');
    }

    if (text.length > 5000) {
      return commonErrors.validation(
        res,
        'Text must be less than 5000 characters'
      );
    }

    const supportedLanguages = ['vi', 'en', 'fr', 'zh', 'ru', 'ko'];
    if (!supportedLanguages.includes(targetLanguage)) {
      return commonErrors.validation(
        res,
        `Target language must be one of: ${supportedLanguages.join(', ')}`,
        { supportedLanguages }
      );
    }

    logger.debug(
      `🌐 [TRANSLATIONS] Translating text to ${targetLanguage}: ${text.substring(0, 50)}...`,
      'Translations'
    );

    let translatedText: string;

    try {
      // For now, we only support Vietnamese translation
      // TODO: Extend to support other languages
      if (targetLanguage === 'vi') {
        translatedText = await translateToVietnamese(text);
      } else {
        // Placeholder for other languages
        return apiResponse.error(
          res,
          501,
          ErrorCodes.EXTERNAL_SERVICE_ERROR,
          `Translation to ${targetLanguage} is not yet supported`,
          {
            supportedTargetLanguages: ['vi'],
            requestedLanguage: targetLanguage,
          }
        );
      }

      logger.debug(
        `✅ [TRANSLATIONS] Translation completed: ${translatedText.substring(0, 50)}...`,
        'Translations'
      );

      return apiResponse.success(
        res,
        {
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage,
          characterCount: text.length,
          translatedAt: new Date().toISOString(),
        },
        'Text translated successfully'
      );
    } catch (translationError) {
      logger.error(
        `❌ [TRANSLATIONS] Translation service error:`,
        'Translations',
        translationError
      );

      return apiResponse.error(
        res,
        503,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Translation service temporarily unavailable',
        {
          targetLanguage,
          textLength: text.length,
          error: translationError,
        }
      );
    }
  } catch (error) {
    logger.error(
      '❌ [TRANSLATIONS] Error processing translation:',
      'Translations',
      error
    );
    return commonErrors.internal(res, 'Failed to process translation', error);
  }
});

// GET /api/translations/languages - Get supported languages
router.get('/languages', async (req, res) => {
  try {
    logger.debug(
      '🌐 [TRANSLATIONS] Getting supported languages',
      'Translations'
    );

    const languages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        supported: { source: true, target: false },
      },
      {
        code: 'vi',
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        supported: { source: true, target: true },
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        supported: { source: true, target: false },
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        supported: { source: true, target: false },
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        supported: { source: true, target: false },
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        supported: { source: true, target: false },
      },
    ];

    return apiResponse.success(
      res,
      {
        languages,
        totalLanguages: languages.length,
        supportedTargetLanguages: languages.filter(l => l.supported.target)
          .length,
        supportedSourceLanguages: languages.filter(l => l.supported.source)
          .length,
      },
      'Supported languages retrieved successfully'
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSLATIONS] Error getting languages:',
      'Translations',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to get supported languages',
      error
    );
  }
});

// POST /api/translations/batch - Translate multiple texts at once
router.post('/batch', async (req, res) => {
  try {
    const { texts, targetLanguage = 'vi', sourceLanguage = 'auto' } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return commonErrors.validation(res, 'texts must be an array');
    }

    if (texts.length === 0) {
      return commonErrors.validation(res, 'texts array cannot be empty');
    }

    if (texts.length > 10) {
      return commonErrors.validation(res, 'Maximum 10 texts per batch');
    }

    // Validate each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || typeof text !== 'string' || text.length === 0) {
        return commonErrors.validation(
          res,
          `Text at index ${i} must be a non-empty string`
        );
      }
      if (text.length > 1000) {
        return commonErrors.validation(
          res,
          `Text at index ${i} must be less than 1000 characters for batch processing`
        );
      }
    }

    logger.debug(
      `🌐 [TRANSLATIONS] Batch translating ${texts.length} texts to ${targetLanguage}`,
      'Translations'
    );

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      try {
        if (targetLanguage === 'vi') {
          const translatedText = await translateToVietnamese(text);
          results.push({
            index: i,
            success: true,
            originalText: text,
            translatedText,
            sourceLanguage,
            targetLanguage,
          });
          successCount++;
        } else {
          results.push({
            index: i,
            success: false,
            originalText: text,
            error: `Translation to ${targetLanguage} not supported`,
            sourceLanguage,
            targetLanguage,
          });
          errorCount++;
        }
      } catch (translationError) {
        results.push({
          index: i,
          success: false,
          originalText: text,
          error: 'Translation service error',
          sourceLanguage,
          targetLanguage,
        });
        errorCount++;
      }
    }

    logger.debug(
      `✅ [TRANSLATIONS] Batch translation completed: ${successCount} success, ${errorCount} errors`,
      'Translations'
    );

    return apiResponse.success(
      res,
      {
        results,
        summary: {
          total: texts.length,
          successful: successCount,
          failed: errorCount,
          targetLanguage,
          sourceLanguage,
        },
        translatedAt: new Date().toISOString(),
      },
      `Batch translation completed: ${successCount}/${texts.length} successful`
    );
  } catch (error) {
    logger.error(
      '❌ [TRANSLATIONS] Error processing batch translation:',
      'Translations',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to process batch translation',
      error
    );
  }
});

export default router;
