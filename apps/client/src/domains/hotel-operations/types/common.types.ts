/**
 * Hotel Operations Domain Types
 * Type definitions for comprehensive hotel operations management
 */

// ========================================
// Room Management Types
// ========================================

export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  status: RoomStatus;
  availability: RoomAvailability;

  // Room specifications
  capacity: number;
  bedType: BedType;
  bedCount: number;
  size: number; // in square meters
  view: RoomView;

  // Amenities & Features
  amenities: RoomAmenity[];
  features: RoomFeature[];
  hasBalcony: boolean;
  hasKitchen: boolean;
  hasBathtub: boolean;

  // Pricing
  basePrice: number;
  currentPrice: number;
  seasonalRate?: number;
  discountRate?: number;

  // Condition & Maintenance
  condition: RoomCondition;
  lastCleaning?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceNotes?: string;

  // Occupancy
  currentGuest?: {
    guestId: number;
    guestName: string;
    checkIn: string;
    checkOut: string;
    reservationId: string;
  };

  // System fields
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoomStatus =
  | "available" // Có thể đặt
  | "occupied" // Đang có khách
  | "reserved" // Đã đặt trước
  | "cleaning" // Đang dọn dẹp
  | "maintenance" // Đang bảo trì
  | "out-of-order" // Hỏng, không sử dụng được
  | "blocked"; // Bị khóa

export type RoomAvailability =
  | "ready" // Sẵn sàng
  | "dirty" // Cần dọn dẹp
  | "clean" // Đã dọn sạch
  | "inspected" // Đã kiểm tra
  | "maintenance" // Cần bảo trì
  | "blocked"; // Bị chặn

export type RoomCondition =
  | "excellent" // Tuyệt vời
  | "good" // Tốt
  | "fair" // Khá
  | "poor" // Kém
  | "needs-repair"; // Cần sửa chữa

export type BedType =
  | "single" // Giường đơn
  | "twin" // Giường đôi nhỏ
  | "double" // Giường đôi
  | "queen" // Giường queen
  | "king" // Giường king
  | "sofa-bed" // Giường sofa
  | "bunk-bed"; // Giường tầng

export type RoomView =
  | "sea" // Hướng biển
  | "mountain" // Hướng núi
  | "city" // Hướng thành phố
  | "garden" // Hướng vườn
  | "pool" // Hướng bể bơi
  | "courtyard" // Hướng sân trong
  | "street"; // Hướng đường

export interface RoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  features: RoomFeature[];
  amenities: RoomAmenity[];
  images: string[];
  isActive: boolean;
}

export type RoomAmenity =
  | "wifi" // WiFi
  | "tv" // TV
  | "ac" // Điều hòa
  | "minibar" // Minibar
  | "safe" // Két sắt
  | "coffee-maker" // Máy pha cà phê
  | "hair-dryer" // Máy sấy tóc
  | "iron" // Bàn ủi
  | "telephone" // Điện thoại
  | "room-service" // Dịch vụ phòng
  | "laundry" // Giặt ủi
  | "concierge" // Concierge
  | "spa-access" // Truy cập spa
  | "gym-access" // Truy cập gym
  | "pool-access" // Truy cập bể bơi
  | "breakfast"; // Ăn sáng

export type RoomFeature =
  | "balcony" // Ban công
  | "terrace" // Sân thượng
  | "kitchen" // Bếp
  | "kitchenette" // Bếp nhỏ
  | "living-room" // Phòng khách
  | "dining-area" // Khu ăn uống
  | "work-desk" // Bàn làm việc
  | "bathtub" // Bồn tắm
  | "shower" // Vòi sen
  | "jacuzzi" // Jacuzzi
  | "fireplace" // Lò sưởi
  | "soundproof" // Cách âm
  | "wheelchair-accessible"; // Tiếp cận xe lăn

// ========================================
// Housekeeping Types
// ========================================

export interface HousekeepingTask {
  id: string;
  roomId: number;
  roomNumber: string;
  taskType: HousekeepingTaskType;
  priority: TaskPriority;
  status: TaskStatus;

  // Assignment
  assignedTo?: number;
  assignedStaffName?: string;
  assignedAt?: string;

