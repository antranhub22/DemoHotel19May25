/* ========================================
   DATABASE CONFIGURATION
   ======================================== */

import { z } from 'zod';

// ========================================
// DATABASE SCHEMA
// ========================================

const DatabaseSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_SSL: z.string().transform(val => val === 'true').optional(),
});

// ========================================
// DATABASE CONFIG
// ========================================

export const databaseConfig = {
  // Connection
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'minhon_hotel',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',

  // Type
  type: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',

  // Options
  options: {
    logging: process.env.NODE_ENV === 'development',
    synchronize: process.env.NODE_ENV === 'development',
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

  if (databaseConfig.type === 'postgresql') {
    const params = new URLSearchParams();
    if (databaseConfig.ssl) params.append('sslmode', 'require');
    
    return `postgresql://${databaseConfig.user}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.name}?${params.toString()}`;
  }

  return `file:./dev.db`;
};

// ========================================
// VALIDATION
// ========================================

export const validateDatabaseConfig = () => {
  try {
    DatabaseSchema.parse(process.env);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Unknown validation error' }] };
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const isPostgreSQL = (): boolean => {
  return databaseConfig.type === 'postgresql';
};

export const isSQLite = (): boolean => {
  return databaseConfig.type === 'sqlite';
};

export const getDatabaseName = (): string => {
  return databaseConfig.name;
};

export const shouldLogQueries = (): boolean => {
  return databaseConfig.options.logging;
};

export const shouldSynchronize = (): boolean => {
  return databaseConfig.options.synchronize;
};

// ========================================
// TYPE DEFINITIONS
// ========================================

export type DatabaseConfig = typeof databaseConfig;
export type DatabaseType = 'postgresql' | 'sqlite';
export type DatabaseEnvironment = z.infer<typeof DatabaseSchema>; 