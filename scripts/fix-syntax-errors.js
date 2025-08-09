#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing syntax errors from component prop fixes...');

async function fixSyntaxErrors() {
    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let fixedCount = 0;

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            // Fix double closing parentheses: })) => {
            if (content.includes('})) => {')) {
                content = content.replace(/\}\)\) => \{/g, '}) => {');
                hasChanges = true;
            }

            // Fix double interface definitions: React.FC<ComponentName><{ ... }>
            content = content.replace(/React\.FC<(\w+)><\{/g, 'React.FC<$1Props> = ({');
            if (content !== fs.readFileSync(filePath, 'utf8')) {
                hasChanges = true;
            }

            // Fix skeleton props syntax: ...props?: any;
            if (content.includes('...props?: any;')) {
                content = content.replace(/\.\.\.props\?\: any;/g, '');
                hasChanges = true;
            }

            // Fix function parameter syntax issues
            content = content.replace(/\) => \{$/gm, ') => {');
            if (content !== fs.readFileSync(filePath, 'utf8')) {
                hasChanges = true;
            }

            // Fix TODO comments in function parameters
            content = content.replace(/\(([^)]+)\/\/ TODO: ([^)]+)\)/g, '($1) // TODO: $2');
            if (content !== fs.readFileSync(filePath, 'utf8')) {
                hasChanges = true;
            }

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                fixedCount++;
                console.log(`   ✅ Fixed ${filePath}`);
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Fixed syntax errors in ${fixedCount} files`);
}

fixSyntaxErrors().catch(console.error);