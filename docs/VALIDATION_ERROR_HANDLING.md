# Validation and Error Handling Guide

## Table of Contents
1. [Overview](#overview)
2. [Input Validation](#input-validation)
3. [Error Handling](#error-handling)
4. [API Response Standards](#api-response-standards)
5. [Client-Side Validation](#client-side-validation)
6. [Server-Side Validation](#server-side-validation)
7. [Error Recovery](#error-recovery)
8. [Monitoring and Logging](#monitoring-and-logging)

## Overview

This guide covers comprehensive validation and error handling strategies for the Hotel Assistant system. Proper validation and error handling are crucial for security, user experience, and system reliability.

### Key Principles
- **Fail Fast**: Validate inputs early and reject invalid data
- **Clear Messages**: Provide meaningful error messages to users
- **Security First**: Never expose sensitive information in errors
- **Graceful Degradation**: Handle errors without crashing the system
- **Comprehensive Logging**: Log errors for debugging and monitoring

## Input Validation

### 1. Schema Validation with Zod

#### Core Validation Schemas
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

// Authentication schemas
export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().uuid().optional(),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'staff', 'manager']).default('staff'),
});

// Call management schemas
export const StartCallSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  language: z.enum(['en', 'fr', 'zh', 'ru', 'ko', 'vi'], {
    errorMap: () => ({ message: 'Invalid language code' }),
  }),
  serviceType: z.string().optional(),
  tenantId: z.string().uuid(),
});

export const EndCallSchema = z.object({
  callId: z.string().uuid('Invalid call ID'),
  duration: z.number().min(0, 'Duration must be positive'),
  tenantId: z.string().uuid(),
});

// Order management schemas
export const CreateOrderSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  requestContent: z.string().min(1, 'Request content is required'),
  tenantId: z.string().uuid(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  tenantId: z.string().uuid(),
});

// Hotel management schemas
export const HotelResearchSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required'),
  location: z.string().min(1, 'Location is required'),
  researchDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('basic'),
});

export const AssistantConfigSchema = z.object({
  personality: z.enum(['friendly', 'professional', 'formal', 'casual']),
  voiceId: z.string().min(1, 'Voice ID is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  customPrompt: z.string().optional(),
});

// Analytics schemas
export const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  tenantId: z.string().uuid(),
});

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

#### Custom Validation Functions
```typescript
// lib/validation/customValidators.ts
import { z } from 'zod';

// Custom validators for specific business rules
export const customValidators = {
  // Validate room number format
  roomNumber: z.string().regex(
    /^[0-9]{1,4}$/,
    'Room number must be 1-4 digits'
  ),

  // Validate phone number format
  phoneNumber: z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number format'
  ),

  // Validate password strength
  strongPassword: z.string().refine(
    (password) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    },
    {
      message: 'Password must contain uppercase, lowercase, number, and special character',
    }
  ),

  // Validate email domain
  businessEmail: z.string().email().refine(
    (email) => {
      const domain = email.split('@')[1];
      const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
      return !businessDomains.includes(domain);
    },
    {
      message: 'Please use a business email address',
    }
  ),

  // Validate date range
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    (data) => data.endDate > data.startDate,
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),

  // Validate file upload
  imageFile: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  }).refine(
    (file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      return file.size <= maxSize && allowedTypes.includes(file.type);
    },
    {
      message: 'File must be an image (JPEG, PNG, GIF) under 5MB',
    }
  ),
};
```

### 2. Middleware Validation

#### Request Validation Middleware
```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface ValidatedRequest extends Request {
  validatedData?: any;
}

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, and params
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const validatedData = await schema.parseAsync(dataToValidate);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          status: 400,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error('Validation middleware error', { error });
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        status: 500,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Specific validation middleware for different request types
export const validateBody = (schema: z.ZodSchema) => {
  return validateRequest(z.object({ body: schema }));
};

export const validateQuery = (schema: z.ZodSchema) => {
  return validateRequest(z.object({ query: schema }));
};

export const validateParams = (schema: z.ZodSchema) => {
  return validateRequest(z.object({ params: schema }));
};
```

