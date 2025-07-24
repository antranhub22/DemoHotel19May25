// ============================================
// PERFORMANCE AUDITOR v1.0 - Phase 5.1 Performance Analysis
// ============================================
// Comprehensive performance analysis tool for identifying bottlenecks,
// memory leaks, slow operations, and optimization opportunities

import { logger } from '@shared/utils/logger';
import { advancedMetricsCollector } from './AdvancedMetricsCollector';

// Performance audit interfaces
export interface PerformanceMetrics {
  timestamp: Date;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    heapUtilization: number;
  };
  cpu: {
    user: number;
    system: number;
    total: number;
  };
  eventLoop: {
    delay: number;
    utilization: number;
  };
  gc: {
    minorGCCount: number;
    majorGCCount: number;
    incrementalGCCount: number;
  };
}

export interface ModulePerformance {
  moduleName: string;
  averageResponseTime: number;
  requestCount: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  issues: PerformanceIssue[];
}

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'latency' | 'error' | 'throughput';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  currentValue: number;
  threshold: number;
  recommendation: string;
  module?: string;
}

export interface PerformanceBottleneck {
  category:
    | 'database'
    | 'api'
    | 'memory'
    | 'cpu'
    | 'external_service'
    | 'module_lifecycle';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedModules: string[];
  metrics: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  recommendations: string[];
}

export interface OptimizationRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'caching' | 'database' | 'api' | 'memory' | 'architecture';
  title: string;
  description: string;
  implementation: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface PerformanceAuditReport {
  timestamp: Date;
  version: string;
  summary: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    performanceScore: number;
    criticalIssues: number;
    highPriorityIssues: number;
    totalRecommendations: number;
  };
  systemMetrics: PerformanceMetrics;
  modulePerformance: ModulePerformance[];
  bottlenecks: PerformanceBottleneck[];
  issues: PerformanceIssue[];
  recommendations: OptimizationRecommendation[];
  trends: {
    memoryTrend: 'increasing' | 'stable' | 'decreasing';
    performanceTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'increasing' | 'stable' | 'decreasing';
  };
  benchmarks: {
    startupTime: number;
    averageApiResponseTime: number;
    memoryBaseline: number;
    throughputBaseline: number;
  };
}

/**
 * Performance Auditor
 * Comprehensive system performance analysis and optimization recommendations
 */
export class PerformanceAuditor {
  private static instance: PerformanceAuditor;
  private isInitialized = false;
  private auditHistory: PerformanceAuditReport[] = [];
  private performanceBaseline: PerformanceMetrics | null = null;
  private startupTime = Date.now();

  private constructor() {}

  static getInstance(): PerformanceAuditor {
    if (!this.instance) {
      this.instance = new PerformanceAuditor();
    }
    return this.instance;
  }

  /**
   * Initialize the performance auditor
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        '🔍 [PerformanceAuditor] Initializing performance audit system',
        'PerformanceAuditor'
      );

      // Set startup time baseline
      this.startupTime = Date.now();

      // Establish performance baseline
      await this.establishBaseline();

      this.isInitialized = true;
      logger.success(
        '✅ [PerformanceAuditor] Performance audit system initialized',
        'PerformanceAuditor'
      );
    } catch (error) {
      logger.error(
        '❌ [PerformanceAuditor] Failed to initialize performance auditor',
        'PerformanceAuditor',
        error
      );
      throw error;
    }
  }

  /**
   * Run comprehensive performance audit
   */
  async runComprehensiveAudit(): Promise<PerformanceAuditReport> {
    try {
      logger.info(
        '🔍 [PerformanceAuditor] Starting comprehensive performance audit',
        'PerformanceAuditor'
      );

      const startTime = Date.now();

      // Collect current system metrics
      const systemMetrics = await this.collectSystemMetrics();

      // Analyze module performance
      const modulePerformance = await this.analyzeModulePerformance();

      // Identify bottlenecks
      const bottlenecks = await this.identifyBottlenecks(
        systemMetrics,
        modulePerformance
      );

      // Detect performance issues
      const issues = await this.detectPerformanceIssues(
        systemMetrics,
        modulePerformance
      );

      // Generate optimization recommendations
      const recommendations = await this.generateOptimizationRecommendations(
        issues,
        bottlenecks
      );

      // Analyze trends
      const trends = this.analyzeTrends();

      // Calculate benchmarks
      const benchmarks = await this.calculateBenchmarks();

      // Calculate overall performance score
      const performanceScore = this.calculatePerformanceScore(
        issues,
        modulePerformance
      );

      // Determine overall health
      const overallHealth = this.determineOverallHealth(
        performanceScore,
        issues
      );

      const auditReport: PerformanceAuditReport = {
        timestamp: new Date(),
        version: '1.0.0',
        summary: {
          overallHealth,
          performanceScore,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          highPriorityIssues: issues.filter(i => i.severity === 'high').length,
          totalRecommendations: recommendations.length,
        },
        systemMetrics,
        modulePerformance,
        bottlenecks,
        issues,
        recommendations,
        trends,
        benchmarks,
      };

      // Store audit history
      this.auditHistory.push(auditReport);

      // Keep only last 10 audits
      if (this.auditHistory.length > 10) {
        this.auditHistory = this.auditHistory.slice(-10);
      }

      const auditDuration = Date.now() - startTime;
      logger.info(
        `✅ [PerformanceAuditor] Comprehensive audit completed in ${auditDuration}ms`,
        'PerformanceAuditor',
        {
          performanceScore,
          overallHealth,
          criticalIssues: auditReport.summary.criticalIssues,
          recommendations: auditReport.summary.totalRecommendations,
        }
      );

      return auditReport;
    } catch (error) {
      logger.error(
        '❌ [PerformanceAuditor] Comprehensive audit failed',
        'PerformanceAuditor',
        error
      );
      throw error;
    }
  }

