"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Import Prisma client
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma client
const prisma = new PrismaClient();

// Export Prisma client
exports.prisma = prisma;
