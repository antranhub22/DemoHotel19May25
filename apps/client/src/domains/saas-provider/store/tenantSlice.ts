/**
 * SaaS Provider Domain - Tenant Management Slice
 * Manages multi-tenant state, subscription, and features
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger } from "@shared/utils/logger";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  TenantData,
  UsageAlert,
  WhiteLabelConfig,
} from "../types/saasProvider.types";

// Initial State
export interface TenantState {
  // Current tenant context
  currentTenant: TenantData | null;
  isLoading: boolean;
  error: string | null;

  // Multi-tenant management (for SaaS admins)
  allTenants: TenantData[];
  tenantSearch: {
    query: string;
    filters: {
      subscriptionPlan: SubscriptionPlan | "all";
      subscriptionStatus: SubscriptionStatus | "all";
      sortBy: "name" | "created" | "usage" | "revenue";
      sortOrder: "asc" | "desc";
    };
    results: TenantData[];
    isSearching: boolean;
  };

  // Usage tracking
  usageAlerts: UsageAlert[];
  realTimeUsage: {
    [tenantId: string]: {
      currentCalls: number;
      monthlyMinutes: number;
      apiCalls: number;
      lastUpdated: Date;
    };
  };

  // Feature management
  featureGating: {
    [feature: string]: {
      enabled: boolean;
      requiredPlan: SubscriptionPlan;
      usageCount: number;
      lastAccessed: Date;
    };
  };

  // White-label configurations
  whiteLabelConfigs: {
    [tenantId: string]: WhiteLabelConfig;
  };

  // Platform analytics (for SaaS providers)
  platformMetrics: {
    totalTenants: number;
    totalRevenue: number;
    totalUsage: {
      calls: number;
      minutes: number;
      apiCalls: number;
    };
    conversionRates: {
      trialToBasic: number;
      basicToPremium: number;
      premiumToEnterprise: number;
    };
    churnRate: number;
    lastUpdated: Date;
  } | null;
}

const initialState: TenantState = {
  currentTenant: null,
  isLoading: false,
  error: null,
  allTenants: [],
  tenantSearch: {
    query: "",
    filters: {
      subscriptionPlan: "all",
      subscriptionStatus: "all",
      sortBy: "created",
      sortOrder: "desc",
    },
    results: [],
    isSearching: false,
  },
  usageAlerts: [],
  realTimeUsage: {},
  featureGating: {},
  whiteLabelConfigs: {},
  platformMetrics: null,
};

// Async Thunks for API calls
export const fetchCurrentTenant = createAsyncThunk(
  "tenant/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tenant/current");
      if (!response.ok) {
        throw new Error("Failed to fetch tenant data");
      }
      const data = await response.json();
      return data.tenant;
    } catch (error: any) {
      logger.error("[TenantSlice] Failed to fetch current tenant", error);
      return rejectWithValue(error.message);
    }
  },
);

export const updateSubscriptionPlan = createAsyncThunk(
  "tenant/updateSubscription",
  async (
    { tenantId, newPlan }: { tenantId: string; newPlan: SubscriptionPlan },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`/api/tenant/${tenantId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionPlan: newPlan }),
      });
      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }
      const data = await response.json();
      return data.tenant;
    } catch (error: any) {
      logger.error("[TenantSlice] Failed to update subscription", error);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPlatformMetrics = createAsyncThunk(
  "tenant/fetchPlatformMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/platform/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch platform metrics");
      }
      const data = await response.json();
      return data.metrics;
    } catch (error: any) {
      logger.error("[TenantSlice] Failed to fetch platform metrics", error);
      return rejectWithValue(error.message);
    }
  },
);

// Tenant Slice
export const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    // Current tenant management
    setCurrentTenant: (state, action: PayloadAction<TenantData>) => {
      state.currentTenant = action.payload;
      state.error = null;
    },

    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },

    updateTenantUsage: (
      state,
      action: PayloadAction<{
        tenantId: string;
        usage: Partial<TenantData["usage"]>;
      }>,
    ) => {
      const { tenantId, usage } = action.payload;

      if (state.currentTenant && state.currentTenant.id === tenantId) {
        state.currentTenant.usage = { ...state.currentTenant.usage, ...usage };
      }

      // Update in allTenants if present
      const tenantIndex = state.allTenants.findIndex((t) => t.id === tenantId);
      if (tenantIndex !== -1) {
        state.allTenants[tenantIndex].usage = {
          ...state.allTenants[tenantIndex].usage,
          ...usage,
        };
      }
    },

    // Feature gating
    checkFeatureAccess: (
      state,
      action: PayloadAction<{ feature: string; tenantPlan: SubscriptionPlan }>,
    ) => {
      const { feature, tenantPlan } = action.payload;

      if (!state.featureGating[feature]) {
        state.featureGating[feature] = {
          enabled: false,
          requiredPlan: "basic",
          usageCount: 0,
          lastAccessed: new Date(),
        };
      }

      const featureConfig = state.featureGating[feature];
      featureConfig.usageCount += 1;
      featureConfig.lastAccessed = new Date();

      // Determine if feature is enabled based on subscription plan
      const planHierarchy: SubscriptionPlan[] = [
        "trial",
        "basic",
        "premium",
        "enterprise",
      ];
      const currentPlanIndex = planHierarchy.indexOf(tenantPlan);
      const requiredPlanIndex = planHierarchy.indexOf(
        featureConfig.requiredPlan,
      );
      featureConfig.enabled = currentPlanIndex >= requiredPlanIndex;
    },

    // Usage alerts
    addUsageAlert: (state, action: PayloadAction<UsageAlert>) => {
      state.usageAlerts.push(action.payload);
    },

    removeUsageAlert: (state, action: PayloadAction<string>) => {
      state.usageAlerts = state.usageAlerts.filter(
        (alert) => alert.id !== action.payload,
      );
    },

    // Real-time usage tracking
    updateRealTimeUsage: (
      state,
      action: PayloadAction<{
        tenantId: string;
        usage: {
          currentCalls?: number;
          monthlyMinutes?: number;
          apiCalls?: number;
        };
      }>,
    ) => {
      const { tenantId, usage } = action.payload;

      if (!state.realTimeUsage[tenantId]) {
        state.realTimeUsage[tenantId] = {
          currentCalls: 0,
          monthlyMinutes: 0,
          apiCalls: 0,
          lastUpdated: new Date(),
        };
      }

      state.realTimeUsage[tenantId] = {
        ...state.realTimeUsage[tenantId],
        ...usage,
        lastUpdated: new Date(),
      };
    },

    // Tenant search and filtering
    setTenantSearchQuery: (state, action: PayloadAction<string>) => {
      state.tenantSearch.query = action.payload;
    },

    setTenantSearchFilters: (
      state,
      action: PayloadAction<Partial<TenantState["tenantSearch"]["filters"]>>,
    ) => {
      state.tenantSearch.filters = {
        ...state.tenantSearch.filters,
        ...action.payload,
      };
    },

    setTenantSearchResults: (state, action: PayloadAction<TenantData[]>) => {
      state.tenantSearch.results = action.payload;
    },

    // White-label configuration
    setWhiteLabelConfig: (
      state,
      action: PayloadAction<{ tenantId: string; config: WhiteLabelConfig }>,
    ) => {
      const { tenantId, config } = action.payload;
      state.whiteLabelConfigs[tenantId] = config;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Platform metrics
    updatePlatformMetrics: (
      state,
      action: PayloadAction<Partial<TenantState["platformMetrics"]>>,
    ) => {
      if (state.platformMetrics) {
        state.platformMetrics = {
          ...state.platformMetrics,
          ...action.payload,
          lastUpdated: new Date(),
        };
      }
    },
  },

  extraReducers: (builder) => {
    // Fetch current tenant
    builder
      .addCase(fetchCurrentTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;
      })
      .addCase(fetchCurrentTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update subscription plan
    builder
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;

        // Update in allTenants if present
        const tenantIndex = state.allTenants.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (tenantIndex !== -1) {
          state.allTenants[tenantIndex] = action.payload;
        }
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch platform metrics
    builder.addCase(fetchPlatformMetrics.fulfilled, (state, action) => {
      state.platformMetrics = action.payload;
    });
  },
});

// Actions
export const {
  setCurrentTenant,
  clearCurrentTenant,
  updateTenantUsage,
  checkFeatureAccess,
  addUsageAlert,
  removeUsageAlert,
  updateRealTimeUsage,
  setTenantSearchQuery,
  setTenantSearchFilters,
  setTenantSearchResults,
  setWhiteLabelConfig,
  setError,
  setLoading,
  updatePlatformMetrics,
} = tenantSlice.actions;

// Selectors
export const selectCurrentTenant = (state: { tenant: TenantState }) =>
  state.tenant.currentTenant;
export const selectTenantLoading = (state: { tenant: TenantState }) =>
  state.tenant.isLoading;
export const selectTenantError = (state: { tenant: TenantState }) =>
  state.tenant.error;
export const selectUsageAlerts = (state: { tenant: TenantState }) =>
  state.tenant.usageAlerts;
export const selectFeatureAccess =
  (feature: string) => (state: { tenant: TenantState }) =>
    state.tenant.featureGating[feature];
export const selectPlatformMetrics = (state: { tenant: TenantState }) =>
  state.tenant.platformMetrics;

export const selectTenantFeatures = (state: { tenant: TenantState }) => {
  const tenant = state.tenant.currentTenant;
  if (!tenant) return null;
  return tenant.features;
};

export const selectTenantLimits = (state: { tenant: TenantState }) => {
  const tenant = state.tenant.currentTenant;
  if (!tenant) return null;
  return tenant.limits;
};

export const selectTenantUsage = (state: { tenant: TenantState }) => {
  const tenant = state.tenant.currentTenant;
  if (!tenant) return null;
  return tenant.usage;
};

export const selectCanAccessFeature =
  (feature: string) => (state: { tenant: TenantState }) => {
    const tenant = state.tenant.currentTenant;
    if (!tenant) return false;

    const featureAccess = state.tenant.featureGating[feature];
    if (!featureAccess) return false;

    return featureAccess.enabled;
  };

export default tenantSlice.reducer;
