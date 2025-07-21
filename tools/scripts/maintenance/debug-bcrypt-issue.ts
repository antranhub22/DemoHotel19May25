#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function debugBcryptIssue() {
  try {
    console.log('🔍 Debugging bcrypt issue...');
    
    // Test frontdesk user specifically
    const username = 'frontdesk';
    const password = 'frontdesk123';
    const tenantId = 'mi-nhon-hotel';
    
    console.log('\n1️⃣ Direct database lookup:');
    const users = await db
      .select()
      .from(staff)
      .where(and(eq(staff.username, username), eq(staff.tenantId, tenantId)))
      .limit(1);
    
    if (users.length === 0) {
      console.log('❌ User not found in database!');
      return;
    }
    
    const user = users[0];
    console.log(`   Found user: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Tenant: ${user.tenantId}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
    
    console.log('\n2️⃣ Password verification test:');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`   bcrypt.compare result: ${isPasswordValid}`);
    
    console.log('\n3️⃣ UnifiedAuthService simulation:');
    
    // Simulate the exact logic from UnifiedAuthService
    if (!user) {
      console.log('   ❌ User not found');
      return;
    }
    
    if (!user.isActive) {
      console.log('   ❌ User not active');
      return;
    }
    
    // This is the exact check from UnifiedAuthService
    const passwordCheck = await bcrypt.compare(password, user.password);
    console.log(`   Password check result: ${passwordCheck}`);
    
    if (!passwordCheck) {
      console.log('   ❌ Password verification failed in UnifiedAuthService simulation');
    } else {
      console.log('   ✅ Password verification passed in UnifiedAuthService simulation');
    }
    
    console.log('\n4️⃣ Hash generation test:');
    const newHash = await bcrypt.hash(password, 10);
    const newHashCheck = await bcrypt.compare(password, newHash);
    console.log(`   Fresh hash check: ${newHashCheck}`);
    
  } catch (error) {
    console.error('❌ Error debugging bcrypt:', error);
    process.exit(1);
  }
}

// Run the script
debugBcryptIssue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 