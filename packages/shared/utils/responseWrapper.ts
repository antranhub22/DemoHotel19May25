// ============================================================================
// RESPONSE WRAPPER UTILITIES - PHASE 1 REFACTOR
// ============================================================================
// Standardized API response formatting for RequestController
// Ensures consistent response structure across all endpoints

import { ApiResponse } from '@shared/validation/requestSchemas';
import { Response } from 'express';

/**
 * Response Wrapper Class
 * Provides standardized response formatting for all API endpoints
 */
export class ResponseWrapper {
  private static readonly DEFAULT_METADATA = {
    module: 'request-module',
    version: '2.1.0',
    architecture: 'modular-enhanced',
  };

  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    statusCode: number = 200,
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse {
    return {
      success: false,
      error: message,
      code,
      details,
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Create a validation error response
   */
  static validationError(
    errors: Array<{ field: string; message: string }>,
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse {
    return {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Create a not found error response
   */
  static notFound(
    resource: string = 'Resource',
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse {
    return {
      success: false,
      error: `${resource} not found`,
      code: 'NOT_FOUND',
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Create a database error response
   */
  static databaseError(
    message: string = 'Database operation failed',
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse {
    return {
      success: false,
      error: message,
      code: 'DATABASE_ERROR',
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Create a service unavailable response
   */
  static serviceUnavailable(
    message: string = 'Service temporarily unavailable',
    metadata?: Partial<ApiResponse['_metadata']>
  ): ApiResponse {
    return {
      success: false,
      error: message,
      code: 'SERVICE_UNAVAILABLE',
      _metadata: {
        ...this.DEFAULT_METADATA,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Send response to Express Response object
   */
  static sendResponse<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.success(data, statusCode, metadata);
    res.status(statusCode).json(response);
  }

  /**
   * Send error response to Express Response object
   */
  static sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.error(message, statusCode, code, details, metadata);
    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response to Express Response object
   */
  static sendValidationError(
    res: Response,
    errors: Array<{ field: string; message: string }>,
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.validationError(errors, metadata);
    res.status(400).json(response);
  }

  /**
   * Send not found error response to Express Response object
   */
  static sendNotFound(
    res: Response,
    resource: string = 'Resource',
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.notFound(resource, metadata);
    res.status(404).json(response);
  }

  /**
   * Send database error response to Express Response object
   */
  static sendDatabaseError(
    res: Response,
    message: string = 'Database operation failed',
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.databaseError(message, metadata);
    res.status(500).json(response);
  }

  /**
   * Send service unavailable response to Express Response object
   */
  static sendServiceUnavailable(
    res: Response,
    message: string = 'Service temporarily unavailable',
    metadata?: Partial<ApiResponse['_metadata']>
  ): void {
    const response = this.serviceUnavailable(message, metadata);
    res.status(503).json(response);
  }
}

/**
 * Legacy Response Helper (for backward compatibility)
 * Maintains compatibility with existing code while providing new functionality
 */
export class LegacyResponseHelper {
  /**
   * Convert legacy response format to new format
   */
  static convertLegacyResponse(legacyResponse: any): ApiResponse {
    if (legacyResponse.success === false) {
      return ResponseWrapper.error(
        legacyResponse.error || 'Unknown error',
        legacyResponse.statusCode || 500,
        legacyResponse.code,
        legacyResponse.details
      );
    }

    return ResponseWrapper.success(
      legacyResponse.data,
      legacyResponse.statusCode || 200
    );
  }

  /**
   * Check if response is in legacy format
   */
  static isLegacyFormat(response: any): boolean {
    return !response._metadata && response.success !== undefined;
  }

  /**
   * Ensure response is in new format
   */
  static ensureNewFormat(response: any): ApiResponse {
    if (this.isLegacyFormat(response)) {
      return this.convertLegacyResponse(response);
    }
    return response;
  }
}

/**
 * Response Builder for complex responses
 */
export class ResponseBuilder<T = any> {
  private response: Partial<ApiResponse<T>> = {
    success: true,
    _metadata: {
      module: 'request-module',
      version: '2.1.0',
      architecture: 'modular-enhanced',
      timestamp: new Date().toISOString(),
    },
  };

  /**
   * Set success status
   */
  success(): this {
    this.response.success = true;
    return this;
  }

  /**
   * Set error status
   */
  error(): this {
    this.response.success = false;
    return this;
  }

  /**
   * Set data
   */
  data(data: T): this {
    this.response.data = data;
    return this;
  }

  /**
   * Set error message
   */
  errorMessage(message: string): this {
    this.response.error = message;
    return this;
  }

  /**
   * Set error code
   */
  errorCode(code: string): this {
    this.response.code = code;
    return this;
  }

  /**
   * Set error details
   */
  errorDetails(details: any): this {
    this.response.details = details;
    return this;
  }

  /**
   * Set metadata
   */
  metadata(metadata: Partial<ApiResponse['_metadata']>): this {
    this.response._metadata = {
      ...this.response._metadata,
      ...metadata,
    };
    return this;
  }

  /**
   * Build the final response
   */
  build(): ApiResponse<T> {
    return this.response as ApiResponse<T>;
  }

  /**
   * Send response to Express Response object
   */
  send(res: Response, statusCode: number = 200): void {
    const response = this.build();
    res.status(statusCode).json(response);
  }
}

/**
 * Convenience functions for common response patterns
 */
export const createSuccessResponse = <T>(
  data: T,
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.success(data, 200, metadata);

export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any,
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.error(message, 500, code, details, metadata);

export const createValidationErrorResponse = (
  errors: Array<{ field: string; message: string }>,
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.validationError(errors, metadata);

export const createNotFoundResponse = (
  resource: string = 'Resource',
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.notFound(resource, metadata);

export const createDatabaseErrorResponse = (
  message: string = 'Database operation failed',
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.databaseError(message, metadata);

export const createServiceUnavailableResponse = (
  message: string = 'Service temporarily unavailable',
  metadata?: Partial<ApiResponse['_metadata']>
) => ResponseWrapper.serviceUnavailable(message, metadata);