  // Timing
  scheduledStart?: string;
  actualStart?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  completedAt?: string;

  // Details
  description: string;
  notes?: string;
  checklistItems: ChecklistItem[];

  // Quality Control
  inspectedBy?: number;
  inspectorName?: string;
  inspectedAt?: string;
  qualityScore?: number; // 1-5 stars
  qualityNotes?: string;

  // Issues & Maintenance
  issuesFound: Issue[];
  maintenanceRequired: boolean;
  maintenanceNotes?: string;

  // System fields
  createdAt: string;
  updatedAt: string;
}

export type HousekeepingTaskType =
  | "checkout-cleaning" // Dọn phòng sau checkout
  | "maintenance-cleaning" // Dọn phòng bảo trì
  | "deep-cleaning" // Dọn dẹp sâu
  | "inspection" // Kiểm tra phòng
  | "turnover" // Chuyển đổi phòng
  | "refresh" // Làm mới phòng
  | "pre-arrival" // Chuẩn bị trước arrival
  | "special-request"; // Yêu cầu đặc biệt

export type TaskPriority =
  | "low" // Thấp
  | "normal" // Bình thường
  | "high" // Cao
  | "urgent"; // Khẩn cấp

export type TaskStatus =
  | "pending" // Đang chờ
  | "assigned" // Đã giao
  | "in-progress" // Đang thực hiện
  | "completed" // Hoàn thành
  | "inspection" // Đang kiểm tra
  | "approved" // Đã duyệt
  | "rejected" // Bị từ chối
  | "cancelled"; // Đã hủy

export interface ChecklistItem {
  id: string;
  description: string;
  category: ChecklistCategory;
  isRequired: boolean;
  isCompleted: boolean;
  notes?: string;
  completedAt?: string;
}

export type ChecklistCategory =
  | "bathroom" // Phòng tắm
  | "bedroom" // Phòng ngủ
  | "living-area" // Khu vực sinh hoạt
  | "kitchen" // Bếp
  | "amenities" // Tiện nghi
  | "safety" // An toàn
  | "supplies" // Vật tư
  | "maintenance"; // Bảo trì

export interface Issue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  location: string;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export type IssueType =
  | "cleanliness" // Vệ sinh
  | "damage" // Hư hỏng
  | "missing-item" // Thiếu đồ
  | "malfunction" // Trục trặc
  | "maintenance" // Bảo trì
  | "safety" // An toàn
  | "other"; // Khác

export type IssueSeverity =
  | "minor" // Nhỏ
  | "moderate" // Vừa
  | "major" // Lớn
  | "critical"; // Nghiêm trọng

// ========================================
// Maintenance Types
// ========================================

export interface MaintenanceRequest {
  id: string;
  roomId?: number;
  roomNumber?: string;
  facilityId?: string;
  facilityName?: string;
  location: string;

  // Request details
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  urgency: MaintenanceUrgency;

  // Reporting
  reportedBy: number;
  reporterName: string;
  reportedAt: string;
  source: RequestSource;

  // Assignment & Scheduling
  assignedTo?: number;
  assignedStaffName?: string;
  assignedAt?: string;
  scheduledDate?: string;

  // Execution
  status: MaintenanceStatus;
  startedAt?: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;

  // Work details
  workPerformed?: string;
  partsUsed: PartUsed[];
  hoursSpent?: number;

  // Quality & Follow-up
  inspectedBy?: number;
  inspectorName?: string;
  inspectedAt?: string;
  qualityRating?: number; // 1-5 stars
  followUpRequired: boolean;
  followUpNotes?: string;

  // Documentation
  beforeImages: string[];
  afterImages: string[];
  documents: Document[];

