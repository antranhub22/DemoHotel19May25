import express from 'express';
import { getDatabase } from '@shared/db';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ✅ DEBUG: Environment variables endpoint (NO AUTH REQUIRED)
router.get('/env', (req, res) => {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 30) + '...'
        : 'N/A',
      PORT: process.env.PORT,
      RENDER: process.env.RENDER,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      timestamp: new Date().toISOString(),
    };

    logger.info('Environment variables check:', envInfo);
    res.json({
      success: true,
      data: envInfo,
    });
  } catch (error) {
    logger.error('Environment check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Environment check failed',
    });
  }
});

// ✅ DEBUG: Database connection test (NO AUTH REQUIRED)
router.get('/db', async (req, res) => {
  try {
    const db = getDatabase();

    // Test basic connection
    const result = await db.select().from(db.raw('1 as test')).limit(1);

    const dbInfo = {
      connected: true,
      testQuery: result,
      timestamp: new Date().toISOString(),
    };

    logger.info('Database connection test successful');
    res.json({
      success: true,
      data: dbInfo,
    });
  } catch (error) {
    logger.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Database connection failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// ✅ DEBUG: Test DATABASE_URL specifically (NO AUTH REQUIRED)
router.post('/test-db', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL is not set',
        details: {
          missing: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Test connection with current DATABASE_URL
    const db = getDatabase();
    const result = await db
      .select()
      .from(db.raw('1 as connection_test'))
      .limit(1);

    const connectionInfo = {
      databaseUrlSet: true,
      databaseUrlLength: dbUrl.length,
      databaseUrlPrefix: dbUrl.substring(0, 20) + '...',
      connectionTest: result,
      timestamp: new Date().toISOString(),
    };

    logger.info('DATABASE_URL test successful');
    res.json({
      success: true,
      data: connectionInfo,
    });
  } catch (error) {
    logger.error('DATABASE_URL test failed:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'DATABASE_URL test failed',
      details: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
