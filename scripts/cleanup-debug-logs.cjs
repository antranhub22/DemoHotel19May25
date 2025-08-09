#!/usr/bin/env node
/**
 * 🧹 Safe Debug Log Cleanup
 * Removes excessive debug logs while keeping important ones
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 Starting Debug Log Cleanup...\n');

const DIRECTORIES_TO_CLEAN = [
  'apps/client/src',
  'apps/server',
  'packages'
];

// Patterns to remove (safe to delete)
const DEBUG_PATTERNS_TO_REMOVE = [
  /console\.log\(['"]🔍 \[DEBUG\].*?\);?/g,
  /console\.log\(['"]📋 \[DEBUG\].*?\);?/g,
  /console\.log\(['"]🔧 \[DEBUG\].*?\);?/g,
  /\/\/ DEBUG:.*$/gm,
  /\/\/ Debug log$/gm
];

// Patterns to keep (important for monitoring)
const KEEP_PATTERNS = [
  'logger.debug',
  'logger.error', 
  'logger.warn',
  'console.error',
  'debugAuth' // Keep authentication debugging
];

let totalFilesProcessed = 0;
let totalLogsRemoved = 0;

function shouldKeepLog(line) {
  return KEEP_PATTERNS.some(pattern => line.includes(pattern));
}

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let removedCount = 0;
    
    // Remove debug patterns
    DEBUG_PATTERNS_TO_REMOVE.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!shouldKeepLog(match)) {
            newContent = newContent.replace(match, '');
            removedCount++;
          }
        });
      }
    });
    
    // Clean up empty lines (max 2 consecutive)
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (removedCount > 0) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: Removed ${removedCount} debug logs`);
      totalLogsRemoved += removedCount;
    }
    
    totalFilesProcessed++;
    
  } catch (error) {
    console.warn(`⚠️  Could not process ${filePath}:`, error.message);
  }
}

// Process all TypeScript and JavaScript files
DIRECTORIES_TO_CLEAN.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory ${dir} not found, skipping...`);
    return;
  }
  
  const pattern = path.join(dir, '**/*.{ts,tsx,js,jsx}');
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts'
    ]
  });
  
  console.log(`📂 Processing ${files.length} files in ${dir}...`);
  files.forEach(cleanFile);
});

console.log(`\n🎉 Cleanup Complete!`);
console.log(`📊 Processed ${totalFilesProcessed} files`);
console.log(`🧹 Removed ${totalLogsRemoved} debug logs`);
console.log(`💡 Kept important logger calls and error handling`);

if (totalLogsRemoved > 0) {
  console.log(`\n✨ Your code is now cleaner and more production-ready!`);
}