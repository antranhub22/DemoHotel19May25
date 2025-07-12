var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, timestamp, varchar, uuid, jsonb, boolean } from "drizzle-orm/pg-core";
var isPostgres, pgTenants, pgHotelProfiles, sqliteTenants, sqliteHotelProfiles, pgCall, pgTranscript, pgRequest, pgMessage, pgStaff, sqliteCall, sqliteTranscript, sqliteRequest, sqliteMessage, sqliteStaff, tenants, hotelProfiles, call, transcript, request, message, staff;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    isPostgres = process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("postgres");
    pgTenants = pgTable("tenants", {
      id: uuid("id").primaryKey().defaultRandom(),
      hotelName: pgText("hotel_name").notNull(),
      subdomain: varchar("subdomain", { length: 50 }).unique().notNull(),
      customDomain: varchar("custom_domain", { length: 100 }),
      subscriptionPlan: varchar("subscription_plan", { length: 20 }).default("trial"),
      subscriptionStatus: varchar("subscription_status", { length: 20 }).default("active"),
      trialEndsAt: timestamp("trial_ends_at"),
      createdAt: timestamp("created_at").defaultNow(),
      // Feature flags
      maxVoices: pgInteger("max_voices").default(5),
      maxLanguages: pgInteger("max_languages").default(4),
      voiceCloning: boolean("voice_cloning").default(false),
      multiLocation: boolean("multi_location").default(false),
      whiteLabel: boolean("white_label").default(false),
      dataRetentionDays: pgInteger("data_retention_days").default(90),
      monthlyCallLimit: pgInteger("monthly_call_limit").default(1e3)
    });
    pgHotelProfiles = pgTable("hotel_profiles", {
      id: uuid("id").primaryKey().defaultRandom(),
      tenantId: uuid("tenant_id").references(() => pgTenants.id).notNull(),
      researchData: jsonb("research_data"),
      assistantConfig: jsonb("assistant_config"),
      vapiAssistantId: varchar("vapi_assistant_id", { length: 100 }),
      servicesConfig: jsonb("services_config"),
      knowledgeBase: pgText("knowledge_base"),
      systemPrompt: pgText("system_prompt"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    sqliteTenants = sqliteTable("tenants", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      hotelName: text("hotel_name").notNull(),
      subdomain: text("subdomain").unique().notNull(),
      customDomain: text("custom_domain"),
      subscriptionPlan: text("subscription_plan").default("trial"),
      subscriptionStatus: text("subscription_status").default("active"),
      trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // Feature flags
      maxVoices: integer("max_voices").default(5),
      maxLanguages: integer("max_languages").default(4),
      voiceCloning: integer("voice_cloning", { mode: "boolean" }).default(false),
      multiLocation: integer("multi_location", { mode: "boolean" }).default(false),
      whiteLabel: integer("white_label", { mode: "boolean" }).default(false),
      dataRetentionDays: integer("data_retention_days").default(90),
      monthlyCallLimit: integer("monthly_call_limit").default(1e3)
    });
    sqliteHotelProfiles = sqliteTable("hotel_profiles", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      tenantId: text("tenant_id").references(() => sqliteTenants.id).notNull(),
      researchData: text("research_data", { mode: "json" }),
      assistantConfig: text("assistant_config", { mode: "json" }),
      vapiAssistantId: text("vapi_assistant_id"),
      servicesConfig: text("services_config", { mode: "json" }),
      knowledgeBase: text("knowledge_base"),
      systemPrompt: text("system_prompt"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    pgCall = pgTable("call", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      callIdVapi: varchar("call_id_vapi", { length: 100 }).notNull().unique(),
      roomNumber: varchar("room_number", { length: 10 }),
      language: varchar("language", { length: 10 }),
      serviceType: varchar("service_type", { length: 50 }),
      startTime: timestamp("start_time").defaultNow(),
      endTime: timestamp("end_time"),
      duration: pgInteger("duration"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      // NEW: Tenant isolation
      tenantId: uuid("tenant_id").references(() => pgTenants.id)
    });
    pgTranscript = pgTable("transcript", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      callId: varchar("call_id", { length: 100 }).notNull(),
      content: pgText("content").notNull(),
      role: varchar("role", { length: 20 }).notNull(),
      timestamp: timestamp("timestamp").defaultNow(),
      // NEW: Tenant isolation
      tenantId: uuid("tenant_id").references(() => pgTenants.id)
    });
    pgRequest = pgTable("request", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      roomNumber: varchar("room_number", { length: 10 }),
      orderId: varchar("order_id", { length: 100 }),
      requestContent: pgText("request_content"),
      status: varchar("status", { length: 100 }).default("\u0110\xE3 ghi nh\u1EADn"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      // NEW: Tenant isolation
      tenantId: uuid("tenant_id").references(() => pgTenants.id)
    });
    pgMessage = pgTable("message", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      requestId: pgInteger("request_id").references(() => pgRequest.id),
      sender: varchar("sender", { length: 20 }).notNull(),
      content: pgText("content").notNull(),
      timestamp: timestamp("timestamp").defaultNow(),
      // NEW: Tenant isolation
      tenantId: uuid("tenant_id").references(() => pgTenants.id)
    });
    pgStaff = pgTable("staff", {
      id: pgInteger("id").primaryKey().generatedAlwaysAsIdentity(),
      username: varchar("username", { length: 50 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      role: varchar("role", { length: 20 }).default("staff"),
      createdAt: timestamp("created_at").defaultNow(),
      // NEW: Tenant isolation
      tenantId: uuid("tenant_id").references(() => pgTenants.id)
    });
    sqliteCall = sqliteTable("call", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      callIdVapi: text("call_id_vapi").notNull().unique(),
      roomNumber: text("room_number"),
      language: text("language"),
      serviceType: text("service_type"),
      startTime: integer("start_time", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      endTime: integer("end_time", { mode: "timestamp" }),
      duration: integer("duration"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // NEW: Tenant isolation
      tenantId: text("tenant_id").references(() => sqliteTenants.id)
    });
    sqliteTranscript = sqliteTable("transcript", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      callId: text("call_id").notNull(),
      content: text("content").notNull(),
      role: text("role").notNull(),
      timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // NEW: Tenant isolation
      tenantId: text("tenant_id").references(() => sqliteTenants.id)
    });
    sqliteRequest = sqliteTable("request", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      roomNumber: text("room_number"),
      orderId: text("order_id"),
      requestContent: text("request_content"),
      status: text("status").default("\u0110\xE3 ghi nh\u1EADn"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // NEW: Tenant isolation
      tenantId: text("tenant_id").references(() => sqliteTenants.id)
    });
    sqliteMessage = sqliteTable("message", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      requestId: integer("request_id").references(() => sqliteRequest.id),
      sender: text("sender").notNull(),
      content: text("content").notNull(),
      timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // NEW: Tenant isolation
      tenantId: text("tenant_id").references(() => sqliteTenants.id)
    });
    sqliteStaff = sqliteTable("staff", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      role: text("role").default("staff"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      // NEW: Tenant isolation
      tenantId: text("tenant_id").references(() => sqliteTenants.id)
    });
    tenants = isPostgres ? pgTenants : sqliteTenants;
    hotelProfiles = isPostgres ? pgHotelProfiles : sqliteHotelProfiles;
    call = isPostgres ? pgCall : sqliteCall;
    transcript = isPostgres ? pgTranscript : sqliteTranscript;
    request = isPostgres ? pgRequest : sqliteRequest;
    message = isPostgres ? pgMessage : sqliteMessage;
    staff = isPostgres ? pgStaff : sqliteStaff;
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  call: () => call,
  callSummaries: () => callSummaries,
  hotelProfiles: () => hotelProfiles,
  insertCallSchema: () => insertCallSchema,
  insertCallSummarySchema: () => insertCallSummarySchema,
  insertHotelProfileSchema: () => insertHotelProfileSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertRequestSchema: () => insertRequestSchema,
  insertStaffSchema: () => insertStaffSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertTranscriptSchema: () => insertTranscriptSchema,
  insertUserSchema: () => insertUserSchema,
  message: () => message,
  orders: () => orders,
  request: () => request,
  selectHotelProfileSchema: () => selectHotelProfileSchema,
  selectTenantSchema: () => selectTenantSchema,
  staff: () => staff,
  tenants: () => tenants,
  transcript: () => transcript,
  transcripts: () => transcripts,
  users: () => users
});
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var insertTenantSchema, selectTenantSchema, insertHotelProfileSchema, selectHotelProfileSchema, insertCallSchema, insertTranscriptSchema, insertRequestSchema, insertMessageSchema, insertStaffSchema, users, transcripts, orders, callSummaries, insertUserSchema, insertOrderSchema, insertCallSummarySchema;
var init_schema2 = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_schema();
    init_schema();
    insertTenantSchema = createInsertSchema(tenants, {
      hotelName: z.string().min(1, "Hotel name is required"),
      subdomain: z.string().min(1, "Subdomain is required").regex(/^[a-z0-9-]+$/, "Subdomain must contain only lowercase letters, numbers, and hyphens"),
      subscriptionPlan: z.enum(["trial", "basic", "premium", "enterprise"]).default("trial"),
      subscriptionStatus: z.enum(["active", "inactive", "expired", "cancelled"]).default("active")
    }).pick({
      hotelName: true,
      subdomain: true,
      customDomain: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      maxVoices: true,
      maxLanguages: true,
      voiceCloning: true,
      multiLocation: true,
      whiteLabel: true,
      dataRetentionDays: true,
      monthlyCallLimit: true
    });
    selectTenantSchema = createSelectSchema(tenants);
    insertHotelProfileSchema = createInsertSchema(hotelProfiles, {
      tenantId: z.string().uuid("Invalid tenant ID"),
      researchData: z.any().optional(),
      assistantConfig: z.any().optional(),
      servicesConfig: z.any().optional(),
      knowledgeBase: z.string().optional(),
      systemPrompt: z.string().optional()
    }).pick({
      tenantId: true,
      researchData: true,
      assistantConfig: true,
      vapiAssistantId: true,
      servicesConfig: true,
      knowledgeBase: true,
      systemPrompt: true
    });
    selectHotelProfileSchema = createSelectSchema(hotelProfiles);
    insertCallSchema = createInsertSchema(call, {
      callIdVapi: z.string().min(1, "Call ID is required"),
      tenantId: z.string().uuid("Invalid tenant ID").optional()
    }).pick({
      callIdVapi: true,
      roomNumber: true,
      language: true,
      serviceType: true,
      duration: true,
      tenantId: true
    });
    insertTranscriptSchema = createInsertSchema(transcript, {
      callId: z.string().min(1, "Call ID is required"),
      role: z.string().min(1, "Role is required"),
      content: z.string().min(1, "Content is required"),
      tenantId: z.string().uuid("Invalid tenant ID").optional()
    }).pick({
      callId: true,
      role: true,
      content: true,
      tenantId: true
    });
    insertRequestSchema = createInsertSchema(request, {
      tenantId: z.string().uuid("Invalid tenant ID").optional()
    }).pick({
      roomNumber: true,
      orderId: true,
      requestContent: true,
      status: true,
      tenantId: true
    });
    insertMessageSchema = createInsertSchema(message, {
      requestId: z.number().int().positive("Invalid request ID"),
      sender: z.string().min(1, "Sender is required"),
      content: z.string().min(1, "Content is required"),
      tenantId: z.string().uuid("Invalid tenant ID").optional()
    }).pick({
      requestId: true,
      sender: true,
      content: true,
      tenantId: true
    });
    insertStaffSchema = createInsertSchema(staff, {
      username: z.string().min(1, "Username is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      tenantId: z.string().uuid("Invalid tenant ID").optional()
    }).pick({
      username: true,
      password: true,
      role: true,
      tenantId: true
    });
    users = staff;
    transcripts = transcript;
    orders = request;
    callSummaries = call;
    insertUserSchema = insertStaffSchema;
    insertOrderSchema = insertRequestSchema;
    insertCallSummarySchema = insertCallSchema;
  }
});

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema2();

// server/db.ts
init_schema2();
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";
var { Pool } = pg;
dotenv.config();
var DATABASE_URL = process.env.DATABASE_URL;
var isProduction = process.env.NODE_ENV === "production";
var db;
var pool;
if (!DATABASE_URL && !isProduction) {
  console.log("\u23F3 Using SQLite database for development");
  const sqlite = new Database("./dev.db");
  db = sqliteDrizzle(sqlite, { schema: schema_exports });
} else if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
} else {
  console.log("\u23F3 Connecting to database with URL:", DATABASE_URL);
  pool = new Pool({
    connectionString: DATABASE_URL,
    // Internal VPC connection typically does not require SSL
    ssl: { rejectUnauthorized: false }
  });
  db = drizzle(pool, { schema: schema_exports });
}

