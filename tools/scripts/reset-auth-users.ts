#!/usr/bin/env npx tsx

/**
 * RESET AUTHENTICATION USERS
 * Recreate users with correct passwords for auth system
 */

import bcrypt from 'bcryptjs';
import { db, staff, tenants } from '../../packages/shared/db/index.js';
import { eq, and } from 'drizzle-orm';

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'super-admin', displayName: 'System Administrator' },
  { username: 'manager', password: 'manager123', role: 'hotel-manager', displayName: 'Hotel Manager' },
  { username: 'frontdesk', password: 'frontdesk123', role: 'front-desk', displayName: 'Front Desk Staff' },
  { username: 'itmanager', password: 'itmanager123', role: 'it-manager', displayName: 'IT Manager' }
];

async function resetAuthUsers() {
  try {
    console.log('🔧 [ResetAuth] Starting user reset...');

    // Find or create default tenant
    let tenant = await db.select().from(tenants).limit(1);
    if (tenant.length === 0) {
      console.log('🏨 [ResetAuth] Creating default tenant...');
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
    console.log(`🏨 [ResetAuth] Using tenant: ${tenantId}`);

    // Reset each user
    for (const user of DEFAULT_USERS) {
      console.log(`🔐 [ResetAuth] Processing user: ${user.username}`);

      // Delete existing user if exists
      await db.delete(staff).where(
        and(
          eq(staff.username, user.username),
          eq(staff.tenant_id, tenantId)
        )
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`🔒 [ResetAuth] Hashed password for ${user.username}: ${hashedPassword.substring(0, 20)}...`);

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

      console.log(`✅ [ResetAuth] Created user: ${user.username} (${user.role})`);
    }

    // Verify users exist
    console.log('\n📋 [ResetAuth] Verification:');
    const allUsers = await db.select().from(staff).where(eq(staff.tenant_id, tenantId));
    
    for (const user of allUsers) {
      console.log(`✅ ${user.username} | ${user.role} | Active: ${user.is_active}`);
      
      // Test password verification
      const testUser = DEFAULT_USERS.find(u => u.username === user.username);
      if (testUser) {
        const isValid = await bcrypt.compare(testUser.password, user.password);
        console.log(`   Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }

    console.log('\n🎉 [ResetAuth] User reset completed successfully!');
    console.log('\n📝 [ResetAuth] Test credentials:');
    DEFAULT_USERS.forEach(user => {
      console.log(`   ${user.username} / ${user.password} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ [ResetAuth] Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAuthUsers();
}

export { resetAuthUsers }; 