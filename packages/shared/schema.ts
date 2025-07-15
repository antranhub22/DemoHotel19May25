import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import table definitions from database schema
import { 
  tenants, 
  hotelProfiles, 
  call, 
  transcript, 
  request, 
  message, 
  staff,
  call_summaries,
} from "./db/schema";

// Re-export tables for convenience
export {
  tenants,
  hotelProfiles,
  call,
  transcript,
  request,
  message,
  staff,
  call_summaries,
};

// ==============================================================
// Zod Validation Schemas - Simple approach to avoid TypeScript errors
// ==============================================================

export const insertTenantSchema = createInsertSchema(tenants);
export const insertHotelProfileSchema = createInsertSchema(hotelProfiles);
export const insertStaffSchema = createInsertSchema(staff);
export const insertCallSchema = createInsertSchema(call);
export const insertTranscriptSchema = createInsertSchema(transcript);
export const insertRequestSchema = createInsertSchema(request);
export const insertMessageSchema = createInsertSchema(message);
export const insertCallSummarySchema = createInsertSchema(call_summaries);

// Legacy alias for backward compatibility
export const callSummaries = call_summaries;

// Type exports - Direct from database schema
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type HotelProfile = typeof hotelProfiles.$inferSelect;
export type InsertHotelProfile = typeof hotelProfiles.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
export type Call = typeof call.$inferSelect;
export type InsertCall = typeof call.$inferInsert;
export type Transcript = typeof transcript.$inferSelect;
export type InsertTranscript = typeof transcript.$inferInsert;
export type Request = typeof request.$inferSelect;
export type InsertRequest = typeof request.$inferInsert;
export type Message = typeof message.$inferSelect;
export type InsertMessage = typeof message.$inferInsert;
export type CallSummary = typeof call_summaries.$inferSelect;
export type InsertCallSummary = typeof call_summaries.$inferInsert;

// ==============================================================
// Common Validation Schemas
// ==============================================================

export const LoginCredentialsSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const StaffRoleSchema = z.enum(["hotel-manager", "front-desk", "it-manager"]);

export const RequestStatusSchema = z.enum([
  "Đã ghi nhận",
  "Đang xử lý", 
  "Hoàn thành",
  "Đã hủy"
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

// ==============================================================
// Legacy Support (Deprecated - for backward compatibility only)
// ==============================================================

export const UsersSchema = insertStaffSchema; // Deprecated: Use insertStaffSchema
export const OrdersSchema = insertRequestSchema; // Deprecated: Use insertRequestSchema
export const insertOrderSchema = insertRequestSchema; // Alias for backward compatibility
