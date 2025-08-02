/**
 * 🎨 PRISMA REQUEST SERVICE IMPLEMENTATION
 *
 * Prisma-based implementation of Request Service
 * Replaces Drizzle ORM with Prisma for better type safety and performance
 */

import { PrismaClient } from '../../generated/prisma';
import {
  CreateRequestInput,
  DatabaseTransaction,
  DateRange,
  IDatabaseService,
  RequestEntity,
  RequestFilters,
  RequestStats,
  UpdateRequestInput,
} from '../db/IDatabaseService';
import { PrismaConnectionManager } from '../db/PrismaConnectionManager';
import { logger } from '../utils/logger';

// Import existing interfaces for compatibility
import {
  BulkUpdateResult,
  CreateRequestResult,
  GetRequestByIdResult,
  GetRequestsResult,
  IRequestService,
  RequestServiceErrorType,
  UpdateRequestStatusResult,
} from '../../../apps/server/services/interfaces/RequestServiceInterface';

import {
  CreateRequestInput as LegacyCreateRequestInput,
  RequestFiltersInput,
  UpdateRequestStatusInput,
} from '../validation/requestSchemas';

/**
 * Prisma Request Service Configuration
 */
interface PrismaRequestServiceConfig {
  enableCaching: boolean;
  cacheTimeoutMs: number;
  enablePerformanceMetrics: boolean;
  enableAuditLogging: boolean;
  maxRetries: number;
  retryDelayMs: number;
  enableRateLimiting: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Default configuration for Prisma Request Service
 */
const DEFAULT_CONFIG: PrismaRequestServiceConfig = {
  enableCaching: true,
  cacheTimeoutMs: 60000, // 1 minute
  enablePerformanceMetrics: true,
  enableAuditLogging: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  enableRateLimiting: true,
  rateLimitWindowMs: 900000, // 15 minutes
  rateLimitMaxRequests: 100,
};

/**
 * Performance metrics tracking
 */
interface PerformanceMetrics {
  operationCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  slowestOperation: number;
  fastestOperation: number;
  errorCount: number;
  lastError?: string;
  lastErrorTime?: Date;
}

/**
 * Cache interface for request caching
 */
interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expiry: number;
  };
}

/**
 * Rate limiting tracker
 */
interface RateLimitTracker {
  [key: string]: {
    requests: number;
    windowStart: number;
  };
}

/**
 * PrismaRequestService - Modern implementation using Prisma ORM
 */
export class PrismaRequestService implements IDatabaseService, IRequestService {
  private prismaManager: PrismaConnectionManager;
  private prisma: PrismaClient;
  private config: PrismaRequestServiceConfig;
  private metrics: PerformanceMetrics;
  private cache: RequestCache = {};
  private rateLimitTracker: RateLimitTracker = {};
  private instanceId: string;

  constructor(
    prismaManager: PrismaConnectionManager,
    config: Partial<PrismaRequestServiceConfig> = {}
  ) {
    this.prismaManager = prismaManager;
    this.prisma = prismaManager.getClient();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instanceId = `prisma-request-service-${Date.now()}`;

    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
    };

