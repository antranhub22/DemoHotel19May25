#!/usr/bin/env node

/**
 * SSOT Migration Guide Generator
 * Generates step-by-step migration guides for breaking changes
 * Usage: node scripts/generate-migration-guide.js [--format=md|json] [--input=file]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  breakingChangesReport: path.join(__dirname, '../breaking-changes-report.json'),
  outputPath: path.join(__dirname, '../migration-guide.md'),
  templatesPath: path.join(__dirname, '../docs/templates'),
  format: process.argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'md'
};

// Migration templates for different types of breaking changes
const MIGRATION_TEMPLATES = {
  schema: {
    table_removed: {
      title: 'Table Removal Migration',
      steps: [
        'Export existing data from the table',
        'Update application code to remove references to the table',
        'Run database migration to drop the table',
        'Verify application functionality'
      ],
      codeExample: `// Before: Remove all references to the table
// Example: Remove imports and usage
// import { oldTable } from './schema';

// After: Alternative approach or data migration
// Data should be migrated to new structure if needed`
    },
    field_removed: {
      title: 'Field Removal Migration',
      steps: [
        'Identify all code using the removed field',
        'Update queries to not select the removed field',
        'Update forms and validation to remove the field',
        'Run database migration to drop the column',
        'Test all affected functionality'
      ],
      codeExample: `// Before: Code using the removed field
const user = await db.select({
  id: users.id,
  name: users.name,
  removedField: users.removedField // Remove this
}).from(users);

// After: Updated code without the field
const user = await db.select({
  id: users.id,
  name: users.name
}).from(users);`
    },
    nullability_tightened: {
      title: 'Required Field Migration',
      steps: [
        'Ensure all existing records have values for the field',
        'Update application code to handle the required field',
        'Add validation to prevent null values',
        'Run database migration to add NOT NULL constraint',
        'Test data integrity'
      ],
      codeExample: `// Before migration: Ensure all records have values
UPDATE table_name SET field_name = 'default_value' WHERE field_name IS NULL;

// After: Update application validation
const schema = z.object({
  fieldName: z.string().min(1), // Now required
  // other fields...
});`
    }
  },
  
  api: {
    endpoint_removed: {
      title: 'API Endpoint Removal Migration',
      steps: [
        'Identify all clients using the removed endpoint',
        'Update client code to use alternative endpoints',
        'Update API documentation',
        'Add deprecation notice before removal',
        'Monitor usage to ensure no clients are affected'
      ],
      codeExample: `// Before: Using removed endpoint
const response = await fetch('/api/old-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});

// After: Using alternative endpoint
const response = await fetch('/api/new-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});`
    },
    middleware_removed: {
      title: 'Authentication Middleware Migration',
      steps: [
        'Review endpoints that had middleware removed',
        'Assess security implications',
        'Update client code if authentication is no longer required',
        'Update API documentation to reflect auth changes',
        'Test access control thoroughly'
      ],
      codeExample: `// Before: Endpoint required authentication
// Headers needed: Authorization: Bearer <token>

// After: Endpoint is now public
// No authentication headers needed
const response = await fetch('/api/public-endpoint');`
    }
  },
  
  validation: {
    schema_removed: {
      title: 'Validation Schema Migration',
      steps: [
        'Find all code using the removed validation schema',
        'Create alternative validation or remove validation',
        'Update API endpoints that used the schema',
        'Update frontend forms',
        'Test input validation thoroughly'
      ],
      codeExample: `// Before: Using removed schema
import { removedSchema } from './schemas';
const result = removedSchema.parse(data);

// After: Alternative validation or inline validation
const result = z.object({
  // Define validation inline or use new schema
}).parse(data);`
    },
    required_added: {
      title: 'New Required Field Migration',
      steps: [
        'Update all forms to include the new required field',
        'Update API calls to include the field',
        'Add validation on the frontend',
        'Handle backward compatibility if needed',
        'Test form submissions thoroughly'
      ],
      codeExample: `// Before: Optional field
const data = {
  name: 'John',
  email: 'john@example.com'
};

// After: Required field added
const data = {
  name: 'John',
  email: 'john@example.com',
  newRequiredField: 'value' // Must be provided now
};`
    }
  },
  
  types: {
    type_removed: {
      title: 'Type Definition Migration',
      steps: [
        'Find all code using the removed type',
        'Create alternative type definitions or use built-in types',
        'Update imports and type annotations',
        'Run TypeScript compilation to check for errors',
        'Update related documentation'
      ],
      codeExample: `// Before: Using removed type
import { RemovedType } from './types';
const data: RemovedType = { ... };

// After: Alternative approach
interface AlternativeType {
  // Define inline or use different type
}
const data: AlternativeType = { ... };`
    },
    property_removed: {
      title: 'Property Removal Migration',
      steps: [
        'Find all code accessing the removed property',
        'Update object destructuring and property access',
        'Remove property from forms and displays',
        'Update API responses if needed',
        'Test all affected components'
      ],
      codeExample: `// Before: Using removed property
const { id, name, removedProperty } = user;
console.log(removedProperty);

// After: Property removed
const { id, name } = user;
// removedProperty no longer available`
    }
  }
};

class MigrationGuideGenerator {
  constructor() {
    this.breakingChanges = [];
    this.migrationSteps = [];
    this.affectedSystems = new Set();
    this.timestamp = new Date().toISOString();
  }

  async generateMigrationGuide() {
    console.log('📋 Generating Migration Guide...');
    
    try {
      // Load breaking changes report
      await this.loadBreakingChanges();
      
      // Generate migration steps
      await this.generateMigrationSteps();
      
      // Create migration guide
      await this.createMigrationGuide();
      
      console.log('✅ Migration guide generated successfully!');
      console.log(`📁 Guide saved to: ${CONFIG.outputPath}`);
      
    } catch (error) {
      console.error('❌ Migration guide generation failed:', error);
      process.exit(1);
    }
  }

  async loadBreakingChanges() {
    console.log('📖 Loading breaking changes report...');
    
    if (!fs.existsSync(CONFIG.breakingChangesReport)) {
      throw new Error(`Breaking changes report not found: ${CONFIG.breakingChangesReport}`);
    }

    const reportContent = fs.readFileSync(CONFIG.breakingChangesReport, 'utf8');
    const report = JSON.parse(reportContent);
    
    this.breakingChanges = report.changes.breaking || [];
    
    if (this.breakingChanges.length === 0) {
      console.log('ℹ️ No breaking changes found - no migration guide needed');
      process.exit(0);
    }
    
    console.log(`✅ Loaded ${this.breakingChanges.length} breaking changes`);
  }

  async generateMigrationSteps() {
    console.log('🛠️ Generating migration steps...');
    
    for (const change of this.breakingChanges) {
      const migrationStep = this.createMigrationStep(change);
      this.migrationSteps.push(migrationStep);
      
      // Track affected systems
      if (change.affectedSystems) {
        change.affectedSystems.forEach(system => this.affectedSystems.add(system));
      }
    }
    
    // Sort steps by priority and complexity
    this.migrationSteps.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    console.log(`✅ Generated ${this.migrationSteps.length} migration steps`);
  }

  createMigrationStep(change) {
    const template = this.getTemplate(change.category, change.type);
    
    const step = {
      id: `migration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.title || `${change.category} Migration`,
      description: change.description,
      category: change.category,
      type: change.type,
      priority: change.impact || 'MEDIUM',
      complexity: change.migrationComplexity || 'MEDIUM',
      estimatedTime: this.estimateTime(change),
      steps: template.steps || this.generateGenericSteps(change),
      codeExample: template.codeExample || null,
      affectedSystems: change.affectedSystems || [],
      prerequisites: this.getPrerequisites(change),
      rollbackInstructions: this.generateRollbackInstructions(change),
      testing: this.generateTestingInstructions(change),
      warnings: this.getWarnings(change)
    };
    
    return step;
  }

  getTemplate(category, type) {
    return MIGRATION_TEMPLATES[category]?.[type] || {
      title: `${category} Migration`,
      steps: ['Identify affected code', 'Update implementation', 'Test changes']
    };
  }

  estimateTime(change) {
    const complexityTime = {
      'HIGH': '4-8 hours',
      'MEDIUM': '1-3 hours', 
      'LOW': '30-60 minutes'
    };
    
    return complexityTime[change.migrationComplexity] || '1-3 hours';
  }

  generateGenericSteps(change) {
    const baseSteps = [
      'Identify all code affected by this change',
      'Create a backup of current implementation',
      'Update the affected code',
      'Test the changes thoroughly',
      'Deploy and monitor for issues'
    ];
    
    if (change.category === 'schema') {
      return [
        'Create database migration script',
        ...baseSteps.slice(0, 2),
        'Update database schema',
        'Update application code',
        ...baseSteps.slice(2)
      ];
    }
    
    return baseSteps;
  }

  getPrerequisites(change) {
    const prerequisites = ['Development environment setup'];
    
    if (change.category === 'schema') {
      prerequisites.push('Database backup', 'Migration tools configured');
    }
    
    if (change.category === 'api') {
      prerequisites.push('API documentation updated', 'Client applications identified');
    }
    
    if (change.category === 'types') {
      prerequisites.push('TypeScript compiler', 'Type dependencies mapped');
    }
    
    return prerequisites;
  }

  generateRollbackInstructions(change) {
    const rollback = {
      steps: [],
      timeRequired: '15-30 minutes',
      dataLoss: false
    };
    
    switch (change.category) {
      case 'schema':
        rollback.steps = [
          'Run rollback migration script',
          'Restore previous application code',
          'Verify database integrity'
        ];
        rollback.dataLoss = change.type === 'table_removed';
        break;
        
      case 'api':
        rollback.steps = [
          'Revert API code changes',
          'Restore previous endpoint',
          'Update client configurations'
        ];
        break;
        
      case 'types':
        rollback.steps = [
          'Restore previous type definitions',
          'Recompile TypeScript',
          'Verify type checking'
        ];
        break;
        
      default:
        rollback.steps = [
          'Revert code changes',
          'Test functionality',
          'Monitor for issues'
        ];
    }
    
    return rollback;
  }

  generateTestingInstructions(change) {
    const testing = {
      unitTests: [],
      integrationTests: [],
      manualTests: [],
      acceptanceCriteria: []
    };
    
    switch (change.category) {
      case 'schema':
        testing.unitTests = ['Test database queries', 'Test data validation'];
        testing.integrationTests = ['Test API endpoints', 'Test data migrations'];
        testing.manualTests = ['Verify UI functionality', 'Test data integrity'];
        break;
        
      case 'api':
        testing.unitTests = ['Test endpoint responses', 'Test error handling'];
        testing.integrationTests = ['Test client integrations', 'Test authentication'];
        testing.manualTests = ['Test UI interactions', 'Test mobile app'];
        break;
        
      case 'validation':
        testing.unitTests = ['Test validation logic', 'Test error messages'];
        testing.integrationTests = ['Test form submissions', 'Test API validation'];
        testing.manualTests = ['Test user workflows', 'Test edge cases'];
        break;
        
      case 'types':
        testing.unitTests = ['TypeScript compilation', 'Type checking'];
        testing.integrationTests = ['IDE support', 'Runtime type safety'];
        testing.manualTests = ['Developer experience', 'Autocomplete functionality'];
        break;
    }
    
    testing.acceptanceCriteria = [
      'All tests pass',
      'No TypeScript errors',
      'Application functions as expected',
      'Performance is not degraded'
    ];
    
    return testing;
  }

  getWarnings(change) {
    const warnings = [];
    
    if (change.impact === 'HIGH') {
      warnings.push('⚠️ High impact change - proceed with caution');
    }
    
    if (change.category === 'schema' && change.type.includes('removed')) {
      warnings.push('🗄️ Data loss possible - ensure backups are current');
    }
    
    if (change.category === 'api' && change.type === 'endpoint_removed') {
      warnings.push('🌐 API clients may break - coordinate with external teams');
    }
    
    if (change.affectedSystems?.includes('Frontend forms')) {
      warnings.push('🎨 UI changes required - update forms and validation');
    }
    
    return warnings;
  }

  async createMigrationGuide() {
    console.log('📝 Creating migration guide document...');
    
    if (CONFIG.format === 'json') {
      await this.createJsonGuide();
    } else {
      await this.createMarkdownGuide();
    }
  }

  async createJsonGuide() {
    const guide = {
      metadata: {
        title: 'SSOT Migration Guide',
        version: '1.0.0',
        generated: this.timestamp,
        totalSteps: this.migrationSteps.length,
        estimatedTime: this.calculateTotalTime(),
        affectedSystems: Array.from(this.affectedSystems)
      },
      overview: {
        summary: `This migration guide addresses ${this.breakingChanges.length} breaking changes in the SSOT.`,
        prerequisites: this.getGlobalPrerequisites(),
        risks: this.assessRisks()
      },
      migrations: this.migrationSteps
    };
    
    const jsonPath = CONFIG.outputPath.replace('.md', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(guide, null, 2));
    console.log(`📁 JSON guide saved to: ${jsonPath}`);
  }

  async createMarkdownGuide() {
    const guide = this.generateMarkdownContent();
    fs.writeFileSync(CONFIG.outputPath, guide);
  }

  generateMarkdownContent() {
    const totalTime = this.calculateTotalTime();
    const highPrioritySteps = this.migrationSteps.filter(s => s.priority === 'HIGH').length;
    
    return `# 🚨 SSOT Migration Guide

> **Generated:** ${this.timestamp}  
> **Total Steps:** ${this.migrationSteps.length}  
> **Estimated Time:** ${totalTime}  
> **High Priority:** ${highPrioritySteps} steps

## ⚠️ Important Notice

This migration guide addresses **${this.breakingChanges.length} breaking changes** in the Single Source of Truth (SSOT) system. These changes may affect multiple parts of the application and require careful planning and execution.

## 📋 Pre-Migration Checklist

${this.getGlobalPrerequisites().map(req => `- [ ] ${req}`).join('\n')}

## 🎯 Affected Systems

${Array.from(this.affectedSystems).map(system => `- **${system}**`).join('\n')}

## 🔄 Migration Steps

${this.migrationSteps.map((step, index) => this.generateStepMarkdown(step, index + 1)).join('\n\n---\n\n')}

## 🔙 Rollback Strategy

In case of issues during migration, each step includes specific rollback instructions. The general rollback approach is:

1. **Stop the deployment** immediately if issues are detected
2. **Execute rollback steps** in reverse order of migration
3. **Verify system stability** after rollback
4. **Investigate issues** before attempting migration again

### Rollback Time Estimates

${this.migrationSteps.map(step => `- **${step.title}:** ${step.rollbackInstructions.timeRequired}`).join('\n')}

## ✅ Post-Migration Verification

After completing all migration steps:

1. **Run full test suite** - Ensure all automated tests pass
2. **Manual testing** - Test critical user workflows
3. **Performance check** - Verify no performance degradation
4. **Monitor errors** - Watch for new errors in logs
5. **User acceptance** - Confirm functionality meets requirements

## 📞 Support

If you encounter issues during migration:

1. Check the specific rollback instructions for the failing step
2. Review the warnings and troubleshooting tips
3. Contact the development team with:
   - Specific step that failed
   - Error messages or logs
   - Current system state

## 📊 Summary

| Priority | Steps | Est. Time | Risk Level |
|----------|-------|-----------|------------|
| HIGH     | ${this.migrationSteps.filter(s => s.priority === 'HIGH').length} | ${this.calculateTimeByPriority('HIGH')} | 🔴 High |
| MEDIUM   | ${this.migrationSteps.filter(s => s.priority === 'MEDIUM').length} | ${this.calculateTimeByPriority('MEDIUM')} | 🟡 Medium |
| LOW      | ${this.migrationSteps.filter(s => s.priority === 'LOW').length} | ${this.calculateTimeByPriority('LOW')} | 🟢 Low |

---

*This migration guide was automatically generated by the SSOT Breaking Changes system.*  
*Last updated: ${this.timestamp}*
`;
  }

  generateStepMarkdown(step, index) {
    return `## Step ${index}: ${step.title}

**Priority:** ${this.getPriorityEmoji(step.priority)} ${step.priority}  
**Category:** ${step.category}  
**Estimated Time:** ${step.estimatedTime}  
**Complexity:** ${step.complexity}

### Description
${step.description}

### Affected Systems
${step.affectedSystems.map(system => `- ${system}`).join('\n')}

### Prerequisites
${step.prerequisites.map(req => `- [ ] ${req}`).join('\n')}

${step.warnings.length > 0 ? `### ⚠️ Warnings
${step.warnings.map(warning => `- ${warning}`).join('\n')}

` : ''}### Migration Steps

${step.steps.map((stepItem, i) => `${i + 1}. ${stepItem}`).join('\n')}

${step.codeExample ? `### Code Example

\`\`\`typescript
${step.codeExample}
\`\`\`

` : ''}### Testing

**Unit Tests:**
${step.testing.unitTests.map(test => `- [ ] ${test}`).join('\n')}

**Integration Tests:**
${step.testing.integrationTests.map(test => `- [ ] ${test}`).join('\n')}

**Manual Tests:**
${step.testing.manualTests.map(test => `- [ ] ${test}`).join('\n')}

**Acceptance Criteria:**
${step.testing.acceptanceCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}

### Rollback Instructions

**Time Required:** ${step.rollbackInstructions.timeRequired}  
**Data Loss Risk:** ${step.rollbackInstructions.dataLoss ? '🔴 Yes' : '🟢 No'}

${step.rollbackInstructions.steps.map((rollbackStep, i) => `${i + 1}. ${rollbackStep}`).join('\n')}`;
  }

  getPriorityEmoji(priority) {
    const emojis = {
      'HIGH': '🔴',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return emojis[priority] || '⚪';
  }

  calculateTotalTime() {
    const timeMap = {
      '30-60 minutes': 45,
      '1-3 hours': 120,
      '4-8 hours': 360
    };
    
    const totalMinutes = this.migrationSteps.reduce((total, step) => {
      return total + (timeMap[step.estimatedTime] || 120);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  calculateTimeByPriority(priority) {
    const steps = this.migrationSteps.filter(s => s.priority === priority);
    const timeMap = {
      '30-60 minutes': 45,
      '1-3 hours': 120,
      '4-8 hours': 360
    };
    
    const totalMinutes = steps.reduce((total, step) => {
      return total + (timeMap[step.estimatedTime] || 120);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getGlobalPrerequisites() {
    return [
      'Development environment is set up and tested',
      'All team members are notified of the migration',
      'Current system backup is created and verified',
      'Migration has been tested in staging environment',
      'Rollback plan is understood and prepared',
      'Monitoring and alerting systems are active'
    ];
  }

  assessRisks() {
    const risks = [];
    
    const highImpactChanges = this.breakingChanges.filter(c => c.impact === 'HIGH').length;
    if (highImpactChanges > 0) {
      risks.push(`${highImpactChanges} high-impact changes require careful execution`);
    }
    
    if (this.affectedSystems.has('Database migrations')) {
      risks.push('Database changes may cause downtime');
    }
    
    if (this.affectedSystems.has('Frontend API calls')) {
      risks.push('API changes may break frontend functionality');
    }
    
    const schemaChanges = this.breakingChanges.filter(c => c.category === 'schema').length;
    if (schemaChanges > 0) {
      risks.push(`${schemaChanges} schema changes require database migrations`);
    }
    
    return risks;
  }
}

// Main execution
if (require.main === module) {
  const generator = new MigrationGuideGenerator();
  generator.generateMigrationGuide().catch(error => {
    console.error('❌ Migration guide generation error:', error);
    process.exit(1);
  });
}

module.exports = MigrationGuideGenerator; 