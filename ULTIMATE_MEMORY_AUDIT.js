/**
 * 🚨 ULTIMATE MEMORY AUDIT - FIND THE EXACT LEAK SOURCE
 *
 * CRITICAL: Nuclear restart triggered but memory INCREASED 94.7% → 95.50%
 * This indicates a DEEPER memory leak that survives restarts
 */

console.log("🚨 ULTIMATE MEMORY AUDIT - Starting Deep Analysis...");

// ===================================================================
// 🔍 MEMORY LEAK DETECTION
// ===================================================================

function performUltimateMemoryAudit() {
  console.log("🔍 === ULTIMATE MEMORY AUDIT REPORT ===");

  // 1. DETAILED MEMORY BREAKDOWN
  const usage = process.memoryUsage();
  const rss_mb = Math.round(usage.rss / 1024 / 1024);
  const heapUsed_mb = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotal_mb = Math.round(usage.heapTotal / 1024 / 1024);
  const external_mb = Math.round(usage.external / 1024 / 1024);

  console.log("📊 MEMORY BREAKDOWN:");
  console.log(`   RSS: ${rss_mb}MB (Resident Set Size - actual RAM used)`);
  console.log(`   Heap Used: ${heapUsed_mb}MB`);
  console.log(`   Heap Total: ${heapTotal_mb}MB`);
  console.log(`   External: ${external_mb}MB (C++ objects, buffers)`);
  console.log(
    `   Heap Usage: ${((usage.heapUsed / usage.heapTotal) * 100).toFixed(2)}%`,
  );

  // 2. PROCESS ANALYSIS
  console.log("\n🔍 PROCESS ANALYSIS:");
  console.log(`   Process PID: ${process.pid}`);
  console.log(`   Node.js Version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Uptime: ${Math.round(process.uptime())}s`);

  // 3. ACTIVE HANDLES & REQUESTS
  if (process._getActiveHandles && process._getActiveRequests) {
    const activeHandles = process._getActiveHandles();
    const activeRequests = process._getActiveRequests();

    console.log("\n🔍 ACTIVE HANDLES & REQUESTS:");
    console.log(`   Active Handles: ${activeHandles.length}`);
    console.log(`   Active Requests: ${activeRequests.length}`);

    // Analyze handle types
    const handleTypes = {};
    activeHandles.forEach((handle) => {
      const type = handle.constructor.name;
      handleTypes[type] = (handleTypes[type] || 0) + 1;
    });

    console.log("   Handle Types:");
    Object.entries(handleTypes).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });
  }

  // 4. GLOBAL OBJECT ANALYSIS
  console.log("\n🔍 GLOBAL OBJECT ANALYSIS:");
  const globalKeys = Object.keys(global);
  console.log(`   Global keys count: ${globalKeys.length}`);

  const suspiciousGlobals = globalKeys.filter(
    (key) =>
      key.includes("cache") ||
      key.includes("pool") ||
      key.includes("manager") ||
      key.includes("Map") ||
      key.includes("Set") ||
      key.startsWith("__"),
  );

  if (suspiciousGlobals.length > 0) {
    console.log("   🚨 SUSPICIOUS GLOBALS:");
    suspiciousGlobals.forEach((key) => {
      try {
        const obj = global[key];
        let info = typeof obj;
        if (Array.isArray(obj)) info = `Array[${obj.length}]`;
        else if (obj instanceof Map) info = `Map(${obj.size})`;
        else if (obj instanceof Set) info = `Set(${obj.size})`;
        console.log(`     ${key}: ${info}`);
      } catch (e) {
        console.log(`     ${key}: <access error>`);
      }
    });
  }

  // 5. REQUIRE CACHE ANALYSIS
  console.log("\n🔍 REQUIRE CACHE ANALYSIS:");
  const requireCacheSize = Object.keys(require.cache).length;
  console.log(`   Require cache size: ${requireCacheSize} modules`);

  // 6. EVENT LISTENERS ANALYSIS
  console.log("\n🔍 EVENT LISTENERS:");
  try {
    const processListeners = process.eventNames();
    console.log(`   Process event listeners: ${processListeners.length}`);
    processListeners.forEach((event) => {
      const count = process.listenerCount(event);
      if (count > 0) {
        console.log(`     ${event}: ${count} listeners`);
      }
    });
  } catch (e) {
    console.log("   Could not analyze process listeners");
  }

  // 7. HEAP SNAPSHOT SUGGESTION
  console.log("\n🔍 HEAP ANALYSIS RECOMMENDATION:");
  console.log("   🚨 CRITICAL: Memory usage 95%+ suggests:");
  console.log("   1. Possible infinite loop creating objects");
  console.log("   2. Large datasets not being garbage collected");
  console.log("   3. External C++ addon memory leak");
  console.log("   4. File descriptors not being closed");
  console.log("   5. Database connections not being released");

  return {
    rss_mb,
    heapUsed_mb,
    heapTotal_mb,
    external_mb,
    heapUsage: (usage.heapUsed / usage.heapTotal) * 100,
    activeHandles: activeHandles?.length || 0,
    activeRequests: activeRequests?.length || 0,
    requireCacheSize,
    suspiciousGlobals,
  };
}

