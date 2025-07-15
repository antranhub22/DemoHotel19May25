import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { db } from '@server/db';
import { staff, tenants } from '@shared/schema';
import { UserRole, Permission, getPermissionsForRole } from '@shared/constants/permissions';

// ============================================
// Types & Interfaces
// ============================================

export interface LoginCredentials {
  username: string;
  password: string;
  tenantId?: string; // Optional for backward compatibility
}

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  permissions: Permission[];
  tenantId: string;
  avatarUrl: string | null;
  lastLogin: string | null;
}

export interface JWTPayload {
  userId: string;
  username: string;
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  error?: string;
}

// ============================================
// Configuration
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// ============================================
// Unified Authentication Service
// ============================================

export class UnifiedAuthService {
  
  // ============================================
  // Authentication Methods
  // ============================================

  /**
   * Unified login method that works for all user types
   * Replaces both admin login and staff login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password, tenantId } = credentials;

      console.log(`🔐 Login attempt for user: ${username}`);

      // Find user in staff table
      let userQuery = db
        .select()
        .from(staff)
        .where(and(
          eq(staff.username, username),
          eq(staff.isActive, true)
        ));

      // If tenantId is provided, filter by it
      if (tenantId) {
        userQuery = userQuery.where(eq(staff.tenantId, tenantId));
      }

      const users = await userQuery.execute();
      const user = users[0];

      if (!user) {
        console.log(`❌ User not found: ${username}`);
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`❌ Invalid password for user: ${username}`);
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Get user's permissions
      let permissions: Permission[] = [];
      
      try {
        // Parse permissions from database
        if (user.permissions && typeof user.permissions === 'string') {
          permissions = JSON.parse(user.permissions);
        } else if (Array.isArray(user.permissions)) {
          permissions = user.permissions;
        }
        
        // Fallback to role-based permissions if no custom permissions
        if (permissions.length === 0) {
          permissions = getPermissionsForRole(user.role as UserRole);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse permissions for user ${username}, using role defaults`);
        permissions = getPermissionsForRole(user.role as UserRole);
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        role: user.role as UserRole,
        permissions,
        tenantId: user.tenantId || 'default',
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin
      };

      // Generate tokens
      const token = this.generateToken(authUser);
      const refreshToken = this.generateRefreshToken(authUser);

      // Update last login timestamp
      await db
        .update(staff)
        .set({ 
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(staff.id, user.id));

      console.log(`✅ Login successful for user: ${username} (role: ${user.role})`);

      return {
        success: true,
        user: authUser,
        token,
        refreshToken
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Verify and decode JWT token
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      // Verify user still exists and is active
      const users = await db
        .select()
        .from(staff)
        .where(and(
          eq(staff.id, decoded.userId),
          eq(staff.isActive, true)
        ))
        .execute();

      const user = users[0];
      if (!user) {
        console.log(`❌ Token verification failed: User ${decoded.userId} not found or inactive`);
        return null;
      }

      // Return auth user object
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        role: user.role as UserRole,
        permissions: decoded.permissions,
        tenantId: user.tenantId || 'default',
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin
      };

    } catch (error) {
      console.error('❌ Token verification error:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
      
      // Get fresh user data
      const users = await db
        .select()
        .from(staff)
        .where(and(
          eq(staff.id, decoded.userId),
          eq(staff.isActive, true)
        ))
        .execute();

      const user = users[0];
      if (!user) {
        return {
          success: false,
          error: 'User not found or inactive'
        };
      }

      // Get fresh permissions
      let permissions: Permission[] = [];
      try {
        if (user.permissions && typeof user.permissions === 'string') {
          permissions = JSON.parse(user.permissions);
        } else if (Array.isArray(user.permissions)) {
          permissions = user.permissions;
        }
        
        if (permissions.length === 0) {
          permissions = getPermissionsForRole(user.role as UserRole);
        }
      } catch (error) {
        permissions = getPermissionsForRole(user.role as UserRole);
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        role: user.role as UserRole,
        permissions,
        tenantId: user.tenantId || 'default',
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin
      };

      const newToken = this.generateToken(authUser);
      const newRefreshToken = this.generateRefreshToken(authUser);

      return {
        success: true,
        user: authUser,
        token: newToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      console.error('❌ Refresh token error:', error);
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  static async logout(userId: string): Promise<void> {
    try {
      // Update user's last activity
      await db
        .update(staff)
        .set({ 
          updatedAt: new Date().toISOString()
        })
        .where(eq(staff.id, userId));

      console.log(`✅ User ${userId} logged out`);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  // ============================================
  // User Management Methods
  // ============================================

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const users = await db
        .select()
        .from(staff)
        .where(eq(staff.id, id))
        .execute();

      const user = users[0];
      if (!user) return null;

      let permissions: Permission[] = [];
      try {
        if (user.permissions && typeof user.permissions === 'string') {
          permissions = JSON.parse(user.permissions);
        } else if (Array.isArray(user.permissions)) {
          permissions = user.permissions;
        }
        
        if (permissions.length === 0) {
          permissions = getPermissionsForRole(user.role as UserRole);
        }
      } catch (error) {
        permissions = getPermissionsForRole(user.role as UserRole);
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        role: user.role as UserRole,
        permissions,
        tenantId: user.tenantId || 'default',
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin
      };

    } catch (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: AuthUser, module: string, action: string): boolean {
    return user.permissions.some(permission => 
      permission.module === module && 
      permission.action === action && 
      permission.allowed
    );
  }

  /**
   * Check if user has specific role
   */
  static hasRole(user: AuthUser, role: UserRole): boolean {
    return user.role === role;
  }

  // ============================================
  // Token Generation Methods
  // ============================================

  private static generateToken(user: AuthUser): string {
    const payload: any = {
      userId: user.id,
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private static generateRefreshToken(user: AuthUser): string {
    const payload: any = {
      userId: user.id,
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  }

  // ============================================
  // Migration Helper Methods
  // ============================================

  /**
   * Create password hash (for migration and user creation)
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Migrate legacy staff token to new JWT system
   */
  static async migrateLegacyAuth(legacyToken: string): Promise<AuthResult | null> {
    // This method can be used during transition period
    // to convert old staff tokens to new JWT tokens
    
    try {
      // Legacy token verification logic here
      // For now, we'll just return null to force re-login
      console.log('⚠️ Legacy token detected, requiring re-login');
      return null;
    } catch (error) {
      console.error('❌ Legacy token migration error:', error);
      return null;
    }
  }
}

export default UnifiedAuthService; 