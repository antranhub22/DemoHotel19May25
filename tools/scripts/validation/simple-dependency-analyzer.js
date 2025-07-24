#!/usr/bin/env node

/**
 * 📦 Simple Package Dependency Analyzer
 *
 * Analyzes package.json dependencies to detect:
 * 1. Unused packages that are installed but not imported
 * 2. Missing dependencies that are used in code but not declared
 *
 * Usage: node tools/scripts/validation/simple-dependency-analyzer.js [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  detailed: args.includes('--detailed'),
  fix: args.includes('--fix'),
};

// Configuration
const CONFIG = {
  packageJsonPath: path.join(ROOT_DIR, 'package.json'),

  // File patterns to analyze for imports
  analyzePatterns: [
    'apps/**/*.{ts,tsx,js,jsx}',
    'packages/**/*.{ts,tsx,js,jsx}',
    'tools/**/*.{ts,tsx,js,jsx}',
    '*.{ts,tsx,js,jsx}',
  ],

  // Exclude patterns
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.d.ts',
  ],

  // Built-in Node.js modules
  builtinModules: [
    'fs',
    'path',
    'http',
    'https',
    'crypto',
    'buffer',
    'events',
    'stream',
    'util',
    'url',
    'querystring',
    'os',
    'child_process',
    'readline',
  ],

  // Packages that are used indirectly (build tools, etc.)
  indirectPackages: [
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'typescript',
    'vite',
    'vitest',
    'jest',
    'eslint',
    'prettier',
    'husky',
    'lint-staged',
    'tsx',
    'drizzle-kit',
    'tailwindcss',
    '@vitejs/plugin-react',
    'postcss',
    'autoprefixer',
  ],
};

// Results storage
const results = {
  unusedPackages: [],
  missingDependencies: [],
  usedPackages: new Set(),
  declaredPackages: new Map(),
  stats: {
    totalDependencies: 0,
    totalDevDependencies: 0,
    totalUsedPackages: 0,
    filesAnalyzed: 0,
  },
};

/**
 * Simple dependency analyzer
 */
class SimpleDependencyAnalyzer {
  async analyze() {
    console.log('📦 Starting package dependency analysis...\n');

    try {
      // Load package.json
      this.loadPackageInfo();

      // Scan code for used packages
      this.scanCodeForUsedPackages();

      // Find issues
      this.findUnusedPackages();
      this.findMissingDependencies();

      // Generate report
      await this.generateReport();

      return results;
    } catch (error) {
      console.error('💥 Analysis failed:', error.message);
      process.exit(1);
    }
  }

  loadPackageInfo() {
    console.log('📋 Loading package.json...');

    if (!fs.existsSync(CONFIG.packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageContent = fs.readFileSync(CONFIG.packageJsonPath, 'utf-8');
    const packageInfo = JSON.parse(packageContent);

    // Store all dependencies
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      results.declaredPackages.set(name, {
        version,
        isDev: name in (packageInfo.devDependencies || {}),
      });
    }

    results.stats.totalDependencies = Object.keys(
      packageInfo.dependencies || {}
    ).length;
    results.stats.totalDevDependencies = Object.keys(
      packageInfo.devDependencies || {}
    ).length;

    console.log(`   Dependencies: ${results.stats.totalDependencies}`);
    console.log(`   Dev Dependencies: ${results.stats.totalDevDependencies}`);
  }

  scanCodeForUsedPackages() {
    console.log('🔍 Scanning code for package usage...');

    const files = this.findFilesToAnalyze();
    console.log(`   Analyzing ${files.length} files...`);

    results.stats.filesAnalyzed = files.length;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = this.extractImports(content);

        for (const importPath of imports) {
          const packageName = this.extractPackageName(importPath);
          if (packageName) {
            results.usedPackages.add(packageName);
          }
        }
      } catch (error) {
        if (options.detailed) {
          console.warn(`⚠️  Error reading ${file}: ${error.message}`);
        }
      }
    }

