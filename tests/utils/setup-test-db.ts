import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import * as fs from "fs";

// Use Prisma Client for type definitions
const prisma = new PrismaClient();

/**
 * Setup test database with all required tables for integration testing
 */
export async function setupTestDatabase(dbPath: string) {
  // Remove existing database if exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Create new test database using Prisma
  const testTenantId = randomUUID();
  const now = new Date();

  // Create test tenant using Prisma
  await prisma.tenant.create({
    data: {
      id: testTenantId,
      hotel_name: "Mi Nhon Hotel",
      subdomain: "mi-nhon",
      created_at: now,
      updated_at: now,
      subscription_plan: "trial",
      subscription_status: "active",
      max_voices: 5,
      max_languages: 4,
      voice_cloning: false,
      multi_location: false,
      white_label: false,
      data_retention_days: 90,
      monthly_call_limit: 1000,
      is_active: true,
      tier: "free",
      max_calls: 1000,
      max_users: 10,
    },
  });

  console.log(`✅ Test database initialized with Prisma`);
  console.log(`✅ Test tenant created with ID: ${testTenantId}`);

  return { prisma, testTenantId };
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase() {
  // Clean up test data using Prisma
  await prisma.tenant.deleteMany();
  await prisma.hotelProfile.deleteMany();
  await prisma.call.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.request.deleteMany();
  await prisma.message.deleteMany();
  await prisma.staff.deleteMany();

  await prisma.$disconnect();
  console.log(`🗑️ Test database cleaned up`);
}

// Export Prisma client for tests
export { prisma };
