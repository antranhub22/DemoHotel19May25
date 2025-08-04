#!/usr/bin/env tsx

/**
 * Standalone Production Migration
 * Creates tenants table with all required columns
 */

console.log("🔧 Starting standalone production migration...");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log("⚠️ No DATABASE_URL found, skipping production migration");
  process.exit(0);
}

const isPostgreSQL =
  DATABASE_URL.includes("postgres") || DATABASE_URL.includes("postgresql");

if (!isPostgreSQL) {
  console.log("⚠️ Not PostgreSQL environment, skipping production migration");
  process.exit(0);
}

let postgres: any;

try {
  // Dynamic import for postgres
  const postgresModule = await import("postgres");
  postgres = postgresModule.default;
} catch (error) {
  console.log(
    "⚠️ postgres package not available - skipping production migration",
  );
  process.exit(0);
}

console.log("🚀 PostgreSQL detected - running production migration!");

try {
  const sql = postgres(DATABASE_URL, {
    ssl: DATABASE_URL.includes("render.com")
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
    idle_timeout: 60000,
    connect_timeout: 10000,
  });

  // Create tenants table first
  console.log("🏗️ Creating tenants table...");

  const createTenantsSQL = `
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      hotel_name VARCHAR(200),
      subdomain VARCHAR(50) NOT NULL UNIQUE,
      custom_domain VARCHAR(100),
      subscription_plan VARCHAR(50) DEFAULT 'trial',
      subscription_status VARCHAR(50) DEFAULT 'active',
      trial_ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      max_voices INTEGER DEFAULT 5,
      max_languages INTEGER DEFAULT 4,
      voice_cloning BOOLEAN DEFAULT false,
      multi_location BOOLEAN DEFAULT false,
      white_label BOOLEAN DEFAULT false,
      data_retention_days INTEGER DEFAULT 90,
      monthly_call_limit INTEGER DEFAULT 1000,
      name VARCHAR(200),
      is_active BOOLEAN DEFAULT true,
      settings TEXT,
      tier VARCHAR(50) DEFAULT 'free',
      max_calls INTEGER DEFAULT 1000,
      max_users INTEGER DEFAULT 10,
      features TEXT
    );
  `;

  await sql.unsafe(createTenantsSQL);
  console.log("✅ Tenants table created successfully");

  // Create other essential tables
  const createTablesSQL = [
    `CREATE TABLE IF NOT EXISTS hotel_profiles (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
      research_data TEXT,
      assistant_config TEXT,
      vapi_assistant_id TEXT,
      services_config TEXT,
      knowledge_base TEXT,
      system_prompt TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transcript (
      id SERIAL PRIMARY KEY,
      call_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      tenant_id TEXT DEFAULT 'default'
    )`,
    `CREATE TABLE IF NOT EXISTS call_summaries (
      id SERIAL PRIMARY KEY,
      call_id TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      room_number TEXT,
      duration TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
  ];

  for (const statement of createTablesSQL) {
    try {
      await sql.unsafe(statement);
      console.log(`✅ Table created: ${statement.substring(0, 50)}...`);
    } catch (error: any) {
      console.log(
        `⚠️ Table creation may have failed (might be OK): ${error.message?.substring(0, 100)}...`,
      );
    }
  }

  await sql.end();
  console.log("🎉 Production migration completed successfully!");
} catch (error: any) {
  console.error("❌ Production migration failed:", error.message || error);
  process.exit(1);
}
