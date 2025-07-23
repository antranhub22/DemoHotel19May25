/**
 * Barrel exports for services directory
 *
 * NOTE: OpenAI services moved to server-side to prevent
 * "Fable is not defined" errors from client-side bundling
 */

// ❌ DISABLED: Client-side OpenAI services
// These have been moved to server-side to prevent bundling issues
// export { fetchAIResponse } from './chatService';
// export { getAIChatResponse } from './openaiService';

// ✅ ENABLED: Server-side proxy functions (safe for client)
export { getAIChatResponse } from './openaiService'; // Now calls server-side API
export * from './ReferenceService';

// Dashboard API
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
