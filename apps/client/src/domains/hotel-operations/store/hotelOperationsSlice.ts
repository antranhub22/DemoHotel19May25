// Using consolidated types from common.types.ts

/**
 * Hotel Operations Redux Slice
 * Domain-driven state management for hotel operations
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { hotelOperationsService } from "../services/hotelOperationsService";
import type { HousekeepingTask, Room } from "../types/common.types";
import {
  CreateHousekeepingTaskPayload,
  CreateMaintenanceRequestPayload,
  CreateRoomPayload,
  FacilitiesResponse,
  Facility,
  FacilityFilters,
  HotelOperationsAnalytics,
  HotelOperationsState,
  HotelOperationsUpdateEvent,
  HousekeepingFilters,
  HousekeepingResponse,
  InventoryFilters,
  InventoryItem,
  InventoryResponse,
  MaintenanceFilters,
  MaintenanceRequest,
  MaintenanceResponse,
  RoomFilters,
  RoomsResponse,
  RoomType,
  UpdateHousekeepingTaskPayload,
  UpdateMaintenanceRequestPayload,
  UpdateRoomPayload,
} from "../types/hotelOperations.types";

// ========================================
// Initial State
// ========================================

const initialRoomFilters: RoomFilters = {
  searchQuery: "",
};

const initialHousekeepingFilters: HousekeepingFilters = {
  searchQuery: "",
};

const initialMaintenanceFilters: MaintenanceFilters = {
  searchQuery: "",
};

const initialFacilityFilters: FacilityFilters = {
  searchQuery: "",
};

const initialInventoryFilters: InventoryFilters = {
  searchQuery: "",
};

const initialState: HotelOperationsState = {
  // Room management
  rooms: [],
  roomTypes: [],
  selectedRoom: null,

  // Housekeeping
  housekeepingTasks: [],
  selectedTask: null,

  // Maintenance
  maintenanceRequests: [],
  selectedRequest: null,

  // Facilities
  facilities: [],
  selectedFacility: null,

  // Inventory
  inventoryItems: [],
  selectedItem: null,

  // Loading states
  isLoading: false,
  isUpdating: false,
  isSaving: false,

  // Filters
  roomFilters: initialRoomFilters,
  housekeepingFilters: initialHousekeepingFilters,
  maintenanceFilters: initialMaintenanceFilters,
  facilityFilters: initialFacilityFilters,
  inventoryFilters: initialInventoryFilters,

  // UI state
  activeTab: "rooms",
  viewMode: "grid",
  showFilters: false,

  // Analytics
  analytics: null,

  // Error handling
  error: null,
  lastError: null,

  // Real-time updates
  lastUpdate: null,
};

// ========================================
// Async Thunks - Room Management
// ========================================

export const fetchRooms = createAsyncThunk(
  "hotelOperations/fetchRooms",
  async (filters: RoomFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await hotelOperationsService.getRooms(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch rooms");
    }
  },
);

export const fetchRoomById = createAsyncThunk(
  "hotelOperations/fetchRoomById",
  async (roomId: number, { rejectWithValue }) => {
    try {
      const room = await hotelOperationsService.getRoomById(roomId);
      return room;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch room");
    }
  },
);

export const createRoom = createAsyncThunk(
  "hotelOperations/createRoom",
  async (payload: CreateRoomPayload, { rejectWithValue }) => {
    try {
      const newRoom = await hotelOperationsService.createRoom(payload);
      return newRoom;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create room");
    }
  },
);

export const updateRoom = createAsyncThunk(
  "hotelOperations/updateRoom",
  async (payload: UpdateRoomPayload, { rejectWithValue }) => {
    try {
      const updatedRoom = await hotelOperationsService.updateRoom(
        payload.roomId,
        payload.updates,
      );
      return updatedRoom;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update room");
    }
  },
);

export const updateRoomStatus = createAsyncThunk(
  "hotelOperations/updateRoomStatus",
  async (
    { roomId, status }: { roomId: number; status: string },
    { rejectWithValue },
  ) => {
    try {
      const updatedRoom = await hotelOperationsService.updateRoomStatus(
        roomId,
        status,
      );
      return updatedRoom;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update room status");
    }
  },
);

export const fetchRoomTypes = createAsyncThunk(
  "hotelOperations/fetchRoomTypes",
  async (_, { rejectWithValue }) => {
    try {
      const roomTypes = await hotelOperationsService.getRoomTypes();
      return roomTypes;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch room types");
    }
  },
);

// ========================================
// Async Thunks - Housekeeping
// ========================================

export const fetchHousekeepingTasks = createAsyncThunk(
  "hotelOperations/fetchHousekeepingTasks",
  async (filters?: HousekeepingFilters, { rejectWithValue }) => {
    try {
      const response =
        await hotelOperationsService.getHousekeepingTasks(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch housekeeping tasks",
      );
    }
  },
);

export const createHousekeepingTask = createAsyncThunk(
  "hotelOperations/createHousekeepingTask",
  async (payload: CreateHousekeepingTaskPayload, { rejectWithValue }) => {
    try {
      const newTask =
        await hotelOperationsService.createHousekeepingTask(payload);
      return newTask;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to create housekeeping task",
      );
    }
  },
);

export const updateHousekeepingTask = createAsyncThunk(
  "hotelOperations/updateHousekeepingTask",
  async (payload: UpdateHousekeepingTaskPayload, { rejectWithValue }) => {
    try {
      const updatedTask = await hotelOperationsService.updateHousekeepingTask(
        payload.taskId,
        payload.updates,
      );
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update housekeeping task",
      );
    }
  },
);

export const assignHousekeepingTask = createAsyncThunk(
  "hotelOperations/assignHousekeepingTask",
  async (
    { taskId, staffId }: { taskId: string; staffId: number },
    { rejectWithValue },
  ) => {
    try {
      const updatedTask = await hotelOperationsService.assignHousekeepingTask(
        taskId,
        staffId,
      );
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to assign housekeeping task",
      );
    }
  },
);

export const completeHousekeepingTask = createAsyncThunk(
  "hotelOperations/completeHousekeepingTask",
  async (
    { taskId, notes }: { taskId: string; notes?: string },
    { rejectWithValue },
  ) => {
    try {
      const completedTask =
        await hotelOperationsService.completeHousekeepingTask(taskId, notes);
      return completedTask;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to complete housekeeping task",
      );
    }
  },
);

// ========================================
// Async Thunks - Maintenance
// ========================================

export const fetchMaintenanceRequests = createAsyncThunk(
  "hotelOperations/fetchMaintenanceRequests",
  async (filters?: MaintenanceFilters, { rejectWithValue }) => {
    try {
      const response =
        await hotelOperationsService.getMaintenanceRequests(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch maintenance requests",
      );
    }
  },
);

export const createMaintenanceRequest = createAsyncThunk(
  "hotelOperations/createMaintenanceRequest",
  async (payload: CreateMaintenanceRequestPayload, { rejectWithValue }) => {
    try {
      const newRequest =
        await hotelOperationsService.createMaintenanceRequest(payload);
      return newRequest;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to create maintenance request",
      );
    }
  },
);

export const updateMaintenanceRequest = createAsyncThunk(
  "hotelOperations/updateMaintenanceRequest",
  async (payload: UpdateMaintenanceRequestPayload, { rejectWithValue }) => {
    try {
      const updatedRequest =
        await hotelOperationsService.updateMaintenanceRequest(
          payload.requestId,
          payload.updates,
        );
      return updatedRequest;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update maintenance request",
      );
    }
  },
);

export const assignMaintenanceRequest = createAsyncThunk(
  "hotelOperations/assignMaintenanceRequest",
  async (
    { requestId, staffId }: { requestId: string; staffId: number },
    { rejectWithValue },
  ) => {
    try {
      const updatedRequest =
        await hotelOperationsService.assignMaintenanceRequest(
          requestId,
          staffId,
        );
      return updatedRequest;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to assign maintenance request",
      );
    }
  },
);

// ========================================
// Async Thunks - Facilities
// ========================================

export const fetchFacilities = createAsyncThunk(
  "hotelOperations/fetchFacilities",
  async (filters?: FacilityFilters, { rejectWithValue }) => {
    try {
      const response = await hotelOperationsService.getFacilities(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch facilities");
    }
  },
);

export const updateFacilityStatus = createAsyncThunk(
  "hotelOperations/updateFacilityStatus",
  async (
    { facilityId, status }: { facilityId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const updatedFacility = await hotelOperationsService.updateFacilityStatus(
        facilityId,
        status,
      );
      return updatedFacility;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update facility status",
      );
    }
  },
);

// ========================================
// Async Thunks - Inventory
// ========================================

export const fetchInventoryItems = createAsyncThunk(
  "hotelOperations/fetchInventoryItems",
  async (filters?: InventoryFilters, { rejectWithValue }) => {
    try {
      const response = await hotelOperationsService.getInventoryItems(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch inventory items",
      );
    }
  },
);

export const updateInventoryStock = createAsyncThunk(
  "hotelOperations/updateInventoryStock",
  async (
    {
      itemId,
      quantity,
      type,
    }: { itemId: string; quantity: number; type: "add" | "subtract" | "set" },
    { rejectWithValue },
  ) => {
    try {
      const updatedItem = await hotelOperationsService.updateInventoryStock(
        itemId,
        quantity,
        type,
      );
      return updatedItem;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update inventory stock",
      );
    }
  },
);

// ========================================
// Async Thunks - Analytics
// ========================================

export const fetchHotelOperationsAnalytics = createAsyncThunk(
  "hotelOperations/fetchAnalytics",
  async (period?: string, { rejectWithValue }) => {
    try {
      const analytics = await hotelOperationsService.getAnalytics(period);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch analytics");
    }
  },
);

// ========================================
// Redux Slice
// ========================================

const hotelOperationsSlice = createSlice({
  name: "hotelOperations",
  initialState,
  reducers: {
    // UI State Management
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },

    setSelectedTask: (
      state,
      action: PayloadAction<HousekeepingTask | null>,
    ) => {
      state.selectedTask = action.payload;
    },

    setSelectedRequest: (
      state,
      action: PayloadAction<MaintenanceRequest | null>,
    ) => {
      state.selectedRequest = action.payload;
    },

    setSelectedFacility: (state, action: PayloadAction<Facility | null>) => {
      state.selectedFacility = action.payload;
    },

    setSelectedItem: (state, action: PayloadAction<InventoryItem | null>) => {
      state.selectedItem = action.payload;
    },

    // Filter Management
    setRoomFilters: (state, action: PayloadAction<Partial<RoomFilters>>) => {
      state.roomFilters = { ...state.roomFilters, ...action.payload };
    },

    setHousekeepingFilters: (
      state,
      action: PayloadAction<Partial<HousekeepingFilters>>,
    ) => {
      state.housekeepingFilters = {
        ...state.housekeepingFilters,
        ...action.payload,
      };
    },

    setMaintenanceFilters: (
      state,
      action: PayloadAction<Partial<MaintenanceFilters>>,
    ) => {
      state.maintenanceFilters = {
        ...state.maintenanceFilters,
        ...action.payload,
      };
    },

    setFacilityFilters: (
      state,
      action: PayloadAction<Partial<FacilityFilters>>,
    ) => {
      state.facilityFilters = { ...state.facilityFilters, ...action.payload };
    },

    setInventoryFilters: (
      state,
      action: PayloadAction<Partial<InventoryFilters>>,
    ) => {
      state.inventoryFilters = { ...state.inventoryFilters, ...action.payload };
    },

    resetRoomFilters: (state) => {
      state.roomFilters = initialRoomFilters;
    },

    resetHousekeepingFilters: (state) => {
      state.housekeepingFilters = initialHousekeepingFilters;
    },

    resetMaintenanceFilters: (state) => {
      state.maintenanceFilters = initialMaintenanceFilters;
    },

    // Tab & View Management
    setActiveTab: (
      state,
      action: PayloadAction<
        "rooms" | "housekeeping" | "maintenance" | "facilities" | "inventory"
      >,
    ) => {
      state.activeTab = action.payload;
    },

    setViewMode: (
      state,
      action: PayloadAction<"grid" | "table" | "floor-plan">,
    ) => {
      state.viewMode = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    // Real-time Updates
    addHotelOperationsUpdate: (
      state,
      action: PayloadAction<HotelOperationsUpdateEvent>,
    ) => {
      const update = action.payload;
      state.lastUpdate = update.timestamp;

      // Apply update based on type
      if (update.type === "room-status") {
        const roomIndex = state.rooms.findIndex(
          (r) => r.id === update.entityId,
        );
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = {
            ...state.rooms[roomIndex],
            ...update.data,
          };
        }
        if (state.selectedRoom?.id === update.entityId) {
          state.selectedRoom = { ...state.selectedRoom, ...update.data };
        }
      } else if (update.type === "housekeeping-update") {
        const taskIndex = state.housekeepingTasks.findIndex(
          (t) => t.id === update.entityId,
        );
        if (taskIndex !== -1) {
          state.housekeepingTasks[taskIndex] = {
            ...state.housekeepingTasks[taskIndex],
            ...update.data,
          };
        }
        if (state.selectedTask?.id === update.entityId) {
          state.selectedTask = { ...state.selectedTask, ...update.data };
        }
      } else if (update.type === "maintenance-update") {
        const requestIndex = state.maintenanceRequests.findIndex(
          (r) => r.id === update.entityId,
        );
        if (requestIndex !== -1) {
          state.maintenanceRequests[requestIndex] = {
            ...state.maintenanceRequests[requestIndex],
            ...update.data,
          };
        }
        if (state.selectedRequest?.id === update.entityId) {
          state.selectedRequest = { ...state.selectedRequest, ...update.data };
        }
      } else if (update.type === "facility-status") {
        const facilityIndex = state.facilities.findIndex(
          (f) => f.id === update.entityId,
        );
        if (facilityIndex !== -1) {
          state.facilities[facilityIndex] = {
            ...state.facilities[facilityIndex],
            ...update.data,
          };
        }
        if (state.selectedFacility?.id === update.entityId) {
          state.selectedFacility = {
            ...state.selectedFacility,
            ...update.data,
          };
        }
      } else if (update.type === "inventory-change") {
        const itemIndex = state.inventoryItems.findIndex(
          (i) => i.id === update.entityId,
        );
        if (itemIndex !== -1) {
          state.inventoryItems[itemIndex] = {
            ...state.inventoryItems[itemIndex],
            ...update.data,
          };
        }
        if (state.selectedItem?.id === update.entityId) {
          state.selectedItem = { ...state.selectedItem, ...update.data };
        }
      }
    },

    // Optimistic Updates
    optimisticUpdateRoom: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<any> }>, // TODO: Fix Room type definition
    ) => {
      const { id, updates } = action.payload;
      const roomIndex = state.rooms.findIndex((r) => r.id === id);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...updates };
      }
      if (state.selectedRoom?.id === id) {
        state.selectedRoom = { ...state.selectedRoom, ...updates };
      }
    },

    optimisticUpdateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<any> }>, // TODO: Fix HousekeepingTask type definition
    ) => {
      const { id, updates } = action.payload;
      const taskIndex = state.housekeepingTasks.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        state.housekeepingTasks[taskIndex] = {
          ...state.housekeepingTasks[taskIndex],
          ...updates,
        };
      }
      if (state.selectedTask?.id === id) {
        state.selectedTask = { ...state.selectedTask, ...updates };
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

    // Reset state
    resetHotelOperations: () => initialState,
  },

  extraReducers: (builder) => {
    // Fetch Rooms
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRooms.fulfilled,
        (state, action: PayloadAction<RoomsResponse>) => {
          state.isLoading = false;
          state.rooms = action.payload.rooms;
          state.lastUpdate = new Date().toISOString();
        },
      )
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Room by ID
    builder.addCase(
      fetchRoomById.fulfilled,
      (state, action: PayloadAction<Room>) => {
        state.selectedRoom = action.payload;
        // Update in rooms array if it exists
        const roomIndex = state.rooms.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = action.payload;
        }
      },
    );

    // Create Room
    builder
      .addCase(createRoom.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        state.isSaving = false;
        state.rooms.unshift(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Room
    builder
      .addCase(updateRoom.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        state.isUpdating = false;
        const roomIndex = state.rooms.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = action.payload;
        }
        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Update Room Status
    builder.addCase(
      updateRoomStatus.fulfilled,
      (state, action: PayloadAction<Room>) => {
        const roomIndex = state.rooms.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = action.payload;
        }
        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = action.payload;
        }
      },
    );

    // Fetch Room Types
    builder.addCase(
      fetchRoomTypes.fulfilled,
      (state, action: PayloadAction<RoomType[]>) => {
        state.roomTypes = action.payload;
      },
    );

    // Fetch Housekeeping Tasks
    builder
      .addCase(fetchHousekeepingTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchHousekeepingTasks.fulfilled,
        (state, action: PayloadAction<HousekeepingResponse>) => {
          state.isLoading = false;
          state.housekeepingTasks = action.payload.tasks;
        },
      )
      .addCase(fetchHousekeepingTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Housekeeping Task
    builder.addCase(
      createHousekeepingTask.fulfilled,
      (state, action: PayloadAction<HousekeepingTask>) => {
        state.housekeepingTasks.unshift(action.payload);
      },
    );

    // Update Housekeeping Task
    builder.addCase(
      updateHousekeepingTask.fulfilled,
      (state, action: PayloadAction<HousekeepingTask>) => {
        const taskIndex = state.housekeepingTasks.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (taskIndex !== -1) {
          state.housekeepingTasks[taskIndex] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      },
    );

    // Fetch Maintenance Requests
    builder
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchMaintenanceRequests.fulfilled,
        (state, action: PayloadAction<MaintenanceResponse>) => {
          state.isLoading = false;
          state.maintenanceRequests = action.payload.requests;
        },
      )
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Maintenance Request
    builder.addCase(
      createMaintenanceRequest.fulfilled,
      (state, action: PayloadAction<MaintenanceRequest>) => {
        state.maintenanceRequests.unshift(action.payload);
      },
    );

    // Update Maintenance Request
    builder.addCase(
      updateMaintenanceRequest.fulfilled,
      (state, action: PayloadAction<MaintenanceRequest>) => {
        const requestIndex = state.maintenanceRequests.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (requestIndex !== -1) {
          state.maintenanceRequests[requestIndex] = action.payload;
        }
        if (state.selectedRequest?.id === action.payload.id) {
          state.selectedRequest = action.payload;
        }
      },
    );

    // Fetch Facilities
    builder.addCase(
      fetchFacilities.fulfilled,
      (state, action: PayloadAction<FacilitiesResponse>) => {
        state.facilities = action.payload.facilities;
      },
    );

    // Fetch Inventory Items
    builder.addCase(
      fetchInventoryItems.fulfilled,
      (state, action: PayloadAction<InventoryResponse>) => {
        state.inventoryItems = action.payload.items;
      },
    );

    // Update Inventory Stock
    builder.addCase(
      updateInventoryStock.fulfilled,
      (state, action: PayloadAction<InventoryItem>) => {
        const itemIndex = state.inventoryItems.findIndex(
          (i) => i.id === action.payload.id,
        );
        if (itemIndex !== -1) {
          state.inventoryItems[itemIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      },
    );

    // Fetch Analytics
    builder.addCase(
      fetchHotelOperationsAnalytics.fulfilled,
      (state, action: PayloadAction<HotelOperationsAnalytics>) => {
        state.analytics = action.payload;
      },
    );
  },
});

// ========================================
// Actions Export
// ========================================

export const {
  setSelectedRoom,
  setSelectedTask,
  setSelectedRequest,
  setSelectedFacility,
  setSelectedItem,
  setRoomFilters,
  setHousekeepingFilters,
  setMaintenanceFilters,
  setFacilityFilters,
  setInventoryFilters,
  resetRoomFilters,
  resetHousekeepingFilters,
  resetMaintenanceFilters,
  setActiveTab,
  setViewMode,
  toggleFilters,
  addHotelOperationsUpdate,
  optimisticUpdateRoom,
  optimisticUpdateTask,
  clearError,
  setError,
  resetHotelOperations,
} = hotelOperationsSlice.actions;

// ========================================
// Selectors
// ========================================

export const selectHotelOperations = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations;

export const selectRooms = (state: { hotelOperations: HotelOperationsState }) =>
  state.hotelOperations.rooms;

export const selectSelectedRoom = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.selectedRoom;

export const selectHousekeepingTasks = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.housekeepingTasks;

export const selectSelectedTask = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.selectedTask;

export const selectMaintenanceRequests = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.maintenanceRequests;

export const selectSelectedRequest = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.selectedRequest;

export const selectFacilities = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.facilities;

export const selectInventoryItems = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.inventoryItems;

export const selectRoomFilters = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.roomFilters;

export const selectIsLoading = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.isLoading;

export const selectError = (state: { hotelOperations: HotelOperationsState }) =>
  state.hotelOperations.error;

export const selectAnalytics = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.analytics;

export const selectRoomTypes = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.roomTypes;

// Complex selectors
export const selectAvailableRooms = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.rooms.filter((room) => room.status === "available");

export const selectOccupiedRooms = (state: {
  hotelOperations: HotelOperationsState;
}) => state.hotelOperations.rooms.filter((room) => room.status === "occupied");

export const selectRoomsNeedingCleaning = (state: {
  hotelOperations: HotelOperationsState;
}) =>
  state.hotelOperations.rooms.filter((room) => room.availability === "dirty");

export const selectUrgentTasks = (state: {
  hotelOperations: HotelOperationsState;
}) =>
  state.hotelOperations.housekeepingTasks.filter(
    (task) => task.priority === "urgent",
  );

export const selectUrgentMaintenanceRequests = (state: {
  hotelOperations: HotelOperationsState;
}) =>
  state.hotelOperations.maintenanceRequests.filter(
    (request) => request.urgency === "emergency",
  );

export const selectLowStockItems = (state: {
  hotelOperations: HotelOperationsState;
}) =>
  state.hotelOperations.inventoryItems.filter(
    (item) => item.currentStock <= item.reorderPoint,
  );

// ========================================
// Default Export
// ========================================

export default hotelOperationsSlice.reducer;
