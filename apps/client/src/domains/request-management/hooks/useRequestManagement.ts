/**
 * Request Management Custom Hook
 * Main hook for request management functionality
 */

import { useAppDispatch, useAppSelector } from "@/store";
import { useCallback, useEffect } from "react";
import { requestManagementService } from "../services/requestManagementService";
import {
  addMessage,
  addRequestUpdate,
  clearError,
  createRequest,
  deleteRequest,
  fetchRequestById,
  fetchRequestMessages,
  fetchRequestMetrics,
  fetchRequests,
  markMessageAsRead,
  optimisticUpdateRequest,
  processPendingUpdates,
  resetFilters,
  selectError,
  selectFilters,
  selectIsLoading,
  selectMessages,
  selectMetrics,
  selectRequestManagement,
  selectRequests,
  selectSelectedRequest,
  sendMessage,
  setFilters,
  setSearchParams,
  setSelectedRequest,
  setSelectedTab,
  setViewMode,
  toggleFilters,
  updateRequest,
} from "../store/requestManagementSlice";
import {
  CreateRequestPayload,
  CustomerRequest,
  RequestFilters,
  RequestSearchParams,
  RequestUpdateEvent,
  SendMessagePayload,
} from "../types/requestManagement.types";

// ========================================
// Main Request Management Hook
// ========================================

export const useRequestManagement = () => {
  console.log(
    "🔍 [DEBUG] useRequestManagement defined:",
    typeof useRequestManagement,
  );

  const dispatch = useAppDispatch();

  // Selectors
  const requestManagement = useAppSelector(selectRequestManagement);
  const requests = useAppSelector(selectRequests);
  const selectedRequest = useAppSelector(selectSelectedRequest);
  const filters = useAppSelector(selectFilters);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const metrics = useAppSelector(selectMetrics);

  // ========================================
  // Request Operations
  // ========================================

  const loadRequests = useCallback(
    (searchParams?: Partial<RequestSearchParams>) => {
      return dispatch(fetchRequests(searchParams));
    },
    [dispatch],
  );

  const loadRequestById = useCallback(
    (requestId: number) => {
      return dispatch(fetchRequestById(requestId));
    },
    [dispatch],
  );

  const createNewRequest = useCallback(
    (payload: CreateRequestPayload) => {
      return dispatch(createRequest(payload));
    },
    [dispatch],
  );

  const updateExistingRequest = useCallback(
    (requestId: number, updates: Partial<CustomerRequest>) => {
      // Optimistic update first
      dispatch(optimisticUpdateRequest({ id: requestId, updates }));

      // Then dispatch actual update
      return dispatch(updateRequest({ requestId, updates }));
    },
    [dispatch],
  );

  const removeRequest = useCallback(
    (requestId: number, password: string) => {
      return dispatch(deleteRequest({ requestId, password }));
    },
    [dispatch],
  );

  // ========================================
  // Filter & Search Operations
  // ========================================

  const updateFilters = useCallback(
    (newFilters: Partial<RequestFilters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch],
  );

  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const updateSearchParams = useCallback(
    (params: Partial<RequestSearchParams>) => {
      dispatch(setSearchParams(params));
    },
    [dispatch],
  );

  // ========================================
  // UI State Operations
  // ========================================

  const selectRequest = useCallback(
    (request: CustomerRequest | null) => {
      dispatch(setSelectedRequest(request));
    },
    [dispatch],
  );

  const changeTab = useCallback(
    (tab: "all" | "pending" | "assigned" | "completed") => {
      dispatch(setSelectedTab(tab));
    },
    [dispatch],
  );

  const changeViewMode = useCallback(
    (mode: "list" | "grid" | "kanban") => {
      dispatch(setViewMode(mode));
    },
    [dispatch],
  );

  const toggleFilterPanel = useCallback(() => {
    dispatch(toggleFilters());
  }, [dispatch]);

  // ========================================
  // Error Handling
  // ========================================

  const clearCurrentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ========================================
  // Real-time Updates
  // ========================================

  const handleRealtimeUpdate = useCallback(
    (event: RequestUpdateEvent) => {
      dispatch(addRequestUpdate(event));
    },
    [dispatch],
  );

  const processUpdates = useCallback(() => {
    dispatch(processPendingUpdates());
  }, [dispatch]);

  // ========================================
  // Metrics Operations
  // ========================================

  const loadMetrics = useCallback(() => {
    return dispatch(fetchRequestMetrics());
  }, [dispatch]);

  // ========================================
  // Auto-refresh functionality
  // ========================================

  const setupAutoRefresh = useCallback(
    (intervalMs: number = 30000) => {
      const interval = setInterval(() => {
        dispatch(fetchRequests(requestManagement.searchParams));
      }, intervalMs);

      return () => clearInterval(interval);
    },
    [dispatch, requestManagement.searchParams],
  );

  // ========================================
  // Computed Values
  // ========================================

  const filteredRequests = requests.filter((request) => {
    // Apply current filters
    if (filters.status !== "Tất cả" && request.status !== filters.status) {
      return false;
    }

    if (filters.priority && request.priority !== filters.priority) {
      return false;
    }

    if (filters.category && request.category !== filters.category) {
      return false;
    }

    if (filters.assignedTo && request.assignedTo !== filters.assignedTo) {
      return false;
    }

    if (filters.roomNumber && request.roomNumber !== filters.roomNumber) {
      return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableFields = [
        request.guestName,
        request.requestContent,
        request.roomNumber,
        request.orderId,
      ];

      if (
        !searchableFields.some((field) => field.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (filters.startDate) {
      const requestDate = new Date(request.createdAt);
      const startDate = new Date(filters.startDate);
      if (requestDate < startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const requestDate = new Date(request.createdAt);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      if (requestDate > endDate) {
        return false;
      }
    }

    return true;
  });

  const requestsByStatus = {
    all: filteredRequests,
    pending: filteredRequests.filter(
      (r) => r.status === "Đã ghi nhận" || r.status === "Đang xử lý",
    ),
    assigned: filteredRequests.filter((r) => r.assignedTo),
    completed: filteredRequests.filter((r) => r.status === "Hoàn thành"),
  };

  const requestCounts = {
    all: requestsByStatus.all.length,
    pending: requestsByStatus.pending.length,
    assigned: requestsByStatus.assigned.length,
    completed: requestsByStatus.completed.length,
  };

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    // State
    requests: filteredRequests,
    requestsByStatus,
    requestCounts,
    selectedRequest,
    filters,
    isLoading,
    error,
    metrics,

    // Full state access
    requestManagement,

    // Operations
    loadRequests,
    loadRequestById,
    createNewRequest,
    updateExistingRequest,
    removeRequest,

    // Filters & Search
    updateFilters,
    clearFilters,
    updateSearchParams,

    // UI State
    selectRequest,
    changeTab,
    changeViewMode,
    toggleFilterPanel,

    // Error handling
    clearCurrentError,

    // Real-time
    handleRealtimeUpdate,
    processUpdates,

    // Metrics
    loadMetrics,

    // Utilities
    setupAutoRefresh,
  };
};

// ========================================
// Specialized Hooks
// ========================================

/**
 * Hook for managing messages within a request
 */
export const useRequestMessages = (requestId: number) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages(requestId));
  const messageLoading = useAppSelector(
    (state) => state.requestManagement.messageLoading,
  );
  const isSending = useAppSelector(
    (state) => state.requestManagement.isSending,
  );

  const loadMessages = useCallback(() => {
    if (requestId) {
      return dispatch(fetchRequestMessages(requestId));
    }
  }, [dispatch, requestId]);

  const sendNewMessage = useCallback(
    (payload: SendMessagePayload) => {
      return dispatch(sendMessage(payload));
    },
    [dispatch],
  );

  const addNewMessage = useCallback(
    (message: any) => {
      dispatch(addMessage({ requestId, message }));
    },
    [dispatch, requestId],
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      dispatch(markMessageAsRead({ requestId, messageId }));
    },
    [dispatch, requestId],
  );

  return {
    messages,
    messageLoading,
    isSending,
    loadMessages,
    sendNewMessage,
    addNewMessage,
    markAsRead,
  };
};

