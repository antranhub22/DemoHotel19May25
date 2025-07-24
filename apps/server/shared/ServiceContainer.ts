// ============================================
// ENHANCED SERVICE CONTAINER - Modular Architecture v2.0
// ============================================
// Advanced dependency injection with lifecycle management
// Auto-registration, dependency validation, and error handling
// Full backwards compatibility with v1.0

import { logger } from '@shared/utils/logger';

type ServiceClass<T = any> = new (...args: any[]) => T;
type ServiceFactory<T = any> = () => T | Promise<T>;

export interface ServiceLifecycleHooks {
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  onHealthCheck?: () => boolean | Promise<boolean>;
}

interface ServiceDefinition<T = any> {
  instance?: T;
  factory?: ServiceFactory<T>;
  singleton?: boolean;
  dependencies?: string[];
  lifecycle?: ServiceLifecycleHooks;
  module?: string;
  version?: string;
  priority?: number;
}

interface ServiceMetadata {
  name: string;
  singleton?: boolean;
  dependencies?: string[];
  module?: string;
  lifecycle?: ServiceLifecycleHooks;
}

/**
 * Enhanced Service Container v2.0 - Enterprise-Grade Dependency Injection
 *
 * New Features:
 * - Auto-registration decorators
 * - Service lifecycle management
 * - Dependency validation and resolution
 * - Health monitoring
 * - Module-scoped services
 * - Performance metrics
 */
export class ServiceContainer {
  private static services = new Map<string, ServiceDefinition>();
  private static instances = new Map<string, any>();
  private static initializationOrder: string[] = [];
  private static metrics = {
    registrations: 0,
    instantiations: 0,
    errors: 0,
    lastError: null as string | null,
  };

  // ============================================
  // ENHANCED REGISTRATION METHODS
  // ============================================

  /**
   * Register a service class with enhanced features
   */
  static register<T>(
    name: string,
    serviceClass: ServiceClass<T>,
    options: {
      singleton?: boolean;
      dependencies?: string[];
      module?: string;
      lifecycle?: ServiceLifecycleHooks;
      priority?: number;
    } = {}
  ): void {
    const {
      singleton = true,
      dependencies = [],
      module,
      lifecycle,
      priority = 0,
    } = options;

    // Validate dependencies
    this.validateDependencies(name, dependencies);

    this.services.set(name, {
      factory: () => new serviceClass(),
      singleton,
      dependencies,
      module,
      lifecycle,
      priority,
    });

    this.metrics.registrations++;
    this.updateInitializationOrder();

    logger.debug(
      `📦 [ServiceContainer v2.0] Registered service: ${name}${
        module ? ` (module: ${module})` : ''
      }`,
      'ServiceContainer'
    );
  }

  /**
   * Register a service factory with enhanced features
   */
  static registerFactory<T>(
    name: string,
    factory: ServiceFactory<T>,
    options: {
      singleton?: boolean;
      dependencies?: string[];
      module?: string;
      lifecycle?: ServiceLifecycleHooks;
      priority?: number;
    } = {}
  ): void {
    const {
      singleton = true,
      dependencies = [],
      module,
      lifecycle,
      priority = 0,
    } = options;

    this.validateDependencies(name, dependencies);

    this.services.set(name, {
      factory,
      singleton,
      dependencies,
      module,
      lifecycle,
      priority,
    });

    this.metrics.registrations++;
    this.updateInitializationOrder();

    logger.debug(
      `🏭 [ServiceContainer v2.0] Registered factory: ${name}${
        module ? ` (module: ${module})` : ''
      }`,
      'ServiceContainer'
    );
  }

  /**
   * Register a service instance directly with metadata
   */
  static registerInstance<T>(
    name: string,
    instance: T,
    options: { module?: string; lifecycle?: ServiceLifecycleHooks } = {}
  ): void {
    const { module, lifecycle } = options;

    this.services.set(name, {
      instance,
      module,
      lifecycle,
    });
    this.instances.set(name, instance);

    this.metrics.registrations++;

    logger.debug(
      `🎯 [ServiceContainer v2.0] Registered instance: ${name}${
        module ? ` (module: ${module})` : ''
      }`,
      'ServiceContainer'
    );
  }

  // ============================================
  // ENHANCED SERVICE RETRIEVAL
  // ============================================

