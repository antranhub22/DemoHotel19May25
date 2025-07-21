#!/usr/bin/env tsx

import { db } from '../../packages/shared/db/index.js';
import { staff } from '../../packages/shared/db/schema.js';
import { eq } from 'drizzle-orm';

async function updateTenantIds() {
  try {
    console.log('🔧 Updating tenant IDs for test users...');
    
    const users = ['manager', 'frontdesk', 'itmanager'];
    const correctTenantId = 'minhon-default-tenant-id';
    
    for (const username of users) {
      const result = await db.update(staff)
        .set({ tenantId: correctTenantId })
        .where(eq(staff.username, username));
      
      console.log(`✅ Updated tenant ID for user: ${username} -> ${correctTenantId}`);
    }
    
    console.log('\n🎉 All user tenant IDs updated successfully!');
    console.log('Now authentication should work with the correct tenant ID.');
    
  } catch (error) {
    console.error('❌ Error updating tenant IDs:', error);
    process.exit(1);
  }
}

// Run the script
updateTenantIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 