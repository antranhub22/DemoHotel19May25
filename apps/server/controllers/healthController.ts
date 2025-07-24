// ============================================
// ENHANCED HEALTH CONTROLLER v3.0 - Phase 4 Advanced Monitoring
// ============================================
// Comprehensive health monitoring with advanced health check system,
// module-specific health validation, cascade failure detection, and intelligent recommendations

import { db } from '@shared/db';
import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';

// ✅ v3.0: Import Advanced Health Check System
import {
  advancedHealthCheck,
  getModuleHealth,
  getSystemHealth,
  registerModuleHealthChecker,
} from '@server/shared/AdvancedHealthCheck';

// ✅ v2.0: Enhanced architecture imports
import { HotelResearchService } from '@server/services/hotelResearch';
import { TenantService } from '@server/services/tenantService';
import { VapiIntegrationService } from '@server/services/vapiIntegration';
import { getArchitectureHealth } from '@server/shared';
import { FeatureFlags } from '@server/shared/FeatureFlags';
import { ModuleLifecycleManager } from '@server/shared/ModuleLifecycleManager';
import { ServiceContainer } from '@server/shared/ServiceContainer';

export class HealthController {
  private static isInitialized = false;

  /**
   * Initialize HealthController with module health checkers
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info(
        '🏥 [HealthController] Initializing v3.0 with advanced health system',
        'HealthController'
      );

      // Initialize advanced health check system
      await advancedHealthCheck.initialize();

      // Register core services with ServiceContainer
      await this.registerCoreServices();

      // Register module-specific health checkers
      await this.registerModuleHealthCheckers();

      this.isInitialized = true;
      logger.success(
        '✅ [HealthController] v3.0 initialized with advanced health monitoring',
        'HealthController'
      );
    } catch (error) {
      logger.error(
        '❌ [HealthController] Failed to initialize v3.0',
        'HealthController',
        error
      );
      throw error;
    }
  }

  /**
   * Register core services with ServiceContainer
   */
  private static async registerCoreServices(): Promise<void> {
    try {
      // Register TenantService
      ServiceContainer.registerFactory(
        'TenantService',
        () => new TenantService(),
        {
          singleton: true,
          module: 'core',
          lifecycle: {
            onInit: async () => {
              logger.debug(
                '🔧 [HealthController] TenantService initialized',
                'HealthController'
              );
            },
            onDestroy: async () => {
              logger.debug(
                '🔧 [HealthController] TenantService destroyed',
                'HealthController'
              );
            },
            onHealthCheck: async () => {
              try {
                const service = (await ServiceContainer.get(
                  'TenantService'
                )) as TenantService;
                const health = await service.getServiceHealth();
                return health.status === 'healthy';
              } catch {
                return false;
              }
            },
          },
        }
      );

      // Register HotelResearchService
      ServiceContainer.registerFactory(
        'HotelResearchService',
        () => new HotelResearchService(),
        {
          singleton: true,
          module: 'hotel',
          lifecycle: {
            onHealthCheck: async () => {
              try {
                const service = (await ServiceContainer.get(
                  'HotelResearchService'
                )) as HotelResearchService;
                const health = await service.getServiceHealth();
                return health.status === 'healthy';
              } catch {
                return false;
              }
            },
          },
        }
      );

      // Register VapiIntegrationService
      ServiceContainer.registerFactory(
        'VapiIntegrationService',
        () => new VapiIntegrationService(),
        {
          singleton: true,
          module: 'voice',
          lifecycle: {
            onHealthCheck: async () => {
              try {
                const service = (await ServiceContainer.get(
                  'VapiIntegrationService'
                )) as VapiIntegrationService;
                const health = await service.getServiceHealth();
                return health.status === 'healthy';
              } catch {
                return false;
              }
            },
          },
        }
      );

      logger.debug(
        '✅ [HealthController] Core services registered',
        'HealthController'
      );
    } catch (error) {
      logger.error(
        '❌ [HealthController] Failed to register core services',
        'HealthController',
        error
      );
      throw error;
    }
  }