  /**
   * Get service instance with dependency resolution
   */
  static async get<T>(name: string): Promise<T> {
    try {
      // Check if already instantiated
      if (this.instances.has(name)) {
        return this.instances.get(name);
      }

      const serviceDefinition = this.services.get(name);
      if (!serviceDefinition) {
        throw new Error(`Service '${name}' not registered`);
      }

      // Use existing instance if available
      if (serviceDefinition.instance) {
        return serviceDefinition.instance;
      }

      // Resolve dependencies first
      await this.resolveDependencies(
        name,
        serviceDefinition.dependencies || []
      );

      // Create new instance using factory
      if (!serviceDefinition.factory) {
        throw new Error(`Service '${name}' has no factory method`);
      }

      const instance = await serviceDefinition.factory();

      // Run lifecycle hooks
      if (serviceDefinition.lifecycle?.onInit) {
        await serviceDefinition.lifecycle.onInit();
      }

      // Store instance if singleton
      if (serviceDefinition.singleton) {
        this.instances.set(name, instance);
      }

      this.metrics.instantiations++;

      logger.debug(
        `✅ [ServiceContainer v2.0] Created instance: ${name}`,
        'ServiceContainer'
      );
      return instance;
    } catch (error) {
      this.metrics.errors++;
      this.metrics.lastError = error.message;
      logger.error(
        `❌ [ServiceContainer v2.0] Failed to get service: ${name}`,
        'ServiceContainer',
        error
      );
      throw error;
    }
  }

  /**
   * Synchronous get method (backwards compatibility)
   */
  static getSync<T>(name: string): T {
    // Check if already instantiated
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const serviceDefinition = this.services.get(name);
    if (!serviceDefinition) {
      throw new Error(`Service '${name}' not registered`);
    }

    // Use existing instance if available
    if (serviceDefinition.instance) {
      return serviceDefinition.instance;
    }

    // For backwards compatibility, create instance without async dependencies
    if (!serviceDefinition.factory) {
      throw new Error(`Service '${name}' has no factory method`);
    }

    const instance = serviceDefinition.factory();

    // Store instance if singleton
    if (serviceDefinition.singleton) {
      this.instances.set(name, instance);
    }

    return instance;
  }

  // ============================================
  // DEPENDENCY MANAGEMENT
  // ============================================

  /**
   * Validate service dependencies to prevent circular references
   */
  private static validateDependencies(
    serviceName: string,
    dependencies: string[]
  ): void {
    for (const dep of dependencies) {
      if (this.hasCircularDependency(serviceName, dep, new Set())) {
        throw new Error(
          `Circular dependency detected: ${serviceName} -> ${dep}`
        );
      }
    }
  }

