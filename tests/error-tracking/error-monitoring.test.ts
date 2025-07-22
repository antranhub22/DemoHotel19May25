import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';

// Error Tracking Configuration
interface ErrorTrackingConfig {
  enabledEnvironments: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  captureUnhandledRejections: boolean;
  captureConsoleErrors: boolean;
  maxErrorsPerSession: number;
  reportingEndpoint: string;
}

// Error Types
interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  component?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  context: Record<string, any>;
  resolved: boolean;
}

interface ErrorReport {
  errors: ErrorEvent[];
  summary: {
    totalErrors: number;
    criticalErrors: number;
    unresolvedErrors: number;
    topErrorCategories: string[];
    errorTrends: Record<string, number>;
  };
  recommendations: string[];
}

// Mock Error Tracking System
class ErrorTrackingSystem {
  private config: ErrorTrackingConfig;
  private errors: ErrorEvent[] = [];
  private sessionId: string;
  private isEnabled: boolean = false;

  constructor(config: ErrorTrackingConfig) {
    this.config = config;
    this.sessionId = `session-${Date.now()}`;
  }

  enable(): void {
    this.isEnabled = true;

    if (this.config.captureUnhandledRejections) {
      this.setupUnhandledRejectionCapture();
    }

    if (this.config.captureConsoleErrors) {
      this.setupConsoleErrorCapture();
    }

    console.log('🔍 Error tracking enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('🔍 Error tracking disabled');
  }

  private setupUnhandledRejectionCapture(): void {
    // Mock unhandled rejection capture
    process.on('unhandledRejection', (reason, promise) => {
      this.captureError(new Error(`Unhandled Promise Rejection: ${reason}`), {
        severity: 'critical',
        category: 'unhandled-rejection',
        context: { promise: promise.toString() },
      });
    });
  }

  private setupConsoleErrorCapture(): void {
    // Mock console error capture
    const originalError = console.error;
    console.error = (...args) => {
      if (this.isEnabled) {
        this.captureError(new Error(args.join(' ')), {
          severity: 'medium',
          category: 'console-error',
          context: { args },
        });
      }
      originalError(...args);
    };
  }

  captureError(
    error: Error,
    options: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      category?: string;
      component?: string;
      userId?: string;
      context?: Record<string, any>;
    } = {}
  ): void {
    if (!this.isEnabled) return;

    if (this.errors.length >= this.config.maxErrorsPerSession) {
      console.warn('⚠️ Maximum errors per session reached');
      return;
    }

    const errorEvent: ErrorEvent = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: (error as any)?.message || String(error),
      stack: (error as any)?.stack,
      severity: options.severity || 'medium',
      category: options.category || 'general',
      component: options.component,
      userId: options.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      context: options.context || {},
      resolved: false,
    };

    this.errors.push(errorEvent);

    // Log based on severity
    switch (errorEvent.severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', errorEvent.message);
        break;
      case 'high':
        console.error('❗ HIGH SEVERITY ERROR:', errorEvent.message);
        break;
      case 'medium':
        console.warn('⚠️ ERROR:', errorEvent.message);
        break;
      case 'low':
        console.info('ℹ️ Minor error:', errorEvent.message);
        break;
    }

    // Simulate sending to reporting endpoint
    this.sendErrorReport(errorEvent);
  }

  private sendErrorReport(error: ErrorEvent): void {
    // Mock sending error to remote endpoint
    console.log(
      `📡 Sending error report to ${this.config.reportingEndpoint}:`,
      error.id
    );
  }

  getErrors(filter?: {
    category?: string;
    severity?: string;
    resolved?: boolean;
    component?: string;
  }): ErrorEvent[] {
    let filteredErrors = this.errors;

    if (filter) {
      if (filter.category) {
        filteredErrors = filteredErrors.filter(
          e => e.category === filter.category
        );
      }
      if (filter.severity) {
        filteredErrors = filteredErrors.filter(
          e => e.severity === filter.severity
        );
      }
      if (filter.resolved !== undefined) {
        filteredErrors = filteredErrors.filter(
          e => e.resolved === filter.resolved
        );
      }
      if (filter.component) {
        filteredErrors = filteredErrors.filter(
          e => e.component === filter.component
        );
      }
    }

    return filteredErrors;
  }

  generateErrorReport(): ErrorReport {
    const totalErrors = this.errors.length;
    const criticalErrors = this.errors.filter(
      e => e.severity === 'critical'
    ).length;
    const unresolvedErrors = this.errors.filter(e => !e.resolved).length;

    // Get top error categories
    const categoryCount: Record<string, number> = {};
    this.errors.forEach(error => {
      categoryCount[error.category] = (categoryCount[error.category] || 0) + 1;
    });
    const topErrorCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    // Generate error trends (mock hourly data)
    const errorTrends: Record<string, number> = {};
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().slice(0, 13);
      errorTrends[hourKey] = Math.floor(Math.random() * 10);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalErrors > 0) {
      recommendations.push(
        'Address critical errors immediately to prevent system instability'
      );
    }
    if (unresolvedErrors > 10) {
      recommendations.push(
        'Review and resolve pending errors to improve system reliability'
      );
    }
    if (categoryCount['voice-assistant'] > 5) {
      recommendations.push(
        'Consider voice assistant component refactoring to reduce error rate'
      );
    }
    if (categoryCount['memory'] > 3) {
      recommendations.push(
        'Implement memory cleanup procedures to prevent memory leaks'
      );
    }

    return {
      errors: this.errors,
      summary: {
        totalErrors,
        criticalErrors,
        unresolvedErrors,
        topErrorCategories,
        errorTrends,
      },
      recommendations,
    };
  }

  resolveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      console.log(`✅ Error resolved: ${errorId}`);
    }
  }

  clearErrors(): void {
    this.errors = [];
    console.log('🧹 Error history cleared');
  }
}