// server/storage.ts
import { eq, gte, sql } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : void 0;
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : void 0;
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async addTranscript(insertTranscript) {
    const result = await db.insert(transcripts).values(insertTranscript).returning();
    return result[0];
  }
  async getTranscriptsByCallId(callId) {
    return await db.select().from(transcripts).where(eq(transcripts.callId, callId));
  }
  async createOrder(insertOrder) {
    const result = await db.insert(orders).values({
      ...insertOrder,
      status: "pending"
    }).returning();
    return result[0];
  }
  async getOrderById(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result.length > 0 ? result[0] : void 0;
  }
  async getOrdersByRoomNumber(roomNumber) {
    return await db.select().from(orders).where(eq(orders.roomNumber, roomNumber));
  }
  async updateOrderStatus(id, status) {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result.length > 0 ? result[0] : void 0;
  }
  async getAllOrders(filter) {
    const query = db.select().from(orders);
    if (filter.status) {
      query.where(eq(orders.status, filter.status));
    }
    if (filter.roomNumber) {
      query.where(eq(orders.roomNumber, filter.roomNumber));
    }
    return await query;
  }
  async deleteAllOrders() {
    const result = await db.delete(orders);
    return result.rowCount || 0;
  }
  async addCallSummary(insertCallSummary) {
    const result = await db.insert(callSummaries).values(insertCallSummary).returning();
    return result[0];
  }
  async getCallSummaryByCallId(callId) {
    const result = await db.select().from(callSummaries).where(eq(callSummaries.callId, callId));
    return result.length > 0 ? result[0] : void 0;
  }
  async getRecentCallSummaries(hours) {
    const hoursAgo = /* @__PURE__ */ new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return await db.select().from(callSummaries).where(gte(callSummaries.timestamp, hoursAgo)).orderBy(sql`${callSummaries.timestamp} DESC`);
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_schema2();
import { WebSocketServer, WebSocket } from "ws";
import { z as z5 } from "zod";

// server/openai.ts
import OpenAI from "openai";
var apiKey = process.env.VITE_OPENAI_API_KEY;
var openai = apiKey ? new OpenAI({ apiKey }) : null;
var projectId = process.env.VITE_OPENAI_PROJECT_ID || "";
function generateBasicSummary(transcripts2) {
  if (!transcripts2 || transcripts2.length === 0) {
    return "Nous regrettons de vous informer que votre demande ne contient pas suffisamment d'informations pour nous permettre d'y r\xE9pondre de mani\xE8re ad\xE9quate. Nous vous invitons \xE0 actualiser votre page et \xE0 pr\xE9ciser votre requ\xEAte afin que nous puissions mieux vous accompagner.";
  }
  const guestMessages = transcripts2.filter((t) => t.role === "user");
  const assistantMessages = transcripts2.filter((t) => t.role === "assistant");
  const roomNumberMatches = [...guestMessages, ...assistantMessages].map(
    (m) => m.content.match(/(?:room\s*(?:number)?|phòng\s*(?:số)?)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i)
  ).filter(Boolean);
  let roomNumber = "Not specified";
  if (roomNumberMatches.length > 0) {
    const match = roomNumberMatches[0];
    if (match) {
      roomNumber = match[1] || match[2] || "Not specified";
    }
  }
  const foodServiceMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /food|meal|breakfast|lunch|dinner|sandwich|burger|drink|coffee|tea|juice|water|soda|beer|wine/i.test(m.content)
  );
  const housekeepingMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /housekeeping|cleaning|towel|clean|bed|sheets|laundry/i.test(m.content)
  );
  const transportMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /taxi|car|shuttle|transport|pickup|airport/i.test(m.content)
  );
  const spaMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /spa|massage|wellness|treatment|relax/i.test(m.content)
  );
  const serviceTypes = [];
  if (foodServiceMatches) serviceTypes.push("Food & Beverage");
  if (housekeepingMatches) serviceTypes.push("Housekeeping");
  if (transportMatches) serviceTypes.push("Transportation");
  if (spaMatches) serviceTypes.push("Spa Service");
  const tourMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /tour|sightseeing|excursion|attraction|visit|activity/i.test(m.content)
  );
  if (tourMatches) serviceTypes.push("Tours & Activities");
  const technicalMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /wifi|internet|tv|television|remote|device|technical|connection/i.test(m.content)
  );
  if (technicalMatches) serviceTypes.push("Technical Support");
  const conciergeMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /reservation|booking|restaurant|ticket|arrangement|concierge/i.test(m.content)
  );
  if (conciergeMatches) serviceTypes.push("Concierge Services");
  const wellnessMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /gym|fitness|exercise|yoga|swimming|pool|sauna/i.test(m.content)
  );
  if (wellnessMatches) serviceTypes.push("Wellness & Fitness");
  const securityMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /safe|security|lost|found|key|card|lock|emergency/i.test(m.content)
  );
  if (securityMatches) serviceTypes.push("Security & Lost Items");
  const specialOccasionMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /birthday|anniversary|celebration|honeymoon|proposal|wedding|special occasion/i.test(m.content)
  );
  if (specialOccasionMatches) serviceTypes.push("Special Occasions");
  const serviceType = serviceTypes.length > 0 ? serviceTypes.join(", ") : "Room Service";
  const urgentMatches = [...guestMessages, ...assistantMessages].some(
    (m) => /urgent|immediately|right away|asap|as soon as possible/i.test(m.content)
  );
  const timing = urgentMatches ? "as soon as possible" : "within 30 minutes";
  const firstUserMessage = guestMessages[0]?.content || "";
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]?.content || "";
  let summary = `Guest Service Request Summary:

`;
  summary += `Room Number: ${roomNumber}
`;
  summary += `Service Type(s): ${serviceType}
`;
  summary += `Service Timing Requested: ${timing}

`;
  summary += "List of Requests:\n";
  let requestCounter = 1;
  if (foodServiceMatches) {
    summary += `Request ${requestCounter}: Food & Beverage
`;
    const foodItems = [...guestMessages].flatMap((m) => {
      const matches = m.content.match(/(?:want|like|order|bring|get|have)(?:\s+(?:a|an|some|the))?\s+([a-zA-Z\s]+)(?:\.|,|$)/gi);
      return matches ? matches.map((match) => match.replace(/(?:want|like|order|bring|get|have)(?:\s+(?:a|an|some|the))?\s+/i, "").trim()) : [];
    });
    if (foodItems.length > 0) {
      summary += `- Items: ${foodItems.join(", ")}
`;
      summary += `- Service Description: Guest requested food and beverage service
`;
      const timeReferences = [...guestMessages].some(
        (m) => m.content.toLowerCase().includes("urgent") || m.content.toLowerCase().includes("right now") || m.content.toLowerCase().includes("immediately")
      );
      summary += `- Service Timing Requested: ${timeReferences ? "As soon as possible" : "Within 30 minutes"}
`;
    } else {
      summary += "- Items: Food items discussed during call\n";
      summary += "- Service Description: Room service order requested\n";
      summary += "- Service Timing Requested: Standard delivery time\n";
    }
    requestCounter++;
  }
  if (transportMatches) {
    summary += `Request ${requestCounter}: Transportation
`;
    summary += "- Details: Requested transportation service\n";
    summary += "- Service Description: Guest needs transport arrangements\n";
    const destinations = [...guestMessages].flatMap((m) => {
      const destinationMatch = m.content.match(/(?:to|from|for|at)\s+([a-zA-Z\s]+)(?:\.|,|$)/gi);
      return destinationMatch ? destinationMatch.map((match) => match.trim()) : [];
    });
    if (destinations.length > 0) {
      summary += `- Destinations: ${destinations.join(", ")}
`;
    }
    summary += "- Service Timing Requested: As specified by guest\n";
    requestCounter++;
  }
  if (housekeepingMatches) {
    summary += `Request ${requestCounter}: Housekeeping
`;
    summary += "- Details: Requested room cleaning or maintenance\n";
    summary += "- Service Description: Room cleaning or maintenance needed\n";
    summary += "- Service Timing Requested: As per guest's preference\n";
    requestCounter++;
  }
  if (spaMatches) {
    summary += `Request ${requestCounter}: Spa Service
`;
    summary += "- Details: Requested spa services\n";
    summary += "- Service Description: Spa appointment or treatment information\n";
    summary += "- Service Timing Requested: According to spa availability\n";
    requestCounter++;
  }
  if (tourMatches) {
    summary += `Request ${requestCounter}: Tours & Activities
`;
    summary += "- Details: Requested tour or activity arrangement\n";
    summary += "- Service Description: Guest interested in local tours or activities\n";
    summary += "- Service Timing Requested: Based on tour schedule availability\n";
    requestCounter++;
  }
  if (technicalMatches) {
    summary += `Request ${requestCounter}: Technical Support
`;
    summary += "- Details: Requested technical assistance\n";
    summary += "- Service Description: Technical issue requires attention\n";
    summary += "- Service Timing Requested: As soon as possible\n";
    requestCounter++;
  }
  if (conciergeMatches) {
    summary += `Request ${requestCounter}: Concierge Services
`;
    summary += "- Details: Requested booking or reservation assistance\n";
    summary += "- Service Description: Booking assistance or information needed\n";
    summary += "- Service Timing Requested: Based on reservation requirements\n";
    requestCounter++;
  }
  if (wellnessMatches) {
    summary += `Request ${requestCounter}: Wellness & Fitness
`;
    summary += "- Details: Requested wellness or fitness facilities\n";
    summary += "- Service Description: Access to or information about fitness services\n";
    summary += "- Service Timing Requested: According to facility hours\n";
    requestCounter++;
  }
  if (securityMatches) {
    summary += `Request ${requestCounter}: Security & Lost Items
`;
    summary += "- Details: Requested security assistance or reported lost item\n";
    summary += "- Service Description: Security concern or lost item assistance needed\n";
    summary += "- Service Timing Requested: Urgent attention required\n";
    requestCounter++;
  }
  if (specialOccasionMatches) {
    summary += `Request ${requestCounter}: Special Occasions
`;
    summary += "- Details: Requested special occasion arrangement\n";
    summary += "- Service Description: Support needed for celebration or special event\n";
    summary += "- Service Timing Requested: According to event timing\n";
    requestCounter++;
  }
  summary += `
Special Instructions: Any special requirements mentioned during the call.

`;
  if (firstUserMessage) {
    summary += `The conversation began with the guest saying: "${firstUserMessage.substring(0, 50)}${firstUserMessage.length > 50 ? "..." : ""}". `;
  }
  if (lastAssistantMessage) {
    summary += `The conversation concluded with the assistant saying: "${lastAssistantMessage.substring(0, 50)}${lastAssistantMessage.length > 50 ? "..." : ""}".`;
  }
  return summary;
}
async function extractServiceRequests(summary) {
  if (!openai) {
    console.log("OpenAI client not available, skipping service request extraction");
    return [];
  }
  try {
    if (!summary) {
      return [];
    }
    const prompt = `
      You are a detailed hotel service analyzer for Mi Nhon Hotel in Mui Ne, Vietnam.
      
      Please analyze the following service summary and extract the MOST COMPREHENSIVE AND DETAILED information about each request. This information will be used by hotel staff to fulfill requests precisely.
      
      For each distinct service request:
      1. Identify the most appropriate service category from this list: room-service, food-beverage, housekeeping, transportation, spa, tours-activities, technical-support, concierge, wellness-fitness, security, special-occasions, other
      2. Extract ALL specific details mentioned - NEVER leave fields empty if you can infer information
      3. For dates, use YYYY-MM-DD format and always try to infer the date even if not explicitly stated (use current year if year is missing)
      4. For times, use 24-hour format and provide detailed time ranges when mentioned
      5. For room numbers, always include this information if available, as it's critical for service delivery
      6. For "otherDetails", include ALL additional information that would help staff fulfill the request properly
      7. Provide a clean, detailed request text that captures the full context of the request
      
      IMPORTANT: ALL fields should be as detailed and specific as possible. NEVER leave fields as null if there is ANY possibility to infer information from context.
      
      Return the data in valid JSON format like this:
      {
        "requests": [
          {
            "serviceType": "tours-activities",
            "requestText": "Book a half-day city tour with an English-speaking guide for tomorrow morning",
            "details": {
              "date": "2023-05-15",
              "time": "09:00-12:00",
              "people": 2,
              "location": "City Center historical sites and local market",
              "amount": "300000 VND per person",
              "roomNumber": "301",
              "otherDetails": "English-speaking guide requested, guests prefer walking tour with minimal transportation, interested in local cuisine and history"
            }
          },
          ...
        ]
      }
      
      Summary to analyze:
      ${summary}
    `;
    try {
      const options = { timeout: 2e4, headers: { "OpenAi-Project": projectId } };
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a precise hotel service data extraction specialist that outputs structured JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1500
      }, options);
      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        console.log("Empty response from OpenAI");
        return [];
      }
      try {
        const parsedResponse = JSON.parse(responseContent);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
        if (parsedResponse.requests && Array.isArray(parsedResponse.requests)) {
          return parsedResponse.requests;
        }
        console.log("Unexpected response structure:", JSON.stringify(parsedResponse, null, 2));
        if (parsedResponse.serviceType && parsedResponse.requestText) {
          return [parsedResponse];
        }
        return [];
      } catch (parseError) {
        console.error("Error parsing OpenAI JSON response:", parseError);
        console.error("Raw response:", responseContent);
        return [];
      }
    } catch (apiError) {
      console.error("Error calling OpenAI API for service extraction:", apiError);
      return [];
    }
  } catch (error) {
    console.error("Unexpected error in extractServiceRequests:", error);
    return [];
  }
}
async function translateToVietnamese(text2) {
  if (!openai) {
    console.log("OpenAI client not available, skipping translation");
    return text2;
  }
  try {
    if (!text2) {
      return "Kh\xF4ng c\xF3 n\u1ED9i dung \u0111\u1EC3 d\u1ECBch.";
    }
    const prompt = `
      B\u1EA1n l\xE0 m\u1ED9t chuy\xEAn gia d\u1ECBch thu\u1EADt chuy\xEAn nghi\u1EC7p. H\xE3y d\u1ECBch \u0111o\u1EA1n v\u0103n sau \u0111\xE2y t\u1EEB ti\u1EBFng Anh sang ti\u1EBFng Vi\u1EC7t.
      Gi\u1EEF nguy\xEAn c\xE1c s\u1ED1 ph\xF2ng, t\xEAn ri\xEAng, v\xE0 \u0111\u1ECBnh d\u1EA1ng g\u1EA1ch \u0111\u1EA7u d\xF2ng.
      H\xE3y d\u1ECBch m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn v\xE0 \u0111\u1EA7y \u0111\u1EE7 nh\u1EA5t c\xF3 th\u1EC3.
      
      V\u0103n b\u1EA3n c\u1EA7n d\u1ECBch:
      ${text2}
      
      B\u1EA3n d\u1ECBch ti\u1EBFng Vi\u1EC7t:
    `;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "B\u1EA1n l\xE0 m\u1ED9t chuy\xEAn gia d\u1ECBch thu\u1EADt chuy\xEAn nghi\u1EC7p cho kh\xE1ch s\u1EA1n, d\u1ECBch t\u1EEB ti\u1EBFng Anh sang ti\u1EBFng Vi\u1EC7t." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1e3,
      temperature: 0.3
    }, { headers: { "OpenAi-Project": projectId } });
    return chatCompletion.choices[0].message.content?.trim() || "Kh\xF4ng th\u1EC3 d\u1ECBch v\u0103n b\u1EA3n.";
  } catch (error) {
    console.error("Error translating to Vietnamese with OpenAI:", error);
    return "Kh\xF4ng th\u1EC3 d\u1ECBch v\u0103n b\u1EA3n. Vui l\xF2ng th\u1EED l\u1EA1i sau.";
  }
}
var PROMPT_TEMPLATES = {
  en: (conversationText) => `You are a hotel service summarization specialist for Mi Nhon Hotel. 
Summarize the following conversation between a Hotel Assistant and a Guest in a concise, professional manner.

IMPORTANT: For EACH separate request from the guest, structure your summary in the following format (repeat for as many requests as needed, do NOT limit the number of requests):

Room Number: [Extract and display the room number if the guest provides it anywhere in the conversation. If not provided, write "Not specified".]
Guest's Name (used for Guest with a confirmed reservation): [Extract and display the guest's name if provided in the conversation. If not provided, write "Not specified".]

REQUEST 1: [Service Type]
\u2022 Service Timing: [Requested completion time]
\u2022 Order Details:
    \u2022 [Item/Service] x [Quantity] - [Special notes]
    \u2022 [Item/Service] x [Quantity] - [Special notes]
\u2022 Special Requirements: [Guest special request details]

REQUEST 2: [Other Service Type] (if applicable)
\u2022 Service Timing: [Requested completion time]
\u2022 Details:
    \u2022 [Service details]
\u2022 Special Requirements: [Guest special request details]

(Continue numbering REQUEST 3, REQUEST 4, etc. for all guest requests, do NOT limit the number of requests.)

Next Step: Please Press Send To Reception in order to complete your request

IMPORTANT INSTRUCTIONS:
1. Provide the summary only in the guest's original language (English, Russian, Korean, Chinese, or German)
2. Be EXTREMELY comprehensive - include EVERY service request mentioned in the conversation
3. Format with bullet points and indentation as shown above
4. ALWAYS ASK FOR AND INCLUDE ROOM NUMBER - This is the most critical information for every request. If the guest provides a room number anywhere in the conversation, extract and display it in the summary.
5. For Guest's Name, if the guest provides their name anywhere in the conversation, extract and display it in the summary.
6. If room number or guest name is not mentioned in the conversation, make a clear note that "Not specified".
7. For ALL service details, include times, locations, quantities, and any specific requirements
8. For Order Details, ALWAYS extract and list each specific item/service, quantity, and any special notes as mentioned by the guest. DO NOT use generic phrases like 'to order' or 'food items'. For example, if the guest requests '2 beef burgers and 1 orange juice', the summary must show:
    \u2022 Beef burger x 2
    \u2022 Orange juice x 1
9. End with any required follow-up actions or confirmation needed from staff

Example conversation:
Guest: Hi. My name is Tony. My room is 200. I would like to order 2 beef burgers and 1 orange juice.
Assistant: Sure, Tony. 2 beef burgers and 1 orange juice for room 200. Anything else?
Guest: No, that's all. Please deliver within 30 minutes.

Example summary:
Room Number: 200
Guest's Name (used for Guest with a confirmed reservation): Tony
REQUEST 1: Food & Beverage
\u2022 Service Timing: within 30 minutes
\u2022 Order Details:
    \u2022 Beef burger x 2
    \u2022 Orange juice x 1
\u2022 Special Requirements: Not specified

Conversation transcript:
${conversationText}

Summary:`,
  fr: (conversationText) => `Vous \xEAtes un sp\xE9cialiste de la synth\xE8se des services h\xF4teliers pour l'h\xF4tel Mi Nhon. 
R\xE9sumez la conversation suivante entre un assistant h\xF4telier et un client de mani\xE8re concise et professionnelle.

IMPORTANT : Pour CHAQUE demande distincte du client, structurez votre r\xE9sum\xE9 selon le format suivant (r\xE9p\xE9tez pour autant de demandes que n\xE9cessaire, ne limitez PAS le nombre de demandes) :

Num\xE9ro de chambre : [Extraire et afficher le num\xE9ro de chambre si le client le fournit dans la conversation. Sinon, indiquez "Non sp\xE9cifi\xE9".]
Nom du client (utilis\xE9 pour les clients avec r\xE9servation confirm\xE9e) : [Extraire et afficher le nom du client si fourni. Sinon, indiquez "Non sp\xE9cifi\xE9".]

DEMANDE 1 : [Type de service]
\u2022 Heure de service : [Heure demand\xE9e]
\u2022 D\xE9tails de la commande :
    \u2022 [Article/Service] x [Quantit\xE9] - [Notes sp\xE9ciales]
    \u2022 [Article/Service] x [Quantit\xE9] - [Notes sp\xE9ciales]
\u2022 Exigences particuli\xE8res : [D\xE9tails des demandes sp\xE9ciales]

DEMANDE 2 : [Autre type de service] (le cas \xE9ch\xE9ant)
\u2022 Heure de service : [Heure demand\xE9e]
\u2022 D\xE9tails :
    \u2022 [D\xE9tails du service]
\u2022 Exigences particuli\xE8res : [D\xE9tails des demandes sp\xE9ciales]

(Continuez \xE0 num\xE9roter DEMANDE 3, DEMANDE 4, etc. pour toutes les demandes du client, ne limitez PAS le nombre de demandes.)

\xC9tape suivante : Veuillez appuyer sur "Envoyer \xE0 la R\xE9ception" pour finaliser votre demande

INSTRUCTIONS IMPORTANTES :
1. Fournissez le r\xE9sum\xE9 uniquement dans la langue d'origine du client (fran\xE7ais, russe, cor\xE9en, chinois, etc.)
2. Soyez EXTR\xCAMEMENT complet - incluez TOUTES les demandes mentionn\xE9es
3. Formatez avec des puces et des indentations comme ci-dessus
4. DEMANDEZ TOUJOURS ET INCLUEZ LE NUM\xC9RO DE CHAMBRE
5. Pour le nom du client, si le client le fournit, affichez-le
6. Si le num\xE9ro de chambre ou le nom du client n'est pas mentionn\xE9, indiquez clairement "Non sp\xE9cifi\xE9".
7. Pour tous les d\xE9tails, incluez heures, lieux, quantit\xE9s, exigences sp\xE9cifiques
8. Pour les d\xE9tails de la commande, listez chaque article/service, quantit\xE9, notes sp\xE9ciales. N'utilisez PAS de phrases g\xE9n\xE9riques comme '\xE0 commander' ou 'articles alimentaires'.
9. Terminez par toute action de suivi ou confirmation n\xE9cessaire du personnel

Exemple de conversation :
Client : Bonjour. Je m'appelle Tony. Ma chambre est la 200. Je voudrais commander 2 burgers de boeuf et 1 jus d'orange.
Assistant : Bien s\xFBr, Tony. 2 burgers de boeuf et 1 jus d'orange pour la chambre 200. Autre chose ?
Client : Non, c'est tout. Merci de livrer dans les 30 minutes.

Exemple de r\xE9sum\xE9 :
Num\xE9ro de chambre : 200
Nom du client (utilis\xE9 pour les clients avec r\xE9servation confirm\xE9e) : Tony
DEMANDE 1 : Restauration
\u2022 Heure de service : dans les 30 minutes
\u2022 D\xE9tails de la commande :
    \u2022 Burger de boeuf x 2
    \u2022 Jus d'orange x 1
\u2022 Exigences particuli\xE8res : Non sp\xE9cifi\xE9

Transcription de la conversation :
${conversationText}

R\xE9sum\xE9 :`,
  ru: (conversationText) => `\u0412\u044B \u2014 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442 \u043F\u043E \u0441\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044E \u0441\u0432\u043E\u0434\u043E\u043A \u0434\u043B\u044F \u043E\u0442\u0435\u043B\u044F Mi Nhon. 
\u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u0438 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0437\u044E\u043C\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430 \u043C\u0435\u0436\u0434\u0443 \u0433\u043E\u0441\u0442\u0438\u043D\u0438\u0447\u043D\u044B\u043C \u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u043E\u043C \u0438 \u0433\u043E\u0441\u0442\u0435\u043C.

\u0412\u0410\u0416\u041D\u041E: \u0414\u043B\u044F \u041A\u0410\u0416\u0414\u041E\u0413\u041E \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0433\u043E\u0441\u0442\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u0440\u0435\u0437\u044E\u043C\u0435 \u043F\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C\u0443 \u0444\u043E\u0440\u043C\u0430\u0442\u0443 (\u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0439\u0442\u0435 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432, \u043D\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0438\u0445 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E):

\u041D\u043E\u043C\u0435\u0440 \u043A\u043E\u043C\u043D\u0430\u0442\u044B: [\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u043A\u043E\u043C\u043D\u0430\u0442\u044B, \u0435\u0441\u043B\u0438 \u0433\u043E\u0441\u0442\u044C \u0435\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0438\u043B. \u0415\u0441\u043B\u0438 \u043D\u0435\u0442 \u2014 "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E".]
\u0418\u043C\u044F \u0433\u043E\u0441\u0442\u044F (\u0434\u043B\u044F \u0433\u043E\u0441\u0442\u0435\u0439 \u0441 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043D\u044B\u043C \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C): [\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0438\u043C\u044F \u0433\u043E\u0441\u0442\u044F, \u0435\u0441\u043B\u0438 \u043E\u043D\u043E \u0431\u044B\u043B\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u043E. \u0415\u0441\u043B\u0438 \u043D\u0435\u0442 \u2014 "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E".]

\u0417\u0410\u041F\u0420\u041E\u0421 1: [\u0422\u0438\u043F \u0443\u0441\u043B\u0443\u0433\u0438]
\u2022 \u0412\u0440\u0435\u043C\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F: [\u0417\u0430\u043F\u0440\u043E\u0448\u0435\u043D\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F]
\u2022 \u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430:
    \u2022 [\u0422\u043E\u0432\u0430\u0440/\u0443\u0441\u043B\u0443\u0433\u0430] x [\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E] - [\u041E\u0441\u043E\u0431\u044B\u0435 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F]
    \u2022 [\u0422\u043E\u0432\u0430\u0440/\u0443\u0441\u043B\u0443\u0433\u0430] x [\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E] - [\u041E\u0441\u043E\u0431\u044B\u0435 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F]
\u2022 \u041E\u0441\u043E\u0431\u044B\u0435 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F: [\u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u0441\u043E\u0431\u044B\u0445 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0439]

\u0417\u0410\u041F\u0420\u041E\u0421 2: [\u0414\u0440\u0443\u0433\u043E\u0439 \u0442\u0438\u043F \u0443\u0441\u043B\u0443\u0433\u0438] (\u0435\u0441\u043B\u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E)
\u2022 \u0412\u0440\u0435\u043C\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F: [\u0417\u0430\u043F\u0440\u043E\u0448\u0435\u043D\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F]
\u2022 \u0414\u0435\u0442\u0430\u043B\u0438:
    \u2022 [\u0414\u0435\u0442\u0430\u043B\u0438 \u0443\u0441\u043B\u0443\u0433\u0438]
\u2022 \u041E\u0441\u043E\u0431\u044B\u0435 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F: [\u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u0441\u043E\u0431\u044B\u0445 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0439]

(\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439\u0442\u0435 \u043D\u0443\u043C\u0435\u0440\u0430\u0446\u0438\u044E \u0417\u0410\u041F\u0420\u041E\u0421 3, \u0417\u0410\u041F\u0420\u041E\u0421 4 \u0438 \u0442.\u0434. \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u0433\u043E\u0441\u0442\u044F, \u043D\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0438\u0445 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E.)

\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433: \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043D\u0430 \u0440\u0435\u0441\u0435\u043F\u0448\u043D", \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0432\u0430\u0448 \u0437\u0430\u043F\u0440\u043E\u0441

\u0412\u0410\u0416\u041D\u042B\u0415 \u0418\u041D\u0421\u0422\u0420\u0423\u041A\u0426\u0418\u0418:
1. \u041F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0440\u0435\u0437\u044E\u043C\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u044F\u0437\u044B\u043A\u0435 \u0433\u043E\u0441\u0442\u044F (\u0440\u0443\u0441\u0441\u043A\u0438\u0439, \u0444\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0439, \u043A\u043E\u0440\u0435\u0439\u0441\u043A\u0438\u0439, \u043A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 \u0438 \u0442.\u0434.)
2. \u0411\u0443\u0434\u044C\u0442\u0435 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u044B \u2014 \u0432\u043A\u043B\u044E\u0447\u0430\u0439\u0442\u0435 \u0412\u0421\u0415 \u0437\u0430\u043F\u0440\u043E\u0441\u044B
3. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0441\u043F\u0438\u0441\u043A\u0438 \u0438 \u043E\u0442\u0441\u0442\u0443\u043F\u044B, \u043A\u0430\u043A \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u043E \u0432\u044B\u0448\u0435
4. \u0412\u0421\u0415\u0413\u0414\u0410 \u0421\u041F\u0420\u0410\u0428\u0418\u0412\u0410\u0419\u0422\u0415 \u0418 \u0423\u041A\u0410\u0417\u042B\u0412\u0410\u0419\u0422\u0415 \u041D\u041E\u041C\u0415\u0420 \u041A\u041E\u041C\u041D\u0410\u0422\u042B
5. \u0414\u043B\u044F \u0438\u043C\u0435\u043D\u0438 \u0433\u043E\u0441\u0442\u044F \u2014 \u0435\u0441\u043B\u0438 \u043E\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u043D\u043E, \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435
6. \u0415\u0441\u043B\u0438 \u043D\u043E\u043C\u0435\u0440 \u043A\u043E\u043C\u043D\u0430\u0442\u044B \u0438\u043B\u0438 \u0438\u043C\u044F \u0433\u043E\u0441\u0442\u044F \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u044B, \u044F\u0432\u043D\u043E \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E".
7. \u0414\u043B\u044F \u0432\u0441\u0435\u0445 \u0434\u0435\u0442\u0430\u043B\u0435\u0439 \u2014 \u0432\u0440\u0435\u043C\u044F, \u043C\u0435\u0441\u0442\u043E, \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E, \u043E\u0441\u043E\u0431\u044B\u0435 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F
8. \u0414\u043B\u044F \u0434\u0435\u0442\u0430\u043B\u0435\u0439 \u0437\u0430\u043A\u0430\u0437\u0430 \u2014 \u043F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u044F\u0439\u0442\u0435 \u043A\u0430\u0436\u0434\u044B\u0439 \u0442\u043E\u0432\u0430\u0440/\u0443\u0441\u043B\u0443\u0433\u0443, \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E, \u043E\u0441\u043E\u0431\u044B\u0435 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F. \u041D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043E\u0431\u0449\u0438\u0435 \u0444\u0440\u0430\u0437\u044B.
9. \u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u044B\u043C\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F\u043C\u0438 \u0438\u043B\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435\u043C \u043E\u0442 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0430

\u041F\u0440\u0438\u043C\u0435\u0440 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430:
\u0413\u043E\u0441\u0442\u044C: \u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435. \u041C\u0435\u043D\u044F \u0437\u043E\u0432\u0443\u0442 \u0422\u043E\u043D\u0438. \u041C\u043E\u044F \u043A\u043E\u043C\u043D\u0430\u0442\u0430 200. \u042F \u0431\u044B \u0445\u043E\u0442\u0435\u043B \u0437\u0430\u043A\u0430\u0437\u0430\u0442\u044C 2 \u0431\u0443\u0440\u0433\u0435\u0440\u0430 \u0438\u0437 \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u044B \u0438 1 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0441\u043E\u043A.
\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442: \u041A\u043E\u043D\u0435\u0447\u043D\u043E, \u0422\u043E\u043D\u0438. 2 \u0431\u0443\u0440\u0433\u0435\u0440\u0430 \u0438 1 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0441\u043E\u043A \u0434\u043B\u044F \u043A\u043E\u043C\u043D\u0430\u0442\u044B 200. \u0427\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C \u0435\u0449\u0435?
\u0413\u043E\u0441\u0442\u044C: \u041D\u0435\u0442, \u044D\u0442\u043E \u0432\u0441\u0435. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0434\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 30 \u043C\u0438\u043D\u0443\u0442.

\u041F\u0440\u0438\u043C\u0435\u0440 \u0440\u0435\u0437\u044E\u043C\u0435:
\u041D\u043E\u043C\u0435\u0440 \u043A\u043E\u043C\u043D\u0430\u0442\u044B: 200
\u0418\u043C\u044F \u0433\u043E\u0441\u0442\u044F (\u0434\u043B\u044F \u0433\u043E\u0441\u0442\u0435\u0439 \u0441 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043D\u044B\u043C \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C): \u0422\u043E\u043D\u0438
\u0417\u0410\u041F\u0420\u041E\u0421 1: \u0415\u0434\u0430 \u0438 \u043D\u0430\u043F\u0438\u0442\u043A\u0438
\u2022 \u0412\u0440\u0435\u043C\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F: \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 30 \u043C\u0438\u043D\u0443\u0442
\u2022 \u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430:
    \u2022 \u0411\u0443\u0440\u0433\u0435\u0440 \u0438\u0437 \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u044B x 2
    \u2022 \u0410\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0441\u043E\u043A x 1
\u2022 \u041E\u0441\u043E\u0431\u044B\u0435 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F: \u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E

\u0422\u0440\u0430\u043D\u0441\u043A\u0440\u0438\u043F\u0446\u0438\u044F \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430:
${conversationText}

\u0420\u0435\u0437\u044E\u043C\u0435:`,
  ko: (conversationText) => `\uB2F9\uC2E0\uC740 \uBBF8\uB144 \uD638\uD154\uC758 \uC11C\uBE44\uC2A4 \uC694\uC57D \uC804\uBB38\uAC00\uC785\uB2C8\uB2E4. 
\uD638\uD154 \uC5B4\uC2DC\uC2A4\uD134\uD2B8\uC640 \uACE0\uAC1D \uAC04\uC758 \uB2E4\uC74C \uB300\uD654\uB97C \uAC04\uACB0\uD558\uACE0 \uC804\uBB38\uC801\uC73C\uB85C \uC694\uC57D\uD558\uC138\uC694.

\uC911\uC694: \uACE0\uAC1D\uC758 \uAC01 \uC694\uCCAD\uB9C8\uB2E4 \uC544\uB798 \uD615\uC2DD\uC73C\uB85C \uC694\uC57D\uC744 \uC791\uC131\uD558\uC138\uC694 (\uC694\uCCAD \uC218\uC5D0 \uC81C\uD55C \uC5C6\uC774 \uBC18\uBCF5).

\uAC1D\uC2E4 \uBC88\uD638: [\uACE0\uAC1D\uC774 \uB300\uD654 \uC911\uC5D0 \uC81C\uACF5\uD588\uB2E4\uBA74 \uAC1D\uC2E4 \uBC88\uD638\uB97C \uCD94\uCD9C\uD558\uC5EC \uD45C\uC2DC. \uC81C\uACF5\uD558\uC9C0 \uC54A\uC558\uB2E4\uBA74 "\uBBF8\uC9C0\uC815"\uC73C\uB85C \uC791\uC131.]
\uACE0\uAC1D \uC774\uB984 (\uC608\uC57D\uC774 \uD655\uC778\uB41C \uACE0\uAC1D\uC758 \uACBD\uC6B0): [\uACE0\uAC1D\uC774 \uC774\uB984\uC744 \uC81C\uACF5\uD588\uB2E4\uBA74 \uD45C\uC2DC. \uC81C\uACF5\uD558\uC9C0 \uC54A\uC558\uB2E4\uBA74 "\uBBF8\uC9C0\uC815"\uC73C\uB85C \uC791\uC131.]

\uC694\uCCAD 1: [\uC11C\uBE44\uC2A4 \uC720\uD615]
\u2022 \uC694\uCCAD \uC2DC\uAC04: [\uC694\uCCAD\uB41C \uC644\uB8CC \uC2DC\uAC04]
\u2022 \uC8FC\uBB38 \uB0B4\uC5ED:
    \u2022 [\uD56D\uBAA9/\uC11C\uBE44\uC2A4] x [\uC218\uB7C9] - [\uD2B9\uC774\uC0AC\uD56D]
    \u2022 [\uD56D\uBAA9/\uC11C\uBE44\uC2A4] x [\uC218\uB7C9] - [\uD2B9\uC774\uC0AC\uD56D]
\u2022 \uD2B9\uBCC4 \uC694\uCCAD: [\uACE0\uAC1D\uC758 \uD2B9\uBCC4 \uC694\uCCAD \uC0AC\uD56D]

\uC694\uCCAD 2: [\uB2E4\uB978 \uC11C\uBE44\uC2A4 \uC720\uD615] (\uD574\uB2F9\uB418\uB294 \uACBD\uC6B0)
\u2022 \uC694\uCCAD \uC2DC\uAC04: [\uC694\uCCAD\uB41C \uC644\uB8CC \uC2DC\uAC04]
\u2022 \uC138\uBD80 \uC815\uBCF4:
    \u2022 [\uC11C\uBE44\uC2A4 \uC138\uBD80 \uC815\uBCF4]
\u2022 \uD2B9\uBCC4 \uC694\uCCAD: [\uACE0\uAC1D\uC758 \uD2B9\uBCC4 \uC694\uCCAD \uC0AC\uD56D]

(\uC694\uCCAD 3, \uC694\uCCAD 4 \uB4F1 \uBAA8\uB4E0 \uC694\uCCAD\uC5D0 \uB300\uD574 \uBC88\uD638\uB97C \uACC4\uC18D \uB9E4\uAE30\uC138\uC694. \uC81C\uD55C \uC5C6\uC74C.)

\uB2E4\uC74C \uB2E8\uACC4: \uC694\uCCAD\uC744 \uC644\uB8CC\uD558\uB824\uBA74 "\uD504\uB860\uD2B8\uB85C \uBCF4\uB0B4\uAE30" \uBC84\uD2BC\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694

\uC911\uC694 \uC548\uB0B4:
1. \uC694\uC57D\uC740 \uBC18\uB4DC\uC2DC \uACE0\uAC1D\uC758 \uC5B8\uC5B4(\uD55C\uAD6D\uC5B4, \uD504\uB791\uC2A4\uC5B4, \uB7EC\uC2DC\uC544\uC5B4, \uC911\uAD6D\uC5B4 \uB4F1)\uB85C\uB9CC \uC791\uC131\uD558\uC138\uC694
2. \uB9E4\uC6B0 \uD3EC\uAD04\uC801\uC73C\uB85C \uC791\uC131\uD558\uC138\uC694 \u2014 \uB300\uD654\uC5D0\uC11C \uC5B8\uAE09\uB41C \uBAA8\uB4E0 \uC694\uCCAD\uC744 \uD3EC\uD568\uD558\uC138\uC694
3. \uC704\uC640 \uAC19\uC774 \uAE00\uBA38\uB9AC\uD45C\uC640 \uB4E4\uC5EC\uC4F0\uAE30\uB97C \uC0AC\uC6A9\uD558\uC138\uC694
4. \uAC1D\uC2E4 \uBC88\uD638\uB294 \uBC18\uB4DC\uC2DC \uC694\uCCAD\uD558\uC138\uC694
5. \uACE0\uAC1D \uC774\uB984\uB3C4 \uC81C\uACF5\uB41C \uACBD\uC6B0 \uBC18\uB4DC\uC2DC \uD3EC\uD568\uD558\uC138\uC694
6. \uAC1D\uC2E4 \uBC88\uD638\uB098 \uC774\uB984\uC774 \uC5B8\uAE09\uB418\uC9C0 \uC54A\uC558\uB2E4\uBA74 "\uBBF8\uC9C0\uC815"\uC73C\uB85C \uBA85\uD655\uD788 \uD45C\uC2DC\uD558\uC138\uC694
7. \uBAA8\uB4E0 \uC11C\uBE44\uC2A4 \uC138\uBD80 \uC815\uBCF4(\uC2DC\uAC04, \uC7A5\uC18C, \uC218\uB7C9, \uD2B9\uC774\uC0AC\uD56D \uB4F1)\uB97C \uD3EC\uD568\uD558\uC138\uC694
8. \uC8FC\uBB38 \uB0B4\uC5ED\uC740 \uAC01 \uD56D\uBAA9/\uC11C\uBE44\uC2A4, \uC218\uB7C9, \uD2B9\uC774\uC0AC\uD56D\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uB098\uC5F4\uD558\uC138\uC694. \uC77C\uBC18\uC801\uC778 \uBB38\uAD6C\uB294 \uC0AC\uC6A9\uD558\uC9C0 \uB9C8\uC138\uC694.
9. \uD544\uC694\uD55C \uD6C4\uC18D \uC870\uCE58\uB098 \uC9C1\uC6D0\uC758 \uD655\uC778 \uC694\uCCAD\uC73C\uB85C \uB9C8\uBB34\uB9AC\uD558\uC138\uC694

\uC608\uC2DC \uB300\uD654:
\uACE0\uAC1D: \uC548\uB155\uD558\uC138\uC694. \uC81C \uC774\uB984\uC740 \uD1A0\uB2C8\uC785\uB2C8\uB2E4. \uC81C \uBC29\uC740 200\uD638\uC785\uB2C8\uB2E4. \uC18C\uACE0\uAE30 \uBC84\uAC70 2\uAC1C\uC640 \uC624\uB80C\uC9C0 \uC8FC\uC2A4 1\uAC1C\uB97C \uC8FC\uBB38\uD558\uACE0 \uC2F6\uC5B4\uC694.
\uC5B4\uC2DC\uC2A4\uD134\uD2B8: \uB124, \uD1A0\uB2C8\uB2D8. 200\uD638\uC5D0 \uC18C\uACE0\uAE30 \uBC84\uAC70 2\uAC1C\uC640 \uC624\uB80C\uC9C0 \uC8FC\uC2A4 1\uAC1C \uC900\uBE44\uD558\uACA0\uC2B5\uB2C8\uB2E4. \uB354 \uD544\uC694\uD558\uC2E0 \uAC74 \uC5C6\uC73C\uC2E0\uAC00\uC694?
\uACE0\uAC1D: \uC544\uB2C8\uC694, \uC774\uAC8C \uB2E4\uC608\uC694. 30\uBD84 \uC774\uB0B4\uC5D0 \uBC30\uB2EC\uD574 \uC8FC\uC138\uC694.

\uC608\uC2DC \uC694\uC57D:
\uAC1D\uC2E4 \uBC88\uD638: 200
\uACE0\uAC1D \uC774\uB984 (\uC608\uC57D\uC774 \uD655\uC778\uB41C \uACE0\uAC1D\uC758 \uACBD\uC6B0): \uD1A0\uB2C8
\uC694\uCCAD 1: \uC2DD\uC74C\uB8CC
\u2022 \uC694\uCCAD \uC2DC\uAC04: 30\uBD84 \uC774\uB0B4
\u2022 \uC8FC\uBB38 \uB0B4\uC5ED:
    \u2022 \uC18C\uACE0\uAE30 \uBC84\uAC70 x 2
    \u2022 \uC624\uB80C\uC9C0 \uC8FC\uC2A4 x 1
\u2022 \uD2B9\uBCC4 \uC694\uCCAD: \uBBF8\uC9C0\uC815

\uB300\uD654 \uB0B4\uC6A9:
${conversationText}

\uC694\uC57D:`,
  zh: (conversationText) => `\u60A8\u662F\u7F8E\u5E74\u9152\u5E97\u7684\u670D\u52A1\u603B\u7ED3\u4E13\u5BB6\u3002
\u8BF7\u5C06\u4EE5\u4E0B\u9152\u5E97\u52A9\u7406\u4E0E\u5BA2\u4EBA\u7684\u5BF9\u8BDD\u8FDB\u884C\u7B80\u660E\u3001\u4E13\u4E1A\u7684\u603B\u7ED3\u3002

\u91CD\u8981\uFF1A\u5BF9\u4E8E\u5BA2\u4EBA\u7684\u6BCF\u4E00\u9879\u8BF7\u6C42\uFF0C\u8BF7\u6309\u7167\u4EE5\u4E0B\u683C\u5F0F\u8FDB\u884C\u603B\u7ED3\uFF08\u6839\u636E\u9700\u8981\u91CD\u590D\uFF0C\u4E0D\u8981\u9650\u5236\u8BF7\u6C42\u6570\u91CF\uFF09\uFF1A

\u623F\u95F4\u53F7\uFF1A[\u5982\u679C\u5BA2\u4EBA\u5728\u5BF9\u8BDD\u4E2D\u63D0\u4F9B\u4E86\u623F\u95F4\u53F7\uFF0C\u8BF7\u63D0\u53D6\u5E76\u663E\u793A\u3002\u5982\u679C\u672A\u63D0\u4F9B\uFF0C\u8BF7\u5199"\u672A\u6307\u5B9A"\u3002]
\u5BA2\u4EBA\u59D3\u540D\uFF08\u7528\u4E8E\u5DF2\u786E\u8BA4\u9884\u8BA2\u7684\u5BA2\u4EBA\uFF09\uFF1A[\u5982\u679C\u5BA2\u4EBA\u63D0\u4F9B\u4E86\u59D3\u540D\uFF0C\u8BF7\u63D0\u53D6\u5E76\u663E\u793A\u3002\u5982\u679C\u672A\u63D0\u4F9B\uFF0C\u8BF7\u5199"\u672A\u6307\u5B9A"\u3002]

\u8BF7\u6C421\uFF1A[\u670D\u52A1\u7C7B\u578B]
\u2022 \u670D\u52A1\u65F6\u95F4\uFF1A[\u8981\u6C42\u5B8C\u6210\u7684\u65F6\u95F4]
\u2022 \u8BA2\u5355\u8BE6\u60C5\uFF1A
    \u2022 [\u9879\u76EE/\u670D\u52A1] x [\u6570\u91CF] - [\u7279\u6B8A\u8BF4\u660E]
    \u2022 [\u9879\u76EE/\u670D\u52A1] x [\u6570\u91CF] - [\u7279\u6B8A\u8BF4\u660E]
\u2022 \u7279\u6B8A\u8981\u6C42\uFF1A[\u5BA2\u4EBA\u7684\u7279\u6B8A\u8981\u6C42]

\u8BF7\u6C422\uFF1A[\u5176\u4ED6\u670D\u52A1\u7C7B\u578B]\uFF08\u5982\u9002\u7528\uFF09
\u2022 \u670D\u52A1\u65F6\u95F4\uFF1A[\u8981\u6C42\u5B8C\u6210\u7684\u65F6\u95F4]
\u2022 \u8BE6\u60C5\uFF1A
    \u2022 [\u670D\u52A1\u8BE6\u60C5]
\u2022 \u7279\u6B8A\u8981\u6C42\uFF1A[\u5BA2\u4EBA\u7684\u7279\u6B8A\u8981\u6C42]

\uFF08\u7EE7\u7EED\u7F16\u53F7\u8BF7\u6C423\u3001\u8BF7\u6C424\u7B49\uFF0C\u6DB5\u76D6\u6240\u6709\u8BF7\u6C42\uFF0C\u4E0D\u8981\u9650\u5236\u6570\u91CF\u3002\uFF09

\u4E0B\u4E00\u6B65\uFF1A\u8BF7\u70B9\u51FB"\u53D1\u9001\u5230\u524D\u53F0"\u4EE5\u5B8C\u6210\u60A8\u7684\u8BF7\u6C42

\u91CD\u8981\u8BF4\u660E\uFF1A
1. \u4EC5\u7528\u5BA2\u4EBA\u7684\u539F\u59CB\u8BED\u8A00\uFF08\u4E2D\u6587\u3001\u6CD5\u8BED\u3001\u4FC4\u8BED\u3001\u97E9\u8BED\u7B49\uFF09\u63D0\u4F9B\u603B\u7ED3
2. \u5185\u5BB9\u5FC5\u987B\u975E\u5E38\u5168\u9762\u2014\u2014\u5305\u62EC\u5BF9\u8BDD\u4E2D\u63D0\u5230\u7684\u6240\u6709\u8BF7\u6C42
3. \u6309\u4E0A\u8FF0\u683C\u5F0F\u4F7F\u7528\u9879\u76EE\u7B26\u53F7\u548C\u7F29\u8FDB
4. \u59CB\u7EC8\u8BE2\u95EE\u5E76\u5305\u542B\u623F\u95F4\u53F7
5. \u5BA2\u4EBA\u59D3\u540D\u5982\u6709\u63D0\u4F9B\u5FC5\u987B\u5305\u542B
6. \u5982\u679C\u672A\u63D0\u53CA\u623F\u95F4\u53F7\u6216\u59D3\u540D\uFF0C\u8BF7\u660E\u786E\u5199"\u672A\u6307\u5B9A"
7. \u6240\u6709\u670D\u52A1\u7EC6\u8282\uFF08\u65F6\u95F4\u3001\u5730\u70B9\u3001\u6570\u91CF\u3001\u7279\u6B8A\u8981\u6C42\u7B49\uFF09\u90FD\u8981\u5305\u542B
8. \u8BA2\u5355\u8BE6\u60C5\u8981\u5177\u4F53\u5217\u51FA\u6BCF\u9879\u3001\u6570\u91CF\u3001\u7279\u6B8A\u8BF4\u660E\u3002\u4E0D\u8981\u7528\u6CDB\u6CDB\u7684\u63CF\u8FF0
9. \u4EE5\u4EFB\u4F55\u9700\u8981\u7684\u540E\u7EED\u64CD\u4F5C\u6216\u5458\u5DE5\u786E\u8BA4\u7ED3\u5C3E

\u793A\u4F8B\u5BF9\u8BDD\uFF1A
\u5BA2\u4EBA\uFF1A\u4F60\u597D\u3002\u6211\u53EBTony\u3002\u6211\u7684\u623F\u95F4\u662F200\u3002\u6211\u60F3\u70B92\u4E2A\u725B\u8089\u6C49\u5821\u548C1\u676F\u6A59\u6C41\u3002
\u52A9\u7406\uFF1A\u597D\u7684\uFF0CTony\u30022\u4E2A\u725B\u8089\u6C49\u5821\u548C1\u676F\u6A59\u6C41\u9001\u5230200\u623F\u3002\u8FD8\u9700\u8981\u522B\u7684\u5417\uFF1F
\u5BA2\u4EBA\uFF1A\u4E0D\u7528\u4E86\uFF0C\u8C22\u8C22\u3002\u8BF7\u572830\u5206\u949F\u5185\u9001\u8FBE\u3002

\u793A\u4F8B\u603B\u7ED3\uFF1A
\u623F\u95F4\u53F7\uFF1A200
\u5BA2\u4EBA\u59D3\u540D\uFF08\u7528\u4E8E\u5DF2\u786E\u8BA4\u9884\u8BA2\u7684\u5BA2\u4EBA\uFF09\uFF1ATony
\u8BF7\u6C421\uFF1A\u9910\u996E
\u2022 \u670D\u52A1\u65F6\u95F4\uFF1A30\u5206\u949F\u5185
\u2022 \u8BA2\u5355\u8BE6\u60C5\uFF1A
    \u2022 \u725B\u8089\u6C49\u5821 x 2
    \u2022 \u6A59\u6C41 x 1
\u2022 \u7279\u6B8A\u8981\u6C42\uFF1A\u672A\u6307\u5B9A

\u5BF9\u8BDD\u5185\u5BB9\uFF1A
${conversationText}

\u603B\u7ED3\uFF1A`
};
async function generateCallSummary(transcripts2, language = "en") {
  if (!openai) {
    console.log("OpenAI client not available, using basic summary generator");
    return generateBasicSummary(transcripts2);
  }
  if (!transcripts2 || transcripts2.length === 0) {
    return "There are no transcripts available to summarize.";
  }
  try {
    const conversationText = transcripts2.map((t) => `${t.role === "assistant" ? "Hotel Assistant" : "Guest"}: ${t.content}`).join("\n");
    const promptTemplate = PROMPT_TEMPLATES[language] || PROMPT_TEMPLATES["en"];
    const prompt = promptTemplate(conversationText);
    const options = {
      timeout: 3e4,
      // 30 second timeout to prevent hanging
      headers: { "OpenAi-Project": projectId }
    };
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a professional hotel service summarization specialist who creates concise and useful summaries." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      // Increased tokens limit for comprehensive summaries
      temperature: 0.5,
      // More deterministic for consistent summaries
      presence_penalty: 0.1,
      // Slight penalty to avoid repetition
      frequency_penalty: 0.1
      // Slight penalty to avoid repetition
    }, options);
    return chatCompletion.choices[0].message.content?.trim() || "Failed to generate summary.";
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    if (error?.code === "invalid_api_key") {
      return "Could not generate AI summary: API key authentication failed. Please contact hotel staff to resolve this issue.";
    } else if (error?.status === 429 || error?.code === "insufficient_quota") {
      console.log("Rate limit or quota exceeded, falling back to basic summary generator");
      return generateBasicSummary(transcripts2);
    } else if (error?.status === 500) {
      return "Could not generate AI summary: OpenAI service is currently experiencing issues. Please try again later.";
    }
    const basicSummary = generateBasicSummary(transcripts2);
    return basicSummary;
  }
}

