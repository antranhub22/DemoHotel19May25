import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// ==============================================================
// SIMPLE DATABASE SCHEMA - BACKWARD COMPATIBLE
// ==============================================================

export const tenants = pgTable(
  'tenants',
  {
    id: text('id').primaryKey(),
    hotel_name: varchar('hotel_name', { length: 200 }),
    subdomain: varchar('subdomain', { length: 50 }).notNull().unique(),
    custom_domain: varchar('custom_domain', { length: 100 }),
    subscription_plan: varchar('subscription_plan', { length: 50 }).default(
      'trial'
    ),
    subscription_status: varchar('subscription_status', { length: 50 }).default(
      'active'
    ),
    trial_ends_at: timestamp('trial_ends_at'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    max_voices: integer('max_voices').default(5),
    max_languages: integer('max_languages').default(4),
    voice_cloning: boolean('voice_cloning').default(false),
    multi_location: boolean('multi_location').default(false),
    white_label: boolean('white_label').default(false),
    data_retention_days: integer('data_retention_days').default(90),
    monthly_call_limit: integer('monthly_call_limit').default(1000),
    // Legacy columns
    name: varchar('name', { length: 200 }),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    is_active: boolean('is_active').default(true),
    settings: text('settings'),
    tier: varchar('tier', { length: 50 }).default('free'),
    max_calls: integer('max_calls').default(1000),
    max_users: integer('max_users').default(10),
    features: text('features'),
  },
  table => ({
    subdomainIdx: index('tenants_subdomain_idx').on(table.subdomain),
    subscriptionPlanIdx: index('tenants_subscription_plan_idx').on(
      table.subscription_plan
    ),
    isActiveIdx: index('tenants_is_active_idx').on(table.is_active),
    createdAtIdx: index('tenants_created_at_idx').on(table.created_at),
  })
);

export const staff = pgTable(
  'staff',
  {
    id: serial('id').primaryKey(),
    tenant_id: text('tenant_id')
      .references(() => tenants.id)
      .notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('front-desk'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  table => ({
    tenantIdIdx: index('staff_tenant_id_idx').on(table.tenant_id),
    usernameIdx: index('staff_username_idx').on(table.username),
    emailIdx: index('staff_email_idx').on(table.email),
    roleIdx: index('staff_role_idx').on(table.role),
    isActiveIdx: index('staff_is_active_idx').on(table.is_active),
  })
);

export const call = pgTable(
  'call',
  {
    id: serial('id').primaryKey(),
    call_id_vapi: text('call_id_vapi').notNull().unique(),
    tenant_id: text('tenant_id')
      .references(() => tenants.id)
      .notNull(),
    room_number: varchar('room_number', { length: 10 }),
    language: varchar('language', { length: 10 }).default('en'),
    service_type: varchar('service_type', { length: 50 }),
    duration: integer('duration'),
    start_time: timestamp('start_time').default(sql`CURRENT_TIMESTAMP`),
    end_time: timestamp('end_time'),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  table => ({
    callIdVapiIdx: index('call_call_id_vapi_idx').on(table.call_id_vapi),
    tenantIdIdx: index('call_tenant_id_idx').on(table.tenant_id),
    roomNumberIdx: index('call_room_number_idx').on(table.room_number),
    createdAtIdx: index('call_created_at_idx').on(table.created_at),
    startTimeIdx: index('call_start_time_idx').on(table.start_time),
  })
);

export const transcript = pgTable(
  'transcript',
  {
    id: serial('id').primaryKey(),
    call_id: text('call_id').notNull(),
    content: text('content').notNull(),
    role: varchar('role', { length: 20 }).notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
    tenant_id: text('tenant_id').references(() => tenants.id),
  },
  table => ({
    callIdIdx: index('transcript_call_id_idx').on(table.call_id),
    tenantIdIdx: index('transcript_tenant_id_idx').on(table.tenant_id),
    roleIdx: index('transcript_role_idx').on(table.role),
    timestampIdx: index('transcript_timestamp_idx').on(table.timestamp),
  })
);

// ✅ SIMPLE: Request table without service_id for backward compatibility
export const request = pgTable(
  'request',
  {
    id: serial('id').primaryKey(),
    tenant_id: text('tenant_id')
      .references(() => tenants.id)
      .notNull(),
    call_id: text('call_id'),
    room_number: varchar('room_number', { length: 10 }).notNull(),
    order_id: varchar('order_id', { length: 50 }),
    request_content: varchar('request_content', { length: 1000 }),
    status: varchar('status', { length: 50 }).default('Đã ghi nhận').notNull(),
    created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    description: varchar('description', { length: 500 }),
    priority: varchar('priority', { length: 20 }).default('medium'),
    assigned_to: varchar('assigned_to', { length: 100 }),
    // ✅ REMOVED: service_id for backward compatibility
    guest_name: varchar('guest_name', { length: 100 }),
    phone_number: varchar('phone_number', { length: 20 }),
    total_amount: real('total_amount'),
    currency: varchar('currency', { length: 10 }).default('VND'),
    estimated_completion: timestamp('estimated_completion'),
    actual_completion: timestamp('actual_completion'),
    special_instructions: varchar('special_instructions', { length: 500 }),
    urgency: varchar('urgency', { length: 20 }).default('normal'),
    order_type: varchar('order_type', { length: 50 }),
    delivery_time: varchar('delivery_time', { length: 100 }),
    items: text('items'),
  },
  table => ({
    tenantIdIdx: index('request_tenant_id_idx').on(table.tenant_id),
    statusIdx: index('request_status_idx').on(table.status),
    assignedToIdx: index('request_assigned_to_idx').on(table.assigned_to),
    roomNumberIdx: index('request_room_number_idx').on(table.room_number),
    callIdIdx: index('request_call_id_idx').on(table.call_id),
    orderIdIdx: index('request_order_id_idx').on(table.order_id),
    priorityIdx: index('request_priority_idx').on(table.priority),
    createdAtIdx: index('request_created_at_idx').on(table.created_at),
    updatedAtIdx: index('request_updated_at_idx').on(table.updated_at),
    guestNameIdx: index('request_guest_name_idx').on(table.guest_name),
    totalAmountIdx: index('request_total_amount_idx').on(table.total_amount),
  })
);

export const message = pgTable(
  'message',
  {
    id: serial('id').primaryKey(),
    request_id: integer('request_id').references(() => request.id),
    sender: varchar('sender', { length: 50 }).notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
    tenant_id: text('tenant_id').references(() => tenants.id),
  },
  table => ({
    requestIdIdx: index('message_request_id_idx').on(table.request_id),
    tenantIdIdx: index('message_tenant_id_idx').on(table.tenant_id),
    senderIdx: index('message_sender_idx').on(table.sender),
    timestampIdx: index('message_timestamp_idx').on(table.timestamp),
  })
);

export const call_summaries = pgTable(
  'call_summaries',
  {
    id: serial('id').primaryKey(),
    call_id: text('call_id').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp').default(sql`CURRENT_TIMESTAMP`),
    room_number: varchar('room_number', { length: 10 }),
    duration: varchar('duration', { length: 20 }),
  },
  table => ({
    callIdIdx: index('call_summaries_call_id_idx').on(table.call_id),
    timestampIdx: index('call_summaries_timestamp_idx').on(table.timestamp),
    roomNumberIdx: index('call_summaries_room_number_idx').on(
      table.room_number
    ),
  })
);

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
