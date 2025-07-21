#!/usr/bin/env node

/**
 * SSOT Breaking Changes Detector
 * Detects breaking changes in schema, API, and types
 * Usage: node scripts/check-breaking-changes.js [--since=commit] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  schemaPath: path.join(__dirname, '../packages/shared/db/schema.ts'),
  validationSchemasPath: path.join(__dirname, '../packages/shared/validation/schemas.ts'),
  routesPath: path.join(__dirname, '../apps/server/routes'),
  typesPath: path.join(__dirname, '../packages/types'),
  outputPath: path.join(__dirname, '../breaking-changes-report.json'),
  baseRef: process.argv.find(arg => arg.startsWith('--since='))?.split('=')[1] || 'HEAD~1'
};

// Breaking change patterns
const BREAKING_PATTERNS = {
  schema: {
    // Table structure changes
    tableRemoved: /export const (\w+) = sqliteTable/,
    fieldRemoved: /(\w+):\s*\w+\([^)]*\)/,
    fieldTypeChanged: /(\w+):\s*(\w+)\(/,
    nullabilityChanged: /\.notNull\(\)|\.nullable\(\)/,
    defaultChanged: /\.default\([^)]*\)/,
    foreignKeyChanged: /\.references\([^)]*\)/,
    
    // Index and constraint changes
    indexRemoved: /\.index\(\)/,
    uniqueConstraintChanged: /\.unique\(\)/,
    primaryKeyChanged: /\.primaryKey\(\)/
  },
  
  validation: {
    // Schema validation changes
    requiredFieldAdded: /\.required\(\)/,
    typeChanged: /z\.(\w+)\(\)/,
    validationRuleChanged: /\.(min|max|length|regex|email|url)\([^)]*\)/,
    enumValueRemoved: /z\.enum\(\[[^\]]*\]\)/,
    schemaRemoved: /export const (\w+Schema)/
  },
  
  api: {
    // API endpoint changes
    endpointRemoved: /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/,
    methodChanged: /router\.(\w+)\(/,
    pathChanged: /\(['"`]([^'"`]+)['"`]\)/,
    middlewareChanged: /(verifyJWT|checkLimits|requireFeature)/,
    responseStructureChanged: /res\.json\(/
  },
  
  types: {
    // Type definition changes
    interfaceRemoved: /export interface (\w+)/,
    typeRemoved: /export type (\w+)/,
    propertyRemoved: /(\w+)(\?)?:\s*([^;]+);/,
    propertyTypeChanged: /(\w+)(\?)?:\s*([^;]+);/,
    optionalityChanged: /(\w+)(\?)?:/
  }
};

class BreakingChangesDetector {
  constructor() {
    this.breakingChanges = [];
    this.potentialBreakingChanges = [];
    this.safeChanges = [];
    this.verbose = process.argv.includes('--verbose');
    this.currentCommit = '';
    this.previousCommit = CONFIG.baseRef;
  }

  async detectBreakingChanges() {
    console.log('🔍 Detecting Breaking Changes in SSOT...');
    
    try {
      // Get current commit info
      this.currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      
      console.log(`📍 Comparing ${this.previousCommit} → ${this.currentCommit}`);
      
      // Check each category of changes
      await this.checkSchemaChanges();
      await this.checkValidationChanges();
      await this.checkApiChanges();
      await this.checkTypeChanges();
      
      // Analyze dependency impacts
      await this.analyzeDependencyImpacts();
      
      // Generate report
      await this.generateReport();
      
      // Output results
      this.printSummary();
      
      // Exit with appropriate code
      const hasBreakingChanges = this.breakingChanges.length > 0;
      process.exit(hasBreakingChanges ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Breaking changes detection failed:', error.message);
      process.exit(1);
    }
  }

  async checkSchemaChanges() {
    console.log('🗄️ Checking database schema changes...');
    
    try {
      const diff = this.getFileDiff(CONFIG.schemaPath);
      if (!diff) {
        console.log('  ℹ️ No schema changes detected');
        return;
      }

      const changes = this.parseSchemaChanges(diff);
      
      for (const change of changes) {
        if (this.isBreakingSchemaChange(change)) {
          this.addBreakingChange('schema', change.type, change.description, change.impact);
        } else if (this.isPotentiallyBreakingSchemaChange(change)) {
          this.addPotentialBreakingChange('schema', change.type, change.description, change.impact);
        } else {
          this.addSafeChange('schema', change.type, change.description);
        }
      }
      
      console.log(`  📊 Found ${changes.length} schema changes`);
      
    } catch (error) {
      console.log(`  ⚠️ Could not analyze schema changes: ${error.message}`);
    }
  }

  parseSchemaChanges(diff) {
    const changes = [];
    const lines = diff.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isRemoval = line.startsWith('-') && !line.startsWith('---');
      const isAddition = line.startsWith('+') && !line.startsWith('+++');
      
      if (isRemoval || isAddition) {
        const cleanLine = line.substring(1).trim();
        
        // Check for table changes
        const tableMatch = cleanLine.match(/export const (\w+) = sqliteTable\("(\w+)"/);
        if (tableMatch) {
          changes.push({
            type: isRemoval ? 'table_removed' : 'table_added',
            description: `Table '${tableMatch[2]}' ${isRemoval ? 'removed' : 'added'}`,
            tableName: tableMatch[2],
            exportName: tableMatch[1],
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
        
        // Check for field changes
        const fieldMatch = cleanLine.match(/(\w+):\s*(\w+)\([^)]*\)/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];
          
          changes.push({
            type: isRemoval ? 'field_removed' : 'field_added',
            description: `Field '${fieldName}' (${fieldType}) ${isRemoval ? 'removed' : 'added'}`,
            fieldName,
            fieldType,
            impact: isRemoval ? 'HIGH' : this.getFieldAdditionImpact(cleanLine)
          });
        }
        
        // Check for nullability changes
        if (cleanLine.includes('.notNull()') || cleanLine.includes('.nullable()')) {
          const nullabilityType = cleanLine.includes('.notNull()') ? 'not_null' : 'nullable';
          changes.push({
            type: isRemoval ? 'nullability_relaxed' : 'nullability_tightened',
            description: `Field nullability changed to ${nullabilityType}`,
            impact: isRemoval ? 'LOW' : 'HIGH'
          });
        }
        
        // Check for foreign key changes
        if (cleanLine.includes('.references(')) {
          changes.push({
            type: isRemoval ? 'foreign_key_removed' : 'foreign_key_added',
            description: `Foreign key constraint ${isRemoval ? 'removed' : 'added'}`,
            impact: isRemoval ? 'HIGH' : 'MEDIUM'
          });
        }
      }
    }
    
    return changes;
  }

  getFieldAdditionImpact(fieldDefinition) {
    // New required fields without defaults are breaking
    if (fieldDefinition.includes('.notNull()') && !fieldDefinition.includes('.default(')) {
      return 'HIGH';
    }
    // New optional fields or fields with defaults are safe
    return 'LOW';
  }

  isBreakingSchemaChange(change) {
    const breakingTypes = [
      'table_removed',
      'field_removed',
      'nullability_tightened',
      'foreign_key_removed'
    ];
    
    return breakingTypes.includes(change.type) || 
           (change.type === 'field_added' && change.impact === 'HIGH');
  }

  isPotentiallyBreakingSchemaChange(change) {
    const potentialTypes = [
      'foreign_key_added',
      'index_removed'
    ];
    
    return potentialTypes.includes(change.type) || change.impact === 'MEDIUM';
  }

  async checkValidationChanges() {
    console.log('📋 Checking validation schema changes...');
    
    try {
      const diff = this.getFileDiff(CONFIG.validationSchemasPath);
      if (!diff) {
        console.log('  ℹ️ No validation schema changes detected');
        return;
      }

      const changes = this.parseValidationChanges(diff);
      
      for (const change of changes) {
        if (this.isBreakingValidationChange(change)) {
          this.addBreakingChange('validation', change.type, change.description, change.impact);
        } else if (this.isPotentiallyBreakingValidationChange(change)) {
          this.addPotentialBreakingChange('validation', change.type, change.description, change.impact);
        } else {
          this.addSafeChange('validation', change.type, change.description);
        }
      }
      
      console.log(`  📊 Found ${changes.length} validation changes`);
      
    } catch (error) {
      console.log(`  ⚠️ Could not analyze validation changes: ${error.message}`);
    }
  }

  parseValidationChanges(diff) {
    const changes = [];
    const lines = diff.split('\n');
    
    for (const line of lines) {
      const isRemoval = line.startsWith('-') && !line.startsWith('---');
      const isAddition = line.startsWith('+') && !line.startsWith('+++');
      
      if (isRemoval || isAddition) {
        const cleanLine = line.substring(1).trim();
        
        // Check for schema removal/addition
        const schemaMatch = cleanLine.match(/export const (\w+Schema)/);
        if (schemaMatch) {
          changes.push({
            type: isRemoval ? 'schema_removed' : 'schema_added',
            description: `Validation schema '${schemaMatch[1]}' ${isRemoval ? 'removed' : 'added'}`,
            schemaName: schemaMatch[1],
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
        
        // Check for required field changes
        if (cleanLine.includes('.required()')) {
          changes.push({
            type: isRemoval ? 'required_removed' : 'required_added',
            description: `Required validation ${isRemoval ? 'removed' : 'added'}`,
            impact: isRemoval ? 'LOW' : 'HIGH'
          });
        }
        
        // Check for type changes
        const typeMatch = cleanLine.match(/z\.(\w+)\(/);
        if (typeMatch) {
          changes.push({
            type: isRemoval ? 'type_loosened' : 'type_tightened',
            description: `Validation type changed: ${typeMatch[1]}`,
            validationType: typeMatch[1],
            impact: isRemoval ? 'LOW' : 'HIGH'
          });
        }
        
        // Check for enum changes
        const enumMatch = cleanLine.match(/z\.enum\(\[([^\]]*)\]\)/);
        if (enumMatch) {
          changes.push({
            type: isRemoval ? 'enum_values_removed' : 'enum_values_added',
            description: `Enum values ${isRemoval ? 'removed' : 'added'}: ${enumMatch[1]}`,
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
      }
    }
    
    return changes;
  }

  isBreakingValidationChange(change) {
    const breakingTypes = [
      'schema_removed',
      'required_added',
      'type_tightened',
      'enum_values_removed'
    ];
    
    return breakingTypes.includes(change.type);
  }

  isPotentiallyBreakingValidationChange(change) {
    // Type changes might be breaking depending on the specific change
    return change.validationType && ['string', 'number', 'boolean'].includes(change.validationType);
  }

  async checkApiChanges() {
    console.log('🌐 Checking API endpoint changes...');
    
    try {
      const routeFiles = this.getRouteFiles();
      let totalChanges = 0;
      
      for (const routeFile of routeFiles) {
        const diff = this.getFileDiff(routeFile);
        if (diff) {
          const changes = this.parseApiChanges(diff, path.basename(routeFile));
          totalChanges += changes.length;
          
          for (const change of changes) {
            if (this.isBreakingApiChange(change)) {
              this.addBreakingChange('api', change.type, change.description, change.impact);
            } else if (this.isPotentiallyBreakingApiChange(change)) {
              this.addPotentialBreakingChange('api', change.type, change.description, change.impact);
            } else {
              this.addSafeChange('api', change.type, change.description);
            }
          }
        }
      }
      
      console.log(`  📊 Found ${totalChanges} API changes`);
      
    } catch (error) {
      console.log(`  ⚠️ Could not analyze API changes: ${error.message}`);
    }
  }

  parseApiChanges(diff, fileName) {
    const changes = [];
    const lines = diff.split('\n');
    
    for (const line of lines) {
      const isRemoval = line.startsWith('-') && !line.startsWith('---');
      const isAddition = line.startsWith('+') && !line.startsWith('+++');
      
      if (isRemoval || isAddition) {
        const cleanLine = line.substring(1).trim();
        
        // Check for endpoint changes
        const endpointMatch = cleanLine.match(/router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/);
        if (endpointMatch) {
          const method = endpointMatch[1].toUpperCase();
          const path = endpointMatch[2];
          
          changes.push({
            type: isRemoval ? 'endpoint_removed' : 'endpoint_added',
            description: `${method} ${path} ${isRemoval ? 'removed' : 'added'} in ${fileName}`,
            method,
            path,
            fileName,
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
        
        // Check for middleware changes
        if (cleanLine.includes('verifyJWT') || cleanLine.includes('checkLimits') || cleanLine.includes('requireFeature')) {
          changes.push({
            type: isRemoval ? 'middleware_removed' : 'middleware_added',
            description: `Authentication/authorization middleware ${isRemoval ? 'removed' : 'added'}`,
            impact: isRemoval ? 'HIGH' : 'MEDIUM'
          });
        }
        
        // Check for response structure changes
        const responseMatch = cleanLine.match(/res\.json\(/);
        if (responseMatch) {
          changes.push({
            type: isRemoval ? 'response_structure_removed' : 'response_structure_added',
            description: `Response structure ${isRemoval ? 'removed' : 'modified'}`,
            impact: 'MEDIUM'
          });
        }
      }
    }
    
    return changes;
  }

  isBreakingApiChange(change) {
    const breakingTypes = [
      'endpoint_removed',
      'middleware_removed'
    ];
    
    return breakingTypes.includes(change.type);
  }

  isPotentiallyBreakingApiChange(change) {
    const potentialTypes = [
      'middleware_added',
      'response_structure_removed',
      'response_structure_added'
    ];
    
    return potentialTypes.includes(change.type);
  }

  async checkTypeChanges() {
    console.log('📝 Checking type definition changes...');
    
    try {
      const typeFiles = ['database.ts', 'api.ts', 'core.ts'];
      let totalChanges = 0;
      
      for (const typeFile of typeFiles) {
        const filePath = path.join(CONFIG.typesPath, typeFile);
        const diff = this.getFileDiff(filePath);
        
        if (diff) {
          const changes = this.parseTypeChanges(diff, typeFile);
          totalChanges += changes.length;
          
          for (const change of changes) {
            if (this.isBreakingTypeChange(change)) {
              this.addBreakingChange('types', change.type, change.description, change.impact);
            } else {
              this.addSafeChange('types', change.type, change.description);
            }
          }
        }
      }
      
      console.log(`  📊 Found ${totalChanges} type changes`);
      
    } catch (error) {
      console.log(`  ⚠️ Could not analyze type changes: ${error.message}`);
    }
  }

  parseTypeChanges(diff, fileName) {
    const changes = [];
    const lines = diff.split('\n');
    
    for (const line of lines) {
      const isRemoval = line.startsWith('-') && !line.startsWith('---');
      const isAddition = line.startsWith('+') && !line.startsWith('+++');
      
      if (isRemoval || isAddition) {
        const cleanLine = line.substring(1).trim();
        
        // Check for interface/type removal/addition
        const interfaceMatch = cleanLine.match(/export interface (\w+)/);
        const typeMatch = cleanLine.match(/export type (\w+)/);
        
        if (interfaceMatch || typeMatch) {
          const typeName = interfaceMatch ? interfaceMatch[1] : typeMatch[1];
          const typeKind = interfaceMatch ? 'interface' : 'type';
          
          changes.push({
            type: isRemoval ? 'type_removed' : 'type_added',
            description: `${typeKind} '${typeName}' ${isRemoval ? 'removed' : 'added'} in ${fileName}`,
            typeName,
            typeKind,
            fileName,
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
        
        // Check for property changes
        const propertyMatch = cleanLine.match(/(\w+)(\?)?:\s*([^;]+);/);
        if (propertyMatch) {
          const propertyName = propertyMatch[1];
          const isOptional = !!propertyMatch[2];
          const propertyType = propertyMatch[3];
          
          changes.push({
            type: isRemoval ? 'property_removed' : 'property_added',
            description: `Property '${propertyName}' ${isRemoval ? 'removed' : 'added'}`,
            propertyName,
            propertyType,
            isOptional,
            impact: isRemoval ? 'HIGH' : 'LOW'
          });
        }
      }
    }
    
    return changes;
  }

  isBreakingTypeChange(change) {
    return change.type === 'type_removed' || change.type === 'property_removed';
  }

  async analyzeDependencyImpacts() {
    console.log('🔗 Analyzing dependency impacts...');
    
    // For each breaking change, analyze which files/systems might be affected
    for (const change of this.breakingChanges) {
      change.affectedSystems = this.getAffectedSystems(change);
      change.migrationComplexity = this.assessMigrationComplexity(change);
    }
  }

  getAffectedSystems(change) {
    const affected = [];
    
    switch (change.category) {
      case 'schema':
        affected.push('Database migrations', 'API endpoints', 'Frontend forms', 'Validation schemas');
        break;
      case 'api':
        affected.push('Frontend API calls', 'Mobile app', 'Third-party integrations', 'Documentation');
        break;
      case 'validation':
        affected.push('Frontend forms', 'API request validation', 'Data imports');
        break;
      case 'types':
        affected.push('TypeScript compilation', 'IDE autocomplete', 'Runtime type checking');
        break;
    }
    
    return affected;
  }

  assessMigrationComplexity(change) {
    const complexityFactors = {
      'table_removed': 'HIGH',
      'endpoint_removed': 'HIGH',
      'type_removed': 'HIGH',
      'field_removed': 'MEDIUM',
      'required_added': 'MEDIUM',
      'middleware_added': 'LOW'
    };
    
    return complexityFactors[change.type] || 'MEDIUM';
  }

  getFileDiff(filePath) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      const diff = execSync(`git diff ${this.previousCommit} HEAD -- "${relativePath}"`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
      });
      return diff.trim() || null;
    } catch (error) {
      return null;
    }
  }

  getRouteFiles() {
    if (!fs.existsSync(CONFIG.routesPath)) return [];
    
    return fs.readdirSync(CONFIG.routesPath)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .map(file => path.join(CONFIG.routesPath, file));
  }

  addBreakingChange(category, type, description, impact) {
    this.breakingChanges.push({
      category,
      type,
      description,
      impact: impact || 'HIGH',
      timestamp: new Date().toISOString()
    });
  }

  addPotentialBreakingChange(category, type, description, impact) {
    this.potentialBreakingChanges.push({
      category,
      type,
      description,
      impact: impact || 'MEDIUM',
      timestamp: new Date().toISOString()
    });
  }

  addSafeChange(category, type, description) {
    this.safeChanges.push({
      category,
      type,
      description,
      impact: 'LOW',
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      comparison: {
        from: this.previousCommit,
        to: this.currentCommit
      },
      summary: {
        breakingChanges: this.breakingChanges.length,
        potentialBreakingChanges: this.potentialBreakingChanges.length,
        safeChanges: this.safeChanges.length,
        totalChanges: this.breakingChanges.length + this.potentialBreakingChanges.length + this.safeChanges.length
      },
      analysis: {
        hasBreakingChanges: this.breakingChanges.length > 0,
        requiresMigrationGuide: this.breakingChanges.some(c => c.migrationComplexity === 'HIGH'),
        affectedSystems: [...new Set(this.breakingChanges.flatMap(c => c.affectedSystems || []))]
      },
      changes: {
        breaking: this.breakingChanges,
        potential: this.potentialBreakingChanges,
        safe: this.safeChanges
      }
    };
    
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(report, null, 2));
    console.log(`📁 Breaking changes report saved to: ${CONFIG.outputPath}`);
  }

  printSummary() {
    console.log('\n📊 BREAKING CHANGES SUMMARY');
    console.log('═'.repeat(50));
    console.log(`🔍 Comparison: ${this.previousCommit} → ${this.currentCommit}`);
    console.log(`❌ Breaking Changes: ${this.breakingChanges.length}`);
    console.log(`⚠️  Potentially Breaking: ${this.potentialBreakingChanges.length}`);
    console.log(`✅ Safe Changes: ${this.safeChanges.length}`);
    
    if (this.breakingChanges.length > 0) {
      console.log('\n❌ BREAKING CHANGES:');
      this.breakingChanges.forEach((change, index) => {
        console.log(`${index + 1}. [${change.category}] ${change.description} (${change.impact})`);
        if (this.verbose && change.affectedSystems) {
          console.log(`   Affected: ${change.affectedSystems.join(', ')}`);
        }
      });
    }
    
    if (this.potentialBreakingChanges.length > 0) {
      console.log('\n⚠️  POTENTIAL BREAKING CHANGES:');
      this.potentialBreakingChanges.forEach((change, index) => {
        console.log(`${index + 1}. [${change.category}] ${change.description} (${change.impact})`);
      });
    }
    
    if (this.verbose && this.safeChanges.length > 0) {
      console.log('\n✅ SAFE CHANGES:');
      this.safeChanges.forEach((change, index) => {
        console.log(`${index + 1}. [${change.category}] ${change.description}`);
      });
    }
    
    console.log('═'.repeat(50));
    
    if (this.breakingChanges.length > 0) {
      console.log('🚨 Breaking changes detected! Consider generating a migration guide.');
    } else {
      console.log('✅ No breaking changes detected.');
    }
  }
}

// Main execution
if (require.main === module) {
  const detector = new BreakingChangesDetector();
  detector.detectBreakingChanges().catch(error => {
    console.error('❌ Breaking changes detection error:', error);
    process.exit(1);
  });
}

module.exports = BreakingChangesDetector; 