// ============================================
// ADVANCED HEALTH CHECK SYSTEM v2.0 - Phase 4 Monitoring
// ============================================
// Comprehensive health monitoring with module-specific checks,
// dependency validation, cascade failure detection, and intelligent alerting

import { db } from '@shared/db';
import { logger } from '@shared/utils/logger';

// Health check interfaces
export interface ModuleHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  uptime: number;
  lastCheck: Date;
  dependencies: DependencyHealth[];
  metrics: ModuleMetrics;
  issues: HealthIssue[];
  responseTime: number;
}

export interface DependencyHealth {
  name: string;
  type: 'database' | 'service' | 'external_api' | 'module';
  status: 'healthy' | 'degraded' | 'failed';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

export interface ModuleMetrics {
  requestCount: number;
  errorRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  module: string;
  timestamp: Date;
  resolved: boolean;
  affectedDependencies: string[];
}

export interface SystemHealthSummary {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  modules: ModuleHealthStatus[];
  systemMetrics: {
    totalModules: number;
    healthyModules: number;
    degradedModules: number;
    unhealthyModules: number;
    criticalModules: number;
    systemUptime: number;
    overallResponseTime: number;
  };
  cascadeFailures: CascadeFailure[];
  recommendations: HealthRecommendation[];
  lastUpdated: Date;
}

export interface CascadeFailure {
  id: string;
  rootCause: string;
  affectedModules: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  detectedAt: Date;
}

export interface HealthRecommendation {
  id: string;
  type: 'performance' | 'reliability' | 'maintenance' | 'scaling';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  module: string;
  actionItems: string[];
  estimatedEffort: string;
}

// Health check registry for modules
interface ModuleHealthChecker {
  name: string;
  checkFunction: () => Promise<ModuleHealthStatus>;
  dependencies: string[];
  criticalDependencies: string[];
  interval: number;
  timeout: number;
}

/**
 * Advanced Health Check System
 * Provides comprehensive health monitoring for the modular architecture
 */
export class AdvancedHealthCheck {
  private static instance: AdvancedHealthCheck;
  private healthCheckers: Map<string, ModuleHealthChecker> = new Map();
  private healthHistory: Map<string, ModuleHealthStatus[]> = new Map();
  private activeIssues: Map<string, HealthIssue> = new Map();
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AdvancedHealthCheck {
    if (!this.instance) {
      this.instance = new AdvancedHealthCheck();
    }
    return this.instance;
  }

