// ============================================
// UNIFIED AUTH TYPES SYSTEM v2.0
// ============================================
// This file provides unified authentication types for the entire system
// Maintains backward compatibility while introducing standardized interfaces

// ============================================
// CORE USER ROLES (Imported from config to avoid circular imports)
// ============================================

// Re-export UserRole from config
export type { AuthErrorCode, UserRole } from "@auth/config";

// ============================================
// PERMISSION SYSTEM
// ============================================

export interface Permission {
  module: string; // 'dashboard', 'analytics', 'billing', 'system', 'calls', 'requests'
  action: string; // 'view', 'edit', 'delete', 'export', 'debug', 'create', 'manage'
  allowed: boolean;
}

// ============================================
// UNIFIED JWT PAYLOAD (Standardized)
// ============================================

export interface JWTPayload {
  // Core user identification
  userId: string; // ✅ STANDARD: Always use userId
  username: string; // ✅ COMPATIBILITY: Username for login
  email: string | null; // ✅ NULLABLE: Some users may not have email

  // Role & permissions
  role: UserRole;
  permissions: Permission[];

  // Multi-tenant support
  tenantId: string; // ✅ STANDARD: Always use tenantId (not tenant_id)
  hotelId?: string; // ✅ COMPATIBILITY: For backward compatibility

  // JWT standard claims
  iat: number; // Issued at
  exp: number; // Expires at
  jti?: string; // JWT ID for token invalidation
  iss?: string; // Issuer
  aud?: string; // Audience
}

// ============================================
// UNIFIED AUTH USER (Complete User Object)
// ============================================

export interface AuthUser {
  // Core identification
  id: string; // ✅ MAPS TO: userId in JWT
  username: string; // ✅ Primary login identifier
  email: string | null; // ✅ Nullable email
  displayName: string; // ✅ Human-readable name

  // Role & permissions
  role: UserRole;
  permissions: Permission[];

  // Multi-tenant
  tenantId: string; // ✅ Primary tenant association
  hotelId?: string; // ✅ COMPATIBILITY: Legacy hotel ID

  // Profile info
  avatarUrl?: string; // ✅ Profile picture
  firstName?: string; // ✅ Split name fields
  lastName?: string; // ✅ Split name fields
  phone?: string; // ✅ Contact info

  // Status & timestamps
  isActive: boolean; // ✅ Account status
  lastLogin?: string; // ✅ Last login timestamp (ISO string)
  createdAt?: string; // ✅ Account creation (ISO string)
  updatedAt?: string; // ✅ Last update (ISO string)
}

// ============================================
// AUTHENTICATION RESULT
// ============================================

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string; // ✅ Access token (JWT)
  refreshToken?: string; // ✅ Refresh token
  expiresIn?: number; // ✅ Token expiration (seconds)
  tokenType?: string; // ✅ Usually "Bearer"
  error?: string; // ✅ Error message if failed
  errorCode?: string; // ✅ Error code for programmatic handling
}

// ============================================
// LOGIN CREDENTIALS
// ============================================

export interface LoginCredentials {
  username?: string; // ✅ Primary login method
  email?: string; // ✅ Alternative login method
  password: string; // ✅ Required password
  tenantId?: string; // ✅ Optional tenant specification
  rememberMe?: boolean; // ✅ Extended session option
}

// ============================================
// REGISTRATION CREDENTIALS
// ============================================

export interface RegisterCredentials {
  username: string; // ✅ Required username
  email: string; // ✅ Required email for verification
  password: string; // ✅ Required password
  confirmPassword: string; // ✅ Password confirmation
  displayName: string; // ✅ Display name
  firstName?: string; // ✅ Optional first name
  lastName?: string; // ✅ Optional last name
  phone?: string; // ✅ Optional phone
  tenantId?: string; // ✅ Optional tenant specification
  role?: UserRole; // ✅ Optional role (default: front-desk)
  acceptTerms: boolean; // ✅ Terms acceptance
}

export interface EmailVerificationData {
  token: string;
  email: string;
  expiresAt: string;
  verified: boolean;
}

// ============================================
// SESSION MANAGEMENT TYPES
// ============================================

export interface SessionData {
  id: string;
  userId: string;
  tokenId: string; // JWT jti claim
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: LocationInfo;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet" | "unknown";
  os: string;
  browser: string;
  fingerprint: string; // Device fingerprint hash
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  isp?: string;
}

