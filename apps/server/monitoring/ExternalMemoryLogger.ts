/**
 * 🔍 EXTERNAL MEMORY CONSUMER LOGGER
 *
 * Advanced logger to track and identify external memory consumers
 * Tracks allocations, native modules, and memory-intensive operations
 */

import { logger } from "@shared/utils/logger";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface MemoryConsumer {
  id: string;
  name: string;
  type:
    | "native_module"
    | "buffer_operation"
    | "file_operation"
    | "crypto_operation"
    | "database"
    | "network"
    | "other";
  category: string;

  // Memory metrics
  allocatedMemory: number; // Bytes allocated
  peakMemory: number; // Peak memory usage
  averageMemory: number; // Average memory usage

  // Timing information
  firstSeen: number; // First allocation timestamp
  lastSeen: number; // Last allocation timestamp
  duration: number; // Total duration in ms

  // Call statistics
  totalCalls: number; // Number of allocation calls
  activeAllocations: number; // Currently active allocations

  // Context information
  stackTrace?: string[]; // Stack trace when first seen
  processInfo: {
    pid: number;
    uptime: number;
    nodeVersion: string;
  };

  // Metadata
  metadata: {
    module?: string; // Native module name
    operation?: string; // Operation type
    size?: number; // Allocation size
    purpose?: string; // Purpose description
    [key: string]: any;
  };
}

export interface MemoryOperation {
  id: string;
  timestamp: number;
  consumerId: string;
  operation: "allocate" | "deallocate" | "resize";
  size: number; // Size in bytes
  totalSize: number; // Total size after operation

  // Context
  stackTrace?: string[];
  metadata: {
    caller?: string;
    module?: string;
    purpose?: string;
    [key: string]: any;
  };
}

export interface MemoryConsumerConfig {
  // Tracking settings
  tracking: {
    enabled: boolean;
    maxConsumers: number; // Max consumers to track
    maxOperations: number; // Max operations to keep
    stackTraceDepth: number; // Stack trace depth
  };

  // Thresholds
  thresholds: {
    minAllocationSize: number; // Minimum size to track (bytes)
    suspiciousSize: number; // Size considered suspicious (bytes)
    maxConsumerSize: number; // Max size per consumer (bytes)
  };

  // Storage
  storage: {
    persistToDisk: boolean;
    dataDirectory: string;
    rotateFiles: boolean;
    maxFileSize: number; // Max log file size (bytes)
  };

  // Native module tracking
  nativeModules: {
    trackBcrypt: boolean;
    trackPrisma: boolean;
    trackSqlite: boolean;
    trackSocketIO: boolean;
    trackCrypto: boolean;
    trackBuffers: boolean;
  };
}

// ============================================================================
// EXTERNAL MEMORY CONSUMER LOGGER
// ============================================================================

export class ExternalMemoryLogger {
  private static instance: ExternalMemoryLogger;
  private config: MemoryConsumerConfig;
  private consumers = new Map<string, MemoryConsumer>();
  private operations: MemoryOperation[] = [];
  private isTracking = false;

  // Original functions for monkey patching
  private originalFunctions = new Map<string, Function>();

