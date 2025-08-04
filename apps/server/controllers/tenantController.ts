/**
 * 🏨 TENANT CONTROLLER
 *
 * RESTful API controller for tenant management operations
 * Uses Prisma ORM for database operations
 * Supports multi-tenant architecture with proper isolation
 */

import { DatabaseServiceFactory } from "@shared/db/DatabaseServiceFactory";
import { logger } from "@shared/utils/logger";
import { ResponseWrapper } from "@shared/utils/responseWrapper";
import { Request, Response } from "express";

// Import database service factory
import { IDatabaseService } from "@shared/db/IDatabaseService";

// ============================================
// TENANT CONTROLLER CLASS
// ============================================

export class TenantController {
  /**
   * 🔄 Get tenant service instance
   */
  private static async getTenantService(): Promise<IDatabaseService> {
    try {
      logger.info("🔄 [TenantController] Initializing Prisma Tenant Service");

      // Initialize Prisma connections if not already done
      await DatabaseServiceFactory.initializeConnections();

      // Get unified Prisma database service
      const databaseService =
        await DatabaseServiceFactory.createDatabaseService();

      logger.info("✅ [TenantController] Prisma Tenant Service initialized");
      return databaseService;
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to initialize Prisma service",
        error,
      );
      throw error;
    }
  }

  /**
   * 🔄 Check if service is valid
   */
  private static isValidService(service: any): boolean {
    return service && typeof service === "object";
  }

  // ============================================
  // TENANT CRUD OPERATIONS
  // ============================================

  /**
   * Create a new tenant
   * POST /api/tenants
   */
  static async createTenant(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "🏨 [TenantController] Creating new tenant",
        "TenantController",
      );

      const {
        hotelName,
        subdomain,
        customDomain,
        subscriptionPlan = "trial",
        email,
        phone,
        address,
      } = req.body;

      // Validate required fields
      if (!hotelName || !subdomain) {
        ResponseWrapper.sendValidationError(res, [
          {
            field: !hotelName ? "hotelName" : "subdomain",
            message: `${!hotelName ? "Hotel name" : "Subdomain"} is required`,
          },
        ]);
        return;
      }

      const service = await TenantController.getTenantService();

      // Create tenant using Prisma service
      const tenantData = {
        id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hotel_name: hotelName,
        subdomain,
        domain: customDomain,
        subscription_plan: subscriptionPlan,
        email,
        phone,
        address,
      };

      const createdTenant = await service.createTenant(tenantData);
      const result = { success: true, data: createdTenant };

      logger.info(
        "🎯 [TenantController] Using Prisma service for createTenant",
        "TenantController",
      );

      if (result.success) {
        logger.success(
          "✅ [TenantController] Tenant created successfully",
          "TenantController",
          {
            tenantId: result.data.id,
          },
        );

        ResponseWrapper.sendCreated(
          res,
          result.data,
          "Tenant created successfully",
        );
      } else {
        logger.error(
          "❌ [TenantController] Failed to create tenant",
          "TenantController",
          {
            error: result.error,
          },
        );

        ResponseWrapper.sendError(
          res,
          result.error || "Failed to create tenant",
          500,
        );
      }
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to create tenant",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to create tenant");
    }
  }

  /**
   * Get tenant by ID
   * GET /api/tenants/:id
   */
  static async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include === "relations";

      logger.info(
        `🔍 [TenantController] Getting tenant by ID: ${id}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Get tenant using Prisma service
      const tenant = await service.getTenantById(id, includeRelations);

      if (!tenant) {
        ResponseWrapper.sendNotFound(res, "Tenant not found");
        return;
      }

      logger.success(
        "✅ [TenantController] Tenant retrieved successfully",
        "TenantController",
        {
          tenantId: id,
        },
      );

      ResponseWrapper.sendResponse(res, tenant, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get tenant by ID",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to retrieve tenant");
    }
  }

  /**
   * Get tenant by subdomain
   * GET /api/tenants/subdomain/:subdomain
   */
  static async getTenantBySubdomain(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { subdomain } = req.params;

      logger.info(
        `🔍 [TenantController] Getting tenant by subdomain: ${subdomain}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Get tenant using Prisma service
      const tenant = await service.getTenantBySubdomain(subdomain);

      if (!tenant) {
        ResponseWrapper.sendNotFound(res, "Tenant not found");
        return;
      }

      logger.success(
        "✅ [TenantController] Tenant retrieved by subdomain",
        "TenantController",
        {
          subdomain,
          tenantId: tenant.id,
        },
      );

      ResponseWrapper.sendResponse(res, tenant, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get tenant by subdomain",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to retrieve tenant");
    }
  }

  /**
   * Get all tenants with pagination
   * GET /api/tenants
   */
  static async getAllTenants(req: Request, res: Response): Promise<void> {
    try {
      const {
        limit = 50,
        offset = 0,
        subscriptionPlan,
        subscriptionStatus,
        search,
      } = req.query;

      logger.info(
        "📋 [TenantController] Getting all tenants",
        "TenantController",
        {
          limit: Number(limit),
          offset: Number(offset),
        },
      );

      const service = await TenantController.getTenantService();

      // Get all tenants using Prisma service
      const tenants = await service.getAllTenants();
      const result = { tenants, total: tenants.length };

      logger.success(
        "✅ [TenantController] Tenants retrieved successfully",
        "TenantController",
        {
          count: result.tenants.length,
          total: result.total,
        },
      );

      ResponseWrapper.sendResponse(
        res,
        {
          data: result.tenants,
          meta: {
            total: result.total,
            limit: Number(limit),
            offset: Number(offset),
          },
        },
        200,
      );
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get all tenants",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to retrieve tenants");
    }
  }

  /**
   * Update tenant
   * PUT /api/tenants/:id
   */
  static async updateTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      logger.info(
        `🔄 [TenantController] Updating tenant: ${id}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Update tenant using Prisma service
      const updatedTenant = await service.updateTenant(id, updates);
      const result = { success: true, data: updatedTenant };

      if (result.success) {
        logger.success(
          "✅ [TenantController] Tenant updated successfully",
          "TenantController",
          {
            tenantId: id,
          },
        );

        ResponseWrapper.sendResponse(
          res,
          result.data,
          200,
          "Tenant updated successfully",
        );
      } else {
        logger.error(
          "❌ [TenantController] Failed to update tenant",
          "TenantController",
          {
            error: result.error,
          },
        );

        ResponseWrapper.sendError(
          res,
          result.error || "Failed to update tenant",
          500,
        );
      }
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to update tenant",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to update tenant");
    }
  }

  /**
   * Delete tenant
   * DELETE /api/tenants/:id
   */
  static async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(
        `🗑️ [TenantController] Deleting tenant: ${id}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Delete tenant using Prisma service
      await service.deleteTenant(id);
      const success = true;

      if (success) {
        logger.success(
          "✅ [TenantController] Tenant deleted successfully",
          "TenantController",
          {
            tenantId: id,
          },
        );

        ResponseWrapper.sendResponse(
          res,
          null,
          200,
          "Tenant deleted successfully",
        );
      } else {
        ResponseWrapper.sendError(res, "Failed to delete tenant", 500);
      }
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to delete tenant",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to delete tenant");
    }
  }

  // ============================================
  // TENANT FEATURE MANAGEMENT
  // ============================================

  /**
   * Check tenant feature access
   * GET /api/tenants/:id/features/:feature
   */
  static async checkFeatureAccess(req: Request, res: Response): Promise<void> {
    try {
      const { id, feature } = req.params;

      logger.info(
        `🏴 [TenantController] Checking feature access for tenant: ${id}`,
        "TenantController",
        {
          feature,
        },
      );

      const service = await TenantController.getTenantService();

      // Check feature access using Prisma service
      const hasAccess = await service.hasFeatureAccess(id, feature as any);

      logger.info(
        "✅ [TenantController] Feature access checked",
        "TenantController",
        {
          tenantId: id,
          feature,
          hasAccess,
        },
      );

      ResponseWrapper.sendResponse(res, { hasAccess }, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to check feature access",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to check feature access");
    }
  }

  /**
   * Get tenant subscription limits
   * GET /api/tenants/:id/limits
   */
  static async getSubscriptionLimits(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(
        `📊 [TenantController] Getting subscription limits for tenant: ${id}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Get subscription limits using Prisma service
      const tenant = await service.getTenantById(id);
      if (!tenant) {
        ResponseWrapper.sendNotFound(res, "Tenant not found");
        return;
      }
      const limits = service.getSubscriptionLimits(
        tenant.subscription_plan || "trial",
      );

      logger.success(
        "✅ [TenantController] Subscription limits retrieved",
        "TenantController",
        {
          tenantId: id,
        },
      );

      ResponseWrapper.sendResponse(res, limits, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get subscription limits",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(
        res,
        "Failed to get subscription limits",
      );
    }
  }

  /**
   * Get tenant usage statistics
   * GET /api/tenants/:id/usage
   */
  static async getTenantUsage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(
        `📈 [TenantController] Getting usage statistics for tenant: ${id}`,
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Get tenant usage using Prisma service
      const usage = await service.getTenantUsage(id);

      logger.success(
        "✅ [TenantController] Usage statistics retrieved",
        "TenantController",
        {
          tenantId: id,
        },
      );

      ResponseWrapper.sendResponse(res, usage, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get tenant usage",
        "TenantController",
        error,
      );
      ResponseWrapper.sendDatabaseError(res, "Failed to get tenant usage");
    }
  }

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  /**
   * Get tenant service health
   * GET /api/tenants/health
   */
  static async getServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "🏥 [TenantController] Getting service health",
        "TenantController",
      );

      const service = await TenantController.getTenantService();

      // Get service health using Prisma service
      const health = await service.getServiceHealth();

      logger.success(
        "✅ [TenantController] Service health retrieved",
        "TenantController",
      );

      ResponseWrapper.sendResponse(res, health, 200);
    } catch (error) {
      logger.error(
        "❌ [TenantController] Failed to get service health",
        "TenantController",
        error,
      );
      ResponseWrapper.sendServiceUnavailable(
        res,
        "Service health check failed",
      );
    }
  }
}

// ============================================
// EXPORT CONTROLLER
// ============================================

export default TenantController;
