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
  flagName: string; // The feature flag this A/B test controls
  variants: {
    control: {
      enabled?: boolean;
      percentage: number;
      metadata?: any;
    };
    treatment: {
      enabled?: boolean;
      percentage: number;
      metadata?: any;
    };
  };
  targetAudience?: string[]; // Optional: target specific user segments
  startDate: Date;
  endDate?: Date;
  active: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FlagAuditEntry {
  action: 'create' | 'update' | 'delete' | 'enable' | 'disable';
  flagName: string;
  oldValue?: any;
  newValue?: any;
  updatedBy: string;
  timestamp: Date;
  reason?: string;
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
  // ✅ NEW: Track initialization state
  private static isInitializing = false;

  // ============================================
  // ENHANCED INITIALIZATION
  // ============================================

  /**
   * Initialize enhanced feature flags system v2.0
   */
  static initialize(): void {
    this.isInitializing = true;

    logger.info(
      '🚩 [FeatureFlags v2.0] Initializing advanced feature flags system...',
      'FeatureFlags'
    );

    // Module-level flags with enhanced properties (skip dependency validation during init)
    this.setFlag(
      'tenant-module',
      {
        name: 'tenant-module',
        enabled: this.getEnvFlag('ENABLE_TENANT_MODULE', true),
        description: 'Multi-tenant management module',
        module: 'tenant-module',
        version: '2.0.0',
        tags: ['core', 'security'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'request-module',
      {
        name: 'request-module',
        enabled: this.getEnvFlag('ENABLE_REQUEST_MODULE', true),
        description: 'Request/Order management module',
        module: 'request-module',
        version: '2.0.0',
        dependencies: ['tenant-module'],
        tags: ['core', 'api'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'analytics-module',
      {
        name: 'analytics-module',
        enabled: this.getEnvFlag('ENABLE_ANALYTICS_MODULE', true),
        description: 'Analytics and reporting module',
        module: 'analytics-module',
        version: '2.0.0',
        dependencies: ['tenant-module'],
        tags: ['analytics', 'reporting'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'assistant-module',
      {
        name: 'assistant-module',
        enabled: this.getEnvFlag('ENABLE_ASSISTANT_MODULE', true),
        description: 'AI assistant generation module',
        module: 'assistant-module',
        version: '2.0.0',
        dependencies: ['tenant-module'],
        tags: ['ai', 'voice'],
      },
      'system',
      'System initialization',
      true
    );

    // ✅ NEW v2.0: Advanced feature flags
    this.setFlag(
      'advanced-analytics',
      {
        name: 'advanced-analytics',
        enabled: this.getEnvFlag('ENABLE_ADVANCED_ANALYTICS', false),
        description: 'Advanced analytics features with ML insights',
        module: 'analytics-module',
        version: '2.0.0',
        dependencies: ['analytics-module'],
        rolloutPercentage: 25, // Gradual rollout
        tags: ['analytics', 'ml', 'experimental'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'ab-testing-framework',
      {
        name: 'ab-testing-framework',
        enabled: this.getEnvFlag('ENABLE_AB_TESTING', true),
        description: 'A/B testing framework for feature experimentation',
        module: 'core',
        version: '2.0.0',
        tags: ['experimentation', 'testing'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'module-health-checks',
      {
        name: 'module-health-checks',
        enabled: this.getEnvFlag('ENABLE_MODULE_HEALTH_CHECKS', true),
        description: 'Enhanced module health monitoring',
        version: '2.0.0',
        tags: ['monitoring', 'health'],
      },
      'system',
      'System initialization',
      true
    );

    this.setFlag(
      'real-time-notifications',
      {
        name: 'real-time-notifications',
        enabled: this.getEnvFlag('ENABLE_REAL_TIME_NOTIFICATIONS', true),
        description: 'Real-time WebSocket notifications',
        module: 'core',
        version: '2.0.0',
        dependencies: ['tenant-module'],
        tags: ['realtime', 'websocket'],
      },
      'system',
      'System initialization',
      true
    );

    // Update metrics
    this.updateMetrics();

    this.isInitializing = false;

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
    reason?: string,
    skipDependencyValidation: boolean = false
  ): void {
    const oldFlag = this.flags.get(name);

    // ✅ NEW v2.0: Validate flag dependencies (skip during initialization)
    if (!skipDependencyValidation && !this.isInitializing) {
      this.validateFlagDependencies(flag);
    }

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
   * Update an existing feature flag
   */
  static updateFlag(
    flagName: string,
    updates: Partial<FeatureFlag>,
    updatedBy: string = 'system',
    reason?: string
  ): FeatureFlag | null {
    const existingFlag = this.flags.get(flagName);
    if (!existingFlag) {
      return null;
    }

    const updatedFlag = { ...existingFlag, ...updates, updatedBy };
    this.setFlag(flagName, updatedFlag, updatedBy, reason);

    return updatedFlag;
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

    // ✅ NEW v2.0: Check dependencies (lenient check to avoid recursion issues)
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        const depFlag = this.flags.get(dependency);
        if (depFlag && !depFlag.enabled) {
          logger.debug(
            `🚩 [FeatureFlags v2.0] Flag '${flagName}' disabled due to dependency '${dependency}'`,
            'FeatureFlags'
          );
          return false;
        }
        // If dependency flag doesn't exist, assume it's enabled (lenient mode)
      }
    }

    return true;
  }

  /**
   * Evaluate flag with context for comprehensive analysis
   */
  static evaluateFlag(
    flagName: string,
    context?: { userId?: string; tenantId?: string }
  ): {
    enabled: boolean;
    reason: string;
    rolloutPercentage?: number;
    dependencies?: string[];
    conflicts?: string[];
  } {
    const flag = this.flags.get(flagName);
    if (!flag) {
      return {
        enabled: true,
        reason: 'Unknown flag, defaulting to enabled',
      };
    }

    if (!flag.enabled) {
      return {
        enabled: false,
        reason: 'Flag is disabled',
      };
    }

    // Check expiration
    if (flag.expirationDate && new Date() > flag.expirationDate) {
      return {
        enabled: false,
        reason: 'Flag has expired',
      };
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const userId = context?.userId || 'anonymous';
      const hash = this.hashString(userId + flagName);
      const userPercentile = hash % 100;

      if (userPercentile >= flag.rolloutPercentage) {
        return {
          enabled: false,
          reason: `User not in rollout (${userPercentile}% >= ${flag.rolloutPercentage}%)`,
          rolloutPercentage: flag.rolloutPercentage,
        };
      }
    }

    // Check target audience
    if (flag.targetAudience && context?.userId) {
      if (!flag.targetAudience.includes(context.userId)) {
        return {
          enabled: false,
          reason: 'User not in target audience',
        };
      }
    }

    // Check dependencies
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        const depFlag = this.flags.get(dependency);
        if (depFlag && !depFlag.enabled) {
          return {
            enabled: false,
            reason: `Dependency '${dependency}' is disabled`,
            dependencies: flag.dependencies,
          };
        }
      }
    }

    return {
      enabled: true,
      reason: 'All conditions met',
      rolloutPercentage: flag.rolloutPercentage,
      dependencies: flag.dependencies,
    };
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
   * Update an A/B test
   */
  static updateABTest(
    testName: string,
    updates: Partial<ABTestConfig>,
    updatedBy: string = 'system'
  ): void {
    const existingTest = this.abTests.get(testName);
    if (!existingTest) {
      throw new Error(`A/B test '${testName}' not found`);
    }

    const updatedTest = { ...existingTest, ...updates, updatedAt: new Date() };
    this.abTests.set(testName, updatedTest);

    this.logAudit(
      'update',
      testName,
      existingTest,
      updatedTest,
      updatedBy,
      'A/B test updated'
    );

    logger.info(
      `🧪 [FeatureFlags v2.0] Updated A/B test: ${testName}`,
      'FeatureFlags'
    );
  }

  /**
   * Get A/B test configuration
   */
  static getABTest(testName: string): ABTestConfig | undefined {
    return this.abTests.get(testName);
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

    // Check if test is within date range
    const now = new Date();
    if (now < test.startDate || (test.endDate && now > test.endDate)) {
      return null;
    }

    // Check target audience if specified
    if (test.targetAudience && !test.targetAudience.includes(userId)) {
      return null;
    }

    // Determine variant based on user ID hash
    const hash = this.hashString(userId + testName);
    const userPercentile = hash % 100;

    if (userPercentile < test.variants.control.percentage) {
      return 'control';
    } else {
      return 'treatment';
    }
  }

  /**
   * Get A/B test assignments for a user
   */
  static getABTestAssignments(userId: string): {
    [testName: string]: 'control' | 'treatment';
  } {
    const assignments = {};
    for (const [testName] of this.abTests.entries()) {
      const assignment = this.evaluateABTest(testName, userId);
      if (assignment) {
        assignments[testName] = assignment;
      }
    }
    return assignments;
  }

  /**
   * ✅ BACKWARD COMPATIBILITY: Alias for getABTestAssignments
   * @deprecated Use getABTestAssignments instead
   */
  static getActiveABTests(userId: string): {
    [testName: string]: 'control' | 'treatment';
  } {
    return this.getABTestAssignments(userId);
  }

  // ============================================
  // AUDIT LOGGING
  // ============================================

  /**
   * Get audit log entries
   */
  static getAuditLog(limit?: number): FlagAuditEntry[] {
    const sortedLog = [...this.auditLog].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sortedLog.slice(0, limit) : sortedLog;
  }

  /**
   * Get audit log for a specific flag
   */
  static getFlagAuditLog(flagName: string, limit?: number): FlagAuditEntry[] {
    const flagLog = this.auditLog.filter(entry => entry.flagName === flagName);
    const sortedLog = flagLog.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sortedLog.slice(0, limit) : sortedLog;
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
   * ✅ NEW: Validate all flag dependencies (call after module registration)
   */
  static validateAllFlagDependencies(): { isValid: boolean; errors: string[] } {
    const errors = [];
    let isValid = true;

    try {
      for (const flag of this.flags.values()) {
        if (flag.dependencies) {
          for (const dependency of flag.dependencies) {
            if (!this.flags.has(dependency)) {
              const error = `Flag '${flag.name}' has invalid dependency '${dependency}'`;
              errors.push(error);
              isValid = false;
              logger.warn(`🚩 [FeatureFlags v2.0] ${error}`, 'FeatureFlags');
            }
          }
        }
      }

      if (isValid) {
        logger.success(
          '🚩 [FeatureFlags v2.0] All flag dependencies validated successfully',
          'FeatureFlags'
        );
      } else {
        logger.warn(
          `🚩 [FeatureFlags v2.0] Flag dependency validation found ${errors.length} issues`,
          'FeatureFlags',
          { errors }
        );
      }

      return { isValid, errors };
    } catch (error) {
      logger.error(
        '🚩 [FeatureFlags v2.0] Dependency validation failed',
        'FeatureFlags',
        error
      );
      return { isValid: false, errors: [error.message] };
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
  // LISTENER MANAGEMENT
  // ============================================

  /**
   * Add a listener for flag changes
   */
  static addListener(
    flagName: string,
    listener: (flag: FeatureFlag) => void
  ): void {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, []);
    }
    this.listeners.get(flagName)!.push(listener);
  }

  /**
   * Remove a listener for flag changes
   */
  static removeListener(
    flagName: string,
    listener: (flag: FeatureFlag) => void
  ): void {
    const flagListeners = this.listeners.get(flagName);
    if (flagListeners) {
      const index = flagListeners.indexOf(listener);
      if (index > -1) {
        flagListeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of flag changes
   */
  private static notifyListeners(flagName: string, flag: FeatureFlag): void {
    const flagListeners = this.listeners.get(flagName);
    if (flagListeners) {
      for (const listener of flagListeners) {
        try {
          listener(flag);
        } catch (error) {
          logger.error(
            `🚩 [FeatureFlags v2.0] Listener error for flag '${flagName}'`,
            'FeatureFlags',
            error
          );
        }
      }
    }
  }

  // ============================================
  // METRICS AND DIAGNOSTICS
  // ============================================

  /**
   * Get comprehensive diagnostics
   */
  static getDiagnostics(): any {
    const validation = this.validateAllFlagDependencies();
    const conflicts = this.detectConflicts();

    return {
      version: '2.0',
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      validation: {
        dependenciesValid: validation.isValid,
        dependencyErrors: validation.errors,
        conflicts,
        totalConflicts: conflicts.length,
      },
      flags: {
        total: this.flags.size,
        enabled: Array.from(this.flags.values()).filter(f => f.enabled).length,
        withDependencies: Array.from(this.flags.values()).filter(
          f => f.dependencies
        ).length,
        withRollout: Array.from(this.flags.values()).filter(
          f => f.rolloutPercentage !== undefined
        ).length,
        withExpiration: Array.from(this.flags.values()).filter(
          f => f.expirationDate
        ).length,
      },
      abTests: {
        total: this.abTests.size,
        active: Array.from(this.abTests.values()).filter(t => t.active).length,
      },
      audit: {
        totalEntries: this.auditLog.length,
        recentEntries: this.getAuditLog(5),
      },
      listeners: {
        totalFlags: this.listeners.size,
        totalListeners: Array.from(this.listeners.values()).reduce(
          (sum, listeners) => sum + listeners.length,
          0
        ),
      },
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

  // ============================================
  // INTERNAL HELPER METHODS
  // ============================================

  /**
   * Update internal metrics
   */
  private static updateMetrics(): void {
    const flags = Array.from(this.flags.values());
    this.metrics.totalFlags = flags.length;
    this.metrics.enabledFlags = flags.filter(f => f.enabled).length;
    this.metrics.activeABTests = Array.from(this.abTests.values()).filter(
      t => t.active
    ).length;
  }

  /**
   * Log audit entry
   */
  private static logAudit(
    action: 'create' | 'update' | 'delete' | 'enable' | 'disable',
    flagName: string,
    oldValue: any,
    newValue: any,
    updatedBy: string,
    reason?: string
  ): void {
    this.auditLog.push({
      action,
      flagName,
      oldValue,
      newValue,
      updatedBy,
      timestamp: new Date(),
      reason,
    });
    this.metrics.auditEntries = this.auditLog.length;
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

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if module is enabled (alias for isEnabled)
   */
  static isModuleEnabled(
    moduleName: string,
    context?: { userId?: string; tenantId?: string }
  ): boolean {
    return this.isEnabled(moduleName, context);
  }

  /**
   * Get flag by name
   */
  static getFlag(flagName: string): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  /**
   * Check if flag exists
   */
  static hasFlag(flagName: string): boolean {
    return this.flags.has(flagName);
  }

  /**
   * Get all module flags
   */
  static getModuleFlags(moduleName: string): FeatureFlag[] {
    return this.getAllFlags({ module: moduleName });
  }

  /**
   * Get flags by tag
   */
  static getFlagsByTag(tag: string): FeatureFlag[] {
    return this.getAllFlags({ tags: [tag] });
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
): FeatureFlag | null =>
  FeatureFlags.updateFlag(name, updates, updatedBy, reason);

export const addFlagListener = (
  flagName: string,
  callback: (flag: FeatureFlag) => void
): void => FeatureFlags.addListener(flagName, callback);

export const getFlagAuditLog = (
  flagName: string,
  limit?: number
): FlagAuditEntry[] => FeatureFlags.getFlagAuditLog(flagName, limit);

// ✅ BACKWARD COMPATIBILITY: Export getActiveABTests alias
export const getActiveABTests = (
  userId: string
): {
  [testName: string]: 'control' | 'treatment';
} => FeatureFlags.getActiveABTests(userId);
