import { z } from 'zod';

// ============================================================================
// REQUEST VALIDATION SCHEMAS - PHASE 1 REFACTOR
// ============================================================================
// Enhanced input validation for RequestController endpoints
// Provides type safety and comprehensive validation

/**
 * Create Request Schema
 * Validates input for POST /api/request
 */
export const CreateRequestSchema = z.object({
  serviceType: z.string().optional(),
  requestText: z
    .string()
    .max(1000, 'Request text too long')
    .optional()
    .default('Voice Assistant Request'), // ✅ FALLBACK cho empty requests
  roomNumber: z
    .string()
    .max(10, 'Room number too long')
    .optional()
    .default('TBD'), // ✅ FALLBACK cho missing room number
  guestName: z.string().max(100, 'Guest name too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tenantId: z.string().uuid().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  phoneNumber: z.string().max(20, 'Phone number too long').optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().max(10).default('VND'),
  specialInstructions: z
    .string()
    .max(500, 'Special instructions too long')
    .optional(),
  urgency: z.enum(['normal', 'urgent', 'critical']).default('normal'),
  orderType: z.string().max(50, 'Order type too long').optional(),
  deliveryTime: z.string().max(100, 'Delivery time too long').optional(),
  items: z.string().optional(), // JSON stored as text
});

/**
 * Update Request Status Schema
 * Validates input for PATCH /api/request/:id/status
 */
export const UpdateRequestStatusSchema = z.object({
  status: z.enum(
    [
      'pending',
      'in-progress',
      'completed',
      'cancelled',
      'Đã ghi nhận',
      'Đang xử lý',
      'Hoàn thành',
      'Đã hủy',
    ],
    {
      errorMap: () => ({ message: 'Invalid request status' }),
    }
  ),
  notes: z.string().max(500, 'Notes too long').optional(),
  completedAt: z.string().datetime().optional(),
  assignedTo: z.string().max(100, 'Assigned to too long').optional(),
});

/**
 * Request Filters Schema
 * Validates query parameters for GET /api/request
 */
export const RequestFiltersSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  status: z
    .enum(['pending', 'in-progress', 'completed', 'cancelled'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  roomNumber: z.string().optional(),
  guestName: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'priority', 'room_number'])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Request ID Schema
 * Validates request ID parameter
 */
export const RequestIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Request ID must be a number'),
});

/**
 * Bulk Update Schema
 * Validates bulk status updates
 */
export const BulkUpdateRequestSchema = z.object({
  requestIds: z.array(z.number()).min(1, 'At least one request ID is required'),
  status: z.enum([
    'pending',
    'in-progress',
    'completed',
    'cancelled',
    'Đã ghi nhận',
    'Đang xử lý',
    'Hoàn thành',
    'Đã hủy',
  ]),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type UpdateRequestStatusInput = z.infer<
  typeof UpdateRequestStatusSchema
>;
export type RequestFiltersInput = z.infer<typeof RequestFiltersSchema>;
export type RequestIdInput = z.infer<typeof RequestIdSchema>;
export type BulkUpdateRequestInput = z.infer<typeof BulkUpdateRequestSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate request data with detailed error messages
 */
export const validateRequestData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
};

/**
 * Format validation errors for API response
 */
export const formatValidationErrors = (
  errors: z.ZodError
): {
  message: string;
  details: Array<{ field: string; message: string }>;
} => {
  const details = errors.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
  }));

  return {
    message: 'Validation failed',
    details,
  };
};

/**
 * Sanitize request data (remove undefined values)
 */
export const sanitizeRequestData = <T extends Record<string, any>>(
  data: T
): Partial<T> => {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
};

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Custom room number validator
 */
export const validateRoomNumber = (roomNumber: string): boolean => {
  // Room number should be alphanumeric and reasonable length
  const roomNumberRegex = /^[A-Za-z0-9\-_]{1,10}$/;
  return roomNumberRegex.test(roomNumber);
};

/**
 * Custom phone number validator
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

/**
 * Custom priority validator with business logic
 */
export const validatePriority = (
  priority: string,
  requestText: string
): boolean => {
  // High priority keywords
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

  // If text contains high priority keywords, priority should be high
  if (hasHighPriorityKeyword && priority !== 'high') {
    return false;
  }

  return true;
};

// ============================================================================
// ENHANCED SCHEMAS WITH CUSTOM VALIDATION
// ============================================================================

/**
 * Enhanced Create Request Schema with custom validation
 */
export const CreateRequestEnhancedSchema = CreateRequestSchema.refine(
  data => validateRoomNumber(data.roomNumber),
  {
    message: 'Invalid room number format',
    path: ['roomNumber'],
  }
)
  .refine(data => !data.phoneNumber || validatePhoneNumber(data.phoneNumber), {
    message: 'Invalid phone number format',
    path: ['phoneNumber'],
  })
  .refine(data => validatePriority(data.priority, data.requestText), {
    message:
      'Request text suggests high priority but priority is set to lower level',
    path: ['priority'],
  });

/**
 * Enhanced Update Status Schema with business rules
 */
export const UpdateRequestStatusEnhancedSchema =
  UpdateRequestStatusSchema.refine(
    data => {
      // Cannot cancel completed requests
      if (data.status === 'cancelled' || data.status === 'Đã hủy') {
        // This would need to check current status from database
        // For now, just validate the schema
        return true;
      }
      return true;
    },
    {
      message: 'Cannot cancel completed requests',
      path: ['status'],
    }
  );

// ============================================================================
// RESPONSE TYPE DEFINITIONS
// ============================================================================

/**
 * Standard API Response Type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  _metadata: {
    module: string;
    version: string;
    architecture: string;
    timestamp: string;
  };
}

/**
 * Request Response Type
 */
export interface RequestResponse extends ApiResponse<CreateRequestInput> {}

/**
 * Requests List Response Type
 */
export interface RequestsListResponse
  extends ApiResponse<CreateRequestInput[]> {}

/**
 * Validation Error Response Type
 */
export interface ValidationErrorResponse extends ApiResponse {
  success: false;
  error: 'Validation failed';
  details: Array<{ field: string; message: string }>;
}
