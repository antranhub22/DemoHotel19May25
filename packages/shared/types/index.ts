/* ========================================
   SINGLE SOURCE OF TRUTH - TYPE DEFINITIONS  
   ======================================== */

// ========================================
// PRIMARY TYPE EXPORTS
// ========================================

// Core types (confirmed exports)
export type {
  ApiError,
  ApiResponse,
  AuthErrorCode,
  BasicHotelData,
  HotelService,
  ID,
  Language,
  Permission,
  RoomType,
  ServiceCategory,
  Timestamp,
  UserRole,
} from '../../types/core';

// API types (confirmed exports)
export type {
  AssistantCustomization,
  HotelData,
  HotelProfile,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
  WebSocketMessage,
} from '../../types/api';

// Database types
export type {
  Call,
  CallSummary,
  InsertCall,
  InsertCallSummary,
  InsertMessage,
  InsertRequestRecord,
  InsertStaff,
  InsertTenant,
  InsertTranscript,
  Message,
  RequestRecord,
  Staff,
  Tenant,
  Transcript,
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
