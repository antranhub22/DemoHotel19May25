// Import both PostgreSQL and SQLite types
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { pgTable, text as pgText, integer as pgInteger, timestamp, varchar, primaryKey as pgPrimaryKey } from 'drizzle-orm/pg-core';

// Determine database type from environment
const isPostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');

// PostgreSQL Schema
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
});

export const pgTranscript = pgTable('transcript', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  callId: varchar('call_id', { length: 100 }).notNull(),
  content: pgText('content').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const pgRequest = pgTable('request', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  roomNumber: varchar('room_number', { length: 10 }),
  orderId: varchar('order_id', { length: 100 }),
  requestContent: pgText('request_content'),
  status: varchar('status', { length: 100 }).default('Đã ghi nhận'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pgMessage = pgTable('message', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  requestId: pgInteger('request_id').references(() => pgRequest.id),
  sender: varchar('sender', { length: 20 }).notNull(),
  content: pgText('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const pgStaff = pgTable('staff', {
  id: pgInteger('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('staff'),
  createdAt: timestamp('created_at').defaultNow(),
});

// SQLite Schema with integer timestamps
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
});

export const sqliteTranscript = sqliteTable('transcript', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  callId: text('call_id').notNull(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sqliteRequest = sqliteTable('request', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number'),
  orderId: text('order_id'),
  requestContent: text('request_content'),
  status: text('status').default('Đã ghi nhận'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sqliteMessage = sqliteTable('message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').references(() => sqliteRequest.id),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sqliteStaff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('staff'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Export the correct schema based on environment
export const call = isPostgres ? pgCall : sqliteCall;
export const transcript = isPostgres ? pgTranscript : sqliteTranscript;
export const request = isPostgres ? pgRequest : sqliteRequest;
export const message = isPostgres ? pgMessage : sqliteMessage;
export const staff = isPostgres ? pgStaff : sqliteStaff; 