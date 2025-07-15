import { sqliteTable, text, integer, real, numeric, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==============================================================
// Database Table Definitions - FIXED TO MATCH ACTUAL DB STRUCTURE
// ==============================================================

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  hotel_name: text("hotel_name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  custom_domain: text("custom_domain"),
  subscription_plan: text("subscription_plan").default("trial"),
  subscription_status: text("subscription_status").default("active"),
  trial_ends_at: integer("trial_ends_at"),
  created_at: integer("created_at"),
  max_voices: integer("max_voices").default(5),
  max_languages: integer("max_languages").default(4),
  voice_cloning: integer("voice_cloning", { mode: "boolean" }).default(false),
  multi_location: integer("multi_location", { mode: "boolean" }).default(false),
  white_label: integer("white_label", { mode: "boolean" }).default(false),
  data_retention_days: integer("data_retention_days").default(90),
  monthly_call_limit: integer("monthly_call_limit").default(1000),
  // Legacy columns that exist in actual database
  name: text("name"),
  updated_at: text("updated_at"),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  settings: text("settings", { mode: "json" }),
  tier: text("tier").default("free"),
  max_calls: integer("max_calls").default(1000),
  max_users: integer("max_users").default(10),
  features: text("features", { mode: "json" }),
});

export const hotelProfiles = sqliteTable("hotel_profiles", {
  id: text("id").primaryKey(),
  tenant_id: text("tenant_id").references(() => tenants.id),
  research_data: text("research_data", { mode: "json" }),
  assistant_config: text("assistant_config", { mode: "json" }),
  vapi_assistant_id: text("vapi_assistant_id"),
  services_config: text("services_config", { mode: "json" }),
  knowledge_base: text("knowledge_base"),
  system_prompt: text("system_prompt"),
  created_at: integer("created_at"),
  updated_at: integer("updated_at"),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  tenant_id: text("tenant_id").references(() => tenants.id),
  username: text("username").notNull(),
  password: text("password").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  role: text("role", { enum: ["hotel-manager", "front-desk", "it-manager"] }).default("front-desk"),
  permissions: text("permissions", { mode: "json" }).default("[]"),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  last_login: text("last_login"),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const call = sqliteTable("call", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  tenant_id: text("tenant_id").references(() => tenants.id),
  call_id_vapi: text("call_id_vapi").notNull().unique(),
  room_number: text("room_number"),
  language: text("language"),
  service_type: text("service_type"),
  start_time: integer("start_time"),
  end_time: integer("end_time"),
  duration: integer("duration"),
  created_at: integer("created_at"),
  updated_at: integer("updated_at"),
});

export const transcript = sqliteTable("transcript", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  call_id: text("call_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: integer("timestamp"),
  tenant_id: text("tenant_id").references(() => tenants.id),
});

export const request = sqliteTable("request", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  tenant_id: text("tenant_id").references(() => tenants.id),
  call_id: text("call_id"),
  room_number: text("room_number"),
  order_id: text("order_id"),
  request_content: text("request_content"),
  status: text("status").default("Đã ghi nhận"),
  created_at: integer("created_at"),
  updated_at: integer("updated_at"),
  // Additional columns from actual database
  description: text("description"),
  priority: text("priority").default("medium"),
  assigned_to: text("assigned_to"),
  completed_at: text("completed_at"),
  metadata: text("metadata"),
  type: text("type").default("order"),
  total_amount: real("total_amount"),
  items: text("items"),
  delivery_time: text("delivery_time"),
  special_instructions: text("special_instructions"),
  order_type: text("order_type"),
});

export const message = sqliteTable("message", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  request_id: integer("request_id").references(() => request.id),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp"),
  tenant_id: text("tenant_id").references(() => tenants.id),
});

export const call_summaries = sqliteTable("call_summaries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  call_id: text("call_id").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  room_number: text("room_number"),
  duration: text("duration"),
});

// For backward compatibility (aliases)
export const callSummaries = call_summaries;

// ==============================================================
// Zod Validation Schemas
// ==============================================================

export const insertTenantSchema = createInsertSchema(tenants);
export const insertHotelProfileSchema = createInsertSchema(hotelProfiles);
export const insertStaffSchema = createInsertSchema(staff);
export const insertCallSchema = createInsertSchema(call);
export const insertTranscriptSchema = createInsertSchema(transcript);
export const insertRequestSchema = createInsertSchema(request);
export const insertMessageSchema = createInsertSchema(message);
export const insertCallSummarySchema = createInsertSchema(call_summaries);

// Type exports
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