// ============================================
// MODULE LIFECYCLE MANAGER - Modular Architecture v2.0
// ============================================
// Comprehensive module lifecycle management with startup/shutdown hooks,
// health monitoring, dependency validation, and graceful degradation
// Orchestrates module initialization, monitoring, and cleanup

import { logger } from '@shared/utils/logger';
import { FeatureFlags } from './FeatureFlags';

export type ModuleState =
  | 'uninitialized'
  | 'initializing'
  | 'running'
  | 'degraded'
  | 'stopping'
  | 'stopped'
  | 'failed';

export interface ModuleLifecycleHooks {
  onStartup?: () => Promise<void> | void;
  onShutdown?: () => Promise<void> | void;
  onHealthCheck?: () => Promise<boolean> | boolean;
  onDegraded?: () => Promise<void> | void;
  onRecovered?: () => Promise<void> | void;
  onDependencyFailed?: (failedDependency: string) => Promise<void> | void;
}

export interface ModuleDefinition {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  priority?: number; // Lower numbers start first
  healthCheckInterval?: number; // in milliseconds
  maxFailures?: number; // Max failures before marking as failed
  gracefulShutdownTimeout?: number; // in milliseconds
  lifecycle?: ModuleLifecycleHooks;
  featureFlag?: string; // Feature flag that controls this module
}

interface ModuleStatus {
  module: ModuleDefinition;
  state: ModuleState;
  lastHealthCheck?: Date;
  healthCheckCount: number;
  failureCount: number;
  lastFailure?: {
    timestamp: Date;
    error: string;
    context?: any;
  };
  startedAt?: Date;
  stoppedAt?: Date;
  degradedAt?: Date;
  metrics: {
    startupTime?: number;
    shutdownTime?: number;
    healthCheckSuccessRate: number;
    totalHealthChecks: number;
    totalFailures: number;
  };
}

/**
 * Module Lifecycle Manager v2.0
 *
 * Features:
 * - Module dependency resolution and ordering
 * - Startup/shutdown hook orchestration
 * - Continuous health monitoring
 * - Graceful degradation on failures
 * - Performance metrics tracking
 * - Feature flag integration
 * - Service container integration
 */
export class ModuleLifecycleManager {
  private static modules = new Map<string, ModuleDefinition>();
  private static moduleStatus = new Map<string, ModuleStatus>();
  private static healthCheckIntervals = new Map<string, NodeJS.Timeout>();
  private static isShuttingDown = false;
  private static startupOrder: string[] = [];
  private static shutdownOrder: string[] = [];

  // ============================================
  // MODULE REGISTRATION
  // ============================================

  /**
   * Register a module with lifecycle management
   */
  static registerModule(module: ModuleDefinition): void {
    // Validate module definition
    this.validateModuleDefinition(module);

    // Register module
    this.modules.set(module.name, module);

    // Initialize status
    this.moduleStatus.set(module.name, {
      module,
      state: 'uninitialized',
      healthCheckCount: 0,
      failureCount: 0,
      metrics: {
        healthCheckSuccessRate: 100,
        totalHealthChecks: 0,
        totalFailures: 0,
      },
    });

    // Update startup/shutdown order
    this.updateExecutionOrder();

    logger.info(
      `🔄 [ModuleLifecycle] Registered module: ${module.name} v${module.version}`,
      'ModuleLifecycle',
      { module: module.name, dependencies: module.dependencies }
    );
  }

