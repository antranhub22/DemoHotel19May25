#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { tenants } from '../../packages/shared/db/schema.js';

async function listTenants() {
  try {
    console.log('🔍 Listing all tenants in database...');

    const allTenants = await db.select().from(tenants);

    if (allTenants.length === 0) {
      console.log('No tenants found in database.');
      return;
    }

    console.log('\n📋 Found tenants:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    allTenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ID: ${tenant.id}`);
      console.log(`   Hotel Name: ${tenant.hotelName}`);
      console.log(`   Subdomain: ${tenant.subdomain}`);
      console.log(`   Status: ${tenant.subscriptionStatus}`);
      console.log(`   Plan: ${tenant.subscriptionPlan}`);
      console.log('   ────────────────────────────────────');
    });

    console.log('\n💡 Use one of these tenant IDs for authentication testing.');
  } catch (error) {
    console.error('❌ Error listing tenants:', error);
    process.exit(1);
  }
}

// Run the script
listTenants()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
