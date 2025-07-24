// ============================================
// SIMPLE SERVICE CONTAINER - Modular Architecture v1.0
// ============================================
// Lightweight dependency injection without complex DI frameworks
// Maintains existing functionality while organizing dependencies

import { logger } from '@shared/utils/logger';

type ServiceClass<T = any> = new (...args: any[]) => T;
type ServiceFactory<T = any> = () => T;

interface ServiceDefinition<T = any> {
  instance?: T;
  factory?: ServiceFactory<T>;
  singleton?: boolean;
  dependencies?: string[];
}

/**
 * Simple Service Container for Dependency Injection
 * Provides basic DI without complex frameworks
 */
export class ServiceContainer {
  private static services = new Map<string, ServiceDefinition>();
  private static instances = new Map<string, any>();

  /**
   * Register a service class (singleton by default)
   */
  static register<T>(
    name: string,
    serviceClass: ServiceClass<T>,
    options: { singleton?: boolean; dependencies?: string[] } = {}
  ): void {
    const { singleton = true, dependencies = [] } = options;

    this.services.set(name, {
      factory: () => new serviceClass(),
      singleton,
      dependencies,
    });

    logger.debug(
      `📦 [ServiceContainer] Registered service: ${name}`,
      'Component'
    );
  }

  /**
   * Register a service factory function
   */
  static registerFactory<T>(
    name: string,
    factory: ServiceFactory<T>,
    options: { singleton?: boolean; dependencies?: string[] } = {}
  ): void {
    const { singleton = true, dependencies = [] } = options;

    this.services.set(name, {
      factory,
      singleton,
      dependencies,
    });

    logger.debug(
      `🏭 [ServiceContainer] Registered factory: ${name}`,
      'Component'
    );
  }

  /**
   * Register a service instance directly
   */
  static registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, { instance });
    this.instances.set(name, instance);

    logger.debug(
      `🎯 [ServiceContainer] Registered instance: ${name}`,
      'Component'
    );
  }

  /**
   * Get service instance
   */
  static get<T>(name: string): T {
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

    // Create new instance using factory
    if (!serviceDefinition.factory) {
      throw new Error(`Service '${name}' has no factory method`);
    }

    const instance = serviceDefinition.factory();

    // Store instance if singleton
    if (serviceDefinition.singleton) {
      this.instances.set(name, instance);
    }

    logger.debug(
      `✅ [ServiceContainer] Created instance: ${name}`,
      'Component'
    );
    return instance;
  }

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
   * Clear all services (useful for testing)
   */
  static clear(): void {
    this.services.clear();
    this.instances.clear();
    logger.debug('🧹 [ServiceContainer] Cleared all services', 'Component');
  }

  /**
   * Get container health status
   */
  static getHealthStatus(): any {
    return {
      registeredServices: this.getRegisteredServices().length,
      instantiatedServices: this.instances.size,
      services: this.getRegisteredServices(),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// CONVENIENCE METHODS FOR EXISTING CODE
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
 * Quick service retrieval
 */
export function getService<T>(name: string): T {
  return ServiceContainer.get<T>(name);
}

/**
 * Decorator for automatic service registration (optional)
 */
export function Service(name?: string) {
  return function <T extends ServiceClass>(target: T): T {
    const serviceName = name || target.name;
    ServiceContainer.register(serviceName, target);
    return target;
  };
}
