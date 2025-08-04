/**
 * 🛎️ REQUEST SERVICE
 *
 * Business logic for service request management with:
 * - Order processing workflow
 * - Status management
 * - Staff assignment logic
 * - Priority handling
 * - Billing integration
 */

import {
  RequestAnalytics,
  RequestRepository,
} from "../repositories/RequestRepository";
import { logger } from "../utils/logger";
import {
  BaseService,
  NotFoundException,
  ServiceContext,
  ValidationError,
  ValidationFailedException,
  ValidationResult,
} from "./BaseService";

export interface CreateRequestData {
  room_number: string;
  guest_name?: string;
  request_content: string;
  priority?: "low" | "medium" | "high" | "urgent";
  order_type?: string;
  call_id?: string;
  service_id?: string;
  phone_number?: string;
  total_amount?: number;
  currency?: string;
  delivery_time?: Date;
  special_instructions?: string;
  items?: any;
  urgency?: "normal" | "urgent" | "emergency";
}

export interface UpdateRequestData {
  status?: string;
  assigned_to?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  delivery_time?: Date;
  special_instructions?: string;
  metadata?: any;
}

export class RequestService extends BaseService<any, RequestRepository> {
  constructor(requestRepository: RequestRepository) {
    super(requestRepository, "Request");
  }

  // ======================================
  // BUSINESS OPERATIONS
  // ======================================

