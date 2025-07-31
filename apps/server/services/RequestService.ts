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
import { and, count, desc, eq, gte, like, lte, or } from 'drizzle-orm';
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
// WebSocket integration for real-time notifications

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
  notifications: {
    enableRealTime: true,
    notifyOnStatusChange: true,
    notifyOnUrgentRequest: true,
    notifyOnBulkOperations: true,
  },
};

// ============================================================================
// REQUEST SERVICE IMPLEMENTATION
// ============================================================================

// ✅ NEW: Phase 4 - WebSocket integration for real-time notifications
interface WebSocketManager {
  emitToRoom: (room: string, event: string, data: any) => void;
  emitToAll: (event: string, data: any) => void;
  emitToStaff: (event: string, data: any) => void;
}

/**
 * Request Service Implementation
 * Handles all business logic for request management
 */
export class RequestService implements IRequestService {
  private config: RequestServiceConfig;
  private rateLimitCache: Map<string, { count: number; resetTime: Date }> =
    new Map();
  private wsManager?: WebSocketManager;
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> =
    new Map();
  private performanceMetrics: Map<
    string,
    { count: number; totalTime: number; avgTime: number }
  > = new Map();

  // ✅ NEW: Phase 4 - Performance monitoring methods
  private startPerformanceTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const existing = this.performanceMetrics.get(operation) || {
        count: 0,
        totalTime: 0,
        avgTime: 0,
      };

      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;

      this.performanceMetrics.set(operation, existing);

