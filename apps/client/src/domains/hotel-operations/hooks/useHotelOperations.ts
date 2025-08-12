// Using consolidated types from common.types.ts

/**
 * Hotel Operations Custom Hooks
 * Main hooks for hotel operations functionality
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback, useEffect } from "react";
import { hotelOperationsService } from "../services/hotelOperationsService";
import {
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
  fetchRooms,
  fetchRoomTypes,
  optimisticUpdateRoom,
  optimisticUpdateTask,
  resetHousekeepingFilters,
  resetMaintenanceFilters,
  resetRoomFilters,
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
  selectRooms,
  selectRoomsNeedingCleaning,
  selectRoomTypes,
  selectSelectedRequest,
  selectSelectedRoom,
  selectSelectedTask,
  selectUrgentMaintenanceRequests,
  selectUrgentTasks,
  setActiveTab,
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
} from "../store/hotelOperationsSlice";
import type {
  CreateHousekeepingTaskPayload,
  CreateMaintenanceRequestPayload,
  CreateRoomPayload,
  Facility,
  FacilityFilters,
  HotelOperationsUpdateEvent,
  HousekeepingFilters,
  HousekeepingTask,
  InventoryFilters,
  InventoryItem,
  MaintenanceFilters,
  MaintenanceRequest,
  Room,
  RoomFilters,
} from "../types/hotelOperations.types";

// ========================================
// Main Hotel Operations Hook
// ========================================

export const useHotelOperations = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const hotelOperations = useAppSelector(selectHotelOperations);
  const rooms = useAppSelector(selectRooms);
  const roomTypes = useAppSelector(selectRoomTypes);
  const selectedRoom = useAppSelector(selectSelectedRoom);
  const roomFilters = useAppSelector(selectRoomFilters);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const analytics = useAppSelector(selectAnalytics);

  // ========================================
  // Room Operations
  // ========================================

  const loadRooms = useCallback(
    (filters?: RoomFilters) => {
      return dispatch(fetchRooms(filters));
    },
    [dispatch],
  );

  const loadRoomById = useCallback(
    (roomId: number) => {
      return dispatch(fetchRoomById(roomId));
    },
    [dispatch],
  );

  const createNewRoom = useCallback(
    (payload: CreateRoomPayload) => {
      return dispatch(createRoom(payload)) as any;
    },
    [dispatch],
  );

  const updateExistingRoom = useCallback(
    (roomId: number, updates: Partial<any>) => {
      // TODO: Fix Room type definition
      // Optimistic update first
      dispatch(optimisticUpdateRoom({ id: roomId, updates }));

      // Then dispatch actual update
      return dispatch(updateRoom({ roomId, updates }));
    },
    [dispatch],
  );

  const changeRoomStatus = useCallback(
    (roomId: number, status: string) => {
      return dispatch(updateRoomStatus({ roomId, status }));
    },
    [dispatch],
  );

  const loadRoomTypes = useCallback(() => {
    return dispatch(fetchRoomTypes());
  }, [dispatch]);

  // ========================================
  // Filter & Search Operations
  // ========================================

  const updateRoomFilters = useCallback(
    (newFilters: Partial<RoomFilters>) => {
      dispatch(setRoomFilters(newFilters));
    },
    [dispatch],
  );

  const clearRoomFilters = useCallback(() => {
    dispatch(resetRoomFilters());
  }, [dispatch]);

  // ========================================
  // UI State Operations
  // ========================================

  const selectRoom = useCallback(
    (room: Room | null) => {
      dispatch(setSelectedRoom(room));
    },
    [dispatch],
  );

  const changeTab = useCallback(
    (
      tab:
        | "rooms"
        | "housekeeping"
        | "maintenance"
        | "facilities"
        | "inventory",
    ) => {
      dispatch(setActiveTab(tab));
    },
    [dispatch],
  );

  const changeViewMode = useCallback(
    (mode: "grid" | "table" | "floor-plan") => {
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
    (event: HotelOperationsUpdateEvent) => {
      dispatch(addHotelOperationsUpdate(event));
    },
    [dispatch],
  );

  // ========================================
  // Analytics Operations
  // ========================================

  const loadAnalytics = useCallback(
    (period?: string) => {
      return dispatch(fetchHotelOperationsAnalytics(period));
    },
    [dispatch],
  );

  // ========================================
  // Computed Values
  // ========================================

  const availableRooms = useAppSelector(selectAvailableRooms);
  const occupiedRooms = useAppSelector(selectOccupiedRooms);
  const roomsNeedingCleaning = useAppSelector(selectRoomsNeedingCleaning);

  const filteredRooms = rooms.filter((room) => {
    // Apply current filters
    if (roomFilters.roomType && room.roomType.code !== roomFilters.roomType) {
      return false;
    }

    if (roomFilters.status && room.status !== roomFilters.status) {
      return false;
    }

    if (
      roomFilters.availability &&
      room.availability !== roomFilters.availability
    ) {
      return false;
    }

    if (roomFilters.floor !== undefined && room.floor !== roomFilters.floor) {
      return false;
    }

    if (
      roomFilters.minPrice !== undefined &&
      room.currentPrice < roomFilters.minPrice
    ) {
      return false;
    }

    if (
      roomFilters.maxPrice !== undefined &&
      room.currentPrice > roomFilters.maxPrice
    ) {
      return false;
    }

    if (roomFilters.searchQuery) {
      const query = roomFilters.searchQuery.toLowerCase();
      const searchableFields = [
        room.roomNumber,
        room.roomType.name,
        room.roomType.code,
      ];

      if (
        !searchableFields.some((field) => field.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    return true;
  });

  const roomCounts = {
    total: filteredRooms.length,
    available: filteredRooms.filter((r) => r.status === "available").length,
    occupied: filteredRooms.filter((r) => r.status === "occupied").length,
    maintenance: filteredRooms.filter((r) => r.status === "maintenance").length,
    cleaning: filteredRooms.filter((r) => r.status === "cleaning").length,
    outOfOrder: filteredRooms.filter((r) => r.status === "out-of-order").length,
  };

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    // State
    rooms: filteredRooms,
    roomTypes,
    roomCounts,
    availableRooms,
    occupiedRooms,
    roomsNeedingCleaning,
    selectedRoom,
    roomFilters,
    isLoading,
    error,
    analytics,

    // Full state access
    hotelOperations,

    // Operations
    loadRooms,
    loadRoomById,
    createNewRoom,
    updateExistingRoom,
    changeRoomStatus,
    loadRoomTypes,

    // Filters & Search
    updateRoomFilters,
    clearRoomFilters,

    // UI State
    selectRoom,
    changeTab,
    changeViewMode,
    toggleFilterPanel,

    // Error handling
    clearCurrentError,

    // Real-time
    handleRealtimeUpdate,

    // Analytics
    loadAnalytics,
  };
};

// ========================================
// Housekeeping Management Hook
// ========================================

export const useHousekeeping = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectHousekeepingTasks);
  const selectedTask = useAppSelector(selectSelectedTask);
  const urgentTasks = useAppSelector(selectUrgentTasks);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const loadTasks = useCallback(
    (filters?: HousekeepingFilters) => {
      return dispatch(fetchHousekeepingTasks(filters));
    },
    [dispatch],
  );

  const createNewTask = useCallback(
    (payload: CreateHousekeepingTaskPayload) => {
      return dispatch(createHousekeepingTask(payload));
    },
    [dispatch],
  );

  const updateExistingTask = useCallback(
    (taskId: string, updates: Partial<any>) => {
      // TODO: Fix HousekeepingTask type definition
      // Optimistic update first
      dispatch(optimisticUpdateTask({ id: taskId, updates }));

      // Then dispatch actual update
      return dispatch(updateHousekeepingTask({ taskId, updates }));
    },
    [dispatch],
  );

  const assignTaskToStaff = useCallback(
    (taskId: string, staffId: number) => {
      return dispatch(assignHousekeepingTask({ taskId, staffId }));
    },
    [dispatch],
  );

  const completeTask = useCallback(
    (taskId: string, notes?: string) => {
      return dispatch(completeHousekeepingTask({ taskId, notes }));
    },
    [dispatch],
  );

  const selectTask = useCallback(
    (task: HousekeepingTask | null) => {
      dispatch(setSelectedTask(task));
    },
    [dispatch],
  );

  const updateTaskFilters = useCallback(
    (filters: Partial<HousekeepingFilters>) => {
      dispatch(setHousekeepingFilters(filters));
    },
    [dispatch],
  );

  const clearTaskFilters = useCallback(() => {
    dispatch(resetHousekeepingFilters());
  }, [dispatch]);

  return {
    tasks,
    selectedTask,
    urgentTasks,
    isLoading,
    error,
    loadTasks,
    createNewTask,
    updateExistingTask,
    assignTaskToStaff,
    completeTask,
    selectTask,
    updateTaskFilters,
    clearTaskFilters,
  };
};

// ========================================
// Maintenance Management Hook
// ========================================

export const useMaintenance = () => {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectMaintenanceRequests);
  const selectedRequest = useAppSelector(selectSelectedRequest);
  const urgentRequests = useAppSelector(selectUrgentMaintenanceRequests);
  const isLoading = useAppSelector(selectIsLoading);

  const loadRequests = useCallback(
    (filters?: MaintenanceFilters) => {
      return dispatch(fetchMaintenanceRequests(filters));
    },
    [dispatch],
  );

  const createNewRequest = useCallback(
    (payload: CreateMaintenanceRequestPayload) => {
      return dispatch(createMaintenanceRequest(payload));
    },
    [dispatch],
  );

  const updateExistingRequest = useCallback(
    (requestId: string, updates: Partial<MaintenanceRequest>) => {
      return dispatch(updateMaintenanceRequest({ requestId, updates }));
    },
    [dispatch],
  );

  const assignRequestToStaff = useCallback(
    (requestId: string, staffId: number) => {
      return dispatch(assignMaintenanceRequest({ requestId, staffId }));
    },
    [dispatch],
  );

  const selectRequest = useCallback(
    (request: MaintenanceRequest | null) => {
      dispatch(setSelectedRequest(request));
    },
    [dispatch],
  );

  const updateRequestFilters = useCallback(
    (filters: Partial<MaintenanceFilters>) => {
      dispatch(setMaintenanceFilters(filters));
    },
    [dispatch],
  );

  const clearRequestFilters = useCallback(() => {
    dispatch(resetMaintenanceFilters());
  }, [dispatch]);

  return {
    requests,
    selectedRequest,
    urgentRequests,
    isLoading,
    loadRequests,
    createNewRequest,
    updateExistingRequest,
    assignRequestToStaff,
    selectRequest,
    updateRequestFilters,
    clearRequestFilters,
  };
};

// ========================================
// Facility Management Hook
// ========================================

export const useFacilities = () => {
  const dispatch = useAppDispatch();
  const facilities = useAppSelector(selectFacilities);
  const isLoading = useAppSelector(selectIsLoading);

  const loadFacilities = useCallback(
    (filters?: FacilityFilters) => {
      return dispatch(fetchFacilities(filters));
    },
    [dispatch],
  );

  const changeFacilityStatus = useCallback(
    (facilityId: string, status: string) => {
      return dispatch(updateFacilityStatus({ facilityId, status }));
    },
    [dispatch],
  );

  const selectFacility = useCallback(
    (facility: Facility | null) => {
      dispatch(setSelectedFacility(facility));
    },
    [dispatch],
  );

  const updateFacilityFilters = useCallback(
    (filters: Partial<FacilityFilters>) => {
      dispatch(setFacilityFilters(filters));
    },
    [dispatch],
  );

  return {
    facilities,
    isLoading,
    loadFacilities,
    changeFacilityStatus,
    selectFacility,
    updateFacilityFilters,
  };
};

// ========================================
// Inventory Management Hook
// ========================================

export const useInventory = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectInventoryItems);
  const lowStockItems = useAppSelector(selectLowStockItems);
  const isLoading = useAppSelector(selectIsLoading);

  const loadItems = useCallback(
    (filters?: InventoryFilters) => {
      return dispatch(fetchInventoryItems(filters));
    },
    [dispatch],
  );

  const updateStock = useCallback(
    (itemId: string, quantity: number, type: "add" | "subtract" | "set") => {
      return dispatch(updateInventoryStock({ itemId, quantity, type }));
    },
    [dispatch],
  );

  const selectItem = useCallback(
    (item: InventoryItem | null) => {
      dispatch(setSelectedItem(item));
    },
    [dispatch],
  );

  const updateItemFilters = useCallback(
    (filters: Partial<InventoryFilters>) => {
      dispatch(setInventoryFilters(filters));
    },
    [dispatch],
  );

  return {
    items,
    lowStockItems,
    isLoading,
    loadItems,
    updateStock,
    selectItem,
    updateItemFilters,
  };
};

// ========================================
// Room Status Management Hook
// ========================================

export const useRoomStatus = () => {
  const dispatch = useAppDispatch();

  const updateStatus = useCallback(
    async (roomId: number, status: string, additionalData?: any) => {
      const updates = {
        status,
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };

      return dispatch(updateRoom({ roomId, updates }));
    },
    [dispatch],
  );

  const checkInGuest = useCallback(
    async (roomId: number, guestData: any) => {
      return updateStatus(roomId, "occupied", {
        currentGuest: guestData,
        availability: "occupied",
      });
    },
    [updateStatus],
  );

  const checkOutGuest = useCallback(
    async (roomId: number) => {
      return updateStatus(roomId, "cleaning", {
        currentGuest: null,
        availability: "dirty",
      });
    },
    [updateStatus],
  );

  const markRoomReady = useCallback(
    async (roomId: number) => {
      return updateStatus(roomId, "available", {
        availability: "ready",
        lastCleaning: new Date().toISOString(),
      });
    },
    [updateStatus],
  );

  const markRoomMaintenance = useCallback(
    async (roomId: number, maintenanceNotes?: string) => {
      return updateStatus(roomId, "maintenance", {
        availability: "maintenance",
        maintenanceNotes,
      });
    },
    [updateStatus],
  );

  return {
    updateStatus,
    checkInGuest,
    checkOutGuest,
    markRoomReady,
    markRoomMaintenance,
  };
};

// ========================================
// Real-time Updates Hook
// ========================================

export const useHotelOperationsRealtime = () => {
  const { handleRealtimeUpdate } = useHotelOperations();

  useEffect(() => {
    // Set up WebSocket subscription for real-time updates
    const cleanup = hotelOperationsService.subscribeToUpdates((event) => {
      handleRealtimeUpdate(event);
    });

    return cleanup;
  }, [handleRealtimeUpdate]);

  useEffect(() => {
    // Set up global window function for backward compatibility
    (window as any).updateHotelOperations = (data: any) => {
      handleRealtimeUpdate({
        type: data.type || "room-status",
        entityId: data.entityId,
        data,
        timestamp: data.timestamp || new Date().toISOString(),
        triggeredBy: data.triggeredBy || "system",
      });
    };

    return () => {
      (window as any).updateHotelOperations = undefined;
    };
  }, [handleRealtimeUpdate]);
};

// ========================================
// Analytics Hook
// ========================================

export const useHotelAnalytics = () => {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector(selectAnalytics);
  const rooms = useAppSelector(selectRooms);
  const tasks = useAppSelector(selectHousekeepingTasks);
  const requests = useAppSelector(selectMaintenanceRequests);

  const loadAnalytics = useCallback(
    (period?: string) => {
      return dispatch(fetchHotelOperationsAnalytics(period));
    },
    [dispatch],
  );

  // Computed metrics
  const occupancyRate =
    rooms.length > 0
      ? (rooms.filter((r) => r.status === "occupied").length / rooms.length) *
        100
      : 0;

  const housekeepingEfficiency =
    tasks.length > 0
      ? (tasks.filter((t) => t.status === "completed").length / tasks.length) *
        100
      : 0;

  const maintenanceBacklog = requests.filter(
    (r) =>
      r.status === "reported" ||
      r.status === "acknowledged" ||
      r.status === "assigned",
  ).length;

  return {
    analytics,
    occupancyRate,
    housekeepingEfficiency,
    maintenanceBacklog,
    loadAnalytics,
  };
};

// ========================================
// Bulk Operations Hook
// ========================================

export const useBulkOperations = () => {
  const bulkUpdateRoomStatus = useCallback(
    async (roomIds: number[], status: string) => {
      const result = await hotelOperationsService.bulkUpdateRoomStatus(
        roomIds,
        status,
      );
      return result;
    },
    [],
  );

  const bulkAssignTasks = useCallback(
    async (taskIds: string[], staffId: number) => {
      const result = await hotelOperationsService.bulkAssignTasks(
        taskIds,
        staffId,
      );
      return result;
    },
    [],
  );

  return {
    bulkUpdateRoomStatus,
    bulkAssignTasks,
  };
};
