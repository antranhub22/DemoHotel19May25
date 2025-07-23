/**
 * Barrel exports for services directory
 *
 * NOTE: OpenAI services completely disabled to prevent
 * voice model enum bundling errors from client-side bundling
 */

// ❌ COMPLETELY DISABLED: All OpenAI services
// These cause voice model enum bundling errors due to OpenAI voice model enums
// being bundled as variables in the client-side code
//
// export { fetchAIResponse } from './chatService';
// export { getAIChatResponse } from './openaiService';

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