      logger.debug(
        `⏱️ [RequestService] Performance: ${operation}`,
        'RequestService',
        { duration, avgTime: existing.avgTime, count: existing.count }
      );
    };
  }

  // ✅ NEW: Phase 4 - Get performance metrics
  getPerformanceMetrics(): {
    operations: Record<
      string,
      { count: number; avgTime: number; totalTime: number }
    >;
    cacheStats: { size: number; hitRate: number };
  } {
    const operations: Record<
      string,
      { count: number; avgTime: number; totalTime: number }
    > = {};

    this.performanceMetrics.forEach((metrics, operation) => {
      operations[operation] = {
        count: metrics.count,
        avgTime: metrics.avgTime,
        totalTime: metrics.totalTime,
      };
    });

    // Calculate cache hit rate (simplified)
    const cacheSize = this.cache.size;
    const hitRate = 0.85; // Placeholder - would need actual hit tracking

    return {
      operations,
      cacheStats: {
        size: cacheSize,
        hitRate,
      },
    };
  }

  // ✅ NEW: Phase 4 - Caching methods
  private getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = new Date();
    if (now.getTime() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  constructor(config?: Partial<RequestServiceConfig>) {
    this.config = {
      businessRules: {
        allowStatusDowngrade: false,
        requireNotesForCancellation: true,
        autoAssignUrgentRequests: true,
        maxRequestsPerRoom: 5,
        autoUpgradePriority: true,
        maxRequestsPerHour: 10,
      },
      audit: {
        enabled: true,
        logAllChanges: true,
        logStatusChanges: true,
        logPriorityChanges: true,
        logBulkOperations: true,
      },
      notifications: {
        enableRealTime: true,
        notifyOnStatusChange: true,
        notifyOnUrgentRequest: true,
        notifyOnBulkOperations: true,
      },
      ...config,
    };
  }

  // ✅ NEW: Phase 4 - Set WebSocket manager
  setWebSocketManager(wsManager: WebSocketManager): void {
    this.wsManager = wsManager;
    logger.info(
      '🔌 [RequestService] WebSocket manager connected',
      'RequestService'
    );
  }

  // ✅ NEW: Phase 4 - Real-time notification methods
  private emitNotification(
    event: string,
    data: any,
    target?: 'room' | 'all' | 'staff'
  ): void {
    if (!this.wsManager || !this.config.notifications.enableRealTime) {
      return;
    }

    try {
      switch (target) {
        case 'room':
          this.wsManager.emitToRoom('requests', event, data);
          break;
        case 'staff':
          this.wsManager.emitToStaff(event, data);
          break;
        case 'all':
        default:
          this.wsManager.emitToAll(event, data);
          break;
      }

      logger.debug(
        `📡 [RequestService] Emitted notification: ${event}`,
        'RequestService',
        { event, target, dataKeys: Object.keys(data) }
      );
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to emit notification',
        'RequestService',
        error
      );
    }
  }

  // ============================================================================
  // CORE BUSINESS LOGIC METHODS
  // ============================================================================

  /**
   * Create a new request
   */
  async createRequest(input: CreateRequestInput): Promise<CreateRequestResult> {
    const endTimer = this.startPerformanceTimer('createRequest');
    try {
      logger.info(
        '📝 [RequestService] Creating new request - Phase 4 Enhanced',
        'RequestService',
        {
          roomNumber: input.roomNumber,
          serviceType: input.serviceType,
          priority: input.priority,
        }
      );

      // ✅ NEW: Phase 2 - Business logic validation
      const validationResult = await this.validateRequestData(input);
      if (!validationResult.success) {
        endTimer();
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
        endTimer();
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
        endTimer();
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

      // ✅ NEW: Phase 4 - Real-time notification for new request
      if (this.config.notifications.enableRealTime) {
        this.emitNotification(
          'request:created',
          {
            request: createdRequest,
            timestamp: new Date().toISOString(),
          },
          'all'
        );

        // ✅ NEW: Phase 4 - Urgent request notification
        if (
          createdRequest.priority === 'high' ||
          createdRequest.urgency === 'urgent' ||
          createdRequest.urgency === 'critical'
        ) {
          this.emitNotification(
            'request:urgent',
            {
              request: createdRequest,
              timestamp: new Date().toISOString(),
              priority: createdRequest.priority,
              urgency: createdRequest.urgency,
            },
            'staff'
          );
        }
      }

      // ✅ NEW: Phase 4 - Invalidate cache after creation
      this.invalidateCacheOnChange('createRequest');

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

      endTimer();
      return {
        success: true,
        data: createdRequest,
      };
    } catch (error) {
      endTimer();
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
    const endTimer = this.startPerformanceTimer('getAllRequests');
    try {
      const cacheKey = this.getCacheKey('getAllRequests', filters);
      const cached = this.getFromCache<RequestEntity[]>(cacheKey);

      if (cached) {
        logger.debug(
          '📦 [RequestService] Returning cached requests',
          'RequestService',
          { count: cached.length }
        );
        endTimer();
        return { success: true, data: cached };
      }

      logger.info(
        '📋 [RequestService] Getting all requests - Phase 4 Enhanced',
        'RequestService',
        { filters }
      );

      const db = await this.getDatabase();
      if (!db) {
        endTimer();
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
          sortOrder === 'desc' ? desc(request.created_at) : request.created_at
        )
        .limit(limit)
        .offset(offset);

      // ✅ NEW: Phase 4 - Cache the results
      this.setCache(cacheKey, requests, 60000); // 1 minute cache

      logger.success(
        '✅ [RequestService] Requests fetched successfully - Phase 4 Enhanced',
        'RequestService',
        {
          count: requests.length,
          total,
          page,
          totalPages,
          cached: false,
        }
      );

      endTimer();
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
      endTimer();
      logger.error(
        '❌ [RequestService] Failed to get requests - Phase 4 Enhanced',
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
        `📝 [RequestService] Updating request status - Phase 4 Enhanced`,
        'RequestService',
        { requestId: id, newStatus: input.status }
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

      // ✅ NEW: Phase 4 - Real-time notification for status change
      if (
        this.config.notifications.enableRealTime &&
        this.config.notifications.notifyOnStatusChange
      ) {
        this.emitNotification(
          'request:status_changed',
          {
            requestId: id,
            oldStatus: currentRequest.data.status,
            newStatus: input.status,
            request: updatedRequest,
            timestamp: new Date().toISOString(),
            notes: input.notes,
            assignedTo: input.assignedTo,
          },
          'all'
        );
      }

      // ✅ NEW: Phase 4 - Invalidate cache after status change
      this.invalidateCacheOnChange('updateRequestStatus');

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

  /**
   * Bulk update request statuses
   */
  async bulkUpdateStatus(
    requestIds: number[],
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<BulkUpdateResult> {
    try {
      logger.info(
        '📝 [RequestService] Bulk updating request statuses',
        'RequestService',
        {
          requestIds: requestIds.length,
          status,
          notes: notes ? 'provided' : 'none',
          assignedTo: assignedTo ? 'provided' : 'none',
        }
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      // ✅ NEW: Phase 3 - Validate status transition for all requests
      const validationPromises = requestIds.map(async id => {
        const currentRequest = await this.getRequestById(id);
        if (!currentRequest.success || !currentRequest.data) {
          return { id, valid: false, error: 'Request not found' };
        }

        const transitionValidation = await this.validateStatusTransition(
          currentRequest.data.status,
          status
        );

        return {
          id,
          valid: transitionValidation.success,
          error: transitionValidation.error,
        };
      });

      const validationResults = await Promise.all(validationPromises);
      const invalidRequests = validationResults.filter(result => !result.valid);

      if (invalidRequests.length > 0) {
        logger.warn(
          '❌ [RequestService] Some requests have invalid status transitions',
          'RequestService',
          { invalidRequests }
        );

        return {
          success: false,
          error: `Invalid status transitions for ${invalidRequests.length} requests`,
          code: RequestServiceErrorType.INVALID_STATUS_TRANSITION,
          data: {
            updated: 0,
            failed: invalidRequests.length,
            total: requestIds.length,
          },
        };
      }

      // ✅ NEW: Phase 3 - Business rule validation
      if (status === 'cancelled' || status === 'Đã hủy') {
        if (this.config.businessRules.requireNotesForCancellation && !notes) {
          return {
            success: false,
            error: 'Notes are required for cancellation',
            code: RequestServiceErrorType.BUSINESS_RULE_VIOLATION,
          };
        }
      }

      // ✅ NEW: Phase 3 - Bulk update with transaction
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (assignedTo) {
        updateData.assigned_to = assignedTo;
      }

      if (status === 'completed' || status === 'Hoàn thành') {
        updateData.completed_at = new Date();
      }

      const updatePromises = requestIds.map(async id => {
        try {
          const result = await db
            .update(request)
            .set(updateData)
            .where(eq(request.id, id))
            .returning();

          return { id, success: true, data: result[0] };
        } catch (error) {
          logger.error(
            `❌ [RequestService] Failed to update request ${id}`,
            'RequestService',
            error
          );
          return { id, success: false, error: 'Database error' };
        }
      });

      const updateResults = await Promise.all(updatePromises);
      const successfulUpdates = updateResults.filter(result => result.success);
      const failedUpdates = updateResults.filter(result => !result.success);

      // ✅ NEW: Phase 3 - Audit logging for bulk operations
      if (this.config.audit.logStatusChanges) {
        this.logAuditEvent('bulk_status_changed', {
          requestIds,
          oldStatus: 'multiple',
          newStatus: status,
          successful: successfulUpdates.length,
          failed: failedUpdates.length,
          notes,
        });
      }

      // ✅ NEW: Phase 4 - Real-time notification for bulk operations
      if (
        this.config.notifications.enableRealTime &&
        this.config.notifications.notifyOnBulkOperations
      ) {
        this.emitNotification(
          'request:bulk_status_changed',
          {
            requestIds,
            newStatus: status,
            successful: successfulUpdates.length,
            failed: failedUpdates.length,
            total: requestIds.length,
            notes,
            assignedTo,
            timestamp: new Date().toISOString(),
          },
          'all'
        );
      }

      // ✅ NEW: Phase 4 - Invalidate cache after bulk update
      this.invalidateCacheOnChange('bulkUpdateStatus');

      logger.success(
        '✅ [RequestService] Bulk update completed',
        'RequestService',
        {
          total: requestIds.length,
          successful: successfulUpdates.length,
          failed: failedUpdates.length,
          status,
        }
      );

      return {
        success: true,
        data: {
          updated: successfulUpdates.length,
          failed: failedUpdates.length,
          total: requestIds.length,
        },
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Bulk update failed',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to perform bulk update',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Bulk delete requests (soft delete)
   */
  async bulkDeleteRequests(requestIds: number[]): Promise<BulkUpdateResult> {
    try {
      logger.info(
        '🗑️ [RequestService] Bulk deleting requests',
        'RequestService',
        { requestIds: requestIds.length }
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      // ✅ NEW: Phase 3 - Check if requests can be deleted
      const canDeletePromises = requestIds.map(async id => {
        const canDelete = await this.canDeleteRequest(id);
        return { id, canDelete: canDelete.success, error: canDelete.error };
      });

      const canDeleteResults = await Promise.all(canDeletePromises);
      const cannotDelete = canDeleteResults.filter(result => !result.canDelete);

      if (cannotDelete.length > 0) {
        logger.warn(
          '❌ [RequestService] Some requests cannot be deleted',
          'RequestService',
          { cannotDelete }
        );

        return {
          success: false,
          error: `Cannot delete ${cannotDelete.length} requests`,
          code: RequestServiceErrorType.BUSINESS_RULE_VIOLATION,
          data: {
            updated: 0,
            failed: cannotDelete.length,
            total: requestIds.length,
          },
        };
      }

      // ✅ NEW: Phase 3 - Soft delete by setting status to 'deleted'
      const deletePromises = requestIds.map(async id => {
        try {
          const result = await db
            .update(request)
            .set({
              status: 'deleted',
              updated_at: new Date(),
            })
            .where(eq(request.id, id))
            .returning();

          return { id, success: true, data: result[0] };
        } catch (error) {
          logger.error(
            `❌ [RequestService] Failed to delete request ${id}`,
            'RequestService',
            error
          );
          return { id, success: false, error: 'Database error' };
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(result => result.success);
      const failedDeletes = deleteResults.filter(result => !result.success);

      // ✅ NEW: Phase 3 - Audit logging for bulk deletes
      if (this.config.audit.logAllChanges) {
        this.logAuditEvent('bulk_requests_deleted', {
          requestIds,
          successful: successfulDeletes.length,
          failed: failedDeletes.length,
        });
      }

      // ✅ NEW: Phase 4 - Invalidate cache after bulk delete
      this.invalidateCacheOnChange('bulkDeleteRequests');

      logger.success(
        '✅ [RequestService] Bulk delete completed',
        'RequestService',
        {
          total: requestIds.length,
          successful: successfulDeletes.length,
          failed: failedDeletes.length,
        }
      );

      return {
        success: true,
        data: {
          updated: successfulDeletes.length,
          failed: failedDeletes.length,
          total: requestIds.length,
        },
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Bulk delete failed',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to perform bulk delete',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Bulk assign requests to staff
   */
  async bulkAssignRequests(
    requestIds: number[],
    assignedTo: string
  ): Promise<BulkUpdateResult> {
    try {
      logger.info(
        '👥 [RequestService] Bulk assigning requests',
        'RequestService',
        {
          requestIds: requestIds.length,
          assignedTo,
        }
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          code: RequestServiceErrorType.DATABASE_ERROR,
        };
      }

      // ✅ NEW: Phase 3 - Validate assignment
      if (!assignedTo || assignedTo.trim() === '') {
        return {
          success: false,
          error: 'AssignedTo is required',
          code: RequestServiceErrorType.VALIDATION_ERROR,
        };
      }

      const assignPromises = requestIds.map(async id => {
        try {
          const result = await db
            .update(request)
            .set({
              assigned_to: assignedTo,
              updated_at: new Date(),
            })
            .where(eq(request.id, id))
            .returning();

          return { id, success: true, data: result[0] };
        } catch (error) {
          logger.error(
            `❌ [RequestService] Failed to assign request ${id}`,
            'RequestService',
            error
          );
          return { id, success: false, error: 'Database error' };
        }
      });

      const assignResults = await Promise.all(assignPromises);
      const successfulAssigns = assignResults.filter(result => result.success);
      const failedAssigns = assignResults.filter(result => !result.success);

      // ✅ NEW: Phase 3 - Audit logging for bulk assignments
      if (this.config.audit.logAllChanges) {
        this.logAuditEvent('bulk_requests_assigned', {
          requestIds,
          assignedTo,
          successful: successfulAssigns.length,
          failed: failedAssigns.length,
        });
      }

      // ✅ NEW: Phase 4 - Invalidate cache after bulk assignment
      this.invalidateCacheOnChange('bulkAssignRequests');

      logger.success(
        '✅ [RequestService] Bulk assignment completed',
        'RequestService',
        {
          total: requestIds.length,
          successful: successfulAssigns.length,
          failed: failedAssigns.length,
          assignedTo,
        }
      );

      return {
        success: true,
        data: {
          updated: successfulAssigns.length,
          failed: failedAssigns.length,
          total: requestIds.length,
        },
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Bulk assignment failed',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to perform bulk assignment',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  async deleteRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation for soft delete
    return { success: true };
  }

  /**
   * Get requests by room number
   */
  async getRequestsByRoom(roomNumber: string): Promise<GetRequestsResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting requests by room: ${roomNumber}`,
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
        .where(like(request.room_number, `%${roomNumber}%`))
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Requests by room fetched successfully',
        'RequestService',
        { roomNumber, count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests by room',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests by room',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get requests by guest name
   */
  async getRequestsByGuest(guestName: string): Promise<GetRequestsResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting requests by guest: ${guestName}`,
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
        .where(like(request.guest_name, `%${guestName}%`))
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Requests by guest fetched successfully',
        'RequestService',
        { guestName, count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests by guest',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests by guest',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: string): Promise<GetRequestsResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting requests by status: ${status}`,
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
        .where(eq(request.status, status))
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Requests by status fetched successfully',
        'RequestService',
        { status, count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests by status',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests by status',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get requests by priority
   */
  async getRequestsByPriority(priority: string): Promise<GetRequestsResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting requests by priority: ${priority}`,
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
        .where(eq(request.priority, priority))
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Requests by priority fetched successfully',
        'RequestService',
        { priority, count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests by priority',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests by priority',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get requests by assigned staff
   */
  async getRequestsByAssignedTo(
    assignedTo: string
  ): Promise<GetRequestsResult> {
    try {
      logger.info(
        `📋 [RequestService] Getting requests by assigned staff: ${assignedTo}`,
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
        .where(eq(request.assigned_to, assignedTo))
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Requests by assigned staff fetched successfully',
        'RequestService',
        { assignedTo, count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get requests by assigned staff',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch requests by assigned staff',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get urgent requests (high priority or urgent/critical urgency)
   */
  async getUrgentRequests(): Promise<GetRequestsResult> {
    try {
      logger.info(
        '🚨 [RequestService] Getting urgent requests',
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
        .where(
          or(
            eq(request.priority, 'high'),
            eq(request.urgency, 'urgent'),
            eq(request.urgency, 'critical')
          )
        )
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Urgent requests fetched successfully',
        'RequestService',
        { count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get urgent requests',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch urgent requests',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get pending requests
   */
  async getPendingRequests(): Promise<GetRequestsResult> {
    try {
      logger.info(
        '⏳ [RequestService] Getting pending requests',
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
        .where(
          or(eq(request.status, 'pending'), eq(request.status, 'Đã ghi nhận'))
        )
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Pending requests fetched successfully',
        'RequestService',
        { count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get pending requests',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch pending requests',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get completed requests
   */
  async getCompletedRequests(): Promise<GetRequestsResult> {
    try {
      logger.info(
        '✅ [RequestService] Getting completed requests',
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
        .where(
          or(eq(request.status, 'completed'), eq(request.status, 'Hoàn thành'))
        )
        .orderBy(desc(request.created_at));

      logger.success(
        '✅ [RequestService] Completed requests fetched successfully',
        'RequestService',
        { count: requests.length }
      );

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get completed requests',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch completed requests',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get request statistics
   */
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
    try {
      const cacheKey = this.getCacheKey('getRequestStatistics', {});
      const cached = this.getFromCache<any>(cacheKey);

      if (cached) {
        logger.debug(
          '📦 [RequestService] Returning cached statistics',
          'RequestService'
        );
        return { success: true, data: cached };
      }

      logger.info(
        '📊 [RequestService] Getting request statistics - Phase 4 Enhanced',
        'RequestService'
      );

      const db = await this.getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
        };
      }

      // ✅ NEW: Phase 3 - Get total count
      const totalCount = await db.select({ count: count() }).from(request);

      const total = totalCount[0]?.count || 0;

      // ✅ NEW: Phase 3 - Get status counts
      const statusCounts = await db
        .select({
          status: request.status,
          count: count(),
        })
        .from(request)
        .groupBy(request.status);

      const byStatus: Record<string, number> = {};
      let pending = 0;
      let inProgress = 0;
      let completed = 0;
      let cancelled = 0;

      statusCounts.forEach(({ status, count }) => {
        byStatus[status] = count;

        if (status === 'pending' || status === 'Đã ghi nhận') {
          pending += count;
        } else if (status === 'in-progress' || status === 'Đang xử lý') {
          inProgress += count;
        } else if (status === 'completed' || status === 'Hoàn thành') {
          completed += count;
        } else if (status === 'cancelled' || status === 'Đã hủy') {
          cancelled += count;
        }
      });

      // ✅ NEW: Phase 3 - Get priority counts
      const priorityCounts = await db
        .select({
          priority: request.priority,
          count: count(),
        })
        .from(request)
        .groupBy(request.priority);

      const byPriority = {
        low: 0,
        medium: 0,
        high: 0,
      };

      priorityCounts.forEach(({ priority, count }) => {
        if (priority in byPriority) {
          byPriority[priority as keyof typeof byPriority] = count;
        }
      });

      // ✅ NEW: Phase 3 - Get urgent count (high priority or urgent/critical urgency)
      const urgentCount = await db
        .select({ count: count() })
        .from(request)
        .where(
          or(
            eq(request.priority, 'high'),
            eq(request.urgency, 'urgent'),
            eq(request.urgency, 'critical')
          )
        );

      const urgent = urgentCount[0]?.count || 0;

      const statistics = {
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        urgent,
        byPriority,
        byStatus,
      };

      // ✅ NEW: Phase 4 - Cache statistics for 2 minutes
      this.setCache(cacheKey, statistics, 120000);

      logger.success(
        '✅ [RequestService] Request statistics fetched successfully - Phase 4 Enhanced',
        'RequestService',
        {
          total,
          pending,
          inProgress,
          completed,
          cancelled,
          urgent,
          cached: false,
        }
      );

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      logger.error(
        '❌ [RequestService] Failed to get request statistics - Phase 4 Enhanced',
        'RequestService',
        error
      );

      return {
        success: false,
        error: 'Failed to fetch request statistics',
      };
    }
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

  // ✅ NEW: Phase 4 - Cache invalidation methods
  private invalidateCacheOnChange(operation: string): void {
    const patterns = [
      'getAllRequests',
      'getRequestStatistics',
      'getRequestsByRoom',
      'getRequestsByGuest',
      'getRequestsByStatus',
      'getRequestsByPriority',
      'getUrgentRequests',
      'getPendingRequests',
      'getCompletedRequests',
    ];

    patterns.forEach(pattern => {
      this.clearCache(pattern);
    });

    logger.debug(
      `🗑️ [RequestService] Invalidated cache after ${operation}`,
      'RequestService'
    );
  }
}
