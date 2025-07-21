#!/usr/bin/env node

/**
 * SSOT Type Generator
 * Automatically generates TypeScript types from database schema
 * Usage: node scripts/generate-types.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  schemaPath: path.join(__dirname, '../packages/shared/db/schema.ts'),
  outputPath: path.join(__dirname, '../packages/types'),
  apiTypesPath: path.join(__dirname, '../packages/types/api.ts'),
  coreTypesPath: path.join(__dirname, '../packages/types/core.ts'),
  backupPath: path.join(__dirname, '../backup/types-backup.json'),
};

// Database table mapping to TypeScript interfaces
const TABLE_MAPPINGS = {
  tenants: 'Tenant',
  hotelProfiles: 'HotelProfile',
  staff: 'Staff',
  call: 'Call',
  transcript: 'Transcript',
  request: 'Request',
  message: 'Message',
  call_summaries: 'CallSummary',
};

class TypeGenerator {
  constructor() {
    this.generatedTypes = [];
    this.apiTypes = [];
    this.timestamp = new Date().toISOString();
  }

  async generateTypes() {
    console.log('🔧 Starting SSOT Type Generation...');

    try {
      // Create backup of current types
      await this.createBackup();

      // Read schema file
      const schemaContent = await this.readSchema();

      // Generate base types from schema
      await this.generateBaseTypes(schemaContent);

      // Generate API types
      await this.generateApiTypes();

      // Generate core utility types
      await this.generateCoreTypes();

      // Write generated types to files
      await this.writeTypesToFiles();

      // Update validation schemas
      await this.updateValidationSchemas();

      console.log('✅ Type generation completed successfully!');
      console.log(
        `📁 Generated files: ${this.generatedTypes.length} type files`
      );
    } catch (error) {
      console.error('❌ Type generation failed:', error);
      await this.restoreBackup();
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('💾 Creating backup of existing types...');

    if (!fs.existsSync(path.dirname(CONFIG.backupPath))) {
      fs.mkdirSync(path.dirname(CONFIG.backupPath), { recursive: true });
    }

    const existingTypes = {};

    // Backup existing type files
    if (fs.existsSync(CONFIG.outputPath)) {
      const files = fs.readdirSync(CONFIG.outputPath);
      for (const file of files) {
        if (file.endsWith('.ts')) {
          const filePath = path.join(CONFIG.outputPath, file);
          existingTypes[file] = fs.readFileSync(filePath, 'utf8');
        }
      }
    }

    // Save backup
    fs.writeFileSync(
      CONFIG.backupPath,
      JSON.stringify(
        {
          timestamp: this.timestamp,
          types: existingTypes,
        },
        null,
        2
      )
    );

    console.log('✅ Backup created successfully');
  }

  async readSchema() {
    console.log('📖 Reading database schema...');

    if (!fs.existsSync(CONFIG.schemaPath)) {
      throw new Error(`Schema file not found: ${CONFIG.schemaPath}`);
    }

    return fs.readFileSync(CONFIG.schemaPath, 'utf8');
  }

  async generateBaseTypes(schemaContent) {
    console.log('🏗️ Generating base types from schema...');

    // Extract table definitions from schema
    const tableMatches = schemaContent.match(
      /export const (\w+) = sqliteTable\("(\w+)", \{([\s\S]*?)\}\);/g
    );

    if (!tableMatches) {
      throw new Error('No table definitions found in schema');
    }

    const baseTypes = [];

    for (const match of tableMatches) {
      const [, tableName, dbTableName, tableFields] = match.match(
        /export const (\w+) = sqliteTable\("(\w+)", \{([\s\S]*?)\}\);/
      );

      // Generate interface for table
      const interfaceName =
        TABLE_MAPPINGS[tableName] || this.capitalize(tableName);
      const typeDefinition = this.generateInterfaceFromTable(
        interfaceName,
        tableFields
      );

      baseTypes.push({
        name: interfaceName,
        type: 'interface',
        definition: typeDefinition,
        tableName: dbTableName,
        schemaName: tableName,
      });

      // Generate insert type
      const insertType = this.generateInsertType(interfaceName, tableFields);
      baseTypes.push({
        name: `Insert${interfaceName}`,
        type: 'type',
        definition: insertType,
        tableName: dbTableName,
        schemaName: tableName,
      });
    }

    this.generatedTypes.push(...baseTypes);
    console.log(`✅ Generated ${baseTypes.length} base types`);
  }

  generateInterfaceFromTable(interfaceName, tableFields) {
    const fields = this.parseTableFields(tableFields);

    const fieldLines = fields.map(field => {
      const optional = field.isOptional ? '?' : '';
      const nullableUnion = field.nullable ? ' | null' : '';
      return `  ${field.name}${optional}: ${field.type}${nullableUnion};`;
    });

    return `export interface ${interfaceName} {
${fieldLines.join('\n')}
}`;
  }

  generateInsertType(interfaceName, tableFields) {
    const fields = this.parseTableFields(tableFields);

    const requiredFields = fields.filter(f => !f.isOptional && !f.hasDefault);
    const optionalFields = fields.filter(f => f.isOptional || f.hasDefault);

    const requiredLines = requiredFields.map(f => `  ${f.name}: ${f.type};`);
    const optionalLines = optionalFields.map(f => `  ${f.name}?: ${f.type};`);

    const allLines = [...requiredLines, ...optionalLines];

    return `export type Insert${interfaceName} = {
${allLines.join('\n')}
};`;
  }

  parseTableFields(tableFieldsStr) {
    const fields = [];

    // Simple field parsing - can be enhanced
    const fieldMatches = tableFieldsStr.match(/(\w+):\s*\w+\([^)]*\)([^,]*)/g);

    if (fieldMatches) {
      for (const fieldMatch of fieldMatches) {
        const [, fieldName] = fieldMatch.match(/(\w+):/);

        // Determine TypeScript type based on SQL type
        let tsType = 'string';
        if (fieldMatch.includes('integer(')) tsType = 'number';
        if (fieldMatch.includes('real(')) tsType = 'number';
        if (fieldMatch.includes('boolean')) tsType = 'boolean';
        if (fieldMatch.includes('json')) tsType = 'Record<string, any>';
        if (fieldMatch.includes('timestamp')) tsType = 'Date | string';

        // Check for optional/nullable
        const isOptional =
          fieldMatch.includes('.default(') ||
          fieldMatch.includes('.primaryKey()');
        const nullable = !fieldMatch.includes('.notNull()');

        fields.push({
          name: fieldName,
          type: tsType,
          isOptional,
          nullable,
          hasDefault: fieldMatch.includes('.default('),
        });
      }
    }

    return fields;
  }

  async generateApiTypes() {
    console.log('🌐 Generating API types...');

    const apiTypes = [
      this.generateApiResponseTypes(),
      this.generateApiRequestTypes(),
      this.generateApiErrorTypes(),
      this.generatePaginationTypes(),
    ].join('\n\n');

    this.apiTypes.push({
      name: 'api.ts',
      content: `// Auto-generated API types - DO NOT EDIT MANUALLY
// Generated on: ${this.timestamp}
// Generator: scripts/generate-types.js

${apiTypes}`,
    });

    console.log('✅ API types generated');
  }

  generateApiResponseTypes() {
    return `// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  code?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}`;
  }

  generateApiRequestTypes() {
    return `// API Request Types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredRequest {
  filters?: Record<string, any>;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiRequest extends PaginatedRequest, FilteredRequest {
  tenantId?: string;
}`;
  }

  generateApiErrorTypes() {
    return `// API Error Types
export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUBSCRIPTION_LIMIT_EXCEEDED'
  | 'FEATURE_NOT_AVAILABLE'
  | 'EXTERNAL_API_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

export interface DetailedApiError {
  code: ApiErrorCode;
  message: string;
  field?: string;
  details?: Record<string, any>;
}`;
  }

  generatePaginationTypes() {
    return `// Pagination Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationInfo;
}`;
  }

  async generateCoreTypes() {
    console.log('🎯 Generating core utility types...');

    const coreTypes = `// Auto-generated core types - DO NOT EDIT MANUALLY
// Generated on: ${this.timestamp}
// Generator: scripts/generate-types.js

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Database Types
export type DatabaseTable = ${Object.keys(TABLE_MAPPINGS)
      .map(k => `'${k}'`)
      .join(' | ')};
export type EntityType = ${Object.values(TABLE_MAPPINGS)
      .map(v => `'${v}'`)
      .join(' | ')};

// Subscription Types
export type SubscriptionPlan = 'trial' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

// User Role Types
export type UserRole = 'hotel-manager' | 'front-desk' | 'it-manager';

// Permission Types
export interface Permission {
  module: string;
  action: string;
  allowed: boolean;
}

// Feature Flags
export interface FeatureFlags {
  voiceCloning: boolean;
  multiLocation: boolean;
  whiteLabel: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  bulkOperations: boolean;
}

// Tenant Configuration
export interface TenantLimits {
  maxVoices: number;
  maxLanguages: number;
  monthlyCallLimit: number;
  dataRetentionDays: number;
  maxStaffUsers: number;
  maxHotelLocations: number;
}

// Service Health Types
export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface ServiceHealth {
  status: ServiceStatus;
  lastChecked: string;
  responseTime?: number;
  uptime?: number;
  errorRate?: number;
}`;

    this.apiTypes.push({
      name: 'core.ts',
      content: coreTypes,
    });

    console.log('✅ Core types generated');
  }

  async writeTypesToFiles() {
    console.log('📝 Writing generated types to files...');

    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputPath)) {
      fs.mkdirSync(CONFIG.outputPath, { recursive: true });
    }

    // Write base types
    const baseTypesContent = `// Auto-generated database types - DO NOT EDIT MANUALLY
// Generated on: ${this.timestamp}
// Generator: scripts/generate-types.js

${this.generatedTypes.map(type => type.definition).join('\n\n')}

// Export all types
${this.generatedTypes.map(type => `export type { ${type.name} };`).join('\n')}
`;

    fs.writeFileSync(
      path.join(CONFIG.outputPath, 'database.ts'),
      baseTypesContent
    );

    // Write API and core types
    for (const apiType of this.apiTypes) {
      fs.writeFileSync(
        path.join(CONFIG.outputPath, apiType.name),
        apiType.content
      );
    }

    // Generate index file
    const indexContent = `// Auto-generated index - DO NOT EDIT MANUALLY
// Generated on: ${this.timestamp}

export * from './database';
export * from './api';
export * from './core';
`;

    fs.writeFileSync(path.join(CONFIG.outputPath, 'index.ts'), indexContent);

    console.log('✅ All type files written successfully');
  }

  async updateValidationSchemas() {
    console.log('🔍 Updating validation schemas...');

    // This will be implemented when we create the validation schemas
    console.log('ℹ️ Validation schema updates will be implemented in Phase 4');
  }

  async restoreBackup() {
    console.log('🔄 Restoring backup...');

    try {
      if (fs.existsSync(CONFIG.backupPath)) {
        const backup = JSON.parse(fs.readFileSync(CONFIG.backupPath, 'utf8'));

        // Restore each file
        for (const [filename, content] of Object.entries(backup.types)) {
          const filePath = path.join(CONFIG.outputPath, filename);
          fs.writeFileSync(filePath, content);
        }

        console.log('✅ Backup restored successfully');
      }
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Helper functions
function handleError(error) {
  console.error('❌ Type generation error:', error);
  process.exit(1);
}

// Main execution
if (require.main === module) {
  const generator = new TypeGenerator();
  generator.generateTypes().catch(handleError);
}

module.exports = TypeGenerator;
