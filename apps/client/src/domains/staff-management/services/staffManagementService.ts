/**
 * Staff Management Service
 * Service layer for staff management API interactions
 */

// import type { Permission } from '@shared/types';
import {
  CreateStaffPayload,
  CreateTaskPayload,
  ScheduleStaffPayload,
  StaffAnalytics,
  StaffMember,
  StaffResponse,
  StaffSchedule,
  StaffSearchParams,
  StaffTask,
  WorkShift,
} from "../types/staffManagement.types";

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
// Staff Management Service
// ========================================

export class StaffManagementService {
  // ========================================
  // Staff CRUD Operations
  // ========================================

  /**
   * Get all staff with optional filtering and pagination
   */
  async getStaff(
    searchParams?: Partial<StaffSearchParams>,
  ): Promise<StaffResponse> {
    const params = new URLSearchParams();

    if (searchParams?.filters) {
      const { filters } = searchParams;
      if (filters.department) {
        params.append("department", filters.department);
      }
      if (filters.role) {
        params.append("role", filters.role);
      }
      if (filters.employmentStatus) {
        params.append("employmentStatus", filters.employmentStatus);
      }
      if (filters.isOnDuty !== undefined) {
        params.append("isOnDuty", filters.isOnDuty.toString());
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
      if (filters.skills?.length) {
        params.append("skills", filters.skills.join(","));
      }
    }

    if (searchParams?.sortBy) {
      params.append("sortBy", searchParams.sortBy);
    }
    if (searchParams?.sortOrder) {
      params.append("sortOrder", searchParams.sortOrder);
    }
    if (searchParams?.page) {
      params.append("page", searchParams.page.toString());
    }
    if (searchParams?.limit) {
      params.append("limit", searchParams.limit.toString());
    }

    const queryString = params.toString();
    const url = `${API_BASE}/staff${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    // Handle case where API returns array directly (backward compatibility)
    const data = await handleApiResponse<StaffMember[] | StaffResponse>(
      response,
    );

    if (Array.isArray(data)) {
      // Legacy API response format
      return {
        staff: data,
        totalCount: data.length,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    return data;
  }

  /**
   * Get a single staff member by ID
   */
  async getStaffById(staffId: number): Promise<StaffMember> {
    const response = await fetch(`${API_BASE}/staff/${staffId}`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffMember>(response);
  }

  /**
   * Create a new staff member
   */
  async createStaff(payload: CreateStaffPayload): Promise<StaffMember> {
    const response = await fetch(`${API_BASE}/staff`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        fullName: `${payload.firstName} ${payload.lastName}`,
        employeeId: this.generateEmployeeId(),
        employmentStatus: "probation",
        isOnDuty: false,
        currentWorkload: 0,
        tasksAssigned: 0,
        tasksCompleted: 0,
        averageRating: 0,
        isActive: true,
      }),
    });

    return handleApiResponse<StaffMember>(response);
  }

  /**
   * Update an existing staff member
   */
  async updateStaff(
    staffId: number,
    updates: Partial<StaffMember>,
  ): Promise<StaffMember> {
    // Update fullName if firstName or lastName changed
    if (updates.firstName || updates.lastName) {
      const currentStaff = await this.getStaffById(staffId);
      const firstName = updates.firstName || currentStaff.firstName;
      const lastName = updates.lastName || currentStaff.lastName;
      updates.fullName = `${firstName} ${lastName}`;
    }

    const response = await fetch(`${API_BASE}/staff/${staffId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    return handleApiResponse<StaffMember>(response);
  }

  /**
   * Deactivate a staff member
   */
  async deactivateStaff(staffId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/staff/${staffId}/deactivate`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to deactivate staff member");
    }
  }

  /**
   * Get staff availability for task assignment
   */
  async getStaffAvailability(): Promise<StaffMember[]> {
    const response = await fetch(`${API_BASE}/staff/availability`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffMember[]>(response);
  }

  // ========================================
  // Task Management Operations
  // ========================================

  /**
   * Get tasks with optional filtering
   */
  async getTasks(filters?: Partial<StaffTask>): Promise<StaffTask[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = `${API_BASE}/staff/tasks${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffTask[]>(response);
  }

  /**
   * Get tasks assigned to a specific staff member
   */
  async getTasksByStaff(staffId: number): Promise<StaffTask[]> {
    const response = await fetch(`${API_BASE}/staff/${staffId}/tasks`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffTask[]>(response);
  }

  /**
   * Create a new task
   */
  async createTask(payload: CreateTaskPayload): Promise<StaffTask> {
    const response = await fetch(`${API_BASE}/staff/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        id: this.generateTaskId(),
        status: "assigned",
        progress: 0,
        assignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return handleApiResponse<StaffTask>(response);
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: Partial<StaffTask>,
  ): Promise<StaffTask> {
    // Auto-update status based on progress
    if (updates.progress !== undefined) {
      if (updates.progress === 0) {
        updates.status = "assigned";
      } else if (updates.progress > 0 && updates.progress < 100) {
        updates.status = "in-progress";
        if (!updates.startedAt) {
          updates.startedAt = new Date().toISOString();
        }
      } else if (updates.progress === 100) {
        updates.status = "completed";
        updates.completedAt = new Date().toISOString();
      }
    }

    updates.updatedAt = new Date().toISOString();

    const response = await fetch(`${API_BASE}/staff/tasks/${taskId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    return handleApiResponse<StaffTask>(response);
  }

  /**
   * Assign task to staff member
   */
  async assignTask(taskId: string, staffId: number): Promise<StaffTask> {
    const response = await fetch(`${API_BASE}/staff/tasks/${taskId}/assign`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        assignedTo: staffId,
        assignedAt: new Date().toISOString(),
        status: "assigned",
      }),
    });

    return handleApiResponse<StaffTask>(response);
  }

  /**
   * Get task assignment suggestions based on staff availability and skills
   */
  async getTaskAssignmentSuggestions(taskId: string): Promise<StaffMember[]> {
    const response = await fetch(
      `${API_BASE}/staff/tasks/${taskId}/suggestions`,
      {
        headers: getAuthHeaders(),
      },
    );

    return handleApiResponse<StaffMember[]>(response);
  }

  // ========================================
  // Schedule Management Operations
  // ========================================

  /**
   * Get staff schedules for a date range
   */
  async getSchedules(
    startDate?: string,
    endDate?: string,
  ): Promise<StaffSchedule[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = `${API_BASE}/staff/schedules${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffSchedule[]>(response);
  }

  /**
   * Create a new schedule entry
   */
  async createSchedule(payload: ScheduleStaffPayload): Promise<StaffSchedule> {
    const response = await fetch(`${API_BASE}/staff/schedules`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        id: this.generateScheduleId(),
        status: "scheduled",
      }),
    });

    return handleApiResponse<StaffSchedule>(response);
  }

  /**
   * Update schedule entry
   */
  async updateSchedule(
    scheduleId: string,
    updates: Partial<StaffSchedule>,
  ): Promise<StaffSchedule> {
    const response = await fetch(`${API_BASE}/staff/schedules/${scheduleId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    return handleApiResponse<StaffSchedule>(response);
  }

  /**
   * Get available shifts
   */
  async getShifts(): Promise<WorkShift[]> {
    const response = await fetch(`${API_BASE}/staff/shifts`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<WorkShift[]>(response);
  }

  // ========================================
  // Attendance Operations
  // ========================================

  /**
   * Staff check-in
   */
  async checkIn(
    staffId: number,
  ): Promise<{ staffId: number; checkInTime: string }> {
    const checkInTime = new Date().toISOString();

    const response = await fetch(`${API_BASE}/staff/${staffId}/check-in`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ checkInTime }),
    });

    await handleApiResponse(response);

    return { staffId, checkInTime };
  }

  /**
   * Staff check-out
   */
  async checkOut(
    staffId: number,
  ): Promise<{ staffId: number; checkOutTime: string }> {
    const checkOutTime = new Date().toISOString();

    const response = await fetch(`${API_BASE}/staff/${staffId}/check-out`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ checkOutTime }),
    });