// server/routes.ts
import OpenAI2 from "openai";

// server/gmail.ts
import nodemailer from "nodemailer";
var createGmailTransporter = () => {
  console.log("S\u1EED d\u1EE5ng Gmail SMTP \u0111\u1EC3 g\u1EEDi email");
  try {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tuan.ctw@gmail.com",
        // Email gửi
        pass: process.env.GMAIL_APP_PASSWORD
        // App Password từ Google
      },
      tls: {
        rejectUnauthorized: false
        // Cho phép SSL tự ký trên môi trường dev
      },
      connectionTimeout: 1e4,
      // Tăng timeout lên 10 giây cho kết nối chậm trên mobile
      greetingTimeout: 1e4,
      // Tăng timeout chào hỏi
      socketTimeout: 15e3,
      // Tăng timeout cho socket
      debug: true,
      // Bật debug để xem thông tin chi tiết
      logger: true
      // Ghi log chi tiết
    });
  } catch (error) {
    console.error("L\u1ED7i khi t\u1EA1o Gmail transporter:", error);
    return createTestTransporter();
  }
};
var createTestTransporter = () => {
  console.log("S\u1EED d\u1EE5ng transporter test (kh\xF4ng g\u1EEDi email th\u1EF1c t\u1EBF)");
  return {
    sendMail: async (mailOptions) => {
      console.log("=================== TEST EMAIL ===================");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("From:", mailOptions.from);
      console.log("Content type:", mailOptions.html ? "HTML" : "Text");
      console.log("================= END TEST EMAIL =================");
      return {
        messageId: `test-${Date.now()}@example.com`,
        response: "Test email success"
      };
    }
  };
};
var createTransporter = () => {
  if (process.env.GMAIL_APP_PASSWORD) {
    return createGmailTransporter();
  }
  console.log("Kh\xF4ng c\xF3 c\u1EA5u h\xECnh email h\u1EE3p l\u1EC7, s\u1EED d\u1EE5ng transporter test");
  return createTestTransporter();
};
var sendServiceConfirmation = async (toEmail, serviceDetails) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Mi Nhon Hotel Mui Ne</h2>
        <p style="text-align: center;">X\xE1c nh\u1EADn y\xEAu c\u1EA7u d\u1ECBch v\u1EE5 c\u1EE7a qu\xFD kh\xE1ch</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        ${serviceDetails.orderReference ? `<p><strong>Order Reference:</strong> ${serviceDetails.orderReference}</p>` : ""}
        <p><strong>Lo\u1EA1i d\u1ECBch v\u1EE5:</strong> ${serviceDetails.serviceType}</p>
        <p><strong>Ph\xF2ng:</strong> ${serviceDetails.roomNumber}</p>
        <p><strong>Th\u1EDDi gian y\xEAu c\u1EA7u:</strong> ${serviceDetails.timestamp.toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })}</p>
        <p><strong>Chi ti\u1EBFt:</strong></p>
        <p style="padding: 10px; background-color: #f9f9f9; border-radius: 5px;">${serviceDetails.details}</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #777; font-size: 14px;">
          C\u1EA3m \u01A1n qu\xFD kh\xE1ch \u0111\xE3 l\u1EF1a ch\u1ECDn Mi Nhon Hotel Mui Ne.<br>
          N\u1EBFu c\u1EA7n h\u1ED7 tr\u1EE3, vui l\xF2ng li\xEAn h\u1EC7 l\u1EC5 t\xE2n ho\u1EB7c g\u1ECDi s\u1ED1 n\u1ED9i b\u1ED9 0.
        </p>
      </div>
    `;
    console.log("G\u1EEDi email v\u1EDBi Gmail");
    const emailLog = {
      timestamp: /* @__PURE__ */ new Date(),
      toEmail,
      subject: `Mi Nhon Hotel - X\xE1c nh\u1EADn \u0111\u1EB7t d\u1ECBch v\u1EE5 t\u1EEB ph\xF2ng ${serviceDetails.roomNumber}`,
      status: "pending",
      details: serviceDetails
    };
    console.log("EMAIL LOG:", JSON.stringify(emailLog, null, 2));
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: '"Mi Nhon Hotel" <tuan.ctw@gmail.com>',
        to: toEmail,
        subject: `Mi Nhon Hotel - X\xE1c nh\u1EADn \u0111\u1EB7t d\u1ECBch v\u1EE5 t\u1EEB ph\xF2ng ${serviceDetails.roomNumber}`,
        html: emailHtml
      };
      const result = await transporter.sendMail(mailOptions);
      console.log("Email \u0111\xE3 g\u1EEDi th\xE0nh c\xF4ng:", result.response);
      emailLog.status = "sent";
      console.log("EMAIL LOG (c\u1EADp nh\u1EADt):", JSON.stringify(emailLog, null, 2));
      return { success: true, messageId: result.messageId };
    } catch (emailError) {
      console.error("L\u1ED7i khi g\u1EEDi email qua Gmail:", emailError);
      emailLog.status = "failed";
      console.log("EMAIL LOG (th\u1EA5t b\u1EA1i):", JSON.stringify(emailLog, null, 2));
      console.log("============ CHI TI\u1EBET L\u1ED6I G\u1EECI EMAIL ============");
      console.log("Th\u1EDDi gian:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("Ng\u01B0\u1EDDi nh\u1EADn:", toEmail);
      console.log("Ti\xEAu \u0111\u1EC1:", `Mi Nhon Hotel - X\xE1c nh\u1EADn \u0111\u1EB7t d\u1ECBch v\u1EE5 t\u1EEB ph\xF2ng ${serviceDetails.roomNumber}`);
      console.log("L\u1ED7i:", emailError instanceof Error ? emailError.message : String(emailError));
      console.log("===================================================");
      throw emailError;
    }
  } catch (error) {
    console.error("L\u1ED7i khi g\u1EEDi email:", error);
    return { success: false, error };
  }
};
var sendCallSummary = async (toEmail, callDetails) => {
  try {
    const serviceRequestsHtml = callDetails.serviceRequests.length ? callDetails.serviceRequests.map((req) => `<li>${req}</li>`).join("") : "<li>Kh\xF4ng c\xF3 y\xEAu c\u1EA7u c\u1EE5 th\u1EC3</li>";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
        <div style="background-color:#ebf8ff; border-radius:8px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          <h2 style="margin:0; color:#1e40af; text-align:center;">Mi Nhon Hotel Mui Ne</h2>
          <p style="margin:8px 0 16px; text-align:center; font-size:16px; color:#1e3a8a;">T\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi v\u1EDBi tr\u1EE3 l\xFD \u1EA3o</p>
          ${callDetails.orderReference ? `<p><strong>M\xE3 tham chi\u1EBFu:</strong> ${callDetails.orderReference}</p>` : ""}
          <p><strong>Ph\xF2ng:</strong> ${callDetails.roomNumber}</p>
          <p><strong>Th\u1EDDi gian:</strong> ${callDetails.timestamp.toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })}</p>
          <p><strong>Th\u1EDDi l\u01B0\u1EE3ng cu\u1ED9c g\u1ECDi:</strong> ${callDetails.duration}</p>

          <div style="background-color:#e0f2fe; border-radius:6px; padding:15px; margin:20px 0; line-height:1.5;">
            <h3 style="margin-top:0; color:#1e3a8a; font-size:18px;">Conversation Summary</h3>
            <p style="white-space:pre-wrap; color:#1e293b;">${callDetails.summary}</p>
          </div>

          <p style="text-align:center; color:#475569; font-size:14px;">
            C\u1EA3m \u01A1n qu\xFD kh\xE1ch \u0111\xE3 l\u1EF1a ch\u1ECDn Mi Nhon Hotel Mui Ne.<br>
            N\u1EBFu c\u1EA7n h\u1ED7 tr\u1EE3, vui l\xF2ng li\xEAn h\u1EC7 l\u1EC5 t\xE2n ho\u1EB7c g\u1ECDi s\u1ED1 n\u1ED9i b\u1ED9 0.
          </p>
        </div>
      </div>
    `;
    console.log("G\u1EEDi email t\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi qua Gmail");
    const emailLog = {
      timestamp: /* @__PURE__ */ new Date(),
      toEmail,
      subject: `Mi Nhon Hotel - T\xF3m t\u1EAFt y\xEAu c\u1EA7u t\u1EEB ph\xF2ng ${callDetails.roomNumber}`,
      status: "pending",
      details: {
        roomNumber: callDetails.roomNumber,
        orderReference: callDetails.orderReference,
        duration: callDetails.duration,
        serviceCount: callDetails.serviceRequests.length
      }
    };
    console.log("EMAIL LOG:", JSON.stringify(emailLog, null, 2));
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: '"Mi Nhon Hotel" <tuan.ctw@gmail.com>',
        to: toEmail,
        subject: `Mi Nhon Hotel - T\xF3m t\u1EAFt y\xEAu c\u1EA7u t\u1EEB ph\xF2ng ${callDetails.roomNumber}`,
        html: emailHtml,
        text: `T\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi t\u1EEB ph\xF2ng ${callDetails.roomNumber}:

${callDetails.summary}`
      };
      const result = await transporter.sendMail(mailOptions);
      console.log("Email t\xF3m t\u1EAFt \u0111\xE3 g\u1EEDi th\xE0nh c\xF4ng:", result.response);
      emailLog.status = "sent";
      console.log("EMAIL LOG (c\u1EADp nh\u1EADt):", JSON.stringify(emailLog, null, 2));
      return { success: true, messageId: result.messageId };
    } catch (emailError) {
      console.error("L\u1ED7i khi g\u1EEDi email t\xF3m t\u1EAFt qua Gmail:", emailError);
      emailLog.status = "failed";
      console.log("EMAIL LOG (th\u1EA5t b\u1EA1i):", JSON.stringify(emailLog, null, 2));
      console.log("============ TH\xD4NG TIN T\xD3M T\u1EAET CU\u1ED8C G\u1ECCI ============");
      console.log("Th\u1EDDi gian:", callDetails.timestamp.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }));
      console.log("Ph\xF2ng:", callDetails.roomNumber);
      console.log("Th\u1EDDi l\u01B0\u1EE3ng:", callDetails.duration);
      console.log("Order Reference:", callDetails.orderReference || "Kh\xF4ng c\xF3");
      console.log("T\xF3m t\u1EAFt n\u1ED9i dung:");
      console.log(callDetails.summary);
      console.log("===================================================");
      throw emailError;
    }
  } catch (error) {
    console.error("L\u1ED7i khi g\u1EEDi email t\xF3m t\u1EAFt:", error);
    return { success: false, error };
  }
};

