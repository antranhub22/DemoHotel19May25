import { Request, Response, NextFunction } from 'express';
import { TenantService, TenantError } from '@server/services/tenantService';
import { eq } from 'drizzle-orm';
import { logger } from '@shared/utils/logger';

// ============================================
// Extended Request Interface
// ============================================

declare global {
  namespace Express {
    interface Request {
      tenant?: any;
      tenantId?: string;
      user?: any;
      tenantFilter?: any;
      resourceTenantIdField?: string;
      validateOwnership?: boolean;
    }
  }
}

// ============================================
// Tenant Middleware Service
// ============================================

export class TenantMiddleware {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  /**
   * Extract tenant information from JWT token
   * Requires auth middleware to run first
   */
  tenantIdentification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // Extract tenant ID from JWT payload
      const tenantId = req.user.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          error: 'Tenant ID not found in token',
          code: 'TENANT_ID_MISSING',
        });
      }

      // Load tenant data
      const tenant = await this.tenantService.getTenantById(tenantId);

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        });
      }

      // Check subscription status
      if (!this.tenantService.isSubscriptionActive(tenant)) {
        return res.status(403).json({
          error: 'Subscription inactive or expired',
          code: 'SUBSCRIPTION_INACTIVE',
          subscriptionStatus: tenant.subscriptionStatus,
          subscriptionPlan: tenant.subscriptionPlan,
        });
      }

      // Add tenant to request
      req.tenant = tenant;
      req.tenantId = tenantId;

      logger.debug('🏨 Tenant identified: ${tenant.hotelName} (${tenant.subdomain})', 'Component');
      next();
    } catch (error) {
      logger.error('Tenant identification failed:', 'Component', error);

      if (error instanceof TenantError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }

      return res.status(500).json({
        error: 'Tenant identification failed',
        code: 'TENANT_IDENTIFICATION_FAILED',
      });
    }
  };

  /**
   * Identify tenant from subdomain (for public routes)
   */
  tenantFromSubdomain = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Extract subdomain from host header
      const host = req.get('host') || '';
      const subdomain = this.extractSubdomain(host);

      if (!subdomain) {
        return res.status(400).json({
          error: 'Subdomain not found',
          code: 'SUBDOMAIN_MISSING',
        });
      }

      // Load tenant by subdomain
      const tenant = await this.tenantService.getTenantBySubdomain(subdomain);

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        });
      }

      // Check subscription status
      if (!this.tenantService.isSubscriptionActive(tenant)) {
        return res.status(403).json({
          error: 'Service unavailable - subscription inactive',
          code: 'SUBSCRIPTION_INACTIVE',
        });
      }

      // Add tenant to request
      req.tenant = tenant;
      req.tenantId = tenant.id;

      logger.debug('🌐 Tenant identified from subdomain: ${tenant.hotelName} (${subdomain})', 'Component');
      next();
    } catch (error) {
      logger.error('Tenant identification from subdomain failed:', 'Component', error);

      if (error instanceof TenantError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }

      return res.status(500).json({
        error: 'Tenant identification failed',
        code: 'TENANT_IDENTIFICATION_FAILED',
      });
    }
  };

  /**
   * Enforce row-level security for database operations
   */
  rowLevelSecurity = (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if tenant is identified
      if (!req.tenantId) {
        return res.status(400).json({
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
      }

      // Add tenant filter to database operations
      // This will be used in database queries to ensure data isolation
      req.tenantFilter = this.tenantService.getTenantFilter(req.tenantId);

      logger.debug('🔒 Row-level security enabled for tenant: ${req.tenantId}', 'Component');
      next();
    } catch (error) {
      logger.error('Row-level security enforcement failed:', 'Component', error);
      return res.status(500).json({
        error: 'Security enforcement failed',
        code: 'SECURITY_ENFORCEMENT_FAILED',
      });
    }
  };

  /**
   * Check if tenant has access to specific feature
   */
  requireFeature = (feature: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: 'Tenant not identified',
            code: 'TENANT_NOT_IDENTIFIED',
          });
        }

        const hasAccess = await this.tenantService.hasFeatureAccess(
          req.tenant.id,
          feature as any
        );

        if (!hasAccess) {
          return res.status(403).json({
            error: `Feature '${feature}' not available in your plan`,
            code: 'FEATURE_NOT_AVAILABLE',
            feature,
            currentPlan: req.tenant.subscriptionPlan,
            upgradeRequired: true,
          });
        }

        logger.debug('✅ Feature access granted: ${feature} for tenant ${req.tenant.hotelName}', 'Component');
        next();
      } catch (error) {
        logger.error('Feature access check failed for ${feature}:', 'Component', error);
        return res.status(500).json({
          error: 'Feature access check failed',
          code: 'FEATURE_ACCESS_CHECK_FAILED',
        });
      }
    };
  };

  /**
   * Check subscription limits before processing
   */
  checkSubscriptionLimits = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
      }

      const limitsCheck = await this.tenantService.checkSubscriptionLimits(
        req.tenant.id
      );

      if (!limitsCheck.withinLimits) {
        return res.status(429).json({
          error: 'Subscription limits exceeded',
          code: 'SUBSCRIPTION_LIMITS_EXCEEDED',
          violations: limitsCheck.violations,
          currentPlan: req.tenant.subscriptionPlan,
          upgradeRequired: true,
        });
      }

      logger.debug('📊 Subscription limits check passed for tenant ${req.tenant.hotelName}', 'Component');
      next();
    } catch (error) {
      logger.error('Subscription limits check failed:', 'Component', error);
      return res.status(500).json({
        error: 'Subscription limits check failed',
        code: 'LIMITS_CHECK_FAILED',
      });
    }
  };

  /**
   * Validate tenant ownership of resource
   */
  validateTenantOwnership = (resourceTenantIdField: string = 'tenantId') => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: 'Tenant not identified',
            code: 'TENANT_NOT_IDENTIFIED',
          });
        }

        // This would be used in route handlers to validate resource ownership
        // The actual validation would happen in the database query
        req.resourceTenantIdField = resourceTenantIdField;
        req.validateOwnership = true;

        logger.debug('🔑 Tenant ownership validation enabled for ${req.tenant.hotelName}', 'Component');
        next();
      } catch (error) {
        logger.error('Tenant ownership validation setup failed:', 'Component', error);
        return res.status(500).json({
          error: 'Ownership validation setup failed',
          code: 'OWNERSHIP_VALIDATION_FAILED',
        });
      }
    };
  };

  /**
   * Rate limiting per tenant
   */
  tenantRateLimit = (requestsPerMinute: number = 60) => {
    const tenantRequestCounts = new Map<
      string,
      { count: number; resetTime: number }
    >();

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.tenant) {
          return res.status(400).json({
            error: 'Tenant not identified',
            code: 'TENANT_NOT_IDENTIFIED',
          });
        }

        const tenantId = req.tenant.id;
        const now = Date.now();
        const windowStart = Math.floor(now / 60000) * 60000; // 1-minute window

        const tenantData = tenantRequestCounts.get(tenantId);

        if (!tenantData || tenantData.resetTime !== windowStart) {
          // Reset counter for new window
          tenantRequestCounts.set(tenantId, {
            count: 1,
            resetTime: windowStart,
          });
        } else {
          // Increment counter
          tenantData.count++;

          if (tenantData.count > requestsPerMinute) {
            return res.status(429).json({
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT_EXCEEDED',
              limit: requestsPerMinute,
              resetTime: windowStart + 60000,
            });
          }
        }

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': requestsPerMinute.toString(),
          'X-RateLimit-Remaining': Math.max(
            0,
            requestsPerMinute - (tenantData?.count || 1)
          ).toString(),
          'X-RateLimit-Reset': (windowStart + 60000).toString(),
        });

        next();
      } catch (error) {
        logger.error('Tenant rate limiting failed:', 'Component', error);
        return res.status(500).json({
          error: 'Rate limiting failed',
          code: 'RATE_LIMITING_FAILED',
        });
      }
    };
  };

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Extract subdomain from host header
   */
  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const cleanHost = host.split(':')[0];

    // For development (localhost)
    if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
      return 'minhon'; // Default to Mi Nhon for development
    }

    // For production domains like subdomain.talk2go.online
    const parts = cleanHost.split('.');
    if (parts.length >= 3) {
      return parts[0]; // Return first part as subdomain
    }

    return null;
  }

  /**
   * Get tenant context for database operations
   */
  getTenantContext(
    req: Request
  ): { tenantId: string; tenantFilter: any } | null {
    if (!req.tenantId) return null;

    return {
      tenantId: req.tenantId,
      tenantFilter: this.tenantService.getTenantFilter(req.tenantId),
    };
  }
}