#### Route-Specific Validation
```typescript
// routes/auth.ts
import { validateBody } from '../middleware/validation';
import { LoginSchema, RegisterSchema } from '../lib/validation/schemas';

router.post('/login', validateBody(LoginSchema), async (req, res) => {
  const { username, password, tenantId } = req.validatedData.body;
  // ... login logic
});

router.post('/register', validateBody(RegisterSchema), async (req, res) => {
  const { username, password, email, role } = req.validatedData.body;
  // ... registration logic
});

// routes/calls.ts
import { validateBody } from '../middleware/validation';
import { StartCallSchema, EndCallSchema } from '../lib/validation/schemas';

router.post('/start', validateBody(StartCallSchema), async (req, res) => {
  const { roomNumber, language, serviceType, tenantId } = req.validatedData.body;
  // ... start call logic
});

router.post('/end', validateBody(EndCallSchema), async (req, res) => {
  const { callId, duration, tenantId } = req.validatedData.body;
  // ... end call logic
});
```

## Error Handling

### 1. Error Classes

#### Custom Error Classes
```typescript
// lib/errors/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
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
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}
```

#### Error Factory
```typescript
// lib/errors/errorFactory.ts
import { AppError, ValidationError, AuthenticationError, NotFoundError } from './AppError';

export class ErrorFactory {
  static validation(message: string, details?: any): ValidationError {
    return new ValidationError(message, details);
  }

  static authentication(message?: string): AuthenticationError {
    return new AuthenticationError(message);
  }

  static notFound(resource?: string): NotFoundError {
    return new NotFoundError(resource);
  }

  static database(error: any): AppError {
    if (error.code === '23505') { // Unique constraint violation
      return new AppError('Resource already exists', 409, 'DUPLICATE_ERROR');
    }
    if (error.code === '23503') { // Foreign key violation
      return new AppError('Referenced resource not found', 400, 'REFERENCE_ERROR');
    }
    return new AppError('Database error', 500, 'DATABASE_ERROR');
  }

  static external(service: string, error: any): AppError {
    return new AppError(
      `${service} service unavailable`,
      502,
      'EXTERNAL_SERVICE_ERROR'
    );
  }
}
```

### 2. Global Error Handler

#### Express Error Handler
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors/AppError';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  status: number;
  timestamp: string;
  requestId?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  // Handle known application errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = error.message;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'JWT_ERROR';
  }

  // Handle database errors
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database validation failed';
    code = 'DATABASE_VALIDATION_ERROR';
    details = error.message;
  }

  // Log error for debugging
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    response: {
      statusCode,
      code,
    },
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    code,
    details,
    status: statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string,
  };

  res.status(statusCode).json(errorResponse);
};
```

#### Async Error Handler
```typescript
// middleware/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in routes
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json({ success: true, data: result });
}));
```

### 3. Service-Level Error Handling

#### Service Error Handling
```typescript
// services/authService.ts
import { AppError, ErrorFactory } from '../lib/errors';

export class AuthService {
  async login(username: string, password: string, tenantId?: string) {
    try {
      // Validate inputs
      if (!username || !password) {
        throw ErrorFactory.validation('Username and password are required');
      }

      // Find user
      const user = await db.query.staff.findFirst({
        where: (staff, { eq, and }) => 
          and(
            eq(staff.username, username),
            tenantId ? eq(staff.tenantId, tenantId) : undefined
          ),
      });

      if (!user) {
        throw ErrorFactory.authentication('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw ErrorFactory.authentication('Invalid credentials');
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return { token, user };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Login error', { error, username });
      throw new AppError('Login failed', 500, 'LOGIN_ERROR');
    }
  }
}
```

## API Response Standards

### 1. Success Response Format
```typescript
// lib/response/successResponse.ts
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  requestId?: string
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
  requestId,
});
```

### 2. Error Response Format
```typescript
// lib/response/errorResponse.ts
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  status: number;
  timestamp: string;
  requestId?: string;
}

