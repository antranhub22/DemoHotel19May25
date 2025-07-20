// ============================================
// UNIFIED AUTH TYPES SYSTEM v2.0
// ============================================
// This file provides unified authentication types for the entire system
// Maintains backward compatibility while introducing standardized interfaces

// ============================================
// CORE USER ROLES (Extended)
// ============================================

// Legacy RBAC roles (maintain backward compatibility)
export type UserRole = 
  | 'hotel-manager' 
  | 'front-desk' 
  | 'it-manager'
  // Extended roles for compatibility with existing auth system
  | 'admin' 
  | 'staff' 
  | 'manager'
  | 'frontdesk'
  | 'itmanager'
  | 'super-admin';

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
  userId: string;           // ✅ STANDARD: Always use userId
  username: string;         // ✅ COMPATIBILITY: Username for login
  email: string | null;     // ✅ NULLABLE: Some users may not have email
  
  // Role & permissions
  role: UserRole;
  permissions: Permission[];
  
  // Multi-tenant support
  tenantId: string;         // ✅ STANDARD: Always use tenantId (not tenant_id)
  hotelId?: string;         // ✅ COMPATIBILITY: For backward compatibility
  
  // JWT standard claims
  iat: number;              // Issued at
  exp: number;              // Expires at  
  jti?: string;             // JWT ID for token invalidation
  iss?: string;             // Issuer
  aud?: string;             // Audience
}

// ============================================
// UNIFIED AUTH USER (Complete User Object)
// ============================================

export interface AuthUser {
  // Core identification
  id: string;               // ✅ MAPS TO: userId in JWT
  username: string;         // ✅ Primary login identifier
  email: string | null;     // ✅ Nullable email
  displayName: string;      // ✅ Human-readable name
  
  // Role & permissions
  role: UserRole;
  permissions: Permission[];
  
  // Multi-tenant
  tenantId: string;         // ✅ Primary tenant association
  hotelId?: string;         // ✅ COMPATIBILITY: Legacy hotel ID
  
  // Profile info
  avatarUrl?: string;       // ✅ Profile picture
  firstName?: string;       // ✅ Split name fields
  lastName?: string;        // ✅ Split name fields
  phone?: string;           // ✅ Contact info
  
  // Status & timestamps
  isActive: boolean;        // ✅ Account status
  lastLogin?: string;       // ✅ Last login timestamp (ISO string)
  createdAt?: string;       // ✅ Account creation (ISO string)  
  updatedAt?: string;       // ✅ Last update (ISO string)
}

// ============================================
// AUTHENTICATION RESULT
// ============================================

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;           // ✅ Access token (JWT)
  refreshToken?: string;    // ✅ Refresh token
  expiresIn?: number;       // ✅ Token expiration (seconds)
  tokenType?: string;       // ✅ Usually "Bearer"
  error?: string;           // ✅ Error message if failed
  errorCode?: string;       // ✅ Error code for programmatic handling
}

// ============================================
// LOGIN CREDENTIALS
// ============================================

export interface LoginCredentials {
  username?: string;        // ✅ Primary login method
  email?: string;           // ✅ Alternative login method  
  password: string;         // ✅ Required password
  tenantId?: string;        // ✅ Optional tenant specification
  rememberMe?: boolean;     // ✅ Extended session option
}

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
  name: string;             // ✅ MAPPED TO: displayName
  hotelId: string;          // ✅ REQUIRED: For legacy compatibility
}

// Legacy auth context (maintain existing interface)
export interface AuthContextType {
  user: User | null;        // ✅ Using legacy User interface
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials | LegacyLoginCredentials) => Promise<void>;
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
  user: AuthUser | null;    // ✅ Using new AuthUser interface
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
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';
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
  return 'name' in user && 'hotelId' in user;
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

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'USER_INACTIVE'
  | 'PERMISSION_DENIED'
  | 'TENANT_ACCESS_DENIED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

// ============================================
// EXPORT ALIASES (Backward Compatibility)
// ============================================

// Re-export legacy types for backward compatibility
export type { User as LegacyUser };
export type { AuthContextType as LegacyAuthContextType };
export type { LoginCredentials as UnifiedLoginCredentials };
export type { JWTPayload as StandardJWTPayload }; 