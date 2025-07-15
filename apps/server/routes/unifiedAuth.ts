import express, { type Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import UnifiedAuthService, { LoginCredentials, AuthUser } from '@server/services/unifiedAuthService';
import { hasRolePermission } from '@shared/constants/permissions';

// ============================================
// Router Setup
// ============================================

const router = express.Router();

// ============================================
// Validation Schemas
// ============================================

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// ============================================
// Middleware
// ============================================

// Extract user from JWT token
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const user = await UnifiedAuthService.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('❌ Token authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Check if user has specific permission
const requirePermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasPermission = UnifiedAuthService.hasPermission(user, module, action);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${module}.${action}`,
        requiredPermission: `${module}.${action}`,
        userRole: user.role
      });
    }

    next();
  };
};

// Check if user has specific role
const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Role denied: Required ${role}, but user has ${user.role}`,
        requiredRole: role,
        userRole: user.role
      });
    }

    next();
  };
};

// ============================================
// Auth Routes
// ============================================

/**
 * POST /api/auth/login
 * Unified login endpoint for all user types
 * Replaces both /api/auth/login and staff login endpoints
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Unified login attempt');
    
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const credentials: LoginCredentials = validation.data;
    
    // Attempt login
    const result = await UnifiedAuthService.login(credentials);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    // Return success with user data and tokens
    res.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        displayName: result.user!.displayName,
        role: result.user!.role,
        tenantId: result.user!.tenantId,
        avatarUrl: result.user!.avatarUrl,
        last_login: result.user!.lastLogin,
        // Don't include permissions in response for security
        permissionCount: result.user!.permissions.length
      },
      token: result.token,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    console.error('❌ Login route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Token refresh attempt');
    
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { refreshToken } = validation.data;
    
    const result = await UnifiedAuthService.refreshToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
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
        avatarUrl: result.user!.avatarUrl,
        permissionCount: result.user!.permissions.length
      },
      token: result.token,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    console.error('❌ Refresh route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token invalidation)
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as AuthUser;
    
    await UnifiedAuthService.logout(user.id);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as AuthUser;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenant_id,
        avatarUrl: user.avatarUrl,
        last_login: user.lastLogin,
        permissions: user.permissions.map(p => `${p.module}.${p.action}`),
        permissionCount: user.permissions.length
      }
    });

  } catch (error) {
    console.error('❌ Get user route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/permissions
 * Get user's detailed permissions
 */
router.get('/permissions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as AuthUser;
    
    // Group permissions by module
    const permissionsByModule = user.permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission.action);
      return acc;
    }, {} as Record<string, string[]>);
    
    res.json({
      success: true,
      role: user.role,
      permissions: permissionsByModule,
      totalPermissions: user.permissions.length
    });

  } catch (error) {
    console.error('❌ Get permissions route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================
// Legacy Compatibility Routes
// ============================================

/**
 * Legacy staff login compatibility
 * Redirects to unified login
 */
router.post('/staff/login', async (req: Request, res: Response) => {
  console.log('⚠️ Legacy staff login detected, redirecting to unified auth');
  
  // Forward to unified login by re-processing the request
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const credentials: LoginCredentials = validation.data;
    const result = await UnifiedAuthService.login(credentials);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
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
        avatarUrl: result.user!.avatarUrl,
        last_login: result.user!.lastLogin,
        permissionCount: result.user!.permissions.length
      },
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('❌ Legacy staff login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Legacy admin login compatibility
 * Redirects to unified login
 */
router.post('/admin/login', async (req: Request, res: Response) => {
  console.log('⚠️ Legacy admin login detected, redirecting to unified auth');
  
  // Forward to unified login by re-processing the request
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const credentials: LoginCredentials = validation.data;
    const result = await UnifiedAuthService.login(credentials);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
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
        avatarUrl: result.user!.avatarUrl,
        last_login: result.user!.lastLogin,
        permissionCount: result.user!.permissions.length
      },
      token: result.token,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('❌ Legacy admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================
// Demo/Testing Routes
// ============================================

/**
 * GET /api/auth/demo-users
 * Get list of demo users for testing (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/demo-users', (req: Request, res: Response) => {
    res.json({
      success: true,
      demoUsers: [
        {
          username: 'manager',
          password: 'manager123',
          role: 'hotel-manager',
          description: 'Hotel Manager with full access'
        },
        {
          username: 'frontdesk',
          password: 'frontdesk123',
          role: 'front-desk',
          description: 'Front Desk Staff with limited access'
        },
        {
          username: 'itmanager',
          password: 'itmanager123',
          role: 'it-manager',
          description: 'IT Manager with technical access'
        }
      ]
    });
  });
}

// ============================================
// Export Router
// ============================================

export default router;
export { authenticateToken, requirePermission, requireRole }; 