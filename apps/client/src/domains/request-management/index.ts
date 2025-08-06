/**
 * Request Management Domain - Main Entry Point
 * Exports all domain functionality for request management
 */

// ========================================
// Types
// ========================================
export type {
  AssignRequestPayload,
  CreateRequestPayload,
  CustomerRequest,
  MessageAttachment,
  RequestAssignment,
  RequestCategory,
  RequestFilters,
  RequestManagementState,
  RequestMessage,
  RequestMetadata,
  RequestMetrics,
  RequestPriority,
  RequestSearchParams,
  RequestStatus,
  RequestUpdateData,
  RequestUpdateEvent,
  RequestsResponse,
  SendMessagePayload,
  StaffMember,
  UpdateRequestPayload,
} from "./types/requestManagement.types";

// ========================================
// Redux Store
// ========================================
export {
  addMessage,
  addRequestUpdate,
  clearError,
  createRequest,
  deleteRequest,
  fetchRequestById,
  fetchRequestMessages,
  fetchRequestMetrics,
  // Actions
  fetchRequests,
  markMessageAsRead,
  optimisticUpdateRequest,
  processPendingUpdates,
  resetFilters,
  resetRequestManagement,
  selectError,
  selectFilters,
  selectIsLoading,
  selectMessages,
  selectMetrics,
  // Selectors
  selectRequestManagement,
  selectRequests,
  selectSelectedRequest,
  sendMessage,
  setError,
  setFilters,
  setSearchParams,
  setSelectedRequest,
  setSelectedTab,
  setViewMode,
  toggleFilters,
  updateRequest,
} from "./store/requestManagementSlice";

// Default export for reducer
export { default as requestManagementReducer } from "./store/requestManagementSlice";

// ========================================
// Services
// ========================================
export {
  RequestManagementService,
  requestManagementService,
} from "./services/requestManagementService";

// ========================================
// Hooks
// ========================================
// TEMPORARILY DISABLED - Fixing circular dependency build issues
// export {
//   useRequestManagement,
//   useRequestMessages,
//   useRequestRealtime,
//   useRequestStatus,
// } from "./hooks/useRequestManagement";

// ========================================
// Constants & Utilities
// ========================================

// Request status options for UI
export const REQUEST_STATUS_OPTIONS = [
  "Tất cả",
  "Đã ghi nhận",
  "Đang xử lý",
  "Chờ phản hồi",
  "Hoàn thành",
  "Đã hủy",
] as const;

// Request priority options
export const REQUEST_PRIORITY_OPTIONS = [
  "Thấp",
  "Bình thường",
  "Cao",
  "Khẩn cấp",
] as const;

// Request category options
export const REQUEST_CATEGORY_OPTIONS = [
  "Room Service",
  "Housekeeping",
  "Maintenance",
  "Concierge",
  "IT Support",
  "General",
] as const;

// Status color mapping for UI
export const REQUEST_STATUS_COLORS = {
  "Đã ghi nhận": "bg-blue-100 text-blue-700 border-blue-200",
  "Đang xử lý": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Chờ phản hồi": "bg-orange-100 text-orange-700 border-orange-200",
  "Hoàn thành": "bg-green-100 text-green-700 border-green-200",
  "Đã hủy": "bg-gray-100 text-gray-700 border-gray-200",
} as const;

// Priority color mapping for UI
export const REQUEST_PRIORITY_COLORS = {
  Thấp: "bg-gray-100 text-gray-700",
  "Bình thường": "bg-blue-100 text-blue-700",
  Cao: "bg-orange-100 text-orange-700",
  "Khẩn cấp": "bg-red-100 text-red-700",
} as const;

// ========================================
// Utility Functions
// ========================================

/**
 * Get status color class for UI components
 */
export const getRequestStatusColor = (status: string): string => {
  return (
    REQUEST_STATUS_COLORS[status as keyof typeof REQUEST_STATUS_COLORS] ||
    REQUEST_STATUS_COLORS["Đã ghi nhận"]
  );
};

/**
 * Get priority color class for UI components
 */
export const getRequestPriorityColor = (priority: string): string => {
  return (
    REQUEST_PRIORITY_COLORS[priority as keyof typeof REQUEST_PRIORITY_COLORS] ||
    REQUEST_PRIORITY_COLORS["Bình thường"]
  );
};

/**
 * Format request date for display
 */
export const formatRequestDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Calculate time elapsed since request creation
 */
export const getTimeElapsed = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} phút trước`;
  } else {
    return "Vừa xong";
  }
};

/**
 * Validate request data
 */
export const validateRequestData = (
  data: Partial<CreateRequestPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.guestName?.trim()) {
    errors.push("Tên khách hàng là bắt buộc");
  }

  if (!data.roomNumber?.trim()) {
    errors.push("Số phòng là bắt buộc");
  }

  if (!data.requestContent?.trim()) {
    errors.push("Nội dung yêu cầu là bắt buộc");
  }

  if (!data.category) {
    errors.push("Loại yêu cầu là bắt buộc");
  }

  return errors;
};

/**
 * Generate request summary for notifications
 */
export const generateRequestSummary = (request: CustomerRequest): string => {
  return `${request.category} - ${request.guestName} (Phòng ${request.roomNumber}): ${request.requestContent.substring(0, 100)}${request.requestContent.length > 100 ? "..." : ""}`;
};

// ========================================
// Default Export
// ========================================

const RequestManagementDomain = {
  // Hooks - TEMPORARILY DISABLED
  // useRequestManagement: useRequestManagement,
  // useRequestMessages: useRequestMessages,
  // useRequestStatus: useRequestStatus,
  // useRequestRealtime: useRequestRealtime,

  // Services
  requestManagementService: requestManagementService,

  // Constants
  REQUEST_STATUS_OPTIONS,
  REQUEST_PRIORITY_OPTIONS,
  REQUEST_CATEGORY_OPTIONS,
  REQUEST_STATUS_COLORS,
  REQUEST_PRIORITY_COLORS,

  // Utilities
  getRequestStatusColor,
  getRequestPriorityColor,
  formatRequestDate,
  getTimeElapsed,
  validateRequestData,
  generateRequestSummary,
};

export default RequestManagementDomain;
