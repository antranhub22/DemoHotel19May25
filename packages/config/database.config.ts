/* ========================================
   DATABASE CONFIGURATION - PostgreSQL Only
   ======================================== */

import { z } from 'zod';

// ========================================
// DATABASE SCHEMA
// ========================================

const DatabaseSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_SSL: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// ========================================
// DATABASE CONFIG - PostgreSQL Only
// ========================================

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL environment variable is required!\n' +
      '📋 Please set up PostgreSQL and provide DATABASE_URL.\n' +
      '🐳 For local development, you can use Docker:\n' +
      '   docker run -d --name hotel-postgres \\\n' +
      '     -e POSTGRES_DB=hotel_dev \\\n' +
      '     -e POSTGRES_USER=hotel_user \\\n' +
      '     -e POSTGRES_PASSWORD=dev_password \\\n' +
      '     -p 5432:5432 postgres:15\n' +
      '🔗 Then set: DATABASE_URL=postgresql://hotel_user:dev_password@localhost:5432/hotel_dev'
  );
}

export const databaseConfig = {
  // Connection
  url: DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'hotel_dev',
  user: process.env.DB_USER || 'hotel_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',

  // Type - Always PostgreSQL
  type: 'postgresql' as const,

  // Options
  options: {
    logging: process.env.NODE_ENV === 'development',
    synchronize: false, // Use migrations instead
    dropSchema: false,
    migrationsRun: true,
    entities: ['**/*.entity{.ts,.js}'],
    migrations: ['migrations/*{.ts,.js}'],
    subscribers: ['**/*.subscriber{.ts,.js}'],
  },

  // Pool Configuration
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },

  // Migration Configuration
  migrations: {
    tableName: 'migrations',
    directory: 'migrations',
    transactional: true,
    disableForeignKeys: false,
  },

  // Seeding Configuration
  seeding: {
    enabled: process.env.NODE_ENV === 'development',
    directory: 'seeds',
    runOnMigration: true,
  },
} as const;

// ========================================
// CONNECTION STRING BUILDER
// ========================================

export const getConnectionString = (): string => {
  if (databaseConfig.url) {
    return databaseConfig.url;
  }

  const params = new URLSearchParams();
  if (databaseConfig.ssl) params.append('sslmode', 'require');

  return `postgresql://${databaseConfig.user}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.name}?${params.toString()}`;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const isPostgreSQL = (): boolean => {
  return true; // Always PostgreSQL now
};

export const validateDatabaseConfig = () => {
  try {
    DatabaseSchema.parse(process.env);
    console.log('✅ Database configuration is valid');
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Database configuration errors:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      return { success: false, errors: error.errors };
    }
    return {
      success: false,
      errors: [{ message: 'Invalid database configuration' }],
    };
  }
};

// ========================================
// TYPE EXPORTS
// ========================================

export type DatabaseType = 'postgresql';
export type DatabaseConfig = typeof databaseConfig;
