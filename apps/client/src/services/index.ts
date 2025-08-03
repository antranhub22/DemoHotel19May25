/**
 * Barrel exports for services directory
 *
 * NOTE: OpenAI services completely removed during Layer 4 cleanup
 * These were disabled due to voice model enum bundling errors
 */

// ✅ ENABLED: Non-OpenAI services only
export * from './ReferenceService';

// Dashboard API (safe - no OpenAI dependencies)
export {
  dashboardApi,
  type HotelData,
  type AssistantCustomization,
  type ApiError,
  PERSONALITY_OPTIONS,
  TONE_OPTIONS,
  LANGUAGE_OPTIONS,
  BACKGROUND_SOUND_OPTIONS,
  validateHotelData,
  validateAssistantCustomization,
} from './dashboardApi';
