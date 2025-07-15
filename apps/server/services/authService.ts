import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { db } from '@shared/db';
import { staff } from '@shared/db';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-testing';

// Helper functions
function parseStaffAccounts(envStr: string | undefined): { username: string, password: string }[] {
  if (!envStr) return [];
  return envStr.split(',').map((pair: string) => {
    const [username, password] = pair.split(':');
    return { username, password };
  });
}

const STAFF_ACCOUNTS = parseStaffAccounts(process.env.STAFF_ACCOUNTS);

export class AuthService {
  /**
   * Extract tenant ID from request (subdomain or host)
   */
  static async extractTenantFromRequest(req: Request): Promise<string> {
    const host = req.get('host') || '';
    const subdomain = this.extractSubdomain(host);
    
    if (subdomain === 'localhost' || subdomain === '127.0.0.1' || !subdomain) {
      return this.getMiNhonTenantId();
    }
    
    try {
      const { tenants } = await import('@shared/schema');
      const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
      return tenant?.id || this.getMiNhonTenantId();
    } catch (error) {
      console.error('Error looking up tenant:', error);
      return this.getMiNhonTenantId();
    }
  }

  /**
   * Extract subdomain from host header
   */
  static extractSubdomain(host: string): string {
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

  /**
   * Get Mi Nhon Hotel tenant ID (for backward compatibility)
   */
  static getMiNhonTenantId(): string {
    return process.env.MINHON_TENANT_ID || 'minhon-default-tenant-id';
  }

  /**
   * Find staff in database with tenant association
   */
  static async findStaffInDatabase(username: string, password: string, tenantId: string): Promise<any> {
    try {
      const [staffUser] = await db
        .select()
        .from(staff)
        .where(and(eq(staff.username, username), eq(staff.tenant_id, tenantId)))
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
        tenantId: staffUser.tenant_id,
        permissions: []
      };
    } catch (error) {
      console.error('Error finding staff in database:', error);
      return null;
    }
  }

  /**
   * Find staff in fallback accounts (for backward compatibility)
   */
  static async findStaffInFallback(username: string, password: string, tenantId: string): Promise<any> {
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

  /**
   * Authenticate user and generate JWT token
   */
  static async authenticateUser(username: string, password: string, req: Request): Promise<any> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    const tenantId = await this.extractTenantFromRequest(req);
    
    // Try database first
    let staffUser = await this.findStaffInDatabase(username, password, tenantId);
    
    // If not found in database, try fallback accounts
    if (!staffUser) {
      staffUser = await this.findStaffInFallback(username, password, tenantId);
    }
    
    if (!staffUser) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        username: staffUser.username, 
        role: staffUser.role, 
        tenantId: staffUser.tenant_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      success: true,
      token,
      user: {
        username: staffUser.username,
        role: staffUser.role,
        tenantId: staffUser.tenant_id
      }
    };
  }

  /**
   * Verify JWT token and return user info
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 