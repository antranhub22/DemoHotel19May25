import { Request, Response, Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

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
        'Run database auto-fix: npm run db:fix-production',
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

export default router; 