  /**
   * Initialize the health check system
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        '🏥 [AdvancedHealthCheck] Initializing advanced health check system v2.0',
        'HealthCheck'
      );

      // Register core health checkers
      await this.registerCoreHealthCheckers();

      // Start continuous health monitoring
      this.startContinuousMonitoring();

      this.isInitialized = true;
      logger.success(
        '✅ [AdvancedHealthCheck] Advanced health check system initialized',
        'HealthCheck'
      );
    } catch (error) {
      logger.error(
        '❌ [AdvancedHealthCheck] Failed to initialize health check system',
        'HealthCheck',
        error
      );
      throw error;
    }
  }

  /**
   * Register a module health checker
   */
  registerModuleHealthChecker(checker: ModuleHealthChecker): void {
    logger.debug(
      `🔧 [AdvancedHealthCheck] Registering health checker for module: ${checker.name}`,
      'HealthCheck'
    );
    this.healthCheckers.set(checker.name, checker);
    this.healthHistory.set(checker.name, []);
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<SystemHealthSummary> {
    const startTime = Date.now();

    try {
      // Run all health checks in parallel
      const moduleHealthPromises = Array.from(this.healthCheckers.values()).map(
        async checker => {
          try {
            const health = await Promise.race([
              checker.checkFunction(),
              new Promise<ModuleHealthStatus>((_, reject) =>
                setTimeout(
                  () => reject(new Error('Health check timeout')),
                  checker.timeout
                )
              ),
            ]);
            return health;
          } catch (error) {
            return this.createFailedHealthStatus(checker.name, error as Error);
          }
        }
      );

      const moduleHealthStatuses = await Promise.all(moduleHealthPromises);

      // Update health history
      moduleHealthStatuses.forEach(status => {
        const history = this.healthHistory.get(status.name) || [];
        history.push(status);
        // Keep only last 100 entries
        if (history.length > 100) history.shift();
        this.healthHistory.set(status.name, history);
      });

      // Detect cascade failures
      const cascadeFailures = this.detectCascadeFailures(moduleHealthStatuses);

      // Generate recommendations
      const recommendations =
        this.generateHealthRecommendations(moduleHealthStatuses);

      // Calculate system metrics
      const systemMetrics = this.calculateSystemMetrics(moduleHealthStatuses);

      const systemHealth: SystemHealthSummary = {
        overallStatus: this.determineOverallStatus(moduleHealthStatuses),
        modules: moduleHealthStatuses,
        systemMetrics,
        cascadeFailures,
        recommendations,
        lastUpdated: new Date(),
      };

      const responseTime = Date.now() - startTime;
      logger.debug(
        `🏥 [AdvancedHealthCheck] System health check completed in ${responseTime}ms`,
        'HealthCheck'
      );

      return systemHealth;
    } catch (error) {
      logger.error(
        '❌ [AdvancedHealthCheck] Failed to get system health',
        'HealthCheck',
        error
      );
      throw error;
    }
  }

  /**
   * Get health status for a specific module
   */
  async getModuleHealth(
    moduleName: string
  ): Promise<ModuleHealthStatus | null> {
    const checker = this.healthCheckers.get(moduleName);
    if (!checker) {
      logger.warn(
        `⚠️ [AdvancedHealthCheck] No health checker found for module: ${moduleName}`,
        'HealthCheck'
      );
      return null;
    }

    try {
      const health = await Promise.race([
        checker.checkFunction(),
        new Promise<ModuleHealthStatus>((_, reject) =>
          setTimeout(
            () => reject(new Error('Health check timeout')),
            checker.timeout
          )
        ),
      ]);
      return health;
    } catch (error) {
      return this.createFailedHealthStatus(moduleName, error as Error);
    }
  }

  /**
   * Get health history for a module
   */
  getModuleHealthHistory(moduleName: string, limit = 50): ModuleHealthStatus[] {
    const history = this.healthHistory.get(moduleName) || [];
    return history.slice(-limit);
  }

  /**
   * Register core health checkers for essential components
   */
  private async registerCoreHealthCheckers(): Promise<void> {
    // Database health checker
    this.registerModuleHealthChecker({
      name: 'database',
      checkFunction: async () => this.checkDatabaseHealth(),
      dependencies: [],
      criticalDependencies: [],
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
    });

    // Memory health checker
    this.registerModuleHealthChecker({
      name: 'memory',
      checkFunction: async () => this.checkMemoryHealth(),
      dependencies: [],
      criticalDependencies: [],
      interval: 60000, // 1 minute
      timeout: 1000, // 1 second
    });

    // Service container health checker
    this.registerModuleHealthChecker({
      name: 'service-container',
      checkFunction: async () => this.checkServiceContainerHealth(),
      dependencies: [],
      criticalDependencies: [],
      interval: 45000, // 45 seconds
      timeout: 3000, // 3 seconds
    });
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ModuleHealthStatus> {
    const startTime = Date.now();
    const dependencies: DependencyHealth[] = [];

    try {
      // Test database connection
      const testQuery = await db.$client.query('SELECT 1 as test');
      const responseTime = Date.now() - startTime;

      dependencies.push({
        name: 'primary-database',
        type: 'database',
        status: testQuery ? 'healthy' : 'failed',
        responseTime,
        lastCheck: new Date(),
        errorCount: 0,
      });

      return {
        name: 'database',
        status:
          responseTime < 1000
            ? 'healthy'
            : responseTime < 3000
              ? 'degraded'
              : 'unhealthy',
        uptime: process.uptime(),
        lastCheck: new Date(),
        dependencies,
        metrics: {
          requestCount: 1,
          errorRate: 0,
          averageResponseTime: responseTime,
          memoryUsage: 0,
          cpuUsage: 0,
        },
        issues: [],
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      dependencies.push({
        name: 'primary-database',
        type: 'database',
        status: 'failed',
        responseTime,
        lastCheck: new Date(),
        errorCount: 1,
      });

      return {
        name: 'database',
        status: 'critical',
        uptime: process.uptime(),
        lastCheck: new Date(),
        dependencies,
        metrics: {
          requestCount: 1,
          errorRate: 1,
          averageResponseTime: responseTime,
          memoryUsage: 0,
          cpuUsage: 0,
        },
        issues: [
          {
            id: `db-error-${Date.now()}`,
            severity: 'critical',
            description: `Database connection failed: ${(error as Error).message}`,
            module: 'database',
            timestamp: new Date(),
            resolved: false,
            affectedDependencies: ['primary-database'],
          },
        ],
        responseTime,
      };
    }
  }

  /**
   * Check memory health
   */
  private async checkMemoryHealth(): Promise<ModuleHealthStatus> {
    const startTime = Date.now();
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024;
    const totalMemoryMB = memoryUsage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (usedMemoryMB / totalMemoryMB) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' | 'critical' = 'healthy';
    const issues: HealthIssue[] = [];

    if (memoryUsagePercent > 90) {
      status = 'critical';
      issues.push({
        id: `memory-critical-${Date.now()}`,
        severity: 'critical',
        description: `Memory usage critically high: ${memoryUsagePercent.toFixed(1)}%`,
        module: 'memory',
        timestamp: new Date(),
        resolved: false,
        affectedDependencies: [],
      });
    } else if (memoryUsagePercent > 80) {
      status = 'unhealthy';
      issues.push({
        id: `memory-high-${Date.now()}`,
        severity: 'high',
        description: `Memory usage high: ${memoryUsagePercent.toFixed(1)}%`,
        module: 'memory',
        timestamp: new Date(),
        resolved: false,
        affectedDependencies: [],
      });
    } else if (memoryUsagePercent > 70) {
      status = 'degraded';
    }

    return {
      name: 'memory',
      status,
      uptime: process.uptime(),
      lastCheck: new Date(),
      dependencies: [],
      metrics: {
        requestCount: 1,
        errorRate: 0,
        averageResponseTime: Date.now() - startTime,
        memoryUsage: usedMemoryMB,
        cpuUsage: 0,
      },
      issues,
      responseTime: Date.now() - startTime,
    };
  }

  /**
   * Check service container health
   */
  private async checkServiceContainerHealth(): Promise<ModuleHealthStatus> {
    const startTime = Date.now();

    try {
      // Import ServiceContainer dynamically to avoid circular dependency
      const { ServiceContainer } = await import('./ServiceContainer');
      const containerHealth = ServiceContainer.getHealthStatus();

      const status = containerHealth.healthy ? 'healthy' : 'unhealthy';
      const issues: HealthIssue[] = [];

      if (containerHealth.errors.length > 0) {
        issues.push({
          id: `container-errors-${Date.now()}`,
          severity: 'medium',
          description: `ServiceContainer has ${containerHealth.errors.length} errors`,
          module: 'service-container',
          timestamp: new Date(),
          resolved: false,
          affectedDependencies: [],
        });
      }

      return {
        name: 'service-container',
        status,
        uptime: process.uptime(),
        lastCheck: new Date(),
        dependencies: [],
        metrics: {
          requestCount: 1,
          errorRate: containerHealth.errors.length > 0 ? 1 : 0,
          averageResponseTime: Date.now() - startTime,
          memoryUsage: 0,
          cpuUsage: 0,
        },
        issues,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return this.createFailedHealthStatus('service-container', error as Error);
    }
  }

  /**
   * Create a failed health status
   */
  private createFailedHealthStatus(
    moduleName: string,
    error: Error
  ): ModuleHealthStatus {
    return {
      name: moduleName,
      status: 'critical',
      uptime: process.uptime(),
      lastCheck: new Date(),
      dependencies: [],
      metrics: {
        requestCount: 1,
        errorRate: 1,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      },
      issues: [
        {
          id: `${moduleName}-error-${Date.now()}`,
          severity: 'critical',
          description: `Health check failed: ${error.message}`,
          module: moduleName,
          timestamp: new Date(),
          resolved: false,
          affectedDependencies: [],
        },
      ],
      responseTime: 0,
    };
  }

  /**
   * Detect cascade failures
   */
  private detectCascadeFailures(
    moduleStatuses: ModuleHealthStatus[]
  ): CascadeFailure[] {
    const cascadeFailures: CascadeFailure[] = [];
    const failedModules = moduleStatuses.filter(
      m => m.status === 'critical' || m.status === 'unhealthy'
    );

    for (const failedModule of failedModules) {
      const checker = this.healthCheckers.get(failedModule.name);
      if (!checker) continue;

      // Check if this failure affects other modules
      const affectedModules: string[] = [];
      for (const [moduleName, moduleChecker] of this.healthCheckers) {
        if (
          moduleChecker.dependencies.includes(failedModule.name) ||
          moduleChecker.criticalDependencies.includes(failedModule.name)
        ) {
          affectedModules.push(moduleName);
        }
      }

      if (affectedModules.length > 0) {
        cascadeFailures.push({
          id: `cascade-${failedModule.name}-${Date.now()}`,
          rootCause: failedModule.name,
          affectedModules,
          severity:
            checker.criticalDependencies.length > 0 ? 'critical' : 'high',
          estimatedImpact: `${affectedModules.length} modules potentially affected`,
          detectedAt: new Date(),
        });
      }
    }

    return cascadeFailures;
  }

  /**
   * Generate health recommendations
   */
  private generateHealthRecommendations(
    moduleStatuses: ModuleHealthStatus[]
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    for (const module of moduleStatuses) {
      // Performance recommendations
      if (module.responseTime > 5000) {
        recommendations.push({
          id: `perf-${module.name}-${Date.now()}`,
          type: 'performance',
          priority: 'high',
          description: `${module.name} response time is high (${module.responseTime}ms)`,
          module: module.name,
          actionItems: [
            'Review module performance bottlenecks',
            'Consider caching implementation',
            'Optimize database queries',
          ],
          estimatedEffort: '2-4 hours',
        });
      }

      // Memory recommendations
      if (module.metrics.memoryUsage > 100) {
        recommendations.push({
          id: `memory-${module.name}-${Date.now()}`,
          type: 'performance',
          priority: 'medium',
          description: `${module.name} memory usage is high (${module.metrics.memoryUsage.toFixed(1)}MB)`,
          module: module.name,
          actionItems: [
            'Review memory usage patterns',
            'Implement garbage collection optimization',
            'Check for memory leaks',
          ],
          estimatedEffort: '1-2 hours',
        });
      }

      // Critical issue recommendations
      if (module.status === 'critical') {
        recommendations.push({
          id: `critical-${module.name}-${Date.now()}`,
          type: 'reliability',
          priority: 'urgent',
          description: `${module.name} is in critical state`,
          module: module.name,
          actionItems: [
            'Immediate investigation required',
            'Check logs for error details',
            'Verify all dependencies',
            'Consider emergency restart',
          ],
          estimatedEffort: 'Immediate action required',
        });
      }
    }

    return recommendations;
  }

  /**
   * Calculate system metrics
   */
  private calculateSystemMetrics(moduleStatuses: ModuleHealthStatus[]) {
    const totalModules = moduleStatuses.length;
    const healthyModules = moduleStatuses.filter(
      m => m.status === 'healthy'
    ).length;
    const degradedModules = moduleStatuses.filter(
      m => m.status === 'degraded'
    ).length;
    const unhealthyModules = moduleStatuses.filter(
      m => m.status === 'unhealthy'
    ).length;
    const criticalModules = moduleStatuses.filter(
      m => m.status === 'critical'
    ).length;

    const overallResponseTime =
      moduleStatuses.reduce((sum, m) => sum + m.responseTime, 0) / totalModules;

    return {
      totalModules,
      healthyModules,
      degradedModules,
      unhealthyModules,
      criticalModules,
      systemUptime: process.uptime(),
      overallResponseTime,
    };
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(
    moduleStatuses: ModuleHealthStatus[]
  ): 'healthy' | 'degraded' | 'unhealthy' | 'critical' {
    const criticalCount = moduleStatuses.filter(
      m => m.status === 'critical'
    ).length;
    const unhealthyCount = moduleStatuses.filter(
      m => m.status === 'unhealthy'
    ).length;
    const degradedCount = moduleStatuses.filter(
      m => m.status === 'degraded'
    ).length;

    if (criticalCount > 0) return 'critical';
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Start continuous health monitoring
   */
  private startContinuousMonitoring(): void {
    // Run health checks every 30 seconds
    this.checkInterval = setInterval(async () => {
      try {
        await this.getSystemHealth();
      } catch (error) {
        logger.error(
          '❌ [AdvancedHealthCheck] Continuous monitoring failed',
          'HealthCheck',
          error
        );
      }
    }, 30000);

    logger.info(
      '🔄 [AdvancedHealthCheck] Continuous health monitoring started',
      'HealthCheck'
    );
  }

  /**
   * Stop continuous monitoring
   */
  stopContinuousMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info(
        '⏹️ [AdvancedHealthCheck] Continuous monitoring stopped',
        'HealthCheck'
      );
    }
  }

  /**
   * Get health check diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      registeredCheckers: Array.from(this.healthCheckers.keys()),
      activeIssues: Array.from(this.activeIssues.values()),
      monitoringActive: this.checkInterval !== null,
      totalHistoryEntries: Array.from(this.healthHistory.values()).reduce(
        (sum, history) => sum + history.length,
        0
      ),
    };
  }
}

// Export singleton instance
export const advancedHealthCheck = AdvancedHealthCheck.getInstance();

// Convenience functions
export const initializeAdvancedHealthCheck = () =>
  advancedHealthCheck.initialize();
export const getSystemHealth = () => advancedHealthCheck.getSystemHealth();
export const getModuleHealth = (moduleName: string) =>
  advancedHealthCheck.getModuleHealth(moduleName);
export const registerModuleHealthChecker = (checker: ModuleHealthChecker) =>
  advancedHealthCheck.registerModuleHealthChecker(checker);
