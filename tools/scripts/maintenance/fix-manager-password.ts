#!/usr/bin/env tsx

import { Pool } from "pg";
import bcrypt from "bcrypt";

/**
 * Fix Manager Password Script
 * Updates manager password to meet 12-character requirement
 */

async function fixManagerPassword(): Promise<void> {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.log("⚠️ DATABASE_URL not found");
    return;
  }

  if (!DATABASE_URL.includes("postgres")) {
    console.log("⚠️ Not a PostgreSQL database");
    return;
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    // New password that meets 12-character requirement
    const newPassword = "manager123456"; // 13 characters
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update manager password
    await client.query(
      `UPDATE staff SET password = $1 WHERE username = 'manager'`,
      [hashedPassword],
    );

    console.log("✅ Manager password updated successfully!");
    console.log("🔑 New credentials:");
    console.log("  Username: manager");
    console.log("  Password: manager123456");
    console.log("  Role: hotel-manager");

    // Verify the update
    const result = await client.query(
      `SELECT username, role FROM staff WHERE username = 'manager'`,
    );

    if (result.rows.length > 0) {
      console.log(
        `✅ Verified: ${result.rows[0].username} (${result.rows[0].role})`,
      );
    }

    client.release();
  } catch (error) {
    console.error("❌ Error updating manager password:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
fixManagerPassword()
  .then(() => {
    console.log("🎉 Manager password fix completed!");
  })
  .catch((error) => {
    console.error("Script error:", error);
  });
