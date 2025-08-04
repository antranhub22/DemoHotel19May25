// ✅ PRISMA VALIDATION SCHEMAS - 100% PRISMA MIGRATION
// Replaces Drizzle schema validation with Prisma-compatible schemas

import { z } from "zod";

// ============================================================================
// SERVICE VALIDATION SCHEMA
// ============================================================================

export const insertServiceSchema = z.object({
  tenant_id: z.string(),
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  price: z.number(),
  currency: z.string().max(10).default("VND"),
  category: z.string().max(50),
  subcategory: z.string().max(50).optional(),
  is_active: z.boolean().default(true),
  estimated_time: z.number().optional(),
});

export const updateServiceSchema = insertServiceSchema
  .partial()
  .omit({ tenant_id: true });

// ============================================================================
// REQUEST VALIDATION SCHEMA
// ============================================================================

export const insertRequestSchema = z.object({
  room: z.string().max(255),
  order_id: z.string().max(255),
  guest_name: z.string().max(255),
  content: z.string(),
  status: z.string().max(50).default("pending"),
  call_id: z.string().max(255).optional(),
  tenant_id: z.string().max(255).optional(),
  description: z.string().optional(),
  priority: z.string().max(50).default("medium"),
  assigned_to: z.string().max(255).optional(),
  metadata: z.string().optional(),
  type: z.string().max(50).default("order"),
  total_amount: z.number().optional(),
  items: z.string().optional(),
  delivery_time: z.date().optional(),
  special_instructions: z.string().optional(),
  order_type: z.string().max(100).optional(),
  service_id: z.string().max(255).optional(),
  urgency: z.string().max(20).optional(),
});

export const updateRequestSchema = insertRequestSchema.partial();

// ============================================================================
// TENANT VALIDATION SCHEMA
// ============================================================================

export const insertTenantSchema = z.object({
  id: z.string(),
  hotel_name: z.string().max(200).optional(),
  subdomain: z.string().max(50),
  custom_domain: z.string().max(100).optional(),
  subscription_plan: z.string().max(50).default("trial"),
  subscription_status: z.string().max(50).default("active"),
  trial_ends_at: z.date().optional(),
  max_voices: z.number().default(5),
  max_languages: z.number().default(4),
  voice_cloning: z.boolean().default(false),
  multi_location: z.boolean().default(false),
  white_label: z.boolean().default(false),
  data_retention_days: z.number().default(90),
  monthly_call_limit: z.number().default(1000),
  name: z.string().max(200).optional(),
  is_active: z.boolean().default(true),
  settings: z.string().optional(),
  tier: z.string().max(50).default("free"),
  max_calls: z.number().default(1000),
  max_users: z.number().default(10),
  features: z.string().optional(),
});

export const updateTenantSchema = insertTenantSchema
  .partial()
  .omit({ id: true });

// ============================================================================
// STAFF VALIDATION SCHEMA
// ============================================================================

export const insertStaffSchema = z.object({
  username: z.string().max(255),
  password: z.string(),
  role: z.string().max(50).default("front-desk"),
  tenant_id: z.string().optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  is_active: z.boolean().default(true),
  display_name: z.string().max(255).optional(),
  avatar_url: z.string().optional(),
  permissions: z.string().default("[]"),
  last_login: z.date().optional(),
});

export const updateStaffSchema = insertStaffSchema.partial();

// ============================================================================
// CALL VALIDATION SCHEMA
// ============================================================================

export const insertCallSchema = z.object({
  tenant_id: z.string().optional(),
  call_id_vapi: z.string().optional(),
  room_number: z.string().max(20).optional(),
  language: z.string().max(10).default("en"),
  service_type: z.string().max(100).optional(),
  duration: z.number().optional(),
  start_time: z.date().optional(),
  end_time: z.date().optional(),
});

export const updateCallSchema = insertCallSchema.partial();

// ============================================================================
// TRANSCRIPT VALIDATION SCHEMA
// ============================================================================

export const insertTranscriptSchema = z.object({
  call_id: z.string(),
  role: z.string(),
  content: z.string(),
  timestamp: z.date().default(() => new Date()),
  tenant_id: z.string().default("default"),
});

export const updateTranscriptSchema = insertTranscriptSchema.partial();

// ============================================================================
// MESSAGE VALIDATION SCHEMA
// ============================================================================

export const insertMessageSchema = z.object({
  request_id: z.number(),
  sender: z.string().max(255),
  content: z.string(),
  time: z.date().default(() => new Date()),
});

export const updateMessageSchema = insertMessageSchema.partial();

// ============================================================================
// CALL SUMMARY VALIDATION SCHEMA
// ============================================================================

export const insertCallSummarySchema = z.object({
  call_id: z.string(),
  content: z.string(),
  timestamp: z.date().default(() => new Date()),
  room_number: z.string().optional(),
  duration: z.string().optional(),
});

export const updateCallSummarySchema = insertCallSummarySchema.partial();

// ============================================================================
// HOTEL PROFILE VALIDATION SCHEMA
// ============================================================================

export const insertHotelProfileSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  research_data: z.string().optional(),
  assistant_config: z.string().optional(),
  vapi_assistant_id: z.string().optional(),
  services_config: z.string().optional(),
  knowledge_base: z.string().optional(),
  system_prompt: z.string().optional(),
});

export const updateHotelProfileSchema = insertHotelProfileSchema
  .partial()
  .omit({ id: true });

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export {
  insertCallSchema as callInsertSchema,
  insertCallSummarySchema as callSummaryInsertSchema,
  updateCallSummarySchema as callSummaryUpdateSchema,
  updateCallSchema as callUpdateSchema,
  insertHotelProfileSchema as hotelProfileInsertSchema,
  updateHotelProfileSchema as hotelProfileUpdateSchema,
  insertMessageSchema as messageInsertSchema,
  updateMessageSchema as messageUpdateSchema,
  insertRequestSchema as requestInsertSchema,
  updateRequestSchema as requestUpdateSchema,
  insertServiceSchema as serviceInsertSchema,
  updateServiceSchema as serviceUpdateSchema,
  insertStaffSchema as staffInsertSchema,
  updateStaffSchema as staffUpdateSchema,
  insertTenantSchema as tenantInsertSchema,
  updateTenantSchema as tenantUpdateSchema,
  insertTranscriptSchema as transcriptInsertSchema,
  updateTranscriptSchema as transcriptUpdateSchema,
};

// ============================================================================
// MIGRATION STATUS: COMPLETE PRISMA REPLACEMENT
// ============================================================================

/*
🎉 100% PRISMA VALIDATION SCHEMAS

✅ REPLACED DRIZZLE SCHEMAS:
- insertServiceSchema ✅
- All table validation schemas ✅
- Proper Zod integration ✅

✅ FEATURES:
- Type-safe validation
- Prisma-compatible field names
- Default value support
- Optional field handling
- Proper constraints

🚀 USAGE:
import { insertServiceSchema } from '@shared/validation/prismaSchemas';
*/
