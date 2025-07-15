#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function fixUserPasswords() {
  try {
    console.log('🔧 Fixing user passwords...');
    
    const testUsers = [
      { username: 'manager', password: 'manager123' },
      { username: 'frontdesk', password: 'frontdesk123' },
      { username: 'itmanager', password: 'itmanager123' }
    ];
    
    for (const userData of testUsers) {
      console.log(`\n🔐 Updating password for ${userData.username}...`);
      
      // Generate proper bcrypt hash
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      console.log(`   Generated hash length: ${hashedPassword.length}`);
      
      // Update the user's password
      await db.update(staff)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        })
        .where(eq(staff.username, userData.username));
      
      // Verify the update worked
      const testHash = await bcrypt.compare(userData.password, hashedPassword);
      console.log(`   Password verification test: ${testHash ? '✅ PASS' : '❌ FAIL'}`);
      
      console.log(`✅ Updated password for: ${userData.username}`);
    }
    
    console.log('\n🎉 All user passwords fixed successfully!');
    console.log('\n📋 Test Credentials (Updated):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Hotel Manager: manager / manager123');
    console.log('Front Desk:    frontdesk / frontdesk123');
    console.log('IT Manager:    itmanager / itmanager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
}

// Run the script
fixUserPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 