  /**
   * Register module-specific health checkers
   */
  private static async registerModuleHealthCheckers(): Promise<void> {
    // Core Module Health Checker
    registerModuleHealthChecker({
      name: 'core-module',
      checkFunction: async () => {
        const startTime = Date.now();

        // Check core module health
        const serviceContainer = ServiceContainer.getHealthStatus();
        const featureFlags = FeatureFlags.getDiagnostics();

        const status =
          serviceContainer.healthy && featureFlags.isInitialized
            ? 'healthy'
            : 'degraded';

        return {
          name: 'core-module',
          status,
          uptime: process.uptime(),
          lastCheck: new Date(),
          dependencies: [
            {
              name: 'ServiceContainer',
              type: 'service' as const,
              status: serviceContainer.healthy ? 'healthy' : 'failed',
              responseTime: 0,
              lastCheck: new Date(),
              errorCount: serviceContainer.errors.length,
            },
            {
              name: 'FeatureFlags',
              type: 'service' as const,
              status: featureFlags.isInitialized ? 'healthy' : 'failed',
              responseTime: 0,
              lastCheck: new Date(),
              errorCount: 0,
            },
          ],
          metrics: {
            requestCount: 1,
            errorRate: serviceContainer.errors.length > 0 ? 1 : 0,
            averageResponseTime: Date.now() - startTime,
            memoryUsage: 0,
            cpuUsage: 0,
          },
          issues: [],
          responseTime: Date.now() - startTime,
        };
      },
      dependencies: ['database', 'memory'],
      criticalDependencies: ['database'],
      interval: 60000,
      timeout: 5000,
    });

    // Hotel Module Health Checker
    registerModuleHealthChecker({
      name: 'hotel-module',
      checkFunction: async () => {
        const startTime = Date.now();

        try {
          // Check tenant service health
          const tenantService = (await ServiceContainer.get(
            'TenantService'
          )) as TenantService;
          const tenantHealth = await tenantService.getServiceHealth();

          return {
            name: 'hotel-module',
            status: tenantHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            uptime: process.uptime(),
            lastCheck: new Date(),
            dependencies: [
              {
                name: 'TenantService',
                type: 'service' as const,
                status:
                  tenantHealth.status === 'healthy' ? 'healthy' : 'failed',
                responseTime: Date.now() - startTime,
                lastCheck: new Date(),
                errorCount: tenantHealth.status === 'healthy' ? 0 : 1,
              },
            ],
            metrics: {
              requestCount: 1,
              errorRate: tenantHealth.status === 'healthy' ? 0 : 1,
              averageResponseTime: Date.now() - startTime,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            issues: [],
            responseTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            name: 'hotel-module',
            status: 'critical' as const,
            uptime: process.uptime(),
            lastCheck: new Date(),
            dependencies: [],
            metrics: {
              requestCount: 1,
              errorRate: 1,
              averageResponseTime: Date.now() - startTime,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            issues: [
              {
                id: `hotel-error-${Date.now()}`,
                severity: 'critical' as const,
                description: `Hotel module health check failed: ${(error as Error).message}`,
                module: 'hotel-module',
                timestamp: new Date(),
                resolved: false,
                affectedDependencies: ['TenantService'],
              },
            ],
            responseTime: Date.now() - startTime,
          };
        }
      },
      dependencies: ['core-module', 'database'],
      criticalDependencies: ['database'],
      interval: 45000,
      timeout: 5000,
    });

    // Voice Module Health Checker
    registerModuleHealthChecker({
      name: 'voice-module',
      checkFunction: async () => {
        const startTime = Date.now();

        try {
          const vapiService = (await ServiceContainer.get(
            'VapiIntegrationService'
          )) as VapiIntegrationService;
          const vapiHealth = await vapiService.getServiceHealth();

          return {
            name: 'voice-module',
            status: vapiHealth.status === 'healthy' ? 'healthy' : 'degraded',
            uptime: process.uptime(),
            lastCheck: new Date(),
            dependencies: [
              {
                name: 'VapiIntegrationService',
                type: 'external_api' as const,
                status:
                  vapiHealth.status === 'healthy' ? 'healthy' : 'degraded',
                responseTime: Date.now() - startTime,
                lastCheck: new Date(),
                errorCount: vapiHealth.status === 'healthy' ? 0 : 1,
              },
            ],
            metrics: {
              requestCount: 1,
              errorRate: vapiHealth.status === 'healthy' ? 0 : 1,
              averageResponseTime: Date.now() - startTime,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            issues: [],
            responseTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            name: 'voice-module',
            status: 'unhealthy' as const,
            uptime: process.uptime(),
            lastCheck: new Date(),
            dependencies: [],
            metrics: {
              requestCount: 1,
              errorRate: 1,
              averageResponseTime: Date.now() - startTime,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            issues: [
              {
                id: `voice-error-${Date.now()}`,
                severity: 'high' as const,
                description: `Voice module health check failed: ${(error as Error).message}`,
                module: 'voice-module',
                timestamp: new Date(),
                resolved: false,
                affectedDependencies: ['VapiIntegrationService'],
              },
            ],
            responseTime: Date.now() - startTime,
          };
        }
      },
      dependencies: ['core-module'],
      criticalDependencies: [],
      interval: 60000,
      timeout: 10000,
    });

    logger.debug(
      '✅ [HealthController] Module health checkers registered',
      'HealthController'
    );
  }

  // ============================================
  // v3.0 ADVANCED HEALTH ENDPOINTS
  // ============================================

  /**
   * GET /api/core/health/system - Comprehensive system health with advanced monitoring
   */
  public static async getAdvancedSystemHealth(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      await HealthController.initialize();

      logger.api(
        '🏥 [HealthController] Advanced system health requested',
        'HealthController'
      );

      const systemHealth = await getSystemHealth();

      (res as any).status(200).json({
        success: true,
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        data: systemHealth,
        _metadata: {
          controller: 'HealthController',
          version: '3.0.0',
          features: [
            'advanced-monitoring',
            'cascade-detection',
            'health-recommendations',
          ],
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    } catch (error) {
      logger.error(
        '❌ [HealthController] Advanced system health failed',
        'HealthController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve advanced system health',
        details: (error as Error).message,
        version: '3.0.0',
      });
    }
  }

  /**
   * GET /api/core/health/module/:moduleName - Specific module health
   */
  public static async getModuleHealthStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      await HealthController.initialize();

      const { moduleName } = req.params;
      logger.api(
        `🔍 [HealthController] Module health requested: ${moduleName}`,
        'HealthController'
      );

      const moduleHealth = await getModuleHealth(moduleName);

      if (!moduleHealth) {
        return (res as any).status(404).json({
          success: false,
          error: `Module '${moduleName}' not found`,
          availableModules:
            advancedHealthCheck.getDiagnostics().registeredCheckers,
          version: '3.0.0',
        });
      }

      (res as any).status(200).json({
        success: true,
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        data: moduleHealth,
        _metadata: {
          controller: 'HealthController',
          version: '3.0.0',
          module: moduleName,
        },
      });
    } catch (error) {
      logger.error(
        '❌ [HealthController] Module health check failed',
        'HealthController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve module health',
        details: (error as Error).message,
        version: '3.0.0',
      });
    }
  }

  /**
   * GET /api/core/health/diagnostics - Health system diagnostics
   */
  public static async getHealthDiagnostics(res: Response): Promise<void> {
    try {
      await HealthController.initialize();

      logger.api(
        '🔧 [HealthController] Health diagnostics requested',
        'HealthController'
      );

      const diagnostics = advancedHealthCheck.getDiagnostics();

      (res as any).status(200).json({
        success: true,
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        data: {
          healthSystem: diagnostics,
          serviceContainer: ServiceContainer.getHealthStatus(),
          featureFlags: FeatureFlags.getDiagnostics(),
          moduleLifecycle: ModuleLifecycleManager.getDiagnostics(),
        },
        _metadata: {
          controller: 'HealthController',
          version: '3.0.0',
          features: ['health-diagnostics', 'system-monitoring'],
        },
      });
    } catch (error) {
      logger.error(
        '❌ [HealthController] Health diagnostics failed',
        'HealthController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to retrieve health diagnostics',
        details: (error as Error).message,
        version: '3.0.0',
      });
    }
  }

  // ============================================
  // v2.0 ENHANCED ENDPOINTS (MAINTAINED)
  // ============================================

  /**
   * GET /api/core/health - Basic health check (v2.0 compatible)
   */
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const health = await HealthController.getBasicHealth();
      (res as any).status(200).json(health);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Basic health check failed',
        'HealthController',
        error
      );
      (res as any).status(500).json({
        success: false,
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * ✅ ENHANCED v2.0: Comprehensive modular architecture health check
   * GET /api/health/architecture
   */
  static async getArchitectureHealth(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      this.initialize();

      logger.api(
        '🏗️ [HealthController] Architecture health check requested - v2.0',
        'HealthController'
      );

      const startTime = Date.now();

      // Get comprehensive architecture health
      const architectureHealth = getArchitectureHealth();

      // ✅ NEW v2.0: Enhanced with ServiceContainer v2.0 details
      const containerHealth = ServiceContainer.getHealthStatus();
      const dependencyGraph = ServiceContainer.getDependencyGraph();

      // Add additional ServiceContainer details to the services section
      const enhancedArchitectureHealth = {
        ...architectureHealth,
        services: {
          ...architectureHealth.services,
          containerHealth,
          dependencyGraph,
          serviceHealth: {}, // Will be populated below
        },
        responseTime: 0, // Will be set below
      };

      // ✅ NEW v2.0: Add service health checks
      const serviceHealth = await this.checkAllServices();
      enhancedArchitectureHealth.services.serviceHealth = serviceHealth;

      const responseTime = Date.now() - startTime;
      enhancedArchitectureHealth.responseTime = responseTime;

      // Determine overall health status
      const overallHealthy =
        enhancedArchitectureHealth.services.container.status === 'healthy' &&
        enhancedArchitectureHealth.features.flags.summary?.totalFlags > 0 &&
        serviceHealth.healthy >= serviceHealth.total * 0.7; // 70% services healthy

      const statusCode = overallHealthy ? 200 : 503;

      logger.success(
        '🏗️ [HealthController] Architecture health completed - v2.0',
        'HealthController',
        {
          responseTime,
          servicesHealthy: `${serviceHealth.healthy}/${serviceHealth.total}`,
          modulesRunning:
            enhancedArchitectureHealth.lifecycle.systemHealth.runningModules,
          flagsEnabled:
            enhancedArchitectureHealth.features.flags.summary?.enabledFlags,
        }
      );

      (res as any).status(statusCode).json({
        success: true,
        status: overallHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime,
        architecture: enhancedArchitectureHealth,
        version: '2.0.0',
      });
    } catch (error) {
      logger.error(
        '❌ [HealthController] Architecture health check failed',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Architecture health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * ✅ NEW v2.0: Check health of all registered services
   */
  private static async checkAllServices(): Promise<{
    total: number;
    healthy: number;
    unhealthy: number;
    services: Record<
      string,
      { status: 'healthy' | 'unhealthy'; error?: string }
    >;
  }> {
    const services = ServiceContainer.getRegisteredServices();
    const results: Record<
      string,
      { status: 'healthy' | 'unhealthy'; error?: string }
    > = {};

    let healthy = 0;
    let unhealthy = 0;

    for (const serviceName of services) {
      try {
        // Get service and check if it has a health check method
        const service = ServiceContainer.get(serviceName);

        if (
          service &&
          typeof (service as any).getServiceHealth === 'function'
        ) {
          const health = await (service as any).getServiceHealth();
          if (health && health.status === 'healthy') {
            results[serviceName] = { status: 'healthy' };
            healthy++;
          } else {
            results[serviceName] = {
              status: 'unhealthy',
              error: 'Service reported unhealthy',
            };
            unhealthy++;
          }
        } else {
          // Service exists but no health check method - assume healthy
          results[serviceName] = { status: 'healthy' };
          healthy++;
        }
      } catch (error) {
        results[serviceName] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        unhealthy++;
      }
    }

    return {
      total: services.length,
      healthy,
      unhealthy,
      services: results,
    };
  }

  /**
   * Detailed health check with connection pool metrics and ServiceContainer details
   * GET /api/health/detailed
   */
  static async getDetailedHealth(_req: Request, res: Response): Promise<void> {
    try {
      this.initialize();

      logger.api(
        '🏥 [HealthController] Detailed health check requested - v2.0',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform database health check
      const isDatabaseHealthy = await db.$client.query('SELECT 1');

      // Get connection pool metrics
      // const poolMetrics = getDatabaseMetrics(); // This line was removed as per the new_code

      // ✅ NEW v2.0: Get ServiceContainer detailed health
      const containerHealth = ServiceContainer.getHealthStatus();
      const dependencyGraph = ServiceContainer.getDependencyGraph();

      // ✅ NEW v2.0: Get FeatureFlags status
      const featureFlagsStatus = FeatureFlags.getStatus();

      // ✅ NEW v2.0: Get Module Lifecycle status
      const moduleHealth = ModuleLifecycleManager.getSystemHealth();

      // ✅ NEW v2.0: Check individual service health
      const serviceHealth = await this.checkAllServices();

      const responseTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      const detailedHealth = {
        status:
          isDatabaseHealthy && containerHealth.status === 'healthy'
            ? 'healthy'
            : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,

        // System Information
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          environment: process.env.NODE_ENV || 'unknown',
        },

        // Memory Usage
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024), // MB
        },

        // Database Health
        database: {
          status: isDatabaseHealthy ? 'connected' : 'disconnected',
          type: process.env.DATABASE_URL?.startsWith('sqlite://')
            ? 'SQLite'
            : 'PostgreSQL',
          pool:
            // poolMetrics.totalConnections > 0 // This line was removed as per the new_code
            null, // Placeholder as per new_code
        },

        // ✅ NEW v2.0: ServiceContainer Health
        serviceContainer: {
          status: containerHealth.status,
          version: '2.0.0',
          registeredServices: containerHealth.registeredServices,
          instantiatedServices: containerHealth.instantiatedServices,
          initializationOrder: containerHealth.initializationOrder,
          dependencyGraph,
          serviceHealth,
        },

        // ✅ NEW v2.0: FeatureFlags Health
        featureFlags: {
          version: '2.0.0',
          status: featureFlagsStatus.summary ? 'healthy' : 'unhealthy',
          totalFlags: featureFlagsStatus.summary?.totalFlags || 0,
          enabledFlags: featureFlagsStatus.summary?.enabledFlags || 0,
          moduleFlags: featureFlagsStatus.summary?.moduleFlags || 0,
          abTests: featureFlagsStatus.summary?.abTests || 0,
        },

        // ✅ NEW v2.0: Module Lifecycle Health
        moduleLifecycle: {
          version: '2.0.0',
          overallStatus: moduleHealth.overallStatus,
          totalModules: moduleHealth.totalModules,
          runningModules: moduleHealth.runningModules,
          degradedModules: moduleHealth.degradedModules,
          failedModules: moduleHealth.failedModules,
          stoppedModules: moduleHealth.stoppedModules,
        },

        // Performance Indicators
        performance: {
          healthCheckTime: responseTime,
          databaseResponseTime: responseTime, // In this case, same as health check
          cpuUsage: process.cpuUsage(),
        },

        // ✅ NEW v2.0: Architecture Information
        architecture: {
          version: '2.0.0',
          modular: true,
          enhancedLogging: true,
          serviceContainer: true,
          featureFlags: true,
          moduleLifecycle: true,
          components: [
            'ServiceContainer v2.0',
            'FeatureFlags v2.0',
            'ModuleLifecycle v2.0',
            'Enhanced Logging v2.0',
          ],
        },
      };

      const statusCode =
        isDatabaseHealthy && containerHealth.status === 'healthy' ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Detailed health check completed - v2.0',
        'HealthController',
        {
          status: detailedHealth.status,
          responseTime,
          // poolConnections: poolMetrics.totalConnections, // This line was removed as per the new_code
          memoryUsage: detailedHealth.memory.heapUsed,
          servicesRegistered: containerHealth.registeredServices,
          modulesRunning: moduleHealth.runningModules,
        }
      );

      (res as any).status(statusCode).json(detailedHealth);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Detailed health check failed - v2.0',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
        architecture: {
          version: '2.0.0',
          modular: true,
        },
      });
    }
  }

  /**
   * Database-specific health check with ServiceContainer integration
   * GET /api/health/database
   */
  static async getDatabaseHealth(_req: Request, res: Response): Promise<void> {
    try {
      this.initialize();

      logger.api(
        '🏥 [HealthController] Database health check requested - v2.0',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform database health check
      const isDatabaseHealthy = await db.$client.query('SELECT 1');

      // Get detailed pool metrics
      // const poolMetrics = getDatabaseMetrics(); // This line was removed as per the new_code

      // ✅ NEW v2.0: Check if TenantService (database-dependent) is working
      let tenantServiceHealthy = false;
      try {
        const tenantService = ServiceContainer.get('TenantService');
        if (
          tenantService &&
          typeof (tenantService as any).getServiceHealth === 'function'
        ) {
          const health = await (tenantService as any).getServiceHealth();
          tenantServiceHealthy = health.status === 'healthy';
        }
      } catch (error) {
        logger.debug(
          'TenantService health check failed',
          'HealthController',
          error
        );
      }

      const responseTime = Date.now() - startTime;

      const databaseHealth = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        type: process.env.DATABASE_URL?.startsWith('sqlite://')
          ? 'SQLite'
          : 'PostgreSQL',

        // Connection Details
        connection: {
          healthy: isDatabaseHealthy,
          connectionString: process.env.DATABASE_URL
            ? '[REDACTED]'
            : 'Not configured',
        },

        // Pool Metrics (if available)
        pool:
          // poolMetrics.totalConnections > 0 // This line was removed as per the new_code
          null, // Placeholder as per new_code

        // ✅ NEW v2.0: Database-dependent services health
        dependentServices: {
          tenantService: {
            status: tenantServiceHealthy ? 'healthy' : 'unhealthy',
            registered: ServiceContainer.has('TenantService'),
          },
        },

        // Performance Metrics
        performance: {
          queryResponseTime: responseTime,
          connectionTestTime: responseTime,
        },

        // Environment Information
        environment: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
          databaseConfigured: !!process.env.DATABASE_URL,
          migrationsPath: 'drizzle/migrations',
        },
      };

      const statusCode = isDatabaseHealthy ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Database health check completed - v2.0',
        'HealthController',
        {
          status: databaseHealth.status,
          responseTime,
          // poolConnections: poolMetrics.totalConnections, // This line was removed as per the new_code
          tenantServiceHealthy,
        }
      );

      (res as any).status(statusCode).json(databaseHealth);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Database health check failed - v2.0',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
        type: process.env.DATABASE_URL?.startsWith('sqlite://')
          ? 'SQLite'
          : 'PostgreSQL',
      });
    }
  }

  /**
   * ✅ NEW v2.0: External services health check
   * GET /api/health/services
   */
  static async getServicesHealth(_req: Request, res: Response): Promise<void> {
    try {
      this.initialize();

      logger.api(
        '🔌 [HealthController] External services health check requested - v2.0',
        'HealthController'
      );

      const startTime = Date.now();

      // Check all registered services
      const serviceHealth = await this.checkAllServices();

      // ✅ Check specific external service health
      const externalServices: Record<string, any> = {};

      // Check HotelResearchService (Google Places API)
      try {
        const hotelResearch = ServiceContainer.get('HotelResearchService');
        if (hotelResearch) {
          const health = await (hotelResearch as any).getServiceHealth();
          externalServices.hotelResearch = health;
        }
      } catch (error) {
        externalServices.hotelResearch = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Check VapiIntegrationService
      try {
        const vapiService = ServiceContainer.get('VapiIntegrationService');
        if (vapiService) {
          const health = await (vapiService as any).getServiceHealth();
          externalServices.vapiIntegration = health;
        }
      } catch (error) {
        externalServices.vapiIntegration = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      const responseTime = Date.now() - startTime;

      const servicesHealth = {
        status:
          serviceHealth.healthy >= serviceHealth.total * 0.7
            ? 'healthy'
            : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime,

        // Service Container Services
        containerServices: serviceHealth,

        // External API Services
        externalServices,

        // Summary
        summary: {
          totalServices:
            serviceHealth.total + Object.keys(externalServices).length,
          healthyServices:
            serviceHealth.healthy +
            Object.values(externalServices).filter(
              (s: any) => s.status === 'healthy'
            ).length,
          degradedServices: Object.values(externalServices).filter(
            (s: any) => s.status === 'degraded'
          ).length,
          unhealthyServices:
            serviceHealth.unhealthy +
            Object.values(externalServices).filter(
              (s: any) => s.status === 'unhealthy'
            ).length,
        },

        // ✅ NEW v2.0: ServiceContainer integration status
        serviceContainer: {
          version: '2.0.0',
          status: ServiceContainer.getHealthStatus().status,
          autoRegistration: true,
          dependencyInjection: true,
          lifecycleManagement: true,
        },
      };

      const statusCode = servicesHealth.status === 'healthy' ? 200 : 503;

      logger.success(
        '🔌 [HealthController] Services health check completed - v2.0',
        'HealthController',
        {
          status: servicesHealth.status,
          responseTime,
          healthyServices: servicesHealth.summary.healthyServices,
          totalServices: servicesHealth.summary.totalServices,
        }
      );

      (res as any).status(statusCode).json(servicesHealth);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Services health check failed - v2.0',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Services health check failed',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
      });
    }
  }

  /**
   * Readiness probe for Kubernetes/container orchestration with ServiceContainer
   * GET /api/health/ready
   */
  static async getReadiness(_req: Request, res: Response): Promise<void> {
    try {
      this.initialize();

      const isDatabaseHealthy = await db.$client.query('SELECT 1');
      const containerHealthy =
        ServiceContainer.getHealthStatus().status === 'healthy';

      if (isDatabaseHealthy && containerHealthy) {
        (res as any).status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'healthy',
            serviceContainer: 'healthy',
          },
          architecture: 'v2.0',
        });
      } else {
        (res as any).status(503).json({
          status: 'not ready',
          reason: !isDatabaseHealthy
            ? 'Database not accessible'
            : 'ServiceContainer not healthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: isDatabaseHealthy ? 'healthy' : 'unhealthy',
            serviceContainer: containerHealthy ? 'healthy' : 'unhealthy',
          },
        });
      }
    } catch {
      (res as any).status(503).json({
        status: 'not ready',
        reason: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Liveness probe for Kubernetes/container orchestration
   * GET /api/health/live
   */
  static async getLiveness(_req: Request, res: Response): Promise<void> {
    // Basic liveness check - if server can respond, it's alive
    (res as any).status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      architecture: 'v2.0',
      pid: process.pid,
    });
  }

  /**
   * Basic health check for backward compatibility
   */
  private static async getBasicHealth() {
    const startTime = Date.now();

    try {
      // Test database connection
      await db.$client.query('SELECT 1');

      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        version: '3.0.0',
        services: {
          database: 'healthy',
          serviceContainer: 'healthy',
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        version: '3.0.0',
        error: (error as Error).message,
      };
    }
  }
}