  /**
   * Run quick performance check
   */
  async runQuickAudit(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: PerformanceIssue[];
    quickRecommendations: string[];
  }> {
    try {
      const systemMetrics = await this.collectSystemMetrics();
      const issues = await this.detectCriticalIssues(systemMetrics);
      const score = this.calculateQuickScore(systemMetrics, issues);

      let status: 'healthy' | 'warning' | 'critical';
      if (score >= 80) status = 'healthy';
      else if (score >= 60) status = 'warning';
      else status = 'critical';

      const quickRecommendations = this.generateQuickRecommendations(issues);

      return { status, score, issues, quickRecommendations };
    } catch (error) {
      logger.error(
        '❌ [PerformanceAuditor] Quick audit failed',
        'PerformanceAuditor',
        error
      );
      throw error;
    }
  }

  /**
   * Get audit history
   */
  getAuditHistory(): PerformanceAuditReport[] {
    return this.auditHistory.slice(); // Return copy
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(hours: number = 24): {
    memoryUsage: Array<{ timestamp: Date; value: number }>;
    responseTime: Array<{ timestamp: Date; value: number }>;
    errorRate: Array<{ timestamp: Date; value: number }>;
    cpuUsage: Array<{ timestamp: Date; value: number }>;
  } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const relevantAudits = this.auditHistory.filter(
      audit => audit.timestamp >= cutoff
    );

    return {
      memoryUsage: relevantAudits.map(audit => ({
        timestamp: audit.timestamp,
        value: audit.systemMetrics.memory.heapUtilization,
      })),
      responseTime: relevantAudits.map(audit => ({
        timestamp: audit.timestamp,
        value: audit.benchmarks.averageApiResponseTime,
      })),
      errorRate: relevantAudits.map(audit => ({
        timestamp: audit.timestamp,
        value:
          audit.modulePerformance.reduce((sum, mod) => sum + mod.errorRate, 0) /
          audit.modulePerformance.length,
      })),
      cpuUsage: relevantAudits.map(audit => ({
        timestamp: audit.timestamp,
        value: audit.systemMetrics.cpu.total,
      })),
    };
  }

  // Private methods

  private async establishBaseline(): Promise<void> {
    logger.debug(
      '📊 [PerformanceAuditor] Establishing performance baseline',
      'PerformanceAuditor'
    );

    // Wait a moment for system to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.performanceBaseline = await this.collectSystemMetrics();

    logger.debug(
      '✅ [PerformanceAuditor] Performance baseline established',
      'PerformanceAuditor',
      {
        memoryUsage: this.performanceBaseline.memory.heapUsed,
        cpuUsage: this.performanceBaseline.cpu.total,
      }
    );
  }

  private async collectSystemMetrics(): Promise<PerformanceMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Calculate heap utilization
    const heapUtilization =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Estimate event loop delay (simplified)
    const eventLoopStart = process.hrtime.bigint();
    await new Promise(resolve => setImmediate(resolve));
    const eventLoopEnd = process.hrtime.bigint();
    const eventLoopDelay = Number(eventLoopEnd - eventLoopStart) / 1000000; // Convert to ms

