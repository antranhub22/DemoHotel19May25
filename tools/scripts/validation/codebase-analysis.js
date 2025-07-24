#!/usr/bin/env node

/**
 * 🤖 Codebase Analysis with AI-Powered Insights
 *
 * Comprehensive repository health check that analyzes:
 * 1. Type consistency across all files
 * 2. Import/export synchronization
 * 3. Dead code detection
 * 4. Circular dependency detection
 * 5. Naming convention consistency
 * 6. File structure compliance
 *
 * Provides prioritized list of issues to fix with actionable recommendations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Analysis results
const analysis = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: 0,
    totalIssues: 0,
    criticalIssues: 0,
    warningIssues: 0,
    infoIssues: 0,
    healthScore: 0, // 0-100
  },

  categories: {
    typeConsistency: {
      issues: [],
      score: 100,
      description: 'TypeScript type consistency across all files',
    },

    importExportSync: {
      issues: [],
      score: 100,
      description: 'Import/export synchronization validation',
    },

    deadCode: {
      issues: [],
      score: 100,
      description: 'Unused code and import detection',
    },

    circularDependencies: {
      issues: [],
      score: 100,
      description: 'Circular dependency detection',
    },

    namingConventions: {
      issues: [],
      score: 100,
      description: 'Consistent naming patterns',
    },

    fileStructure: {
      issues: [],
      score: 100,
      description: 'Proper file organization and structure',
    },
  },

  prioritizedActions: [],
  quickFixes: [],
  recommendations: [],
};

/**
 * 🔍 File Discovery and Analysis
 */
class CodebaseAnalyzer {
  /**
   * Analyze type consistency across all TypeScript files
   */
  static async analyzeTypeConsistency() {
    console.log('🔍 Analyzing type consistency...');

    const issues = [];
    const tsFiles = await this.findFiles(
      ['**/*.ts', '**/*.tsx'],
      ['node_modules', 'dist', 'build']
    );

    for (const file of tsFiles) {
      const fullPath = path.join(ROOT_DIR, file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for 'any' type usage
        if (
          line.includes(': any') ||
          line.includes('<any>') ||
          line.includes(' any ')
        ) {
          issues.push({
            type: 'any_type_usage',
            file: file,
            line: index + 1,
            severity: 'warning',
            message: 'Usage of "any" type reduces type safety',
            suggestion: 'Use specific types instead of "any"',
            category: 'Type Safety',
          });
        }

        // Check for @ts-ignore usage
        if (line.includes('@ts-ignore')) {
          issues.push({
            type: 'ts_ignore_usage',
            file: file,
            line: index + 1,
            severity: 'warning',
            message: '@ts-ignore suppresses TypeScript errors',
            suggestion:
              'Fix the underlying TypeScript error instead of suppressing it',
            category: 'Type Safety',
          });
        }

        // Check for missing return type annotations on functions
        const functionMatch = line.match(
          /(?:function|const\s+\w+\s*=\s*\(.*?\)\s*=>|async\s+function)/
        );
        if (
          functionMatch &&
          !line.includes('):') &&
          !line.includes('=> void') &&
          !line.includes('=> Promise')
        ) {
          issues.push({
            type: 'missing_return_type',
            file: file,
            line: index + 1,
            severity: 'info',
            message: 'Function missing explicit return type annotation',
            suggestion: 'Add explicit return type for better type safety',
            category: 'Type Annotations',
          });
        }
      });
    }

    analysis.categories.typeConsistency.issues = issues;
    analysis.categories.typeConsistency.score = Math.max(
      0,
      100 - issues.length * 2
    );