/**
 * Hook for request status management
 */
export const useRequestStatus = () => {
  const dispatch = useAppDispatch();
  const isUpdating = useAppSelector(
    (state) => state.requestManagement.isUpdating,
  );

  const updateStatus = useCallback(
    async (requestId: number, status: string, additionalData?: any) => {
      const updates = {
        status,
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };

      return dispatch(updateRequest({ requestId, updates }));
    },
    [dispatch],
  );

  const assignToStaff = useCallback(
    async (requestId: number, staffId: number, staffName: string) => {
      return updateStatus(requestId, "Đang xử lý", {
        assignedStaffId: staffId,
        assignedTo: staffName,
      });
    },
    [updateStatus],
  );

  const markCompleted = useCallback(
    async (requestId: number, completionNotes?: string) => {
      return updateStatus(requestId, "Hoàn thành", {
        actualCompletionTime: new Date().toISOString(),
        notes: completionNotes,
      });
    },
    [updateStatus],
  );

  return {
    isUpdating,
    updateStatus,
    assignToStaff,
    markCompleted,
  };
};

/**
 * Hook for real-time request updates
 */
export const useRequestRealtime = () => {
  const dispatch = useAppDispatch();

  const handleRealtimeUpdate = useCallback(
    (event: RequestUpdateEvent) => {
      dispatch(addRequestUpdate(event));
    },
    [dispatch],
  );

  useEffect(() => {
    // Set up WebSocket subscription for real-time updates
    const cleanup = requestManagementService.subscribeToUpdates((event) => {
      handleRealtimeUpdate(event);
    });

    return cleanup;
  }, [handleRealtimeUpdate]);

  useEffect(() => {
    // Set up global window function for backward compatibility
    (window as any).updateRequestStatus = (data: any) => {
      handleRealtimeUpdate({
        type: data.type || "status-change",
        requestId: data.requestId,
        data,
        timestamp: data.timestamp || new Date().toISOString(),
        triggeredBy: data.triggeredBy || "system",
      });
    };

    return () => {
      (window as any).updateRequestStatus = undefined;
    };
  }, [handleRealtimeUpdate]);

  return {
    handleRealtimeUpdate,
  };
};