  /**
   * Validate module definition
   */
  private static validateModuleDefinition(module: ModuleDefinition): void {
    if (!module.name) {
      throw new Error('Module name is required');
    }
    if (!module.version) {
      throw new Error('Module version is required');
    }
    if (this.modules.has(module.name)) {
      throw new Error(`Module '${module.name}' is already registered`);
    }

    // Validate dependencies exist
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        if (!this.modules.has(dep) && dep !== module.name) {
          // Allow forward dependencies - they might be registered later
          logger.warn(
            `🔄 [ModuleLifecycle] Dependency '${dep}' for module '${module.name}' not yet registered`,
            'ModuleLifecycle'
          );
        }
      }
    }

    // Check for circular dependencies
    if (module.dependencies) {
      this.validateNoCycles(module.name, module.dependencies);
    }
  }

  /**
   * Validate no circular dependencies
   */
  private static validateNoCycles(
    moduleName: string,
    dependencies: string[],
    visited: Set<string> = new Set()
  ): void {
    if (visited.has(moduleName)) {
      throw new Error(
        `Circular dependency detected involving module '${moduleName}'`
      );
    }

    visited.add(moduleName);

    for (const dep of dependencies) {
      const depModule = this.modules.get(dep);
      if (depModule?.dependencies) {
        this.validateNoCycles(dep, depModule.dependencies, new Set(visited));
      }
    }
  }

  /**
   * Update execution order based on dependencies
   */
  private static updateExecutionOrder(): void {
    const startupOrder: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (moduleName: string) => {
      if (visiting.has(moduleName)) {
        throw new Error(
          `Circular dependency detected involving: ${moduleName}`
        );
      }
      if (visited.has(moduleName)) return;

      visiting.add(moduleName);
      const module = this.modules.get(moduleName);
      if (module?.dependencies) {
        for (const dep of module.dependencies) {
          if (this.modules.has(dep)) {
            visit(dep);
          }
        }
      }
      visiting.delete(moduleName);
      visited.add(moduleName);
      startupOrder.push(moduleName);
    };

    // Sort by priority first, then resolve dependencies
    const modulesByPriority = Array.from(this.modules.entries()).sort(
      ([, a], [, b]) => (a.priority || 100) - (b.priority || 100)
    );

    for (const [moduleName] of modulesByPriority) {
      visit(moduleName);
    }

    this.startupOrder = startupOrder;
    this.shutdownOrder = [...startupOrder].reverse();

    logger.debug(
      '🔄 [ModuleLifecycle] Updated execution order',
      'ModuleLifecycle',
      { startupOrder: this.startupOrder, shutdownOrder: this.shutdownOrder }
    );
  }

  // ============================================
  // LIFECYCLE MANAGEMENT
  // ============================================

  /**
   * Start all modules in dependency order
   */
  static async startAllModules(): Promise<void> {
    logger.info(
      '🚀 [ModuleLifecycle] Starting all modules...',
      'ModuleLifecycle'
    );

    const startTime = Date.now();
    const results = [];

    for (const moduleName of this.startupOrder) {
      try {
        const result = await this.startModule(moduleName);
        results.push({ module: moduleName, success: true, ...result });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          module: moduleName,
          success: false,
          error: errorMessage,
        });

        logger.error(
          `❌ [ModuleLifecycle] Failed to start module: ${moduleName}`,
          'ModuleLifecycle',
          error
        );

        // Check if this is a critical module or if we should continue
        const module = this.modules.get(moduleName);
        if (module && !this.shouldContinueOnFailure(moduleName)) {
          throw new Error(
            `Critical module '${moduleName}' failed to start: ${errorMessage}`
          );
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount === 0) {
      logger.success(
        `🎉 [ModuleLifecycle] All modules started successfully (${totalTime}ms)`,
        'ModuleLifecycle',
        { totalModules: results.length, startupTime: totalTime }
      );
    } else {
      logger.warn(
        `⚠️ [ModuleLifecycle] Module startup completed with failures (${totalTime}ms)`,
        'ModuleLifecycle',
        {
          successCount,
          failureCount,
          totalModules: results.length,
          failures: results.filter(r => !r.success),
        }
      );
    }

    // Start health monitoring for all running modules
    this.startHealthMonitoring();
  }

  /**
   * Start a specific module
   */
  static async startModule(
    moduleName: string
  ): Promise<{ startupTime: number }> {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    const status = this.moduleStatus.get(moduleName)!;

    // Check if module should be enabled via feature flag
    if (module.featureFlag && !FeatureFlags.isEnabled(module.featureFlag)) {
      logger.info(
        `🚩 [ModuleLifecycle] Module '${moduleName}' disabled by feature flag`,
        'ModuleLifecycle',
        { featureFlag: module.featureFlag }
      );
      status.state = 'stopped';
      return { startupTime: 0 };
    }

    // Check dependencies first
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        const depStatus = this.moduleStatus.get(dep);
        if (!depStatus || depStatus.state !== 'running') {
          throw new Error(`Dependency '${dep}' is not running`);
        }
      }
    }

    logger.info(
      `🔄 [ModuleLifecycle] Starting module: ${moduleName}`,
      'ModuleLifecycle',
      { version: module.version, dependencies: module.dependencies }
    );

    const startTime = Date.now();
    status.state = 'initializing';

    try {
      // Execute startup hook
      if (module.lifecycle?.onStartup) {
        await module.lifecycle.onStartup();
      }

      // Register services with ServiceContainer
      await this.registerModuleServices(moduleName);

      const startupTime = Date.now() - startTime;
      status.state = 'running';
      status.startedAt = new Date();
      status.metrics.startupTime = startupTime;

      logger.success(
        `✅ [ModuleLifecycle] Module started: ${moduleName} (${startupTime}ms)`,
        'ModuleLifecycle',
        { startupTime, version: module.version }
      );

      return { startupTime };
    } catch (error) {
      status.state = 'failed';
      status.failureCount++;
      status.lastFailure = {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        context: { phase: 'startup' },
      };
      status.metrics.totalFailures++;

      throw error;
    }
  }

  /**
   * Stop all modules in reverse order
   */
  static async stopAllModules(): Promise<void> {
    logger.info(
      '🛑 [ModuleLifecycle] Stopping all modules...',
      'ModuleLifecycle'
    );

    this.isShuttingDown = true;

    // Stop health monitoring
    this.stopHealthMonitoring();

    const startTime = Date.now();
    const results = [];

    for (const moduleName of this.shutdownOrder) {
      try {
        const result = await this.stopModule(moduleName);
        results.push({ module: moduleName, success: true, ...result });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          module: moduleName,
          success: false,
          error: errorMessage,
        });

        logger.error(
          `❌ [ModuleLifecycle] Failed to stop module: ${moduleName}`,
          'ModuleLifecycle',
          error
        );
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    logger.info(
      `🛑 [ModuleLifecycle] Module shutdown completed (${totalTime}ms)`,
      'ModuleLifecycle',
      {
        successCount,
        failureCount,
        totalModules: results.length,
        shutdownTime: totalTime,
      }
    );
  }

  /**
   * Stop a specific module
   */
  static async stopModule(
    moduleName: string
  ): Promise<{ shutdownTime: number }> {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    const status = this.moduleStatus.get(moduleName)!;

    if (status.state === 'stopped' || status.state === 'uninitialized') {
      return { shutdownTime: 0 };
    }

    logger.info(
      `🔄 [ModuleLifecycle] Stopping module: ${moduleName}`,
      'ModuleLifecycle'
    );

    const startTime = Date.now();
    status.state = 'stopping';

    try {
      // Execute shutdown hook with timeout
      const timeout = module.gracefulShutdownTimeout || 10000; // 10 seconds default

      if (module.lifecycle?.onShutdown) {
        await Promise.race([
          module.lifecycle.onShutdown(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
          ),
        ]);
      }

      const shutdownTime = Date.now() - startTime;
      status.state = 'stopped';
      status.stoppedAt = new Date();
      status.metrics.shutdownTime = shutdownTime;

      logger.success(
        `✅ [ModuleLifecycle] Module stopped: ${moduleName} (${shutdownTime}ms)`,
        'ModuleLifecycle',
        { shutdownTime }
      );

      return { shutdownTime };
    } catch (error) {
      status.state = 'failed';
      status.failureCount++;
      status.lastFailure = {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        context: { phase: 'shutdown' },
      };

      throw error;
    }
  }

  // ============================================
  // HEALTH MONITORING
  // ============================================

  /**
   * Start health monitoring for all modules
   */
  private static startHealthMonitoring(): void {
    for (const [moduleName, module] of this.modules.entries()) {
      const status = this.moduleStatus.get(moduleName)!;

      if (status.state === 'running' && module.lifecycle?.onHealthCheck) {
        const interval = module.healthCheckInterval || 30000; // 30 seconds default

        const healthInterval = setInterval(async () => {
          await this.performHealthCheck(moduleName);
        }, interval);

        this.healthCheckIntervals.set(moduleName, healthInterval);

        logger.debug(
          `❤️ [ModuleLifecycle] Started health monitoring for: ${moduleName}`,
          'ModuleLifecycle',
          { interval }
        );
      }
    }
  }

  /**
   * Stop health monitoring for all modules
   */
  private static stopHealthMonitoring(): void {
    for (const [moduleName, interval] of this.healthCheckIntervals.entries()) {
      clearInterval(interval);
      logger.debug(
        `❤️ [ModuleLifecycle] Stopped health monitoring for: ${moduleName}`,
        'ModuleLifecycle'
      );
    }
    this.healthCheckIntervals.clear();
  }

  /**
   * Perform health check for a specific module
   */
  static async performHealthCheck(moduleName: string): Promise<boolean> {
    const module = this.modules.get(moduleName);
    const status = this.moduleStatus.get(moduleName);

    if (!module || !status || !module.lifecycle?.onHealthCheck) {
      return true; // No health check means healthy
    }

    if (this.isShuttingDown) {
      return true; // Skip health checks during shutdown
    }

    try {
      const isHealthy = await module.lifecycle.onHealthCheck();

      status.lastHealthCheck = new Date();
      status.healthCheckCount++;
      status.metrics.totalHealthChecks++;

      if (isHealthy) {
        // Module is healthy
        if (status.state === 'degraded') {
          // Module recovered from degraded state
          status.state = 'running';
          status.degradedAt = undefined;

          if (module.lifecycle?.onRecovered) {
            await module.lifecycle.onRecovered();
          }

          logger.info(
            `💚 [ModuleLifecycle] Module recovered: ${moduleName}`,
            'ModuleLifecycle'
          );
        }
      } else {
        // Module is unhealthy
        await this.handleUnhealthyModule(moduleName);
      }

      // Update success rate
      status.metrics.healthCheckSuccessRate =
        ((status.metrics.totalHealthChecks - status.failureCount) /
          status.metrics.totalHealthChecks) *
        100;

      return isHealthy;
    } catch (error) {
      logger.error(
        `❌ [ModuleLifecycle] Health check failed for: ${moduleName}`,
        'ModuleLifecycle',
        error
      );

      await this.handleUnhealthyModule(moduleName, error);
      return false;
    }
  }

  /**
   * Handle unhealthy module
   */
  private static async handleUnhealthyModule(
    moduleName: string,
    error?: any
  ): Promise<void> {
    const module = this.modules.get(moduleName)!;
    const status = this.moduleStatus.get(moduleName)!;

    status.failureCount++;
    status.metrics.totalFailures++;
    status.lastFailure = {
      timestamp: new Date(),
      error:
        error instanceof Error
          ? error.message
          : String(error) || 'Health check failed',
      context: { phase: 'health-check' },
    };

    const maxFailures = module.maxFailures || 3;

    if (status.failureCount >= maxFailures) {
      // Mark module as failed
      status.state = 'failed';

      logger.error(
        `💀 [ModuleLifecycle] Module failed after ${status.failureCount} failures: ${moduleName}`,
        'ModuleLifecycle',
        { maxFailures, lastFailure: status.lastFailure }
      );

      // Notify dependent modules
      await this.notifyDependentModules(moduleName);
    } else if (status.state === 'running') {
      // Mark module as degraded
      status.state = 'degraded';
      status.degradedAt = new Date();

      if (module.lifecycle?.onDegraded) {
        await module.lifecycle.onDegraded();
      }

      logger.warn(
        `⚠️ [ModuleLifecycle] Module degraded: ${moduleName} (${status.failureCount}/${maxFailures} failures)`,
        'ModuleLifecycle',
        { failureCount: status.failureCount, maxFailures }
      );
    }
  }

  /**
   * Notify dependent modules when a module fails
   */
  private static async notifyDependentModules(
    failedModuleName: string
  ): Promise<void> {
    for (const [moduleName, module] of this.modules.entries()) {
      if (module.dependencies?.includes(failedModuleName)) {
        logger.warn(
          `⚠️ [ModuleLifecycle] Notifying module '${moduleName}' of dependency failure: ${failedModuleName}`,
          'ModuleLifecycle'
        );

        if (module.lifecycle?.onDependencyFailed) {
          try {
            await module.lifecycle.onDependencyFailed(failedModuleName);
          } catch (error) {
            logger.error(
              `❌ [ModuleLifecycle] Failed to notify module '${moduleName}' of dependency failure`,
              'ModuleLifecycle',
              error
            );
          }
        }
      }
    }
  }

  // ============================================
  // SERVICE INTEGRATION
  // ============================================

  /**
   * Register module services with ServiceContainer
   */
  private static async registerModuleServices(
    moduleName: string
  ): Promise<void> {
    // This is where we could auto-discover and register services for the module
    // For now, we'll just log that services could be registered here
    logger.debug(
      `🔧 [ModuleLifecycle] Registering services for module: ${moduleName}`,
      'ModuleLifecycle'
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if startup should continue when a module fails
   */
  private static shouldContinueOnFailure(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    if (!module) return false;

    // If module has a feature flag, it's optional
    if (module.featureFlag) return true;

    // If module has low priority, it's optional
    if (module.priority && module.priority > 50) return true;

    // Core modules should not continue on failure
    const coreModules = ['tenant-module', 'auth-module'];
    return !coreModules.includes(moduleName);
  }

  // ============================================
  // STATUS AND MONITORING
  // ============================================

  /**
   * Get status of all modules
   */
  static getModulesStatus(): { [moduleName: string]: ModuleStatus } {
    const status = {};
    for (const [name, moduleStatus] of this.moduleStatus.entries()) {
      status[name] = { ...moduleStatus };
    }
    return status;
  }

  /**
   * Get status of a specific module
   */
  static getModuleStatus(moduleName: string): ModuleStatus | undefined {
    return this.moduleStatus.get(moduleName);
  }

  /**
   * Get overall system health
   */
  static getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    totalModules: number;
    runningModules: number;
    degradedModules: number;
    failedModules: number;
    stoppedModules: number;
    details: { [moduleName: string]: { state: ModuleState; health: string } };
  } {
    const moduleStates = Array.from(this.moduleStatus.values());

    const runningModules = moduleStates.filter(
      s => s.state === 'running'
    ).length;
    const degradedModules = moduleStates.filter(
      s => s.state === 'degraded'
    ).length;
    const failedModules = moduleStates.filter(s => s.state === 'failed').length;
    const stoppedModules = moduleStates.filter(
      s => s.state === 'stopped'
    ).length;

    let overallStatus: 'healthy' | 'degraded' | 'critical';
    if (failedModules > 0) {
      overallStatus = 'critical';
    } else if (degradedModules > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const details = {};
    for (const [name, status] of this.moduleStatus.entries()) {
      const healthRate = status.metrics.healthCheckSuccessRate;
      let health = 'excellent';
      if (healthRate < 95) health = 'good';
      if (healthRate < 85) health = 'fair';
      if (healthRate < 70) health = 'poor';

      details[name] = {
        state: status.state,
        health,
      };
    }

    return {
      overallStatus,
      totalModules: moduleStates.length,
      runningModules,
      degradedModules,
      failedModules,
      stoppedModules,
      details,
    };
  }

  /**
   * Get comprehensive diagnostics
   */
  static getDiagnostics(): any {
    const systemHealth = this.getSystemHealth();
    const modulesStatus = this.getModulesStatus();

    return {
      version: '2.0',
      timestamp: new Date().toISOString(),
      systemHealth,
      executionOrder: {
        startup: this.startupOrder,
        shutdown: this.shutdownOrder,
      },
      modules: Object.keys(modulesStatus).map(name => {
        const module = this.modules.get(name)!;
        const status = modulesStatus[name];

        return {
          name,
          version: module.version,
          description: module.description,
          state: status.state,
          dependencies: module.dependencies || [],
          optionalDependencies: module.optionalDependencies || [],
          featureFlag: module.featureFlag,
          metrics: status.metrics,
          lastFailure: status.lastFailure,
          uptime: status.startedAt
            ? Date.now() - status.startedAt.getTime()
            : 0,
        };
      }),
      healthMonitoring: {
        activeIntervals: this.healthCheckIntervals.size,
        isShuttingDown: this.isShuttingDown,
      },
    };
  }

  /**
   * Clear all modules (for testing)
   */
  static clear(): void {
    this.stopHealthMonitoring();
    this.modules.clear();
    this.moduleStatus.clear();
    this.startupOrder = [];
    this.shutdownOrder = [];
    this.isShuttingDown = false;

    logger.debug('🧹 [ModuleLifecycle] Cleared all modules', 'ModuleLifecycle');
  }
}
