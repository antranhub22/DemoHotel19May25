import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  username: string;
  tenantId?: string;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

// Fallback JWT secret for development - must match routes.ts
const FALLBACK_JWT_SECRET = 'dev-secret-key-for-testing';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    
    // Log for debugging but don't expose the secret
    console.log('Verifying JWT with secret:', secret === FALLBACK_JWT_SECRET ? 'FALLBACK_SECRET' : 'ENV_SECRET');
    
    const payload = jwt.verify(token, secret) as JwtPayload;
    
    // Handle backward compatibility for old tokens without tenant info
    if (!payload.tenant_id && payload.username) {
      // For existing Mi Nhon Hotel staff, use default tenant
      payload.tenant_id = getMiNhonTenantId();
      payload.role = payload.role || 'staff';
      console.log(`⚠️  Legacy token detected for ${payload.username}, assigning Mi Nhon tenant: ${payload.tenant_id}`);
    }
    
    // Gắn payload lên request để sử dụng ở các middleware/route sau
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Get Mi Nhon Hotel tenant ID (for backward compatibility)
 */
function getMiNhonTenantId(): string {
  // This should be the actual Mi Nhon tenant ID from the database
  // For now, we'll use a placeholder. In real implementation, this would be fetched from DB
  return process.env.MINHON_TENANT_ID || 'minhon-default-tenant-id';
} 