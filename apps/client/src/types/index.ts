// Core types
export type {
  ActiveOrder,
  CallDetails,
  CallSummary,
  InterfaceLayer,
  Order,
  OrderItem,
  OrderSummary,
  ServiceRequest,
  Transcript,
} from './core';

// API types that exist
export type {
  ApiError,
  ApiResponse,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
} from './api';

// Interface specific types
export type {
  Interface1Props, // ✅ FIXED: Use correct export name
  Language,
  SERVICE_CATEGORIES,
} from './interface1.types';
