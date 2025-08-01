// ============================================
// UNIFIED AUTH CONFIGURATION v2.0
// ============================================
// This file centralizes all authentication and JWT configuration
// Used across both client and server sides

import { z } from 'zod';

// ============================================
// JWT CONFIGURATION
// ============================================

export const JWT_CONFIG = {
  // Secrets (from environment)
  SECRET:
    process.env.JWT_SECRET ||
    'dev-secret-key-for-testing-only-change-in-production',
  REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET ||
    'dev-refresh-secret-key',

  // Token expiration
  ACCESS_TOKEN_EXPIRES_IN: '1h', // Short-lived access token
  REFRESH_TOKEN_EXPIRES_IN: '7d', // Long-lived refresh token
  REMEMBER_ME_EXPIRES_IN: '30d', // Extended session

  // Token settings
  ISSUER: 'DemoHotel19May', // JWT issuer
  AUDIENCE: 'hotel-voice-assistant', // JWT audience
  ALGORITHM: 'HS256' as const, // JWT algorithm

  // Cookie settings (for refresh tokens)
  COOKIE_NAME: 'refresh_token',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'strict' as const,
} as const;

// ============================================
// AUTH ENDPOINTS CONFIGURATION
// ============================================

export const AUTH_ENDPOINTS = {
  // Unified endpoints (new)
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  PERMISSIONS: '/api/auth/permissions',

  // Legacy endpoints (for backward compatibility)
  LEGACY_STAFF_LOGIN: '/api/staff/login',
  LEGACY_AUTH_LOGIN: '/api/auth/login',

  // Password management
  CHANGE_PASSWORD: '/api/auth/change-password',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const;

// ============================================
// ROLE HIERARCHY & PERMISSIONS
// ============================================

// ✅ FIXED: Add missing UserRole mappings to match global definition
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'super-admin': 100,
  'hotel-manager': 70,
  'it-manager': 60,
  'front-desk': 40,
  admin: 80, // Added missing roles
  staff: 30,
  manager: 60,
  frontdesk: 40,
  itmanager: 60,
  guest: 10,
} as const;

// Check if role has higher or equal privilege
export const hasRolePrivilege = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// ============================================
// DEFAULT PERMISSIONS BY ROLE
// ============================================

export const DEFAULT_PERMISSIONS = {
  'super-admin': [
    { module: 'system', action: 'manage', allowed: true },
    { module: 'analytics', action: 'export', allowed: true },
    { module: 'dashboard', action: 'manage', allowed: true },
    { module: 'calls', action: 'manage', allowed: true },
    { module: 'requests', action: 'manage', allowed: true },
    { module: 'billing', action: 'manage', allowed: true },
    { module: 'users', action: 'manage', allowed: true },
  ],
  'hotel-manager': [
    { module: 'analytics', action: 'view', allowed: true },
    { module: 'analytics', action: 'export', allowed: true },
    { module: 'dashboard', action: 'edit', allowed: true },
    { module: 'calls', action: 'view', allowed: true },
    { module: 'requests', action: 'manage', allowed: true },
    { module: 'billing', action: 'view', allowed: true },
  ],
  'it-manager': [
    { module: 'system', action: 'debug', allowed: true },
    { module: 'analytics', action: 'view', allowed: true },
    { module: 'dashboard', action: 'view', allowed: true },
    { module: 'calls', action: 'view', allowed: true },
    { module: 'requests', action: 'view', allowed: true },
  ],
  'front-desk': [
    { module: 'dashboard', action: 'view', allowed: true },
    { module: 'calls', action: 'view', allowed: true },
    { module: 'requests', action: 'edit', allowed: true },
  ],
  guest: [{ module: 'dashboard', action: 'view', allowed: true }],
};

// ============================================
// SECURITY CONFIGURATION
// ============================================

export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: false, // Relaxed for demo
  PASSWORD_REQUIRE_LOWERCASE: false, // Relaxed for demo
  PASSWORD_REQUIRE_NUMBERS: false, // Relaxed for demo
  PASSWORD_REQUIRE_SYMBOLS: false, // Relaxed for demo

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // Session management
  MAX_CONCURRENT_SESSIONS: 3,
  IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours

  // Rate limiting
  LOGIN_RATE_LIMIT: 10, // requests per window
  LOGIN_RATE_WINDOW: 60 * 1000, // 1 minute window

  // Token blacklist (for logout)
  BLACKLIST_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  TOKEN_INVALID: 'Invalid authentication token',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'Access to this resource is forbidden',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'Your account has been deactivated',
  ACCOUNT_LOCKED: 'Your account has been locked',
} as const;

// ============================================
// TENANT CONFIGURATION
// ============================================

export const TENANT_CONFIG = {
  // Default tenant (for backward compatibility)
  DEFAULT_TENANT_ID: 'mi-nhon-hotel',
  DEFAULT_HOTEL_NAME: 'Mi Nhon Hotel',
  DEFAULT_SUBDOMAIN: 'minhonmuine',

  // Multi-tenant settings
  SUBDOMAIN_PATTERN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  MAX_SUBDOMAIN_LENGTH: 30,
  RESERVED_SUBDOMAINS: ['www', 'api', 'admin', 'app', 'mail', 'ftp'],

  // Subscription plans
  SUBSCRIPTION_PLANS: ['basic', 'premium', 'enterprise'] as const,
  DEFAULT_PLAN: 'premium' as const,
} as const;

// ============================================
// DEVELOPMENT CONFIGURATION
// ============================================

export const DEV_CONFIG = {
  // Auto-login for development
  ENABLE_AUTO_LOGIN: process.env.NODE_ENV === 'development',
  DEFAULT_DEV_USERS: [
    {
      username: 'admin',
      password: 'admin123',
      role: 'super-admin' as UserRole,
    },
    {
      username: 'manager',
      password: 'manager123',
      role: 'hotel-manager' as UserRole,
    },
    {
      username: 'frontdesk',
      password: 'frontdesk123',
      role: 'front-desk' as UserRole,
    },
    {
      username: 'itmanager',
      password: 'itmanager123',
      role: 'it-manager' as UserRole,
    },
    {
      username: 'staff',
      password: 'staff123',
      role: 'front-desk' as UserRole,
    },
  ],

  // Debug settings
  ENABLE_TOKEN_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_AUTH_DEBUGGING: process.env.NODE_ENV === 'development',
} as const;

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const authValidationSchemas = {
  loginCredentials: z
    .object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH),
      tenantId: z.string().optional(),
      rememberMe: z.boolean().optional(),
    })
    .refine(data => data.username || data.email, {
      message: 'Either username or email is required',
    }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
    }),

  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getTokenExpirationTime = (expiresIn: string): number => {
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
};

export const isProductionEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopmentEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// ============================================
// EXPORT ALL CONFIGURATIONS
// ============================================

export default {
  JWT_CONFIG,
  AUTH_ENDPOINTS,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  SECURITY_CONFIG,
  AUTH_ERROR_MESSAGES,
  TENANT_CONFIG,
  DEV_CONFIG,
  authValidationSchemas,
  // Utility functions
  hasRolePrivilege,
  getTokenExpirationTime,
  isProductionEnvironment,
  isDevelopmentEnvironment,
} as const;
