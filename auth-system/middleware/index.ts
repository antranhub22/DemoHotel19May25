// ============================================
// AUTH MIDDLEWARE - BARREL EXPORT
// ============================================

// Main auth middleware
export { authenticateJWT } from './auth.middleware';

// Re-export commonly used functions
export {
  authenticateJWT as default,
  authenticateJWT as authMiddleware
} from './auth.middleware'; 