export interface SessionSummary {
  total: number;
  active: number;
  expired: number;
  current?: SessionData;
  devices: SessionData[];
}

// ============================================
// AUDIT LOGGING TYPES
// ============================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  username?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  action: string;
  resource?: string;
  result: "success" | "failure" | "warning";
  details: Record<string, any>;
  risk_level: "low" | "medium" | "high" | "critical";
  location?: LocationInfo;
}

export type AuditEventType =
  | "auth.login.attempt"
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.logout"
  | "auth.register.attempt"
  | "auth.register.success"
  | "auth.password.change"
  | "auth.password.reset.request"
  | "auth.password.reset.success"
  | "auth.email.verification"
  | "auth.session.created"
  | "auth.session.terminated"
  | "auth.token.refresh"
  | "auth.account.locked"
  | "auth.suspicious.activity"
  | "auth.rate.limit.exceeded"
  | "auth.security.violation";

export interface SecurityAlert {
  id: string;
  timestamp: string;
  alertType: SecurityAlertType;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  triggerEvent: AuditLogEntry;
  relatedEvents: AuditLogEntry[];
  actionTaken?: string;
  resolved: boolean;
}

export type SecurityAlertType =
  | "multiple.failed.logins"
  | "suspicious.location"
  | "unusual.activity.pattern"
  | "brute.force.attempt"
  | "account.compromise.suspected"
  | "rate.limit.violation"
  | "session.hijack.suspected";

// Alternative login credentials for backward compatibility
export interface LegacyLoginCredentials {
  email: string;
  password: string;
}

// ============================================
// LEGACY COMPATIBILITY TYPES
// ============================================

// Maintain backward compatibility with existing User interface
export interface User extends AuthUser {
  name: string; // ✅ MAPPED TO: displayName
  hotelId: string; // ✅ REQUIRED: For legacy compatibility
}

// Legacy auth context (maintain existing interface)
export interface AuthContextType {
  user: User | null; // ✅ Using legacy User interface
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials | LegacyLoginCredentials,
  ) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  getMenuItems: () => MenuItemConfig[];
  switchRole?: (newRole: UserRole) => Promise<void>; // For demo/testing
}

// ============================================
// EXTENDED AUTH CONTEXT (New Unified Version)
// ============================================

export interface UnifiedAuthContextType {
  // Core state
  user: AuthUser | null; // ✅ Using new AuthUser interface
  tenant: TenantData | null; // ✅ Tenant information
  isAuthenticated: boolean;
  isLoading: boolean;

  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;

  // Authorization methods
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasFeature: (feature: string) => boolean;

  // Tenant methods
  canAccessTenant: (tenantId: string) => boolean;
  isWithinLimits: (limitType: string) => boolean;

  // Menu & UI
  getMenuItems: () => MenuItemConfig[];
  getDashboardComponents: () => string[];
}

// ============================================
// TENANT DATA
// ============================================

export interface TenantData {
  id: string;
  hotelName: string;
  subdomain: string;
  subscriptionPlan: "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "suspended" | "cancelled";
  customDomain?: string;
  logoUrl?: string;
  settings?: Record<string, any>;
}

// ============================================
// MENU & ROLE CONFIGURATION (Existing)
// ============================================

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  path: string;
  requiredPermission?: string;
  children?: MenuItemConfig[];
}

export interface RoleConfig {
  role: UserRole;
  permissions: Permission[];
  menuItems: MenuItemConfig[];
  dashboardComponents: string[];
}

// Permission Matrix Type
export type PermissionMatrix = Record<UserRole, Record<string, string[]>>;

// ============================================
// TOKEN MANAGEMENT
// ============================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  expired?: boolean;
}

// ============================================
// TYPE UTILITIES & HELPERS
// ============================================

// Type guard for checking if user has legacy interface
export const isLegacyUser = (user: AuthUser | User): user is User => {
  return "name" in user && "hotelId" in user;
};

// Convert AuthUser to legacy User interface
export const toLegacyUser = (authUser: AuthUser): User => ({
  ...authUser,
  name: authUser.displayName,
  hotelId: authUser.hotelId || authUser.tenantId,
});

// Convert legacy User to AuthUser interface
export const fromLegacyUser = (user: User): AuthUser => ({
  ...user,
  displayName: user.name,
  tenantId: user.hotelId,
});

// ============================================
// ERROR TYPES
// ============================================

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// AuthErrorCode is now exported from config (see re-export above)
