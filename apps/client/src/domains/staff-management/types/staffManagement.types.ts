/**
 * Staff Management Domain Types
 * Type definitions for staff management system
 */

// ========================================
// Core Staff Types
// ========================================

export interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;

  // Employment details
  position: string;
  department: StaffDepartment;
  role: StaffRole;
  permissions: StaffPermission[];
  employmentStatus: EmploymentStatus;
  hireDate: string;

  // Work details
  currentShift?: WorkShift;
  isOnDuty: boolean;
  lastCheckIn?: string;
  lastCheckOut?: string;

  // Performance
  currentWorkload: number;
  tasksAssigned: number;
  tasksCompleted: number;
  averageRating: number;

  // Contact & Emergency
  emergencyContact?: EmergencyContact;
  address?: StaffAddress;

  // System fields
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type StaffRole =
  | "hotel-manager" // Quản lý khách sạn
  | "assistant-manager" // Phó quản lý
  | "front-desk" // Lễ tân
  | "concierge" // Nhân viên concierge
  | "housekeeping" // Housekeeping
  | "maintenance" // Bảo trì
  | "security" // Bảo vệ
  | "it-support" // IT Support
  | "accounting" // Kế toán
  | "hr" // Nhân sự
  | "staff"; // Nhân viên

export type StaffDepartment =
  | "Management" // Ban quản lý
  | "Front Office" // Lễ tân
  | "Housekeeping" // Buồng phòng
  | "Maintenance" // Bảo trì
  | "Security" // An ninh
  | "IT" // Công nghệ thông tin
  | "Accounting" // Kế toán
  | "Human Resources" // Nhân sự
  | "Guest Services"; // Dịch vụ khách hàng

export type EmploymentStatus =
  | "active" // Đang làm việc
  | "inactive" // Tạm nghỉ
  | "terminated" // Đã nghỉ việc
  | "probation" // Thử việc
  | "part-time" // Bán thời gian
  | "contractor"; // Hợp đồng

// ========================================
// Permission & Role System
// ========================================

export interface StaffPermission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "assign"
  | "approve"
  | "view_all";

export interface RoleDefinition {
  role: StaffRole;
  name: string;
  description: string;
  permissions: string[];
  departmentAccess: StaffDepartment[];
  canManageStaff: boolean;
  canAssignTasks: boolean;
  canViewReports: boolean;
}

// ========================================
// Work Schedule & Shift Types
// ========================================

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[]; // 0-6, Sunday to Saturday
  isActive: boolean;
}

export interface StaffSchedule {
  id: string;
  staffId: number;
  date: string;
  shift: WorkShift;
  status: ScheduleStatus;
  checkInTime?: string;
  checkOutTime?: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

export type ScheduleStatus =
  | "scheduled" // Đã lên lịch
  | "checked-in" // Đã check-in
  | "on-break" // Đang nghỉ
  | "checked-out" // Đã check-out
  | "absent" // Vắng mặt
  | "sick-leave" // Nghỉ ốm
  | "vacation"; // Nghỉ phép

// ========================================
// Task Management Types
// ========================================

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;

  // Assignment
  assignedTo: number;
  assignedBy: number;
  assignedAt: string;

  // Timing
  dueDate?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  startedAt?: string;
  completedAt?: string;

  // Related entities
  relatedRequestId?: number; // Link to customer request
  relatedRoomNumber?: string;

  // Progress tracking
  progress: number; // 0-100
  notes?: string;
  attachments?: TaskAttachment[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory =
  | "Customer Request" // Yêu cầu khách hàng
  | "Room Maintenance" // Bảo trì phòng
  | "Housekeeping" // Dọn phòng
  | "Front Desk" // Lễ tân
  | "Security" // An ninh
  | "IT Support" // Hỗ trợ IT
  | "Administrative" // Hành chính
  | "Training" // Đào tạo
  | "Meeting" // Họp
  | "Other"; // Khác

export type TaskPriority =
  | "low" // Thấp
  | "medium" // Trung bình
  | "high" // Cao
  | "urgent"; // Khẩn cấp

export type TaskStatus =
  | "pending" // Chờ xử lý
  | "assigned" // Đã giao
  | "in-progress" // Đang thực hiện
  | "review" // Đang kiểm tra
  | "completed" // Hoàn thành
  | "cancelled" // Đã hủy
  | "overdue"; // Quá hạn

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
  uploadedBy: number;
}

// ========================================
// Performance & Analytics Types
// ========================================

export interface StaffPerformance {
  staffId: number;
  period: string; // YYYY-MM format

