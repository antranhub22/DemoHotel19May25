import { spawn } from "child_process";
import crypto from "crypto";
import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================
// Types & Interfaces
// ============================================

export interface BackupConfig {
  database: {
    enabled: boolean;
    type: "postgresql" | "sqlite" | "mysql";
    connectionString: string;
    backupPath: string;
    retentionDays: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    schedules: BackupSchedule[];
  };
  filesystem: {
    enabled: boolean;
    paths: string[];
    excludePatterns: string[];
    backupPath: string;
    retentionDays: number;
    incrementalBackup: boolean;
    compressionLevel: number;
  };
  configuration: {
    enabled: boolean;
    configPaths: string[];
    environmentFiles: string[];
    secretsHandling: "exclude" | "encrypt" | "mask";
    backupPath: string;
    retentionDays: number;
  };
  applicationState: {
    enabled: boolean;
    statePaths: string[];
    sessionsBackup: boolean;
    cacheBackup: boolean;
    logsBackup: boolean;
    backupPath: string;
    retentionDays: number;
  };
  crossRegion: {
    enabled: boolean;
    regions: string[];
    replicationStrategy: "sync" | "async" | "scheduled";
    cloudProviders: CloudProvider[];
    encryptionInTransit: boolean;
  };
  monitoring: {
    enabled: boolean;
    alertOnFailure: boolean;
    reportGeneration: boolean;
    metricsCollection: boolean;
    healthChecks: boolean;
  };
  recovery: {
    testRecovery: boolean;
    testFrequency: number; // days
    recoveryTimeObjective: number; // minutes
    recoveryPointObjective: number; // minutes
    automatedTesting: boolean;
  };
}

export interface BackupSchedule {
  id: string;
  name: string;
  enabled: boolean;
  type: "full" | "incremental" | "differential";
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time: string; // HH:MM format
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  retentionCount: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface CloudProvider {
  id: string;
  name: string;
  type: "aws" | "azure" | "gcp" | "digitalocean" | "custom";
  credentials: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
    bucket?: string;
    endpoint?: string;
  };
  enabled: boolean;
}

export interface BackupJob {
  id: string;
  scheduleId: string;
  type: "database" | "filesystem" | "configuration" | "application_state";
  backupType: "full" | "incremental" | "differential";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  size?: number; // bytes
  location: string;
  metadata: {
    sourceSize: number;
    compressionRatio?: number;
    encrypted: boolean;
    checksum: string;
    version: string;
  };
  errors?: string[];
  warnings?: string[];
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: "database" | "filesystem" | "configuration" | "application_state";
  backupType: "full" | "incremental" | "differential";
  size: number;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  location: string;
  expiryDate: Date;
  dependencies: string[]; // For incremental backups
  restoration: {
    tested: boolean;
    lastTestDate?: Date;
    testResult?: "success" | "failure";
  };
}

export interface RestoreJob {
  id: string;
  backupId: string;
  type: "full" | "selective" | "point_in_time";
  targetLocation: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number; // 0-100
  errors?: string[];
  warnings?: string[];
}

export interface BackupStatistics {
  totalBackups: number;
  totalSize: number;
  successRate: number;
  averageDuration: number;
  lastBackupTime?: Date;
  nextScheduledBackup?: Date;
  storageUtilization: {
    used: number;
    available: number;
    utilizationPercentage: number;
  };
  backupsByType: Record<string, number>;
  backupsByStatus: Record<string, number>;
}

// ============================================
// Default Configuration
// ============================================

