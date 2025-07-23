import {
  pgTable,
  text,
  integer,
  serial,
  index,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==============================================================
// PostgreSQL-Only Database Schema - Optimized with Indexes
// ==============================================================

export const tenants = pgTable(
  'tenants',
  {
    id: text('id').primaryKey(),
    hotel_name: text('hotel_name').notNull(),
    subdomain: text('subdomain').notNull().unique(),
    custom_domain: text('custom_domain'),
    subscription_plan: text('subscription_plan').default('trial'),
    subscription_status: text('subscription_status').default('active'),
    trial_ends_at: timestamp('trial_ends_at'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    max_voices: integer('max_voices').default(5),
    max_languages: integer('max_languages').default(4),
    voice_cloning: boolean('voice_cloning').default(false),
    multi_location: boolean('multi_location').default(false),
    white_label: boolean('white_label').default(false),
    data_retention_days: integer('data_retention_days').default(90),
    monthly_call_limit: integer('monthly_call_limit').default(1000),
    // Legacy columns that exist in actual database
    name: text('name'),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    is_active: boolean('is_active').default(true),
    settings: text('settings'), // JSON stored as text
    tier: text('tier').default('free'),
    max_calls: integer('max_calls').default(1000),
    max_users: integer('max_users').default(10),
    features: text('features'), // JSON stored as text
  },
  table => ({
    // Performance indexes
    subdomainIdx: index('tenants_subdomain_idx').on(table.subdomain),
    subscriptionPlanIdx: index('tenants_subscription_plan_idx').on(
      table.subscription_plan
    ),
    isActiveIdx: index('tenants_is_active_idx').on(table.is_active),
    createdAtIdx: index('tenants_created_at_idx').on(table.created_at),
  })
);

export const hotelProfiles = pgTable(
  'hotel_profiles',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').references(() => tenants.id),
    research_data: text('research_data'), // JSON stored as text
    assistant_config: text('assistant_config'), // JSON stored as text
    vapi_assistant_id: text('vapi_assistant_id'),
    services_config: text('services_config'), // JSON stored as text
    knowledge_base: text('knowledge_base'),
    system_prompt: text('system_prompt'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  table => ({
    // Foreign key indexes
    tenantIdIdx: index('hotel_profiles_tenant_id_idx').on(table.tenant_id),
    vapiAssistantIdIdx: index('hotel_profiles_vapi_assistant_id_idx').on(
      table.vapi_assistant_id
    ),
  })
);

export const staff = pgTable(
  'staff',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').references(() => tenants.id),
    username: text('username').notNull(),
    password: text('password').notNull(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    email: text('email'),
    phone: text('phone'),
    role: text('role').default('front-desk'), // enum: hotel-manager, front-desk, it-manager
    permissions: text('permissions').default('[]'), // JSON array as text
    display_name: text('display_name'),
    avatar_url: text('avatar_url'),
    last_login: timestamp('last_login'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  table => ({
    // Performance indexes
    tenantIdIdx: index('staff_tenant_id_idx').on(table.tenant_id),
    usernameIdx: index('staff_username_idx').on(table.username),
    emailIdx: index('staff_email_idx').on(table.email),
    roleIdx: index('staff_role_idx').on(table.role),
    isActiveIdx: index('staff_is_active_idx').on(table.is_active),
    // Composite indexes for common queries
    tenantActiveIdx: index('staff_tenant_active_idx').on(
      table.tenant_id,
      table.is_active
    ),
  })
);

export const call = pgTable(
  'call',
  {
    id: serial('id').primaryKey(),
    tenant_id: text('tenant_id').references(() => tenants.id),
    call_id_vapi: text('call_id_vapi').notNull().unique(),
    room_number: text('room_number'),
    language: text('language'),
    service_type: text('service_type'),
    start_time: timestamp('start_time'),
    end_time: timestamp('end_time'),
    duration: integer('duration'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  table => ({
    // Critical performance indexes for analytics
    tenantIdIdx: index('call_tenant_id_idx').on(table.tenant_id),
    vapiCallIdIdx: index('call_vapi_call_id_idx').on(table.call_id_vapi),
    languageIdx: index('call_language_idx').on(table.language),
    serviceTypeIdx: index('call_service_type_idx').on(table.service_type),
    roomNumberIdx: index('call_room_number_idx').on(table.room_number),
    createdAtIdx: index('call_created_at_idx').on(table.created_at),
    startTimeIdx: index('call_start_time_idx').on(table.start_time),
    // Composite indexes for analytics queries
    tenantLanguageIdx: index('call_tenant_language_idx').on(
      table.tenant_id,
      table.language
    ),
    tenantServiceIdx: index('call_tenant_service_idx').on(
      table.tenant_id,
      table.service_type
    ),
    tenantCreatedIdx: index('call_tenant_created_idx').on(
      table.tenant_id,
      table.created_at
    ),
  })
);

export const transcript = pgTable(
  'transcript',
  {
    id: serial('id').primaryKey(),
    call_id: text('call_id').notNull(),
    content: text('content').notNull(),
    role: text('role').notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`), // ✅ PostgreSQL TIMESTAMP
    tenant_id: text('tenant_id').references(() => tenants.id),
  },
  table => ({
    // Performance indexes
    callIdIdx: index('transcript_call_id_idx').on(table.call_id),
    tenantIdIdx: index('transcript_tenant_id_idx').on(table.tenant_id),
    roleIdx: index('transcript_role_idx').on(table.role),
    timestampIdx: index('transcript_timestamp_idx').on(table.timestamp),
    // Composite indexes for common queries
    callRoleIdx: index('transcript_call_role_idx').on(
      table.call_id,
      table.role
    ),
    tenantTimestampIdx: index('transcript_tenant_timestamp_idx').on(
      table.tenant_id,
      table.timestamp
    ),
  })
);

export const request = pgTable(
  'request',
  {
    id: serial('id').primaryKey(),
    tenant_id: text('tenant_id').references(() => tenants.id),
    call_id: text('call_id'),
    room_number: text('room_number'),
    order_id: text('order_id'),
    request_content: text('request_content'),
    status: text('status').default('Đã ghi nhận'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    description: text('description'),
    priority: text('priority').default('medium'),
    assigned_to: text('assigned_to'),
  },
  table => ({
    // Critical performance indexes for staff dashboard
    tenantIdIdx: index('request_tenant_id_idx').on(table.tenant_id),
    statusIdx: index('request_status_idx').on(table.status),
    assignedToIdx: index('request_assigned_to_idx').on(table.assigned_to),
    roomNumberIdx: index('request_room_number_idx').on(table.room_number),
    callIdIdx: index('request_call_id_idx').on(table.call_id),
    orderIdIdx: index('request_order_id_idx').on(table.order_id),
    priorityIdx: index('request_priority_idx').on(table.priority),
    createdAtIdx: index('request_created_at_idx').on(table.created_at),
    updatedAtIdx: index('request_updated_at_idx').on(table.updated_at),
    // Composite indexes for dashboard queries
    tenantStatusIdx: index('request_tenant_status_idx').on(
      table.tenant_id,
      table.status
    ),
    tenantAssignedIdx: index('request_tenant_assigned_idx').on(
      table.tenant_id,
      table.assigned_to
    ),
    statusAssignedIdx: index('request_status_assigned_idx').on(
      table.status,
      table.assigned_to
    ),
    tenantCreatedIdx: index('request_tenant_created_idx').on(
      table.tenant_id,
      table.created_at
    ),
  })
);

export const message = pgTable(
  'message',
  {
    id: serial('id').primaryKey(),
    request_id: integer('request_id').references(() => request.id),
    sender: text('sender').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
    tenant_id: text('tenant_id').references(() => tenants.id),
  },
  table => ({
    // Performance indexes
    requestIdIdx: index('message_request_id_idx').on(table.request_id),
    tenantIdIdx: index('message_tenant_id_idx').on(table.tenant_id),
    senderIdx: index('message_sender_idx').on(table.sender),
    timestampIdx: index('message_timestamp_idx').on(table.timestamp),
    // Composite index for getting messages by request
    requestTimestampIdx: index('message_request_timestamp_idx').on(
      table.request_id,
      table.timestamp
    ),
  })
);

export const call_summaries = pgTable(
  'call_summaries',
  {
    id: serial('id').primaryKey(),
    call_id: text('call_id').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`), // ✅ PostgreSQL TIMESTAMP
    room_number: text('room_number'),
    duration: text('duration'),
  },
  table => ({
    // Performance indexes
    callIdIdx: index('call_summaries_call_id_idx').on(table.call_id),
    timestampIdx: index('call_summaries_timestamp_idx').on(table.timestamp),
    roomNumberIdx: index('call_summaries_room_number_idx').on(
      table.room_number
    ),
  })
);

// ✅ POSTGRESQL-OPTIMIZED ALIASES (NO MORE CONFUSION)
export const callSummaries = call_summaries; // Clear naming
export const users = staff; // Legacy compatibility

// ✅ POSTGRESQL-ONLY VALIDATION SCHEMAS
export const insertTranscriptSchema = createInsertSchema(transcript).extend({
  timestamp: z
    .union([
      z.date(),
      z.string().datetime(),
      z.number().transform(val => new Date(val)),
    ])
    .optional(),
});

export const insertCallSummarySchema = createInsertSchema(
  call_summaries
).extend({
  timestamp: z
    .union([
      z.date(),
      z.string().datetime(),
      z.number().transform(val => new Date(val)),
    ])
    .optional(),
});

export const insertRequestSchema = createInsertSchema(request);
export const insertStaffSchema = createInsertSchema(staff);
export const insertTenantSchema = createInsertSchema(tenants);

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
export type Call = typeof call.$inferSelect;
export type InsertCall = typeof call.$inferInsert;
export type Transcript = typeof transcript.$inferSelect;
export type InsertTranscript = typeof transcript.$inferInsert;
export type RequestRecord = typeof request.$inferSelect;
export type InsertRequestRecord = typeof request.$inferInsert;
export type Message = typeof message.$inferSelect;
export type InsertMessage = typeof message.$inferInsert;
export type CallSummary = typeof call_summaries.$inferSelect;
export type InsertCallSummary = typeof call_summaries.$inferInsert;
