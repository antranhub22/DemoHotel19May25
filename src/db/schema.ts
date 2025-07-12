// Import both PostgreSQL and SQLite types
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { pgTable, text as pgText, integer as pgInteger, timestamp, varchar, primaryKey as pgPrimaryKey, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

// Determine database type from environment
const isPostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');

// ============================================
// NEW: Multi-tenant Tables
// ============================================

// PostgreSQL Tenants Table
export const pgTenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  hotelName: pgText('hotel_name').notNull(),
  subdomain: varchar('subdomain', { length: 50 }).unique().notNull(),
  customDomain: varchar('custom_domain', { length: 100 }),
  subscriptionPlan: varchar('subscription_plan', { length: 20 }).default('trial'),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('active'),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  
  // Feature flags
  maxVoices: pgInteger('max_voices').default(5),
  maxLanguages: pgInteger('max_languages').default(4),
  voiceCloning: boolean('voice_cloning').default(false),
  multiLocation: boolean('multi_location').default(false),
  whiteLabel: boolean('white_label').default(false),
  dataRetentionDays: pgInteger('data_retention_days').default(90),
  monthlyCallLimit: pgInteger('monthly_call_limit').default(1000)
});

// PostgreSQL Hotel Profiles Table
export const pgHotelProfiles = pgTable('hotel_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => pgTenants.id).notNull(),
  researchData: jsonb('research_data'),
  assistantConfig: jsonb('assistant_config'),
  vapiAssistantId: varchar('vapi_assistant_id', { length: 100 }),
  servicesConfig: jsonb('services_config'),
  knowledgeBase: pgText('knowledge_base'),
  systemPrompt: pgText('system_prompt'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// SQLite Tenants Table
export const sqliteTenants = sqliteTable('tenants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  hotelName: text('hotel_name').notNull(),
  subdomain: text('subdomain').unique().notNull(),
  customDomain: text('custom_domain'),
  subscriptionPlan: text('subscription_plan').default('trial'),
  subscriptionStatus: text('subscription_status').default('active'),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  
  // Feature flags
  maxVoices: integer('max_voices').default(5),
  maxLanguages: integer('max_languages').default(4),
  voiceCloning: integer('voice_cloning', { mode: 'boolean' }).default(false),
  multiLocation: integer('multi_location', { mode: 'boolean' }).default(false),
  whiteLabel: integer('white_label', { mode: 'boolean' }).default(false),
  dataRetentionDays: integer('data_retention_days').default(90),
  monthlyCallLimit: integer('monthly_call_limit').default(1000)
});

// SQLite Hotel Profiles Table
export const sqliteHotelProfiles = sqliteTable('hotel_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id').references(() => sqliteTenants.id).notNull(),
  researchData: text('research_data', { mode: 'json' }),
  assistantConfig: text('assistant_config', { mode: 'json' }),
  vapiAssistantId: text('vapi_assistant_id'),
  servicesConfig: text('services_config', { mode: 'json' }),
  knowledgeBase: text('knowledge_base'),
  systemPrompt: text('system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// ============================================
// UPDATED: Existing Tables with tenant_id
// ============================================

// PostgreSQL Schema - Updated with tenant_id
export const pgCall = pgTable('call', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  callIdVapi: varchar('call_id_vapi', { length: 100 }).notNull().unique(),
  roomNumber: varchar('room_number', { length: 10 }),
  language: varchar('language', { length: 10 }),
  serviceType: varchar('service_type', { length: 50 }),
  startTime: timestamp('start_time').defaultNow(),
  endTime: timestamp('end_time'),
  duration: pgInteger('duration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: uuid('tenant_id').references(() => pgTenants.id)
});

export const pgTranscript = pgTable('transcript', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  callId: varchar('call_id', { length: 100 }).notNull(),
  content: pgText('content').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  // NEW: Tenant isolation
  tenantId: uuid('tenant_id').references(() => pgTenants.id)
});

export const pgRequest = pgTable('request', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  roomNumber: varchar('room_number', { length: 10 }),
  orderId: varchar('order_id', { length: 100 }),
  requestContent: pgText('request_content'),
  status: varchar('status', { length: 100 }).default('Đã ghi nhận'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: uuid('tenant_id').references(() => pgTenants.id)
});

export const pgMessage = pgTable('message', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  requestId: pgInteger('request_id').references(() => pgRequest.id),
  sender: varchar('sender', { length: 20 }).notNull(),
  content: pgText('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  // NEW: Tenant isolation
  tenantId: uuid('tenant_id').references(() => pgTenants.id)
});

export const pgStaff = pgTable('staff', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('staff'),
  createdAt: timestamp('created_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: uuid('tenant_id').references(() => pgTenants.id)
});

// SQLite Schema with integer timestamps - Updated with tenant_id
export const sqliteCall = sqliteTable('call', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  callIdVapi: text('call_id_vapi').notNull().unique(),
  roomNumber: text('room_number'),
  language: text('language'),
  serviceType: text('service_type'),
  startTime: integer('start_time', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  endTime: integer('end_time', { mode: 'timestamp' }),
  duration: integer('duration'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // NEW: Tenant isolation
  tenantId: text('tenant_id').references(() => sqliteTenants.id)
});

export const sqliteTranscript = sqliteTable('transcript', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  callId: text('call_id').notNull(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // NEW: Tenant isolation
  tenantId: text('tenant_id').references(() => sqliteTenants.id)
});

export const sqliteRequest = sqliteTable('request', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number'),
  orderId: text('order_id'),
  requestContent: text('request_content'),
  status: text('status').default('Đã ghi nhận'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // NEW: Tenant isolation
  tenantId: text('tenant_id').references(() => sqliteTenants.id)
});

export const sqliteMessage = sqliteTable('message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').references(() => sqliteRequest.id),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // NEW: Tenant isolation
  tenantId: text('tenant_id').references(() => sqliteTenants.id)
});

export const sqliteStaff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('staff'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // NEW: Tenant isolation
  tenantId: text('tenant_id').references(() => sqliteTenants.id)
});

// ============================================
// Export the correct schema based on environment
// ============================================

// NEW: Multi-tenant tables
export const tenants = isPostgres ? pgTenants : sqliteTenants;
export const hotelProfiles = isPostgres ? pgHotelProfiles : sqliteHotelProfiles;

// EXISTING: Updated tables with tenant_id
export const call = isPostgres ? pgCall : sqliteCall;
export const transcript = isPostgres ? pgTranscript : sqliteTranscript;
export const request = isPostgres ? pgRequest : sqliteRequest;
export const message = isPostgres ? pgMessage : sqliteMessage;
export const staff = isPostgres ? pgStaff : sqliteStaff; 