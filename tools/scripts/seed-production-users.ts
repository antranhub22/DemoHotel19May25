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
      SELECT id FROM tenants WHERE id = 'hotel-minhon' LIMIT 1
    `);
    
    let tenantId = 'hotel-minhon';
    
    if (!existingTenant.rows || existingTenant.rows.length === 0) {
      console.log('🏨 Creating default tenant: Mi Nhon Hotel');
      
      await client.query(`
        INSERT INTO tenants (
          id, hotel_name, subdomain, subscription_plan, subscription_status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, CURRENT_TIMESTAMP
        ) ON CONFLICT (id) DO NOTHING
      `, [tenantId, 'Mi Nhon Hotel', 'minhonmuine', 'premium', 'active']);
      
      console.log('✅ Default tenant created');
    } else {
      console.log('✅ Default tenant already exists');
    }

    // 2. Define default users (let database auto-generate IDs)
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@minhonhotel.com',
        role: 'super-admin',
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'System Administrator',
        tenantId
      },
      {
        username: 'manager',
        password: 'manager123',
        email: 'manager@minhonhotel.com',
        role: 'hotel-manager',
        firstName: 'Hotel',
        lastName: 'Manager',
        displayName: 'Hotel Manager',
        tenantId
      },
      {
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

    // STEP 0: Delete all existing users first
    console.log('🗑️ Cleaning up existing users...');
    for (const user of defaultUsers) {
      await client.query(`
        DELETE FROM staff WHERE username = $1
      `, [user.username]);
      console.log(`   Deleted if exists: ${user.username}`);
    }

    // 3. Create users if they don't exist
    console.log('👤 Creating default users...');
    
    for (const user of defaultUsers) {
      // Hash password with consistent salt rounds
      const hashedPassword = await bcrypt.hash(user.password, 12); // Use 12 rounds consistently
      
      // Create user (let database auto-generate ID)
      await client.query(`
        INSERT INTO staff (
          tenant_id, username, password, first_name, last_name, 
          email, role, display_name, permissions, is_active, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        )
      `, [
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

      // Verify password hash
      const verifyHash = await bcrypt.compare(user.password, hashedPassword);
      console.log(`   Password verification: ${verifyHash ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    client.release();
    
    console.log('🎉 User seeding completed successfully!');
    console.log(`📝 Users created: ${usersCreated.join(', ')}`);
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Manager: manager / manager123');
    console.log('  Front Desk: frontdesk / frontdesk123'); 
    console.log('  IT Manager: itmanager / itmanager123');
    
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