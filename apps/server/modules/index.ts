// ============================================
// MODULES MASTER INDEX - Modular Architecture v1.0
// ============================================
// Central registry for all system modules
// Provides module discovery and health checking

// Export all modules
export * from './analytics-module';
export * from './assistant-module';
export * from './request-module';
export * from './tenant-module';

// Import module info
import {
  AnalyticsModuleInfo,
  checkAnalyticsModuleHealth,
} from './analytics-module';
import {
  AssistantModuleInfo,
  checkAssistantModuleHealth,
} from './assistant-module';
import { RequestModuleInfo, checkRequestModuleHealth } from './request-module';
import { TenantModuleInfo, checkTenantModuleHealth } from './tenant-module';

// Module registry for discovery
export const MODULE_REGISTRY = {
  'request-module': {
    info: RequestModuleInfo,
    healthCheck: checkRequestModuleHealth,
  },
  'tenant-module': {
    info: TenantModuleInfo,
    healthCheck: checkTenantModuleHealth,
  },
  'analytics-module': {
    info: AnalyticsModuleInfo,
    healthCheck: checkAnalyticsModuleHealth,
  },
  'assistant-module': {
    info: AssistantModuleInfo,
    healthCheck: checkAssistantModuleHealth,
  },
};

// Module discovery utilities
export const getAvailableModules = () => {
  return Object.keys(MODULE_REGISTRY);
};

export const getModuleInfo = (moduleName: string) => {
  return MODULE_REGISTRY[moduleName]?.info;
};

export const checkAllModulesHealth = () => {
  const results = {};
  for (const [name, module] of Object.entries(MODULE_REGISTRY)) {
    try {
      results[name] = module.healthCheck();
    } catch (error) {
      results[name] = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  return results;
};