const defaultBackupConfig: BackupConfig = {
  database: {
    enabled: true,
    type: "postgresql",
    connectionString:
      process.env.DATABASE_URL || "postgresql://localhost:5432/hotel_db",
    backupPath: "./backups/database",
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    schedules: [
      {
        id: "daily-full",
        name: "Daily Full Database Backup",
        enabled: true,
        type: "full",
        frequency: "daily",
        time: "02:00",
        retentionCount: 7,
        priority: "high",
      },
      {
        id: "hourly-incremental",
        name: "Hourly Incremental Backup",
        enabled: true,
        type: "incremental",
        frequency: "hourly",
        time: "00",
        retentionCount: 24,
        priority: "medium",
      },
    ],
  },
  filesystem: {
    enabled: true,
    paths: ["./uploads", "./assets", "./logs"],
    excludePatterns: ["*.tmp", "*.log", "*.cache", "node_modules/**"],
    backupPath: "./backups/filesystem",
    retentionDays: 14,
    incrementalBackup: true,
    compressionLevel: 6,
  },
  configuration: {
    enabled: true,
    configPaths: ["./config", "./.env.example", "./package.json"],
    environmentFiles: ["./.env", "./.env.local"],
    secretsHandling: "encrypt",
    backupPath: "./backups/configuration",
    retentionDays: 90,
  },
  applicationState: {
    enabled: true,
    statePaths: ["./data/state", "./data/sessions"],
    sessionsBackup: true,
    cacheBackup: false,
    logsBackup: true,
    backupPath: "./backups/application",
    retentionDays: 7,
  },
  crossRegion: {
    enabled: false,
    regions: ["us-east-1", "eu-west-1"],
    replicationStrategy: "scheduled",
    cloudProviders: [],
    encryptionInTransit: true,
  },
  monitoring: {
    enabled: true,
    alertOnFailure: true,
    reportGeneration: true,
    metricsCollection: true,
    healthChecks: true,
  },
  recovery: {
    testRecovery: true,
    testFrequency: 7, // Weekly
    recoveryTimeObjective: 60, // 1 hour
    recoveryPointObjective: 15, // 15 minutes
    automatedTesting: true,
  },
};

// ============================================
// Backup Manager Class
// ============================================

export class BackupManager extends EventEmitter {
  private config: BackupConfig;
  private activeJobs: Map<string, BackupJob> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private backupMetadata: Map<string, BackupMetadata> = new Map();
  private statistics: BackupStatistics;

  constructor(config: Partial<BackupConfig> = {}) {
    super();
    this.config = { ...defaultBackupConfig, ...config };
    this.statistics = this.initializeStatistics();

    this.initializeBackupManager();

    console.log(
      "💾 BackupManager initialized with comprehensive backup solutions",
      "BackupManager",
    );
  }

  // ============================================
  // Initialization Methods
  // ============================================

  private async initializeBackupManager() {
    try {
      // Create backup directories
      await this.createBackupDirectories();

      // Load existing backup metadata
      await this.loadBackupMetadata();

      // Schedule backup jobs
      this.scheduleBackupJobs();

      // Start monitoring
      this.startMonitoring();

      // Cleanup old backups
      this.startCleanupScheduler();

      this.emit("initialized");
    } catch (error) {
      console.error("Failed to initialize backup manager:", error);
      throw error;
    }
  }

