#!/usr/bin/env node

/**
 * SSOT Consistency Validator
 * Validates consistency between database schema, types, and API endpoints
 * Usage: node scripts/validate-ssot.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  schemaPath: path.join(__dirname, '../packages/shared/db/schema.ts'),
  typesPath: path.join(__dirname, '../packages/types'),
  validationSchemasPath: path.join(
    __dirname,
    '../packages/shared/validation/schemas.ts'
  ),
  routesPath: path.join(__dirname, '../apps/server/routes'),
  frontendTypesPath: path.join(__dirname, '../apps/client/src/types'),
  reportPath: path.join(__dirname, '../validation-report.json'),
  configPath: path.join(__dirname, '../ssot-config.json'),
};

// Validation rules and patterns
const VALIDATION_RULES = {
  tableNaming: /^[a-z_][a-z0-9_]*$/,
  typeNaming: /^[A-Z][A-Za-z0-9]*$/,
  apiPath: /^\/api\/[a-z-]+/,
  schemaExport: /^[A-Z][A-Za-z0-9]*Schema$/,
};

class SSOTValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.validationResults = {
      schema: { valid: true, issues: [] },
      types: { valid: true, issues: [] },
      api: { valid: true, issues: [] },
      consistency: { valid: true, issues: [] },
    };
    this.dbTables = new Set();
    this.generatedTypes = new Set();
    this.apiEndpoints = new Set();
    this.validationSchemas = new Set();
    this.timestamp = new Date().toISOString();
  }

  async validateSSot() {
    console.log('🔍 Starting SSOT Consistency Validation...');

    try {
      // Load SSOT configuration
      await this.loadConfiguration();

      // Validate database schema
      await this.validateDatabaseSchema();

      // Validate generated types
      await this.validateGeneratedTypes();

      // Validate API endpoints
      await this.validateApiEndpoints();

      // Validate validation schemas
      await this.validateValidationSchemas();

      // Cross-reference validation
      await this.validateConsistency();

      // Generate validation report
      await this.generateValidationReport();

      // Suggest fixes
      await this.generateSuggestions();

      const hasErrors = this.errors.length > 0;
      const hasWarnings = this.warnings.length > 0;

      if (hasErrors) {
        console.log(
          `❌ SSOT validation failed with ${this.errors.length} errors`
        );
        console.log(`⚠️  ${this.warnings.length} warnings found`);
        process.exit(1);
      } else if (hasWarnings) {
        console.log(
          `⚠️  SSOT validation passed with ${this.warnings.length} warnings`
        );
        console.log(
          `💡 ${this.suggestions.length} suggestions for improvement`
        );
      } else {
        console.log('✅ SSOT validation passed - all systems consistent!');
      }
    } catch (error) {
      console.error('❌ SSOT validation failed:', error);
      this.addError('validation', 'Fatal validation error', error.message);
      process.exit(1);
    }
  }

  async loadConfiguration() {
    console.log('⚙️ Loading SSOT configuration...');

    if (fs.existsSync(CONFIG.configPath)) {
      const configContent = fs.readFileSync(CONFIG.configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } else {
      // Create default configuration
      this.config = {
        version: '1.0.0',
        rules: {
          enforceNamingConventions: true,
          requireDocumentation: true,
          validateTypeMapping: true,
          checkBreakingChanges: true,
          enforceAPIConsistency: true,
        },
        exceptions: {
          legacyTables: ['users', 'orders'], // Tables that may not follow conventions
          deprecatedEndpoints: [],
          allowedInconsistencies: [],
        },
        thresholds: {
          maxErrors: 0,
          maxWarnings: 10,
          minCoverage: 90,
        },
      };

      fs.writeFileSync(CONFIG.configPath, JSON.stringify(this.config, null, 2));
    }

    console.log('✅ Configuration loaded');
  }

  async validateDatabaseSchema() {
    console.log('🗄️ Validating database schema...');

    if (!fs.existsSync(CONFIG.schemaPath)) {
      this.addError(
        'schema',
        'Database schema file not found',
        CONFIG.schemaPath
      );
      return;
    }

    const schemaContent = fs.readFileSync(CONFIG.schemaPath, 'utf8');

    // Extract table definitions
    const tableMatches = schemaContent.match(
      /export const (\w+) = sqliteTable\("(\w+)", \{([\s\S]*?)\}\);/g
    );

    if (!tableMatches) {
      this.addError('schema', 'No table definitions found in schema');
      return;
    }

    for (const match of tableMatches) {
      const [, tableName, dbTableName, tableFields] = match.match(
        /export const (\w+) = sqliteTable\("(\w+)", \{([\s\S]*?)\}\);/
      );

      this.dbTables.add(tableName);

      // Validate naming conventions
      if (this.config.rules.enforceNamingConventions) {
        if (!VALIDATION_RULES.tableNaming.test(dbTableName)) {
          this.addWarning(
            'schema',
            `Table name '${dbTableName}' doesn't follow snake_case convention`
          );
        }

        if (!VALIDATION_RULES.typeNaming.test(tableName)) {
          this.addWarning(
            'schema',
            `Table export '${tableName}' doesn't follow PascalCase convention`
          );
        }
      }

      // Validate table structure
      await this.validateTableStructure(tableName, dbTableName, tableFields);
    }

    // Check for required tables
    const requiredTables = [
      'tenants',
      'staff',
      'call',
      'transcript',
      'request',
    ];
    for (const required of requiredTables) {
      if (!this.dbTables.has(required)) {
        this.addError(
          'schema',
          `Required table '${required}' not found in schema`
        );
      }
    }

    console.log(`✅ Validated ${this.dbTables.size} database tables`);
  }

  async validateTableStructure(tableName, dbTableName, tableFields) {
    // Check for required fields
    const requiredFields = {
      tenants: ['id', 'hotel_name', 'subdomain'],
      staff: ['id', 'username', 'password', 'role', 'tenant_id'],
      call: ['id', 'tenant_id'],
      transcript: ['id', 'call_id', 'role', 'content', 'tenant_id'],
      request: ['id', 'tenant_id'],
      message: ['id', 'tenant_id'],
    };

    const expectedFields = requiredFields[tableName];
    if (expectedFields) {
      for (const field of expectedFields) {
        if (!tableFields.includes(field)) {
          this.addError(
            'schema',
            `Required field '${field}' missing from table '${tableName}'`
          );
        }
      }
    }

    // Check for tenant_id in multi-tenant tables
    const multiTenantTables = [
      'staff',
      'call',
      'transcript',
      'request',
      'message',
    ];
    if (
      multiTenantTables.includes(tableName) &&
      !tableFields.includes('tenant_id')
    ) {
      this.addError(
        'schema',
        `Multi-tenant table '${tableName}' missing tenant_id field`
      );
    }

    // Validate field definitions
    const fieldMatches = tableFields.match(/(\w+):\s*\w+\([^)]*\)([^,]*)/g);
    if (fieldMatches) {
      for (const fieldMatch of fieldMatches) {
        const [, fieldName] = fieldMatch.match(/(\w+):/);

        // Check for proper foreign key references
        if (fieldName === 'tenant_id' && !fieldMatch.includes('.references(')) {
          this.addWarning(
            'schema',
            `Field '${fieldName}' in '${tableName}' should reference tenants table`
          );
        }

        // Check for proper indexes on foreign keys
        if (fieldName.endsWith('_id') && !fieldMatch.includes('.index(')) {
          this.addSuggestion(
            'schema',
            `Consider adding index to foreign key '${fieldName}' in '${tableName}'`
          );
        }
      }
    }
  }

  async validateGeneratedTypes() {
    console.log('📝 Validating generated types...');

    if (!fs.existsSync(CONFIG.typesPath)) {
      this.addError(
        'types',
        'Generated types directory not found',
        CONFIG.typesPath
      );
      return;
    }

    const typeFiles = ['database.ts', 'api.ts', 'core.ts', 'index.ts'];

    for (const typeFile of typeFiles) {
      const filePath = path.join(CONFIG.typesPath, typeFile);

      if (!fs.existsSync(filePath)) {
        this.addError('types', `Generated type file '${typeFile}' not found`);
        continue;
      }

      await this.validateTypeFile(filePath, typeFile);
    }

    console.log(`✅ Validated ${typeFiles.length} type files`);
  }

  async validateTypeFile(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for auto-generated header
    if (
      !content.includes('Auto-generated') ||
      !content.includes('DO NOT EDIT MANUALLY')
    ) {
      this.addWarning(
        'types',
        `Type file '${fileName}' missing auto-generated header`
      );
    }

    // Extract type definitions
    const interfaceMatches = content.match(/export interface (\w+)/g);
    const typeMatches = content.match(/export type (\w+)/g);

    if (interfaceMatches) {
      for (const match of interfaceMatches) {
        const [, typeName] = match.match(/export interface (\w+)/);
        this.generatedTypes.add(typeName);

        // Validate naming conventions
        if (
          this.config.rules.enforceNamingConventions &&
          !VALIDATION_RULES.typeNaming.test(typeName)
        ) {
          this.addWarning(
            'types',
            `Interface '${typeName}' doesn't follow PascalCase convention`
          );
        }
      }
    }

    if (typeMatches) {
      for (const match of typeMatches) {
        const [, typeName] = match.match(/export type (\w+)/);
        this.generatedTypes.add(typeName);

        // Validate naming conventions
        if (
          this.config.rules.enforceNamingConventions &&
          !VALIDATION_RULES.typeNaming.test(typeName)
        ) {
          this.addWarning(
            'types',
            `Type '${typeName}' doesn't follow PascalCase convention`
          );
        }
      }
    }
  }

  async validateApiEndpoints() {
    console.log('🌐 Validating API endpoints...');

    if (!fs.existsSync(CONFIG.routesPath)) {
      this.addError('api', 'Routes directory not found', CONFIG.routesPath);
      return;
    }

    const routeFiles = fs
      .readdirSync(CONFIG.routesPath)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'));

    for (const routeFile of routeFiles) {
      const filePath = path.join(CONFIG.routesPath, routeFile);
      await this.validateRouteFile(filePath, routeFile);
    }

    console.log(`✅ Validated ${this.apiEndpoints.size} API endpoints`);
  }

  async validateRouteFile(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Find route definitions
      const routeMatch = line.match(
        /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/
      );
      if (routeMatch) {
        const [, method, path] = routeMatch;
        const endpointKey = `${method.toUpperCase()} ${path}`;
        this.apiEndpoints.add(endpointKey);

        // Validate endpoint structure
        await this.validateEndpoint(method, path, lines, i, fileName);
      }
    }
  }

  async validateEndpoint(method, path, lines, lineIndex, fileName) {
    // Validate path structure
    if (this.config.rules.enforceAPIConsistency) {
      if (!path.startsWith('/') && path !== '') {
        this.addWarning(
          'api',
          `Endpoint path '${path}' should start with '/' in ${fileName}`
        );
      }

      // Check for consistent naming
      if (path.includes('_')) {
        this.addWarning(
          'api',
          `Endpoint path '${path}' should use kebab-case instead of snake_case`
        );
      }
    }

    // Check for proper error handling
    const handlerStart = lineIndex;
    let handlerEnd = handlerStart;
    let braceCount = 0;

    // Find handler end
    for (let i = handlerStart; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (braceCount === 0 && i > handlerStart) {
        handlerEnd = i;
        break;
      }
    }

    const handlerContent = lines.slice(handlerStart, handlerEnd + 1).join('\n');

    // Check for try-catch blocks
    if (!handlerContent.includes('try') || !handlerContent.includes('catch')) {
      this.addWarning(
        'api',
        `Endpoint '${method} ${path}' missing try-catch error handling`
      );
    }

    // Check for input validation
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (
        !handlerContent.includes('.parse(') &&
        !handlerContent.includes('.safeParse(')
      ) {
        this.addWarning(
          'api',
          `Endpoint '${method} ${path}' missing input validation`
        );
      }
    }

    // Check for authentication middleware
    const authRequired =
      handlerContent.includes('req.user') ||
      handlerContent.includes('req.tenant');
    const hasAuthMiddleware =
      lines[lineIndex].includes('verifyJWT') ||
      lines[lineIndex].includes('authenticateToken');

    if (authRequired && !hasAuthMiddleware) {
      this.addWarning(
        'api',
        `Endpoint '${method} ${path}' uses authentication but missing auth middleware`
      );
    }

    // Check for tenant isolation in multi-tenant endpoints
    if (
      handlerContent.includes('req.tenant') &&
      !handlerContent.includes('tenant_id')
    ) {
      this.addSuggestion(
        'api',
        `Endpoint '${method} ${path}' should filter by tenant_id for data isolation`
      );
    }
  }

  async validateValidationSchemas() {
    console.log('📋 Validating validation schemas...');

    if (!fs.existsSync(CONFIG.validationSchemasPath)) {
      this.addError(
        'validation',
        'Validation schemas file not found',
        CONFIG.validationSchemasPath
      );
      return;
    }

    const content = fs.readFileSync(CONFIG.validationSchemasPath, 'utf8');

    // Extract schema exports
    const schemaMatches = content.match(/export const (\w+Schema) = z\./g);

    if (schemaMatches) {
      for (const match of schemaMatches) {
        const [, schemaName] = match.match(/export const (\w+Schema)/);
        this.validationSchemas.add(schemaName);

        // Validate naming conventions
        if (
          this.config.rules.enforceNamingConventions &&
          !VALIDATION_RULES.schemaExport.test(schemaName)
        ) {
          this.addWarning(
            'validation',
            `Schema '${schemaName}' doesn't follow naming convention (should end with 'Schema')`
          );
        }
      }
    }

    // Check for required schemas
    const requiredSchemas = [
      'LoginSchema',
      'CreateTenantSchema',
      'UpdateTenantSchema',
    ];
    for (const required of requiredSchemas) {
      if (!this.validationSchemas.has(required)) {
        this.addWarning(
          'validation',
          `Expected validation schema '${required}' not found`
        );
      }
    }

    console.log(
      `✅ Validated ${this.validationSchemas.size} validation schemas`
    );
  }

  async validateConsistency() {
    console.log('🔄 Validating cross-system consistency...');

    // Check if types exist for all database tables
    if (this.config.rules.validateTypeMapping) {
      for (const tableName of this.dbTables) {
        const expectedType = this.capitalizeFirst(tableName);
        const expectedInsertType = `Insert${expectedType}`;

        if (!this.generatedTypes.has(expectedType)) {
          this.addError(
            'consistency',
            `Type '${expectedType}' not generated for table '${tableName}'`
          );
        }

        if (!this.generatedTypes.has(expectedInsertType)) {
          this.addError(
            'consistency',
            `Insert type '${expectedInsertType}' not generated for table '${tableName}'`
          );
        }
      }
    }

    // Check for orphaned types (types without corresponding tables)
    const tableTypes = Array.from(this.dbTables).map(t =>
      this.capitalizeFirst(t)
    );
    for (const generatedType of this.generatedTypes) {
      if (generatedType.startsWith('Insert')) continue;
      if (
        ['ApiResponse', 'ApiRequest', 'PaginationInfo'].includes(generatedType)
      )
        continue;

      if (!tableTypes.includes(generatedType)) {
        this.addWarning(
          'consistency',
          `Generated type '${generatedType}' has no corresponding database table`
        );
      }
    }

    // Validate API endpoint coverage
    const expectedEndpoints = [
      'POST /login',
      'GET /health',
      'GET /dashboard/hotel-profile',
      'POST /dashboard/research-hotel',
      'POST /dashboard/generate-assistant',
    ];

    for (const expected of expectedEndpoints) {
      if (!this.apiEndpoints.has(expected)) {
        this.addWarning(
          'consistency',
          `Expected API endpoint '${expected}' not found`
        );
      }
    }

    console.log('✅ Cross-system consistency validation completed');
  }

  async generateValidationReport() {
    console.log('📊 Generating validation report...');

    const report = {
      timestamp: this.timestamp,
      version: this.config.version,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalSuggestions: this.suggestions.length,
        overallStatus: this.errors.length === 0 ? 'PASSED' : 'FAILED',
      },
      coverage: {
        dbTables: this.dbTables.size,
        generatedTypes: this.generatedTypes.size,
        apiEndpoints: this.apiEndpoints.size,
        validationSchemas: this.validationSchemas.size,
      },
      results: this.validationResults,
      issues: {
        errors: this.errors,
        warnings: this.warnings,
        suggestions: this.suggestions,
      },
      configuration: this.config,
    };

    fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));

    console.log(`📁 Validation report saved to: ${CONFIG.reportPath}`);
  }

  async generateSuggestions() {
    console.log('💡 Generating improvement suggestions...');

    // Performance suggestions
    if (this.dbTables.size > 10) {
      this.addSuggestion(
        'performance',
        'Consider implementing database indexing strategy for better performance'
      );
    }

    // Security suggestions
    const hasAuthEndpoints = Array.from(this.apiEndpoints).some(e =>
      e.includes('/auth/')
    );
    if (hasAuthEndpoints) {
      this.addSuggestion(
        'security',
        'Ensure all authentication endpoints implement rate limiting'
      );
    }

    // Documentation suggestions
    if (this.config.rules.requireDocumentation) {
      const undocumentedEndpoints = Array.from(this.apiEndpoints).length;
      if (undocumentedEndpoints > 0) {
        this.addSuggestion(
          'documentation',
          `Consider adding JSDoc comments to ${undocumentedEndpoints} API endpoints`
        );
      }
    }

    // Type safety suggestions
    const typesCoverage = (this.generatedTypes.size / this.dbTables.size) * 100;
    if (typesCoverage < this.config.thresholds.minCoverage) {
      this.addSuggestion(
        'types',
        `Type coverage is ${typesCoverage.toFixed(1)}%, consider generating more types`
      );
    }
  }

  addError(category, message, details = null) {
    this.errors.push({
      category,
      message,
      details,
      timestamp: new Date().toISOString(),
    });

    this.validationResults[category] = this.validationResults[category] || {
      valid: true,
      issues: [],
    };
    this.validationResults[category].valid = false;
    this.validationResults[category].issues.push({
      type: 'error',
      message,
      details,
    });
  }

  addWarning(category, message, details = null) {
    this.warnings.push({
      category,
      message,
      details,
      timestamp: new Date().toISOString(),
    });

    this.validationResults[category] = this.validationResults[category] || {
      valid: true,
      issues: [],
    };
    this.validationResults[category].issues.push({
      type: 'warning',
      message,
      details,
    });
  }

  addSuggestion(category, message, details = null) {
    this.suggestions.push({
      category,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Utility functions
function printValidationSummary(validator) {
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total Errors: ${validator.errors.length}`);
  console.log(`Total Warnings: ${validator.warnings.length}`);
  console.log(`Total Suggestions: ${validator.suggestions.length}`);

  if (validator.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    validator.errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.category}] ${error.message}`);
      if (error.details) console.log(`   Details: ${error.details}`);
    });
  }

  if (validator.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    validator.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.category}] ${warning.message}`);
      if (warning.details) console.log(`   Details: ${warning.details}`);
    });
  }

  if (validator.suggestions.length > 0) {
    console.log('\n💡 SUGGESTIONS:');
    validator.suggestions.forEach((suggestion, index) => {
      console.log(
        `${index + 1}. [${suggestion.category}] ${suggestion.message}`
      );
      if (suggestion.details) console.log(`   Details: ${suggestion.details}`);
    });
  }

  console.log('═'.repeat(50));
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SSOTValidator();

  validator
    .validateSSot()
    .then(() => {
      printValidationSummary(validator);
    })
    .catch(error => {
      console.error('❌ SSOT validation error:', error);
      printValidationSummary(validator);
      process.exit(1);
    });
}

export default SSOTValidator;
export { SSOTValidator };