// server/mobileMail.ts
import nodemailer2 from "nodemailer";
var createSimpleMobileTransporter = () => {
  console.log("S\u1EED d\u1EE5ng transporter \u0111\u01A1n gi\u1EA3n cho thi\u1EBFt b\u1ECB di \u0111\u1ED9ng");
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD kh\xF4ng \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh");
    return createFallbackTransporter();
  }
  try {
    return nodemailer2.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      // Sử dụng STARTTLS để tăng độ tin cậy
      auth: {
        user: "tuan.ctw@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        // Bỏ qua lỗi SSL
        ciphers: "SSLv3"
        // Sử dụng cipher cũ hơn để tương thích tốt hơn
      },
      connectionTimeout: 2e4,
      // 20 giây timeout
      debug: true,
      // In ra tất cả log
      disableFileAccess: true,
      // Tăng cường bảo mật
      disableUrlAccess: true
      // Tăng cường bảo mật
    });
  } catch (error) {
    console.error("L\u1ED7i khi t\u1EA1o mobile transporter:", error);
    return createFallbackTransporter();
  }
};
var createFallbackTransporter = () => {
  console.log("S\u1EED d\u1EE5ng transporter d\u1EF1 ph\xF2ng");
  return {
    sendMail: async (mailOptions) => {
      console.log("=========== MOBILE EMAIL TEST (FALLBACK) ===========");
      console.log("\u0110\u1EBFn:", mailOptions.to);
      console.log("Ti\xEAu \u0111\u1EC1:", mailOptions.subject);
      console.log("================================================");
      return {
        messageId: `fallback-${Date.now()}@example.com`,
        response: "Fallback email success"
      };
    }
  };
};
var sendMobileEmail = async (toEmail, subject, messageText) => {
  try {
    console.log("==== B\u1EAET \u0110\u1EA6U G\u1EECI EMAIL T\u1EEA THI\u1EBET B\u1ECA DI \u0110\u1ED8NG ====");
    console.log("Ng\u01B0\u1EDDi nh\u1EADn:", toEmail);
    console.log("Ti\xEAu \u0111\u1EC1:", subject);
    const transporter = createSimpleMobileTransporter();
    const mailOptions = {
      from: '"Mi Nhon Hotel" <tuan.ctw@gmail.com>',
      to: toEmail,
      subject,
      text: messageText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #4a5568;">${subject}</h2>
          <p style="color: #2d3748; line-height: 1.5;">
            ${messageText.replace(/\n/g, "<br>")}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #718096; font-size: 12px;">
            Email n\xE0y \u0111\u01B0\u1EE3c g\u1EEDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng - Mi Nhon Hotel
          </p>
        </div>
      `
    };
    console.log("Chu\u1EA9n b\u1ECB g\u1EEDi email, thi\u1EBFt l\u1EADp xong");
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log("EMAIL MOBILE \u0110\xC3 G\u1EECI TH\xC0NH C\xD4NG:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (sendError) {
      console.error("L\u1ED6I KHI G\u1EECI EMAIL MOBILE:", sendError.message);
      console.error("CHI TI\u1EBET L\u1ED6I:", JSON.stringify(sendError));
      return { success: false, error: sendError.message };
    }
  } catch (error) {
    console.error("L\u1ED7i ngo\u1EA1i l\u1EC7 khi g\u1EEDi email mobile:", error);
    return { success: false, error: error.message };
  } finally {
    console.log("==== K\u1EBET TH\xDAC QU\xC1 TR\xCCNH G\u1EECI EMAIL T\u1EEA THI\u1EBET B\u1ECA DI \u0110\u1ED8NG ====");
  }
};
var sendMobileCallSummary = async (toEmail, callDetails) => {
  try {
    console.log("==== B\u1EAET \u0110\u1EA6U G\u1EECI EMAIL T\xD3M T\u1EAET CU\u1ED8C G\u1ECCI T\u1EEA THI\u1EBET B\u1ECA DI \u0110\u1ED8NG ====");
    const serviceRequestsText = callDetails.serviceRequests.length ? callDetails.serviceRequests.join("\n- ") : "Kh\xF4ng c\xF3 y\xEAu c\u1EA7u c\u1EE5 th\u1EC3";
    const messageText = `
Mi Nhon Hotel Mui Ne - T\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi t\u1EEB ph\xF2ng ${callDetails.roomNumber}

${callDetails.orderReference ? `M\xE3 tham chi\u1EBFu: ${callDetails.orderReference}` : ""}
Th\u1EDDi gian: ${callDetails.timestamp.toLocaleString()}
Th\u1EDDi l\u01B0\u1EE3ng cu\u1ED9c g\u1ECDi: ${callDetails.duration}

T\xF3m t\u1EAFt n\u1ED9i dung:
${callDetails.summary}

C\xE1c d\u1ECBch v\u1EE5 \u0111\u01B0\u1EE3c y\xEAu c\u1EA7u:
- ${serviceRequestsText}

---
Email n\xE0y \u0111\u01B0\u1EE3c g\u1EEDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng.
C\u1EA3m \u01A1n qu\xFD kh\xE1ch \u0111\xE3 s\u1EED d\u1EE5ng d\u1ECBch v\u1EE5 c\u1EE7a Mi Nhon Hotel.
    `;
    return await sendMobileEmail(
      toEmail,
      `Mi Nhon Hotel - T\xF3m t\u1EAFt y\xEAu c\u1EA7u t\u1EEB ph\xF2ng ${callDetails.roomNumber}`,
      messageText
    );
  } catch (error) {
    console.error("L\u1ED7i khi g\u1EEDi email t\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng:", error);
    return { success: false, error: error.message };
  }
};

// server/routes.ts
import axios from "axios";

// server/models/Reference.ts
import { Schema, model } from "mongoose";
var referenceSchema = new Schema({
  type: {
    type: String,
    enum: ["image", "link", "document"],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  callId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
var Reference = model("Reference", referenceSchema);

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var FALLBACK_JWT_SECRET = "dev-secret-key-for-testing";
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    console.log("Verifying JWT with secret:", secret === FALLBACK_JWT_SECRET ? "FALLBACK_SECRET" : "ENV_SECRET");
    const payload = jwt.verify(token, secret);
    if (!payload.tenantId && payload.username) {
      payload.tenantId = getMiNhonTenantId();
      payload.role = payload.role || "staff";
      console.log(`\u26A0\uFE0F  Legacy token detected for ${payload.username}, assigning Mi Nhon tenant: ${payload.tenantId}`);
    }
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
function getMiNhonTenantId() {
  return process.env.MINHON_TENANT_ID || "minhon-default-tenant-id";
}

// server/routes.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";

// src/db/index.ts
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle2 } from "drizzle-orm/better-sqlite3";
import { Pool as Pool2 } from "pg";
import Database2 from "better-sqlite3";
var DATABASE_URL2 = process.env.DATABASE_URL;
var isProduction2 = process.env.NODE_ENV === "production";
var db2;
var pool2;
if (!DATABASE_URL2 && !isProduction2) {
  console.log("\u23F3 Using SQLite database for development");
  const sqlite = new Database2("./dev.db");
  db2 = sqliteDrizzle2(sqlite);
} else if (!DATABASE_URL2) {
  const DEFAULT_DB_URL = "postgres://postgres:postgres@localhost:5432/minhon";
  const dbUrl = DEFAULT_DB_URL;
  console.log("Database connection using URL:", dbUrl.replace(/:\/\/[^:]+:[^@]+@/, "://****:****@"));
  pool2 = new Pool2({
    connectionString: dbUrl
  });
  (async () => {
    try {
      const client = await pool2.connect();
      console.log("Database connection successful");
      client.release();
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  })();
  db2 = drizzle2(pool2);
} else {
  console.log("Database connection using URL:", DATABASE_URL2.replace(/:\/\/[^:]+:[^@]+@/, "://****:****@"));
  pool2 = new Pool2({
    connectionString: DATABASE_URL2
  });
  (async () => {
    try {
      const client = await pool2.connect();
      console.log("Database connection successful");
      client.release();
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  })();
  db2 = drizzle2(pool2);
}

// server/routes.ts
init_schema();
import { eq as eq6, and as and4 } from "drizzle-orm";
import { sql as sql6 } from "drizzle-orm";

// src/api/staff.ts
init_schema();
import { eq as eq2 } from "drizzle-orm";
var deleteAllRequests = async () => {
  return await db2.delete(request).returning();
};

// server/analytics.ts
init_schema();
import { count, sql as sql2 } from "drizzle-orm";
var isPostgres2 = process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("postgres");
async function getOverview() {
  try {
    const totalCallsResult = await db2.select({ count: count() }).from(call);
    const totalCalls = totalCallsResult[0]?.count || 0;
    const avgDurationResult = await db2.select({
      avg: sql2`AVG(${call.duration})`.as("avg")
    }).from(call).where(sql2`${call.duration} IS NOT NULL`);
    const averageCallDuration = Math.round(Number(avgDurationResult[0]?.avg) || 0);
    const languageResult = await db2.select({
      language: call.language,
      count: count()
    }).from(call).groupBy(call.language);
    const languageDistribution = languageResult.map((row) => ({
      language: row.language || "unknown",
      count: row.count
    }));
    return {
      totalCalls,
      averageCallDuration,
      languageDistribution
    };
  } catch (error) {
    console.error("Error in getOverview:", error);
    return {
      totalCalls: 0,
      averageCallDuration: 0,
      languageDistribution: []
    };
  }
}
async function getServiceDistribution() {
  try {
    const result = await db2.select({
      serviceType: call.serviceType,
      count: count()
    }).from(call).where(sql2`${call.serviceType} IS NOT NULL`).groupBy(call.serviceType);
    return result.map((row) => ({
      serviceType: row.serviceType || "unknown",
      count: row.count
    }));
  } catch (error) {
    console.error("Error in getServiceDistribution:", error);
    return [];
  }
}
async function getHourlyActivity() {
  try {
    if (isPostgres2) {
      const result = await db2.select({
        hour: sql2`EXTRACT(HOUR FROM ${call.createdAt})`.as("hour"),
        count: count()
      }).from(call).groupBy(sql2`EXTRACT(HOUR FROM ${call.createdAt})`);
      return result.map((row) => ({
        hour: row.hour,
        count: row.count
      }));
    } else {
      const result = await db2.select({
        hour: sql2`CAST(strftime('%H', datetime(${call.createdAt}, 'unixepoch')) AS INTEGER)`.as("hour"),
        count: count()
      }).from(call).groupBy(sql2`strftime('%H', datetime(${call.createdAt}, 'unixepoch'))`);
      return result.map((row) => ({
        hour: row.hour,
        count: row.count
      }));
    }
  } catch (error) {
    console.error("Error in getHourlyActivity:", error);
    return [];
  }
}

// server/seed.ts
init_schema();
async function seedDevelopmentData() {
  try {
    const existingCalls = await db2.select().from(call).limit(1);
    if (existingCalls.length > 0) {
      console.log("Development data already exists, skipping seed...");
      return;
    }
    console.log("Seeding development data...");
    const callData = [
      {
        callIdVapi: "test-call-001",
        roomNumber: "101",
        language: "vi",
        serviceType: "room_service",
        duration: 120,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3)
        // 2 hours ago
      },
      {
        callIdVapi: "test-call-002",
        roomNumber: "202",
        language: "en",
        serviceType: "housekeeping",
        duration: 90,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3)
        // 4 hours ago
      },
      {
        callIdVapi: "test-call-003",
        roomNumber: "303",
        language: "fr",
        serviceType: "transportation",
        duration: 150,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1e3)
        // 6 hours ago
      },
      {
        callIdVapi: "test-call-004",
        roomNumber: "404",
        language: "vi",
        serviceType: "concierge",
        duration: 75,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1e3)
        // 8 hours ago
      },
      {
        callIdVapi: "test-call-005",
        roomNumber: "505",
        language: "en",
        serviceType: "maintenance",
        duration: 45,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1e3)
        // 10 hours ago
      }
    ];
    for (const callItem of callData) {
      await db2.insert(call).values(callItem);
    }
    const requestData = [
      {
        roomNumber: "101",
        orderId: "ORD-001",
        requestContent: "Y\xEAu c\u1EA7u d\u1ECDn ph\xF2ng l\xFAc 2:00 PM",
        status: "\u0110\xE3 ghi nh\u1EADn",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1e3)
        // 1 hour ago
      },
      {
        roomNumber: "202",
        orderId: "ORD-002",
        requestContent: "C\u1EA7n th\xEAm kh\u0103n t\u1EAFm",
        status: "\u0110ang th\u1EF1c hi\u1EC7n",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3)
        // 2 hours ago
      },
      {
        roomNumber: "303",
        orderId: "ORD-003",
        requestContent: "Y\xEAu c\u1EA7u taxi \u0111\u1EBFn s\xE2n bay l\xFAc 6:00 AM",
        status: "Ho\xE0n thi\u1EC7n",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1e3)
        // 3 hours ago
      },
      {
        roomNumber: "404",
        orderId: "ORD-004",
        requestContent: "Th\xF4ng tin v\u1EC1 tour \u0111\u1ECBa ph\u01B0\u01A1ng",
        status: "\u0110\xE3 ghi nh\u1EADn",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3)
        // 4 hours ago
      },
      {
        roomNumber: "505",
        orderId: "ORD-005",
        requestContent: "S\u1EEDa ch\u1EEFa \u0111i\u1EC1u h\xF2a kh\xF4ng ho\u1EA1t \u0111\u1ED9ng",
        status: "\u0110ang th\u1EF1c hi\u1EC7n",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1e3)
        // 5 hours ago
      },
      {
        roomNumber: "606",
        orderId: "ORD-006",
        requestContent: "\u0110\u1EB7t b\xE0n nh\xE0 h\xE0ng cho 4 ng\u01B0\u1EDDi l\xFAc 7:00 PM",
        status: "Ho\xE0n thi\u1EC7n",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1e3)
        // 6 hours ago
      },
      {
        roomNumber: "707",
        orderId: "ORD-007",
        requestContent: "Y\xEAu c\u1EA7u d\u1ECBch v\u1EE5 gi\u1EB7t \u1EE7i",
        status: "\u0110\xE3 ghi nh\u1EADn",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1e3)
        // 7 hours ago
      }
    ];
    for (const requestItem of requestData) {
      await db2.insert(request).values(requestItem);
    }
    console.log("Development data seeded successfully!");
  } catch (error) {
    console.error("Error seeding development data:", error);
  }
}

// server/routes/dashboard.ts
import express from "express";
import { z as z4 } from "zod";

// server/services/tenantService.ts
import { eq as eq4, and as and2, sql as sql3 } from "drizzle-orm";
init_schema2();
var TenantService = class {
  // ============================================
  // Tenant Creation & Management
  // ============================================
  /**
   * Create a new tenant with default settings
   */
  async createTenant(config2) {
    try {
      console.log(`\u{1F3E8} Creating new tenant: ${config2.hotelName}`);
      await this.validateSubdomain(config2.subdomain);
      const featureFlags = this.getDefaultFeatureFlags(config2.subscriptionPlan);
      const subscriptionLimits = this.getSubscriptionLimits(config2.subscriptionPlan);
      const [tenant] = await db.insert(tenants).values({
        hotelName: config2.hotelName,
        subdomain: config2.subdomain,
        customDomain: config2.customDomain,
        subscriptionPlan: config2.subscriptionPlan,
        subscriptionStatus: config2.subscriptionStatus,
        trialEndsAt: config2.trialEndsAt || this.getTrialEndDate(),
        maxVoices: subscriptionLimits.maxVoices,
        maxLanguages: subscriptionLimits.maxLanguages,
        voiceCloning: featureFlags.voiceCloning,
        multiLocation: featureFlags.multiLocation,
        whiteLabel: featureFlags.whiteLabel,
        dataRetentionDays: subscriptionLimits.dataRetentionDays,
        monthlyCallLimit: subscriptionLimits.monthlyCallLimit
      }).returning();
      await db.insert(hotelProfiles).values({
        tenantId: tenant.id,
        researchData: null,
        assistantConfig: null,
        vapiAssistantId: null,
        servicesConfig: null,
        knowledgeBase: null,
        systemPrompt: null
      });
      console.log(`\u2705 Tenant created successfully: ${tenant.id}`);
      return tenant.id;
    } catch (error) {
      console.error(`Failed to create tenant ${config2.hotelName}:`, error);
      throw new TenantError(
        `Failed to create tenant: ${error.message}`,
        "TENANT_CREATION_FAILED",
        500
      );
    }
  }
  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId) {
    try {
      const [tenant] = await db.select().from(tenants).where(eq4(tenants.id, tenantId)).limit(1);
      if (!tenant) {
        throw new TenantError("Tenant not found", "TENANT_NOT_FOUND", 404);
      }
      return tenant;
    } catch (error) {
      if (error instanceof TenantError) throw error;
      throw new TenantError(
        `Failed to get tenant: ${error.message}`,
        "TENANT_FETCH_FAILED",
        500
      );
    }
  }
  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain) {
    try {
      const [tenant] = await db.select().from(tenants).where(eq4(tenants.subdomain, subdomain)).limit(1);
      if (!tenant) {
        throw new TenantError("Tenant not found", "TENANT_NOT_FOUND", 404);
      }
      return tenant;
    } catch (error) {
      if (error instanceof TenantError) throw error;
      throw new TenantError(
        `Failed to get tenant: ${error.message}`,
        "TENANT_FETCH_FAILED",
        500
      );
    }
  }
  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId, updates) {
    try {
      console.log(`\u{1F504} Updating tenant: ${tenantId}`);
      const updateData = {};
      if (updates.hotelName) updateData.hotelName = updates.hotelName;
      if (updates.customDomain) updateData.customDomain = updates.customDomain;
      if (updates.subscriptionPlan) {
        updateData.subscriptionPlan = updates.subscriptionPlan;
        const featureFlags = this.getDefaultFeatureFlags(updates.subscriptionPlan);
        const limits = this.getSubscriptionLimits(updates.subscriptionPlan);
        Object.assign(updateData, featureFlags, limits);
      }
      if (updates.subscriptionStatus) updateData.subscriptionStatus = updates.subscriptionStatus;
      if (updates.trialEndsAt) updateData.trialEndsAt = updates.trialEndsAt;
      await db.update(tenants).set(updateData).where(eq4(tenants.id, tenantId));
      console.log(`\u2705 Tenant updated successfully: ${tenantId}`);
    } catch (error) {
      console.error(`Failed to update tenant ${tenantId}:`, error);
      throw new TenantError(
        `Failed to update tenant: ${error.message}`,
        "TENANT_UPDATE_FAILED",
        500
      );
    }
  }
  /**
   * Delete tenant and all associated data
   */
  async deleteTenant(tenantId) {
    try {
      console.log(`\u{1F5D1}\uFE0F Deleting tenant: ${tenantId}`);
      await db.delete(message).where(eq4(message.tenantId, tenantId));
      await db.delete(transcript).where(eq4(transcript.tenantId, tenantId));
      await db.delete(request).where(eq4(request.tenantId, tenantId));
      await db.delete(call).where(eq4(call.tenantId, tenantId));
      await db.delete(staff).where(eq4(staff.tenantId, tenantId));
      await db.delete(hotelProfiles).where(eq4(hotelProfiles.tenantId, tenantId));
      await db.delete(tenants).where(eq4(tenants.id, tenantId));
      console.log(`\u2705 Tenant deleted successfully: ${tenantId}`);
    } catch (error) {
      console.error(`Failed to delete tenant ${tenantId}:`, error);
      throw new TenantError(
        `Failed to delete tenant: ${error.message}`,
        "TENANT_DELETE_FAILED",
        500
      );
    }
  }
  // ============================================
  // Feature Flag Management
  // ============================================
  /**
   * Check if tenant has access to a specific feature
   */
  async hasFeatureAccess(tenantId, feature) {
    try {
      const tenant = await this.getTenantById(tenantId);
      const featureFlags = this.getCurrentFeatureFlags(tenant);
      return featureFlags[feature] || false;
    } catch (error) {
      console.error(`Failed to check feature access for ${tenantId}:`, error);
      return false;
    }
  }
  /**
   * Get current feature flags for tenant
   */
  getCurrentFeatureFlags(tenant) {
    const plan = tenant.subscriptionPlan;
    const baseFlags = this.getDefaultFeatureFlags(plan);
    return {
      ...baseFlags,
      voiceCloning: tenant.voiceCloning || baseFlags.voiceCloning,
      multiLocation: tenant.multiLocation || baseFlags.multiLocation,
      whiteLabel: tenant.whiteLabel || baseFlags.whiteLabel
    };
  }
  /**
   * Get default feature flags for subscription plan
   */
  getDefaultFeatureFlags(plan) {
    switch (plan) {
      case "trial":
        return {
          voiceCloning: false,
          multiLocation: false,
          whiteLabel: false,
          advancedAnalytics: false,
          customIntegrations: false,
          prioritySupport: false,
          apiAccess: false,
          bulkOperations: false
        };
      case "basic":
        return {
          voiceCloning: false,
          multiLocation: false,
          whiteLabel: false,
          advancedAnalytics: true,
          customIntegrations: false,
          prioritySupport: false,
          apiAccess: true,
          bulkOperations: false
        };
      case "premium":
        return {
          voiceCloning: true,
          multiLocation: true,
          whiteLabel: false,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          apiAccess: true,
          bulkOperations: true
        };
      case "enterprise":
        return {
          voiceCloning: true,
          multiLocation: true,
          whiteLabel: true,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          apiAccess: true,
          bulkOperations: true
        };
      default:
        return this.getDefaultFeatureFlags("trial");
    }
  }
  // ============================================
  // Subscription Plan Management
  // ============================================
  /**
   * Get subscription limits for plan
   */
  getSubscriptionLimits(plan) {
    switch (plan) {
      case "trial":
        return {
          maxVoices: 2,
          maxLanguages: 2,
          monthlyCallLimit: 100,
          dataRetentionDays: 30,
          maxStaffUsers: 2,
          maxHotelLocations: 1
        };
      case "basic":
        return {
          maxVoices: 5,
          maxLanguages: 4,
          monthlyCallLimit: 1e3,
          dataRetentionDays: 90,
          maxStaffUsers: 5,
          maxHotelLocations: 1
        };
      case "premium":
        return {
          maxVoices: 15,
          maxLanguages: 8,
          monthlyCallLimit: 5e3,
          dataRetentionDays: 365,
          maxStaffUsers: 15,
          maxHotelLocations: 5
        };
      case "enterprise":
        return {
          maxVoices: -1,
          // Unlimited
          maxLanguages: -1,
          // Unlimited
          monthlyCallLimit: -1,
          // Unlimited
          dataRetentionDays: -1,
          // Unlimited
          maxStaffUsers: -1,
          // Unlimited
          maxHotelLocations: -1
          // Unlimited
        };
      default:
        return this.getSubscriptionLimits("trial");
    }
  }
  /**
   * Check if tenant is within subscription limits
   */
  async checkSubscriptionLimits(tenantId) {
    try {
      const tenant = await this.getTenantById(tenantId);
      const limits = this.getSubscriptionLimits(tenant.subscriptionPlan);
      const usage = await this.getTenantUsage(tenantId);
      const violations = [];
      if (limits.monthlyCallLimit > 0 && usage.callsThisMonth >= limits.monthlyCallLimit) {
        violations.push("Monthly call limit exceeded");
      }
      if (limits.maxVoices > 0 && usage.voicesUsed >= limits.maxVoices) {
        violations.push("Voice limit exceeded");
      }
      if (limits.maxLanguages > 0 && usage.languagesUsed >= limits.maxLanguages) {
        violations.push("Language limit exceeded");
      }
      return {
        withinLimits: violations.length === 0,
        violations
      };
    } catch (error) {
      console.error(`Failed to check subscription limits for ${tenantId}:`, error);
      return { withinLimits: false, violations: ["Unable to check limits"] };
    }
  }
  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId) {
    try {
      const now = /* @__PURE__ */ new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const [callsResult] = await db.select({ count: sql3`count(*)` }).from(call).where(
        and2(
          eq4(call.tenantId, tenantId),
          sql3`${call.createdAt} >= ${startOfMonth}`
        )
      );
      const languagesResult = await db.selectDistinct({ language: call.language }).from(call).where(eq4(call.tenantId, tenantId));
      const [storageResult] = await db.select({
        transcripts: sql3`count(*)`,
        avgLength: sql3`avg(length(${transcript.content}))`
      }).from(transcript).where(eq4(transcript.tenantId, tenantId));
      return {
        callsThisMonth: callsResult?.count || 0,
        voicesUsed: 1,
        // TODO: Implement voice tracking
        languagesUsed: languagesResult.filter((l) => l.language).length,
        storageUsed: Math.round((storageResult?.transcripts || 0) * (storageResult?.avgLength || 0) / 1024),
        // KB
        dataRetentionDays: 90
        // TODO: Get from tenant settings
      };
    } catch (error) {
      console.error(`Failed to get tenant usage for ${tenantId}:`, error);
      return {
        callsThisMonth: 0,
        voicesUsed: 0,
        languagesUsed: 0,
        storageUsed: 0,
        dataRetentionDays: 90
      };
    }
  }
  // ============================================
  // Data Isolation Utilities
  // ============================================
  /**
   * Get tenant-scoped query filter
   */
  getTenantFilter(tenantId) {
    return eq4(sql3`tenant_id`, tenantId);
  }
  /**
   * Clean up old data based on retention policy
   */
  async cleanupOldData(tenantId) {
    try {
      const tenant = await this.getTenantById(tenantId);
      const retentionDays = tenant.dataRetentionDays || 90;
      if (retentionDays <= 0) return;
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      console.log(`\u{1F9F9} Cleaning up data older than ${retentionDays} days for tenant ${tenantId}`);
      await db.delete(transcript).where(
        and2(
          eq4(transcript.tenantId, tenantId),
          sql3`${transcript.timestamp} < ${cutoffDate}`
        )
      );
      await db.delete(call).where(
        and2(
          eq4(call.tenantId, tenantId),
          sql3`${call.createdAt} < ${cutoffDate}`
        )
      );
      console.log(`\u2705 Data cleanup completed for tenant ${tenantId}`);
    } catch (error) {
      console.error(`Failed to cleanup data for tenant ${tenantId}:`, error);
      throw new TenantError(
        `Failed to cleanup data: ${error.message}`,
        "DATA_CLEANUP_FAILED",
        500
      );
    }
  }
  // ============================================
  // Utility Methods
  // ============================================
  /**
   * Validate subdomain availability
   */
  async validateSubdomain(subdomain) {
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      throw new TenantError(
        "Subdomain must contain only lowercase letters, numbers, and hyphens",
        "INVALID_SUBDOMAIN_FORMAT",
        400
      );
    }
    const [existing] = await db.select().from(tenants).where(eq4(tenants.subdomain, subdomain)).limit(1);
    if (existing) {
      throw new TenantError(
        "Subdomain already exists",
        "SUBDOMAIN_TAKEN",
        409
      );
    }
  }
  /**
   * Get trial end date (30 days from now)
   */
  getTrialEndDate() {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
  /**
   * Check if tenant subscription is active
   */
  isSubscriptionActive(tenant) {
    if (tenant.subscriptionStatus !== "active") return false;
    if (tenant.subscriptionPlan === "trial" && tenant.trialEndsAt) {
      return /* @__PURE__ */ new Date() < new Date(tenant.trialEndsAt);
    }
    return true;
  }
  /**
   * Get tenant service health status
   */
  async getServiceHealth() {
    try {
      const [tenantsResult] = await db.select({ count: sql3`count(*)` }).from(tenants);
      const [activeResult] = await db.select({ count: sql3`count(*)` }).from(tenants).where(eq4(tenants.subscriptionStatus, "active"));
      return {
        status: "healthy",
        tenantsCount: tenantsResult?.count || 0,
        activeSubscriptions: activeResult?.count || 0
      };
    } catch (error) {
      console.error("Failed to get service health:", error);
      return {
        status: "unhealthy",
        tenantsCount: 0,
        activeSubscriptions: 0
      };
    }
  }
};
var TenantError = class extends Error {
  constructor(message2, code, statusCode) {
    super(message2);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "TenantError";
  }
};

// server/middleware/tenant.ts
var TenantMiddleware = class {
  tenantService;
  constructor() {
    this.tenantService = new TenantService();
  }
  /**
   * Extract tenant information from JWT token
   * Requires auth middleware to run first
   */
  tenantIdentification = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          error: "Tenant ID not found in token",
          code: "TENANT_ID_MISSING"
        });
      }
      const tenant = await this.tenantService.getTenantById(tenantId);
      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND"
        });
      }
      if (!this.tenantService.isSubscriptionActive(tenant)) {
        return res.status(403).json({
          error: "Subscription inactive or expired",
          code: "SUBSCRIPTION_INACTIVE",
          subscriptionStatus: tenant.subscriptionStatus,
          subscriptionPlan: tenant.subscriptionPlan
        });
      }
      req.tenant = tenant;
      req.tenantId = tenantId;
      console.log(`\u{1F3E8} Tenant identified: ${tenant.hotelName} (${tenant.subdomain})`);
      next();
    } catch (error) {
      console.error("Tenant identification failed:", error);
      if (error instanceof TenantError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code
        });
      }
      return res.status(500).json({
        error: "Tenant identification failed",
        code: "TENANT_IDENTIFICATION_FAILED"
      });
    }
  };
  /**
   * Identify tenant from subdomain (for public routes)
   */
  tenantFromSubdomain = async (req, res, next) => {
    try {
      const host = req.get("host") || "";
      const subdomain = this.extractSubdomain(host);
      if (!subdomain) {
        return res.status(400).json({
          error: "Subdomain not found",
          code: "SUBDOMAIN_MISSING"
        });
      }
      const tenant = await this.tenantService.getTenantBySubdomain(subdomain);
      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND"
        });
      }
      if (!this.tenantService.isSubscriptionActive(tenant)) {
        return res.status(403).json({
          error: "Service unavailable - subscription inactive",
          code: "SUBSCRIPTION_INACTIVE"
        });
      }
      req.tenant = tenant;
      req.tenantId = tenant.id;
      console.log(`\u{1F310} Tenant identified from subdomain: ${tenant.hotelName} (${subdomain})`);
      next();
    } catch (error) {
      console.error("Tenant identification from subdomain failed:", error);
      if (error instanceof TenantError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code
        });
      }
      return res.status(500).json({
        error: "Tenant identification failed",
        code: "TENANT_IDENTIFICATION_FAILED"
      });
    }
  };
  /**
   * Enforce row-level security for database operations
   */
  rowLevelSecurity = (req, res, next) => {
    try {
      if (!req.tenantId) {
        return res.status(400).json({
          error: "Tenant not identified",
          code: "TENANT_NOT_IDENTIFIED"
        });
      }
      req.tenantFilter = this.tenantService.getTenantFilter(req.tenantId);
      console.log(`\u{1F512} Row-level security enabled for tenant: ${req.tenantId}`);
      next();
    } catch (error) {
      console.error("Row-level security enforcement failed:", error);
      return res.status(500).json({
        error: "Security enforcement failed",
        code: "SECURITY_ENFORCEMENT_FAILED"
      });
    }
  };
  /**
   * Check if tenant has access to specific feature
   */
  requireFeature = (feature) => {
    return async (req, res, next) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: "Tenant not identified",
            code: "TENANT_NOT_IDENTIFIED"
          });
        }
        const hasAccess = await this.tenantService.hasFeatureAccess(req.tenant.id, feature);
        if (!hasAccess) {
          return res.status(403).json({
            error: `Feature '${feature}' not available in your plan`,
            code: "FEATURE_NOT_AVAILABLE",
            feature,
            currentPlan: req.tenant.subscriptionPlan,
            upgradeRequired: true
          });
        }
        console.log(`\u2705 Feature access granted: ${feature} for tenant ${req.tenant.hotelName}`);
        next();
      } catch (error) {
        console.error(`Feature access check failed for ${feature}:`, error);
        return res.status(500).json({
          error: "Feature access check failed",
          code: "FEATURE_ACCESS_CHECK_FAILED"
        });
      }
    };
  };
  /**
   * Check subscription limits before processing
   */
  checkSubscriptionLimits = async (req, res, next) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({
          error: "Tenant not identified",
          code: "TENANT_NOT_IDENTIFIED"
        });
      }
      const limitsCheck = await this.tenantService.checkSubscriptionLimits(req.tenant.id);
      if (!limitsCheck.withinLimits) {
        return res.status(429).json({
          error: "Subscription limits exceeded",
          code: "SUBSCRIPTION_LIMITS_EXCEEDED",
          violations: limitsCheck.violations,
          currentPlan: req.tenant.subscriptionPlan,
          upgradeRequired: true
        });
      }
      console.log(`\u{1F4CA} Subscription limits check passed for tenant ${req.tenant.hotelName}`);
      next();
    } catch (error) {
      console.error("Subscription limits check failed:", error);
      return res.status(500).json({
        error: "Subscription limits check failed",
        code: "LIMITS_CHECK_FAILED"
      });
    }
  };
  /**
   * Validate tenant ownership of resource
   */
  validateTenantOwnership = (resourceTenantIdField = "tenantId") => {
    return (req, res, next) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: "Tenant not identified",
            code: "TENANT_NOT_IDENTIFIED"
          });
        }
        req.resourceTenantIdField = resourceTenantIdField;
        req.validateOwnership = true;
        console.log(`\u{1F511} Tenant ownership validation enabled for ${req.tenant.hotelName}`);
        next();
      } catch (error) {
        console.error("Tenant ownership validation setup failed:", error);
        return res.status(500).json({
          error: "Ownership validation setup failed",
          code: "OWNERSHIP_VALIDATION_FAILED"
        });
      }
    };
  };
  /**
   * Rate limiting per tenant
   */
  tenantRateLimit = (requestsPerMinute = 60) => {
    const tenantRequestCounts = /* @__PURE__ */ new Map();
    return (req, res, next) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: "Tenant not identified",
            code: "TENANT_NOT_IDENTIFIED"
          });
        }
        const tenantId = req.tenant.id;
        const now = Date.now();
        const windowStart = Math.floor(now / 6e4) * 6e4;
        const tenantData = tenantRequestCounts.get(tenantId);
        if (!tenantData || tenantData.resetTime !== windowStart) {
          tenantRequestCounts.set(tenantId, { count: 1, resetTime: windowStart });
        } else {
          tenantData.count++;
          if (tenantData.count > requestsPerMinute) {
            return res.status(429).json({
              error: "Rate limit exceeded",
              code: "RATE_LIMIT_EXCEEDED",
              limit: requestsPerMinute,
              resetTime: windowStart + 6e4
            });
          }
        }
        res.set({
          "X-RateLimit-Limit": requestsPerMinute.toString(),
          "X-RateLimit-Remaining": Math.max(0, requestsPerMinute - (tenantData?.count || 1)).toString(),
          "X-RateLimit-Reset": (windowStart + 6e4).toString()
        });
        next();
      } catch (error) {
        console.error("Tenant rate limiting failed:", error);
        return res.status(500).json({
          error: "Rate limiting failed",
          code: "RATE_LIMITING_FAILED"
        });
      }
    };
  };
  // ============================================
  // Utility Methods
  // ============================================
  /**
   * Extract subdomain from host header
   */
  extractSubdomain(host) {
    const cleanHost = host.split(":")[0];
    if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
      return "minhon";
    }
    const parts = cleanHost.split(".");
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }
  /**
   * Get tenant context for database operations
   */
  getTenantContext(req) {
    if (!req.tenantId) return null;
    return {
      tenantId: req.tenantId,
      tenantFilter: this.tenantService.getTenantFilter(req.tenantId)
    };
  }
};
var tenantMiddleware = new TenantMiddleware();
var identifyTenant = tenantMiddleware.tenantIdentification;
var identifyTenantFromSubdomain = tenantMiddleware.tenantFromSubdomain;
var enforceRowLevelSecurity = tenantMiddleware.rowLevelSecurity;
var requireFeature = tenantMiddleware.requireFeature;
var checkLimits = tenantMiddleware.checkSubscriptionLimits;
var validateOwnership = tenantMiddleware.validateTenantOwnership;
var tenantRateLimit = tenantMiddleware.tenantRateLimit;
var publicTenantMiddleware = [
  identifyTenantFromSubdomain,
  enforceRowLevelSecurity,
  tenantRateLimit()
];
var adminTenantMiddleware = [
  identifyTenant,
  enforceRowLevelSecurity,
  requireFeature("apiAccess")
];

// server/services/hotelResearch.ts
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { z as z2 } from "zod";
var HotelResearchError = class extends Error {
  constructor(message2, code, statusCode) {
    super(message2);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "HotelResearchError";
  }
};
var RateLimiter = class {
  limits = /* @__PURE__ */ new Map();
  maxRequests;
  windowMs;
  constructor(maxRequests = 100, windowMs = 36e5) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  canMakeRequest(key) {
    const now = Date.now();
    const limit = this.limits.get(key);
    if (!limit) {
      this.limits.set(key, { requests: 1, resetTime: now + this.windowMs });
      return true;
    }
    if (now > limit.resetTime) {
      this.limits.set(key, { requests: 1, resetTime: now + this.windowMs });
      return true;
    }
    if (limit.requests >= this.maxRequests) {
      return false;
    }
    limit.requests++;
    return true;
  }
};
var HotelResearchService = class {
  googlePlacesApiKey;
  rateLimiter;
  baseUrl = "https://maps.googleapis.com/maps/api/place";
  constructor() {
    this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || "";
    this.rateLimiter = new RateLimiter();
    if (!this.googlePlacesApiKey) {
      console.warn("Google Places API key not found. Hotel research will be limited.");
    }
  }
  // ============================================
  // Public Methods
  // ============================================
  /**
   * Basic tier research using free/cheap APIs
   */
  async basicResearch(hotelName, location) {
    if (!this.rateLimiter.canMakeRequest("basic_research")) {
      throw new HotelResearchError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429);
    }
    try {
      console.log(`\u{1F50D} Starting basic research for: ${hotelName}`);
      const googlePlacesData = await this.getGooglePlacesData(hotelName, location);
      let websiteData = {};
      if (googlePlacesData.website) {
        try {
          websiteData = await this.scrapeOfficialWebsite(googlePlacesData.website);
        } catch (error) {
          console.warn("Website scraping failed:", error);
        }
      }
      const hotelData = {
        name: googlePlacesData.name || hotelName,
        address: googlePlacesData.formatted_address || location || "",
        phone: googlePlacesData.formatted_phone_number,
        website: googlePlacesData.website,
        rating: googlePlacesData.rating,
        priceLevel: googlePlacesData.price_level,
        location: {
          lat: googlePlacesData.geometry?.location?.lat || 0,
          lng: googlePlacesData.geometry?.location?.lng || 0
        },
        categories: googlePlacesData.types || [],
        openingHours: googlePlacesData.opening_hours?.weekday_text || [],
        photos: this.extractPhotoUrls(googlePlacesData.photos || []),
        services: this.extractServices(websiteData),
        amenities: this.extractAmenities(websiteData, googlePlacesData),
        policies: this.extractPolicies(websiteData),
        roomTypes: this.extractRoomTypes(websiteData),
        localAttractions: await this.getNearbyAttractions(googlePlacesData.geometry?.location)
      };
      console.log(`\u2705 Basic research completed for: ${hotelName}`);
      return hotelData;
    } catch (error) {
      console.error("Basic research failed:", error);
      throw new HotelResearchError(
        `Failed to research hotel: ${error.message}`,
        "RESEARCH_FAILED",
        500
      );
    }
  }
  /**
   * Advanced tier research using paid APIs (for premium plans)
   */
  async advancedResearch(hotelName, location) {
    if (!this.rateLimiter.canMakeRequest("advanced_research")) {
      throw new HotelResearchError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429);
    }
    try {
      console.log(`\u{1F50D} Starting advanced research for: ${hotelName}`);
      const basicData = await this.basicResearch(hotelName, location);
      const [socialMediaData, reviewData, competitorData] = await Promise.allSettled([
        this.getSocialMediaData(hotelName),
        this.getReviewData(hotelName),
        this.getCompetitorAnalysis(hotelName, basicData.location)
      ]);
      const advancedData = {
        ...basicData,
        socialMediaData: socialMediaData.status === "fulfilled" ? socialMediaData.value : {},
        reviewData: reviewData.status === "fulfilled" ? reviewData.value : {},
        competitorData: competitorData.status === "fulfilled" ? competitorData.value : {}
      };
      console.log(`\u2705 Advanced research completed for: ${hotelName}`);
      return advancedData;
    } catch (error) {
      console.error("Advanced research failed:", error);
      throw new HotelResearchError(
        `Failed to perform advanced research: ${error.message}`,
        "ADVANCED_RESEARCH_FAILED",
        500
      );
    }
  }
  // ============================================
  // Private Methods - Google Places Integration
  // ============================================
  async getGooglePlacesData(hotelName, location) {
    if (!this.googlePlacesApiKey) {
      throw new HotelResearchError("Google Places API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      const query = location ? `${hotelName} ${location}` : hotelName;
      const searchUrl = `${this.baseUrl}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${this.googlePlacesApiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      if (!searchData.candidates || searchData.candidates.length === 0) {
        throw new HotelResearchError("Hotel not found in Google Places", "HOTEL_NOT_FOUND", 404);
      }
      const placeId = searchData.candidates[0].place_id;
      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,price_level,opening_hours,photos,types,geometry&key=${this.googlePlacesApiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      if (detailsData.status !== "OK") {
        throw new HotelResearchError(`Google Places API error: ${detailsData.status}`, "API_ERROR", 500);
      }
      return detailsData.result;
    } catch (error) {
      if (error instanceof HotelResearchError) {
        throw error;
      }
      throw new HotelResearchError(`Google Places API request failed: ${error.message}`, "API_REQUEST_FAILED", 500);
    }
  }
  extractPhotoUrls(photos) {
    if (!photos || photos.length === 0) return [];
    return photos.slice(0, 10).map(
      (photo) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.googlePlacesApiKey}`
    );
  }
  async getNearbyAttractions(location) {
    if (!location || !this.googlePlacesApiKey) return [];
    try {
      const radius = 5e3;
      const nearbyUrl = `${this.baseUrl}/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=tourist_attraction&key=${this.googlePlacesApiKey}`;
      const response = await fetch(nearbyUrl);
      const data = await response.json();
      if (data.status !== "OK") return [];
      return data.results.slice(0, 10).map((place) => ({
        name: place.name,
        description: place.types.join(", "),
        distance: this.calculateDistance(location, place.geometry.location),
        category: this.categorizeAttraction(place.types),
        rating: place.rating
      }));
    } catch (error) {
      console.warn("Failed to get nearby attractions:", error);
      return [];
    }
  }
  // ============================================
  // Private Methods - Website Scraping
  // ============================================
  async scrapeOfficialWebsite(websiteUrl) {
    try {
      console.log(`\u{1F577}\uFE0F Scraping website: ${websiteUrl}`);
      const response = await fetch(websiteUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 1e4
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      const scrapedData = {
        title: $("title").text().trim(),
        description: $('meta[name="description"]').attr("content") || "",
        keywords: $('meta[name="keywords"]').attr("content") || "",
        services: this.extractServicesFromHTML($),
        amenities: this.extractAmenitiesFromHTML($),
        policies: this.extractPoliciesFromHTML($),
        roomTypes: this.extractRoomTypesFromHTML($),
        contact: this.extractContactInfo($)
      };
      console.log(`\u2705 Website scraping completed for: ${websiteUrl}`);
      return scrapedData;
    } catch (error) {
      console.warn(`Website scraping failed for ${websiteUrl}:`, error);
      return {};
    }
  }
  extractServicesFromHTML($) {
    const services = [];
    const serviceKeywords = {
      "room_service": ["room service", "in-room dining", "food delivery"],
      "spa": ["spa", "massage", "wellness", "treatment"],
      "restaurant": ["restaurant", "dining", "bar", "cafe"],
      "tour": ["tour", "excursion", "activity", "sightseeing"],
      "transportation": ["taxi", "transfer", "shuttle", "transport"],
      "housekeeping": ["housekeeping", "cleaning", "laundry"],
      "concierge": ["concierge", "reception", "front desk"]
    };
    const pageText = $("body").text().toLowerCase();
    Object.entries(serviceKeywords).forEach(([type, keywords]) => {
      const found = keywords.some((keyword) => pageText.includes(keyword));
      if (found) {
        services.push({
          name: this.formatServiceName(type),
          description: `${this.formatServiceName(type)} available`,
          type,
          available: true
        });
      }
    });
    return services;
  }
  extractAmenitiesFromHTML($) {
    const amenities = [];
    const amenityKeywords = [
      "wifi",
      "parking",
      "pool",
      "gym",
      "fitness",
      "breakfast",
      "restaurant",
      "bar",
      "spa",
      "sauna",
      "jacuzzi",
      "air conditioning",
      "tv",
      "minibar",
      "balcony",
      "view",
      "beach access",
      "garden",
      "terrace"
    ];
    const pageText = $("body").text().toLowerCase();
    amenityKeywords.forEach((keyword) => {
      if (pageText.includes(keyword)) {
        amenities.push(keyword);
      }
    });
    return [...new Set(amenities)];
  }
  extractPoliciesFromHTML($) {
    const pageText = $("body").text().toLowerCase();
    const checkInMatch = pageText.match(/check.?in[\s:]*(\d{1,2}:?\d{0,2}?\s?(?:am|pm|:00)?)/i);
    const checkOutMatch = pageText.match(/check.?out[\s:]*(\d{1,2}:?\d{0,2}?\s?(?:am|pm|:00)?)/i);
    const cancellationMatch = pageText.match(/cancellation[\s\w]*(\d+)\s*(?:hours?|days?)/i);
    return {
      checkIn: checkInMatch ? checkInMatch[1] : "15:00",
      checkOut: checkOutMatch ? checkOutMatch[1] : "11:00",
      cancellation: cancellationMatch ? `${cancellationMatch[1]} ${cancellationMatch[0].includes("hour") ? "hours" : "days"} before arrival` : "Contact hotel for cancellation policy"
    };
  }
  extractRoomTypesFromHTML($) {
    const roomTypes = [];
    const roomKeywords = [
      "standard room",
      "deluxe room",
      "suite",
      "family room",
      "twin room",
      "double room",
      "single room",
      "premium room",
      "executive room"
    ];
    const pageText = $("body").text().toLowerCase();
    roomKeywords.forEach((roomType) => {
      if (pageText.includes(roomType)) {
        roomTypes.push({
          name: roomType.replace(/^\w/, (c) => c.toUpperCase()),
          description: `Comfortable ${roomType}`,
          price: "Contact hotel for rates",
          capacity: roomType.includes("family") ? 4 : roomType.includes("twin") ? 2 : 2,
          amenities: ["Air conditioning", "Private bathroom", "TV"]
        });
      }
    });
    return roomTypes;
  }
  extractContactInfo($) {
    const pageText = $("body").text();
    const phoneMatch = pageText.match(/(\+?[\d\s\-\(\)]{10,})/g);
    const emailMatch = pageText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    return {
      phone: phoneMatch ? phoneMatch[0] : null,
      email: emailMatch ? emailMatch[0] : null
    };
  }
  // ============================================
  // Private Methods - Advanced Research
  // ============================================
  async getSocialMediaData(hotelName) {
    console.log(`\u{1F4F1} Analyzing social media for: ${hotelName}`);
    return {
      instagram: {
        followers: 0,
        recentPosts: []
      },
      facebook: {
        likes: 0,
        reviews: 0
      }
    };
  }
  async getReviewData(hotelName) {
    console.log(`\u2B50 Analyzing reviews for: ${hotelName}`);
    return {
      averageRating: 4,
      totalReviews: 0,
      platforms: {
        google: { rating: 4, reviews: 0 },
        tripadvisor: { rating: 4, reviews: 0 },
        booking: { rating: 4, reviews: 0 }
      },
      commonPraises: ["Clean rooms", "Friendly staff", "Good location"],
      commonComplaints: ["Slow wifi", "Limited parking"]
    };
  }
  async getCompetitorAnalysis(hotelName, location) {
    console.log(`\u{1F3E8} Analyzing competitors for: ${hotelName}`);
    return {
      nearbyHotels: [],
      marketPosition: "mid-range",
      uniqueSellingPoints: ["Excellent location", "Personalized service", "Competitive rates"]
    };
  }
  // ============================================
  // Helper Methods
  // ============================================
  formatServiceName(type) {
    return type.split("_").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  categorizeAttraction(types) {
    if (types.includes("natural_feature")) return "nature";
    if (types.includes("museum") || types.includes("art_gallery")) return "cultural";
    if (types.includes("restaurant") || types.includes("food")) return "restaurant";
    if (types.includes("shopping_mall") || types.includes("store")) return "shopping";
    if (types.includes("amusement_park") || types.includes("night_club")) return "entertainment";
    return "landmark";
  }
  calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1e3)}m` : `${distance.toFixed(1)}km`;
  }
  // ============================================
  // Utility Methods
  // ============================================
  /**
   * Validate hotel research data
   */
  static validateHotelData(data) {
    const schema = z2.object({
      name: z2.string().min(1),
      address: z2.string().min(1),
      phone: z2.string().optional(),
      website: z2.string().optional(),
      location: z2.object({
        lat: z2.number(),
        lng: z2.number()
      }),
      services: z2.array(z2.any()).default([]),
      amenities: z2.array(z2.string()).default([]),
      policies: z2.object({
        checkIn: z2.string(),
        checkOut: z2.string(),
        cancellation: z2.string()
      })
    });
    return schema.parse(data);
  }
  /**
   * Get research service health status
   */
  async getServiceHealth() {
    const health = {
      status: "healthy",
      apis: {
        googlePlaces: !!this.googlePlacesApiKey,
        websiteScraping: true,
        rateLimiting: true
      }
    };
    if (this.googlePlacesApiKey) {
      try {
        const testUrl = `${this.baseUrl}/findplacefromtext/json?input=hotel&inputtype=textquery&fields=place_id&key=${this.googlePlacesApiKey}`;
        const response = await fetch(testUrl);
        const data = await response.json();
        health.apis.googlePlaces = data.status === "OK";
      } catch (error) {
        health.apis.googlePlaces = false;
      }
    }
    if (!health.apis.googlePlaces) {
      health.status = "degraded";
    }
    return health;
  }
};

// server/services/vapiIntegration.ts
import fetch2 from "node-fetch";
import { z as z3 } from "zod";

// server/services/knowledgeBaseGenerator.ts
var KnowledgeBaseGenerator = class {
  /**
   * Generate comprehensive knowledge base from hotel research data
   */
  generateKnowledgeBase(hotelData) {
    const sections = [
      this.generateBasicInfoSection(hotelData),
      this.generateServicesSection(hotelData.services),
      this.generateRoomTypesSection(hotelData.roomTypes),
      this.generateAmenitiesSection(hotelData.amenities),
      this.generatePoliciesSection(hotelData.policies),
      this.generateLocalAttractionsSection(hotelData.localAttractions),
      this.generateContactSection(hotelData)
    ];
    if (this.isAdvancedHotelData(hotelData)) {
      sections.push(this.generateReviewsSection(hotelData.reviewData));
      sections.push(this.generateCompetitorSection(hotelData.competitorData));
    }
    return sections.filter((section) => section.trim()).join("\n\n");
  }
  /**
   * Generate system prompt for Vapi assistant
   */
  generateSystemPrompt(hotelData, customization) {
    const personality = customization?.personality || "professional";
    const tone = customization?.tone || "friendly";
    const languages = customization?.languages || ["English"];
    const basePrompt = `You are the AI concierge for ${hotelData.name}, a ${this.getHotelCategory(hotelData)} hotel located in ${hotelData.address}.

PERSONALITY: You are ${personality} and ${tone}. You speak ${languages.join(", ")} fluently.

CORE RESPONSIBILITIES:
- Provide information about hotel services, amenities, and policies
- Accept and process guest service requests
- Offer recommendations for local attractions and activities
- Assist with room service, housekeeping, and other hotel services
- Upsell additional services when appropriate
- Ensure excellent guest satisfaction`;
    const knowledgeBase = this.generateKnowledgeBase(hotelData);
    const instructionsPrompt = `
IMPORTANT INSTRUCTIONS:
- Always use the hotel information provided below to answer questions accurately
- When taking service requests, collect: guest name, room number, timing preferences
- For requests you cannot handle, offer to connect to human staff
- Be proactive in suggesting relevant services and local attractions
- Maintain the ${tone} tone throughout all interactions
- Always confirm important details with guests before processing requests`;
    const knowledgePrompt = `
HOTEL KNOWLEDGE BASE:
${knowledgeBase}

AVAILABLE FUNCTIONS:
${this.generateFunctionDescriptions(hotelData.services)}`;
    return [basePrompt, instructionsPrompt, knowledgePrompt].join("\n\n");
  }
  /**
   * Generate FAQ section from hotel data
   */
  generateFAQSection(hotelData) {
    const faqs = [
      {
        question: "What time is check-in and check-out?",
        answer: `Check-in is at ${hotelData.policies.checkIn} and check-out is at ${hotelData.policies.checkOut}.`
      },
      {
        question: "What amenities are available?",
        answer: `We offer the following amenities: ${hotelData.amenities.join(", ")}.`
      },
      {
        question: "What services do you provide?",
        answer: `Our available services include: ${hotelData.services.map((s) => s.name).join(", ")}.`
      },
      {
        question: "How can I contact the hotel?",
        answer: `You can reach us at ${hotelData.phone || "the front desk"} or visit us at ${hotelData.address}.`
      }
    ];
    if (hotelData.roomTypes.length > 0) {
      faqs.push({
        question: "What room types are available?",
        answer: `We offer ${hotelData.roomTypes.map((r) => r.name).join(", ")}. Each room type has different amenities and pricing.`
      });
    }
    if (hotelData.localAttractions.length > 0) {
      faqs.push({
        question: "What attractions are nearby?",
        answer: `Popular nearby attractions include: ${hotelData.localAttractions.slice(0, 5).map((a) => a.name).join(", ")}.`
      });
    }
    return faqs;
  }
  /**
   * Generate service menu from hotel data
   */
  generateServiceMenu(hotelData) {
    const menu = {
      roomService: this.generateRoomServiceMenu(hotelData.services),
      housekeeping: this.generateHousekeepingMenu(hotelData.services),
      concierge: this.generateConciergeMenu(hotelData.services),
      transportation: this.generateTransportationMenu(hotelData.services),
      spa: this.generateSpaMenu(hotelData.services),
      tours: this.generateToursMenu(hotelData.localAttractions)
    };
    return menu;
  }
  // ============================================
  // Private Section Generators
  // ============================================
  generateBasicInfoSection(hotelData) {
    return `HOTEL INFORMATION:
Name: ${hotelData.name}
Address: ${hotelData.address}
Phone: ${hotelData.phone || "Contact front desk"}
Website: ${hotelData.website || "Not available"}
Rating: ${hotelData.rating ? `${hotelData.rating}/5 stars` : "Not rated"}
Category: ${this.getHotelCategory(hotelData)}
Location: ${hotelData.location.lat}, ${hotelData.location.lng}`;
  }
  generateServicesSection(services) {
    if (services.length === 0) return "";
    const servicesByType = this.groupServicesByType(services);
    let section = "SERVICES AVAILABLE:\n";
    Object.entries(servicesByType).forEach(([type, typeServices]) => {
      section += `
${type.toUpperCase()}:
`;
      typeServices.forEach((service) => {
        section += `- ${service.name}: ${service.description}`;
        if (service.price) section += ` (${service.price})`;
        if (service.hours) section += ` - Available: ${service.hours}`;
        section += "\n";
      });
    });
    return section;
  }
  generateRoomTypesSection(roomTypes) {
    if (roomTypes.length === 0) return "";
    let section = "ROOM TYPES:\n";
    roomTypes.forEach((room) => {
      section += `
${room.name}:
`;
      section += `- Description: ${room.description}
`;
      section += `- Price: ${room.price}
`;
      section += `- Capacity: ${room.capacity} guests
`;
      section += `- Amenities: ${room.amenities.join(", ")}
`;
    });
    return section;
  }
  generateAmenitiesSection(amenities) {
    if (amenities.length === 0) return "";
    return `AMENITIES:
${amenities.map((amenity) => `- ${amenity}`).join("\n")}`;
  }
  generatePoliciesSection(policies) {
    return `HOTEL POLICIES:
Check-in: ${policies.checkIn}
Check-out: ${policies.checkOut}
Cancellation: ${policies.cancellation}`;
  }
  generateLocalAttractionsSection(attractions) {
    if (attractions.length === 0) return "";
    const attractionsByCategory = this.groupAttractionsByCategory(attractions);
    let section = "LOCAL ATTRACTIONS:\n";
    Object.entries(attractionsByCategory).forEach(([category, categoryAttractions]) => {
      section += `
${category.toUpperCase()}:
`;
      categoryAttractions.forEach((attraction) => {
        section += `- ${attraction.name} (${attraction.distance}): ${attraction.description}`;
        if (attraction.rating) section += ` - Rating: ${attraction.rating}/5`;
        section += "\n";
      });
    });
    return section;
  }
  generateContactSection(hotelData) {
    return `CONTACT INFORMATION:
Address: ${hotelData.address}
Phone: ${hotelData.phone || "Available at front desk"}
Website: ${hotelData.website || "Not available"}
Operating Hours: ${hotelData.openingHours?.join(", ") || "Contact hotel for hours"}`;
  }
  generateReviewsSection(reviewData) {
    if (!reviewData || !reviewData.totalReviews) return "";
    return `GUEST REVIEWS:
Average Rating: ${reviewData.averageRating}/5 (${reviewData.totalReviews} reviews)
What Guests Love: ${reviewData.commonPraises?.join(", ") || "Great service"}
Areas for Improvement: ${reviewData.commonComplaints?.join(", ") || "Continuous improvement"}`;
  }
  generateCompetitorSection(competitorData) {
    if (!competitorData || !competitorData.uniqueSellingPoints) return "";
    return `UNIQUE SELLING POINTS:
${competitorData.uniqueSellingPoints.map((point) => `- ${point}`).join("\n")}
Market Position: ${competitorData.marketPosition || "Mid-range"}`;
  }
  generateFunctionDescriptions(services) {
    const availableServices = services.filter((s) => s.available);
    if (availableServices.length === 0) return "Standard hotel information services";
    return availableServices.map(
      (service) => `- ${service.name}: ${service.description}`
    ).join("\n");
  }
  // ============================================
  // Service Menu Generators
  // ============================================
  generateRoomServiceMenu(services) {
    const roomServices = services.filter((s) => s.type === "room_service");
    return roomServices.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price || "Contact for pricing",
      available: service.available
    }));
  }
  generateHousekeepingMenu(services) {
    const housekeepingServices = services.filter((s) => s.type === "housekeeping");
    return housekeepingServices.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price || "Complimentary",
      available: service.available
    }));
  }
  generateConciergeMenu(services) {
    const conciergeServices = services.filter((s) => s.type === "concierge");
    return conciergeServices.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price || "Complimentary",
      available: service.available
    }));
  }
  generateTransportationMenu(services) {
    const transportServices = services.filter((s) => s.type === "transportation");
    return transportServices.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price || "Contact for pricing",
      available: service.available
    }));
  }
  generateSpaMenu(services) {
    const spaServices = services.filter((s) => s.type === "spa");
    return spaServices.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price || "Contact for pricing",
      available: service.available
    }));
  }
  generateToursMenu(attractions) {
    return attractions.slice(0, 10).map((attraction) => ({
      name: `Tour to ${attraction.name}`,
      description: `${attraction.description} - ${attraction.distance} away`,
      price: "Contact for pricing",
      available: true
    }));
  }
  // ============================================
  // Helper Methods
  // ============================================
  isAdvancedHotelData(data) {
    return "reviewData" in data && "competitorData" in data;
  }
  getHotelCategory(hotelData) {
    if (hotelData.priceLevel === void 0) return "hotel";
    switch (hotelData.priceLevel) {
      case 0:
        return "budget hotel";
      case 1:
        return "budget hotel";
      case 2:
        return "mid-range hotel";
      case 3:
        return "upscale hotel";
      case 4:
        return "luxury hotel";
      default:
        return "hotel";
    }
  }
  groupServicesByType(services) {
    const grouped = {};
    services.forEach((service) => {
      if (!grouped[service.type]) {
        grouped[service.type] = [];
      }
      grouped[service.type].push(service);
    });
    return grouped;
  }
  groupAttractionsByCategory(attractions) {
    const grouped = {};
    attractions.forEach((attraction) => {
      if (!grouped[attraction.category]) {
        grouped[attraction.category] = [];
      }
      grouped[attraction.category].push(attraction);
    });
    return grouped;
  }
};

