/* ========================================
   TYPES INDEX - CENTRALIZED TYPE EXPORTS
   ======================================== */

// ========================================
// CORE TYPES
// ========================================

export * from './core';

// ========================================
// API TYPES (excluding conflicting types)
// ========================================

export type {
  HotelData,
  HotelProfile,
  AssistantCustomization,
  HotelResearchRequest,
  HotelResearchResponse,
  GenerateAssistantRequest,
  GenerateAssistantResponse,
  HotelProfileResponse,
  UpdateAssistantConfigRequest,
  UpdateAssistantConfigResponse,
  AnalyticsResponse,
  ServiceHealthResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  StartCallRequest,
  StartCallResponse,
  EndCallRequest,
  EndCallResponse,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
  PaginationParams,
  PaginatedResponse,
  WebSocketMessage,
  TranscriptMessage,
  OrderStatusMessage,
  CallEndMessage,
  InitMessage,
  ErrorMessage,
} from './api';

// ========================================
// UI TYPES (basic exports only)
// ========================================

export type {
  ButtonProps,
  InputProps,
  ModalProps,
  TableProps,
  CardProps,
  ToastProps,
  // ✅ FIXED: Commented out all non-existent exports to avoid errors
} from './ui';

// ========================================
// LEGACY TYPES (for backwards compatibility)
// ========================================

// Note: All types are now consolidated in core.ts, api.ts, and ui.ts
// This file serves as the main export point for all types
