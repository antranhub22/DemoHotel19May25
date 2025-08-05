#!/usr/bin/env node

/**
 * Archive Cleanup Script
 * 
 * Safely removes outdated archive folders and commented code
 * while preserving important reference materials
 */

const fs = require('fs');
const path = require('path');

console.log('🗂️ [Archive Cleanup] Starting archive cleanup...');

// Archive directories to analyze
const ARCHIVE_DIRS = [
    'apps/client/src/components/_archive',
    'archive/backups',
    'archive/consolidated',
    'archive/reports/old-reports'
];

// Files to preserve (important references)
const PRESERVE_PATTERNS = [
    'README.md',
    'MIGRATION_SUMMARY.md',
    'INDEX.md',
    'FINAL_REPORT',
    'COMPLETION'
];

let totalFilesScanned = 0;
let totalFilesRemoved = 0;
let totalDirectoriesRemoved = 0;
let preservedFiles = [];

function shouldPreserveFile(filePath) {
    const fileName = path.basename(filePath);

    // Preserve important documentation
    if (PRESERVE_PATTERNS.some(pattern => fileName.includes(pattern))) {
        return true;
    }

    // Preserve recent files (less than 30 days old) 
    try {
        const stats = fs.statSync(filePath);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (stats.mtime > thirtyDaysAgo) {
            return true;
        }
    } catch (error) {
        // If we can't read stats, preserve to be safe
        return true;
    }

    return false;
}

function isArchiveDirectory(dirPath) {
    const dirName = path.basename(dirPath).toLowerCase();
    return dirName.includes('archive') ||
        dirName.includes('backup') ||
        dirName.includes('old') ||
        dirName.includes('deprecated') ||
        dirName.startsWith('_');
}

function cleanupDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`⏭️  [Archive Cleanup] Directory not found: ${dir}`);
        return;
    }

    try {
        console.log(`🔍 [Archive Cleanup] Scanning ${dir}...`);

        const items = fs.readdirSync(dir);
        let emptyAfterCleanup = true;

        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                // Recursively clean subdirectories
                cleanupDirectory(itemPath);

                // Check if directory is empty after cleanup
                try {
                    const subItems = fs.readdirSync(itemPath);
                    if (subItems.length === 0) {
                        fs.rmdirSync(itemPath);
                        totalDirectoriesRemoved++;
                        console.log(`🗑️  [Archive Cleanup] Removed empty directory: ${itemPath}`);
                    } else {
                        emptyAfterCleanup = false;
                    }
                } catch (error) {
                    emptyAfterCleanup = false;
                }
            } else {
                totalFilesScanned++;

                if (shouldPreserveFile(itemPath)) {
                    preservedFiles.push(itemPath);
                    emptyAfterCleanup = false;
                    console.log(`💾 [Archive Cleanup] Preserved: ${itemPath}`);
                } else {
                    try {
                        fs.unlinkSync(itemPath);
                        totalFilesRemoved++;
                        console.log(`🗑️  [Archive Cleanup] Removed: ${itemPath}`);
                    } catch (error) {
                        console.error(`❌ [Archive Cleanup] Failed to remove ${itemPath}:`, error.message);
                        emptyAfterCleanup = false;
                    }
                }
            }
        }

        // Don't remove the main archive directories, only their contents
        if (emptyAfterCleanup && !ARCHIVE_DIRS.includes(dir)) {
            try {
                fs.rmdirSync(dir);
                totalDirectoriesRemoved++;
                console.log(`🗑️  [Archive Cleanup] Removed empty directory: ${dir}`);
            } catch (error) {
                console.error(`❌ [Archive Cleanup] Failed to remove directory ${dir}:`, error.message);
            }
        }

    } catch (error) {
        console.error(`❌ [Archive Cleanup] Error cleaning ${dir}:`, error.message);
    }
}

function removeCommentedCode() {
    console.log('\n🧹 [Archive Cleanup] Removing commented code blocks...');

    const codeFiles = [];

    function findCodeFiles(dir) {
        if (!fs.existsSync(dir)) return;

        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    if (!item.includes('node_modules') && !item.includes('.git')) {
                        findCodeFiles(itemPath);
                    }
                } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
                    codeFiles.push(itemPath);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    // Find code files in main directories
    ['apps/client/src', 'apps/server', 'packages'].forEach(dir => {
        findCodeFiles(dir);
    });

    let commentedCodeRemoved = 0;

    codeFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            // Remove large blocks of commented code (5+ consecutive comment lines)
            let inCommentBlock = false;
            let commentBlockLength = 0;
            const cleanedLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line.startsWith('//') && !line.includes('TODO') && !line.includes('FIXME')) {
                    if (!inCommentBlock) {
                        inCommentBlock = true;
                        commentBlockLength = 1;
                    } else {
                        commentBlockLength++;
                    }
                } else {
                    if (inCommentBlock && commentBlockLength >= 5) {
                        // Skip the commented block (don't add previous lines)
                        commentedCodeRemoved += commentBlockLength;
                    } else if (inCommentBlock) {
                        // Add the short comment block back
                        for (let j = i - commentBlockLength; j < i; j++) {
                            cleanedLines.push(lines[j]);
                        }
                    }

                    cleanedLines.push(lines[i]);
                    inCommentBlock = false;
                    commentBlockLength = 0;
                }
            }

            if (cleanedLines.length < lines.length) {
                fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
                console.log(`🧹 [Archive Cleanup] Cleaned commented code: ${filePath}`);
            }

        } catch (error) {
            // Skip files we can't process
        }
    });

    console.log(`✅ [Archive Cleanup] Removed ${commentedCodeRemoved} lines of commented code`);
}

// Main execution
try {
    console.log('📂 [Archive Cleanup] Target directories:', ARCHIVE_DIRS);

    // Clean up archive directories
    for (const dir of ARCHIVE_DIRS) {
        cleanupDirectory(dir);
    }

    // Remove large blocks of commented code
    removeCommentedCode();

    // Summary
    console.log('\n📊 [Archive Cleanup] Summary:');
    console.log(`  ✅ Files scanned: ${totalFilesScanned}`);
    console.log(`  ✅ Files removed: ${totalFilesRemoved}`);
    console.log(`  ✅ Directories removed: ${totalDirectoriesRemoved}`);
    console.log(`  ✅ Files preserved: ${preservedFiles.length}`);

    if (preservedFiles.length > 0) {
        console.log('\n💾 [Archive Cleanup] Preserved important files:');
        preservedFiles.slice(0, 10).forEach(file => {
            console.log(`    ${file}`);
        });
        if (preservedFiles.length > 10) {
            console.log(`    ... and ${preservedFiles.length - 10} more`);
        }
    }

    console.log('\n🎉 [Archive Cleanup] Archive cleanup completed successfully!');
    console.log('\n💡 [Archive Cleanup] Benefits:');
    console.log('  ✅ Reduced repository size');
    console.log('  ✅ Improved navigation and search');
    console.log('  ✅ Cleaner codebase structure');
    console.log('  ✅ Preserved important documentation');

} catch (error) {
    console.error('❌ [Archive Cleanup] Script failed:', error.message);
    process.exit(1);
}