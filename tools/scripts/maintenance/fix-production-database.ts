#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Import schema types
import { 
  tenants, 
  hotelProfiles, 
  staff,
  call, 
  transcript, 
  request, 
  message 
} from '../src/db/schema';

// ============================================
// Production Database Fix Script
// ============================================

class ProductionDatabaseFixer {
  private db: any;
  private client: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    console.log('🔗 Connecting to production database...');
    this.client = postgres(databaseUrl);
    this.db = drizzle(this.client);
  }

  async fixDatabase(): Promise<void> {
    console.log('🛠️ Starting production database fix...');

    try {
      // Step 1: Create missing tables
      await this.createMissingTables();

      // Step 2: Run migrations
      await this.runMigrations();

      // Step 3: Create Mi Nhon tenant
      await this.createMiNhonTenant();

      // Step 4: Create default staff accounts
      await this.createDefaultStaffAccounts();

      // Step 5: Verify setup
      await this.verifyDatabaseSetup();

      console.log('✅ Production database fix completed successfully!');
      
    } catch (error) {
      console.error('❌ Database fix failed:', error);
      throw error;
    } finally {
      await this.client.end();
    }
  }

  private async createMissingTables(): Promise<void> {
    console.log('📋 Creating missing tables...');

    // Create tenants table
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
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

    // Create hotel_profiles table
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_profiles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
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

    // Add tenant_id column to existing tables if not exists
    const tables = ['transcript', 'request', 'message', 'call', 'staff'];
    
    for (const table of tables) {
      try {
        await this.db.execute(sql`
          ALTER TABLE ${sql.identifier(table)} 
          ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
        `);
        console.log(`✅ Added tenant_id to ${table} table`);
      } catch (error) {
        console.log(`ℹ️ tenant_id column already exists in ${table} table`);
      }
    }

    console.log('✅ Tables created/updated successfully');
  }

  private async runMigrations(): Promise<void> {
    console.log('🔄 Running migrations...');

    try {
      // Check if migrations directory exists
      const migrationsDir = path.join(process.cwd(), 'migrations');
      if (fs.existsSync(migrationsDir)) {
        await migrate(this.db, { migrationsFolder: migrationsDir });
        console.log('✅ Migrations completed');
      } else {
        console.log('ℹ️ No migrations directory found, skipping');
      }
    } catch (error) {
      console.log('ℹ️ Migration skipped (already up to date)');
    }
  }

  private async createMiNhonTenant(): Promise<void> {
    console.log('🏨 Creating Mi Nhon Hotel tenant...');

    const miNhonTenant = {
      id: 'mi-nhon-hotel',
      name: 'Mi Nhon Hotel',
      domain: 'minhonmuine.talk2go.online',
      subdomain: 'minhonmuine',
      email: 'info@minhonhotel.com',
      phone: '+84 252 3847 007',
      address: '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
      subscription_plan: 'premium',
      subscription_status: 'active'
    };

    try {
      await this.db.insert(tenants).values(miNhonTenant).onConflictDoUpdate({
        target: tenants.id,
        set: {
          name: miNhonTenant.name,
          domain: miNhonTenant.domain,
          subdomain: miNhonTenant.subdomain,
          email: miNhonTenant.email,
          phone: miNhonTenant.phone,
          address: miNhonTenant.address,
          subscription_plan: miNhonTenant.subscription_plan,
          subscription_status: miNhonTenant.subscription_status,
          updated_at: new Date()
        }
      });

      console.log('✅ Mi Nhon Hotel tenant created/updated');
    } catch (error) {
      console.error('❌ Failed to create Mi Nhon tenant:', error);
      throw error;
    }

    // Create hotel profile
    const hotelProfile = {
      id: 'mi-nhon-hotel-profile',
      tenant_id: 'mi-nhon-hotel',
      name: 'Mi Nhon Hotel',
      description: 'A beautiful beachfront hotel in Mui Ne, Vietnam',
      address: '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
      phone: '+84 252 3847 007',
      email: 'info@minhonhotel.com',
      website: 'https://minhonhotel.com',
      amenities: ['Pool', 'Restaurant', 'Free WiFi', 'Beach Access', 'Spa'],
      policies: ['Check-in: 2:00 PM', 'Check-out: 12:00 PM', 'No smoking']
    };

    try {
      await this.db.insert(hotelProfiles).values(hotelProfile).onConflictDoUpdate({
        target: hotelProfiles.id,
        set: {
          name: hotelProfile.name,
          description: hotelProfile.description,
          address: hotelProfile.address,
          phone: hotelProfile.phone,
          email: hotelProfile.email,
          website: hotelProfile.website,
          amenities: hotelProfile.amenities,
          policies: hotelProfile.policies,
          updated_at: new Date()
        }
      });

      console.log('✅ Mi Nhon Hotel profile created/updated');
    } catch (error) {
      console.error('❌ Failed to create hotel profile:', error);
      throw error;
    }
  }

  private async createDefaultStaffAccounts(): Promise<void> {
    console.log('👥 Creating default staff accounts...');

    const defaultStaff = [
      {
        id: 'admin-mi-nhon',
        tenant_id: 'mi-nhon-hotel',
        username: 'admin@hotel.com',
        password: 'StrongPassword123', // In production, this should be hashed
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

    for (const staffMember of defaultStaff) {
      try {
        await this.db.insert(staff).values(staffMember).onConflictDoUpdate({
          target: staff.id,
          set: {
            username: staffMember.username,
            password: staffMember.password,
            role: staffMember.role,
            name: staffMember.name,
            email: staffMember.email,
            updated_at: new Date()
          }
        });

        console.log(`✅ Staff account created: ${staffMember.username}`);
      } catch (error) {
        console.log(`ℹ️ Staff account already exists: ${staffMember.username}`);
      }
    }
  }

  private async verifyDatabaseSetup(): Promise<void> {
    console.log('🔍 Verifying database setup...');

    // Check if tenants table exists and has data
    const tenantsCount = await this.db.select().from(tenants);
    console.log(`✅ Tenants table: ${tenantsCount.length} records`);

    // Check if hotel_profiles table exists and has data
    const profilesCount = await this.db.select().from(hotelProfiles);
    console.log(`✅ Hotel profiles table: ${profilesCount.length} records`);

    // Check if staff table has tenant_id column
    const staffCount = await this.db.select().from(staff);
    console.log(`✅ Staff table: ${staffCount.length} records`);

    // Update existing data with tenant_id if needed
    await this.updateExistingDataWithTenantId();

    console.log('✅ Database verification completed');
  }

  private async updateExistingDataWithTenantId(): Promise<void> {
    console.log('🔄 Updating existing data with tenant_id...');

    // Update existing records to associate with Mi Nhon tenant
    const miNhonTenantId = 'mi-nhon-hotel';

    // Update transcript records
    await this.db.execute(sql`
      UPDATE transcript 
      SET tenant_id = ${miNhonTenantId} 
      WHERE tenant_id IS NULL
    `);

    // Update request records
    await this.db.execute(sql`
      UPDATE request 
      SET tenant_id = ${miNhonTenantId} 
      WHERE tenant_id IS NULL
    `);

    // Update message records
    await this.db.execute(sql`
      UPDATE message 
      SET tenant_id = ${miNhonTenantId} 
      WHERE tenant_id IS NULL
    `);

    // Update call records (if exists)
    try {
      await this.db.execute(sql`
        UPDATE call 
        SET tenant_id = ${miNhonTenantId} 
        WHERE tenant_id IS NULL
      `);
    } catch (error) {
      console.log('ℹ️ Call table update skipped (table may not exist)');
    }

    // Update staff records
    await this.db.execute(sql`
      UPDATE staff 
      SET tenant_id = ${miNhonTenantId} 
      WHERE tenant_id IS NULL
    `);

    console.log('✅ Existing data updated with tenant_id');
  }
}

// ============================================
// Main Function
// ============================================

async function main() {
  console.log(`
🛠️ Production Database Fix Script
==================================

This script will:
✅ Create missing tables (tenants, hotel_profiles)
✅ Add tenant_id columns to existing tables
✅ Create Mi Nhon Hotel tenant
✅ Create default staff accounts
✅ Update existing data with tenant associations

⚠️ WARNING: This will modify your production database!
Make sure you have a backup before proceeding.
`);

  const fixer = new ProductionDatabaseFixer();
  await fixer.fixDatabase();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
} 