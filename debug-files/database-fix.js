// ============================================
// PRODUCTION DATABASE FIX
// ============================================

// ✅ FIX: Enhanced database connection with better error handling
import { connectionManager } from '@shared/db/connectionManager';
import { logger } from '@shared/utils/logger';

export async function initializeProductionDatabase() {
  try {
    console.log('🚀 Initializing production database...');

    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL environment variable is required for production'
      );
    }

    // Initialize with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const db = await connectionManager.initialize();
        console.log('✅ Production database initialized successfully');
        return db;
      } catch (error) {
        retries--;
        console.error(
          `❌ Database initialization failed (retries left: ${retries}):`,
          error.message
        );
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize production database:', error);
    throw error;
  }
}

// ✅ FIX: Enhanced error handling for database operations
export async function safeDatabaseOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    logger.error('Database operation failed:', error);

    // Check for specific database errors
    if (
      error.message.includes('connection') ||
      error.message.includes('timeout')
    ) {
      throw new Error('Database connection error. Please try again.');
    }

    throw error;
  }
}
