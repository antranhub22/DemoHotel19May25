/**
 * Barrel exports for services directory
 */

// API services
export { fetchAIResponse } from './chatService';
export { getAIChatResponse } from './openaiService';
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
  validateAssistantCustomization
} from './dashboardApi'; 