#!/usr/bin/env tsx

import { UnifiedAuthService } from '../../apps/server/services/auth/UnifiedAuthService.v2';

async function testAllRoles() {
  try {
    console.log('🧪 Testing all 3 user roles with UnifiedAuthService...\n');
    
    const testUsers = [
      { username: 'manager', password: 'manager123', expected: 'hotel-manager' },
      { username: 'frontdesk', password: 'frontdesk123', expected: 'front-desk' },
      { username: 'itmanager', password: 'itmanager123', expected: 'it-manager' }
    ];
    
    for (const userData of testUsers) {
      console.log(`Testing ${userData.username}...`);
      
      const result = await UnifiedAuthService.login({
        username: userData.username,
        password: userData.password,
        tenantId: 'mi-nhon-hotel'
      });
      
      if (result.success) {
        console.log(`✅ ${userData.username}: SUCCESS`);
        console.log(`   Role: ${result.user?.role}`);
        console.log(`   Permissions: ${result.user?.permissions?.length} total`);
      } else {
        console.log(`❌ ${userData.username}: FAILED`);
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error testing roles:', error);
    process.exit(1);
  }
}

// Run the script
testAllRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 