// server/services/vapiIntegration.ts
var VapiIntegrationError = class extends Error {
  constructor(message2, code, statusCode, details) {
    super(message2);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "VapiIntegrationError";
  }
};
var VapiIntegrationService = class {
  baseURL = "https://api.vapi.ai";
  apiKey;
  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("Vapi API key not found. Assistant creation will fail.");
    }
  }
  // ============================================
  // Core API Methods
  // ============================================
  /**
   * Create a new Vapi assistant
   */
  async createAssistant(config2) {
    if (!this.apiKey) {
      throw new VapiIntegrationError("Vapi API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      console.log(`\u{1F916} Creating Vapi assistant: ${config2.name}`);
      const response = await fetch2(`${this.baseURL}/assistant`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: config2.name,
          model: config2.model || {
            provider: "openai",
            model: "gpt-4",
            temperature: 0.7
          },
          voice: {
            provider: "playht",
            voiceId: config2.voiceId || "jennifer"
          },
          systemMessage: config2.systemPrompt,
          firstMessage: config2.firstMessage || `Hello! Welcome to ${config2.hotelName}. How may I assist you today?`,
          functions: config2.functions,
          silenceTimeoutSeconds: config2.silenceTimeoutSeconds || 30,
          maxDurationSeconds: config2.maxDurationSeconds || 1800,
          // 30 minutes
          backgroundSound: config2.backgroundSound || "hotel-lobby"
        })
      });
      const responseText = await response.text();
      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || "API_ERROR",
          response.status,
          errorData
        );
      }
      const assistant = JSON.parse(responseText);
      console.log(`\u2705 Vapi assistant created successfully: ${assistant.id}`);
      return assistant.id;
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }
      console.error("Failed to create Vapi assistant:", error);
      throw new VapiIntegrationError(
        `Failed to create assistant: ${error?.message || "Unknown error"}`,
        "CREATION_FAILED",
        500
      );
    }
  }
  /**
   * Update an existing Vapi assistant
   */
  async updateAssistant(assistantId, config2) {
    if (!this.apiKey) {
      throw new VapiIntegrationError("Vapi API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      console.log(`\u{1F504} Updating Vapi assistant: ${assistantId}`);
      const updateData = {};
      if (config2.name) updateData.name = config2.name;
      if (config2.systemPrompt) updateData.systemMessage = config2.systemPrompt;
      if (config2.functions) updateData.functions = config2.functions;
      if (config2.firstMessage) updateData.firstMessage = config2.firstMessage;
      if (config2.voiceId) updateData.voice = { provider: "playht", voiceId: config2.voiceId };
      if (config2.model) updateData.model = config2.model;
      if (config2.silenceTimeoutSeconds) updateData.silenceTimeoutSeconds = config2.silenceTimeoutSeconds;
      if (config2.maxDurationSeconds) updateData.maxDurationSeconds = config2.maxDurationSeconds;
      if (config2.backgroundSound) updateData.backgroundSound = config2.backgroundSound;
      const response = await fetch2(`${this.baseURL}/assistant/${assistantId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || "API_ERROR",
          response.status
        );
      }
      console.log(`\u2705 Vapi assistant updated successfully: ${assistantId}`);
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }
      console.error("Failed to update Vapi assistant:", error);
      throw new VapiIntegrationError(
        `Failed to update assistant: ${error.message}`,
        "UPDATE_FAILED",
        500
      );
    }
  }
  /**
   * Delete a Vapi assistant
   */
  async deleteAssistant(assistantId) {
    if (!this.apiKey) {
      throw new VapiIntegrationError("Vapi API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      console.log(`\u{1F5D1}\uFE0F Deleting Vapi assistant: ${assistantId}`);
      const response = await fetch2(`${this.baseURL}/assistant/${assistantId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || "API_ERROR",
          response.status
        );
      }
      console.log(`\u2705 Vapi assistant deleted successfully: ${assistantId}`);
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }
      console.error("Failed to delete Vapi assistant:", error);
      throw new VapiIntegrationError(
        `Failed to delete assistant: ${error.message}`,
        "DELETION_FAILED",
        500
      );
    }
  }
  /**
   * Get assistant details
   */
  async getAssistant(assistantId) {
    if (!this.apiKey) {
      throw new VapiIntegrationError("Vapi API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      const response = await fetch2(`${this.baseURL}/assistant/${assistantId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || "API_ERROR",
          response.status
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }
      throw new VapiIntegrationError(
        `Failed to get assistant: ${error.message}`,
        "GET_FAILED",
        500
      );
    }
  }
  /**
   * List all assistants
   */
  async listAssistants() {
    if (!this.apiKey) {
      throw new VapiIntegrationError("Vapi API key not configured", "API_KEY_MISSING", 500);
    }
    try {
      const response = await fetch2(`${this.baseURL}/assistant`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || "API_ERROR",
          response.status
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }
      throw new VapiIntegrationError(
        `Failed to list assistants: ${error.message}`,
        "LIST_FAILED",
        500
      );
    }
  }
  // ============================================
  // Helper Methods
  // ============================================
  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.listAssistants();
      return true;
    } catch (error) {
      console.error("Vapi API connection test failed:", error);
      return false;
    }
  }
  /**
   * Get service health status
   */
  async getServiceHealth() {
    const hasApiKey = !!this.apiKey;
    let connectionStatus = false;
    if (hasApiKey) {
      connectionStatus = await this.testConnection();
    }
    return {
      status: hasApiKey && connectionStatus ? "healthy" : "degraded",
      apiKey: hasApiKey,
      connection: connectionStatus
    };
  }
};
var AssistantGeneratorService = class {
  vapiService;
  knowledgeGenerator;
  constructor() {
    this.vapiService = new VapiIntegrationService();
    this.knowledgeGenerator = new KnowledgeBaseGenerator();
  }
  /**
   * Generate a complete Vapi assistant for a hotel
   */
  async generateAssistant(hotelData, customization) {
    try {
      console.log(`\u{1F3E8} Generating assistant for: ${hotelData.name}`);
      const knowledgeBase = this.knowledgeGenerator.generateKnowledgeBase(hotelData);
      const systemPrompt = this.knowledgeGenerator.generateSystemPrompt(hotelData, customization);
      const functions = this.generateFunctions(hotelData.services);
      const assistantConfig = {
        name: `${hotelData.name} AI Concierge`,
        hotelName: hotelData.name,
        systemPrompt,
        voiceId: customization.voiceId || "jennifer",
        model: {
          provider: "openai",
          model: "gpt-4",
          temperature: customization.personality === "enthusiastic" ? 0.8 : 0.7
        },
        functions,
        firstMessage: this.generateFirstMessage(hotelData, customization),
        silenceTimeoutSeconds: customization.silenceTimeout || 30,
        maxDurationSeconds: customization.maxDuration || 1800,
        backgroundSound: customization.backgroundSound || "hotel-lobby"
      };
      const assistantId = await this.vapiService.createAssistant(assistantConfig);
      console.log(`\u2705 Assistant generated successfully for ${hotelData.name}: ${assistantId}`);
      return assistantId;
    } catch (error) {
      console.error(`Failed to generate assistant for ${hotelData.name}:`, error);
      throw new VapiIntegrationError(
        `Failed to generate assistant: ${error.message}`,
        "GENERATION_FAILED",
        500
      );
    }
  }
  /**
   * Update existing assistant with new data
   */
  async updateAssistant(assistantId, hotelData, customization) {
    try {
      console.log(`\u{1F504} Updating assistant ${assistantId} for: ${hotelData.name}`);
      const knowledgeBase = this.knowledgeGenerator.generateKnowledgeBase(hotelData);
      const systemPrompt = this.knowledgeGenerator.generateSystemPrompt(hotelData, customization);
      const functions = this.generateFunctions(hotelData.services);
      const updateConfig = {
        systemPrompt,
        functions,
        firstMessage: this.generateFirstMessage(hotelData, customization),
        voiceId: customization.voiceId,
        silenceTimeoutSeconds: customization.silenceTimeout,
        maxDurationSeconds: customization.maxDuration,
        backgroundSound: customization.backgroundSound
      };
      await this.vapiService.updateAssistant(assistantId, updateConfig);
      console.log(`\u2705 Assistant updated successfully: ${assistantId}`);
    } catch (error) {
      console.error(`Failed to update assistant ${assistantId}:`, error);
      throw new VapiIntegrationError(
        `Failed to update assistant: ${error.message}`,
        "UPDATE_FAILED",
        500
      );
    }
  }
  // ============================================
  // Dynamic Function Generation
  // ============================================
  /**
   * Generate Vapi functions based on hotel services
   */
  generateFunctions(services) {
    const functions = [];
    functions.push({
      name: "get_hotel_info",
      description: "Get basic hotel information such as hours, contact details, location, and amenities",
      parameters: {
        type: "object",
        properties: {
          info_type: {
            type: "string",
            enum: ["hours", "contact", "location", "amenities", "policies"],
            description: "Type of information requested"
          }
        },
        required: ["info_type"]
      },
      async: false
    });
    const serviceTypes = services.map((s) => s.type);
    if (serviceTypes.includes("room_service")) {
      functions.push({
        name: "order_room_service",
        description: "Order room service for hotel guests including food, drinks, and amenities",
        parameters: {
          type: "object",
          properties: {
            room_number: { type: "string", description: "Guest room number" },
            guest_name: { type: "string", description: "Guest name for the order" },
            items: {
              type: "array",
              items: { type: "string" },
              description: "List of items to order"
            },
            delivery_time: {
              type: "string",
              enum: ["asap", "30min", "1hour", "specific"],
              description: "Preferred delivery time"
            },
            specific_time: { type: "string", description: "Specific delivery time if selected" },
            special_instructions: { type: "string", description: "Any special instructions" }
          },
          required: ["room_number", "guest_name", "items", "delivery_time"]
        },
        async: true
      });
    }
    if (serviceTypes.includes("housekeeping")) {
      functions.push({
        name: "request_housekeeping",
        description: "Request housekeeping services including cleaning, towels, amenities",
        parameters: {
          type: "object",
          properties: {
            room_number: { type: "string", description: "Guest room number" },
            service_type: {
              type: "string",
              enum: ["cleaning", "towels", "amenities", "maintenance", "other"],
              description: "Type of housekeeping service"
            },
            priority: {
              type: "string",
              enum: ["normal", "urgent"],
              description: "Service priority level"
            },
            description: { type: "string", description: "Detailed description of the request" }
          },
          required: ["room_number", "service_type"]
        },
        async: true
      });
    }
    if (serviceTypes.includes("transportation")) {
      functions.push({
        name: "book_transportation",
        description: "Book transportation services including taxi, shuttle, airport transfer",
        parameters: {
          type: "object",
          properties: {
            room_number: { type: "string", description: "Guest room number" },
            guest_name: { type: "string", description: "Guest name for booking" },
            transport_type: {
              type: "string",
              enum: ["taxi", "shuttle", "airport_transfer", "private_car"],
              description: "Type of transportation"
            },
            pickup_time: { type: "string", description: "Pickup time" },
            destination: { type: "string", description: "Destination address" },
            passengers: { type: "string", description: "Number of passengers" },
            special_requests: { type: "string", description: "Any special requests" }
          },
          required: ["room_number", "guest_name", "transport_type", "pickup_time", "destination"]
        },
        async: true
      });
    }
    if (serviceTypes.includes("spa")) {
      functions.push({
        name: "book_spa_service",
        description: "Book spa and wellness services including massage, treatments",
        parameters: {
          type: "object",
          properties: {
            room_number: { type: "string", description: "Guest room number" },
            guest_name: { type: "string", description: "Guest name for booking" },
            service_type: {
              type: "string",
              enum: ["massage", "facial", "wellness", "fitness", "other"],
              description: "Type of spa service"
            },
            preferred_time: { type: "string", description: "Preferred appointment time" },
            duration: { type: "string", description: "Service duration" },
            special_requests: { type: "string", description: "Any special requests or preferences" }
          },
          required: ["room_number", "guest_name", "service_type", "preferred_time"]
        },
        async: true
      });
    }
    if (serviceTypes.includes("concierge")) {
      functions.push({
        name: "concierge_request",
        description: "General concierge services including reservations, recommendations, bookings",
        parameters: {
          type: "object",
          properties: {
            room_number: { type: "string", description: "Guest room number" },
            request_type: {
              type: "string",
              enum: ["restaurant_reservation", "attraction_booking", "recommendation", "tickets", "other"],
              description: "Type of concierge request"
            },
            details: { type: "string", description: "Detailed description of the request" },
            preferred_time: { type: "string", description: "Preferred time if applicable" },
            budget_range: { type: "string", description: "Budget range if applicable" }
          },
          required: ["room_number", "request_type", "details"]
        },
        async: true
      });
    }
    functions.push({
      name: "connect_to_staff",
      description: "Connect guest to human staff for complex requests or when AI cannot help",
      parameters: {
        type: "object",
        properties: {
          room_number: { type: "string", description: "Guest room number" },
          urgency: {
            type: "string",
            enum: ["low", "medium", "high", "emergency"],
            description: "Urgency level of the request"
          },
          reason: { type: "string", description: "Reason for connecting to staff" },
          department: {
            type: "string",
            enum: ["front_desk", "housekeeping", "maintenance", "concierge", "management"],
            description: "Preferred department to connect with"
          }
        },
        required: ["room_number", "reason"]
      },
      async: false
    });
    return functions;
  }
  /**
   * Generate personalized first message
   */
  generateFirstMessage(hotelData, customization) {
    const timeGreeting = this.getTimeBasedGreeting();
    const personalityTouch = this.getPersonalityTouch(customization.personality);
    return `${timeGreeting} Welcome to ${hotelData.name}! ${personalityTouch} How may I assist you today?`;
  }
  /**
   * Get time-based greeting
   */
  getTimeBasedGreeting() {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  }
  /**
   * Get personality-specific touch
   */
  getPersonalityTouch(personality) {
    switch (personality) {
      case "luxurious":
        return "It would be my absolute pleasure to provide you with exceptional service.";
      case "friendly":
        return "I'm here to make your stay wonderful!";
      case "professional":
        return "I am here to assist you with any inquiries or requests.";
      case "casual":
        return "I'm here to help make your stay awesome!";
      default:
        return "I am here to assist you with any inquiries or requests.";
    }
  }
  // ============================================
  // Utility Methods
  // ============================================
  /**
   * Validate assistant configuration
   */
  static validateAssistantConfig(config2) {
    const schema = z3.object({
      name: z3.string().min(1),
      hotelName: z3.string().min(1),
      systemPrompt: z3.string().min(10),
      functions: z3.array(z3.any()).min(1)
    });
    schema.parse(config2);
  }
  /**
   * Get service health
   */
  async getServiceHealth() {
    const vapiHealth = await this.vapiService.getServiceHealth();
    return {
      status: vapiHealth.status,
      vapiConnection: vapiHealth.connection,
      assistantGeneration: vapiHealth.connection && vapiHealth.apiKey
    };
  }
};

