// ============================================================================
// REQUEST VALIDATION MIDDLEWARE - PHASE 1 REFACTOR
// ============================================================================
// Input validation middleware for RequestController endpoints
// Provides comprehensive validation with detailed error messages

import { isFeatureEnabled } from '@server/shared/FeatureFlags';
import { logger } from '@shared/utils/logger';
import { ResponseWrapper } from '@shared/utils/responseWrapper';
import {
  CreateRequestSchema,
  formatValidationErrors,
  RequestFiltersSchema,
  RequestIdSchema,
  sanitizeRequestData,
  UpdateRequestStatusSchema,
  validateRequestData,
} from '@shared/validation/requestSchemas';
import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

// ============================================================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create validation middleware for a specific schema
 */
export const createValidationMiddleware = (
  schema: ZodSchema,
  target: 'body' | 'params' | 'query' = 'body',
  options?: {
    enableFeatureFlag?: string;
    sanitize?: boolean;
    logValidation?: boolean;
  }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if validation is enabled via feature flag
      if (
        options?.enableFeatureFlag &&
        !isFeatureEnabled(options.enableFeatureFlag)
      ) {
        logger.debug(
          `🔧 [RequestValidation] Validation disabled for ${options.enableFeatureFlag}`,
          'RequestValidation'
        );
        return next();
      }

      // Get data to validate
      const dataToValidate = req[target];

      // Sanitize data if requested
      const data = options?.sanitize
        ? sanitizeRequestData(dataToValidate)
        : dataToValidate;

      // Validate data
      const validationResult = validateRequestData(schema, data);

      if (validationResult.success) {
        // Store validated data in request for controller to use
        (req as any).validatedData = validationResult.data;

        if (options?.logValidation) {
          logger.debug(
            `✅ [RequestValidation] Validation passed for ${target}`,
            'RequestValidation',
            { dataKeys: Object.keys(validationResult.data) }
          );
        }

        next();
      } else {
        // Format validation errors
        const formattedErrors = formatValidationErrors(validationResult.errors);

        if (options?.logValidation) {
          logger.warn(
            `❌ [RequestValidation] Validation failed for ${target}`,
            'RequestValidation',
            { errors: formattedErrors.details }
          );
        }

        // Send validation error response
        ResponseWrapper.sendValidationError(res, formattedErrors.details);
      }
    } catch (error) {
      logger.error(
        '❌ [RequestValidation] Validation middleware error',
        'RequestValidation',
        error
      );

      ResponseWrapper.sendError(
        res,
        'Validation middleware error',
        500,
        'VALIDATION_MIDDLEWARE_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
};

// ============================================================================
// SPECIFIC VALIDATION MIDDLEWARES
// ============================================================================

/**
 * Validate create request input
 */
export const validateCreateRequest = createValidationMiddleware(
  CreateRequestSchema,
  'body',
  {
    enableFeatureFlag: 'request-validation-v2',
    sanitize: true,
    logValidation: true,
  }
);

/**
 * Validate update request status input
 */
export const validateUpdateRequestStatus = createValidationMiddleware(
  UpdateRequestStatusSchema,
  'body',
  {
    enableFeatureFlag: 'request-validation-v2',
    sanitize: true,
    logValidation: true,
  }
);

/**
 * Validate request filters (query parameters)
 */
export const validateRequestFilters = createValidationMiddleware(
  RequestFiltersSchema,
  'query',
  {
    enableFeatureFlag: 'request-validation-v2',
    sanitize: true,
    logValidation: false,
  }
);

/**
 * Validate request ID parameter
 */
export const validateRequestId = createValidationMiddleware(
  RequestIdSchema,
  'params',
  {
    enableFeatureFlag: 'request-validation-v2',
    sanitize: false,
    logValidation: false,
  }
);

// ============================================================================
// ENHANCED VALIDATION MIDDLEWARES
// ============================================================================

/**
 * Enhanced validation with business logic
 */
export const validateCreateRequestEnhanced = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First, validate with basic schema
    const basicValidation = validateRequestData(CreateRequestSchema, req.body);

    if (!basicValidation.success) {
      const formattedErrors = formatValidationErrors(basicValidation.errors);
      ResponseWrapper.sendValidationError(res, formattedErrors.details);
      return;
    }

    // Additional business logic validation
    const { requestText, priority } = basicValidation.data;

    // Check for high priority keywords
    const highPriorityKeywords = [
      'urgent',
      'emergency',
      'immediate',
      'critical',
      'broken',
      'leak',
      'fire',
    ];
    const hasHighPriorityKeyword = highPriorityKeywords.some(keyword =>
      requestText.toLowerCase().includes(keyword)
    );

    if (hasHighPriorityKeyword && priority !== 'high') {
      ResponseWrapper.sendValidationError(res, [
        {
          field: 'priority',
          message:
            'Request text suggests high priority but priority is set to lower level',
        },
      ]);
      return;
    }

    // Store validated data
    (req as any).validatedData = basicValidation.data;

    logger.debug(
      '✅ [RequestValidation] Enhanced validation passed',
      'RequestValidation',
      { priority, hasHighPriorityKeyword }
    );

    next();
  } catch (error) {
    logger.error(
      '❌ [RequestValidation] Enhanced validation error',
      'RequestValidation',
      error
    );

    ResponseWrapper.sendError(
      res,
      'Enhanced validation error',
      500,
      'ENHANCED_VALIDATION_ERROR',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * Conditional validation middleware
 * Only validates if feature flag is enabled
 */
export const conditionalValidation = (
  schema: ZodSchema,
  target: 'body' | 'params' | 'query' = 'body',
  featureFlag: string = 'request-validation-v2'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(featureFlag)) {
      logger.debug(
        `🔧 [RequestValidation] Conditional validation disabled for ${featureFlag}`,
        'RequestValidation'
      );
      return next();
    }

    return createValidationMiddleware(schema, target, {
      sanitize: true,
      logValidation: true,
    })(req, res, next);
  };
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Get validated data from request
 */
export const getValidatedData = <T>(req: Request): T | null => {
  return (req as any).validatedData || null;
};

/**
 * Check if request has validated data
 */
export const hasValidatedData = (req: Request): boolean => {
  return (req as any).validatedData !== undefined;
};

/**
 * Extract and validate specific fields
 */
export const validateFields = <T>(
  data: any,
  fields: (keyof T)[],
  schema: ZodSchema
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validationResult = validateRequestData(schema, data);

    if (validationResult.success) {
      const extractedData = {} as T;
      fields.forEach(field => {
        if (validationResult.data[field as string] !== undefined) {
          extractedData[field] = validationResult.data[field as string];
        }
      });

      return { success: true, data: extractedData };
    } else {
      const errors = validationResult.errors.errors.map(error => error.message);
      return { success: false, errors };
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Validate partial data (for updates)
 */
export const validatePartialData = <T>(
  data: Partial<T>,
  schema: ZodSchema,
  requiredFields: (keyof T)[]
):
  | { success: true; data: Partial<T> }
  | { success: false; errors: string[] } => {
  try {
    // Check required fields
    const missingFields = requiredFields.filter(
      field =>
        data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        errors: missingFields.map(field => `${String(field)} is required`),
      };
    }

    // Validate with schema
    const validationResult = validateRequestData(schema, data);

    if (validationResult.success) {
      return { success: true, data: validationResult.data };
    } else {
      const errors = validationResult.errors.errors.map(error => error.message);
      return { success: false, errors };
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global validation error handler
 */
export const validationErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof z.ZodError) {
    logger.warn(
      '❌ [RequestValidation] Global validation error',
      'RequestValidation',
      { errors: error.errors }
    );

    const formattedErrors = formatValidationErrors(error);
    ResponseWrapper.sendValidationError(res, formattedErrors.details);
  } else {
    next(error);
  }
};

/**
 * Validation performance monitoring
 */
export const validationPerformanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (duration > 100) {
      // Log slow validations
      logger.warn(
        `🐌 [RequestValidation] Slow validation detected`,
        'RequestValidation',
        {
          path: req.path,
          method: req.method,
          duration: `${duration}ms`,
        }
      );
    }
  });

  next();
};

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared above with 'export' keyword
// No need for duplicate exports here
