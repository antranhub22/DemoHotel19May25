// ============================================================================
// REQUEST SERVICE INTERFACE - PHASE 2 REFACTOR
// ============================================================================
// Service layer interface for Request business logic
// Separates business logic from controller layer

import {
  CreateRequestInput,
  RequestFiltersInput,
  UpdateRequestStatusInput,
} from '@shared/validation/requestSchemas';

// ============================================================================
// REQUEST ENTITY TYPES
// ============================================================================

/**
 * Request Entity Type
 */
export interface RequestEntity {
  id: number;
  tenant_id: string;
  room_number: string;
  request_content: string;
  guest_name?: string;
  priority: 'low' | 'medium' | 'high';
  status:
    | 'pending'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'Đã ghi nhận'
    | 'Đang xử lý'
    | 'Hoàn thành'
    | 'Đã hủy';
  created_at: Date;
  updated_at?: Date;
  description?: string;
  phone_number?: string;
  total_amount?: number;
  currency?: string;
  special_instructions?: string;
  urgency?: 'normal' | 'urgent' | 'critical';
  order_type?: string;
  delivery_time?: string;
  items?: string;
  assigned_to?: string;
  completed_at?: Date;
  notes?: string;
}

/**
 * Create Request Result
 */
export interface CreateRequestResult {
  success: boolean;
  data?: RequestEntity;
  error?: string;
  code?: string;
}

/**
 * Get Requests Result
 */
export interface GetRequestsResult {
  success: boolean;
  data?: RequestEntity[];
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get Request By ID Result
 */
export interface GetRequestByIdResult {
  success: boolean;
  data?: RequestEntity;
  error?: string;
  code?: string;
}

/**
 * Update Request Status Result
 */
export interface UpdateRequestStatusResult {
  success: boolean;
  data?: RequestEntity;
  error?: string;
  code?: string;
}

/**
 * Bulk Update Result
 */
export interface BulkUpdateResult {
  success: boolean;
  data?: {
    updated: number;
    failed: number;
    total: number;
  };
  error?: string;
  code?: string;
}

// ============================================================================
// REQUEST SERVICE INTERFACE
// ============================================================================

/**
 * Request Service Interface
 * Defines all business logic operations for request management
 */
export interface IRequestService {
  /**
   * Create a new request
   */
  createRequest(input: CreateRequestInput): Promise<CreateRequestResult>;

  /**
   * Get all requests with optional filtering and pagination
   */
  getAllRequests(filters?: RequestFiltersInput): Promise<GetRequestsResult>;

  /**
   * Get a specific request by ID
   */
  getRequestById(id: number): Promise<GetRequestByIdResult>;

  /**
   * Update request status
   */
  updateRequestStatus(
    id: number,
    input: UpdateRequestStatusInput
  ): Promise<UpdateRequestStatusResult>;

  /**
   * Bulk update request statuses
   */
  bulkUpdateStatus(
    requestIds: number[],
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<BulkUpdateResult>;

  /**
   * Delete a request (soft delete)
   */
  deleteRequest(id: number): Promise<{ success: boolean; error?: string }>;

  /**
   * Get requests by room number
   */
  getRequestsByRoom(roomNumber: string): Promise<GetRequestsResult>;

  /**
   * Get requests by guest name
   */
  getRequestsByGuest(guestName: string): Promise<GetRequestsResult>;

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: string): Promise<GetRequestsResult>;

  /**
   * Get requests by priority
   */
  getRequestsByPriority(priority: string): Promise<GetRequestsResult>;

  /**
   * Get requests by assigned staff
   */
  getRequestsByAssignedTo(assignedTo: string): Promise<GetRequestsResult>;

  /**
   * Get urgent requests (high priority or urgent/critical urgency)
   */
  getUrgentRequests(): Promise<GetRequestsResult>;

  /**
   * Get pending requests
   */
  getPendingRequests(): Promise<GetRequestsResult>;

  /**
   * Get completed requests
   */
  getCompletedRequests(): Promise<GetRequestsResult>;

  /**
   * Get request statistics
   */
  getRequestStatistics(): Promise<{
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
  }>;

  /**
   * Validate request data
   */
  validateRequestData(input: CreateRequestInput): Promise<{
    success: boolean;
    errors?: string[];
  }>;

  /**
   * Validate status transition
   */
  validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Check if request can be updated
   */
  canUpdateRequest(id: number): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Check if request can be deleted
   */
  canDeleteRequest(id: number): Promise<{
    success: boolean;
    error?: string;
  }>;
}

// ============================================================================
// REQUEST SERVICE EVENTS
// ============================================================================

/**
 * Request Service Events
 */
export interface RequestServiceEvents {
  /**
   * Request created event
   */
  onRequestCreated: (request: RequestEntity) => void;

  /**
   * Request updated event
   */
  onRequestUpdated: (request: RequestEntity, previousStatus: string) => void;

  /**
   * Request deleted event
   */
  onRequestDeleted: (requestId: number) => void;

  /**
   * Status changed event
   */
  onStatusChanged: (
    requestId: number,
    oldStatus: string,
    newStatus: string
  ) => void;

  /**
   * Priority changed event
   */
  onPriorityChanged: (
    requestId: number,
    oldPriority: string,
    newPriority: string
  ) => void;

  /**
   * Urgent request created event
   */
  onUrgentRequestCreated: (request: RequestEntity) => void;
}

// ============================================================================
// REQUEST SERVICE CONFIGURATION
// ============================================================================

/**
 * Request Service Configuration
 */
export interface RequestServiceConfig {
  businessRules: {
    allowStatusDowngrade: boolean;
    requireNotesForCancellation: boolean;
    autoAssignUrgentRequests: boolean;
    maxRequestsPerRoom: number;
    autoUpgradePriority: boolean;
    maxRequestsPerHour: number;
  };
  audit: {
    enabled: boolean;
    logAllChanges: boolean;
    logStatusChanges: boolean;
    logPriorityChanges: boolean;
    logBulkOperations: boolean;
  };
  notifications: {
    enableRealTime: boolean;
    notifyOnStatusChange: boolean;
    notifyOnUrgentRequest: boolean;
    notifyOnBulkOperations: boolean;
  };
}

// ============================================================================
// REQUEST SERVICE ERRORS
// ============================================================================

/**
 * Request Service Error Types
 */
export enum RequestServiceErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
}

/**
 * Request Service Error
 */
export interface RequestServiceError {
  type: RequestServiceErrorType;
  message: string;
  details?: any;
  code?: string;
}

// ============================================================================
// REQUEST SERVICE UTILITIES
// ============================================================================

/**
 * Request Service Utilities
 */
export interface RequestServiceUtils {
  /**
   * Format request for response
   */
  formatRequestForResponse(request: RequestEntity): RequestEntity;

  /**
   * Validate business rules
   */
  validateBusinessRules(input: CreateRequestInput): Promise<{
    success: boolean;
    errors?: string[];
  }>;

  /**
   * Apply business rules
   */
  applyBusinessRules(input: CreateRequestInput): Promise<CreateRequestInput>;

  /**
   * Generate request description
   */
  generateRequestDescription(input: CreateRequestInput): string;

  /**
   * Determine request urgency
   */
  determineRequestUrgency(
    input: CreateRequestInput
  ): 'normal' | 'urgent' | 'critical';

  /**
   * Auto-assign request
   */
  autoAssignRequest(request: RequestEntity): Promise<string | null>;

  /**
   * Check rate limits
   */
  checkRateLimits(
    roomNumber: string,
    tenantId: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }>;
}
