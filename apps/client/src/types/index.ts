// Core types
export type {
  Transcript,
  OrderSummary,
  OrderItem,
  Order,
  CallDetails,
  InterfaceLayer,
  ServiceRequest,
  ActiveOrder,
  CallSummary,
  // AssistantContextType // ✅ DEPRECATED: Use RefactoredAssistantContextType
} from './core';

// API types that exist
export type {
  ApiResponse,
  ApiError,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
} from './api';

// Interface specific types
export type {
  Interface1Props,
  ServiceCategory,
  Language,
} from './interface1.types';
