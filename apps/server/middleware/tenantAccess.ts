/**
 * SaaS Provider Domain - Tenant Access Middleware
 * Authorization middleware for tenant-based access control
 */

import { logger } from "@shared/utils/logger";
import { NextFunction, Request, Response } from "express";

// ============================================
// TYPES & INTERFACES
// ============================================

export type UserRole = "admin" | "manager" | "staff" | "guest";

interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
  subscriptionPlan: string;
  subscriptionStatus: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenant?: {
        id: string;
        subscriptionPlan: string;
        subscriptionStatus: string;
      };
    }
  }
}

// ============================================
// TENANT ACCESS VALIDATION
// ============================================

/**
 * Validate tenant access based on roles and permissions
 */
export function validateTenantAccess(allowedRoles: UserRole[] = ["admin"]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const tenantId = req.params.tenantId;

      // Check if user is authenticated
      if (!user) {
        logger.warn("[TenantAccess] Unauthenticated request", {
          path: req.path,
          method: req.method,
        });

        return res.status(401).json({
          success: false,
          error: "Authentication required",
          message: "Please authenticate to access this resource",
        });
      }

      // Check if user belongs to the requested tenant
      if (tenantId && user.tenantId !== tenantId) {
        logger.warn("[TenantAccess] Tenant access denied", {
          userId: user.id,
          userTenantId: user.tenantId,
          requestedTenantId: tenantId,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          error: "Tenant access denied",
          message: "You do not have access to this tenant",
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        logger.warn("[TenantAccess] Insufficient role permissions", {
          userId: user.id,
          userRole: user.role,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
          required: allowedRoles,
          current: user.role,
        });
      }

      // Check subscription status for premium features
      if (
        user.subscriptionStatus === "expired" ||
        user.subscriptionStatus === "cancelled"
      ) {
        // Allow access to basic account management but restrict premium features
        const isPremiumEndpoint =
          req.path.includes("/analytics") ||
          req.path.includes("/advanced") ||
          req.path.includes("/billing");

        if (isPremiumEndpoint) {
          logger.warn(
            "[TenantAccess] Subscription required for premium feature",
            {
              userId: user.id,
              subscriptionStatus: user.subscriptionStatus,
              path: req.path,
            },
          );

          return res.status(402).json({
            success: false,
            error: "Subscription required",
            message: "Please update your subscription to access this feature",
            subscriptionStatus: user.subscriptionStatus,
          });
        }
      }

      // Set tenant context for downstream handlers
      req.tenant = {
        id: user.tenantId,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      };

      logger.debug("[TenantAccess] Access granted", {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        path: req.path,
      });

      next();
    } catch (error: any) {
      logger.error("[TenantAccess] Error validating tenant access", error);
      res.status(500).json({
        success: false,
        error: "Access validation failed",
        message: "Unable to validate access permissions",
      });
    }
  };
}

/**
 * Validate specific permissions within a tenant
 */
export function validateTenantPermissions(requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          (permission) => !user.permissions.includes(permission),
        );

        logger.warn("[TenantAccess] Missing required permissions", {
          userId: user.id,
          requiredPermissions,
          userPermissions: user.permissions,
          missingPermissions,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message: "You do not have the required permissions for this action",
          required: requiredPermissions,
          missing: missingPermissions,
        });
      }

      next();
    } catch (error: any) {
      logger.error("[TenantAccess] Error validating permissions", error);
      res.status(500).json({
        success: false,
        error: "Permission validation failed",
      });
    }
  };
}

/**
 * Validate subscription plan requirement
 */
export function validateSubscriptionPlan(
  requiredPlan: string,
  allowHigher: boolean = true,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const planHierarchy = ["trial", "basic", "premium", "enterprise"];
      const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan);
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

      if (userPlanIndex === -1 || requiredPlanIndex === -1) {
        logger.error("[TenantAccess] Invalid subscription plan", {
          userPlan: user.subscriptionPlan,
          requiredPlan,
        });

        return res.status(500).json({
          success: false,
          error: "Invalid subscription plan configuration",
        });
      }

      const hasRequiredPlan = allowHigher
        ? userPlanIndex >= requiredPlanIndex
        : userPlanIndex === requiredPlanIndex;

      if (!hasRequiredPlan) {
        logger.warn("[TenantAccess] Subscription plan requirement not met", {
          userId: user.id,
          userPlan: user.subscriptionPlan,
          requiredPlan,
          path: req.path,
        });

        return res.status(402).json({
          success: false,
          error: "Subscription upgrade required",
          message: `This feature requires ${requiredPlan} plan or higher`,
          currentPlan: user.subscriptionPlan,
          requiredPlan: requiredPlan,
        });
      }

      next();
    } catch (error: any) {
      logger.error("[TenantAccess] Error validating subscription plan", error);
      res.status(500).json({
        success: false,
        error: "Subscription validation failed",
      });
    }
  };
}

/**
 * Validate tenant ownership of resource
 */
export function validateTenantOwnership(resourceIdParam: string = "id") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const resourceId = req.params[resourceIdParam];

      if (!user || !resourceId) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters",
        });
      }

      // This would typically check the database to ensure the resource belongs to the tenant
      // For now, we'll implement a basic check
      // In a real implementation, you'd query the database for the resource

      logger.debug("[TenantAccess] Validating resource ownership", {
        userId: user.id,
        tenantId: user.tenantId,
        resourceId,
        resourceType: resourceIdParam,
      });

      // Add resource ownership validation logic here
      // Example:
      // const resource = await getResourceById(resourceId);
      // if (resource.tenantId !== user.tenantId) {
      //   return res.status(403).json({ error: 'Resource access denied' });
      // }

      next();
    } catch (error: any) {
      logger.error("[TenantAccess] Error validating resource ownership", error);
      res.status(500).json({
        success: false,
        error: "Resource ownership validation failed",
      });
    }
  };
}

/**
 * Allow cross-tenant access for platform administrators
 */
export function allowCrossTenantAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // Check if user is platform administrator
      const isPlatformAdmin =
        user.role === "admin" && user.permissions.includes("platform:admin");

      if (!isPlatformAdmin) {
        // Fall back to normal tenant access validation
        return validateTenantAccess(["admin", "manager"])(req, res, next);
      }

      logger.debug("[TenantAccess] Platform admin access granted", {
        userId: user.id,
        path: req.path,
      });

      next();
    } catch (error: any) {
      logger.error(
        "[TenantAccess] Error in cross-tenant access validation",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Cross-tenant access validation failed",
      });
    }
  };
}

/**
 * Log tenant access for audit purposes
 */
export function logTenantAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const startTime = Date.now();

    // Log access attempt
    logger.info("[TenantAccess] API access", {
      userId: user?.id,
      tenantId: user?.tenantId,
      role: user?.role,
      method: req.method,
      path: req.path,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (obj: any) {
      const duration = Date.now() - startTime;

      logger.info("[TenantAccess] API response", {
        userId: user?.id,
        tenantId: user?.tenantId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        success: obj?.success !== false,
      });

      return originalJson.call(this, obj);
    };

    next();
  };
}
