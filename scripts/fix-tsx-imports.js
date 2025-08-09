#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing .tsx import extensions...');

async function fixTsxImports() {
    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            // Fix imports with .tsx extension
            const tsxImportRegex = /import\s+([^;]+)\s+from\s+['"`]([^'"`]+)\.tsx['"`];/g;
            if (tsxImportRegex.test(content)) {
                content = content.replace(tsxImportRegex, "import $1 from '$2';");
                hasChanges = true;
            }

            // Also handle .ts extensions (less common but might exist)
            const tsImportRegex = /import\s+([^;]+)\s+from\s+['"`]([^'"`]+)\.ts['"`];/g;
            if (tsImportRegex.test(content)) {
                content = content.replace(tsImportRegex, "import $1 from '$2';");
                hasChanges = true;
            }

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
                console.log(`   ✅ Fixed ${filePath}`);
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}: ${error.message}`);
        }
    }

    console.log(`✅ Fixed .tsx/.ts import extensions in ${fixedCount} files`);
}

fixTsxImports().catch(console.error);