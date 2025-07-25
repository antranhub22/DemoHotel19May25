#!/usr/bin/env node

/**
 * DemoHotel19May Architectural Governance Validator
 *
 * This tool validates architectural decisions and enforces governance rules
 * across the entire codebase to maintain consistency and quality.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// Governance Rules Configuration
const GOVERNANCE_RULES = {
  // SSOT (Single Source of Truth) Rules
  ssot: {
    // Database schema must be primary source
    databaseSchema: {
      primary: 'packages/shared/db/schema.ts',
      secondary: [
        'tools/migrations/',
        'packages/shared/types/core.ts',
        'schemas/dashboard-schema.json',
      ],
    },
    // API routes must be primary source
    apiRoutes: {
      primary: 'apps/server/routes/',
      secondary: [
        'schemas/api-schema.json',
        'packages/shared/types/api.ts',
        'documentation/api/',
      ],
    },
    // UI components must be primary source
    uiComponents: {
      primary: 'apps/client/src/components/',
      secondary: [
        'packages/shared/types/ui.ts',
        'apps/client/src/components/index.ts',
      ],
    },
  },

  // Architecture Patterns
  architecture: {
    // Monorepo structure validation
    structure: {
      required: ['apps/', 'packages/', 'tools/', 'tests/', 'documentation/'],
      apps: ['client/', 'server/'],
      packages: ['shared/', 'config/', 'types/', 'auth-system/'],
    },

    // Import patterns
    imports: {
      // Absolute imports required
      allowedPatterns: [
        '@/', // Client aliases
        '@shared/', // Shared packages
        '@server/', // Server aliases
        '@config/', // Config packages
        '@types/', // Type packages
      ],
      // Forbidden relative imports beyond 2 levels
      forbiddenPatterns: [
        /\.\.\/\.\.\/\.\./, // More than 2 levels up
        /\.\.\/\.\.\/.*\/\.\./, // Complex relative paths
      ],
    },

    // Module boundaries
    boundaries: {
      'apps/client': {
        canImport: ['packages/', 'apps/client/'],
        cannotImport: ['apps/server/'],
      },
      'apps/server': {
        canImport: ['packages/', 'apps/server/'],
        cannotImport: ['apps/client/'],
      },
      'packages/shared': {
        canImport: ['packages/shared/'],
        cannotImport: ['apps/'],
      },
    },
  },

  // Security Rules
  security: {
    // Forbidden patterns for security
    forbidden: [
      /console\.log\(.*password/i,
      /console\.log\(.*secret/i,
      /console\.log\(.*token/i,
      /localStorage\.setItem\(.*password/i,
      /sessionStorage\.setItem\(.*password/i,
      /eval\(/,
      /Function\(/,
      /innerHTML\s*=/,
      /outerHTML\s*=/,
    ],

    // Required security headers
    headers: ['helmet', 'cors', 'rate-limit'],

    // Environment variable validation
    envVars: {
      required: ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET'],
      development: ['VITE_OPENAI_API_KEY', 'VITE_VAPI_PUBLIC_KEY'],
      production: ['PORT', 'STAFF_ACCOUNTS'],
    },
  },

  // Code Quality Rules
  quality: {
    // TypeScript requirements
    typescript: {
      strict: true,
      noImplicitAny: true,
      noImplicitReturns: true,
    },

    // Documentation requirements
    documentation: {
      apiEndpoints: true, // All API endpoints must be documented
      publicMethods: true, // All public methods must have JSDoc
      interfaces: true, // All interfaces must be documented
    },

    // Testing requirements
    testing: {
      minCoverage: 80,
      requiredFor: ['controllers/', 'services/', 'utils/'],
      testFilePattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
    },
  },

  // Multi-tenant Rules
  multiTenant: {
    // Tenant isolation requirements
    isolation: {
      // Database queries must include tenantId
      requiredFilters: ['tenantId'],
      // API routes must validate tenant access
      tenantValidation: true,
      // No cross-tenant data leaks
      dataIsolation: true,
    },

    // Tenant-specific configurations
    configurations: {
      // Each tenant must have isolated config
      isolation: true,
      // Voice assistant per tenant
      voiceAssistants: true,
      // Separate analytics per tenant
      analytics: true,
    },
  },

  // Performance Rules
  performance: {
    // Bundle size limits
    bundles: {
      client: '2MB', // Max client bundle size
      chunks: '500KB', // Max chunk size
    },

    // Database query requirements
    database: {
      indexing: true, // All frequently queried columns must be indexed
      queryLimits: true, // All queries must have limits
      connectionPooling: true, // Must use connection pooling
    },

    // Caching requirements
    caching: {
      apiResponses: true, // API responses must be cached
      staticAssets: true, // Static assets must be cached
      databaseQueries: true, // Expensive queries must be cached
    },
  },
};

// Validation Results
class ValidationResult {
  constructor() {
    this.passed = [];
    this.failed = [];
    this.warnings = [];
    this.score = 0;
    this.maxScore = 0;
  }

  addPassed(rule, message) {
    this.passed.push({ rule, message });
    this.score += 1;
    this.maxScore += 1;
  }

  addFailed(rule, message, file = null, line = null) {
    this.failed.push({ rule, message, file, line });
    this.maxScore += 1;
  }

  addWarning(rule, message, file = null) {
    this.warnings.push({ rule, message, file });
  }

  getScore() {
    return this.maxScore > 0
      ? Math.round((this.score / this.maxScore) * 100)
      : 0;
  }

  isCompliant() {
    return this.failed.length === 0;
  }
}

// File Scanner
class FileScanner {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];

    if (!existsSync(dirPath)) {
      return files;
    }

    const scan = currentPath => {
      try {
        const items = readdirSync(currentPath);

        for (const item of items) {
          const fullPath = join(currentPath, item);
          try {
            const stat = statSync(fullPath);

            if (
              stat.isDirectory() &&
              !item.startsWith('.') &&
              item !== 'node_modules'
            ) {
              scan(fullPath);
            } else if (stat.isFile()) {
              const ext = extname(item);
              if (extensions.includes(ext)) {
                files.push(fullPath);
              }
            }
          } catch (statError) {
            // Skip files that can't be accessed
            continue;
          }
        }
      } catch (readError) {
        // Skip directories that can't be read
        return;
      }
    };

    scan(dirPath);
    return files;
  }

  readFile(filePath) {
    try {
      return readFileSync(filePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }
}

// Governance Validators
class ArchitecturalGovernance {
  constructor() {
    this.scanner = new FileScanner(PROJECT_ROOT);
    this.result = new ValidationResult();
  }

  async validateAll() {
    console.log('🏛️  Starting Architectural Governance Validation...\n');

    await this.validateSSOT();
    await this.validateArchitecture();
    await this.validateSecurity();
    await this.validateQuality();
    await this.validateMultiTenant();
    await this.validatePerformance();

    return this.result;
  }

  // SSOT Validation
  async validateSSOT() {
    console.log('📋 Validating Single Source of Truth (SSOT)...');

    const ssotRules = GOVERNANCE_RULES.ssot;

    // Check database schema SSOT
    const schemaPath = join(PROJECT_ROOT, ssotRules.databaseSchema.primary);
    if (existsSync(schemaPath)) {
      this.result.addPassed('ssot.database', 'Database schema SSOT exists');

      // Check for schema consistency
      const schemaContent = this.scanner.readFile(schemaPath);
      if (schemaContent && schemaContent.includes('export const')) {
        this.result.addPassed(
          'ssot.database.exports',
          'Database schema properly exports tables'
        );
      } else {
        this.result.addFailed(
          'ssot.database.exports',
          'Database schema missing proper exports',
          schemaPath
        );
      }
    } else {
      this.result.addFailed(
        'ssot.database',
        'Database schema SSOT missing',
        schemaPath
      );
    }

    // Check API routes SSOT
    const apiRoutesPath = join(PROJECT_ROOT, ssotRules.apiRoutes.primary);
    if (existsSync(apiRoutesPath)) {
      this.result.addPassed('ssot.api', 'API routes SSOT directory exists');

      const routeFiles = this.scanner.scanDirectory(apiRoutesPath);
      if (routeFiles.length > 0) {
        this.result.addPassed(
          'ssot.api.files',
          `Found ${routeFiles.length} API route files`
        );
      } else {
        this.result.addWarning(
          'ssot.api.files',
          'No API route files found',
          apiRoutesPath
        );
      }
    } else {
      this.result.addFailed(
        'ssot.api',
        'API routes SSOT directory missing',
        apiRoutesPath
      );
    }

    // Check UI components SSOT
    const uiComponentsPath = join(PROJECT_ROOT, ssotRules.uiComponents.primary);
    if (existsSync(uiComponentsPath)) {
      this.result.addPassed('ssot.ui', 'UI components SSOT directory exists');

      const componentFiles = this.scanner.scanDirectory(uiComponentsPath);
      if (componentFiles.length > 0) {
        this.result.addPassed(
          'ssot.ui.files',
          `Found ${componentFiles.length} component files`
        );
      } else {
        this.result.addWarning(
          'ssot.ui.files',
          'No UI component files found',
          uiComponentsPath
        );
      }
    } else {
      this.result.addFailed(
        'ssot.ui',
        'UI components SSOT directory missing',
        uiComponentsPath
      );
    }
  }

  // Architecture Validation
  async validateArchitecture() {
    console.log('🏗️  Validating Architecture Patterns...');

    const archRules = GOVERNANCE_RULES.architecture;

    // Check monorepo structure
    for (const required of archRules.structure.required) {
      const dirPath = join(PROJECT_ROOT, required);
      if (existsSync(dirPath)) {
        this.result.addPassed(
          'arch.structure',
          `Required directory exists: ${required}`
        );
      } else {
        this.result.addFailed(
          'arch.structure',
          `Required directory missing: ${required}`,
          dirPath
        );
      }
    }

    // Check import patterns
    const allFiles = [
      ...this.scanner.scanDirectory(join(PROJECT_ROOT, 'apps/client/src')),
      ...this.scanner.scanDirectory(join(PROJECT_ROOT, 'apps/server')),
      ...this.scanner.scanDirectory(join(PROJECT_ROOT, 'packages')),
    ];

    let importViolations = 0;
    for (const file of allFiles) {
      const content = this.scanner.readFile(file);
      if (content) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('import') && line.includes('from')) {
            // Check for forbidden relative imports
            for (const pattern of archRules.imports.forbiddenPatterns) {
              if (pattern.test(line)) {
                importViolations++;
                this.result.addFailed(
                  'arch.imports.relative',
                  `Forbidden relative import: ${line.trim()}`,
                  relative(PROJECT_ROOT, file),
                  i + 1
                );
              }
            }
          }
        }
      }
    }

    if (importViolations === 0) {
      this.result.addPassed(
        'arch.imports',
        'No forbidden import patterns found'
      );
    }

    // Check module boundaries
    await this.validateModuleBoundaries(archRules.boundaries);
  }

  async validateModuleBoundaries(boundaries) {
    for (const [module, rules] of Object.entries(boundaries)) {
      const modulePath = join(PROJECT_ROOT, module);
      if (existsSync(modulePath)) {
        const files = this.scanner.scanDirectory(modulePath);

        for (const file of files) {
          const content = this.scanner.readFile(file);
          if (content) {
            const imports = this.extractImports(content);

            for (const importPath of imports) {
              // Check if import violates boundaries
              const isViolation = rules.cannotImport?.some(forbidden =>
                importPath.includes(forbidden)
              );

              if (isViolation) {
                this.result.addFailed(
                  'arch.boundaries',
                  `Module boundary violation: ${module} importing from forbidden path: ${importPath}`,
                  relative(PROJECT_ROOT, file)
                );
              }
            }
          }
        }

        this.result.addPassed(
          'arch.boundaries',
          `Module boundaries checked for ${module}`
        );
      }
    }
  }

  extractImports(content) {
    const imports = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const importMatch = line.match(/import.*from\s+['"`]([^'"`]+)['"`]/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }
    }

    return imports;
  }

  // Security Validation
  async validateSecurity() {
    console.log('🔒 Validating Security Rules...');

    const securityRules = GOVERNANCE_RULES.security;

    // Check for forbidden security patterns
    const allFiles = [
      ...this.scanner.scanDirectory(join(PROJECT_ROOT, 'apps')),
      ...this.scanner.scanDirectory(join(PROJECT_ROOT, 'packages')),
    ];

    let securityViolations = 0;
    for (const file of allFiles) {
      const content = this.scanner.readFile(file);
      if (content) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          for (const pattern of securityRules.forbidden) {
            if (pattern.test(line)) {
              securityViolations++;
              this.result.addFailed(
                'security.forbidden',
                `Security violation: ${line.trim()}`,
                relative(PROJECT_ROOT, file),
                i + 1
              );
            }
          }
        }
      }
    }

    if (securityViolations === 0) {
      this.result.addPassed(
        'security.patterns',
        'No security violations found'
      );
    }

    // Check for required security headers
    const serverIndexPath = join(PROJECT_ROOT, 'apps/server/index.ts');
    if (existsSync(serverIndexPath)) {
      const serverContent = this.scanner.readFile(serverIndexPath);

      for (const header of securityRules.headers) {
        if (serverContent && serverContent.includes(header)) {
          this.result.addPassed(
            'security.headers',
            `Security header implemented: ${header}`
          );
        } else {
          this.result.addFailed(
            'security.headers',
            `Missing security header: ${header}`,
            'apps/server/index.ts'
          );
        }
      }
    }

    // Check environment variables
    const envExamplePath = join(PROJECT_ROOT, '.env.example');
    if (existsSync(envExamplePath)) {
      const envContent = this.scanner.readFile(envExamplePath);

      for (const envVar of securityRules.envVars.required) {
        if (envContent && envContent.includes(envVar)) {
          this.result.addPassed(
            'security.env',
            `Required env var documented: ${envVar}`
          );
        } else {
          this.result.addFailed(
            'security.env',
            `Missing required env var: ${envVar}`,
            '.env.example'
          );
        }
      }
    }
  }

  // Quality Validation
  async validateQuality() {
    console.log('✨ Validating Code Quality...');

    // Check TypeScript configuration
    const tsConfigPath = join(PROJECT_ROOT, 'tsconfig.json');
    if (existsSync(tsConfigPath)) {
      this.result.addPassed(
        'quality.typescript',
        'TypeScript configuration exists'
      );

      try {
        const tsConfigContent = this.scanner.readFile(tsConfigPath);
        // Remove comments from JSON (simple approach)
        const cleanJson = tsConfigContent
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '');
        const tsConfig = JSON.parse(cleanJson);
        if (tsConfig.compilerOptions?.strict) {
          this.result.addPassed(
            'quality.typescript.strict',
            'TypeScript strict mode enabled'
          );
        } else {
          this.result.addFailed(
            'quality.typescript.strict',
            'TypeScript strict mode not enabled',
            'tsconfig.json'
          );
        }
      } catch (parseError) {
        this.result.addWarning(
          'quality.typescript.parse',
          'Could not parse TypeScript configuration',
          'tsconfig.json'
        );
      }
    } else {
      this.result.addFailed(
        'quality.typescript',
        'TypeScript configuration missing',
        'tsconfig.json'
      );
    }

    // Check testing coverage
    const testDirs = [
      'tests/',
      'apps/client/src/__tests__/',
      'apps/server/__tests__/',
    ];
    let testFilesFound = 0;

    for (const testDir of testDirs) {
      const testPath = join(PROJECT_ROOT, testDir);
      if (existsSync(testPath)) {
        const testFiles = this.scanner.scanDirectory(testPath, [
          '.test.ts',
          '.test.tsx',
          '.spec.ts',
          '.spec.tsx',
        ]);
        testFilesFound += testFiles.length;
      }
    }

    if (testFilesFound > 0) {
      this.result.addPassed(
        'quality.testing',
        `Found ${testFilesFound} test files`
      );
    } else {
      this.result.addWarning('quality.testing', 'No test files found');
    }

    // Check documentation
    const docsPath = join(PROJECT_ROOT, 'documentation');
    if (existsSync(docsPath)) {
      this.result.addPassed('quality.docs', 'Documentation directory exists');

      const docFiles = this.scanner.scanDirectory(docsPath, ['.md']);
      if (docFiles.length > 0) {
        this.result.addPassed(
          'quality.docs.files',
          `Found ${docFiles.length} documentation files`
        );
      } else {
        this.result.addWarning(
          'quality.docs.files',
          'No documentation files found'
        );
      }
    } else {
      this.result.addFailed(
        'quality.docs',
        'Documentation directory missing',
        'documentation/'
      );
    }
  }

  // Multi-tenant Validation
  async validateMultiTenant() {
    console.log('🏢 Validating Multi-tenant Architecture...');

    // Check tenant isolation in database schema
    const schemaPath = join(PROJECT_ROOT, 'packages/shared/db/schema.ts');
    if (existsSync(schemaPath)) {
      const schemaContent = this.scanner.readFile(schemaPath);

      if (schemaContent && schemaContent.includes('tenantId')) {
        this.result.addPassed(
          'multitenant.schema',
          'Tenant isolation implemented in schema'
        );
      } else {
        this.result.addFailed(
          'multitenant.schema',
          'Missing tenantId in database schema',
          'packages/shared/db/schema.ts'
        );
      }

      // Check for tenant table
      if (schemaContent && schemaContent.includes('tenants')) {
        this.result.addPassed('multitenant.table', 'Tenants table exists');
      } else {
        this.result.addFailed(
          'multitenant.table',
          'Tenants table missing',
          'packages/shared/db/schema.ts'
        );
      }
    }

    // Check API routes for tenant validation
    const routesPath = join(PROJECT_ROOT, 'apps/server/routes');
    if (existsSync(routesPath)) {
      const routeFiles = this.scanner.scanDirectory(routesPath);
      let tenantValidationFound = false;

      for (const file of routeFiles) {
        const content = this.scanner.readFile(file);
        if (
          content &&
          (content.includes('tenantId') || content.includes('tenant'))
        ) {
          tenantValidationFound = true;
          break;
        }
      }

      if (tenantValidationFound) {
        this.result.addPassed(
          'multitenant.api',
          'Tenant validation found in API routes'
        );
      } else {
        this.result.addWarning(
          'multitenant.api',
          'No tenant validation found in API routes'
        );
      }
    }

    // Check for tenant-specific configurations
    const configPath = join(PROJECT_ROOT, 'packages/config');
    if (existsSync(configPath)) {
      const configFiles = this.scanner.scanDirectory(configPath);
      let tenantConfigFound = false;

      for (const file of configFiles) {
        const content = this.scanner.readFile(file);
        if (content && content.includes('tenant')) {
          tenantConfigFound = true;
          break;
        }
      }

      if (tenantConfigFound) {
        this.result.addPassed(
          'multitenant.config',
          'Tenant-specific configuration found'
        );
      } else {
        this.result.addWarning(
          'multitenant.config',
          'No tenant-specific configuration found'
        );
      }
    }
  }

  // Performance Validation
  async validatePerformance() {
    console.log('⚡ Validating Performance Requirements...');

    // Check for database indexing
    const schemaPath = join(PROJECT_ROOT, 'packages/shared/db/schema.ts');
    if (existsSync(schemaPath)) {
      const schemaContent = this.scanner.readFile(schemaPath);

      if (schemaContent && schemaContent.includes('index')) {
        this.result.addPassed('performance.indexing', 'Database indexes found');
      } else {
        this.result.addWarning(
          'performance.indexing',
          'No database indexes found',
          'packages/shared/db/schema.ts'
        );
      }
    }

    // Check for caching implementation
    const serverFiles = this.scanner.scanDirectory(
      join(PROJECT_ROOT, 'apps/server')
    );
    let cachingFound = false;

    for (const file of serverFiles) {
      const content = this.scanner.readFile(file);
      if (content && (content.includes('cache') || content.includes('Cache'))) {
        cachingFound = true;
        break;
      }
    }

    if (cachingFound) {
      this.result.addPassed(
        'performance.caching',
        'Caching implementation found'
      );
    } else {
      this.result.addWarning(
        'performance.caching',
        'No caching implementation found'
      );
    }

    // Check for rate limiting
    const middlewarePath = join(PROJECT_ROOT, 'apps/server/middleware');
    if (existsSync(middlewarePath)) {
      const middlewareFiles = this.scanner.scanDirectory(middlewarePath);
      let rateLimitingFound = false;

      for (const file of middlewareFiles) {
        const content = this.scanner.readFile(file);
        if (
          content &&
          (content.includes('rateLimit') || content.includes('rate-limit'))
        ) {
          rateLimitingFound = true;
          break;
        }
      }

      if (rateLimitingFound) {
        this.result.addPassed(
          'performance.rate-limiting',
          'Rate limiting found'
        );
      } else {
        this.result.addWarning(
          'performance.rate-limiting',
          'No rate limiting found'
        );
      }
    }
  }
}

// Report Generator
class GovernanceReport {
  constructor(result) {
    this.result = result;
  }

  generateConsoleReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🏛️  ARCHITECTURAL GOVERNANCE VALIDATION REPORT');
    console.log('='.repeat(80));

    const score = this.result.getScore();
    const compliance = this.result.isCompliant();

    console.log(
      `\n📊 Overall Score: ${score}% (${this.result.score}/${this.result.maxScore})`
    );
    console.log(
      `🎯 Compliance Status: ${compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`
    );

    if (this.result.passed.length > 0) {
      console.log(`\n✅ PASSED RULES (${this.result.passed.length}):`);
      console.log('-'.repeat(50));
      this.result.passed.forEach(item => {
        console.log(`  ✓ ${item.rule}: ${item.message}`);
      });
    }

    if (this.result.failed.length > 0) {
      console.log(`\n❌ FAILED RULES (${this.result.failed.length}):`);
      console.log('-'.repeat(50));
      this.result.failed.forEach(item => {
        console.log(`  ✗ ${item.rule}: ${item.message}`);
        if (item.file) {
          console.log(
            `    📁 File: ${item.file}${item.line ? `:${item.line}` : ''}`
          );
        }
      });
    }

    if (this.result.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.result.warnings.length}):`);
      console.log('-'.repeat(50));
      this.result.warnings.forEach(item => {
        console.log(`  ⚠  ${item.rule}: ${item.message}`);
        if (item.file) {
          console.log(`    📁 File: ${item.file}`);
        }
      });
    }

    console.log('\n' + '='.repeat(80));

    if (compliance) {
      console.log(
        '🎉 CONGRATULATIONS! Your project is architecturally compliant.'
      );
    } else {
      console.log(
        '📋 Please address the failed rules above to achieve compliance.'
      );
      console.log(
        '💡 Run with --fix flag to auto-fix some issues (coming soon).'
      );
    }

    console.log('='.repeat(80) + '\n');

    return {
      score,
      compliance,
      passed: this.result.passed.length,
      failed: this.result.failed.length,
      warnings: this.result.warnings.length,
    };
  }

  generateJsonReport() {
    return {
      timestamp: new Date().toISOString(),
      score: this.result.getScore(),
      compliance: this.result.isCompliant(),
      summary: {
        passed: this.result.passed.length,
        failed: this.result.failed.length,
        warnings: this.result.warnings.length,
        total: this.result.maxScore,
      },
      details: {
        passed: this.result.passed,
        failed: this.result.failed,
        warnings: this.result.warnings,
      },
      recommendations: this.generateRecommendations(),
    };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.result.failed.some(f => f.rule.includes('ssot'))) {
      recommendations.push({
        category: 'SSOT',
        priority: 'HIGH',
        action: 'Implement Single Source of Truth patterns',
        description:
          'Ensure database schema, API routes, and UI components follow SSOT principles',
      });
    }

    if (this.result.failed.some(f => f.rule.includes('security'))) {
      recommendations.push({
        category: 'Security',
        priority: 'CRITICAL',
        action: 'Address security vulnerabilities',
        description:
          'Remove forbidden patterns and implement required security headers',
      });
    }

    if (this.result.failed.some(f => f.rule.includes('multitenant'))) {
      recommendations.push({
        category: 'Multi-tenant',
        priority: 'HIGH',
        action: 'Implement proper tenant isolation',
        description: 'Ensure all data access is properly scoped to tenants',
      });
    }

    if (this.result.warnings.some(w => w.rule.includes('performance'))) {
      recommendations.push({
        category: 'Performance',
        priority: 'MEDIUM',
        action: 'Optimize performance patterns',
        description: 'Implement caching, indexing, and rate limiting',
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {
    format: args.includes('--json') ? 'json' : 'console',
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose'),
    rules: args
      .find(arg => arg.startsWith('--rules='))
      ?.split('=')[1]
      ?.split(','),
  };

  try {
    const governance = new ArchitecturalGovernance();
    const result = await governance.validateAll();
    const report = new GovernanceReport(result);

    if (options.format === 'json') {
      const jsonReport = report.generateJsonReport();
      if (options.output) {
        import('fs').then(fs => {
          fs.writeFileSync(options.output, JSON.stringify(jsonReport, null, 2));
          console.log(`📄 Report saved to: ${options.output}`);
        });
      } else {
        console.log(JSON.stringify(jsonReport, null, 2));
      }
    } else {
      const summary = report.generateConsoleReport();

      if (options.output) {
        import('fs').then(fs => {
          const reportContent = `Architectural Governance Report
Generated: ${new Date().toISOString()}
Score: ${summary.score}%
Compliance: ${summary.compliance ? 'COMPLIANT' : 'NON-COMPLIANT'}
Passed: ${summary.passed}
Failed: ${summary.failed}
Warnings: ${summary.warnings}
`;
          fs.writeFileSync(options.output, reportContent);
          console.log(`📄 Report saved to: ${options.output}`);
        });
      }
    }

    // Exit with appropriate code
    process.exit(result.isCompliant() ? 0 : 1);
  } catch (error) {
    console.error('❌ Governance validation failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// CLI Help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🏛️  DemoHotel19May Architectural Governance Validator

USAGE:
  node tools/governance/governance-validator.js [options]

OPTIONS:
  --json                  Output results in JSON format
  --output=<file>        Save report to file
  --fix                  Auto-fix issues where possible (coming soon)
  --verbose              Show detailed error information
  --rules=<rules>        Run specific rules only (comma-separated)
  --help, -h             Show this help message

EXAMPLES:
  node tools/governance/governance-validator.js
  node tools/governance/governance-validator.js --json --output=governance-report.json
  node tools/governance/governance-validator.js --rules=ssot,security
  node tools/governance/governance-validator.js --verbose

RULE CATEGORIES:
  - ssot: Single Source of Truth validation
  - architecture: Architecture patterns and boundaries
  - security: Security rules and vulnerabilities
  - quality: Code quality and documentation
  - multitenant: Multi-tenant isolation
  - performance: Performance requirements
`);
  process.exit(0);
}

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('governance-validator.js')) {
  main();
}

export { ArchitecturalGovernance, GOVERNANCE_RULES, GovernanceReport };
