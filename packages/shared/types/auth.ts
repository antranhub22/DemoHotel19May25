// ============================================
// BACKWARD COMPATIBILITY RE-EXPORT
// ============================================
// This file maintains backward compatibility for components 
// that still import from @shared/types/auth

// Re-export everything from the new location in auth-system
export * from '../../auth-system/types/auth';

// Explicit re-exports for commonly used items
export { 
  type AuthUser,
  type JWTPayload,
  type LoginCredentials,
  type AuthResult,
  type UserRole,
  type Permission
} from '../../auth-system/types/auth'; 