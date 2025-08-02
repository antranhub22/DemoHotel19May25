/**
 * 🏨 TENANT CONTROLLER
 *
 * RESTful API controller for tenant management operations
 * Uses Prisma-based services with automatic fallback to Drizzle
 * Supports multi-tenant architecture with proper isolation
 */

import { isFeatureEnabled } from '@server/shared/FeatureFlags';
import { DatabaseServiceFactory } from '@shared/db/DatabaseServiceFactory';
import * as FeatureFlags from '@shared/FeatureFlags';
import { logger } from '@shared/utils/logger';
import { ResponseWrapper } from '@shared/utils/responseWrapper';
import { Request, Response } from 'express';

// Import legacy service for fallback
import TenantService from '@server/services/tenantService';

// ============================================
// TENANT CONTROLLER CLASS
// ============================================

export class TenantController {
  /**
   * 🔄 Get appropriate tenant service based on feature flags
   * Supports switching between Drizzle (legacy) and Prisma (new) tenant services
   */
  private static async getTenantService(): Promise<any> {
    const usePrisma =
      process.env.USE_PRISMA === 'true' ||
      isFeatureEnabled(FeatureFlags.USE_PRISMA) ||
      isFeatureEnabled(FeatureFlags.PRISMA_TENANT_SERVICE);

    if (usePrisma) {
      try {
        logger.info('🔄 [TenantController] Using Prisma Tenant Service');

        // Initialize Prisma connections if not already done
        await DatabaseServiceFactory.initializeConnections();

        // Get unified Prisma database service
        const databaseService =
          await DatabaseServiceFactory.createDatabaseService();

        logger.info('✅ [TenantController] Prisma Tenant Service initialized');
        return databaseService;
      } catch (error) {
        logger.error(
          '❌ [TenantController] Failed to initialize Prisma service, falling back to Drizzle',
          error
        );

        // Fallback to Drizzle if Prisma fails
        return new TenantService();
      }
    }

    // Default to Drizzle TenantService
    logger.info('🔧 [TenantController] Using Drizzle Tenant Service (legacy)');
    return new TenantService();
  }

  /**
   * 🔄 Check if service is legacy Drizzle or new Prisma
   */
  private static isLegacyService(service: any): service is TenantService {
    return service instanceof TenantService;
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
        '🏨 [TenantController] Creating new tenant',
        'TenantController'
      );

      const {
        hotelName,
        subdomain,
        customDomain,
        subscriptionPlan = 'trial',
        email,
        phone,
        address,
      } = req.body;

      // Validate required fields
      if (!hotelName || !subdomain) {
        ResponseWrapper.sendValidationError(res, [
          {
            field: !hotelName ? 'hotelName' : 'subdomain',
            message: `${!hotelName ? 'Hotel name' : 'Subdomain'} is required`,
          },
        ]);
        return;
      }

      const service = await TenantController.getTenantService();

      let result;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        const tenantId = await service.createTenant({
          hotelName,
          subdomain,
          customDomain,
          subscriptionPlan,
          subscriptionStatus: 'active',
          email,
          phone,
          address,
        });

