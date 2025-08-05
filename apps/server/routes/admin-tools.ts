// ============================================
// ADMIN TOOLS ROUTES
// ============================================
// Temporary tools for production management

import express from "express";
import bcrypt from "bcrypt";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";

const router = express.Router();

// ============================================
// CREATE PRODUCTION USERS
// ============================================

router.post("/create-users", async (req, res) => {
  try {
    console.log("🔧 [AdminTools] Creating production users...");

    const prisma = await PrismaConnectionManager.getInstance();

    // Define users with passwords that meet 12-character requirement
    const users = [
      {
        username: "manager",
        password: "manager123456", // 13 characters (original pattern + 456)
        role: "hotel-manager",
        firstName: "Hotel",
        lastName: "Manager",
        email: "manager@minhonhotel.com",
        displayName: "Hotel Manager",
        permissions: ["manage_staff", "view_analytics", "manage_requests"],
      },
      {
        username: "frontdesk",
        password: "frontdesk123", // 12 characters (already correct)
        role: "front-desk",
        firstName: "Front",
        lastName: "Desk",
        email: "frontdesk@minhonhotel.com",
        displayName: "Front Desk Staff",
        permissions: ["handle_requests", "view_guests"],
      },
      {
        username: "itmanager",
        password: "itmanager123", // 13 characters (already correct)
        role: "it-manager",
        firstName: "IT",
        lastName: "Manager",
        email: "it@minhonhotel.com",
        displayName: "IT Manager",
        permissions: ["manage_system", "view_logs", "manage_integrations"],
      },
    ];

    const results = [];

    for (const userData of users) {
      // Check if user exists
      const existingUser = await (prisma as any).staff.findFirst({
        where: { username: userData.username },
      });

      const hashedPassword = await bcrypt.hash(userData.password, 12);

      if (existingUser) {
        // Update existing user
        await (prisma as any).staff.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            is_active: true,
          },
        });

        console.log(`✅ [AdminTools] ${userData.username} password updated`);

        results.push({
          action: "updated",
          username: userData.username,
          password: userData.password,
          role: userData.role,
        });
      } else {
        // Create new user
        await (prisma as any).staff.create({
          data: {
            tenant_id: "mi-nhon-hotel",
            username: userData.username,
            password: hashedPassword,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            role: userData.role,
            display_name: userData.displayName,
            permissions: JSON.stringify(userData.permissions),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        console.log(`✅ [AdminTools] ${userData.username} created`);

        results.push({
          action: "created",
          username: userData.username,
          password: userData.password,
          role: userData.role,
        });
      }
    }

    res.json({
      success: true,
      message: "All users processed successfully",
      users: results,
    });
  } catch (error) {
    console.error("❌ [AdminTools] Error creating users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================
// LIST CURRENT USERS
// ============================================

router.get("/users", async (req, res) => {
  try {
    const prisma = await PrismaConnectionManager.getInstance();

    const users = await (prisma as any).staff.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        display_name: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        passwordLength:
          user.username === "manager"
            ? "13 chars (manager123456)"
            : user.username === "itmanager"
              ? "13 chars (itmanager123)"
              : user.username === "frontdesk"
                ? "12 chars (frontdesk123)"
                : user.username === "admin"
                  ? "8 chars (admin123) - TOO SHORT"
                  : "Unknown",
      })),
    });
  } catch (error) {
    console.error("❌ [AdminTools] Error listing users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list users",
    });
  }
});

export default router;