  /**
   * 🎯 CREATE SERVICE REQUEST WITH BUSINESS LOGIC
   */
  async createServiceRequest(
    data: CreateRequestData,
    context: ServiceContext,
    orderItems: any[] = [],
  ): Promise<any> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestService] Creating service request", "Service", {
        roomNumber: data.room_number,
        orderType: data.order_type,
        itemsCount: orderItems.length,
        tenantId: context.tenantId,
      });

      // Enhanced validation for service requests
      const validation = await this.validateServiceRequest(data, context);
      if (!validation.valid) {
        throw new ValidationFailedException(validation.errors);
      }

      // Generate order ID
      const orderId = this.generateOrderId();

      // Process data with business rules
      const processedData = {
        ...data,
        order_id: orderId,
        status: "Đã ghi nhận", // Default status
        tenant_id: context.tenantId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Create request with order items
      const result = await this.repository.createWithOrderItems(
        processedData,
        orderItems,
        context.tenantId,
      );

      // Apply post-creation business logic
      await this.processNewServiceRequest(result, context);

      const duration = Date.now() - startTime;
      logger.success("[RequestService] Service request created", "Service", {
        requestId: result.id,
        orderId,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[RequestService] CreateServiceRequest failed", "Service", {
        roomNumber: data.room_number,
        error,
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  /**
   * 🎯 UPDATE REQUEST STATUS WITH WORKFLOW
   */
  async updateRequestStatus(
    requestId: number,
    newStatus: string,
    context: ServiceContext,
    notes?: string,
  ): Promise<any | null> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestService] Updating request status", "Service", {
        requestId,
        newStatus,
        userId: context.user.id,
      });

      // Get current request
      const existing = await this.repository.findById(
        requestId,
        context.tenantId,
      );
      if (!existing) {
        throw new NotFoundException(`Request ${requestId} not found`);
      }

      // Validate status transition
      const validTransition = this.validateStatusTransition(
        existing.status,
        newStatus,
      );
      if (!validTransition) {
        throw new ValidationFailedException([
          {
            field: "status",
            message: `Invalid status transition from ${existing.status} to ${newStatus}`,
            code: "INVALID_STATUS_TRANSITION",
          },
        ]);
      }

      // Update with audit trail
      const result = await this.repository.updateStatus(
        requestId,
        newStatus,
        context.tenantId,
        context.user.id,
        notes,
      );

      if (result) {
        // Apply status change business logic
        await this.processStatusChange(
          result,
          existing.status,
          newStatus,
          context,
        );
      }

      const duration = Date.now() - startTime;
      logger.success("[RequestService] Request status updated", "Service", {
        requestId,
        oldStatus: existing.status,
        newStatus,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[RequestService] UpdateRequestStatus failed", "Service", {
        requestId,
        newStatus,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 ASSIGN REQUEST TO STAFF
   */
  async assignRequest(
    requestId: number,
    staffId: string,
    context: ServiceContext,
  ): Promise<any | null> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestService] Assigning request to staff", "Service", {
        requestId,
        staffId,
        assignedBy: context.user.id,
      });

      // Check if staff member can handle this type of request
      const canAssign = await this.validateStaffAssignment(
        staffId,
        requestId,
        context,
      );
      if (!canAssign) {
        throw new ValidationFailedException([
          {
            field: "assigned_to",
            message: `Staff member ${staffId} cannot be assigned to this request`,
            code: "INVALID_ASSIGNMENT",
          },
        ]);
      }

      const updateData = {
        assigned_to: staffId,
        status: "Đang xử lý", // In progress
      };

      const result = await this.update(requestId, updateData, context);

      if (result) {
        // Notify assigned staff
        await this.notifyStaffAssignment(result, staffId, context);
      }

      const duration = Date.now() - startTime;
      logger.success("[RequestService] Request assigned", "Service", {
        requestId,
        staffId,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error("[RequestService] AssignRequest failed", "Service", {
        requestId,
        staffId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET ANALYTICS WITH BUSINESS INSIGHTS
   */
  async getAnalytics(
    context: ServiceContext,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<RequestAnalytics & { insights: any }> {
    const startTime = Date.now();

    try {
      logger.debug("[RequestService] Getting analytics", "Service", {
        tenantId: context.tenantId,
        dateFrom,
        dateTo,
      });

      const analytics = await this.repository.getAnalytics(
        context.tenantId,
        dateFrom,
        dateTo,
      );

      // Add business insights
      const insights = this.generateBusinessInsights(analytics);

      const duration = Date.now() - startTime;
      logger.success("[RequestService] Analytics retrieved", "Service", {
        totalRequests: analytics.totalRequests,
        duration: `${duration}ms`,
      });

      return {
        ...analytics,
        insights,
      };
    } catch (error) {
      logger.error("[RequestService] GetAnalytics failed", "Service", {
        tenantId: context.tenantId,
        error,
      });
      throw error;
    }
  }

  // ======================================
  // VALIDATION METHODS
  // ======================================

  protected async validateForCreate(
    data: CreateRequestData,
    context: ServiceContext,
  ): Promise<ValidationResult> {
    return this.validateServiceRequest(data, context);
  }

  protected async validateForUpdate(
    data: UpdateRequestData,
    existing: any,
    context: ServiceContext,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate status if provided
    if (data.status) {
      const validTransition = this.validateStatusTransition(
        existing.status,
        data.status,
      );
      if (!validTransition) {
        errors.push({
          field: "status",
          message: `Invalid status transition from ${existing.status} to ${data.status}`,
          code: "INVALID_STATUS_TRANSITION",
        });
      }
    }

    // Validate delivery time
    if (data.delivery_time && data.delivery_time < new Date()) {
      errors.push({
        field: "delivery_time",
        message: "Delivery time cannot be in the past",
        code: "INVALID_DELIVERY_TIME",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async validateServiceRequest(
    data: CreateRequestData,
    context: ServiceContext,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredError = this.validateRequired(
      data.room_number,
      "room_number",
    );
    if (requiredError) errors.push(requiredError);

    const contentError = this.validateRequired(
      data.request_content,
      "request_content",
    );
    if (contentError) errors.push(contentError);

    // Room number format
    if (data.room_number && !/^\d{1,4}[A-Z]?$/.test(data.room_number)) {
      errors.push({
        field: "room_number",
        message: "Room number must be in format like 101, 1001, 205A",
        code: "INVALID_ROOM_FORMAT",
      });
    }

    // Priority validation
    if (
      data.priority &&
      !["low", "medium", "high", "urgent"].includes(data.priority)
    ) {
      errors.push({
        field: "priority",
        message: "Priority must be one of: low, medium, high, urgent",
        code: "INVALID_PRIORITY",
      });
    }

    // Amount validation
    if (data.total_amount && data.total_amount < 0) {
      errors.push({
        field: "total_amount",
        message: "Total amount cannot be negative",
        code: "INVALID_AMOUNT",
      });
    }

    // Delivery time validation
    if (data.delivery_time && data.delivery_time < new Date()) {
      errors.push({
        field: "delivery_time",
        message: "Delivery time cannot be in the past",
        code: "INVALID_DELIVERY_TIME",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ======================================
  // AUTHORIZATION METHODS
  // ======================================

  protected async authorizeCreate(
    data: CreateRequestData,
    context: ServiceContext,
  ): Promise<boolean> {
    // All authenticated users can create requests
    return true;
  }

  protected async authorizeRead(
    entity: any,
    context: ServiceContext,
  ): Promise<boolean> {
    // Users can only read requests from their tenant
    return entity.tenant_id === context.tenantId;
  }

  protected async authorizeUpdate(
    existing: any,
    data: UpdateRequestData,
    context: ServiceContext,
  ): Promise<boolean> {
    // Must be same tenant
    if (existing.tenant_id !== context.tenantId) return false;

    // Staff can update requests assigned to them or if they have manager role
    const isAssigned = existing.assigned_to === context.user.id;
    const isManager =
      context.user.role === "manager" || context.user.role === "admin";
    const isFrontDesk = context.user.role === "front-desk";

    return isAssigned || isManager || isFrontDesk;
  }

  protected async authorizeDelete(
    entity: any,
    context: ServiceContext,
  ): Promise<boolean> {
    // Must be same tenant
    if (entity.tenant_id !== context.tenantId) return false;

    // Only managers and admins can delete requests
    return context.user.role === "manager" || context.user.role === "admin";
  }

  // ======================================
  // BUSINESS LOGIC METHODS
  // ======================================

  private generateOrderId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      "Đã ghi nhận": ["Đang xử lý", "Đã hủy"],
      "Đang xử lý": ["Hoàn thành", "Đã hủy", "Tạm dừng"],
      "Tạm dừng": ["Đang xử lý", "Đã hủy"],
      "Hoàn thành": [], // No transitions from completed
      "Đã hủy": [], // No transitions from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async validateStaffAssignment(
    staffId: string,
    requestId: number,
    context: ServiceContext,
  ): Promise<boolean> {
    // In a real implementation, you would check:
    // - Staff member exists and is active
    // - Staff member has required skills/permissions
    // - Staff member is not overloaded
    // - Staff member is available during delivery time
    return true; // Simplified for this example
  }

  private async processNewServiceRequest(
    request: any,
    context: ServiceContext,
  ): Promise<void> {
    try {
      // Auto-assign high priority requests
      if (request.priority === "urgent" || request.priority === "high") {
        await this.autoAssignHighPriorityRequest(request, context);
      }

      // Send notifications
      await this.sendNewRequestNotifications(request, context);

      // Update inventory if applicable
      if (request.order_items && request.order_items.length > 0) {
        await this.updateInventory(request.order_items, context);
      }
    } catch (error) {
      logger.error(
        "[RequestService] ProcessNewServiceRequest failed",
        "Service",
        {
          requestId: request.id,
          error,
        },
      );
      // Don't throw - these are non-critical operations
    }
  }

  private async processStatusChange(
    request: any,
    oldStatus: string,
    newStatus: string,
    context: ServiceContext,
  ): Promise<void> {
    try {
      // Send status update notifications
      await this.sendStatusUpdateNotifications(
        request,
        oldStatus,
        newStatus,
        context,
      );

      // Handle completion
      if (newStatus === "Hoàn thành") {
        await this.processRequestCompletion(request, context);
      }

      // Handle cancellation
      if (newStatus === "Đã hủy") {
        await this.processRequestCancellation(request, context);
      }
    } catch (error) {
      logger.error("[RequestService] ProcessStatusChange failed", "Service", {
        requestId: request.id,
        oldStatus,
        newStatus,
        error,
      });
      // Don't throw - these are non-critical operations
    }
  }

  private generateBusinessInsights(analytics: RequestAnalytics): any {
    const insights = {
      performanceMetrics: {
        completionRate: 0,
        averageResponseTime: analytics.averageCompletionTime,
        efficiency: "normal",
      },
      recommendations: [] as string[],
      alerts: [] as string[],
    };

    // Calculate completion rate
    const completedCount = analytics.byStatus["Hoàn thành"] || 0;
    insights.performanceMetrics.completionRate =
      analytics.totalRequests > 0
        ? (completedCount / analytics.totalRequests) * 100
        : 0;

    // Performance recommendations
    if (insights.performanceMetrics.completionRate < 80) {
      insights.recommendations.push(
        "Consider improving request completion processes",
      );
    }

    if (analytics.averageCompletionTime > 60) {
      insights.recommendations.push(
        "Average completion time is high - review staff allocation",
      );
    }

    // Alerts
    const urgentCount = analytics.byPriority["urgent"] || 0;
    if (urgentCount > analytics.totalRequests * 0.2) {
      insights.alerts.push(
        "High number of urgent requests - review service quality",
      );
    }

    return insights;
  }

  // Placeholder methods for business operations (implement with your specific business logic)
  private async autoAssignHighPriorityRequest(
    request: any,
    context: ServiceContext,
  ): Promise<void> {
    // Auto-assignment logic here
  }

  private async sendNewRequestNotifications(
    request: any,
    context: ServiceContext,
  ): Promise<void> {
    // Notification logic here
  }

  private async updateInventory(
    orderItems: any[],
    context: ServiceContext,
  ): Promise<void> {
    // Inventory update logic here
  }

  private async sendStatusUpdateNotifications(
    request: any,
    oldStatus: string,
    newStatus: string,
    context: ServiceContext,
  ): Promise<void> {
    // Status update notification logic here
  }

  private async processRequestCompletion(
    request: any,
    context: ServiceContext,
  ): Promise<void> {
    // Completion processing logic here
  }

  private async processRequestCancellation(
    request: any,
    context: ServiceContext,
  ): Promise<void> {
    // Cancellation processing logic here
  }

  private async notifyStaffAssignment(
    request: any,
    staffId: string,
    context: ServiceContext,
  ): Promise<void> {
    // Staff assignment notification logic here
  }
}
