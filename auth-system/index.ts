// ============================================
// AUTH SYSTEM - MAIN BARREL EXPORT
// ============================================
// Central export point for the entire auth system

// Types & Interfaces
export * from './types';

// Configuration
export * from './config';

// Services
export * from './services';

// Middleware (for backend use)
export * from './middleware';

// Routes (for backend use)
export * from './routes';

// Frontend Components & Utils (for frontend use)
export * from './frontend';

// ============================================
// QUICK ACCESS EXPORTS
// ============================================

// Most commonly used exports for convenience
export { 
  // Types
  type AuthUser,
  type JWTPayload,
  type LoginCredentials,
  type AuthResult,
  type UserRole,
  type Permission
} from './types';

export {
  // Config
  JWT_CONFIG,
  AUTH_ENDPOINTS,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS
} from './config';

export {
  // Services  
  UnifiedAuthService
} from './services';

export {
  // Middleware
  authenticateJWT,
  requireRole,
  requirePermission
} from './middleware';

// ============================================
// MODULE INFO
// ============================================

export const AUTH_SYSTEM_VERSION = '2.0.0';
export const AUTH_SYSTEM_NAME = 'DemoHotel19May Auth System'; 