#!/usr/bin/env tsx

import { UnifiedAuthService } from '../../apps/server/services/unifiedAuthService.js';

async function testUnifiedAuth() {
  try {
    console.log('🔐 Testing UnifiedAuthService directly...');
    
    // Test login with manager credentials
    const loginResult = await UnifiedAuthService.login({
      username: 'manager',
      password: 'manager123',
      tenantId: 'mi-nhon-hotel'
    });
    
    console.log('\n📋 Login Result:');
    console.log(JSON.stringify(loginResult, null, 2));
    
    if (loginResult.success && loginResult.token) {
      console.log('\n✅ UnifiedAuthService login successful!');
      
      // Test token verification
      const verifyResult = await UnifiedAuthService.verifyToken(loginResult.token);
      console.log('\n🔍 Token Verification:');
      console.log(JSON.stringify(verifyResult, null, 2));
      
    } else {
      console.log('\n❌ UnifiedAuthService login failed');
      console.log('Error:', loginResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing UnifiedAuthService:', error);
    process.exit(1);
  }
}

// Run the script
testUnifiedAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 