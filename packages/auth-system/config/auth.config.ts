// ============================================
// UNIFIED AUTH CONFIGURATION v2.0
// ============================================
// This file centralizes all authentication and JWT configuration
// Used across both client and server sides

import { z } from "zod";

// ============================================
// CORE TYPES (to avoid circular imports)
// ============================================

export type UserRole =
  | "super-admin"
  | "hotel-manager"
  | "front-desk"
  | "it-manager"
  | "admin"
  | "staff"
  | "manager"
  | "frontdesk"
  | "itmanager"
  | "guest";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "USER_INACTIVE"
  | "USER_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "TENANT_ACCESS_DENIED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ACCOUNT_LOCKED"
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_ALREADY_EXISTS"
  | "WEAK_PASSWORD"
  | "EMAIL_NOT_VERIFIED"
  | "VERIFICATION_TOKEN_EXPIRED"
  | "VERIFICATION_TOKEN_INVALID";

// ============================================
// JWT CONFIGURATION
// ============================================

export const JWT_CONFIG = {
  // Secrets (from environment) - ENHANCED VALIDATION
  SECRET: (() => {
    const secret = process.env.JWT_SECRET;
    if (
      process.env.NODE_ENV === "production" &&
      (!secret || secret.length < 32)
    ) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters in production",
      );
    }
    return secret || "dev-secret-key-for-testing-only-change-in-production";
  })(),

  REFRESH_SECRET: (() => {
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (
      process.env.NODE_ENV === "production" &&
      (!refreshSecret || refreshSecret.length < 32)
    ) {
      throw new Error(
        "JWT_REFRESH_SECRET must be at least 32 characters in production",
      );
    }
    return refreshSecret || "dev-refresh-secret-key";
  })(),

  // Token expiration (ENHANCED FOR SECURITY)
  ACCESS_TOKEN_EXPIRES_IN: process.env.NODE_ENV === "production" ? "15m" : "1h", // ✅ Shorter in production
  REFRESH_TOKEN_EXPIRES_IN: process.env.NODE_ENV === "production" ? "7d" : "7d", // ✅ Same for now
  REMEMBER_ME_EXPIRES_IN: process.env.NODE_ENV === "production" ? "14d" : "30d", // ✅ Shorter in production

  // Token settings (ENHANCED)
  ISSUER: "DemoHotel19May",
  AUDIENCE: "hotel-voice-assistant",
  ALGORITHM: "HS256" as const,

  // NEW: Token security features
  INCLUDE_IP_IN_TOKEN: process.env.NODE_ENV === "production", // ✅ IP binding in production
  INCLUDE_USER_AGENT_HASH: process.env.NODE_ENV === "production", // ✅ User-Agent fingerprinting

  // Cookie settings (ENHANCED SECURITY)
  COOKIE_NAME: "refresh_token",
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  COOKIE_SECURE: process.env.NODE_ENV === "production", // ✅ Secure in production only
  COOKIE_HTTP_ONLY: true, // ✅ Always HTTP only
  COOKIE_SAME_SITE:
    process.env.NODE_ENV === "production" ? "strict" : ("lax" as const), // ✅ Stricter in production

  // NEW: Additional cookie security
  COOKIE_PATH: "/", // ✅ Restrict cookie path
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN, // ✅ Allow domain restriction
} as const;

// ============================================
// AUTH ENDPOINTS CONFIGURATION
// ============================================

export const AUTH_ENDPOINTS = {
  // Unified endpoints (new)
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",
  PERMISSIONS: "/api/auth/permissions",

  // Registration endpoints
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  RESEND_VERIFICATION: "/api/auth/resend-verification",

  // Legacy endpoints (for backward compatibility)
  LEGACY_STAFF_LOGIN: "/api/staff/login",
  LEGACY_AUTH_LOGIN: "/api/auth/login",

  // Password management
  CHANGE_PASSWORD: "/api/auth/change-password",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
} as const;

// ============================================
// ROLE HIERARCHY & PERMISSIONS
// ============================================

// ✅ FIXED: Add missing UserRole mappings to match global definition
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  "super-admin": 100,
  "hotel-manager": 70,
  "it-manager": 60,
  "front-desk": 40,
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
  requiredRole: UserRole,
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// ============================================
// DEFAULT PERMISSIONS BY ROLE
// ============================================

