// ============================================
// UNIFIED AUTH SERVICE v2.0
// ============================================
// This service replaces all existing auth services and provides
// a single source of truth for authentication and authorization

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { db, staff, tenants } from '../../shared/db';

// Import new unified types and config
import type {
  JWTPayload,
  AuthUser,
  AuthResult,
  LoginCredentials,
  UserRole,
  Permission,
  TokenPair,
  TokenValidationResult,
  AuthError,
  AuthErrorCode,
} from '../types';
import {
  JWT_CONFIG,
  DEFAULT_PERMISSIONS,
  SECURITY_CONFIG,
  AUTH_ERROR_MESSAGES,
  TENANT_CONFIG,
  DEV_CONFIG,
  authValidationSchemas,
} from '../config';

// ============================================
// TOKEN BLACKLIST MANAGEMENT
// ============================================

class TokenBlacklist {
  private static blacklistedTokens = new Set<string>();
  private static lastCleanup = Date.now();

  static addToken(jti: string): void {
    this.blacklistedTokens.add(jti);
    this.cleanup();
  }

  static isBlacklisted(jti: string): boolean {
    this.cleanup();
    return this.blacklistedTokens.has(jti);
  }

  private static cleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > SECURITY_CONFIG.BLACKLIST_CLEANUP_INTERVAL) {
      // In production, this would be replaced with Redis or database storage
      this.blacklistedTokens.clear();
      this.lastCleanup = now;
    }
  }
}

// ============================================
// MAIN AUTH SERVICE CLASS
// ============================================

export class UnifiedAuthService {
  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Unified login method for all user types
   * Supports both username and email login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validate input
      const validation =
        authValidationSchemas.loginCredentials.safeParse(credentials);
      if (!validation.success) {
        return this.createErrorResult(
          'INVALID_CREDENTIALS',
          'Invalid login credentials'
        );
      }

      const { username, email, password, tenantId, rememberMe } =
        validation.data;
      const loginIdentifier = username || email;

      console.log(`🔐 [UnifiedAuth] Login attempt for: ${loginIdentifier}`);

      // Find user in staff table
      const user = await this.findUserByCredentials(loginIdentifier!, tenantId);
      if (!user) {
        console.log(`❌ [UnifiedAuth] User not found: ${loginIdentifier}`);
        return this.createErrorResult('INVALID_CREDENTIALS');
      }

      // Check if user is active
      if (!user.is_active) {
        console.log(`❌ [UnifiedAuth] User inactive: ${loginIdentifier}`);
        return this.createErrorResult('USER_INACTIVE');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(
          `❌ [UnifiedAuth] Invalid password for: ${loginIdentifier}`
        );
        return this.createErrorResult('INVALID_CREDENTIALS');
      }

      // Create AuthUser object
      const authUser = await this.createAuthUserFromDbUser(user);

      // Generate tokens
      const tokenPair = this.generateTokenPair(authUser, rememberMe);

      // Update last login
      await this.updateLastLogin(user.id);

