// ============================================
// BACKWARD COMPATIBILITY RE-EXPORT
// ============================================
// This file maintains backward compatibility for components 
// that still import from @config/auth.config

// Re-export everything from the new location in auth-system
export * from '../../auth-system/config/auth.config';

// Explicit re-exports for commonly used items
export { 
  JWT_CONFIG,
  AUTH_ENDPOINTS,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  SECURITY_CONFIG
} from '../../auth-system/config/auth.config'; 