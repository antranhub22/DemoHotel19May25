/**
 * Staff Management Redux Slice
 * Domain-driven state management for staff system
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { staffManagementService } from "../services/staffManagementService";
import {
  CreateStaffPayload,
  CreateTaskPayload,
  ScheduleStaffPayload,
  StaffAnalytics,
  StaffFilters,
  StaffManagementState,
  StaffMember,
  StaffResponse,
  StaffSchedule,
  StaffSearchParams,
  StaffTask,
  StaffUpdateEvent,
  UpdateStaffPayload,
  UpdateTaskPayload,
  WorkShift,
} from "../types/staffManagement.types";

// ========================================
// Initial State
// ========================================

const initialStaffFilters: StaffFilters = {
  searchQuery: "",
};

const initialSearchParams: StaffSearchParams = {
  filters: initialStaffFilters,
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  limit: 50,
};

const initialState: StaffManagementState = {
  // Staff data
  staff: [],
  selectedStaff: null,

  // Tasks data
  tasks: [],
  selectedTask: null,

  // Schedules data
  schedules: [],
  availableShifts: [],

  // Performance data
  performanceData: {},
  analytics: null,

  // Loading states
  isLoading: false,
  isUpdating: false,
  isSaving: false,

  // Filters & search
  staffFilters: initialStaffFilters,
  taskFilters: {},
  searchParams: initialSearchParams,

  // UI state
  selectedTab: "staff",
  viewMode: "list",
  showFilters: false,

  // Error handling
  error: null,
  lastError: null,

  // Real-time updates
  lastUpdate: null,

  // Permissions & roles
  currentUserPermissions: [],
  roleDefinitions: [],
};

// ========================================
// Async Thunks
// ========================================

// Staff Operations
export const fetchStaff = createAsyncThunk(
  "staffManagement/fetchStaff",
  async (
    searchParams: Partial<StaffSearchParams> | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await staffManagementService.getStaff(searchParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch staff");
    }
  },
);

export const fetchStaffById = createAsyncThunk(
  "staffManagement/fetchStaffById",
  async (staffId: number, { rejectWithValue }) => {
    try {
      const staff = await staffManagementService.getStaffById(staffId);
      return staff;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch staff member");
    }
  },
);

export const createStaff = createAsyncThunk(
  "staffManagement/createStaff",
  async (payload: CreateStaffPayload, { rejectWithValue }) => {
    try {
      const newStaff = await staffManagementService.createStaff(payload);
      return newStaff;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create staff member");
    }
  },
);

export const updateStaff = createAsyncThunk(
  "staffManagement/updateStaff",
  async (payload: UpdateStaffPayload, { rejectWithValue }) => {
    try {
      const updatedStaff = await staffManagementService.updateStaff(
        payload.staffId,
        payload.updates,
      );
      return updatedStaff;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update staff member");
    }
  },
);

export const deactivateStaff = createAsyncThunk(
  "staffManagement/deactivateStaff",
  async (staffId: number, { rejectWithValue }) => {
    try {
      await staffManagementService.deactivateStaff(staffId);
      return staffId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to deactivate staff member",
      );
    }
  },
);

// Task Operations
export const fetchTasks = createAsyncThunk(
  "staffManagement/fetchTasks",
  async (filters: Partial<StaffTask> | undefined, { rejectWithValue }) => {
    try {
      const tasks = await staffManagementService.getTasks(filters);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch tasks");
    }
  },
);

export const createTask = createAsyncThunk(
  "staffManagement/createTask",
  async (payload: CreateTaskPayload, { rejectWithValue }) => {
    try {
      const newTask = await staffManagementService.createTask(payload);
      return newTask;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create task");
    }
  },
);

export const updateTask = createAsyncThunk(
  "staffManagement/updateTask",
  async (payload: UpdateTaskPayload, { rejectWithValue }) => {
    try {
      const updatedTask = await staffManagementService.updateTask(
        payload.taskId,
        payload.updates,
      );
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update task");
    }
  },
);

export const assignTask = createAsyncThunk(
  "staffManagement/assignTask",
  async (
    { taskId, staffId }: { taskId: string; staffId: number },
    { rejectWithValue },
  ) => {
    try {
      const updatedTask = await staffManagementService.assignTask(
        taskId,
        staffId,
      );
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to assign task");
    }
  },
);

// Schedule Operations
export const fetchSchedules = createAsyncThunk(
  "staffManagement/fetchSchedules",
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue },
  ) => {
    try {
      const schedules = await staffManagementService.getSchedules(
        startDate,
        endDate,
      );
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch schedules");
    }
  },
);

export const createSchedule = createAsyncThunk(
  "staffManagement/createSchedule",
  async (payload: ScheduleStaffPayload, { rejectWithValue }) => {
    try {
      const newSchedule = await staffManagementService.createSchedule(payload);
      return newSchedule;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create schedule");
    }
  },
);

export const checkInStaff = createAsyncThunk(
  "staffManagement/checkIn",
  async (staffId: number, { rejectWithValue }) => {
    try {
      const result = await staffManagementService.checkIn(staffId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check in");
    }
  },
);

export const checkOutStaff = createAsyncThunk(
  "staffManagement/checkOut",
  async (staffId: number, { rejectWithValue }) => {
    try {
      const result = await staffManagementService.checkOut(staffId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check out");
    }
  },
);

// Analytics Operations
export const fetchStaffAnalytics = createAsyncThunk(
  "staffManagement/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const analytics = await staffManagementService.getStaffAnalytics();
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch analytics");
    }
  },
);

export const fetchShifts = createAsyncThunk(
  "staffManagement/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const shifts = await staffManagementService.getShifts();
      return shifts;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch shifts");
    }
  },
);

// ========================================
// Redux Slice
// ========================================

const staffManagementSlice = createSlice({
  name: "staffManagement",
  initialState,
  reducers: {
    // UI State Management
    setSelectedStaff: (state, action: PayloadAction<StaffMember | null>) => {
      state.selectedStaff = action.payload;
    },

    setSelectedTask: (state, action: PayloadAction<StaffTask | null>) => {
      state.selectedTask = action.payload;
    },

    setStaffFilters: (state, action: PayloadAction<Partial<StaffFilters>>) => {
      state.staffFilters = { ...state.staffFilters, ...action.payload };
    },

    setTaskFilters: (state, action: PayloadAction<Partial<StaffTask>>) => {
      state.taskFilters = { ...state.taskFilters, ...action.payload };
    },

    resetStaffFilters: (state) => {
      state.staffFilters = initialStaffFilters;
    },

    setSearchParams: (
      state,
      action: PayloadAction<Partial<StaffSearchParams>>,
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },

    setSelectedTab: (
      state,
      action: PayloadAction<"staff" | "tasks" | "schedules" | "performance">,
    ) => {
      state.selectedTab = action.payload;
    },

    setViewMode: (
      state,
      action: PayloadAction<"list" | "grid" | "calendar">,
    ) => {
      state.viewMode = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    // Real-time Updates
    addStaffUpdate: (state, action: PayloadAction<StaffUpdateEvent>) => {
      const update = action.payload;
      state.lastUpdate = update.timestamp;

      // Apply update based on type
      if (update.type === "staff-update") {
        const staffIndex = state.staff.findIndex(
          (s) => s.id === update.staffId,
        );
        if (staffIndex !== -1) {
          state.staff[staffIndex] = {
            ...state.staff[staffIndex],
            ...update.data,
          };
        }
        if (state.selectedStaff?.id === update.staffId) {
          state.selectedStaff = { ...state.selectedStaff, ...update.data };
        }
      } else if (update.type === "check-in" || update.type === "check-out") {
        const staffIndex = state.staff.findIndex(
          (s) => s.id === update.staffId,
        );
        if (staffIndex !== -1) {
          state.staff[staffIndex].isOnDuty = update.type === "check-in";
          if (update.type === "check-in") {
            state.staff[staffIndex].lastCheckIn = update.timestamp;
          } else {
            state.staff[staffIndex].lastCheckOut = update.timestamp;
          }
        }
      } else if (update.type === "task-assignment") {
        // Update task assignment
        const taskIndex = state.tasks.findIndex(
          (t) => t.id === update.data.taskId,
        );
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            ...update.data,
          };
        }
      }
    },

    // Task Management
    updateTaskProgress: (
      state,
      action: PayloadAction<{ taskId: string; progress: number }>,
    ) => {
      const { taskId, progress } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].progress = progress;
        if (progress === 100) {
          state.tasks[taskIndex].status = "completed";
          state.tasks[taskIndex].completedAt = new Date().toISOString();
        }
      }
      if (state.selectedTask?.id === taskId) {
        state.selectedTask.progress = progress;
        if (progress === 100) {
          state.selectedTask.status = "completed";
          state.selectedTask.completedAt = new Date().toISOString();
        }
      }
    },

    // Staff Workload Management
    updateStaffWorkload: (
      state,
      action: PayloadAction<{ staffId: number; workload: number }>,
    ) => {
      const { staffId, workload } = action.payload;
      const staffIndex = state.staff.findIndex((s) => s.id === staffId);
      if (staffIndex !== -1) {
        state.staff[staffIndex].currentWorkload = workload;
      }
      if (state.selectedStaff?.id === staffId) {
        state.selectedStaff.currentWorkload = workload;
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
    optimisticUpdateStaff: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<StaffMember> }>,
    ) => {
      const { id, updates } = action.payload;
      const staffIndex = state.staff.findIndex((s) => s.id === id);
      if (staffIndex !== -1) {
        state.staff[staffIndex] = { ...state.staff[staffIndex], ...updates };
      }
      if (state.selectedStaff?.id === id) {
        state.selectedStaff = { ...state.selectedStaff, ...updates };
      }
    },

    optimisticUpdateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<StaffTask> }>,
    ) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
      if (state.selectedTask?.id === id) {
        state.selectedTask = { ...state.selectedTask, ...updates };
      }
    },

    // Reset state
    resetStaffManagement: () => initialState,
  },

  extraReducers: (builder) => {
    // Fetch Staff
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStaff.fulfilled,
        (state, action: PayloadAction<StaffResponse>) => {
          state.isLoading = false;
          state.staff = action.payload.staff;
          state.lastUpdate = new Date().toISOString();
        },
      )
      .addCase(fetchStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Staff by ID
    builder
      .addCase(fetchStaffById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchStaffById.fulfilled,
        (state, action: PayloadAction<StaffMember>) => {
          state.isLoading = false;
          state.selectedStaff = action.payload;
          // Update in staff array if it exists
          const staffIndex = state.staff.findIndex(
            (s) => s.id === action.payload.id,
          );
          if (staffIndex !== -1) {
            state.staff[staffIndex] = action.payload;
          }
        },
      )
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Staff
    builder
      .addCase(createStaff.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(
        createStaff.fulfilled,
        (state, action: PayloadAction<StaffMember>) => {
          state.isSaving = false;
          state.staff.unshift(action.payload);
        },
      )
      .addCase(createStaff.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Staff
    builder
      .addCase(updateStaff.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateStaff.fulfilled,
        (state, action: PayloadAction<StaffMember>) => {
          state.isUpdating = false;
          const staffIndex = state.staff.findIndex(
            (s) => s.id === action.payload.id,
          );
          if (staffIndex !== -1) {
            state.staff[staffIndex] = action.payload;
          }
          if (state.selectedStaff?.id === action.payload.id) {
            state.selectedStaff = action.payload;
          }
        },
      )
      .addCase(updateStaff.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Deactivate Staff
    builder
      .addCase(deactivateStaff.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(
        deactivateStaff.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.isUpdating = false;
          const staffIndex = state.staff.findIndex(
            (s) => s.id === action.payload,
          );
          if (staffIndex !== -1) {
            state.staff[staffIndex].isActive = false;
            state.staff[staffIndex].employmentStatus = "inactive";
          }
          if (state.selectedStaff?.id === action.payload) {
            state.selectedStaff.isActive = false;
            state.selectedStaff.employmentStatus = "inactive";
          }
        },
      )
      .addCase(deactivateStaff.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchTasks.fulfilled,
        (state, action: PayloadAction<StaffTask[]>) => {
          state.isLoading = false;
          state.tasks = action.payload;
        },
      )
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(
        createTask.fulfilled,
        (state, action: PayloadAction<StaffTask>) => {
          state.isSaving = false;
          state.tasks.unshift(action.payload);
        },
      )
      .addCase(createTask.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(
        updateTask.fulfilled,
        (state, action: PayloadAction<StaffTask>) => {
          state.isUpdating = false;
          const taskIndex = state.tasks.findIndex(
            (t) => t.id === action.payload.id,
          );
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = action.payload;
          }
          if (state.selectedTask?.id === action.payload.id) {
            state.selectedTask = action.payload;
          }
        },
      )
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Assign Task
    builder
      .addCase(assignTask.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(
        assignTask.fulfilled,
        (state, action: PayloadAction<StaffTask>) => {
          state.isUpdating = false;
          const taskIndex = state.tasks.findIndex(
            (t) => t.id === action.payload.id,
          );
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = action.payload;
          }
          // Update staff workload
          const staffIndex = state.staff.findIndex(
            (s) => s.id === action.payload.assignedTo,
          );
          if (staffIndex !== -1) {
            state.staff[staffIndex].tasksAssigned += 1;
            state.staff[staffIndex].currentWorkload += 1;
          }
        },
      )
      .addCase(assignTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchSchedules.fulfilled,
        (state, action: PayloadAction<StaffSchedule[]>) => {
          state.isLoading = false;
          state.schedules = action.payload;
        },
      )
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(
        createSchedule.fulfilled,
        (state, action: PayloadAction<StaffSchedule>) => {
          state.isSaving = false;
          state.schedules.push(action.payload);
        },
      )
      .addCase(createSchedule.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Check In/Out
    builder
      .addCase(
        checkInStaff.fulfilled,
        (
          state,
          action: PayloadAction<{ staffId: number; checkInTime: string }>,
        ) => {
          const { staffId, checkInTime } = action.payload;
          const staffIndex = state.staff.findIndex((s) => s.id === staffId);
          if (staffIndex !== -1) {
            state.staff[staffIndex].isOnDuty = true;
            state.staff[staffIndex].lastCheckIn = checkInTime;
          }
        },
      )
      .addCase(
        checkOutStaff.fulfilled,
        (
          state,
          action: PayloadAction<{ staffId: number; checkOutTime: string }>,
        ) => {
          const { staffId, checkOutTime } = action.payload;
          const staffIndex = state.staff.findIndex((s) => s.id === staffId);
          if (staffIndex !== -1) {
            state.staff[staffIndex].isOnDuty = false;
            state.staff[staffIndex].lastCheckOut = checkOutTime;
          }
        },
      );

    // Fetch Analytics
    builder
      .addCase(fetchStaffAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchStaffAnalytics.fulfilled,
        (state, action: PayloadAction<StaffAnalytics>) => {
          state.isLoading = false;
          state.analytics = action.payload;
        },
      )
      .addCase(fetchStaffAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Shifts
    builder.addCase(
      fetchShifts.fulfilled,
      (state, action: PayloadAction<WorkShift[]>) => {
        state.availableShifts = action.payload;
      },
    );
  },
});

// ========================================
// Actions Export
// ========================================

export const {
  setSelectedStaff,
  setSelectedTask,
  setStaffFilters,
  setTaskFilters,
  resetStaffFilters,
  setSearchParams,
  setSelectedTab,
  setViewMode,
  toggleFilters,
  addStaffUpdate,
  updateTaskProgress,
  updateStaffWorkload,
  clearError,
  setError,
  optimisticUpdateStaff,
  optimisticUpdateTask,
  resetStaffManagement,
} = staffManagementSlice.actions;

// ========================================
// Selectors
// ========================================

export const selectStaffManagement = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement;

export const selectStaff = (state: { staffManagement: StaffManagementState }) =>
  state.staffManagement.staff;

export const selectSelectedStaff = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.selectedStaff;

export const selectTasks = (state: { staffManagement: StaffManagementState }) =>
  state.staffManagement.tasks;

export const selectSelectedTask = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.selectedTask;

export const selectStaffFilters = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.staffFilters;

export const selectIsLoading = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.isLoading;

export const selectError = (state: { staffManagement: StaffManagementState }) =>
  state.staffManagement.error;

export const selectAnalytics = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.analytics;

export const selectSchedules = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.schedules;

export const selectAvailableShifts = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.availableShifts;

// Complex selectors
export const selectOnDutyStaff = (state: {
  staffManagement: StaffManagementState;
}) => state.staffManagement.staff.filter((staff) => staff.isOnDuty);

export const selectStaffByDepartment =
  (department: string) => (state: { staffManagement: StaffManagementState }) =>
    state.staffManagement.staff.filter(
      (staff) => staff.department === department,
    );

export const selectTasksByStaff =
  (staffId: number) => (state: { staffManagement: StaffManagementState }) =>
    state.staffManagement.tasks.filter((task) => task.assignedTo === staffId);

export const selectAvailableStaff = (state: {
  staffManagement: StaffManagementState;
}) =>
  state.staffManagement.staff.filter(
    (staff) => staff.isActive && staff.isOnDuty && staff.currentWorkload < 10, // Assuming 10 is max workload
  );

// ========================================
// Default Export
// ========================================

export default staffManagementSlice.reducer;
