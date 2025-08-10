/**
 * Request Management Redux Slice
 * Domain-driven state management for request system
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { requestManagementService } from "../services/requestManagementService";
import {
  CreateRequestPayload,
  CustomerRequest,
  RequestFilters,
  RequestManagementState,
  RequestMessage,
  RequestMetrics,
  RequestSearchParams,
  RequestsResponse,
  RequestUpdateEvent,
  SendMessagePayload,
  UpdateRequestPayload,
} from "../types/requestManagement.types";

// ========================================
// Initial State
// ========================================

const initialFilters: RequestFilters = {
  status: "Tất cả",
  startDate: "",
  endDate: "",
  searchQuery: "",
};

const initialSearchParams: RequestSearchParams = {
  filters: initialFilters,
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 50,
};

const initialState: RequestManagementState = {
  // Requests data
  requests: [],
  selectedRequest: null,

  // Loading states
  isLoading: false,
  isUpdating: false,
  isSending: false,

  // Filters & search
  filters: initialFilters,
  searchParams: initialSearchParams,

  // Messages
  messages: {},
  messageLoading: false,

  // Real-time updates
  lastUpdate: null,
  pendingUpdates: [],

  // UI state
  selectedTab: "all",
  viewMode: "list",
  showFilters: false,

  // Error handling
  error: null,
  lastError: null,

  // Metrics
  metrics: null,
  metricsLastUpdated: null,
};

// ========================================
// Async Thunks
// ========================================

// Fetch all requests
export const fetchRequests = createAsyncThunk(
  "requestManagement/fetchRequests",
  async (
    searchParams: Partial<RequestSearchParams> | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await requestManagementService.getRequests(searchParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch requests");
    }
  },
);

// Fetch single request by ID
export const fetchRequestById = createAsyncThunk(
  "requestManagement/fetchRequestById",
  async (requestId: number, { rejectWithValue }) => {
    try {
      const request = await requestManagementService.getRequestById(requestId);
      return request;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch request");
    }
  },
);

// Create new request
export const createRequest = createAsyncThunk(
  "requestManagement/createRequest",
  async (payload: CreateRequestPayload, { rejectWithValue }) => {
    try {
      const newRequest = await requestManagementService.createRequest(payload);
      return newRequest;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create request");
    }
  },
);

// Update request
export const updateRequest = createAsyncThunk(
  "requestManagement/updateRequest",
  async (payload: UpdateRequestPayload, { rejectWithValue }) => {
    try {
      const updatedRequest = await requestManagementService.updateRequest(
        payload.requestId,
        payload.updates,
      );
      return updatedRequest;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update request");
    }
  },
);

// Delete request
export const deleteRequest = createAsyncThunk(
  "requestManagement/deleteRequest",
  async (
    { requestId, password }: { requestId: number; password: string },
    { rejectWithValue },
  ) => {
    try {
      await requestManagementService.deleteRequest(requestId, password);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete request");
    }
  },
);

// Fetch messages for a request
export const fetchRequestMessages = createAsyncThunk(
  "requestManagement/fetchRequestMessages",
  async (requestId: number, { rejectWithValue }) => {
    try {
      const messages =
        await requestManagementService.getRequestMessages(requestId);
      return { requestId, messages };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  },
);

// Send message
export const sendMessage = createAsyncThunk(
  "requestManagement/sendMessage",
  async (payload: SendMessagePayload, { rejectWithValue }) => {
    try {
      const message = await requestManagementService.sendMessage(
        payload.requestId,
        payload.content,
        payload.attachments,
      );
      return { requestId: payload.requestId, message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  },
);

// Fetch request metrics
export const fetchRequestMetrics = createAsyncThunk(
  "requestManagement/fetchRequestMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const metrics = await requestManagementService.getRequestMetrics();
      return metrics;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch metrics");
    }
  },
);

// ========================================
// Redux Slice
// ========================================

const requestManagementSlice = createSlice({
  name: "requestManagement",
  initialState,
  reducers: {
    // UI State Management
    setSelectedRequest: (
      state,
      action: PayloadAction<CustomerRequest | null>,
    ) => {
      state.selectedRequest = action.payload;
    },

    setFilters: (state, action: PayloadAction<Partial<RequestFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialFilters;
    },

    setSearchParams: (
      state,
      action: PayloadAction<Partial<RequestSearchParams>>,
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },

    setSelectedTab: (
      state,
      action: PayloadAction<"all" | "pending" | "assigned" | "completed">,
    ) => {
      state.selectedTab = action.payload;
    },

    setViewMode: (state, action: PayloadAction<"list" | "grid" | "kanban">) => {
      state.viewMode = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    // Real-time Updates
    addRequestUpdate: (state, action: PayloadAction<RequestUpdateEvent>) => {
      const update = action.payload;
      state.pendingUpdates.push(update);
      state.lastUpdate = update.timestamp;

      // Apply update immediately based on type
      if (update.type === "new-request" && update.data) {
        const newRequest = update.data as CustomerRequest;
        state.requests.unshift(newRequest);
      } else if (
        update.type === "status-change" ||
        update.type === "assignment-change"
      ) {
        const requestIndex = state.requests.findIndex(
          (r) => r.id === update.requestId,
        );
        if (requestIndex !== -1) {
          state.requests[requestIndex] = {
            ...state.requests[requestIndex],
            ...update.data,
          };
        }
        // Update selected request if it matches
        if (state.selectedRequest?.id === update.requestId) {
          state.selectedRequest = { ...state.selectedRequest, ...update.data };
        }
      }
    },

    processPendingUpdates: (state) => {
      // Mark pending updates as processed
      state.pendingUpdates = [];
    },

    // Message Management
    addMessage: (
      state,
      action: PayloadAction<{ requestId: number; message: RequestMessage }>,
    ) => {
      const { requestId, message } = action.payload;
      if (!state.messages[requestId]) {
        state.messages[requestId] = [];
      }
      state.messages[requestId].push(message);
    },

    markMessageAsRead: (
      state,
      action: PayloadAction<{ requestId: number; messageId: string }>,
    ) => {
      const { requestId, messageId } = action.payload;
      const messages = state.messages[requestId];
      if (messages) {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].isRead = true;
        }
      }
    },

    // Error Management
    clearError: (state) => {
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.lastError = action.payload;
    },

    // Optimistic Updates
    optimisticUpdateRequest: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<CustomerRequest> }>,
    ) => {
      const { id, updates } = action.payload;
      const requestIndex = state.requests.findIndex((r) => r.id === id);
      if (requestIndex !== -1) {
        state.requests[requestIndex] = {
          ...state.requests[requestIndex],
          ...updates,
        };
      }
      if (state.selectedRequest?.id === id) {
        state.selectedRequest = { ...state.selectedRequest, ...updates };
      }
    },

    // Reset state
    resetRequestManagement: () => initialState,
  },

  extraReducers: (builder) => {
    // Fetch Requests
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRequests.fulfilled,
        (state, action: PayloadAction<RequestsResponse>) => {
          state.isLoading = false;
          state.requests = action.payload.requests;
          state.lastUpdate = new Date().toISOString();
        },
      )
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Request by ID
    builder
      .addCase(fetchRequestById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchRequestById.fulfilled,
        (state, action: PayloadAction<CustomerRequest>) => {
          state.isLoading = false;
          state.selectedRequest = action.payload;
          // Update in requests array if it exists
          const requestIndex = state.requests.findIndex(
            (r) => r.id === action.payload.id,
          );
          if (requestIndex !== -1) {
            state.requests[requestIndex] = action.payload;
          }
        },
      )
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Request
    builder
      .addCase(createRequest.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(
        createRequest.fulfilled,
        (state, action: PayloadAction<CustomerRequest>) => {
          state.isSending = false;
          state.requests.unshift(action.payload);
        },
      )
      .addCase(createRequest.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Update Request
    builder
      .addCase(updateRequest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateRequest.fulfilled,
        (state, action: PayloadAction<CustomerRequest>) => {
          state.isUpdating = false;
          const requestIndex = state.requests.findIndex(
            (r) => r.id === action.payload.id,
          );
          if (requestIndex !== -1) {
            state.requests[requestIndex] = action.payload;
          }
          if (state.selectedRequest?.id === action.payload.id) {
            state.selectedRequest = action.payload;
          }
        },
      )
      .addCase(updateRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Request
    builder
      .addCase(deleteRequest.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(
        deleteRequest.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.isUpdating = false;
          state.requests = state.requests.filter(
            (r) => r.id !== action.payload,
          );
          if (state.selectedRequest?.id === action.payload) {
            state.selectedRequest = null;
          }
        },
      )
      .addCase(deleteRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Messages
    builder
      .addCase(fetchRequestMessages.pending, (state) => {
        state.messageLoading = true;
      })
      .addCase(
        fetchRequestMessages.fulfilled,
        (
          state,
          action: PayloadAction<{
            requestId: number;
            messages: RequestMessage[];
          }>,
        ) => {
          state.messageLoading = false;
          state.messages[action.payload.requestId] = action.payload.messages;
        },
      )
      .addCase(fetchRequestMessages.rejected, (state, action) => {
        state.messageLoading = false;
        state.error = action.payload as string;
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(
        sendMessage.fulfilled,
        (
          state,
          action: PayloadAction<{ requestId: number; message: RequestMessage }>,
        ) => {
          state.isSending = false;
          const { requestId, message } = action.payload;
          if (!state.messages[requestId]) {
            state.messages[requestId] = [];
          }
          state.messages[requestId].push(message);
        },
      )
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Fetch Metrics
    builder
      .addCase(fetchRequestMetrics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchRequestMetrics.fulfilled,
        (state, action: PayloadAction<RequestMetrics>) => {
          state.isLoading = false;
          state.metrics = action.payload;
          state.metricsLastUpdated = new Date().toISOString();
        },
      )
      .addCase(fetchRequestMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ========================================
// Actions Export
// ========================================

export const {
  setSelectedRequest,
  setFilters,
  resetFilters,
  setSearchParams,
  setSelectedTab,
  setViewMode,
  toggleFilters,
  addRequestUpdate,
  processPendingUpdates,
  addMessage,
  markMessageAsRead,
  clearError,
  setError,
  optimisticUpdateRequest,
  resetRequestManagement,
} = requestManagementSlice.actions;

// ========================================
// Selectors
// ========================================

export const selectRequestManagement = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement;

export const selectRequests = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.requests;

export const selectSelectedRequest = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.selectedRequest;

export const selectFilters = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.filters;

export const selectIsLoading = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.isLoading;

export const selectError = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.error;

export const selectMessages =
  (requestId: number) =>
  (state: { requestManagement: RequestManagementState }) =>
    state.requestManagement.messages[requestId] || [];

export const selectMetrics = (state: {
  requestManagement: RequestManagementState;
}) => state.requestManagement.metrics;

// ========================================
// Default Export
// ========================================

export default requestManagementSlice.reducer;
