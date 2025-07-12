import { Request, Response, Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { runAutoDbFix } from '../startup/auto-database-fix';
import fs from 'fs';
import path from 'path';

const router = Router();

// ============================================
// Health Check Endpoints
// ============================================

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Manual database fix trigger
router.post('/health/fix-database', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Manual database fix triggered via API...');
    
    const success = await runAutoDbFix();
    
    if (success) {
      res.json({
        status: 'success',
        message: 'Database fix completed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: 'failed',
        message: 'Database fix failed - check server logs for details',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Database fix API error:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Manual database fix failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Database schema health check
router.get('/health/database', async (req: Request, res: Response) => {
  try {
    const schemaChecks = {
      database_connection: false,
      tenants_table: false,
      hotel_profiles_table: false,
      tenant_id_columns: false,
      mi_nhon_tenant: false,
      staff_accounts: false
    };

    // Check database connection
    await db.execute(sql`SELECT 1`);
    schemaChecks.database_connection = true;

    // Check if tenants table exists
    const tenantsResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants'
      )
    `);
    schemaChecks.tenants_table = tenantsResult[0]?.exists || false;

    // Check if hotel_profiles table exists
    const profilesResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'hotel_profiles'
      )
    `);
    schemaChecks.hotel_profiles_table = profilesResult[0]?.exists || false;

    // Check if tenant_id column exists in transcript table
    const tenantIdResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'transcript' AND column_name = 'tenant_id'
      )
    `);
    schemaChecks.tenant_id_columns = tenantIdResult[0]?.exists || false;

    // Check if Mi Nhon tenant exists
    if (schemaChecks.tenants_table) {
      const miNhonResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM tenants WHERE id = 'mi-nhon-hotel'
        )
      `);
      schemaChecks.mi_nhon_tenant = miNhonResult[0]?.exists || false;
    }

    // Check if staff accounts exist
    const staffResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'staff'
      )
    `);
    
    if (staffResult[0]?.exists) {
      const staffCountResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM staff WHERE tenant_id = 'mi-nhon-hotel'
      `);
      schemaChecks.staff_accounts = (staffCountResult[0]?.count || 0) > 0;
    }

    const allHealthy = Object.values(schemaChecks).every(check => check === true);

    res.json({
      status: allHealthy ? 'healthy' : 'needs_attention',
      timestamp: new Date().toISOString(),
      schema_checks: schemaChecks,
      recommendations: allHealthy ? [] : [
        'Run manual fix: POST /api/health/fix-database',
        'Or run: npm run db:fix-production',
        'Check environment variables: DATABASE_URL',
        'Verify database migrations are complete'
      ]
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Environment check
router.get('/health/environment', async (req: Request, res: Response) => {
  const envChecks = {
    database_url: !!process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT || 'default',
    jwt_secret: !!process.env.JWT_SECRET,
    openai_api_key: !!process.env.VITE_OPENAI_API_KEY,
    vapi_public_key: !!process.env.VITE_VAPI_PUBLIC_KEY,
    cors_origin: process.env.CORS_ORIGIN || 'not_set',
    client_url: process.env.CLIENT_URL || 'not_set'
  };

  const criticalMissing = [];
  if (!envChecks.database_url) criticalMissing.push('DATABASE_URL');
  if (!envChecks.jwt_secret) criticalMissing.push('JWT_SECRET');

  res.json({
    status: criticalMissing.length === 0 ? 'healthy' : 'missing_critical_vars',
    timestamp: new Date().toISOString(),
    environment_checks: envChecks,
    critical_missing: criticalMissing,
    recommendations: criticalMissing.length > 0 ? [
      'Set missing environment variables in your deployment platform',
      'Generate JWT secret: npm run env:jwt-secret',
      'Configure API keys for full functionality'
    ] : []
  });
});

// Build assets health check
router.get('/health/assets', async (req: Request, res: Response) => {
  try {
    const distPath = path.resolve(import.meta.dirname || process.cwd(), "..", "dist/public");
    const indexHtmlPath = path.resolve(distPath, "index.html");
    const assetsPath = path.resolve(distPath, "assets");
    
    // Check if build directory exists
    if (!fs.existsSync(distPath)) {
      return res.status(500).json({
        status: 'error',
        message: 'Build directory not found',
        distPath,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if index.html exists
    if (!fs.existsSync(indexHtmlPath)) {
      return res.status(500).json({
        status: 'error',
        message: 'index.html not found',
        indexHtmlPath,
        timestamp: new Date().toISOString()
      });
    }
    
    // Read index.html to check referenced assets
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const assetMatches = indexHtml.match(/\/assets\/[^"']+/g) || [];
    
    // Check if assets directory exists
    if (!fs.existsSync(assetsPath)) {
      return res.status(500).json({
        status: 'error',
        message: 'Assets directory not found',
        assetsPath,
        timestamp: new Date().toISOString()
      });
    }
    
    // List actual assets
    const actualAssets = fs.readdirSync(assetsPath);
    
    // Check if referenced assets exist
    const missingAssets = [];
    for (const assetPath of assetMatches) {
      const assetName = path.basename(assetPath);
      if (!actualAssets.includes(assetName)) {
        missingAssets.push(assetName);
      }
    }
    
    res.json({
      status: missingAssets.length === 0 ? 'healthy' : 'missing_assets',
      buildPath: distPath,
      referencedAssets: assetMatches.map(a => path.basename(a)),
      actualAssets: actualAssets.filter(f => f.endsWith('.js') || f.endsWith('.css')),
      missingAssets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple database setup endpoint
router.post('/health/setup-database', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Simple database setup triggered via API...');
    
    // Step 1: Create tenants table
    await db.execute(sql`
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
    
    // Step 2: Create hotel_profiles table
    await db.execute(sql`
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
    
    // Step 3: Create staff table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        name VARCHAR(100),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Step 4: Add tenant_id columns to existing tables
    try {
      await db.execute(sql`ALTER TABLE staff ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE`);
      await db.execute(sql`ALTER TABLE transcript ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE`);
      await db.execute(sql`ALTER TABLE request ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE`);
      await db.execute(sql`ALTER TABLE message ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE`);
      await db.execute(sql`ALTER TABLE call ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE`);
    } catch (columnError) {
      console.log('Some columns may already exist:', columnError);
    }
    
    // Step 5: Insert Mi Nhon tenant
    await db.execute(sql`
      INSERT INTO tenants (id, name, domain, subdomain, email, phone, address, subscription_plan, subscription_status)
      VALUES ('mi-nhon-hotel', 'Mi Nhon Hotel', 'minhonmuine.talk2go.online', 'minhonmuine', 
              'info@minhonhotel.com', '+84 252 3847 007', 
              '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam', 
              'premium', 'active')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    // Step 6: Insert default staff accounts
    await db.execute(sql`
      INSERT INTO staff (username, password, role, name, email, tenant_id)
      VALUES ('admin@hotel.com', 'StrongPassword123', 'admin', 'Administrator', 'admin@hotel.com', 'mi-nhon-hotel')
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    // Step 7: Update existing records to associate with Mi Nhon tenant
    await db.execute(sql`UPDATE staff SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL`);
    
    console.log('✅ Database setup completed successfully!');
    
    res.json({
      status: 'success',
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database setup API error:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database setup failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 