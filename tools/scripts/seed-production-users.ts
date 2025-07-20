#!/usr/bin/env tsx

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Production User Seeding Script
 * 
 * Creates default users for production deployment
 * Safe to run multiple times - won't duplicate users
 */

interface DefaultUser {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  displayName: string;
  tenantId: string;
}

async function seedProductionUsers(): Promise<{ success: boolean; usersCreated: string[]; error?: string }> {
  console.log('👥 Production User Seeding: Starting...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not found - skipping user seeding (probably local dev)');
    return { success: true, usersCreated: [] };
  }

  console.log('📍 Production database detected - seeding default users...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const usersCreated: string[] = [];

  try {
    const client = await pool.connect();
    
    // 1. Check if tenant exists, create if not
    console.log('🏨 Checking for default tenant...');
    
    const existingTenant = await client.query(`
      SELECT id FROM tenants WHERE id = 'mi-nhon-hotel' LIMIT 1
    `);
    
    let tenantId = 'mi-nhon-hotel';
    
    if (!existingTenant.rows || existingTenant.rows.length === 0) {
      console.log('🏨 Creating default tenant: Mi Nhon Hotel');
      
      await client.query(`
        INSERT INTO tenants (
          id, hotel_name, subdomain, subscription_plan, subscription_status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, CURRENT_TIMESTAMP
        ) ON CONFLICT (id) DO NOTHING
      `, [tenantId, 'Mi Nhon Hotel', 'minhon', 'trial', 'active']);
      
      console.log('✅ Default tenant created');
    } else {
      console.log('✅ Default tenant already exists');
    }

    // 2. Define default users
    const defaultUsers: DefaultUser[] = [
      {
        id: 'user-manager-001',
        username: 'manager',
        password: 'password123',
        email: 'manager@minhonhotel.com',
        role: 'hotel-manager',
        firstName: 'Hotel',
        lastName: 'Manager',
        displayName: 'Hotel Manager',
        tenantId
      },
      {
        id: 'user-frontdesk-001', 
        username: 'frontdesk',
        password: 'frontdesk123',
        email: 'frontdesk@minhonhotel.com',
        role: 'front-desk',
        firstName: 'Front',
        lastName: 'Desk',
        displayName: 'Front Desk Staff',
        tenantId
      },
      {
        id: 'user-itmanager-001',
        username: 'itmanager', 
        password: 'itmanager123',
        email: 'it@minhonhotel.com',
        role: 'it-manager',
        firstName: 'IT',
        lastName: 'Manager',
        displayName: 'IT Manager',
        tenantId
      }
    ];

    // 3. Create users if they don't exist
    console.log('👤 Creating default users...');
    
    for (const user of defaultUsers) {
      // Check if user already exists
      const existingUser = await client.query(`
        SELECT id FROM staff WHERE username = $1 AND tenant_id = $2 LIMIT 1
      `, [user.username, user.tenantId]);
      
      if (!existingUser.rows || existingUser.rows.length === 0) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Create user
        await client.query(`
          INSERT INTO staff (
            id, tenant_id, username, password, first_name, last_name, 
            email, role, display_name, permissions, is_active, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP
          )
        `, [
          user.id,
          user.tenantId, 
          user.username,
          hashedPassword,
          user.firstName,
          user.lastName,
          user.email,
          user.role,
          user.displayName,
          '["read", "write", "admin"]', // Default permissions
          true
        ]);
        
        usersCreated.push(user.username);
        console.log(`✅ Created user: ${user.username} (${user.role})`);
      } else {
        console.log(`✅ User already exists: ${user.username}`);
      }
    }
    
    client.release();
    
    if (usersCreated.length > 0) {
      console.log('🎉 User seeding completed successfully!');
      console.log(`📝 Users created: ${usersCreated.join(', ')}`);
      console.log('');
      console.log('🔑 Default login credentials:');
      console.log('  Manager: manager / password123');
      console.log('  Front Desk: frontdesk / frontdesk123'); 
      console.log('  IT Manager: itmanager / itmanager123');
    } else {
      console.log('✅ All users already exist - no seeding needed');
    }
    
    return { success: true, usersCreated };
    
  } catch (error) {
    console.error('❌ User seeding failed:', error);
    return { 
      success: false, 
      usersCreated,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await pool.end();
  }
}

// Export for use in other scripts
export { seedProductionUsers };

// Run if called directly (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename || process.argv[1]?.endsWith('seed-production-users.ts');

if (isMainModule) {
  seedProductionUsers()
    .then(result => {
      if (!result.success) {
        console.error('User seeding failed, but continuing...');
        // Don't exit with error code to allow deployment to continue
      }
    })
    .catch(error => {
      console.error('User seeding script error:', error);
      // Don't exit with error code to allow deployment to continue
    });
} 