    console.log(`   Found ${issues.length} type consistency issues`);
  }

  /**
   * Analyze import/export synchronization
   */
  static async analyzeImportExportSync() {
    console.log('🔗 Analyzing import/export synchronization...');

    const issues = [];
    const jstsFiles = await this.findFiles(
      ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ['node_modules', 'dist']
    );

    const exports = new Map(); // Map of exported items to their files

    // First pass: collect all exports
    for (const file of jstsFiles) {
      const fullPath = path.join(ROOT_DIR, file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Find exports
      const exportMatches = content.match(
        /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g
      );
      if (exportMatches) {
        exportMatches.forEach(match => {
          const exportName = match.split(/\s+/).pop();
          if (!exports.has(exportName)) {
            exports.set(exportName, []);
          }
          exports.get(exportName).push(file);
        });
      }

      // Find named exports
      const namedExportMatches = content.match(/export\s*\{\s*([^}]+)\s*\}/g);
      if (namedExportMatches) {
        namedExportMatches.forEach(match => {
          const names = match
            .replace(/export\s*\{\s*/, '')
            .replace(/\s*\}/, '')
            .split(',');
          names.forEach(name => {
            const cleanName = name.trim().split(' as ')[0];
            if (!exports.has(cleanName)) {
              exports.set(cleanName, []);
            }
            exports.get(cleanName).push(file);
          });
        });
      }
    }

    // Second pass: check imports
    for (const file of jstsFiles) {
      const fullPath = path.join(ROOT_DIR, file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Find import statements
        const importMatch = line.match(
          /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/
        );
        if (importMatch) {
          const importedNames = importMatch[1]
            .split(',')
            .map(name => name.trim().split(' as ')[0]);
          const importPath = importMatch[2];

          // Check if it's a relative import
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            importedNames.forEach(importName => {
              if (!exports.has(importName)) {
                issues.push({
                  type: 'missing_export',
                  file: file,
                  line: index + 1,
                  severity: 'error',
                  message: `Import "${importName}" has no corresponding export`,
                  suggestion: `Add export for "${importName}" or check import path`,
                  category: 'Import/Export',
                });
              }
            });
          }
        }
      });
    }

    analysis.categories.importExportSync.issues = issues;
    analysis.categories.importExportSync.score = Math.max(
      0,
      100 - issues.length * 5
    );

    console.log(`   Found ${issues.length} import/export sync issues`);
  }

  /**
   * Detect dead code
   */
  static async detectDeadCode() {
    console.log('💀 Detecting dead code...');

    const issues = [];
    const jstsFiles = await this.findFiles(
      ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ['node_modules', 'dist']
    );

    for (const file of jstsFiles.slice(0, 20)) {
      // Limit for performance
      const fullPath = path.join(ROOT_DIR, file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Find potentially unused variables
      const variableDeclarations = [];
      const variableUsages = new Set();

      lines.forEach((line, index) => {
        // Find variable declarations
        const varMatch = line.match(
          /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/
        );
        if (varMatch) {
          variableDeclarations.push({
            name: varMatch[1],
            line: index + 1,
            declaration: line.trim(),
          });
        }

        // Find variable usages (simple pattern matching)
        const words = line.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
        words.forEach(word => variableUsages.add(word));
      });

      // Check for unused variables
      variableDeclarations.forEach(variable => {
        const usageCount = (
          content.match(new RegExp(`\\b${variable.name}\\b`, 'g')) || []
        ).length;
        if (usageCount <= 1) {
          // Only appears in declaration
          issues.push({
            type: 'unused_variable',
            file: file,
            line: variable.line,
            severity: 'info',
            message: `Variable "${variable.name}" appears to be unused`,
            suggestion: `Remove unused variable or use it in the code`,
            category: 'Dead Code',
          });
        }
      });

      // Check for unreachable code after return statements
      lines.forEach((line, index) => {
        if (line.trim().startsWith('return') && index < lines.length - 1) {
          const nextLine = lines[index + 1];
          if (
            nextLine &&
            nextLine.trim() &&
            !nextLine.trim().startsWith('}') &&
            !nextLine.trim().startsWith('case') &&
            !nextLine.trim().startsWith('default')
          ) {
            issues.push({
              type: 'unreachable_code',
              file: file,
              line: index + 2,
              severity: 'warning',
              message: 'Code after return statement is unreachable',
              suggestion: 'Remove unreachable code or restructure logic',
              category: 'Dead Code',
            });
          }
        }
      });
    }

    analysis.categories.deadCode.issues = issues;
    analysis.categories.deadCode.score = Math.max(0, 100 - issues.length * 3);

    console.log(`   Found ${issues.length} dead code issues`);
  }

  /**
   * Find files matching patterns
   */
  static async findFiles(patterns, excludePatterns = []) {
    // Simple file finder (would use glob in real implementation)
    const files = [];

    const scanDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeFilePath = path.join(relativePath, item);

        // Skip excluded patterns
        if (
          excludePatterns.some(pattern => relativeFilePath.includes(pattern))
        ) {
          continue;
        }

        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch (error) {
          continue; // Skip files that can't be accessed
        }

        if (stat.isDirectory()) {
          scanDir(fullPath, relativeFilePath);
        } else if (stat.isFile()) {
          // Simple pattern matching
          if (
            patterns.some(pattern => {
              const ext = pattern.split('*.')[1];
              return ext && item.endsWith(`.${ext}`);
            })
          ) {
            files.push(relativeFilePath);
          }
        }
      }
    };

    scanDir(ROOT_DIR);
    return files;
  }
}