  // System fields
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceCategory =
  | "plumbing" // Hệ thống nước
  | "electrical" // Điện
  | "hvac" // Điều hòa, thông gió
  | "carpentry" // Mộc
  | "painting" // Sơn
  | "appliances" // Thiết bị
  | "furniture" // Nội thất
  | "safety" // An toàn
  | "security" // Bảo mật
  | "technology" // Công nghệ
  | "cleaning" // Vệ sinh
  | "landscaping" // Cảnh quan
  | "general"; // Chung

export type MaintenancePriority =
  | "low" // Thấp
  | "medium" // Trung bình
  | "high" // Cao
  | "critical"; // Nghiêm trọng

export type MaintenanceUrgency =
  | "routine" // Thường quy
  | "scheduled" // Đã lên lịch
  | "urgent" // Khẩn cấp
  | "emergency"; // Khẩn cấp

export type MaintenanceStatus =
  | "reported" // Đã báo cáo
  | "acknowledged" // Đã tiếp nhận
  | "assigned" // Đã phân công
  | "scheduled" // Đã lên lịch
  | "in-progress" // Đang thực hiện
  | "testing" // Đang kiểm tra
  | "completed" // Hoàn thành
  | "closed" // Đã đóng
  | "cancelled"; // Đã hủy

export type RequestSource =
  | "guest" // Khách hàng
  | "staff" // Nhân viên
  | "housekeeping" // Bộ phận dọn dẹp
  | "inspection" // Kiểm tra
  | "routine" // Bảo trì định kỳ
  | "system"; // Hệ thống

export interface PartUsed {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  uploadedBy: number;
}

export type DocumentType =
  | "photo" // Ảnh
  | "video" // Video
  | "pdf" // PDF
  | "receipt" // Hóa đơn
  | "invoice" // Phiếu
  | "report" // Báo cáo
  | "other"; // Khác

// ========================================
// Facility Management Types
// ========================================

export interface Facility {
  id: string;
  name: string;
  code: string;
  type: FacilityType;
  location: string;
  floor?: number;
  area?: number; // in square meters

  // Status & Condition
  status: FacilityStatus;
  condition: FacilityCondition;
  isOperational: boolean;

  // Capacity & Usage
  capacity?: number;
  currentOccupancy?: number;
  maxOccupancy?: number;

  // Operating hours
  operatingHours: OperatingHours;
  isOpen24Hours: boolean;

  // Maintenance
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceFrequency: MaintenanceFrequency;

  // Equipment & Assets
  equipment: Equipment[];

  // Access & Security
  accessLevel: AccessLevel;
  requiresKeyCard: boolean;
  securityLevel: SecurityLevel;

  // System fields
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FacilityType =
  | "lobby" // Sảnh
  | "restaurant" // Nhà hàng
  | "bar" // Quầy bar
  | "gym" // Phòng gym
  | "spa" // Spa
  | "pool" // Bể bơi
  | "meeting-room" // Phòng họp
  | "conference-room" // Phòng hội thảo
  | "business-center" // Trung tâm kinh doanh
  | "laundry" // Giặt ủi
  | "storage" // Kho
  | "kitchen" // Bếp
  | "parking" // Bãi đỗ xe
  | "garden" // Vườn
  | "terrace" // Sân thượng
  | "elevator" // Thang máy
  | "staircase" // Cầu thang
  | "corridor" // Hành lang
  | "utility" // Tiện ích
  | "other"; // Khác

export type FacilityStatus =
  | "open" // Mở cửa
  | "closed" // Đóng cửa
  | "maintenance" // Bảo trì
  | "private-event" // Sự kiện riêng
  | "cleaning" // Dọn dẹp
  | "renovation" // Cải tạo
  | "out-of-service"; // Ngừng hoạt động

export type FacilityCondition =
  | "excellent" // Tuyệt vời
  | "good" // Tốt
  | "fair" // Khá
  | "poor" // Kém
  | "critical"; // Nghiêm trọng

export type AccessLevel =
  | "public" // Công cộng
  | "guest" // Khách
  | "staff" // Nhân viên
  | "management" // Quản lý
  | "vip" // VIP
  | "restricted"; // Hạn chế

export type SecurityLevel =
  | "none" // Không
  | "low" // Thấp
  | "medium" // Trung bình
  | "high" // Cao
  | "maximum"; // Tối đa

export type MaintenanceFrequency =
  | "daily" // Hàng ngày
  | "weekly" // Hàng tuần
  | "monthly" // Hàng tháng
  | "quarterly" // Hàng quý
  | "annually" // Hàng năm
  | "as-needed"; // Khi cần

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breaks: BreakPeriod[];
}

export interface BreakPeriod {
  startTime: string;
  endTime: string;
  reason: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  condition: EquipmentCondition;
  lastService?: string;
  nextService?: string;
  isOperational: boolean;
}

export type EquipmentType =
  | "hvac" // Điều hòa
  | "lighting" // Đèn
  | "audio-visual" // Âm thanh, hình ảnh
  | "kitchen" // Bếp
  | "cleaning" // Dọn dẹp
  | "safety" // An toàn
  | "security" // Bảo mật
  | "fitness" // Thể dục
  | "pool" // Bể bơi
  | "laundry" // Giặt ủi
  | "communication" // Liên lạc
  | "computer" // Máy tính
  | "furniture" // Nội thất
  | "other"; // Khác

export type EquipmentCondition =
  | "new" // Mới
  | "excellent" // Tuyệt vời
  | "good" // Tốt
  | "fair" // Khá
  | "poor" // Kém
  | "broken" // Hỏng
  | "obsolete"; // Lỗi thời

// ========================================
// Inventory Management Types
// ========================================

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryCategory;
  type: InventoryType;

