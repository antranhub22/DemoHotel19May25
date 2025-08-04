import express from "express";

const router = express.Router();

// ✅ DEBUG: Simple test endpoint (NO AUTH REQUIRED)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Debug test endpoint working",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

// ✅ DEBUG: Comprehensive database test (NO AUTH REQUIRED)
router.get("/db-comprehensive", async (_req, res) => {
  try {
    const { Client } = await import("pg");
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: "DATABASE_URL is not set",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      "🔍 Testing DATABASE_URL:",
      databaseUrl.substring(0, 30) + "...",
    );

    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test connection
    await client.connect();
    console.log("✅ Database connection successful");

    // Test simple query
    const result = await client.query("SELECT 1 as test, NOW() as timestamp");
    console.log("✅ Query successful:", result.rows[0]);

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);
    console.log("✅ Tables found:", tables);

    await client.end();

    res.json({
      success: true,
      message: "Database connection and queries successful",
      data: {
        connected: true,
        databaseUrlSet: true,
        databaseUrlLength: databaseUrl.length,
        databaseUrlPrefix: databaseUrl.substring(0, 30) + "...",
        testQuery: result.rows[0],
        tables: tables,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Database test failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Database connection failed",
      details: {
        code: error.code,
        message: error.message,
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ DEBUG: Simple database test (NO AUTH REQUIRED)
router.get("/db-test", async (_req, res) => {
  try {
    // ✅ MIGRATED: Use Prisma instead of Drizzle
    const { PrismaClient } = await import("../../../generated/prisma");
    const prisma = new PrismaClient();

    // Simple test query using Prisma
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    res.json({
      success: true,
      message: "Database connection successful",
      data: {
        connected: true,
        testResult: result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Database test failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// ✅ DEBUG: Environment variables endpoint (NO AUTH REQUIRED)
router.get("/env", (_req, res) => {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 30) + "..."
        : "N/A",
      PORT: process.env.PORT,
      RENDER: process.env.RENDER,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      timestamp: new Date().toISOString(),
    };

    logger.info("Environment variables check: " + JSON.stringify(envInfo));
    res.json({
      success: true,
      data: envInfo,
    });
  } catch (error) {
    logger.error("Environment check failed:", error);
    res.status(500).json({
      success: false,
      error: "Environment check failed",
    });
  }
});

// ✅ DEBUG: Database connection test (NO AUTH REQUIRED)
router.get("/db", async (_req, res) => {
  try {
    // ✅ MIGRATED: Use Prisma instead of Drizzle
    const { PrismaClient } = await import("../../../generated/prisma");
    const prisma = new PrismaClient();

    // Test basic connection using Prisma
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    const dbInfo = {
      connected: true,
      testQuery: result,
      timestamp: new Date().toISOString(),
    };

    logger.info("Database connection test successful");
    res.json({
      success: true,
      data: dbInfo,
    });
  } catch (error) {
    logger.error("Database connection test failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Database connection failed",
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ DEBUG: Test DATABASE_URL specifically (NO AUTH REQUIRED)
router.post("/test-db", async (_req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return res.status(500).json({
        success: false,
        error: "DATABASE_URL is not set",
        details: {
          missing: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Test connection with current DATABASE_URL
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const result = await prisma.$queryRaw`SELECT 1 as connection_test`;

    const connectionInfo = {
      databaseUrlSet: true,
      databaseUrlLength: dbUrl.length,
      databaseUrlPrefix: dbUrl.substring(0, 20) + "...",
      connectionTest: result,
      timestamp: new Date().toISOString(),
    };

    logger.info("DATABASE_URL test successful");
    res.json({
      success: true,
      data: connectionInfo,
    });
  } catch (error) {
    logger.error("DATABASE_URL test failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "DATABASE_URL test failed",
      details: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ DEBUG: Production DATABASE_URL test (NO AUTH REQUIRED)
router.get("/production-db-test", async (_req, res) => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: "DATABASE_URL is not set",
        details: {
          missing: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Mask password for security
    const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ":****@");

    const debugInfo = {
      databaseUrlExists: true,
      databaseUrlLength: databaseUrl.length,
      databaseUrlMasked: maskedUrl,
      isPostgreSQL:
        databaseUrl.includes("postgresql://") ||
        databaseUrl.includes("postgres://"),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    // Test connection
    try {
      const { Client } = await import("pg");
      const client = new Client({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 10000,
      });

      await client.connect();
      const result = await client.query(
        "SELECT NOW() as current_time, version() as db_version",
      );

      await client.end();

      res.json({
        success: true,
        message: "Production DATABASE_URL test successful",
        data: {
          ...debugInfo,
          connectionTest: {
            connected: true,
            currentTime: result.rows[0].current_time,
            dbVersion: result.rows[0].db_version.substring(0, 100) + "...",
          },
        },
      });
    } catch (dbError) {
      res.json({
        success: false,
        error: "Database connection failed",
        details: {
          ...debugInfo,
          connectionError: {
            code: dbError.code,
            message: dbError.message,
            stack: dbError.stack,
          },
        },
      });
    }
  } catch (error) {
    logger.error("Production DATABASE_URL test failed:", error);
    res.status(500).json({
      success: false,
      error: "Production DATABASE_URL test failed",
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
