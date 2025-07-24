import express from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ==========================================
// TEMPORARY AUTH ROUTES - EMERGENCY FIX
// ==========================================
// IMPORTANT: These routes are now mounted at /auth/* (NOT /api/auth/*)
// This bypasses ALL /api/* middleware including rate limiting and auth middleware
// TODO: Replace with full auth system later

const JWT_SECRET = process.env.JWT_SECRET || 'emergency-secret-mi-nhon-2024';
const STAFF_ACCOUNTS =
  process.env.STAFF_ACCOUNTS || 'admin:admin123,manager:manager123';

logger.info(
  '🔐 [TEMP-AUTH] Auth routes initialized at /auth/* endpoints',
  'Component'
);

// Parse staff accounts from environment
const parseStaffAccounts = () => {
  const accounts = new Map();
  STAFF_ACCOUNTS.split(',').forEach(account => {
    const [username, password] = account.split(':');
    if (username && password) {
      accounts.set(username.trim(), {
        password: password.trim(),
        role: username === 'admin' ? 'admin' : 'staff',
        tenantId: 'mi-nhon-hotel',
      });
    }
  });
  return accounts;
};

// ✅ POST /api/auth/login - Basic login endpoint
router.post('/login', express.json(), async (req, res) => {
  try {
    const { username, password } = req.body;

    logger.debug(`🔐 [TEMP-AUTH] Login attempt for: ${username}`, 'Component');

    if (!username || !password) {
      return (res as any).status(400).json({
        success: false,
        error: 'Username and password required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Check against staff accounts
    const staffAccounts = parseStaffAccounts();
    const account = staffAccounts.get(username);

    if (!account || account.password !== password) {
      logger.debug(
        `❌ [TEMP-AUTH] Invalid credentials for: ${username}`,
        'Component'
      );
      return (res as any).status(401).json({
        success: false,
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: `${account.tenantId}-${username}`,
      username: username,
      role: account.role,
      tenantId: account.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    logger.debug(
      `✅ [TEMP-AUTH] Login successful for: ${username}`,
      'Component'
    );

    (res as any).json({
      success: true,
      token,
      user: {
        id: tokenPayload.id,
        username: username,
        role: account.role,
        tenantId: account.tenantId,
      },
    });
  } catch (error) {
    logger.error('❌ [TEMP-AUTH] Login error:', 'Component', error);
    (res as any).status(500).json({
      success: false,
      error: 'Authentication server error',
      code: 'AUTH_ERROR',
    });
  }
});

// ✅ POST /api/auth/verify - Verify token endpoint
router.post('/verify', express.json(), async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return (res as any).status(400).json({
        success: false,
        error: 'Token required',
        code: 'TOKEN_MISSING',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    (res as any).json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    logger.debug(
      '❌ [TEMP-AUTH] Token verification failed:',
      'Component',
      error
    );
    (res as any).status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID',
    });
  }
});

// ✅ GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return (res as any).status(401).json({
        success: false,
        error: 'Authorization header required',
        code: 'AUTH_HEADER_MISSING',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    (res as any).json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    (res as any).status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }
});

// ✅ POST /api/auth/logout - Logout endpoint
router.post('/logout', (req, res) => {
  (res as any).json({
    success: true,
    message: 'Logged out successfully',
  });
});

logger.debug('🔧 [TEMP-AUTH] Emergency auth routes loaded', 'Component');

export default router;
