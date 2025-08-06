/**
 * Hotel Operations Domain - Main Entry Point
 * Exports all domain functionality for comprehensive hotel operations management
 */

// ========================================
// Types
// ========================================
export type {
  AccessLevel,
  BedType,
  BreakPeriod,
  ChecklistCategory,
  ChecklistItem,
  CreateHousekeepingTaskPayload,
  CreateMaintenanceRequestPayload,
  CreateRoomPayload,
  DaySchedule,
  Document,
  DocumentType,
  Equipment,
  EquipmentCondition,
  EquipmentType,
  FacilitiesResponse,
  Facility,
  FacilityCondition,
  FacilityFilters,
  FacilityStatus,
  FacilityType,
  HotelOperationsAnalytics,
  HotelOperationsState,
  HotelOperationsUpdateEvent,
  HousekeepingFilters,
  HousekeepingResponse,
  HousekeepingTask,
  HousekeepingTaskType,
  InventoryCategory,
  InventoryFilters,
  InventoryItem,
  InventoryResponse,
  InventoryType,
  Issue,
  IssueSeverity,
  IssueType,
  ItemQuality,
  MaintenanceCategory,
  MaintenanceFilters,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceResponse,
  MaintenanceStatus,
  MaintenanceUrgency,
  OperatingHours,
  PartUsed,
  RequestSource,
  Room,
  RoomAmenity,
  RoomAvailability,
  RoomCondition,
  RoomFeature,
  RoomFilters,
  RoomStatus,
  RoomType,
  RoomView,
  RoomsResponse,
  SecurityLevel,
  Supplier,
  TaskPriority,
  TaskStatus,
  UpdateHousekeepingTaskPayload,
  UpdateMaintenanceRequestPayload,
  UpdateRoomPayload,
  UsageFrequency,
} from "./types/hotelOperations.types";

// ========================================
// Redux Store
// ========================================
export {
  // Actions
  addHotelOperationsUpdate,
  assignHousekeepingTask,
  assignMaintenanceRequest,
  clearError,
  completeHousekeepingTask,
  createHousekeepingTask,
  createMaintenanceRequest,
  createRoom,
  fetchFacilities,
  fetchHotelOperationsAnalytics,
  fetchHousekeepingTasks,
  fetchInventoryItems,
  fetchMaintenanceRequests,
  fetchRoomById,
  fetchRoomTypes,
  fetchRooms,
  optimisticUpdateRoom,
  optimisticUpdateTask,
  resetHotelOperations,
  resetHousekeepingFilters,
  resetMaintenanceFilters,
  resetRoomFilters,
  // Selectors
  selectAnalytics,
  selectAvailableRooms,
  selectError,
  selectFacilities,
  selectHotelOperations,
  selectHousekeepingTasks,
  selectInventoryItems,
  selectIsLoading,
  selectLowStockItems,
  selectMaintenanceRequests,
  selectOccupiedRooms,
  selectRoomFilters,
  selectRoomTypes,
  selectRooms,
  selectRoomsNeedingCleaning,
  selectSelectedRequest,
  selectSelectedRoom,
  selectSelectedTask,
  selectUrgentMaintenanceRequests,
  selectUrgentTasks,
  setActiveTab,
  setError,
  setFacilityFilters,
  setHousekeepingFilters,
  setInventoryFilters,
  setMaintenanceFilters,
  setRoomFilters,
  setSelectedFacility,
  setSelectedItem,
  setSelectedRequest,
  setSelectedRoom,
  setSelectedTask,
  setViewMode,
  toggleFilters,
  updateFacilityStatus,
  updateHousekeepingTask,
  updateInventoryStock,
  updateMaintenanceRequest,
  updateRoom,
  updateRoomStatus,
} from "./store/hotelOperationsSlice";

// Default export for reducer
export { default as hotelOperationsReducer } from "./store/hotelOperationsSlice";

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

// Room status options for UI
export const ROOM_STATUS_OPTIONS = [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "maintenance",
  "out-of-order",
  "blocked",
] as const;

// Room availability options
export const ROOM_AVAILABILITY_OPTIONS = [
  "ready",
  "dirty",
  "clean",
  "inspected",
  "maintenance",
  "blocked",
] as const;

// Bed type options
export const BED_TYPE_OPTIONS = [
  "single",
  "twin",
  "double",
  "queen",
  "king",
  "sofa-bed",
  "bunk-bed",
] as const;

// Room view options
export const ROOM_VIEW_OPTIONS = [
  "sea",
  "mountain",
  "city",
  "garden",
  "pool",
  "courtyard",
  "street",
] as const;

// Room amenities options
export const ROOM_AMENITY_OPTIONS = [
  "wifi",
  "tv",
  "ac",
  "minibar",
  "safe",
  "coffee-maker",
  "hair-dryer",
  "iron",
  "telephone",
  "room-service",
  "laundry",
  "concierge",
  "spa-access",
  "gym-access",
  "pool-access",
  "breakfast",
] as const;

