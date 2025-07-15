#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { tenants } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';

async function createDefaultTenant() {
  try {
    console.log('🔧 Creating default tenant...');
    
    const tenantId = 'minhon-default-tenant-id';
    
    // Check if tenant already exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (existingTenant.length > 0) {
      console.log(`⚠️  Tenant ${tenantId} already exists, skipping...`);
      return;
    }

    // Create the tenant record
    await db.insert(tenants).values({
      id: tenantId,
      hotelName: 'Mi Nhon Hotel',
      subdomain: 'minhonmuine',
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active',
      createdAt: Date.now(),
      maxVoices: 10,
      maxLanguages: 6,
      voiceCloning: true,
      multiLocation: true,
      whiteLabel: true,
      dataRetentionDays: 365,
      monthlyCallLimit: 10000,
      isActive: true,
      tier: 'enterprise',
      maxCalls: 10000,
      maxUsers: 50,
    });

    console.log(`✅ Created tenant: ${tenantId}`);
    console.log('\n🎉 Default tenant created successfully!');
    console.log('Now foreign key constraints will work properly.');
    
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
    process.exit(1);
  }
}

// Run the script
createDefaultTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 