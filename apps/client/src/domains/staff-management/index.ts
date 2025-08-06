/**
 * Staff Management Domain - Main Entry Point
 * Exports all domain functionality for staff management
 */

// ========================================
// Types
// ========================================
export type {
  CreateStaffPayload,
  CreateTaskPayload,
  EmergencyContact,
  EmploymentStatus,
  PerformanceGoal,
  PermissionAction,
  RoleDefinition,
  ScheduleStaffPayload,
  ScheduleStatus,
  StaffAddress,
  StaffAnalytics,
  StaffAvailability,
  StaffDepartment,
  StaffFilters,
  StaffManagementState,
  StaffMember,
  StaffPerformance,
  StaffPermission,
  StaffResponse,
  StaffRole,
  StaffSchedule,
  StaffSearchParams,
  StaffTask,
  StaffUpdateEvent,
  TaskAssignmentSuggestion,
  TaskAttachment,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  UpdateStaffPayload,
  UpdateTaskPayload,
  WorkShift,
} from "./types/staffManagement.types";

// ========================================
// Redux Store
// ========================================
export {
  // Actions
  addStaffUpdate,
  assignTask,
  checkInStaff,
  checkOutStaff,
  clearError,
  createSchedule,
  createStaff,
  createTask,
  deactivateStaff,
  fetchSchedules,
  fetchShifts,
  fetchStaff,
  fetchStaffAnalytics,
  fetchStaffById,
  fetchTasks,
  optimisticUpdateStaff,
  optimisticUpdateTask,
  resetStaffFilters,
  resetStaffManagement,
  // Selectors
  selectAnalytics,
  selectAvailableShifts,
  selectAvailableStaff,
  selectError,
  selectIsLoading,
  selectOnDutyStaff,
  selectSchedules,
  selectSelectedStaff,
  selectSelectedTask,
  selectStaff,
  selectStaffByDepartment,
  selectStaffFilters,
  selectStaffManagement,
  selectTasks,
  selectTasksByStaff,
  setError,
  setSearchParams,
  setSelectedStaff,
  setSelectedTab,
  setSelectedTask,
  setStaffFilters,
  setTaskFilters,
  setViewMode,
  toggleFilters,
  updateStaff,
  updateStaffWorkload,
  updateTask,
  updateTaskProgress,
} from "./store/staffManagementSlice";

// Default export for reducer
export { default as staffManagementReducer } from "./store/staffManagementSlice";

// ========================================
// Services
// ========================================
// NOTE: Service exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// ========================================
// Hooks
// ========================================
// NOTE: Hooks exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// ========================================
// Constants & Utilities
// ========================================

// Staff roles options for UI
export const STAFF_ROLE_OPTIONS = [
  "hotel-manager",
  "assistant-manager",
  "front-desk",
  "concierge",
  "housekeeping",
  "maintenance",
  "security",
  "it-support",
  "accounting",
  "hr",
  "staff",
] as const;

// Staff departments options
export const STAFF_DEPARTMENT_OPTIONS = [
  "Management",
  "Front Office",
  "Housekeeping",
  "Maintenance",
  "Security",
  "IT",
  "Accounting",
  "Human Resources",
  "Guest Services",
] as const;

// Employment status options
export const EMPLOYMENT_STATUS_OPTIONS = [
  "active",
  "inactive",
  "terminated",
  "probation",
  "part-time",
  "contractor",
] as const;

// Task priority options
export const TASK_PRIORITY_OPTIONS = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

// Task status options
export const TASK_STATUS_OPTIONS = [
  "pending",
  "assigned",
  "in-progress",
  "review",
  "completed",
  "cancelled",
  "overdue",
] as const;

// Task category options
export const TASK_CATEGORY_OPTIONS = [
  "Customer Request",
  "Room Maintenance",
  "Housekeeping",
  "Front Desk",
  "Security",
  "IT Support",
  "Administrative",
  "Training",
  "Meeting",
  "Other",
] as const;

// Role color mapping for UI
export const STAFF_ROLE_COLORS = {
  "hotel-manager": "bg-purple-100 text-purple-700 border-purple-200",
  "assistant-manager": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "front-desk": "bg-blue-100 text-blue-700 border-blue-200",
  concierge: "bg-cyan-100 text-cyan-700 border-cyan-200",
  housekeeping: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-orange-100 text-orange-700 border-orange-200",
  security: "bg-red-100 text-red-700 border-red-200",
  "it-support": "bg-gray-100 text-gray-700 border-gray-200",
  accounting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hr: "bg-pink-100 text-pink-700 border-pink-200",
  staff: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

// Department color mapping for UI
export const DEPARTMENT_COLORS = {
  Management: "bg-purple-100 text-purple-700",
  "Front Office": "bg-blue-100 text-blue-700",
  Housekeeping: "bg-green-100 text-green-700",
  Maintenance: "bg-orange-100 text-orange-700",
  Security: "bg-red-100 text-red-700",
  IT: "bg-gray-100 text-gray-700",
  Accounting: "bg-yellow-100 text-yellow-700",
  "Human Resources": "bg-pink-100 text-pink-700",
  "Guest Services": "bg-cyan-100 text-cyan-700",
} as const;

// Task priority color mapping
export const TASK_PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
} as const;

// Task status color mapping
export const TASK_STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
  review: "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
} as const;

// ========================================
// Utility Functions
// ========================================

/**
 * Get role color class for UI components
 */
export const getStaffRoleColor = (role: string): string => {
  return (
    STAFF_ROLE_COLORS[role as keyof typeof STAFF_ROLE_COLORS] ||
    STAFF_ROLE_COLORS["staff"]
  );
};

