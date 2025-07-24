#!/usr/bin/env node

/**
 * 📦 Package.json Dependency Analyzer
 *
 * Analyzes package.json dependencies to detect:
 * 1. Unused packages that are installed but not imported
 * 2. Version mismatches and conflicts
 * 3. Missing dependencies that are used in code but not declared
 * 4. Outdated packages and security vulnerabilities
 *
 * Usage: node tools/scripts/validation/package-dependency-analyzer.js [options]
 * Options:
 *   --detailed         Show detailed analysis
 *   --output=file      Save results to file
 *   --fix             Attempt to auto-fix issues
 *   --check-security  Check for security vulnerabilities
 *   --suggest-updates Check for package updates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Configuration
const CONFIG = {
  packageJsonPath: path.join(ROOT_DIR, 'package.json'),
  lockFilePath: path.join(ROOT_DIR, 'package-lock.json'),
  nodeModulesPath: path.join(ROOT_DIR, 'node_modules'),

  // File patterns to analyze for imports
  analyzePatterns: [
    'apps/**/*.{ts,tsx,js,jsx,mjs,cjs}',
    'packages/**/*.{ts,tsx,js,jsx,mjs,cjs}',
    'tools/**/*.{ts,tsx,js,jsx,mjs,cjs}',
    'tests/**/*.{ts,tsx,js,jsx,mjs,cjs}',
    '*.{ts,tsx,js,jsx,mjs,cjs}',
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

  // Built-in Node.js modules (don't need to be in package.json)
  builtinModules: [
    'assert',
    'buffer',
    'child_process',
    'cluster',
    'crypto',
    'dgram',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'https',
    'net',
    'os',
    'path',
    'querystring',
    'readline',
    'stream',
    'string_decoder',
    'timers',
    'tls',
    'tty',
    'url',
    'util',
    'v8',
    'vm',
    'zlib',
    'constants',
    'module',
    'process',
    'punycode',
    'sys',
  ],

  // Packages that are commonly used but might not show up in direct imports
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
    'concurrently',
    'nodemon',
    'tsx',
  ],
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  detailed: args.includes('--detailed'),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  fix: args.includes('--fix'),
  checkSecurity: args.includes('--check-security'),
  suggestUpdates: args.includes('--suggest-updates'),
};

// Results storage
const results = {
  packageInfo: null,
  installedPackages: new Map(),
  usedPackages: new Set(),
  issues: {
    unusedPackages: [],
    missingDependencies: [],
    versionMismatches: [],
    duplicatePackages: [],
    outdatedPackages: [],
    securityIssues: [],
  },
  stats: {
    totalDependencies: 0,
    totalDevDependencies: 0,
    totalUsedPackages: 0,
    totalIssues: 0,
  },
  suggestions: [],
};

/**
 * Package analyzer with advanced dependency detection
 */
