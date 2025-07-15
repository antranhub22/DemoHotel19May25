#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function debugFrontdesk() {
  try {
    console.log('🔍 Debugging frontdesk user...');
    
    // Get frontdesk user
    const user = await db
      .select()
      .from(staff)
      .where(eq(staff.username, 'frontdesk'))
      .limit(1);
    
    if (user.length === 0) {
      console.log('❌ Frontdesk user not found!');
      return;
    }
    
    const frontdeskUser = user[0];
    console.log('\n📋 Frontdesk User Info:');
    console.log(`ID: ${frontdeskUser.id}`);
    console.log(`Username: ${frontdeskUser.username}`);
    console.log(`Email: ${frontdeskUser.email}`);
    console.log(`Role: ${frontdeskUser.role}`);
    console.log(`Tenant ID: ${frontdeskUser.tenantId}`);
    console.log(`Active: ${frontdeskUser.isActive}`);
    console.log(`Password hash length: ${frontdeskUser.password?.length}`);
    
    // Test password verification
    console.log('\n🔐 Testing password verification:');
    const testPasswords = ['frontdesk123', 'manager123', 'test123'];
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, frontdeskUser.password);
      console.log(`   "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    // Test hash generation
    console.log('\n🔧 Testing new hash generation:');
    const newHash = await bcrypt.hash('frontdesk123', 10);
    const testNewHash = await bcrypt.compare('frontdesk123', newHash);
    console.log(`   New hash works: ${testNewHash ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Error debugging frontdesk:', error);
    process.exit(1);
  }
}

// Run the script
debugFrontdesk()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 