/* ========================================
   SINGLE SOURCE OF TRUTH - TYPE DEFINITIONS  
   ======================================== */

// ========================================
// PRIMARY TYPE EXPORTS
// ========================================

// Core types (confirmed exports)
export type {
  Language,
  ServiceCategory,
  UserRole,
  Permission,
  AuthErrorCode,
  ID,
  Timestamp,
  BasicHotelData,
  RoomType,
  HotelService,
  ApiResponse,
  ApiError,
} from '../../types/core';

// API types (confirmed exports)
export type {
  HotelData,
  HotelProfile,
  AssistantCustomization,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
  WebSocketMessage,
} from '../../types/api';

// Database types
export type {
  Staff,
  InsertStaff,
  Call,
  InsertCall,
  Transcript,
  InsertTranscript,
  RequestRecord,
  InsertRequestRecord,
  Message,
  InsertMessage,
  CallSummary,
  InsertCallSummary,
  Tenant,
  InsertTenant,
} from '@shared/db/schema';

// ========================================
// 🔧 LAYER 3: UNIFIED SERVICE CATEGORY TYPES
// ========================================

// Service category string identifiers (already exported from core)
// export type ServiceCategory = string union (from core types)

// Service Panel interface (for UI display with name, icon, description)
export interface ServicePanel {
  name: string;
  icon: any; // IconType from react-icons
  description?: string;
}

// Service Category UI Configuration with ID mapping (for backend integration)
export interface ServiceCategoryConfig {
  id: ServiceCategory;
  name: string;
  icon: any; // IconType from react-icons
  description?: string;
}

// ========================================
// 🎯 LAYER 1 COMPLETE - SINGLE TYPE SOURCE
// ========================================
// Usage: import { ServiceCategory, Language, ApiResponse } from '@shared/types';
