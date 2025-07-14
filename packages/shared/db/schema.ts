import { sqliteTable, text, integer, real, numeric, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==============================================================
// Database Table Definitions
// ==============================================================

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  settings: text("settings", { mode: "json" }),
  tier: text("tier").default("free"),
  maxCalls: integer("max_calls").default(1000),
  maxUsers: integer("max_users").default(10),
  features: text("features", { mode: "json" }),
  customDomain: text("custom_domain"),
  hotelName: text("hotel_name"),
});

export const hotelProfiles = sqliteTable("hotel_profiles", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  description: text("description"),
  amenities: text("amenities", { mode: "json" }),
  policies: text("policies", { mode: "json" }),
  checkInTime: text("check_in_time"),
  checkOutTime: text("check_out_time"),
  roomTypes: text("room_types", { mode: "json" }),
  services: text("services", { mode: "json" }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  role: text("role").default("staff"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const call = sqliteTable("call", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id),
  callIdVapi: text("call_id_vapi"), // Added missing field
  assistantId: text("assistant_id"),
  customerId: text("customer_id"),
  phoneNumber: text("phone_number"),
  roomNumber: text("room_number"), // Added missing field
  language: text("language"), // Added missing field
  serviceType: text("service_type"), // Added missing field
  duration: integer("duration"),
  cost: real("cost"),
  summary: text("summary"),
  analysis: text("analysis"),
  rating: integer("rating"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  endTime: text("end_time"), // Added missing field
  status: text("status"),
  type: text("type"),
  direction: text("direction"),
  endReason: text("end_reason"),
  costBreakdown: text("cost_breakdown", { mode: "json" }),
  messages: text("messages", { mode: "json" }),
  artifact: text("artifact", { mode: "json" }),
});

export const transcript = sqliteTable("transcript", {
  id: text("id").primaryKey(),
  callId: text("call_id").references(() => call.id),
  tenantId: text("tenant_id").references(() => tenants.id),
  role: text("role"), // Added missing field
  content: text("content").notNull(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  speaker: text("speaker"),
  confidence: real("confidence"),
  language: text("language"),
  emotion: text("emotion"),
  sentiment: text("sentiment"),
  keywords: text("keywords", { mode: "json" }),
  duration: integer("duration"),
  wordCount: integer("word_count"),
});

export const request = sqliteTable("request", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id),
  callId: text("call_id").references(() => call.id),
  type: text("type").notNull(),
  description: text("description"),
  roomNumber: text("room_number"), // Already exists
  orderId: text("order_id"), // Added missing field
  requestContent: text("request_content"), // Added missing field
  priority: text("priority").default("medium"),
  status: text("status").default("pending"),
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
  metadata: text("metadata", { mode: "json" }),
  customerInfo: text("customer_info", { mode: "json" }),
  guestName: text("guest_name"),
  phoneNumber: text("phone_number"),
  urgency: text("urgency"),
  category: text("category"),
  subcategory: text("subcategory"),
  estimatedTime: integer("estimated_time"),
  actualTime: integer("actual_time"),
  cost: real("cost"),
  notes: text("notes"),
  attachments: text("attachments", { mode: "json" }),
});

export const message = sqliteTable("message", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id),
  callId: text("call_id").references(() => call.id),
  requestId: integer("request_id"), // Added missing field
  sender: text("sender"), // Added missing field
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  metadata: text("metadata", { mode: "json" }),
  toolCalls: text("tool_calls", { mode: "json" }),
  functionName: text("function_name"),
  functionArgs: text("function_args", { mode: "json" }),
  functionResult: text("function_result"),
  isError: integer("is_error", { mode: "boolean" }).default(false),
  processingTime: integer("processing_time"),
  tokens: integer("tokens"),
  model: text("model"),
  temperature: real("temperature"),
  maxTokens: integer("max_tokens"),
});

// Legacy aliases for backwards compatibility
export const users = staff;
export const transcripts = transcript;
export const orders = request;
export const callSummaries = call; 