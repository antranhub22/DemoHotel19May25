import crypto from 'crypto';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================
// Types & Interfaces
// ============================================

export interface MigrationConfig {
  database: {
    type: 'postgresql' | 'sqlite' | 'mysql';
    connectionString: string;
    migrationTableName: string;
    lockTableName: string;
    migrationsPath: string;
    seedsPath: string;
  };
  migration: {
    batchSize: number;
    maxConcurrency: number;
    timeout: number; // minutes
    rollbackEnabled: boolean;
    dryRunFirst: boolean;
    backupBeforeMigration: boolean;
    validateAfterMigration: boolean;
  };
  zeroDowntime: {
    enabled: boolean;
    strategy: 'blue_green' | 'rolling' | 'shadow' | 'canary';
    healthCheckPath: string;
    warmupTime: number; // seconds
    trafficShiftPercentage: number;
    maxErrorRate: number;
  };
  dataTransformation: {
    enabled: boolean;
    parallelProcessing: boolean;
    chunkSize: number;
    memoryLimit: string;
    tempStoragePath: string;
  };
  validation: {
    enabled: boolean;
    dataIntegrityChecks: boolean;
    performanceBaseline: boolean;
    functionalTesting: boolean;
    rollbackThreshold: number; // error percentage
  };
  monitoring: {
    enabled: boolean;
    progressReporting: boolean;
    performanceMetrics: boolean;
    alerting: boolean;
    dashboards: boolean;
  };
}

export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'schema' | 'data' | 'combined';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  upScript: string;
  downScript: string;
  dataTransformation?: DataTransformation;
  validation?: ValidationRules;
  metadata: {
    author: string;
    createdAt: Date;
    estimatedDuration: number; // minutes
    affectedTables: string[];
    dataSize: number; // bytes
  };
}

export interface DataTransformation {
  id: string;
  sourceTable: string;
  targetTable: string;
  transformationRules: TransformationRule[];
  conditions: string[];
  batchProcessing: {
    enabled: boolean;
    batchSize: number;
    parallelBatches: number;
  };
}

export interface TransformationRule {
  id: string;
  sourceColumn: string;
  targetColumn: string;
  transformation: string; // SQL expression or function name
  validation?: string; // validation expression
  required: boolean;
}

export interface ValidationRules {
  recordCount: boolean;
  dataIntegrity: string[]; // SQL queries for validation
  performanceChecks: PerformanceCheck[];
  businessRules: string[]; // business logic validations
}

export interface PerformanceCheck {
  name: string;
  query: string;
  maxExecutionTime: number; // milliseconds
  expectedResult?: any;
}

export interface MigrationJob {
  id: string;
  migrationId: string;
  type: 'up' | 'down' | 'data_transform' | 'rollback';
  status:
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'rollback_required';
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  progress: number; // 0-100
  recordsProcessed: number;
  recordsTotal: number;
  errors: MigrationError[];
  warnings: string[];
  metadata: {
    dryRun: boolean;
    batchSize: number;
    backupCreated: boolean;
    rollbackPlan?: string;
  };
}

export interface MigrationError {
  id: string;
  type: 'schema' | 'data' | 'validation' | 'performance' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  query?: string;
  affectedRecords?: number;
  suggestedFix?: string;
  timestamp: Date;
}

export interface MigrationPlan {
  id: string;
  name: string;
  version: string;
  description: string;
  migrations: string[]; // migration IDs in order
  strategy: 'sequential' | 'parallel' | 'conditional';
  estimatedDuration: number; // minutes
  rollbackPlan: RollbackPlan;
  approvals: ApprovalStep[];
  status:
    | 'draft'
    | 'approved'
    | 'executing'
    | 'completed'
    | 'failed'
    | 'rolled_back';
  timeline: {
    created: Date;
    approved?: Date;
    started?: Date;
    completed?: Date;
  };
}

export interface RollbackPlan {
  automatic: boolean;
  triggers: string[];
  steps: RollbackStep[];
  dataRecovery: boolean;
  timeLimit: number; // minutes
}

export interface RollbackStep {
  id: string;
  order: number;
  type: 'schema' | 'data' | 'cleanup';
  description: string;
  script: string;
  timeout: number; // minutes
  critical: boolean;
}

export interface ApprovalStep {
  id: string;
  approver: string;
  role: string;
  required: boolean;
  approved?: boolean;
  approvedAt?: Date;
  comments?: string;
}

