/**
 * Shared constants for the application
 */

// ========================================
// API CONSTANTS
// ========================================

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/staff/login',

  // Call Management
  TRANSCRIPTS: '/api/transcripts/:callId',
  STORE_SUMMARY: '/api/store-summary',
  SUMMARIES: '/api/summaries/:callId',
  RECENT_SUMMARIES: '/api/summaries/recent/:hours',
  TRANSLATE: '/api/translate-to-vietnamese',
  CALL_END: '/api/call-end',

  // Orders Management
  REQUESTS: '/api/request',
  REQUEST_BY_ID: '/api/request/:requestId',
  UPDATE_REQUEST_STATUS: '/api/request/:requestId/status',

  // Messages
  MESSAGES: '/api/messages',
  MESSAGE_BY_ID: '/api/messages/:messageId',

  // Analytics
  ANALYTICS_OVERVIEW: '/api/analytics/overview',
  ANALYTICS_SERVICE_DISTRIBUTION: '/api/analytics/service-distribution',
  ANALYTICS_HOURLY_ACTIVITY: '/api/analytics/hourly-activity',
  ANALYTICS_LANGUAGE_DISTRIBUTION: '/api/analytics/language-distribution',

  // Hotel Research
  HOTEL_RESEARCH: '/api/hotel-research',
  GENERATE_ASSISTANT: '/api/generate-assistant',
  HOTEL_PROFILE: '/api/hotel-profile',
  UPDATE_ASSISTANT_CONFIG: '/api/update-assistant-config',

  // Health Check
  HEALTH: '/api/health',
  SERVICE_HEALTH: '/api/service-health',
} as const;

// ========================================
// SERVICE CATEGORIES
// ========================================

export const SERVICE_CATEGORIES = {
  FOOD: 'food',
  HOUSEKEEPING: 'housekeeping',
  ROOM_SERVICE: 'roomService',
  SPA: 'spa',
  TRANSPORTATION: 'transportation',
  TOURS: 'tours',
  TECHNICAL: 'technical',
  CONCIERGE: 'concierge',
  WELLNESS: 'wellness',
  SECURITY: 'security',
  SPECIAL_OCCASION: 'specialOccasion',
  WIFI: 'wifi',
  CHECK_IN: 'checkIn',
  CHECK_OUT: 'checkOut',
  INFORMATION: 'information',
  FEEDBACK: 'feedback',
  SUPPORT: 'support',
  OTHER: 'other',
} as const;

// ========================================
// ORDER TYPES
// ========================================

export const ORDER_TYPES = {
  ROOM_SERVICE: 'roomService',
  HOUSEKEEPING: 'housekeeping',
  CONCIERGE: 'concierge',
  TECHNICAL: 'technical',
  TRANSPORTATION: 'transportation',
  SPA: 'spa',
  TOURS: 'tours',
  OTHER: 'other',
} as const;

// ========================================
// DELIVERY TIMES
// ========================================

export const DELIVERY_TIMES = {
  ASAP: 'asap',
  THIRTY_MIN: '30min',
  ONE_HOUR: '1hour',
  SPECIFIC: 'specific',
} as const;

// ========================================
// LANGUAGES
// ========================================

export const LANGUAGES = {
  ENGLISH: 'en',
  VIETNAMESE: 'vi',
  FRENCH: 'fr',
  CHINESE: 'zh',
  RUSSIAN: 'ru',
  KOREAN: 'ko',
} as const;

// ========================================
// CALL STATUS
// ========================================

export const CALL_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDED: 'ended',
  ERROR: 'error',
} as const;

// ========================================
// MESSAGE TYPES
// ========================================

export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

// ========================================
// ERROR CODES
// ========================================

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// ========================================
// HTTP STATUS CODES
// ========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ========================================
// UI CONSTANTS
// ========================================

export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },

  // Z-index levels
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
  },
} as const;

// ========================================
// VALIDATION PATTERNS
// ========================================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  ROOM_NUMBER: /^[0-9]{1,4}[A-Za-z]?$/,
  CURRENCY: /^\d+(?:,\d{3})*(?:\.\d{2})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
} as const;

// ========================================
// DEFAULT VALUES
// ========================================

export const DEFAULT_VALUES = {
  // API
  API_TIMEOUT: 10000,
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Call
  DEFAULT_CALL_DURATION: 1800, // 30 minutes
  DEFAULT_SILENCE_TIMEOUT: 30,

  // UI
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_TOAST_DURATION: 5000,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
} as const;

// ========================================
// ENVIRONMENT CONSTANTS
// ========================================

export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// ========================================
// FEATURE FLAGS
// ========================================

export const FEATURE_FLAGS = {
  MULTI_LANGUAGE: true,
  ANALYTICS: true,
  HOTEL_RESEARCH: true,
  ASSISTANT_GENERATION: true,
  REAL_TIME_TRANSCRIPTION: true,
  VOICE_ASSISTANT: true,
} as const;

// ===== POPUP DIMENSIONS =====
// Chiều cao tiêu chuẩn để không che nút Siri Button (280-320px container)
export const POPUP_DIMENSIONS = {
  STANDARD_HEIGHT: 120, // px - Further reduced for better mobile clearance
  MAX_WIDTH: 350, // px - Phù hợp mobile
  MAX_HEIGHT_VH: 20, // % - Further reduced to 20% viewport height for mobile
  MIN_HEIGHT: 100, // px - Chiều cao tối thiểu (điều chỉnh cho 120px)
  SIRI_BUTTON_CLEARANCE: 40, // px - Minimal clearance for closest popup positioning
} as const;

// Popup positioning để tránh che nút Siri Button
export const POPUP_POSITIONING = {
  BOTTOM_OFFSET: 60, // px - Minimal offset for closest popup positioning (iPhone compatible)
  STACK_OFFSET: 12, // px - Khoảng cách giữa các popup xếp chồng
  SCALE_FACTOR: 0.03, // Tỷ lệ thu nhỏ cho stacking effect
} as const;