  // Cleanup interval
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<MemoryConsumerConfig> = {}) {
    this.config = {
      tracking: {
        enabled: true,
        maxConsumers: 1000,
        maxOperations: 5000,
        stackTraceDepth: 10,
      },

      thresholds: {
        minAllocationSize: 1024, // 1KB minimum
        suspiciousSize: 10 * 1024 * 1024, // 10MB suspicious
        maxConsumerSize: 100 * 1024 * 1024, // 100MB max per consumer
      },

      storage: {
        persistToDisk: true,
        dataDirectory: path.join(
          process.cwd(),
          "monitoring-data",
          "memory-consumers",
        ),
        rotateFiles: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB max file size
      },

      nativeModules: {
        trackBcrypt: true,
        trackPrisma: true,
        trackSqlite: true,
        trackSocketIO: true,
        trackCrypto: true,
        trackBuffers: true,
      },

      ...config,
    };

    this.ensureStorageDirectory();
    this.setupCleanupSchedule();
  }

  static getInstance(
    config?: Partial<MemoryConsumerConfig>,
  ): ExternalMemoryLogger {
    if (!ExternalMemoryLogger.instance) {
      ExternalMemoryLogger.instance = new ExternalMemoryLogger(config);
    }
    return ExternalMemoryLogger.instance;
  }

  // ============================================================================
  // TRACKING CONTROL
  // ============================================================================

  /**
   * Start memory consumer tracking
   */
  startTracking(): void {
    if (this.isTracking) {
      logger.warn(
        "Memory consumer tracking already active",
        "ExternalMemoryLogger",
      );
      return;
    }

    this.isTracking = true;
    this.setupMonkeyPatches();

    logger.info(
      "🔍 External memory consumer tracking started",
      "ExternalMemoryLogger",
      {
        maxConsumers: this.config.tracking.maxConsumers,
        minAllocationSize: this.config.thresholds.minAllocationSize,
        nativeModules: this.config.nativeModules,
      },
    );
  }

  /**
   * Stop memory consumer tracking
   */
  stopTracking(): void {
    if (!this.isTracking) return;

    this.isTracking = false;
    this.restoreOriginalFunctions();

    // Save final state
    if (this.config.storage.persistToDisk) {
      this.saveConsumersToDisk();
    }

    logger.info(
      "🔍 External memory consumer tracking stopped",
      "ExternalMemoryLogger",
    );
  }

  // ============================================================================
  // MONKEY PATCHING FOR NATIVE MODULES
  // ============================================================================

  /**
   * Setup monkey patches for native modules
   */
  private setupMonkeyPatches(): void {
    if (this.config.nativeModules.trackBuffers) {
      this.patchBufferOperations();
    }

    if (this.config.nativeModules.trackCrypto) {
      this.patchCryptoOperations();
    }

    if (this.config.nativeModules.trackBcrypt) {
      this.patchBcryptOperations();
    }

    if (this.config.nativeModules.trackPrisma) {
      this.patchPrismaOperations();
    }

    if (this.config.nativeModules.trackSqlite) {
      this.patchSqliteOperations();
    }

    if (this.config.nativeModules.trackSocketIO) {
      this.patchSocketIOOperations();
    }
  }

  /**
   * Patch Buffer operations
   */
  private patchBufferOperations(): void {
    try {
      const originalAlloc = Buffer.alloc;
      const originalFrom = Buffer.from;
      const originalConcat = Buffer.concat;

      this.originalFunctions.set("Buffer.alloc", originalAlloc);
      this.originalFunctions.set("Buffer.from", originalFrom);
      this.originalFunctions.set("Buffer.concat", originalConcat);

      Buffer.alloc = (
        size: number,
        fill?: any,
        encoding?: BufferEncoding,
      ): Buffer => {
        const result = originalAlloc.call(Buffer, size, fill, encoding);
        this.trackAllocation("buffer_alloc", size, {
          operation: "Buffer.alloc",
          size,
          fill: typeof fill,
          encoding,
        });
        return result;
      };

      Buffer.from = (
        array: any,
        byteOffset?: number,
        length?: number,
      ): Buffer => {
        const result = originalFrom.call(Buffer, array, byteOffset, length);
        this.trackAllocation("buffer_from", result.length, {
          operation: "Buffer.from",
          size: result.length,
          sourceType: typeof array,
        });
        return result;
      };

      Buffer.concat = (
        list: readonly Uint8Array[],
        totalLength?: number,
      ): Buffer => {
        const result = originalConcat.call(Buffer, list, totalLength);
        this.trackAllocation("buffer_concat", result.length, {
          operation: "Buffer.concat",
          chunks: list.length,
          totalSize: result.length,
        });
        return result;
      };

      logger.debug(
        "Buffer operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      logger.error(
        "Failed to patch Buffer operations",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Patch crypto operations
   */
  private patchCryptoOperations(): void {
    try {
      const crypto = require("crypto");
      const originalRandomBytes = crypto.randomBytes;
      const originalCreateHash = crypto.createHash;
      const originalCreateCipher = crypto.createCipher;

      this.originalFunctions.set("crypto.randomBytes", originalRandomBytes);
      this.originalFunctions.set("crypto.createHash", originalCreateHash);
      this.originalFunctions.set("crypto.createCipher", originalCreateCipher);

      crypto.randomBytes = (size: number, callback?: Function): Buffer => {
        this.trackAllocation("crypto_random", size, {
          operation: "crypto.randomBytes",
          size,
          isAsync: !!callback,
        });
        return originalRandomBytes.call(crypto, size, callback);
      };

      crypto.createHash = (algorithm: string, options?: any): any => {
        const result = originalCreateHash.call(crypto, algorithm, options);
        this.trackAllocation("crypto_hash", 512, {
          // Estimated size
          operation: "crypto.createHash",
          algorithm,
          estimatedSize: 512,
        });
        return result;
      };

      crypto.createCipher = (
        algorithm: string,
        password: any,
        options?: any,
      ): any => {
        const result = originalCreateCipher.call(
          crypto,
          algorithm,
          password,
          options,
        );
        this.trackAllocation("crypto_cipher", 1024, {
          // Estimated size
          operation: "crypto.createCipher",
          algorithm,
          estimatedSize: 1024,
        });
        return result;
      };

      logger.debug(
        "Crypto operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      logger.error(
        "Failed to patch crypto operations",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Patch bcrypt operations
   */
  private patchBcryptOperations(): void {
    try {
      const bcrypt = require("bcrypt");

      if (bcrypt.hash) {
        const originalHash = bcrypt.hash;
        this.originalFunctions.set("bcrypt.hash", originalHash);

        bcrypt.hash = async (data: any, saltOrRounds: any): Promise<string> => {
          this.trackAllocation("bcrypt_hash", 512, {
            operation: "bcrypt.hash",
            estimatedSize: 512,
            saltRounds:
              typeof saltOrRounds === "number" ? saltOrRounds : "salt",
          });
          return originalHash.call(bcrypt, data, saltOrRounds);
        };
      }

      logger.debug(
        "Bcrypt operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      // Bcrypt might not be available
      logger.debug("Bcrypt not available for patching", "ExternalMemoryLogger");
    }
  }

  /**
   * Patch Prisma operations
   */
  private patchPrismaOperations(): void {
    try {
      // This is more complex as Prisma uses internal native bindings
      // We'll track when PrismaClient is instantiated
      const originalPrismaClient = global.PrismaClient;

      if (originalPrismaClient) {
        this.originalFunctions.set("PrismaClient", originalPrismaClient);

        global.PrismaClient = class extends originalPrismaClient {
          constructor(...args: any[]) {
            super(...args);
            ExternalMemoryLogger.getInstance().trackAllocation(
              "prisma_client",
              5 * 1024 * 1024,
              {
                operation: "PrismaClient.constructor",
                estimatedSize: 5 * 1024 * 1024, // 5MB estimated
                args: args.length,
              },
            );
          }
        };
      }

      logger.debug(
        "Prisma operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      logger.debug("Prisma not available for patching", "ExternalMemoryLogger");
    }
  }

  /**
   * Patch SQLite operations
   */
  private patchSqliteOperations(): void {
    try {
      const Database = require("better-sqlite3");
      const originalConstructor = Database;

      this.originalFunctions.set("better-sqlite3", originalConstructor);

      const wrappedConstructor = function (...args: any[]) {
        ExternalMemoryLogger.getInstance().trackAllocation(
          "sqlite_connection",
          2 * 1024 * 1024,
          {
            operation: "SQLite.constructor",
            estimatedSize: 2 * 1024 * 1024, // 2MB estimated
            database: args[0],
          },
        );
        return new originalConstructor(...args);
      };

      // Copy static properties
      Object.setPrototypeOf(wrappedConstructor, originalConstructor);
      Object.assign(wrappedConstructor, originalConstructor);

      require.cache[require.resolve("better-sqlite3")].exports =
        wrappedConstructor;

      logger.debug(
        "SQLite operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      logger.debug("SQLite not available for patching", "ExternalMemoryLogger");
    }
  }

  /**
   * Patch Socket.IO operations
   */
  private patchSocketIOOperations(): void {
    try {
      const socketio = require("socket.io");

      if (socketio.Server) {
        const originalServer = socketio.Server;
        this.originalFunctions.set("socketio.Server", originalServer);

        socketio.Server = class extends originalServer {
          constructor(...args: any[]) {
            super(...args);
            ExternalMemoryLogger.getInstance().trackAllocation(
              "socketio_server",
              3 * 1024 * 1024,
              {
                operation: "SocketIO.Server.constructor",
                estimatedSize: 3 * 1024 * 1024, // 3MB estimated
              },
            );
          }
        };
      }

      logger.debug(
        "Socket.IO operations patched for tracking",
        "ExternalMemoryLogger",
      );
    } catch (error) {
      logger.debug(
        "Socket.IO not available for patching",
        "ExternalMemoryLogger",
      );
    }
  }

  // ============================================================================
  // MEMORY TRACKING
  // ============================================================================

  /**
   * Track memory allocation
   */
  private trackAllocation(
    consumerId: string,
    size: number,
    metadata: any = {},
  ): void {
    if (!this.isTracking || size < this.config.thresholds.minAllocationSize) {
      return;
    }

    try {
      const now = Date.now();
      const stackTrace = this.captureStackTrace();

      // Get or create consumer
      let consumer = this.consumers.get(consumerId);
      if (!consumer) {
        consumer = this.createConsumer(consumerId, metadata, stackTrace);
        this.consumers.set(consumerId, consumer);
      }

      // Update consumer metrics
      consumer.allocatedMemory += size;
      consumer.peakMemory = Math.max(
        consumer.peakMemory,
        consumer.allocatedMemory,
      );
      consumer.lastSeen = now;
      consumer.duration = now - consumer.firstSeen;
      consumer.totalCalls++;
      consumer.activeAllocations++;

      // Calculate average
      consumer.averageMemory = consumer.allocatedMemory / consumer.totalCalls;

      // Create operation record
      const operation: MemoryOperation = {
        id: `op_${now}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: now,
        consumerId,
        operation: "allocate",
        size,
        totalSize: consumer.allocatedMemory,
        stackTrace,
        metadata,
      };

      this.operations.push(operation);

      // Trim operations if needed
      if (this.operations.length > this.config.tracking.maxOperations) {
        this.operations = this.operations.slice(
          -this.config.tracking.maxOperations,
        );
      }

      // Check for suspicious allocations
      if (size > this.config.thresholds.suspiciousSize) {
        logger.warn(
          "🚨 Suspicious memory allocation detected",
          "ExternalMemoryLogger",
          {
            consumerId,
            size: `${(size / 1024 / 1024).toFixed(1)}MB`,
            totalAllocated: `${(consumer.allocatedMemory / 1024 / 1024).toFixed(1)}MB`,
            operation: metadata.operation,
            stackTrace: stackTrace.slice(0, 3),
          },
        );
      }

      // Check consumer size limit
      if (consumer.allocatedMemory > this.config.thresholds.maxConsumerSize) {
        logger.error(
          "🚨 Consumer exceeded size limit",
          "ExternalMemoryLogger",
          {
            consumerId,
            allocatedMemory: `${(consumer.allocatedMemory / 1024 / 1024).toFixed(1)}MB`,
            maxSize: `${(this.config.thresholds.maxConsumerSize / 1024 / 1024).toFixed(1)}MB`,
            totalCalls: consumer.totalCalls,
          },
        );
      }

      // Persist to disk if configured
      if (
        this.config.storage.persistToDisk &&
        this.operations.length % 100 === 0
      ) {
        this.saveOperationsToDisk();
      }
    } catch (error) {
      logger.error(
        "Failed to track memory allocation",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Track memory deallocation
   */
  trackDeallocation(
    consumerId: string,
    size: number,
    metadata: any = {},
  ): void {
    if (!this.isTracking) return;

    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      consumer.allocatedMemory = Math.max(0, consumer.allocatedMemory - size);
      consumer.activeAllocations = Math.max(0, consumer.activeAllocations - 1);
      consumer.lastSeen = Date.now();

      const operation: MemoryOperation = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        consumerId,
        operation: "deallocate",
        size,
        totalSize: consumer.allocatedMemory,
        metadata,
      };

      this.operations.push(operation);
    }
  }

  /**
   * Create new memory consumer
   */
  private createConsumer(
    id: string,
    metadata: any,
    stackTrace: string[],
  ): MemoryConsumer {
    const now = Date.now();

    return {
      id,
      name: this.generateConsumerName(id, metadata),
      type: this.determineConsumerType(id, metadata),
      category: this.determineConsumerCategory(id, metadata),

      allocatedMemory: 0,
      peakMemory: 0,
      averageMemory: 0,

      firstSeen: now,
      lastSeen: now,
      duration: 0,

      totalCalls: 0,
      activeAllocations: 0,

      stackTrace,
      processInfo: {
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
      },

      metadata,
    };
  }

  /**
   * Generate consumer name
   */
  private generateConsumerName(id: string, metadata: any): string {
    if (metadata.operation) {
      return metadata.operation;
    }

    const typeMap: Record<string, string> = {
      buffer_alloc: "Buffer.alloc",
      buffer_from: "Buffer.from",
      buffer_concat: "Buffer.concat",
      crypto_random: "Crypto Random",
      crypto_hash: "Crypto Hash",
      crypto_cipher: "Crypto Cipher",
      bcrypt_hash: "Bcrypt Hash",
      prisma_client: "Prisma Client",
      sqlite_connection: "SQLite Connection",
      socketio_server: "Socket.IO Server",
    };

    return typeMap[id] || id;
  }

  /**
   * Determine consumer type
   */
  private determineConsumerType(
    id: string,
    metadata: any,
  ): MemoryConsumer["type"] {
    if (id.startsWith("buffer_")) return "buffer_operation";
    if (id.startsWith("crypto_")) return "crypto_operation";
    if (id.includes("bcrypt")) return "crypto_operation";
    if (id.includes("prisma") || id.includes("sqlite")) return "database";
    if (id.includes("socket")) return "network";
    return "other";
  }

  /**
   * Determine consumer category
   */
  private determineConsumerCategory(id: string, metadata: any): string {
    const categoryMap: Record<string, string> = {
      buffer_: "Buffer Operations",
      crypto_: "Cryptographic Operations",
      bcrypt_: "Password Hashing",
      prisma_: "Database ORM",
      sqlite_: "Database Storage",
      socketio_: "WebSocket Communication",
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (id.startsWith(prefix)) return category;
    }

    return "Other Operations";
  }

  /**
   * Capture stack trace
   */
  private captureStackTrace(): string[] {
    const stackTrace: string[] = [];

    try {
      const err = new Error();
      const stack = err.stack?.split("\n") || [];

      for (
        let i = 3;
        i < Math.min(stack.length, this.config.tracking.stackTraceDepth + 3);
        i++
      ) {
        const line = stack[i]?.trim();
        if (line && !line.includes("ExternalMemoryLogger")) {
          stackTrace.push(line);
        }
      }
    } catch (error) {
      // Ignore stack trace errors
    }

    return stackTrace;
  }

  // ============================================================================
  // FUNCTION RESTORATION
  // ============================================================================

  /**
   * Restore original functions
   */
  private restoreOriginalFunctions(): void {
    try {
      for (const [name, originalFunction] of this.originalFunctions) {
        if (name.startsWith("Buffer.")) {
          const method = name.split(".")[1];
          (Buffer as any)[method] = originalFunction;
        } else if (name.startsWith("crypto.")) {
          const crypto = require("crypto");
          const method = name.split(".")[1];
          crypto[method] = originalFunction;
        }
        // Add other restorations as needed
      }

      this.originalFunctions.clear();
      logger.debug("Original functions restored", "ExternalMemoryLogger");
    } catch (error) {
      logger.error(
        "Failed to restore original functions",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  // ============================================================================
  // DATA PERSISTENCE
  // ============================================================================

  /**
   * Save consumers to disk
   */
  private saveConsumersToDisk(): void {
    if (!this.config.storage.persistToDisk) return;

    try {
      const consumersFile = path.join(
        this.config.storage.dataDirectory,
        `consumers_${new Date().toISOString().split("T")[0]}.json`,
      );

      const consumersArray = Array.from(this.consumers.values());
      fs.writeFileSync(
        consumersFile,
        JSON.stringify(consumersArray, null, 2),
        "utf8",
      );

      logger.debug("Memory consumers saved to disk", "ExternalMemoryLogger", {
        file: consumersFile,
        count: consumersArray.length,
      });
    } catch (error) {
      logger.error(
        "Failed to save consumers to disk",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Save operations to disk
   */
  private saveOperationsToDisk(): void {
    if (!this.config.storage.persistToDisk) return;

    try {
      const operationsFile = path.join(
        this.config.storage.dataDirectory,
        `operations_${new Date().toISOString().split("T")[0]}.jsonl`,
      );

      // Append new operations to file
      const newOperations = this.operations.slice(-100); // Last 100 operations
      const operationsLines =
        newOperations.map((op) => JSON.stringify(op)).join("\n") + "\n";

      fs.appendFileSync(operationsFile, operationsLines, "utf8");
    } catch (error) {
      logger.error(
        "Failed to save operations to disk",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    try {
      if (!fs.existsSync(this.config.storage.dataDirectory)) {
        fs.mkdirSync(this.config.storage.dataDirectory, { recursive: true });
      }
    } catch (error) {
      logger.error(
        "Failed to create storage directory",
        "ExternalMemoryLogger",
        error,
      );
    }
  }

  /**
   * Setup cleanup schedule
   */
  private setupCleanupSchedule(): void {
    // Clean up old consumers and operations every hour
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldData();
      },
      60 * 60 * 1000,
    );
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Clean up old consumers with no recent activity
      for (const [id, consumer] of this.consumers) {
        if (
          now - consumer.lastSeen > maxAge &&
          consumer.activeAllocations === 0
        ) {
          this.consumers.delete(id);
        }
      }

      // Clean up old operations
      this.operations = this.operations.filter(
        (op) => now - op.timestamp < maxAge,
      );

      logger.debug(
        "Cleaned up old memory tracking data",
        "ExternalMemoryLogger",
        {
          remainingConsumers: this.consumers.size,
          remainingOperations: this.operations.length,
        },
      );
    } catch (error) {
      logger.error("Failed to cleanup old data", "ExternalMemoryLogger", error);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get all tracked consumers
   */
  getConsumers(): MemoryConsumer[] {
    return Array.from(this.consumers.values());
  }

  /**
   * Get consumers by type
   */
  getConsumersByType(type: MemoryConsumer["type"]): MemoryConsumer[] {
    return this.getConsumers().filter((c) => c.type === type);
  }

  /**
   * Get top memory consumers
   */
  getTopConsumers(limit: number = 10): MemoryConsumer[] {
    return this.getConsumers()
      .sort((a, b) => b.allocatedMemory - a.allocatedMemory)
      .slice(0, limit);
  }

  /**
   * Get consumer summary
   */
  getConsumerSummary(): {
    totalConsumers: number;
    totalAllocatedMemory: number;
    totalOperations: number;
    byType: Record<string, { count: number; memory: number }>;
    byCategory: Record<string, { count: number; memory: number }>;
  } {
    const consumers = this.getConsumers();

    const summary = {
      totalConsumers: consumers.length,
      totalAllocatedMemory: consumers.reduce(
        (sum, c) => sum + c.allocatedMemory,
        0,
      ),
      totalOperations: this.operations.length,
      byType: {} as Record<string, { count: number; memory: number }>,
      byCategory: {} as Record<string, { count: number; memory: number }>,
    };

    // Group by type
    consumers.forEach((consumer) => {
      if (!summary.byType[consumer.type]) {
        summary.byType[consumer.type] = { count: 0, memory: 0 };
      }
      summary.byType[consumer.type].count++;
      summary.byType[consumer.type].memory += consumer.allocatedMemory;

      if (!summary.byCategory[consumer.category]) {
        summary.byCategory[consumer.category] = { count: 0, memory: 0 };
      }
      summary.byCategory[consumer.category].count++;
      summary.byCategory[consumer.category].memory += consumer.allocatedMemory;
    });

    return summary;
  }

  /**
   * Generate consumer report
   */
  generateConsumerReport(): string {
    const summary = this.getConsumerSummary();
    const topConsumers = this.getTopConsumers(10);

    let report = `
# External Memory Consumer Report
Generated: ${new Date().toISOString()}

## Summary
- Total Consumers: ${summary.totalConsumers}
- Total Allocated Memory: ${(summary.totalAllocatedMemory / 1024 / 1024).toFixed(1)}MB
- Total Operations: ${summary.totalOperations}

## By Type
`;

    Object.entries(summary.byType).forEach(([type, data]) => {
      report += `- ${type}: ${data.count} consumers, ${(data.memory / 1024 / 1024).toFixed(1)}MB\n`;
    });

    report += `
## By Category
`;

    Object.entries(summary.byCategory).forEach(([category, data]) => {
      report += `- ${category}: ${data.count} consumers, ${(data.memory / 1024 / 1024).toFixed(1)}MB\n`;
    });

    report += `
## Top 10 Memory Consumers
`;

    topConsumers.forEach((consumer, i) => {
      report += `
${i + 1}. ${consumer.name}
   - Type: ${consumer.type}
   - Allocated: ${(consumer.allocatedMemory / 1024 / 1024).toFixed(1)}MB
   - Peak: ${(consumer.peakMemory / 1024 / 1024).toFixed(1)}MB
   - Calls: ${consumer.totalCalls}
   - Active: ${consumer.activeAllocations}
`;
    });

    return report;
  }

  /**
   * Export all tracking data
   */
  exportTrackingData(): {
    consumers: MemoryConsumer[];
    operations: MemoryOperation[];
    summary: any;
    config: MemoryConsumerConfig;
    exportTime: number;
  } {
    return {
      consumers: this.getConsumers(),
      operations: this.operations,
      summary: this.getConsumerSummary(),
      config: this.config,
      exportTime: Date.now(),
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const externalMemoryLogger = ExternalMemoryLogger.getInstance();

// Auto-start tracking if configured
if (
  process.env.NODE_ENV === "development" ||
  process.env.ENABLE_MEMORY_TRACKING === "true"
) {
  externalMemoryLogger.startTracking();
}
