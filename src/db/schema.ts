// Import both PostgreSQL and SQLite types
import { pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { sqliteTable, integer as sqliteInteger, text as sqliteText, blob } from 'drizzle-orm/sqlite-core';

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const useSQLite = !DATABASE_URL && !isProduction;

// SQLite schema for development
const sqliteStaff = sqliteTable('staff', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  username: sqliteText('username').notNull().unique(),
  password: sqliteText('password').notNull(),
  createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

const sqliteRequest = sqliteTable('request', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  room_number: sqliteText('room_number').notNull(),
  orderId: sqliteText('order_id').notNull(),
  guestName: sqliteText('guest_name').notNull(),
  request_content: sqliteText('request_content').notNull(),
  service_type: sqliteText('service_type').default('other'),
  created_at: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  status: sqliteText('status').notNull(),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

const sqliteMessage = sqliteTable('message', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  requestId: sqliteInteger('request_id').notNull().references(() => sqliteRequest.id),
  sender: sqliteText('sender').notNull(),
  content: sqliteText('content').notNull(),
  time: sqliteInteger('time', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

const sqliteCall = sqliteTable('call', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  call_id_vapi: sqliteText('call_id_vapi').notNull().unique(),
  room_number: sqliteText('room_number'),
  duration: sqliteInteger('duration').default(0),
  language: sqliteText('language').default('en'),
  created_at: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

const sqliteTranscript = sqliteTable('transcript', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  call_id: sqliteInteger('call_id').notNull().references(() => sqliteCall.id),
  role: sqliteText('role').notNull(),
  content: sqliteText('content').notNull(),
  timestamp: sqliteInteger('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// PostgreSQL schema for production
const pgStaff = pgTable('staff', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const pgRequest = pgTable('request', {
  id: serial('id').primaryKey(),
  room_number: varchar('room_number', { length: 255 }).notNull(),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  request_content: text('request_content').notNull(),
  service_type: varchar('service_type', { length: 100 }).default('other'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const pgMessage = pgTable('message', {
  id: serial('id').primaryKey(),
  requestId: serial('request_id').references(() => pgRequest.id).notNull(),
  sender: varchar('sender', { length: 255 }).notNull(),
  content: text('content').notNull(),
  time: timestamp('time').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const pgCall = pgTable('call', {
  id: serial('id').primaryKey(),
  call_id_vapi: varchar('call_id_vapi', { length: 255 }).notNull().unique(),
  room_number: varchar('room_number', { length: 50 }),
  duration: integer('duration').default(0),
  language: varchar('language', { length: 10 }).default('en'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

const pgTranscript = pgTable('transcript', {
  id: serial('id').primaryKey(),
  call_id: integer('call_id').references(() => pgCall.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Export the appropriate schema based on environment
export const staff = useSQLite ? sqliteStaff : pgStaff;
export const request = useSQLite ? sqliteRequest : pgRequest;
export const message = useSQLite ? sqliteMessage : pgMessage;
export const call = useSQLite ? sqliteCall : pgCall;
export const transcript = useSQLite ? sqliteTranscript : pgTranscript; 