// ============================================
// Middleware Factory Functions
// ============================================

const tenantMiddleware = new TenantMiddleware();

/**
 * Middleware to identify tenant from JWT token
 */
export const identifyTenant = tenantMiddleware.tenantIdentification;

/**
 * Middleware to identify tenant from subdomain
 */
export const identifyTenantFromSubdomain = tenantMiddleware.tenantFromSubdomain;

/**
 * Middleware to enforce row-level security
 */
export const enforceRowLevelSecurity = tenantMiddleware.rowLevelSecurity;

/**
 * Middleware to check feature access
 */
export const requireFeature = tenantMiddleware.requireFeature;

/**
 * Middleware to check subscription limits
 */
export const checkLimits = tenantMiddleware.checkSubscriptionLimits;

/**
 * Middleware to validate tenant ownership
 */
export const validateOwnership = tenantMiddleware.validateTenantOwnership;

/**
 * Middleware for tenant-specific rate limiting
 */
export const tenantRateLimit = tenantMiddleware.tenantRateLimit;

// ============================================
// Composite Middleware Chains
// ============================================

/**
 * Full tenant middleware chain for authenticated routes
 */
export const fullTenantMiddleware = [
  identifyTenant,
  enforceRowLevelSecurity,
  checkLimits,
];

/**
 * Public tenant middleware chain (subdomain-based)
 */
export const publicTenantMiddleware = [
  identifyTenantFromSubdomain,
  enforceRowLevelSecurity,
  tenantRateLimit(),
];

/**
 * Admin tenant middleware chain
 */
export const adminTenantMiddleware = [
  identifyTenant,
  enforceRowLevelSecurity,
  requireFeature('apiAccess'),
];

// ============================================
// Export Middleware
// ============================================

export default tenantMiddleware;
