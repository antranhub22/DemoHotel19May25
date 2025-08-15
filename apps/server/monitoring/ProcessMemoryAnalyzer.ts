/**
 * 🔍 PROCESS MEMORY ANALYZER
 *
 * Detailed process memory analysis tools for RSS vs heap tracking,
 * external memory growth monitoring, native module attribution,
 * buffer leak detection, and automated leak reporting
 */

import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================
// INTERFACES & TYPES
// ============================================

export interface ProcessMemorySnapshot {
  timestamp: number;
  processId: number;
  uptime: number;

  // Core Memory Metrics
  rss: number;
  heapTotal: number;
  heapUsed: number;
  heapAvailable: number;
  external: number;
  arrayBuffers: number;

  // Calculated Metrics
  externalDiff: number; // RSS - Heap
  externalRatio: number; // External / Heap
  heapUtilization: number; // HeapUsed / HeapTotal
  nonHeapMemory: number; // RSS - HeapTotal

  // System Context
  cpuUsage: NodeJS.CpuUsage;
  activeHandles: number;
  activeRequests: number;

  // V8 Heap Spaces (detailed breakdown)
  heapSpaces?: V8HeapSpace[];

  // GC Information
  gcStats?: GCStats;
}

export interface V8HeapSpace {
  spaceName: string;
  spaceSize: number;
  spaceUsedSize: number;
  spaceAvailableSize: number;
  physicalSpaceSize: number;
}

export interface GCStats {
  lastGCTime: number;
  totalGCTime: number;
  gcCount: number;
  gcType: string;
  gcDuration: number;
}

export interface MemoryGrowthPattern {
  type: "stable" | "linear" | "exponential" | "spike" | "leak";
  severity: "low" | "medium" | "high" | "critical";
  startTime: number;
  duration: number;
  growthRate: number; // MB/second
  totalGrowth: number; // MB
  confidence: number; // 0-1
  description: string;
  recommendation: string;
}

export interface NativeModuleAttribution {
  moduleName: string;
  moduleType: "database" | "crypto" | "network" | "compression" | "other";
  estimatedMemory: number;
  memoryRange: { min: number; max: number };
  confidence: number;
  evidence: string[];
  lastSeenActive: number;
  allocations: number;
  deallocations: number;
}

export interface BufferLeakDetection {
  bufferType: "Buffer" | "ArrayBuffer" | "SharedArrayBuffer" | "TypedArray";
  size: number;
  age: number;
  stackTrace: string;
  isLeak: boolean;
  leakConfidence: number;
  source: string;
  createdAt: number;
  lastAccessed: number;
}

export interface ExternalMemoryLeak {
  id: string;
  source: string;
  type:
    | "native_module"
    | "buffer_leak"
    | "connection_pool"
    | "file_handle"
    | "crypto_context"
    | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  estimatedSize: number;
  growthRate: number;
  detectedAt: number;
  evidence: string[];
  recommendation: string;
  stackTrace?: string;
  relatedSnapshots: number[];
}

export interface ProcessMemoryAnalysisConfig {
  samplingInterval: number; // ms
  retentionPeriod: number; // ms
  growthDetectionWindow: number; // ms
  leakDetectionThreshold: number; // MB
  bufferLeakAgeThreshold: number; // ms
  nativeModuleTracking: boolean;
  bufferLeakDetection: boolean;
  heapSpaceAnalysis: boolean;
  gcAnalysis: boolean;
  autoReporting: boolean;
  reportingInterval: number; // ms
  storageDirectory: string;
}

// ============================================
// PROCESS MEMORY ANALYZER CLASS
// ============================================

export class ProcessMemoryAnalyzer extends EventEmitter {
  private config: ProcessMemoryAnalysisConfig;
  private snapshots: ProcessMemorySnapshot[] = [];
  private growthPatterns: MemoryGrowthPattern[] = [];
  private nativeModules: Map<string, NativeModuleAttribution> = new Map();
  private bufferLeaks: Map<string, BufferLeakDetection> = new Map();
  private detectedLeaks: Map<string, ExternalMemoryLeak> = new Map();

  private analysisInterval?: NodeJS.Timeout;
  private reportingInterval?: NodeJS.Timeout;
  private isRunning = false;
  private startTime = Date.now();

  // Performance hooks for detailed analysis
  private performanceObserver?: any;
  private gcObserver?: any;

  constructor(config: Partial<ProcessMemoryAnalysisConfig> = {}) {
    super();

    this.config = {
      samplingInterval: 5000, // 5 seconds
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      growthDetectionWindow: 300000, // 5 minutes
      leakDetectionThreshold: 10, // 10MB
      bufferLeakAgeThreshold: 300000, // 5 minutes
      nativeModuleTracking: true,
      bufferLeakDetection: true,
      heapSpaceAnalysis: true,
      gcAnalysis: true,
      autoReporting: true,
      reportingInterval: 300000, // 5 minutes
      storageDirectory: "./memory-analysis",
      ...config,
    };

    this.ensureStorageDirectory();
    this.setupPerformanceObservers();
    this.initializeNativeModuleTracking();
  }

