/**
 * 🛡️ ADVANCED ERROR HANDLING SYSTEM
 *
 * Enterprise-grade error handling with:
 * - Intelligent retry logic
 * - Circuit breaker pattern
 * - Error categorization
 * - Automatic recovery
 * - Performance impact mitigation
 * - Comprehensive logging
 */

import { logger } from "../utils/logger";

export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  DATABASE = "database",
  NETWORK = "network",
  EXTERNAL_API = "external_api",
  SYSTEM = "system",
  BUSINESS_LOGIC = "business_logic",
  TIMEOUT = "timeout",
  RESOURCE_EXHAUSTED = "resource_exhausted",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorContext {
  operation: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialBase: number;
  jitter: boolean;
  retryableErrorTypes: ErrorType[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // milliseconds
  monitoringPeriod: number; // milliseconds
}

export enum CircuitBreakerState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Circuit is open, requests fail fast
  HALF_OPEN = "half_open", // Testing if service is recovered
}

export class DatabaseError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly isRetryable: boolean;
  public readonly statusCode: number;

  constructor(
    message: string,
    type: ErrorType,
    severity: ErrorSeverity,
    context: ErrorContext,
    isRetryable: boolean = false,
    statusCode: number = 500,
  ) {
    super(message);
    this.name = "DatabaseError";
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.isRetryable = isRetryable;
    this.statusCode = statusCode;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
    this.context.stackTrace = this.stack;
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      isRetryable: this.isRetryable,
      statusCode: this.statusCode,
    };
  }
}

interface RetryAttempt {
  attemptNumber: number;
  delay: number;
  error: Error;
  timestamp: Date;
}

interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextRetryTime?: Date;
}

