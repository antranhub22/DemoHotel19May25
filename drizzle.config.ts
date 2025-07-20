import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
    "Please set up PostgreSQL and provide DATABASE_URL. " +
    "For local development, you can use Docker: " +
    "docker run -d --name hotel-postgres -e POSTGRES_DB=hotel_dev -e POSTGRES_USER=hotel_user -e POSTGRES_PASSWORD=dev_password -p 5432:5432 postgres:15"
  );
}

// ✅ POSTGRESQL-ONLY CONFIGURATION - Simplified
export default defineConfig({
  out: "./tools/migrations",
  schema: "./packages/shared/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: "timestamp",
  },
});
