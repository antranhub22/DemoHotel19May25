#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// ============================================
// Quick Database Fix Script
// ============================================

async function quickDatabaseFix() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('🔧 Quick Database Fix Starting...');
  console.log('🔗 Connecting to database...');

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    // Step 1: Create tenants table
    console.log('📋 Creating tenants table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        hotel_name TEXT NOT NULL,
        domain TEXT,
        subdomain TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        subscription_plan TEXT DEFAULT 'trial',
        subscription_status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 2: Create hotel_profiles table
    console.log('📋 Creating hotel_profiles table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_profiles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
        hotel_name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        amenities TEXT[],
        policies TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 3: Add tenant_id columns to existing tables
    console.log('📋 Adding tenant_id columns...');
    const tables = ['transcript', 'request', 'message', 'call', 'staff'];
    
    for (const table of tables) {
      try {
        await db.execute(sql`
          ALTER TABLE ${sql.identifier(table)} 
          ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
        `);
        console.log(`✅ Added tenant_id to ${table} table`);
      } catch (error) {
        console.log(`ℹ️ tenant_id column already exists in ${table} table`);
      }
    }

    // Step 4: Create Mi Nhon tenant
    console.log('🏨 Creating Mi Nhon Hotel tenant...');
    await db.execute(sql`
      INSERT INTO tenants (id, hotel_name, domain, subdomain, email, phone, address, subscription_plan, subscription_status)
      VALUES ('mi-nhon-hotel', 'Mi Nhon Hotel', 'minhonmuine.talk2go.online', 'minhonmuine', 
              'info@minhonhotel.com', '+84 252 3847 007', 
              '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam', 
              'premium', 'active')
      ON CONFLICT (id) DO UPDATE SET
        hotel_name = EXCLUDED.hotel_name,
        domain = EXCLUDED.domain,
        subdomain = EXCLUDED.subdomain,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        subscription_plan = EXCLUDED.subscription_plan,
        subscription_status = EXCLUDED.subscription_status,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Step 5: Create hotel profile
    console.log('🏨 Creating Mi Nhon Hotel profile...');
    await db.execute(sql`
      INSERT INTO hotel_profiles (id, tenant_id, name, description, address, phone, email, website, amenities, policies)
      VALUES ('mi-nhon-hotel-profile', 'mi-nhon-hotel', 'Mi Nhon Hotel', 
              'A beautiful beachfront hotel in Mui Ne, Vietnam',
              '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
              '+84 252 3847 007', 'info@minhonhotel.com', 'https://minhonhotel.com',
              ARRAY['Pool', 'Restaurant', 'Free WiFi', 'Beach Access', 'Spa'],
              ARRAY['Check-in: 2:00 PM', 'Check-out: 12:00 PM', 'No smoking'])
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        amenities = EXCLUDED.amenities,
        policies = EXCLUDED.policies,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Step 6: Create staff accounts
    console.log('👥 Creating staff accounts...');
    const staffAccounts = [
      {
        id: 'admin-mi-nhon',
        tenant_id: 'mi-nhon-hotel',
        username: 'admin@hotel.com',
        password: 'StrongPassword123',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@hotel.com'
      },
      {
        id: 'manager-mi-nhon',
        tenant_id: 'mi-nhon-hotel',
        username: 'manager@hotel.com',
        password: 'StrongPassword456',
        role: 'manager',
        name: 'Hotel Manager',
        email: 'manager@hotel.com'
      }
    ];

    for (const staff of staffAccounts) {
      await db.execute(sql`
        INSERT INTO staff (id, tenant_id, username, password, role, name, email)
        VALUES (${staff.id}, ${staff.tenant_id}, ${staff.username}, ${staff.password}, 
                ${staff.role}, ${staff.name}, ${staff.email})
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
      `);
      console.log(`✅ Created staff account: ${staff.username}`);
    }

    // Step 7: Update existing data
    console.log('🔄 Updating existing data with tenant_id...');
    const miNhonTenantId = 'mi-nhon-hotel';

    // Update existing records
    const updateTables = ['transcript', 'request', 'message', 'staff'];
    
    for (const table of updateTables) {
      try {
        const result = await db.execute(sql`
          UPDATE ${sql.identifier(table)} 
          SET tenant_id = ${miNhonTenantId} 
          WHERE tenant_id IS NULL
        `);
        console.log(`✅ Updated ${table} table with tenant_id`);
      } catch (error) {
        console.log(`ℹ️ Table ${table} update skipped`);
      }
    }

    // Step 8: Verify setup
    console.log('🔍 Verifying database setup...');
    
    const tenantsCount = await db.execute(sql`SELECT COUNT(*) as count FROM tenants`);
    console.log(`✅ Tenants table: ${tenantsCount[0]?.count || 0} records`);

    const profilesCount = await db.execute(sql`SELECT COUNT(*) as count FROM hotel_profiles`);
    console.log(`✅ Hotel profiles table: ${profilesCount[0]?.count || 0} records`);

    const staffCount = await db.execute(sql`SELECT COUNT(*) as count FROM staff WHERE tenant_id = 'mi-nhon-hotel'`);
    console.log(`✅ Staff accounts: ${staffCount[0]?.count || 0} records`);

    console.log('🎉 Quick Database Fix completed successfully!');
    console.log('');
    console.log('📋 Test accounts created:');
    console.log('   Username: admin@hotel.com');
    console.log('   Password: StrongPassword123');
    console.log('');
    console.log('   Username: manager@hotel.com');
    console.log('   Password: StrongPassword456');

  } catch (error) {
    console.error('❌ Quick Database Fix failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
quickDatabaseFix().catch((error) => {
  console.error('Database fix failed:', error);
  process.exit(1);
}); 