  // Stock information
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;

  // Pricing
  unitCost: number;
  avgCost: number;
  lastPurchasePrice: number;

  // Supplier information
  primarySupplier?: Supplier;
  alternativeSuppliers: Supplier[];

  // Location & Storage
  storageLocation: string;
  shelf?: string;
  bin?: string;

  // Usage tracking
  monthlyUsage: number;
  lastUsed?: string;
  usageFrequency: UsageFrequency;

  // Expiry & Quality
  hasExpiry: boolean;
  expiryDate?: string;
  batchNumber?: string;
  quality: ItemQuality;

  // System fields
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InventoryCategory =
  | "housekeeping" // Dọn dẹp
  | "guest-amenities" // Tiện nghi khách
  | "linens" // Vải lanh
  | "cleaning" // Vệ sinh
  | "maintenance" // Bảo trì
  | "kitchen" // Bếp
  | "office" // Văn phòng
  | "safety" // An toàn
  | "uniforms" // Đồng phục
  | "equipment" // Thiết bị
  | "consumables" // Tiêu hao
  | "other"; // Khác

export type InventoryType =
  | "consumable" // Tiêu hao
  | "reusable" // Tái sử dụng
  | "equipment" // Thiết bị
  | "asset" // Tài sản
  | "perishable" // Dễ hỏng
  | "durable"; // Bền

export type UsageFrequency =
  | "daily" // Hàng ngày
  | "weekly" // Hàng tuần
  | "monthly" // Hàng tháng
  | "seasonal" // Theo mùa
  | "occasional" // Thỉnh thoảng
  | "rare"; // Hiếm khi

export type ItemQuality =
  | "excellent" // Tuyệt vời
  | "good" // Tốt
  | "acceptable" // Chấp nhận được
  | "poor" // Kém
  | "damaged" // Hỏng
  | "expired"; // Hết hạn

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTime: number; // in days
  minimumOrder?: number;
  paymentTerms: string;
  rating: number; // 1-5 stars
  isPreferred: boolean;
}

// ========================================
// Filtering & Search Types
// ========================================

export interface RoomFilters {
  roomType?: string;
  status?: RoomStatus;
  availability?: RoomAvailability;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: RoomAmenity[];
  features?: RoomFeature[];
  searchQuery?: string;
}

export interface HousekeepingFilters {
  taskType?: HousekeepingTaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: number;
  floor?: number;
  scheduledDate?: string;
  searchQuery?: string;
}

export interface MaintenanceFilters {
  category?: MaintenanceCategory;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  assignedTo?: number;
  reportedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface FacilityFilters {
  type?: FacilityType;
  status?: FacilityStatus;
  floor?: number;
  accessLevel?: AccessLevel;
  searchQuery?: string;
}

export interface InventoryFilters {
  category?: InventoryCategory;
  type?: InventoryType;
  lowStock?: boolean;
  nearExpiry?: boolean;
  supplier?: string;
  location?: string;
  searchQuery?: string;
}

// ========================================
// API Response Types
// ========================================

export interface RoomsResponse {
  rooms: Room[]; // TODO: Fix Room type definition consistency;
  totalCount: number;
  availableCount: number;
  occupiedCount: number;
  maintenanceCount: number;
}

export interface HousekeepingResponse {
  tasks: HousekeepingTask[];
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface MaintenanceResponse {
  requests: MaintenanceRequest[];
  totalCount: number;
  openCount: number;
  completedCount: number;
  urgentCount: number;
}

export interface FacilitiesResponse {
  facilities: Facility[];
  totalCount: number;
  operationalCount: number;
  maintenanceCount: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  totalCount: number;
  lowStockCount: number;
  expiryAlerts: number;
  totalValue: number;
}

// ========================================
// Analytics & Dashboard Types
// ========================================

export interface HotelOperationsAnalytics {
  // Room metrics
  roomOccupancyRate: number;
  averageRoomRate: number;
  revenuePerAvailableRoom: number;