// ===================================================================
// 🚨 EMERGENCY ACTIONS
// ===================================================================

function generateEmergencyActions() {
  console.log("\n🚨 === EMERGENCY ACTION PLAN ===");

  console.log("IMMEDIATE ACTIONS REQUIRED:");
  console.log("1. 🔥 FORCE CONTAINER RESTART");
  console.log("   - Current memory: 95.50% (CRITICAL)");
  console.log("   - Container may be hitting RAM limits");
  console.log("   - Restart will reset ALL memory");

  console.log("\n2. 🔍 RENDER RESOURCE ANALYSIS");
  console.log("   - Check Render plan memory limits");
  console.log("   - Verify if container has sufficient RAM");
  console.log("   - Consider upgrading to higher memory tier");

  console.log("\n3. 🚨 PRODUCTION EMERGENCY FIXES");
  console.log("   - Disable non-essential features temporarily");
  console.log("   - Reduce connection pool sizes");
  console.log("   - Clear all caches on startup");
  console.log("   - Add aggressive memory monitoring");

  console.log("\n4. 🔧 CODE-LEVEL INVESTIGATION");
  console.log("   - Database connection pooling issues");
  console.log("   - Large JSON objects not being GC'd");
  console.log("   - File handles not being closed");
  console.log("   - Infinite loops or recursive functions");

  return [
    "force_container_restart",
    "analyze_render_resources",
    "apply_emergency_production_fixes",
    "investigate_code_level_leaks",
  ];
}

// ===================================================================
// 🔥 CONTAINER RESOURCE FIX
// ===================================================================

function createContainerResourceFix() {
  return `
# RENDER CONTAINER RESOURCE FIX
# Add to render.yaml or environment settings

services:
  - type: web
    name: demohotel19may25
    env: node
    plan: starter_plus  # Upgrade from starter (512MB) to starter_plus (1GB)
    buildCommand: npm run build:production
    startCommand: node --max-old-space-size=768 apps/server/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_OPTIONS
        value: "--max-old-space-size=768 --gc-interval=100"
      - key: MEMORY_OPTIMIZATION
        value: "aggressive"
        
# Key changes:
# 1. Upgrade to starter_plus (1GB RAM vs 512MB)
# 2. Set Node.js heap limit to 768MB (leave 256MB for system)
# 3. Force aggressive GC every 100ms
# 4. Enable memory optimization mode
`;
}

// ===================================================================
// 🚨 EXECUTION
// ===================================================================

// Run the audit
const auditResults = performUltimateMemoryAudit();
const emergencyActions = generateEmergencyActions();
const containerFix = createContainerResourceFix();

console.log("\n✅ === AUDIT COMPLETE ===");
console.log("📊 Memory Status: CRITICAL (95.50%)");
console.log("🚨 Recommended: IMMEDIATE CONTAINER RESTART + RESOURCE UPGRADE");
console.log("🔍 Detailed analysis completed - see logs above");

// Export results for further analysis
module.exports = {
  auditResults,
  emergencyActions,
  containerFix,
  summary: {
    status: "CRITICAL",
    memoryUsage: "95.50%",
    recommendation: "IMMEDIATE_RESTART_AND_UPGRADE",
    suspectedCause: "CONTAINER_MEMORY_LIMIT_OR_DEEP_LEAK",
  },
};
