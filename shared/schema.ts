import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export schema tables from the main database schema
export { 
  tenants, 
  hotelProfiles, 
  call, 
  transcript, 
  request, 
  message, 
  staff 
} from "../src/db/schema";

import { 
  tenants, 
  hotelProfiles, 
  call, 
  transcript, 
  request, 
  message, 
  staff 
} from "../src/db/schema";

// ============================================
// Multi-tenancy Schema Definitions
// ============================================

// Tenant schema
export const insertTenantSchema = createInsertSchema(tenants, {
  hotelName: z.string().min(1, "Hotel name is required"),
  subdomain: z.string().min(1, "Subdomain is required").regex(/^[a-z0-9-]+$/, "Subdomain must contain only lowercase letters, numbers, and hyphens"),
  subscriptionPlan: z.enum(["trial", "basic", "premium", "enterprise"]).default("trial"),
  subscriptionStatus: z.enum(["active", "inactive", "expired", "cancelled"]).default("active"),
}).pick({
  hotelName: true,
  subdomain: true,
  customDomain: true,
  subscriptionPlan: true,
  subscriptionStatus: true,
  trialEndsAt: true,
  maxVoices: true,
  maxLanguages: true,
  voiceCloning: true,
  multiLocation: true,
  whiteLabel: true,
  dataRetentionDays: true,
  monthlyCallLimit: true
});

export const selectTenantSchema = createSelectSchema(tenants);

// Hotel Profile schema
export const insertHotelProfileSchema = createInsertSchema(hotelProfiles, {
  tenantId: z.string().uuid("Invalid tenant ID"),
  researchData: z.any().optional(),
  assistantConfig: z.any().optional(),
  servicesConfig: z.any().optional(),
  knowledgeBase: z.string().optional(),
  systemPrompt: z.string().optional()
}).pick({
  tenantId: true,
  researchData: true,
  assistantConfig: true,
  vapiAssistantId: true,
  servicesConfig: true,
  knowledgeBase: true,
  systemPrompt: true
});

export const selectHotelProfileSchema = createSelectSchema(hotelProfiles);

// ============================================
// Updated Existing Schema with tenant_id
// ============================================

// Call schema (updated with tenant_id)
export const insertCallSchema = createInsertSchema(call, {
  callIdVapi: z.string().min(1, "Call ID is required"),
  tenantId: z.string().uuid("Invalid tenant ID").optional()
}).pick({
  callIdVapi: true,
  roomNumber: true,
  language: true,
  serviceType: true,
  duration: true,
  tenantId: true
});

// Transcript schema (updated with tenant_id)
export const insertTranscriptSchema = createInsertSchema(transcript, {
  callId: z.string().min(1, "Call ID is required"),
  role: z.string().min(1, "Role is required"),
  content: z.string().min(1, "Content is required"),
  tenantId: z.string().uuid("Invalid tenant ID").optional()
}).pick({
  callId: true,
  role: true,
  content: true,
  tenantId: true
});

// Request schema (updated with tenant_id)
export const insertRequestSchema = createInsertSchema(request, {
  tenantId: z.string().uuid("Invalid tenant ID").optional()
}).pick({
  roomNumber: true,
  orderId: true,
  requestContent: true,
  status: true,
  tenantId: true
});

// Message schema (updated with tenant_id)
export const insertMessageSchema = createInsertSchema(message, {
  requestId: z.number().int().positive("Invalid request ID"),
  sender: z.string().min(1, "Sender is required"),
  content: z.string().min(1, "Content is required"),
  tenantId: z.string().uuid("Invalid tenant ID").optional()
}).pick({
  requestId: true,
  sender: true,
  content: true,
  tenantId: true
});

// Staff schema (updated with tenant_id)
export const insertStaffSchema = createInsertSchema(staff, {
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantId: z.string().uuid("Invalid tenant ID").optional()
}).pick({
  username: true,
  password: true,
  role: true,
  tenantId: true
});

// ============================================
// Backwards Compatibility (deprecated but maintained)
// ============================================

// Legacy schemas for backwards compatibility
export const users = staff; // Map users to staff table
export const transcripts = transcript; // Singular to plural mapping
export const orders = request; // Map orders to request table
export const callSummaries = call; // Map callSummaries to call table

export const insertUserSchema = insertStaffSchema;
export const insertOrderSchema = insertRequestSchema;
export const insertCallSummarySchema = insertCallSchema;

// ============================================
// TypeScript Types
// ============================================

// Multi-tenancy types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertHotelProfile = z.infer<typeof insertHotelProfileSchema>;
export type HotelProfile = typeof hotelProfiles.$inferSelect;

// Updated existing types with tenant_id
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof call.$inferSelect;

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcript.$inferSelect;

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof request.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof message.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Backwards compatibility types (deprecated)
export type User = Staff;
export type InsertUser = InsertStaff;
export type Order = Request;
export type InsertOrder = InsertRequest;
export type CallSummary = Call;
export type InsertCallSummary = InsertCall;