// Mock Voice Assistant Error Scenarios
class VoiceAssistantErrorSimulator {
  private errorTracker: ErrorTrackingSystem;

  constructor(errorTracker: ErrorTrackingSystem) {
    this.errorTracker = errorTracker;
  }

  simulateVoiceActivationError(): void {
    this.errorTracker.captureError(
      new Error('Failed to initialize voice recognition'),
      {
        severity: 'high',
        category: 'voice-assistant',
        component: 'VoiceActivation',
        context: {
          microphone: 'permission_denied',
          browser: 'chrome',
          userAgent: 'Mozilla/5.0...',
        },
      }
    );
  }

  simulateLanguageSwitchError(): void {
    this.errorTracker.captureError(
      new Error('Language model not found for: ko'),
      {
        severity: 'medium',
        category: 'voice-assistant',
        component: 'LanguageSwitcher',
        context: {
          requestedLanguage: 'ko',
          availableLanguages: ['en', 'vi', 'fr'],
          fallbackUsed: true,
        },
      }
    );
  }

  simulateTranscriptProcessingError(): void {
    this.errorTracker.captureError(
      new Error('Transcript processing timeout after 30 seconds'),
      {
        severity: 'medium',
        category: 'voice-assistant',
        component: 'TranscriptProcessor',
        context: {
          transcriptLength: 1500,
          processingTime: 30000,
          retryAttempts: 3,
        },
      }
    );
  }

  simulateNetworkError(): void {
    this.errorTracker.captureError(
      new Error('Network request failed: Connection timeout'),
      {
        severity: 'high',
        category: 'network',
        component: 'ApiClient',
        context: {
          endpoint: '/api/voice/process',
          timeout: 5000,
          retryCount: 2,
        },
      }
    );
  }

  simulateMemoryError(): void {
    this.errorTracker.captureError(
      new Error('Memory allocation failed: Out of memory'),
      {
        severity: 'critical',
        category: 'memory',
        component: 'AudioProcessor',
        context: {
          requestedMemory: '512MB',
          availableMemory: '256MB',
          activeComponents: ['voice', 'transcript', 'ui'],
        },
      }
    );
  }
}

