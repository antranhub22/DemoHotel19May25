import { z } from "zod";
import { Prisma } from "@prisma/client";

// Type exports - Using Prisma types
export type Tenant = Prisma.TenantGetPayload<{}>;
export type InsertTenant = Prisma.TenantCreateInput;
export type HotelProfile = Prisma.HotelProfileGetPayload<{}>;
export type InsertHotelProfile = Prisma.HotelProfileCreateInput;
export type Staff = Prisma.StaffGetPayload<{}>;
export type InsertStaff = Prisma.StaffCreateInput;
export type Call = Prisma.CallGetPayload<{}>;
export type InsertCall = Prisma.CallCreateInput;
export type Transcript = Prisma.TranscriptGetPayload<{}>;
export type InsertTranscript = Prisma.TranscriptCreateInput;
export type Request = Prisma.RequestGetPayload<{}>;
export type InsertRequest = Prisma.RequestCreateInput;
export type Message = Prisma.MessageGetPayload<{}>;
export type InsertMessage = Prisma.MessageCreateInput;
export type CallSummary = Prisma.CallSummaryGetPayload<{}>;
export type InsertCallSummary = Prisma.CallSummaryCreateInput;

// Zod Validation Schemas
export const insertTenantSchema = z.object({
  id: z.string().optional(),
  hotel_name: z.string(),
  subdomain: z.string(),
  custom_domain: z.string().nullable().optional(),
  subscription_plan: z.string().optional(),
  subscription_status: z.string().optional(),
  trial_ends_at: z.date().nullable().optional(),
  created_at: z.date().optional(),
  max_voices: z.number().optional(),
  max_languages: z.number().optional(),
  voice_cloning: z.boolean().optional(),
  multi_location: z.boolean().optional(),
  white_label: z.boolean().optional(),
  data_retention_days: z.number().optional(),
  monthly_call_limit: z.number().optional(),
  name: z.string().nullable().optional(),
  updated_at: z.date().optional(),
  is_active: z.boolean().optional(),
  settings: z.string().nullable().optional(),
  tier: z.string().optional(),
  max_calls: z.number().optional(),
  max_users: z.number().optional(),
  features: z.string().nullable().optional(),
});

export const insertHotelProfileSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  research_data: z.string().nullable().optional(),
  assistant_config: z.string().nullable().optional(),
  vapi_assistant_id: z.string().nullable().optional(),
  services_config: z.string().nullable().optional(),
  knowledge_base: z.string().nullable().optional(),
  system_prompt: z.string().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const insertStaffSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  username: z.string(),
  password: z.string(),
  email: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.string().optional(),
  permissions: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  last_login: z.date().nullable().optional(),
  is_active: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const insertCallSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  call_id_vapi: z.string(),
  duration: z.number().nullable().optional(),
  start_time: z.date().nullable().optional(),
  end_time: z.date().nullable().optional(),
  status: z.string().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const insertTranscriptSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  call_id: z.string(),
  content: z.string(),
  role: z.string(),
  timestamp: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const insertRequestSchema = z.object({
  id: z.number().optional(),
  tenant_id: z.string(),
  call_id: z.string().nullable().optional(),
  room_number: z.string().nullable().optional(),
  order_id: z.string().nullable().optional(),
  request_content: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  description: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
});

export const insertMessageSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  call_id: z.string(),
  content: z.string(),
  role: z.string(),
  timestamp: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const insertCallSummarySchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  call_id: z.string(),
  summary: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ==============================================================
// Common Validation Schemas
// ==============================================================

export const LoginCredentialsSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const StaffRoleSchema = z.enum([
  "hotel-manager",
  "front-desk",
  "it-manager",
]);

export const RequestStatusSchema = z.enum([
  "Đã ghi nhận",
  "Đang xử lý",
  "Hoàn thành",
  "Đã hủy",
]);

export const CallRoleSchema = z.enum(["user", "assistant"]);

// ==============================================================
// API Response Schemas
// ==============================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// ==============================================================
// Dashboard Schemas
// ==============================================================

export const DashboardStatsSchema = z.object({
  totalCalls: z.number(),
  totalRequests: z.number(),
  activeStaff: z.number(),
  completionRate: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
