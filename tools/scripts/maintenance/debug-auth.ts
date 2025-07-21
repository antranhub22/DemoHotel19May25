#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication...');
    
    // 1. List all staff users
    console.log('\n📋 All staff users in database:');
    const allStaff = await db.select().from(staff);
    
    allStaff.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ────────────────────────────────────');
    });
    
    // 2. Test specific user lookup
    console.log('\n🔍 Testing user lookup for "manager":');
    const managerUser = await db
      .select()
      .from(staff)
      .where(eq(staff.username, 'manager'))
      .limit(1);
    
    if (managerUser.length > 0) {
      const user = managerUser[0];
      console.log('✅ Manager user found:');
      console.log(`   Username: ${user.username}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash length: ${user.password?.length}`);
      
      // 3. Test password verification
      console.log('\n🔐 Testing password verification:');
      const testPassword = 'manager123';
      const isPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Password "${testPassword}" is valid: ${isPasswordValid}`);
      
    } else {
      console.log('❌ Manager user not found!');
    }
    
    // 4. Test tenant lookup with mi-nhon-hotel
    console.log('\n🏨 Testing tenant-specific lookup:');
    const tenantUsers = await db
      .select()
      .from(staff)
      .where(eq(staff.tenantId, 'mi-nhon-hotel'));
    
    console.log(`Found ${tenantUsers.length} users with tenant ID 'mi-nhon-hotel'`);
    
  } catch (error) {
    console.error('❌ Error debugging auth:', error);
    process.exit(1);
  }
}

// Run the script
debugAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 