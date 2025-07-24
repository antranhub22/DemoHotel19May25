#!/usr/bin/env node

// ============================================
// AUTOMATIC MONITORING ENABLER v2.0
// ============================================
// Automatically enables Enhanced Logging & Metrics v2.0
// by uncommenting the auto-initialization code

const fs = require('fs');
const path = require('path');

console.log('🔧 Enabling Enhanced Logging & Metrics v2.0...\n');

function enableMonitoring() {
    const sharedIndexPath = path.join(__dirname, '../../../apps/server/shared/index.ts');

    try {
        // Read current content
        let content = fs.readFileSync(sharedIndexPath, 'utf8');

        // Check if monitoring is already enabled
        if (!content.includes('// ✅ TEMPORARILY DISABLED: Auto-initialization for deployment safety')) {
            console.log('🟢 MONITORING ALREADY ENABLED');
            console.log('📍 Auto-initialization is already active\n');
            return true;
        }

        // Create backup
        const backupPath = sharedIndexPath + '.backup-' + Date.now();
        fs.writeFileSync(backupPath, content);
        console.log(`📁 Backup created: ${path.basename(backupPath)}`);

        // Replace the commented section
        const originalSection = `// ✅ TEMPORARILY DISABLED: Auto-initialization for deployment safety
// Will be re-enabled after successful deployment verification
/*
if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_MONITORING !== 'false') {
  // Use setTimeout to ensure this runs after module system is ready
  setTimeout(() => {
    initializeMonitoring().catch(error => {
      console.error('❌ Auto-initialization of monitoring failed:', error);
      // Graceful degradation - don't crash the app
    });
  }, 2000); // Increased delay to 2 seconds
}
*/

// 📋 TO RE-ENABLE MONITORING AFTER DEPLOYMENT:
// 1. Uncomment the above code block
// 2. Set ENABLE_MONITORING=true in environment
// 3. Rebuild and deploy`;

        const enabledSection = `// ✅ MONITORING ENABLED: Auto-initialization after deployment verification
if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_MONITORING !== 'false') {
  // Use setTimeout to ensure this runs after module system is ready
  setTimeout(() => {
    initializeMonitoring().catch(error => {
      console.error('❌ Auto-initialization of monitoring failed:', error);
      // Graceful degradation - don't crash the app
    });
  }, 2000); // Increased delay to 2 seconds
}`;

        // Replace the content
        const newContent = content.replace(originalSection, enabledSection);

        if (newContent === content) {
            console.log('⚠️  WARNING: Could not find expected disabled monitoring code');
            console.log('🔧 Manual enable required - see MONITORING_RE_ENABLE_GUIDE.md\n');
            return false;
        }

        // Write the updated content
        fs.writeFileSync(sharedIndexPath, newContent);

        console.log('✅ MONITORING ENABLED SUCCESSFULLY');
        console.log('📍 Auto-initialization uncommented in shared/index.ts\n');

        return true;

    } catch (error) {
        console.log('❌ ERROR: Failed to enable monitoring');
        console.log(`   ${error.message}\n`);
        return false;
    }
}

function showPostEnableSteps() {
    console.log('🎯 NEXT STEPS:\n');

    console.log('   1️⃣  REBUILD APPLICATION:');
    console.log('       npm run build\n');

    console.log('   2️⃣  RESTART SERVER (if running):');
    console.log('       npm start\n');

    console.log('   3️⃣  VERIFY MONITORING:');
    console.log('       npm run status-monitoring');
    console.log('       curl /api/monitoring/status\n');

    console.log('   4️⃣  CHECK HEALTH:');
    console.log('       curl /api/health/architecture');
    console.log('       curl /api/monitoring/logs/health\n');

    console.log('📊 MONITORING ENDPOINTS NOW AVAILABLE:');
    console.log('   • GET  /api/monitoring/logs       - Enhanced logging');
    console.log('   • GET  /api/monitoring/metrics    - System metrics');
    console.log('   • GET  /api/monitoring/status     - Overall status');
    console.log('   • POST /api/monitoring/health-check - Health check');
    console.log('   • GET  /api/monitoring/report     - Full system report\n');
}

function showConfiguration() {
    console.log('⚙️  OPTIONAL CONFIGURATION:\n');

    console.log('   🌍 ENVIRONMENT VARIABLES:');
    console.log('     export ENABLE_MONITORING=true');
    console.log('     export ENABLE_ENHANCED_LOGGING=true');
    console.log('     export ENABLE_METRICS_COLLECTION=true');
    console.log('     export ENABLE_PERFORMANCE_TRACING=true');
    console.log('     export ENABLE_AUTO_ALERTS=true\n');

    console.log('   📊 MONITORING SETTINGS:');
    console.log('     export METRICS_COLLECTION_INTERVAL=30000');
    console.log('     export LOG_LEVEL=info');
    console.log('     export MAX_LOG_HISTORY=10000\n');
}

function showRollbackInfo() {
    console.log('🔄 TO DISABLE AGAIN (if needed):\n');

    console.log('   💡 QUICK DISABLE:');
    console.log('     export ENABLE_MONITORING=false\n');

    console.log('   🔧 PERMANENT DISABLE:');
    console.log('     npm run remind-monitoring  (shows manual steps)');
    console.log('     ./DEPLOYMENT_ROLLBACK.sh\n');

    console.log('   📁 BACKUP RESTORE:');
    console.log('     cp apps/server/shared/index.ts.backup-* apps/server/shared/index.ts\n');
}

// Main execution
function main() {
    const success = enableMonitoring();

    if (success) {
        showPostEnableSteps();
        showConfiguration();
        showRollbackInfo();

        console.log('🎉 Enhanced Logging & Metrics v2.0 Enabled Successfully!');
        console.log('📖 Full documentation: MONITORING_RE_ENABLE_GUIDE.md\n');

        // Quick build test
        console.log('🔨 Running quick build test...');
        try {
            const { execSync } = require('child_process');
            execSync('npm run typecheck', { stdio: 'pipe' });
            console.log('✅ Build test passed - ready to deploy with monitoring!\n');
        } catch (error) {
            console.log('⚠️  Build test failed - check for issues before deploying\n');
        }

    } else {
        console.log('❌ Failed to enable monitoring automatically');
        console.log('📖 Follow manual instructions in: MONITORING_RE_ENABLE_GUIDE.md\n');
    }
}

if (require.main === module) {
    main();
}

module.exports = { enableMonitoring }; 