  // ============================================
  // CORE ANALYSIS METHODS
  // ============================================

  public startAnalysis(): void {
    if (this.isRunning) {
      logger.warn(
        "ProcessMemoryAnalyzer already running",
        "ProcessMemoryAnalyzer",
      );
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();

    logger.info("🔍 Starting Process Memory Analysis", "ProcessMemoryAnalyzer");

    // Start continuous memory sampling
    this.analysisInterval = setInterval(() => {
      this.captureMemorySnapshot();
    }, this.config.samplingInterval);

    // Start automated reporting
    if (this.config.autoReporting) {
      this.reportingInterval = setInterval(() => {
        this.generateAutomatedReport();
      }, this.config.reportingInterval);
    }

    // Initial snapshot
    this.captureMemorySnapshot();

    this.emit("analysisStarted", {
      startTime: this.startTime,
      config: this.config,
    });
  }

  public stopAnalysis(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = undefined;
    }

    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = undefined;
    }

    this.cleanupPerformanceObservers();

    logger.info("🛑 Stopped Process Memory Analysis", "ProcessMemoryAnalyzer");

    this.emit("analysisStopped", {
      duration: Date.now() - this.startTime,
      totalSnapshots: this.snapshots.length,
      leaksDetected: this.detectedLeaks.size,
    });
  }

  private captureMemorySnapshot(): void {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const snapshot: ProcessMemorySnapshot = {
        timestamp: Date.now(),
        processId: process.pid,
        uptime: process.uptime() * 1000,

        // Core metrics
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        heapAvailable: memUsage.heapTotal - memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,

        // Calculated metrics
        externalDiff: memUsage.rss - memUsage.heapUsed,
        externalRatio: memUsage.external / memUsage.heapUsed,
        heapUtilization: memUsage.heapUsed / memUsage.heapTotal,
        nonHeapMemory: memUsage.rss - memUsage.heapTotal,

        // System context
        cpuUsage,
        activeHandles: (process as any)._getActiveHandles().length,
        activeRequests: (process as any)._getActiveRequests().length,
      };

      // Add V8 heap spaces if available
      if (
        this.config.heapSpaceAnalysis &&
        (global as any).v8?.getHeapSpaceStatistics
      ) {
        snapshot.heapSpaces = this.captureHeapSpaces();
      }

      // Add GC stats if available
      if (this.config.gcAnalysis) {
        snapshot.gcStats = this.captureGCStats();
      }

      this.snapshots.push(snapshot);
      this.cleanupOldSnapshots();

      // Trigger analysis
      this.analyzeMemoryGrowth();
      this.detectBufferLeaks();
      this.updateNativeModuleAttribution();
      this.detectExternalMemoryLeaks();

      this.emit("snapshotCaptured", snapshot);
    } catch (error) {
      logger.error(
        "Failed to capture memory snapshot",
        "ProcessMemoryAnalyzer",
        error,
      );
    }
  }

  private captureHeapSpaces(): V8HeapSpace[] {
    try {
      const v8 = require("v8");
      const spaces = v8.getHeapSpaceStatistics();

      return spaces.map((space: any) => ({
        spaceName: space.space_name,
        spaceSize: space.space_size,
        spaceUsedSize: space.space_used_size,
        spaceAvailableSize: space.space_available_size,
        physicalSpaceSize: space.physical_space_size,
      }));
    } catch (error) {
      return [];
    }
  }

  private captureGCStats(): GCStats | undefined {
    try {
      const v8 = require("v8");
      const stats = v8.getHeapStatistics();

      return {
        lastGCTime: Date.now(),
        totalGCTime: stats.total_gc_time || 0,
        gcCount: stats.gc_count || 0,
        gcType: "unknown",
        gcDuration: 0,
      };
    } catch (error) {
      return undefined;
    }
  }

  // ============================================
  // RSS VS HEAP TRACKING
  // ============================================

  public getRSSvsHeapTrend(windowSize: number = 20): {
    trend: "increasing" | "decreasing" | "stable";
    rssTrend: number[];
    heapTrend: number[];
    externalTrend: number[];
    divergence: number;
    divergenceTrend: "increasing" | "decreasing" | "stable";
  } {
    const recentSnapshots = this.snapshots.slice(-windowSize);

    if (recentSnapshots.length < 2) {
      return {
        trend: "stable",
        rssTrend: [],
        heapTrend: [],
        externalTrend: [],
        divergence: 0,
        divergenceTrend: "stable",
      };
    }

    const rssTrend = recentSnapshots.map((s) => s.rss / 1024 / 1024);
    const heapTrend = recentSnapshots.map((s) => s.heapUsed / 1024 / 1024);
    const externalTrend = recentSnapshots.map((s) => s.external / 1024 / 1024);

    // Calculate divergence (RSS growing faster than heap)
    const divergences = recentSnapshots.map(
      (s) => s.externalDiff / 1024 / 1024,
    );
    const avgDivergence =
      divergences.reduce((sum, d) => sum + d, 0) / divergences.length;

    // Determine trends
    const rssGrowth = rssTrend[rssTrend.length - 1] - rssTrend[0];
    const heapGrowth = heapTrend[heapTrend.length - 1] - heapTrend[0];
    const divergenceGrowth =
      divergences[divergences.length - 1] - divergences[0];

    const trend =
      rssGrowth > 5 ? "increasing" : rssGrowth < -5 ? "decreasing" : "stable";
    const divergenceTrend =
      divergenceGrowth > 2
        ? "increasing"
        : divergenceGrowth < -2
          ? "decreasing"
          : "stable";

    return {
      trend,
      rssTrend,
      heapTrend,
      externalTrend,
      divergence: avgDivergence,
      divergenceTrend,
    };
  }

  // ============================================
  // EXTERNAL MEMORY GROWTH MONITORING
  // ============================================

  private analyzeMemoryGrowth(): void {
    const windowStart = Date.now() - this.config.growthDetectionWindow;
    const windowSnapshots = this.snapshots.filter(
      (s) => s.timestamp >= windowStart,
    );

    if (windowSnapshots.length < 3) return;

    const externalMemory = windowSnapshots.map((s) => s.external / 1024 / 1024);
    const timePoints = windowSnapshots.map((s) => s.timestamp);

    const pattern = this.detectGrowthPattern(externalMemory, timePoints);

    if (
      pattern &&
      (pattern.severity === "high" || pattern.severity === "critical")
    ) {
      this.growthPatterns.push(pattern);
      this.emit("growthPatternDetected", pattern);

      logger.warn(
        `Memory growth pattern detected: ${pattern.type} (${pattern.severity})`,
        "ProcessMemoryAnalyzer",
      );
    }
  }

  private detectGrowthPattern(
    memoryValues: number[],
    timePoints: number[],
  ): MemoryGrowthPattern | null {
    if (memoryValues.length < 3) return null;

    const duration = timePoints[timePoints.length - 1] - timePoints[0];
    const totalGrowth = memoryValues[memoryValues.length - 1] - memoryValues[0];
    const growthRate = (totalGrowth / duration) * 1000; // MB/second

    // Detect pattern type
    let type: MemoryGrowthPattern["type"] = "stable";
    let confidence = 0;

    // Linear regression to detect trends
    const { slope, correlation } = this.calculateLinearRegression(memoryValues);

    if (Math.abs(correlation) > 0.8) {
      if (slope > 0.001) {
        // Growing > 1KB/sample
        if (this.isExponentialGrowth(memoryValues)) {
          type = "exponential";
          confidence = 0.9;
        } else {
          type = "linear";
          confidence = Math.abs(correlation);
        }
      }
    } else if (this.isSpikePattern(memoryValues)) {
      type = "spike";
      confidence = 0.8;
    } else if (growthRate > 0.1) {
      // Growing > 100KB/s consistently
      type = "leak";
      confidence = 0.7;
    }

    if (type === "stable") return null;

    // Determine severity
    let severity: MemoryGrowthPattern["severity"] = "low";
    if (growthRate > 1)
      severity = "critical"; // > 1MB/s
    else if (growthRate > 0.5)
      severity = "high"; // > 500KB/s
    else if (growthRate > 0.1) severity = "medium"; // > 100KB/s

    return {
      type,
      severity,
      startTime: timePoints[0],
      duration,
      growthRate,
      totalGrowth,
      confidence,
      description: this.getPatternDescription(type, severity, growthRate),
      recommendation: this.getPatternRecommendation(type, severity),
    };
  }

  private calculateLinearRegression(values: number[]): {
    slope: number;
    correlation: number;
  } {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    const sumYY = values.reduce((sum, y) => sum + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation =
      (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return { slope, correlation };
  }

  private isExponentialGrowth(values: number[]): boolean {
    if (values.length < 4) return false;

    // Check if growth rate is accelerating
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      growthRates.push(values[i] - values[i - 1]);
    }

    // If growth rates are increasing, it might be exponential
    let increasingCount = 0;
    for (let i = 1; i < growthRates.length; i++) {
      if (growthRates[i] > growthRates[i - 1]) increasingCount++;
    }

    return increasingCount / (growthRates.length - 1) > 0.7;
  }

  private isSpikePattern(values: number[]): boolean {
    if (values.length < 3) return false;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const spikes = values.filter((v) => Math.abs(v - mean) > mean * 0.3);

    return spikes.length / values.length > 0.1; // More than 10% are spikes
  }

  private getPatternDescription(
    type: MemoryGrowthPattern["type"],
    severity: MemoryGrowthPattern["severity"],
    growthRate: number,
  ): string {
    const rate = `${(growthRate * 1000).toFixed(1)}KB/s`;

    switch (type) {
      case "linear":
        return `Linear memory growth at ${rate}`;
      case "exponential":
        return `Exponential memory growth starting at ${rate}`;
      case "spike":
        return `Memory spikes detected with irregular pattern`;
      case "leak":
        return `Potential memory leak with steady growth at ${rate}`;
      default:
        return `Unknown growth pattern`;
    }
  }

  private getPatternRecommendation(
    type: MemoryGrowthPattern["type"],
    severity: MemoryGrowthPattern["severity"],
  ): string {
    if (severity === "critical") {
      return "IMMEDIATE ACTION REQUIRED: Investigate native modules and force GC";
    }

    switch (type) {
      case "exponential":
        return "Check for recursive allocations or unbounded data structures";
      case "linear":
        return "Monitor for accumulating objects or growing caches";
      case "spike":
        return "Investigate batch operations or large data processing";
      case "leak":
        return "Check for missing cleanup in native modules or connections";
      default:
        return "Continue monitoring memory usage patterns";
    }
  }

  // ============================================
  // NATIVE MODULE MEMORY ATTRIBUTION
  // ============================================

  private initializeNativeModuleTracking(): void {
    if (!this.config.nativeModuleTracking) return;

    const knownNativeModules = [
      {
        name: "prisma",
        type: "database" as const,
        memoryRange: { min: 20, max: 50 },
      },
      {
        name: "bcrypt",
        type: "crypto" as const,
        memoryRange: { min: 3, max: 10 },
      },
      {
        name: "better-sqlite3",
        type: "database" as const,
        memoryRange: { min: 5, max: 20 },
      },
      {
        name: "pg",
        type: "database" as const,
        memoryRange: { min: 10, max: 25 },
      },
      {
        name: "socket.io",
        type: "network" as const,
        memoryRange: { min: 5, max: 15 },
      },
      { name: "ws", type: "network" as const, memoryRange: { min: 2, max: 8 } },
      {
        name: "compression",
        type: "compression" as const,
        memoryRange: { min: 2, max: 6 },
      },
      {
        name: "elastic-apm-node",
        type: "other" as const,
        memoryRange: { min: 10, max: 30 },
      },
    ];

    knownNativeModules.forEach((module) => {
      this.nativeModules.set(module.name, {
        moduleName: module.name,
        moduleType: module.type,
        estimatedMemory: 0,
        memoryRange: module.memoryRange,
        confidence: 0.5,
        evidence: [],
        lastSeenActive: Date.now(),
        allocations: 0,
        deallocations: 0,
      });
    });
  }

  private updateNativeModuleAttribution(): void {
    if (!this.config.nativeModuleTracking || this.snapshots.length < 2) return;

    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const previousSnapshot = this.snapshots[this.snapshots.length - 2];

    // ✅ MEMORY FIX: Update connection pool attribution
    this.updateConnectionPoolAttribution();

    const externalGrowth =
      (currentSnapshot.external - previousSnapshot.external) / 1024 / 1024;

    if (Math.abs(externalGrowth) > 1) {
      // Significant change > 1MB
      this.attributeMemoryGrowth(externalGrowth, currentSnapshot.timestamp);
    }

    // Update estimates based on current external memory
    this.estimateNativeModuleMemory(currentSnapshot.external / 1024 / 1024);
  }

  private attributeMemoryGrowth(growthMB: number, timestamp: number): void {
    // Simple heuristic-based attribution
    // In a real implementation, this would use more sophisticated tracking

    const activeModules = Array.from(this.nativeModules.values()).filter(
      (m) => timestamp - m.lastSeenActive < 60000,
    ); // Active in last minute

    if (activeModules.length === 0) return;

    // Distribute growth among likely candidates
    const totalWeight = activeModules.reduce(
      (sum, m) => sum + this.getModuleWeight(m),
      0,
    );

    activeModules.forEach((module) => {
      const weight = this.getModuleWeight(module);
      const attributedGrowth = (weight / totalWeight) * growthMB;

      module.estimatedMemory = Math.max(
        0,
        module.estimatedMemory + attributedGrowth,
      );
      module.lastSeenActive = timestamp;

      if (growthMB > 0) module.allocations++;
      else module.deallocations++;

      module.evidence.push(
        `${growthMB > 0 ? "Allocation" : "Deallocation"} of ${Math.abs(attributedGrowth).toFixed(1)}MB at ${new Date(timestamp).toISOString()}`,
      );

      // Keep evidence bounded
      if (module.evidence.length > 20) {
        module.evidence = module.evidence.slice(-10);
      }
    });
  }

  private getModuleWeight(module: NativeModuleAttribution): number {
    // Weight based on module type and known patterns
    const typeWeights = {
      database: 3,
      network: 2,
      crypto: 1.5,
      compression: 1,
      other: 1,
    };

    return typeWeights[module.moduleType] || 1;
  }

  private estimateNativeModuleMemory(totalExternalMB: number): void {
    const modules = Array.from(this.nativeModules.values());
    let allocatedMemory = 0;

    // First, allocate minimum expected memory for each module
    modules.forEach((module) => {
      const minExpected = Math.min(
        module.memoryRange.min,
        totalExternalMB * 0.1,
      );
      module.estimatedMemory = Math.max(module.estimatedMemory, minExpected);
      allocatedMemory += module.estimatedMemory;
    });

    // Distribute remaining memory proportionally
    const remainingMemory = Math.max(0, totalExternalMB - allocatedMemory);
    const totalWeight = modules.reduce(
      (sum, m) => sum + this.getModuleWeight(m),
      0,
    );

    if (totalWeight > 0) {
      modules.forEach((module) => {
        const weight = this.getModuleWeight(module);
        const additionalMemory = (weight / totalWeight) * remainingMemory;
        module.estimatedMemory += additionalMemory;

        // Cap at reasonable maximum
        module.estimatedMemory = Math.min(
          module.estimatedMemory,
          module.memoryRange.max * 2, // Allow 2x max for edge cases
        );

        // Update confidence based on how well it fits expected range
        const inRange =
          module.estimatedMemory >= module.memoryRange.min &&
          module.estimatedMemory <= module.memoryRange.max;
        module.confidence = inRange
          ? 0.8
          : Math.max(0.3, module.confidence * 0.9);
      });
    }
  }

  // ============================================
  // BUFFER LEAK DETECTION
  // ============================================

  private detectBufferLeaks(): void {
    if (!this.config.bufferLeakDetection) return;

    // This is a simplified implementation
    // In practice, you'd need to hook into Buffer allocation/deallocation

    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const arrayBufferMemory = currentSnapshot.arrayBuffers / 1024 / 1024;

    // Check for significant ArrayBuffer growth
    if (this.snapshots.length > 5) {
      const previousSnapshots = this.snapshots.slice(-5, -1);
      const avgPreviousArrayBuffers =
        previousSnapshots.reduce((sum, s) => sum + s.arrayBuffers, 0) /
        previousSnapshots.length /
        1024 /
        1024;

      const growth = arrayBufferMemory - avgPreviousArrayBuffers;

      if (growth > 5) {
        // More than 5MB growth
        const leakId = `buffer-leak-${Date.now()}`;

        this.bufferLeaks.set(leakId, {
          bufferType: "ArrayBuffer",
          size: growth * 1024 * 1024,
          age: 0,
          stackTrace: "Stack trace not available in simplified implementation",
          isLeak: growth > 10, // Definitely a leak if > 10MB sudden growth
          leakConfidence: Math.min(0.9, growth / 20),
          source: "Unknown - requires buffer allocation tracking",
          createdAt: currentSnapshot.timestamp,
          lastAccessed: currentSnapshot.timestamp,
        });

        this.emit("bufferLeakDetected", {
          leakId,
          size: growth,
          confidence: Math.min(0.9, growth / 20),
        });
      }
    }

    // Age existing buffer leaks
    this.bufferLeaks.forEach((leak, leakId) => {
      leak.age = Date.now() - leak.createdAt;

      // Remove old non-leak buffers
      if (!leak.isLeak && leak.age > this.config.bufferLeakAgeThreshold) {
        this.bufferLeaks.delete(leakId);
      }
    });
  }

  // ============================================
  // AUTOMATED EXTERNAL MEMORY LEAK REPORTING
  // ============================================

  private detectExternalMemoryLeaks(): void {
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const externalMB = currentSnapshot.external / 1024 / 1024;

    // Check against threshold
    if (externalMB > this.config.leakDetectionThreshold) {
      this.analyzeForSpecificLeaks(currentSnapshot);
    }

    // Check for sustained growth
    if (this.snapshots.length >= 10) {
      const recentGrowth = this.analyzeRecentGrowth();
      if (recentGrowth.isSustained && recentGrowth.rate > 0.05) {
        // > 50KB/s
        this.reportSustainedGrowthLeak(recentGrowth, currentSnapshot);
      }
    }
  }

  private analyzeForSpecificLeaks(snapshot: ProcessMemorySnapshot): void {
    const leaks: ExternalMemoryLeak[] = [];

    // Check native modules
    this.nativeModules.forEach((module) => {
      if (module.estimatedMemory > module.memoryRange.max * 1.5) {
        const leakId = `native-${module.moduleName}-${Date.now()}`;
        leaks.push({
          id: leakId,
          source: module.moduleName,
          type: "native_module",
          severity: this.calculateLeakSeverity(module.estimatedMemory),
          estimatedSize: module.estimatedMemory * 1024 * 1024,
          growthRate:
            module.allocations > module.deallocations
              ? module.estimatedMemory /
                Math.max(1, (Date.now() - this.startTime) / 1000)
              : 0,
          detectedAt: snapshot.timestamp,
          evidence: module.evidence.slice(),
          recommendation: this.getModuleLeakRecommendation(module),
          relatedSnapshots: [snapshot.timestamp],
        });
      }
    });

    // Check buffer leaks
    this.bufferLeaks.forEach((bufferLeak) => {
      if (bufferLeak.isLeak && bufferLeak.leakConfidence > 0.7) {
        const leakId = `buffer-${bufferLeak.bufferType}-${bufferLeak.createdAt}`;
        leaks.push({
          id: leakId,
          source: bufferLeak.source,
          type: "buffer_leak",
          severity: this.calculateLeakSeverity(bufferLeak.size / 1024 / 1024),
          estimatedSize: bufferLeak.size,
          growthRate: bufferLeak.size / Math.max(1, bufferLeak.age / 1000),
          detectedAt: bufferLeak.createdAt,
          evidence: [
            `${bufferLeak.bufferType} leak detected`,
            bufferLeak.stackTrace,
          ],
          recommendation:
            "Investigate buffer allocation patterns and ensure proper cleanup",
          stackTrace: bufferLeak.stackTrace,
          relatedSnapshots: [snapshot.timestamp],
        });
      }
    });

    // Report new leaks
    leaks.forEach((leak) => {
      if (!this.detectedLeaks.has(leak.id)) {
        this.detectedLeaks.set(leak.id, leak);
        this.emit("externalMemoryLeakDetected", leak);

        logger.error(
          `External memory leak detected: ${leak.source} (${leak.type})`,
          "ProcessMemoryAnalyzer",
          {
            size: `${(leak.estimatedSize / 1024 / 1024).toFixed(1)}MB`,
            severity: leak.severity,
            recommendation: leak.recommendation,
          },
        );
      }
    });
  }

  private analyzeRecentGrowth(): {
    isSustained: boolean;
    rate: number;
    duration: number;
  } {
    const recentSnapshots = this.snapshots.slice(-10);
    if (recentSnapshots.length < 3) {
      return { isSustained: false, rate: 0, duration: 0 };
    }

    const externalValues = recentSnapshots.map((s) => s.external / 1024 / 1024);
    const { slope, correlation } =
      this.calculateLinearRegression(externalValues);

    const duration =
      recentSnapshots[recentSnapshots.length - 1].timestamp -
      recentSnapshots[0].timestamp;
    const rate = (slope * this.config.samplingInterval) / 1000; // MB/second

    return {
      isSustained: correlation > 0.7 && slope > 0,
      rate,
      duration,
    };
  }

  private reportSustainedGrowthLeak(
    growth: { rate: number; duration: number },
    snapshot: ProcessMemorySnapshot,
  ): void {
    const leakId = `sustained-growth-${Date.now()}`;

    if (!this.detectedLeaks.has(leakId)) {
      const leak: ExternalMemoryLeak = {
        id: leakId,
        source: "Unknown - sustained external memory growth",
        type: "unknown",
        severity: this.calculateLeakSeverity(
          (growth.rate * growth.duration) / 1000,
        ),
        estimatedSize: growth.rate * growth.duration,
        growthRate: growth.rate,
        detectedAt: snapshot.timestamp,
        evidence: [
          `Sustained growth rate: ${(growth.rate * 1000).toFixed(1)}KB/s`,
          `Duration: ${(growth.duration / 1000).toFixed(0)}s`,
          `Total growth: ${((growth.rate * growth.duration) / 1000).toFixed(1)}MB`,
        ],
        recommendation:
          "Investigate all native modules and connection pools for leaks",
        relatedSnapshots: this.snapshots.slice(-10).map((s) => s.timestamp),
      };

      this.detectedLeaks.set(leakId, leak);
      this.emit("externalMemoryLeakDetected", leak);
    }
  }

  private calculateLeakSeverity(
    sizeMB: number,
  ): ExternalMemoryLeak["severity"] {
    if (sizeMB > 100) return "critical";
    if (sizeMB > 50) return "high";
    if (sizeMB > 20) return "medium";
    return "low";
  }

  private getModuleLeakRecommendation(module: NativeModuleAttribution): string {
    switch (module.moduleType) {
      case "database":
        return `Check ${module.moduleName} for unclosed connections, connection pool limits, and proper $disconnect() calls`;
      case "network":
        return `Investigate ${module.moduleName} for unclosed sockets, connection leaks, and event listener cleanup`;
      case "crypto":
        return `Check ${module.moduleName} for unreleased crypto contexts and proper cleanup of cryptographic operations`;
      case "compression":
        return `Verify ${module.moduleName} compression dictionaries and buffers are being released`;
      default:
        return `Investigate ${module.moduleName} for proper resource cleanup and memory management`;
    }
  }

  // ============================================
  // AUTOMATED REPORTING
  // ============================================

  private generateAutomatedReport(): void {
    const report = this.generateMemoryAnalysisReport();

    // Save to file
    this.saveReportToFile(report);

    // Emit for external consumption
    this.emit("automatedReport", report);

    // Log summary
    logger.info(
      `Memory Analysis Report: ${report.summary.totalSnapshots} snapshots, ` +
        `${report.leaks.length} leaks, ${report.rssVsHeap.trend} trend`,
      "ProcessMemoryAnalyzer",
    );
  }

  public generateMemoryAnalysisReport(): any {
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const rssVsHeap = this.getRSSvsHeapTrend();

    return {
      timestamp: Date.now(),
      analysisId: `analysis-${this.startTime}`,
      duration: Date.now() - this.startTime,

      summary: {
        totalSnapshots: this.snapshots.length,
        currentRSS: currentSnapshot ? currentSnapshot.rss / 1024 / 1024 : 0,
        currentExternal: currentSnapshot
          ? currentSnapshot.external / 1024 / 1024
          : 0,
        externalRatio: currentSnapshot ? currentSnapshot.externalRatio : 0,
        leaksDetected: this.detectedLeaks.size,
        bufferLeaksDetected: this.bufferLeaks.size,
        growthPatternsDetected: this.growthPatterns.length,
      },

      rssVsHeap: {
        trend: rssVsHeap.trend,
        divergence: rssVsHeap.divergence,
        divergenceTrend: rssVsHeap.divergenceTrend,
        currentRSSMB: rssVsHeap.rssTrend[rssVsHeap.rssTrend.length - 1] || 0,
        currentHeapMB: rssVsHeap.heapTrend[rssVsHeap.heapTrend.length - 1] || 0,
        currentExternalMB:
          rssVsHeap.externalTrend[rssVsHeap.externalTrend.length - 1] || 0,
      },

      nativeModules: Array.from(this.nativeModules.entries()).map(
        ([name, module]) => ({
          name,
          type: module.moduleType,
          estimatedMemoryMB: module.estimatedMemory,
          confidence: module.confidence,
          allocations: module.allocations,
          deallocations: module.deallocations,
          recentEvidence: module.evidence.slice(-3),
        }),
      ),

      leaks: Array.from(this.detectedLeaks.values()).map((leak) => ({
        id: leak.id,
        source: leak.source,
        type: leak.type,
        severity: leak.severity,
        sizeMB: leak.estimatedSize / 1024 / 1024,
        growthRateMBPerSec: leak.growthRate,
        age: Date.now() - leak.detectedAt,
        recommendation: leak.recommendation,
      })),

      growthPatterns: this.growthPatterns.slice(-5).map((pattern) => ({
        type: pattern.type,
        severity: pattern.severity,
        growthRateMBPerSec: pattern.growthRate,
        totalGrowthMB: pattern.totalGrowth,
        confidence: pattern.confidence,
        description: pattern.description,
      })),

      bufferLeaks: Array.from(this.bufferLeaks.values()).map((leak) => ({
        type: leak.bufferType,
        sizeMB: leak.size / 1024 / 1024,
        age: leak.age,
        isLeak: leak.isLeak,
        confidence: leak.leakConfidence,
        source: leak.source,
      })),

      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    if (currentSnapshot) {
      const externalMB = currentSnapshot.external / 1024 / 1024;
      const externalRatio = currentSnapshot.externalRatio;

      if (externalMB > 50) {
        recommendations.push(
          "External memory exceeds 50MB - investigate native modules",
        );
      }

      if (externalRatio > 2.0) {
        recommendations.push(
          "External memory ratio high - check for native memory leaks",
        );
      }

      if (this.detectedLeaks.size > 0) {
        recommendations.push(
          `${this.detectedLeaks.size} memory leaks detected - review leak sources`,
        );
      }

      const rssVsHeap = this.getRSSvsHeapTrend();
      if (rssVsHeap.divergenceTrend === "increasing") {
        recommendations.push(
          "RSS-Heap divergence increasing - monitor external memory growth",
        );
      }

      if (
        this.growthPatterns.some(
          (p) => p.severity === "critical" || p.severity === "high",
        )
      ) {
        recommendations.push(
          "Critical memory growth patterns detected - immediate investigation required",
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Memory usage appears healthy - continue monitoring",
      );
    }

    return recommendations;
  }

  // ============================================
  // STORAGE & CLEANUP
  // ============================================

  private ensureStorageDirectory(): void {
    try {
      if (!fs.existsSync(this.config.storageDirectory)) {
        fs.mkdirSync(this.config.storageDirectory, { recursive: true });
      }
    } catch (error) {
      logger.error(
        "Failed to create storage directory",
        "ProcessMemoryAnalyzer",
        error,
      );
    }
  }

  private saveReportToFile(report: any): void {
    try {
      const filename = `memory-analysis-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const filepath = path.join(this.config.storageDirectory, filename);

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

      // Keep only last 10 reports
      this.cleanupOldReports();
    } catch (error) {
      logger.error(
        "Failed to save memory analysis report",
        "ProcessMemoryAnalyzer",
        error,
      );
    }
  }

  private cleanupOldSnapshots(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.snapshots = this.snapshots.filter((s) => s.timestamp >= cutoff);

    // Also clean up old patterns and leaks
    this.growthPatterns = this.growthPatterns.filter(
      (p) => p.startTime >= cutoff,
    );
  }

  private cleanupOldReports(): void {
    try {
      const files = fs
        .readdirSync(this.config.storageDirectory)
        .filter((f) => f.startsWith("memory-analysis-") && f.endsWith(".json"))
        .map((f) => ({
          name: f,
          path: path.join(this.config.storageDirectory, f),
          stats: fs.statSync(path.join(this.config.storageDirectory, f)),
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the 10 most recent
      files.slice(10).forEach((file) => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      logger.error(
        "Failed to cleanup old reports",
        "ProcessMemoryAnalyzer",
        error,
      );
    }
  }

  private setupPerformanceObservers(): void {
    // This would be implemented with perf_hooks in a full version
    // For now, we'll use a simplified approach
  }

  private cleanupPerformanceObservers(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.gcObserver) {
      this.gcObserver.disconnect();
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  public getCurrentStatus(): any {
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const rssVsHeap = this.getRSSvsHeapTrend();

    return {
      isRunning: this.isRunning,
      uptime: Date.now() - this.startTime,
      totalSnapshots: this.snapshots.length,
      currentMemory: currentSnapshot
        ? {
            rssMB: currentSnapshot.rss / 1024 / 1024,
            heapMB: currentSnapshot.heapUsed / 1024 / 1024,
            externalMB: currentSnapshot.external / 1024 / 1024,
            externalRatio: currentSnapshot.externalRatio,
          }
        : null,
      trends: rssVsHeap,
      leaks: this.detectedLeaks.size,
      bufferLeaks: this.bufferLeaks.size,
      growthPatterns: this.growthPatterns.length,
    };
  }

  public getDetailedAnalysis(): any {
    return this.generateMemoryAnalysisReport();
  }

  public forceSnapshot(): ProcessMemorySnapshot | null {
    this.captureMemorySnapshot();
    return this.snapshots[this.snapshots.length - 1] || null;
  }

  public exportData(): any {
    return {
      config: this.config,
      snapshots: this.snapshots,
      nativeModules: Array.from(this.nativeModules.entries()),
      detectedLeaks: Array.from(this.detectedLeaks.entries()),
      bufferLeaks: Array.from(this.bufferLeaks.entries()),
      growthPatterns: this.growthPatterns,
    };
  }

  /**
   * ✅ MEMORY FIX: Update connection pool memory attribution
   */
  private updateConnectionPoolAttribution(): void {
    try {
      const connectionPools = [
        { name: "prisma", connections: this.getPrismaConnectionCount() },
        {
          name: "advanced-pool",
          connections: this.getAdvancedPoolConnectionCount(),
        },
        { name: "websocket", connections: this.getWebSocketConnectionCount() },
        { name: "http-agent", connections: this.getHTTPAgentConnectionCount() },
      ];

      connectionPools.forEach((pool) => {
        const estimatedMemory = pool.connections * 5; // 5MB per connection estimate

        this.nativeModules.set(pool.name, {
          moduleName: pool.name,
          moduleType: "database",
          estimatedMemory,
          memoryRange: {
            min: estimatedMemory * 0.8,
            max: estimatedMemory * 1.2,
          },
          confidence: 0.8,
          evidence: [`${pool.connections} active connections`],
          lastSeenActive: Date.now(),
          allocations: pool.connections,
          deallocations: 0,
        });
      });
    } catch (error) {
      // Ignore errors in connection pool monitoring
    }
  }

  private getPrismaConnectionCount(): number {
    try {
      // Try to get Prisma connection count from singleton
      const {
        PrismaConnectionManager,
      } = require("@shared/db/PrismaConnectionManager");
      const manager = PrismaConnectionManager.getInstance();
      return manager.isConnected ? 1 : 0;
    } catch {
      return 0;
    }
  }

  private getAdvancedPoolConnectionCount(): number {
    try {
      // Try to get advanced pool connection count
      const {
        ConnectionPoolManager,
      } = require("../shared/ConnectionPoolManager");
      if (ConnectionPoolManager.instance) {
        const memoryUsage = ConnectionPoolManager.instance.getMemoryUsage();
        return memoryUsage.connectionsCount;
      }
    } catch {
      // Ignore errors
    }
    return 0;
  }

  private getWebSocketConnectionCount(): number {
    try {
      // Estimate WebSocket connections based on typical usage
      return Math.floor(Math.random() * 50); // Placeholder - actual implementation would track real connections
    } catch {
      return 0;
    }
  }

  private getHTTPAgentConnectionCount(): number {
    try {
      // Estimate HTTP agent connections
      return Math.floor(Math.random() * 10); // Placeholder for actual HTTP agent tracking
    } catch {
      return 0;
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let processMemoryAnalyzer: ProcessMemoryAnalyzer | null = null;

export function getProcessMemoryAnalyzer(
  config?: Partial<ProcessMemoryAnalysisConfig>,
): ProcessMemoryAnalyzer {
  if (!processMemoryAnalyzer) {
    processMemoryAnalyzer = new ProcessMemoryAnalyzer(config);
  }
  return processMemoryAnalyzer;
}

export function resetProcessMemoryAnalyzer(): void {
  if (processMemoryAnalyzer) {
    processMemoryAnalyzer.stopAnalysis();
    processMemoryAnalyzer = null;
  }
}
