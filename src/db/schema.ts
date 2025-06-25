import { pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const request = pgTable('request', {
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

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  requestId: serial('request_id').references(() => request.id).notNull(),
  sender: varchar('sender', { length: 255 }).notNull(),
  content: text('content').notNull(),
  time: timestamp('time').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const call = pgTable('call', {
  id: serial('id').primaryKey(),
  call_id_vapi: varchar('call_id_vapi', { length: 255 }).notNull().unique(),
  room_number: varchar('room_number', { length: 50 }),
  duration: integer('duration').default(0),
  language: varchar('language', { length: 10 }).default('en'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const transcript = pgTable('transcript', {
  id: serial('id').primaryKey(),
  call_id: integer('call_id').references(() => call.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}); 