// ============================================
// ADVANCED FEATURE FLAGS SYSTEM - Modular Architecture v2.0
// ============================================
// Enhanced feature flag system with runtime updates, A/B testing, and audit logging
// Supports flag dependencies, validation, and comprehensive monitoring
// Full backwards compatibility with v1.0

import { logger } from '@shared/utils/logger';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  module?: string;
  environment?: string[];
  // ✅ NEW v2.0: Enhanced properties
  version?: string;
  dependencies?: string[];
  conflictsWith?: string[];
  rolloutPercentage?: number; // For A/B testing (0-100)
  targetAudience?: string[]; // For targeted rollouts
  expirationDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  tags?: string[];
}

export interface ABTestConfig {
  name: string;
  flagName: string;
  variants: {
    control: { percentage: number; enabled: boolean };
    treatment: { percentage: number; enabled: boolean };
  };
  targetAudience?: string[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

interface FlagAuditEntry {
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'enable' | 'disable';
  flagName: string;
  oldValue?: any;
  newValue?: any;
  updatedBy?: string;
  reason?: string;
  metadata?: any;
}

/**
 * Advanced Feature Flags System v2.0
 *
 * New Features:
 * - Runtime flag updates without restart
 * - Flag dependency validation
 * - A/B testing support
 * - Comprehensive audit logging
 * - Targeted rollouts
 * - Flag lifecycle management
 * - Conflict detection
 */
export class FeatureFlags {
  private static flags = new Map<string, FeatureFlag>();
  private static auditLog: FlagAuditEntry[] = [];
  private static abTests = new Map<string, ABTestConfig>();
  private static listeners = new Map<string, ((flag: FeatureFlag) => void)[]>();
  private static metrics = {
    totalFlags: 0,
    enabledFlags: 0,
    flagUpdates: 0,
    auditEntries: 0,
    activeABTests: 0,
  };

  // ============================================
  // ENHANCED INITIALIZATION
  // ============================================

  /**
   * Initialize enhanced feature flags system v2.0
   */
  static initialize(): void {
    logger.info(
      '🚩 [FeatureFlags v2.0] Initializing advanced feature flags system...',
      'FeatureFlags'
    );

    // Module-level flags with enhanced properties
    this.setFlag('request-module', {
      name: 'request-module',
      enabled: this.getEnvFlag('ENABLE_REQUEST_MODULE', true),
      description: 'Request/Order management module',
      module: 'request-module',
      version: '2.0.0',
      dependencies: ['tenant-module'],
      tags: ['core', 'api'],
    });

    this.setFlag('tenant-module', {
      name: 'tenant-module',
      enabled: this.getEnvFlag('ENABLE_TENANT_MODULE', true),
      description: 'Multi-tenant management module',
      module: 'tenant-module',
      version: '2.0.0',
      tags: ['core', 'security'],
    });

    this.setFlag('analytics-module', {
      name: 'analytics-module',
      enabled: this.getEnvFlag('ENABLE_ANALYTICS_MODULE', true),
      description: 'Analytics and reporting module',
      module: 'analytics-module',
      version: '2.0.0',
      dependencies: ['tenant-module'],
      tags: ['analytics', 'reporting'],
    });

    this.setFlag('assistant-module', {
      name: 'assistant-module',
      enabled: this.getEnvFlag('ENABLE_ASSISTANT_MODULE', true),
      description: 'AI assistant generation module',
      module: 'assistant-module',
      version: '2.0.0',
      dependencies: ['tenant-module'],
      tags: ['ai', 'voice'],
    });

    // ✅ NEW v2.0: Advanced feature flags
    this.setFlag('advanced-analytics', {
      name: 'advanced-analytics',
      enabled: this.getEnvFlag('ENABLE_ADVANCED_ANALYTICS', false),
      description: 'Advanced analytics features with ML insights',
      module: 'analytics-module',
      version: '2.0.0',
      dependencies: ['analytics-module'],
      rolloutPercentage: 25, // Gradual rollout
      tags: ['analytics', 'ml', 'experimental'],
    });

    this.setFlag('ab-testing-framework', {
      name: 'ab-testing-framework',
      enabled: this.getEnvFlag('ENABLE_AB_TESTING', true),
      description: 'A/B testing framework for feature experimentation',
      module: 'core',
      version: '2.0.0',
      tags: ['experimentation', 'testing'],
    });

    this.setFlag('module-health-checks', {
      name: 'module-health-checks',
      enabled: this.getEnvFlag('ENABLE_MODULE_HEALTH_CHECKS', true),
      description: 'Enhanced module health monitoring',
      version: '2.0.0',
      tags: ['monitoring', 'health'],
    });

    this.setFlag('real-time-notifications', {
      name: 'real-time-notifications',
      enabled: this.getEnvFlag('ENABLE_REAL_TIME_NOTIFICATIONS', true),
      description: 'Real-time WebSocket notifications',
      module: 'core',
      version: '2.0.0',
      dependencies: ['tenant-module'],
      tags: ['realtime', 'websocket'],
    });

    // Update metrics
    this.updateMetrics();

    logger.success(
      '🚩 [FeatureFlags v2.0] Advanced feature flags initialized successfully',
      'FeatureFlags'
    );
    this.logAudit(
      'create',
      'system',
      undefined,
      { flags: this.getAllFlags().length },
      'system',
      'System initialization'
    );
  }

  // ============================================
  // ENHANCED FLAG MANAGEMENT
  // ============================================

  /**
   * Set a feature flag with enhanced validation
   */
  static setFlag(
    name: string,
    flag: FeatureFlag,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const oldFlag = this.flags.get(name);

    // ✅ NEW v2.0: Validate flag dependencies
    this.validateFlagDependencies(flag);

    // ✅ NEW v2.0: Check for conflicts
    this.validateFlagConflicts(flag);

    // ✅ NEW v2.0: Validate rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      if (flag.rolloutPercentage < 0 || flag.rolloutPercentage > 100) {
        throw new Error(
          `Invalid rollout percentage for flag '${name}': ${flag.rolloutPercentage}`
        );
      }
    }

    // Set timestamps
    if (!oldFlag) {
      flag.createdBy = updatedBy;
    }
    flag.updatedBy = updatedBy;

    this.flags.set(name, flag);
    this.updateMetrics();

    // ✅ NEW v2.0: Audit logging
    this.logAudit(
      oldFlag ? 'update' : 'create',
      name,
      oldFlag,
      flag,
      updatedBy,
      reason
    );

    // ✅ NEW v2.0: Notify listeners
    this.notifyListeners(name, flag);

    logger.debug(
      `🚩 [FeatureFlags v2.0] ${oldFlag ? 'Updated' : 'Set'} flag ${name}: ${flag.enabled}`,
      'FeatureFlags'
    );
  }