export class ErrorHandler {
  private retryConfig: RetryConfig;
  private circuitBreakerConfig: CircuitBreakerConfig;
  private circuitBreakerStats: Map<string, CircuitBreakerStats> = new Map();
  private errorMetrics: Map<string, number> = new Map();

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitBreakerConfig: Partial<CircuitBreakerConfig> = {},
  ) {
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      exponentialBase: 2,
      jitter: true,
      retryableErrorTypes: [
        ErrorType.DATABASE,
        ErrorType.NETWORK,
        ErrorType.EXTERNAL_API,
        ErrorType.TIMEOUT,
        ErrorType.SYSTEM,
      ],
      ...retryConfig,
    };

    this.circuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      ...circuitBreakerConfig,
    };
  }

  /**
   * 🎯 EXECUTE OPERATION WITH RETRY AND CIRCUIT BREAKER
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    operationKey: string = context.operation,
  ): Promise<T> {
    // Check circuit breaker
    const circuitBreakerState = this.getCircuitBreakerState(operationKey);
    if (circuitBreakerState === CircuitBreakerState.OPEN) {
      throw new DatabaseError(
        "Circuit breaker is open - operation blocked",
        ErrorType.SYSTEM,
        ErrorSeverity.HIGH,
        context,
        false,
        503,
      );
    }

    const attempts: RetryAttempt[] = [];
    let lastError: Error | null = null;

    for (
      let attemptNumber = 1;
      attemptNumber <= this.retryConfig.maxAttempts;
      attemptNumber++
    ) {
      try {
        logger.debug("[ErrorHandler] Attempting operation", "ErrorHandler", {
          operation: context.operation,
          attemptNumber,
          maxAttempts: this.retryConfig.maxAttempts,
          operationKey,
        });

        const result = await operation();

        // Success - record metrics and reset circuit breaker
        this.recordSuccess(operationKey);

        if (attemptNumber > 1) {
          logger.success(
            "[ErrorHandler] Operation succeeded after retry",
            "ErrorHandler",
            {
              operation: context.operation,
              attemptNumber,
              totalAttempts: attempts.length + 1,
              operationKey,
            },
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        const databaseError = this.classifyError(error as Error, context);

        // Record attempt
        const delay = this.calculateDelay(attemptNumber);
        attempts.push({
          attemptNumber,
          delay,
          error: databaseError,
          timestamp: new Date(),
        });

        // Log attempt
        logger.warn("[ErrorHandler] Operation attempt failed", "ErrorHandler", {
          operation: context.operation,
          attemptNumber,
          errorType: databaseError.type,
          errorSeverity: databaseError.severity,
          isRetryable: databaseError.isRetryable,
          nextDelay: delay,
          operationKey,
          errorMessage: databaseError.message,
        });

        // Record failure metrics
        this.recordFailure(operationKey, databaseError);

        // Check if we should retry
        if (
          attemptNumber === this.retryConfig.maxAttempts ||
          !databaseError.isRetryable
        ) {
          break;
        }

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    // All attempts failed
    const finalError = lastError
      ? this.classifyError(lastError, context)
      : new DatabaseError(
          "Unknown error occurred",
          ErrorType.SYSTEM,
          ErrorSeverity.HIGH,
          context,
        );

    logger.error("[ErrorHandler] All retry attempts failed", "ErrorHandler", {
      operation: context.operation,
      totalAttempts: attempts.length,
      operationKey,
      attempts: attempts.map((a) => ({
        attempt: a.attemptNumber,
        errorType: (a.error as DatabaseError).type,
        delay: a.delay,
      })),
      finalError: finalError.toJSON(),
    });

    throw finalError;
  }

  /**
   * 🎯 CLASSIFY ERROR TYPE AND SEVERITY
   */
  classifyError(error: Error, context: ErrorContext): DatabaseError {
    // If already a DatabaseError, return as-is
    if (error instanceof DatabaseError) {
      return error;
    }

    const message = error.message.toLowerCase();
    let type: ErrorType;
    let severity: ErrorSeverity;
    let isRetryable: boolean;
    let statusCode: number;

    // Database-specific errors
    if (this.isDatabaseConnectionError(message)) {
      type = ErrorType.DATABASE;
      severity = ErrorSeverity.HIGH;
      isRetryable = true;
      statusCode = 503;
    } else if (this.isDatabaseTimeoutError(message)) {
      type = ErrorType.TIMEOUT;
      severity = ErrorSeverity.MEDIUM;
      isRetryable = true;
      statusCode = 504;
    } else if (this.isDatabaseConstraintError(message)) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      isRetryable = false;
      statusCode = 400;
    } else if (this.isDatabaseAuthError(message)) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
      isRetryable = false;
      statusCode = 401;
    } else if (this.isNetworkError(message)) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      isRetryable = true;
      statusCode = 503;
    } else if (this.isResourceExhaustedError(message)) {
      type = ErrorType.RESOURCE_EXHAUSTED;
      severity = ErrorSeverity.HIGH;
      isRetryable = true;
      statusCode = 503;
    } else if (this.isRateLimitError(message)) {
      type = ErrorType.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
      isRetryable = true;
      statusCode = 429;
    } else {
      type = ErrorType.SYSTEM;
      severity = ErrorSeverity.MEDIUM;
      isRetryable = false;
      statusCode = 500;
    }

    return new DatabaseError(
      error.message,
      type,
      severity,
      {
        ...context,
        stackTrace: error.stack,
      },
      isRetryable,
      statusCode,
    );
  }

  /**
   * 🎯 GET CIRCUIT BREAKER STATE
   */
  getCircuitBreakerState(operationKey: string): CircuitBreakerState {
    const stats = this.circuitBreakerStats.get(operationKey);
    if (!stats) {
      this.circuitBreakerStats.set(operationKey, {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        successCount: 0,
      });
      return CircuitBreakerState.CLOSED;
    }

    const now = new Date();

    // Check if we should transition from OPEN to HALF_OPEN
    if (
      stats.state === CircuitBreakerState.OPEN &&
      stats.nextRetryTime &&
      now >= stats.nextRetryTime
    ) {
      stats.state = CircuitBreakerState.HALF_OPEN;
      logger.info(
        "[ErrorHandler] Circuit breaker transitioning to HALF_OPEN",
        "ErrorHandler",
        {
          operationKey,
          lastFailureTime: stats.lastFailureTime,
        },
      );
    }

    return stats.state;
  }

  /**
   * 🎯 RECORD SUCCESS
   */
  private recordSuccess(operationKey: string): void {
    const stats = this.circuitBreakerStats.get(operationKey);
    if (stats) {
      stats.successCount++;
      stats.lastSuccessTime = new Date();

      // Reset circuit breaker if it was HALF_OPEN
      if (stats.state === CircuitBreakerState.HALF_OPEN) {
        stats.state = CircuitBreakerState.CLOSED;
        stats.failureCount = 0;
        logger.info(
          "[ErrorHandler] Circuit breaker reset to CLOSED",
          "ErrorHandler",
          {
            operationKey,
            successCount: stats.successCount,
          },
        );
      }
    }
  }

  /**
   * 🎯 RECORD FAILURE
   */
  private recordFailure(operationKey: string, error: DatabaseError): void {
    // Update error metrics
    const errorKey = `${operationKey}:${error.type}`;
    this.errorMetrics.set(errorKey, (this.errorMetrics.get(errorKey) || 0) + 1);

    // Update circuit breaker stats
    let stats = this.circuitBreakerStats.get(operationKey);
    if (!stats) {
      stats = {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        successCount: 0,
      };
      this.circuitBreakerStats.set(operationKey, stats);
    }

    stats.failureCount++;
    stats.lastFailureTime = new Date();

    // Check if we should open the circuit breaker
    if (
      stats.state === CircuitBreakerState.CLOSED &&
      stats.failureCount >= this.circuitBreakerConfig.failureThreshold
    ) {
      stats.state = CircuitBreakerState.OPEN;
      stats.nextRetryTime = new Date(
        Date.now() + this.circuitBreakerConfig.resetTimeout,
      );

      logger.error("[ErrorHandler] Circuit breaker opened", "ErrorHandler", {
        operationKey,
        failureCount: stats.failureCount,
        threshold: this.circuitBreakerConfig.failureThreshold,
        nextRetryTime: stats.nextRetryTime,
      });
    }
  }

  /**
   * 🎯 CALCULATE RETRY DELAY
   */
  private calculateDelay(attemptNumber: number): number {
    const exponentialDelay =
      this.retryConfig.baseDelay *
      Math.pow(this.retryConfig.exponentialBase, attemptNumber - 1);

    let delay = Math.min(exponentialDelay, this.retryConfig.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      const jitterRange = delay * 0.1; // 10% jitter
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      delay = Math.max(0, delay + jitter);
    }

    return Math.floor(delay);
  }

  /**
   * 🎯 DELAY HELPER
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ======================================
  // ERROR CLASSIFICATION HELPERS
  // ======================================

  private isDatabaseConnectionError(message: string): boolean {
    const connectionErrors = [
      "connection terminated",
      "connection refused",
      "connection reset",
      "connection timeout",
      "connection closed",
      "server closed the connection",
      "connection lost",
      "database is not available",
      "could not connect to server",
    ];
    return connectionErrors.some((error) => message.includes(error));
  }

  private isDatabaseTimeoutError(message: string): boolean {
    const timeoutErrors = [
      "timeout",
      "timed out",
      "query timeout",
      "connection timeout",
      "statement timeout",
    ];
    return timeoutErrors.some((error) => message.includes(error));
  }

  private isDatabaseConstraintError(message: string): boolean {
    const constraintErrors = [
      "constraint violation",
      "unique constraint",
      "foreign key constraint",
      "check constraint",
      "not null constraint",
      "duplicate key value",
      "violates foreign key",
      "violates unique constraint",
    ];
    return constraintErrors.some((error) => message.includes(error));
  }

  private isDatabaseAuthError(message: string): boolean {
    const authErrors = [
      "authentication failed",
      "permission denied",
      "access denied",
      "insufficient privileges",
      "role does not exist",
      "password authentication failed",
    ];
    return authErrors.some((error) => message.includes(error));
  }

  private isNetworkError(message: string): boolean {
    const networkErrors = [
      "network error",
      "network timeout",
      "network unreachable",
      "dns lookup failed",
      "connection refused",
      "socket hang up",
      "econnreset",
      "enotfound",
      "enetunreach",
    ];
    return networkErrors.some((error) => message.includes(error));
  }

  private isResourceExhaustedError(message: string): boolean {
    const resourceErrors = [
      "connection pool exhausted",
      "too many connections",
      "resource temporarily unavailable",
      "out of memory",
      "disk full",
      "no space left on device",
      "max connections reached",
    ];
    return resourceErrors.some((error) => message.includes(error));
  }

  private isRateLimitError(message: string): boolean {
    const rateLimitErrors = [
      "rate limit exceeded",
      "too many requests",
      "quota exceeded",
      "throttled",
      "request limit reached",
    ];
    return rateLimitErrors.some((error) => message.includes(error));
  }

  // ======================================
  // PUBLIC METRICS AND MONITORING
  // ======================================

  /**
   * 🎯 GET ERROR METRICS
   */
  getErrorMetrics(): Record<string, number> {
    return Object.fromEntries(this.errorMetrics);
  }

  /**
   * 🎯 GET CIRCUIT BREAKER STATUS
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerStats> {
    return Object.fromEntries(this.circuitBreakerStats);
  }

  /**
   * 🎯 RESET CIRCUIT BREAKER
   */
  resetCircuitBreaker(operationKey: string): boolean {
    const stats = this.circuitBreakerStats.get(operationKey);
    if (stats) {
      stats.state = CircuitBreakerState.CLOSED;
      stats.failureCount = 0;
      stats.nextRetryTime = undefined;

      logger.info(
        "[ErrorHandler] Circuit breaker manually reset",
        "ErrorHandler",
        {
          operationKey,
        },
      );

      return true;
    }
    return false;
  }

  /**
   * 🎯 CLEAR ERROR METRICS
   */
  clearErrorMetrics(): void {
    this.errorMetrics.clear();
    logger.info("[ErrorHandler] Error metrics cleared", "ErrorHandler");
  }

  /**
   * 🎯 UPDATE CONFIGURATION
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
    logger.info("[ErrorHandler] Retry configuration updated", "ErrorHandler", {
      newConfig: this.retryConfig,
    });
  }

  updateCircuitBreakerConfig(config: Partial<CircuitBreakerConfig>): void {
    this.circuitBreakerConfig = { ...this.circuitBreakerConfig, ...config };
    logger.info(
      "[ErrorHandler] Circuit breaker configuration updated",
      "ErrorHandler",
      {
        newConfig: this.circuitBreakerConfig,
      },
    );
  }
}
