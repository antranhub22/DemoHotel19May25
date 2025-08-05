#!/usr/bin/env node

/**
 * Create Production Manager Script
 * Creates manager account with 12+ character password for production
 */

const { Pool } = require("pg");
const bcrypt = require("bcrypt");

async function createProductionManager() {
  // Get DATABASE_URL from environment or command line
  const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

  if (!DATABASE_URL) {
    console.log("❌ Usage: node create-production-manager.cjs <DATABASE_URL>");
    console.log("❌ Or set DATABASE_URL environment variable");
    return;
  }

  if (!DATABASE_URL.includes("postgres")) {
    console.log("⚠️ Not a PostgreSQL database");
    return;
  }

  console.log("🐘 Connecting to PostgreSQL...");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    
    // Check if manager exists
    const existing = await client.query(
      `SELECT id, username, role FROM staff WHERE username = 'manager'`
    );
    
    if (existing.rows.length > 0) {
      console.log("📝 Manager exists, updating password...");
      
      // Update existing manager with new password
      const newPassword = "hotelmanager123"; // 15 characters
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await client.query(
        `UPDATE staff SET password = $1 WHERE username = 'manager'`,
        [hashedPassword]
      );
      
      console.log("✅ Manager password updated!");
      console.log("🔑 Updated credentials:");
      console.log("  Username: manager");
      console.log("  Password: hotelmanager123");
      console.log("  Role: hotel-manager");
      
    } else {
      console.log("👤 Creating new manager account...");
      
      // Create new manager
      const newPassword = "hotelmanager123"; // 15 characters
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await client.query(
        `INSERT INTO staff (
          tenant_id, username, password, first_name, last_name, 
          email, role, display_name, permissions, is_active, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        )`,
        [
          'mi-nhon-hotel',
          'manager',
          hashedPassword,
          'Hotel',
          'Manager',
          'manager@minhonhotel.com',
          'hotel-manager',
          'Hotel Manager',
          JSON.stringify(['manage_staff', 'view_analytics', 'manage_requests']),
          true
        ]
      );
      
      console.log("✅ Manager created!");
      console.log("🔑 New credentials:");
      console.log("  Username: manager");
      console.log("  Password: hotelmanager123");
      console.log("  Role: hotel-manager");
    }
    
    // Test the password
    const testResult = await client.query(
      `SELECT password FROM staff WHERE username = 'manager'`
    );
    
    if (testResult.rows.length > 0) {
      const isValid = await bcrypt.compare('hotelmanager123', testResult.rows[0].password);
      console.log(`🧪 Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    client.release();
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

// Run the script
createProductionManager()
  .then(() => {
    console.log("🎉 Production manager setup completed!");
  })
  .catch((error) => {
    console.error("❌ Script error:", error);
  });