
// Basic type definitions - TODO: Move to dedicated type files
interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
}

interface HousekeepingTask {
  id: string;
  roomId: string;
  type: string;
  status: string;
}

interface ServiceRequest {
  id: string;
  type: string;
  description: string;
  status: string;
}

/**
 * Hotel Operations Service
 * Service layer for hotel operations API interactions
 */

import type { HousekeepingTask } from '../types/common.types';
import type { Room } from '../types/common.types';
import {
  CreateHousekeepingTaskPayload,
  CreateMaintenanceRequestPayload,
  CreateRoomPayload,
  FacilitiesResponse,
  Facility,
  FacilityFilters,
  HotelOperationsAnalytics,
  HousekeepingFilters,
  HousekeepingResponse,
  HousekeepingTask,
  InventoryFilters,
  InventoryItem,
  InventoryResponse,
  MaintenanceFilters,
  MaintenanceRequest,
  MaintenanceResponse,
  Room,
  RoomFilters,
  RoomsResponse,
  RoomType,
} from "../types/hotelOperations.types";

// ========================================
// API Configuration
// ========================================

const API_BASE = "/api";

// Auth helpers
const getAuthHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("staff_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("staff_token");
    window.location.href = "/login";
    throw new Error("Unauthorized access");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
};

// ========================================
// Hotel Operations Service
// ========================================

export class HotelOperationsService {
  // ========================================
  // Room Management Operations
  // ========================================

