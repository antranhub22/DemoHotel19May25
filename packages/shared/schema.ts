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
  // Legacy aliases
  users,
  transcripts,
  // orders, // ❌ DEPRECATED: Use 'request' directly
  callSummaries,
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
  // Legacy aliases
  users,
  transcripts,
  // orders, // ❌ DEPRECATED: Use 'request' directly
  callSummaries,
};

// ============================================
// Multi-tenancy Schema Definitions
// ============================================

// Tenant schema
export const insertTenantSchema = createInsertSchema(tenants, {
  name: z.string().min(1).max(255),
  subdomain: z.string().min(1).max(63),
  isActive: z.boolean().optional(),
  settings: z.any().optional(),
  tier: z.enum(["free", "premium", "enterprise"]).optional(),
  maxCalls: z.number().positive().optional(),
  maxUsers: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  customDomain: z.string().optional(),
  hotelName: z.string().optional(),
});

// Hotel profile schema
export const insertHotelProfileSchema = createInsertSchema(hotelProfiles, {
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  policies: z.any().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  roomTypes: z.array(z.any()).optional(),
  services: z.array(z.string()).optional(),
});

// Staff schema
export const insertStaffSchema = createInsertSchema(staff, {
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "staff"]).optional(),
  isActive: z.boolean().optional(),
});

// Call schema
export const insertCallSchema = createInsertSchema(call, {
  callIdVapi: z.string().optional(),
  assistantId: z.string().optional(),
  customerId: z.string().optional(),
  phoneNumber: z.string().optional(),
  roomNumber: z.string().optional(),
  language: z.string().optional(),
  serviceType: z.string().optional(),
  duration: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  summary: z.string().optional(),
  analysis: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  status: z.enum(["active", "completed", "failed", "cancelled"]).optional(),
  type: z.enum(["inbound", "outbound"]).optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
  endReason: z.string().optional(),
  costBreakdown: z.any().optional(),
  messages: z.array(z.any()).optional(),
  artifact: z.any().optional(),
});

// Transcript schema
export const insertTranscriptSchema = createInsertSchema(transcript, {
  role: z.string().optional(),
  content: z.string().min(1),
  speaker: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  language: z.string().optional(),
  emotion: z.string().optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  keywords: z.array(z.string()).optional(),
  duration: z.number().positive().optional(),
  wordCount: z.number().positive().optional(),
});

// Request schema
export const insertRequestSchema = createInsertSchema(request, {
  type: z.string().min(1),
  description: z.string().optional(),
  roomNumber: z.string().optional(),
  orderId: z.string().optional(),
  requestContent: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled", "Đã ghi nhận"]).optional(),
  assignedTo: z.string().optional(),
  guestName: z.string().optional(),
  phoneNumber: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  estimatedTime: z.number().positive().optional(),
  actualTime: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// Message schema
export const insertMessageSchema = createInsertSchema(message, {
  requestId: z.number().optional(),
  sender: z.string().optional(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().min(1),
  metadata: z.any().optional(),
  toolCalls: z.array(z.any()).optional(),
  functionName: z.string().optional(),
  functionArgs: z.any().optional(),
  functionResult: z.string().optional(),
  isError: z.boolean().optional(),
  processingTime: z.number().positive().optional(),
  tokens: z.number().positive().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

// ============================================
// Order Schema (CONSOLIDATED into Request Schema)
// ============================================
// ✅ Use insertRequestSchema for both orders and requests
export const insertOrderSchema = insertRequestSchema;

// Legacy schemas for backwards compatibility
export const insertCallSummarySchema = insertCallSchema;
export const insertUserSchema = insertStaffSchema;

// ============================================
// Inferred Types
// ============================================

// Tenant types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertHotelProfile = z.infer<typeof insertHotelProfileSchema>;
export type HotelProfile = typeof hotelProfiles.$inferSelect;

// Call types
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

// Convenience aliases
export type User = Staff;
export type InsertUser = InsertStaff;
export type Order = Request;
export type InsertOrder = InsertRequest;
export type CallSummary = Call;
export type InsertCallSummary = InsertCall;
