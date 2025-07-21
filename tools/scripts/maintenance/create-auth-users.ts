#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { db, staff, tenants } from '../../packages/shared/db/index.js';
import { eq } from 'drizzle-orm';

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'super-admin', displayName: 'System Administrator', email: 'admin@minhonhotel.com' },
  { username: 'manager', password: 'manager123', role: 'hotel-manager', displayName: 'Hotel Manager', email: 'manager@minhonhotel.com' },
  { username: 'frontdesk', password: 'frontdesk123', role: 'front-desk', displayName: 'Front Desk Staff', email: 'frontdesk@minhonhotel.com' },
  { username: 'itmanager', password: 'itmanager123', role: 'it-manager', displayName: 'IT Manager', email: 'itmanager@minhonhotel.com' }
];

async function createAuthUsers() {
  try {
    console.log('🔧 Creating authentication users...');

    // Create default tenant
    const tenantId = 'mi-nhon-hotel';
    
    // Check if tenant exists
    const existingTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    
    if (existingTenant.length === 0) {
      console.log('🏨 Creating default tenant...');
      await db.insert(tenants).values({
        id: tenantId,
        hotel_name: 'Mi Nhon Hotel',
        subdomain: 'minhonmuine',
        subscription_plan: 'premium',
        subscription_status: 'active',
        created_at: Math.floor(Date.now() / 1000),
        is_active: true,
        tier: 'premium',
        max_calls: 5000,
        max_users: 50
      });
      console.log('✅ Default tenant created');
    } else {
      console.log('✅ Tenant already exists');
    }

    // Create users
    for (const user of DEFAULT_USERS) {
      console.log(`\n🔐 Processing user: ${user.username}`);

      // Check if user exists
      const existingUser = await db.select().from(staff).where(eq(staff.username, user.username)).limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.update(staff)
          .set({
            password: hashedPassword,
            email: user.email,
            display_name: user.displayName,
            role: user.role,
            tenant_id: tenantId,
            is_active: true,
            updated_at: Math.floor(Date.now() / 1000)
          })
          .where(eq(staff.username, user.username));
        console.log(`✅ Updated user: ${user.username}`);
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.insert(staff).values({
          id: `${user.username}-${Date.now()}`,
          username: user.username,
          email: user.email,
          password: hashedPassword,
          display_name: user.displayName,
          role: user.role,
          tenant_id: tenantId,
          is_active: true,
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000)
        });
        console.log(`✅ Created user: ${user.username}`);
      }
    }

    // Verify users
    console.log('\n📋 Verification:');
    const allUsers = await db.select().from(staff).where(eq(staff.tenant_id, tenantId));
    
    for (const user of allUsers) {
      console.log(`✅ ${user.username} | ${user.role} | Active: ${user.is_active}`);
    }

    console.log('\n🎉 User creation completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    DEFAULT_USERS.forEach(user => {
      console.log(`   ${user.username} / ${user.password} (${user.role})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

// Run the script
createAuthUsers();