export const DEFAULT_PERMISSIONS = {
  "super-admin": [
    { module: "system", action: "manage", allowed: true },
    { module: "analytics", action: "export", allowed: true },
    { module: "dashboard", action: "manage", allowed: true },
    { module: "calls", action: "manage", allowed: true },
    { module: "requests", action: "manage", allowed: true },
    { module: "billing", action: "manage", allowed: true },
    { module: "users", action: "manage", allowed: true },
  ],
  "hotel-manager": [
    { module: "analytics", action: "view", allowed: true },
    { module: "analytics", action: "export", allowed: true },
    { module: "dashboard", action: "edit", allowed: true },
    { module: "calls", action: "view", allowed: true },
    { module: "requests", action: "manage", allowed: true },
    { module: "billing", action: "view", allowed: true },
  ],
  "it-manager": [
    { module: "system", action: "debug", allowed: true },
    { module: "analytics", action: "view", allowed: true },
    { module: "dashboard", action: "view", allowed: true },
    { module: "calls", action: "view", allowed: true },
    { module: "requests", action: "view", allowed: true },
  ],
  "front-desk": [
    { module: "dashboard", action: "view", allowed: true },
    { module: "dashboard", action: "view_client_interface", allowed: true }, // ✅ Added
    { module: "calls", action: "view", allowed: true },
    { module: "requests", action: "edit", allowed: true },
  ],
  guest: [{ module: "dashboard", action: "view", allowed: true }],
};

// ============================================
// SECURITY CONFIGURATION
// ============================================

export const SECURITY_CONFIG = {
  // Password requirements (STRENGTHENED FOR PRODUCTION)
  PASSWORD_MIN_LENGTH: 12, // ✅ Increased from 8 to 12
  PASSWORD_REQUIRE_UPPERCASE: process.env.NODE_ENV === "production", // ✅ Required in production
  PASSWORD_REQUIRE_LOWERCASE: process.env.NODE_ENV === "production", // ✅ Required in production
  PASSWORD_REQUIRE_NUMBERS: process.env.NODE_ENV === "production", // ✅ Required in production
  PASSWORD_REQUIRE_SYMBOLS: process.env.NODE_ENV === "production", // ✅ Required in production

  // Password history (prevent reuse)
  PASSWORD_HISTORY_COUNT: 5, // ✅ NEW: Prevent reusing last 5 passwords
  PASSWORD_MAX_AGE: 90 * 24 * 60 * 60 * 1000, // ✅ NEW: Force change every 90 days

  // Account lockout (ENHANCED)
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // ✅ Increased to 30 minutes
  PROGRESSIVE_LOCKOUT: true, // ✅ NEW: Increase lockout time with repeated attempts

  // Session management (ENHANCED)
  MAX_CONCURRENT_SESSIONS: 3,
  IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // ✅ NEW: Force logout after 8 hours regardless of activity
  SESSION_FINGERPRINTING: process.env.NODE_ENV === "production", // ✅ NEW: Device fingerprinting in production

  // Rate limiting (ENHANCED)
  LOGIN_RATE_LIMIT: 5, // ✅ Reduced from 10 to 5 for stricter control
  LOGIN_RATE_WINDOW: 60 * 1000, // 1 minute window
  REGISTRATION_RATE_LIMIT: 3, // ✅ NEW: Max 3 registrations per IP per hour
  REGISTRATION_RATE_WINDOW: 60 * 60 * 1000, // ✅ NEW: 1 hour window
  PASSWORD_RESET_RATE_LIMIT: 3, // ✅ NEW: Max 3 password resets per email per hour
  PASSWORD_RESET_RATE_WINDOW: 60 * 60 * 1000, // ✅ NEW: 1 hour window

  // Token security (ENHANCED)
  BLACKLIST_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  TOKEN_BINDING: process.env.NODE_ENV === "production", // ✅ NEW: Bind tokens to IP/User-Agent in production
  REFRESH_TOKEN_ROTATION: true, // ✅ NEW: Rotate refresh tokens on use

  // Audit & Monitoring (NEW)
  LOG_FAILED_ATTEMPTS: true, // ✅ NEW: Log all failed login attempts
  LOG_SUSPICIOUS_ACTIVITY: true, // ✅ NEW: Log suspicious patterns
  ALERT_MULTIPLE_FAILURES: 10, // ✅ NEW: Alert after 10 failed attempts from same IP
  GEOLOCATION_TRACKING: process.env.NODE_ENV === "production", // ✅ NEW: Track login locations

  // Additional security measures (NEW)
  REQUIRE_EMAIL_VERIFICATION: true, // ✅ NEW: Always require email verification
  TWO_FACTOR_AVAILABLE: false, // ✅ FUTURE: Placeholder for 2FA
  CAPTCHA_AFTER_FAILURES: 3, // ✅ NEW: Show CAPTCHA after 3 failed attempts
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "Invalid username or password",
  TOKEN_EXPIRED: "Your session has expired. Please log in again",
  TOKEN_INVALID: "Invalid authentication token",
  UNAUTHORIZED: "You are not authorized to access this resource",
  FORBIDDEN: "Access to this resource is forbidden",
  USER_NOT_FOUND: "User not found",
  USER_INACTIVE: "Your account has been deactivated",
  ACCOUNT_LOCKED: "Your account has been locked",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  USERNAME_ALREADY_EXISTS: "This username is already taken",
  WEAK_PASSWORD: "Password does not meet security requirements",
  EMAIL_NOT_VERIFIED: "Please verify your email address before logging in",
  VERIFICATION_TOKEN_EXPIRED: "Email verification token has expired",
  VERIFICATION_TOKEN_INVALID: "Invalid email verification token",
} as const;

