#!/usr/bin/env node

// ============================================
// MONITORING STATUS CHECKER v2.0
// ============================================
// Checks if Enhanced Logging & Metrics v2.0 is currently enabled
// and provides helpful reminders and next steps

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Enhanced Logging & Metrics v2.0 Status...\n');

// Check if monitoring auto-initialization is enabled
function checkMonitoringStatus() {
    const sharedIndexPath = path.join(__dirname, '../../../apps/server/shared/index.ts');

    try {
        const content = fs.readFileSync(sharedIndexPath, 'utf8');

        // Check if auto-initialization code is commented out
        const isDisabled = content.includes('// ✅ TEMPORARILY DISABLED: Auto-initialization for deployment safety');
        const isCommentedOut = content.includes('/*') && content.includes('if (process.env.NODE_ENV !== \'test\'');

        if (isDisabled && isCommentedOut) {
            console.log('🔴 STATUS: MONITORING DISABLED');
            console.log('📍 Location: Auto-initialization is commented out in shared/index.ts\n');

            console.log('📋 TO RE-ENABLE MONITORING:');
            console.log('   1️⃣  npm run enable-monitoring     (automatic)');
            console.log('   2️⃣  npm run remind-monitoring     (show guide)');
            console.log('   3️⃣  See MONITORING_RE_ENABLE_GUIDE.md\n');

            console.log('⚡ QUICK ENABLE:');
            console.log('   npm run enable-monitoring && npm run build\n');

            return false;
        } else if (!isCommentedOut) {
            console.log('🟢 STATUS: MONITORING ENABLED');
            console.log('📍 Location: Auto-initialization is active in shared/index.ts\n');

            console.log('📊 MONITORING ENDPOINTS AVAILABLE:');
            console.log('   • GET  /api/monitoring/status     - Overall status');
            console.log('   • GET  /api/monitoring/logs       - Enhanced logging');
            console.log('   • GET  /api/monitoring/metrics    - System metrics');
            console.log('   • POST /api/monitoring/health-check - Health check\n');

            console.log('🔧 MONITORING COMMANDS:');
            console.log('   npm run status-monitoring    - Check if running');
            console.log('   npm run remind-monitoring    - Show all commands\n');

            return true;
        } else {
            console.log('🟡 STATUS: MONITORING PARTIALLY CONFIGURED');
            console.log('📍 Location: Mixed state detected in shared/index.ts\n');
            console.log('🔧 RECOMMENDATION: Run npm run enable-monitoring to ensure proper setup\n');

            return null;
        }

    } catch (error) {
        console.log('❌ ERROR: Cannot read monitoring configuration');
        console.log(`   ${error.message}\n`);
        console.log('🔧 MANUAL CHECK: apps/server/shared/index.ts\n');
        return null;
    }
}

// Check deployment readiness
function checkDeploymentReadiness() {
    console.log('🚀 DEPLOYMENT READINESS CHECK:\n');

    try {
        // Check if build works
        const { execSync } = require('child_process');

        console.log('   🔨 Build Test: Running...');
        execSync('npm run typecheck', { stdio: 'pipe' });
        console.log('   ✅ TypeScript: Compilation successful');

        console.log('   🎯 Application: Ready for deployment');
        console.log('   📦 Monitoring: Can be enabled post-deployment\n');

    } catch (error) {
        console.log('   ❌ Build Test: Failed');
        console.log('   🔧 Fix required before deployment\n');
    }
}

// Show environment variables that affect monitoring
function showEnvironmentInfo() {
    console.log('🌍 ENVIRONMENT VARIABLES:\n');

    const envVars = [
        'NODE_ENV',
        'DISABLE_MONITORING',
        'ENABLE_MONITORING',
        'ENABLE_ENHANCED_LOGGING',
        'ENABLE_METRICS_COLLECTION',
        'ENABLE_PERFORMANCE_TRACING',
        'ENABLE_AUTO_ALERTS'
    ];

    envVars.forEach(varName => {
        const value = process.env[varName];
        const status = value ? `"${value}"` : 'not set';
        console.log(`   ${varName}: ${status}`);
    });

    console.log('\n💡 TIP: Set DISABLE_MONITORING=true to fully disable monitoring\n');
}

// Show next steps based on current status
function showNextSteps(monitoringEnabled) {
    console.log('🎯 RECOMMENDED NEXT STEPS:\n');

    if (monitoringEnabled === false) {
        console.log('   📋 CURRENT: Monitoring is safely disabled for deployment');
        console.log('   🚀 DEPLOY: Application is ready for production deployment');
        console.log('   ⏰ LATER: Enable monitoring after successful deployment\n');

        console.log('   🔄 TO ENABLE AFTER DEPLOYMENT:');
        console.log('     1. Verify app is running: curl /api/health');
        console.log('     2. Enable monitoring: npm run enable-monitoring');
        console.log('     3. Rebuild and deploy: npm run build');
        console.log('     4. Verify monitoring: npm run status-monitoring\n');

    } else if (monitoringEnabled === true) {
        console.log('   📊 CURRENT: Full monitoring capabilities active');
        console.log('   🔍 TEST: Verify endpoints are responding');
        console.log('   📈 MONITOR: Check system health and metrics\n');

        console.log('   🧪 TEST MONITORING:');
        console.log('     npm run status-monitoring');
        console.log('     curl /api/monitoring/status');
        console.log('     curl /api/health/architecture\n');

    } else {
        console.log('   🔧 CURRENT: Configuration needs attention');
        console.log('   🎯 ACTION: Run npm run enable-monitoring to fix');
        console.log('   ✅ VERIFY: Check status after fix\n');
    }
}

// Main execution
function main() {
    const monitoringEnabled = checkMonitoringStatus();
    checkDeploymentReadiness();
    showEnvironmentInfo();
    showNextSteps(monitoringEnabled);

    console.log('📚 DOCUMENTATION:');
    console.log('   📖 Re-enable Guide: MONITORING_RE_ENABLE_GUIDE.md');
    console.log('   🚨 Deployment Fix: MONITORING_DEPLOYMENT_FIX.md');
    console.log('   🔄 Rollback Script: DEPLOYMENT_ROLLBACK.sh\n');

    console.log('✨ Enhanced Logging & Metrics v2.0 Status Check Complete!');
}

if (require.main === module) {
    main();
}

module.exports = { checkMonitoringStatus, checkDeploymentReadiness }; 