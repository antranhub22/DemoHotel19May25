#!/usr/bin/env node

/**
 * 🔧 AUTOMATED TIMER LEAK FIX SCRIPT
 * Replaces all native setInterval/setTimeout with TimerManager across entire codebase
 */

const fs = require("fs");
const path = require("path");

const APPS_SERVER_DIR = path.join(__dirname, "..", "apps", "server");

// Files to skip (already fixed or don't need TimerManager)
const SKIP_FILES = [
  "TimerManager.ts",
  "index.ts", // Special handling needed
  "socket.ts", // Already fixed
  "RealTimeExternalMemoryMonitor.ts", // Already fixed
  "UltimateMemoryCleanup.ts", // Already fixed
  "MemoryAnalysisDashboard.ts", // Already fixed
  "ProcessMemoryAnalyzer.ts", // Already fixed
  "DashboardWebSocket.ts", // Already fixed
  "ConnectionPoolManager.ts", // Already fixed
];

// Track statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  setIntervalFixed: 0,
  setTimeoutFixed: 0,
  importsAdded: 0,
};

function log(message) {
  console.log(`🔧 ${message}`);
}

function shouldSkipFile(filePath) {
  const fileName = path.basename(filePath);
  return SKIP_FILES.some((skip) => fileName.includes(skip));
}

function hasTimerManager(content) {
  return (
    content.includes("TimerManager") ||
    content.includes('from "@server/utils/TimerManager"') ||
    content.includes('from "./utils/TimerManager"') ||
    content.includes('require("../utils/TimerManager")')
  );
}

function hasNativeTimers(content) {
  return (
    /(?<!TimerManager\.)setInterval\s*\(/.test(content) ||
    /(?<!TimerManager\.)setTimeout\s*\(/.test(content)
  );
}

function addTimerManagerImport(content, filePath) {
  // Determine correct import path based on file location
  const relativePath = path.relative(APPS_SERVER_DIR, filePath);
  const depth = relativePath.split(path.sep).length - 1;
  const importPath = "../".repeat(depth) + "utils/TimerManager";

  // Add import after existing imports
  const importLines = content.match(/^import .* from .*$/gm) || [];
  if (importLines.length > 0) {
    const lastImport = importLines[importLines.length - 1];
    const lastImportIndex = content.indexOf(lastImport) + lastImport.length;

    const newImport = `\nimport { TimerManager } from "${importPath}";`;
    content =
      content.slice(0, lastImportIndex) +
      newImport +
      content.slice(lastImportIndex);
    stats.importsAdded++;
  } else {
    // No imports found, add at top
    content = `import { TimerManager } from "${importPath}";\n` + content;
    stats.importsAdded++;
  }

  return content;
}

function replaceTimers(content) {
  let modified = false;

  // Replace setInterval with TimerManager.setInterval
  const setIntervalRegex =
    /(?<!TimerManager\.)setInterval\s*\(\s*([^,]+),\s*([^,)]+)(?:,([^)]*))?\)/g;
  content = content.replace(
    setIntervalRegex,
    (_match, callback, delay, name) => {
      modified = true;
      stats.setIntervalFixed++;

      // Generate a name if not provided
      const timerName = name
        ? name.trim()
        : `"auto-generated-interval-${stats.setIntervalFixed}"`;

      return `TimerManager.setInterval(${callback.trim()}, ${delay.trim()}, ${timerName})`;
    },
  );

  // Replace setTimeout with TimerManager.setTimeout (but skip Promise.resolve cases)
  const setTimeoutRegex =
    /(?<!Promise\(.*resolve.*\))(?<!TimerManager\.)setTimeout\s*\(\s*([^,]+),\s*([^,)]+)(?:,([^)]*))?\)/g;
  content = content.replace(setTimeoutRegex, (match, callback, delay, name) => {
    // Skip if this is inside a Promise constructor
    if (match.includes("resolve") || callback.includes("resolve")) {
      return match;
    }

    modified = true;
    stats.setTimeoutFixed++;

    // Generate a name if not provided
    const timerName = name
      ? name.trim()
      : `"auto-generated-timeout-${stats.setTimeoutFixed}"`;

    return `TimerManager.setTimeout(${callback.trim()}, ${delay.trim()}, ${timerName})`;
  });

  return { content, modified };
}

function processFile(filePath) {
  try {
    if (shouldSkipFile(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    stats.filesProcessed++;

    // Skip if no native timers found
    if (!hasNativeTimers(content)) {
      return;
    }

    let newContent = content;

    // Add TimerManager import if not present
    if (!hasTimerManager(newContent)) {
      newContent = addTimerManagerImport(newContent, filePath);
    }

    // Replace timers
    const { content: finalContent, modified } = replaceTimers(newContent);

    if (modified) {
      fs.writeFileSync(filePath, finalContent, "utf8");
      stats.filesModified++;
      log(`Modified: ${path.relative(APPS_SERVER_DIR, filePath)}`);
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
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      processFile(filePath);
    }
  }
}

function main() {
  log("Starting automated timer leak fix...");
  log(`Target directory: ${APPS_SERVER_DIR}`);

  walkDirectory(APPS_SERVER_DIR);

  log("\n📊 TIMER FIX STATISTICS:");
  log(`Files processed: ${stats.filesProcessed}`);
  log(`Files modified: ${stats.filesModified}`);
  log(`setInterval instances fixed: ${stats.setIntervalFixed}`);
  log(`setTimeout instances fixed: ${stats.setTimeoutFixed}`);
  log(`TimerManager imports added: ${stats.importsAdded}`);

  if (stats.filesModified > 0) {
    log("\n✅ Timer leak fixes applied successfully!");
    log("🔄 Please restart the server to apply changes.");
  } else {
    log("\n✅ No timer leaks found - all good!");
  }
}

if (require.main === module) {
  main();
}
