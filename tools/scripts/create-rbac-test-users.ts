#!/usr/bin/env tsx

import { UnifiedAuthService } from '../../apps/server/services/unifiedAuthService.js';
import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';

async function createTestUsers() {
  try {
    console.log('🔧 Creating RBAC test users...');

    // Test users data
    const testUsers = [
      {
        username: 'manager',
        email: 'manager@hotel.com',
        password: 'manager123',
        role: 'hotel-manager' as const,
        displayName: 'Hotel Manager',
        isActive: true,
      },
      {
        username: 'frontdesk',
        email: 'frontdesk@hotel.com',
        password: 'frontdesk123',
        role: 'front-desk' as const,
        displayName: 'Front Desk Staff',
        isActive: true,
      },
      {
        username: 'itmanager',
        email: 'itmanager@hotel.com',
        password: 'itmanager123',
        role: 'it-manager' as const,
        displayName: 'IT Manager',
        isActive: true,
      }
    ];

    // Create each test user
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(staff)
          .where(eq(staff.username, userData.username))
          .limit(1);

        if (existingUser.length > 0) {
          console.log(`⚠️  User ${userData.username} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await UnifiedAuthService.hashPassword(userData.password);

        // Generate unique ID
        const userId = `staff-${userData.username}-${Date.now()}`;

        // Insert new user
        await db.insert(staff).values({
          id: userId,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          displayName: userData.displayName,
          isActive: userData.isActive,
          tenantId: 'mi-nhon-hotel',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ Created user: ${userData.username} (${userData.role})`);
      } catch (error: any) {
        console.error(`❌ Error creating user ${userData.username}:`, error.message);
      }
    }

    console.log('\n🎉 RBAC test users setup completed!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Hotel Manager: manager / manager123');
    console.log('Front Desk:    frontdesk / frontdesk123');
    console.log('IT Manager:    itmanager / itmanager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error setting up test users:', error);
    process.exit(1);
  }
}

// Run the script
createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 