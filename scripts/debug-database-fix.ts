#!/usr/bin/env tsx

/**
 * Debug Database Fix - Detailed analysis
 */

const BASE_URL = 'https://minhonmuine.talk2go.online';

async function debugDatabaseFix() {
  console.log('🔍 Debugging database fix...\n');
  
  try {
    // 1. Check overall health
    console.log('1. Overall health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData);
    
    // 2. Check database health in detail
    console.log('\n2. Database health check...');
    const dbHealthResponse = await fetch(`${BASE_URL}/api/health/database`);
    const dbHealthData = await dbHealthResponse.json();
    console.log('✅ Database health:', JSON.stringify(dbHealthData, null, 2));
    
    // 3. Check environment
    console.log('\n3. Environment check...');
    const envResponse = await fetch(`${BASE_URL}/api/health/environment`);
    const envData = await envResponse.json();
    console.log('✅ Environment:', JSON.stringify(envData, null, 2));
    
    // 4. Try database fix and capture detailed error
    console.log('\n4. Triggering database fix...');
    const fixResponse = await fetch(`${BASE_URL}/api/health/fix-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const fixText = await fixResponse.text();
    console.log('Response status:', fixResponse.status);
    console.log('Response headers:', Object.fromEntries(fixResponse.headers.entries()));
    
    try {
      const fixData = JSON.parse(fixText);
      console.log('✅ Database fix response:', JSON.stringify(fixData, null, 2));
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON. Raw response:');
      console.log(fixText);
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugDatabaseFix().catch(console.error); 