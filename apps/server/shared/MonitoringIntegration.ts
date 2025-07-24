// ============================================
// MONITORING INTEGRATION v2.0 - Modular Architecture
// ============================================
// Integration layer connecting Enhanced Logger, Metrics Collector
// with ServiceContainer, FeatureFlags, and ModuleLifecycle systems
// Provides unified monitoring and observability across the entire system

import { EnhancedLogger, type LogContext } from './EnhancedLogger';
import { FeatureFlags } from './FeatureFlags';
import { MetricsCollector } from './MetricsCollector';
import { ModuleLifecycleManager } from './ModuleLifecycleManager';
import { ServiceContainer } from './ServiceContainer';

// ============================================
// INTEGRATION CONFIGURATION
// ============================================

export interface MonitoringConfig {
  enableEnhancedLogging: boolean;
  enableMetricsCollection: boolean;
  enablePerformanceTracing: boolean;
  enableAutoAlerts: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsInterval: number;
  maxLogHistory: number;
  maxMetricsHistory: number;
  alertThresholds: {
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
    moduleFailures: number;
  };
}

const defaultConfig: MonitoringConfig = {
  enableEnhancedLogging: true,
  enableMetricsCollection: true,
  enablePerformanceTracing: true,
  enableAutoAlerts: true,
  logLevel: 'info',
  metricsInterval: 30000,
  maxLogHistory: 10000,
  maxMetricsHistory: 1000,
  alertThresholds: {
    memoryUsage: 500, // MB
    errorRate: 5, // %
    responseTime: 1000, // ms
    moduleFailures: 2, // count
  },
};

// ============================================
// MONITORING INTEGRATION CLASS
// ============================================

/**
 * Unified Monitoring Integration v2.0
 *
 * Features:
 * - Centralized logging and metrics coordination
 * - Module lifecycle event monitoring
 * - Service container health tracking
 * - Feature flag change monitoring
 * - Performance correlation analysis
 * - Automated alerting and notifications
 * - Real-time dashboard data aggregation
 */
export class MonitoringIntegration {
  private static isInitialized = false;
  private static config: MonitoringConfig = defaultConfig;
  private static logger = EnhancedLogger.createModuleLogger(
    'MonitoringIntegration',
    '2.0.0'
  );

  // Integration state
  private static moduleLogger = new Map<
    string,
    ReturnType<typeof EnhancedLogger.createModuleLogger>
  >();
  private static lastSystemSnapshot: any = null;

  // ============================================
  // INITIALIZATION AND CONFIGURATION
  // ============================================

