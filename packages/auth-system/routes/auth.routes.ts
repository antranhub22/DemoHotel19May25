// ============================================
// UNIFIED AUTH ROUTES v2.0
// ============================================
// This file consolidates all authentication routes into a single system
// Provides backward compatibility with existing endpoints

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { LoginCredentials } from '../types';
import { authValidationSchemas } from '../config';
import { UnifiedAuthService } from '../services/UnifiedAuthService';
import { authenticateJWT } from '../middleware/auth.middleware';

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
router.post('/login', async (req: Request, res: Response) => {
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
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    const result = await UnifiedAuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        code: result.errorCode,
      });
    }

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
      },
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType || 'Bearer',
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate tokens
 */
router.post('/logout', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await UnifiedAuthService.logout(token);
    }

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
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

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
        lastLogin: user.lastLogin,
        // Legacy compatibility
        name: user.displayName,
        hotelId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('❌ [UnifiedAuth] Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
});

// ============================================
// BACKWARD COMPATIBILITY ENDPOINTS
// ============================================

/**
 * POST /api/staff/login
 * Legacy staff login endpoint - redirects to unified login
 * @deprecated Use /api/auth/login instead
 */
router.post('/staff/login', async (req: Request, res: Response) => {
  console.warn(
    '⚠️ [LegacyAuth] /api/staff/login is deprecated, use /api/auth/login instead'
  );

  try {
    // Validate legacy format
    const validation = legacyStaffLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Username and password are required',
        deprecated: true,
        newEndpoint: '/api/auth/login',
      });
    }

    const { username, password } = validation.data;

    // Convert to unified format and call unified login
    const credentials: LoginCredentials = { username, password };
    const result = await UnifiedAuthService.login(credentials);

    if (!result.success) {
      return res.status(401).json({
        error: result.error,
        deprecated: true,
        newEndpoint: '/api/auth/login',
      });
    }

    // Return legacy format for backward compatibility
    res.json({
      success: true,
      token: result.token,
      user: {
        username: result.user!.username,
        role: result.user!.role,
        tenantId: result.user!.tenantId,
        // Legacy snake_case field
        tenant_id: result.user!.tenantId,
      },
      deprecated: true,
      newEndpoint: '/api/auth/login',
      migration: 'Please update your client to use /api/auth/login',
    });
  } catch (error) {
    console.error('❌ [LegacyAuth] Staff login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      deprecated: true,
      newEndpoint: '/api/auth/login',
    });
  }
});

/**
 * GET /api/auth/me (legacy format support)
 * Support for legacy /auth/me endpoint
 */
router.get('/auth/me', authenticateJWT, async (req: Request, res: Response) => {
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
});

// ============================================
// DEVELOPMENT ENDPOINTS
// ============================================

/**
 * GET /api/auth/dev/users
 * Get available development users for auto-login
 * Only available in development mode
 */
router.get('/dev/users', (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      error: 'Not found',
      code: 'DEV_ONLY',
    });
  }

  const devUsers = UnifiedAuthService.getDevUsers();

  res.json({
    success: true,
    users: devUsers.map(user => ({
      username: user.username,
      role: user.role,
      // Don't expose passwords even in dev mode
    })),
    note: 'Development mode only - passwords are predefined',
  });
});

export default router;
