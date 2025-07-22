import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

// SQLite Schema Definitions (simplified for testing)
export const sqliteTenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  hotel_name: text('hotel_name').notNull(),
  subdomain: text('subdomain').unique().notNull(),
  custom_domain: text('custom_domain'),
  subscription_plan: text('subscription_plan').default('trial'),
  subscription_status: text('subscription_status').default('active'),
  trial_ends_at: integer('trial_ends_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }),
  max_voices: integer('max_voices').default(5),
  max_languages: integer('max_languages').default(4),
  voice_cloning: integer('voice_cloning', { mode: 'boolean' }).default(false),
  multi_location: integer('multi_location', { mode: 'boolean' }).default(false),
  white_label: integer('white_label', { mode: 'boolean' }).default(false),
  data_retention_days: integer('data_retention_days').default(90),
  monthly_call_limit: integer('monthly_call_limit').default(1000),
  // Legacy compatibility columns
  name: text('name'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  settings: text('settings'),
  tier: text('tier').default('free'),
  max_calls: integer('max_calls').default(1000),
  max_users: integer('max_users').default(10),
  features: text('features'),
});

export const sqliteHotelProfiles = sqliteTable('hotel_profiles', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  research_data: text('research_data'),
  knowledge_base: text('knowledge_base'),
  system_prompt: text('system_prompt'),
  created_at: integer('created_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});

export const sqliteCall = sqliteTable('call', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  call_id_vapi: text('call_id_vapi'),
  room_number: text('room_number'),
  language: text('language').default('en'),
  service_type: text('service_type'),
  duration: integer('duration').default(0),
  start_time: integer('start_time', { mode: 'timestamp' }),
  end_time: integer('end_time', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }),
});

export const sqliteTranscript = sqliteTable('transcript', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  call_id: text('call_id').references(() => sqliteCall.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }),
});

export const sqliteRequest = sqliteTable('request', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  hotel_name: text('hotel_name'),
  room_number: text('room_number'),
  guest_name: text('guest_name'),
  service_type: text('service_type'),
  request_text: text('request_text'),
  status: text('status').default('pending'),
  priority: text('priority').default('normal'),
  created_at: integer('created_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});

export const sqliteMessage = sqliteTable('message', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  request_id: text('request_id').references(() => sqliteRequest.id),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }),
});

export const sqliteStaff = sqliteTable('staff', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').references(() => sqliteTenants.id),
  username: text('username').notNull(),
  password_hash: text('password_hash').notNull(),
  role: text('role').default('staff'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  created_at: integer('created_at', { mode: 'timestamp' }),
});

/**
 * Setup test database with all required tables for integration testing
 */
export async function setupTestDatabase(dbPath: string) {
  // Remove existing database if exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Create new SQLite database
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  // Create all tables using SQL
  const createTablesSQL = `
    -- Tenants table
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      hotel_name TEXT NOT NULL,
      subdomain TEXT UNIQUE NOT NULL,
      custom_domain TEXT,
      subscription_plan TEXT DEFAULT 'trial',
      subscription_status TEXT DEFAULT 'active',
      trial_ends_at INTEGER,
      created_at INTEGER,
      max_voices INTEGER DEFAULT 5,
      max_languages INTEGER DEFAULT 4,
      voice_cloning INTEGER DEFAULT 0,
      multi_location INTEGER DEFAULT 0,
      white_label INTEGER DEFAULT 0,
      data_retention_days INTEGER DEFAULT 90,
      monthly_call_limit INTEGER DEFAULT 1000,
      name TEXT,
      updated_at INTEGER,
      is_active INTEGER DEFAULT 1,
      settings TEXT,
      tier TEXT DEFAULT 'free',
      max_calls INTEGER DEFAULT 1000,
      max_users INTEGER DEFAULT 10,
      features TEXT
    );

    -- Hotel profiles table
    CREATE TABLE IF NOT EXISTS hotel_profiles (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      research_data TEXT,
      assistant_config TEXT,
      vapi_assistant_id TEXT,
      services_config TEXT,
      knowledge_base TEXT,
      system_prompt TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    -- Call table
    CREATE TABLE IF NOT EXISTS call (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      call_id_vapi TEXT,
      room_number TEXT,
      language TEXT DEFAULT 'en',
      service_type TEXT,
      duration INTEGER DEFAULT 0,
      start_time INTEGER,
      end_time INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    );

    -- Transcript table
    CREATE TABLE IF NOT EXISTS transcript (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      call_id TEXT REFERENCES call(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER
    );

    -- Request table
    CREATE TABLE IF NOT EXISTS request (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      hotel_name TEXT,
      room_number TEXT,
      guest_name TEXT,
      service_type TEXT,
      request_text TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal',
      created_at INTEGER,
      updated_at INTEGER
    );

    -- Message table
    CREATE TABLE IF NOT EXISTS message (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      request_id TEXT REFERENCES request(id),
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER
    );

    -- Staff table
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `;

  // Execute table creation
  sqlite.exec(createTablesSQL);

  // Insert test data using raw SQL
  const testTenantId = randomUUID();
  const now = new Date().getTime();
  
  sqlite.prepare(`
    INSERT INTO tenants (id, hotel_name, subdomain, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(testTenantId, 'Mi Nhon Hotel', 'mi-nhon', now, now);

  console.log(`✅ Test database created at: ${dbPath}`);
  console.log(`✅ Test tenant created with ID: ${testTenantId}`);

  return { db, testTenantId };
}

/**
 * Clean up test database
 */
export function cleanupTestDatabase(dbPath: string) {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`🗑️ Test database cleaned up: ${dbPath}`);
  }
}

// Export schema for tests
export const testSchema = {
  tenants: sqliteTenants,
  hotelProfiles: sqliteHotelProfiles,
  call: sqliteCall,
  transcript: sqliteTranscript,
  request: sqliteRequest,
  message: sqliteMessage,
  staff: sqliteStaff,
}; 