// ============================================
// AUTH TYPES - BARREL EXPORT
// ============================================

// Core auth types and interfaces
export * from './auth';

// Permission and RBAC types
export * from './permissions';

// ============================================
// RE-EXPORT COMMONLY USED TYPES
// ============================================

export type {
  AuthUser,
  JWTPayload, 
  LoginCredentials,
  AuthResult,
  UserRole,
  Permission,
  TokenPair,
  TokenValidationResult,
  AuthError,
  AuthErrorCode,
  TenantData
} from './auth';

// Export permissions (will be refined later)
export * from './permissions'; 