describe('Error Tracking & Monitoring System Tests', () => {
  let errorTracker: ErrorTrackingSystem;
  let voiceErrorSimulator: VoiceAssistantErrorSimulator;

  const testConfig: ErrorTrackingConfig = {
    enabledEnvironments: ['development', 'production'],
    logLevel: 'warn',
    captureUnhandledRejections: true,
    captureConsoleErrors: true,
    maxErrorsPerSession: 100,
    reportingEndpoint: 'https://api.errortracking.com/report',
  };

  beforeAll(() => {
    errorTracker = new ErrorTrackingSystem(testConfig);
    voiceErrorSimulator = new VoiceAssistantErrorSimulator(errorTracker);
  });

  beforeEach(() => {
    errorTracker.clearErrors();
  });

  afterAll(() => {
    errorTracker.disable();
  });

  describe('Error Tracking System Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(errorTracker).toBeDefined();
      expect(testConfig.maxErrorsPerSession).toBe(100);
      expect(testConfig.captureUnhandledRejections).toBe(true);
    });

    it('should enable and disable error tracking', () => {
      errorTracker.enable();
      expect(errorTracker['isEnabled']).toBe(true);

      errorTracker.disable();
      expect(errorTracker['isEnabled']).toBe(false);
    });
  });

  describe('Error Capture and Classification', () => {
    beforeEach(() => {
      errorTracker.enable();
    });

    it('should capture voice assistant errors with correct metadata', () => {
      voiceErrorSimulator.simulateVoiceActivationError();

      const errors = errorTracker.getErrors({ category: 'voice-assistant' });
      expect(errors).toHaveLength(1);

      const error = errors[0];
      expect(error.category).toBe('voice-assistant');
      expect(error.component).toBe('VoiceActivation');
      expect(error.severity).toBe('high');
      expect((error as any)?.message || String(error)).toContain('voice recognition');
      expect(error.context.microphone).toBe('permission_denied');
    });

    it('should capture and classify different error severities', () => {
      // Low severity
      errorTracker.captureError(new Error('Minor UI glitch'), {
        severity: 'low',
      });

      // Medium severity
      voiceErrorSimulator.simulateLanguageSwitchError();

      // High severity
      voiceErrorSimulator.simulateNetworkError();

      // Critical severity
      voiceErrorSimulator.simulateMemoryError();

      const allErrors = errorTracker.getErrors();
      expect(allErrors).toHaveLength(4);

      const criticalErrors = errorTracker.getErrors({ severity: 'critical' });
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].category).toBe('memory');

      const highErrors = errorTracker.getErrors({ severity: 'high' });
      expect(highErrors).toHaveLength(1);
      expect(highErrors[0].category).toBe('network');
    });

    it('should limit errors per session', () => {
      // Set a lower limit for testing
      const limitedTracker = new ErrorTrackingSystem({
        ...testConfig,
        maxErrorsPerSession: 3,
      });
      limitedTracker.enable();

      // Try to capture 5 errors
      for (let i = 0; i < 5; i++) {
        limitedTracker.captureError(new Error(`Test error ${i}`));
      }

      const errors = limitedTracker.getErrors();
      expect(errors).toHaveLength(3); // Should be limited to 3
    });
  });

  describe('Error Filtering and Querying', () => {
    beforeEach(() => {
      errorTracker.enable();

      // Setup test data
      voiceErrorSimulator.simulateVoiceActivationError();
      voiceErrorSimulator.simulateLanguageSwitchError();
      voiceErrorSimulator.simulateNetworkError();
      voiceErrorSimulator.simulateMemoryError();
    });

    it('should filter errors by category', () => {
      const voiceErrors = errorTracker.getErrors({
        category: 'voice-assistant',
      });
      expect(voiceErrors).toHaveLength(2);
      expect(voiceErrors.every(e => e.category === 'voice-assistant')).toBe(
        true
      );

      const networkErrors = errorTracker.getErrors({ category: 'network' });
      expect(networkErrors).toHaveLength(1);
      expect(networkErrors[0].component).toBe('ApiClient');
    });

    it('should filter errors by severity', () => {
      const criticalErrors = errorTracker.getErrors({ severity: 'critical' });
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].category).toBe('memory');

      const highErrors = errorTracker.getErrors({ severity: 'high' });
      expect(highErrors.length).toBeGreaterThan(0);
    });

    it('should filter errors by component', () => {
      const languageErrors = errorTracker.getErrors({
        component: 'LanguageSwitcher',
      });
      expect(languageErrors).toHaveLength(1);
      expect(languageErrors[0].context.requestedLanguage).toBe('ko');
    });

    it('should filter errors by resolution status', () => {
      const allErrors = errorTracker.getErrors();
      const firstErrorId = allErrors[0].id;

      // Resolve one error
      errorTracker.resolveError(firstErrorId);

      const unresolvedErrors = errorTracker.getErrors({ resolved: false });
      const resolvedErrors = errorTracker.getErrors({ resolved: true });

      expect(unresolvedErrors).toHaveLength(3);
      expect(resolvedErrors).toHaveLength(1);
      expect(resolvedErrors[0].id).toBe(firstErrorId);
    });
  });

  describe('Error Reporting and Analytics', () => {
    beforeEach(() => {
      errorTracker.enable();

      // Generate diverse error scenarios
      voiceErrorSimulator.simulateVoiceActivationError();
      voiceErrorSimulator.simulateLanguageSwitchError();
      voiceErrorSimulator.simulateTranscriptProcessingError();
      voiceErrorSimulator.simulateNetworkError();
      voiceErrorSimulator.simulateMemoryError();
    });

    it('should generate comprehensive error report', () => {
      const report = errorTracker.generateErrorReport();

      expect(report.summary.totalErrors).toBe(5);
      expect(report.summary.criticalErrors).toBe(1);
      expect(report.summary.unresolvedErrors).toBe(5);

      expect(report.summary.topErrorCategories).toContain('voice-assistant');
      expect(report.summary.topErrorCategories).toContain('network');
      expect(report.summary.topErrorCategories).toContain('memory');

      expect(report.errors).toHaveLength(5);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', () => {
      const report = errorTracker.generateErrorReport();

      expect(report.recommendations).toContain(
        'Address critical errors immediately to prevent system instability'
      );

      expect(
        report.recommendations.some(r => r.includes('voice assistant'))
      ).toBe(true);
    });

    it('should track error trends over time', () => {
      const report = errorTracker.generateErrorReport();

      expect(report.summary.errorTrends).toBeDefined();
      expect(Object.keys(report.summary.errorTrends)).toHaveLength(24); // 24 hours

      // All trend values should be numbers
      Object.values(report.summary.errorTrends).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Voice Assistant Specific Error Scenarios', () => {
    beforeEach(() => {
      errorTracker.enable();
    });

    it('should handle microphone permission errors', () => {
      voiceErrorSimulator.simulateVoiceActivationError();

      const errors = errorTracker.getErrors({ component: 'VoiceActivation' });
      expect(errors).toHaveLength(1);
      expect(errors[0].context.microphone).toBe('permission_denied');
      expect(errors[0].severity).toBe('high');
    });

    it('should handle language model errors', () => {
      voiceErrorSimulator.simulateLanguageSwitchError();

      const errors = errorTracker.getErrors({ component: 'LanguageSwitcher' });
      expect(errors).toHaveLength(1);
      expect(errors[0].context.requestedLanguage).toBe('ko');
      expect(errors[0].context.fallbackUsed).toBe(true);
    });

    it('should handle transcript processing timeouts', () => {
      voiceErrorSimulator.simulateTranscriptProcessingError();

      const errors = errorTracker.getErrors({
        component: 'TranscriptProcessor',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].context.processingTime).toBe(30000);
      expect(errors[0].context.retryAttempts).toBe(3);
    });

    it('should handle memory allocation errors', () => {
      voiceErrorSimulator.simulateMemoryError();

      const errors = errorTracker.getErrors({ category: 'memory' });
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('critical');
      expect(errors[0].context.requestedMemory).toBe('512MB');
    });
  });

  describe('Error Resolution and Management', () => {
    beforeEach(() => {
      errorTracker.enable();
      voiceErrorSimulator.simulateVoiceActivationError();
      voiceErrorSimulator.simulateNetworkError();
    });

    it('should mark errors as resolved', () => {
      const errors = errorTracker.getErrors();
      const firstErrorId = errors[0].id;

      errorTracker.resolveError(firstErrorId);

      const resolvedErrors = errorTracker.getErrors({ resolved: true });
      const unresolvedErrors = errorTracker.getErrors({ resolved: false });

      expect(resolvedErrors).toHaveLength(1);
      expect(unresolvedErrors).toHaveLength(1);
      expect(resolvedErrors[0].id).toBe(firstErrorId);
    });

    it('should clear error history', () => {
      expect(errorTracker.getErrors()).toHaveLength(2);

      errorTracker.clearErrors();

      expect(errorTracker.getErrors()).toHaveLength(0);
    });
  });

  describe('Performance Under Error Load', () => {
    it('should handle high-frequency error reporting', () => {
      errorTracker.enable();

      const startTime = Date.now();

      // Generate 100 errors rapidly
      for (let i = 0; i < 100; i++) {
        errorTracker.captureError(new Error(`Bulk error ${i}`), {
          category: 'performance-test',
          severity: 'low',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle 100 errors quickly
      expect(duration).toBeLessThan(1000); // Less than 1 second
      expect(errorTracker.getErrors()).toHaveLength(100);
    });

    it('should maintain performance during error analysis', () => {
      errorTracker.enable();

      // Generate diverse error data
      for (let i = 0; i < 50; i++) {
        const errorTypes = ['voice-assistant', 'network', 'memory', 'ui'];
        const severities = ['low', 'medium', 'high', 'critical'] as const;

        errorTracker.captureError(new Error(`Test error ${i}`), {
          category: errorTypes[i % errorTypes.length],
          severity: severities[i % severities.length],
          component: `Component-${i % 10}`,
        });
      }

      const startTime = Date.now();
      const report = errorTracker.generateErrorReport();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Report generation should be fast
      expect(report.summary.totalErrors).toBe(50);
      expect(report.summary.topErrorCategories.length).toBeGreaterThan(0);
    });
  });
});
