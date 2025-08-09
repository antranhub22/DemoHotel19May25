/**
 * Staff Management Custom Hooks
 * Main hooks for staff management functionality
 */

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { staffManagementService } from "../services/staffManagementService";
import {
  addStaffUpdate,
  assignTask,
  checkInStaff,
  checkOutStaff,
  clearError,
  createSchedule,
  createStaff,
  createTask,
  deactivateStaff,
  fetchSchedules,
  fetchShifts,
  fetchStaff,
  fetchStaffAnalytics,
  fetchStaffById,
  fetchTasks,
  optimisticUpdateStaff,
  optimisticUpdateTask,
  resetStaffFilters,
  selectAnalytics,
  selectAvailableShifts,
  selectAvailableStaff,
  selectError,
  selectIsLoading,
  selectOnDutyStaff,
  selectSchedules,
  selectSelectedStaff,
  selectSelectedTask,
  selectStaff,
  selectStaffByDepartment,
  selectStaffFilters,
  selectStaffManagement,
  selectTasks,
  selectTasksByStaff,
  setSearchParams,
  setSelectedStaff,
  setSelectedTab,
  setSelectedTask,
  setStaffFilters,
  setTaskFilters,
  setViewMode,
  toggleFilters,
  updateStaff,
  updateStaffWorkload,
  updateTask,
  updateTaskProgress,
} from "../store/staffManagementSlice";
import {
  CreateStaffPayload,
  CreateTaskPayload,
  ScheduleStaffPayload,
  StaffDepartment,
  StaffFilters,
  StaffMember,
  StaffSearchParams,
  StaffTask,
  StaffUpdateEvent,
} from "../types/staffManagement.types";

// ========================================
// Main Staff Management Hook
// ========================================