  /**
   * Runtime flag update without restart
   */
  static updateFlag(
    name: string,
    updates: Partial<FeatureFlag>,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const existingFlag = this.flags.get(name);
    if (!existingFlag) {
      throw new Error(`Flag '${name}' not found`);
    }

    const updatedFlag = { ...existingFlag, ...updates, updatedBy };
    this.setFlag(name, updatedFlag, updatedBy, reason);

    logger.info(
      `🚩 [FeatureFlags v2.0] Runtime update for flag '${name}'`,
      'FeatureFlags',
      { updates, updatedBy, reason }
    );
  }

  /**
   * Enable a feature flag with audit trail
   */
  static enable(
    flagName: string,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      const oldValue = flag.enabled;
      flag.enabled = true;
      flag.updatedBy = updatedBy;

      this.updateMetrics();
      this.logAudit(
        'enable',
        flagName,
        { enabled: oldValue },
        { enabled: true },
        updatedBy,
        reason
      );
      this.notifyListeners(flagName, flag);

      logger.info(`🚩 [FeatureFlags v2.0] Enabled ${flagName}`, 'FeatureFlags');
    }
  }

  /**
   * Disable a feature flag with audit trail
   */
  static disable(
    flagName: string,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      const oldValue = flag.enabled;
      flag.enabled = false;
      flag.updatedBy = updatedBy;

      this.updateMetrics();
      this.logAudit(
        'disable',
        flagName,
        { enabled: oldValue },
        { enabled: false },
        updatedBy,
        reason
      );
      this.notifyListeners(flagName, flag);

      logger.info(
        `🚩 [FeatureFlags v2.0] Disabled ${flagName}`,
        'FeatureFlags'
      );
    }
  }

  /**
   * Delete a feature flag
   */
  static deleteFlag(
    flagName: string,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      this.flags.delete(flagName);
      this.updateMetrics();
      this.logAudit('delete', flagName, flag, undefined, updatedBy, reason);

      logger.info(
        `🚩 [FeatureFlags v2.0] Deleted flag ${flagName}`,
        'FeatureFlags'
      );
    }
  }

  // ============================================
  // ENHANCED FLAG EVALUATION
  // ============================================

  /**
   * Check if a feature/module is enabled with enhanced evaluation
   */
  static isEnabled(
    flagName: string,
    context?: { userId?: string; tenantId?: string }
  ): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      // Default to enabled for unknown flags to maintain compatibility
      logger.warn(
        `🚩 [FeatureFlags v2.0] Unknown flag '${flagName}', defaulting to enabled`,
        'FeatureFlags'
      );
      return true;
    }

    // Check basic enabled state
    if (!flag.enabled) {
      return false;
    }

    // ✅ NEW v2.0: Check expiration
    if (flag.expirationDate && new Date() > flag.expirationDate) {
      logger.warn(
        `🚩 [FeatureFlags v2.0] Flag '${flagName}' has expired`,
        'FeatureFlags'
      );
      return false;
    }

    // ✅ NEW v2.0: Check rollout percentage (A/B testing)
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const userId = context?.userId || 'anonymous';
      const hash = this.hashString(userId + flagName);
      const userPercentile = hash % 100;

      if (userPercentile >= flag.rolloutPercentage) {
        return false;
      }
    }

    // ✅ NEW v2.0: Check target audience
    if (flag.targetAudience && context?.userId) {
      if (!flag.targetAudience.includes(context.userId)) {
        return false;
      }
    }

    // ✅ NEW v2.0: Check dependencies
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        if (!this.isEnabled(dependency, context)) {
          logger.debug(
            `🚩 [FeatureFlags v2.0] Flag '${flagName}' disabled due to dependency '${dependency}'`,
            'FeatureFlags'
          );
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if a module is enabled (backwards compatibility)
   */
  static isModuleEnabled(
    moduleName: string,
    context?: { userId?: string; tenantId?: string }
  ): boolean {
    return this.isEnabled(moduleName, context);
  }

  // ============================================
  // A/B TESTING FRAMEWORK
  // ============================================

  /**
   * Create an A/B test
   */
  static createABTest(
    config: ABTestConfig,
    createdBy: string = 'system'
  ): void {
    // Validate configuration
    if (
      config.variants.control.percentage +
        config.variants.treatment.percentage !==
      100
    ) {
      throw new Error('A/B test variant percentages must sum to 100');
    }

    // Ensure the flag exists
    if (!this.flags.has(config.flagName)) {
      throw new Error(
        `Flag '${config.flagName}' must exist before creating A/B test`
      );
    }

    this.abTests.set(config.name, config);
    this.updateMetrics();

    this.logAudit(
      'create',
      config.name,
      undefined,
      config,
      createdBy,
      'A/B test created'
    );

    logger.info(
      `🧪 [FeatureFlags v2.0] Created A/B test: ${config.name}`,
      'FeatureFlags',
      config
    );
  }

  /**
   * Evaluate A/B test for a user
   */
  static evaluateABTest(
    testName: string,
    userId: string
  ): 'control' | 'treatment' | null {
    const test = this.abTests.get(testName);
    if (!test || !test.active) {
      return null;
    }

    const now = new Date();
    if (now < test.startDate || (test.endDate && now > test.endDate)) {
      return null;
    }

    // Check if flag is enabled
    if (!this.isEnabled(test.flagName, { userId })) {
      return null;
    }

    // Hash user ID to get consistent assignment
    const hash = this.hashString(userId + testName);
    const userPercentile = hash % 100;

    if (userPercentile < test.variants.control.percentage) {
      return 'control';
    } else {
      return 'treatment';
    }
  }

  /**
   * Get active A/B tests for a user
   */
  static getActiveABTests(userId: string): {
    [testName: string]: 'control' | 'treatment';
  } {
    const activeTests = {};

    for (const [testName] of this.abTests.entries()) {
      const variant = this.evaluateABTest(testName, userId);
      if (variant) {
        activeTests[testName] = variant;
      }
    }

    return activeTests;
  }

  // ============================================
  // DEPENDENCY VALIDATION
  // ============================================

  /**
   * Validate flag dependencies
   */
  private static validateFlagDependencies(flag: FeatureFlag): void {
    if (!flag.dependencies) return;

    for (const dependency of flag.dependencies) {
      if (!this.flags.has(dependency)) {
        throw new Error(
          `Dependency '${dependency}' for flag '${flag.name}' does not exist`
        );
      }

      // Check for circular dependencies
      if (this.hasCircularDependency(flag.name, dependency, new Set())) {
        throw new Error(
          `Circular dependency detected: ${flag.name} -> ${dependency}`
        );
      }
    }
  }

  /**
   * Check for circular dependencies
   */
  private static hasCircularDependency(
    current: string,
    target: string,
    visited: Set<string>
  ): boolean {
    if (current === target) return true;
    if (visited.has(current)) return false;

    visited.add(current);

    const flag = this.flags.get(current);
    if (!flag?.dependencies) return false;

    for (const dep of flag.dependencies) {
      if (this.hasCircularDependency(dep, target, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate flag conflicts
   */
  private static validateFlagConflicts(flag: FeatureFlag): void {
    if (!flag.conflictsWith) return;

    for (const conflictFlag of flag.conflictsWith) {
      const conflictingFlag = this.flags.get(conflictFlag);
      if (conflictingFlag && conflictingFlag.enabled && flag.enabled) {
        throw new Error(
          `Flag '${flag.name}' conflicts with enabled flag '${conflictFlag}'`
        );
      }
    }
  }

  // ============================================
  // AUDIT LOGGING
  // ============================================

  /**
   * Log audit entry
   */
  private static logAudit(
    action: FlagAuditEntry['action'],
    flagName: string,
    oldValue?: any,
    newValue?: any,
    updatedBy: string = 'system',
    reason?: string
  ): void {
    const entry: FlagAuditEntry = {
      timestamp: new Date(),
      action,
      flagName,
      oldValue,
      newValue,
      updatedBy,
      reason,
      metadata: {
        userAgent: 'server',
        source: 'FeatureFlags v2.0',
      },
    };

    this.auditLog.push(entry);
    this.metrics.auditEntries++;

    // Keep only last 1000 entries to prevent memory issues
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    logger.info(
      `🚩 [FeatureFlags v2.0] Audit: ${action} flag '${flagName}'`,
      'FeatureFlags',
      entry
    );
  }

  /**
   * Get audit log
   */
  static getAuditLog(limit: number = 100): FlagAuditEntry[] {
    return this.auditLog.slice(-limit).reverse();
  }

  /**
   * Get audit log for specific flag
   */
  static getFlagAuditLog(
    flagName: string,
    limit: number = 50
  ): FlagAuditEntry[] {
    return this.auditLog
      .filter(entry => entry.flagName === flagName)
      .slice(-limit)
      .reverse();
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  /**
   * Add flag change listener
   */
  static addListener(
    flagName: string,
    callback: (flag: FeatureFlag) => void
  ): void {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, []);
    }
    this.listeners.get(flagName)!.push(callback);
  }

  /**
   * Remove flag change listener
   */
  static removeListener(
    flagName: string,
    callback: (flag: FeatureFlag) => void
  ): void {
    const listeners = this.listeners.get(flagName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of flag changes
   */
  private static notifyListeners(flagName: string, flag: FeatureFlag): void {
    const listeners = this.listeners.get(flagName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(flag);
        } catch (error) {
          logger.error(
            `🚩 [FeatureFlags v2.0] Error in flag listener for '${flagName}'`,
            'FeatureFlags',
            error
          );
        }
      });
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Hash string for consistent user assignment
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update internal metrics
   */
  private static updateMetrics(): void {
    this.metrics.totalFlags = this.flags.size;
    this.metrics.enabledFlags = Array.from(this.flags.values()).filter(
      f => f.enabled
    ).length;
    this.metrics.activeABTests = Array.from(this.abTests.values()).filter(
      t => t.active
    ).length;
    this.metrics.flagUpdates++;
  }

  /**
   * Helper to read environment variable with default
   */
  private static getEnvFlag(envVar: string, defaultValue: boolean): boolean {
    const value = process.env[envVar];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  // ============================================
  // ENHANCED QUERY METHODS
  // ============================================

  /**
   * Get all flags with enhanced filtering
   */
  static getAllFlags(filters?: {
    module?: string;
    enabled?: boolean;
    tags?: string[];
    hasABTest?: boolean;
  }): FeatureFlag[] {
    let flags = Array.from(this.flags.values());

    if (filters) {
      if (filters.module) {
        flags = flags.filter(flag => flag.module === filters.module);
      }
      if (filters.enabled !== undefined) {
        flags = flags.filter(flag => flag.enabled === filters.enabled);
      }
      if (filters.tags) {
        flags = flags.filter(
          flag =>
            flag.tags && filters.tags!.some(tag => flag.tags!.includes(tag))
        );
      }
      if (filters.hasABTest) {
        const abTestFlags = new Set(
          Array.from(this.abTests.values()).map(t => t.flagName)
        );
        flags = flags.filter(flag => abTestFlags.has(flag.name));
      }
    }

    return flags;
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
   * Get feature flag status summary with enhanced metrics
   */
  static getStatus(): any {
    const flags = this.getAllFlags();
    const flagsByModule = {};

    flags.forEach(flag => {
      const module = flag.module || 'core';
      if (!flagsByModule[module]) {
        flagsByModule[module] = { total: 0, enabled: 0, flags: [] };
      }
      flagsByModule[module].total++;
      if (flag.enabled) flagsByModule[module].enabled++;
      flagsByModule[module].flags.push(flag.name);
    });

    return {
      version: '2.0',
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        totalFlags: flags.length,
        enabledFlags: flags.filter(f => f.enabled).length,
        disabledFlags: flags.filter(f => !f.enabled).length,
        moduleFlags: flags.filter(f => f.module).length,
        abTests: this.abTests.size,
        auditEntries: this.auditLog.length,
      },
      flagsByModule,
      flags: flags.reduce((acc, flag) => {
        acc[flag.name] = {
          enabled: flag.enabled,
          description: flag.description,
          module: flag.module,
          version: flag.version,
          dependencies: flag.dependencies,
          rolloutPercentage: flag.rolloutPercentage,
          tags: flag.tags,
        };
        return acc;
      }, {}),
      abTests: Array.from(this.abTests.entries()).reduce(
        (acc, [name, test]) => {
          acc[name] = {
            flagName: test.flagName,
            active: test.active,
            variants: test.variants,
            startDate: test.startDate,
            endDate: test.endDate,
          };
          return acc;
        },
        {}
      ),
    };
  }

  /**
   * Get comprehensive diagnostics
   */
  static getDiagnostics(): any {
    return {
      version: '2.0',
      timestamp: new Date().toISOString(),
      health: {
        totalFlags: this.flags.size,
        validDependencies: this.validateAllDependencies(),
        conflictingFlags: this.detectConflicts(),
        expiredFlags: this.getExpiredFlags(),
      },
      performance: this.metrics,
      audit: {
        totalEntries: this.auditLog.length,
        recentEntries: this.auditLog.slice(-10),
      },
      listeners: Array.from(this.listeners.keys()),
    };
  }

  /**
   * Validate all flag dependencies
   */
  private static validateAllDependencies(): boolean {
    try {
      for (const flag of this.flags.values()) {
        this.validateFlagDependencies(flag);
      }
      return true;
    } catch (error) {
      logger.error(
        '🚩 [FeatureFlags v2.0] Dependency validation failed',
        'FeatureFlags',
        error
      );
      return false;
    }
  }

  /**
   * Detect conflicting flags
   */
  private static detectConflicts(): string[] {
    const conflicts = [];
    for (const flag of this.flags.values()) {
      if (flag.conflictsWith && flag.enabled) {
        for (const conflictFlag of flag.conflictsWith) {
          const other = this.flags.get(conflictFlag);
          if (other && other.enabled) {
            conflicts.push(`${flag.name} conflicts with ${conflictFlag}`);
          }
        }
      }
    }
    return conflicts;
  }

  /**
   * Get expired flags
   */
  private static getExpiredFlags(): string[] {
    const now = new Date();
    return Array.from(this.flags.values())
      .filter(flag => flag.expirationDate && now > flag.expirationDate)
      .map(flag => flag.name);
  }
}

// ============================================
// INITIALIZATION ON IMPORT
// ============================================

// Auto-initialize feature flags when module is imported
FeatureFlags.initialize();

// ============================================
// CONVENIENCE FUNCTIONS (BACKWARDS COMPATIBLE)
// ============================================

export const isModuleEnabled = (
  moduleName: string,
  context?: { userId?: string; tenantId?: string }
): boolean => FeatureFlags.isModuleEnabled(moduleName, context);

export const isFeatureEnabled = (
  featureName: string,
  context?: { userId?: string; tenantId?: string }
): boolean => FeatureFlags.isEnabled(featureName, context);

// ✅ NEW v2.0: Enhanced convenience functions
export const createABTest = (config: ABTestConfig, createdBy?: string): void =>
  FeatureFlags.createABTest(config, createdBy);

export const evaluateABTest = (
  testName: string,
  userId: string
): 'control' | 'treatment' | null =>
  FeatureFlags.evaluateABTest(testName, userId);

export const updateFlag = (
  name: string,
  updates: Partial<FeatureFlag>,
  updatedBy?: string,
  reason?: string
): void => FeatureFlags.updateFlag(name, updates, updatedBy, reason);

export const addFlagListener = (
  flagName: string,
  callback: (flag: FeatureFlag) => void
): void => FeatureFlags.addListener(flagName, callback);

export const getFlagAuditLog = (
  flagName: string,
  limit?: number
): FlagAuditEntry[] => FeatureFlags.getFlagAuditLog(flagName, limit);
