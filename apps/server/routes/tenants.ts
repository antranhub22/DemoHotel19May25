/**
 * 🏨 TENANT ROUTES
 *
 * RESTful API routes for tenant management
 * Supports CRUD operations and tenant-specific features
 */

import { TenantController } from "@server/controllers/tenantController";
import { logger } from "@shared/utils/logger";
import { Router } from "express";

const router = Router();

// ============================================
// MIDDLEWARE
// ============================================

// Log all tenant API requests
router.use((req, res, next) => {
  logger.info(`🏨 [TenantRoutes] ${req.method} ${req.path}`, "TenantRoutes", {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
  });
  next();
});

// ============================================
// TENANT CRUD ROUTES
// ============================================

/**
 * Create a new tenant
 * POST /api/tenants
 *
 * Body:
 * {
 *   "hotelName": "Hotel Name",
 *   "subdomain": "hotel-subdomain",
 *   "customDomain": "hotel.com",
 *   "subscriptionPlan": "trial|basic|premium|enterprise",
 *   "email": "contact@hotel.com",
 *   "phone": "+1234567890",
 *   "address": "Hotel Address"
 * }
 */
router.post("/", TenantController.createTenant);

/**
 * Get all tenants with pagination
 * GET /api/tenants
 *
 * Query Parameters:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - subscriptionPlan: string
 * - subscriptionStatus: string
 * - search: string
 */
router.get("/", TenantController.getAllTenants);

/**
 * Get tenant by ID
 * GET /api/tenants/:id
 *
 * Query Parameters:
 * - include: "relations" (optional, includes hotel profiles)
 */
router.get("/:id", TenantController.getTenantById);

/**
 * Get tenant by subdomain
 * GET /api/tenants/subdomain/:subdomain
 */
router.get("/subdomain/:subdomain", TenantController.getTenantBySubdomain);

/**
 * Update tenant
 * PUT /api/tenants/:id
 *
 * Body: Partial tenant data to update
 */
router.put("/:id", TenantController.updateTenant);

/**
 * Delete tenant
 * DELETE /api/tenants/:id
 */
router.delete("/:id", TenantController.deleteTenant);

// ============================================
// TENANT FEATURE ROUTES
// ============================================

/**
 * Check tenant feature access
 * GET /api/tenants/:id/features/:feature
 *
 * Features: voiceCloning, multiLocation, whiteLabel, etc.
 */
router.get("/:id/features/:feature", TenantController.checkFeatureAccess);

/**
 * Get tenant subscription limits
 * GET /api/tenants/:id/limits
 */
router.get("/:id/limits", TenantController.getSubscriptionLimits);

/**
 * Get tenant usage statistics
 * GET /api/tenants/:id/usage
 */
router.get("/:id/usage", TenantController.getTenantUsage);

// ============================================
// UTILITY ROUTES
// ============================================

/**
 * Get tenant service health
 * GET /api/tenants/health
 */
router.get("/health", TenantController.getServiceHealth);

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler for tenant routes
router.use((error: any, req: any, res: any, next: any) => {
  logger.error(
    "❌ [TenantRoutes] Unhandled error in tenant routes",
    "TenantRoutes",
    {
      error: error.message,
      stack: error.stack,
      method: req.method,
      path: req.path,
    },
  );

  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: "Internal server error in tenant management",
      code: "TENANT_ROUTE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================
// EXPORT ROUTER
// ============================================

export default router;