// ============================================
// TENANT CONFIGURATION
// ============================================

export const TENANT_CONFIG = {
  // Default tenant (for backward compatibility)
  DEFAULT_TENANT_ID: "mi-nhon-hotel",
  DEFAULT_HOTEL_NAME: "Mi Nhon Hotel",
  DEFAULT_SUBDOMAIN: "minhonmuine",

  // Multi-tenant settings
  SUBDOMAIN_PATTERN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  MAX_SUBDOMAIN_LENGTH: 30,
  RESERVED_SUBDOMAINS: ["www", "api", "admin", "app", "mail", "ftp"],

  // Subscription plans
  SUBSCRIPTION_PLANS: ["basic", "premium", "enterprise"] as const,
  DEFAULT_PLAN: "premium" as const,
} as const;

// ============================================
// DEVELOPMENT CONFIGURATION
// ============================================

export const DEV_CONFIG = {
  // Auto-login for development
  ENABLE_AUTO_LOGIN: process.env.NODE_ENV === "development",
  DEFAULT_DEV_USERS: [
    {
      username: "admin",
      password: "admin123",
      role: "super-admin" as UserRole,
    },
    {
      username: "manager",
      password: "manager123",
      role: "hotel-manager" as UserRole,
    },
    {
      username: "frontdesk",
      password: "frontdesk123",
      role: "front-desk" as UserRole,
    },
    {
      username: "itmanager",
      password: "itmanager123",
      role: "it-manager" as UserRole,
    },
    {
      username: "staff",
      password: "staff123",
      role: "front-desk" as UserRole,
    },
  ],

  // Debug settings
  ENABLE_TOKEN_LOGGING: process.env.NODE_ENV === "development",
  ENABLE_AUTH_DEBUGGING: process.env.NODE_ENV === "development",
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
    .refine((data) => data.username || data.email, {
      message: "Either username or email is required",
    }),

  registerCredentials: z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          "Username can only contain letters, numbers, hyphens, and underscores",
        ),
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(
          SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
          `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`,
        ),
      confirmPassword: z.string(),
      displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .max(100, "Display name must be less than 100 characters"),
      firstName: z.string().max(50).optional(),
      lastName: z.string().max(50).optional(),
      phone: z
        .string()
        .regex(/^\+?[\d\s-()]+$/, "Invalid phone format")
        .optional(),
      tenantId: z.string().optional(),
      role: z
        .enum([
          "super-admin",
          "hotel-manager",
          "front-desk",
          "it-manager",
          "admin",
          "staff",
          "manager",
          "frontdesk",
          "itmanager",
          "guest",
        ])
        .optional(),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),

  emailVerification: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
    }),

  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),

  forgotPassword: z.object({
    email: z.string().email("Invalid email format"),
  }),

  resetPassword: z
    .object({
      token: z.string().min(1, "Reset token is required"),
      newPassword: z
        .string()
        .min(
          SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
          `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`,
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
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
  return process.env.NODE_ENV === "production";
};

export const isDevelopmentEnvironment = (): boolean => {
  return process.env.NODE_ENV === "development";
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
