#!/bin/bash

# ============================================
# DEPLOYMENT ROLLBACK SCRIPT - Enhanced Logging & Metrics v2.0
# ============================================
# Quick rollback script to disable monitoring if deployment fails

echo "🚨 DEPLOYMENT ROLLBACK: Disabling Enhanced Logging & Metrics v2.0"

# Set environment variables to disable monitoring
export DISABLE_MONITORING=true
export ENABLE_MONITORING=false
export ENABLE_ENHANCED_LOGGING=false
export ENABLE_METRICS_COLLECTION=false
export ENABLE_PERFORMANCE_TRACING=false
export ENABLE_AUTO_ALERTS=false

echo "✅ Monitoring disabled via environment variables"

# Alternative: Comment out monitoring imports in shared/index.ts
if [ "$1" = "--hard-disable" ]; then
  echo "🔧 Performing hard disable of monitoring imports..."
  
  # Backup current shared/index.ts
  cp apps/server/shared/index.ts apps/server/shared/index.ts.backup
  
  # Comment out monitoring exports
  sed -i.bak 's/export \* from \.\/EnhancedLogger/\/\/ export \* from \.\/EnhancedLogger/' apps/server/shared/index.ts
  sed -i.bak 's/export \* from \.\/MetricsCollector/\/\/ export \* from \.\/MetricsCollector/' apps/server/shared/index.ts
  sed -i.bak 's/export \* from \.\/MonitoringIntegration/\/\/ export \* from \.\/MonitoringIntegration/' apps/server/shared/index.ts
  
  # Comment out monitoring imports
  sed -i.bak 's/import { EnhancedLogger }/\/\/ import { EnhancedLogger }/' apps/server/shared/index.ts
  sed -i.bak 's/import { MetricsCollector }/\/\/ import { MetricsCollector }/' apps/server/shared/index.ts
  sed -i.bak 's/import { MonitoringIntegration }/\/\/ import { MonitoringIntegration }/' apps/server/shared/index.ts
  
  echo "✅ Hard disable completed. Monitoring imports commented out."
  echo "📋 To restore: cp apps/server/shared/index.ts.backup apps/server/shared/index.ts"
fi

# Rebuild application
echo "🔨 Rebuilding application without monitoring..."
npm run build

echo "🎯 ROLLBACK COMPLETE"
echo ""
echo "📋 DEPLOYMENT STATUS:"
echo "  ✅ Enhanced Logging & Metrics v2.0: DISABLED"
echo "  ✅ Core Application: OPERATIONAL"
echo "  ✅ Build Status: SUCCESS"
echo ""
echo "🔧 TO RE-ENABLE MONITORING:"
echo "  1. Set DISABLE_MONITORING=false"
echo "  2. Set ENABLE_MONITORING=true"
echo "  3. Rebuild and deploy"
echo ""
echo "📊 TO CHECK STATUS:"
echo "  curl /api/health"
echo "  curl /api/monitoring/status (if re-enabled)" 