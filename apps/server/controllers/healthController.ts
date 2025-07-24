import { checkDatabaseHealth, getDatabaseMetrics } from '@shared/db';
import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';

// ✅ ENHANCED v2.0: Import modular architecture components
import { getArchitectureHealth } from '@server/shared';
import { FeatureFlags } from '@server/shared/FeatureFlags';
import { ModuleLifecycleManager } from '@server/shared/ModuleLifecycleManager';
import {
  ServiceContainer,
  getServiceSync,
} from '@server/shared/ServiceContainer';

// ✅ NEW v2.0: Import services for comprehensive health checking
import { HotelResearchService } from '@server/services/hotelResearch';
import { TenantService } from '@server/services/tenantService';
import { VapiIntegrationService } from '@server/services/vapiIntegration';

/**
 * Enhanced Health Check Controller v2.0 - Modular Architecture
 *
 * Provides comprehensive health information including:
 * - Database connection status with pool metrics
 * - ServiceContainer health and registered services
 * - FeatureFlags system status
 * - ModuleLifecycle health monitoring
 * - External service health (Vapi, Google Places API)
 * - System performance indicators
 * - Modular architecture status
 */
export class HealthController {
  // ✅ NEW v2.0: Initialize flag listeners for dynamic behavior
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    // Register core services with ServiceContainer if not already registered
    this.registerCoreServices();