  /**
   * Initialize the monitoring integration system
   */
  static async initialize(
    customConfig: Partial<MonitoringConfig> = {}
  ): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('MonitoringIntegration already initialized');
      return;
    }

    this.config = { ...defaultConfig, ...customConfig };

    this.logger.info('🔧 MonitoringIntegration v2.0 initializing...', {
      config: this.config,
    });

    try {
      // ✅ SAFETY CHECK: Verify dependencies are available
      if (!this.checkDependencies()) {
        throw new Error('Required dependencies not available');
      }

      // Initialize Enhanced Logger if enabled
      if (this.config.enableEnhancedLogging) {
        this.logger.info('🔍 Initializing Enhanced Logging system...');
        // EnhancedLogger is static, no explicit initialization needed
      }

      // Initialize Metrics Collector if enabled
      if (this.config.enableMetricsCollection) {
        this.logger.info('📊 Initializing Metrics Collection system...');
        MetricsCollector.initialize({
          collectInterval: this.config.metricsInterval,
          maxHistory: this.config.maxMetricsHistory,
          autoStart: true,
        });
      }

      // Set up integrations (with safety checks)
      await this.setupServiceContainerIntegration();
      await this.setupFeatureFlagsIntegration();
      await this.setupModuleLifecycleIntegration();

      // Start monitoring tasks
      this.startMonitoringTasks();

      this.isInitialized = true;
      this.logger.success(
        '✅ MonitoringIntegration v2.0 initialized successfully'
      );

      // Log initial system snapshot
      await this.logSystemSnapshot();
    } catch (error) {
      this.logger.error('❌ Failed to initialize MonitoringIntegration', error);

      // ✅ PRODUCTION SAFETY: Don't crash in production, use graceful degradation
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn(
          '🔄 Running in degraded mode without full monitoring capabilities'
        );
        this.isInitialized = true; // Mark as initialized to prevent retries
        return;
      }

      throw error;
    }
  }

  /**
   * Update monitoring configuration
   */
  static updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('⚙️ Monitoring configuration updated', { updates });
  }

  // ============================================
  // SERVICE CONTAINER INTEGRATION
  // ============================================

  /**
   * Set up ServiceContainer monitoring integration
   */
  private static async setupServiceContainerIntegration(): Promise<void> {
    this.logger.info('🔧 Setting up ServiceContainer integration...');

    try {
      // Monitor service registrations and instantiations
      const originalRegister = ServiceContainer.register;
      ServiceContainer.register = function (
        name: string,
        serviceClass: any,
        options: any = {}
      ) {
        const result = originalRegister.call(this, name, serviceClass, options);

        MonitoringIntegration.logger.audit('Service registered', {
          serviceName: name,
          module: options.module,
          singleton: options.singleton,
        });

        // Register metrics tracking for the service
        if (options.module) {
          MetricsCollector.registerModule(`service:${name}`, {
            name: `service:${name}`,
            state: 'running',
            customMetrics: { registeredAt: Date.now() },
          });
        }

        return result;
      };

      // Monitor service retrievals
      const originalGet = ServiceContainer.get;
      ServiceContainer.get = async function <T>(name: string): Promise<T> {
        const startTime = performance.now();

        try {
          const result = (await originalGet.call(this, name)) as T;
          const duration = performance.now() - startTime;

          MonitoringIntegration.logger.debug(`Service retrieved: ${name}`, {
            duration: `${duration.toFixed(2)}ms`,
          });

          MetricsCollector.recordModuleRequest(`service:${name}`, duration);
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;

          MonitoringIntegration.logger.error(
            `Service retrieval failed: ${name}`,
            error,
            {
              duration: `${duration.toFixed(2)}ms`,
            }
          );

          MetricsCollector.recordModuleError(`service:${name}`);
          throw error;
        }
      };

      this.logger.success('✅ ServiceContainer integration configured');
    } catch (error) {
      this.logger.error(
        '❌ Failed to setup ServiceContainer integration',
        error
      );
      throw error;
    }
  }

  // ============================================
  // FEATURE FLAGS INTEGRATION
  // ============================================

  /**
   * Set up FeatureFlags monitoring integration
   */
  private static async setupFeatureFlagsIntegration(): Promise<void> {
    this.logger.info('🚩 Setting up FeatureFlags integration...');

    try {
      // Monitor flag changes
      const flags = FeatureFlags.getAllFlags();
      for (const flag of flags) {
        FeatureFlags.addListener(flag.name, updatedFlag => {
          this.logger.audit(`Feature flag changed: ${updatedFlag.name}`, {
            flagName: updatedFlag.name,
            enabled: updatedFlag.enabled,
            module: updatedFlag.module,
            version: updatedFlag.version,
          });

          // Update metrics
          MetricsCollector.setGauge(
            `flag_${updatedFlag.name}_enabled`,
            updatedFlag.enabled ? 1 : 0
          );
          MetricsCollector.incrementCounter('flag_changes_total');
        });
      }

      // Monitor A/B test evaluations
      const originalEvaluateABTest = FeatureFlags.evaluateABTest;
      FeatureFlags.evaluateABTest = function (
        testName: string,
        userId: string
      ) {
        const result = originalEvaluateABTest.call(this, testName, userId);

        if (result) {
          MonitoringIntegration.logger.debug(
            `A/B test evaluated: ${testName}`,
            {
              testName,
              userId,
              variant: result,
            }
          );

          MetricsCollector.incrementCounter(`abtest_${testName}_${result}`);
        }

        return result;
      };

      this.logger.success('✅ FeatureFlags integration configured');
    } catch (error) {
      this.logger.error('❌ Failed to setup FeatureFlags integration', error);
      throw error;
    }
  }

  // ============================================
  // MODULE LIFECYCLE INTEGRATION
  // ============================================

  /**
   * Set up ModuleLifecycle monitoring integration
   */
  private static async setupModuleLifecycleIntegration(): Promise<void> {
    this.logger.info('🔄 Setting up ModuleLifecycle integration...');

    try {
      // Monitor module state changes by periodically checking status
      setInterval(() => {
        this.monitorModuleStates();
      }, 10000); // Check every 10 seconds

      this.logger.success('✅ ModuleLifecycle integration configured');
    } catch (error) {
      this.logger.error(
        '❌ Failed to setup ModuleLifecycle integration',
        error
      );
      throw error;
    }
  }

  /**
   * Monitor module states and update metrics
   */
  private static monitorModuleStates(): void {
    try {
      const systemHealth = ModuleLifecycleManager.getSystemHealth();
      const modulesStatus = ModuleLifecycleManager.getModulesStatus();

      // Update system-level metrics
      MetricsCollector.setGauge('modules_total', systemHealth.totalModules);
      MetricsCollector.setGauge('modules_running', systemHealth.runningModules);
      MetricsCollector.setGauge(
        'modules_degraded',
        systemHealth.degradedModules
      );
      MetricsCollector.setGauge('modules_failed', systemHealth.failedModules);
      MetricsCollector.setGauge('modules_stopped', systemHealth.stoppedModules);

      // Update individual module metrics
      for (const [moduleName, status] of Object.entries(modulesStatus)) {
        MetricsCollector.updateModuleMetrics(moduleName, {
          state: status.state as any,
          uptime: status.startedAt
            ? Date.now() - status.startedAt.getTime()
            : 0,
          errorCount: status.failureCount,
          lastHealthCheck: status.lastHealthCheck || new Date(),
          customMetrics: {
            healthCheckCount: status.healthCheckCount,
            healthCheckSuccessRate: status.metrics?.healthCheckSuccessRate || 0,
            totalFailures: status.metrics?.totalFailures || 0,
          },
        });

        // Log state changes
        if (status.state === 'failed' || status.state === 'degraded') {
          this.logger.warn(`Module ${moduleName} is in ${status.state} state`, {
            module: moduleName,
            state: status.state,
            failureCount: status.failureCount,
            lastFailure: status.lastFailure,
          });
        }
      }

      // Log overall system health if degraded or critical
      if (systemHealth.overallStatus !== 'healthy') {
        this.logger.warn(`System health is ${systemHealth.overallStatus}`, {
          overallStatus: systemHealth.overallStatus,
          details: systemHealth.details,
        });
      }
    } catch (error) {
      this.logger.error('❌ Failed to monitor module states', error);
    }
  }

  // ============================================
  // MONITORING TASKS
  // ============================================

  /**
   * Start continuous monitoring tasks
   */
  private static startMonitoringTasks(): void {
    this.logger.info('🚀 Starting monitoring tasks...');

    // System snapshot every minute
    setInterval(() => {
      this.logSystemSnapshot();
    }, 60000);

    // Performance correlation analysis every 5 minutes
    setInterval(() => {
      this.performCorrelationAnalysis();
    }, 300000);

    // Health summary every 30 seconds
    setInterval(() => {
      this.updateHealthSummary();
    }, 30000);

    this.logger.success('✅ Monitoring tasks started');
  }

  /**
   * Log comprehensive system snapshot
   */
  private static async logSystemSnapshot(): Promise<void> {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        system: {
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          platform: process.platform,
          nodeVersion: process.version,
        },
        services: ServiceContainer.getHealthStatus(),
        features: FeatureFlags.getStatus(),
        modules: ModuleLifecycleManager.getSystemHealth(),
        metrics: MetricsCollector.getHealthSummary(),
        logs: EnhancedLogger.getHealthStatus(),
      };

      this.logger.info('📸 System snapshot captured', {
        memoryUsage: `${Math.round(snapshot.system.memory.heapUsed / 1024 / 1024)}MB`,
        totalServices: snapshot.services.instantiatedServices,
        totalFlags: snapshot.features.summary?.totalFlags,
        runningModules: snapshot.modules.runningModules,
        logCount: snapshot.logs.logsCount,
      });

      this.lastSystemSnapshot = snapshot;
    } catch (error) {
      this.logger.error('❌ Failed to capture system snapshot', error);
    }
  }

  /**
   * Perform performance correlation analysis
   */
  private static performCorrelationAnalysis(): void {
    try {
      const current = MetricsCollector.getCurrentMetrics();
      if (!current) return;

      const analysis = {
        memoryTrend: this.analyzeMemoryTrend(),
        responseTrend: this.analyzeResponseTimeTrend(),
        errorCorrelation: this.analyzeErrorCorrelation(),
        modulePerformance: this.analyzeModulePerformance(),
      };

      this.logger.info(
        '🔬 Performance correlation analysis completed',
        analysis
      );

      // Store analysis results as metrics
      MetricsCollector.setGauge(
        'analysis_memory_trend',
        analysis.memoryTrend.direction
      );
      MetricsCollector.setGauge(
        'analysis_response_trend',
        analysis.responseTrend.direction
      );
      MetricsCollector.setGauge(
        'analysis_error_correlation',
        analysis.errorCorrelation.strength
      );
    } catch (error) {
      this.logger.error('❌ Performance correlation analysis failed', error);
    }
  }

  /**
   * Update health summary metrics
   */
  private static updateHealthSummary(): void {
    try {
      const health = MetricsCollector.getHealthSummary();

      // Convert health statuses to numeric values for metrics
      const healthToNumber = (status: string) => {
        switch (status) {
          case 'healthy':
            return 2;
          case 'warning':
          case 'degraded':
            return 1;
          case 'critical':
            return 0;
          default:
            return -1;
        }
      };

      MetricsCollector.setGauge(
        'health_overall',
        healthToNumber(health.overall)
      );
      MetricsCollector.setGauge(
        'health_memory',
        healthToNumber(health.components.memory)
      );
      MetricsCollector.setGauge(
        'health_response_time',
        healthToNumber(health.components.responseTime)
      );
      MetricsCollector.setGauge(
        'health_error_rate',
        healthToNumber(health.components.errorRate)
      );
      MetricsCollector.setGauge(
        'health_modules',
        healthToNumber(health.components.modules)
      );
      MetricsCollector.setGauge('health_recent_alerts', health.recentAlerts);
    } catch (error) {
      this.logger.error('❌ Failed to update health summary', error);
    }
  }

  // ============================================
  // ANALYSIS HELPERS
  // ============================================

  /**
   * Analyze memory usage trend
   */
  private static analyzeMemoryTrend(): { direction: number; rate: number } {
    const history = MetricsCollector.getMetricsHistory(10);
    if (history.length < 2) return { direction: 0, rate: 0 };

    const memoryValues = history.map(m => m.system.memoryUsage.heapUsed);
    const first = memoryValues[0];
    const last = memoryValues[memoryValues.length - 1];

    const direction = last > first ? 1 : last < first ? -1 : 0;
    const rate = Math.abs((last - first) / first);

    return { direction, rate };
  }

  /**
   * Analyze response time trend
   */
  private static analyzeResponseTimeTrend(): {
    direction: number;
    rate: number;
  } {
    const history = MetricsCollector.getMetricsHistory(10);
    if (history.length < 2) return { direction: 0, rate: 0 };

    const responseValues = history.map(m => m.application.responseTime.average);
    const first = responseValues[0];
    const last = responseValues[responseValues.length - 1];

    const direction = last > first ? 1 : last < first ? -1 : 0;
    const rate = first > 0 ? Math.abs((last - first) / first) : 0;

    return { direction, rate };
  }

  /**
   * Analyze error correlation
   */
  private static analyzeErrorCorrelation(): {
    strength: number;
    factors: string[];
  } {
    const history = MetricsCollector.getMetricsHistory(5);
    if (history.length < 2) return { strength: 0, factors: [] };

    const factors = [];
    let correlationStrength = 0;

    // Check correlation between errors and memory usage
    const errorRates = history.map(m => m.application.errorRate);
    const memoryUsage = history.map(m => m.system.memoryUsage.heapUsed);

    // Simple correlation check (if errors increase with memory)
    if (this.hasPositiveCorrelation(errorRates, memoryUsage)) {
      factors.push('memory_usage');
      correlationStrength += 0.3;
    }

    return { strength: correlationStrength, factors };
  }

  /**
   * Analyze module performance
   */
  private static analyzeModulePerformance(): {
    slow: string[];
    errors: string[];
    healthy: string[];
  } {
    const modulesStatus = ModuleLifecycleManager.getModulesStatus();

    const slow = [];
    const errors = [];
    const healthy = [];

    for (const [name, status] of Object.entries(modulesStatus)) {
      if (status.state === 'failed') {
        errors.push(name);
      } else if (status.state === 'degraded') {
        slow.push(name);
      } else if (status.state === 'running') {
        healthy.push(name);
      }
    }

    return { slow, errors, healthy };
  }

  /**
   * Check if two arrays have positive correlation
   */
  private static hasPositiveCorrelation(
    arr1: number[],
    arr2: number[]
  ): boolean {
    if (arr1.length !== arr2.length || arr1.length < 2) return false;

    let increasingTogether = 0;
    let total = 0;

    for (let i = 1; i < arr1.length; i++) {
      const arr1Increase = arr1[i] > arr1[i - 1];
      const arr2Increase = arr2[i] > arr2[i - 1];

      if (arr1Increase === arr2Increase) {
        increasingTogether++;
      }
      total++;
    }

    return increasingTogether / total > 0.7; // 70% correlation threshold
  }

  // ============================================
  // PUBLIC API METHODS
  // ============================================

  /**
   * Get comprehensive monitoring status
   */
  static getMonitoringStatus(): {
    initialized: boolean;
    config: MonitoringConfig;
    systemSnapshot: any;
    health: any;
    metrics: any;
    alerts: any;
  } {
    return {
      initialized: this.isInitialized,
      config: this.config,
      systemSnapshot: this.lastSystemSnapshot,
      health: MetricsCollector.getHealthSummary(),
      metrics: MetricsCollector.getStatus(),
      alerts: MetricsCollector.getRecentAlerts(10),
    };
  }

  /**
   * Get module-specific logger
   */
  static getModuleLogger(moduleName: string, version: string = '1.0.0') {
    const key = `${moduleName}:${version}`;

    if (!this.moduleLogger.has(key)) {
      const logger = EnhancedLogger.createModuleLogger(moduleName, version);
      this.moduleLogger.set(key, logger);
    }

    return this.moduleLogger.get(key)!;
  }

  /**
   * Record a performance operation
   */
  static recordPerformanceOperation(
    operationName: string,
    duration: number,
    metadata: LogContext = {}
  ): void {
    this.logger.info(`⚡ Performance: ${operationName}`, {
      ...metadata,
      operation: operationName,
      duration: `${duration.toFixed(2)}ms`,
    });

    MetricsCollector.recordHistogram(
      `operation_${operationName}_duration`,
      duration
    );
    MetricsCollector.incrementCounter(`operation_${operationName}_total`);

    if (duration > 1000) {
      MetricsCollector.incrementCounter(`operation_${operationName}_slow`);
    }
  }

  /**
   * Trigger manual system health check
   */
  static async performHealthCheck(): Promise<any> {
    this.logger.info('🔍 Performing manual health check...');

    const results = {
      timestamp: new Date().toISOString(),
      services: ServiceContainer.getHealthStatus(),
      features: FeatureFlags.getStatus(),
      modules: ModuleLifecycleManager.getSystemHealth(),
      metrics: MetricsCollector.getHealthSummary(),
      logs: EnhancedLogger.getHealthStatus(),
    };

    this.logger.success('✅ Health check completed', {
      servicesHealthy: results.services.instantiatedServices > 0,
      modulesHealthy: results.modules.overallStatus === 'healthy',
      metricsHealthy: results.metrics.overall === 'healthy',
      logsHealthy: results.logs.status === 'healthy',
    });

    return results;
  }

  /**
   * Generate comprehensive system report
   */
  static generateSystemReport(): any {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportVersion: '2.0.0',
        systemUptime: process.uptime(),
      },
      configuration: this.config,
      health: this.performHealthCheck(),
      logs: {
        recent: EnhancedLogger.getLogs({ limit: 100 }),
        errors: EnhancedLogger.getRecentErrors(50),
        api: EnhancedLogger.getApiLogs(50),
        audit: EnhancedLogger.getAuditLogs(50),
      },
      metrics: {
        current: MetricsCollector.getCurrentMetrics(),
        history: MetricsCollector.getMetricsHistory(50),
        alerts: MetricsCollector.getRecentAlerts(20),
      },
      performance: {
        traces: [], // TODO: Add performance traces
        correlations: this.performCorrelationAnalysis(),
      },
    };
  }

  /**
   * ✅ NEW: Check if required dependencies are available
   */
  private static checkDependencies(): boolean {
    try {
      // Check if core classes are available
      if (typeof EnhancedLogger === 'undefined') {
        console.warn('⚠️ EnhancedLogger not available');
        return false;
      }

      if (typeof MetricsCollector === 'undefined') {
        console.warn('⚠️ MetricsCollector not available');
        return false;
      }

      if (typeof ServiceContainer === 'undefined') {
        console.warn('⚠️ ServiceContainer not available');
        return false;
      }

      if (typeof FeatureFlags === 'undefined') {
        console.warn('⚠️ FeatureFlags not available');
        return false;
      }

      if (typeof ModuleLifecycleManager === 'undefined') {
        console.warn('⚠️ ModuleLifecycleManager not available');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Dependency check failed:', error);
      return false;
    }
  }
}
