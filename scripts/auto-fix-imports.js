#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

console.log('🔧 Auto-fixing all import/export TypeScript errors...');

// Get current TypeScript errors to analyze
function getCurrentErrors() {
    try {
        const result = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
        return result.split('\n').filter(line => line.includes('error TS'));
    } catch (error) {
        return error.stdout ? error.stdout.split('\n').filter(line => line.includes('error TS')) : [];
    }
}

// Extract TS2307 errors (Cannot find module)
function getModuleErrors(errors) {
    return errors.filter(error => error.includes('error TS2307'))
        .map(error => {
            const match = error.match(/(.+?):\d+:\d+.*Cannot find module ['"](.+?)['"]/) ||
                error.match(/(.+?)\(\d+,\d+\).*Cannot find module ['"](.+?)['"]/);;
            if (match) {
                return {
                    file: match[1].trim(),
                    module: match[2],
                    line: error
                };
            }
            return null;
        }).filter(Boolean);
}

// Extract TS2305 errors (Module has no exported member)
function getExportErrors(errors) {
    return errors.filter(error => error.includes('error TS2305'))
        .map(error => {
            const match = error.match(/(.+?):\d+:\d+.*has no exported member ['"](.+?)['"]/) ||
                error.match(/(.+?)\(\d+,\d+\).*has no exported member ['"](.+?)['"]/);;
            if (match) {
                return {
                    file: match[1].trim(),
                    member: match[2],
                    line: error
                };
            }
            return null;
        }).filter(Boolean);
}

// Fix common import path issues
async function fixImportPaths() {
    console.log('📁 1. Fixing import paths...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            // Common path fixes
            const pathFixes = [
                // Shared imports
                [/from ['"]@shared\/db\/schema['"]/, "from '@shared/schema'"],
                [/from ['"]@shared\/db\/connectionManager['"]/, "from '@shared/db/PrismaConnectionManager'"],
                [/from ['"]\.\.\/\.\.\/packages\/shared\/db['"]/, "from '@shared/db'"],

                // Type imports
                [/from ['"]@shared\/types\/core['"]/, "from '@shared/types'"],
                [/from ['"]@shared\/types\/index['"]/, "from '@shared/types'"],

                // Utils imports
                [/from ['"]@shared\/utils\/logger['"]/, "from '@shared/utils/logger'"],
                [/from ['"]@shared\/utils\/permissions['"]/, "from '@shared/utils/permissions'"],

                // Relative path corrections
                [/from ['"]\.\.\/(.*?)\/index['"]/, "from '../$1'"],
                [/from ['"]\.\/index['"]/, "from './'"]
            ];

            pathFixes.forEach(([pattern, replacement]) => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, replacement);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Fixed import paths in ${fixedCount} files`);
}

// Fix missing file extensions
async function fixFileExtensions() {
    console.log('📄 2. Adding missing file extensions...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            // Add .ts/.tsx extensions for relative imports
            const relativeImportRegex = /from ['"](\.\/.+?)['"](?!\.(ts|tsx|js|jsx))/g;
            content = content.replace(relativeImportRegex, (match, importPath) => {
                const fullPath = path.resolve(path.dirname(filePath), importPath);

                // Check if file exists with .ts or .tsx extension
                if (fs.existsSync(fullPath + '.ts')) {
                    hasChanges = true;
                    return `from '${importPath}.ts'`;
                } else if (fs.existsSync(fullPath + '.tsx')) {
                    hasChanges = true;
                    return `from '${importPath}.tsx'`;
                }
                return match;
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Added file extensions in ${fixedCount} files`);
}

// Fix named/default import mismatches
async function fixNamedImports() {
    console.log('🔀 3. Fixing named/default import mismatches...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    const importFixes = [
        // Common named import fixes
        [/import { logger } from/, "import logger from"],
        [/import { PrismaClient } from/, "import { PrismaClient } from"],
        [/import { prisma } from/, "import prisma from"],

        // JWT decode fix
        [/import { jwtDecode } from ['"]jwt-decode['"]/, "import jwtDecode from 'jwt-decode'"],

        // React imports
        [/import React, \{ (.*?) \} from ['"]react['"]/, "import * as React from 'react'\nimport { $1 } from 'react'"],
    ];

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            importFixes.forEach(([pattern, replacement]) => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, replacement);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Fixed named imports in ${fixedCount} files`);
}

// Remove imports for deleted/moved files
async function removeDeadImports() {
    console.log('🗑️ 4. Removing imports for deleted/moved files...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    const deadImportPatterns = [
        // Remove Drizzle imports
        /import.*from ['"][^'"]*drizzle[^'"]*['"];?\s*\n?/gi,
        /import.*from ['"]drizzle-orm[^'"]*['"];?\s*\n?/gi,

        // Remove imports from non-existent shared modules
        /import.*from ['"]@shared\/db\/schema['"];?\s*\n?/gi,
        /import.*from ['"]@shared\/db\/connectionManager['"];?\s*\n?/gi,

        // Remove duplicate imports
        /^import.*from ['"]react['"];?\s*\n(?=.*^import.*from ['"]react['"])/gmi,
    ];

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            deadImportPatterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, '');
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Removed dead imports from ${fixedCount} files`);
}

// Add missing imports based on usage
async function addMissingImports() {
    console.log('➕ 5. Adding missing imports...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    const missingImports = [
        // Common missing imports
        {
            usage: /\blogger\./,
            import: "import { logger } from '@shared/utils/logger';",
            check: /import.*logger.*from/
        },
        {
            usage: /\bUserRole\b/,
            import: "import type { UserRole } from '@shared/types';",
            check: /import.*UserRole.*from/
        },
        {
            usage: /\bPermission\b/,
            import: "import type { Permission } from '@shared/types';",
            check: /import.*Permission.*from/
        },
        {
            usage: /\bLanguage\b/,
            import: "import type { Language } from '@shared/types';",
            check: /import.*Language.*from/
        }
    ];

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            missingImports.forEach(({ usage, import: importStatement, check }) => {
                if (usage.test(content) && !check.test(content)) {
                    // Add import at the top after existing imports
                    const lines = content.split('\n');
                    const lastImportIndex = lines.findIndex((line, index) =>
                        line.startsWith('import') &&
                        (index === lines.length - 1 || !lines[index + 1].startsWith('import'))
                    );

                    if (lastImportIndex >= 0) {
                        lines.splice(lastImportIndex + 1, 0, importStatement);
                        content = lines.join('\n');
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Added missing imports to ${fixedCount} files`);
}

// Main execution
async function main() {
    const startTime = Date.now();
    console.log('🚀 Starting comprehensive import/export fix...\n');

    // Get initial error count
    const initialErrors = getCurrentErrors();
    const initialCount = initialErrors.length;
    console.log(`📊 Initial TypeScript errors: ${initialCount}\n`);

    // Run all fixes
    await fixImportPaths();
    await fixFileExtensions();
    await fixNamedImports();
    await removeDeadImports();
    await addMissingImports();

    // Get final error count
    console.log('\n🔍 Checking results...');
    const finalErrors = getCurrentErrors();
    const finalCount = finalErrors.length;
    const improvement = initialCount - finalCount;

    console.log('\n📊 RESULTS:');
    console.log(`Initial errors: ${initialCount}`);
    console.log(`Final errors: ${finalCount}`);
    console.log(`Fixed: ${improvement} errors (${(improvement / initialCount * 100).toFixed(1)}%)`);
    console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    if (improvement > 0) {
        console.log('\n🎉 Successfully fixed import/export errors!');
    } else {
        console.log('\n💡 No import/export errors could be automatically fixed');
    }

    // Show remaining TS2307 and TS2305 errors
    const remainingModuleErrors = getModuleErrors(finalErrors);
    const remainingExportErrors = getExportErrors(finalErrors);

    if (remainingModuleErrors.length > 0) {
        console.log(`\n⚠️  Remaining TS2307 (Cannot find module): ${remainingModuleErrors.length}`);
        remainingModuleErrors.slice(0, 5).forEach(error => {
            console.log(`   ${error.file}: ${error.module}`);
        });
    }

    if (remainingExportErrors.length > 0) {
        console.log(`\n⚠️  Remaining TS2305 (No exported member): ${remainingExportErrors.length}`);
        remainingExportErrors.slice(0, 5).forEach(error => {
            console.log(`   ${error.file}: ${error.member}`);
        });
    }
}

main().catch(console.error);