    logger.info('🎨 PrismaRequestService initialized', {
      instanceId: this.instanceId,
      config: this.config,
    });
  }

  // ============================================================================
  // PERFORMANCE & UTILITY METHODS
  // ============================================================================

  /**
   * Start performance timer for an operation
   */
  private startPerformanceTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.updateMetrics(duration);

      if (this.config.enablePerformanceMetrics) {
        if (duration > 1000) {
          logger.warn(
            `🐌 Slow Prisma operation: ${operation} took ${duration}ms`
          );
        } else {
          logger.debug(
            `⚡ Prisma operation: ${operation} completed in ${duration}ms`
          );
        }
      }
    };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(duration: number): void {
    this.metrics.operationCount++;
    this.metrics.totalExecutionTime += duration;
    this.metrics.averageExecutionTime =
      this.metrics.totalExecutionTime / this.metrics.operationCount;

    if (duration > this.metrics.slowestOperation) {
      this.metrics.slowestOperation = duration;
    }

    if (duration < this.metrics.fastestOperation) {
      this.metrics.fastestOperation = duration;
    }
  }

  /**
   * Generate cache key for operations
   */
  private getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.config.enableCaching) return null;

    const cached = this.cache[key];
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      delete this.cache[key];
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache with expiry
   */
  private setCache(key: string, data: any, ttlMs?: number): void {
    if (!this.config.enableCaching) return;

    const ttl = ttlMs || this.config.cacheTimeoutMs;
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };
  }

  /**
   * Check rate limits for requests
   */
  private checkRateLimit(identifier: string): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindowMs;

    // Clean old entries
    Object.keys(this.rateLimitTracker).forEach(key => {
      if (this.rateLimitTracker[key].windowStart < windowStart) {
        delete this.rateLimitTracker[key];
      }
    });

    const tracker = this.rateLimitTracker[identifier];
    if (!tracker) {
      this.rateLimitTracker[identifier] = {
        requests: 1,
        windowStart: now,
      };
      return true;
    }

    if (tracker.requests >= this.config.rateLimitMaxRequests) {
      return false;
    }

    tracker.requests++;
    return true;
  }

  /**
   * Convert Prisma request to RequestEntity format
   */
  private mapPrismaRequestToEntity(prismaRequest: any): RequestEntity {
    return {
      id: prismaRequest.id,
      room_number: prismaRequest.room_number,
      guest_name: prismaRequest.guest_name,
      request_content: prismaRequest.request_content,
      status: prismaRequest.status,
      created_at: prismaRequest.created_at,
      updated_at: prismaRequest.updated_at,
      tenant_id: prismaRequest.tenant_id,
      description: prismaRequest.description,
      priority: prismaRequest.priority,
      assigned_to: prismaRequest.assigned_to,
      completed_at: prismaRequest.completed_at,
      metadata: prismaRequest.metadata,
      type: prismaRequest.type,
      total_amount: prismaRequest.total_amount
        ? Number(prismaRequest.total_amount)
        : undefined,
      items: prismaRequest.items,
      delivery_time: prismaRequest.delivery_time,
      special_instructions: prismaRequest.special_instructions,
      order_type: prismaRequest.order_type,
      call_id: prismaRequest.call_id,
      service_id: prismaRequest.service_id,
      phone_number: prismaRequest.phone_number,
      currency: prismaRequest.currency,
      urgency: prismaRequest.urgency,
    };
  }

  // ============================================================================
  // IDATABASESERVICE IMPLEMENTATION (New Interface)
  // ============================================================================

  /**
   * Create a new request using the new interface
   */
  async createRequest(requestData: CreateRequestInput): Promise<RequestEntity> {
    const endTimer = this.startPerformanceTimer('createRequest_new');

    try {
      logger.info(
        '🎨 [PrismaRequestService] Creating request with new interface',
        {
          roomNumber: requestData.room_number,
          tenantId: requestData.tenant_id,
        }
      );

      // Rate limiting check
      const rateLimitKey = `${requestData.tenant_id || 'default'}:${requestData.room_number}`;
      if (!this.checkRateLimit(rateLimitKey)) {
        throw new Error('Rate limit exceeded for this room/tenant');
      }

      const newRequest = await this.prisma.request.create({
        data: {
          tenant_id: requestData.tenant_id || 'mi-nhon-hotel',
          room_number: requestData.room_number || '',
          guest_name: requestData.guest_name,
          request_content: requestData.request_content,
          description: requestData.description,
          priority: requestData.priority || 'medium',
          status: 'pending',
          type: requestData.type,
          total_amount: requestData.total_amount,
          items: requestData.items,
          delivery_time: requestData.delivery_time,
          special_instructions: requestData.special_instructions,
          order_type: requestData.order_type,
          call_id: requestData.call_id,
          phone_number: requestData.phone_number,
          currency: requestData.currency || 'USD',
          urgency: requestData.urgency || 'normal',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const mappedRequest = this.mapPrismaRequestToEntity(newRequest);

      // Clear cache for related queries
      this.clearRequestCaches();

      logger.success('✅ [PrismaRequestService] Request created successfully', {
        requestId: newRequest.id,
      });

      endTimer();
      return mappedRequest;
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.lastError =
        error instanceof Error ? error.message : 'Unknown error';
      this.metrics.lastErrorTime = new Date();

      logger.error('❌ [PrismaRequestService] Failed to create request', error);
      endTimer();
      throw error;
    }
  }

  /**
   * Get request by ID using the new interface
   */
  async getRequestById(id: number): Promise<RequestEntity | null> {
    const endTimer = this.startPerformanceTimer('getRequestById_new');

    try {
      const cacheKey = this.getCacheKey('getRequestById', { id });
      const cached = this.getFromCache<RequestEntity>(cacheKey);

      if (cached) {
        endTimer();
        return cached;
      }

      const request = await this.prisma.request.findUnique({
        where: { id },
      });

      if (!request) {
        endTimer();
        return null;
      }

      const mappedRequest = this.mapPrismaRequestToEntity(request);
      this.setCache(cacheKey, mappedRequest);

      endTimer();
      return mappedRequest;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get request by ID',
        error
      );
      endTimer();
      throw error;
    }
  }

  /**
   * Get all requests with filters using the new interface
   */
  async getAllRequests(filters?: RequestFilters): Promise<RequestEntity[]> {
    const endTimer = this.startPerformanceTimer('getAllRequests_new');

    try {
      const cacheKey = this.getCacheKey('getAllRequests', filters);
      const cached = this.getFromCache<RequestEntity[]>(cacheKey);

      if (cached) {
        endTimer();
        return cached;
      }

      const where: any = {};

      // Apply filters
      if (filters?.tenantId) {
        where.tenant_id = filters.tenantId;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      if (filters?.type) {
        where.type = filters.type;
      }
      if (filters?.roomNumber) {
        where.room_number = {
          contains: filters.roomNumber,
        };
      }
      if (filters?.assignedTo) {
        where.assigned_to = filters.assignedTo;
      }
      if (filters?.dateFrom || filters?.dateTo) {
        where.created_at = {};
        if (filters.dateFrom) {
          where.created_at.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.created_at.lte = filters.dateTo;
        }
      }

      const requests = await this.prisma.request.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: filters?.limit || 100,
        skip: filters?.offset || 0,
      });

      const mappedRequests = requests.map(req =>
        this.mapPrismaRequestToEntity(req)
      );
      this.setCache(cacheKey, mappedRequests);

      logger.info('✅ [PrismaRequestService] Retrieved requests successfully', {
        count: requests.length,
        filters,
      });

      endTimer();
      return mappedRequests;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get all requests',
        error
      );
      endTimer();
      throw error;
    }
  }

  /**
   * Update request using the new interface
   */
  async updateRequest(
    id: number,
    data: UpdateRequestInput
  ): Promise<RequestEntity> {
    const endTimer = this.startPerformanceTimer('updateRequest_new');

    try {
      const updateData: any = {};

      // Map fields from UpdateRequestInput to Prisma fields
      if (data.room_number !== undefined)
        updateData.room_number = data.room_number;
      if (data.guest_name !== undefined)
        updateData.guest_name = data.guest_name;
      if (data.request_content !== undefined)
        updateData.request_content = data.request_content;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.assigned_to !== undefined)
        updateData.assigned_to = data.assigned_to;
      if (data.completed_at !== undefined)
        updateData.completed_at = data.completed_at;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.total_amount !== undefined)
        updateData.total_amount = data.total_amount;
      if (data.items !== undefined) updateData.items = data.items;
      if (data.delivery_time !== undefined)
        updateData.delivery_time = data.delivery_time;
      if (data.special_instructions !== undefined)
        updateData.special_instructions = data.special_instructions;
      if (data.order_type !== undefined)
        updateData.order_type = data.order_type;
      if (data.phone_number !== undefined)
        updateData.phone_number = data.phone_number;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.urgency !== undefined) updateData.urgency = data.urgency;

      updateData.updated_at = new Date();

      const updatedRequest = await this.prisma.request.update({
        where: { id },
        data: updateData,
      });

      const mappedRequest = this.mapPrismaRequestToEntity(updatedRequest);

      // Clear caches
      this.clearRequestCaches();

      logger.success('✅ [PrismaRequestService] Request updated successfully', {
        requestId: id,
      });

      endTimer();
      return mappedRequest;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error('❌ [PrismaRequestService] Failed to update request', error);
      endTimer();
      throw error;
    }
  }

  /**
   * Delete request using the new interface
   */
  async deleteRequest(id: number): Promise<boolean> {
    const endTimer = this.startPerformanceTimer('deleteRequest_new');

    try {
      await this.prisma.request.delete({
        where: { id },
      });

      // Clear caches
      this.clearRequestCaches();

      logger.success('✅ [PrismaRequestService] Request deleted successfully', {
        requestId: id,
      });

      endTimer();
      return true;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error('❌ [PrismaRequestService] Failed to delete request', error);
      endTimer();
      return false;
    }
  }

  // ============================================================================
  // LEGACY IREQUESTSERVICE IMPLEMENTATION (Compatibility)
  // ============================================================================

  /**
   * Create request using legacy interface for compatibility
   */
  async createRequest(
    input: LegacyCreateRequestInput
  ): Promise<CreateRequestResult> {
    const endTimer = this.startPerformanceTimer('createRequest_legacy');

    try {
      logger.info(
        '🔄 [PrismaRequestService] Creating request via legacy interface',
        {
          roomNumber: input.roomNumber,
          requestText: input.requestText,
        }
      );

      // Convert legacy input to new format
      const newInput: CreateRequestInput = {
        room_number: input.roomNumber,
        guest_name: input.guestName,
        request_content: input.requestText,
        tenant_id: input.tenantId,
        description: input.description,
        priority: input.priority,
        type: input.serviceType,
        total_amount: input.totalAmount,
        phone_number: input.phoneNumber,
        currency: input.currency,
        urgency: input.urgency,
        order_type: input.orderType,
        delivery_time: input.deliveryTime
          ? new Date(input.deliveryTime)
          : undefined,
        special_instructions: input.specialInstructions,
        items: input.items,
      };

      const createdRequest = await this.createRequest(newInput);

      endTimer();
      return {
        success: true,
        data: createdRequest,
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to create request via legacy interface',
        error
      );
      endTimer();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  // Continue with other legacy interface methods...
  // For brevity, I'll implement key methods and placeholder others

  /**
   * Get all requests using legacy interface
   */
  async getAllRequests(
    filters?: RequestFiltersInput
  ): Promise<GetRequestsResult> {
    const endTimer = this.startPerformanceTimer('getAllRequests_legacy');

    try {
      // Convert legacy filters to new format
      const newFilters: RequestFilters = {};

      if (filters) {
        if (filters.status) newFilters.status = filters.status;
        if (filters.priority) newFilters.priority = filters.priority;
        if (filters.roomNumber) newFilters.roomNumber = filters.roomNumber;
        if (filters.guestName) newFilters.tenantId = filters.tenantId;
        if (filters.assignedTo) newFilters.assignedTo = filters.assignedTo;
        if (filters.startDate)
          newFilters.dateFrom = new Date(filters.startDate);
        if (filters.endDate) newFilters.dateTo = new Date(filters.endDate);
        if (filters.limit) newFilters.limit = filters.limit;
        if (filters.page)
          newFilters.offset = (filters.page - 1) * (filters.limit || 10);
      }

      const requests = await this.getAllRequests(newFilters);

      endTimer();
      return {
        success: true,
        data: requests,
        total: requests.length,
        page: filters?.page || 1,
        totalPages: Math.ceil(requests.length / (filters?.limit || 10)),
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get all requests via legacy interface',
        error
      );
      endTimer();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get request by ID using legacy interface
   */
  async getRequestById(id: number): Promise<GetRequestByIdResult> {
    const endTimer = this.startPerformanceTimer('getRequestById_legacy');

    try {
      const request = await this.getRequestById(id);

      endTimer();

      if (!request) {
        return {
          success: false,
          error: 'Request not found',
          code: RequestServiceErrorType.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get request by ID via legacy interface',
        error
      );
      endTimer();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear all request-related caches
   */
  private clearRequestCaches(): void {
    Object.keys(this.cache).forEach(key => {
      if (key.includes('getAllRequests') || key.includes('getRequestById')) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowestOperation: 0,
      fastestOperation: Infinity,
      errorCount: 0,
    };
  }

  // ============================================================================
  // PLACEHOLDER METHODS (To be implemented as needed)
  // ============================================================================

  // Additional IDatabaseService methods
  async getTenantById(id: string): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getAllTenants(): Promise<any[]> {
    throw new Error('Not implemented yet');
  }
  async createTenant(tenantData: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async updateTenant(id: string, data: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getUserById(id: string): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getUserByEmail(email: string): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async createUser(userData: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async updateUser(id: string, data: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async createCall(callData: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getCallById(id: string): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getCallsByTenant(tenantId: string): Promise<any[]> {
    throw new Error('Not implemented yet');
  }
  async updateCall(id: string, data: any): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getRequestStats(
    tenantId: string,
    dateRange?: DateRange
  ): Promise<RequestStats> {
    throw new Error('Not implemented yet');
  }
  async getCallStats(tenantId: string, dateRange?: DateRange): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async getTenantMetrics(tenantId: string): Promise<any> {
    throw new Error('Not implemented yet');
  }
  async connect(): Promise<void> {
    await this.prismaManager.initialize();
  }
  async disconnect(): Promise<void> {
    await this.prismaManager.disconnect();
  }
  async healthCheck(): Promise<boolean> {
    return await this.prismaManager.healthCheck();
  }
  async beginTransaction(): Promise<DatabaseTransaction> {
    throw new Error('Not implemented yet');
  }

  // Additional IRequestService methods (placeholders)
  async updateRequestStatus(
    id: number,
    input: UpdateRequestStatusInput
  ): Promise<UpdateRequestStatusResult> {
    throw new Error('Not implemented yet');
  }
  async bulkUpdateStatus(
    requestIds: number[],
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<BulkUpdateResult> {
    throw new Error('Not implemented yet');
  }
  async getRequestsByRoom(roomNumber: string): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getRequestsByGuest(guestName: string): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getRequestsByStatus(status: string): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getRequestsByPriority(priority: string): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getRequestsByAssignedTo(
    assignedTo: string
  ): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getUrgentRequests(): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getPendingRequests(): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
  async getCompletedRequests(): Promise<GetRequestsResult> {
    throw new Error('Not implemented yet');
  }
}