    return {
      timestamp: new Date(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUtilization: Math.round(heapUtilization * 100) / 100,
      },
      cpu: {
        user: Math.round((cpuUsage.user / 1000) * 100) / 100, // ms to percentage
        system: Math.round((cpuUsage.system / 1000) * 100) / 100, // ms to percentage
        total:
          Math.round(((cpuUsage.user + cpuUsage.system) / 1000) * 100) / 100,
      },
      eventLoop: {
        delay: Math.round(eventLoopDelay * 100) / 100,
        utilization:
          eventLoopDelay > 1 ? Math.min(100, eventLoopDelay * 10) : 10, // Estimate
      },
      gc: {
        minorGCCount: 0, // Would need gc-stats for real data
        majorGCCount: 0,
        incrementalGCCount: 0,
      },
    };
  }

  private async analyzeModulePerformance(): Promise<ModulePerformance[]> {
    const moduleNames = [
      'core-module',
      'hotel-module',
      'voice-module',
      'analytics-module',
      'admin-module',
    ];
    const modulePerformance: ModulePerformance[] = [];

    for (const moduleName of moduleNames) {
      try {
        // Get module metrics from AdvancedMetricsCollector
        const moduleMetrics = advancedMetricsCollector.getModuleMetrics(
          moduleName,
          1
        ); // Last 1 hour

        // Analyze performance issues for this module
        const issues = await this.analyzeModuleIssues(
          moduleName,
          moduleMetrics
        );

        // Determine health status
        let healthStatus: 'healthy' | 'degraded' | 'unhealthy';
        const criticalIssues = issues.filter(
          i => i.severity === 'critical'
        ).length;
        const highIssues = issues.filter(i => i.severity === 'high').length;

        if (criticalIssues > 0) healthStatus = 'unhealthy';
        else if (highIssues > 0) healthStatus = 'degraded';
        else healthStatus = 'healthy';

        modulePerformance.push({
          moduleName,
          averageResponseTime: moduleMetrics.summary.averageResponseTime,
          requestCount: moduleMetrics.summary.requestCount,
          errorRate: moduleMetrics.summary.errorRate,
          memoryUsage:
            moduleMetrics.performance.reduce(
              (sum, p) => sum + p.memoryUsage,
              0
            ) / Math.max(moduleMetrics.performance.length, 1),
          cpuUsage:
            moduleMetrics.performance.reduce((sum, p) => sum + p.cpuUsage, 0) /
            Math.max(moduleMetrics.performance.length, 1),
          throughput: moduleMetrics.performance.reduce(
            (sum, p) => sum + p.throughput,
            0
          ),
          healthStatus,
          issues,
        });
      } catch (error) {
        logger.warn(
          `⚠️ [PerformanceAuditor] Failed to analyze module ${moduleName}`,
          'PerformanceAuditor',
          error
        );

        // Add default entry for failed module
        modulePerformance.push({
          moduleName,
          averageResponseTime: 0,
          requestCount: 0,
          errorRate: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          throughput: 0,
          healthStatus: 'unhealthy',
          issues: [
            {
              type: 'error',
              severity: 'high',
              description: 'Failed to collect module performance data',
              currentValue: 0,
              threshold: 0,
              recommendation: 'Investigate module monitoring setup',
              module: moduleName,
            },
          ],
        });
      }
    }

    return modulePerformance;
  }

  private async analyzeModuleIssues(
    moduleName: string,
    moduleMetrics: any
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    // Check response time
    if (moduleMetrics.summary.averageResponseTime > 2000) {
      issues.push({
        type: 'latency',
        severity:
          moduleMetrics.summary.averageResponseTime > 5000
            ? 'critical'
            : 'high',
        description: `High average response time for ${moduleName}`,
        currentValue: moduleMetrics.summary.averageResponseTime,
        threshold: 2000,
        recommendation:
          'Optimize slow endpoints, implement caching, or review database queries',
        module: moduleName,
      });
    }

    // Check error rate
    if (moduleMetrics.summary.errorRate > 0.05) {
      // 5%
      issues.push({
        type: 'error',
        severity: moduleMetrics.summary.errorRate > 0.1 ? 'critical' : 'high',
        description: `High error rate for ${moduleName}`,
        currentValue: moduleMetrics.summary.errorRate,
        threshold: 0.05,
        recommendation: 'Investigate and fix error-prone operations',
        module: moduleName,
      });
    }

    // Check alert count
    if (moduleMetrics.summary.alertCount > 5) {
      issues.push({
        type: 'error',
        severity: moduleMetrics.summary.alertCount > 10 ? 'critical' : 'medium',
        description: `High number of alerts for ${moduleName}`,
        currentValue: moduleMetrics.summary.alertCount,
        threshold: 5,
        recommendation: 'Address underlying causes of alerts',
        module: moduleName,
      });
    }

    return issues;
  }

  private async identifyBottlenecks(
    systemMetrics: PerformanceMetrics,
    modulePerformance: ModulePerformance[]
  ): Promise<PerformanceBottleneck[]> {
    const bottlenecks: PerformanceBottleneck[] = [];

    // Memory bottleneck
    if (systemMetrics.memory.heapUtilization > 80) {
      bottlenecks.push({
        category: 'memory',
        description: 'High memory utilization detected',
        impact: systemMetrics.memory.heapUtilization > 90 ? 'critical' : 'high',
        affectedModules: modulePerformance
          .filter(m => m.memoryUsage > 100)
          .map(m => m.moduleName),
        metrics: { memoryUsage: systemMetrics.memory.heapUtilization },
        recommendations: [
          'Implement object pooling',
          'Review memory leaks',
          'Optimize data structures',
          'Implement memory monitoring alerts',
        ],
      });
    }

    // CPU bottleneck
    if (systemMetrics.cpu.total > 70) {
      bottlenecks.push({
        category: 'cpu',
        description: 'High CPU utilization detected',
        impact: systemMetrics.cpu.total > 85 ? 'critical' : 'high',
        affectedModules: modulePerformance
          .filter(m => m.cpuUsage > 50)
          .map(m => m.moduleName),
        metrics: { cpuUsage: systemMetrics.cpu.total },
        recommendations: [
          'Optimize computationally intensive operations',
          'Implement caching for repeated calculations',
          'Use worker threads for heavy tasks',
          'Review algorithm efficiency',
        ],
      });
    }

    // API response time bottleneck
    const slowModules = modulePerformance.filter(
      m => m.averageResponseTime > 2000
    );
    if (slowModules.length > 0) {
      bottlenecks.push({
        category: 'api',
        description: 'Slow API response times detected',
        impact: slowModules.some(m => m.averageResponseTime > 5000)
          ? 'critical'
          : 'high',
        affectedModules: slowModules.map(m => m.moduleName),
        metrics: {
          responseTime: Math.max(
            ...slowModules.map(m => m.averageResponseTime)
          ),
        },
        recommendations: [
          'Implement response caching',
          'Optimize database queries',
          'Use pagination for large datasets',
          'Implement request compression',
        ],
      });
    }

    // Error rate bottleneck
    const errorProneModules = modulePerformance.filter(m => m.errorRate > 0.05);
    if (errorProneModules.length > 0) {
      bottlenecks.push({
        category: 'external_service',
        description: 'High error rates detected',
        impact: errorProneModules.some(m => m.errorRate > 0.1)
          ? 'critical'
          : 'medium',
        affectedModules: errorProneModules.map(m => m.moduleName),
        metrics: {
          errorRate: Math.max(...errorProneModules.map(m => m.errorRate)),
        },
        recommendations: [
          'Implement proper error handling',
          'Add retry mechanisms',
          'Improve input validation',
          'Monitor external service dependencies',
        ],
      });
    }

    return bottlenecks;
  }

  private async detectPerformanceIssues(
    systemMetrics: PerformanceMetrics,
    modulePerformance: ModulePerformance[]
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    // System-wide issues
    if (systemMetrics.memory.heapUtilization > 85) {
      issues.push({
        type: 'memory',
        severity:
          systemMetrics.memory.heapUtilization > 95 ? 'critical' : 'high',
        description: 'System memory utilization is critically high',
        currentValue: systemMetrics.memory.heapUtilization,
        threshold: 85,
        recommendation:
          'Investigate memory leaks, optimize data structures, implement garbage collection tuning',
      });
    }

    if (systemMetrics.cpu.total > 80) {
      issues.push({
        type: 'cpu',
        severity: systemMetrics.cpu.total > 90 ? 'critical' : 'high',
        description: 'System CPU utilization is high',
        currentValue: systemMetrics.cpu.total,
        threshold: 80,
        recommendation:
          'Optimize computationally expensive operations, implement async processing',
      });
    }

    if (systemMetrics.eventLoop.delay > 10) {
      issues.push({
        type: 'latency',
        severity: systemMetrics.eventLoop.delay > 50 ? 'critical' : 'medium',
        description: 'Event loop delay detected',
        currentValue: systemMetrics.eventLoop.delay,
        threshold: 10,
        recommendation:
          'Identify and optimize blocking operations, use worker threads for CPU-intensive tasks',
      });
    }

    // Module-specific issues
    modulePerformance.forEach(module => {
      issues.push(...module.issues);
    });

    return issues;
  }

  private async detectCriticalIssues(
    systemMetrics: PerformanceMetrics
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    // Only detect critical issues for quick audit
    if (systemMetrics.memory.heapUtilization > 90) {
      issues.push({
        type: 'memory',
        severity: 'critical',
        description: 'Critical memory usage detected',
        currentValue: systemMetrics.memory.heapUtilization,
        threshold: 90,
        recommendation: 'Immediate memory optimization required',
      });
    }

    if (systemMetrics.cpu.total > 90) {
      issues.push({
        type: 'cpu',
        severity: 'critical',
        description: 'Critical CPU usage detected',
        currentValue: systemMetrics.cpu.total,
        threshold: 90,
        recommendation: 'Immediate CPU optimization required',
      });
    }

    return issues;
  }

  private async generateOptimizationRecommendations(
    issues: PerformanceIssue[],
    bottlenecks: PerformanceBottleneck[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Memory optimization recommendations
    const memoryIssues = issues.filter(i => i.type === 'memory');
    if (memoryIssues.length > 0) {
      recommendations.push({
        priority: memoryIssues.some(i => i.severity === 'critical')
          ? 'critical'
          : 'high',
        category: 'memory',
        title: 'Memory Usage Optimization',
        description:
          'Optimize memory usage to prevent out-of-memory errors and improve performance',
        implementation:
          'Implement object pooling, optimize data structures, add memory monitoring',
        expectedImprovement: '20-40% reduction in memory usage',
        effort: 'medium',
        dependencies: ['monitoring-system'],
      });
    }

    // Caching recommendations
    const latencyIssues = issues.filter(i => i.type === 'latency');
    if (latencyIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'caching',
        title: 'Implement Response Caching',
        description:
          'Add caching layer to reduce response times and server load',
        implementation:
          'Implement Redis caching for frequently accessed data and API responses',
        expectedImprovement:
          '50-70% reduction in response time for cached endpoints',
        effort: 'medium',
        dependencies: ['redis-setup'],
      });
    }

    // Database optimization recommendations
    const databaseBottlenecks = bottlenecks.filter(
      b => b.category === 'database' || b.category === 'api'
    );
    if (databaseBottlenecks.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'database',
        title: 'Database Query Optimization',
        description: 'Optimize database queries and implement proper indexing',
        implementation:
          'Add database indexes, optimize slow queries, implement connection pooling',
        expectedImprovement: '30-60% improvement in database response time',
        effort: 'medium',
        dependencies: ['database-analysis'],
      });
    }

    // API optimization recommendations
    if (issues.some(i => i.type === 'error')) {
      recommendations.push({
        priority: 'medium',
        category: 'api',
        title: 'Error Handling Improvement',
        description:
          'Improve error handling and implement proper retry mechanisms',
        implementation:
          'Add comprehensive error handling, implement circuit breakers, add request validation',
        expectedImprovement: '60-80% reduction in error rates',
        effort: 'low',
        dependencies: [],
      });
    }

    // Architecture recommendations
    if (bottlenecks.some(b => b.impact === 'critical')) {
      recommendations.push({
        priority: 'high',
        category: 'architecture',
        title: 'Architecture Optimization',
        description:
          'Optimize system architecture for better scalability and performance',
        implementation:
          'Implement microservices separation, add load balancing, optimize module communication',
        expectedImprovement: 'Overall system performance improvement of 40-60%',
        effort: 'high',
        dependencies: ['load-testing', 'monitoring-enhancement'],
      });
    }

    return recommendations;
  }

  private generateQuickRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.type === 'memory' && i.severity === 'critical')) {
      recommendations.push('Restart service to free memory');
      recommendations.push('Investigate memory leaks immediately');
    }

    if (issues.some(i => i.type === 'cpu' && i.severity === 'critical')) {
      recommendations.push('Identify and optimize CPU-intensive operations');
      recommendations.push('Consider scaling to multiple instances');
    }

    if (issues.some(i => i.type === 'latency')) {
      recommendations.push('Implement caching for slow endpoints');
      recommendations.push('Optimize database queries');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well');
      recommendations.push(
        'Continue monitoring for optimization opportunities'
      );
    }

    return recommendations;
  }

  private analyzeTrends(): {
    memoryTrend: 'increasing' | 'stable' | 'decreasing';
    performanceTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    if (this.auditHistory.length < 2) {
      return {
        memoryTrend: 'stable',
        performanceTrend: 'stable',
        errorTrend: 'stable',
      };
    }

    const recent = this.auditHistory.slice(-3);
    const current = recent[recent.length - 1];
    const previous = recent[0];

    // Memory trend
    const memoryChange =
      current.systemMetrics.memory.heapUtilization -
      previous.systemMetrics.memory.heapUtilization;
    const memoryTrend =
      memoryChange > 5
        ? 'increasing'
        : memoryChange < -5
          ? 'decreasing'
          : 'stable';

    // Performance trend
    const perfChange =
      current.summary.performanceScore - previous.summary.performanceScore;
    const performanceTrend =
      perfChange > 5 ? 'improving' : perfChange < -5 ? 'degrading' : 'stable';

    // Error trend
    const currentErrors =
      current.summary.criticalIssues + current.summary.highPriorityIssues;
    const previousErrors =
      previous.summary.criticalIssues + previous.summary.highPriorityIssues;
    const errorChange = currentErrors - previousErrors;
    const errorTrend =
      errorChange > 0
        ? 'increasing'
        : errorChange < 0
          ? 'decreasing'
          : 'stable';

    return { memoryTrend, performanceTrend, errorTrend };
  }

  private async calculateBenchmarks(): Promise<{
    startupTime: number;
    averageApiResponseTime: number;
    memoryBaseline: number;
    throughputBaseline: number;
  }> {
    const startupTime = Date.now() - this.startupTime;

    // Get current metrics snapshot
    const metricsSnapshot = advancedMetricsCollector.getCurrentSnapshot();

    return {
      startupTime,
      averageApiResponseTime:
        metricsSnapshot.performance.overall.averageResponseTime,
      memoryBaseline: this.performanceBaseline
        ? this.performanceBaseline.memory.heapUsed
        : 0,
      throughputBaseline: metricsSnapshot.performance.overall.totalRequests,
    };
  }

  private calculatePerformanceScore(
    issues: PerformanceIssue[],
    modulePerformance: ModulePerformance[]
  ): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Deduct points for unhealthy modules
    modulePerformance.forEach(module => {
      if (module.healthStatus === 'unhealthy') score -= 10;
      else if (module.healthStatus === 'degraded') score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateQuickScore(
    systemMetrics: PerformanceMetrics,
    issues: PerformanceIssue[]
  ): number {
    let score = 100;

    // Memory score
    if (systemMetrics.memory.heapUtilization > 80) score -= 20;
    else if (systemMetrics.memory.heapUtilization > 60) score -= 10;

    // CPU score
    if (systemMetrics.cpu.total > 80) score -= 20;
    else if (systemMetrics.cpu.total > 60) score -= 10;

    // Issues score
    issues.forEach(issue => {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'high') score -= 20;
    });

    return Math.max(0, Math.min(100, score));
  }

  private determineOverallHealth(
    score: number,
    issues: PerformanceIssue[]
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;

    if (criticalIssues > 0) return 'critical';
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      auditHistoryCount: this.auditHistory.length,
      hasBaseline: !!this.performanceBaseline,
      startupTime: this.startupTime,
      lastAuditTime:
        this.auditHistory.length > 0
          ? this.auditHistory[this.auditHistory.length - 1].timestamp
          : null,
    };
  }
}

// Export singleton instance
export const performanceAuditor = PerformanceAuditor.getInstance();

// Convenience functions
export const initializePerformanceAuditor = () =>
  performanceAuditor.initialize();
export const runComprehensiveAudit = () =>
  performanceAuditor.runComprehensiveAudit();
export const runQuickAudit = () => performanceAuditor.runQuickAudit();
export const getPerformanceTrends = (hours?: number) =>
  performanceAuditor.getPerformanceTrends(hours);
