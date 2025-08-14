/**
 * 🗃️ DATABASE OPERATIONS MEMORY MONITOR
 *
 * Specialized monitoring for database operations to identify
 * queries and operations causing memory spikes.
 */

import { logger } from "@shared/utils/logger";
import { memoryProfiler, ProfileMemory } from "@server/shared/MemoryProfiler";
import { createMemoryBlock } from "@server/shared/MemoryProfiler";

export interface DatabaseOperationProfile {
  queryType: string;
  tableName?: string;
  recordCount?: number;
  querySize: number;
  memoryUsage: number;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface QueryMemoryStats {
  queryType: string;
  avgMemoryUsage: number;
  maxMemoryUsage: number;
  totalExecutions: number;
  avgDuration: number;
  maxDuration: number;
  failureRate: number;
  lastExecuted: Date;
}

class DatabaseMemoryMonitor {
  private static instance: DatabaseMemoryMonitor;
  private queryProfiles: DatabaseOperationProfile[] = [];
  private queryStats = new Map<string, QueryMemoryStats>();
  private maxProfileHistory = 1000;
  private isEnabled = true;

  // Memory thresholds for different query types
  private thresholds = {
    SELECT: 10 * 1024 * 1024, // 10MB
    INSERT: 5 * 1024 * 1024, // 5MB
    UPDATE: 5 * 1024 * 1024, // 5MB
    DELETE: 2 * 1024 * 1024, // 2MB
    BULK: 50 * 1024 * 1024, // 50MB for bulk operations
    MIGRATION: 100 * 1024 * 1024, // 100MB for migrations
  };

  static getInstance(): DatabaseMemoryMonitor {
    if (!DatabaseMemoryMonitor.instance) {
      DatabaseMemoryMonitor.instance = new DatabaseMemoryMonitor();
    }
    return DatabaseMemoryMonitor.instance;
  }

  /**
   * Enable/disable database memory monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info(
      `🗃️ Database memory monitoring ${enabled ? "enabled" : "disabled"}`,
      "DatabaseMemoryMonitor",
    );
  }

  /**
   * Configure memory thresholds for different query types
   */
  configureThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    logger.info(
      "🔧 Database memory thresholds configured",
      "DatabaseMemoryMonitor",
      {
        thresholds: Object.entries(this.thresholds).reduce(
          (acc, [key, value]) => {
            acc[key] = `${(value / 1024 / 1024).toFixed(0)}MB`;
            return acc;
          },
          {} as Record<string, string>,
        ),
      },
    );
  }

