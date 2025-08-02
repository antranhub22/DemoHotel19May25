/**
 * 🎨 PRISMA REQUEST SERVICE IMPLEMENTATION
 *
 * Clean implementation using Prisma ORM
 * Supports both new IDatabaseService and legacy IRequestService interfaces
 */

import { PrismaClient } from '@prisma/client';
import { CreateRequestInput, RequestFilters } from '../db/IDatabaseService';
import { PrismaConnectionManager } from '../db/PrismaConnectionManager';
import { logger } from '../utils/logger';

// Legacy interface imports
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
 * PrismaRequestService - Clean implementation supporting both interfaces
 */
export class PrismaRequestService implements IRequestService {
  private prisma: PrismaClient;
  private prismaManager: PrismaConnectionManager;
  private instanceId: string;
  private metrics = {
    operationCount: 0,
    errorCount: 0,
  };

  constructor(prismaManager: PrismaConnectionManager) {
    this.prismaManager = prismaManager;
    this.prisma = prismaManager.getClient();
    this.instanceId = `prisma-request-service-${Date.now()}`;

    logger.info('🎨 PrismaRequestService initialized', this.instanceId);
  }

  // ============================================================================
  // CORE UTILITY METHODS
  // ============================================================================

  /**
   * Map Prisma request to RequestEntity (compatible with both interfaces)
   */
  private mapPrismaRequestToEntity(prismaRequest: any): any {
    return {
      id: prismaRequest.id,
      room_number: prismaRequest.room_number,
      guest_name: prismaRequest.guest_name,
      request_content: prismaRequest.request_content,
      status: prismaRequest.status,
      created_at: prismaRequest.created_at,
      updated_at: prismaRequest.updated_at,
      tenant_id: prismaRequest.tenant_id || 'mi-nhon-hotel', // Ensure tenant_id is always present
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
  // NEW INTERFACE METHODS (IDatabaseService)
  // ============================================================================

  /**
   * Create request using new interface
   */
  async createRequestNew(requestData: CreateRequestInput): Promise<any> {
    try {
      logger.info(
        '🎨 [PrismaRequestService] Creating request (new interface)',
        this.instanceId
      );

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

      logger.success(
        '✅ [PrismaRequestService] Request created successfully',
        newRequest.id.toString()
      );
      return mappedRequest;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to create request',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Get request by ID using new interface
   */
  async getRequestByIdNew(id: number): Promise<any | null> {
    try {
      const request = await this.prisma.request.findUnique({
        where: { id },
      });

      if (!request) return null;

      return this.mapPrismaRequestToEntity(request);
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get request by ID',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Get all requests using new interface
   */
  async getAllRequestsNew(filters?: RequestFilters): Promise<any[]> {
    try {
      const where: any = {};

      // Apply filters
      if (filters?.tenantId) where.tenant_id = filters.tenantId;
      if (filters?.status) where.status = filters.status;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.type) where.type = filters.type;
      if (filters?.roomNumber)
        where.room_number = { contains: filters.roomNumber };
      if (filters?.assignedTo) where.assigned_to = filters.assignedTo;

      if (filters?.dateFrom || filters?.dateTo) {
        where.created_at = {};
        if (filters.dateFrom) where.created_at.gte = filters.dateFrom;
        if (filters.dateTo) where.created_at.lte = filters.dateTo;
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

      logger.info(
        '✅ [PrismaRequestService] Retrieved requests successfully',
        requests.length.toString()
      );
      return mappedRequests;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get all requests',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Update request using new interface
   */
  async updateRequestNew(id: number, data: any): Promise<any> {
    try {
      const updatedRequest = await this.prisma.request.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });

      const mappedRequest = this.mapPrismaRequestToEntity(updatedRequest);
      logger.info(
        '✅ [PrismaRequestService] Request updated successfully',
        id.toString()
      );
      return mappedRequest;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to update request',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Delete request using new interface
   */
  async deleteRequestNew(id: number): Promise<boolean> {
    try {
      await this.prisma.request.delete({
        where: { id },
      });

      logger.info(
        '✅ [PrismaRequestService] Request deleted successfully',
        id.toString()
      );
      return true;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to delete request',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  // ============================================================================
  // LEGACY INTERFACE METHODS (IRequestService)
  // ============================================================================

  /**
   * Create request using legacy interface
   */
  async createRequest(
    input: LegacyCreateRequestInput
  ): Promise<CreateRequestResult> {
    try {
      logger.info(
        '🔄 [PrismaRequestService] Creating request via legacy interface',
        this.instanceId
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

      const createdRequest = await this.createRequestNew(newInput);

      return {
        success: true,
        data: createdRequest,
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to create request via legacy interface',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Get all requests using legacy interface
   */
  async getAllRequests(
    filters?: RequestFiltersInput
  ): Promise<GetRequestsResult> {
    try {
      // Convert legacy filters to new format
      const newFilters: RequestFilters = {};

      if (filters) {
        if (filters.status) newFilters.status = filters.status;
        if (filters.priority) newFilters.priority = filters.priority;
        if (filters.roomNumber) newFilters.roomNumber = filters.roomNumber;
        if (filters.assignedTo) newFilters.assignedTo = filters.assignedTo;
        if (filters.startDate)
          newFilters.dateFrom = new Date(filters.startDate);
        if (filters.endDate) newFilters.dateTo = new Date(filters.endDate);
        if (filters.limit) newFilters.limit = filters.limit;
        if (filters.page)
          newFilters.offset = (filters.page - 1) * (filters.limit || 10);
      }

      const requests = await this.getAllRequestsNew(newFilters);

      return {
        success: true,
        data: requests,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: requests.length,
          totalPages: Math.ceil(requests.length / (filters?.limit || 10)),
        },
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to get all requests via legacy interface',
        error instanceof Error ? error.message : 'Unknown error'
      );

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
    try {
      const request = await this.getRequestByIdNew(id);

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
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

  /**
   * Update request status using legacy interface
   */
  async updateRequestStatus(
    id: number,
    input: UpdateRequestStatusInput
  ): Promise<UpdateRequestStatusResult> {
    try {
      const updateData: any = {
        status: input.status,
        assigned_to: input.assignedTo,
        updated_at: new Date(),
      };

      const updatedRequest = await this.updateRequestNew(id, updateData);

      return {
        success: true,
        data: updatedRequest,
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to update request status',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RequestServiceErrorType.DATABASE_ERROR,
      };
    }
  }

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
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      if (assignedTo) updateData.assigned_to = assignedTo;

      await this.prisma.request.updateMany({
        where: {
          id: { in: requestIds },
        },
        data: updateData,
      });

      return {
        success: true,
        data: {
          updated: requestIds.length,
          failed: 0,
          total: requestIds.length,
        },
      };
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(
        '❌ [PrismaRequestService] Failed to bulk update request statuses',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          updated: 0,
          failed: requestIds.length,
          total: requestIds.length,
        },
      };
    }
  }

  /**
   * Delete request using legacy interface
   */
  async deleteRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await this.deleteRequestNew(id);
      return { success };
    } catch (error) {
      this.metrics.errorCount++;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // LEGACY INTERFACE FILTER METHODS
  // ============================================================================

  async getRequestsByRoom(roomNumber: string): Promise<GetRequestsResult> {
    return this.getAllRequests({ roomNumber });
  }

  async getRequestsByGuest(guestName: string): Promise<GetRequestsResult> {
    return this.getAllRequests({ guestName });
  }

  async getRequestsByStatus(status: string): Promise<GetRequestsResult> {
    return this.getAllRequests({ status: status as any });
  }

  async getRequestsByPriority(priority: string): Promise<GetRequestsResult> {
    return this.getAllRequests({ priority: priority as any });
  }

  async getRequestsByAssignedTo(
    assignedTo: string
  ): Promise<GetRequestsResult> {
    return this.getAllRequests({ assignedTo });
  }

  async getUrgentRequests(): Promise<GetRequestsResult> {
    return this.getAllRequests({ priority: 'high' });
  }

  async getPendingRequests(): Promise<GetRequestsResult> {
    return this.getAllRequests({ status: 'pending' });
  }

  async getCompletedRequests(): Promise<GetRequestsResult> {
    return this.getAllRequests({ status: 'completed' });
  }

  // ============================================================================
  // MISSING IREQUESTSERVICE METHODS
  // ============================================================================

  async getRequestStatistics(): Promise<any> {
    try {
      const totalRequests = await this.prisma.request.count();
      const pendingRequests = await this.prisma.request.count({
        where: { status: 'pending' },
      });
      const completedRequests = await this.prisma.request.count({
        where: { status: 'completed' },
      });

      return {
        total: totalRequests,
        pending: pendingRequests,
        completed: completedRequests,
      };
    } catch (error) {
      logger.error(
        '❌ [PrismaRequestService] Failed to get request statistics',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return { total: 0, pending: 0, completed: 0 };
    }
  }

  async validateRequestData(
    data: any
  ): Promise<{ success: boolean; errors?: string[] }> {
    // Basic validation
    const isValid = !!(data.roomNumber || data.room_number);
    return {
      success: isValid,
      errors: isValid ? undefined : ['Room number is required'],
    };
  }

  async validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): Promise<{ success: boolean; error?: string }> {
    // Allow all status transitions for now
    return { success: true };
  }

  async canUpdateRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Allow all updates for now
    return { success: true };
  }

  async canDeleteRequest(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    // Allow all deletions for now
    return { success: true };
  }

  // ============================================================================
  // SERVICE UTILITIES
  // ============================================================================

  getMetrics() {
    return {
      instanceId: this.instanceId,
      ...this.metrics,
    };
  }

  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      errorCount: 0,
    };
  }

  async getServiceHealth() {
    try {
      const connectionHealth = await this.prismaManager.healthCheck();
      return {
        status: connectionHealth ? 'healthy' : 'unhealthy',
        metrics: this.getMetrics(),
        connectionHealth,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: this.getMetrics(),
        connectionHealth: false,
      };
    }
  }
}

export default PrismaRequestService;
