// ============================================
// AUTH MIDDLEWARE - BARREL EXPORT
// ============================================

// Main auth middleware
export * from './auth.middleware';

// Convenience exports
export { 
  authenticateJWT,
  requireRole,
  requirePermission,
  authMiddleware
} from './auth.middleware'; 