// Housekeeping task types
export const HOUSEKEEPING_TASK_TYPES = [
  "checkout-cleaning",
  "maintenance-cleaning",
  "deep-cleaning",
  "inspection",
  "turnover",
  "refresh",
  "pre-arrival",
  "special-request",
] as const;

// Task priority options
export const TASK_PRIORITY_OPTIONS = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

// Task status options
export const TASK_STATUS_OPTIONS = [
  "pending",
  "assigned",
  "in-progress",
  "completed",
  "inspection",
  "approved",
  "rejected",
  "cancelled",
] as const;

// Maintenance categories
export const MAINTENANCE_CATEGORY_OPTIONS = [
  "plumbing",
  "electrical",
  "hvac",
  "carpentry",
  "painting",
  "appliances",
  "furniture",
  "safety",
  "security",
  "technology",
  "cleaning",
  "landscaping",
  "general",
] as const;

// Maintenance priority options
export const MAINTENANCE_PRIORITY_OPTIONS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

// Maintenance urgency options
export const MAINTENANCE_URGENCY_OPTIONS = [
  "routine",
  "scheduled",
  "urgent",
  "emergency",
] as const;

// Facility types
export const FACILITY_TYPE_OPTIONS = [
  "lobby",
  "restaurant",
  "bar",
  "gym",
  "spa",
  "pool",
  "meeting-room",
  "conference-room",
  "business-center",
  "laundry",
  "storage",
  "kitchen",
  "parking",
  "garden",
  "terrace",
  "elevator",
  "staircase",
  "corridor",
  "utility",
  "other",
] as const;

// Inventory categories
export const INVENTORY_CATEGORY_OPTIONS = [
  "housekeeping",
  "guest-amenities",
  "linens",
  "cleaning",
  "maintenance",
  "kitchen",
  "office",
  "safety",
  "uniforms",
  "equipment",
  "consumables",
  "other",
] as const;

// ========================================
// Color Mappings for UI
// ========================================

// Room status color mapping
export const ROOM_STATUS_COLORS = {
  available: "bg-green-100 text-green-700 border-green-200",
  occupied: "bg-blue-100 text-blue-700 border-blue-200",
  reserved: "bg-purple-100 text-purple-700 border-purple-200",
  cleaning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  maintenance: "bg-orange-100 text-orange-700 border-orange-200",
  "out-of-order": "bg-red-100 text-red-700 border-red-200",
  blocked: "bg-gray-100 text-gray-700 border-gray-200",
} as const;

// Task priority color mapping
export const TASK_PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
} as const;

// Task status color mapping
export const TASK_STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  inspection: "bg-purple-100 text-purple-700 border-purple-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
} as const;

// Maintenance priority color mapping
export const MAINTENANCE_PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
} as const;

// Facility status color mapping
export const FACILITY_STATUS_COLORS = {
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  maintenance: "bg-orange-100 text-orange-700",
  "private-event": "bg-purple-100 text-purple-700",
  cleaning: "bg-yellow-100 text-yellow-700",
  renovation: "bg-blue-100 text-blue-700",
  "out-of-service": "bg-red-100 text-red-700",
} as const;

// ========================================
// Utility Functions
// ========================================

/**
 * Get room status color class for UI components
 */
export const getRoomStatusColor = (status: string): string => {
  return (
    ROOM_STATUS_COLORS[status as keyof typeof ROOM_STATUS_COLORS] ||
    ROOM_STATUS_COLORS["available"]
  );
};

/**
 * Get task priority color class for UI components
 */
