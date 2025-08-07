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
} from "../../types/core";

// API types (confirmed exports)
export type {
  AssistantCustomization,
  HotelData,
  HotelProfile,
  SaveTranscriptRequest,
  SaveTranscriptResponse,
  WebSocketMessage,
} from "../../types/api";

// ✅ PRISMA MIGRATION: Database types from Prisma generated client
import type {
  call as Call,
  call_summaries as CallSummary,
  message as Message,
  request as RequestRecord,
  staff as Staff,
  tenants as Tenant,
  transcript as Transcript,
} from "@prisma/client";

// Database types (using Prisma generated types)
export type {
  Call,
  CallSummary,
  Message,
  RequestRecord,
  Staff,
  Tenant,
  Transcript,
};

// Insert types derived from Prisma types
export type InsertCall = Omit<Call, "id" | "created_at" | "updated_at">;
export type InsertCallSummary = Omit<CallSummary, "id" | "timestamp">;
export type InsertMessage = Omit<Message, "id" | "created_at" | "updated_at">;
export type InsertRequestRecord = Omit<
  RequestRecord,
  "id" | "created_at" | "updated_at"
>;
export type InsertStaff = Omit<Staff, "id" | "created_at" | "updated_at">;
export type InsertTenant = Omit<Tenant, "created_at" | "updated_at">;
export type InsertTranscript = Omit<Transcript, "id" | "timestamp">;

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

// Service category types
export type ServiceCategory =
  | "room_service"
  | "housekeeping"
  | "maintenance"
  | "concierge"
  | "spa_wellness"
  | "dining"
  | "transportation"
  | "business_center"
  | "laundry"
  | "wake_up_call"
  | "other";

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