class PackageDependencyAnalyzer {
  constructor() {
    this.importRegexes = [
      // ES6 imports
      /import\s+.*?\s+from\s*['"`]([^'"`]+)['"`]/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,

      // CommonJS requires
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,

      // Dynamic imports
      /await\s+import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,

      // Type-only imports
      /import\s+type\s+.*?\s+from\s*['"`]([^'"`]+)['"`]/g,
    ];
  }

  async analyze() {
    console.log('📦 Starting package dependency analysis...\n');

    try {
      // Load package.json
      await this.loadPackageInfo();

      // Analyze installed packages
      await this.analyzeInstalledPackages();

      // Scan code for used packages
      await this.scanCodeForUsedPackages();

      // Find issues
      await this.findUnusedPackages();
      await this.findMissingDependencies();
      await this.findVersionMismatches();
      await this.findDuplicatePackages();

      // Optional checks
      if (options.checkSecurity) {
        await this.checkSecurityVulnerabilities();
      }

      if (options.suggestUpdates) {
        await this.checkForUpdates();
      }

      // Generate report
      this.generateReport();

      // Auto-fix if requested
      if (options.fix) {
        await this.autoFixIssues();
      }
    } catch (error) {
      console.error('💥 Analysis failed:', error.message);
      process.exit(1);
    }

    return results;
  }

  async loadPackageInfo() {
    console.log('📋 Loading package.json...');

    if (!fs.existsSync(CONFIG.packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageContent = fs.readFileSync(CONFIG.packageJsonPath, 'utf-8');
    results.packageInfo = JSON.parse(packageContent);

    results.stats.totalDependencies = Object.keys(
      results.packageInfo.dependencies || {}
    ).length;
    results.stats.totalDevDependencies = Object.keys(
      results.packageInfo.devDependencies || {}
    ).length;

    console.log(`   Dependencies: ${results.stats.totalDependencies}`);
    console.log(`   Dev Dependencies: ${results.stats.totalDevDependencies}`);
  }

  async analyzeInstalledPackages() {
    console.log('📂 Analyzing installed packages...');

    // Get all dependencies and devDependencies
    const allDeps = {
      ...results.packageInfo.dependencies,
      ...results.packageInfo.devDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      const packagePath = path.join(CONFIG.nodeModulesPath, name);
      const installed = fs.existsSync(packagePath);

      let installedVersion = null;
      if (installed) {
        try {
          const packageJsonPath = path.join(packagePath, 'package.json');
          if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, 'utf-8')
            );
            installedVersion = packageJson.version;
          }
        } catch (error) {
          // Ignore errors reading package.json
        }
      }

      results.installedPackages.set(name, {
        declaredVersion: version,
        installedVersion,
        installed,
        isDev: name in (results.packageInfo.devDependencies || {}),
        isProduction: name in (results.packageInfo.dependencies || {}),
      });
    }
  }

  async scanCodeForUsedPackages() {
    console.log('🔍 Scanning code for package usage...');

    const files = this.findFilesToAnalyze();
    console.log(`   Analyzing ${files.length} files...`);

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
        console.warn(`⚠️  Error reading ${file}: ${error.message}`);
      }
    }

