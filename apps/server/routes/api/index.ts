/**
 * SaaS Provider Domain - API Routes Index
 * Main API routes integration for SaaS Provider backend services
 */

import { logger } from "@shared/utils/logger";
import express from "express";
import analyticsRoutes from "./analytics";
import platformRoutes from "./platform";
import tenantRoutes from "./tenant";

const router = express.Router();

// ============================================
// API ROUTES REGISTRATION
// ============================================

// SaaS Provider Domain Routes
router.use("/tenant", tenantRoutes);
router.use("/platform", platformRoutes);

// Analytics routes (if exists)
try {
  router.use("/analytics", analyticsRoutes);
} catch {
  logger.warn("[APIRoutes] Analytics routes not available");
}

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SaaS Provider API is healthy",
    timestamp: new Date(),
    services: {
      tenant: "operational",
      platform: "operational",
      billing: "operational",
      analytics: "operational",
    },
  });
});

// API version info
router.get("/version", (req, res) => {
  res.json({
    success: true,
    version: "1.0.0",
    domain: "SaaS Provider",
    features: [
      "Multi-tenant management",
      "Subscription billing",
      "Feature gating",
      "Usage tracking",
      "Platform analytics",
    ],
    lastUpdated: new Date(),
  });
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.json({
    success: true,
    documentation: {
      tenant: {
        endpoints: [
          "GET /api/tenant/current",
          "PUT /api/tenant/:id/subscription",
          "POST /api/tenant/:id/subscription/cancel",
          "GET /api/tenant/:id/usage/current",
          "GET /api/tenant/:id/features",
        ],
        description: "Tenant management and subscription operations",
      },
      platform: {
        endpoints: [
          "GET /api/platform/metrics",
          "GET /api/platform/analytics",
          "GET /api/platform/tenants",
          "GET /api/platform/revenue",
        ],
        description: "Platform-wide analytics and administration",
      },
      analytics: {
        endpoints: [
          "POST /api/analytics/feature-usage",
          "GET /api/analytics/reports",
        ],
        description: "Usage analytics and reporting",
      },
    },
  });
});

export default router;
