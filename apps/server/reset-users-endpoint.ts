/**
 * PRODUCTION USER RESET ENDPOINT
 * Temporary endpoint to reset authentication users
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, staff, tenants } from '../../packages/shared/db/index.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'super-admin', displayName: 'System Administrator' },
  { username: 'manager', password: 'manager123', role: 'hotel-manager', displayName: 'Hotel Manager' },
  { username: 'frontdesk', password: 'frontdesk123', role: 'front-desk', displayName: 'Front Desk Staff' },
  { username: 'itmanager', password: 'itmanager123', role: 'it-manager', displayName: 'IT Manager' }
];

/**
 * POST /api/reset-users
 * Emergency endpoint to reset authentication users
 */
router.post('/reset-users', async (req: Request, res: Response) => {
  try {
    console.log('🔧 [RESET] Starting emergency user reset...');

    // Security check - only allow in specific conditions
    const secretKey = req.headers['x-reset-key'] || req.body.resetKey;
    const expectedKey = process.env.RESET_SECRET_KEY || 'emergency-reset-2024';
    
    if (secretKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Invalid reset key',
        hint: 'Use header X-Reset-Key or body.resetKey'
      });
    }

    // Find or create default tenant
    let tenant = await db.select().from(tenants).limit(1);
    if (tenant.length === 0) {
      console.log('🏨 [RESET] Creating default tenant...');
      const newTenant = await db.insert(tenants).values({
        id: 'hotel-minhon',
        hotel_name: 'Mi Nhon Hotel',
        subscription_plan: 'premium',
        subscription_status: 'active',
        created_at: Math.floor(Date.now() / 1000)
      }).returning();
      tenant = newTenant;
    }

    const tenantId = tenant[0].id;
    console.log(`🏨 [RESET] Using tenant: ${tenantId}`);

    const results = [];

    // Reset each user
    for (const user of DEFAULT_USERS) {
      console.log(`🔐 [RESET] Processing user: ${user.username}`);

      try {
        // Delete existing user if exists
        await db.delete(staff).where(
          and(
            eq(staff.username, user.username),
            eq(staff.tenant_id, tenantId)
          )
        );

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log(`🔒 [RESET] Hashed password for ${user.username}`);

        // Create new user
        const newUser = await db.insert(staff).values({
          id: `${user.username}-${Date.now()}`,
          username: user.username,
          email: `${user.username}@minhonhotel.com`,
          password: hashedPassword,
          display_name: user.displayName,
          role: user.role,
          tenant_id: tenantId,
          is_active: true,
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000)
        }).returning();

        console.log(`✅ [RESET] Created user: ${user.username} (${user.role})`);
        
        // Test password verification
        const isValid = await bcrypt.compare(user.password, hashedPassword);
        
        results.push({
          username: user.username,
          role: user.role,
          created: true,
          passwordTest: isValid ? 'VALID' : 'INVALID'
        });

      } catch (userError) {
        console.error(`❌ [RESET] Error creating ${user.username}:`, userError);
        results.push({
          username: user.username,
          created: false,
          error: userError.message
        });
      }
    }

    // Verify final state
    const allUsers = await db.select().from(staff).where(eq(staff.tenant_id, tenantId));
    
    console.log('🎉 [RESET] User reset completed!');

    res.json({
      success: true,
      message: 'User reset completed',
      tenantId,
      results,
      verification: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        active: u.is_active
      })),
      testCredentials: DEFAULT_USERS.map(u => `${u.username}/${u.password}`)
    });

  } catch (error) {
    console.error('❌ [RESET] Fatal error:', error);
    res.status(500).json({
      success: false,
      error: 'User reset failed',
      details: error.message
    });
  }
});

/**
 * GET /api/list-users
 * List current users for debugging
 */
router.get('/list-users', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(staff).limit(20);
    const allTenants = await db.select().from(tenants).limit(10);
    
    res.json({
      success: true,
      users: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        tenantId: u.tenant_id,
        active: u.is_active,
        created: u.created_at
      })),
      tenants: allTenants.map(t => ({
        id: t.id,
        name: t.hotel_name,
        plan: t.subscription_plan,
        status: t.subscription_status
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 