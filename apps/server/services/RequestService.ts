// ============================================================================
// REQUEST SERVICE IMPLEMENTATION - PHASE 2 REFACTOR
// ============================================================================
// Service layer implementation for Request business logic
// Handles all business logic, validation, and data operations

import { getDatabase, initializeDatabase } from '@shared/db';
import { request } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import {
  CreateRequestInput,
  CreateRequestSchema,
  RequestFiltersInput,
  UpdateRequestStatusInput,
  validateRequestData,
} from '@shared/validation/requestSchemas';
import { and, count, desc, eq, gte, like, lte } from 'drizzle-orm';
import {
  BulkUpdateResult,
  CreateRequestResult,
  GetRequestByIdResult,
  GetRequestsResult,
  IRequestService,
  RequestEntity,
  RequestServiceConfig,
  RequestServiceErrorType,
  UpdateRequestStatusResult,
} from './interfaces/RequestServiceInterface';

// ============================================================================
// REQUEST SERVICE CONFIGURATION
// ============================================================================

/**
 * Default Request Service Configuration
 */
const DEFAULT_CONFIG: RequestServiceConfig = {
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
  statusTransitions: {
    pending: [
      'in-progress',
      'completed',
      'cancelled',
      'Đang xử lý',
      'Hoàn thành',
      'Đã hủy',
    ],
    'in-progress': ['completed', 'cancelled', 'Hoàn thành', 'Đã hủy'],
    completed: ['cancelled', 'Đã hủy'],
    cancelled: [],
    'Đã ghi nhận': ['Đang xử lý', 'Hoàn thành', 'Đã hủy'],
    'Đang xử lý': ['Hoàn thành', 'Đã hủy'],
    'Hoàn thành': ['Đã hủy'],
    'Đã hủy': [],
  },
  priorityValidation: {
    highPriorityKeywords: [
      'urgent',
      'emergency',
      'immediate',
      'critical',
      'broken',
      'leak',
      'fire',
    ],
    autoUpgradeToHigh: true,
  },
  businessRules: {
    allowStatusDowngrade: false,
    requireNotesForCancellation: true,
    autoAssignUrgentRequests: true,
    maxRequestsPerRoom: 5,
  },
  audit: {
    enabled: true,
    logAllChanges: true,
    logStatusChanges: true,
    logPriorityChanges: true,
  },
};

// ============================================================================
// REQUEST SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Request Service Implementation
 * Handles all business logic for request management
 */
export class RequestService implements IRequestService {
  private config: RequestServiceConfig;
  private rateLimitCache: Map<string, { count: number; resetTime: Date }> =
    new Map();

