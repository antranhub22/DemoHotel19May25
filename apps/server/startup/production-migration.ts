import { logger } from "@shared/utils/logger";

/**
 * Production Migration: Add missing columns to request table
 * Runs automatically on server startup in production
 */
export async function runProductionMigration() {
  // Run when DATABASE_URL exists and contains postgres/postgresql (production environment)
  const databaseUrl = process.env.DATABASE_URL;
  const isPostgreSQL =
    databaseUrl &&
    (databaseUrl.includes("postgres") || databaseUrl.includes("postgresql"));

  if (!isPostgreSQL) {
    logger.debug(
      "⏭️ Skipping production migration (not PostgreSQL environment)",
      "Component",
    );
    console.log(
      `🔍 DATABASE_URL check: ${databaseUrl ? "exists" : "missing"}, isPostgreSQL: ${isPostgreSQL}`,
    );
    return;
  }

  // Dynamic import postgres only when needed (production)
  let postgres: any;
  try {
    // @ts-ignore - Dynamic import for optional dependency
    const postgresModule = await import("postgres");
    postgres = postgresModule.default;
  } catch (error) {
    logger.warn(
      "⚠️ postgres package not available - skipping production migration",
      "Component",
    );
    console.log("💡 This is expected in development environment using SQLite");
    return;
  }

  logger.debug(
    "🚀 [Production Migration] Starting - PostgreSQL detected!",
    "Component",
  );
  logger.debug("📊 Environment: NODE_ENV=${process.env.NODE_ENV}", "Component");
  logger.debug(
    "🔗 Database: ${databaseUrl.substring(0, 20)}...${databaseUrl.substring(databaseUrl.length - 20)}",
    "Component",
  );

  logger.debug(
    "🔧 [Production Migration] Checking database schema...",
    "Component",
  );

  let sql: any;
  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    // Check existing table structures
    const requestColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'request' AND column_name = 'call_id';
    `;

    const transcriptTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'transcript';
    `;

    const hasCallId = requestColumns.length > 0;
    const hasTranscriptTable = transcriptTable.length > 0;

    if (hasCallId && hasTranscriptTable) {
      logger.debug(
        "✅ Database schema already updated - migration not needed",
        "Component",
      );
      return;
    }

    logger.debug(
      "📊 Migration needed - call_id: ${hasCallId}, transcript: ${hasTranscriptTable}",
      "Component",
    );

    logger.debug("🚀 Creating missing tables and columns...", "Component");

    // EXPLICIT TRANSCRIPT TABLE FIX - Check and recreate if needed
    try {
      logger.debug("🔍 Checking transcript table structure...", "Component");

      // Check if transcript table has proper SERIAL PRIMARY KEY
      const transcriptIdColumn = await sql`
        SELECT column_name, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'transcript' AND column_name = 'id';
      `;

      if (transcriptIdColumn.length > 0) {
        const idColumn = transcriptIdColumn[0];
        logger.debug("📋 Current transcript.id column:", "Component", idColumn);

        // Check if it's NOT auto-increment (SERIAL)
        if (
          !idColumn.column_default ||
          !idColumn.column_default.includes("nextval")
        ) {
          logger.debug(
            "🚨 Transcript table has wrong ID column - recreating!",
            "Component",
          );

          // Backup existing data
          logger.debug(
            "📦 Found ${existingTranscripts.length} existing transcripts",
            "Component",
          );

          // Drop and recreate table with proper structure
          await sql`DROP TABLE IF EXISTS transcript CASCADE`;
          logger.debug("✅ Dropped old transcript table", "Component");
        } else {
          logger.debug(
            "✅ Transcript table has proper SERIAL PRIMARY KEY",
            "Component",
          );
        }
      }
    } catch (error: any) {
      logger.debug(
        "⚠️ Error checking transcript table: ${(error as any)?.message || String(error)}",
        "Component",
      );
    }

    // Create missing tables first - EXPLICIT transcript table fix
    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS tenants (
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
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        call_id TEXT NOT NULL,
        room_number TEXT NOT NULL,
        order_type TEXT NOT NULL,
        delivery_time TEXT NOT NULL,
        special_instructions TEXT,
        items JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`,
    ];

    for (const statement of createTableStatements as any[]) {
      try {
        await sql.unsafe(statement);
        logger.debug(
          "✅ Table created: ${statement.substring(0, 50)}...",
          "Component",
        );
      } catch (error: any) {
        logger.debug(
          "⚠️ Table creation may have failed (might be OK): ${(error as any)?.message || String(error).substring(0, 100)}...",
          "Component",
        );
      }
    }

    // Add missing columns to request table
    const alterStatements = [
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS call_id VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium'`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS metadata TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'order'`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2)`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS items TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMP`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS special_instructions TEXT`,
      `ALTER TABLE request ADD COLUMN IF NOT EXISTS order_type VARCHAR(100)`,
    ];

    for (const statement of alterStatements as any[]) {
      try {
        await sql.unsafe(statement);
        logger.debug(
          "✅ Executed: ${statement.substring(0, 50)}...",
          "Component",
        );
      } catch (error: any) {
        // Column might already exist, which is OK
        logger.debug(
          "⚠️ Statement may have failed (might be OK): ${(error as any)?.message || String(error).substring(0, 100)}...",
          "Component",
        );
      }
    }

    // Add indexes for all tables
    const indexStatements = [
      // Request table indexes
      `CREATE INDEX IF NOT EXISTS idx_request_call_id ON request(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_request_status ON request(status)`,
      `CREATE INDEX IF NOT EXISTS idx_request_type ON request(type)`,
      // Transcript table indexes
      `CREATE INDEX IF NOT EXISTS idx_transcript_call_id ON transcript(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transcript_timestamp ON transcript(timestamp)`,
      // Call summaries indexes
      `CREATE INDEX IF NOT EXISTS idx_call_summaries_call_id ON call_summaries(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_call_summaries_timestamp ON call_summaries(timestamp)`,
      // Orders table indexes
      `CREATE INDEX IF NOT EXISTS idx_orders_call_id ON orders(call_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
    ];

    for (const statement of indexStatements as any[]) {
      try {
        await sql.unsafe(statement);
        logger.debug(
          "✅ Index created: ${statement.substring(0, 50)}...",
          "Component",
        );
      } catch (error: any) {
        logger.debug(
          "⚠️ Index creation may have failed: ${(error as any)?.message || String(error).substring(0, 50)}...",
          "Component",
        );
      }
    }

    logger.debug(
      "🎉 Production migration completed successfully!",
      "Component",
    );
  } catch (error: any) {
    logger.error(
      "❌ Production migration failed:",
      "Component",
      (error as any)?.message || String(error),
    );
    // Don't crash the server, just log the error
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}