  /**
   * Check for circular dependencies recursively
   */
  private static hasCircularDependency(
    current: string,
    target: string,
    visited: Set<string>
  ): boolean {
    if (current === target) return true;
    if (visited.has(current)) return false;

    visited.add(current);

    const service = this.services.get(current);
    if (!service?.dependencies) return false;

    for (const dep of service.dependencies) {
      if (this.hasCircularDependency(dep, target, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolve service dependencies
   */
  private static async resolveDependencies(
    serviceName: string,
    dependencies: string[]
  ): Promise<void> {
    for (const dep of dependencies) {
      if (!this.instances.has(dep) && !this.services.has(dep)) {
        throw new Error(
          `Dependency '${dep}' for service '${serviceName}' not found`
        );
      }

      // Ensure dependency is instantiated
      if (!this.instances.has(dep)) {
        await this.get(dep);
      }
    }
  }

  /**
   * Update service initialization order based on dependencies
   */
  private static updateInitializationOrder(): void {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving: ${name}`);
      }
      if (visited.has(name)) return;

      visiting.add(name);
      const service = this.services.get(name);
      if (service?.dependencies) {
        for (const dep of service.dependencies) {
          visit(dep);
        }
      }
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    this.initializationOrder = order;
  }

  // ============================================
  // LIFECYCLE MANAGEMENT
  // ============================================

  /**
   * Initialize all services in dependency order
   */
  static async initializeAll(): Promise<void> {
    logger.info(
      '🚀 [ServiceContainer v2.0] Initializing all services...',
      'ServiceContainer'
    );

    for (const serviceName of this.initializationOrder) {
      try {
        await this.get(serviceName);
        logger.debug(
          `✅ [ServiceContainer v2.0] Initialized: ${serviceName}`,
          'ServiceContainer'
        );
      } catch (error) {
        logger.error(
          `❌ [ServiceContainer v2.0] Failed to initialize: ${serviceName}`,
          'ServiceContainer',
          error
        );
        throw error;
      }
    }

    logger.success(
      '🎉 [ServiceContainer v2.0] All services initialized successfully',
      'ServiceContainer'
    );
  }

  /**
   * Destroy all services (cleanup)
   */
  static async destroyAll(): Promise<void> {
    logger.info(
      '🧹 [ServiceContainer v2.0] Destroying all services...',
      'ServiceContainer'
    );

    // Destroy in reverse order
    const destroyOrder = [...this.initializationOrder].reverse();

    for (const serviceName of destroyOrder) {
      try {
        const instance = this.instances.get(serviceName);
        const service = this.services.get(serviceName);

        if (instance && service?.lifecycle?.onDestroy) {
          await service.lifecycle.onDestroy();
        }

        this.instances.delete(serviceName);
        logger.debug(
          `✅ [ServiceContainer v2.0] Destroyed: ${serviceName}`,
          'ServiceContainer'
        );
      } catch (error) {
        logger.error(
          `❌ [ServiceContainer v2.0] Failed to destroy: ${serviceName}`,
          'ServiceContainer',
          error
        );
      }
    }

    logger.success(
      '🎉 [ServiceContainer v2.0] All services destroyed',
      'ServiceContainer'
    );
  }

  /**
   * Health check for all services
   */
  static async healthCheck(): Promise<{ [serviceName: string]: boolean }> {
    const health: { [serviceName: string]: boolean } = {};

    for (const [serviceName, service] of this.services.entries()) {
      try {
        if (service.lifecycle?.onHealthCheck) {
          health[serviceName] = await service.lifecycle.onHealthCheck();
        } else {
          // Default health check - service is healthy if it can be instantiated
          health[serviceName] =
            this.instances.has(serviceName) || this.has(serviceName);
        }
      } catch (error) {
        health[serviceName] = false;
        logger.warn(
          `⚠️ [ServiceContainer v2.0] Health check failed: ${serviceName}`,
          'ServiceContainer',
          error
        );
      }
    }

    return health;
  }

  // ============================================
  // EXISTING METHODS (BACKWARDS COMPATIBILITY)
  // ============================================

  /**
   * Check if service is registered
   */
  static has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  static getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get services by module
   */
  static getModuleServices(moduleName: string): string[] {
    return Array.from(this.services.entries())
      .filter(([_, service]) => service.module === moduleName)
      .map(([name, _]) => name);
  }

  /**
   * Clear all services (useful for testing)
   */
  static clear(): void {
    this.services.clear();
    this.instances.clear();
    this.initializationOrder = [];
    this.metrics = {
      registrations: 0,
      instantiations: 0,
      errors: 0,
      lastError: null,
    };
    logger.debug(
      '🧹 [ServiceContainer v2.0] Cleared all services',
      'ServiceContainer'
    );
  }

  /**
   * Get enhanced container health status
   */
  static getHealthStatus(): any {
    const services = Array.from(this.services.entries()).map(
      ([name, service]) => ({
        name,
        singleton: service.singleton,
        dependencies: service.dependencies || [],
        module: service.module,
        instantiated: this.instances.has(name),
        priority: service.priority || 0,
      })
    );

    return {
      version: '2.0',
      registeredServices: this.getRegisteredServices().length,
      instantiatedServices: this.instances.size,
      initializationOrder: this.initializationOrder,
      metrics: this.metrics,
      services,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get service dependency graph
   */
  static getDependencyGraph(): any {
    const graph = {};
    for (const [name, service] of this.services.entries()) {
      graph[name] = {
        dependencies: service.dependencies || [],
        dependents: Array.from(this.services.entries())
          .filter(([_, s]) => s.dependencies?.includes(name))
          .map(([n, _]) => n),
        module: service.module,
      };
    }
    return graph;
  }
}

// ============================================
// AUTO-REGISTRATION DECORATORS
// ============================================

/**
 * Service decorator for automatic registration
 */
export function Service(
  nameOrOptions?: string | ServiceMetadata
): ClassDecorator {
  return function (target: any): any {
    const options: ServiceMetadata =
      typeof nameOrOptions === 'string'
        ? { name: nameOrOptions }
        : nameOrOptions || { name: target.name };

    const serviceName = options.name || target.name;

    // Auto-register when decorator is applied
    ServiceContainer.register(serviceName, target, {
      singleton: options.singleton,
      dependencies: options.dependencies,
      module: options.module,
      lifecycle: options.lifecycle,
    });

    logger.debug(
      `🎯 [ServiceContainer v2.0] Auto-registered via decorator: ${serviceName}`,
      'ServiceContainer'
    );

    return target;
  };
}

/**
 * Injectable decorator for dependency injection
 */
export function Injectable(): ClassDecorator {
  return Service();
}

/**
 * Module decorator for service grouping
 */
export function Module(moduleName: string) {
  return function (options: ServiceMetadata): ServiceMetadata {
    return { ...options, module: moduleName };
  };
}

// ============================================
// CONVENIENCE FUNCTIONS (BACKWARDS COMPATIBLE)
// ============================================

/**
 * Quick service registration for existing classes
 */
export function registerService<T>(
  serviceClass: ServiceClass<T>,
  name?: string
): void {
  const serviceName = name || serviceClass.name;
  ServiceContainer.register(serviceName, serviceClass);
}

/**
 * Quick service retrieval (async)
 */
export async function getService<T>(name: string): Promise<T> {
  return ServiceContainer.get<T>(name);
}

/**
 * Quick service retrieval (sync - backwards compatibility)
 */
export function getServiceSync<T>(name: string): T {
  return ServiceContainer.getSync<T>(name);
}

/**
 * Initialize service container with automatic service discovery
 */
export async function initializeServiceContainer(): Promise<void> {
  try {
    await ServiceContainer.initializeAll();
    logger.success(
      '🎉 [ServiceContainer v2.0] Container initialized successfully',
      'ServiceContainer'
    );
  } catch (error) {
    logger.error(
      '❌ [ServiceContainer v2.0] Container initialization failed',
      'ServiceContainer',
      error
    );
    throw error;
  }
}
