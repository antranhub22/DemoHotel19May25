#!/usr/bin/env node

/**
 * Security Violations Auto-Fix Script
 * Automatically removes or sanitizes console.log statements with sensitive data
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// Patterns that should be removed or sanitized
const SENSITIVE_PATTERNS = [
  /console\.log\(['"`][^'"`]*token[^'"`]*['"`][^)]*\)/gi,
  /console\.log\(['"`][^'"`]*password[^'"`]*['"`][^)]*\)/gi,
  /console\.log\(['"`][^'"`]*secret[^'"`]*['"`][^)]*\)/gi,
  /console\.log\(['"`][^'"`]*auth[^'"`]*['"`],\s*[^)]*token[^)]*\)/gi,
  /console\.log\(['"`][^'"`]*DEBUG[^'"`]*['"`],\s*[^)]*token[^)]*\)/gi,
];

// Specific console.log statements to remove completely
const REMOVE_PATTERNS = [
  /console\.log\('\[DEBUG\] AuthProvider.*?\);\s*$/gm,
  /console\.log\('🔄 \[UnifiedAuth\].*?\);\s*$/gm,
  /console\.log\('❌ \[UnifiedAuth\].*?\);\s*$/gm,
  /console\.log\('✅ \[AuthHelper\].*?\);\s*$/gm,
  /console\.log\('⏰ \[AuthHelper\].*?\);\s*$/gm,
  /console\.log\('🚧 \[AuthHelper\].*?\);\s*$/gm,
  /console\.log\('🎫 \[DebugAuth\].*?\);\s*$/gm,
  /console\.log\('🧹 \[DebugAuth\].*?\);\s*$/gm,
  /console\.log\('🔄 \[DebugAuth\].*?\);\s*$/gm,
];

// Files to process
const FILES_TO_FIX = [
  'packages/auth-system/frontend/context/AuthContext.tsx',
  'packages/auth-system/frontend/utils/authHelper.ts',
  'packages/auth-system/frontend/utils/debugAuth.ts',
  'packages/auth-system/services/UnifiedAuthService.ts',
  'packages/auth-system/routes/auth.routes.ts',
  'apps/client/src/context/AuthContext.tsx',
];

function fixFile(filePath) {
  const fullPath = join(PROJECT_ROOT, filePath);

  if (!existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    let content = readFileSync(fullPath, 'utf-8');
    let modified = false;
    let removedCount = 0;

    // Remove specific dangerous patterns
    for (const pattern of REMOVE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        removedCount += matches.length;
        content = content.replace(
          pattern,
          '// [SECURITY] Console.log removed for security compliance'
        );
        modified = true;
      }
    }

    // Sanitize remaining sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(content)) {
        content = content.replace(
          pattern,
          '// [SECURITY] Sensitive console.log removed'
        );
        modified = true;
        removedCount++;
      }
    }

    if (modified) {
      writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ Fixed ${filePath} (${removedCount} violations removed)`);
      return true;
    } else {
      console.log(`✨ ${filePath} - No violations found`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Starting Security Violations Auto-Fix...\n');

  let totalFixed = 0;
  let totalFiles = 0;

  for (const filePath of FILES_TO_FIX) {
    const wasFixed = fixFile(filePath);
    if (wasFixed) {
      totalFixed++;
    }
    totalFiles++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Security Fix Summary:`);
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files modified: ${totalFixed}`);
  console.log(`   Files clean: ${totalFiles - totalFixed}`);

  if (totalFixed > 0) {
    console.log('\n✅ Security violations have been fixed!');
    console.log(
      '🔍 Run governance validation again: npm run governance:validate:security'
    );
  } else {
    console.log('\n✨ No security violations found in target files!');
  }

  console.log('='.repeat(60));
}

main();
