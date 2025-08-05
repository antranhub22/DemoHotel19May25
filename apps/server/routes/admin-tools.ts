// ============================================
// ADMIN TOOLS ROUTES
// ============================================
// Temporary tools for production management

import express from "express";
import bcrypt from "bcrypt";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";

const router = express.Router();

// ============================================
// CREATE PRODUCTION MANAGER
// ============================================

router.post("/create-manager", async (req, res) => {
  try {
    console.log("🔧 [AdminTools] Creating production manager...");

    const prisma = await PrismaConnectionManager.getInstance();

    // Check if manager exists
    const existingManager = await (prisma as any).staff.findFirst({
      where: { username: "manager" },
    });

    const newPassword = "hotelmanager123"; // 15 characters
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    if (existingManager) {
      // Update existing manager
      await (prisma as any).staff.update({
        where: { id: existingManager.id },
        data: {
          password: hashedPassword,
          is_active: true,
        },
      });

      console.log("✅ [AdminTools] Manager password updated");

      res.json({
        success: true,
        action: "updated",
        credentials: {
          username: "manager",
          password: "hotelmanager123",
          role: "hotel-manager",
        },
      });
    } else {
      // Create new manager
      const newManager = await (prisma as any).staff.create({
        data: {
          tenant_id: "mi-nhon-hotel",
          username: "manager",
          password: hashedPassword,
          first_name: "Hotel",
          last_name: "Manager",
          email: "manager@minhonhotel.com",
          role: "hotel-manager",
          display_name: "Hotel Manager",
          permissions: JSON.stringify([
            "manage_staff",
            "view_analytics",
            "manage_requests",
          ]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log("✅ [AdminTools] Manager created");

      res.json({
        success: true,
        action: "created",
        credentials: {
          username: "manager",
          password: "hotelmanager123",
          role: "hotel-manager",
        },
      });
    }
  } catch (error) {
    console.error("❌ [AdminTools] Error creating manager:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create manager",
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
            ? "15 chars (hotelmanager123)"
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