export const createErrorResponse = (
  error: string,
  status: number = 500,
  code?: string,
  details?: any,
  requestId?: string
): ErrorResponse => ({
  success: false,
  error,
  code,
  details,
  status,
  timestamp: new Date().toISOString(),
  requestId,
});
```

### 3. Pagination Response Format
```typescript
// lib/response/paginationResponse.ts
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
  requestId?: string;
}

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
  requestId?: string
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
  timestamp: new Date().toISOString(),
  requestId,
});
```

## Client-Side Validation

### 1. Form Validation with React Hook Form

#### Form Validation Schemas
```typescript
// lib/validation/clientSchemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const orderSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  requestContent: z.string().min(10, 'Request must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const hotelConfigSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email format'),
  website: z.string().url('Invalid website URL').optional(),
});
```

#### Form Components with Validation
```typescript
// components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../lib/validation/clientSchemas';

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await apiClient.login(data);
      // Handle success
    } catch (error) {
      if (error.response?.data?.code === 'AUTHENTICATION_ERROR') {
        setError('root', { message: 'Invalid credentials' });
      } else {
        setError('root', { message: 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('username')}
          placeholder="Username"
          className={errors.username ? 'error' : ''}
        />
        {errors.username && (
          <span className="error-message">{errors.username.message}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          {...register('password')}
          placeholder="Password"
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <span className="error-message">{errors.password.message}</span>
        )}
      </div>

      {errors.root && (
        <div className="error-message">{errors.root.message}</div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 2. Real-time Validation

#### Input Validation Hooks
```typescript
// hooks/useInputValidation.ts
import { useState, useEffect } from 'react';
import { z } from 'zod';

export const useInputValidation = <T>(
  schema: z.ZodSchema<T>,
  value: string,
  debounceMs: number = 300
) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!value) {
        setError(null);
        return;
      }

      setIsValidating(true);
      try {
        await schema.parseAsync(value);
        setError(null);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        }
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, schema, debounceMs]);

  return { error, isValidating };
};

// Usage
export const ValidatedInput: React.FC<{ schema: z.ZodSchema }> = ({ schema }) => {
  const [value, setValue] = useState('');
  const { error, isValidating } = useInputValidation(schema, value);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={error ? 'error' : ''}
      />
      {isValidating && <span>Validating...</span>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
```

## Server-Side Validation

### 1. Database Validation

#### Database Constraints
```sql
-- Add database constraints for data integrity
ALTER TABLE staff ADD CONSTRAINT unique_username_per_tenant 
  UNIQUE (username, tenant_id);

ALTER TABLE calls ADD CONSTRAINT valid_duration 
  CHECK (duration >= 0);

ALTER TABLE requests ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled'));

-- Add indexes for performance
CREATE INDEX idx_calls_tenant_start_time ON calls(tenant_id, start_time);
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_requests_tenant_status ON requests(tenant_id, status);
```

#### ORM-Level Validation
```typescript
// models/Call.ts
import { z } from 'zod';

export const CallSchema = z.object({
  id: z.string().uuid(),
  callIdVapi: z.string().min(1),
  roomNumber: z.string().min(1),
  language: z.enum(['en', 'fr', 'zh', 'ru', 'ko', 'vi']),
  serviceType: z.string().optional(),
  duration: z.number().min(0),
  startTime: z.date(),
  endTime: z.date().optional(),
  tenantId: z.string().uuid(),
});

export type Call = z.infer<typeof CallSchema>;

// Database operations with validation
export const CallModel = {
  async create(data: Omit<Call, 'id'>): Promise<Call> {
    const validatedData = CallSchema.omit({ id: true }).parse(data);
    
    const result = await db.insert(calls).values(validatedData);
    return CallSchema.parse(result);
  },

  async update(id: string, data: Partial<Call>): Promise<Call> {
    const validatedData = CallSchema.partial().parse(data);
    
    const result = await db.update(calls)
      .set(validatedData)
      .where(eq(calls.id, id));
    
    return CallSchema.parse(result);
  },
};
```

### 2. Business Logic Validation

#### Service-Level Validation
```typescript
// services/callService.ts
export class CallService {
  async startCall(data: StartCallData): Promise<CallResult> {
    // Validate business rules
    await this.validateCallLimits(data.tenantId);
    await this.validateRoomAvailability(data.roomNumber, data.tenantId);
    await this.validateLanguageSupport(data.language, data.tenantId);

    // Start call
    const call = await this.createCall(data);
    return call;
  }

  private async validateCallLimits(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    const monthlyCalls = await this.getMonthlyCallCount(tenantId);

    if (monthlyCalls >= tenant.monthlyCallLimit) {
      throw new AppError(
        'Monthly call limit exceeded',
        429,
        'CALL_LIMIT_EXCEEDED'
      );
    }
  }

  private async validateRoomAvailability(roomNumber: string, tenantId: string): Promise<void> {
    const activeCall = await this.getActiveCall(roomNumber, tenantId);
    
    if (activeCall) {
      throw new AppError(
        'Room has an active call',
        409,
        'ROOM_BUSY'
      );
    }
  }

  private async validateLanguageSupport(language: string, tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    const supportedLanguages = tenant.supportedLanguages || ['en'];

    if (!supportedLanguages.includes(language)) {
      throw new AppError(
        `Language ${language} not supported`,
        400,
        'LANGUAGE_NOT_SUPPORTED'
      );
    }
  }
}
```

## Error Recovery

### 1. Retry Mechanisms

#### Exponential Backoff
```typescript
// utils/retry.ts
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Usage
const result = await retryWithBackoff(
  () => externalService.call(),
  3,
  1000
);
```

#### Circuit Breaker Pattern
```typescript
// utils/circuitBreaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;

  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 2. Graceful Degradation

#### Fallback Mechanisms
```typescript
// services/analyticsService.ts
export class AnalyticsService {
  async getAnalytics(tenantId: string, dateRange: DateRange): Promise<Analytics> {
    try {
      return await this.getAnalyticsFromDatabase(tenantId, dateRange);
    } catch (error) {
      logger.warn('Database analytics failed, using cached data', { error });
      return await this.getCachedAnalytics(tenantId, dateRange);
    }
  }

  private async getCachedAnalytics(tenantId: string, dateRange: DateRange): Promise<Analytics> {
    const cached = await this.cache.get(`analytics:${tenantId}:${dateRange}`);
    if (cached) {
      return cached;
    }

    // Return basic analytics if no cache
    return {
      totalCalls: 0,
      averageDuration: 0,
      totalOrders: 0,
      languageDistribution: {},
      serviceTypeDistribution: [],
      hourlyActivity: [],
    };
  }
}
```

## Monitoring and Logging

### 1. Structured Logging

#### Logger Configuration
```typescript
// utils/logger.ts
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}
```

#### Error Tracking
```typescript
// middleware/errorTracking.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorTracking = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  logger.error('Request error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
    },
    response: {
      statusCode: res.statusCode,
    },
  });

  // Send to external error tracking service (e.g., Sentry)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: {
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
        },
        user: req.user,
      },
    });
  }

  next(error);
};
```

### 2. Performance Monitoring

#### Request Timing
```typescript
// middleware/requestTiming.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestTiming = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Track slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
      });
    }
  });

  next();
};
```

This comprehensive validation and error handling guide ensures robust, secure, and user-friendly error management throughout the Hotel Assistant system. 