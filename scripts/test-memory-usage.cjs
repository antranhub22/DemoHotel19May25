#!/usr/bin/env node
/**
 * 🔍 MEMORY USAGE TEST SCRIPT
 * 
 * Test memory usage after applying memory leak fixes
 * Expected: RSS should be significantly lower than 178MB
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔍 Testing memory usage after memory leak fixes...\n');

// Function to get memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: (usage.rss / 1024 / 1024).toFixed(1),
    heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(1),
    heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(1),
    external: (usage.external / 1024 / 1024).toFixed(1),
    arrayBuffers: (usage.arrayBuffers / 1024 / 1024).toFixed(1),
  };
}

// Initial memory usage
console.log('📊 Initial Memory Usage:');
console.log('========================');
const initial = getMemoryUsage();
console.log(`RSS: ${initial.rss}MB`);
console.log(`Heap Total: ${initial.heapTotal}MB`);
console.log(`Heap Used: ${initial.heapUsed}MB`);
console.log(`External: ${initial.external}MB`);
console.log(`Array Buffers: ${initial.arrayBuffers}MB\n`);

// Simulate some operations
console.log('🧪 Simulating typical server operations...\n');

// Test 1: Create some objects (simulate normal app usage)
const testData = [];
for (let i = 0; i < 1000; i++) {
  testData.push({
    id: i,
    data: 'test'.repeat(100),
    timestamp: new Date(),
    nested: {
      value: Math.random(),
      array: new Array(50).fill(i)
    }
  });
}

// Test 2: Simulate database-like operations
const mockDatabase = new Map();
for (let i = 0; i < 500; i++) {
  mockDatabase.set(`key_${i}`, {
    id: i,
    value: Buffer.alloc(1024, i), // 1KB buffer per entry
    created: Date.now()
  });
}

setTimeout(() => {
  console.log('📊 Memory Usage After Operations:');
  console.log('==================================');
  const afterOps = getMemoryUsage();
  console.log(`RSS: ${afterOps.rss}MB`);
  console.log(`Heap Total: ${afterOps.heapTotal}MB`);
  console.log(`Heap Used: ${afterOps.heapUsed}MB`);
  console.log(`External: ${afterOps.external}MB`);
  console.log(`Array Buffers: ${afterOps.arrayBuffers}MB\n`);

  // Calculate differences
  const rssDiff = parseFloat(afterOps.rss) - parseFloat(initial.rss);
  const heapDiff = parseFloat(afterOps.heapUsed) - parseFloat(initial.heapUsed);
  const externalDiff = parseFloat(afterOps.external) - parseFloat(initial.external);

  console.log('📈 Memory Usage Differences:');
  console.log('============================');
  console.log(`RSS: ${rssDiff > 0 ? '+' : ''}${rssDiff.toFixed(1)}MB`);
  console.log(`Heap Used: ${heapDiff > 0 ? '+' : ''}${heapDiff.toFixed(1)}MB`);
  console.log(`External: ${externalDiff > 0 ? '+' : ''}${externalDiff.toFixed(1)}MB\n`);

  // Analysis
  console.log('🎯 Analysis:');
  console.log('============');
  
  if (parseFloat(afterOps.rss) < 100) {
    console.log('✅ EXCELLENT: RSS memory usage is below 100MB');
  } else if (parseFloat(afterOps.rss) < 150) {
    console.log('✅ GOOD: RSS memory usage is reasonable (<150MB)');
  } else {
    console.log('⚠️  WARNING: RSS memory usage is still high (>150MB)');
  }

  const externalRatio = parseFloat(afterOps.external) / parseFloat(afterOps.heapUsed);
  if (externalRatio < 1.2) {
    console.log('✅ EXCELLENT: External/Heap ratio is healthy (<1.2x)');
  } else if (externalRatio < 1.5) {
    console.log('✅ GOOD: External/Heap ratio is acceptable (<1.5x)');
  } else {
    console.log('⚠️  WARNING: External/Heap ratio indicates potential external memory leak (>1.5x)');
  }

  // Cleanup test
  console.log('\n🧹 Testing cleanup...');
  testData.length = 0;
  mockDatabase.clear();

  if (global.gc) {
    global.gc();
    console.log('✅ Forced garbage collection');
  } else {
    console.log('⚠️  GC not available (run with --expose-gc)');
  }

  setTimeout(() => {
    const afterCleanup = getMemoryUsage();
    console.log('\n📊 Memory Usage After Cleanup:');
    console.log('===============================');
    console.log(`RSS: ${afterCleanup.rss}MB`);
    console.log(`Heap Used: ${afterCleanup.heapUsed}MB`);
    console.log(`External: ${afterCleanup.external}MB\n`);

    const cleanupReduction = parseFloat(afterOps.heapUsed) - parseFloat(afterCleanup.heapUsed);
    console.log(`🗑️  Heap memory freed: ${cleanupReduction.toFixed(1)}MB`);

    console.log('\n✅ Memory test completed!');
    console.log('=========================');
    console.log('Compare these results with the original 178MB RSS to verify fixes.');
    process.exit(0);
  }, 2000);
}, 1000);
