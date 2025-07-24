// ============================================
// SHARED UTILITIES INDEX - Modular Architecture v1.0
// ============================================
// Central export for all cross-cutting concerns and utilities

// Core utilities
export * from './FeatureFlags';
export * from './ServiceContainer';

// Import for usage in health check
import {
  MODULE_REGISTRY,
  checkAllModulesHealth,
  getAvailableModules,
} from '../modules';
import { FeatureFlags } from './FeatureFlags';
import { ServiceContainer } from './ServiceContainer';

// Re-export existing shared utilities for convenience
export { generateId, generateShortId } from '@shared/utils/idGenerator';
export { logger } from '@shared/utils/logger';

// Module system exports
export { MODULE_REGISTRY, checkAllModulesHealth, getAvailableModules };

// Architecture health check
export const getArchitectureHealth = () => {
  return {
    modular: {
      modules: getAvailableModules(),
      moduleHealth: checkAllModulesHealth(),
    },
    services: {
      container: ServiceContainer.getHealthStatus(),
    },
    features: {
      flags: FeatureFlags.getStatus(),
    },
    timestamp: new Date().toISOString(),
    architecture: 'Modular v1.0',
  };
};
