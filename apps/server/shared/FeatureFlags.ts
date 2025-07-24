// ============================================
// FEATURE FLAGS SYSTEM - Modular Architecture v1.0
// ============================================
// Simple feature flag system for module management
// Prepares for microservices by allowing module disable/enable

import { logger } from '@shared/utils/logger';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  module?: string;
  environment?: string[];
}

/**
 * Simple Feature Flags System
 * Controls module availability and features
 */
export class FeatureFlags {
  private static flags = new Map<string, FeatureFlag>();

  /**
   * Initialize default module flags
   */
  static initialize(): void {
    // Module-level flags
    this.setFlag('request-module', {
      name: 'request-module',
      enabled: this.getEnvFlag('ENABLE_REQUEST_MODULE', true),
      description: 'Request/Order management module',
      module: 'request-module',
    });

    this.setFlag('tenant-module', {
      name: 'tenant-module',
      enabled: this.getEnvFlag('ENABLE_TENANT_MODULE', true),
      description: 'Multi-tenant management module',
      module: 'tenant-module',
    });

    this.setFlag('analytics-module', {
      name: 'analytics-module',
      enabled: this.getEnvFlag('ENABLE_ANALYTICS_MODULE', true),
      description: 'Analytics and reporting module',
      module: 'analytics-module',
    });

    this.setFlag('assistant-module', {
      name: 'assistant-module',
      enabled: this.getEnvFlag('ENABLE_ASSISTANT_MODULE', true),
      description: 'AI assistant generation module',
      module: 'assistant-module',
    });

    // Feature-level flags
    this.setFlag('advanced-analytics', {
      name: 'advanced-analytics',
      enabled: this.getEnvFlag('ENABLE_ADVANCED_ANALYTICS', false),
      description: 'Advanced analytics features',
      module: 'analytics-module',
    });

    this.setFlag('module-health-checks', {
      name: 'module-health-checks',
      enabled: this.getEnvFlag('ENABLE_MODULE_HEALTH_CHECKS', true),
      description: 'Module health monitoring',
    });

    logger.debug('🚩 [FeatureFlags] Initialized default flags', 'Component');
  }

  /**
   * Set a feature flag
   */
  static setFlag(name: string, flag: FeatureFlag): void {
    this.flags.set(name, flag);
    logger.debug(
      `🚩 [FeatureFlags] Set flag ${name}: ${flag.enabled}`,
      'Component'
    );
  }

  /**
   * Check if a feature/module is enabled
   */
  static isEnabled(flagName: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      // Default to enabled for unknown flags to maintain compatibility
      logger.warn(
        `🚩 [FeatureFlags] Unknown flag '${flagName}', defaulting to enabled`,
        'Component'
      );
      return true;
    }
    return flag.enabled;
  }

  /**
   * Check if a module is enabled
   */
  static isModuleEnabled(moduleName: string): boolean {
    return this.isEnabled(moduleName);
  }

  /**
   * Enable a feature/module
   */
  static enable(flagName: string): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = true;
      logger.debug(`🚩 [FeatureFlags] Enabled ${flagName}`, 'Component');
    }
  }

  /**
   * Disable a feature/module
   */
  static disable(flagName: string): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = false;
      logger.debug(`🚩 [FeatureFlags] Disabled ${flagName}`, 'Component');
    }
  }

  /**
   * Get all flags
   */
  static getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get flags for a specific module
   */
  static getModuleFlags(moduleName: string): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(
      flag => flag.module === moduleName
    );
  }

  /**
   * Get feature flag status summary
   */
  static getStatus(): any {
    const flags = this.getAllFlags();
    return {
      totalFlags: flags.length,
      enabledFlags: flags.filter(f => f.enabled).length,
      disabledFlags: flags.filter(f => !f.enabled).length,
      moduleFlags: flags.filter(f => f.module).length,
      flags: flags.reduce((acc, flag) => {
        acc[flag.name] = {
          enabled: flag.enabled,
          description: flag.description,
          module: flag.module,
        };
        return acc;
      }, {}),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper to read environment variable with default
   */
  private static getEnvFlag(envVar: string, defaultValue: boolean): boolean {
    const value = process.env[envVar];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }
}

// ============================================
// INITIALIZATION ON IMPORT
// ============================================

// Auto-initialize feature flags when module is imported
FeatureFlags.initialize();

// Export convenience functions
export const isModuleEnabled = (moduleName: string): boolean =>
  FeatureFlags.isModuleEnabled(moduleName);

export const isFeatureEnabled = (featureName: string): boolean =>
  FeatureFlags.isEnabled(featureName);