  private async createBackupDirectories() {
    const dirs = [
      this.config.database.backupPath,
      this.config.filesystem.backupPath,
      this.config.configuration.backupPath,
      this.config.applicationState.backupPath,
      "./backups/metadata",
      "./backups/temp",
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create backup directory ${dir}:`, error);
      }
    }
  }

  private initializeStatistics(): BackupStatistics {
    return {
      totalBackups: 0,
      totalSize: 0,
      successRate: 0,
      averageDuration: 0,
      storageUtilization: {
        used: 0,
        available: 0,
        utilizationPercentage: 0,
      },
      backupsByType: {},
      backupsByStatus: {},
    };
  }

  // ============================================
  // Database Backup Methods
  // ============================================

  async createDatabaseBackup(
    scheduleId?: string,
    backupType: "full" | "incremental" = "full",
  ): Promise<string> {
    if (!this.config.database.enabled) {
      throw new Error("Database backup is disabled");
    }

    const jobId = crypto.randomUUID();
    const job: BackupJob = {
      id: jobId,
      scheduleId: scheduleId || "manual",
      type: "database",
      backupType,
      status: "pending",
      startTime: new Date(),
      location: "",
      metadata: {
        sourceSize: 0,
        encrypted: this.config.database.encryptionEnabled,
        checksum: "",
        version: "1.0",
      },
    };

    this.activeJobs.set(jobId, job);
    this.emit("backupStarted", job);

    try {
      job.status = "running";

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `db_${backupType}_${timestamp}.sql`;
      const backupPath = path.join(this.config.database.backupPath, filename);

      // Perform database backup based on type
      let backupSize = 0;
      switch (this.config.database.type) {
        case "postgresql":
          backupSize = await this.createPostgreSQLBackup(
            backupPath,
            backupType,
          );
          break;
        case "sqlite":
          backupSize = await this.createSQLiteBackup(backupPath);
          break;
        case "mysql":
          backupSize = await this.createMySQLBackup(backupPath, backupType);
          break;
        default:
          throw new Error(
            `Unsupported database type: ${this.config.database.type}`,
          );
      }

      // Compress if enabled
      let finalPath = backupPath;
      if (this.config.database.compressionEnabled) {
        finalPath = await this.compressFile(backupPath);
        await fs.unlink(backupPath); // Remove uncompressed file
      }

      // Encrypt if enabled
      if (this.config.database.encryptionEnabled) {
        finalPath = await this.encryptFile(finalPath);
        // Remove unencrypted file if different
        if (finalPath !== backupPath) {
          await fs.unlink(
            this.config.database.compressionEnabled
              ? backupPath + ".gz"
              : backupPath,
          );
        }
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(finalPath);

      // Get final file size
      const stats = await fs.stat(finalPath);

      // Update job
      job.status = "completed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.size = stats.size;
      job.location = finalPath;
      job.metadata.sourceSize = backupSize;
      job.metadata.checksum = checksum;
      job.metadata.compressionRatio = this.config.database.compressionEnabled
        ? backupSize / stats.size
        : 1;

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: crypto.randomUUID(),
        timestamp: job.startTime,
        type: "database",
        backupType,
        size: stats.size,
        compressed: this.config.database.compressionEnabled,
        encrypted: this.config.database.encryptionEnabled,
        checksum,
        location: finalPath,
        expiryDate: new Date(
          Date.now() + this.config.database.retentionDays * 24 * 60 * 60 * 1000,
        ),
        dependencies:
          backupType === "incremental"
            ? this.getLastFullBackupIds("database")
            : [],
        restoration: {
          tested: false,
        },
      };

      this.backupMetadata.set(metadata.id, metadata);
      await this.saveBackupMetadata(metadata);

      this.updateStatistics();
      this.emit("backupCompleted", job);

      console.log(
        `✅ Database backup completed: ${finalPath} (${this.formatSize(stats.size)})`,
      );
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.errors = [error.message];

      this.emit("backupFailed", job);
      console.error(`❌ Database backup failed:`, error);
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  private async createPostgreSQLBackup(
    backupPath: string,
    backupType: "full" | "incremental",
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      // Parse connection string
      const url = new URL(this.config.database.connectionString);

      const args = [
        "--host",
        url.hostname,
        "--port",
        url.port || "5432",
        "--username",
        url.username,
        "--dbname",
        url.pathname.slice(1),
        "--file",
        backupPath,
        "--verbose",
      ];

      if (backupType === "full") {
        args.push("--create", "--clean");
      }

      // Set password through environment
      const env = { ...process.env, PGPASSWORD: url.password };

      const pgDump = spawn("pg_dump", args, { env });

      // ✅ MEMORY SAFE: Use bounded error buffer instead of string concatenation
      const errorChunks: Buffer[] = [];
      let errorSize = 0;
      const MAX_ERROR_SIZE = 1024 * 1024; // 1MB max error output

      pgDump.stderr.on("data", (data) => {
        errorSize += data.length;

        if (errorSize > MAX_ERROR_SIZE) {
          // Keep only the last part of error output
          errorChunks.length = 0;
          errorChunks.push(Buffer.from("...[error output truncated]...\n"));
          errorChunks.push(data.slice(-1024)); // Keep last 1KB
          errorSize = errorChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        } else {
          errorChunks.push(data);
        }
      });

      pgDump.on("close", async (code) => {
        if (code === 0) {
          try {
            const stats = await fs.stat(backupPath);
            resolve(stats.size);
          } catch (error) {
            reject(error);
          }
        } else {
          const errorOutput = Buffer.concat(errorChunks).toString("utf-8");
          reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
        }
      });

      pgDump.on("error", (error) => {
        reject(new Error(`Failed to start pg_dump: ${error.message}`));
      });
    });
  }

  private async createSQLiteBackup(backupPath: string): Promise<number> {
    // For SQLite, we can just copy the database file
    const dbPath = this.config.database.connectionString.replace("sqlite:", "");
    await fs.copyFile(dbPath, backupPath);

    const stats = await fs.stat(backupPath);
    return stats.size;
  }

  private async createMySQLBackup(
    backupPath: string,
    backupType: "full" | "incremental",
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      // Parse connection string
      const url = new URL(this.config.database.connectionString);

      const args = [
        "--host",
        url.hostname,
        "--port",
        url.port || "3306",
        "--user",
        url.username,
        "--password=" + url.password,
        "--single-transaction",
        "--routines",
        "--triggers",
        url.pathname.slice(1),
      ];

      if (backupType === "full") {
        args.push("--add-drop-database", "--create-options");
      }

      const mysqldump = spawn("mysqldump", args);
      const writeStream = require("fs").createWriteStream(backupPath);

      mysqldump.stdout.pipe(writeStream);

      // ✅ MEMORY SAFE: Use bounded error buffer for MySQL dump
      const errorChunks: Buffer[] = [];
      let errorSize = 0;
      const MAX_ERROR_SIZE = 1024 * 1024; // 1MB max error output

      mysqldump.stderr.on("data", (data) => {
        errorSize += data.length;

        if (errorSize > MAX_ERROR_SIZE) {
          // Keep only the last part of error output
          errorChunks.length = 0;
          errorChunks.push(Buffer.from("...[error output truncated]...\n"));
          errorChunks.push(data.slice(-1024)); // Keep last 1KB
          errorSize = errorChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        } else {
          errorChunks.push(data);
        }
      });

      mysqldump.on("close", async (code) => {
        writeStream.end();

        if (code === 0) {
          try {
            const stats = await fs.stat(backupPath);
            resolve(stats.size);
          } catch (error) {
            reject(error);
          }
        } else {
          const errorOutput = Buffer.concat(errorChunks).toString("utf-8");
          reject(
            new Error(`mysqldump failed with code ${code}: ${errorOutput}`),
          );
        }
      });

      mysqldump.on("error", (error) => {
        reject(new Error(`Failed to start mysqldump: ${error.message}`));
      });
    });
  }

  // ============================================
  // Filesystem Backup Methods
  // ============================================

  async createFilesystemBackup(scheduleId?: string): Promise<string> {
    if (!this.config.filesystem.enabled) {
      throw new Error("Filesystem backup is disabled");
    }

    const jobId = crypto.randomUUID();
    const job: BackupJob = {
      id: jobId,
      scheduleId: scheduleId || "manual",
      type: "filesystem",
      backupType: this.config.filesystem.incrementalBackup
        ? "incremental"
        : "full",
      status: "pending",
      startTime: new Date(),
      location: "",
      metadata: {
        sourceSize: 0,
        encrypted: false,
        checksum: "",
        version: "1.0",
      },
    };

    this.activeJobs.set(jobId, job);
    this.emit("backupStarted", job);

    try {
      job.status = "running";

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `fs_${job.backupType}_${timestamp}.tar.gz`;
      const backupPath = path.join(this.config.filesystem.backupPath, filename);

      // Create tar archive
      await this.createTarArchive(
        this.config.filesystem.paths,
        backupPath,
        this.config.filesystem.excludePatterns,
      );

      // Get file size
      const stats = await fs.stat(backupPath);

      // Calculate checksum
      const checksum = await this.calculateChecksum(backupPath);

      // Update job
      job.status = "completed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.size = stats.size;
      job.location = backupPath;
      job.metadata.checksum = checksum;

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: crypto.randomUUID(),
        timestamp: job.startTime,
        type: "filesystem",
        backupType: job.backupType,
        size: stats.size,
        compressed: true,
        encrypted: false,
        checksum,
        location: backupPath,
        expiryDate: new Date(
          Date.now() +
            this.config.filesystem.retentionDays * 24 * 60 * 60 * 1000,
        ),
        dependencies: [],
        restoration: {
          tested: false,
        },
      };

      this.backupMetadata.set(metadata.id, metadata);
      await this.saveBackupMetadata(metadata);

      this.updateStatistics();
      this.emit("backupCompleted", job);

      console.log(
        `✅ Filesystem backup completed: ${backupPath} (${this.formatSize(stats.size)})`,
      );
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.errors = [error.message];

      this.emit("backupFailed", job);
      console.error(`❌ Filesystem backup failed:`, error);
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  // ============================================
  // Configuration Backup Methods
  // ============================================

  async createConfigurationBackup(scheduleId?: string): Promise<string> {
    if (!this.config.configuration.enabled) {
      throw new Error("Configuration backup is disabled");
    }

    const jobId = crypto.randomUUID();
    const job: BackupJob = {
      id: jobId,
      scheduleId: scheduleId || "manual",
      type: "configuration",
      backupType: "full",
      status: "pending",
      startTime: new Date(),
      location: "",
      metadata: {
        sourceSize: 0,
        encrypted: this.config.configuration.secretsHandling === "encrypt",
        checksum: "",
        version: "1.0",
      },
    };

    this.activeJobs.set(jobId, job);
    this.emit("backupStarted", job);

    try {
      job.status = "running";

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `config_${timestamp}.tar.gz`;
      const backupPath = path.join(
        this.config.configuration.backupPath,
        filename,
      );

      // Handle secrets based on configuration
      const pathsToBackup = [...this.config.configuration.configPaths];

      if (this.config.configuration.secretsHandling !== "exclude") {
        pathsToBackup.push(...this.config.configuration.environmentFiles);
      }

      // Create tar archive
      await this.createTarArchive(pathsToBackup, backupPath);

      // Encrypt if handling secrets with encryption
      let finalPath = backupPath;
      if (this.config.configuration.secretsHandling === "encrypt") {
        finalPath = await this.encryptFile(backupPath);
        await fs.unlink(backupPath);
      }

      // Get file size
      const stats = await fs.stat(finalPath);

      // Calculate checksum
      const checksum = await this.calculateChecksum(finalPath);

      // Update job
      job.status = "completed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.size = stats.size;
      job.location = finalPath;
      job.metadata.checksum = checksum;

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: crypto.randomUUID(),
        timestamp: job.startTime,
        type: "configuration",
        backupType: "full",
        size: stats.size,
        compressed: true,
        encrypted: this.config.configuration.secretsHandling === "encrypt",
        checksum,
        location: finalPath,
        expiryDate: new Date(
          Date.now() +
            this.config.configuration.retentionDays * 24 * 60 * 60 * 1000,
        ),
        dependencies: [],
        restoration: {
          tested: false,
        },
      };

      this.backupMetadata.set(metadata.id, metadata);
      await this.saveBackupMetadata(metadata);

      this.updateStatistics();
      this.emit("backupCompleted", job);

      console.log(
        `✅ Configuration backup completed: ${finalPath} (${this.formatSize(stats.size)})`,
      );
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.errors = [error.message];

      this.emit("backupFailed", job);
      console.error(`❌ Configuration backup failed:`, error);
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  // ============================================
  // Application State Backup Methods
  // ============================================

  async createApplicationStateBackup(scheduleId?: string): Promise<string> {
    if (!this.config.applicationState.enabled) {
      throw new Error("Application state backup is disabled");
    }

    const jobId = crypto.randomUUID();
    const job: BackupJob = {
      id: jobId,
      scheduleId: scheduleId || "manual",
      type: "application_state",
      backupType: "full",
      status: "pending",
      startTime: new Date(),
      location: "",
      metadata: {
        sourceSize: 0,
        encrypted: false,
        checksum: "",
        version: "1.0",
      },
    };

    this.activeJobs.set(jobId, job);
    this.emit("backupStarted", job);

    try {
      job.status = "running";

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `appstate_${timestamp}.tar.gz`;
      const backupPath = path.join(
        this.config.applicationState.backupPath,
        filename,
      );

      // Collect paths to backup
      const pathsToBackup = [...this.config.applicationState.statePaths];

      if (this.config.applicationState.logsBackup) {
        pathsToBackup.push("./logs");
      }

      // Create tar archive
      await this.createTarArchive(pathsToBackup, backupPath);

      // Get file size
      const stats = await fs.stat(backupPath);

      // Calculate checksum
      const checksum = await this.calculateChecksum(backupPath);

      // Update job
      job.status = "completed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.size = stats.size;
      job.location = backupPath;
      job.metadata.checksum = checksum;

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: crypto.randomUUID(),
        timestamp: job.startTime,
        type: "application_state",
        backupType: "full",
        size: stats.size,
        compressed: true,
        encrypted: false,
        checksum,
        location: backupPath,
        expiryDate: new Date(
          Date.now() +
            this.config.applicationState.retentionDays * 24 * 60 * 60 * 1000,
        ),
        dependencies: [],
        restoration: {
          tested: false,
        },
      };

      this.backupMetadata.set(metadata.id, metadata);
      await this.saveBackupMetadata(metadata);

      this.updateStatistics();
      this.emit("backupCompleted", job);

      console.log(
        `✅ Application state backup completed: ${backupPath} (${this.formatSize(stats.size)})`,
      );
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime.getTime();
      job.errors = [error.message];

      this.emit("backupFailed", job);
      console.error(`❌ Application state backup failed:`, error);
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private async compressFile(filePath: string): Promise<string> {
    const compressedPath = filePath + ".gz";

    return new Promise((resolve, reject) => {
      const gzip = require("zlib").createGzip();
      const readStream = require("fs").createReadStream(filePath);
      const writeStream = require("fs").createWriteStream(compressedPath);

      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on("finish", () => resolve(compressedPath))
        .on("error", (err: any) => {
          try {
            readStream.destroy(err);
          } catch (_e) {
            /* ignore */
          }
          try {
            writeStream.destroy(err);
          } catch (_e) {
            /* ignore */
          }
          reject(err);
        });
    });
  }

  private async encryptFile(filePath: string): Promise<string> {
    const encryptedPath = filePath + ".enc";

    // Simple encryption using crypto (in production, use proper key management)
    const key = crypto.randomBytes(32);

    const cipher = crypto.createCipher("aes-256-cbc", key);
    const readStream = require("fs").createReadStream(filePath);
    const writeStream = require("fs").createWriteStream(encryptedPath);

    return new Promise((resolve, reject) => {
      readStream
        .pipe(cipher)
        .pipe(writeStream)
        .on("finish", () => resolve(encryptedPath))
        .on("error", (err: any) => {
          try {
            readStream.destroy(err);
          } catch (_e) {
            /* ignore */
          }
          try {
            writeStream.destroy(err);
          } catch (_e) {
            /* ignore */
          }
          reject(err);
        });
    });
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = require("fs").createReadStream(filePath);

      stream.on("data", (data: any) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", (err: any) => {
        try {
          stream.destroy(err);
        } catch (_e) {
          /* ignore */
        }
        reject(err);
      });
    });
  }

  private async createTarArchive(
    paths: string[],
    outputPath: string,
    excludePatterns: string[] = [],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ["-czf", outputPath];

      // Add exclude patterns
      for (const pattern of excludePatterns) {
        args.push("--exclude", pattern);
      }

      // Add paths
      args.push(...paths);

      const tar = spawn("tar", args);

      // ✅ MEMORY SAFE: Use bounded error buffer for tar
      const errorChunks: Buffer[] = [];
      let errorSize = 0;
      const MAX_ERROR_SIZE = 1024 * 1024; // 1MB max error output

      tar.stderr.on("data", (data) => {
        errorSize += data.length;

        if (errorSize > MAX_ERROR_SIZE) {
          // Keep only the last part of error output
          errorChunks.length = 0;
          errorChunks.push(Buffer.from("...[error output truncated]...\n"));
          errorChunks.push(data.slice(-1024)); // Keep last 1KB
          errorSize = errorChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        } else {
          errorChunks.push(data);
        }
      });

      tar.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          const errorOutput = Buffer.concat(errorChunks).toString("utf-8");
          reject(new Error(`tar failed with code ${code}: ${errorOutput}`));
        }
      });

      tar.on("error", (error) => {
        reject(new Error(`Failed to start tar: ${error.message}`));
      });
    });
  }

  private getLastFullBackupIds(type: string): string[] {
    const fullBackups = Array.from(this.backupMetadata.values())
      .filter((backup) => backup.type === type && backup.backupType === "full")
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return fullBackups.slice(0, 1).map((backup) => backup.id);
  }

  // ============================================
  // Scheduling Methods
  // ============================================

  private scheduleBackupJobs() {
    // Schedule database backups
    if (this.config.database.enabled) {
      for (const schedule of this.config.database.schedules) {
        if (schedule.enabled) {
          this.scheduleJob(schedule, "database");
        }
      }
    }

    console.log("📅 Backup jobs scheduled successfully");
  }

  private scheduleJob(
    schedule: BackupSchedule,
    type: "database" | "filesystem" | "configuration" | "application_state",
  ) {
    // For simplicity, we'll use setTimeout with calculated intervals
    const interval = this.calculateInterval(schedule);

    const timeoutId = setInterval(async () => {
      try {
        console.log(`🔄 Running scheduled backup: ${schedule.name}`);

        switch (type) {
          case "database": {
            // Map differential to incremental for database backups
            const backupType =
              schedule.type === "differential" ? "incremental" : schedule.type;
            await this.createDatabaseBackup(
              schedule.id,
              backupType as "full" | "incremental",
            );
            break;
          }
          case "filesystem":
            await this.createFilesystemBackup(schedule.id);
            break;
          case "configuration":
            await this.createConfigurationBackup(schedule.id);
            break;
          case "application_state":
            await this.createApplicationStateBackup(schedule.id);
            break;
        }
      } catch (error) {
        console.error(
          `Failed to run scheduled backup ${schedule.name}:`,
          error,
        );
      }
    }, interval);

    this.scheduledJobs.set(schedule.id, timeoutId);
  }

  private calculateInterval(schedule: BackupSchedule): number {
    switch (schedule.frequency) {
      case "hourly":
        return 60 * 60 * 1000; // 1 hour
      case "daily":
        return 24 * 60 * 60 * 1000; // 1 day
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000; // 1 week
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000; // 1 month
      default:
        return 24 * 60 * 60 * 1000; // Default: 1 day
    }
  }

  // ============================================
  // Monitoring & Cleanup Methods
  // ============================================

  private startMonitoring() {
    if (!this.config.monitoring.enabled) return;

    // Monitor backup health every 5 minutes
    setInterval(
      () => {
        this.performHealthCheck();
      },
      5 * 60 * 1000,
    );
  }

  private startCleanupScheduler() {
    // Run cleanup daily
    setInterval(
      () => {
        this.cleanupExpiredBackups();
      },
      24 * 60 * 60 * 1000,
    );
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check storage utilization
      await this.updateStorageUtilization();

      // Check for failed jobs
      const failedJobs = Array.from(this.activeJobs.values()).filter(
        (job) => job.status === "failed",
      );

      if (failedJobs.length > 0 && this.config.monitoring.alertOnFailure) {
        this.emit("healthCheckFailed", {
          failedJobs: failedJobs.length,
          details: failedJobs.map((job) => ({
            id: job.id,
            errors: job.errors,
          })),
        });
      }

      this.emit("healthCheckCompleted", {
        status: failedJobs.length === 0 ? "healthy" : "warning",
        activeJobs: this.activeJobs.size,
        failedJobs: failedJobs.length,
        storageUtilization: this.statistics.storageUtilization,
      });
    } catch (error) {
      console.error("Health check failed:", error);
    }
  }

  private async cleanupExpiredBackups(): Promise<void> {
    const now = new Date();
    const expiredBackups: string[] = [];

    for (const [id, metadata] of this.backupMetadata) {
      if (metadata.expiryDate <= now) {
        try {
          await fs.unlink(metadata.location);
          this.backupMetadata.delete(id);
          expiredBackups.push(id);
          console.log(`🗑️ Cleaned up expired backup: ${metadata.location}`);
        } catch (error) {
          console.warn(`Failed to cleanup backup ${metadata.location}:`, error);
        }
      }
    }

    if (expiredBackups.length > 0) {
      this.updateStatistics();
      this.emit("backupsCleanedUp", {
        count: expiredBackups.length,
        backupIds: expiredBackups,
      });
    }
  }

  private async updateStorageUtilization(): Promise<void> {
    try {
      const totalSize = Array.from(this.backupMetadata.values()).reduce(
        (sum, metadata) => sum + metadata.size,
        0,
      );

      // Get available disk space
      // Note: fs.stat doesn't provide disk space info, using placeholder
      const availableSpace = 100 * 1024 * 1024 * 1024; // 100GB placeholder

      this.statistics.storageUtilization = {
        used: totalSize,
        available: availableSpace,
        utilizationPercentage: (totalSize / availableSpace) * 100,
      };
    } catch (error) {
      console.warn("Failed to update storage utilization:", error);
    }
  }

  // ============================================
  // Statistics & Metadata Methods
  // ============================================

  private updateStatistics(): void {
    const backups = Array.from(this.backupMetadata.values());
    const jobs = Array.from(this.activeJobs.values());

    this.statistics.totalBackups = backups.length;
    this.statistics.totalSize = backups.reduce(
      (sum, backup) => sum + backup.size,
      0,
    );

    const completedJobs = jobs.filter((job) => job.status === "completed");
    this.statistics.successRate =
      jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0;

    const durations = completedJobs
      .filter((job) => job.duration)
      .map((job) => job.duration!);
    this.statistics.averageDuration =
      durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) /
          durations.length
        : 0;

    this.statistics.lastBackupTime =
      backups.length > 0
        ? new Date(
            Math.max(...backups.map((backup) => backup.timestamp.getTime())),
          )
        : undefined;

    // Group by type
    this.statistics.backupsByType = backups.reduce(
      (acc: Record<string, number>, backup) => {
        acc[backup.type] = (acc[backup.type] || 0) + 1;
        return acc;
      },
      {},
    );

    // Group by status (using jobs)
    this.statistics.backupsByStatus = jobs.reduce(
      (acc: Record<string, number>, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {},
    );
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join("./backups/metadata", `${metadata.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async loadBackupMetadata(): Promise<void> {
    try {
      const metadataDir = "./backups/metadata";
      const files = await fs.readdir(metadataDir).catch(() => []);

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = path.join(metadataDir, file);
            const data = await fs.readFile(filePath, "utf8");
            const metadata: BackupMetadata = JSON.parse(data);
            this.backupMetadata.set(metadata.id, metadata);
          } catch (error) {
            console.warn(`Failed to load backup metadata ${file}:`, error);
          }
        }
      }

      console.log(
        `📂 Loaded ${this.backupMetadata.size} backup metadata records`,
      );
    } catch (error) {
      console.warn("Failed to load backup metadata:", error);
    }
  }