  /**
   * Monitor a database query with memory tracking
   */
  async monitorQuery<T>(
    queryType: string,
    query: string,
    tableName: string | undefined,
    executor: () => Promise<T>,
    options: {
      expectedRecords?: number;
      isBulkOperation?: boolean;
      isMigration?: boolean;
    } = {},
  ): Promise<T> {
    if (!this.isEnabled) {
      return await executor();
    }

    const operationName = this.buildOperationName(
      queryType,
      tableName,
      options,
    );
    const querySize = query.length;
    const startTime = Date.now();

    try {
      const result = await memoryProfiler.profileFunction(
        operationName,
        executor,
        {
          logLevel: this.determineLogLevel(queryType, options),
          context: {
            queryType,
            tableName,
            querySize,
            expectedRecords: options.expectedRecords,
            isBulkOperation: options.isBulkOperation,
            isMigration: options.isMigration,
            queryPreview: query.substring(0, 200),
          },
        },
      );

      // Get the memory profile
      const profile = memoryProfiler.getFunctionProfile(operationName);
      if (profile) {
        const memoryUsage = profile.maxMemoryPerCall;
        const duration = Date.now() - startTime;

        // Record operation profile
        this.recordOperation({
          queryType,
          tableName,
          recordCount: options.expectedRecords,
          querySize,
          memoryUsage,
          duration,
          timestamp: new Date(),
          success: true,
        });

        // Check thresholds
        this.checkMemoryThreshold(
          queryType,
          memoryUsage,
          operationName,
          options,
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failed operation
      this.recordOperation({
        queryType,
        tableName,
        recordCount: options.expectedRecords,
        querySize,
        memoryUsage: 0,
        duration,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      logger.error("❌ Database operation failed", "DatabaseMemoryMonitor", {
        queryType,
        tableName,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      });

      throw error;
    }
  }

  /**
   * Monitor Prisma operation specifically
   */
  async monitorPrismaOperation<T>(
    operation: string,
    model: string,
    executor: () => Promise<T>,
    options: {
      where?: any;
      select?: any;
      include?: any;
      take?: number;
      skip?: number;
      data?: any;
    } = {},
  ): Promise<T> {
    const memoryBlock = createMemoryBlock(`Prisma.${model}.${operation}`, {
      model,
      operation,
      hasWhere: !!options.where,
      hasSelect: !!options.select,
      hasInclude: !!options.include,
      take: options.take,
      skip: options.skip,
      hasData: !!options.data,
    });

    try {
      const result = await executor();
      memoryBlock.end();
      return result;
    } catch (error) {
      memoryBlock.end();
      throw error;
    }
  }

  /**
   * Monitor batch database operations
   */
  async monitorBatchOperation<T>(
    batchName: string,
    batchSize: number,
    executor: () => Promise<T>,
  ): Promise<T> {
    return this.monitorQuery(
      "BATCH",
      `BATCH ${batchName}`,
      undefined,
      executor,
      {
        expectedRecords: batchSize,
        isBulkOperation: true,
      },
    );
  }

  /**
   * Monitor database migration
   */
  async monitorMigration<T>(
    migrationName: string,
    executor: () => Promise<T>,
  ): Promise<T> {
    return this.monitorQuery(
      "MIGRATION",
      `MIGRATION ${migrationName}`,
      undefined,
      executor,
      {
        isMigration: true,
      },
    );
  }

  /**
   * Build operation name for profiling
   */
  private buildOperationName(
    queryType: string,
    tableName: string | undefined,
    options: any,
  ): string {
    let name = `DB.${queryType}`;

    if (tableName) {
      name += `.${tableName}`;
    }

    if (options.isMigration) {
      name += ".MIGRATION";
    } else if (options.isBulkOperation) {
      name += ".BULK";
    }

    return name;
  }

  /**
   * Determine appropriate log level
   */
  private determineLogLevel(
    queryType: string,
    options: any,
  ): "debug" | "info" | "warn" | "error" {
    if (options.isMigration) return "info";
    if (options.isBulkOperation) return "info";
    if (
      queryType === "SELECT" &&
      options.expectedRecords &&
      options.expectedRecords > 1000
    )
      return "info";
    return "debug";
  }

  /**
   * Record database operation profile
   */
  private recordOperation(profile: DatabaseOperationProfile): void {
    // Add to history
    this.queryProfiles.push(profile);

    // Limit history size
    if (this.queryProfiles.length > this.maxProfileHistory) {
      this.queryProfiles = this.queryProfiles.slice(-this.maxProfileHistory);
    }

    // Update aggregated stats
    this.updateQueryStats(profile);
  }

  /**
   * Update aggregated query statistics
   */
  private updateQueryStats(profile: DatabaseOperationProfile): void {
    const key = profile.tableName
      ? `${profile.queryType}.${profile.tableName}`
      : profile.queryType;

    const existing = this.queryStats.get(key);

    if (!existing) {
      this.queryStats.set(key, {
        queryType: key,
        avgMemoryUsage: profile.memoryUsage,
        maxMemoryUsage: profile.memoryUsage,
        totalExecutions: 1,
        avgDuration: profile.duration,
        maxDuration: profile.duration,
        failureRate: profile.success ? 0 : 1,
        lastExecuted: profile.timestamp,
      });
    } else {
      const newTotal = existing.totalExecutions + 1;
      const newFailures =
        existing.failureRate * existing.totalExecutions +
        (profile.success ? 0 : 1);

      existing.totalExecutions = newTotal;
      existing.avgMemoryUsage =
        (existing.avgMemoryUsage * (newTotal - 1) + profile.memoryUsage) /
        newTotal;
      existing.maxMemoryUsage = Math.max(
        existing.maxMemoryUsage,
        profile.memoryUsage,
      );
      existing.avgDuration =
        (existing.avgDuration * (newTotal - 1) + profile.duration) / newTotal;
      existing.maxDuration = Math.max(existing.maxDuration, profile.duration);
      existing.failureRate = newFailures / newTotal;
      existing.lastExecuted = profile.timestamp;
    }
  }

  /**
   * Check if memory usage exceeds thresholds
   */
  private checkMemoryThreshold(
    queryType: string,
    memoryUsage: number,
    operationName: string,
    options: any,
  ): void {
    let threshold = this.thresholds.SELECT; // default

    if (options.isMigration) {
      threshold = this.thresholds.MIGRATION;
    } else if (options.isBulkOperation) {
      threshold = this.thresholds.BULK;
    } else {
      threshold =
        this.thresholds[queryType as keyof typeof this.thresholds] ||
        this.thresholds.SELECT;
    }

    if (memoryUsage > threshold) {
      const severity = memoryUsage > threshold * 2 ? "error" : "warn";

      logger[severity](
        `⚠️ Database operation exceeded memory threshold`,
        "DatabaseMemoryMonitor",
        {
          operation: operationName,
          memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          threshold: `${(threshold / 1024 / 1024).toFixed(2)}MB`,
          exceedBy: `${((memoryUsage - threshold) / 1024 / 1024).toFixed(2)}MB`,
          queryType,
          options,
        },
      );
    }
  }

  /**
   * Get top memory consuming queries
   */
  getTopMemoryConsumers(limit: number = 10): QueryMemoryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.maxMemoryUsage - a.maxMemoryUsage)
      .slice(0, limit);
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit: number = 10): QueryMemoryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  /**
   * Get queries with highest failure rate
   */
  getHighestFailureRateQueries(limit: number = 10): QueryMemoryStats[] {
    return Array.from(this.queryStats.values())
      .filter((stat) => stat.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, limit);
  }

  /**
   * Get recent database operations
   */
  getRecentOperations(minutes: number = 30): DatabaseOperationProfile[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.queryProfiles.filter(
      (profile) => profile.timestamp.getTime() > cutoff,
    );
  }

  /**
   * Generate database memory report
   */
  generateDatabaseReport(): any {
    const recent = this.getRecentOperations(60);
    const topMemoryConsumers = this.getTopMemoryConsumers(5);
    const slowestQueries = this.getSlowestQueries(5);
    const failedQueries = this.getHighestFailureRateQueries(5);

    return {
      timestamp: new Date().toISOString(),
      isEnabled: this.isEnabled,

      summary: {
        totalOperationsLastHour: recent.length,
        successfulOperations: recent.filter((op) => op.success).length,
        failedOperations: recent.filter((op) => !op.success).length,
        totalQueriesTracked: this.queryStats.size,
      },

      topMemoryConsumers: topMemoryConsumers.map((stat) => ({
        queryType: stat.queryType,
        maxMemoryUsage: `${(stat.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
        avgMemoryUsage: `${(stat.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
        totalExecutions: stat.totalExecutions,
        lastExecuted: stat.lastExecuted.toISOString(),
      })),

      slowestQueries: slowestQueries.map((stat) => ({
        queryType: stat.queryType,
        avgDuration: `${stat.avgDuration.toFixed(1)}ms`,
        maxDuration: `${stat.maxDuration.toFixed(1)}ms`,
        totalExecutions: stat.totalExecutions,
      })),

      problematicQueries: failedQueries.map((stat) => ({
        queryType: stat.queryType,
        failureRate: `${(stat.failureRate * 100).toFixed(1)}%`,
        totalExecutions: stat.totalExecutions,
        lastExecuted: stat.lastExecuted.toISOString(),
      })),

      thresholds: Object.entries(this.thresholds).reduce(
        (acc, [key, value]) => {
          acc[key] = `${(value / 1024 / 1024).toFixed(0)}MB`;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  }

  /**
   * Clear monitoring data
   */
  clearData(): void {
    this.queryProfiles = [];
    this.queryStats.clear();
    logger.info(
      "🧹 Database memory monitoring data cleared",
      "DatabaseMemoryMonitor",
    );
  }
}

// Export singleton instance
export const dbMemoryMonitor = DatabaseMemoryMonitor.getInstance();

// Decorator for automatic database operation monitoring
export function MonitorDatabaseOperation(
  options: {
    queryType?: string;
    tableName?: string;
    isBulkOperation?: boolean;
    isMigration?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const queryType = options.queryType || propertyKey.toUpperCase();

    descriptor.value = async function (...args: any[]) {
      return dbMemoryMonitor.monitorQuery(
        queryType,
        `${target.constructor.name}.${propertyKey}`,
        options.tableName,
        () => originalMethod.apply(this, args),
        {
          isBulkOperation: options.isBulkOperation,
          isMigration: options.isMigration,
        },
      );
    };

    return descriptor;
  };
}

// Helper functions for common Prisma operations
export const PrismaMemoryHelpers = {
  /**
   * Monitor Prisma findMany with memory tracking
   */
  async findMany<T>(
    model: string,
    executor: () => Promise<T[]>,
    options?: { take?: number; skip?: number },
  ): Promise<T[]> {
    return dbMemoryMonitor.monitorPrismaOperation(
      "findMany",
      model,
      executor,
      options,
    );
  },

  /**
   * Monitor Prisma create with memory tracking
   */
  async create<T>(
    model: string,
    executor: () => Promise<T>,
    data?: any,
  ): Promise<T> {
    return dbMemoryMonitor.monitorPrismaOperation("create", model, executor, {
      data,
    });
  },

  /**
   * Monitor Prisma createMany with memory tracking
   */
  async createMany<T>(
    model: string,
    executor: () => Promise<T>,
    dataCount?: number,
  ): Promise<T> {
    return dbMemoryMonitor.monitorPrismaOperation(
      "createMany",
      model,
      executor,
      { take: dataCount },
    );
  },

  /**
   * Monitor Prisma update with memory tracking
   */
  async update<T>(
    model: string,
    executor: () => Promise<T>,
    options?: { where?: any; data?: any },
  ): Promise<T> {
    return dbMemoryMonitor.monitorPrismaOperation(
      "update",
      model,
      executor,
      options,
    );
  },

  /**
   * Monitor Prisma delete with memory tracking
   */
  async delete<T>(
    model: string,
    executor: () => Promise<T>,
    where?: any,
  ): Promise<T> {
    return dbMemoryMonitor.monitorPrismaOperation("delete", model, executor, {
      where,
    });
  },
};
