#!/usr/bin/env ts-node
"use strict";

const bcrypt = require("bcryptjs");
const readline = require("readline");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function main() {
  try {
    const email =
      (await prompt("Admin email (default: admin@hotel.com): ")) ||
      "admin@hotel.com";
    const password = await prompt("Admin password: ");

    if (!password) {
      console.error("Password is required!");
      process.exit(1);
    }

    const tenantId =
      (await prompt("Tenant ID (default: mi-nhon-hotel): ")) || "mi-nhon-hotel";
    const hash = await bcrypt.hash(password, 10);
    const now = new Date();

    // Check if user exists
    const found = await prisma.staff.findFirst({
      where: {
        username: email,
      },
    });

    if (found) {
      // Update existing user
      await prisma.staff.update({
        where: {
          username: email,
        },
        data: {
          password_hash: hash,
          role: "admin",
          tenant_id: tenantId,
          updated_at: now,
        },
      });

      console.log(`✅ Updated admin user: ${email} (tenant: ${tenantId})`);
    } else {
      // Create new user
      await prisma.staff.create({
        data: {
          username: email,
          password_hash: hash,
          role: "admin",
          tenant_id: tenantId,
          name: "Administrator",
          email: email,
          created_at: now,
          updated_at: now,
        },
      });

      console.log(`✅ Created new admin user: ${email} (tenant: ${tenantId})`);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
