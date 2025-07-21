/**
 * Barrel exports for lib directory
 */

// Core utilities
export { cn } from './utils';
export {
  normalizeText,
  stringSimilarity,
  removeSimilarItems,
  extractRoomNumber,
  extractTime,
  extractDate,
  extractPeople,
  extractLocation,
  extractAmount,
  extractSpecialInstructions,
  extractDeliveryTime,
  extractTotalAmount,
  isValidEmail,
  isValidPhone,
  isValidRoomNumber,
  formatCurrency,
  formatDate,
  formatTime,
  capitalizeWords,
  truncateText,
  PATTERNS,
} from './sharedUtils';

// Summary parsing
export {
  parseSummaryToOrderDetails,
  extractRoomNumber as extractRoomNumberFromSummary,
} from './summaryParser';

// API client
export { ApiClient } from './apiClient';

// Vapi client
export { initVapi, getVapiInstance, FORCE_BASIC_SUMMARY } from './vapiClient';

// Query client
export { apiRequest } from './queryClient';

// Constants
export {
  API_ENDPOINTS,
  SERVICE_CATEGORIES,
  ORDER_TYPES,
  DELIVERY_TIMES,
  LANGUAGES,
  CALL_STATUS,
  MESSAGE_TYPES,
  ERROR_CODES,
  HTTP_STATUS,
  UI_CONSTANTS,
  VALIDATION_PATTERNS,
  DEFAULT_VALUES,
  ENV,
  FEATURE_FLAGS,
} from './constants';
