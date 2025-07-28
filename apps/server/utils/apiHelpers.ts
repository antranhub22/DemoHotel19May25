import { Response } from 'express';

// ============================================
// STANDARD API RESPONSE INTERFACES
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Standard success response
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

// Standard error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

// ============================================
// API RESPONSE HELPERS
// ============================================

export const apiResponse = {
  /**
   * Standard success response
   * @param res Express response object
   * @param data Response data
   * @param message Optional success message
   * @param meta Optional metadata
   */
  success: <T>(res: Response, data: T, message?: string, meta?: any) => {
    return res.json({
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals?.requestId,
        ...meta,
      },
    } as ApiSuccessResponse<T>);
  },

  /**
   * Standard error response
   * @param res Express response object
   * @param statusCode HTTP status code
   * @param code Error code (e.g., 'VALIDATION_ERROR')
   * @param message Human-readable error message
   * @param details Optional error details
   */
  error: (
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ) => {
    return res.status(statusCode).json({
      success: false,
      error: { code, message, details },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals?.requestId,
      },
    } as ApiErrorResponse);
  },

  /**
   * 201 Created response
   * @param res Express response object
   * @param data Created resource data
   * @param message Optional success message
   */
  created: <T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ) => {
    return res.status(201).json({
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals?.requestId,
      },
    } as ApiSuccessResponse<T>);
  },

  /**
   * 204 No Content response (for successful DELETE operations)
   * @param res Express response object
   */
  noContent: (res: Response) => {
    return res.status(204).send();
  },
};

// ============================================
// COMMON ERROR CODES
// ============================================

export const ErrorCodes = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_INPUT: 'INVALID_INPUT',

  // Authentication Errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization Errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',

  // Conflict Errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',

  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Guest-specific Errors
  GUEST_AUTH_FAILED: 'GUEST_AUTH_FAILED',
  TENANT_IDENTIFICATION_FAILED: 'TENANT_IDENTIFICATION_FAILED',

  // Hotel-specific Errors
  HOTEL_NOT_FOUND: 'HOTEL_NOT_FOUND',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',

  // Voice Assistant Errors
  VAPI_ERROR: 'VAPI_ERROR',
  TRANSCRIPT_STORAGE_ERROR: 'TRANSCRIPT_STORAGE_ERROR',
  CALL_NOT_FOUND: 'CALL_NOT_FOUND',
} as const;

// ============================================
// QUICK ERROR HELPERS
// ============================================

export const commonErrors = {
  validation: (res: Response, message: string, details?: any) =>
    apiResponse.error(res, 400, ErrorCodes.VALIDATION_ERROR, message, details),

  missingFields: (res: Response, fields: string[]) =>
    apiResponse.error(
      res,
      400,
      ErrorCodes.MISSING_REQUIRED_FIELDS,
      `Missing required fields: ${fields.join(', ')}`,
      { requiredFields: fields }
    ),

  unauthorized: (res: Response, message = 'Authentication required') =>
    apiResponse.error(res, 401, ErrorCodes.UNAUTHORIZED, message),

  forbidden: (res: Response, message = 'Access denied') =>
    apiResponse.error(res, 403, ErrorCodes.FORBIDDEN, message),

  notFound: (res: Response, resource = 'Resource', id?: string) =>
    apiResponse.error(
      res,
      404,
      ErrorCodes.NOT_FOUND,
      `${resource} not found${id ? ` with ID: ${id}` : ''}`,
      { resource, id }
    ),

  conflict: (res: Response, message: string, details?: any) =>
    apiResponse.error(res, 409, ErrorCodes.CONFLICT, message, details),

  internal: (res: Response, message = 'Internal server error', details?: any) =>
    apiResponse.error(res, 500, ErrorCodes.INTERNAL_ERROR, message, details),

  database: (
    res: Response,
    message = 'Database operation failed',
    details?: any
  ) => apiResponse.error(res, 500, ErrorCodes.DATABASE_ERROR, message, details),
};
