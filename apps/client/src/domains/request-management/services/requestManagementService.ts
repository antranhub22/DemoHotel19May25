/**
 * Request Management Service
 * Service layer for request management API interactions
 */

import {
  CreateRequestPayload,
  CustomerRequest,
  MessageAttachment,
  RequestMessage,
  RequestMetrics,
  RequestSearchParams,
  RequestsResponse,
  RequestUpdateData,
} from "../types/requestManagement.types";

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
// Request Management Service
// ========================================

export class RequestManagementService {
  // ========================================
  // Request CRUD Operations
  // ========================================

  /**
   * Get all requests with optional filtering and pagination
   */
  async getRequests(
    searchParams?: Partial<RequestSearchParams>,
  ): Promise<RequestsResponse> {
    const params = new URLSearchParams();

    if (searchParams?.filters) {
      const { filters } = searchParams;
      if (filters.status && filters.status !== "Tất cả") {
        params.append("status", filters.status);
      }
      if (filters.priority) {
        params.append("priority", filters.priority);
      }
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.assignedTo) {
        params.append("assignedTo", filters.assignedTo);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (filters.searchQuery) {
        params.append("search", filters.searchQuery);
      }
      if (filters.roomNumber) {
        params.append("roomNumber", filters.roomNumber);
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
    const url = `${API_BASE}/staff/requests${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    // Handle case where API returns array directly (backward compatibility)
    const data = await handleApiResponse<CustomerRequest[] | RequestsResponse>(
      response,
    );

    if (Array.isArray(data)) {
      // Legacy API response format
      return {
        requests: data,
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
   * Get a single request by ID
   */
  async getRequestById(requestId: number): Promise<CustomerRequest> {
    const response = await fetch(`${API_BASE}/staff/requests/${requestId}`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<CustomerRequest>(response);
  }

  /**
   * Create a new request
   */
  async createRequest(payload: CreateRequestPayload): Promise<CustomerRequest> {
    const response = await fetch(`${API_BASE}/request`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return handleApiResponse<CustomerRequest>(response);
  }

  /**
   * Update an existing request
   */
  async updateRequest(
    requestId: number,
    updates: RequestUpdateData,
  ): Promise<CustomerRequest> {
    const response = await fetch(`${API_BASE}/request/${requestId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    return handleApiResponse<CustomerRequest>(response);
  }

  /**
   * Delete a request (requires password)
   */
  async deleteRequest(requestId: number, password: string): Promise<void> {
    const response = await fetch(`${API_BASE}/request/${requestId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized access");
    }

    if (response.status === 403) {
      throw new Error("Sai mật khẩu");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(errorData.message || "Failed to delete request");
    }
  }

  // ========================================
  // Message Operations
  // ========================================

  /**
   * Get messages for a specific request
   */
  async getRequestMessages(requestId: number): Promise<RequestMessage[]> {
    const response = await fetch(`${API_BASE}/request/${requestId}/messages`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<RequestMessage[]>(response);
  }

  /**
   * Send a message for a request
   */
  async sendMessage(
    requestId: number,
    content: string,
    attachments?: MessageAttachment[],
  ): Promise<RequestMessage> {
    const response = await fetch(`${API_BASE}/request/${requestId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content,
        attachments: attachments || [],
      }),
    });

    return handleApiResponse<RequestMessage>(response);
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(requestId: number, messageId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/request/${requestId}/messages/${messageId}/read`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to mark message as read");
    }
  }

  // ========================================
  // Staff Assignment Operations
  // ========================================

  /**
   * Assign request to staff member
   */
  async assignRequest(
    requestId: number,
    staffId: number,
    notes?: string,
  ): Promise<CustomerRequest> {
    const response = await fetch(`${API_BASE}/request/${requestId}/assign`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        staffId,
        notes: notes || "",
      }),
    });

    return handleApiResponse<CustomerRequest>(response);
  }

  /**
   * Unassign request from staff member
   */
  async unassignRequest(requestId: number): Promise<CustomerRequest> {
    const response = await fetch(`${API_BASE}/request/${requestId}/unassign`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    return handleApiResponse<CustomerRequest>(response);
  }

  // ========================================
  // Analytics & Metrics
  // ========================================

  /**
   * Get request metrics and analytics
   */
  async getRequestMetrics(): Promise<RequestMetrics> {
    const response = await fetch(`${API_BASE}/staff/requests/metrics`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<RequestMetrics>(response);
  }

  // ========================================
  // Batch Operations
  // ========================================

  /**
   * Bulk update multiple requests
   */
  async bulkUpdateRequests(
    requestIds: number[],
    updates: RequestUpdateData,
  ): Promise<CustomerRequest[]> {
    const response = await fetch(`${API_BASE}/request/bulk-update`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        requestIds,
        updates,
      }),
    });

    return handleApiResponse<CustomerRequest[]>(response);
  }

  /**
   * Export requests to CSV/Excel
   */
  async exportRequests(
    format: "csv" | "excel" = "csv",
    filters?: Partial<RequestSearchParams>,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append("format", format);

    if (filters?.filters) {
      const { filters: filterData } = filters;
      Object.entries(filterData).forEach(([key, value]) => {
        if (value && value !== "Tất cả") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE}/staff/requests/export?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to export requests");
    }

    return response.blob();
  }

  // ========================================
  // Real-time Operations
  // ========================================

  /**
   * Subscribe to real-time request updates
   */
  subscribeToUpdates(onUpdate: (event: any) => void): () => void {
    // Set up WebSocket connection for real-time updates
    const token =
      localStorage.getItem("token") || localStorage.getItem("staff_token");
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/requests?token=${token}`;

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
  // Legacy API Compatibility
  // ========================================

  /**
   * Legacy API call for backward compatibility
   */
  async getLegacyRequests(): Promise<CustomerRequest[]> {
    const response = await fetch(`${API_BASE}/request`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<CustomerRequest[]>(response);
  }
}

// ========================================
// Service Instance Export
// ========================================

export const requestManagementService = new RequestManagementService();
