#!/usr/bin/env tsx

/**
 * Test Database Fix - Manual trigger
 * Triggers the database fix via API endpoint
 */

const BASE_URL = 'https://minhonmuine.talk2go.online';

async function testDatabaseFix() {
  console.log('🔧 Testing database fix...\n');
  
  try {
    // First check database status
    console.log('1. Checking database status...');
    const healthResponse = await fetch(`${BASE_URL}/api/health/database`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Database health check:', healthData.status);
      
      if (healthData.status === 'healthy') {
        console.log('🎉 Database is already healthy!');
        return;
      }
    }
    
    // Trigger manual database fix
    console.log('\n2. Triggering manual database fix...');
    const fixResponse = await fetch(`${BASE_URL}/api/health/fix-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (fixResponse.ok) {
      const fixData = await fixResponse.json();
      console.log('✅ Database fix response:', fixData);
      
      if (fixData.status === 'success') {
        console.log('🎉 Database fix completed successfully!');
        
        // Check database status again
        console.log('\n3. Verifying database status...');
        const verifyResponse = await fetch(`${BASE_URL}/api/health/database`);
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Final database status:', verifyData.status);
          
          if (verifyData.status === 'healthy') {
            console.log('🎉 Database is now healthy!');
          } else {
            console.log('⚠️  Database may still have issues');
          }
        }
      } else {
        console.log('❌ Database fix failed:', fixData.message);
      }
    } else {
      console.log('❌ Failed to trigger database fix:', fixResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing database fix:', error);
  }
}

testDatabaseFix().catch(console.error); 