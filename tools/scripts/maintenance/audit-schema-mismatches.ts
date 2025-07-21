#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// ============================================
// Schema Mismatch Audit Script
// ============================================

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableInfo {
  table_name: string;
  columns: ColumnInfo[];
}

class SchemaMismatchAuditor {
  private db: any;
  private client: any;
  private issues: string[] = [];

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    console.log('🔍 Starting Schema Mismatch Audit...');
    this.client = postgres(databaseUrl);
    this.db = drizzle(this.client);
  }

  async auditAllMismatches(): Promise<void> {
    try {
      console.log('📋 Auditing database schema mismatches...\n');

      // 1. Check table existence
      await this.checkRequiredTables();

      // 2. Check column mismatches
      await this.checkColumnMismatches();

      // 3. Check field name inconsistencies
      await this.checkFieldNameInconsistencies();

      // 4. Check data type mismatches
      await this.checkDataTypeMismatches();

      // 5. Check foreign key references
      await this.checkForeignKeyReferences();

      // 6. Check missing indexes
      await this.checkMissingIndexes();

      // Generate summary report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    } finally {
      await this.client.end();
    }
  }

  private async checkRequiredTables(): Promise<void> {
    console.log('🔍 1. Checking required tables...');
    
    const requiredTables = [
      'tenants', 'hotel_profiles', 'staff', 'call', 
      'transcript', 'request', 'message', 'call_summaries'
    ];

    const existingTables = await this.db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tableNames = existingTables.map((t: any) => t.table_name);

    for (const table of requiredTables) {
      if (!tableNames.includes(table)) {
        this.issues.push(`❌ Missing table: ${table}`);
        console.log(`  ❌ Missing table: ${table}`);
      } else {
        console.log(`  ✅ Table exists: ${table}`);
      }
    }
  }

  private async checkColumnMismatches(): Promise<void> {
    console.log('\n🔍 2. Checking column mismatches...');

    // Expected schema for each table
    const expectedSchemas = {
      request: [
        'id', 'tenant_id', 'call_id', 'room_number', 'order_id', 
        'request_content', 'status', 'created_at', 'updated_at',
        'description', 'priority', 'assigned_to', 'completed_at',
        'metadata', 'type', 'total_amount', 'items', 'delivery_time',
        'special_instructions', 'order_type'
      ],
      tenants: [
        'id', 'name', 'hotel_name', 'subdomain', 'custom_domain',
        'subscription_plan', 'subscription_status', 'trial_ends_at',
        'created_at', 'updated_at', 'is_active', 'settings'
      ],
      staff: [
        'id', 'tenant_id', 'username', 'password', 'first_name',
        'last_name', 'email', 'phone', 'role', 'permissions',
        'display_name', 'avatar_url', 'last_login', 'is_active',
        'created_at', 'updated_at'
      ],
      call: [
        'id', 'tenant_id', 'call_id_vapi', 'room_number', 'language',
        'service_type', 'start_time', 'end_time', 'duration',
        'created_at', 'updated_at'
      ],
      transcript: [
        'id', 'call_id', 'content', 'role', 'timestamp', 'tenant_id'
      ],
      message: [
        'id', 'request_id', 'sender', 'content', 'timestamp', 'tenant_id'
      ]
    };

    for (const [tableName, expectedColumns] of Object.entries(expectedSchemas)) {
      try {
        const columns = await this.db.execute(sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${tableName} AND table_schema = 'public'
          ORDER BY ordinal_position
        `);

        const actualColumns = columns.map((c: any) => c.column_name);

        for (const expectedColumn of expectedColumns) {
          if (!actualColumns.includes(expectedColumn)) {
            this.issues.push(`❌ Missing column: ${tableName}.${expectedColumn}`);
            console.log(`  ❌ Missing column: ${tableName}.${expectedColumn}`);
          }
        }

        console.log(`  ✅ Table ${tableName}: ${actualColumns.length} columns checked`);

      } catch (error: any) {
        this.issues.push(`❌ Cannot check table: ${tableName} - ${error.message}`);
        console.log(`  ❌ Cannot check table: ${tableName}`);
      }
    }
  }

  private async checkFieldNameInconsistencies(): Promise<void> {
    console.log('\n🔍 3. Checking field name inconsistencies...');

    // Common field name inconsistencies found in logs
    const inconsistencies = [
      { table: 'request', check: 'room_number', alternative: 'roomNumber' },
      { table: 'tenants', check: 'name', alternative: 'hotel_name' },
      { table: 'call', check: 'call_id_vapi', alternative: 'callIdVapi' },
      { table: 'staff', check: 'tenant_id', alternative: 'tenantId' }
    ];

    for (const inconsistency of inconsistencies) {
      try {
        const columns = await this.db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${inconsistency.table} AND table_schema = 'public'
        `);

        const columnNames = columns.map((c: any) => c.column_name);
        
        if (!columnNames.includes(inconsistency.check)) {
          if (columnNames.includes(inconsistency.alternative)) {
            this.issues.push(`⚠️ Field naming inconsistency: ${inconsistency.table}.${inconsistency.check} missing, but ${inconsistency.alternative} exists`);
            console.log(`  ⚠️ ${inconsistency.table}: ${inconsistency.check} vs ${inconsistency.alternative}`);
          } else {
            this.issues.push(`❌ Both field variants missing: ${inconsistency.table}.${inconsistency.check} and ${inconsistency.alternative}`);
            console.log(`  ❌ Both missing: ${inconsistency.table}.${inconsistency.check} and ${inconsistency.alternative}`);
          }
        } else {
          console.log(`  ✅ ${inconsistency.table}.${inconsistency.check} exists`);
        }
      } catch (error: any) {
        console.log(`  ❌ Cannot check ${inconsistency.table}: ${error.message}`);
      }
    }
  }

  private async checkDataTypeMismatches(): Promise<void> {
    console.log('\n🔍 4. Checking data type mismatches...');

    const expectedTypes = {
      'request.total_amount': 'real',
      'request.created_at': ['integer', 'timestamp'],
      'tenants.is_active': ['boolean', 'integer'],
      'staff.is_active': ['boolean', 'integer']
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
      const [tableName, columnName] = field.split('.');
      
      try {
        const result = await this.db.execute(sql`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = ${tableName} 
          AND column_name = ${columnName}
          AND table_schema = 'public'
        `);

        if (result.length > 0) {
          const actualType = result[0].data_type;
          const expected = Array.isArray(expectedType) ? expectedType : [expectedType];
          
          if (!expected.includes(actualType)) {
            this.issues.push(`⚠️ Type mismatch: ${field} is ${actualType}, expected ${expected.join(' or ')}`);
            console.log(`  ⚠️ ${field}: ${actualType} (expected ${expected.join(' or ')})`);
          } else {
            console.log(`  ✅ ${field}: ${actualType}`);
          }
        }
      } catch (error: any) {
        console.log(`  ❌ Cannot check ${field}: ${error.message}`);
      }
    }
  }

  private async checkForeignKeyReferences(): Promise<void> {
    console.log('\n🔍 5. Checking foreign key references...');

    const expectedForeignKeys = [
      { table: 'request', column: 'tenant_id', references: 'tenants(id)' },
      { table: 'staff', column: 'tenant_id', references: 'tenants(id)' },
      { table: 'call', column: 'tenant_id', references: 'tenants(id)' },
      { table: 'transcript', column: 'tenant_id', references: 'tenants(id)' },
      { table: 'message', column: 'tenant_id', references: 'tenants(id)' },
      { table: 'message', column: 'request_id', references: 'request(id)' }
    ];

    for (const fk of expectedForeignKeys) {
      try {
        const result = await this.db.execute(sql`
          SELECT COUNT(*) as count
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = ${fk.table}
          AND kcu.column_name = ${fk.column}
          AND tc.constraint_type = 'FOREIGN KEY'
        `);

        const count = parseInt(result[0]?.count || '0');
        if (count === 0) {
          this.issues.push(`⚠️ Missing foreign key: ${fk.table}.${fk.column} -> ${fk.references}`);
          console.log(`  ⚠️ Missing FK: ${fk.table}.${fk.column} -> ${fk.references}`);
        } else {
          console.log(`  ✅ FK exists: ${fk.table}.${fk.column}`);
        }
      } catch (error: any) {
        console.log(`  ❌ Cannot check FK ${fk.table}.${fk.column}: ${error.message}`);
      }
    }
  }

  private async checkMissingIndexes(): Promise<void> {
    console.log('\n🔍 6. Checking missing indexes...');

    const recommendedIndexes = [
      { table: 'request', column: 'tenant_id' },
      { table: 'request', column: 'status' },
      { table: 'request', column: 'room_number' },
      { table: 'staff', column: 'tenant_id' },
      { table: 'staff', column: 'username' },
      { table: 'call', column: 'tenant_id' },
      { table: 'transcript', column: 'call_id' },
      { table: 'transcript', column: 'tenant_id' }
    ];

    for (const index of recommendedIndexes) {
      try {
        const result = await this.db.execute(sql`
          SELECT COUNT(*) as count
          FROM pg_indexes 
          WHERE tablename = ${index.table}
          AND indexdef LIKE ${`%${index.column}%`}
        `);

        const count = parseInt(result[0]?.count || '0');
        if (count === 0) {
          this.issues.push(`⚠️ Missing index: ${index.table}.${index.column}`);
          console.log(`  ⚠️ Missing index: ${index.table}.${index.column}`);
        } else {
          console.log(`  ✅ Index exists: ${index.table}.${index.column}`);
        }
      } catch (error: any) {
        console.log(`  ❌ Cannot check index ${index.table}.${index.column}: ${error.message}`);
      }
    }
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 === SCHEMA MISMATCH AUDIT REPORT ===\n');

    if (this.issues.length === 0) {
      console.log('🎉 NO SCHEMA MISMATCHES FOUND! Database schema is consistent.\n');
      return;
    }

    console.log(`Found ${this.issues.length} potential issues:\n`);

    // Group issues by severity
    const critical = this.issues.filter(i => i.includes('❌'));
    const warnings = this.issues.filter(i => i.includes('⚠️'));

    if (critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES (will cause runtime errors):');
      critical.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️ WARNINGS (potential issues):');
      warnings.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }

    // Generate fix script commands
    console.log('🔧 RECOMMENDED FIXES:');
    console.log('');
    console.log('1. Run the production schema fix:');
    console.log('   npm run db:fix-production');
    console.log('');
    console.log('2. If issues persist, check individual fixes:');
    
    if (critical.some(i => i.includes('Missing column'))) {
      console.log('   - Missing columns detected - schema fix will handle these');
    }
    
    if (warnings.some(i => i.includes('Missing index'))) {
      console.log('   - Consider adding indexes for better performance');
    }
    
    if (warnings.some(i => i.includes('Missing foreign key'))) {
      console.log('   - Foreign keys missing - may affect data integrity');
    }

    console.log('\n📋 Run this audit again after fixes: npm run audit:schema');
  }
}

// Run the audit
async function runAudit() {
  const auditor = new SchemaMismatchAuditor();
  await auditor.auditAllMismatches();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAudit()
    .then(() => {
      console.log('✅ Schema audit completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema audit failed:', error);
      process.exit(1);
    });
}

export { SchemaMismatchAuditor }; 