  // Task metrics
  tasksAssigned: number;
  tasksCompleted: number;
  tasksOverdue: number;
  averageCompletionTime: number; // in hours

  // Quality metrics
  averageRating: number;
  customerFeedbackCount: number;
  complaintCount: number;
  commendationCount: number;

  // Attendance metrics
  scheduledHours: number;
  workedHours: number;
  overtimeHours: number;
  absentDays: number;
  lateDays: number;

  // Efficiency metrics
  productivityScore: number; // 0-100
  qualityScore: number; // 0-100
  timelinessScore: number; // 0-100

  // Goals and targets
  monthlyGoals?: PerformanceGoal[];
  achievementRate: number; // 0-100
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  isAchieved: boolean;
}

// ========================================
// Contact & Personal Info Types
// ========================================

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface StaffAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ========================================
// Filtering & Search Types
// ========================================

export interface StaffFilters {
  department?: StaffDepartment;
  role?: StaffRole;
  employmentStatus?: EmploymentStatus;
  isOnDuty?: boolean;
  searchQuery?: string;
  skills?: string[];
}

export interface StaffSearchParams {
  query?: string;
  filters: StaffFilters;
  sortBy: "name" | "department" | "role" | "hireDate" | "performance";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

// ========================================
// API Response Types
// ========================================

export interface StaffResponse {
  staff: StaffMember[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StaffAnalytics {
  totalStaff: number;
  activeStaff: number;
  onDutyStaff: number;
  departmentDistribution: Record<StaffDepartment, number>;
  roleDistribution: Record<StaffRole, number>;
  performanceOverview: {
    averageRating: number;
    totalTasksCompleted: number;
    averageResponseTime: number;
  };
  attendanceRate: number;
  turnoverRate: number;
}

// ========================================
// Action Payload Types
// ========================================

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: StaffDepartment;
  role: StaffRole;
  hireDate: string;
  emergencyContact?: EmergencyContact;
  address?: StaffAddress;
}

export interface UpdateStaffPayload {
  staffId: number;
  updates: Partial<Omit<StaffMember, "id" | "createdAt" | "updatedAt">>;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  assignedTo: number;
  dueDate?: string;
  estimatedDuration?: number;
  relatedRequestId?: number;
  relatedRoomNumber?: string;
}

export interface UpdateTaskPayload {
  taskId: string;
  updates: Partial<Omit<StaffTask, "id" | "createdAt" | "updatedAt">>;
}

export interface ScheduleStaffPayload {
  staffId: number;
  date: string;
  shiftId: string;
  notes?: string;
}

// ========================================
// Domain State Types
// ========================================

export interface StaffManagementState {
  // Staff data
  staff: StaffMember[];
  selectedStaff: StaffMember | null;

  // Tasks data
  tasks: StaffTask[];
  selectedTask: StaffTask | null;

  // Schedules data
  schedules: StaffSchedule[];
  availableShifts: WorkShift[];

  // Performance data
  performanceData: Record<number, StaffPerformance>;
  analytics: StaffAnalytics | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isSaving: boolean;

  // Filters & search
  staffFilters: StaffFilters;
  taskFilters: Partial<StaffTask>;
  searchParams: StaffSearchParams;

  // UI state
  selectedTab: "staff" | "tasks" | "schedules" | "performance";
  viewMode: "list" | "grid" | "calendar";
  showFilters: boolean;

  // Error handling
  error: string | null;
  lastError: string | null;

  // Real-time updates
  lastUpdate: string | null;

  // Permissions & roles
  currentUserPermissions: string[];
  roleDefinitions: RoleDefinition[];
}

// ========================================
// Event Types for Real-time Updates
// ========================================

export interface StaffUpdateEvent {
  type:
    | "staff-update"
    | "task-assignment"
    | "schedule-change"
    | "check-in"
    | "check-out";
  staffId: number;
  data: any;
  timestamp: string;
  triggeredBy: string;
}

// ========================================
// Utility Types
// ========================================

export interface StaffAvailability {
  staffId: number;
  isAvailable: boolean;
  currentWorkload: number;
  estimatedFreeTime?: string;
  skills: string[];
  department: StaffDepartment;
  role: StaffRole;
}

export interface TaskAssignmentSuggestion {
  staffId: number;
  matchScore: number; // 0-100
  reasons: string[];
  estimatedCompletion: string;
  workloadImpact: number;
}

export interface DepartmentSummary {
  department: StaffDepartment;
  totalStaff: number;
  onDutyStaff: number;
  pendingTasks: number;
  averageWorkload: number;
  performanceScore: number;
}
