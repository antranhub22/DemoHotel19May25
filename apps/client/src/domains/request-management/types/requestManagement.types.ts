/**
 * Request Management Domain Types
 * Type definitions for request management system
 */

// ========================================
// Core Request Types
// ========================================

export interface CustomerRequest {
  id: number;
  type: string;
  roomNumber: string;
  orderId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  requestContent: string;
  specialInstructions?: string;
  status: RequestStatus;
  priority: RequestPriority;
  assignedTo?: string;
  assignedStaffId?: number;
  createdAt: string;
  updatedAt: string;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  category: RequestCategory;
  metadata?: RequestMetadata;
}

export type RequestStatus =
  | "Đã ghi nhận" // Acknowledged
  | "Đang xử lý" // In Progress
  | "Chờ phản hồi" // Waiting Response
  | "Hoàn thành" // Completed
  | "Đã hủy"; // Cancelled

export type RequestPriority =
  | "Thấp" // Low
  | "Bình thường" // Normal
  | "Cao" // High
  | "Khẩn cấp"; // Urgent

export type RequestCategory =
  | "Room Service"
  | "Housekeeping"
  | "Maintenance"
  | "Concierge"
  | "IT Support"
  | "General";

// ========================================
// Request Metadata & Additional Info
// ========================================

export interface RequestMetadata {
  estimatedDuration?: number; // in minutes
  requiredSkills?: string[];
  equipment?: string[];
  cost?: number;
  notes?: string;
}

// ========================================
// Message/Communication Types
// ========================================

export interface RequestMessage {
  id: string;
  requestId: number;
  sender: "staff" | "guest";
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

// ========================================
// Filtering & Search Types
// ========================================

export interface RequestFilters {
  status: string;
  priority?: RequestPriority;
  category?: RequestCategory;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  roomNumber?: string;
}

export interface RequestSearchParams {
  query?: string;
  filters: RequestFilters;
  sortBy: "createdAt" | "updatedAt" | "priority" | "status";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

// ========================================
// API Response Types
// ========================================

export interface RequestsResponse {
  requests: CustomerRequest[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RequestUpdateData {
  status?: RequestStatus;
  priority?: RequestPriority;
  assignedTo?: string;
  assignedStaffId?: number;
  estimatedCompletionTime?: string;
  notes?: string;
}

// ========================================
// Staff Assignment Types
// ========================================

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  skills: string[];
  currentWorkload: number;
  isAvailable: boolean;
}

export interface RequestAssignment {
  requestId: number;
  staffId: number;
  assignedAt: string;
  assignedBy: string;
  notes?: string;
}

// ========================================
// Real-time Update Types
// ========================================

export interface RequestUpdateEvent {
  type:
    | "new-request"
    | "status-change"
    | "assignment-change"
    | "message-received";
  requestId: number;
  data: Partial<CustomerRequest>;
  timestamp: string;
  triggeredBy: string;
}

// ========================================
// Analytics & Metrics Types
// ========================================

export interface RequestMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageResponseTime: number; // in minutes
  averageCompletionTime: number; // in minutes
  requestsByCategory: Record<RequestCategory, number>;
  requestsByStatus: Record<RequestStatus, number>;
  staffWorkload: Record<string, number>;
}

// ========================================
// Domain State Types
// ========================================

export interface RequestManagementState {
  // Requests data
  requests: CustomerRequest[];
  selectedRequest: CustomerRequest | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isSending: boolean;

  // Filters & search
  filters: RequestFilters;
  searchParams: RequestSearchParams;

  // Messages
  messages: Record<number, RequestMessage[]>; // keyed by requestId
  messageLoading: boolean;

  // Real-time updates
  lastUpdate: string | null;
  pendingUpdates: RequestUpdateEvent[];

  // UI state
  selectedTab: "all" | "pending" | "assigned" | "completed";
  viewMode: "list" | "grid" | "kanban";
  showFilters: boolean;

  // Error handling
  error: string | null;
  lastError: string | null;

  // Metrics
  metrics: RequestMetrics | null;
  metricsLastUpdated: string | null;
}

// ========================================
// Action Payload Types
// ========================================

export interface CreateRequestPayload {
  type: string;
  roomNumber: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  requestContent: string;
  specialInstructions?: string;
  priority?: RequestPriority;
  category: RequestCategory;
}

export interface UpdateRequestPayload {
  requestId: number;
  updates: RequestUpdateData;
}

export interface SendMessagePayload {
  requestId: number;
  content: string;
  attachments?: MessageAttachment[];
}

export interface AssignRequestPayload {
  requestId: number;
  staffId: number;
  notes?: string;
}