/**
 * Get department color class for UI components
 */
export const getDepartmentColor = (department: string): string => {
  return (
    DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS] ||
    DEPARTMENT_COLORS["Guest Services"]
  );
};

/**
 * Get task priority color class for UI components
 */
export const getTaskPriorityColor = (priority: string): string => {
  return (
    TASK_PRIORITY_COLORS[priority as keyof typeof TASK_PRIORITY_COLORS] ||
    TASK_PRIORITY_COLORS["medium"]
  );
};

/**
 * Get task status color class for UI components
 */
export const getTaskStatusColor = (status: string): string => {
  return (
    TASK_STATUS_COLORS[status as keyof typeof TASK_STATUS_COLORS] ||
    TASK_STATUS_COLORS["pending"]
  );
};

/**
 * Format staff member name for display
 */
export const formatStaffName = (staff: StaffMember): string => {
  return staff.fullName || `${staff.firstName} ${staff.lastName}`;
};

/**
 * Format date for display (Vietnamese locale)
 */
export const formatDate = (dateString: string): string => {
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
 * Format time duration
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  return `${hours} giờ ${remainingMinutes} phút`;
};

/**
 * Calculate workload status
 */
export const getWorkloadStatus = (
  workload: number,
): {
  status: "low" | "medium" | "high" | "overloaded";
  color: string;
  description: string;
} => {
  if (workload <= 3) {
    return {
      status: "low",
      color: "bg-green-100 text-green-700",
      description: "Nhàn rỗi",
    };
  } else if (workload <= 6) {
    return {
      status: "medium",
      color: "bg-blue-100 text-blue-700",
      description: "Vừa phải",
    };
  } else if (workload <= 9) {
    return {
      status: "high",
      color: "bg-orange-100 text-orange-700",
      description: "Bận rộn",
    };
  } else {
    return {
      status: "overloaded",
      color: "bg-red-100 text-red-700",
      description: "Quá tải",
    };
  }
};

/**
 * Calculate task completion percentage
 */
export const calculateTaskCompletion = (tasks: StaffTask[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
};

/**
 * Get time elapsed since date
 */
export const getTimeElapsed = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

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
 * Validate staff data
 */
export const validateStaffData = (
  data: Partial<CreateStaffPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.firstName?.trim()) {
    errors.push("Tên là bắt buộc");
  }

  if (!data.lastName?.trim()) {
    errors.push("Họ là bắt buộc");
  }

  if (!data.email?.trim()) {
    errors.push("Email là bắt buộc");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Email không hợp lệ");
  }

  if (!data.position?.trim()) {
    errors.push("Vị trí là bắt buộc");
  }

  if (!data.department) {
    errors.push("Phòng ban là bắt buộc");
  }

  if (!data.role) {
    errors.push("Vai trò là bắt buộc");
  }

  if (!data.hireDate) {
    errors.push("Ngày vào làm là bắt buộc");
  }

  return errors;
};

/**
 * Validate task data
 */
export const validateTaskData = (
  data: Partial<CreateTaskPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Tiêu đề nhiệm vụ là bắt buộc");
  }

  if (!data.description?.trim()) {
    errors.push("Mô tả nhiệm vụ là bắt buộc");
  }

  if (!data.category) {
    errors.push("Loại nhiệm vụ là bắt buộc");
  }

  if (!data.priority) {
    errors.push("Mức độ ưu tiên là bắt buộc");
  }

  if (!data.assignedTo) {
    errors.push("Cần chỉ định người thực hiện");
  }

  return errors;
};

/**
 * Generate staff summary for notifications
 */
export const generateStaffSummary = (staff: StaffMember): string => {
  return `${formatStaffName(staff)} - ${staff.position} (${staff.department})`;
};

/**
 * Generate task summary for notifications
 */
export const generateTaskSummary = (task: StaffTask): string => {
  return `${task.title} - ${task.category} (Độ ưu tiên: ${task.priority})`;
};

/**
 * Check if staff member is available for task assignment
 */
export const isStaffAvailable = (staff: StaffMember): boolean => {
  return (
    staff.isActive &&
    staff.isOnDuty &&
    staff.employmentStatus === "active" &&
    staff.currentWorkload < 10
  ); // Assuming 10 is max workload
};

/**
 * Get suggested staff for task assignment
 */
export const getSuggestedStaff = (
  _task: CreateTaskPayload,
  availableStaff: StaffMember[],
): StaffMember[] => {
  return availableStaff
    .filter((staff) => isStaffAvailable(staff))
    .sort((a, b) => {
      // Sort by workload (ascending) and then by experience/rating
      if (a.currentWorkload !== b.currentWorkload) {
        return a.currentWorkload - b.currentWorkload;
      }
      return b.averageRating - a.averageRating;
    })
    .slice(0, 5); // Return top 5 suggestions
};

// ========================================
// Default Export
// ========================================

const StaffManagementDomain = {
  // Constants
  STAFF_ROLE_OPTIONS,
  STAFF_DEPARTMENT_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_CATEGORY_OPTIONS,
  STAFF_ROLE_COLORS,
  DEPARTMENT_COLORS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,

  // Utilities
  getStaffRoleColor,
  getDepartmentColor,
  getTaskPriorityColor,
  getTaskStatusColor,
  formatStaffName,
  formatDate,
  formatDuration,
  getWorkloadStatus,
  calculateTaskCompletion,
  getTimeElapsed,
  validateStaffData,
  validateTaskData,
  generateStaffSummary,
  generateTaskSummary,
  isStaffAvailable,
  getSuggestedStaff,
};

export default StaffManagementDomain;
