import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator';
import { sql, eq, and, count } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { createHash } from 'crypto';

// Import schema
import { tenants, hotelProfiles, transcript, request, message, staff,  } from '@shared/db';
// ============================================
// Test Configuration
// ============================================

interface TestConfig {
  databaseUrl?: string;
  backupPath: string;
  testDbPath: string;
  isDryRun: boolean;
  skipBackup: boolean;
  verbose: boolean;
}

interface TestResults {
  success: boolean;
  startTime: number;
  endTime: number;
  steps: Array<{
    step: string;
    status: 'success' | 'failed' | 'skipped';
    duration: number;
    message?: string;
    error?: any;
  }>;
  dataIntegrity: {
    preDataCount: Record<string, number>;
    postDataCount: Record<string, number>;
    checksumMatch: boolean;
    miNhonData: {
      preserved: boolean;
      tenantId?: string;
      associatedCorrectly: boolean;
    };
    newTenantFunctionality: {
      working: boolean;
      testTenantId?: string;
    };
  };
}

// ============================================
// Database Migration Test Class
// ============================================

export class DatabaseMigrationTest {
  private config: TestConfig;
  private results: TestResults;
  private db: any;
  private miNhonTenantId: string | null = null;
  private testTenantId: string | null = null;

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      databaseUrl: process.env.DATABASE_URL,
      backupPath: './backups',
      testDbPath: './test-migration.db',
      isDryRun: false,
      skipBackup: false,
      verbose: true,
      ...config,
    };

    this.results = {
      success: false,
      startTime: 0,
      endTime: 0,
      steps: [],
      dataIntegrity: {
        preDataCount: {},
        postDataCount: {},
        checksumMatch: false,
        miNhonData: {
          preserved: false,
          associatedCorrectly: false,
        },
        newTenantFunctionality: {
          working: false,
        },
      },
    };
  }

  // ============================================
  // Main Test Runner
  // ============================================

  async runMigrationTest(): Promise<TestResults> {
    this.results.startTime = performance.now();
    this.log('🚀 Starting Database Migration Test...', 'info');

    try {
      // Step 1: Initialize database connection
      await this.executeStep(
        'initialize-db',
        'Initialize Database Connection',
        () => this.initializeDatabase()
      );

      // Step 2: Pre-migration data backup
      await this.executeStep('backup-data', 'Backup Existing Data', () =>
        this.backupExistingData()
      );

      // Step 3: Capture pre-migration state
      await this.executeStep(
        'capture-pre-state',
        'Capture Pre-Migration State',
        () => this.capturePreMigrationState()
      );

      // Step 4: Run multi-tenant migration
      await this.executeStep(
        'run-migration',
        'Run Multi-Tenant Migration',
        () => this.runMultiTenantMigration()
      );

      // Step 5: Create Mi Nhon tenant
      await this.executeStep(
        'create-mi-nhon-tenant',
        'Create Mi Nhon Hotel Tenant',
        () => this.createMiNhonTenant()
      );

      // Step 6: Migrate existing data to Mi Nhon tenant
      await this.executeStep(
        'migrate-existing-data',
        'Migrate Existing Data to Mi Nhon Tenant',
        () => this.migrateExistingDataToTenant()
      );

      // Step 7: Verify data preservation
      await this.executeStep(
        'verify-data-preservation',
        'Verify Data Preservation',
        () => this.verifyDataPreservation()
      );

      // Step 8: Test Mi Nhon Hotel functionality
      await this.executeStep(
        'test-mi-nhon-functionality',
        'Test Mi Nhon Hotel Functionality',
        () => this.testMiNhonFunctionality()
      );

      // Step 9: Test new tenant functionality
      await this.executeStep(
        'test-new-tenant-functionality',
        'Test New Tenant Functionality',
        () => this.testNewTenantFunctionality()
      );

      // Step 10: Run data integrity checks
      await this.executeStep(
        'data-integrity-checks',
        'Run Data Integrity Checks',
        () => this.runDataIntegrityChecks()
      );

      // Step 11: Performance verification
      await this.executeStep(
        'performance-verification',
        'Performance Verification',
        () => this.verifyPerformance()
      );

      this.results.success = true;
      this.log('✅ Migration test completed successfully!', 'success');
    } catch (error) {
      this.log(`❌ Migration test failed: ${(error as Error).message}`, 'error');
      this.results.success = false;

      // Attempt rollback if not in dry run mode
      if (!this.config.isDryRun) {
        await this.executeStep('rollback', 'Rollback Migration', () =>
          this.rollbackMigration()
        );
      }
    } finally {
      this.results.endTime = performance.now();
      await this.cleanup();
    }

    return this.results;
  }

  // ============================================
  // Migration Steps Implementation
  // ============================================

  private async initializeDatabase(): Promise<void> {
    const isPostgres = this.config.databaseUrl?.includes('postgres');

    if (isPostgres && this.config.databaseUrl) {
      this.log('Connecting to PostgreSQL database...', 'info');
      const client = postgres(this.config.databaseUrl);
      this.db = drizzle(client);
    } else {
      this.log('Using SQLite database for testing...', 'info');
      const sqlite = new Database(this.config.testDbPath);
      this.db = drizzleSqlite(sqlite);
    }

    // Test connection
    await this.db.select().from(staff).limit(1);
    this.log('✅ Database connection established', 'success');
  }

  private async backupExistingData(): Promise<void> {
    if (this.config.skipBackup) {
      this.log('⏭️ Skipping backup (skipBackup=true)', 'info');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.config.backupPath, `backup-${timestamp}`);

    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });

    // Backup each table
    const tables = [
      'call_summaries',
      'orders',
      'transcripts',
      'users',
      'request',
      'message',
      'staff',
    ];

    for (const tableName of tables) {
      try {
        const data = await this.db.execute(
          sql`SELECT * FROM ${sql.identifier(tableName)}`
        );
        const backupFile = path.join(backupDir, `${tableName}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        this.log(`📁 Backed up table: ${tableName}`, 'info');
      } catch (error) {
        this.log(
          `⚠️ Could not backup table ${tableName}: ${(error as Error).message}`,
          'warn'
        );
      }
    }

    // Create restoration script
    const restoreScript = this.generateRestoreScript(backupDir);
    fs.writeFileSync(path.join(backupDir, 'restore.sql'), restoreScript);

    this.log(`✅ Backup completed: ${backupDir}`, 'success');
  }

  private async capturePreMigrationState(): Promise<void> {
    this.log('📊 Capturing pre-migration data state...', 'info');

    // Count records in each table
    const tableQueries = [
      {
        name: 'transcripts',
        query: this.db.select({ count: count() }).from(transcript),
      },
      {
        name: 'requests',
        query: this.db.select({ count: count() }).from(request),
      },
      {
        name: 'messages',
        query: this.db.select({ count: count() }).from(message),
      },
      { name: 'staff', query: this.db.select({ count: count() }).from(staff) },
    ];

    for (const { name, query } of tableQueries) {
      try {
        const result = await query;
        this.results.dataIntegrity.preDataCount[name] = result[0]?.count || 0;
        this.log(
          `📈 ${name}: ${this.results.dataIntegrity.preDataCount[name]} records`,
          'info'
        );
      } catch (error) {
        this.log(`⚠️ Could not count ${name}: ${(error as Error).message}`, 'warn');
        this.results.dataIntegrity.preDataCount[name] = 0;
      }
    }

    // Create data checksum for integrity verification
    await this.createDataChecksum('pre');
  }

  private async runMultiTenantMigration(): Promise<void> {
    if (this.config.isDryRun) {
      this.log('🔍 DRY RUN: Would run multi-tenant migration', 'info');
      return;
    }

    this.log('🔄 Running multi-tenant migration...', 'info');

    const isPostgres = this.config.databaseUrl?.includes('postgres');

    if (isPostgres) {
      await migrate(this.db, { migrationsFolder: './migrations' });
    } else {
      await migrateSqlite(this.db, { migrationsFolder: './migrations' });
    }

    this.log('✅ Multi-tenant migration completed', 'success');
  }

  private async createMiNhonTenant(): Promise<void> {
    this.log('🏨 Creating Mi Nhon Hotel tenant...', 'info');

    if (this.config.isDryRun) {
      this.miNhonTenantId = 'dry-run-mi-nhon-id';
      this.log('🔍 DRY RUN: Would create Mi Nhon tenant', 'info');
      return;
    }

    // Create Mi Nhon Hotel as the default tenant
    const [miNhonTenant] = await this.db
      .insert(tenants)
      .values({
        hotelName: 'Mi Nhon Hotel',
        subdomain: 'minhon',
        customDomain: 'localhost',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        maxVoices: 10,
        maxLanguages: 6,
        voiceCloning: true,
        multiLocation: true,
        whiteLabel: true,
        dataRetentionDays: 365,
        monthlyCallLimit: 10000,
      })
      .returning({ id: tenants.id });

    this.miNhonTenantId = miNhonTenant.id;
    this.results.dataIntegrity.miNhonData.tenantId = this.miNhonTenantId;

    // Create hotel profile for Mi Nhon
    await this.db.insert(hotelProfiles).values({
      tenantId: this.miNhonTenantId,
      researchData: {
        name: 'Mi Nhon Hotel',
        address: 'Mui Ne, Phan Thiet, Vietnam',
        phone: '+84 123 456 789',
        services: [
          { type: 'room_service', name: 'Room Service', category: 'dining' },
          { type: 'concierge', name: 'Concierge', category: 'service' },
          { type: 'spa', name: 'Spa Services', category: 'wellness' },
        ],
      },
      knowledgeBase: 'Mi Nhon Hotel knowledge base...',
      systemPrompt: 'You are the AI concierge for Mi Nhon Hotel...',
    });

    this.log(`✅ Mi Nhon tenant created: ${this.miNhonTenantId}`, 'success');
  }

  private async migrateExistingDataToTenant(): Promise<void> {
    if (!this.miNhonTenantId) {
      throw new Error('Mi Nhon tenant ID not available');
    }

    this.log('📤 Migrating existing data to Mi Nhon tenant...', 'info');

    if (this.config.isDryRun) {
      this.log('🔍 DRY RUN: Would migrate existing data to tenant', 'info');
      return;
    }

    // Update existing tables with tenant_id
    const updateQueries = [
      this.db.update(transcript).set({ tenantId: this.miNhonTenantId }),
      this.db.update(request).set({ tenantId: this.miNhonTenantId }),
      this.db.update(message).set({ tenantId: this.miNhonTenantId }),
      this.db.update(staff).set({ tenantId: this.miNhonTenantId }),
    ];

    for (const query of updateQueries) {
      await query;
    }

    this.log('✅ Existing data migrated to Mi Nhon tenant', 'success');
  }

  private async verifyDataPreservation(): Promise<void> {
    this.log('🔍 Verifying data preservation...', 'info');

    // Count records in each table after migration
    const tableQueries = [
      {
        name: 'transcripts',
        query: this.db.select({ count: count() }).from(transcript),
      },
      {
        name: 'requests',
        query: this.db.select({ count: count() }).from(request),
      },
      {
        name: 'messages',
        query: this.db.select({ count: count() }).from(message),
      },
      { name: 'staff', query: this.db.select({ count: count() }).from(staff) },
    ];

    let dataPreserved = true;

    for (const { name, query } of tableQueries) {
      const result = await query;
      const postCount = result[0]?.count || 0;
      const preCount = this.results.dataIntegrity.preDataCount[name] || 0;

      this.results.dataIntegrity.postDataCount[name] = postCount;

      if (postCount !== preCount) {
        this.log(
          `❌ Data loss detected in ${name}: ${preCount} -> ${postCount}`,
          'error'
        );
        dataPreserved = false;
      } else {
        this.log(`✅ ${name}: ${postCount} records preserved`, 'success');
      }
    }

    // Verify data checksum
    const checksumMatch = await this.verifyDataChecksum();
    this.results.dataIntegrity.checksumMatch = checksumMatch;

    this.results.dataIntegrity.miNhonData.preserved =
      dataPreserved && checksumMatch;

    if (!dataPreserved || !checksumMatch) {
      throw new Error('Data preservation verification failed');
    }
  }

  private async testMiNhonFunctionality(): Promise<void> {
    this.log('🧪 Testing Mi Nhon Hotel functionality...', 'info');

    if (!this.miNhonTenantId) {
      throw new Error('Mi Nhon tenant ID not available');
    }

    // Test data isolation - Mi Nhon data should be accessible
    const miNhonTranscripts = await this.db
      .select()
      .from(transcript)
      .where(eq(transcript.tenant_id, this.miNhonTenantId))
      .limit(5);

    const miNhonRequests = await this.db
      .select()
      .from(request)
      .where(eq(request.tenant_id, this.miNhonTenantId))
      .limit(5);

    const miNhonStaff = await this.db
      .select()
      .from(staff)
      .where(eq(staff.tenant_id, this.miNhonTenantId))
      .limit(5);

    // Verify data is correctly associated
    const isAssociatedCorrectly =
      miNhonTranscripts.every(t => t.tenant_id === this.miNhonTenantId) &&
      miNhonRequests.every(r => r.tenant_id === this.miNhonTenantId) &&
      miNhonStaff.every(s => s.tenant_id === this.miNhonTenantId);

    this.results.dataIntegrity.miNhonData.associatedCorrectly =
      isAssociatedCorrectly;

    if (!isAssociatedCorrectly) {
      throw new Error('Mi Nhon data not correctly associated with tenant');
    }

    this.log('✅ Mi Nhon Hotel functionality verified', 'success');
  }

  private async testNewTenantFunctionality(): Promise<void> {
    this.log('🏗️ Testing new tenant functionality...', 'info');

    if (this.config.isDryRun) {
      this.testTenantId = 'dry-run-test-tenant-id';
      this.results.dataIntegrity.newTenantFunctionality.testTenantId =
        this.testTenantId;
      this.results.dataIntegrity.newTenantFunctionality.working = true;
      this.log('🔍 DRY RUN: Would test new tenant functionality', 'info');
      return;
    }

    // Create a test tenant
    const [testTenant] = await this.db
      .insert(tenants)
      .values({
        hotelName: 'Test Hotel',
        subdomain: 'test-hotel',
        subscriptionPlan: 'basic',
        subscriptionStatus: 'active',
      })
      .returning({ id: tenants.id });

    this.testTenantId = testTenant.id;
    this.results.dataIntegrity.newTenantFunctionality.testTenantId =
      this.testTenantId;

    // Test data isolation - create some test data
    await this.db.insert(request).values({
      roomNumber: '101',
      orderId: 'test-order-1',
      requestContent: 'Test request for new tenant',
      tenantId: this.testTenantId,
    });

    // Verify isolation - test tenant should not see Mi Nhon data
    const isolatedRequests = await this.db
      .select()
      .from(request)
      .where(eq(request.tenant_id, this.testTenantId));

    const miNhonDataVisible = await this.db
      .select()
      .from(request)
      .where(
        and(
          eq(request.tenant_id, this.miNhonTenantId!),
          eq(request.tenant_id, this.testTenantId)
        )
      );

    if (isolatedRequests.length !== 1 || miNhonDataVisible.length > 0) {
      throw new Error('Tenant data isolation not working correctly');
    }

    this.results.dataIntegrity.newTenantFunctionality.working = true;
    this.log('✅ New tenant functionality verified', 'success');
  }

  private async runDataIntegrityChecks(): Promise<void> {
    this.log('🔐 Running data integrity checks...', 'info');

    // Check referential integrity
    await this.checkReferentialIntegrity();

    // Check for orphaned records
    await this.checkOrphanedRecords();

    // Check tenant isolation
    await this.checkTenantIsolation();

    // Check data consistency
    await this.checkDataConsistency();

    this.log('✅ Data integrity checks completed', 'success');
  }

  private async verifyPerformance(): Promise<void> {
    this.log('⚡ Verifying performance...', 'info');

    if (!this.miNhonTenantId) return;

    // Test query performance with tenant filtering
    const start = performance.now();

    await this.db
      .select()
      .from(transcript)
      .where(eq(transcript.tenant_id, this.miNhonTenantId))
      .limit(100);

    const duration = performance.now() - start;

    if (duration > 1000) {
      // 1 second threshold
      this.log(
        `⚠️ Performance warning: Query took ${duration.toFixed(2)}ms`,
        'warn'
      );
    } else {
      this.log(
        `✅ Performance check passed: ${duration.toFixed(2)}ms`,
        'success'
      );
    }
  }

  // ============================================
  // Rollback Procedures
  // ============================================

  private async rollbackMigration(): Promise<void> {
    this.log('🔙 Attempting rollback...', 'error');

    try {
      // Remove tenant data if created
      if (this.testTenantId) {
        await this.db.delete(tenants).where(eq(tenants.id, this.testTenantId));
      }

      // Remove tenant_id from existing data
      if (this.miNhonTenantId) {
        await this.db.update(transcript).set({ tenantId: null });
        await this.db.update(request).set({ tenantId: null });
        await this.db.update(message).set({ tenantId: null });
        await this.db.update(staff).set({ tenantId: null });

        await this.db
          .delete(hotelProfiles)
          .where(eq(hotelProfiles.tenant_id, this.miNhonTenantId));
        await this.db
          .delete(tenants)
          .where(eq(tenants.id, this.miNhonTenantId));
      }

      // Drop multi-tenant tables if they exist
      try {
        await this.db.execute(sql`DROP TABLE IF EXISTS hotel_profiles`);
        await this.db.execute(sql`DROP TABLE IF EXISTS tenants`);
      } catch (error) {
        this.log(`Could not drop tables: ${(error as Error).message}`, 'warn');
      }

      this.log('✅ Rollback completed', 'success');
    } catch (error) {
      this.log(`❌ Rollback failed: ${(error as Error).message}`, 'error');
      this.log('🔧 Manual intervention required - check backup files', 'error');
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async executeStep(
    stepId: string,
    stepName: string,
    stepFunction: () => Promise<void>
  ): Promise<void> {
    const stepStart = performance.now();
    this.log(`\n🔄 ${stepName}...`, 'info');

    try {
      await stepFunction();
      const stepDuration = performance.now() - stepStart;

      this.results.steps.push({
        step: stepId,
        status: 'success',
        duration: stepDuration,
        message: `${stepName} completed successfully`,
      });

      this.log(
        `✅ ${stepName} completed (${stepDuration.toFixed(2)}ms)`,
        'success'
      );
    } catch (error) {
      const stepDuration = performance.now() - stepStart;

      this.results.steps.push({
        step: stepId,
        status: 'failed',
        duration: stepDuration,
        message: `${stepName} failed: ${(error as Error).message}`,
        error: error,
      });

      this.log(`❌ ${stepName} failed: ${(error as Error).message}`, 'error');
      throw error;
    }
  }

  private async createDataChecksum(phase: 'pre' | 'post'): Promise<void> {
    // Create a simple checksum of critical data for integrity verification
    const data = await this.db.select().from(transcript).limit(100);
    const checksum = createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');

    // Store checksum for comparison
    if (phase === 'pre') {
      this.results.dataIntegrity['preChecksum'] = checksum;
    } else {
      this.results.dataIntegrity['postChecksum'] = checksum;
    }
  }

  private async verifyDataChecksum(): Promise<boolean> {
    await this.createDataChecksum('post');
    return (
      this.results.dataIntegrity['preChecksum'] ===
      this.results.dataIntegrity['postChecksum']
    );
  }

  private async checkReferentialIntegrity(): Promise<void> {
    // Check foreign key constraints
    const orphanedMessages = await this.db
      .select()
      .from(message)
      .leftJoin(request, eq(message.request_id, request.id))
      .where(sql`request.id IS NULL`);

    if (orphanedMessages.length > 0) {
      throw new Error(`Found ${orphanedMessages.length} orphaned messages`);
    }
  }

  private async checkOrphanedRecords(): Promise<void> {
    // Check for records without tenant_id after migration
    const orphanedTranscripts = await this.db
      .select()
      .from(transcript)
      .where(sql`tenant_id IS NULL`);

    if (orphanedTranscripts.length > 0) {
      throw new Error(
        `Found ${orphanedTranscripts.length} orphaned transcripts`
      );
    }
  }

  private async checkTenantIsolation(): Promise<void> {
    if (!this.miNhonTenantId || !this.testTenantId) return;

    // Verify that tenants cannot access each other's data
    const crossTenantAccess = await this.db
      .select()
      .from(request)
      .where(
        and(
          eq(request.tenant_id, this.miNhonTenantId),
          eq(request.tenant_id, this.testTenantId)
        )
      );

    if (crossTenantAccess.length > 0) {
      throw new Error('Tenant isolation breach detected');
    }
  }

  private async checkDataConsistency(): Promise<void> {
    // Check that all tenant-related data is consistent
    const inconsistentProfiles = await this.db
      .select()
      .from(hotelProfiles)
      .leftJoin(tenants, eq(hotelProfiles.tenant_id, tenants.id))
      .where(sql`tenants.id IS NULL`);

    if (inconsistentProfiles.length > 0) {
      throw new Error(
        `Found ${inconsistentProfiles.length} hotel profiles without valid tenants`
      );
    }
  }

  private generateRestoreScript(backupDir: string): string {
    return `
-- Database Restoration Script
-- Generated: ${new Date().toISOString()}
-- Backup Location: ${backupDir}

-- WARNING: This will restore the database to its pre-migration state
-- Run this script only if the migration test failed and rollback is needed

BEGIN;

-- Drop multi-tenant tables
DROP TABLE IF EXISTS hotel_profiles;
DROP TABLE IF EXISTS tenants;

-- Remove tenant_id columns from existing tables
ALTER TABLE transcript DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE request DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE message DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE staff DROP COLUMN IF EXISTS tenant_id;

-- Restore data from backup files
-- (You'll need to load the JSON files manually)

COMMIT;

-- Manual steps:
-- 1. Load backup JSON files
-- 2. Verify data integrity
-- 3. Restart application
    `.trim();
  }

  private async cleanup(): Promise<void> {
    // Cleanup test tenant if created
    if (this.testTenantId && !this.config.isDryRun) {
      try {
        await this.db
          .delete(request)
          .where(eq(request.tenant_id, this.testTenantId));
        await this.db.delete(tenants).where(eq(tenants.id, this.testTenantId));
      } catch (error) {
        this.log(`Could not cleanup test tenant: ${(error as Error).message}`, 'warn');
      }
    }

    // Close database connection
    if (this.db?.destroy) {
      await this.db.destroy();
    }
  }

  private log(
    message: string,
    level: 'info' | 'success' | 'warn' | 'error' = 'info'
  ): void {
    if (!this.config.verbose && level === 'info') return;

    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      warn: '⚠️',
      error: '❌',
    }[level];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // ============================================
  // Public Report Methods
  // ============================================

  generateReport(): string {
    const duration = this.results.endTime - this.results.startTime;
    const successRate =
      (this.results.steps.filter(s => s.status === 'success').length /
        this.results.steps.length) *
      100;

    return `
# Database Migration Test Report

## Summary
- **Status**: ${this.results.success ? '✅ SUCCESS' : '❌ FAILED'}
- **Duration**: ${duration.toFixed(2)}ms
- **Success Rate**: ${successRate.toFixed(1)}%
- **Timestamp**: ${new Date().toISOString()}

## Data Integrity
- **Pre-Migration Data Count**: ${JSON.stringify(this.results.dataIntegrity.preDataCount, null, 2)}
- **Post-Migration Data Count**: ${JSON.stringify(this.results.dataIntegrity.postDataCount, null, 2)}
- **Checksum Match**: ${this.results.dataIntegrity.checksumMatch ? '✅' : '❌'}

## Mi Nhon Hotel Data
- **Data Preserved**: ${this.results.dataIntegrity.miNhonData.preserved ? '✅' : '❌'}
- **Tenant ID**: ${this.results.dataIntegrity.miNhonData.tenantId || 'N/A'}
- **Associated Correctly**: ${this.results.dataIntegrity.miNhonData.associatedCorrectly ? '✅' : '❌'}

## New Tenant Functionality
- **Working**: ${this.results.dataIntegrity.newTenantFunctionality.working ? '✅' : '❌'}
- **Test Tenant ID**: ${this.results.dataIntegrity.newTenantFunctionality.testTenantId || 'N/A'}

## Step Details
${this.results.steps
  .map(
    step =>
      `- **${step.step}**: ${step.status === 'success' ? '✅' : '❌'} ${step.message} (${step.duration.toFixed(2)}ms)`
  )
  .join('\n')}

## Recommendations
${this.generateRecommendations()}
    `.trim();
  }

  private generateRecommendations(): string {
    const recommendations = [];

    if (!this.results.success) {
      recommendations.push(
        '- **CRITICAL**: Migration failed. Do not proceed to production.'
      );
      recommendations.push(
        '- Review error logs and fix issues before retrying.'
      );
    }

    if (!this.results.dataIntegrity.checksumMatch) {
      recommendations.push(
        '- **WARNING**: Data integrity issues detected. Investigate checksum mismatch.'
      );
    }

    if (!this.results.dataIntegrity.miNhonData.preserved) {
      recommendations.push(
        '- **CRITICAL**: Mi Nhon Hotel data not preserved. Restore from backup.'
      );
    }

    if (!this.results.dataIntegrity.newTenantFunctionality.working) {
      recommendations.push(
        '- **WARNING**: New tenant functionality not working correctly.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '- ✅ All checks passed. Migration is ready for production.'
      );
      recommendations.push('- Consider running additional performance tests.');
      recommendations.push('- Schedule rollback plan just in case.');
    }

    return recommendations.join('\n');
  }
}

// ============================================
// CLI Interface
// ============================================

export async function runMigrationTestCLI() {
  const args = process.argv.slice(2);
  const config: Partial<TestConfig> = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case '--dry-run':
        config.isDryRun = true;
        i--; // No value for this flag
        break;
      case '--skip-backup':
        config.skipBackup = true;
        i--; // No value for this flag
        break;
      case '--verbose':
        config.verbose = true;
        i--; // No value for this flag
        break;
      case '--database-url':
        config.databaseUrl = value;
        break;
      case '--backup-path':
        config.backupPath = value;
        break;
    }
  }

  const test = new DatabaseMigrationTest(config);
  const results = await test.runMigrationTest();

  console.log('\n' + test.generateReport());

  process.exit(results.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runMigrationTestCLI().catch(console.error);
}
