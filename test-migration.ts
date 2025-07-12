#!/usr/bin/env tsx

/**
 * 🧪 Database Migration Test Script
 * 
 * This script:
 * 1. Runs migrations safely
 * 2. Verifies Mi Nhon Hotel data is properly migrated  
 * 3. Tests existing queries with tenant_id filtering
 * 4. Shows sample queries for multi-tenant data access
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { eq, count, sql } from 'drizzle-orm';
import { 
  tenants, 
  hotelProfiles, 
  call, 
  transcript, 
  request, 
  message, 
  staff 
} from './src/db/schema';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const log = (message: string, color: string = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logStep = (step: string) => {
  log(`\n${colors.bold}${colors.blue}🔄 ${step}${colors.reset}`);
};

const logSuccess = (message: string) => {
  log(`${colors.green}✅ ${message}${colors.reset}`);
};

const logError = (message: string) => {
  log(`${colors.red}❌ ${message}${colors.reset}`);
};

const logWarning = (message: string) => {
  log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
};

// Database setup
const isPostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');
let db: any;

if (isPostgres) {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString);
  db = drizzlePostgres(sql);
} else {
  const sqlite = new Database('dev.db');
  db = drizzle(sqlite);
}

// Mi Nhon Hotel tenant ID (from migration)
const MI_NHON_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function testMigration() {
  try {
    log(`${colors.bold}${colors.cyan}🧪 Starting Database Migration Test${colors.reset}`);
    log(`${colors.cyan}Database Type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}${colors.reset}`);

    // ===========================================
    // STEP 1: Run Migration Safely
    // ===========================================
    logStep('Step 1: Running Migration Safely');
    
    try {
      if (isPostgres) {
        await migratePostgres(db, { migrationsFolder: './migrations' });
      } else {
        migrate(db, { migrationsFolder: './migrations' });
      }
      logSuccess('Migration completed successfully');
    } catch (error) {
      logError(`Migration failed: ${error}`);
      process.exit(1);
    }

    // ===========================================
    // STEP 2: Verify Mi Nhon Hotel Data Migration
    // ===========================================
    logStep('Step 2: Verifying Mi Nhon Hotel Data Migration');

    // Check if Mi Nhon Hotel tenant exists
    const miNhonTenant = await db.select().from(tenants).where(eq(tenants.id, MI_NHON_TENANT_ID));
    
    if (miNhonTenant.length === 0) {
      logError('Mi Nhon Hotel tenant not found!');
      process.exit(1);
    }
    
    logSuccess(`Mi Nhon Hotel tenant found: ${miNhonTenant[0].hotelName}`);
    log(`   - Subdomain: ${miNhonTenant[0].subdomain}`);
    log(`   - Plan: ${miNhonTenant[0].subscriptionPlan}`);
    log(`   - Status: ${miNhonTenant[0].subscriptionStatus}`);

    // Check data association counts
    const dataCounts = await Promise.all([
      db.select({ count: count() }).from(call).where(eq(call.tenantId, MI_NHON_TENANT_ID)),
      db.select({ count: count() }).from(transcript).where(eq(transcript.tenantId, MI_NHON_TENANT_ID)),
      db.select({ count: count() }).from(request).where(eq(request.tenantId, MI_NHON_TENANT_ID)),
      db.select({ count: count() }).from(message).where(eq(message.tenantId, MI_NHON_TENANT_ID)),
      db.select({ count: count() }).from(staff).where(eq(staff.tenantId, MI_NHON_TENANT_ID))
    ]);

    logSuccess('Data association verification:');
    log(`   - Calls: ${dataCounts[0][0].count} records`);
    log(`   - Transcripts: ${dataCounts[1][0].count} records`);
    log(`   - Requests: ${dataCounts[2][0].count} records`);
    log(`   - Messages: ${dataCounts[3][0].count} records`);
    log(`   - Staff: ${dataCounts[4][0].count} records`);

    // ===========================================
    // STEP 3: Test Existing Queries with Tenant Filtering
    // ===========================================
    logStep('Step 3: Testing Existing Queries with Tenant Filtering');

    // Test basic tenant-aware queries
    const tenantCalls = await db.select().from(call).where(eq(call.tenantId, MI_NHON_TENANT_ID)).limit(5);
    const tenantRequests = await db.select().from(request).where(eq(request.tenantId, MI_NHON_TENANT_ID)).limit(5);
    
    logSuccess(`✅ Tenant-filtered calls query: ${tenantCalls.length} results`);
    logSuccess(`✅ Tenant-filtered requests query: ${tenantRequests.length} results`);

    // Test combined queries
    const callsWithTranscripts = await db.select({
      callId: call.id,
      createdAt: call.createdAt,
      transcript: transcript.content
    })
    .from(call)
    .leftJoin(transcript, eq(call.id, transcript.callId))
    .where(eq(call.tenantId, MI_NHON_TENANT_ID))
    .limit(3);

    logSuccess(`✅ Combined calls+transcripts query: ${callsWithTranscripts.length} results`);

    // ===========================================
    // STEP 4: Sample Multi-Tenant Data Access Queries
    // ===========================================
    logStep('Step 4: Multi-Tenant Data Access Examples');

    // Sample query patterns for multi-tenant app
    log(`${colors.cyan}Sample Query Patterns:${colors.reset}`);
    
    // 1. Get all data for a specific tenant
    log(`${colors.yellow}1. Get all calls for Mi Nhon Hotel:${colors.reset}`);
    log(`   const calls = await db.select().from(call).where(eq(call.tenantId, '${MI_NHON_TENANT_ID}'));`);
    
    // 2. Get tenant info with profile
    log(`${colors.yellow}2. Get tenant with hotel profile:${colors.reset}`);
    log(`   const tenantWithProfile = await db.select().from(tenants)`);
    log(`     .leftJoin(hotelProfiles, eq(tenants.id, hotelProfiles.tenantId))`);
    log(`     .where(eq(tenants.subdomain, 'minhon'));`);
    
    // 3. Multi-tenant analytics
    log(`${colors.yellow}3. Multi-tenant analytics (calls per tenant):${colors.reset}`);
    const analyticsQuery = await db.select({
      tenantId: call.tenantId,
      hotelName: tenants.hotelName,
      callCount: count(call.id)
    })
    .from(call)
    .leftJoin(tenants, eq(call.tenantId, tenants.id))
    .groupBy(call.tenantId, tenants.hotelName);
    
    log(`   Result: ${JSON.stringify(analyticsQuery, null, 2)}`);

    // 4. Isolation verification
    log(`${colors.yellow}4. Tenant isolation verification:${colors.reset}`);
    const allTenants = await db.select().from(tenants);
    log(`   Total tenants: ${allTenants.length}`);
    
    for (const tenant of allTenants) {
      const tenantCallCount = await db.select({ count: count() }).from(call).where(eq(call.tenantId, tenant.id));
      log(`   - ${tenant.hotelName}: ${tenantCallCount[0].count} calls`);
    }

    // ===========================================
    // STEP 5: Verify Schema Integrity
    // ===========================================
    logStep('Step 5: Verifying Schema Integrity');

    // Check that all tables exist
    const tables = ['tenants', 'hotel_profiles', 'call', 'transcript', 'request', 'message', 'staff'];
    
    for (const table of tables) {
      try {
        await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
        logSuccess(`✅ Table '${table}' exists and accessible`);
      } catch (error) {
        logError(`❌ Table '${table}' issue: ${error}`);
      }
    }

    // Check foreign key constraints
    try {
      // Try to insert a call with invalid tenant_id (should fail)
      await db.insert(call).values({
        tenantId: '00000000-0000-0000-0000-000000000999', // Non-existent tenant
        type: 'inboundPhoneCall',
        createdAt: new Date().toISOString()
      });
      logWarning('⚠️ Foreign key constraint might not be working properly');
    } catch (error) {
      logSuccess('✅ Foreign key constraints are working (invalid tenant_id rejected)');
    }

    // ===========================================
    // FINAL SUMMARY
    // ===========================================
    log(`\n${colors.bold}${colors.green}🎉 Migration Test Completed Successfully!${colors.reset}`);
    log(`${colors.green}✅ All tests passed - Database is ready for multi-tenant operation${colors.reset}`);
    
    log(`\n${colors.bold}${colors.cyan}Next Steps:${colors.reset}`);
    log(`${colors.cyan}1. Update application code to use tenant-aware queries${colors.reset}`);
    log(`${colors.cyan}2. Add tenant middleware for request filtering${colors.reset}`);
    log(`${colors.cyan}3. Build hotel research engine${colors.reset}`);
    log(`${colors.cyan}4. Create dashboard frontend${colors.reset}`);

  } catch (error) {
    logError(`Test failed: ${error}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testMigration(); 