// ============================================
// AUTH CONFIG - BARREL EXPORT
// ============================================

// Main auth configuration
export * from './auth.config';

// ============================================
// RE-EXPORT COMMONLY USED CONFIGS
// ============================================

export {
  JWT_CONFIG,
  AUTH_ENDPOINTS,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  SECURITY_CONFIG,
  AUTH_ERROR_MESSAGES,
  TENANT_CONFIG,
  DEV_CONFIG,
  authValidationSchemas
} from './auth.config'; 