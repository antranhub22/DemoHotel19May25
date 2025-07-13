#!/usr/bin/env tsx

/**
 * Test Database Setup API
 * Tests the manual database setup endpoint
 */

const SERVER_URL = 'https://minhonmuine.talk2go.online';

async function testDatabaseSetup() {
  console.log('🔧 Testing database setup API...\n');
  
  try {
    // First check current database status
    console.log('1. Checking current database status...');
    const healthResponse = await fetch(`${SERVER_URL}/api/health/database`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Current database status:', healthData.status);
      console.log('📋 Missing items:', healthData.schema_checks);
    }
    
    // Trigger manual database setup
    console.log('\n2. Triggering manual database setup...');
    const setupResponse = await fetch(`${SERVER_URL}/api/health/setup-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const setupText = await setupResponse.text();
    console.log('Response status:', setupResponse.status);
    
    try {
      const setupData = JSON.parse(setupText);
      console.log('✅ Database setup response:', JSON.stringify(setupData, null, 2));
      
      if (setupData.status === 'success') {
        console.log('🎉 Database setup completed successfully!');
        
        // Check database status again
        console.log('\n3. Verifying database status...');
        const verifyResponse = await fetch(`${SERVER_URL}/api/health/database`);
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Final database status:', verifyData.status);
          console.log('📋 Schema checks:', verifyData.schema_checks);
          
          if (verifyData.status === 'healthy') {
            console.log('🎉 Database is now healthy! You can login with:');
            console.log('  - admin@hotel.com:StrongPassword123');
            console.log('  - manager@hotel.com:StrongPassword456');
          } else {
            console.log('⚠️  Database may still have issues');
          }
        }
      } else {
        console.log('❌ Database setup failed:', setupData.message);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON. Raw response:');
      console.log(setupText);
    }
    
  } catch (error) {
    console.error('❌ Error testing database setup:', error);
  }
}

testDatabaseSetup().catch(console.error); 