export const getTaskPriorityColor = (priority: string): string => {
  return (
    TASK_PRIORITY_COLORS[priority as keyof typeof TASK_PRIORITY_COLORS] ||
    TASK_PRIORITY_COLORS["normal"]
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
 * Get maintenance priority color class for UI components
 */
export const getMaintenancePriorityColor = (priority: string): string => {
  return (
    MAINTENANCE_PRIORITY_COLORS[
      priority as keyof typeof MAINTENANCE_PRIORITY_COLORS
    ] || MAINTENANCE_PRIORITY_COLORS["medium"]
  );
};

/**
 * Get facility status color class for UI components
 */
export const getFacilityStatusColor = (status: string): string => {
  return (
    FACILITY_STATUS_COLORS[status as keyof typeof FACILITY_STATUS_COLORS] ||
    FACILITY_STATUS_COLORS["open"]
  );
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
 * Format currency for display (Vietnamese Dong)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Calculate room occupancy rate
 */
export const calculateOccupancyRate = (rooms: Room[]): number => {
  if (rooms.length === 0) return 0;
  const occupiedRooms = rooms.filter(
    (room) => room.status === "occupied",
  ).length;
  return Math.round((occupiedRooms / rooms.length) * 100);
};

/**
 * Calculate housekeeping efficiency
 */
export const calculateHousekeepingEfficiency = (
  tasks: HousekeepingTask[],
): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Get room display name
 */
export const getRoomDisplayName = (room: Room): string => {
  return `${room.roomNumber} - ${room.roomType.name}`;
};

/**
 * Get task duration in human readable format
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
 * Validate room data
 */
export const validateRoomData = (
  data: Partial<CreateRoomPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.roomNumber?.trim()) {
    errors.push("Số phòng là bắt buộc");
  }

  if (data.floor === undefined || data.floor < 1) {
    errors.push("Tầng phải là số dương");
  }

  if (!data.roomTypeId) {
    errors.push("Loại phòng là bắt buộc");
  }

  if (!data.capacity || data.capacity < 1) {
    errors.push("Sức chứa phải lớn hơn 0");
  }

  if (!data.basePrice || data.basePrice < 0) {
    errors.push("Giá cơ bản phải lớn hơn hoặc bằng 0");
  }

  return errors;
};

/**
 * Validate housekeeping task data
 */
export const validateHousekeepingTaskData = (
  data: Partial<CreateHousekeepingTaskPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.roomId) {
    errors.push("Phòng là bắt buộc");
  }

  if (!data.taskType) {
    errors.push("Loại nhiệm vụ là bắt buộc");
  }

  if (!data.description?.trim()) {
    errors.push("Mô tả nhiệm vụ là bắt buộc");
  }

  if (!data.estimatedDuration || data.estimatedDuration < 15) {
    errors.push("Thời gian ước tính phải ít nhất 15 phút");
  }

  return errors;
};

/**
 * Validate maintenance request data
 */
export const validateMaintenanceRequestData = (
  data: Partial<CreateMaintenanceRequestPayload>,
): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Tiêu đề là bắt buộc");
  }

  if (!data.description?.trim()) {
    errors.push("Mô tả là bắt buộc");
  }

  if (!data.location?.trim()) {
    errors.push("Vị trí là bắt buộc");
  }

  if (!data.category) {
    errors.push("Danh mục là bắt buộc");
  }

  if (!data.priority) {
    errors.push("Mức độ ưu tiên là bắt buộc");
  }

  if (!data.reportedBy) {
    errors.push("Người báo cáo là bắt buộc");
  }

  return errors;
};

/**
 * Generate task summary for notifications
 */
export const generateTaskSummary = (task: HousekeepingTask): string => {
  return `${task.taskType} - Phòng ${task.roomNumber}: ${task.description.substring(0, 100)}${task.description.length > 100 ? "..." : ""}`;
};

/**
 * Generate maintenance request summary
 */
export const generateMaintenanceRequestSummary = (
  request: MaintenanceRequest,
): string => {
  return `${request.title} - ${request.location}: ${request.description.substring(0, 100)}${request.description.length > 100 ? "..." : ""}`;
};

/**
 * Check if room is available for booking
 */
export const isRoomAvailable = (room: Room): boolean => {
  return (
    room.status === "available" &&
    room.availability === "ready" &&
    room.isActive
  );
};

/**
 * Check if maintenance request is urgent
 */
export const isMaintenanceUrgent = (request: MaintenanceRequest): boolean => {
  return (
    request.urgency === "emergency" ||
    request.urgency === "urgent" ||
    request.priority === "critical"
  );
};

/**
 * Get room type display info
 */
export const getRoomTypeInfo = (
  roomType: RoomType,
): { name: string; description: string; maxOccupancy: number } => {
  return {
    name: roomType.name,
    description: roomType.description,
    maxOccupancy: roomType.maxOccupancy,
  };
};

/**
 * Calculate inventory value
 */
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce(
    (total, item) => total + item.currentStock * item.unitCost,
    0,
  );
};

// ========================================
// Default Export
// ========================================

const HotelOperationsDomain = {
  // Constants
  ROOM_STATUS_OPTIONS,
  ROOM_AVAILABILITY_OPTIONS,
  BED_TYPE_OPTIONS,
  ROOM_VIEW_OPTIONS,
  ROOM_AMENITY_OPTIONS,
  HOUSEKEEPING_TASK_TYPES,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  MAINTENANCE_PRIORITY_OPTIONS,
  MAINTENANCE_URGENCY_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  INVENTORY_CATEGORY_OPTIONS,
  ROOM_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  MAINTENANCE_PRIORITY_COLORS,
  FACILITY_STATUS_COLORS,

  // Utilities
  getRoomStatusColor,
  getTaskPriorityColor,
  getTaskStatusColor,
  getMaintenancePriorityColor,
  getFacilityStatusColor,
  formatDate,
  formatCurrency,
  formatDuration,
  getTimeElapsed,
  calculateOccupancyRate,
  calculateHousekeepingEfficiency,
  getRoomDisplayName,
  validateRoomData,
  validateHousekeepingTaskData,
  validateMaintenanceRequestData,
  generateTaskSummary,
  generateMaintenanceRequestSummary,
  isRoomAvailable,
  isMaintenanceUrgent,
  getRoomTypeInfo,
  calculateInventoryValue,
};

export default HotelOperationsDomain;
