/**
 * Consolidated Common Types
 * Single source of truth for all shared type definitions
 */

// Re-export core types from packages
export type { Language } from "@shared/types";

// Also export Language from guest experience types for compatibility
export type { Language as GuestLanguage } from "../domains/guest-experience/types/guestExperience.types";

// Room related types
export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  availability: RoomAvailability;
  status: RoomStatus;
  condition: RoomCondition;
  view: RoomView;
  amenities: RoomAmenity[];
  features: RoomFeature[];
  basePrice: number;
  discountPrice?: number;
  capacity: {
    adults: number;
    children: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastCleaning?: Date;
  lastMaintenance?: Date;
  notes?: string;
  images?: string[];
  isActive: boolean;
}

export interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  basePrice: number;
  capacity: {
    adults: number;
    children: number;
  };
  amenities: RoomAmenity[];
  images?: string[];
  isActive: boolean;
}

export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "cleaning"
  | "reserved"
  | "out-of-order";

export type RoomAvailability =
  | "available"
  | "booked"
  | "blocked"
  | "maintenance";

export type RoomCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "needs-repair";

export type RoomView =
  | "ocean"
  | "city"
  | "garden"
  | "mountain"
  | "pool"
  | "courtyard"
  | "street"
  | "no-view";

export type RoomAmenity =
  | "wifi"
  | "tv"
  | "minibar"
  | "safe"
  | "ac"
  | "balcony"
  | "kitchenette"
  | "jacuzzi"
  | "workspace"
  | "coffee-maker";

export type RoomFeature =
  | "smoking"
  | "non-smoking"
  | "pet-friendly"
  | "accessible"
  | "connecting"
  | "suite"
  | "studio"
  | "family"
  | "business"
  | "luxury";

// Housekeeping related types
export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: HousekeepingTaskType;
  priority: HousekeepingPriority;
  status: HousekeepingStatus;
  assignedTo?: number;
  description: string;
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  completedBy?: number;
  notes?: string;
  checklist?: HousekeepingChecklistItem[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type HousekeepingTaskType =
  | "checkout-cleaning"
  | "checkin-preparation"
  | "maintenance-cleaning"
  | "deep-cleaning"
  | "inspection"
  | "restocking"
  | "special-request";

export type HousekeepingPriority = "low" | "normal" | "high" | "urgent";

export type HousekeepingStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "on-hold";

export interface HousekeepingChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

// Maintenance related types
export interface MaintenanceRequest {
  id: string;
  roomNumber?: string;
  facilityId?: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  reportedBy: number;
  assignedTo?: number;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  startDate?: Date;
  completionDate?: Date;
  images?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenanceType =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "appliance"
  | "furniture"
  | "safety"
  | "structural"
  | "cosmetic"
  | "preventive";

export type MaintenancePriority =
  | "low"
  | "normal"
  | "high"
  | "critical"
  | "emergency";

export type MaintenanceStatus =
  | "reported"
  | "acknowledged"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "postponed";

// Facility related types
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  status: FacilityStatus;
  capacity?: number;
  description?: string;
  amenities?: string[];
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FacilityType =
  | "restaurant"
  | "bar"
  | "spa"
  | "gym"
  | "pool"
  | "conference-room"
  | "business-center"
  | "parking"
  | "laundry"
  | "gift-shop";

export type FacilityStatus =
  | "operational"
  | "maintenance"
  | "closed"
  | "limited";

// Inventory related types
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  supplier?: string;
  location: string;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InventoryCategory =
  | "linens"
  | "toiletries"
  | "cleaning-supplies"
  | "food-beverage"
  | "maintenance-parts"
  | "office-supplies"
  | "safety-equipment"
  | "technology"
  | "furniture"
  | "decorative";

// Filter types
export interface RoomFilters {
  status?: RoomStatus;
  availability?: RoomAvailability;
  roomType?: string;
  floor?: number;
  condition?: RoomCondition;
  view?: RoomView;
  minPrice?: number;
  maxPrice?: number;
  amenities?: RoomAmenity[];
  features?: RoomFeature[];
  capacity?: {
    adults?: number;
    children?: number;
  };
  searchQuery?: string;
}

export interface HousekeepingFilters {
  status?: HousekeepingStatus;
  taskType?: HousekeepingTaskType;
  priority?: HousekeepingPriority;
  assignedTo?: number;
  roomNumber?: string;
  floor?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  assignedTo?: number;
  roomNumber?: string;
  facilityId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface FacilityFilters {
  type?: FacilityType;
  status?: FacilityStatus;
  location?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export interface InventoryFilters {
  category?: InventoryCategory;
  location?: string;
  lowStock?: boolean;
  expired?: boolean;
  isActive?: boolean;
  searchQuery?: string;
}

// Response types
export interface RoomsResponse {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface HousekeepingResponse {
  tasks: HousekeepingTask[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MaintenanceResponse {
  requests: MaintenanceRequest[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FacilitiesResponse {
  facilities: Facility[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Payload types
export interface CreateRoomPayload {
  roomNumber: string;
  floor: number;
  roomTypeId: number;
  basePrice: number;
  capacity: {
    adults: number;
    children: number;
  };
  amenities?: RoomAmenity[];
  features?: RoomFeature[];
  notes?: string;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  floor?: number;
  roomTypeId?: number;
  status?: RoomStatus;
  availability?: RoomAvailability;
  condition?: RoomCondition;
  view?: RoomView;
  basePrice?: number;
  discountPrice?: number;
  capacity?: {
    adults?: number;
    children?: number;
  };
  amenities?: RoomAmenity[];
  features?: RoomFeature[];
  notes?: string;
  isActive?: boolean;
}

export interface CreateHousekeepingTaskPayload {
  roomNumber: string;
  taskType: HousekeepingTaskType;
  priority: HousekeepingPriority;
  description: string;
  estimatedDuration: number;
  assignedTo?: number;
  scheduledDate?: Date;
  notes?: string;
}

export interface UpdateHousekeepingTaskPayload {
  taskType?: HousekeepingTaskType;
  priority?: HousekeepingPriority;
  status?: HousekeepingStatus;
  assignedTo?: number;
  description?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  checklist?: HousekeepingChecklistItem[];
}

export interface CreateMaintenanceRequestPayload {
  roomNumber?: string;
  facilityId?: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  title: string;
  description: string;
  reportedBy: number;
  estimatedCost?: number;
  scheduledDate?: Date;
}

export interface UpdateMaintenanceRequestPayload {
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  title?: string;
  description?: string;
  assignedTo?: number;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
}
