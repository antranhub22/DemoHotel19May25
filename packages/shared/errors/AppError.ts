// ============================================================================
// BASE ERROR CLASS
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(
      `${service} service error: ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR'
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class CallLimitError extends AppError {
  constructor(message: string = 'Call limit exceeded') {
    super(message, 429, 'CALL_LIMIT_ERROR');
  }
}

export class RoomBusyError extends AppError {
  constructor(roomNumber: string) {
    super(`Room ${roomNumber} has an active call`, 409, 'ROOM_BUSY_ERROR');
  }
}

export class LanguageNotSupportedError extends AppError {
  constructor(language: string) {
    super(
      `Language ${language} not supported`,
      400,
      'LANGUAGE_NOT_SUPPORTED_ERROR'
    );
  }
}

export class SubscriptionExpiredError extends AppError {
  constructor(message: string = 'Subscription has expired') {
    super(message, 402, 'SUBSCRIPTION_EXPIRED_ERROR');
  }
}

export class FeatureNotAvailableError extends AppError {
  constructor(feature: string) {
    super(
      `Feature ${feature} not available in current plan`,
      403,
      'FEATURE_NOT_AVAILABLE_ERROR'
    );
  }
}

export class AssistantGenerationError extends AppError {
  constructor(message: string = 'Failed to generate assistant') {
    super(message, 500, 'ASSISTANT_GENERATION_ERROR');
  }
}

export class VapiApiError extends AppError {
  constructor(message: string) {
    super(`Vapi API error: ${message}`, 502, 'VAPI_API_ERROR');
  }
}

export class OpenAIError extends AppError {
  constructor(message: string) {
    super(`OpenAI API error: ${message}`, 502, 'OPENAI_API_ERROR');
  }
}

export class EmailError extends AppError {
  constructor(message: string = 'Email service error') {
    super(message, 500, 'EMAIL_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

export class WebSocketError extends AppError {
  constructor(message: string = 'WebSocket error') {
    super(message, 500, 'WEBSOCKET_ERROR');
  }
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

export class ErrorFactory {
  // Validation errors
  static validation(message: string, details?: any): ValidationError {
    return new ValidationError(message, details);
  }

  // Authentication errors
  static authentication(message?: string): AuthenticationError {
    return new AuthenticationError(message);
  }

  static authorization(message?: string): AuthorizationError {
    return new AuthorizationError(message);
  }

  // Resource errors
  static notFound(resource?: string): NotFoundError {
    return new NotFoundError(resource);
  }

  static conflict(message?: string): ConflictError {
    return new ConflictError(message);
  }

  // Rate limiting
  static rateLimit(message?: string): RateLimitError {
    return new RateLimitError(message);
  }

  static callLimit(message?: string): CallLimitError {
    return new CallLimitError(message);
  }

  // Business logic errors
  static roomBusy(roomNumber: string): RoomBusyError {
    return new RoomBusyError(roomNumber);
  }

  static languageNotSupported(language: string): LanguageNotSupportedError {
    return new LanguageNotSupportedError(language);
  }

  static subscriptionExpired(message?: string): SubscriptionExpiredError {
    return new SubscriptionExpiredError(message);
  }

  static featureNotAvailable(feature: string): FeatureNotAvailableError {
    return new FeatureNotAvailableError(feature);
  }

  // External service errors
  static database(error: any): AppError {
    if (error.code === '23505') {
      // Unique constraint violation
      return new AppError('Resource already exists', 409, 'DUPLICATE_ERROR');
    }
    if (error.code === '23503') {
      // Foreign key violation
      return new AppError(
        'Referenced resource not found',
        400,
        'REFERENCE_ERROR'
      );
    }
    if (error.code === '23514') {
      // Check constraint violation
      return new AppError('Invalid data provided', 400, 'CONSTRAINT_ERROR');
    }
    return new DatabaseError((error as Error).message);
  }

  static external(service: string, error: any): ExternalServiceError {
    return new ExternalServiceError(service, (error as Error).message);
  }

  static vapi(error: any): VapiApiError {
    return new VapiApiError((error as Error).message);
  }

  static openai(error: any): OpenAIError {
    return new OpenAIError((error as Error).message);
  }

  static email(error: any): EmailError {
    return new EmailError((error as Error).message);
  }

  // File upload errors
  static fileUpload(message?: string): FileUploadError {
    return new FileUploadError(message);
  }

  // WebSocket errors
  static websocket(message?: string): WebSocketError {
    return new WebSocketError(message);
  }

  // Assistant generation errors
  static assistantGeneration(message?: string): AssistantGenerationError {
    return new AssistantGenerationError(message);
  }
}

// ============================================================================
// ERROR CODES MAPPING
// ============================================================================

export const ERROR_CODES = {
  // Authentication & Authorization
  AUTHENTICATION_ERROR: 'AUTH_001',
  AUTHORIZATION_ERROR: 'AUTH_002',
  INVALID_TOKEN: 'AUTH_003',
  TOKEN_EXPIRED: 'AUTH_004',
  INSUFFICIENT_PERMISSIONS: 'AUTH_005',

  // Validation
  VALIDATION_ERROR: 'VAL_001',
  MISSING_REQUIRED_FIELD: 'VAL_002',
  INVALID_EMAIL_FORMAT: 'VAL_003',
  INVALID_PHONE_FORMAT: 'VAL_004',
  INVALID_DATE_FORMAT: 'VAL_005',
  INVALID_FILE_TYPE: 'VAL_006',
  FILE_TOO_LARGE: 'VAL_007',

  // Database
  DATABASE_ERROR: 'DB_001',
  DUPLICATE_ERROR: 'DB_002',
  REFERENCE_ERROR: 'DB_003',
  CONSTRAINT_ERROR: 'DB_004',
  CONNECTION_ERROR: 'DB_005',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXT_001',
  VAPI_API_ERROR: 'EXT_002',
  OPENAI_API_ERROR: 'EXT_003',
  EMAIL_ERROR: 'EXT_004',

  // Business Logic
  CALL_LIMIT_ERROR: 'BUS_001',
  ROOM_BUSY_ERROR: 'BUS_002',
  LANGUAGE_NOT_SUPPORTED_ERROR: 'BUS_003',
  SUBSCRIPTION_EXPIRED_ERROR: 'BUS_004',
  FEATURE_NOT_AVAILABLE_ERROR: 'BUS_005',
  ASSISTANT_GENERATION_ERROR: 'BUS_006',

  // Rate Limiting
  RATE_LIMIT_ERROR: 'RATE_001',
  TOO_MANY_REQUESTS: 'RATE_002',

  // File Operations
  FILE_UPLOAD_ERROR: 'FILE_001',
  FILE_NOT_FOUND: 'FILE_002',
  FILE_DELETE_ERROR: 'FILE_003',

  // WebSocket
  WEBSOCKET_ERROR: 'WS_001',
  CONNECTION_FAILED: 'WS_002',
  MESSAGE_SEND_ERROR: 'WS_003',

  // General
  INTERNAL_ERROR: 'GEN_001',
  NOT_FOUND_ERROR: 'GEN_002',
  CONFLICT_ERROR: 'GEN_003',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Authentication
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication failed',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'Insufficient permissions',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid token provided',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Token has expired',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]:
    'You do not have permission to perform this action',

  // Validation
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_EMAIL_FORMAT]: 'Invalid email format',
  [ERROR_CODES.INVALID_PHONE_FORMAT]: 'Invalid phone number format',
  [ERROR_CODES.INVALID_DATE_FORMAT]: 'Invalid date format',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds limit',

  // Database
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.DUPLICATE_ERROR]: 'Resource already exists',
  [ERROR_CODES.REFERENCE_ERROR]: 'Referenced resource not found',
  [ERROR_CODES.CONSTRAINT_ERROR]: 'Data constraint violation',
  [ERROR_CODES.CONNECTION_ERROR]: 'Database connection failed',

  // External Services
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service unavailable',
  [ERROR_CODES.VAPI_API_ERROR]: 'Voice assistant service error',
  [ERROR_CODES.OPENAI_API_ERROR]: 'AI processing service error',
  [ERROR_CODES.EMAIL_ERROR]: 'Email service error',

  // Business Logic
  [ERROR_CODES.CALL_LIMIT_ERROR]: 'Monthly call limit exceeded',
  [ERROR_CODES.ROOM_BUSY_ERROR]: 'Room has an active call',
  [ERROR_CODES.LANGUAGE_NOT_SUPPORTED_ERROR]: 'Language not supported',
  [ERROR_CODES.SUBSCRIPTION_EXPIRED_ERROR]: 'Subscription has expired',
  [ERROR_CODES.FEATURE_NOT_AVAILABLE_ERROR]:
    'Feature not available in current plan',
  [ERROR_CODES.ASSISTANT_GENERATION_ERROR]: 'Failed to generate assistant',

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_ERROR]: 'Rate limit exceeded',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests',

  // File Operations
  [ERROR_CODES.FILE_UPLOAD_ERROR]: 'File upload failed',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found',
  [ERROR_CODES.FILE_DELETE_ERROR]: 'File deletion failed',

  // WebSocket
  [ERROR_CODES.WEBSOCKET_ERROR]: 'WebSocket error',
  [ERROR_CODES.CONNECTION_FAILED]: 'Connection failed',
  [ERROR_CODES.MESSAGE_SEND_ERROR]: 'Failed to send message',

  // General
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.NOT_FOUND_ERROR]: 'Resource not found',
  [ERROR_CODES.CONFLICT_ERROR]: 'Resource conflict',
} as const;

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const getErrorCode = (error: Error): string => {
  if (error instanceof AppError) {
    return error.code;
  }
  return ERROR_CODES.INTERNAL_ERROR;
};

export const getErrorMessage = (error: Error): string => {
  if (error instanceof AppError) {
    return (error as Error).message;
  }
  return ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
};

export const getErrorDetails = (error: Error): any => {
  if (error instanceof AppError) {
    return error.details;
  }
  return null;
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