    results.stats.totalUsedPackages = results.usedPackages.size;
    console.log(`   Found ${results.stats.totalUsedPackages} used packages`);
  }

  findFilesToAnalyze() {
    const files = [];

    for (const pattern of CONFIG.analyzePatterns) {
      const matched = globSync(pattern, {
        cwd: ROOT_DIR,
        ignore: CONFIG.excludePatterns,
        absolute: true,
      });
      files.push(...matched);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  extractImports(content) {
    const imports = new Set();

    for (const regex of this.importRegexes) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[1]) {
          imports.add(match[1]);
        }
      }
    }

    return Array.from(imports);
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

    // Handle regular packages (package or package/subpath)
    const parts = importPath.split('/');
    return parts[0];
  }

  async findUnusedPackages() {
    console.log('🔍 Finding unused packages...');

    for (const [packageName, info] of results.installedPackages) {
      // Skip indirect packages that might not show up in imports
      if (CONFIG.indirectPackages.includes(packageName)) {
        continue;
      }

      // Skip type packages (they're used at compile time)
      if (packageName.startsWith('@types/')) {
        continue;
      }

      if (!results.usedPackages.has(packageName)) {
        results.issues.unusedPackages.push({
          name: packageName,
          version: info.declaredVersion,
          isDev: info.isDev,
          isProduction: info.isProduction,
        });
      }
    }
  }

  async findMissingDependencies() {
    console.log('🔍 Finding missing dependencies...');

    for (const packageName of results.usedPackages) {
      if (!results.installedPackages.has(packageName)) {
        // Check if it might be a built-in or alias
        if (
          !CONFIG.builtinModules.includes(packageName) &&
          !packageName.startsWith('node:')
        ) {
          results.issues.missingDependencies.push({
            name: packageName,
            suggested: 'latest', // We'll improve this later
          });
        }
      }
    }
  }

  async findVersionMismatches() {
    console.log('🔍 Finding version mismatches...');

    for (const [packageName, info] of results.installedPackages) {
      if (info.installed && info.installedVersion && info.declaredVersion) {
        // Simple version comparison (could be improved with semver)
        const declared = info.declaredVersion.replace(/[^0-9.]/g, '');
        const installed = info.installedVersion;

        if (
          declared !== installed &&
          !info.declaredVersion.includes(installed)
        ) {
          results.issues.versionMismatches.push({
            name: packageName,
            declaredVersion: info.declaredVersion,
            installedVersion: info.installedVersion,
          });
        }
      }
    }
  }

  async findDuplicatePackages() {
    console.log('🔍 Finding duplicate packages...');

    const deps = results.packageInfo.dependencies || {};
    const devDeps = results.packageInfo.devDependencies || {};

    for (const packageName of Object.keys(deps)) {
      if (devDeps[packageName]) {
        results.issues.duplicatePackages.push({
          name: packageName,
          prodVersion: deps[packageName],
          devVersion: devDeps[packageName],
        });
      }
    }
  }

  async checkSecurityVulnerabilities() {
    console.log('🔒 Checking for security vulnerabilities...');

    try {
      const auditResult = execSync('npm audit --json', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const audit = JSON.parse(auditResult);

      if (audit.vulnerabilities) {
        for (const [packageName, vuln] of Object.entries(
          audit.vulnerabilities
        )) {
          results.issues.securityIssues.push({
            name: packageName,
            severity: vuln.severity,
            title: vuln.title,
            url: vuln.url,
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not run security audit:', error.message);
    }
  }

  async checkForUpdates() {
    console.log('📅 Checking for package updates...');

    try {
      const outdatedResult = execSync('npm outdated --json', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const outdated = JSON.parse(outdatedResult);

      for (const [packageName, info] of Object.entries(outdated)) {
        results.issues.outdatedPackages.push({
          name: packageName,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          type: info.type,
        });
      }
    } catch (error) {
      // npm outdated exits with code 1 when there are outdated packages
      if (error.stdout) {
        try {
          const outdated = JSON.parse(error.stdout);
          for (const [packageName, info] of Object.entries(outdated)) {
            results.issues.outdatedPackages.push({
              name: packageName,
              current: info.current,
              wanted: info.wanted,
              latest: info.latest,
              type: info.type,
            });
          }
        } catch (parseError) {
          console.warn(
            '⚠️  Could not parse outdated packages:',
            parseError.message
          );
        }
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📦 PACKAGE DEPENDENCY ANALYSIS REPORT');
    console.log('='.repeat(80));

    // Statistics
    console.log('\n📈 STATISTICS:');
    console.log(`   Total dependencies: ${results.stats.totalDependencies}`);
    console.log(
      `   Total dev dependencies: ${results.stats.totalDevDependencies}`
    );
    console.log(`   Used packages found: ${results.stats.totalUsedPackages}`);

    const totalIssues = Object.values(results.issues).reduce(
      (sum, issues) => sum + issues.length,
      0
    );
    results.stats.totalIssues = totalIssues;
    console.log(`   Issues found: ${totalIssues}\n`);

    // Unused packages
    if (results.issues.unusedPackages.length > 0) {
      console.log(
        `📦 UNUSED PACKAGES (${results.issues.unusedPackages.length}):`
      );
      results.issues.unusedPackages.forEach(pkg => {
        const type = pkg.isDev ? 'dev' : 'prod';
        console.log(`   ${pkg.name}@${pkg.version} (${type})`);
      });
      console.log('');
    }

    // Missing dependencies
    if (results.issues.missingDependencies.length > 0) {
      console.log(
        `❌ MISSING DEPENDENCIES (${results.issues.missingDependencies.length}):`
      );
      results.issues.missingDependencies.forEach(pkg => {
        console.log(`   ${pkg.name} - used in code but not in package.json`);
      });
      console.log('');
    }

    // Version mismatches
    if (results.issues.versionMismatches.length > 0) {
      console.log(
        `⚠️  VERSION MISMATCHES (${results.issues.versionMismatches.length}):`
      );
      results.issues.versionMismatches.forEach(pkg => {
        console.log(
          `   ${pkg.name}: declared ${pkg.declaredVersion} but installed ${pkg.installedVersion}`
        );
      });
      console.log('');
    }

    // Duplicate packages
    if (results.issues.duplicatePackages.length > 0) {
      console.log(
        `🔄 DUPLICATE PACKAGES (${results.issues.duplicatePackages.length}):`
      );
      results.issues.duplicatePackages.forEach(pkg => {
        console.log(
          `   ${pkg.name}: prod(${pkg.prodVersion}) + dev(${pkg.devVersion})`
        );
      });
      console.log('');
    }

    // Security issues
    if (results.issues.securityIssues.length > 0) {
      console.log(
        `🔒 SECURITY VULNERABILITIES (${results.issues.securityIssues.length}):`
      );
      results.issues.securityIssues.forEach(vuln => {
        console.log(`   ${vuln.name}: ${vuln.severity} - ${vuln.title}`);
      });
      console.log('');
    }

    // Outdated packages
    if (results.issues.outdatedPackages.length > 0) {
      console.log(
        `📅 OUTDATED PACKAGES (${results.issues.outdatedPackages.length}):`
      );
      results.issues.outdatedPackages
        .slice(0, options.detailed ? Infinity : 10)
        .forEach(pkg => {
          console.log(
            `   ${pkg.name}: ${pkg.current} → ${pkg.wanted} (latest: ${pkg.latest})`
          );
        });
      if (!options.detailed && results.issues.outdatedPackages.length > 10) {
        console.log(
          `   ... and ${results.issues.outdatedPackages.length - 10} more`
        );
      }
      console.log('');
    }

    // Summary
    console.log('🎯 SUMMARY:');
    if (totalIssues === 0) {
      console.log('   ✅ No dependency issues found!');
    } else {
      console.log(
        `   📦 ${results.issues.unusedPackages.length} unused packages`
      );
      console.log(
        `   ❌ ${results.issues.missingDependencies.length} missing dependencies`
      );
      console.log(
        `   ⚠️  ${results.issues.versionMismatches.length} version mismatches`
      );
      console.log(
        `   🔄 ${results.issues.duplicatePackages.length} duplicate packages`
      );
      if (options.checkSecurity) {
        console.log(
          `   🔒 ${results.issues.securityIssues.length} security vulnerabilities`
        );
      }
      if (options.suggestUpdates) {
        console.log(
          `   📅 ${results.issues.outdatedPackages.length} outdated packages`
        );
      }
    }

    console.log('\n' + '='.repeat(80));

    // Save report if requested
    if (options.output) {
      const reportData = {
        timestamp: new Date().toISOString(),
        stats: results.stats,
        issues: results.issues,
        suggestions: results.suggestions,
      };

      fs.writeFileSync(options.output, JSON.stringify(reportData, null, 2));
      console.log(`📄 Detailed report saved to: ${options.output}`);
    }
  }

  async autoFixIssues() {
    console.log('\n🔧 Auto-fixing issues...');

    const fixes = [];

    // Remove unused packages
    if (results.issues.unusedPackages.length > 0) {
      console.log('   Removing unused packages...');
      for (const pkg of results.issues.unusedPackages) {
        const command = `npm uninstall ${pkg.name}`;
        fixes.push({ type: 'remove', package: pkg.name, command });
      }
    }

    // Install missing dependencies
    if (results.issues.missingDependencies.length > 0) {
      console.log('   Installing missing dependencies...');
      for (const pkg of results.issues.missingDependencies) {
        const command = `npm install ${pkg.name}`;
        fixes.push({ type: 'install', package: pkg.name, command });
      }
    }

    // Execute fixes
    if (fixes.length > 0) {
      console.log(`\n   Executing ${fixes.length} fixes:`);
      for (const fix of fixes) {
        try {
          console.log(`   Running: ${fix.command}`);
          execSync(fix.command, { cwd: ROOT_DIR, stdio: 'inherit' });
          console.log(`   ✅ Fixed: ${fix.package}`);
        } catch (error) {
          console.log(`   ❌ Failed to fix ${fix.package}: ${error.message}`);
        }
      }
    } else {
      console.log('   No auto-fixable issues found.');
    }
  }
}

// Main execution
async function main() {
  try {
    const analyzer = new PackageDependencyAnalyzer();
    await analyzer.analyze();

    process.exit(results.stats.totalIssues > 0 ? 1 : 0);
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

export default PackageDependencyAnalyzer;
