import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// Create config based on environment
let config;

// Use SQLite for development if no DATABASE_URL is provided
if (!DATABASE_URL && !isProduction) {
  config = defineConfig({
    out: "./migrations",
    schema: "./src/db/schema.ts", 
    dialect: "sqlite",
    dbCredentials: {
      url: "./dev.db",
    },
  });
} else if (!DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
} else {
  config = defineConfig({
    out: "./migrations",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: DATABASE_URL,
    },
  });
}

export default config;