      console.log(
        `✅ [UnifiedAuth] Login successful: ${loginIdentifier} (${authUser.role})`
      );

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: tokenPair.tokenType,
      };
    } catch (error) {
      console.error('❌ [UnifiedAuth] Login error:', error);
      return this.createErrorResult('SERVER_ERROR');
    }
  }

  /**
   * Verify and decode JWT token
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const validation = this.validateToken(token);
      if (!validation.valid || !validation.payload) {
        return null;
      }

      const payload = validation.payload;

      // Check if token is blacklisted
      if (payload.jti && TokenBlacklist.isBlacklisted(payload.jti)) {
        console.log(`❌ [UnifiedAuth] Token blacklisted: ${payload.jti}`);
        return null;
      }

      // Verify user still exists and is active
      const user = await this.findUserById(payload.userId);
      if (!user || !user.is_active) {
        console.log(
          `❌ [UnifiedAuth] User not found or inactive: ${payload.userId}`
        );
        return null;
      }

      return this.createAuthUserFromDbUser(user);
    } catch (error) {
      console.error('❌ [UnifiedAuth] Token verification error:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const validation = this.validateToken(refreshToken);
      if (!validation.valid || !validation.payload) {
        return this.createErrorResult('TOKEN_INVALID');
      }

      const payload = validation.payload;

      // Check if refresh token is blacklisted
      if (payload.jti && TokenBlacklist.isBlacklisted(payload.jti)) {
        return this.createErrorResult('TOKEN_INVALID');
      }

      // Get fresh user data
      const user = await this.findUserById(payload.userId);
      if (!user || !user.is_active) {
        return this.createErrorResult('USER_INACTIVE');
      }

      // Create AuthUser object with fresh data
      const authUser = await this.createAuthUserFromDbUser(user);

      // Generate new token pair
      const tokenPair = this.generateTokenPair(authUser);

      // Blacklist old refresh token
      if (payload.jti) {
        TokenBlacklist.addToken(payload.jti);
      }

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: tokenPair.tokenType,
      };
    } catch (error) {
      console.error('❌ [UnifiedAuth] Refresh token error:', error);
      return this.createErrorResult('SERVER_ERROR');
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  static async logout(token: string): Promise<void> {
    try {
      const validation = this.validateToken(token, false); // Don't check expiration
      if (validation.valid && validation.payload?.jti) {
        TokenBlacklist.addToken(validation.payload.jti);
        console.log(
          `✅ [UnifiedAuth] Token blacklisted: ${validation.payload.jti}`
        );
      }
    } catch (error) {
      console.error('❌ [UnifiedAuth] Logout error:', error);
    }
  }

  // ============================================
  // AUTHORIZATION METHODS
  // ============================================

  /**
   * Check if user has specific permission
   */
  static hasPermission(
    user: AuthUser,
    module: string,
    action: string
  ): boolean {
    return user.permissions.some(
      permission =>
        permission.module === module &&
        permission.action === action &&
        permission.allowed
    );
  }

  /**
   * Check if user has specific role or higher
   */
  static hasRole(user: AuthUser, role: UserRole): boolean {
    const {
      hasRolePrivilege,
    } = require('../../../packages/config/auth.config');
    return hasRolePrivilege(user.role, role);
  }

  /**
   * Check if user can access specific tenant
   */
  static canAccessTenant(user: AuthUser, tenantId: string): boolean {
    // Super admin can access all tenants
    if (user.role === 'super-admin') return true;

    // Regular users can only access their own tenant
    return user.tenantId === tenantId;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static async findUserByCredentials(
    loginIdentifier: string,
    tenantId?: string
  ): Promise<any> {
    const whereConditions = [eq(staff.is_active, true)];

    // Search by username or email
    const isEmail = loginIdentifier.includes('@');
    if (isEmail) {
      whereConditions.push(eq(staff.email, loginIdentifier));
    } else {
      whereConditions.push(eq(staff.username, loginIdentifier));
    }

    // Filter by tenant if provided
    if (tenantId) {
      whereConditions.push(eq(staff.tenant_id, tenantId));
    }

    const users = await db
      .select()
      .from(staff)
      .where(and(...whereConditions))
      .limit(1);

    return users[0] || null;
  }

  private static async findUserById(userId: string): Promise<any> {
    const users = await db
      .select()
      .from(staff)
      .where(eq(staff.id, userId))
      .limit(1);

    return users[0] || null;
  }

  private static async createAuthUserFromDbUser(
    dbUser: any
  ): Promise<AuthUser> {
    // Get user permissions
    let permissions: Permission[] = [];

    try {
      // Parse permissions from database
      if (dbUser.permissions && typeof dbUser.permissions === 'string') {
        permissions = JSON.parse(dbUser.permissions);
      } else if (Array.isArray(dbUser.permissions)) {
        permissions = dbUser.permissions;
      }

      // Fallback to role-based permissions if no custom permissions
      if (permissions.length === 0) {
        const rolePermissions = DEFAULT_PERMISSIONS[dbUser.role as UserRole];
        permissions = rolePermissions ? [...rolePermissions] : [];
      }
    } catch (error) {
      console.warn(
        `⚠️ [UnifiedAuth] Failed to parse permissions for user ${dbUser.id}, using role defaults`
      );
      const rolePermissions = DEFAULT_PERMISSIONS[dbUser.role as UserRole];
      permissions = rolePermissions ? [...rolePermissions] : [];
    }

    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      displayName:
        dbUser.display_name || (dbUser.first_name && dbUser.last_name)
          ? `${dbUser.first_name} ${dbUser.last_name}`
          : dbUser.username,
      role: dbUser.role as UserRole,
      permissions,
      tenantId: dbUser.tenant_id || TENANT_CONFIG.DEFAULT_TENANT_ID,
      hotelId: dbUser.tenant_id || TENANT_CONFIG.DEFAULT_TENANT_ID, // Backward compatibility
      avatarUrl: dbUser.avatar_url,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      isActive: dbUser.is_active,
      lastLogin: dbUser.last_login
        ? new Date(dbUser.last_login).toISOString()
        : undefined,
      createdAt: dbUser.created_at
        ? new Date(dbUser.created_at).toISOString()
        : undefined,
      updatedAt: dbUser.updated_at
        ? new Date(dbUser.updated_at).toISOString()
        : undefined,
    };
  }

  private static generateTokenPair(
    user: AuthUser,
    rememberMe = false
  ): TokenPair {
    const now = Math.floor(Date.now() / 1000);
    const jti = `${user.id}-${now}-${Math.random().toString(36).substr(2, 9)}`;

    // Access token payload
    const accessPayload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      tenantId: user.tenantId,
      hotelId: user.hotelId, // Backward compatibility
      iat: now,
      exp: now + this.getExpirationTime(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN),
      jti: `${jti}-access`,
      iss: JWT_CONFIG.ISSUER,
      aud: JWT_CONFIG.AUDIENCE,
    };

    // Refresh token payload
    const refreshExpiry = rememberMe
      ? JWT_CONFIG.REMEMBER_ME_EXPIRES_IN
      : JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN;

    const refreshPayload: JWTPayload = {
      ...accessPayload,
      exp: now + this.getExpirationTime(refreshExpiry),
      jti: `${jti}-refresh`,
    };

    // Generate tokens
    const accessToken = jwt.sign(accessPayload, JWT_CONFIG.SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
    });

    const refreshToken = jwt.sign(refreshPayload, JWT_CONFIG.REFRESH_SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationTime(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN),
      tokenType: 'Bearer',
    };
  }

  private static validateToken(
    token: string,
    checkExpiration = true
  ): TokenValidationResult {
    try {
      const options: jwt.VerifyOptions = {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      };

      if (!checkExpiration) {
        options.ignoreExpiration = true;
      }

      const decoded = jwt.verify(
        token,
        JWT_CONFIG.SECRET,
        options
      ) as JWTPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          expired: true,
          error: 'Token expired',
        };
      }

      return {
        valid: false,
        error: error.message || 'Invalid token',
      };
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await db
        .update(staff)
        .set({
          last_login: new Date(),
          updated_at: new Date(),
        } as any) // Type cast to avoid strict typing issues
        .where(eq(staff.id, userId));
    } catch (error) {
      console.error('❌ [UnifiedAuth] Failed to update last login:', error);
      // Don't throw error, just log it
    }
  }

  private static getExpirationTime(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiration format: ${expiresIn}`);

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  private static createErrorResult(
    code: AuthErrorCode,
    customMessage?: string
  ): AuthResult {
    return {
      success: false,
      error: customMessage || AUTH_ERROR_MESSAGES[code],
      errorCode: code,
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Hash password for storage
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Get user by ID (for external use)
   */
  static async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const user = await this.findUserById(id);
      if (!user) return null;

      return this.createAuthUserFromDbUser(user);
    } catch (error) {
      console.error('❌ [UnifiedAuth] Get user error:', error);
      return null;
    }
  }

  /**
   * Get development users for auto-login
   */
  static getDevUsers() {
    return DEV_CONFIG.DEFAULT_DEV_USERS;
  }

  /**
   * Check if development mode is enabled
   */
  static isDevMode(): boolean {
    return DEV_CONFIG.ENABLE_AUTO_LOGIN;
  }
}

export default UnifiedAuthService;