// server/routes/dashboard.ts
init_schema2();
import { eq as eq5 } from "drizzle-orm";
var router = express.Router();
router.use(verifyJWT);
router.use(identifyTenant);
router.use(enforceRowLevelSecurity);
var hotelResearchSchema = z4.object({
  hotelName: z4.string().min(1, "Hotel name is required"),
  location: z4.string().optional(),
  researchTier: z4.enum(["basic", "advanced"]).default("basic")
});
var assistantCustomizationSchema = z4.object({
  personality: z4.enum(["professional", "friendly", "luxurious", "casual", "enthusiastic"]).default("professional"),
  tone: z4.enum(["formal", "friendly", "warm", "energetic", "calm"]).default("friendly"),
  languages: z4.array(z4.string()).min(1, "At least one language is required").default(["English"]),
  voiceId: z4.string().optional(),
  silenceTimeout: z4.number().min(10).max(120).optional(),
  maxDuration: z4.number().min(300).max(3600).optional(),
  backgroundSound: z4.enum(["office", "off", "hotel-lobby"]).default("hotel-lobby")
});
var generateAssistantSchema = z4.object({
  hotelData: z4.any(),
  // Will be validated by the research service
  customization: assistantCustomizationSchema
});
var assistantConfigSchema = z4.object({
  personality: z4.string().optional(),
  tone: z4.string().optional(),
  languages: z4.array(z4.string()).optional(),
  voiceId: z4.string().optional(),
  silenceTimeout: z4.number().optional(),
  maxDuration: z4.number().optional(),
  backgroundSound: z4.string().optional(),
  systemPrompt: z4.string().optional()
});
var hotelResearchService = new HotelResearchService();
var assistantGeneratorService = new AssistantGeneratorService();
var vapiIntegrationService = new VapiIntegrationService();
var knowledgeBaseGenerator = new KnowledgeBaseGenerator();
var tenantService = new TenantService();
function handleApiError(res, error, defaultMessage) {
  if (process.env.NODE_ENV === "development") {
    console.error(defaultMessage, error);
    return res.status(500).json({
      error: defaultMessage,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
  } else {
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}
router.post("/research-hotel", checkLimits, async (req, res) => {
  try {
    console.log(`\u{1F50D} Hotel research requested by tenant: ${req.tenant.hotelName}`);
    const { hotelName, location, researchTier } = hotelResearchSchema.parse(req.body);
    if (researchTier === "advanced") {
      const hasAdvancedResearch = await tenantService.hasFeatureAccess(req.tenant.id, "advancedResearch");
      if (!hasAdvancedResearch) {
        return res.status(403).json({
          error: "Advanced research not available in your plan",
          feature: "advancedResearch",
          currentPlan: req.tenant.subscriptionPlan,
          upgradeRequired: true
        });
      }
    }
    let hotelData;
    if (researchTier === "advanced") {
      console.log(`\u{1F3E8} Performing advanced research for: ${hotelName}`);
      hotelData = await hotelResearchService.advancedResearch(hotelName, location);
    } else {
      console.log(`\u{1F3E8} Performing basic research for: ${hotelName}`);
      hotelData = await hotelResearchService.basicResearch(hotelName, location);
    }
    const knowledgeBase = knowledgeBaseGenerator.generateKnowledgeBase(hotelData);
    await db2.update(hotelProfiles).set({
      researchData: hotelData,
      knowledgeBase,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(hotelProfiles.tenantId, req.tenant.id));
    console.log(`\u2705 Hotel research completed for ${hotelName}`);
    res.json({
      success: true,
      hotelData,
      knowledgeBase,
      researchTier,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors
      });
    }
    handleApiError(res, error, "Hotel research failed");
  }
});
router.post("/generate-assistant", checkLimits, async (req, res) => {
  try {
    console.log(`\u{1F916} Assistant generation requested by tenant: ${req.tenant.hotelName}`);
    const { hotelData, customization } = generateAssistantSchema.parse(req.body);
    if (!hotelData || !hotelData.name) {
      return res.status(400).json({
        error: "Hotel data is required. Please research your hotel first.",
        requiresResearch: true
      });
    }
    const assistantId = await assistantGeneratorService.generateAssistant(hotelData, customization);
    const systemPrompt = knowledgeBaseGenerator.generateSystemPrompt(hotelData, customization);
    await db2.update(hotelProfiles).set({
      vapiAssistantId: assistantId,
      assistantConfig: customization,
      systemPrompt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(hotelProfiles.tenantId, req.tenant.id));
    console.log(`\u2705 Assistant generated successfully: ${assistantId}`);
    res.json({
      success: true,
      assistantId,
      customization,
      systemPrompt,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors
      });
    }
    handleApiError(res, error, "Assistant generation failed");
  }
});
router.get("/hotel-profile", async (req, res) => {
  try {
    console.log(`\u{1F4CA} Hotel profile requested by tenant: ${req.tenant.hotelName}`);
    const [profile] = await db2.select().from(hotelProfiles).where(eq5(hotelProfiles.tenantId, req.tenant.id)).limit(1);
    if (!profile) {
      return res.status(404).json({
        error: "Hotel profile not found",
        setupRequired: true
      });
    }
    const usage = await tenantService.getTenantUsage(req.tenant.id);
    const limits = tenantService.getSubscriptionLimits(req.tenant.subscriptionPlan);
    const features = tenantService.getCurrentFeatureFlags(req.tenant);
    let assistantStatus = "not_created";
    if (profile.vapiAssistantId) {
      try {
        await vapiIntegrationService.getAssistant(profile.vapiAssistantId);
        assistantStatus = "active";
      } catch (error) {
        assistantStatus = "error";
        console.warn(`Assistant ${profile.vapiAssistantId} may not exist:`, error.message);
      }
    }
    res.json({
      success: true,
      profile: {
        tenantId: profile.tenantId,
        hasResearchData: !!profile.researchData,
        hasAssistant: !!profile.vapiAssistantId,
        assistantId: profile.vapiAssistantId,
        assistantStatus,
        assistantConfig: profile.assistantConfig,
        knowledgeBase: profile.knowledgeBase,
        systemPrompt: profile.systemPrompt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      },
      tenant: {
        hotelName: req.tenant.hotelName,
        subdomain: req.tenant.subdomain,
        subscriptionPlan: req.tenant.subscriptionPlan,
        subscriptionStatus: req.tenant.subscriptionStatus,
        trialEndsAt: req.tenant.trialEndsAt
      },
      usage,
      limits,
      features
    });
  } catch (error) {
    handleApiError(res, error, "Failed to fetch hotel profile");
  }
});
router.put("/assistant-config", checkLimits, async (req, res) => {
  try {
    console.log(`\u2699\uFE0F Assistant config update requested by tenant: ${req.tenant.hotelName}`);
    const config2 = assistantConfigSchema.parse(req.body);
    const [profile] = await db2.select().from(hotelProfiles).where(eq5(hotelProfiles.tenantId, req.tenant.id)).limit(1);
    if (!profile) {
      return res.status(404).json({
        error: "Hotel profile not found",
        setupRequired: true
      });
    }
    if (!profile.vapiAssistantId) {
      return res.status(400).json({
        error: "No assistant found. Please generate an assistant first.",
        assistantRequired: true
      });
    }
    const currentConfig = profile.assistantConfig || {};
    const updatedConfig = { ...currentConfig, ...config2 };
    if (profile.researchData) {
      await assistantGeneratorService.updateAssistant(
        profile.vapiAssistantId,
        profile.researchData,
        updatedConfig
      );
    } else {
      await vapiIntegrationService.updateAssistant(profile.vapiAssistantId, {
        voiceId: config2.voiceId,
        silenceTimeoutSeconds: config2.silenceTimeout,
        maxDurationSeconds: config2.maxDuration,
        backgroundSound: config2.backgroundSound,
        systemPrompt: config2.systemPrompt
      });
    }
    await db2.update(hotelProfiles).set({
      assistantConfig: updatedConfig,
      systemPrompt: config2.systemPrompt || profile.systemPrompt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(hotelProfiles.tenantId, req.tenant.id));
    console.log(`\u2705 Assistant config updated for tenant: ${req.tenant.hotelName}`);
    res.json({
      success: true,
      updatedConfig,
      assistantId: profile.vapiAssistantId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        error: "Invalid configuration data",
        details: error.errors
      });
    }
    handleApiError(res, error, "Failed to update assistant configuration");
  }
});
router.get("/analytics", async (req, res) => {
  try {
    console.log(`\u{1F4C8} Analytics requested by tenant: ${req.tenant.hotelName}`);
    const hasAnalytics = await tenantService.hasFeatureAccess(req.tenant.id, "advancedAnalytics");
    if (hasAnalytics) {
      const [overview, serviceDistribution, hourlyActivity] = await Promise.all([
        getOverview(req.tenant.id),
        // Pass tenant ID for filtering
        getServiceDistribution(req.tenant.id),
        getHourlyActivity(req.tenant.id)
      ]);
      res.json({
        success: true,
        analytics: {
          overview,
          serviceDistribution,
          hourlyActivity
        },
        tier: "advanced",
        tenantId: req.tenant.id
      });
    } else {
      const overview = await getOverview(req.tenant.id);
      res.json({
        success: true,
        analytics: {
          overview: {
            totalCalls: overview.totalCalls,
            averageDuration: overview.averageDuration
          }
        },
        tier: "basic",
        tenantId: req.tenant.id,
        upgradeMessage: "Upgrade to premium for detailed analytics"
      });
    }
  } catch (error) {
    handleApiError(res, error, "Failed to fetch analytics");
  }
});
router.get("/service-health", async (req, res) => {
  try {
    console.log(`\u{1F3E5} Service health check requested by tenant: ${req.tenant.hotelName}`);
    const [
      hotelResearchHealth,
      vapiHealth,
      tenantHealth
    ] = await Promise.allSettled([
      hotelResearchService.getServiceHealth(),
      vapiIntegrationService.getServiceHealth(),
      tenantService.getServiceHealth()
    ]);
    const health = {
      overall: "healthy",
      services: {
        hotelResearch: hotelResearchHealth.status === "fulfilled" ? hotelResearchHealth.value : { status: "error" },
        vapi: vapiHealth.status === "fulfilled" ? vapiHealth.value : { status: "error" },
        tenant: tenantHealth.status === "fulfilled" ? tenantHealth.value : { status: "error" }
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const serviceStatuses = Object.values(health.services).map((s) => s.status);
    if (serviceStatuses.includes("error")) {
      health.overall = "degraded";
    }
    if (serviceStatuses.every((s) => s === "error")) {
      health.overall = "down";
    }
    res.json(health);
  } catch (error) {
    handleApiError(res, error, "Failed to check service health");
  }
});
router.delete("/reset-assistant", requireFeature("apiAccess"), async (req, res) => {
  try {
    console.log(`\u{1F5D1}\uFE0F Assistant reset requested by tenant: ${req.tenant.hotelName}`);
    const [profile] = await db2.select().from(hotelProfiles).where(eq5(hotelProfiles.tenantId, req.tenant.id)).limit(1);
    if (!profile || !profile.vapiAssistantId) {
      return res.status(404).json({
        error: "No assistant found to reset"
      });
    }
    try {
      await vapiIntegrationService.deleteAssistant(profile.vapiAssistantId);
    } catch (error) {
      console.warn(`Failed to delete assistant from Vapi: ${error.message}`);
    }
    await db2.update(hotelProfiles).set({
      vapiAssistantId: null,
      assistantConfig: null,
      systemPrompt: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(hotelProfiles.tenantId, req.tenant.id));
    console.log(`\u2705 Assistant reset completed for tenant: ${req.tenant.hotelName}`);
    res.json({
      success: true,
      message: "Assistant has been reset. You can now generate a new one.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    handleApiError(res, error, "Failed to reset assistant");
  }
});
var dashboard_default = router;

// server/routes/health.ts
import { Router } from "express";
import { sql as sql5 } from "drizzle-orm";

// server/startup/auto-database-fix.ts
import { drizzle as drizzle3 } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql as sql4 } from "drizzle-orm";
var AutoDatabaseFixer = class {
  db;
  client;
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log("\u26A0\uFE0F DATABASE_URL not found, skipping auto-fix");
      return;
    }
    this.client = postgres(databaseUrl);
    this.db = drizzle3(this.client);
  }
  async autoFixDatabase() {
    if (!this.client) {
      console.log("\u26A0\uFE0F Database connection not available, skipping auto-fix");
      return false;
    }
    try {
      console.log("\u{1F50D} Checking database schema...");
      const needsFix = await this.checkIfDatabaseNeedsFix();
      if (!needsFix) {
        console.log("\u2705 Database schema is up to date");
        return true;
      }
      console.log("\u{1F6E0}\uFE0F Auto-fixing database schema...");
      await this.performAutoFix();
      console.log("\u2705 Database auto-fix completed successfully");
      return true;
    } catch (error) {
      console.error("\u274C Auto database fix failed:", error instanceof Error ? error.message : String(error));
      console.log("\u26A0\uFE0F Server will continue with potentially broken database");
      return false;
    }
  }
  async checkIfDatabaseNeedsFix() {
    try {
      const tenantsResult = await this.db.execute(sql4`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'tenants'
        )
      `);
      const tenantsExists = tenantsResult[0]?.exists || false;
      if (!tenantsExists) {
        console.log("\u{1F4CB} Missing tenants table - needs fix");
        return true;
      }
      const tenantIdResult = await this.db.execute(sql4`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'transcript' AND column_name = 'tenant_id'
        )
      `);
      const tenantIdExists = tenantIdResult[0]?.exists || false;
      if (!tenantIdExists) {
        console.log("\u{1F4CB} Missing tenant_id column - needs fix");
        return true;
      }
      const miNhonResult = await this.db.execute(sql4`
        SELECT EXISTS (
          SELECT FROM tenants WHERE id = 'mi-nhon-hotel'
        )
      `);
      const miNhonExists = miNhonResult[0]?.exists || false;
      if (!miNhonExists) {
        console.log("\u{1F4CB} Missing Mi Nhon tenant - needs fix");
        return true;
      }
      return false;
    } catch (error) {
      console.log("\u{1F4CB} Database check failed, assuming needs fix:", error instanceof Error ? error.message : String(error));
      return true;
    }
  }
  async performAutoFix() {
    await this.createMissingTables();
    await this.createMiNhonTenant();
    await this.createDefaultStaffAccounts();
    await this.updateExistingData();
  }
  async createMissingTables() {
    await this.db.execute(sql4`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT,
        subdomain TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        subscription_plan TEXT DEFAULT 'trial',
        subscription_status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.db.execute(sql4`
      CREATE TABLE IF NOT EXISTS hotel_profiles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        amenities TEXT[],
        policies TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const tables = ["transcript", "request", "message", "call", "staff"];
    for (const table of tables) {
      try {
        await this.db.execute(sql4`
          ALTER TABLE ${sql4.identifier(table)} 
          ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
        `);
      } catch (error) {
      }
    }
  }
  async createMiNhonTenant() {
    const miNhonTenant = {
      id: "mi-nhon-hotel",
      name: "Mi Nhon Hotel",
      domain: "minhonmuine.talk2go.online",
      subdomain: "minhonmuine",
      email: "info@minhonhotel.com",
      phone: "+84 252 3847 007",
      address: "97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam",
      subscription_plan: "premium",
      subscription_status: "active"
    };
    await this.db.execute(sql4`
      INSERT INTO tenants (id, name, domain, subdomain, email, phone, address, subscription_plan, subscription_status)
      VALUES (${miNhonTenant.id}, ${miNhonTenant.name}, ${miNhonTenant.domain}, ${miNhonTenant.subdomain}, 
              ${miNhonTenant.email}, ${miNhonTenant.phone}, ${miNhonTenant.address}, 
              ${miNhonTenant.subscription_plan}, ${miNhonTenant.subscription_status})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        subdomain = EXCLUDED.subdomain,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        subscription_plan = EXCLUDED.subscription_plan,
        subscription_status = EXCLUDED.subscription_status,
        updated_at = CURRENT_TIMESTAMP
    `);
    await this.db.execute(sql4`
      INSERT INTO hotel_profiles (id, tenant_id, name, description, address, phone, email, website, amenities, policies)
      VALUES ('mi-nhon-hotel-profile', 'mi-nhon-hotel', 'Mi Nhon Hotel', 
              'A beautiful beachfront hotel in Mui Ne, Vietnam',
              '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
              '+84 252 3847 007', 'info@minhonhotel.com', 'https://minhonhotel.com',
              ARRAY['Pool', 'Restaurant', 'Free WiFi', 'Beach Access', 'Spa'],
              ARRAY['Check-in: 2:00 PM', 'Check-out: 12:00 PM', 'No smoking'])
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        amenities = EXCLUDED.amenities,
        policies = EXCLUDED.policies,
        updated_at = CURRENT_TIMESTAMP
    `);
  }
  async createDefaultStaffAccounts() {
    const defaultStaff = [
      {
        id: "admin-mi-nhon",
        tenant_id: "mi-nhon-hotel",
        username: "admin@hotel.com",
        password: "StrongPassword123",
        role: "admin",
        name: "Administrator",
        email: "admin@hotel.com"
      },
      {
        id: "manager-mi-nhon",
        tenant_id: "mi-nhon-hotel",
        username: "manager@hotel.com",
        password: "StrongPassword456",
        role: "manager",
        name: "Hotel Manager",
        email: "manager@hotel.com"
      }
    ];
    for (const staff2 of defaultStaff) {
      await this.db.execute(sql4`
        INSERT INTO staff (id, tenant_id, username, password, role, name, email)
        VALUES (${staff2.id}, ${staff2.tenant_id}, ${staff2.username}, ${staff2.password}, 
                ${staff2.role}, ${staff2.name}, ${staff2.email})
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
      `);
    }
  }
  async updateExistingData() {
    const miNhonTenantId = "mi-nhon-hotel";
    const tables = ["transcript", "request", "message", "staff"];
    for (const table of tables) {
      try {
        await this.db.execute(sql4`
          UPDATE ${sql4.identifier(table)} 
          SET tenant_id = ${miNhonTenantId} 
          WHERE tenant_id IS NULL
        `);
      } catch (error) {
      }
    }
  }
  async cleanup() {
    if (this.client) {
      await this.client.end();
    }
  }
};
async function runAutoDbFix() {
  const fixer = new AutoDatabaseFixer();
  const success = await fixer.autoFixDatabase();
  await fixer.cleanup();
  return success;
}

// server/routes/health.ts
var router2 = Router();
router2.get("/health", async (req, res) => {
  try {
    await db.execute(sql5`SELECT 1`);
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router2.post("/health/fix-database", async (req, res) => {
  try {
    console.log("\u{1F527} Manual database fix triggered via API...");
    const success = await runAutoDbFix();
    if (success) {
      res.json({
        status: "success",
        message: "Database fix completed successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.status(500).json({
        status: "failed",
        message: "Database fix failed - check server logs",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Manual database fix failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router2.get("/health/database", async (req, res) => {
  try {
    const schemaChecks = {
      database_connection: false,
      tenants_table: false,
      hotel_profiles_table: false,
      tenant_id_columns: false,
      mi_nhon_tenant: false,
      staff_accounts: false
    };
    await db.execute(sql5`SELECT 1`);
    schemaChecks.database_connection = true;
    const tenantsResult = await db.execute(sql5`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants'
      )
    `);
    schemaChecks.tenants_table = tenantsResult[0]?.exists || false;
    const profilesResult = await db.execute(sql5`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'hotel_profiles'
      )
    `);
    schemaChecks.hotel_profiles_table = profilesResult[0]?.exists || false;
    const tenantIdResult = await db.execute(sql5`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'transcript' AND column_name = 'tenant_id'
      )
    `);
    schemaChecks.tenant_id_columns = tenantIdResult[0]?.exists || false;
    if (schemaChecks.tenants_table) {
      const miNhonResult = await db.execute(sql5`
        SELECT EXISTS (
          SELECT FROM tenants WHERE id = 'mi-nhon-hotel'
        )
      `);
      schemaChecks.mi_nhon_tenant = miNhonResult[0]?.exists || false;
    }
    const staffResult = await db.execute(sql5`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'staff'
      )
    `);
    if (staffResult[0]?.exists) {
      const staffCountResult = await db.execute(sql5`
        SELECT COUNT(*) as count FROM staff WHERE tenant_id = 'mi-nhon-hotel'
      `);
      schemaChecks.staff_accounts = (staffCountResult[0]?.count || 0) > 0;
    }
    const allHealthy = Object.values(schemaChecks).every((check) => check === true);
    res.json({
      status: allHealthy ? "healthy" : "needs_attention",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      schema_checks: schemaChecks,
      recommendations: allHealthy ? [] : [
        "Run manual fix: POST /api/health/fix-database",
        "Or run: npm run db:fix-production",
        "Check environment variables: DATABASE_URL",
        "Verify database migrations are complete"
      ]
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router2.get("/health/environment", async (req, res) => {
  const envChecks = {
    database_url: !!process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT || "default",
    jwt_secret: !!process.env.JWT_SECRET,
    openai_api_key: !!process.env.VITE_OPENAI_API_KEY,
    vapi_public_key: !!process.env.VITE_VAPI_PUBLIC_KEY,
    cors_origin: process.env.CORS_ORIGIN || "not_set",
    client_url: process.env.CLIENT_URL || "not_set"
  };
  const criticalMissing = [];
  if (!envChecks.database_url) criticalMissing.push("DATABASE_URL");
  if (!envChecks.jwt_secret) criticalMissing.push("JWT_SECRET");
  res.json({
    status: criticalMissing.length === 0 ? "healthy" : "missing_critical_vars",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment_checks: envChecks,
    critical_missing: criticalMissing,
    recommendations: criticalMissing.length > 0 ? [
      "Set missing environment variables in your deployment platform",
      "Generate JWT secret: npm run env:jwt-secret",
      "Configure API keys for full functionality"
    ] : []
  });
});
var health_default = router2;

// server/routes.ts
var openai2 = new OpenAI2({
  apiKey: process.env.VITE_OPENAI_API_KEY || "sk-placeholder-for-dev"
});
var staffList = [
  {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    id: 2,
    username: "staff1",
    passwordHash: bcrypt.hashSync("staffpass", 10),
    role: "staff",
    createdAt: /* @__PURE__ */ new Date()
  }
];
function parseStaffAccounts(envStr) {
  if (!envStr) return [];
  return envStr.split(",").map((pair) => {
    const [username, password] = pair.split(":");
    return { username, password };
  });
}
var STAFF_ACCOUNTS = parseStaffAccounts(process.env.STAFF_ACCOUNTS);
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-for-testing";
async function extractTenantFromRequest(req) {
  const host = req.get("host") || "";
  const subdomain = extractSubdomain(host);
  if (subdomain === "localhost" || subdomain === "127.0.0.1" || !subdomain) {
    return getMiNhonTenantId2();
  }
  try {
    const { tenants: tenants3 } = await Promise.resolve().then(() => (init_schema2(), schema_exports));
    const [tenant] = await db2.select().from(tenants3).where(eq6(tenants3.subdomain, subdomain)).limit(1);
    return tenant?.id || getMiNhonTenantId2();
  } catch (error) {
    console.error("Error looking up tenant:", error);
    return getMiNhonTenantId2();
  }
}
function extractSubdomain(host) {
  const cleanHost = host.split(":")[0];
  if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
    return "minhon";
  }
  const parts = cleanHost.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }
  return "minhon";
}
function getMiNhonTenantId2() {
  return process.env.MINHON_TENANT_ID || "minhon-default-tenant-id";
}
async function findStaffInDatabase(username, password, tenantId) {
  try {
    const { staff: staff2 } = await Promise.resolve().then(() => (init_schema2(), schema_exports));
    const [staffUser] = await db2.select().from(staff2).where(and4(eq6(staff2.username, username), eq6(staff2.tenantId, tenantId))).limit(1);
    if (!staffUser) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, staffUser.password);
    if (!isPasswordValid) {
      return null;
    }
    return {
      username: staffUser.username,
      role: staffUser.role || "staff",
      tenantId: staffUser.tenantId,
      permissions: []
    };
  } catch (error) {
    console.error("Error finding staff in database:", error);
    return null;
  }
}
async function findStaffInFallback(username, password, tenantId) {
  const FALLBACK_ACCOUNTS = [
    { username: "staff1", password: "password1", role: "staff" },
    { username: "admin", password: "admin123", role: "admin" },
    { username: "admin@hotel.com", password: "StrongPassword123", role: "admin" },
    { username: "manager@hotel.com", password: "StrongPassword456", role: "manager" }
  ];
  const found = STAFF_ACCOUNTS.find((acc) => acc.username === username && acc.password === password);
  const fallbackFound = !found && FALLBACK_ACCOUNTS.find((acc) => acc.username === username && acc.password === password);
  const account = found || fallbackFound;
  if (!account) {
    return null;
  }
  return {
    username: account.username,
    role: account.role || "staff",
    tenantId,
    permissions: []
  };
}
var messageList = [
  { id: 1, requestId: 1, sender: "guest", content: "Can I get my order soon?", created_at: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
  { id: 2, requestId: 1, sender: "staff", content: "We are preparing your order.", created_at: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }
];
function cleanSummaryContent(content) {
  if (!content) return "";
  return content.split("\n").filter((line) => !/^Bước tiếp theo:/i.test(line) && !/^Next Step:/i.test(line) && !/Vui lòng nhấn/i.test(line) && !/Please Press Send To Reception/i.test(line)).map((line) => line.replace(/\(dùng cho khách[^\)]*\)/i, "").replace(/\(used for Guest[^\)]*\)/i, "")).join("\n").replace(/\n{3,}/g, "\n\n");
}
function handleApiError2(res, error, defaultMessage) {
  if (process.env.NODE_ENV === "development") {
    console.error(defaultMessage, error);
    return res.status(500).json({ error: defaultMessage, message: error.message, stack: error.stack });
  } else {
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  globalThis.wss = wss;
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    clients.add(ws);
    ws.isAlive = true;
    ws.on("message", async (message2) => {
      try {
        const data = JSON.parse(message2.toString());
        if (data.type === "init" && data.callId) {
          ws.callId = data.callId;
          console.log(`Client associated with call ID: ${data.callId}`);
        }
        if (data.type === "transcript" && data.callId && data.role && data.content) {
          try {
            const validatedData = insertTranscriptSchema.parse({
              callId: data.callId,
              role: data.role,
              content: data.content
            });
            try {
              const existingCall = await db2.select().from(call).where(eq6(call.callIdVapi, data.callId)).limit(1);
              if (existingCall.length === 0) {
                const roomMatch = data.content.match(/room (\d+)/i) || data.content.match(/phòng (\d+)/i);
                const roomNumber = roomMatch ? roomMatch[1] : null;
                const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(data.content);
                const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(data.content) && !hasVietnamese;
                let language = "en";
                if (hasVietnamese) language = "vi";
                else if (hasFrench) language = "fr";
                await db2.insert(call).values({
                  callIdVapi: data.callId,
                  roomNumber,
                  duration: 0,
                  // Will be updated when call ends
                  language,
                  createdAt: /* @__PURE__ */ new Date()
                });
                console.log(`Auto-created call record for ${data.callId} with room ${roomNumber || "unknown"} and language ${language}`);
              }
            } catch (callError) {
              console.error("Error creating call record:", callError);
            }
            await storage.addTranscript(validatedData);
            const message3 = JSON.stringify({
              type: "transcript",
              callId: data.callId,
              role: data.role,
              content: data.content,
              timestamp: /* @__PURE__ */ new Date()
            });
            clients.forEach((client) => {
              if (client.callId === data.callId && client.readyState === WebSocket.OPEN) {
                client.send(message3);
              }
            });
          } catch (error) {
            console.error("Invalid transcript data:", error);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
    ws.send(JSON.stringify({
      type: "connected",
      message: "Connected to Mi Nhon Hotel Voice Assistant"
    }));
  });
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 3e4);
  wss.on("close", () => {
    clearInterval(interval);
  });
  app2.post("/api/test-openai", async (req, res) => {
    try {
      const { message: message2 } = req.body;
      const response = await openai2.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message2 || "Hello, give me a quick test response." }],
        max_tokens: 30
      });
      res.json({
        success: true,
        message: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      });
    } catch (error) {
      handleApiError2(res, error, "OpenAI API test error:");
    }
  });
  app2.get("/api/transcripts/:callId", async (req, res) => {
    try {
      const callId = req.params.callId;
      const transcripts2 = await storage.getTranscriptsByCallId(callId);
      res.json(transcripts2);
    } catch (error) {
      handleApiError2(res, error, "Failed to retrieve transcripts");
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        roomNumber: req.body.roomNumber || "unknown"
      });
      const order = await storage.createOrder(orderData);
      try {
        await db2.insert(request).values({
          room_number: order.roomNumber || orderData.roomNumber || "unknown",
          orderId: order.callId || orderData.callId,
          guestName: "Guest",
          request_content: Array.isArray(orderData.items) && orderData.items.length > 0 ? orderData.items.map((i) => `${i.name} x${i.quantity}`).join(", ") : orderData.orderType || "Service Request",
          status: "\u0110\xE3 ghi nh\u1EADn",
          created_at: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      } catch (syncErr) {
        console.error("Failed to sync order to request table:", syncErr);
      }
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ error: "Invalid order data", details: error.errors });
      } else {
        handleApiError2(res, error, "Failed to create order");
      }
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      handleApiError2(res, error, "Failed to retrieve order");
    }
  });
  app2.get("/api/orders/room/:roomNumber", async (req, res) => {
    try {
      const roomNumber = req.params.roomNumber;
      const orders2 = await storage.getOrdersByRoomNumber(roomNumber);
      res.json(orders2);
    } catch (error) {
      handleApiError2(res, error, "Failed to retrieve orders");
    }
  });
  app2.patch("/api/orders/:id/status", verifyJWT, async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }
    const updatedOrder = await storage.updateOrderStatus(idNum, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (globalThis.wss) {
      if (updatedOrder.specialInstructions) {
        globalThis.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "order_status_update",
              reference: updatedOrder.specialInstructions,
              status: updatedOrder.status
            }));
          }
        });
      }
    }
    res.json(updatedOrder);
  });
  app2.get("/api/staff/orders", verifyJWT, async (req, res) => {
    try {
      const { status, roomNumber } = req.query;
      const orders2 = await storage.getAllOrders({
        status,
        roomNumber
      });
      res.json(orders2);
    } catch (err) {
      handleApiError2(res, err, "Failed to retrieve staff orders");
    }
  });
  app2.post("/api/orders/:id/update-status", verifyJWT, async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    const { status } = req.body;
    try {
      const updatedOrder = await storage.updateOrderStatus(idNum, status);
      const io = req.app.get("io");
      io.to(String(idNum)).emit("order_status_update", { orderId: String(idNum), status });
      res.json(updatedOrder);
    } catch (err) {
      handleApiError2(res, err, "Failed to update order status");
    }
  });
  app2.post("/api/call-end", async (req, res) => {
    try {
      const { callId, duration } = req.body;
      if (!callId) {
        return res.status(400).json({ error: "Call ID is required" });
      }
      const existingCall = await db2.select().from(call).where(eq6(call.callIdVapi, callId)).limit(1);
      if (existingCall.length > 0) {
        await db2.update(call).set({ duration: duration || 0 }).where(eq6(call.callIdVapi, callId));
        console.log(`Updated call duration for ${callId}: ${duration || 0} seconds`);
      }
      res.json({ success: true });
    } catch (error) {
      handleApiError2(res, error, "Error updating call duration");
    }
  });
  app2.post("/api/store-summary", async (req, res) => {
    try {
      const { summary: summaryText, transcripts: transcripts2, timestamp: timestamp2, callId, callDuration: reqCallDuration, forceBasicSummary, orderReference, language } = req.body;
      let finalSummary = summaryText;
      let isAiGenerated = false;
      if (transcripts2 && (!summaryText || summaryText === "")) {
        const useOpenAi = !req.query.skipAi && !forceBasicSummary && process.env.VITE_OPENAI_API_KEY;
        if (useOpenAi) {
          console.log("Generating summary with OpenAI from provided transcripts");
          try {
            finalSummary = await generateCallSummary(transcripts2, language);
            isAiGenerated = true;
          } catch (aiError) {
            console.error("Error generating summary with OpenAI:", aiError);
            console.log("Falling back to basic summary generation");
            finalSummary = generateBasicSummary(transcripts2);
            isAiGenerated = false;
          }
        } else {
          console.log("Generating basic summary from transcripts (OpenAI skipped)");
          finalSummary = generateBasicSummary(transcripts2);
          isAiGenerated = false;
        }
      } else if (!summaryText || summaryText === "") {
        console.log("Fetching transcripts from database for callId:", callId);
        try {
          const storedTranscripts = await storage.getTranscriptsByCallId(callId);
          if (storedTranscripts && storedTranscripts.length > 0) {
            const formattedTranscripts = storedTranscripts.map((t) => ({
              role: t.role,
              content: t.content
            }));
            try {
              finalSummary = await generateCallSummary(formattedTranscripts, language);
              isAiGenerated = true;
            } catch (openaiError) {
              console.error("Error using OpenAI for stored transcripts:", openaiError);
              finalSummary = generateBasicSummary(formattedTranscripts);
              isAiGenerated = false;
            }
          } else {
            finalSummary = "No conversation transcripts were found for this call.";
          }
        } catch (dbError) {
          console.error("Error fetching transcripts from database:", dbError);
          if (transcripts2 && transcripts2.length > 0) {
            finalSummary = generateBasicSummary(transcripts2);
          } else {
            finalSummary = "Unable to generate summary due to missing conversation data.";
          }
        }
      }
      if (!finalSummary || typeof finalSummary !== "string") {
        return res.status(400).json({ error: "Summary content is required" });
      }
      const roomNumberMatch = finalSummary.match(/room (\d+)/i) || finalSummary.match(/phòng (\d+)/i);
      const roomNumber = roomNumberMatch ? roomNumberMatch[1] : "unknown";
      let durationStr = "0:00";
      if (reqCallDuration) {
        durationStr = typeof reqCallDuration === "number" ? `${Math.floor(reqCallDuration / 60)}:${(reqCallDuration % 60).toString().padStart(2, "0")}` : reqCallDuration;
      }
      const summaryData = insertCallSummarySchema.parse({
        callId,
        content: finalSummary,
        timestamp: new Date(timestamp2 || Date.now()),
        roomNumber,
        duration: durationStr,
        orderReference
      });
      const result = await storage.addCallSummary(summaryData);
      let serviceRequests = [];
      if (isAiGenerated && finalSummary) {
        try {
          console.log("Extracting service requests from AI-generated summary");
          serviceRequests = await extractServiceRequests(finalSummary);
          console.log(`Successfully extracted ${serviceRequests.length} service requests`);
        } catch (extractError) {
          console.error("Error extracting service requests:", extractError);
        }
      }
      try {
        const serviceRequestStrings = serviceRequests.map(
          (req2) => `${req2.serviceType}: ${req2.requestText || "Kh\xF4ng c\xF3 th\xF4ng tin chi ti\u1EBFt"}`
        );
        console.log(`Ph\xE1t hi\u1EC7n th\xF4ng tin ph\xF2ng: ${roomNumber}`);
        console.log(`S\u1ED1 l\u01B0\u1EE3ng y\xEAu c\u1EA7u d\u1ECBch v\u1EE5: ${serviceRequestStrings.length}`);
        console.log(`Th\u1EDDi l\u01B0\u1EE3ng cu\u1ED9c g\u1ECDi: ${durationStr}`);
        console.log(`Email s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi sau khi ng\u01B0\u1EDDi d\xF9ng nh\u1EA5n n\xFAt x\xE1c nh\u1EADn`);
      } catch (extractError) {
        console.error("Error preparing service information:", extractError?.message || extractError);
      }
      res.status(201).json({
        success: true,
        summary: result,
        isAiGenerated,
        serviceRequests
      });
    } catch (error) {
      handleApiError2(res, error, "Error storing call summary:");
    }
  });
  app2.get("/api/summaries/:callId", async (req, res) => {
    try {
      const callId = req.params.callId;
      if (/^\d+$/.test(callId)) {
        return res.status(404).json({ error: "Call summary not found" });
      }
      const summary = await storage.getCallSummaryByCallId(callId);
      if (!summary) {
        return res.status(404).json({ error: "Call summary not found" });
      }
      res.json(summary);
    } catch (error) {
      handleApiError2(res, error, "Failed to retrieve call summary");
    }
  });
  app2.get("/api/summaries/recent/:hours", async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const validHours = Math.min(Math.max(1, hours), 72);
      const summaries = await storage.getRecentCallSummaries(validHours);
      const mapped = summaries.map((s) => ({
        id: s.id,
        callId: s.callId,
        roomNumber: s.roomNumber,
        content: s.content,
        timestamp: s.timestamp,
        duration: s.duration
      }));
      res.json({
        success: true,
        count: summaries.length,
        timeframe: `${validHours} hours`,
        summaries: mapped
      });
    } catch (error) {
      handleApiError2(res, error, "Error retrieving recent call summaries:");
    }
  });
  app2.post("/api/translate-to-vietnamese", async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string") {
        return res.status(400).json({ error: "Text content is required" });
      }
      const translatedText = await translateToVietnamese(text2);
      res.json({
        success: true,
        translatedText
      });
    } catch (error) {
      handleApiError2(res, error, "Error translating text to Vietnamese:");
    }
  });
  app2.post("/api/send-service-email", async (req, res) => {
    try {
      const { toEmail, serviceDetails } = req.body;
      if (!toEmail || !serviceDetails || !serviceDetails.serviceType || !serviceDetails.roomNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const orderReference = serviceDetails.orderReference || `#ORD-${Math.floor(1e4 + Math.random() * 9e4)}`;
      let vietnameseDetails = serviceDetails.details || "";
      if (vietnameseDetails && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(vietnameseDetails)) {
        try {
          console.log("D\u1ECBch chi ti\u1EBFt d\u1ECBch v\u1EE5 sang ti\u1EBFng Vi\u1EC7t tr\u01B0\u1EDBc khi g\u1EEDi email");
          vietnameseDetails = await translateToVietnamese(vietnameseDetails);
        } catch (translateError) {
          console.error("L\u1ED7i khi d\u1ECBch chi ti\u1EBFt d\u1ECBch v\u1EE5 sang ti\u1EBFng Vi\u1EC7t:", translateError);
        }
      }
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: serviceDetails.serviceType,
        roomNumber: serviceDetails.roomNumber,
        timestamp: new Date(serviceDetails.timestamp || Date.now()),
        details: vietnameseDetails,
        orderReference
        // Thêm mã tham chiếu
      });
      if (result.success) {
        res.json({
          success: true,
          messageId: result.messageId,
          orderReference
          // Trả về mã tham chiếu để hiển thị cho người dùng
        });
      } else {
        throw new Error(result.error?.toString() || "Unknown error");
      }
    } catch (error) {
      handleApiError2(res, error, "Error sending service confirmation email:");
    }
  });
  app2.post("/api/send-call-summary-email", async (req, res) => {
    try {
      const { callDetails } = req.body;
      const recipientsEnv = process.env.SUMMARY_EMAILS || "";
      const toEmails = recipientsEnv.split(",").map((e) => e.trim()).filter(Boolean);
      if (toEmails.length === 0 && req.body.toEmail) {
        toEmails.push(req.body.toEmail);
      }
      if (!callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const orderReference = callDetails.orderReference || `#ORD-${Math.floor(1e4 + Math.random() * 9e4)}`;
      let vietnameseSummary = callDetails.summary;
      if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(callDetails.summary)) {
        try {
          console.log("D\u1ECBch t\xF3m t\u1EAFt sang ti\u1EBFng Vi\u1EC7t tr\u01B0\u1EDBc khi g\u1EEDi email");
          vietnameseSummary = await translateToVietnamese(callDetails.summary);
        } catch (translateError) {
          console.error("L\u1ED7i khi d\u1ECBch t\xF3m t\u1EAFt sang ti\u1EBFng Vi\u1EC7t:", translateError);
        }
      }
      const vietnameseServiceRequests = [];
      if (callDetails.serviceRequests && callDetails.serviceRequests.length > 0) {
        for (const request3 of callDetails.serviceRequests) {
          if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(request3)) {
            try {
              const translatedRequest = await translateToVietnamese(request3);
              vietnameseServiceRequests.push(translatedRequest);
            } catch (error) {
              console.error("L\u1ED7i khi d\u1ECBch y\xEAu c\u1EA7u d\u1ECBch v\u1EE5:", error);
              vietnameseServiceRequests.push(request3);
            }
          } else {
            vietnameseServiceRequests.push(request3);
          }
        }
      }
      const results = [];
      for (const toEmail of toEmails) {
        const result = await sendCallSummary(toEmail, {
          callId: callDetails.callId || "unknown",
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || "0:00",
          summary: vietnameseSummary,
          // Sử dụng bản tóm tắt tiếng Việt
          serviceRequests: vietnameseServiceRequests.length > 0 ? vietnameseServiceRequests : callDetails.serviceRequests || [],
          orderReference
          // Thêm mã tham chiếu
        });
        results.push(result);
      }
      if (results.every((r) => r.success)) {
        try {
          const cleanedSummary = cleanSummaryContent(vietnameseSummary);
          await db2.insert(request).values({
            room_number: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            guestName: callDetails.guestName || "Guest",
            request_content: cleanedSummary,
            created_at: /* @__PURE__ */ new Date(),
            status: "\u0110\xE3 ghi nh\u1EADn",
            updatedAt: /* @__PURE__ */ new Date()
          });
        } catch (dbError) {
          console.error("L\u1ED7i khi l\u01B0u request v\xE0o DB:", dbError);
        }
        res.json({ success: true, recipients: toEmails, orderReference });
      } else {
        throw new Error("Failed to send call summary to all recipients");
      }
    } catch (error) {
      handleApiError2(res, error, "Error sending call summary email:");
    }
  });
  app2.post("/api/test-email", async (req, res) => {
    try {
      if (process.env.GMAIL_APP_PASSWORD) {
        console.log("Using Gmail for test email");
      } else if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
        console.log("Using Mailjet for test email");
      } else {
        return res.status(400).json({
          success: false,
          error: "Email credentials not configured",
          missingEnv: true
        });
      }
      const { toEmail, isMobile } = req.body;
      if (!toEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }
      console.log(`Sending test email to ${toEmail} (${isMobile ? "mobile device" : "desktop"})`);
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: "Mobile Test Email",
        roomNumber: isMobile ? "MOBILE-TEST" : "DESKTOP-TEST",
        timestamp: /* @__PURE__ */ new Date(),
        details: `\u0110\xE2y l\xE0 email ki\u1EC3m tra t\u1EEB Mi Nhon Hotel Voice Assistant. Sent from ${isMobile ? "MOBILE" : "DESKTOP"} at ${(/* @__PURE__ */ new Date()).toISOString()}`
      });
      console.log("Email test result:", result);
      if (result.success) {
        res.json({
          success: true,
          message: "Test email sent successfully",
          messageId: result.messageId,
          provider: process.env.GMAIL_APP_PASSWORD ? "gmail" : "mailjet"
        });
      } else {
        throw new Error(result.error?.toString() || "Unknown error");
      }
    } catch (error) {
      handleApiError2(res, error, "Error sending test email:");
    }
  });
  app2.post("/api/mobile-test-email", async (req, res) => {
    try {
      console.log("Mobile test email requested");
      const toEmail = req.body.toEmail || "tuans2@gmail.com";
      const userAgent = req.headers["user-agent"] || "";
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      console.log("=================== MOBILE EMAIL TEST ===================");
      console.log("Time:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("Device info:", userAgent);
      console.log("Device type:", isMobile ? "MOBILE" : "DESKTOP");
      console.log("Recipient:", toEmail);
      console.log("=========================================================");
      setTimeout(async () => {
        try {
          if (isMobile) {
            console.log("G\u1EEDi email qua ph\u01B0\u01A1ng th\u1EE9c chuy\xEAn bi\u1EC7t cho thi\u1EBFt b\u1ECB di \u0111\u1ED9ng...");
            const result = await sendMobileEmail(
              toEmail,
              "Mi Nhon Hotel - Test t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng",
              `\u0110\xE2y l\xE0 email ki\u1EC3m tra \u0111\u01B0\u1EE3c g\u1EEDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng l\xFAc ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}.
              
Thi\u1EBFt b\u1ECB: ${userAgent}
              
Th\xF4ng b\xE1o n\xE0y x\xE1c nh\u1EADn r\u1EB1ng h\u1EC7 th\u1ED1ng g\u1EEDi email tr\xEAn thi\u1EBFt b\u1ECB di \u0111\u1ED9ng \u0111ang ho\u1EA1t \u0111\u1ED9ng b\xECnh th\u01B0\u1EDDng.
              
Tr\xE2n tr\u1ECDng,
Mi Nhon Hotel Mui Ne`
            );
            console.log("K\u1EBFt qu\u1EA3 g\u1EEDi email qua mobile mail:", result);
          } else {
            console.log("G\u1EEDi email v\u1EDBi ph\u01B0\u01A1ng th\u1EE9c th\xF4ng th\u01B0\u1EDDng...");
            const result = await sendServiceConfirmation(toEmail, {
              serviceType: "Mobile Test",
              roomNumber: "DEVICE-TEST",
              timestamp: /* @__PURE__ */ new Date(),
              details: `Email ki\u1EC3m tra g\u1EEDi t\u1EEB thi\u1EBFt b\u1ECB ${isMobile ? "di \u0111\u1ED9ng" : "desktop"} l\xFAc ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}. UA: ${userAgent}`
            });
            console.log("K\u1EBFt qu\u1EA3 g\u1EEDi email th\xF4ng th\u01B0\u1EDDng:", result);
          }
        } catch (innerError) {
          console.error("L\u1ED7i trong timeout callback:", innerError);
          console.error("Chi ti\u1EBFt l\u1ED7i:", JSON.stringify(innerError));
        }
      }, 50);
      res.status(200).json({
        success: true,
        message: "Email \u0111ang \u0111\u01B0\u1EE3c x\u1EED l\xFD, vui l\xF2ng ki\u1EC3m tra h\u1ED9p th\u01B0 sau gi\xE2y l\xE1t",
        deviceType: isMobile ? "mobile" : "desktop",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      handleApiError2(res, error, "Error in mobile test email endpoint:");
    }
  });
  app2.post("/api/mobile-call-summary-email", async (req, res) => {
    try {
      const { toEmail, callDetails } = req.body;
      if (!toEmail || !callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({
          success: false,
          error: "Thi\u1EBFu th\xF4ng tin c\u1EA7n thi\u1EBFt \u0111\u1EC3 g\u1EEDi email",
          missingFields: true
        });
      }
      const userAgent = req.headers["user-agent"] || "";
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      console.log("=================== MOBILE CALL SUMMARY EMAIL ===================");
      console.log("Time:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("Device:", isMobile ? "MOBILE" : "DESKTOP");
      console.log("Room:", callDetails.roomNumber);
      console.log("Recipient:", toEmail);
      console.log("==============================================================");
      const orderReference = callDetails.orderReference || `#ORD-${Math.floor(1e4 + Math.random() * 9e4)}`;
      res.status(200).json({
        success: true,
        message: "Email \u0111ang \u0111\u01B0\u1EE3c x\u1EED l\xFD, vui l\xF2ng ki\u1EC3m tra h\u1ED9p th\u01B0 sau gi\xE2y l\xE1t",
        orderReference,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      try {
        console.log("\u0110ang x\u1EED l\xFD g\u1EEDi email t\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng...");
        const result = await sendMobileCallSummary(toEmail, {
          callId: callDetails.callId || "unknown",
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || "0:00",
          summary: callDetails.summary,
          serviceRequests: callDetails.serviceRequests || [],
          orderReference
        });
        console.log("K\u1EBFt qu\u1EA3 g\u1EEDi email t\xF3m t\u1EAFt cu\u1ED9c g\u1ECDi t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng:", result);
        try {
          console.log("L\u01B0u request t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng v\xE0o database...");
          const cleanedSummary = cleanSummaryContent(callDetails.summary);
          await db2.insert(request).values({
            room_number: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            guestName: callDetails.guestName || "Guest",
            request_content: cleanedSummary,
            created_at: /* @__PURE__ */ new Date(),
            status: "\u0110\xE3 ghi nh\u1EADn",
            updatedAt: /* @__PURE__ */ new Date()
          });
          console.log("\u0110\xE3 l\u01B0u request th\xE0nh c\xF4ng v\xE0o database v\u1EDBi ID:", orderReference);
          await storage.createOrder({
            callId: callDetails.callId || "unknown",
            roomNumber: callDetails.roomNumber,
            orderType: "Room Service",
            deliveryTime: new Date(callDetails.timestamp || Date.now()).toISOString(),
            specialInstructions: callDetails.orderReference || orderReference,
            items: [],
            totalAmount: 0
          });
          console.log("\u0110\xE3 l\u01B0u order v\xE0o b\u1EA3ng orders");
        } catch (dbError) {
          console.error("L\u1ED7i khi l\u01B0u request ho\u1EB7c order t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng v\xE0o DB:", dbError);
        }
      } catch (sendError) {
        console.error("L\u1ED7i khi g\u1EEDi email t\xF3m t\u1EAFt t\u1EEB thi\u1EBFt b\u1ECB di \u0111\u1ED9ng:", sendError);
      }
    } catch (error) {
      handleApiError2(res, error, "L\u1ED7i trong endpoint mobile-call-summary-email:");
    }
  });
  app2.get("/api/mailjet-status", async (req, res) => {
    try {
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({
          success: false,
          error: "Mailjet credentials not configured",
          missingEnv: true
        });
      }
      try {
        const response = await axios.get("https://api.mailjet.com/v3/REST/sender", {
          auth: {
            username: process.env.MAILJET_API_KEY,
            password: process.env.MAILJET_SECRET_KEY
          }
        });
        res.json({
          success: true,
          mailjetConnected: true,
          apiKey: `${process.env.MAILJET_API_KEY.substring(0, 4)}...`,
          totalSenders: response.data.Count,
          senders: response.data.Data.map((sender) => ({
            email: sender.Email,
            name: sender.Name,
            status: sender.Status
          }))
        });
      } catch (apiError) {
        console.error("L\u1ED7i khi k\u1EBFt n\u1ED1i \u0111\u1EBFn Mailjet API:", apiError.message);
        res.status(500).json({
          success: false,
          mailjetConnected: false,
          error: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i \u0111\u1EBFn Mailjet API",
          details: apiError.response?.data || apiError.message
        });
      }
    } catch (error) {
      handleApiError2(res, error, "L\u1ED7i khi ki\u1EC3m tra tr\u1EA1ng th\xE1i Mailjet:");
    }
  });
  app2.get("/api/recent-emails", async (req, res) => {
    try {
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({
          success: false,
          error: "Mailjet credentials not configured",
          missingEnv: true
        });
      }
      console.log("L\u1EA5y danh s\xE1ch email g\u1EA7n \u0111\xE2y t\u1EEB Mailjet");
      try {
        const result = await axios.get("https://api.mailjet.com/v3/REST/message?Limit=20", {
          auth: {
            username: process.env.MAILJET_API_KEY,
            password: process.env.MAILJET_SECRET_KEY
          }
        });
        if (result && result.data && Array.isArray(result.data.Data)) {
          console.log(`T\xECm th\u1EA5y ${result.data.Count} email g\u1EA7n \u0111\xE2y`);
          const emails = result.data.Data.map((message2) => ({
            messageId: message2.ID,
            status: message2.Status || "Unknown",
            to: message2.Recipients && message2.Recipients[0] ? message2.Recipients[0].Email : "Unknown",
            from: message2.Sender ? message2.Sender.Email : "Unknown",
            subject: message2.Subject || "No subject",
            sentAt: message2.ArrivedAt || "Unknown"
          }));
          res.json({
            success: true,
            count: emails.length,
            emails
          });
        } else {
          throw new Error("\u0110\u1ECBnh d\u1EA1ng d\u1EEF li\u1EC7u kh\xF4ng h\u1EE3p l\u1EC7 t\u1EEB Mailjet API");
        }
      } catch (apiError) {
        console.error("L\u1ED7i khi l\u1EA5y d\u1EEF li\u1EC7u email t\u1EEB Mailjet:", apiError.message);
        res.status(500).json({
          success: false,
          error: "Kh\xF4ng th\u1EC3 l\u1EA5y d\u1EEF li\u1EC7u email t\u1EEB Mailjet",
          details: apiError.response?.data || apiError.message
        });
      }
    } catch (error) {
      handleApiError2(res, error, "L\u1ED7i khi l\u1EA5y danh s\xE1ch email g\u1EA7n \u0111\xE2y:");
    }
  });
  app2.get("/api/db-test", async (req, res) => {
    try {
      const recent = await storage.getRecentCallSummaries(1);
      return res.json({ success: true, count: recent.length });
    } catch (dbError) {
      handleApiError2(res, dbError, "DB test error:");
    }
  });
  app2.post("/api/test-transcript", async (req, res) => {
    try {
      const { callId, role, content } = req.body;
      if (!callId || !role || !content) {
        return res.status(400).json({ error: "callId, role, and content are required" });
      }
      const existingCall = await db2.select().from(call).where(eq6(call.callIdVapi, callId)).limit(1);
      if (existingCall.length === 0) {
        const roomMatch = content.match(/room (\d+)/i) || content.match(/phòng (\d+)/i);
        const roomNumber = roomMatch ? roomMatch[1] : null;
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(content);
        const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(content) && !hasVietnamese;
        let language = "en";
        if (hasVietnamese) language = "vi";
        else if (hasFrench) language = "fr";
        await db2.insert(call).values({
          callIdVapi: callId,
          roomNumber,
          duration: 0,
          language,
          createdAt: Date.now()
        });
        console.log(`Test: Auto-created call record for ${callId} with room ${roomNumber || "unknown"} and language ${language}`);
      }
      let callDbId;
      if (existingCall.length > 0) {
        callDbId = existingCall[0].id;
      } else {
        const newCall = await db2.select({ id: call.id }).from(call).where(eq6(call.callIdVapi, callId)).limit(1);
        callDbId = newCall[0]?.id;
      }
      await db2.insert(transcript).values({
        call_id: callDbId,
        role,
        content,
        timestamp: Date.now()
      });
      res.json({ success: true, message: "Test transcript created successfully" });
    } catch (error) {
      handleApiError2(res, error, "Error creating test transcript");
    }
  });
  app2.get("/api/references/:callId", async (req, res) => {
    try {
      const { callId } = req.params;
      const references = await Reference.find({ callId }).sort({ createdAt: -1 });
      res.json(references);
    } catch (error) {
      handleApiError2(res, error, "Error fetching references:");
    }
  });
  app2.post("/api/references", async (req, res) => {
    try {
      const referenceData = req.body;
      const reference = new Reference(referenceData);
      await reference.save();
      res.status(201).json(reference);
    } catch (error) {
      handleApiError2(res, error, "Error creating reference:");
    }
  });
  app2.delete("/api/references/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Reference.findByIdAndDelete(id);
      res.status(204).send();
    } catch (error) {
      handleApiError2(res, error, "Error deleting reference:");
    }
  });
  app2.get("/api/reference-map", (_req, res) => {
    try {
      const raw = process.env.REFERENCE_MAP || "{}";
      const map = JSON.parse(raw);
      res.json(map);
    } catch (error) {
      handleApiError2(res, error, "Invalid REFERENCE_MAP env var:");
    }
  });
  app2.post("/api/staff/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Staff login attempt: ${username}`);
    try {
      const tenantId = await extractTenantFromRequest(req);
      console.log(`\u{1F3E8} Tenant identified for login: ${tenantId}`);
      let staffUser = await findStaffInDatabase(username, password, tenantId);
      if (!staffUser) {
        staffUser = await findStaffInFallback(username, password, tenantId);
      }
      if (!staffUser) {
        console.log("Login failed: Invalid credentials or tenant access denied");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt2.sign(
        {
          username: staffUser.username,
          tenantId: staffUser.tenantId,
          role: staffUser.role,
          permissions: staffUser.permissions || []
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      console.log(`\u2705 Login successful for ${username} at tenant ${tenantId}`);
      res.json({
        token,
        user: {
          username: staffUser.username,
          role: staffUser.role,
          tenantId: staffUser.tenantId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error during login" });
    }
  });
  app2.get("/api/staff/requests", verifyJWT, async (req, res) => {
    console.log("API /api/staff/requests called");
    console.log("Authorization header:", req.headers.authorization);
    try {
      console.log("Checking database connection before querying requests...");
      const dbTest = await db2.execute(sql6`SELECT 1`);
      console.log("Database connection test:", dbTest);
      console.log("Fetching requests from database...");
      const dbRequests = await db2.select().from(request);
      console.log(`Found ${dbRequests.length} requests in database:`, dbRequests);
      if (dbRequests.length === 0) {
        console.log("No requests found in database, returning dummy test data");
        return res.json([
          { id: 1, room_number: "101", guestName: "Tony", request_content: "Beef burger x 2", created_at: /* @__PURE__ */ new Date(), status: "\u0110\xE3 ghi nh\u1EADn", notes: "", orderId: "ORD-10001", updatedAt: /* @__PURE__ */ new Date() },
          { id: 2, room_number: "202", guestName: "Anna", request_content: "Spa booking at 10:00", created_at: /* @__PURE__ */ new Date(), status: "\u0110ang th\u1EF1c hi\u1EC7n", notes: "", orderId: "ORD-10002", updatedAt: /* @__PURE__ */ new Date() }
        ]);
      }
      res.json(dbRequests);
    } catch (err) {
      handleApiError2(res, err, "Error in /api/staff/requests:");
    }
  });
  app2.patch("/api/staff/requests/:id/status", verifyJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const result = await db2.update(request).set({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(request.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ error: "Request not found" });
      }
      const orderId = result[0].orderId;
      if (orderId) {
        const orders2 = await storage.getAllOrders({});
        const order = orders2.find((o) => o.specialInstructions === orderId);
        if (order) {
          const updatedOrder = await storage.updateOrderStatus(order.id, status);
          if (updatedOrder) {
            const io = req.app.get("io");
            if (io) {
              io.emit("order_status_update", {
                orderId: updatedOrder.id,
                reference: updatedOrder.specialInstructions,
                status: updatedOrder.status
              });
            }
            if (updatedOrder.specialInstructions && globalThis.wss) {
              globalThis.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: "order_status_update",
                    reference: updatedOrder.specialInstructions,
                    status: updatedOrder.status
                  }));
                }
              });
            }
          }
        }
      }
      res.json(result[0]);
    } catch (error) {
      handleApiError2(res, error, "Error updating request status:");
    }
  });
  app2.get("/api/staff/requests/:id/messages", verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = messageList.filter((m) => m.requestId === id);
    res.json(msgs);
  });
  app2.post("/api/staff/requests/:id/message", verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Missing content" });
    const msg = {
      id: messageList.length + 1,
      requestId: id,
      sender: "staff",
      content,
      created_at: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    messageList.push(msg);
    res.status(201).json(msg);
  });
  app2.delete("/api/staff/requests/all", verifyJWT, async (req, res) => {
    try {
      console.log("Attempting to delete all requests");
      const result = await deleteAllRequests();
      console.log(`Deleted ${result.length} requests from database`);
      res.json({
        success: true,
        message: `\u0110\xE3 x\xF3a ${result.length} requests`,
        deletedCount: result.length
      });
    } catch (error) {
      handleApiError2(res, error, "Error deleting all requests:");
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders({});
      res.json(orders2);
    } catch (error) {
      handleApiError2(res, error, "Failed to retrieve all orders");
    }
  });
  app2.delete("/api/orders/all", async (req, res) => {
    try {
      const deleted = await storage.deleteAllOrders();
      res.json({ success: true, deletedCount: deleted });
    } catch (error) {
      handleApiError2(res, error, "Error deleting all orders");
    }
  });
  app2.get("/api/analytics/overview", verifyJWT, async (req, res) => {
    try {
      const data = await getOverview();
      res.json(data);
    } catch (error) {
      handleApiError2(res, error, "Failed to fetch analytics overview");
    }
  });
  app2.get("/api/analytics/service-distribution", verifyJWT, async (req, res) => {
    try {
      const data = await getServiceDistribution();
      res.json(data);
    } catch (error) {
      handleApiError2(res, error, "Failed to fetch service distribution");
    }
  });
  app2.get("/api/analytics/hourly-activity", verifyJWT, async (req, res) => {
    try {
      const data = await getHourlyActivity();
      res.json(data);
    } catch (error) {
      handleApiError2(res, error, "Failed to fetch hourly activity");
    }
  });
  app2.use("/api/dashboard", dashboard_default);
  app2.use("/api", health_default);
  if (process.env.NODE_ENV === "development") {
    setTimeout(seedDevelopmentData, 1e3);
  }
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message2, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message2}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server }
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname || process.cwd(),
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname || process.cwd(), "..", "dist/public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath, {
    maxAge: "1y",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  }));
  app2.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/socket.ts
