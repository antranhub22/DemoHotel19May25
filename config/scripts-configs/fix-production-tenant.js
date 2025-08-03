#!/usr/bin/env node

/**
 * Production Tenant Fix Script
 * Creates missing 'minhonmuine' tenant in production database
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const { eq } = require('drizzle-orm');
const postgres = require('postgres');

// Import schema (adjust path as needed)
const { tenants } = require('./packages/shared/db/schema.ts');

async function fixProductionTenant() {
  console.log('🔧 [Production Fix] Starting tenant creation...');

  try {
    // Connect to production database
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not found');
    }

    console.log('📀 [Production Fix] Connecting to database...');
    const sql = postgres(databaseUrl);
    const db = drizzle(sql);

    // Check if tenant exists
    console.log('🔍 [Production Fix] Checking for existing tenant...');
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, 'minhonmuine'))
      .limit(1);

    if (existingTenant.length > 0) {
      console.log(
        '✅ [Production Fix] Tenant already exists:',
        existingTenant[0]
      );
      await sql.end();
      return;
    }

    // Create missing tenant
    console.log('🏨 [Production Fix] Creating missing tenant...');
    const newTenant = await db
      .insert(tenants)
      .values({
        id: 'mi-nhon-hotel',
        hotel_name: 'Mi Nhon Hotel',
        subdomain: 'minhonmuine',
        custom_domain: 'minhonmuine.talk2go.online',
        subscription_plan: 'premium',
        subscription_status: 'active',
        is_active: true,
        monthly_call_limit: 1000,
        max_voices: 5,
        max_languages: 6,
        voice_cloning: true,
        multi_location: true,
        white_label: false,
        data_retention_days: 365,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    console.log(
      '✅ [Production Fix] Tenant created successfully:',
      newTenant[0]
    );

    // Verify creation
    const verifyTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, 'minhonmuine'))
      .limit(1);

    if (verifyTenant.length > 0) {
      console.log('🎉 [Production Fix] Verification successful!');
      console.log('📋 [Production Fix] Tenant details:', {
        id: verifyTenant[0].id,
        hotelName: verifyTenant[0].hotel_name,
        subdomain: verifyTenant[0].subdomain,
        status: verifyTenant[0].subscription_status,
      });
    }

    await sql.end();
    console.log('🏁 [Production Fix] Complete! Production should work now.');
  } catch (error) {
    console.error('❌ [Production Fix] Error:', error.message);
    console.error('🔍 [Production Fix] Full error:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixProductionTenant();
}

module.exports = { fixProductionTenant };
