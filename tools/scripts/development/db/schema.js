'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.staff =
  exports.message =
  exports.request =
  exports.transcript =
  exports.call =
  exports.hotelProfiles =
  exports.tenants =
  exports.sqliteStaff =
  exports.sqliteMessage =
  exports.sqliteRequest =
  exports.sqliteTranscript =
  exports.sqliteCall =
  exports.pgStaff =
  exports.pgMessage =
  exports.pgRequest =
  exports.pgTranscript =
  exports.pgCall =
  exports.sqliteHotelProfiles =
  exports.sqliteTenants =
  exports.pgHotelProfiles =
  exports.pgTenants =
    void 0;
// Import both PostgreSQL and SQLite types
var sqlite_core_1 = require('drizzle-orm/sqlite-core');
var pg_core_1 = require('drizzle-orm/pg-core');
// Determine database type from environment
var isPostgres =
  process.env.NODE_ENV === 'production' ||
  ((_a = process.env.DATABASE_URL) === null || _a === void 0
    ? void 0
    : _a.includes('postgres'));
// ============================================
// NEW: Multi-tenant Tables
// ============================================
// PostgreSQL Tenants Table
exports.pgTenants = (0, pg_core_1.pgTable)('tenants', {
  id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
  hotelName: (0, pg_core_1.text)('hotel_name').notNull(),
  subdomain: (0, pg_core_1.varchar)('subdomain', { length: 50 })
    .unique()
    .notNull(),
  customDomain: (0, pg_core_1.varchar)('custom_domain', { length: 100 }),
  subscriptionPlan: (0, pg_core_1.varchar)('subscription_plan', {
    length: 20,
  }).default('trial'),
  subscriptionStatus: (0, pg_core_1.varchar)('subscription_status', {
    length: 20,
  }).default('active'),
  trialEndsAt: (0, pg_core_1.timestamp)('trial_ends_at'),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  // Feature flags
  maxVoices: (0, pg_core_1.integer)('max_voices').default(5),
  maxLanguages: (0, pg_core_1.integer)('max_languages').default(4),
  voiceCloning: (0, pg_core_1.boolean)('voice_cloning').default(false),
  multiLocation: (0, pg_core_1.boolean)('multi_location').default(false),
  whiteLabel: (0, pg_core_1.boolean)('white_label').default(false),
  dataRetentionDays: (0, pg_core_1.integer)('data_retention_days').default(90),
  monthlyCallLimit: (0, pg_core_1.integer)('monthly_call_limit').default(1000),
});
// PostgreSQL Hotel Profiles Table
exports.pgHotelProfiles = (0, pg_core_1.pgTable)('hotel_profiles', {
  id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
  tenantId: (0, pg_core_1.uuid)('tenant_id')
    .references(function () {
      return exports.pgTenants.id;
    })
    .notNull(),
  researchData: (0, pg_core_1.jsonb)('research_data'),
  assistantConfig: (0, pg_core_1.jsonb)('assistant_config'),
  vapiAssistantId: (0, pg_core_1.varchar)('vapi_assistant_id', { length: 100 }),
  servicesConfig: (0, pg_core_1.jsonb)('services_config'),
  knowledgeBase: (0, pg_core_1.text)('knowledge_base'),
  systemPrompt: (0, pg_core_1.text)('system_prompt'),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// SQLite Tenants Table
exports.sqliteTenants = (0, sqlite_core_1.sqliteTable)('tenants', {
  id: (0, sqlite_core_1.text)('id')
    .primaryKey()
    .$defaultFn(function () {
      return crypto.randomUUID();
    }),
  hotelName: (0, sqlite_core_1.text)('hotel_name').notNull(),
  subdomain: (0, sqlite_core_1.text)('subdomain').unique().notNull(),
  customDomain: (0, sqlite_core_1.text)('custom_domain'),
  subscriptionPlan: (0, sqlite_core_1.text)('subscription_plan').default(
    'trial'
  ),
  subscriptionStatus: (0, sqlite_core_1.text)('subscription_status').default(
    'active'
  ),
  trialEndsAt: (0, sqlite_core_1.integer)('trial_ends_at', {
    mode: 'timestamp',
  }),
  createdAt: (0, sqlite_core_1.integer)('created_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // Feature flags
  maxVoices: (0, sqlite_core_1.integer)('max_voices').default(5),
  maxLanguages: (0, sqlite_core_1.integer)('max_languages').default(4),
  voiceCloning: (0, sqlite_core_1.integer)('voice_cloning', {
    mode: 'boolean',
  }).default(false),
  multiLocation: (0, sqlite_core_1.integer)('multi_location', {
    mode: 'boolean',
  }).default(false),
  whiteLabel: (0, sqlite_core_1.integer)('white_label', {
    mode: 'boolean',
  }).default(false),
  dataRetentionDays: (0, sqlite_core_1.integer)('data_retention_days').default(
    90
  ),
  monthlyCallLimit: (0, sqlite_core_1.integer)('monthly_call_limit').default(
    1000
  ),
});
// SQLite Hotel Profiles Table
exports.sqliteHotelProfiles = (0, sqlite_core_1.sqliteTable)('hotel_profiles', {
  id: (0, sqlite_core_1.text)('id')
    .primaryKey()
    .$defaultFn(function () {
      return crypto.randomUUID();
    }),
  tenantId: (0, sqlite_core_1.text)('tenant_id')
    .references(function () {
      return exports.sqliteTenants.id;
    })
    .notNull(),
  researchData: (0, sqlite_core_1.text)('research_data', { mode: 'json' }),
  assistantConfig: (0, sqlite_core_1.text)('assistant_config', {
    mode: 'json',
  }),
  vapiAssistantId: (0, sqlite_core_1.text)('vapi_assistant_id'),
  servicesConfig: (0, sqlite_core_1.text)('services_config', { mode: 'json' }),
  knowledgeBase: (0, sqlite_core_1.text)('knowledge_base'),
  systemPrompt: (0, sqlite_core_1.text)('system_prompt'),
  createdAt: (0, sqlite_core_1.integer)('created_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  updatedAt: (0, sqlite_core_1.integer)('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
});
// ============================================
// UPDATED: Existing Tables with tenant_id
// ============================================
// PostgreSQL Schema - Updated with tenant_id
exports.pgCall = (0, pg_core_1.pgTable)('call', {
  id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
  callIdVapi: (0, pg_core_1.varchar)('call_id_vapi', { length: 100 })
    .notNull()
    .unique(),
  roomNumber: (0, pg_core_1.varchar)('room_number', { length: 10 }),
  language: (0, pg_core_1.varchar)('language', { length: 10 }),
  serviceType: (0, pg_core_1.varchar)('service_type', { length: 50 }),
  startTime: (0, pg_core_1.timestamp)('start_time').defaultNow(),
  endTime: (0, pg_core_1.timestamp)('end_time'),
  duration: (0, pg_core_1.integer)('duration'),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: (0, pg_core_1.uuid)('tenant_id').references(function () {
    return exports.pgTenants.id;
  }),
});
exports.pgTranscript = (0, pg_core_1.pgTable)('transcript', {
  id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
  callId: (0, pg_core_1.varchar)('call_id', { length: 100 }).notNull(),
  content: (0, pg_core_1.text)('content').notNull(),
  role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull(),
  timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow(),
  // NEW: Tenant isolation
  tenantId: (0, pg_core_1.uuid)('tenant_id').references(function () {
    return exports.pgTenants.id;
  }),
});
exports.pgRequest = (0, pg_core_1.pgTable)('request', {
  id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
  roomNumber: (0, pg_core_1.varchar)('room_number', { length: 10 }),
  orderId: (0, pg_core_1.varchar)('order_id', { length: 100 }),
  requestContent: (0, pg_core_1.text)('request_content'),
  status: (0, pg_core_1.varchar)('status', { length: 100 }).default(
    'Đã ghi nhận'
  ),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: (0, pg_core_1.uuid)('tenant_id').references(function () {
    return exports.pgTenants.id;
  }),
});
exports.pgMessage = (0, pg_core_1.pgTable)('message', {
  id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
  requestId: (0, pg_core_1.integer)('request_id').references(function () {
    return exports.pgRequest.id;
  }),
  sender: (0, pg_core_1.varchar)('sender', { length: 20 }).notNull(),
  content: (0, pg_core_1.text)('content').notNull(),
  timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow(),
  // NEW: Tenant isolation
  tenantId: (0, pg_core_1.uuid)('tenant_id').references(function () {
    return exports.pgTenants.id;
  }),
});
exports.pgStaff = (0, pg_core_1.pgTable)('staff', {
  id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
  username: (0, pg_core_1.varchar)('username', { length: 50 })
    .notNull()
    .unique(),
  password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
  role: (0, pg_core_1.varchar)('role', { length: 20 }).default('staff'),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  // NEW: Tenant isolation
  tenantId: (0, pg_core_1.uuid)('tenant_id').references(function () {
    return exports.pgTenants.id;
  }),
});
// SQLite Schema with integer timestamps - Updated with tenant_id
exports.sqliteCall = (0, sqlite_core_1.sqliteTable)('call', {
  id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
  callIdVapi: (0, sqlite_core_1.text)('call_id_vapi').notNull().unique(),
  roomNumber: (0, sqlite_core_1.text)('room_number'),
  language: (0, sqlite_core_1.text)('language'),
  serviceType: (0, sqlite_core_1.text)('service_type'),
  startTime: (0, sqlite_core_1.integer)('start_time', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  endTime: (0, sqlite_core_1.integer)('end_time', { mode: 'timestamp' }),
  duration: (0, sqlite_core_1.integer)('duration'),
  createdAt: (0, sqlite_core_1.integer)('created_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  updatedAt: (0, sqlite_core_1.integer)('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // NEW: Tenant isolation
  tenantId: (0, sqlite_core_1.text)('tenant_id').references(function () {
    return exports.sqliteTenants.id;
  }),
});
exports.sqliteTranscript = (0, sqlite_core_1.sqliteTable)('transcript', {
  id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
  callId: (0, sqlite_core_1.text)('call_id').notNull(),
  content: (0, sqlite_core_1.text)('content').notNull(),
  role: (0, sqlite_core_1.text)('role').notNull(),
  timestamp: (0, sqlite_core_1.integer)('timestamp', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // NEW: Tenant isolation
  tenantId: (0, sqlite_core_1.text)('tenant_id').references(function () {
    return exports.sqliteTenants.id;
  }),
});
exports.sqliteRequest = (0, sqlite_core_1.sqliteTable)('request', {
  id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
  roomNumber: (0, sqlite_core_1.text)('room_number'),
  orderId: (0, sqlite_core_1.text)('order_id'),
  requestContent: (0, sqlite_core_1.text)('request_content'),
  status: (0, sqlite_core_1.text)('status').default('Đã ghi nhận'),
  createdAt: (0, sqlite_core_1.integer)('created_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  updatedAt: (0, sqlite_core_1.integer)('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // NEW: Tenant isolation
  tenantId: (0, sqlite_core_1.text)('tenant_id').references(function () {
    return exports.sqliteTenants.id;
  }),
});
exports.sqliteMessage = (0, sqlite_core_1.sqliteTable)('message', {
  id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
  requestId: (0, sqlite_core_1.integer)('request_id').references(function () {
    return exports.sqliteRequest.id;
  }),
  sender: (0, sqlite_core_1.text)('sender').notNull(),
  content: (0, sqlite_core_1.text)('content').notNull(),
  timestamp: (0, sqlite_core_1.integer)('timestamp', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // NEW: Tenant isolation
  tenantId: (0, sqlite_core_1.text)('tenant_id').references(function () {
    return exports.sqliteTenants.id;
  }),
});
exports.sqliteStaff = (0, sqlite_core_1.sqliteTable)('staff', {
  id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
  username: (0, sqlite_core_1.text)('username').notNull().unique(),
  password: (0, sqlite_core_1.text)('password').notNull(),
  role: (0, sqlite_core_1.text)('role').default('staff'),
  createdAt: (0, sqlite_core_1.integer)('created_at', {
    mode: 'timestamp',
  }).$defaultFn(function () {
    return new Date();
  }),
  // NEW: Tenant isolation
  tenantId: (0, sqlite_core_1.text)('tenant_id').references(function () {
    return exports.sqliteTenants.id;
  }),
});
// ============================================
// Export the correct schema based on environment
// ============================================
// NEW: Multi-tenant tables
exports.tenants = isPostgres ? exports.pgTenants : exports.sqliteTenants;
exports.hotelProfiles = isPostgres
  ? exports.pgHotelProfiles
  : exports.sqliteHotelProfiles;
// EXISTING: Updated tables with tenant_id
exports.call = isPostgres ? exports.pgCall : exports.sqliteCall;
exports.transcript = isPostgres
  ? exports.pgTranscript
  : exports.sqliteTranscript;
exports.request = isPostgres ? exports.pgRequest : exports.sqliteRequest;
exports.message = isPostgres ? exports.pgMessage : exports.sqliteMessage;
exports.staff = isPostgres ? exports.pgStaff : exports.sqliteStaff;