import { Server as SocketIOServer } from "socket.io";
function setupSocket(server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("join_room", (orderId) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined room ${orderId}`);
    });
    socket.on("update_order_status", (data) => {
      const { orderId, status } = data;
      console.log(`Received status update for order ${orderId}: ${status}`);
      io.to(orderId).emit("order_status_update", { orderId, status });
    });
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  return io;
}

// server/index.ts
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
var app = express3();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://api.vapi.ai",
        "https://minhonmuine.talk2go.online",
        "https://*.talk2go.online",
        "https://*.onrender.com",
        "wss:",
        "ws:"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    const allowedDomains = [
      "talk2go.online",
      "localhost",
      "127.0.0.1"
    ];
    const isAllowed = allowedDomains.some(
      (domain) => origin.includes(domain) || origin.endsWith(`.${domain}`)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Tenant-ID"],
  exposedHeaders: ["X-Total-Count", "X-Rate-Limit-Remaining"]
}));
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 1e3,
  // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  }
});
app.use("/api", apiLimiter);
var dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 500,
  // Limit each IP to 500 requests per windowMs for dashboard
  message: "Too many dashboard requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  }
});
app.use("/api/dashboard", dashboardLimiter);
app.use(express3.json({ limit: "10mb" }));
app.use(express3.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  const io = setupSocket(server);
  app.set("io", io);
  if (process.env.AUTO_DB_FIX !== "false") {
    console.log("\u{1F527} Running auto database fix...");
    await runAutoDbFix();
  } else {
    console.log("\u26A0\uFE0F Auto database fix disabled by environment variable");
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message2 = err.message || "Internal Server Error";
    res.status(status).json({ message: message2 });
    throw err;
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 1e4;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
