#!/usr/bin/env node

/**
 * 🔍 Comprehensive Import/Export Consistency Checker
 *
 * Analyzes the entire repository for:
 * 1. Missing exports that are being imported
 * 2. Unused exports
 * 3. Circular dependencies
 * 4. Path mismatches between imports and actual file locations
 *
 * Usage: node tools/scripts/validation/import-export-checker.js [options]
 * Options:
 *   --fix              Attempt to auto-fix some issues
 *   --detailed         Show detailed analysis
 *   --output=file      Save results to file
 *   --focus=imports    Focus on specific issue type (imports|exports|circular|paths)
 *   --exclude=pattern  Exclude files matching pattern
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Configuration
const CONFIG = {
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.d.ts',
    '**/*.test.*',
    '**/*.spec.*',
    '**/coverage/**',
    '**/.git/**',
    '**/playwright-report/**',
    '**/test-results/**',
  ],
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
  includePatterns: [
    'apps/**/*.{ts,tsx,js,jsx}',
    'packages/**/*.{ts,tsx,js,jsx}',
    'tools/**/*.{ts,tsx,js,jsx}',
    'tests/**/*.{ts,tsx,js,jsx}',
    '*.{ts,tsx,js,jsx}',
  ],
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  detailed: args.includes('--detailed'),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  focus: args.find(arg => arg.startsWith('--focus='))?.split('=')[1],
  exclude: args.find(arg => arg.startsWith('--exclude='))?.split('=')[1],
};

// Results storage
const results = {
  files: new Map(),
  imports: new Map(),
  exports: new Map(),
  issues: {
    missingExports: [],
    unusedExports: [],
    circularDependencies: [],
    pathMismatches: [],
    invalidImports: [],
  },
  stats: {
    totalFiles: 0,
    totalImports: 0,
    totalExports: 0,
    issuesFound: 0,
  },
};

/**
 * Enhanced import/export parser with better TypeScript support
 */