export const useStaffManagement = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const staffManagement = useAppSelector(selectStaffManagement);
  const staff = useAppSelector(selectStaff);
  const selectedStaff = useAppSelector(selectSelectedStaff);
  const filters = useAppSelector(selectStaffFilters);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const analytics = useAppSelector(selectAnalytics);

  // ========================================
  // Staff Operations
  // ========================================

  const loadStaff = useCallback(
    (searchParams?: Partial<StaffSearchParams>) => {
      return dispatch(fetchStaff(searchParams));
    },
    [dispatch],
  );

  const loadStaffById = useCallback(
    (staffId: number) => {
      return dispatch(fetchStaffById(staffId));
    },
    [dispatch],
  );

  const createNewStaff = useCallback(
    (payload: CreateStaffPayload) => {
      return dispatch(createStaff(payload));
    },
    [dispatch],
  );

  const updateExistingStaff = useCallback(
    (staffId: number, updates: Partial<StaffMember>) => {
      // Optimistic update first
      dispatch(optimisticUpdateStaff({ id: staffId, updates }));

      // Then dispatch actual update
      return dispatch(updateStaff({ staffId, updates }));
    },
    [dispatch],
  );

  const deactivateStaffMember = useCallback(
    (staffId: number) => {
      return dispatch(deactivateStaff(staffId));
    },
    [dispatch],
  );

  // ========================================
  // Filter & Search Operations
  // ========================================

  const updateStaffFilters = useCallback(
    (newFilters: Partial<StaffFilters>) => {
      dispatch(setStaffFilters(newFilters));
    },
    [dispatch],
  );

  const clearStaffFilters = useCallback(() => {
    dispatch(resetStaffFilters());
  }, [dispatch]);

  const updateSearchParams = useCallback(
    (params: Partial<StaffSearchParams>) => {
      dispatch(setSearchParams(params));
    },
    [dispatch],
  );

  // ========================================
  // UI State Operations
  // ========================================

  const selectStaffMember = useCallback(
    (staff: StaffMember | null) => {
      dispatch(setSelectedStaff(staff));
    },
    [dispatch],
  );

  const changeTab = useCallback(
    (tab: "staff" | "tasks" | "schedules" | "performance") => {
      dispatch(setSelectedTab(tab));
    },
    [dispatch],
  );

  const changeViewMode = useCallback(
    (mode: "list" | "grid" | "calendar") => {
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
    (event: StaffUpdateEvent) => {
      dispatch(addStaffUpdate(event));
    },
    [dispatch],
  );

  // ========================================
  // Analytics Operations
  // ========================================

  const loadAnalytics = useCallback(() => {
    return dispatch(fetchStaffAnalytics());
  }, [dispatch]);

  // ========================================
  // Auto-refresh functionality
  // ========================================

  const setupAutoRefresh = useCallback(
    (intervalMs: number = 60000) => {
      const interval = setInterval(() => {
        dispatch(fetchStaff(staffManagement.searchParams));
      }, intervalMs);

      return () => clearInterval(interval);
    },
    [dispatch, staffManagement.searchParams],
  );

  // ========================================
  // Computed Values
  // ========================================

  const filteredStaff = staff.filter((staffMember) => {
    // Apply current filters
    if (filters.department && staffMember.department !== filters.department) {
      return false;
    }

    if (filters.role && staffMember.role !== filters.role) {
      return false;
    }

    if (
      filters.employmentStatus &&
      staffMember.employmentStatus !== filters.employmentStatus
    ) {
      return false;
    }

    if (
      filters.isOnDuty !== undefined &&
      staffMember.isOnDuty !== filters.isOnDuty
    ) {
      return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableFields = [
        staffMember.fullName,
        staffMember.email,
        staffMember.employeeId,
        staffMember.position,
      ];

      if (
        !searchableFields.some((field) => field.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (filters.skills?.length) {
      // Assuming staff has skills property (would need to add to types)
      // This is a placeholder for skills filtering
    }

    return true;
  });

  const staffByDepartment = filteredStaff.reduce(
    (acc, staffMember) => {
      if (!acc[staffMember.department]) {
        acc[staffMember.department] = [];
      }
      acc[staffMember.department].push(staffMember);
      return acc;
    },
    {} as Record<StaffDepartment, StaffMember[]>,
  );

  const staffCounts = {
    total: filteredStaff.length,
    active: filteredStaff.filter((s) => s.isActive).length,
    onDuty: filteredStaff.filter((s) => s.isOnDuty).length,
    available: filteredStaff.filter(
      (s) => s.isActive && s.isOnDuty && s.currentWorkload < 8,
    ).length,
  };

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    // State
    staff: filteredStaff,
    staffByDepartment,
    staffCounts,
    selectedStaff,
    filters,
    isLoading,
    error,
    analytics,

    // Full state access
    staffManagement,

    // Operations
    loadStaff,
    loadStaffById,
    createNewStaff,
    updateExistingStaff,
    deactivateStaffMember,

    // Filters & Search
    updateStaffFilters,
    clearStaffFilters,
    updateSearchParams,

    // UI State
    selectStaffMember,
    changeTab,
    changeViewMode,
    toggleFilterPanel,

    // Error handling
    clearCurrentError,

    // Real-time
    handleRealtimeUpdate,

    // Analytics
    loadAnalytics,

    // Utilities
    setupAutoRefresh,
  };
};

// ========================================
// Task Management Hook
// ========================================

export const useTaskManagement = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const selectedTask = useAppSelector(selectSelectedTask);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const loadTasks = useCallback(
    (filters?: Partial<StaffTask>) => {
      return dispatch(fetchTasks(filters));
    },
    [dispatch],
  );

  const createNewTask = useCallback(
    (payload: CreateTaskPayload) => {
      return dispatch(createTask(payload));
    },
    [dispatch],
  );

  const updateExistingTask = useCallback(
    (taskId: string, updates: Partial<StaffTask>) => {
      // Optimistic update first
      dispatch(optimisticUpdateTask({ id: taskId, updates }));

      // Then dispatch actual update
      return dispatch(updateTask({ taskId, updates }));
    },
    [dispatch],
  );

  const assignTaskToStaff = useCallback(
    (taskId: string, staffId: number) => {
      return dispatch(assignTask({ taskId, staffId }));
    },
    [dispatch],
  );

  const updateProgress = useCallback(
    (taskId: string, progress: number) => {
      dispatch(updateTaskProgress({ taskId, progress }));
    },
    [dispatch],
  );

  const selectTask = useCallback(
    (task: StaffTask | null) => {
      dispatch(setSelectedTask(task));
    },
    [dispatch],
  );

  const updateTaskFilters = useCallback(
    (filters: Partial<StaffTask>) => {
      dispatch(setTaskFilters(filters));
    },
    [dispatch],
  );

  return {
    tasks,
    selectedTask,
    isLoading,
    error,
    loadTasks,
    createNewTask,
    updateExistingTask,
    assignTaskToStaff,
    updateProgress,
    selectTask,
    updateTaskFilters,
  };
};

// ========================================
// Schedule Management Hook
// ========================================

export const useScheduleManagement = () => {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(selectSchedules);
  const availableShifts = useAppSelector(selectAvailableShifts);
  const isLoading = useAppSelector(selectIsLoading);

  const loadSchedules = useCallback(
    (startDate?: string, endDate?: string) => {
      return dispatch(fetchSchedules({ startDate, endDate }));
    },
    [dispatch],
  );

  const loadShifts = useCallback(() => {
    return dispatch(fetchShifts());
  }, [dispatch]);

  const createNewSchedule = useCallback(
    (payload: ScheduleStaffPayload) => {
      return dispatch(createSchedule(payload));
    },
    [dispatch],
  );

  const checkIn = useCallback(
    (staffId: number) => {
      return dispatch(checkInStaff(staffId));
    },
    [dispatch],
  );

  const checkOut = useCallback(
    (staffId: number) => {
      return dispatch(checkOutStaff(staffId));
    },
    [dispatch],
  );

  return {
    schedules,
    availableShifts,
    isLoading,
    loadSchedules,
    loadShifts,
    createNewSchedule,
    checkIn,
    checkOut,
  };
};

// ========================================
// Attendance Hook
// ========================================

export const useAttendance = () => {
  const dispatch = useAppDispatch();
  const onDutyStaff = useAppSelector(selectOnDutyStaff);
  const availableStaff = useAppSelector(selectAvailableStaff);

  const checkInStaffMember = useCallback(
    (staffId: number) => {
      return dispatch(checkInStaff(staffId));
    },
    [dispatch],
  );

  const checkOutStaffMember = useCallback(
    (staffId: number) => {
      return dispatch(checkOutStaff(staffId));
    },
    [dispatch],
  );

  return {
    onDutyStaff,
    availableStaff,
    checkInStaffMember,
    checkOutStaffMember,
  };
};

// ========================================
// Department Management Hook
// ========================================

export const useDepartmentManagement = () => {
  const getStaffByDepartment = useCallback((department: StaffDepartment) => {
    return useAppSelector(selectStaffByDepartment(department));
  }, []);

  const getTasksByStaff = useCallback((staffId: number) => {
    return useAppSelector(selectTasksByStaff(staffId));
  }, []);

  return {
    getStaffByDepartment,
    getTasksByStaff,
  };
};

// ========================================
// Workload Management Hook
// ========================================

export const useWorkloadManagement = () => {
  const dispatch = useAppDispatch();

  const updateWorkload = useCallback(
    (staffId: number, workload: number) => {
      dispatch(updateStaffWorkload({ staffId, workload }));
    },
    [dispatch],
  );

  const calculateWorkload = useCallback((tasks: StaffTask[]): number => {
    return tasks.filter(
      (task) => task.status === "assigned" || task.status === "in-progress",
    ).length;
  }, []);

  const getWorkloadStatus = useCallback(
    (workload: number): "low" | "medium" | "high" | "overloaded" => {
      if (workload <= 3) return "low";
      if (workload <= 6) return "medium";
      if (workload <= 9) return "high";
      return "overloaded";
    },
    [],
  );

  return {
    updateWorkload,
    calculateWorkload,
    getWorkloadStatus,
  };
};

// ========================================
// Real-time Updates Hook
// ========================================

export const useStaffRealtime = () => {
  const { handleRealtimeUpdate } = useStaffManagement();

  useEffect(() => {
    // Set up WebSocket subscription for real-time updates
    const cleanup = staffManagementService.subscribeToUpdates((event) => {
      handleRealtimeUpdate(event);
    });

    return cleanup;
  }, [handleRealtimeUpdate]);

  useEffect(() => {
    // Set up global window function for backward compatibility
    (window as any).updateStaffStatus = (data: any) => {
      handleRealtimeUpdate({
        type: data.type || "staff-update",
        staffId: data.staffId,
        data,
        timestamp: data.timestamp || new Date().toISOString(),
        triggeredBy: data.triggeredBy || "system",
      });
    };

    return () => {
      (window as any).updateStaffStatus = undefined;
    };
  }, [handleRealtimeUpdate]);
};