    this.initialized = true;
    logger.debug(
      '🏥 [HealthController] ServiceContainer integration initialized',
      'HealthController'
    );
  }

  /**
   * ✅ NEW v2.0: Register core services with ServiceContainer
   */
  private static registerCoreServices(): void {
    try {
      // Register TenantService if not already registered
      if (!ServiceContainer.has('TenantService')) {
        ServiceContainer.register('TenantService', TenantService, {
          module: 'tenant-module',
          singleton: true,
          lifecycle: {
            onInit: () =>
              logger.debug('TenantService initialized', 'HealthController'),
            onDestroy: () =>
              logger.debug('TenantService destroyed', 'HealthController'),
            onHealthCheck: () => true, // Basic health check
          },
        });
      }

      // Register HotelResearchService if not already registered
      if (!ServiceContainer.has('HotelResearchService')) {
        ServiceContainer.register(
          'HotelResearchService',
          HotelResearchService,
          {
            module: 'research-module',
            singleton: true,
            lifecycle: {
              onInit: () =>
                logger.debug(
                  'HotelResearchService initialized',
                  'HealthController'
                ),
              onDestroy: () =>
                logger.debug(
                  'HotelResearchService destroyed',
                  'HealthController'
                ),
              onHealthCheck: async () => {
                try {
                  const service = new HotelResearchService();
                  const health = await service.getServiceHealth();
                  return health.status === 'healthy';
                } catch {
                  return false;
                }
              },
            },
          }
        );
      }

      // Register VapiIntegrationService if not already registered
      if (!ServiceContainer.has('VapiIntegrationService')) {
        ServiceContainer.register(
          'VapiIntegrationService',
          VapiIntegrationService,
          {
            module: 'vapi-module',
            singleton: true,
            lifecycle: {
              onInit: () =>
                logger.debug(
                  'VapiIntegrationService initialized',
                  'HealthController'
                ),
              onDestroy: () =>
                logger.debug(
                  'VapiIntegrationService destroyed',
                  'HealthController'
                ),
              onHealthCheck: async () => {
                try {
                  const service = new VapiIntegrationService();
                  const health = await service.getServiceHealth();
                  return health.status === 'healthy';
                } catch {
                  return false;
                }
              },
            },
          }
        );
      }

      logger.debug(
        '🔧 [HealthController] Core services registered with ServiceContainer',
        'HealthController'
      );
    } catch (error) {
      logger.warn(
        '⚠️ [HealthController] Failed to register some services',
        'HealthController',
        error
      );
    }
  }

  /**
   * Basic health check endpoint with ServiceContainer integration
   * GET /api/health
   */
  static async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      // Initialize on first use
      this.initialize();

      logger.api(
        '🏥 [HealthController] Basic health check requested - v2.0',
        'HealthController'
      );

      const startTime = Date.now();

      // Perform basic database health check
      const isDatabaseHealthy = await checkDatabaseHealth();

      // ✅ NEW v2.0: Check ServiceContainer health
      const containerHealth = ServiceContainer.getHealthStatus();

      const responseTime = Date.now() - startTime;

      const healthStatus = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime,
        database: {
          status: isDatabaseHealthy ? 'connected' : 'disconnected',
        },
        // ✅ NEW v2.0: ServiceContainer health summary
        services: {
          container: containerHealth.status,
          registered: containerHealth.registeredServices,
          instantiated: containerHealth.instantiatedServices,
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
        },
        // ✅ NEW v2.0: Architecture version
        architecture: {
          version: '2.0.0',
          modular: true,
          enhancedLogging: true,
          serviceContainer: true,
        },
      };

      const statusCode =
        isDatabaseHealthy && containerHealth.status === 'healthy' ? 200 : 503;

      logger.success(
        '🏥 [HealthController] Health check completed - v2.0',
        'HealthController',
        {
          status: healthStatus.status,
          responseTime,
          databaseHealthy: isDatabaseHealthy,
          servicesRegistered: containerHealth.registeredServices,
        }
      );

      (res as any).status(statusCode).json(healthStatus);
    } catch (error) {
      logger.error(
        '❌ [HealthController] Health check failed - v2.0',
        'HealthController',
        error
      );

      (res as any).status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
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
        const service = getServiceSync(serviceName);

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
      const isDatabaseHealthy = await checkDatabaseHealth();

      // Get connection pool metrics
      const poolMetrics = getDatabaseMetrics();

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
            poolMetrics.totalConnections > 0
              ? {
                  totalConnections: poolMetrics.totalConnections,
                  idleConnections: poolMetrics.idleConnections,
                  activeConnections: poolMetrics.activeConnections,
                  waitingCount: poolMetrics.waitingCount,
                  errorCount: poolMetrics.errorCount,
                  lastError: poolMetrics.lastError,
                  lastErrorTime: poolMetrics.lastErrorTime,
                  utilization:
                    poolMetrics.totalConnections > 0
                      ? Math.round(
                          (poolMetrics.activeConnections /
                            poolMetrics.totalConnections) *
                            100
                        )
                      : 0,
                }
              : null,
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
          poolConnections: poolMetrics.totalConnections,
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
      const isDatabaseHealthy = await checkDatabaseHealth();

      // Get detailed pool metrics
      const poolMetrics = getDatabaseMetrics();

      // ✅ NEW v2.0: Check if TenantService (database-dependent) is working
      let tenantServiceHealthy = false;
      try {
        const tenantService = getServiceSync('TenantService');
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
          poolMetrics.totalConnections > 0
            ? {
                totalConnections: poolMetrics.totalConnections,
                idleConnections: poolMetrics.idleConnections,
                activeConnections: poolMetrics.activeConnections,
                waitingCount: poolMetrics.waitingCount,
                utilization:
                  poolMetrics.totalConnections > 0
                    ? Math.round(
                        (poolMetrics.activeConnections /
                          poolMetrics.totalConnections) *
                          100
                      )
                    : 0,

                // Error Information
                errorCount: poolMetrics.errorCount,
                lastError: poolMetrics.lastError,
                lastErrorTime: poolMetrics.lastErrorTime,

                // Health Assessment
                health: {
                  status: poolMetrics.errorCount === 0 ? 'healthy' : 'degraded',
                  utilizationPercentage:
                    poolMetrics.totalConnections > 0
                      ? Math.round(
                          (poolMetrics.activeConnections /
                            poolMetrics.totalConnections) *
                            100
                        )
                      : 0,
                  hasRecentErrors: poolMetrics.lastErrorTime
                    ? Date.now() -
                        new Date(poolMetrics.lastErrorTime).getTime() <
                      300000 // 5 minutes
                    : false,
                },
              }
            : {
                message:
                  'Connection pooling not available (SQLite or single connection)',
                type: process.env.DATABASE_URL?.startsWith('sqlite://')
                  ? 'SQLite'
                  : 'Unknown',
              },

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
          poolConnections: poolMetrics.totalConnections,
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
        const hotelResearch = getServiceSync('HotelResearchService');
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
        const vapiService = getServiceSync('VapiIntegrationService');
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

      const isDatabaseHealthy = await checkDatabaseHealth();
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
}
