#!/usr/bin/env tsx

/**
 * Production Migration Runner
 * Wrapper to run the actual production migration
 */

import { runProductionMigration } from "../../apps/server/startup/production-migration.ts";

console.log("🔧 Running production migration...");

try {
  await runProductionMigration();
  console.log("✅ Production migration completed successfully");
} catch (error) {
  console.error("❌ Production migration failed:", error);
  process.exit(1);
}
