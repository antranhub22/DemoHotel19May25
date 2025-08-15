#!/usr/bin/env node

/**
 * 🔧 FIX SYNTAX ERRORS FROM AUTOMATED TIMER SCRIPT
 * Removes extra commas and malformed timer names
 */

const fs = require('fs');
const path = require('path');

const APPS_SERVER_DIR = path.join(__dirname, '..', 'apps', 'server');

let stats = {
  filesProcessed: 0,
  filesFixed: 0,
  errorsFixed: 0
};

function log(message) {
  console.log(`🔧 ${message}`);
}

function fixSyntaxErrors(content) {
  let modified = false;
  
  // Fix: Remove double commas and malformed timer names
  // Pattern: (..., , "auto-generated-...")
  content = content.replace(/,\s*,\s*"auto-generated-[^"]*"\)/g, ')');
  if (content.match(/,\s*,\s*"auto-generated-[^"]*"\)/)) {
    modified = true;
    stats.errorsFixed++;
  }
  
  // Fix: Remove standalone timer names that got appended incorrectly
  // Pattern: something); , "auto-generated-..."
  content = content.replace(/\)\s*;\s*,\s*"auto-generated-[^"]*"/g, ')');
  if (content.match(/\)\s*;\s*,\s*"auto-generated-[^"]*"/)) {
    modified = true;
    stats.errorsFixed++;
  }
  
  // Fix: Remove trailing commas before timer names in function calls
  // Pattern: something,, "auto-generated-..."
  content = content.replace(/,\s*,\s*"auto-generated-[^"]*"/g, ', "auto-generated-timer"');
  if (content.match(/,\s*,\s*"auto-generated-[^"]*"/)) {
    modified = true;
    stats.errorsFixed++;
  }
  
  // Fix specific malformed lines
  content = content.replace(/>=\s*\d+\s*\*\s*\d+\s*\*\s*\d+,\s*,\s*"auto-generated-[^"]*"\)/g, '>= 10 * 60 * 1000)');
  if (content.match(/>=\s*\d+\s*\*\s*\d+\s*\*\s*\d+,\s*,\s*"auto-generated-[^"]*"\)/)) {
    modified = true;
    stats.errorsFixed++;
  }
  
  return { content, modified };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    stats.filesProcessed++;
    
    const { content: newContent, modified } = fixSyntaxErrors(content);
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      stats.filesFixed++;
      log(`Fixed: ${path.relative(APPS_SERVER_DIR, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

function main() {
  log('Starting syntax error fix...');
  log(`Target directory: ${APPS_SERVER_DIR}`);
  
  walkDirectory(APPS_SERVER_DIR);
  
  log('\n📊 SYNTAX FIX STATISTICS:');
  log(`Files processed: ${stats.filesProcessed}`);
  log(`Files fixed: ${stats.filesFixed}`);
  log(`Syntax errors fixed: ${stats.errorsFixed}`);
  
  if (stats.filesFixed > 0) {
    log('\n✅ Syntax errors fixed successfully!');
  } else {
    log('\n✅ No syntax errors found!');
  }
}

if (require.main === module) {
  main();
}
