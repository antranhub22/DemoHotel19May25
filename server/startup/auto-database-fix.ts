import { sql } from 'drizzle-orm';
import { db } from '../db';

// ============================================
// Auto Database Fix on Server Startup
// ============================================

export class AutoDatabaseFixer {
  private db: any;

  constructor() {
    // Use the existing database connection from the server
    this.db = db;
  }

  async autoFixDatabase(): Promise<boolean> {
    if (!this.db) {
      console.log('⚠️ Database connection not available, skipping auto-fix');
      return false;
    }

    try {
      console.log('🔍 Checking database schema...');
      
      // Check if database needs fixing
      const needsFix = await this.checkIfDatabaseNeedsFix();
      
      if (!needsFix) {
        console.log('✅ Database schema is up to date');
        return true;
      }

      console.log('🛠️ Auto-fixing database schema...');
      
      // Auto-fix database
      await this.performAutoFix();
      
      console.log('✅ Database auto-fix completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Auto database fix failed:', error instanceof Error ? error.message : String(error));
      
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('❌ Full error stack:', error.stack);
      }
      
      // Don't crash the server, just log the error
      console.log('⚠️ Server will continue with potentially broken database');
      return false;
    }
  }

  private async checkIfDatabaseNeedsFix(): Promise<boolean> {
    try {
      // Check if tenants table exists
      const tenantsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'tenants'
        )
      `);
      
      const tenantsExists = tenantsResult[0]?.exists || false;
      
      if (!tenantsExists) {
        console.log('📋 Missing tenants table - needs fix');
        return true;
      }

      // Check if tenant_id column exists in transcript table
      const tenantIdResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'transcript' AND column_name = 'tenant_id'
        )
      `);
      
      const tenantIdExists = tenantIdResult[0]?.exists || false;
      
      if (!tenantIdExists) {
        console.log('📋 Missing tenant_id column - needs fix');
        return true;
      }

      // Check if Mi Nhon tenant exists
      const miNhonResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM tenants WHERE id = 'mi-nhon-hotel'
        )
      `);
      
      const miNhonExists = miNhonResult[0]?.exists || false;
      
      if (!miNhonExists) {
        console.log('📋 Missing Mi Nhon tenant - needs fix');
        return true;
      }

      return false;
      
    } catch (error) {
      console.log('📋 Database check failed, assuming needs fix:', error instanceof Error ? error.message : String(error));
      return true;
    }
  }

  private async performAutoFix(): Promise<void> {
    try {
      // Step 1: Create missing tables
      console.log('🔧 Step 1: Creating missing tables...');
      await this.createMissingTables();
      console.log('✅ Step 1 completed');
      
      // Step 2: Create Mi Nhon tenant
      console.log('🔧 Step 2: Creating Mi Nhon tenant...');
      await this.createMiNhonTenant();
      console.log('✅ Step 2 completed');
      
      // Step 3: Create default staff accounts
      console.log('🔧 Step 3: Creating default staff accounts...');
      await this.createDefaultStaffAccounts();
      console.log('✅ Step 3 completed');
      
      // Step 4: Update existing data
      console.log('🔧 Step 4: Updating existing data...');
      await this.updateExistingData();
      console.log('✅ Step 4 completed');
      
    } catch (error) {
      console.error('❌ Auto-fix step failed:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw to be caught by the main function
    }
  }

  private async createMissingTables(): Promise<void> {
    // Create tenants table
    await this.db.execute(sql`
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

    // Create hotel_profiles table
    await this.db.execute(sql`
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

    // Create staff table if it doesn't exist
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        name VARCHAR(100),
        email VARCHAR(100),
        tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check and add tenant_id columns to existing tables (only if they exist)
    const tables = ['transcript', 'request', 'message', 'call'];
    
    for (const table of tables) {
      try {
        // First check if table exists
        const tableExists = await this.db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${table}
          )
        `);
        
        if (tableExists[0]?.exists) {
          // Check if tenant_id column exists
          const columnExists = await this.db.execute(sql`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = ${table} AND column_name = 'tenant_id'
            )
          `);
          
          if (!columnExists[0]?.exists) {
            await this.db.execute(sql`
              ALTER TABLE ${sql.identifier(table)} 
              ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
            `);
            console.log(`✅ Added tenant_id column to ${table} table`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not modify ${table} table:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  private async createMiNhonTenant(): Promise<void> {
    const miNhonTenant = {
      id: 'mi-nhon-hotel',
      hotel_name: 'Mi Nhon Hotel',
      domain: 'minhonmuine.talk2go.online',
      subdomain: 'minhonmuine',
      email: 'info@minhonhotel.com',
      phone: '+84 252 3847 007',
      address: '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
      subscription_plan: 'premium',
      subscription_status: 'active'
    };

    await this.db.execute(sql`
      INSERT INTO tenants (id, hotel_name, domain, subdomain, email, phone, address, subscription_plan, subscription_status)
      VALUES (${miNhonTenant.id}, ${miNhonTenant.hotel_name}, ${miNhonTenant.domain}, ${miNhonTenant.subdomain}, 
              ${miNhonTenant.email}, ${miNhonTenant.phone}, ${miNhonTenant.address}, 
              ${miNhonTenant.subscription_plan}, ${miNhonTenant.subscription_status})
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

    // Create hotel profile
    await this.db.execute(sql`
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
  }

  private async createDefaultStaffAccounts(): Promise<void> {
    const defaultStaff = [
      {
        tenant_id: 'mi-nhon-hotel',
        username: 'admin@hotel.com',
        password: 'StrongPassword123',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@hotel.com'
      },
      {
        tenant_id: 'mi-nhon-hotel',
        username: 'manager@hotel.com',
        password: 'StrongPassword456',
        role: 'manager',
        name: 'Hotel Manager',
        email: 'manager@hotel.com'
      }
    ];

    for (const staff of defaultStaff) {
      await this.db.execute(sql`
        INSERT INTO staff (tenant_id, username, password, role, name, email)
        VALUES (${staff.tenant_id}, ${staff.username}, ${staff.password}, 
                ${staff.role}, ${staff.name}, ${staff.email})
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
      `);
    }
  }

  private async updateExistingData(): Promise<void> {
    const miNhonTenantId = 'mi-nhon-hotel';

    // Update existing records with tenant_id
    const tables = ['transcript', 'request', 'message', 'staff'];
    
    for (const table of tables) {
      try {
        await this.db.execute(sql`
          UPDATE ${sql.identifier(table)} 
          SET tenant_id = ${miNhonTenantId} 
          WHERE tenant_id IS NULL
        `);
      } catch (error) {
        // Table might not exist, ignore error
      }
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed - using shared database connection
  }
}

// ============================================
// Export for use in server startup
// ============================================

export async function runAutoDbFix(): Promise<boolean> {
  const fixer = new AutoDatabaseFixer();
  const success = await fixer.autoFixDatabase();
  await fixer.cleanup();
  return success;
} 