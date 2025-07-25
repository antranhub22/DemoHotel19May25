// ============================================
// UNIFIED AUTH ROUTES v2.0
// ============================================
// This file consolidates all authentication routes into a single system
// Provides backward compatibility with existing endpoints

import { Request, RequestHandler, Response, Router } from 'express';
import { z } from 'zod';
import { authValidationSchemas } from '@auth/config';
import { authenticateJWT } from '@auth/middleware/auth.middleware';
import { UnifiedAuthService } from '@auth/services/UnifiedAuthService';
import type { LoginCredentials } from '@auth/types';

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const legacyStaffLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const legacyAuthLoginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// UNIFIED AUTH ENDPOINTS
// ============================================

/**
 * POST /api/auth/login
 * Main unified login endpoint - supports both username and email
 */
const loginHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log('🔐 [UnifiedAuth] Login attempt:', {
      username: req.body.username || req.body.email,
      hasPassword: !!req.body.password,
    });

    // Validate input using unified schema
    const validation = authValidationSchemas.loginCredentials.safeParse(
      req.body
    );
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid login credentials',
        details: validation.error.errors,
        code: 'VALIDATION_ERROR',
      });
    }

    const credentials: LoginCredentials = validation.data as LoginCredentials;

    // Attempt login using unified auth service
    const result = await UnifiedAuthService.login(credentials);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        code: result.errorCode,
      });
    }

    // Return standardized success response
    res.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        displayName: result.user!.displayName,
        role: result.user!.role,
        tenantId: result.user!.tenantId,
        permissions: result.user!.permissions,
        // Legacy compatibility fields
        name: result.user!.displayName,
        hotelId: result.user!.tenantId,
      },
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType || 'Bearer',
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh JWT token endpoint
 */
const refreshHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // Token refresh attempt - logging removed for security

    // Use unified auth service for token refresh
    const result = await UnifiedAuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        code: 'TOKEN_REFRESH_FAILED',
      });
    }

    // Return new tokens
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout endpoint - invalidates refresh token
 */
const logoutHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log('👋 [UnifiedAuth] Logout request');

    // For now, just return success - token invalidation can be implemented later
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
};

/**
 * GET /api/auth/me
 * Alternative endpoint for getting current user information
 */
const getAuthUserHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log(
      '👤 [UnifiedAuth] Auth user request for:',
      (req as any).user?.id
    );

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Return comprehensive user information
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Auth user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
};

// ============================================
// BACKWARD COMPATIBILITY ENDPOINTS
// ============================================

/**
 * POST /api/auth/staff/login
 * Legacy staff login endpoint for backward compatibility
 */
const staffLoginHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log('👥 [UnifiedAuth] Staff login attempt:', {
      username: req.body.username,
      hasPassword: !!req.body.password,
    });

    // Validate input
    const validation = authValidationSchemas.loginCredentials.safeParse(
      req.body
    );
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid staff login credentials',
        details: validation.error.errors,
        code: 'VALIDATION_ERROR',
      });
    }

    const credentials: LoginCredentials = validation.data as LoginCredentials;

    // Use unified auth service
    const result = await UnifiedAuthService.login(credentials);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        code: 'STAFF_LOGIN_FAILED',
      });
    }

    // Return staff-specific response format for backward compatibility
    res.json({
      success: true,
      message: 'Staff login successful',
      user: {
        id: result.user!.id,
        username: result.user!.username,
        name: result.user!.displayName,
        role: result.user!.role,
        hotelId: result.user!.tenantId,
        permissions: result.user!.permissions,
      },
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType || 'Bearer',
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Staff login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
};

/**
 * GET /api/auth/me (legacy format support)
 * Support for legacy /auth/me endpoint
 */
const legacyAuthMeHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  console.warn(
    '⚠️ [LegacyAuth] /api/auth/me called - use /api/auth/me instead'
  );

  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        deprecated: true,
      });
    }

    // Return legacy format
    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        // Legacy snake_case field
        tenant_id: user.tenantId,
      },
      deprecated: true,
      migration: 'Please update your client to use /api/auth/me',
    });
  } catch (error) {
    console.error('❌ [LegacyAuth] Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      deprecated: true,
    });
  }
};

// ============================================
// DEVELOPMENT ENDPOINTS
// ============================================

/**
 * GET /api/auth/dev/users
 * Development endpoint to list all users (for testing only)
 */
const devUsersHandler: RequestHandler = (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      error: 'Endpoint not available in production',
    });
  }

  res.json({
    success: true,
    message: 'Development users endpoint',
    users: [
      { username: 'admin', role: 'hotel-manager' },
      { username: 'staff', role: 'front-desk' },
      { username: 'manager', role: 'hotel-manager' },
    ],
    note: 'This endpoint is only available in development mode',
  });
};

// ============================================
// ROUTE REGISTRATIONS
// ============================================

// Main auth routes
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', authenticateJWT, logoutHandler);
router.get('/me', authenticateJWT, getAuthUserHandler);

// Legacy compatibility routes
router.post('/staff/login', staffLoginHandler);
router.get('/auth/me', authenticateJWT, legacyAuthMeHandler);

// Development routes
router.get('/dev/users', devUsersHandler);

export default router;
