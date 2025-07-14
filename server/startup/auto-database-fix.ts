import { db } from '../db';
import { sql } from 'drizzle-orm';

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
      console.log('🔧 Running auto database fix...');
      console.log('🔍 Checking database schema...');
      
      const needsFix = await this.checkIfDatabaseNeedsFix();
      if (!needsFix) {
        console.log('✅ Database schema is already up to date');
        return true;
      }

      console.log('🛠️ Auto-fixing database schema...');
      await this.performAutoFix();
      console.log('✅ Auto database fix completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Auto database fix failed:', error instanceof Error ? error.message : String(error));
      console.error('❌ Full error stack:', error instanceof Error ? error.stack : String(error));
      return false;
    }
  }

  private async checkIfDatabaseNeedsFix(): Promise<boolean> {
    try {
      // Check for PostgreSQL first, then fallback to SQLite
      try {
        // Try PostgreSQL syntax first
        const result = await this.db.execute(sql`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('tenants', 'staff', 'call', 'transcript', 'request', 'message');
        `);
        
        console.log('🔍 Existing PostgreSQL tables found:', result.length);
        return result.length < 6; // We expect 6 tables
      } catch (pgError) {
        // If PostgreSQL fails, try SQLite syntax
        console.log('🔄 PostgreSQL check failed, trying SQLite syntax...');
        const result = await this.db.execute(sql`
          SELECT name FROM sqlite_master WHERE type='table' AND name IN ('tenants', 'staff', 'call', 'transcript', 'request', 'message');
        `);
        
        console.log('🔍 Existing SQLite tables found:', result.length);
        return result.length < 6; // We expect 6 tables
      }
    } catch (error) {
      console.log('📋 Database check failed, assuming needs fix:', error instanceof Error ? error.message : String(error));
      return true;
    }
  }

  private async performAutoFix(): Promise<void> {
    try {
      console.log('🔧 Step 1: Creating missing tables...');
      await this.createMissingTables();

      console.log('🔧 Step 2: Creating MiNhon tenant...');
      await this.createMiNhonTenant();

      console.log('🔧 Step 3: Creating default staff accounts...');
      await this.createDefaultStaffAccounts();

      console.log('🔧 Step 4: Updating existing data...');
      await this.updateExistingData();

      console.log('✅ All auto-fix steps completed successfully');
    } catch (error) {
      console.error('❌ Auto-fix step failed:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw to be caught by the main function
    }
  }

  private async createMissingTables(): Promise<void> {
    try {
      // Detect database type by trying a PostgreSQL-specific query
      let isPostgreSQL = false;
      try {
        await this.db.execute(sql`SELECT 1 FROM information_schema.tables LIMIT 1`);
        isPostgreSQL = true;
        console.log('🔍 Detected PostgreSQL database');
      } catch {
        console.log('🔍 Detected SQLite database');
      }

      if (isPostgreSQL) {
        // PostgreSQL syntax
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
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'staff',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS call (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id_vapi TEXT UNIQUE,
            room_number TEXT,
            language TEXT DEFAULT 'en',
            service_type TEXT,
            duration INTEGER DEFAULT 0,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS transcript (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS request (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id TEXT,
            room_number TEXT NOT NULL,
            order_type TEXT NOT NULL,
            delivery_time TEXT NOT NULL,
            special_instructions TEXT,
            items TEXT,
            total_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS message (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            request_id TEXT,
            sender_type TEXT NOT NULL,
            sender_name TEXT,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
          );
        `);
      } else {
        // SQLite syntax (same as before)
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
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'staff',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id)
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS call (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id_vapi TEXT UNIQUE,
            room_number TEXT,
            language TEXT DEFAULT 'en',
            service_type TEXT,
            duration INTEGER DEFAULT 0,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id)
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS transcript (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id),
            FOREIGN KEY (call_id) REFERENCES call(id)
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS request (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            call_id TEXT,
            room_number TEXT NOT NULL,
            order_type TEXT NOT NULL,
            delivery_time TEXT NOT NULL,
            special_instructions TEXT,
            items TEXT,
            total_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id),
            FOREIGN KEY (call_id) REFERENCES call(id)
          );
        `);

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS message (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL DEFAULT 'minhon',
            request_id TEXT,
            sender_type TEXT NOT NULL,
            sender_name TEXT,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id),
            FOREIGN KEY (request_id) REFERENCES request(id)
          );
        `);
      }

      console.log('✅ All tables created successfully');
    } catch (error) {
      console.error('❌ Failed to create tables:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async createMiNhonTenant(): Promise<void> {
    try {
      // Check if Mi Nhon tenant already exists
      const existing = await this.db.execute(sql`
        SELECT id FROM tenants WHERE id = 'minhon'
      `);
      
      if (existing.length > 0) {
        console.log('✅ MiNhon tenant already exists');
        return;
      }

      // Create Mi Nhon Hotel tenant
      await this.db.execute(sql`
        INSERT INTO tenants (
          id, 
          hotel_name, 
          domain, 
          subdomain, 
          email, 
          phone, 
          address,
          subscription_plan,
          subscription_status
        ) VALUES (
          'minhon',
          'Mi Nhon Hotel',
          'minhonmuine.talk2go.online',
          'minhonmuine',
          'info@minhonhotel.com',
          '+84 252 3847 007',
          'Mui Ne, Phan Thiet, Binh Thuan, Vietnam',
          'enterprise',
          'active'
        )
      `);
      
      console.log('✅ MiNhon tenant created successfully');
    } catch (error) {
      console.error('❌ Failed to create MiNhon tenant:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async createDefaultStaffAccounts(): Promise<void> {
    try {
      // Check if default admin already exists
      const existing = await this.db.execute(sql`
        SELECT id FROM staff WHERE email = 'admin@minhonhotel.com'
      `);
      
      if (existing.length > 0) {
        console.log('✅ Default admin account already exists');
        return;
      }

      // Create default admin account
      // In production, this should be a properly hashed password
      const defaultPasswordHash = '$2b$10$defaultHashForDevelopment'; // This should be replaced with proper bcrypt hash
      
      await this.db.execute(sql`
        INSERT INTO staff (
          id,
          tenant_id,
          name,
          email,
          password_hash,
          role,
          is_active
        ) VALUES (
          'admin-minhon-001',
          'minhon',
          'Administrator',
          'admin@minhonhotel.com',
          ${defaultPasswordHash},
          'admin',
          1
        )
      `);
      
      console.log('✅ Default admin account created');
    } catch (error) {
      console.error('❌ Failed to create default staff accounts:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async updateExistingData(): Promise<void> {
    try {
      // Update existing records to have proper tenant_id if they don't
      console.log('🔄 Updating existing data with tenant_id...');
      
      // Update transcripts without tenant_id
      await this.db.execute(sql`
        UPDATE transcript 
        SET tenant_id = 'minhon' 
        WHERE tenant_id IS NULL OR tenant_id = ''
      `);
      
      // Update requests without tenant_id
      await this.db.execute(sql`
        UPDATE request 
        SET tenant_id = 'minhon' 
        WHERE tenant_id IS NULL OR tenant_id = ''
      `);
      
      // Update messages without tenant_id
      await this.db.execute(sql`
        UPDATE message 
        SET tenant_id = 'minhon' 
        WHERE tenant_id IS NULL OR tenant_id = ''
      `);
      
      // Update calls without tenant_id
      await this.db.execute(sql`
        UPDATE call 
        SET tenant_id = 'minhon' 
        WHERE tenant_id IS NULL OR tenant_id = ''
      `);
      
      console.log('✅ Existing data updated successfully');
    } catch (error) {
      console.error('❌ Failed to update existing data:', error instanceof Error ? error.message : String(error));
      // Don't throw here, as this is not critical for basic functionality
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup method if needed
    console.log('🧹 AutoDatabaseFixer cleanup completed');
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