class ImportExportParser {
  constructor() {
    this.importRegex = [
      // Standard imports: import { a, b } from 'module'
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]([^'"`]+)['"`]/g,
      // Default imports: import React from 'react'
      /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*from\s*['"`]([^'"`]+)['"`]/g,
      // Namespace imports: import * as name from 'module'
      /import\s*\*\s*as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*from\s*['"`]([^'"`]+)['"`]/g,
      // Side effect imports: import 'module'
      /import\s*['"`]([^'"`]+)['"`]/g,
      // Dynamic imports: import('module')
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // Require statements
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    this.exportRegex = [
      // Named exports: export { a, b }
      /export\s*\{\s*([^}]+)\s*\}/g,
      // Default exports: export default
      /export\s+default\s+/g,
      // Function exports: export function name()
      /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Class exports: export class Name
      /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Const exports: export const name =
      /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Let/Var exports: export let/var name
      /export\s+(?:let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Type exports: export type Name
      /export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Interface exports: export interface Name
      /export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // Re-exports: export * from 'module'
      /export\s*\*\s*from\s*['"`]([^'"`]+)['"`]/g,
      // Re-exports with rename: export { a } from 'module'
      /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]([^'"`]+)['"`]/g,
    ];
  }

  parseFile(filePath, content) {
    const fileInfo = {
      path: filePath,
      imports: [],
      exports: [],
      dependencies: new Set(),
      error: null,
    };

    try {
      // Remove comments and strings to avoid false positives
      const cleanContent = this.removeCommentsAndStrings(content);

      // Parse imports
      fileInfo.imports = this.parseImports(cleanContent, filePath);

      // Parse exports
      fileInfo.exports = this.parseExports(cleanContent, filePath);

      // Extract dependencies
      fileInfo.imports.forEach(imp => {
        if (imp.source) {
          fileInfo.dependencies.add(imp.source);
        }
      });
    } catch (error) {
      fileInfo.error = error.message;
      console.warn(`⚠️  Error parsing ${filePath}: ${error.message}`);
    }

    return fileInfo;
  }

  removeCommentsAndStrings(content) {
    // Remove single-line comments
    content = content.replace(/\/\/.*$/gm, '');

    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove template literals (basic)
    content = content.replace(/`[^`]*`/g, '``');

    // Remove strings (basic - doesn't handle escaped quotes)
    content = content.replace(/"[^"]*"/g, '""');
    content = content.replace(/'[^']*'/g, "''");

    return content;
  }

  parseImports(content, filePath) {
    const imports = [];

    // Named imports
    const namedImportRegex =
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = namedImportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(name => {
        const trimmed = name.trim();
        // Handle "as" syntax: import { original as alias }
        const asParts = trimmed.split(/\s+as\s+/);
        return {
          original: asParts[0].trim(),
          alias: asParts[1]?.trim() || asParts[0].trim(),
        };
      });

      imports.push({
        type: 'named',
        names: names,
        source: match[2],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Default imports
    const defaultImportRegex =
      /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:,\s*\{[^}]*\})?\s*from\s*['"`]([^'"`]+)['"`]/g;
    while ((match = defaultImportRegex.exec(content)) !== null) {
      imports.push({
        type: 'default',
        name: match[1],
        source: match[2],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Namespace imports
    const namespaceImportRegex =
      /import\s*\*\s*as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*from\s*['"`]([^'"`]+)['"`]/g;
    while ((match = namespaceImportRegex.exec(content)) !== null) {
      imports.push({
        type: 'namespace',
        name: match[1],
        source: match[2],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Side effect imports
    const sideEffectImportRegex = /import\s*['"`]([^'"`]+)['"`]/g;
    while ((match = sideEffectImportRegex.exec(content)) !== null) {
      imports.push({
        type: 'side-effect',
        source: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push({
        type: 'dynamic',
        source: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    return imports;
  }

  parseExports(content, filePath) {
    const exports = [];

    // Named exports
    const namedExportRegex =
      /export\s*\{\s*([^}]+)\s*\}(?:\s*from\s*['"`]([^'"`]+)['"`])?/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(name => {
        const trimmed = name.trim();
        const asParts = trimmed.split(/\s+as\s+/);
        return {
          original: asParts[0].trim(),
          exported: asParts[1]?.trim() || asParts[0].trim(),
        };
      });

      exports.push({
        type: 'named',
        names: names,
        source: match[2] || null, // For re-exports
        line: this.getLineNumber(content, match.index),
      });
    }

    // Default exports
    const defaultExportRegex =
      /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*|class\s+[a-zA-Z_$][a-zA-Z0-9_$]*|function\s+[a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = defaultExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'default',
        name: 'default',
        declaration: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Function exports
    const functionExportRegex =
      /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = functionExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'function',
        name: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Class exports
    const classExportRegex = /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = classExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'class',
        name: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Variable exports (const, let, var)
    const variableExportRegex =
      /export\s+(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = variableExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'variable',
        name: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Type exports
    const typeExportRegex = /export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = typeExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'type',
        name: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Interface exports
    const interfaceExportRegex =
      /export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = interfaceExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'interface',
        name: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // Wildcard re-exports
    const wildcardExportRegex = /export\s*\*\s*from\s*['"`]([^'"`]+)['"`]/g;
    while ((match = wildcardExportRegex.exec(content)) !== null) {
      exports.push({
        type: 'wildcard',
        source: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    return exports;
  }

  getLineNumber(content, index) {
    return content.substr(0, index).split('\n').length;
  }
}

/**
 * Path resolver with alias support
 */
class PathResolver {
  constructor(aliases, rootDir) {
    this.aliases = aliases;
    this.rootDir = rootDir;
  }

  resolve(importPath, fromFile) {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      return path.resolve(fromDir, importPath);
    }

    // Handle alias imports
    for (const [alias, target] of Object.entries(this.aliases)) {
      if (importPath.startsWith(alias)) {
        const relativePath = importPath.slice(alias.length);
        return path.resolve(this.rootDir, target, relativePath);
      }
    }

    // Handle node_modules imports (return as-is)
    if (!importPath.startsWith('.')) {
      return null; // External module
    }

    // Absolute path (shouldn't happen in our codebase)
    return importPath;
  }

  findActualFile(resolvedPath) {
    if (!resolvedPath) return null;

    // Try different extensions
    for (const ext of CONFIG.extensions) {
      const withExt = resolvedPath + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }

    // Try index files
    for (const ext of CONFIG.extensions) {
      const indexFile = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }

    return null;
  }
}

/**
 * Circular dependency detector
 */
class CircularDependencyDetector {
  constructor() {
    this.visited = new Set();
    this.visiting = new Set();
    this.cycles = [];
  }

  detectCycles(fileMap) {
    this.cycles = [];

    for (const filePath of fileMap.keys()) {
      if (!this.visited.has(filePath)) {
        this.dfs(filePath, fileMap, []);
      }
    }

    return this.cycles;
  }

  dfs(filePath, fileMap, path) {
    if (this.visiting.has(filePath)) {
      // Found a cycle
      const cycleStart = path.indexOf(filePath);
      const cycle = path.slice(cycleStart).concat([filePath]);
      this.cycles.push(cycle);
      return;
    }

    if (this.visited.has(filePath)) {
      return;
    }

    this.visiting.add(filePath);
    path.push(filePath);

    const fileInfo = fileMap.get(filePath);
    if (fileInfo && fileInfo.dependencies) {
      for (const dep of fileInfo.dependencies) {
        const resolvedDep = this.resolveToFilePath(dep, filePath);
        if (resolvedDep && fileMap.has(resolvedDep)) {
          this.dfs(resolvedDep, fileMap, [...path]);
        }
      }
    }

    path.pop();
    this.visiting.delete(filePath);
    this.visited.add(filePath);
  }

  resolveToFilePath(importPath, fromFile) {
    const resolver = new PathResolver(CONFIG.pathAliases, ROOT_DIR);
    const resolved = resolver.resolve(importPath, fromFile);
    return resolver.findActualFile(resolved);
  }
}

/**
 * Main analyzer class
 */
class ImportExportAnalyzer {
  constructor() {
    this.parser = new ImportExportParser();
    this.resolver = new PathResolver(CONFIG.pathAliases, ROOT_DIR);
    this.circularDetector = new CircularDependencyDetector();
  }

  async analyze() {
    console.log('🔍 Starting comprehensive import/export analysis...\n');

    // Find all files to analyze
    const files = this.findFiles();
    console.log(`📁 Found ${files.length} files to analyze\n`);

    // Parse all files
    console.log('📝 Parsing files...');
    for (const file of files) {
      this.parseFile(file);
    }

    // Analyze issues
    console.log('\n🔍 Analyzing issues...');
    this.findMissingExports();
    this.findUnusedExports();
    this.findCircularDependencies();
    this.findPathMismatches();

    // Generate report
    this.generateReport();

    return results;
  }

  findFiles() {
    const files = [];

    for (const pattern of CONFIG.includePatterns) {
      const matched = globSync(pattern, {
        cwd: ROOT_DIR,
        ignore: CONFIG.excludePatterns,
        absolute: true,
      });
      files.push(...matched);
    }

    // Remove duplicates and filter
    const uniqueFiles = [...new Set(files)];

    // Apply additional exclusion if specified
    if (options.exclude) {
      const excludeRegex = new RegExp(options.exclude);
      return uniqueFiles.filter(file => !excludeRegex.test(file));
    }

    return uniqueFiles;
  }

  parseFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileInfo = this.parser.parseFile(filePath, content);

      results.files.set(filePath, fileInfo);
      results.stats.totalFiles++;
      results.stats.totalImports += fileInfo.imports.length;
      results.stats.totalExports += fileInfo.exports.length;

      // Store imports and exports in global maps
      fileInfo.imports.forEach(imp => {
        if (!results.imports.has(filePath)) {
          results.imports.set(filePath, []);
        }
        results.imports.get(filePath).push(imp);
      });

      fileInfo.exports.forEach(exp => {
        if (!results.exports.has(filePath)) {
          results.exports.set(filePath, []);
        }
        results.exports.get(filePath).push(exp);
      });

      if (results.stats.totalFiles % 50 === 0) {
        process.stdout.write('.');
      }
    } catch (error) {
      console.warn(`⚠️  Error reading ${filePath}: ${error.message}`);
    }
  }

  findMissingExports() {
    console.log('🔍 Checking for missing exports...');

    for (const [filePath, fileInfo] of results.files) {
      for (const importStatement of fileInfo.imports) {
        if (!importStatement.source) continue;

        const resolvedPath = this.resolver.resolve(
          importStatement.source,
          filePath
        );
        const actualFile = this.resolver.findActualFile(resolvedPath);

        if (!actualFile || !results.files.has(actualFile)) {
          // External module or file not found
          if (actualFile && !fs.existsSync(actualFile)) {
            results.issues.pathMismatches.push({
              file: filePath,
              line: importStatement.line,
              import: importStatement.source,
              expected: actualFile,
              type: 'file_not_found',
            });
          }
          continue;
        }

        const targetFile = results.files.get(actualFile);

        // Check if imported names exist in target file
        if (importStatement.type === 'named') {
          for (const importedName of importStatement.names) {
            if (!this.isExported(targetFile, importedName.original)) {
              results.issues.missingExports.push({
                file: filePath,
                line: importStatement.line,
                import: importedName.original,
                source: importStatement.source,
                targetFile: actualFile,
              });
            }
          }
        } else if (importStatement.type === 'default') {
          if (!this.hasDefaultExport(targetFile)) {
            results.issues.missingExports.push({
              file: filePath,
              line: importStatement.line,
              import: 'default',
              source: importStatement.source,
              targetFile: actualFile,
            });
          }
        }
      }
    }
  }

  findUnusedExports() {
    console.log('🔍 Checking for unused exports...');

    const usedExports = new Map();

    // Collect all imports
    for (const [filePath, fileInfo] of results.files) {
      for (const importStatement of fileInfo.imports) {
        if (!importStatement.source) continue;

        const resolvedPath = this.resolver.resolve(
          importStatement.source,
          filePath
        );
        const actualFile = this.resolver.findActualFile(resolvedPath);

        if (actualFile && results.files.has(actualFile)) {
          if (!usedExports.has(actualFile)) {
            usedExports.set(actualFile, new Set());
          }

          if (importStatement.type === 'named') {
            importStatement.names.forEach(name => {
              usedExports.get(actualFile).add(name.original);
            });
          } else if (importStatement.type === 'default') {
            usedExports.get(actualFile).add('default');
          } else if (importStatement.type === 'namespace') {
            usedExports.get(actualFile).add('*');
          }
        }
      }
    }

    // Find unused exports
    for (const [filePath, fileInfo] of results.files) {
      const used = usedExports.get(filePath) || new Set();

      for (const exportStatement of fileInfo.exports) {
        if (exportStatement.type === 'wildcard') continue; // Skip wildcard re-exports

        let exportName = null;
        if (exportStatement.type === 'named') {
          exportStatement.names.forEach(name => {
            if (!used.has(name.exported) && !used.has('*')) {
              results.issues.unusedExports.push({
                file: filePath,
                line: exportStatement.line,
                export: name.exported,
                type: exportStatement.type,
              });
            }
          });
        } else if (exportStatement.name) {
          exportName = exportStatement.name;
          if (!used.has(exportName) && !used.has('*')) {
            results.issues.unusedExports.push({
              file: filePath,
              line: exportStatement.line,
              export: exportName,
              type: exportStatement.type,
            });
          }
        }
      }
    }
  }

  findCircularDependencies() {
    console.log('🔍 Checking for circular dependencies...');

    const cycles = this.circularDetector.detectCycles(results.files);

    results.issues.circularDependencies = cycles.map(cycle => ({
      cycle: cycle,
      length: cycle.length - 1, // Subtract 1 because last element repeats first
    }));
  }

  findPathMismatches() {
    console.log('🔍 Checking for path mismatches...');

    for (const [filePath, fileInfo] of results.files) {
      for (const importStatement of fileInfo.imports) {
        if (!importStatement.source) continue;

        const resolvedPath = this.resolver.resolve(
          importStatement.source,
          filePath
        );

        if (resolvedPath) {
          const actualFile = this.resolver.findActualFile(resolvedPath);

          if (!actualFile) {
            results.issues.pathMismatches.push({
              file: filePath,
              line: importStatement.line,
              import: importStatement.source,
              resolved: resolvedPath,
              type: 'path_not_found',
            });
          }
        }
      }
    }
  }

  isExported(fileInfo, name) {
    return fileInfo.exports.some(exp => {
      if (exp.type === 'named') {
        return exp.names.some(n => n.exported === name);
      }
      return exp.name === name;
    });
  }

  hasDefaultExport(fileInfo) {
    return fileInfo.exports.some(exp => exp.type === 'default');
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT/EXPORT CONSISTENCY ANALYSIS REPORT');
    console.log('='.repeat(80));

    // Statistics
    console.log('\n📈 STATISTICS:');
    console.log(`   Files analyzed: ${results.stats.totalFiles}`);
    console.log(`   Total imports: ${results.stats.totalImports}`);
    console.log(`   Total exports: ${results.stats.totalExports}`);

    const totalIssues = Object.values(results.issues).reduce(
      (sum, issues) => sum + issues.length,
      0
    );
    console.log(`   Issues found: ${totalIssues}\n`);

    // Missing exports
    if (results.issues.missingExports.length > 0) {
      console.log(
        `❌ MISSING EXPORTS (${results.issues.missingExports.length}):`
      );
      results.issues.missingExports
        .slice(0, options.detailed ? Infinity : 10)
        .forEach(issue => {
          console.log(`   ${issue.file}:${issue.line}`);
          console.log(
            `      Importing '${issue.import}' from '${issue.source}'`
          );
          console.log(`      Target file: ${issue.targetFile}`);
          console.log('');
        });
      if (!options.detailed && results.issues.missingExports.length > 10) {
        console.log(
          `   ... and ${results.issues.missingExports.length - 10} more`
        );
      }
      console.log('');
    }

    // Unused exports
    if (results.issues.unusedExports.length > 0) {
      console.log(
        `⚠️  UNUSED EXPORTS (${results.issues.unusedExports.length}):`
      );
      results.issues.unusedExports
        .slice(0, options.detailed ? Infinity : 10)
        .forEach(issue => {
          console.log(
            `   ${issue.file}:${issue.line} - '${issue.export}' (${issue.type})`
          );
        });
      if (!options.detailed && results.issues.unusedExports.length > 10) {
        console.log(
          `   ... and ${results.issues.unusedExports.length - 10} more`
        );
      }
      console.log('');
    }

    // Circular dependencies
    if (results.issues.circularDependencies.length > 0) {
      console.log(
        `🔄 CIRCULAR DEPENDENCIES (${results.issues.circularDependencies.length}):`
      );
      results.issues.circularDependencies.forEach((issue, index) => {
        console.log(`   Cycle ${index + 1} (length: ${issue.length}):`);
        issue.cycle.forEach((file, i) => {
          if (i < issue.cycle.length - 1) {
            console.log(`      ${i + 1}. ${path.relative(ROOT_DIR, file)}`);
          }
        });
        console.log('');
      });
    }

    // Path mismatches
    if (results.issues.pathMismatches.length > 0) {
      console.log(
        `🚫 PATH MISMATCHES (${results.issues.pathMismatches.length}):`
      );
      results.issues.pathMismatches
        .slice(0, options.detailed ? Infinity : 10)
        .forEach(issue => {
          console.log(`   ${issue.file}:${issue.line}`);
          console.log(`      Import: '${issue.import}'`);
          if (issue.resolved) {
            console.log(`      Resolved to: ${issue.resolved}`);
          }
          console.log(`      Issue: ${issue.type}`);
          console.log('');
        });
      if (!options.detailed && results.issues.pathMismatches.length > 10) {
        console.log(
          `   ... and ${results.issues.pathMismatches.length - 10} more`
        );
      }
    }

    // Summary
    console.log('🎯 SUMMARY:');
    if (totalIssues === 0) {
      console.log('   ✅ No import/export consistency issues found!');
    } else {
      console.log(
        `   ❌ ${results.issues.missingExports.length} missing exports`
      );
      console.log(
        `   ⚠️  ${results.issues.unusedExports.length} unused exports`
      );
      console.log(
        `   🔄 ${results.issues.circularDependencies.length} circular dependencies`
      );
      console.log(
        `   🚫 ${results.issues.pathMismatches.length} path mismatches`
      );
    }

    console.log('\n' + '='.repeat(80));

    // Save to file if requested
    if (options.output) {
      const reportData = {
        timestamp: new Date().toISOString(),
        stats: results.stats,
        issues: results.issues,
        config: CONFIG,
      };

      fs.writeFileSync(options.output, JSON.stringify(reportData, null, 2));
      console.log(`📄 Detailed report saved to: ${options.output}`);
    }
  }
}

// Main execution
async function main() {
  try {
    const analyzer = new ImportExportAnalyzer();
    await analyzer.analyze();

    const totalIssues = Object.values(results.issues).reduce(
      (sum, issues) => sum + issues.length,
      0
    );
    process.exit(totalIssues > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  }
}

// Install missing dependencies if needed
function checkDependencies() {
  try {
    require.resolve('glob');
  } catch (error) {
    console.log('📦 Installing required dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install glob', { stdio: 'inherit' });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDependencies();
  main();
}

export default ImportExportAnalyzer;
