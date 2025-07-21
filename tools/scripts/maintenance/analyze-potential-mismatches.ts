#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Code-Based Schema Mismatch Analysis
// ============================================

class CodebaseMismatchAnalyzer {
  private issues: string[] = [];
  private warnings: string[] = [];

  async analyzeAllMismatches(): Promise<void> {
    console.log('🔍 Analyzing codebase for potential schema mismatches...\n');

    // 1. Check field name inconsistencies in code
    await this.analyzeFieldNameInconsistencies();

    // 2. Check database query patterns
    await this.analyzeDatabaseQueryPatterns();

    // 3. Check schema definitions vs usage
    await this.analyzeSchemaUsage();

    // 4. Check type definitions consistency
    await this.analyzeTypeDefinitions();

    // 5. Generate summary report
    this.generateReport();
  }

  private async analyzeFieldNameInconsistencies(): Promise<void> {
    console.log('🔍 1. Analyzing field name inconsistencies...');

    // Known problematic patterns from logs
    const patterns = [
      {
        pattern: /\.room_number/g,
        alternative: 'roomNumber',
        description: 'Database uses room_number but code might expect roomNumber'
      },
      {
        pattern: /\.call_id/g,
        alternative: 'callId',
        description: 'Database uses call_id but code might expect callId'
      },
      {
        pattern: /\.tenant_id/g,
        alternative: 'tenantId',
        description: 'Database uses tenant_id but code might expect tenantId'
      },
      {
        pattern: /\.order_id/g,
        alternative: 'orderId',
        description: 'Database uses order_id but code might expect orderId'
      },
      {
        pattern: /\.request_content/g,
        alternative: 'requestContent',
        description: 'Database uses request_content but code might expect requestContent'
      }
    ];

    const filesToCheck = [
      'apps/server/storage.ts',
      'apps/server/routes.ts',
      'apps/client/src/context/AssistantContext.tsx',
      'apps/client/src/components/Interface3.tsx',
      'packages/shared/db/schema.ts'
    ];

    for (const filePath of filesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        for (const pattern of patterns) {
          const matches = content.match(pattern.pattern);
          if (matches) {
            this.warnings.push(`⚠️ ${filePath}: Found ${matches.length} usage(s) of ${pattern.pattern.source} - ${pattern.description}`);
            console.log(`  ⚠️ ${filePath}: ${matches.length}x ${pattern.pattern.source}`);
          }
        }
      }
    }
  }

  private async analyzeDatabaseQueryPatterns(): Promise<void> {
    console.log('\n🔍 2. Analyzing database query patterns...');

    const problematicQueries = [
      {
        pattern: /eq\(.*\.name,/g,
        issue: 'Querying tenants.name but production might have hotel_name instead'
      },
      {
        pattern: /select.*call_id.*from.*request/gi,
        issue: 'Selecting call_id from request table but column might not exist'
      },
      {
        pattern: /where.*tenant_id.*is.*null/gi,
        issue: 'Checking for null tenant_id but column might not exist'
      },
      {
        pattern: /getAllOrders.*\(\{.*\}\)/g,
        issue: 'getAllOrders function called - check if it handles missing columns properly'
      }
    ];

    const serverFiles = this.getFilesRecursively('apps/server', ['.ts']);
    
    for (const filePath of serverFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const query of problematicQueries) {
        const matches = content.match(query.pattern);
        if (matches) {
          this.issues.push(`❌ ${filePath}: ${query.issue}`);
          console.log(`  ❌ ${filePath}: ${query.issue}`);
        }
      }
    }
  }

  private async analyzeSchemaUsage(): Promise<void> {
    console.log('\n🔍 3. Analyzing schema definitions vs usage...');

    // Check if schema file exists
    const schemaPath = 'packages/shared/db/schema.ts';
    if (!fs.existsSync(schemaPath)) {
      this.issues.push('❌ Schema file not found: packages/shared/db/schema.ts');
      return;
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Check for potential issues in schema
    const schemaIssues = [
      {
        pattern: /export const request.*sqliteTable.*request.*\{/s,
        check: (content: string) => content.includes('call_id'),
        issue: 'request table schema missing call_id column definition'
      },
      {
        pattern: /export const tenants.*sqliteTable.*tenants.*\{/s,
        check: (content: string) => content.includes('name:') && content.includes('hotel_name:'),
        issue: 'tenants table has both name and hotel_name - potential confusion'
      },
      {
        pattern: /export const.*=.*sqliteTable/g,
        check: (content: string) => content.includes('tenant_id'),
        issue: 'Check if all tables have tenant_id for multi-tenancy'
      }
    ];

    for (const issue of schemaIssues) {
      const matches = schemaContent.match(issue.pattern);
      if (matches) {
        const hasExpectedContent = issue.check(schemaContent);
        if (!hasExpectedContent) {
          this.issues.push(`❌ Schema issue: ${issue.issue}`);
          console.log(`  ❌ Schema issue: ${issue.issue}`);
        }
      }
    }
  }

  private async analyzeTypeDefinitions(): Promise<void> {
    console.log('\n🔍 4. Analyzing type definitions consistency...');

    const typeFiles = [
      'packages/shared/schema.ts',
      'packages/shared/types/core.ts',
      'apps/client/src/types/index.ts'
    ];

    for (const filePath of typeFiles) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for type inconsistencies
        const typeIssues = [
          {
            pattern: /type.*Order.*=.*request/i,
            issue: 'Order type aliased to request - potential confusion'
          },
          {
            pattern: /insertOrderSchema.*=.*insertRequestSchema/i,
            issue: 'Order schema aliased to request schema - ensure consistency'
          },
          {
            pattern: /roomNumber.*string/i,
            check: (content: string) => content.includes('room_number'),
            issue: 'Type uses roomNumber but database uses room_number'
          }
        ];

        for (const typeIssue of typeIssues) {
          const matches = content.match(typeIssue.pattern);
          if (matches) {
            this.warnings.push(`⚠️ ${filePath}: ${typeIssue.issue}`);
            console.log(`  ⚠️ ${filePath}: ${typeIssue.issue}`);
          }
        }
      }
    }
  }

  private getFilesRecursively(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private generateReport(): void {
    console.log('\n📊 === CODE-BASED SCHEMA MISMATCH ANALYSIS REPORT ===\n');

    const totalIssues = this.issues.length + this.warnings.length;
    
    if (totalIssues === 0) {
      console.log('🎉 NO POTENTIAL SCHEMA MISMATCHES FOUND!\n');
      return;
    }

    console.log(`Found ${totalIssues} potential issues in codebase:\n`);

    if (this.issues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (likely to cause runtime errors):');
      this.issues.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS (potential consistency issues):');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    console.log('🔧 RECOMMENDED ACTIONS:\n');
    
    if (this.issues.length > 0) {
      console.log('1. IMMEDIATE: Run production schema fix:');
      console.log('   npm run db:fix-production\n');
    }
    
    if (this.warnings.length > 0) {
      console.log('2. REVIEW: Check field name consistency:');
      console.log('   - Ensure database columns match code expectations');
      console.log('   - Consider using consistent naming (snake_case vs camelCase)');
      console.log('   - Update type definitions to match actual database schema\n');
    }

    console.log('3. VERIFY: After fixes, run full audit:');
    console.log('   npm run audit:schema (on production database)\n');

    console.log('📋 SUMMARY OF POTENTIAL MISMATCHES:');
    
    const fieldNameIssues = [...this.issues, ...this.warnings].filter(i => 
      i.includes('room_number') || i.includes('call_id') || i.includes('tenant_id')
    ).length;
    
    const schemaIssues = [...this.issues, ...this.warnings].filter(i => 
      i.includes('Schema issue') || i.includes('missing')
    ).length;

    const typeIssues = [...this.issues, ...this.warnings].filter(i => 
      i.includes('Type') || i.includes('alias')
    ).length;

    console.log(`  - Field naming inconsistencies: ${fieldNameIssues}`);
    console.log(`  - Schema definition issues: ${schemaIssues}`);
    console.log(`  - Type definition issues: ${typeIssues}`);
    console.log(`  - Total potential mismatches: ${totalIssues}`);

    console.log('\n🎯 PRIORITY ORDER:');
    console.log('1. Fix missing database columns (critical for API functionality)');
    console.log('2. Resolve field name inconsistencies (prevents query errors)');
    console.log('3. Clean up type definitions (improves code clarity)');
    console.log('4. Add proper indexes and foreign keys (performance & integrity)');
  }
}

// Run the analysis
async function runAnalysis() {
  const analyzer = new CodebaseMismatchAnalyzer();
  await analyzer.analyzeAllMismatches();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAnalysis()
    .then(() => {
      console.log('\n✅ Code analysis completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Code analysis failed:', error);
      process.exit(1);
    });
}

export { CodebaseMismatchAnalyzer }; 