  // ============================================
  // Public API Methods
  // ============================================

  async createManualBackup(
    type:
      | "database"
      | "filesystem"
      | "configuration"
      | "application_state"
      | "all",
  ): Promise<string[]> {
    const jobIds: string[] = [];

    try {
      if (type === "database" || type === "all") {
        jobIds.push(await this.createDatabaseBackup());
      }

      if (type === "filesystem" || type === "all") {
        jobIds.push(await this.createFilesystemBackup());
      }

      if (type === "configuration" || type === "all") {
        jobIds.push(await this.createConfigurationBackup());
      }

      if (type === "application_state" || type === "all") {
        jobIds.push(await this.createApplicationStateBackup());
      }

      return jobIds;
    } catch (error) {
      console.error(`Manual backup failed for type ${type}:`, error);
      throw error;
    }
  }

  getBackupStatus(jobId: string): BackupJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getBackupHistory(limit: number = 100): BackupMetadata[] {
    return Array.from(this.backupMetadata.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getStatistics(): BackupStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  private formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Reschedule jobs if needed
    for (const [, timeoutId] of this.scheduledJobs) {
      clearInterval(timeoutId);
    }
    this.scheduledJobs.clear();
    this.scheduleBackupJobs();

    console.log("🔧 BackupManager configuration updated");
    this.emit("configUpdated", this.config);
  }
}

// ============================================
// Export Default Instance
// ============================================

export const backupManager = new BackupManager();
export default BackupManager;