export interface MigrationStats {
  totalMigrations: number;
  completedMigrations: number;
  failedMigrations: number;
  successRate: number;
  averageDuration: number;
  totalDataMigrated: number;
  lastMigrationDate?: Date;
  upcomingMigrations: number;
}

// ============================================
// Default Configuration
// ============================================

const defaultMigrationConfig: MigrationConfig = {
  database: {
    type: 'postgresql',
    connectionString:
      process.env.DATABASE_URL || 'postgresql://localhost:5432/hotel_db',
    migrationTableName: 'schema_migrations',
    lockTableName: 'migration_locks',
    migrationsPath: './migrations',
    seedsPath: './seeds',
  },
  migration: {
    batchSize: 1000,
    maxConcurrency: 3,
    timeout: 60,
    rollbackEnabled: true,
    dryRunFirst: true,
    backupBeforeMigration: true,
    validateAfterMigration: true,
  },
  zeroDowntime: {
    enabled: true,
    strategy: 'blue_green',
    healthCheckPath: '/health',
    warmupTime: 30,
    trafficShiftPercentage: 10,
    maxErrorRate: 1.0,
  },
  dataTransformation: {
    enabled: true,
    parallelProcessing: true,
    chunkSize: 10000,
    memoryLimit: '512MB',
    tempStoragePath: './temp/migrations',
  },
  validation: {
    enabled: true,
    dataIntegrityChecks: true,
    performanceBaseline: true,
    functionalTesting: true,
    rollbackThreshold: 5.0,
  },
  monitoring: {
    enabled: true,
    progressReporting: true,
    performanceMetrics: true,
    alerting: true,
    dashboards: true,
  },
};

// ============================================
// Data Migration Class
// ============================================

export class DataMigration extends EventEmitter {
  private config: MigrationConfig;
  private migrations: Map<string, Migration> = new Map();
  private migrationJobs: Map<string, MigrationJob> = new Map();
  private migrationPlans: Map<string, MigrationPlan> = new Map();
  private activeLocks: Set<string> = new Set();
  private dbConnection: any; // Database connection

  constructor(config: Partial<MigrationConfig> = {}) {
    super();
    this.config = { ...defaultMigrationConfig, ...config };

    this.initializeDataMigration();

    console.log(
      '🔄 DataMigration initialized with zero-downtime migration capabilities',
      'DataMigration'
    );
  }

  // ============================================
  // Initialization Methods
  // ============================================

  private async initializeDataMigration() {
    try {
      // Create migration directories
      await this.createDirectories();

      // Initialize database tables
      await this.initializeDatabaseTables();

      // Load existing migrations
      await this.loadMigrations();

      // Setup monitoring
      if (this.config.monitoring.enabled) {
        this.startMonitoring();
      }

      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize data migration:', error);
      throw error;
    }
  }

