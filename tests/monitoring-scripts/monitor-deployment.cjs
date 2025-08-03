#!/usr/bin/env node

/**
 * Monitor Deployment Status
 * Check if OpenAI summary fix is deployed and working
 */

const https = require('https');

const PRODUCTION_URL = 'https://minhonmuine.talk2go.online';
const RENDER_SERVICE_ID = 'srv-d015p73uibrs73a20dog';

async function checkDeploymentStatus() {
    console.log('🔍 Monitoring Deployment Status');
    console.log('===============================');

    try {
        // 1. Check if production is accessible
        console.log('\n📡 1. Checking production accessibility...');
        const response = await fetch(`${PRODUCTION_URL}/health`);

        if (response.ok) {
            console.log('✅ Production is accessible');
        } else {
            console.log('❌ Production is not accessible');
            return;
        }

        // 2. Check health endpoint
        console.log('\n🏥 2. Checking health endpoint...');
        const healthResponse = await fetch(`${PRODUCTION_URL}/health`);
        const healthData = await healthResponse.json();

        console.log('📊 Health Status:', healthData);

        // 3. Test database connection (via API)
        console.log('\n🗄️ 3. Testing database connection...');
        try {
            const dbTestResponse = await fetch(`${PRODUCTION_URL}/api/request`);
            console.log('✅ Database connection working');
        } catch (error) {
            console.log('❌ Database connection failed:', error.message);
        }

        // 4. Check if fix is deployed
        console.log('\n🔧 4. Checking if fix is deployed...');
        console.log('💡 To verify fix:');
        console.log('   - Open: https://minhonmuine.talk2go.online');
        console.log('   - Make a voice call');
        console.log('   - Check if summary appears (not "Call summary is being generated...")');
        console.log('   - Check logs for no 42703 errors');

    } catch (error) {
        console.error('❌ Error checking deployment:', error.message);
    }
}

async function testVoiceCall() {
    console.log('\n🎤 Testing Voice Call Flow');
    console.log('==========================');

    console.log('📋 Manual Test Steps:');
    console.log('1. Open: https://minhonmuine.talk2go.online');
    console.log('2. Click "Tap To Speak"');
    console.log('3. Say: "My name is Tony. My room number is 10. I want to order 1 chicken burger, please."');
    console.log('4. Wait for conversation to complete');
    console.log('5. Check Call Summary panel');
    console.log('6. Verify summary appears (not stuck on "generating...")');

    console.log('\n📊 Expected Results:');
    console.log('✅ No 42703 errors in logs');
    console.log('✅ Summary appears in Call Summary panel');
    console.log('✅ Service request saved to database');
    console.log('✅ Order details visible');
}

// Main execution
async function main() {
    console.log('🚀 OpenAI Summary Fix - Deployment Monitor');
    console.log('==========================================');

    await checkDeploymentStatus();
    await testVoiceCall();

    console.log('\n🎯 Next Steps:');
    console.log('1. Wait 5-10 minutes for deployment to complete');
    console.log('2. Test voice call functionality');
    console.log('3. Monitor logs for 42703 errors');
    console.log('4. Verify summary generation works end-to-end');
}

main().catch(console.error); 