  constructor(config?: Partial<RequestServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // CORE BUSINESS LOGIC METHODS
  // ============================================================================

  /**
   * Create a new request
   */
  async createRequest(input: CreateRequestInput): Promise<CreateRequestResult> {
    try {
      logger.info(
        '📝 [RequestService] Creating new request',
        'RequestService',
        { roomNumber: input.roomNumber, priority: input.priority }
      );

      // ✅ NEW: Phase 2 - Business logic validation
      const validationResult = await this.validateRequestData(input);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Validation failed',
          code: RequestServiceErrorType.VALIDATION_ERROR,
        };
      }

      // ✅ NEW: Phase 2 - Business rules application
      const processedInput = await this.applyBusinessRules(input);

      // ✅ NEW: Phase 2 - Rate limiting check
      const rateLimitCheck = await this.checkRateLimits(
        processedInput.roomNumber,
        processedInput.tenantId || 'default'
      );
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error:
            'Rate limit exceeded. Please wait before creating another request.',
          code: RequestServiceErrorType.RATE_LIMIT_EXCEEDED,
        };
      }

      // ✅ NEW: Phase 2 - Database operation with enhanced error handling
      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      const newRequest = await db
        .insert(request)
        .values({
          tenant_id: processedInput.tenantId || 'default-tenant',
          room_number: processedInput.roomNumber,
          request_content: processedInput.requestText,
          guest_name: processedInput.guestName,
          priority: processedInput.priority,
          status: 'pending',
          created_at: new Date(),
          description: this.generateRequestDescription(processedInput),
          phone_number: processedInput.phoneNumber,
          total_amount: processedInput.totalAmount,
          currency: processedInput.currency,
          special_instructions: processedInput.specialInstructions,
          urgency: this.determineRequestUrgency(processedInput),
          order_type: processedInput.orderType,
          delivery_time: processedInput.deliveryTime,
          items: processedInput.items,
        })
        .returning();

      const createdRequest = newRequest[0];

      // ✅ NEW: Phase 2 - Auto-assignment for urgent requests
      if (
        this.config.businessRules.autoAssignUrgentRequests &&
        (processedInput.priority === 'high' ||
          this.determineRequestUrgency(processedInput) !== 'normal')
      ) {
        const assignedTo = await this.autoAssignRequest(createdRequest);
        if (assignedTo) {
          await db
            .update(request)
            .set({ assigned_to: assignedTo })
            .where(eq(request.id, createdRequest.id));
          createdRequest.assigned_to = assignedTo;
        }
      }

      // ✅ NEW: Phase 2 - Audit logging
      if (this.config.audit.enabled) {
        this.logAuditEvent('request_created', {
          requestId: createdRequest.id,
          roomNumber: createdRequest.room_number,
          priority: createdRequest.priority,
          urgency: createdRequest.urgency,
        });
      }

      logger.success(
        '✅ [RequestService] Request created successfully',
        'RequestService',
        {
          requestId: createdRequest.id,
          roomNumber: createdRequest.room_number,
          priority: createdRequest.priority,
          urgency: createdRequest.urgency,
        }
      );

      return {
        success: true,
        data: createdRequest,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to create request',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to create request',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get all requests with optional filtering and pagination
   */
  async getAllRequests(
    filters?: RequestFiltersInput
  ): Promise<GetRequestsResult> {
    try {
      logger.info(
        '📋 [RequestService] Getting all requests',
        'RequestService',
        { filters }
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      // ✅ NEW: Phase 2 - Enhanced filtering and pagination
      const {
        page = this.config.pagination.defaultPage,
        limit = this.config.pagination.defaultLimit,
        status,
        priority,
        roomNumber,
        guestName,
        assignedTo,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = filters || {};

      // Build where conditions
      const whereConditions = [];

      if (status) {
        whereConditions.push(eq(request.status, status));
      }

      if (priority) {
        whereConditions.push(eq(request.priority, priority));
      }

      if (roomNumber) {
        whereConditions.push(like(request.room_number, `%${roomNumber}%`));
      }

      if (guestName) {
        whereConditions.push(like(request.guest_name, `%${guestName}%`));
      }

      if (assignedTo) {
        whereConditions.push(eq(request.assigned_to, assignedTo));
      }

      if (startDate) {
        whereConditions.push(gte(request.created_at, new Date(startDate)));
      }

      if (endDate) {
        whereConditions.push(lte(request.created_at, new Date(endDate)));
      }

      // Get total count for pagination
      const totalCount = await db
        .select({ count: count() })
        .from(request)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      const total = totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get requests with pagination
      const requests = await db
        .select()
        .from(request)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(
          sortOrder === 'desc'
            ? desc(request[sortBy as keyof typeof request])
            : request[sortBy as keyof typeof request]
        )
        .limit(limit)
        .offset(offset);

      logger.success(
        '✅ [RequestService] Requests fetched successfully',
        'RequestService',
        {
          count: requests.length,
          total,
          page,
          totalPages,
        }
      );

      return {
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get a specific request by ID
   */
  async getRequestById(id: number): Promise<GetRequestByIdResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting request by ID: ${id}`,
        'RequestService'
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      const requests = await db
        .select()
        .from(request)
        .where(eq(request.id, id))
        .limit(1);

      if (!requests || requests.length === 0) {
        return {
          success: false,
          error: 'Request not found',
          code: RequestServiceErrorType.NOT_FOUND,
        };
      }

      logger.success(
        '✅ [RequestService] Request fetched successfully',
        'RequestService',
        { requestId: id }
      );

      return {
        success: true,
        data: requests[0],
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get request by ID',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to get request',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Update request status
   */
  async updateRequestStatus(
    id: number,
    input: UpdateRequestStatusInput
  ): Promise<UpdateRequestStatusResult> {
    try {
      logger.info(
        `📝 [RequestService] Updating request status: ${id} -> ${input.status}`,
        'RequestService'
      );

      // ✅ NEW: Phase 2 - Get current request for validation
      const currentRequest = await this.getRequestById(id);
      if (!currentRequest.success || !currentRequest.data) {
        return {
          success: false,
          error: 'Request not found',
          code: RequestServiceErrorType.NOT_FOUND,
        };
      }

      // ✅ NEW: Phase 2 - Validate status transition
      const transitionValidation = await this.validateStatusTransition(
        currentRequest.data.status,
        input.status
      );
      if (!transitionValidation.success) {
        return {
          success: false,
          error: transitionValidation.error || 'Invalid status transition',
          code: RequestServiceErrorType.INVALID_STATUS_TRANSITION,
        };
      }

      // ✅ NEW: Phase 2 - Business rule validation
      if (input.status === 'cancelled' || input.status === 'Đã hủy') {
        if (
          this.config.businessRules.requireNotesForCancellation &&
          !input.notes
        ) {
          return {
            success: false,
            error: 'Notes are required for cancellation',
            code: RequestServiceErrorType.BUSINESS_RULE_VIOLATION,
          };
        }
      }

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      const updateData: any = {
        status: input.status,
        updated_at: new Date(),
      };

      if (input.notes) {
        updateData.notes = input.notes;
      }

      if (input.assignedTo) {
        updateData.assigned_to = input.assignedTo;
      }

      if (input.status === 'completed' || input.status === 'Hoàn thành') {
        updateData.completed_at = new Date();
      }

      const updatedRequests = await db
        .update(request)
        .set(updateData)
        .where(eq(request.id, id))
        .returning();

      if (!updatedRequests || updatedRequests.length === 0) {
        return {
          success: false,
          error: 'Request not found',
          code: RequestServiceErrorType.NOT_FOUND,
        };
      }

      const updatedRequest = updatedRequests[0];

      // ✅ NEW: Phase 2 - Audit logging
      if (this.config.audit.logStatusChanges) {
        this.logAuditEvent('status_changed', {
          requestId: id,
          oldStatus: currentRequest.data.status,
          newStatus: input.status,
          notes: input.notes,
        });
      }

      logger.success(
        '✅ [RequestService] Request status updated successfully',
        'RequestService',
        {
          requestId: id,
          oldStatus: currentRequest.data.status,
          newStatus: input.status,
        }
      );

      return {
        success: true,
        data: updatedRequest,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to update request status',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to update request status',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  // ============================================================================
  // BUSINESS LOGIC METHODS
  // ============================================================================

  /**
   * Validate request data
   */
  async validateRequestData(input: CreateRequestInput): Promise<{
    success: boolean;
    errors?: string[];
  }> {
    try {
      const validationResult = validateRequestData(CreateRequestSchema, input);

      if (!validationResult.success) {
        const errors = validationResult.errors.errors.map(
          error => error.message
        );
        return { success: false, errors };
      }

      // ✅ NEW: Phase 2 - Business rules validation
      const businessRulesValidation = await this.validateBusinessRules(input);
      if (!businessRulesValidation.success) {
        return businessRulesValidation;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [
          error instanceof Error ? error.message : 'Unknown validation error',
        ],
      };
    }
  }

  /**
   * Validate status transition
   */
  async validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const allowedTransitions =
      this.config.statusTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition from '${currentStatus}' to '${newStatus}'`,
      };
    }

    return { success: true };
  }

  /**
   * Validate business rules
   */
  async validateBusinessRules(input: CreateRequestInput): Promise<{
    success: boolean;
    errors?: string[];
  }> {
    const errors: string[] = [];

    // Check for high priority keywords
    if (this.config.priorityValidation.autoUpgradeToHigh) {
      const hasHighPriorityKeyword =
        this.config.priorityValidation.highPriorityKeywords.some(keyword =>
          input.requestText.toLowerCase().includes(keyword)
        );

      if (hasHighPriorityKeyword && input.priority !== 'high') {
        errors.push(
          'Request text suggests high priority but priority is set to lower level'
        );
      }
    }

    // Check room number format
    const roomNumberRegex = /^[A-Za-z0-9\-_]{1,10}$/;
    if (!roomNumberRegex.test(input.roomNumber)) {
      errors.push('Invalid room number format');
    }

    // Check phone number if provided
    if (input.phoneNumber) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(input.phoneNumber.replace(/\s/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Apply business rules
   */
  async applyBusinessRules(
    input: CreateRequestInput
  ): Promise<CreateRequestInput> {
    let processedInput = { ...input };

    // Auto-upgrade priority based on keywords
    if (this.config.priorityValidation.autoUpgradeToHigh) {
      const hasHighPriorityKeyword =
        this.config.priorityValidation.highPriorityKeywords.some(keyword =>
          input.requestText.toLowerCase().includes(keyword)
        );

      if (hasHighPriorityKeyword && processedInput.priority !== 'high') {
        processedInput.priority = 'high';
        logger.info(
          '🔧 [RequestService] Auto-upgraded priority to high',
          'RequestService',
          { keywords: this.config.priorityValidation.highPriorityKeywords }
        );
      }
    }

    // Set default values
    if (!processedInput.priority) {
      processedInput.priority = 'medium';
    }

    if (!processedInput.currency) {
      processedInput.currency = 'VND';
    }

    if (!processedInput.urgency) {
      processedInput.urgency = this.determineRequestUrgency(processedInput);
    }

    return processedInput;
  }

  /**
   * Generate request description
   */
  generateRequestDescription(input: CreateRequestInput): string {
    const parts: string[] = [];

    if (input.serviceType) {
      parts.push(`Service: ${input.serviceType}`);
    }

    if (input.orderType) {
      parts.push(`Order Type: ${input.orderType}`);
    }

    if (input.deliveryTime) {
      parts.push(`Delivery: ${input.deliveryTime}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'General request';
  }

  /**
   * Determine request urgency
   */
  determineRequestUrgency(
    input: CreateRequestInput
  ): 'normal' | 'urgent' | 'critical' {
    if (input.urgency) {
      return input.urgency;
    }

    const highPriorityKeywords =
      this.config.priorityValidation.highPriorityKeywords;
    const hasHighPriorityKeyword = highPriorityKeywords.some(keyword =>
      input.requestText.toLowerCase().includes(keyword)
    );

    if (hasHighPriorityKeyword || input.priority === 'high') {
      return 'urgent';
    }

    return 'normal';
  }

  /**
   * Auto-assign request
   */
  async autoAssignRequest(request: RequestEntity): Promise<string | null> {
    // ✅ NEW: Phase 2 - Simple auto-assignment logic
    // In a real implementation, this would check staff availability
    const availableStaff = ['staff-1', 'staff-2', 'staff-3'];
    const randomStaff =
      availableStaff[Math.floor(Math.random() * availableStaff.length)];

    logger.info(
      '🔧 [RequestService] Auto-assigning request',
      'RequestService',
      { requestId: request.id, assignedTo: randomStaff }
    );

    return randomStaff;
  }

  /**
   * Check rate limits
   */
  async checkRateLimits(
    roomNumber: string,
    tenantId: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const key = `${tenantId}:${roomNumber}`;
    const now = new Date();
    const resetTime = new Date(now.getTime() + 3600000); // 1 hour

    const current = this.rateLimitCache.get(key);
    if (!current || now > current.resetTime) {
      this.rateLimitCache.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: 4, resetTime };
    }

    if (current.count >= 5) {
      // Max 5 requests per hour per room
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    current.count++;
    this.rateLimitCache.set(key, current);

    return {
      allowed: true,
      remaining: 5 - current.count,
      resetTime: current.resetTime,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get database connection with error handling
   */
  private async getDatabase() {
    try {
      return await getDatabase();
    } catch (error) {
      logger.error(
        '❌ [RequestService] Database connection failed',
        'RequestService',
        error
      );

      // Try to reinitialize
      try {
        await initializeDatabase();
        return await getDatabase();
      } catch (retryError) {
        logger.error(
          '❌ [RequestService] Database reinitialization failed',
          'RequestService',
          retryError
        );
        return null;
      }
    }
  }

  /**
   * Log audit events
   */
  private logAuditEvent(event: string, data: any) {
    if (this.config.audit.enabled) {
      logger.info(
        `📊 [RequestService] Audit: ${event}`,
        'RequestService',
        data
      );
    }
  }

  // ============================================================================
  // ADDITIONAL METHODS (to be implemented)
  // ============================================================================

  async bulkUpdateStatus(
    requestIds: number[],
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<BulkUpdateResult> {
    // Implementation for bulk update
    return {
      success: true,
      data: { updated: 0, failed: 0, total: requestIds.length },
    };
  }

  async deleteRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation for soft delete
    return { success: true };
  }

  async getRequestsByRoom(roomNumber: string): Promise<GetRequestsResult> {
    // Implementation for room-based queries
    return { success: true, data: [] };
  }

  async getRequestsByGuest(guestName: string): Promise<GetRequestsResult> {
    // Implementation for guest-based queries
    return { success: true, data: [] };
  }

  async getRequestsByStatus(status: string): Promise<GetRequestsResult> {
    // Implementation for status-based queries
    return { success: true, data: [] };
  }

  async getRequestsByPriority(priority: string): Promise<GetRequestsResult> {
    // Implementation for priority-based queries
    return { success: true, data: [] };
  }

  async getRequestsByAssignedTo(
    assignedTo: string
  ): Promise<GetRequestsResult> {
    // Implementation for assigned staff queries
    return { success: true, data: [] };
  }

  async getUrgentRequests(): Promise<GetRequestsResult> {
    // Implementation for urgent requests
    return { success: true, data: [] };
  }

  async getPendingRequests(): Promise<GetRequestsResult> {
    // Implementation for pending requests
    return { success: true, data: [] };
  }

  async getCompletedRequests(): Promise<GetRequestsResult> {
    // Implementation for completed requests
    return { success: true, data: [] };
  }

  async getRequestStatistics(): Promise<{
    success: boolean;
    data?: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
      urgent: number;
      byPriority: {
        low: number;
        medium: number;
        high: number;
      };
      byStatus: Record<string, number>;
    };
    error?: string;
  }> {
    // Implementation for statistics
    return {
      success: true,
      data: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        urgent: 0,
        byPriority: { low: 0, medium: 0, high: 0 },
        byStatus: {},
      },
    };
  }

  async canUpdateRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation for update permission check
    return { success: true };
  }

  async canDeleteRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation for delete permission check
    return { success: true };
  }
}