  // Housekeeping metrics
  housekeepingEfficiency: number;
  averageCleaningTime: number;
  qualityScore: number;

  // Maintenance metrics
  maintenanceResponseTime: number;
  maintenanceBacklog: number;
  preventiveMaintenanceRate: number;

  // Facility metrics
  facilityUtilization: number;
  downtimeHours: number;

  // Inventory metrics
  inventoryTurnover: number;
  stockOutRate: number;
  carryingCosts: number;

  // Cost metrics
  operationalCosts: number;
  maintenanceCosts: number;
  energyCosts: number;

  // Time period
  period: string;
  lastUpdated: string;
}

// ========================================
// Action Payload Types
// ========================================

export interface CreateRoomPayload {
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  capacity: number;
  bedType: BedType;
  bedCount: number;
  size: number;
  view: RoomView;
  basePrice: number;
  amenities: RoomAmenity[];
  features: RoomFeature[];
}

export interface UpdateRoomPayload {
  roomId: number;
  updates: Partial<Omit<Room, "id" | "createdAt" | "updatedAt">>;
}

export interface CreateHousekeepingTaskPayload {
  roomId: number;
  taskType: HousekeepingTaskType;
  priority: TaskPriority;
  description: string;
  scheduledStart?: string;
  estimatedDuration: number;
  assignedTo?: number;
}

export interface UpdateHousekeepingTaskPayload {
  taskId: string;
  updates: Partial<Omit<HousekeepingTask, "id" | "createdAt" | "updatedAt">>;
}

export interface CreateMaintenanceRequestPayload {
  roomId?: number;
  facilityId?: string;
  location: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  urgency: MaintenanceUrgency;
  reportedBy: number;
  source: RequestSource;
}

export interface UpdateMaintenanceRequestPayload {
  requestId: string;
  updates: Partial<Omit<MaintenanceRequest, "id" | "createdAt" | "updatedAt">>;
}

// ========================================
// Domain State Types
// ========================================

export interface HotelOperationsState {
  // Room management
  rooms: Room[]; // TODO: Fix Room type definition consistency;
  roomTypes: RoomType[];
  selectedRoom: Room | null;

  // Housekeeping
  housekeepingTasks: HousekeepingTask[];
  selectedTask: HousekeepingTask | null;

  // Maintenance
  maintenanceRequests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;

  // Facilities
  facilities: Facility[];
  selectedFacility: Facility | null;

  // Inventory
  inventoryItems: InventoryItem[];
  selectedItem: InventoryItem | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isSaving: boolean;

  // Filters
  roomFilters: RoomFilters;
  housekeepingFilters: HousekeepingFilters;
  maintenanceFilters: MaintenanceFilters;
  facilityFilters: FacilityFilters;
  inventoryFilters: InventoryFilters;

  // UI state
  activeTab:
    | "rooms"
    | "housekeeping"
    | "maintenance"
    | "facilities"
    | "inventory";
  viewMode: "grid" | "table" | "floor-plan";
  showFilters: boolean;

  // Analytics
  analytics: HotelOperationsAnalytics | null;

  // Error handling
  error: string | null;
  lastError: string | null;

  // Real-time updates
  lastUpdate: string | null;
}

// ========================================
// Event Types for Real-time Updates
// ========================================

export interface HotelOperationsUpdateEvent {
  type:
    | "room-status"
    | "housekeeping-update"
    | "maintenance-update"
    | "facility-status"
    | "inventory-change";
  entityId: string | number;
  data: any;
  timestamp: string;
  triggeredBy: string;
}