    results.stats.totalUsedPackages = results.usedPackages.size;
    console.log(`   Found ${results.stats.totalUsedPackages} used packages`);
  }

  findFilesToAnalyze() {
    const files = [];

    for (const pattern of CONFIG.analyzePatterns) {
      try {
        const matched = globSync(pattern, {
          cwd: ROOT_DIR,
          ignore: CONFIG.excludePatterns,
          absolute: true,
        });
        files.push(...matched);
      } catch (error) {
        console.warn(`⚠️  Error with pattern ${pattern}: ${error.message}`);
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  extractImports(content) {
    const imports = [];

    // Simple regex patterns for imports
    const patterns = [
      /import\s+.*?\s+from\s*['"`]([^'"`]+)['"`]/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[1]) {
          imports.push(match[1]);
        }
      }
    }

    return imports;
  }

  extractPackageName(importPath) {
    // Skip relative imports
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      return null;
    }

    // Skip built-in Node.js modules
    if (CONFIG.builtinModules.includes(importPath)) {
      return null;
    }

    // Skip Node.js module prefix
    if (importPath.startsWith('node:')) {
      return null;
    }

    // Handle scoped packages (@scope/package)
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return parts[0];
    }

    // Handle regular packages
    const parts = importPath.split('/');
    return parts[0];
  }

  findUnusedPackages() {
    console.log('🔍 Finding unused packages...');

    for (const [packageName, info] of results.declaredPackages) {
      // Skip indirect packages that might not show up in imports
      if (CONFIG.indirectPackages.includes(packageName)) {
        continue;
      }

      // Skip type packages (they're used at compile time)
      if (packageName.startsWith('@types/')) {
        continue;
      }

      if (!results.usedPackages.has(packageName)) {
        results.unusedPackages.push({
          name: packageName,
          version: info.version,
          isDev: info.isDev,
        });
      }
    }
  }

  findMissingDependencies() {
    console.log('🔍 Finding missing dependencies...');

    for (const packageName of results.usedPackages) {
      if (!results.declaredPackages.has(packageName)) {
        // Check if it might be a built-in or alias
        if (
          !CONFIG.builtinModules.includes(packageName) &&
          !packageName.startsWith('node:') &&
          !packageName.startsWith('@/') &&
          !packageName.startsWith('@shared') &&
          !packageName.startsWith('@server') &&
          !packageName.startsWith('@types') &&
          !packageName.startsWith('@config')
        ) {
          results.missingDependencies.push({
            name: packageName,
          });
        }
      }
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📦 PACKAGE DEPENDENCY ANALYSIS REPORT');
    console.log('='.repeat(60));

    // Statistics
    console.log('\n📈 STATISTICS:');
    console.log(`   Files analyzed: ${results.stats.filesAnalyzed}`);
    console.log(`   Total dependencies: ${results.stats.totalDependencies}`);
    console.log(
      `   Total dev dependencies: ${results.stats.totalDevDependencies}`
    );
    console.log(`   Used packages found: ${results.stats.totalUsedPackages}`);

    const totalIssues =
      results.unusedPackages.length + results.missingDependencies.length;
    console.log(`   Issues found: ${totalIssues}\n`);

    // Unused packages
    if (results.unusedPackages.length > 0) {
      console.log(`📦 UNUSED PACKAGES (${results.unusedPackages.length}):`);
      results.unusedPackages.forEach(pkg => {
        const type = pkg.isDev ? 'dev' : 'prod';
        console.log(`   ${pkg.name}@${pkg.version} (${type})`);
      });
      console.log('');
      console.log(
        `   💡 Fix with: npm uninstall ${results.unusedPackages.map(p => p.name).join(' ')}`
      );
      console.log('');
    }

    // Missing dependencies
    if (results.missingDependencies.length > 0) {
      console.log(
        `❌ MISSING DEPENDENCIES (${results.missingDependencies.length}):`
      );
      results.missingDependencies.forEach(pkg => {
        console.log(`   ${pkg.name} - used in code but not in package.json`);
      });
      console.log('');
      console.log(
        `   💡 Fix with: npm install ${results.missingDependencies.map(p => p.name).join(' ')}`
      );
      console.log('');
    }

    // Summary
    console.log('🎯 SUMMARY:');
    if (totalIssues === 0) {
      console.log('   ✅ No dependency issues found!');
    } else {
      console.log(`   📦 ${results.unusedPackages.length} unused packages`);
      console.log(
        `   ❌ ${results.missingDependencies.length} missing dependencies`
      );

      if (options.fix) {
        console.log('\n🔧 AUTO-FIXING...');
        await this.autoFix();
      } else {
        console.log('\n💡 Use --fix flag to automatically resolve issues');
      }
    }

    console.log('\n' + '='.repeat(60));
  }

  async autoFix() {
    try {
      // Remove unused packages
      if (results.unusedPackages.length > 0) {
        console.log('   Removing unused packages...');
        const unusedNames = results.unusedPackages.map(p => p.name).join(' ');
        const { execSync } = await import('child_process');
        execSync(`npm uninstall ${unusedNames}`, {
          cwd: ROOT_DIR,
          stdio: 'inherit',
        });
        console.log('   ✅ Removed unused packages');
      }

      // Install missing packages
      if (results.missingDependencies.length > 0) {
        console.log('   Installing missing packages...');
        const missingNames = results.missingDependencies
          .map(p => p.name)
          .join(' ');
        const { execSync } = await import('child_process');
        execSync(`npm install ${missingNames}`, {
          cwd: ROOT_DIR,
          stdio: 'inherit',
        });
        console.log('   ✅ Installed missing packages');
      }
    } catch (error) {
      console.error('   ❌ Auto-fix failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    const analyzer = new SimpleDependencyAnalyzer();
    await analyzer.analyze();

    const totalIssues =
      results.unusedPackages.length + results.missingDependencies.length;
    process.exit(totalIssues > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SimpleDependencyAnalyzer;
