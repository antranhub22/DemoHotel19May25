// ============================================
// UNIFIED AUTH SERVICE v2.0
// ============================================
// This service replaces all existing auth services and provides
// a single source of truth for authentication and authorization

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Import new unified types and config
import type { AuthErrorCode, UserRole } from "@auth/config";
import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_PERMISSIONS,
  DEV_CONFIG,
  JWT_CONFIG,
  SECURITY_CONFIG,
  TENANT_CONFIG,
  authValidationSchemas,
} from "@auth/config";
import type {
  AuthResult,
  AuthUser,
  DeviceInfo,
  EmailVerificationData,
  JWTPayload,
  LocationInfo,
  LoginCredentials,
  Permission,
  RegisterCredentials,
  SessionData,
  SessionSummary,
  TokenPair,
  TokenValidationResult,
} from "@auth/types";
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
import crypto from "crypto";
import { AuditLogger } from "./AuditLogger";
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
  static async login(
    credentials: LoginCredentials,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<AuthResult> {
    const ipAddress = requestInfo?.ipAddress || "127.0.0.1";
    const userAgent = requestInfo?.userAgent || "Unknown";

    try {
      // Validate input
      const validation =
        authValidationSchemas.loginCredentials.safeParse(credentials);
      if (!validation.success) {
        await AuditLogger.logLoginAttempt(
          credentials.username || credentials.email || "unknown",
          "failure",
          ipAddress,
          userAgent,
          { failureReason: "Invalid credentials format" },
        );
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          "Invalid login credentials",
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
        await AuditLogger.logLoginAttempt(
          loginIdentifier!,
          "failure",
          ipAddress,
          userAgent,
          { failureReason: "User not found" },
        );
        return this.createErrorResult("INVALID_CREDENTIALS");
      }

      // Check if user is active
      if (!user.is_active) {
        console.log(`❌ [UnifiedAuth] User inactive: ${loginIdentifier}`);
        await AuditLogger.logLoginAttempt(
          user.username,
          "failure",
          ipAddress,
          userAgent,
          {
            userId: user.id,
            email: user.email,
            failureReason: "Account inactive",
          },
        );
        return this.createErrorResult("USER_INACTIVE");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(
          `❌ [UnifiedAuth] Invalid password for: ${loginIdentifier}`,
        );
        await AuditLogger.logLoginAttempt(
          user.username,
          "failure",
          ipAddress,
          userAgent,
          {
            userId: user.id,
            email: user.email,
            failureReason: "Invalid password",
          },
        );
        return this.createErrorResult("INVALID_CREDENTIALS");
      }

      // Create AuthUser object
      const authUser = await this.createAuthUserFromDbUser(user);

      // Create session with device tracking
      const deviceInfo = this.parseDeviceInfo(userAgent, ipAddress);
      const session = await this.createSession(
        authUser,
        deviceInfo,
        ipAddress,
        userAgent,
      );

      // Generate tokens with session ID
      const tokenPair = this.generateTokenPair(
        authUser,
        rememberMe,
        session.tokenId,
      );

      // Update last login
      await this.updateLastLogin(user.id);

      // Log successful login
      await AuditLogger.logLoginAttempt(
        user.username,
        "success",
        ipAddress,
        userAgent,
        {
          userId: user.id,
          email: user.email,
          sessionId: session.id,
          deviceFingerprint: deviceInfo.fingerprint,
        },
      );

      console.log(
        `✅ [UnifiedAuth] Login successful: ${loginIdentifier} (${authUser.role})`,
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
      console.error("❌ [UnifiedAuth] Login error:", error);
      return this.createErrorResult("SERVER_ERROR");
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
        // Token blacklisted - logging removed for security
        return null;
      }

      // Verify user still exists and is active
      const user = await this.findUserById(payload.userId);
      if (!user || !user.is_active) {
        console.log(
          `❌ [UnifiedAuth] User not found or inactive: ${payload.userId}`,
        );
        return null;
      }

      return this.createAuthUserFromDbUser(user);
    } catch (error) {
      console.error("❌ [UnifiedAuth] Token verification error:", error);
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
        return this.createErrorResult("TOKEN_INVALID");
      }

      const payload = validation.payload;

      // Check if refresh token is blacklisted
      if (payload.jti && TokenBlacklist.isBlacklisted(payload.jti)) {
        return this.createErrorResult("TOKEN_INVALID");
      }

      // Get fresh user data
      const user = await this.findUserById(payload.userId);
      if (!user || !user.is_active) {
        return this.createErrorResult("USER_INACTIVE");
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
      console.error("❌ [UnifiedAuth] Refresh token error:", error);
      return this.createErrorResult("SERVER_ERROR");
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
          `✅ [UnifiedAuth] Token blacklisted: ${validation.payload.jti}`,
        );
      }
    } catch (error) {
      console.error("❌ [UnifiedAuth] Logout error:", error);
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
    action: string,
  ): boolean {
    return user.permissions.some(
      (permission) =>
        permission.module === module &&
        permission.action === action &&
        permission.allowed,
    );
  }

  /**
   * Check if user has specific role or higher
   */
  static hasRole(user: AuthUser, role: UserRole): boolean {
    const {
      hasRolePrivilege,
    } = require("../../../packages/config/auth.config");
    return hasRolePrivilege(user.role, role);
  }

  /**
   * Check if user can access specific tenant
   */
  static canAccessTenant(user: AuthUser, tenantId: string): boolean {
    // Super admin can access all tenants
    if (user.role === "super-admin") {
      return true;
    }

    // Regular users can only access their own tenant
    return user.tenantId === tenantId;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static prisma: PrismaClient;

  private static getPrisma(): PrismaClient {
    if (!this.prisma) {
      this.prisma = PrismaConnectionManager.getInstance().getClient();
    }
    return this.prisma;
  }

  private static async findUserByCredentials(
    loginIdentifier: string,
    tenantId?: string,
  ): Promise<any> {
    try {
      // Build where conditions for Prisma
      const whereConditions: any = {
        is_active: true,
      };

      // Search by username or email
      const isEmail = loginIdentifier.includes("@");
      if (isEmail) {
        whereConditions.email = loginIdentifier;
      } else {
        whereConditions.username = loginIdentifier;
      }

      // Filter by tenant if provided
      if (tenantId) {
        whereConditions.tenant_id = tenantId;
      }

      const user = await this.getPrisma().staff.findFirst({
        where: whereConditions,
      });

      return user;
    } catch (error) {
      console.error(
        "❌ [UnifiedAuth] Error finding user by credentials:",
        error,
      );
      return null;
    }
  }

  private static async findUserById(userId: string): Promise<any> {
    try {
      const user = await this.getPrisma().staff.findUnique({
        where: {
          id: userId,
        },
      });

      return user;
    } catch (error) {
      console.error("❌ [UnifiedAuth] Error finding user by ID:", error);
      return null;
    }
  }

  private static async createAuthUserFromDbUser(
    dbUser: any,
  ): Promise<AuthUser> {
    // Get user permissions
    let permissions: Permission[] = [];

    try {
      // Parse permissions from database
      if (dbUser.permissions && typeof dbUser.permissions === "string") {
        permissions = JSON.parse(dbUser.permissions);
      } else if (Array.isArray(dbUser.permissions)) {
        permissions = dbUser.permissions;
      }

      // Fallback to role-based permissions if no custom permissions
      if (permissions.length === 0) {
        const rolePermissions = (DEFAULT_PERMISSIONS as any)?.[
          dbUser.role as any
        ]; // ✅ FIXED: Use any types to bypass iterator issues
        permissions = (
          rolePermissions ? Object.values(rolePermissions).flat() : []
        ) as any[]; // ✅ FIXED: Cast to any[] explicitly
      }
    } catch (error) {
      console.warn(
        `⚠️ [UnifiedAuth] Failed to parse permissions for user ${dbUser.id}, using role defaults`,
      );
      const rolePermissions = (DEFAULT_PERMISSIONS as any)?.[
        dbUser.role as any
      ]; // ✅ FIXED: Use any types to bypass iterator issues
      permissions = (
        rolePermissions ? Object.values(rolePermissions).flat() : []
      ) as any[]; // ✅ FIXED: Cast to any[] explicitly
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
    rememberMe = false,
    _sessionTokenId?: string,
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
      tokenType: "Bearer",
    };
  }

  private static validateToken(
    token: string,
    checkExpiration = true,
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
        options,
      ) as JWTPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return {
          valid: false,
          expired: true,
          error: "Token expired",
        };
      }

      return {
        valid: false,
        error: (error as any)?.message || String(error) || "Invalid token",
      };
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.getPrisma().staff.update({
        where: {
          id: userId,
        },
        data: {
          last_login: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error("❌ [UnifiedAuth] Failed to update last login:", error);
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
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiresIn}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  private static createErrorResult(
    code: AuthErrorCode,
    customMessage?: string,
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

  // ============================================
  // REGISTRATION METHODS
  // ============================================

  /**
   * Register a new user account
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      // Validate input
      const validation =
        authValidationSchemas.registerCredentials.safeParse(credentials);
      if (!validation.success) {
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          validation.error.errors[0]?.message || "Invalid registration data",
        );
      }

      const {
        username,
        email,
        password,
        displayName,
        firstName,
        lastName,
        phone,
        tenantId,
        role = "front-desk",
      } = validation.data;

      console.log(
        `📝 [UnifiedAuth] Registration attempt for: ${username} (${email})`,
      );

      // Check if email already exists
      const existingEmailUser = await this.findUserByCredentials(
        email,
        tenantId,
      );
      if (existingEmailUser) {
        console.log(`❌ [UnifiedAuth] Email already exists: ${email}`);
        return this.createErrorResult("EMAIL_ALREADY_EXISTS");
      }

      // Check if username already exists
      const existingUsernameUser = await this.findUserByCredentials(
        username,
        tenantId,
      );
      if (existingUsernameUser) {
        console.log(`❌ [UnifiedAuth] Username already exists: ${username}`);
        return this.createErrorResult("USERNAME_ALREADY_EXISTS");
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return this.createErrorResult(
          "WEAK_PASSWORD",
          passwordValidation.message,
        );
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user in database
      const newUser = await this.createUser({
        username,
        email,
        password: hashedPassword,
        displayName,
        firstName,
        lastName,
        phone,
        tenantId: tenantId || TENANT_CONFIG.DEFAULT_TENANT_ID,
        role,
        isActive: false, // Start inactive until email verified
      });

      // Generate email verification token
      const verificationToken =
        await this.generateEmailVerificationToken(email);

      // Send verification email (implementation will be added)
      await this.sendVerificationEmail(email, verificationToken, displayName);

      console.log(`✅ [UnifiedAuth] User registered successfully: ${username}`);

      return {
        success: true,
        user: undefined, // Don't return user until verified
        token: undefined,
        refreshToken: undefined,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Registration error:", error);
      return this.createErrorResult("SERVER_ERROR", "Registration failed");
    }
  }

  /**
   * Verify email address with token
   */
  static async verifyEmail(token: string): Promise<AuthResult> {
    try {
      console.log(`📧 [UnifiedAuth] Email verification attempt`);

      // Validate token format
      const validation = authValidationSchemas.emailVerification.safeParse({
        token,
      });
      if (!validation.success) {
        return this.createErrorResult("VERIFICATION_TOKEN_INVALID");
      }

      // Find verification record
      const verification = await this.findEmailVerificationToken(token);
      if (!verification) {
        console.log(`❌ [UnifiedAuth] Verification token not found`);
        return this.createErrorResult("VERIFICATION_TOKEN_INVALID");
      }

      // Check if token expired
      if (new Date() > new Date(verification.expiresAt)) {
        console.log(`❌ [UnifiedAuth] Verification token expired`);
        await this.deleteEmailVerificationToken(token);
        return this.createErrorResult("VERIFICATION_TOKEN_EXPIRED");
      }

      // Find user by email
      const user = await this.findUserByCredentials(verification.email);
      if (!user) {
        console.log(
          `❌ [UnifiedAuth] User not found for verification: ${verification.email}`,
        );
        return this.createErrorResult("USER_NOT_FOUND");
      }

      // Activate user account
      await this.activateUserAccount(user.id);

      // Clean up verification token
      await this.deleteEmailVerificationToken(token);

      // Create AuthUser object
      const authUser = await this.createAuthUserFromDbUser({
        ...user,
        is_active: true,
      });

      // Generate login tokens
      const tokenPair = this.generateTokenPair(authUser);

      console.log(
        `✅ [UnifiedAuth] Email verified successfully: ${verification.email}`,
      );

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: tokenPair.tokenType,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Email verification error:", error);
      return this.createErrorResult(
        "SERVER_ERROR",
        "Email verification failed",
      );
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerificationEmail(email: string): Promise<AuthResult> {
    try {
      console.log(`📧 [UnifiedAuth] Resend verification for: ${email}`);

      // Find user by email
      const user = await this.findUserByCredentials(email);
      if (!user) {
        // Don't reveal if email exists for security
        return {
          success: true,
          user: undefined,
          token: undefined,
          refreshToken: undefined,
          error: undefined,
          errorCode: undefined,
        };
      }

      // Check if already verified
      if (user.is_active) {
        return this.createErrorResult(
          "EMAIL_ALREADY_EXISTS",
          "Email already verified",
        );
      }

      // Delete existing verification tokens for this email
      await this.deleteEmailVerificationTokensByEmail(email);

      // Generate new verification token
      const verificationToken =
        await this.generateEmailVerificationToken(email);

      // Send verification email
      await this.sendVerificationEmail(
        email,
        verificationToken,
        user.display_name || user.username,
      );

      console.log(`✅ [UnifiedAuth] Verification email resent: ${email}`);

      return {
        success: true,
        user: undefined,
        token: undefined,
        refreshToken: undefined,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Resend verification error:", error);
      return this.createErrorResult(
        "SERVER_ERROR",
        "Failed to resend verification email",
      );
    }
  }

  /**
   * Hash password for storage
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Increased for better security
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Get user by ID (for external use)
   */
  static async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        return null;
      }

      return this.createAuthUserFromDbUser(user);
    } catch (error) {
      console.error("❌ [UnifiedAuth] Get user error:", error);
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

  // ============================================
  // SESSION MANAGEMENT METHODS
  // ============================================

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionSummary> {
    try {
      const sessions = await this.getSessionsFromStorage(userId);
      const activeSessions = sessions.filter(
        (s) => s.isActive && new Date(s.expiresAt) > new Date(),
      );

      return {
        total: sessions.length,
        active: activeSessions.length,
        expired: sessions.length - activeSessions.length,
        devices: activeSessions,
      };
    } catch (error) {
      console.error("❌ [UnifiedAuth] Get user sessions error:", error);
      return { total: 0, active: 0, expired: 0, devices: [] };
    }
  }

  /**
   * Terminate specific session
   */
  static async terminateSession(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    try {
      console.log(
        `🔄 [UnifiedAuth] Terminating session: ${sessionId} for user: ${userId}`,
      );

      // Get session data
      const session = await this.getSessionById(sessionId);
      if (!session || session.userId !== userId) {
        return false;
      }

      // Add token to blacklist
      if (session.tokenId) {
        TokenBlacklist.addToken(session.tokenId);
      }

      // Mark session as inactive
      await this.markSessionInactive(sessionId);

      console.log(`✅ [UnifiedAuth] Session terminated: ${sessionId}`);
      return true;
    } catch (error) {
      console.error("❌ [UnifiedAuth] Terminate session error:", error);
      return false;
    }
  }

  /**
   * Terminate all sessions except current
   */
  static async terminateOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    try {
      console.log(
        `🔄 [UnifiedAuth] Terminating other sessions for user: ${userId}`,
      );

      const sessions = await this.getSessionsFromStorage(userId);
      let terminatedCount = 0;

      for (const session of sessions) {
        if (session.id !== currentSessionId && session.isActive) {
          const success = await this.terminateSession(userId, session.id);
          if (success) terminatedCount++;
        }
      }

      console.log(
        `✅ [UnifiedAuth] Terminated ${terminatedCount} other sessions`,
      );
      return terminatedCount;
    } catch (error) {
      console.error("❌ [UnifiedAuth] Terminate other sessions error:", error);
      return 0;
    }
  }

  /**
   * Create new session with device tracking
   */
  static async createSession(
    user: AuthUser,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string,
  ): Promise<SessionData> {
    try {
      // Check for existing sessions and enforce limits
      await this.enforceSessionLimits(user.id);

      // Create session data
      const sessionData: SessionData = {
        id: crypto.randomUUID(),
        userId: user.id,
        tokenId: crypto.randomUUID(), // Will be used as JWT jti
        deviceInfo,
        ipAddress,
        userAgent,
        location: await this.getLocationFromIP(ipAddress),
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + SECURITY_CONFIG.ABSOLUTE_TIMEOUT,
        ).toISOString(),
        isActive: true,
      };

      // Store session
      await this.storeSession(sessionData);

      console.log(
        `✅ [UnifiedAuth] Session created: ${sessionData.id} for user: ${user.id}`,
      );
      return sessionData;
    } catch (error) {
      console.error("❌ [UnifiedAuth] Create session error:", error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.updateSessionLastActive(sessionId, new Date().toISOString());
    } catch (error) {
      console.error("❌ [UnifiedAuth] Update session activity error:", error);
    }
  }

  // ============================================
  // PASSWORD MANAGEMENT METHODS
  // ============================================

  /**
   * Change user password (requires current password)
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<AuthResult> {
    const ipAddress = requestInfo?.ipAddress || "127.0.0.1";
    const userAgent = requestInfo?.userAgent || "Unknown";
    try {
      console.log(
        `🔑 [UnifiedAuth] Password change attempt for user: ${userId}`,
      );

      // Validate input
      const validation = authValidationSchemas.changePassword.safeParse({
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      if (!validation.success) {
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          validation.error.errors[0]?.message || "Invalid password data",
        );
      }

      // Find user
      const user = await this.findUserById(userId);
      if (!user) {
        console.log(`❌ [UnifiedAuth] User not found: ${userId}`);
        return this.createErrorResult("USER_NOT_FOUND");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        console.log(`❌ [UnifiedAuth] Invalid current password for: ${userId}`);
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          "Current password is incorrect",
        );
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return this.createErrorResult(
          "WEAK_PASSWORD",
          passwordValidation.message,
        );
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return this.createErrorResult(
          "WEAK_PASSWORD",
          "New password must be different from current password",
        );
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password in database
      await this.updateUserPassword(userId, hashedNewPassword);

      // Log password change
      await AuditLogger.logPasswordChange(
        userId,
        user.username,
        ipAddress,
        userAgent,
        "success",
      );

      console.log(
        `✅ [UnifiedAuth] Password changed successfully for: ${userId}`,
      );

      return {
        success: true,
        user: undefined,
        token: undefined,
        refreshToken: undefined,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Password change error:", error);
      return this.createErrorResult("SERVER_ERROR", "Password change failed");
    }
  }

  /**
   * Initiate forgot password process
   */
  static async forgotPassword(email: string): Promise<AuthResult> {
    try {
      console.log(`🔑 [UnifiedAuth] Forgot password request for: ${email}`);

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          "Invalid email format",
        );
      }

      // Find user by email (don't reveal if user exists for security)
      const user = await this.findUserByCredentials(email);

      if (user && user.is_active) {
        // Generate password reset token
        const resetToken = await this.generatePasswordResetToken(email);

        // Send password reset email
        await this.sendPasswordResetEmail(
          email,
          resetToken,
          user.display_name || user.username,
        );
      }

      // Always return success for security (don't reveal if email exists)
      console.log(
        `✅ [UnifiedAuth] Forgot password email sent (if user exists): ${email}`,
      );

      return {
        success: true,
        user: undefined,
        token: undefined,
        refreshToken: undefined,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Forgot password error:", error);
      return this.createErrorResult(
        "SERVER_ERROR",
        "Forgot password request failed",
      );
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<AuthResult> {
    try {
      console.log(`🔑 [UnifiedAuth] Password reset attempt`);

      if (!token || !newPassword) {
        return this.createErrorResult(
          "INVALID_CREDENTIALS",
          "Reset token and new password are required",
        );
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return this.createErrorResult(
          "WEAK_PASSWORD",
          passwordValidation.message,
        );
      }

      // Find password reset record
      const resetData = await this.findPasswordResetToken(token);
      if (!resetData) {
        console.log(`❌ [UnifiedAuth] Password reset token not found`);
        return this.createErrorResult(
          "VERIFICATION_TOKEN_INVALID",
          "Invalid or expired reset token",
        );
      }

      // Check if token expired (24 hours)
      if (new Date() > new Date(resetData.expiresAt)) {
        console.log(`❌ [UnifiedAuth] Password reset token expired`);
        await this.deletePasswordResetToken(token);
        return this.createErrorResult(
          "VERIFICATION_TOKEN_EXPIRED",
          "Reset token has expired",
        );
      }

      // Find user by email
      const user = await this.findUserByCredentials(resetData.email);
      if (!user) {
        console.log(
          `❌ [UnifiedAuth] User not found for reset: ${resetData.email}`,
        );
        return this.createErrorResult("USER_NOT_FOUND");
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password in database
      await this.updateUserPassword(user.id, hashedNewPassword);

      // Clean up reset token
      await this.deletePasswordResetToken(token);

      // Create AuthUser object
      const authUser = await this.createAuthUserFromDbUser(user);

      // Generate login tokens (auto-login after reset)
      const tokenPair = this.generateTokenPair(authUser);

      console.log(
        `✅ [UnifiedAuth] Password reset successfully for: ${resetData.email}`,
      );

      return {
        success: true,
        user: authUser,
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: tokenPair.tokenType,
        error: undefined,
        errorCode: undefined,
      };
    } catch (error: any) {
      console.error("❌ [UnifiedAuth] Password reset error:", error);
      return this.createErrorResult("SERVER_ERROR", "Password reset failed");
    }
  }

  // ============================================
  // REGISTRATION HELPER METHODS
  // ============================================

  /**
   * Validate password strength
   */
  private static validatePasswordStrength(password: string): {
    valid: boolean;
    message?: string;
  } {
    const config = SECURITY_CONFIG;

    if (password.length < config.PASSWORD_MIN_LENGTH) {
      return {
        valid: false,
        message: `Password must be at least ${config.PASSWORD_MIN_LENGTH} characters`,
      };
    }

    if (config.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (config.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (config.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    if (
      config.PASSWORD_REQUIRE_SYMBOLS &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        valid: false,
        message: "Password must contain at least one special character",
      };
    }

    return { valid: true };
  }

  /**
   * Create new user in database
   */
  private static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    tenantId: string;
    role: UserRole;
    isActive: boolean;
  }): Promise<any> {
    const prisma = await PrismaConnectionManager.getInstance();

    // Create new user record (using raw query for now)
    const newUser = await (prisma as any).staff.create({
      data: {
        id: crypto.randomUUID(),
        tenant_id: userData.tenantId,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        display_name: userData.displayName,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        is_active: userData.isActive,
        permissions: "[]", // Start with empty permissions, will be populated by role
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return newUser;
  }

  /**
   * Generate email verification token
   */
  private static async generateEmailVerificationToken(
    email: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token (in a real app, this would be in database)
    // For now, we'll use a simple in-memory storage
    await this.storeEmailVerificationToken({
      token,
      email,
      expiresAt: expiresAt.toISOString(),
      verified: false,
    });

    return token;
  }

  /**
   * Store email verification token (temporary implementation)
   */
  private static emailVerificationTokens = new Map<
    string,
    EmailVerificationData
  >();

  private static async storeEmailVerificationToken(
    data: EmailVerificationData,
  ): Promise<void> {
    this.emailVerificationTokens.set(data.token, data);
  }

  private static async findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationData | null> {
    return this.emailVerificationTokens.get(token) || null;
  }

  private static async deleteEmailVerificationToken(
    token: string,
  ): Promise<void> {
    this.emailVerificationTokens.delete(token);
  }

  private static async deleteEmailVerificationTokensByEmail(
    email: string,
  ): Promise<void> {
    for (const [token, data] of this.emailVerificationTokens.entries()) {
      if (data.email === email) {
        this.emailVerificationTokens.delete(token);
      }
    }
  }

  /**
   * Send verification email (placeholder implementation)
   */
  private static async sendVerificationEmail(
    email: string,
    token: string,
    displayName: string,
  ): Promise<void> {
    // In a real implementation, this would send an actual email
    // For now, just log the verification token for development
    console.log(`📧 [EmailService] Verification email for ${email}:`);
    console.log(`   Display Name: ${displayName}`);
    console.log(`   Verification Token: ${token}`);
    console.log(`   Verification URL: /verify-email?token=${token}`);

    // TODO: Implement actual email sending with email service
    // await emailService.send({
    //   to: email,
    //   subject: 'Verify your email address',
    //   template: 'email-verification',
    //   data: { displayName, verificationUrl: `/verify-email?token=${token}` }
    // });
  }

  /**
   * Activate user account after email verification
   */
  private static async activateUserAccount(userId: string): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).staff.update({
      where: { id: userId },
      data: {
        is_active: true,
        updated_at: new Date(),
      },
    });
  }

  // ============================================
  // PASSWORD MANAGEMENT HELPER METHODS
  // ============================================

  /**
   * Update user password in database
   */
  private static async updateUserPassword(
    userId: string,
    hashedPassword: string,
  ): Promise<void> {
    const prisma = await PrismaConnectionManager.getInstance();

    await (prisma as any).staff.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Generate password reset token
   */
  private static async generatePasswordResetToken(
    email: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store password reset token
    await this.storePasswordResetToken({
      token,
      email,
      expiresAt: expiresAt.toISOString(),
      used: false,
    });

    return token;
  }

  /**
   * Password reset token storage (temporary implementation)
   */
  private static passwordResetTokens = new Map<
    string,
    {
      token: string;
      email: string;
      expiresAt: string;
      used: boolean;
    }
  >();

  private static async storePasswordResetToken(data: {
    token: string;
    email: string;
    expiresAt: string;
    used: boolean;
  }): Promise<void> {
    this.passwordResetTokens.set(data.token, data);
  }

  private static async findPasswordResetToken(token: string): Promise<{
    token: string;
    email: string;
    expiresAt: string;
    used: boolean;
  } | null> {
    return this.passwordResetTokens.get(token) || null;
  }

  private static async deletePasswordResetToken(token: string): Promise<void> {
    this.passwordResetTokens.delete(token);
  }

  /**
   * Send password reset email (placeholder implementation)
   */
  private static async sendPasswordResetEmail(
    email: string,
    token: string,
    displayName: string,
  ): Promise<void> {
    // In a real implementation, this would send an actual email
    // For now, just log the reset token for development
    console.log(`📧 [EmailService] Password reset email for ${email}:`);
    console.log(`   Display Name: ${displayName}`);
    console.log(`   Reset Token: ${token}`);
    console.log(`   Reset URL: /reset-password?token=${token}`);
    console.log(
      `   Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}`,
    );

    // TODO: Implement actual email sending with email service
    // await emailService.send({
    //   to: email,
    //   subject: 'Reset your password',
    //   template: 'password-reset',
    //   data: { displayName, resetUrl: `/reset-password?token=${token}` }
    // });
  }

  // ============================================
  // SESSION MANAGEMENT HELPER METHODS
  // ============================================

  /**
   * Session storage (in-memory for now, should be Redis/Database in production)
   */
  private static sessions = new Map<string, SessionData>();

  private static async storeSession(session: SessionData): Promise<void> {
    this.sessions.set(session.id, session);
  }

  private static async getSessionById(
    sessionId: string,
  ): Promise<SessionData | null> {
    return this.sessions.get(sessionId) || null;
  }

  private static async getSessionsFromStorage(
    userId: string,
  ): Promise<SessionData[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId,
    );
  }

  private static async markSessionInactive(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  private static async updateSessionLastActive(
    sessionId: string,
    timestamp: string,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = timestamp;
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Enforce session limits for user
   */
  private static async enforceSessionLimits(userId: string): Promise<void> {
    const sessions = await this.getSessionsFromStorage(userId);
    const activeSessions = sessions.filter(
      (s) => s.isActive && new Date(s.expiresAt) > new Date(),
    );

    // If at limit, terminate oldest session
    if (activeSessions.length >= SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS) {
      const oldestSession = activeSessions.sort(
        (a, b) =>
          new Date(a.lastActiveAt).getTime() -
          new Date(b.lastActiveAt).getTime(),
      )[0];

      if (oldestSession) {
        await this.terminateSession(userId, oldestSession.id);
        console.log(
          `🔄 [UnifiedAuth] Terminated oldest session due to limit: ${oldestSession.id}`,
        );
      }
    }
  }

  /**
   * Parse device info from User-Agent
   */
  static parseDeviceInfo(userAgent: string, ipAddress: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Detect device type
    let type: DeviceInfo["type"] = "unknown";
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      type = "mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      type = "tablet";
    } else if (
      ua.includes("mozilla") ||
      ua.includes("chrome") ||
      ua.includes("safari")
    ) {
      type = "desktop";
    }

    // Detect OS
    let os = "Unknown";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
      os = "iOS";

    // Detect browser
    let browser = "Unknown";
    if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
      browser = "Safari";
    else if (ua.includes("edg")) browser = "Edge";
    else if (ua.includes("opera")) browser = "Opera";

    // Generate device fingerprint
    const fingerprint = crypto
      .createHash("sha256")
      .update(userAgent + ipAddress + os + browser)
      .digest("hex")
      .substring(0, 16);

    return { type, os, browser, fingerprint };
  }

  /**
   * Get location from IP (placeholder implementation)
   */
  private static async getLocationFromIP(
    ipAddress: string,
  ): Promise<LocationInfo | undefined> {
    // In production, this would call a geolocation service
    // For now, return undefined (local/development)
    if (
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.")
    ) {
      return {
        country: "Local",
        region: "Development",
        city: "localhost",
        timezone: "UTC",
        isp: "Local Network",
      };
    }

    // TODO: Implement actual geolocation lookup
    // const response = await fetch(`https://api.geoip.com/v1/${ipAddress}`);
    // return response.json();

    return undefined;
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (new Date(session.expiresAt) <= now) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(
          `🧹 [UnifiedAuth] Cleaned up ${cleanedCount} expired sessions`,
        );
      }

      return cleanedCount;
    } catch (error) {
      console.error("❌ [UnifiedAuth] Session cleanup error:", error);
      return 0;
    }
  }
}

export default UnifiedAuthService;
