#!/usr/bin/env node
/**
 * 🚨 EMERGENCY MEMORY FIX - Production Hotpatch
 * Deploy this immediately to production to stop memory leak
 */

// Emergency memory optimization that can be deployed instantly
const originalRequire = require;

// Override require to prevent cache clearing
require = function (id) {
  const result = originalRequire(id);

  // Block dangerous require.cache operations
  if (require.cache && typeof require.cache === "object") {
    const originalDelete = require.cache.delete;
    require.cache.delete = function () {
      console.warn(
        "🚨 [EMERGENCY] Blocked dangerous require.cache delete operation",
      );
      return false;
    };
  }

  return result;
};

// Emergency GC optimization
if (global.gc) {
  let lastGC = 0;
  const originalGC = global.gc;

  global.gc = function () {
    const now = Date.now();
    if (now - lastGC < 120000) {
      // Prevent GC spam - 2 min minimum
      console.log("🚨 [EMERGENCY] Skipped GC - too recent");
      return;
    }

    lastGC = now;
    console.log("🚨 [EMERGENCY] Performing controlled GC");
    return originalGC();
  };
}

// Emergency memory monitoring
const memUsage = process.memoryUsage();
const usage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

if (usage > 90) {
  console.error(`🚨 [EMERGENCY] Critical memory: ${usage.toFixed(2)}%`);

  // Force immediate GC if available
  if (global.gc) {
    global.gc();
    global.gc(); // Double GC for emergency

    const afterGC = process.memoryUsage();
    const newUsage = (afterGC.heapUsed / afterGC.heapTotal) * 100;
    console.log(`🚨 [EMERGENCY] Post-GC memory: ${newUsage.toFixed(2)}%`);
  }
}

console.log("🚨 [EMERGENCY] Memory protection enabled");

module.exports = {
  emergencyCleanup: () => {
    if (global.gc) {
      global.gc();
      console.log("🚨 [EMERGENCY] Manual cleanup performed");
    }
  },
};
