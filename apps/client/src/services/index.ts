/**
 * Services - Public API
 * Application services and API clients for DemoHotel
 */

// ========================================
// Core Services
// ========================================
export * from "./ReferenceService";

// ========================================
// Dashboard API Services
// ========================================
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
} from "./dashboardApi";

// ========================================
// Note: OpenAI services removed in Layer 4 cleanup
// Safe from voice model enum bundling errors
// ========================================
