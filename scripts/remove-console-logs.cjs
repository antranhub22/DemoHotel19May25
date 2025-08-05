#!/usr/bin/env node

/**
 * Remove Console Logs Script
 * 
 * Automatically removes console.log statements from production code
 * while preserving essential error logging and debug infrastructure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 [Console Cleanup] Starting console.log removal...');

// Configuration
const TARGET_DIRS = [
    'apps/client/src',
    'apps/server',
    'packages'
];

const PRESERVE_PATTERNS = [
    // Keep critical error logging
    'console.error',
    'console.warn',
    // Keep development-only logging
    'NODE_ENV === "development"',
    'import.meta.env.DEV',
    // Keep specific debug utilities
    'vapiDebug',
    'debugLogger'
];

// Patterns to remove
const REMOVE_PATTERNS = [
    // Standard console.log calls
    /^\s*console\.log\([^;]*\);?\s*$/gm,
    // Console.log with debug prefixes
    /^\s*console\.log\(['"`]🔍.*?\);?\s*$/gm,
    /^\s*console\.log\(['"`]📊.*?\);?\s*$/gm,
    /^\s*console\.log\(['"`]🎯.*?\);?\s*$/gm,
    /^\s*console\.log\(['"`]✅.*?\);?\s*$/gm,
    /^\s*console\.log\(['"`]🔄.*?\);?\s*$/gm,
    // Multi-line console.log calls
    /console\.log\(\s*['"`][^'"`]*['"`],?\s*\{[^}]*\}\s*\);?/gm,
];

let totalFilesProcessed = 0;
let totalLogsRemoved = 0;
let filesModified = [];

function shouldPreserveFile(filePath) {
    const preserveFiles = [
        'debug',
        'test',
        'spec',
        '.test.',
        '.spec.',
        'troubleshooting',
        'development'
    ];

    return preserveFiles.some(pattern => filePath.includes(pattern));
}

function shouldPreserveLine(line) {
    return PRESERVE_PATTERNS.some(pattern => line.includes(pattern));
}

function processFile(filePath) {
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        return;
    }

    if (shouldPreserveFile(filePath)) {
        console.log(`⏭️  [Console Cleanup] Skipping debug file: ${filePath}`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modifiedContent = content;
        let removedCount = 0;

        // Split into lines for more precise control
        const lines = content.split('\n');
        const processedLines = lines.map(line => {
            // Skip lines we want to preserve
            if (shouldPreserveLine(line)) {
                return line;
            }

            // Check if line contains console.log
            if (line.includes('console.log')) {
                // Don't remove if it's in a comment already
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                    return line;
                }

                // Remove the console.log line
                removedCount++;
                return ''; // Remove the line entirely
            }

            return line;
        });

        // Remove empty lines that were left by console.log removal
        const cleanedLines = processedLines.filter((line, index) => {
            if (line === '' && processedLines[index - 1] === '') {
                return false; // Remove consecutive empty lines
            }
            return true;
        });

        modifiedContent = cleanedLines.join('\n');

        if (removedCount > 0) {
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            totalLogsRemoved += removedCount;
            filesModified.push({
                file: filePath,
                removed: removedCount
            });
            console.log(`✅ [Console Cleanup] ${filePath}: removed ${removedCount} console.log statements`);
        }

        totalFilesProcessed++;

    } catch (error) {
        console.error(`❌ [Console Cleanup] Error processing ${filePath}:`, error.message);
    }
}

function walkDirectory(dir) {
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules and build directories
                if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
                    walkDirectory(filePath);
                }
            } else {
                processFile(filePath);
            }
        }
    } catch (error) {
        console.error(`❌ [Console Cleanup] Error walking directory ${dir}:`, error.message);
    }
}

// Main execution
try {
    console.log('📂 [Console Cleanup] Processing directories:', TARGET_DIRS);

    for (const dir of TARGET_DIRS) {
        if (fs.existsSync(dir)) {
            console.log(`\n🔍 [Console Cleanup] Processing ${dir}...`);
            walkDirectory(dir);
        } else {
            console.log(`⚠️  [Console Cleanup] Directory not found: ${dir}`);
        }
    }

    // Summary
    console.log('\n📊 [Console Cleanup] Summary:');
    console.log(`  ✅ Files processed: ${totalFilesProcessed}`);
    console.log(`  ✅ Console.log statements removed: ${totalLogsRemoved}`);
    console.log(`  ✅ Files modified: ${filesModified.length}`);

    if (filesModified.length > 0) {
        console.log('\n📝 [Console Cleanup] Modified files:');
        filesModified.forEach(({ file, removed }) => {
            console.log(`    ${file}: ${removed} logs removed`);
        });
    }

    // Run prettier to fix formatting
    if (filesModified.length > 0) {
        console.log('\n🎨 [Console Cleanup] Running prettier to fix formatting...');
        try {
            execSync('npx prettier --write apps/ packages/', { stdio: 'inherit' });
            console.log('✅ [Console Cleanup] Formatting completed');
        } catch (error) {
            console.log('⚠️  [Console Cleanup] Prettier not available, skipping formatting');
        }
    }

    console.log('\n🎉 [Console Cleanup] Console.log cleanup completed successfully!');

} catch (error) {
    console.error('❌ [Console Cleanup] Script failed:', error.message);
    process.exit(1);
}