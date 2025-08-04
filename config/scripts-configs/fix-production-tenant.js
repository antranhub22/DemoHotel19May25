#!/usr/bin/env node

/**
 * Production Tenant Fix Script
 * Creates missing 'minhonmuine' tenant in production database
 */

const { PrismaClient } = require("@prisma/client");

async function fixProductionTenant() {
  console.log("🔧 [Production Fix] Starting tenant creation...");

  try {
    // Connect to production database
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable not found");
    }

    console.log("📀 [Production Fix] Connecting to database...");
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Check if tenant exists
    console.log("🔍 [Production Fix] Checking for existing tenant...");
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        subdomain: "minhonmuine",
      },
    });

    if (existingTenant) {
      console.log("✅ [Production Fix] Tenant already exists:", existingTenant);
      await prisma.$disconnect();
      return;
    }

    // Create missing tenant
    console.log("🏨 [Production Fix] Creating missing tenant...");
    const newTenant = await prisma.tenant.create({
      data: {
        id: "mi-nhon-hotel",
        hotel_name: "Mi Nhon Hotel",
        subdomain: "minhonmuine",
        custom_domain: "minhonmuine.talk2go.online",
        subscription_plan: "premium",
        subscription_status: "active",
        is_active: true,
        monthly_call_limit: 1000,
        max_voices: 5,
        max_languages: 6,
        voice_cloning: true,
        multi_location: true,
        white_label: false,
        data_retention_days: 365,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log("✅ [Production Fix] Tenant created successfully:", newTenant);

    // Verify creation
    const verifyTenant = await prisma.tenant.findFirst({
      where: {
        subdomain: "minhonmuine",
      },
    });

    if (verifyTenant) {
      console.log("🎉 [Production Fix] Verification successful!");
      console.log("📋 [Production Fix] Tenant details:", {
        id: verifyTenant.id,
        hotelName: verifyTenant.hotel_name,
        subdomain: verifyTenant.subdomain,
        status: verifyTenant.subscription_status,
      });
    }

    await prisma.$disconnect();
    console.log("🏁 [Production Fix] Complete! Production should work now.");
  } catch (error) {
    console.error("❌ [Production Fix] Error:", error.message);
    console.error("🔍 [Production Fix] Full error:", error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixProductionTenant();
}

module.exports = { fixProductionTenant };