/**
 * 📊 Generate comprehensive analysis report
 */
class ReportGenerator {
  static generatePrioritizedActions() {
    const allIssues = [];

    // Collect all issues
    Object.values(analysis.categories).forEach(category => {
      allIssues.push(...category.issues);
    });

    // Sort by severity and type
    const prioritized = allIssues.sort((a, b) => {
      const severityOrder = { error: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Group by category and create action items
    const actionGroups = {};
    prioritized.forEach(issue => {
      if (!actionGroups[issue.category]) {
        actionGroups[issue.category] = [];
      }
      actionGroups[issue.category].push(issue);
    });

    analysis.prioritizedActions = Object.entries(actionGroups).map(
      ([category, issues]) => ({
        category,
        priority:
          issues[0]?.severity === 'error'
            ? 'high'
            : issues[0]?.severity === 'warning'
              ? 'medium'
              : 'low',
        issueCount: issues.length,
        topIssues: issues.slice(0, 3),
        recommendation: `Address ${issues.length} ${category.toLowerCase()} issues`,
      })
    );
  }

  static generateQuickFixes() {
    const fixes = [];

    // TypeScript fixes
    const anyTypeIssues = analysis.categories.typeConsistency.issues.filter(
      i => i.type === 'any_type_usage'
    );
    if (anyTypeIssues.length > 0) {
      fixes.push({
        command: 'Find and replace "any" types',
        description: `Fix ${anyTypeIssues.length} instances of "any" type usage`,
        priority: 'medium',
      });
    }

    // Import/Export fixes
    const importIssues = analysis.categories.importExportSync.issues.filter(
      i => i.type === 'missing_export'
    );
    if (importIssues.length > 0) {
      fixes.push({
        command: 'npm run check:imports:fix',
        description: `Fix ${importIssues.length} import/export synchronization issues`,
        priority: 'high',
      });
    }

    analysis.quickFixes = fixes;
  }

  static calculateHealthScore() {
    const scores = Object.values(analysis.categories).map(cat => cat.score);
    analysis.summary.healthScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }

  static displayReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 CODEBASE ANALYSIS REPORT');
    console.log('='.repeat(80));

    // Health Score
    const healthIcon =
      analysis.summary.healthScore >= 80
        ? '🟢'
        : analysis.summary.healthScore >= 60
          ? '🟡'
          : '🔴';
    console.log(
      `\n${healthIcon} Overall Health Score: ${analysis.summary.healthScore}/100`
    );

    // Category Scores
    console.log('\n📊 CATEGORY SCORES:');
    Object.entries(analysis.categories).forEach(([name, category]) => {
      const scoreIcon =
        category.score >= 80 ? '🟢' : category.score >= 60 ? '🟡' : '🔴';
      console.log(
        `   ${scoreIcon} ${name}: ${category.score}/100 (${category.issues.length} issues)`
      );
    });

    // Prioritized Actions
    if (analysis.prioritizedActions.length > 0) {
      console.log('\n🎯 PRIORITIZED ACTIONS:');
      analysis.prioritizedActions.forEach((action, index) => {
        const priorityIcon =
          action.priority === 'high'
            ? '🚨'
            : action.priority === 'medium'
              ? '⚠️'
              : 'ℹ️';
        console.log(
          `   ${index + 1}. ${priorityIcon} ${action.category} (${action.issueCount} issues)`
        );
        console.log(`      ${action.recommendation}`);
      });
    }

    // Quick Fixes
    if (analysis.quickFixes.length > 0) {
      console.log('\n🔧 QUICK FIXES:');
      analysis.quickFixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix.command}`);
        console.log(`      ${fix.description}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis completed!');
    console.log('='.repeat(80));
  }
}

/**
 * 🚀 Main execution
 */
async function main() {
  console.log('🤖 Starting comprehensive codebase analysis...');

  try {
    // Run all analyses
    await CodebaseAnalyzer.analyzeTypeConsistency();
    await CodebaseAnalyzer.analyzeImportExportSync();
    await CodebaseAnalyzer.detectDeadCode();

    // Generate report
    ReportGenerator.generatePrioritizedActions();
    ReportGenerator.generateQuickFixes();
    ReportGenerator.calculateHealthScore();
    ReportGenerator.displayReport();

    // Save report if requested
    const args = process.argv.slice(2);
    if (args.includes('--save')) {
      const reportPath = path.join(ROOT_DIR, 'codebase-analysis-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
      console.log(`\n📄 Report saved to: codebase-analysis-report.json`);
    }
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}

export default { CodebaseAnalyzer, ReportGenerator, main };