  /**
   * Get all rooms with optional filtering
   */
  async getRooms(filters?: RoomFilters): Promise<RoomsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.roomType) {
        params.append("roomType", filters.roomType);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.availability) {
        params.append("availability", filters.availability);
      }
      if (filters.floor !== undefined) {
        params.append("floor", filters.floor.toString());
      }
      if (filters.minPrice !== undefined) {
        params.append("minPrice", filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params.append("maxPrice", filters.maxPrice.toString());
      }
      if (filters.amenities?.length) {
        params.append("amenities", filters.amenities.join(","));
      }
      if (filters.features?.length) {
        params.append("features", filters.features.join(","));
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/rooms${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    // Handle case where API returns array directly (backward compatibility)
    const data = await handleApiResponse<Room[] | RoomsResponse>(response);

    if (Array.isArray(data)) {
      // Legacy API response format
      return {
        rooms: data,
        totalCount: data.length,
        availableCount: data.filter((r) => r.status === "available").length,
        occupiedCount: data.filter((r) => r.status === "occupied").length,
        maintenanceCount: data.filter((r) => r.status === "maintenance").length,
      };
    }

    return data;
  }

  /**
   * Get a single room by ID
   */
  async getRoomById(roomId: number): Promise<Room> {
    const response = await fetch(`${API_BASE}/hotel/rooms/${roomId}`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<Room>(response);
  }

  /**
   * Create a new room
   */
  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    const response = await fetch(`${API_BASE}/hotel/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        id: this.generateRoomId(),
        status: "available",
        availability: "ready",
        condition: "excellent",
        currentPrice: payload.basePrice,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<Room>(response);
  }

  /**
   * Update an existing room
   */
  async updateRoom(roomId: number, updates: Partial<any>): Promise<Room> { // TODO: Fix Room type definition
    updates.updatedAt = new Date().toISOString();

    const response = await fetch(`${API_BASE}/hotel/rooms/${roomId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    return handleApiResponse<Room>(response);
  }

  /**
   * Update room status
   */
  async updateRoomStatus(roomId: number, status: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/hotel/rooms/${roomId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<Room>(response);
  }

  /**
   * Get room types
   */
  async getRoomTypes(): Promise<RoomType[]> {
    const response = await fetch(`${API_BASE}/hotel/room-types`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<RoomType[]>(response);
  }

  /**
   * Check room availability for dates
   */
  async checkRoomAvailability(
    roomId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
    });

    const response = await fetch(
      `${API_BASE}/hotel/rooms/${roomId}/availability?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      },
    );

    const result = await handleApiResponse<{ available: boolean }>(response);
    return result.available;
  }

  // ========================================
  // Housekeeping Operations
  // ========================================

  /**
   * Get housekeeping tasks with optional filtering
   */
  async getHousekeepingTasks(
    filters?: HousekeepingFilters,
  ): Promise<HousekeepingResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.taskType) {
        params.append("taskType", filters.taskType);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.priority) {
        params.append("priority", filters.priority);
      }
      if (filters.assignedTo) {
        params.append("assignedTo", filters.assignedTo.toString());
      }
      if (filters.floor !== undefined) {
        params.append("floor", filters.floor.toString());
      }
      if (filters.scheduledDate) {
        params.append("scheduledDate", filters.scheduledDate);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/housekeeping/tasks${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<HousekeepingResponse>(response);
  }

  /**
   * Create a new housekeeping task
   */
  async createHousekeepingTask(
    payload: CreateHousekeepingTaskPayload,
  ): Promise<HousekeepingTask> {
    const response = await fetch(`${API_BASE}/hotel/housekeeping/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        id: this.generateTaskId(),
        status: payload.assignedTo ? "assigned" : "pending",
        checklistItems: this.generateChecklistItems(payload.taskType),
        issuesFound: [],
        maintenanceRequired: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<HousekeepingTask>(response);
  }

  /**
   * Update a housekeeping task
   */
  async updateHousekeepingTask(
    taskId: string,
    updates: Partial<any> ) // TODO: Fix HousekeepingTask type definition,
  : Promise<HousekeepingTask> {
    updates.updatedAt = new Date().toISOString();

    // Auto-update status based on progress
    if (updates.completedAt && !updates.status) {
      updates.status = "completed";
    }

    const response = await fetch(
      `${API_BASE}/hotel/housekeeping/tasks/${taskId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      },
    );

    return handleApiResponse<HousekeepingTask>(response);
  }

  /**
   * Assign housekeeping task to staff
   */
  async assignHousekeepingTask(
    taskId: string,
    staffId: number,
  ): Promise<HousekeepingTask> {
    const response = await fetch(
      `${API_BASE}/hotel/housekeeping/tasks/${taskId}/assign`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assignedTo: staffId,
          assignedAt: new Date().toISOString(),
          status: "assigned",
        }),
      },
    );

    return handleApiResponse<HousekeepingTask>(response);
  }

  /**
   * Complete housekeeping task
   */
  async completeHousekeepingTask(
    taskId: string,
    notes?: string,
  ): Promise<HousekeepingTask> {
    const response = await fetch(
      `${API_BASE}/hotel/housekeeping/tasks/${taskId}/complete`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: "completed",
          completedAt: new Date().toISOString(),
          notes: notes || "",
        }),
      },
    );

    return handleApiResponse<HousekeepingTask>(response);
  }

  // ========================================
  // Maintenance Operations
  // ========================================

  /**
   * Get maintenance requests with optional filtering
   */
  async getMaintenanceRequests(
    filters?: MaintenanceFilters,
  ): Promise<MaintenanceResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.priority) {
        params.append("priority", filters.priority);
      }
      if (filters.assignedTo) {
        params.append("assignedTo", filters.assignedTo.toString());
      }
      if (filters.reportedBy) {
        params.append("reportedBy", filters.reportedBy.toString());
      }
      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/maintenance/requests${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<MaintenanceResponse>(response);
  }

  /**
   * Create a new maintenance request
   */
  async createMaintenanceRequest(
    payload: CreateMaintenanceRequestPayload,
  ): Promise<MaintenanceRequest> {
    const response = await fetch(`${API_BASE}/hotel/maintenance/requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        id: this.generateMaintenanceId(),
        status: "reported",
        partsUsed: [],
        followUpRequired: false,
        beforeImages: [],
        afterImages: [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<MaintenanceRequest>(response);
  }

  /**
   * Update a maintenance request
   */
  async updateMaintenanceRequest(
    requestId: string,
    updates: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> {
    updates.updatedAt = new Date().toISOString();

    const response = await fetch(
      `${API_BASE}/hotel/maintenance/requests/${requestId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      },
    );

    return handleApiResponse<MaintenanceRequest>(response);
  }

  /**
   * Assign maintenance request to staff
   */
  async assignMaintenanceRequest(
    requestId: string,
    staffId: number,
  ): Promise<MaintenanceRequest> {
    const response = await fetch(
      `${API_BASE}/hotel/maintenance/requests/${requestId}/assign`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assignedTo: staffId,
          assignedAt: new Date().toISOString(),
          status: "assigned",
        }),
      },
    );

    return handleApiResponse<MaintenanceRequest>(response);
  }

  // ========================================
  // Facility Management Operations
  // ========================================

  /**
   * Get facilities with optional filtering
   */
  async getFacilities(filters?: FacilityFilters): Promise<FacilitiesResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) {
        params.append("type", filters.type);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.floor !== undefined) {
        params.append("floor", filters.floor.toString());
      }
      if (filters.accessLevel) {
        params.append("accessLevel", filters.accessLevel);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/facilities${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<FacilitiesResponse>(response);
  }

  /**
   * Update facility status
   */
  async updateFacilityStatus(
    facilityId: string,
    status: string,
  ): Promise<Facility> {
    const response = await fetch(
      `${API_BASE}/hotel/facilities/${facilityId}/status`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          updatedAt: new Date().toISOString(),
        }),
      },
    );

    return handleApiResponse<Facility>(response);
  }

  // ========================================
  // Inventory Management Operations
  // ========================================

  /**
   * Get inventory items with optional filtering
   */
  async getInventoryItems(
    filters?: InventoryFilters,
  ): Promise<InventoryResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.type) {
        params.append("type", filters.type);
      }
      if (filters.lowStock) {
        params.append("lowStock", filters.lowStock.toString());
      }
      if (filters.nearExpiry) {
        params.append("nearExpiry", filters.nearExpiry.toString());
      }
      if (filters.supplier) {
        params.append("supplier", filters.supplier);
      }
      if (filters.location) {
        params.append("location", filters.location);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/inventory/items${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<InventoryResponse>(response);
  }

  /**
   * Update inventory stock
   */
  async updateInventoryStock(
    itemId: string,
    quantity: number,
    type: "add" | "subtract" | "set",
  ): Promise<InventoryItem> {
    const response = await fetch(
      `${API_BASE}/hotel/inventory/items/${itemId}/stock`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quantity,
          type,
          updatedAt: new Date().toISOString(),
        }),
      },
    );

    return handleApiResponse<InventoryItem>(response);
  }

  // ========================================
  // Analytics Operations
  // ========================================

  /**
   * Get hotel operations analytics
   */
  async getAnalytics(period?: string): Promise<HotelOperationsAnalytics> {
    const params = new URLSearchParams();
    if (period) {
      params.append("period", period);
    }

    const queryString = params.toString();
    const url = `${API_BASE}/hotel/analytics${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<HotelOperationsAnalytics>(response);
  }

  // ========================================
  // Real-time Operations
  // ========================================

  /**
   * Subscribe to real-time hotel operations updates
   */
  subscribeToUpdates(onUpdate: (event: any) => void): () => void {
    // Set up WebSocket connection for real-time updates
    const token =
      localStorage.getItem("token") || localStorage.getItem("staff_token");
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/hotel-operations?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Return cleanup function
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      return () => {}; // No-op cleanup
    }
  }

  // ========================================
  // Bulk Operations
  // ========================================

  /**
   * Bulk update room statuses
   */
  async bulkUpdateRoomStatus(
    roomIds: number[],
    status: string,
  ): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/hotel/rooms/bulk-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        roomIds,
        status,
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<Room[]>(response);
  }

  /**
   * Bulk assign housekeeping tasks
   */
  async bulkAssignTasks(
    taskIds: string[],
    staffId: number,
  ): Promise<HousekeepingTask[]> {
    const response = await fetch(
      `${API_BASE}/hotel/housekeeping/tasks/bulk-assign`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          taskIds,
          staffId,
          assignedAt: new Date().toISOString(),
        }),
      },
    );

    return handleApiResponse<HousekeepingTask[]>(response);
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Generate unique room ID
   */
  private generateRoomId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    const prefix = "HK";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate unique maintenance ID
   */
  private generateMaintenanceId(): string {
    const prefix = "MNT";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate default checklist items based on task type
   */
  private generateChecklistItems(taskType: string): any[] {
    const baseItems = [
      {
        id: "check-1",
        description: "Dọn dẹp phòng tắm",
        category: "bathroom",
        isRequired: true,
        isCompleted: false,
      },
      {
        id: "check-2",
        description: "Thay ga giường",
        category: "bedroom",
        isRequired: true,
        isCompleted: false,
      },
      {
        id: "check-3",
        description: "Hút bụi thảm",
        category: "bedroom",
        isRequired: true,
        isCompleted: false,
      },
      {
        id: "check-4",
        description: "Lau dọn bàn ghế",
        category: "living-area",
        isRequired: true,
        isCompleted: false,
      },
      {
        id: "check-5",
        description: "Kiểm tra tiện nghi",
        category: "amenities",
        isRequired: true,
        isCompleted: false,
      },
      {
        id: "check-6",
        description: "Bổ sung vật tư",
        category: "supplies",
        isRequired: true,
        isCompleted: false,
      },
    ];

    if (taskType === "deep-cleaning") {
      baseItems.push(
        {
          id: "deep-1",
          description: "Lau dọn tủ lạnh",
          category: "kitchen",
          isRequired: true,
          isCompleted: false,
        },
        {
          id: "deep-2",
          description: "Vệ sinh cửa sổ",
          category: "living-area",
          isRequired: true,
          isCompleted: false,
        },
        {
          id: "deep-3",
          description: "Kiểm tra thiết bị",
          category: "maintenance",
          isRequired: true,
          isCompleted: false,
        },
      );
    }

    return baseItems;
  }

  // ========================================
  // Export/Import Operations
  // ========================================

  /**
   * Export hotel operations data
   */
  async exportData(
    type: "rooms" | "housekeeping" | "maintenance" | "inventory",
    format: "csv" | "excel" = "csv",
  ): Promise<Blob> {
    const params = new URLSearchParams({
      type,
      format,
    });

    const response = await fetch(
      `${API_BASE}/hotel/export?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    return response.blob();
  }

  // ========================================
  // Floor Plan Operations
  // ========================================

  /**
   * Get floor plan data
   */
  async getFloorPlan(floor: number): Promise<any> {
    const response = await fetch(`${API_BASE}/hotel/floor-plan/${floor}`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<any>(response);
  }

  /**
   * Update floor plan layout
   */
  async updateFloorPlan(floor: number, layout: any): Promise<any> {
    const response = await fetch(`${API_BASE}/hotel/floor-plan/${floor}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(layout),
    });

    return handleApiResponse<any>(response);
  }
}

// ========================================
// Service Instance Export
// ========================================

export const hotelOperationsService = new HotelOperationsService();
