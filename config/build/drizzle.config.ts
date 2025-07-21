import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite://./apps/dev.db';
const IS_SQLITE = DATABASE_URL.startsWith('sqlite://');

export default IS_SQLITE
  ? defineConfig({
      schema: './packages/shared/db/schema.ts',
      out: './tools/migrations',
      dialect: 'sqlite',
      dbCredentials: {
        url: DATABASE_URL.replace('sqlite://', ''),
      },
      verbose: true,
      strict: true,
    })
  : defineConfig({
      schema: './packages/shared/db/schema.ts',
      out: './tools/migrations',
      dialect: 'postgresql',
      dbCredentials: {
        url: DATABASE_URL,
      },
      verbose: true,
      strict: true,
    });