        const createdTenant = await service.getTenantById(tenantId);
        result = { success: true, data: createdTenant };
      } else {
        // New Prisma service
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
        result = { success: true, data: createdTenant };
      }

      logger.info(
        '🎯 [TenantController] Service type for createTenant',
        'TenantController',
        {
          isLegacy: TenantController.isLegacyService(service),
          usePrisma: process.env.USE_PRISMA === 'true',
        }
      );

      if (result.success) {
        logger.success(
          '✅ [TenantController] Tenant created successfully',
          'TenantController',
          {
            tenantId: result.data.id,
          }
        );

        ResponseWrapper.sendCreated(
          res,
          result.data,
          'Tenant created successfully'
        );
      } else {
        logger.error(
          '❌ [TenantController] Failed to create tenant',
          'TenantController',
          {
            error: result.error,
          }
        );

        ResponseWrapper.sendError(
          res,
          result.error || 'Failed to create tenant',
          500
        );
      }
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to create tenant',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to create tenant');
    }
  }

  /**
   * Get tenant by ID
   * GET /api/tenants/:id
   */
  static async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include === 'relations';

      logger.info(
        `🔍 [TenantController] Getting tenant by ID: ${id}`,
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let tenant;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        tenant = await service.getTenantById(id);
      } else {
        // New Prisma service
        tenant = await service.getTenantById(id, includeRelations);
      }

      if (!tenant) {
        ResponseWrapper.sendNotFound(res, 'Tenant not found');
        return;
      }

      logger.success(
        '✅ [TenantController] Tenant retrieved successfully',
        'TenantController',
        {
          tenantId: id,
        }
      );

      ResponseWrapper.sendResponse(res, tenant, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get tenant by ID',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to retrieve tenant');
    }
  }

  /**
   * Get tenant by subdomain
   * GET /api/tenants/subdomain/:subdomain
   */
  static async getTenantBySubdomain(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { subdomain } = req.params;

      logger.info(
        `🔍 [TenantController] Getting tenant by subdomain: ${subdomain}`,
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let tenant;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        tenant = await service.getTenantBySubdomain(subdomain);
      } else {
        // New Prisma service
        tenant = await service.getTenantBySubdomain(subdomain);
      }

      if (!tenant) {
        ResponseWrapper.sendNotFound(res, 'Tenant not found');
        return;
      }

      logger.success(
        '✅ [TenantController] Tenant retrieved by subdomain',
        'TenantController',
        {
          subdomain,
          tenantId: tenant.id,
        }
      );

      ResponseWrapper.sendResponse(res, tenant, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get tenant by subdomain',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to retrieve tenant');
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
        '📋 [TenantController] Getting all tenants',
        'TenantController',
        {
          limit: Number(limit),
          offset: Number(offset),
        }
      );

      const service = await TenantController.getTenantService();

      let result;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service - this method doesn't exist in legacy service
        // We'll need to implement a simple version
        throw new Error('getAllTenants not implemented in legacy service');
      } else {
        // New Prisma service
        const tenants = await service.getAllTenants();
        result = { tenants, total: tenants.length };
      }

      logger.success(
        '✅ [TenantController] Tenants retrieved successfully',
        'TenantController',
        {
          count: result.tenants.length,
          total: result.total,
        }
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
        200
      );
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get all tenants',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to retrieve tenants');
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
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let result;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        const legacyUpdates = {
          hotelName: updates.hotel_name || updates.hotelName,
          subdomain: updates.subdomain,
          customDomain: updates.custom_domain || updates.customDomain,
          subscriptionPlan:
            updates.subscription_plan || updates.subscriptionPlan,
          subscriptionStatus:
            updates.subscription_status || updates.subscriptionStatus,
          trialEndsAt: updates.trial_ends_at || updates.trialEndsAt,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
        };

        await service.updateTenant(id, legacyUpdates);
        const updatedTenant = await service.getTenantById(id);
        result = { success: true, data: updatedTenant };
      } else {
        // New Prisma service
        const updatedTenant = await service.updateTenant(id, updates);
        result = { success: true, data: updatedTenant };
      }

      if (result.success) {
        logger.success(
          '✅ [TenantController] Tenant updated successfully',
          'TenantController',
          {
            tenantId: id,
          }
        );

        ResponseWrapper.sendResponse(
          res,
          result.data,
          200,
          'Tenant updated successfully'
        );
      } else {
        logger.error(
          '❌ [TenantController] Failed to update tenant',
          'TenantController',
          {
            error: result.error,
          }
        );

        ResponseWrapper.sendError(
          res,
          result.error || 'Failed to update tenant',
          500
        );
      }
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to update tenant',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to update tenant');
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
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let success;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        await service.deleteTenant(id);
        success = true;
      } else {
        // New Prisma service - this method doesn't exist in unified service
        // We'd need to implement it in PrismaDatabaseService
        throw new Error('deleteTenant not implemented in unified service yet');
      }

      if (success) {
        logger.success(
          '✅ [TenantController] Tenant deleted successfully',
          'TenantController',
          {
            tenantId: id,
          }
        );

        ResponseWrapper.sendResponse(
          res,
          null,
          200,
          'Tenant deleted successfully'
        );
      } else {
        ResponseWrapper.sendError(res, 'Failed to delete tenant', 500);
      }
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to delete tenant',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to delete tenant');
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
        'TenantController',
        {
          feature,
        }
      );

      const service = await TenantController.getTenantService();

      let hasAccess;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        hasAccess = await service.hasFeatureAccess(id, feature as any);
      } else {
        // New Prisma service - need to implement in unified service
        throw new Error(
          'hasFeatureAccess not implemented in unified service yet'
        );
      }

      logger.info(
        '✅ [TenantController] Feature access checked',
        'TenantController',
        {
          tenantId: id,
          feature,
          hasAccess,
        }
      );

      ResponseWrapper.sendResponse(res, { hasAccess }, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to check feature access',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to check feature access');
    }
  }

  /**
   * Get tenant subscription limits
   * GET /api/tenants/:id/limits
   */
  static async getSubscriptionLimits(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(
        `📊 [TenantController] Getting subscription limits for tenant: ${id}`,
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let limits;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        const tenant = await service.getTenantById(id);
        if (!tenant) {
          ResponseWrapper.sendNotFound(res, 'Tenant not found');
          return;
        }
        limits = service.getSubscriptionLimits(
          tenant.subscription_plan || 'trial'
        );
      } else {
        // New Prisma service - need to implement in unified service
        throw new Error(
          'getSubscriptionLimits not implemented in unified service yet'
        );
      }

      logger.success(
        '✅ [TenantController] Subscription limits retrieved',
        'TenantController',
        {
          tenantId: id,
        }
      );

      ResponseWrapper.sendResponse(res, limits, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get subscription limits',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(
        res,
        'Failed to get subscription limits'
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
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let usage;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        usage = await service.getTenantUsage(id);
      } else {
        // New Prisma service - need to implement in unified service
        throw new Error(
          'getTenantUsage not implemented in unified service yet'
        );
      }

      logger.success(
        '✅ [TenantController] Usage statistics retrieved',
        'TenantController',
        {
          tenantId: id,
        }
      );

      ResponseWrapper.sendResponse(res, usage, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get tenant usage',
        'TenantController',
        error
      );
      ResponseWrapper.sendDatabaseError(res, 'Failed to get tenant usage');
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
        '🏥 [TenantController] Getting service health',
        'TenantController'
      );

      const service = await TenantController.getTenantService();

      let health;
      if (TenantController.isLegacyService(service)) {
        // Legacy Drizzle service
        health = await service.getServiceHealth();
      } else {
        // New Prisma service - need to implement in unified service
        throw new Error(
          'getServiceHealth not implemented in unified service yet'
        );
      }

      logger.success(
        '✅ [TenantController] Service health retrieved',
        'TenantController'
      );

      ResponseWrapper.sendResponse(res, health, 200);
    } catch (error) {
      logger.error(
        '❌ [TenantController] Failed to get service health',
        'TenantController',
        error
      );
      ResponseWrapper.sendServiceUnavailable(
        res,
        'Service health check failed'
      );
    }
  }
}

// ============================================
// EXPORT CONTROLLER
// ============================================

export default TenantController;
