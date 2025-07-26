// ============================================
// UNIFIED AUTHENTICATION MIDDLEWARE v2.0 (Simplified)
// ============================================
// Simplified version without TypeScript conflicts

import { AUTH_ERROR_MESSAGES } from '@auth/config';
import { UnifiedAuthService } from '@auth/services/UnifiedAuthService';
import type { AuthUser, UserRole } from '@auth/types';
import type { NextFunction, Request, Response } from 'express';

// ============================================
// CORE AUTHENTICATION MIDDLEWARE
// ============================================

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ BYPASS: Guest endpoints don't require authentication
    const isGuestEndpoint = req.path.startsWith('/guest/') ||
      req.path.startsWith('/api/guest/') ||
      req.path.startsWith('/temp-public/') ||
      req.path.startsWith('/api/temp-public/');

    if (isGuestEndpoint) {
      console.log(`✅ [Auth] Bypassing auth for guest endpoint: ${req.path}`);
      return next();
    }

    const authHeader = (req.headers as any).authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'TOKEN_MISSING',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      (res as any).status(401).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'TOKEN_MISSING',
      });
      return;
    }

    const user = await UnifiedAuthService.verifyToken(token);
    if (!user) {
      (res as any).status(401).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'TOKEN_INVALID',
      });
      return;
    }

    // Attach user to request
    (req as any).user = user;
    (req as any).tenant = {
      id: user.tenantId,
      hotelName: 'Mi Nhon Hotel',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
    };

    console.log(`✅ [Auth] Authenticated: ${user.username} (${user.role})`);
    next();
  } catch (error) {
    console.error('❌ [Auth] Authentication error:', error);
    (res as any).status(500).json({
      success: false,
      error: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
      code: 'SERVER_ERROR',
    });
  }
};

// ============================================
// AUTHORIZATION MIDDLEWARES
// ============================================

export const requirePermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      (res as any).status(401).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    const hasPermission = UnifiedAuthService.hasPermission(
      user,
      module,
      action
    );
    if (!hasPermission) {
      console.log(
        `❌ [Auth] Permission denied: ${user.username} needs ${module}.${action}`
      );
      (res as any).status(403).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.FORBIDDEN,
        code: 'PERMISSION_DENIED',
        required: `${module}.${action}`,
        userRole: user.role,
      });
      return;
    }

    console.log(
      `✅ [Auth] Permission granted: ${user.username} has ${module}.${action}`
    );
    next();
  };
};

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      (res as any).status(401).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    const hasRole = UnifiedAuthService.hasRole(user, role);
    if (!hasRole) {
      console.log(
        `❌ [Auth] Role denied: ${user.username} (${user.role}) needs ${role}`
      );
      (res as any).status(403).json({
        success: false,
        error: AUTH_ERROR_MESSAGES.FORBIDDEN,
        code: 'ROLE_DENIED',
        required: role,
        userRole: user.role,
      });
      return;
    }

    console.log(`✅ [Auth] Role granted: ${user.username} has ${role} access`);
    next();
  };
};

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

export const verifyJWT = authenticateJWT;

// ============================================
// CONVENIENCE COMBINATIONS
// ============================================

export const authMiddleware = {
  basic: authenticateJWT,
  adminOnly: [authenticateJWT, requireRole('admin')],
  superAdminOnly: [authenticateJWT, requireRole('super-admin')],
  managerOrHigher: [authenticateJWT, requireRole('manager')],

  withPermission: (module: string, action: string) => [
    authenticateJWT,
    requirePermission(module, action),
  ],

  withRole: (role: UserRole) => [authenticateJWT, requireRole(role)],
};

export default {
  authenticateJWT,
  requirePermission,
  requireRole,
  verifyJWT,
  authMiddleware,
};
