#!/usr/bin/env node

/**
 * 🚀 Quick Import/Export Checker
 *
 * Fast version for development - checks only critical issues
 * Usage: node tools/scripts/validation/quick-import-check.js [path]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Quick configuration
const QUICK_CONFIG = {
  pathAliases: {
    '@/': 'apps/client/src/',
    '@shared/': 'packages/shared/',
    '@server/': 'apps/server/',
    '@types/': 'packages/types/',
    '@config/': 'packages/config/',
    '@tools/': 'tools/',
    '@tests/': 'tests/',
    '@auth/': 'packages/auth-system/',
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
};

class QuickChecker {
  constructor() {
    this.issues = [];
  }

  async check(targetPath = '.') {
    console.log('🚀 Quick import/export check...\n');

    const startTime = Date.now();
    const fullPath = path.resolve(ROOT_DIR, targetPath);

    if (fs.statSync(fullPath).isFile()) {
      await this.checkFile(fullPath);
    } else {
      await this.checkDirectory(fullPath);
    }

    const endTime = Date.now();
    this.printResults(endTime - startTime);

    return this.issues.length === 0;
  }

  async checkDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory() && !this.shouldSkipDirectory(file.name)) {
        await this.checkDirectory(fullPath);
      } else if (file.isFile() && this.shouldCheckFile(file.name)) {
        await this.checkFile(fullPath);
      }
    }
  }

  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(ROOT_DIR, filePath);

      // Quick import parsing
      const imports = this.parseImports(content);

      for (const imp of imports) {
        const resolved = this.resolveImport(imp.source, filePath);

        if (resolved && !fs.existsSync(resolved)) {
          this.issues.push({
            type: 'missing_file',
            file: relativePath,
            line: imp.line,
            import: imp.source,
            resolved: path.relative(ROOT_DIR, resolved),
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  parseImports(content) {
    const imports = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match import statements
      const importMatches = [
        /import\s+.*from\s*['"`]([^'"`]+)['"`]/.exec(line),
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/.exec(line),
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/.exec(line),
      ].filter(Boolean);

      for (const match of importMatches) {
        if (match && match[1]) {
          imports.push({
            source: match[1],
            line: i + 1,
          });
        }
      }
    }

    return imports;
  }

  resolveImport(importPath, fromFile) {
    // Skip external modules
    if (!importPath.startsWith('.') && !this.isAliasPath(importPath)) {
      return null;
    }

    let resolved;

    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Relative import
      const fromDir = path.dirname(fromFile);
      resolved = path.resolve(fromDir, importPath);
    } else {
      // Alias import
      resolved = this.resolveAlias(importPath);
    }

    // Try different extensions
    for (const ext of QUICK_CONFIG.extensions) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }

    // Try index files
    for (const ext of QUICK_CONFIG.extensions) {
      const indexFile = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }

    return resolved;
  }

  isAliasPath(importPath) {
    return Object.keys(QUICK_CONFIG.pathAliases).some(alias =>
      importPath.startsWith(alias)
    );
  }

  resolveAlias(importPath) {
    for (const [alias, target] of Object.entries(QUICK_CONFIG.pathAliases)) {
      if (importPath.startsWith(alias)) {
        const relativePath = importPath.slice(alias.length);
        return path.resolve(ROOT_DIR, target, relativePath);
      }
    }
    return importPath;
  }

  shouldSkipDirectory(name) {
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      'coverage',
      'test-results',
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  shouldCheckFile(name) {
    return (
      QUICK_CONFIG.extensions.some(ext => name.endsWith(ext)) &&
      !name.includes('.test.') &&
      !name.includes('.spec.') &&
      !name.endsWith('.d.ts')
    );
  }

  printResults(duration) {
    console.log(`\n⚡ Quick check completed in ${duration}ms\n`);

    if (this.issues.length === 0) {
      console.log('✅ No critical import issues found!');
    } else {
      console.log(`❌ Found ${this.issues.length} import issues:\n`);

      this.issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line}`);
        console.log(`   📥 Import: '${issue.import}'`);
        console.log(`   🚫 Resolved to: ${issue.resolved} (not found)`);
        console.log('');
      });
    }
  }
}

// Main execution
async function main() {
  const targetPath = process.argv[2] || '.';
  const checker = new QuickChecker();
  const success = await checker.check(targetPath);

  process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
