import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../middleware/auth';
import { db } from '../../src/db';
import { staff } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Helper functions
function parseStaffAccounts(envStr: string | undefined): { username: string, password: string }[] {
  if (!envStr) return [];
  return envStr.split(',').map((pair: string) => {
    const [username, password] = pair.split(':');
    return { username, password };
  });
}

const STAFF_ACCOUNTS = parseStaffAccounts(process.env.STAFF_ACCOUNTS);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-testing';

async function extractTenantFromRequest(req: Request): Promise<string> {
  const host = req.get('host') || '';
  const subdomain = extractSubdomain(host);
  
  if (subdomain === 'localhost' || subdomain === '127.0.0.1' || !subdomain) {
    return getMiNhonTenantId();
  }
  
  try {
    const { tenants } = await import('../../shared/schema');
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
    return tenant?.id || getMiNhonTenantId();
  } catch (error) {
    console.error('Error looking up tenant:', error);
    return getMiNhonTenantId();
  }
}

function extractSubdomain(host: string): string {
  const cleanHost = host.split(':')[0];
  
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return 'minhon';
  }
  
  const parts = cleanHost.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return 'minhon';
}

function getMiNhonTenantId(): string {
  return process.env.MINHON_TENANT_ID || 'minhon-default-tenant-id';
}

async function findStaffInDatabase(username: string, password: string, tenantId: string): Promise<any> {
  try {
    const [staffUser] = await db
      .select()
      .from(staff)
      .where(and(eq(staff.username, username), eq(staff.tenantId, tenantId)))
      .limit(1);
    
    if (!staffUser) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, staffUser.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return {
      username: staffUser.username,
      role: staffUser.role || 'staff',
      tenantId: staffUser.tenantId,
      permissions: []
    };
  } catch (error) {
    console.error('Error finding staff in database:', error);
    return null;
  }
}

async function findStaffInFallback(username: string, password: string, tenantId: string): Promise<any> {
  const FALLBACK_ACCOUNTS = [
    { username: 'staff1', password: 'password1', role: 'staff' },
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'admin@hotel.com', password: 'StrongPassword123', role: 'admin' },
    { username: 'manager@hotel.com', password: 'StrongPassword456', role: 'manager' }
  ];
  
  const found = STAFF_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
  const fallbackFound = !found && FALLBACK_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
  
  const account = found || fallbackFound;
  
  if (!account) {
    return null;
  }
  
  return {
    username: account.username,
    role: (account as any).role || 'staff',
    tenantId: tenantId,
    permissions: []
  };
}

// Routes

// Staff login endpoint
router.post('/staff/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const tenantId = await extractTenantFromRequest(req);
    
    // Try database first
    let staffUser = await findStaffInDatabase(username, password, tenantId);
    
    // If not found in database, try fallback accounts
    if (!staffUser) {
      staffUser = await findStaffInFallback(username, password, tenantId);
    }
    
    if (!staffUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        username: staffUser.username, 
        role: staffUser.role, 
        tenantId: staffUser.tenantId 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        username: staffUser.username,
        role: staffUser.role,
        tenantId: staffUser.tenantId
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth login endpoint (for frontend)
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const tenantId = await extractTenantFromRequest(req);
    
    // Try database first
    let staffUser = await findStaffInDatabase(email, password, tenantId);
    
    // If not found in database, try fallback accounts
    if (!staffUser) {
      staffUser = await findStaffInFallback(email, password, tenantId);
    }
    
    if (!staffUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        username: staffUser.username, 
        role: staffUser.role, 
        tenantId: staffUser.tenantId 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        username: staffUser.username,
        role: staffUser.role,
        tenantId: staffUser.tenantId
      }
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/auth/me', verifyJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 