  private async createDirectories() {
    const dirs = [
      this.config.database.migrationsPath,
      this.config.database.seedsPath,
      this.config.dataTransformation.tempStoragePath,
      './migrations/completed',
      './migrations/failed',
      './migrations/rollbacks',
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create migration directory ${dir}:`, error);
      }
    }
  }

  private async initializeDatabaseTables() {
    // Create migration tracking tables
    const migrationTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.database.migrationTableName} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        checksum VARCHAR(255),
        success BOOLEAN DEFAULT true
      );
    `;

    const lockTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.database.lockTableName} (
        lock_key VARCHAR(255) PRIMARY KEY,
        locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        locked_by VARCHAR(255),
        expires_at TIMESTAMP
      );
    `;

    // Execute table creation (implementation would depend on database type)
    console.log('📊 Migration tracking tables initialized');
  }

  // ============================================
  // Migration Creation & Management
  // ============================================

  async createMigration(
    migration: Omit<Migration, 'id' | 'metadata'>
  ): Promise<string> {
    const migrationId = crypto.randomUUID();

    const newMigration: Migration = {
      ...migration,
      id: migrationId,
      metadata: {
        author: 'system',
        createdAt: new Date(),
        estimatedDuration: 15,
        affectedTables: [],
        dataSize: 0,
        ...migration.metadata,
      },
    };

    this.migrations.set(migrationId, newMigration);
    await this.saveMigrationToFile(newMigration);

    console.log(`📝 Migration created: ${migration.name} (${migrationId})`);
    this.emit('migrationCreated', newMigration);

    return migrationId;
  }

  async executeMigration(
    migrationId: string,
    options: { dryRun?: boolean; force?: boolean } = {}
  ): Promise<string> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      throw new Error('Migration not found');
    }

    // Check for existing lock
    const lockKey = `migration_${migrationId}`;
    if (this.activeLocks.has(lockKey) && !options.force) {
      throw new Error('Migration is already running');
    }

    const jobId = crypto.randomUUID();
    const job: MigrationJob = {
      id: jobId,
      migrationId,
      type: 'up',
      status: 'pending',
      startTime: new Date(),
      progress: 0,
      recordsProcessed: 0,
      recordsTotal: 0,
      errors: [],
      warnings: [],
      metadata: {
        dryRun: options.dryRun || this.config.migration.dryRunFirst,
        batchSize: this.config.migration.batchSize,
        backupCreated: false,
      },
    };

    this.migrationJobs.set(jobId, job);
    this.activeLocks.add(lockKey);

    console.log(
      `🚀 Starting migration: ${migration.name} (${options.dryRun ? 'DRY RUN' : 'LIVE'})`
    );
    this.emit('migrationStarted', job);

    try {
      // Create backup if enabled
      if (this.config.migration.backupBeforeMigration && !options.dryRun) {
        await this.createPreMigrationBackup(migration);
        job.metadata.backupCreated = true;
      }

      job.status = 'running';

      // Execute migration based on type
      switch (migration.type) {
        case 'schema':
          await this.executeSchemaChanges(job, migration);
          break;
        case 'data':
          await this.executeDataMigration(job, migration);
          break;
        case 'combined':
          await this.executeSchemaChanges(job, migration);
          await this.executeDataMigration(job, migration);
          break;
      }

      // Validate migration if enabled
      if (this.config.validation.enabled && !options.dryRun) {
        await this.validateMigration(job, migration);
      }

      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.progress = 100;

      // Record successful migration
      if (!options.dryRun) {
        await this.recordMigrationExecution(migration, job);
      }

      console.log(
        `✅ Migration completed: ${migration.name} (${job.duration}ms)`
      );
      this.emit('migrationCompleted', job);

      return jobId;
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.duration = job.endTime!.getTime() - job.startTime.getTime();

      const migrationError: MigrationError = {
        id: crypto.randomUUID(),
        type: 'schema',
        severity: 'critical',
        message: error.message,
        details: error.stack || '',
        timestamp: new Date(),
      };

      job.errors.push(migrationError);

      console.error(`❌ Migration failed: ${migration.name}`, error);
      this.emit('migrationFailed', { job, error });

      // Auto-rollback if configured
      if (this.config.migration.rollbackEnabled && !options.dryRun) {
        await this.rollbackMigration(
          migrationId,
          'Auto-rollback due to failure'
        );
      }

      throw error;
    } finally {
      this.activeLocks.delete(lockKey);
    }
  }

  // ============================================
  // Schema Migration Methods
  // ============================================

  private async executeSchemaChanges(
    job: MigrationJob,
    migration: Migration
  ): Promise<void> {
    console.log(`🏗️ Executing schema changes for: ${migration.name}`);

    try {
      // Parse and execute SQL from upScript
      const sqlStatements = this.parseSQLScript(migration.upScript);
      const totalStatements = sqlStatements.length;

      for (let i = 0; i < totalStatements; i++) {
        const statement = sqlStatements[i];

        // Execute statement (simulation for demo)
        await this.executeSQL(statement, job.metadata.dryRun);

        // Update progress
        job.progress = Math.round(((i + 1) / totalStatements) * 50); // 50% for schema
        this.emit('migrationProgress', { job, progress: job.progress });

        console.log(
          `📊 Schema progress: ${job.progress}% - Executed statement ${i + 1}/${totalStatements}`
        );
      }
    } catch (error) {
      throw new Error(`Schema migration failed: ${error.message}`);
    }
  }

  // ============================================
  // Data Migration Methods
  // ============================================

  private async executeDataMigration(
    job: MigrationJob,
    migration: Migration
  ): Promise<void> {
    if (!migration.dataTransformation) return;

    console.log(`📊 Executing data migration for: ${migration.name}`);

    try {
      const transformation = migration.dataTransformation;

      // Get total record count
      const totalRecords = await this.getRecordCount(
        transformation.sourceTable
      );
      job.recordsTotal = totalRecords;

      if (totalRecords === 0) {
        job.progress = 100;
        return;
      }

      // Process in batches
      const batchSize = transformation.batchProcessing.enabled
        ? transformation.batchProcessing.batchSize
        : this.config.migration.batchSize;

      let offset = 0;
      const baseProgress = migration.type === 'combined' ? 50 : 0; // If combined, schema took 50%

      while (offset < totalRecords) {
        const batch = await this.getDataBatch(
          transformation.sourceTable,
          offset,
          batchSize
        );

        if (
          transformation.batchProcessing.enabled &&
          transformation.batchProcessing.parallelBatches > 1
        ) {
          await this.processDataBatchParallel(batch, transformation, job);
        } else {
          await this.processDataBatchSequential(batch, transformation, job);
        }

        offset += batchSize;
        job.recordsProcessed = Math.min(offset, totalRecords);

        // Update progress (remaining 50% for data)
        const dataProgress = (job.recordsProcessed / totalRecords) * 50;
        job.progress = baseProgress + dataProgress;

        this.emit('migrationProgress', { job, progress: job.progress });

        console.log(
          `📈 Data progress: ${job.progress.toFixed(1)}% - Processed ${job.recordsProcessed}/${totalRecords} records`
        );
      }
    } catch (error) {
      throw new Error(`Data migration failed: ${error.message}`);
    }
  }

  private async processDataBatchSequential(
    batch: any[],
    transformation: DataTransformation,
    job: MigrationJob
  ): Promise<void> {
    for (const record of batch) {
      try {
        const transformedRecord = await this.transformRecord(
          record,
          transformation
        );

        if (!job.metadata.dryRun) {
          await this.insertTransformedRecord(
            transformedRecord,
            transformation.targetTable
          );
        }
      } catch (error) {
        const migrationError: MigrationError = {
          id: crypto.randomUUID(),
          type: 'data',
          severity: 'medium',
          message: `Record transformation failed: ${error.message}`,
          details: JSON.stringify(record),
          affectedRecords: 1,
          timestamp: new Date(),
        };

        job.errors.push(migrationError);

        // Continue processing unless too many errors
        if (
          job.errors.length >
          (job.recordsTotal * this.config.validation.rollbackThreshold) / 100
        ) {
          throw new Error(
            'Too many transformation errors - aborting migration'
          );
        }
      }
    }
  }

  private async processDataBatchParallel(
    batch: any[],
    transformation: DataTransformation,
    job: MigrationJob
  ): Promise<void> {
    const concurrency = Math.min(
      transformation.batchProcessing.parallelBatches,
      this.config.migration.maxConcurrency
    );
    const chunks = this.chunkArray(
      batch,
      Math.ceil(batch.length / concurrency)
    );

    const promises = chunks.map(chunk =>
      this.processDataBatchSequential(chunk, transformation, job)
    );

    await Promise.all(promises);
  }

  private async transformRecord(
    record: any,
    transformation: DataTransformation
  ): Promise<any> {
    const transformedRecord: any = {};

    for (const rule of transformation.transformationRules) {
      try {
        let value = record[rule.sourceColumn];

        // Apply transformation
        if (rule.transformation) {
          value = await this.applyTransformation(value, rule.transformation);
        }

        // Validate if required
        if (rule.validation) {
          const isValid = await this.validateValue(value, rule.validation);
          if (!isValid && rule.required) {
            throw new Error(
              `Validation failed for ${rule.sourceColumn}: ${rule.validation}`
            );
          }
        }

        transformedRecord[rule.targetColumn] = value;
      } catch (error) {
        if (rule.required) {
          throw error;
        } else {
          console.warn(
            `Optional transformation failed for ${rule.sourceColumn}:`,
            error.message
          );
        }
      }
    }

    return transformedRecord;
  }

  private async applyTransformation(
    value: any,
    transformation: string
  ): Promise<any> {
    // Simple transformation examples
    switch (transformation.toLowerCase()) {
      case 'uppercase':
        return typeof value === 'string' ? value.toUpperCase() : value;
      case 'lowercase':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'trim':
        return typeof value === 'string' ? value.trim() : value;
      case 'hash':
        return crypto.createHash('sha256').update(String(value)).digest('hex');
      case 'encrypt':
        // Simple encryption (in production, use proper encryption)
        return Buffer.from(String(value)).toString('base64');
      default:
        // For complex transformations, evaluate as function
        return value;
    }
  }

  private async validateValue(
    value: any,
    validation: string
  ): Promise<boolean> {
    // Simple validation examples
    switch (validation.toLowerCase()) {
      case 'not_null':
        return value != null;
      case 'not_empty':
        return value != null && String(value).trim().length > 0;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      case 'numeric':
        return !isNaN(Number(value));
      default:
        return true;
    }
  }

  // ============================================
  // Zero-Downtime Migration Methods
  // ============================================

  async executeZeroDowntimeMigration(planId: string): Promise<string> {
    const plan = this.migrationPlans.get(planId);
    if (!plan) {
      throw new Error('Migration plan not found');
    }

    console.log(`🔄 Starting zero-downtime migration: ${plan.name}`);
    this.emit('zeroDowntimeMigrationStarted', plan);

    try {
      switch (this.config.zeroDowntime.strategy) {
        case 'blue_green':
          return await this.executeBlueGreenMigration(plan);
        case 'rolling':
          return await this.executeRollingMigration(plan);
        case 'shadow':
          return await this.executeShadowMigration(plan);
        case 'canary':
          return await this.executeCanaryMigration(plan);
        default:
          throw new Error(
            `Unsupported zero-downtime strategy: ${this.config.zeroDowntime.strategy}`
          );
      }
    } catch (error) {
      console.error(`❌ Zero-downtime migration failed: ${plan.name}`, error);
      this.emit('zeroDowntimeMigrationFailed', { plan, error });
      throw error;
    }
  }

  private async executeBlueGreenMigration(
    plan: MigrationPlan
  ): Promise<string> {
    console.log('🔵🟢 Executing Blue-Green migration strategy');

    // 1. Setup green environment
    console.log('🟢 Setting up green environment');
    await this.sleep(2000);

    // 2. Run migrations on green
    console.log('🔄 Running migrations on green environment');
    for (const migrationId of plan.migrations) {
      await this.executeMigration(migrationId, { dryRun: false });
    }

    // 3. Warm up green environment
    console.log('🔥 Warming up green environment');
    await this.sleep(this.config.zeroDowntime.warmupTime * 1000);

    // 4. Health check green environment
    const isHealthy = await this.performHealthCheck();
    if (!isHealthy) {
      throw new Error('Green environment health check failed');
    }

    // 5. Switch traffic to green
    console.log('🔀 Switching traffic to green environment');
    await this.switchTraffic('green');

    // 6. Monitor for issues
    await this.monitorTrafficSwitch();

    // 7. Cleanup blue environment
    console.log('🧹 Cleaning up blue environment');
    await this.sleep(1000);

    console.log('✅ Blue-Green migration completed successfully');
    return 'green_deployment_complete';
  }

  private async executeRollingMigration(plan: MigrationPlan): Promise<string> {
    console.log('🔄 Executing Rolling migration strategy');

    const instances = ['instance-1', 'instance-2', 'instance-3'];

    for (const instance of instances) {
      console.log(`🔄 Migrating instance: ${instance}`);

      // Take instance out of load balancer
      await this.removeFromLoadBalancer(instance);

      // Run migrations on instance
      for (const migrationId of plan.migrations) {
        await this.executeMigration(migrationId, { dryRun: false });
      }

      // Health check instance
      const isHealthy = await this.performHealthCheck(instance);
      if (!isHealthy) {
        throw new Error(`Instance ${instance} health check failed`);
      }

      // Add instance back to load balancer
      await this.addToLoadBalancer(instance);

      // Wait before next instance
      await this.sleep(5000);
    }

    console.log('✅ Rolling migration completed successfully');
    return 'rolling_migration_complete';
  }

  private async executeShadowMigration(plan: MigrationPlan): Promise<string> {
    console.log('👥 Executing Shadow migration strategy');

    // 1. Setup shadow environment
    console.log('👤 Setting up shadow environment');
    await this.sleep(2000);

    // 2. Start shadow traffic
    console.log('🔀 Starting shadow traffic');
    await this.startShadowTraffic();

    // 3. Run migrations on shadow
    for (const migrationId of plan.migrations) {
      await this.executeMigration(migrationId, { dryRun: false });
    }

    // 4. Compare results
    console.log('📊 Comparing shadow vs production results');
    const comparisonResult = await this.compareShadowResults();

    if (!comparisonResult.passed) {
      throw new Error('Shadow comparison failed');
    }

    // 5. Promote shadow to production
    console.log('⬆️ Promoting shadow to production');
    await this.promoteShadowToProduction();

    console.log('✅ Shadow migration completed successfully');
    return 'shadow_migration_complete';
  }

  private async executeCanaryMigration(plan: MigrationPlan): Promise<string> {
    console.log('🐤 Executing Canary migration strategy');

    // 1. Deploy canary with migrations
    console.log('🐤 Deploying canary environment');
    for (const migrationId of plan.migrations) {
      await this.executeMigration(migrationId, { dryRun: false });
    }

    // 2. Route small percentage of traffic to canary
    console.log(
      `🔀 Routing ${this.config.zeroDowntime.trafficShiftPercentage}% traffic to canary`
    );
    await this.routeTrafficToCanary(
      this.config.zeroDowntime.trafficShiftPercentage
    );

    // 3. Monitor metrics
    console.log('📊 Monitoring canary metrics');
    const metrics = await this.monitorCanaryMetrics();

    if (metrics.errorRate > this.config.zeroDowntime.maxErrorRate) {
      throw new Error(`Canary error rate too high: ${metrics.errorRate}%`);
    }

    // 4. Gradually increase traffic
    const trafficSteps = [25, 50, 75, 100];
    for (const percentage of trafficSteps) {
      console.log(`📈 Increasing traffic to ${percentage}%`);
      await this.routeTrafficToCanary(percentage);
      await this.sleep(30000); // Wait 30 seconds between steps

      const stepMetrics = await this.monitorCanaryMetrics();
      if (stepMetrics.errorRate > this.config.zeroDowntime.maxErrorRate) {
        throw new Error(
          `Canary error rate too high at ${percentage}%: ${stepMetrics.errorRate}%`
        );
      }
    }

    console.log('✅ Canary migration completed successfully');
    return 'canary_migration_complete';
  }

  // ============================================
  // Rollback Methods
  // ============================================

  async rollbackMigration(
    migrationId: string,
    reason: string
  ): Promise<string> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      throw new Error('Migration not found');
    }

    const jobId = crypto.randomUUID();
    const job: MigrationJob = {
      id: jobId,
      migrationId,
      type: 'rollback',
      status: 'pending',
      startTime: new Date(),
      progress: 0,
      recordsProcessed: 0,
      recordsTotal: 0,
      errors: [],
      warnings: [],
      metadata: {
        dryRun: false,
        batchSize: this.config.migration.batchSize,
        backupCreated: false,
        rollbackPlan: reason,
      },
    };

    this.migrationJobs.set(jobId, job);

    console.log(`⏪ Starting rollback: ${migration.name} - Reason: ${reason}`);
    this.emit('rollbackStarted', { job, reason });

    try {
      job.status = 'running';

      // Execute down script
      if (migration.downScript) {
        const sqlStatements = this.parseSQLScript(migration.downScript);
        const totalStatements = sqlStatements.length;

        for (let i = 0; i < totalStatements; i++) {
          const statement = sqlStatements[i];
          await this.executeSQL(statement, false);

          job.progress = Math.round(((i + 1) / totalStatements) * 100);
          this.emit('rollbackProgress', { job, progress: job.progress });
        }
      }

      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.progress = 100;

      // Remove migration from executed list
      await this.removeMigrationRecord(migration);

      console.log(`✅ Rollback completed: ${migration.name}`);
      this.emit('rollbackCompleted', job);

      return jobId;
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.duration = job.endTime!.getTime() - job.startTime.getTime();

      const rollbackError: MigrationError = {
        id: crypto.randomUUID(),
        type: 'schema',
        severity: 'critical',
        message: error.message,
        details: error.stack || '',
        timestamp: new Date(),
      };

      job.errors.push(rollbackError);

      console.error(`❌ Rollback failed: ${migration.name}`, error);
      this.emit('rollbackFailed', { job, error });

      throw error;
    }
  }

  // ============================================
  // Validation Methods
  // ============================================

  private async validateMigration(
    job: MigrationJob,
    migration: Migration
  ): Promise<void> {
    if (!migration.validation) return;

    console.log(`🔍 Validating migration: ${migration.name}`);

    const validation = migration.validation;

    // Record count validation
    if (validation.recordCount && migration.dataTransformation) {
      const sourceCount = await this.getRecordCount(
        migration.dataTransformation.sourceTable
      );
      const targetCount = await this.getRecordCount(
        migration.dataTransformation.targetTable
      );

      if (sourceCount !== targetCount) {
        job.warnings.push(
          `Record count mismatch: source=${sourceCount}, target=${targetCount}`
        );
      }
    }

    // Data integrity checks
    for (const integrityCheck of validation.dataIntegrity) {
      try {
        const result = await this.executeValidationQuery(integrityCheck);
        if (!result) {
          throw new Error(`Data integrity check failed: ${integrityCheck}`);
        }
      } catch (error) {
        const validationError: MigrationError = {
          id: crypto.randomUUID(),
          type: 'validation',
          severity: 'high',
          message: `Data integrity validation failed: ${error.message}`,
          details: integrityCheck,
          timestamp: new Date(),
        };

        job.errors.push(validationError);
      }
    }

    // Performance checks
    for (const perfCheck of validation.performanceChecks) {
      const startTime = Date.now();

      try {
        await this.executeValidationQuery(perfCheck.query);
        const executionTime = Date.now() - startTime;

        if (executionTime > perfCheck.maxExecutionTime) {
          job.warnings.push(
            `Performance check slow: ${perfCheck.name} took ${executionTime}ms (max: ${perfCheck.maxExecutionTime}ms)`
          );
        }
      } catch (error) {
        const perfError: MigrationError = {
          id: crypto.randomUUID(),
          type: 'performance',
          severity: 'medium',
          message: `Performance check failed: ${perfCheck.name}`,
          details: error.message,
          timestamp: new Date(),
        };

        job.errors.push(perfError);
      }
    }

    console.log(
      `✅ Migration validation completed: ${job.errors.length} errors, ${job.warnings.length} warnings`
    );
  }

  // ============================================
  // Utility Methods
  // ============================================

  private parseSQLScript(script: string): string[] {
    return script
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
  }

  private async executeSQL(statement: string, dryRun: boolean): Promise<any> {
    if (dryRun) {
      console.log(`[DRY RUN] SQL: ${statement.substring(0, 100)}...`);
      return Promise.resolve();
    }

    // In real implementation, execute against actual database
    console.log(`[EXECUTE] SQL: ${statement.substring(0, 100)}...`);
    await this.sleep(Math.random() * 1000 + 500); // Simulate execution time
    return Promise.resolve();
  }

  private async getRecordCount(tableName: string): Promise<number> {
    // Simulate getting record count
    return Math.floor(Math.random() * 100000) + 1000;
  }

  private async getDataBatch(
    tableName: string,
    offset: number,
    limit: number
  ): Promise<any[]> {
    // Simulate getting data batch
    const batch = [];
    for (let i = 0; i < limit; i++) {
      batch.push({
        id: offset + i + 1,
        name: `Record ${offset + i + 1}`,
        email: `user${offset + i + 1}@hotel.com`,
        created_at: new Date(),
      });
    }
    return batch;
  }

  private async insertTransformedRecord(
    record: any,
    tableName: string
  ): Promise<void> {
    // Simulate inserting transformed record
    await this.sleep(Math.random() * 10 + 5);
  }

  private async executeValidationQuery(query: string): Promise<boolean> {
    // Simulate validation query execution
    await this.sleep(Math.random() * 100 + 50);
    return Math.random() > 0.1; // 90% success rate
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // Zero-Downtime Utility Methods
  // ============================================

  private async performHealthCheck(instance?: string): Promise<boolean> {
    console.log(
      `🔍 Performing health check${instance ? ` on ${instance}` : ''}`
    );
    await this.sleep(1000);
    return Math.random() > 0.1; // 90% success rate
  }

  private async switchTraffic(environment: string): Promise<void> {
    console.log(`🔀 Switching traffic to ${environment}`);
    await this.sleep(2000);
  }

  private async monitorTrafficSwitch(): Promise<void> {
    console.log('📊 Monitoring traffic switch');
    await this.sleep(5000);
  }

  private async removeFromLoadBalancer(instance: string): Promise<void> {
    console.log(`➖ Removing ${instance} from load balancer`);
    await this.sleep(1000);
  }

  private async addToLoadBalancer(instance: string): Promise<void> {
    console.log(`➕ Adding ${instance} to load balancer`);
    await this.sleep(1000);
  }

  private async startShadowTraffic(): Promise<void> {
    console.log('👥 Starting shadow traffic');
    await this.sleep(2000);
  }

  private async compareShadowResults(): Promise<{
    passed: boolean;
    differences: number;
  }> {
    console.log('📊 Comparing shadow results');
    await this.sleep(3000);
    return { passed: true, differences: 0 };
  }

  private async promoteShadowToProduction(): Promise<void> {
    console.log('⬆️ Promoting shadow to production');
    await this.sleep(2000);
  }

  private async routeTrafficToCanary(percentage: number): Promise<void> {
    console.log(`🔀 Routing ${percentage}% traffic to canary`);
    await this.sleep(1000);
  }

  private async monitorCanaryMetrics(): Promise<{
    errorRate: number;
    responseTime: number;
  }> {
    await this.sleep(2000);
    return {
      errorRate: Math.random() * 2, // 0-2% error rate
      responseTime: Math.random() * 100 + 50, // 50-150ms
    };
  }

  // ============================================
  // Storage Methods
  // ============================================

  private async saveMigrationToFile(migration: Migration): Promise<void> {
    const filename = `${migration.version}_${migration.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    const filepath = path.join(this.config.database.migrationsPath, filename);
    await fs.writeFile(filepath, JSON.stringify(migration, null, 2));
  }

  private async loadMigrations(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.database.migrationsPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filepath = path.join(
              this.config.database.migrationsPath,
              file
            );
            const data = await fs.readFile(filepath, 'utf8');
            const migration: Migration = JSON.parse(data);
            this.migrations.set(migration.id, migration);
          } catch (error) {
            console.warn(`Failed to load migration ${file}:`, error);
          }
        }
      }

      console.log(`📂 Loaded ${this.migrations.size} migrations`);
    } catch (error) {
      console.warn('Failed to load migrations:', error);
    }
  }

  private async createPreMigrationBackup(migration: Migration): Promise<void> {
    console.log(`💾 Creating pre-migration backup for: ${migration.name}`);
    await this.sleep(2000);
  }

  private async recordMigrationExecution(
    migration: Migration,
    job: MigrationJob
  ): Promise<void> {
    // Record in database migration table
    console.log(`📝 Recording migration execution: ${migration.name}`);
  }

  private async removeMigrationRecord(migration: Migration): Promise<void> {
    // Remove from database migration table
    console.log(`🗑️ Removing migration record: ${migration.name}`);
  }

  private startMonitoring(): Promise<void> {
    // Start monitoring migration progress
    console.log('📊 Migration monitoring started');
    return Promise.resolve();
  }

  // ============================================
  // Public API Methods
  // ============================================

  getMigrations(): Migration[] {
    return Array.from(this.migrations.values());
  }

  getMigrationJobs(): MigrationJob[] {
    return Array.from(this.migrationJobs.values());
  }

  getMigrationStatus(jobId: string): MigrationJob | undefined {
    return this.migrationJobs.get(jobId);
  }

  getStatistics(): MigrationStats {
    const migrations = Array.from(this.migrations.values());
    const jobs = Array.from(this.migrationJobs.values());

    const completedJobs = jobs.filter(job => job.status === 'completed');
    const failedJobs = jobs.filter(job => job.status === 'failed');

    return {
      totalMigrations: migrations.length,
      completedMigrations: completedJobs.length,
      failedMigrations: failedJobs.length,
      successRate:
        jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0,
      averageDuration:
        completedJobs.length > 0
          ? completedJobs.reduce((sum, job) => sum + (job.duration || 0), 0) /
            completedJobs.length
          : 0,
      totalDataMigrated: jobs.reduce(
        (sum, job) => sum + job.recordsProcessed,
        0
      ),
      lastMigrationDate:
        jobs.length > 0
          ? new Date(Math.max(...jobs.map(job => job.startTime.getTime())))
          : undefined,
      upcomingMigrations: migrations.filter(
        migration =>
          !jobs.some(
            job =>
              job.migrationId === migration.id && job.status === 'completed'
          )
      ).length,
    };
  }

  updateConfig(newConfig: Partial<MigrationConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 DataMigration configuration updated');
    this.emit('configUpdated', this.config);
  }
}

// ============================================
// Export Default Instance
// ============================================

export const dataMigration = new DataMigration();
export default DataMigration;
