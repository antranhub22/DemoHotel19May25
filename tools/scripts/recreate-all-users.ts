#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function recreateAllUsers() {
  try {
    console.log('🔧 Recreating all test users with consistent bcrypt...');
    
    const testUsers = [
      {
        username: 'manager',
        email: 'manager@minhonhotel.com', 
        password: 'manager123',
        role: 'hotel-manager' as const,
        displayName: 'Hotel Manager'
      },
      {
        username: 'frontdesk',
        email: 'frontdesk@minhonhotel.com',
        password: 'frontdesk123', 
        role: 'front-desk' as const,
        displayName: 'Front Desk Staff'
      },
      {
        username: 'itmanager',
        email: 'itmanager@minhonhotel.com',
        password: 'itmanager123',
        role: 'it-manager' as const, 
        displayName: 'IT Manager'
      }
    ];
    
    // Delete existing users first
    console.log('\n🗑️  Deleting existing users...');
    for (const userData of testUsers) {
      await db.delete(staff).where(eq(staff.username, userData.username));
      console.log(`   Deleted: ${userData.username}`);
    }
    
    // Recreate users with consistent bcrypt
    console.log('\n🔐 Creating users with fresh bcrypt hashes...');
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userId = `staff-${userData.username}-${Date.now()}`;
      
      await db.insert(staff).values({
        id: userId,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        displayName: userData.displayName,
        isActive: true,
        tenantId: 'mi-nhon-hotel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Verify immediately
      const testResult = await bcrypt.compare(userData.password, hashedPassword);
      console.log(`   ✅ Created ${userData.username}: ${testResult ? 'VERIFIED' : 'FAILED'}`);
    }
    
    console.log('\n🎉 All users recreated successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Hotel Manager: manager / manager123');
    console.log('Front Desk:    frontdesk / frontdesk123');
    console.log('IT Manager:    itmanager / itmanager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error recreating users:', error);
    process.exit(1);
  }
}

// Run the script
recreateAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 