    await handleApiResponse(response);

    return { staffId, checkOutTime };
  }

  // ========================================
  // Analytics & Reporting Operations
  // ========================================

  /**
   * Get staff analytics and metrics
   */
  async getStaffAnalytics(): Promise<StaffAnalytics> {
    const response = await fetch(`${API_BASE}/staff/analytics`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<StaffAnalytics>(response);
  }

  /**
   * Get staff performance data
   */
  async getStaffPerformance(staffId: number, period?: string): Promise<any> {
    const params = new URLSearchParams();
    if (period) params.append("period", period);

    const queryString = params.toString();
    const url = `${API_BASE}/staff/${staffId}/performance${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  }

  /**
   * Get department summary
   */
  async getDepartmentSummary(department?: string): Promise<any> {
    const params = new URLSearchParams();
    if (department) params.append("department", department);

    const queryString = params.toString();
    const url = `${API_BASE}/staff/departments/summary${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  }

  // ========================================
  // Role & Permission Operations
  // ========================================

  /**
   * Get role definitions
   */
  async getRoleDefinitions(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/staff/roles`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<any[]>(response);
  }

  /**
   * Update staff permissions
   */
  async updateStaffPermissions(
    staffId: number,
    permissions: string[],
  ): Promise<StaffMember> {
    const response = await fetch(`${API_BASE}/staff/${staffId}/permissions`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });

    return handleApiResponse<StaffMember>(response);
  }

  // ========================================
  // Real-time Operations
  // ========================================

  /**
   * Subscribe to real-time staff updates
   */
  subscribeToUpdates(onUpdate: (event: any) => void): () => void {
    // Set up WebSocket connection for real-time updates
    const token =
      localStorage.getItem("token") || localStorage.getItem("staff_token");
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/staff?token=${token}`;

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
  // Utility Methods
  // ========================================

  /**
   * Generate unique employee ID
   */
  private generateEmployeeId(): string {
    const prefix = "EMP";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    const prefix = "TASK";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate unique schedule ID
   */
  private generateScheduleId(): string {
    const prefix = "SCH";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // ========================================
  // Bulk Operations
  // ========================================

  /**
   * Bulk update staff information
   */
  async bulkUpdateStaff(
    updates: Array<{ staffId: number; updates: Partial<StaffMember> }>,
  ): Promise<StaffMember[]> {
    const response = await fetch(`${API_BASE}/staff/bulk-update`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates }),
    });

    return handleApiResponse<StaffMember[]>(response);
  }

  /**
   * Bulk assign tasks
   */
  async bulkAssignTasks(
    assignments: Array<{ taskId: string; staffId: number }>,
  ): Promise<StaffTask[]> {
    const response = await fetch(`${API_BASE}/staff/tasks/bulk-assign`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ assignments }),
    });

    return handleApiResponse<StaffTask[]>(response);
  }

  /**
   * Export staff data
   */
  async exportStaffData(
    format: "csv" | "excel" = "csv",
    filters?: any,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append("format", format);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE}/staff/export?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to export staff data");
    }

    return response.blob();
  }
}

// ========================================
// Service Instance Export
// ========================================

export const staffManagementService = new StaffManagementService();
