/**
 * Platform Admin Hooks
 * React hooks for SaaS platform administration
 */

import logger from '@shared/utils/logger';
import { useCallback, useEffect, useState } from "react";
import { platformAdminService } from "../services/platformAdminService";
import {
  FeatureFlag,
  PlatformMetrics,
  RevenueReport,
  SubscriptionPlan,
  SubscriptionStatus,
  SystemHealth,
  TenantData,
  TenantListItem,
} from "../types/saasProvider.types";

// ================================
// MAIN PLATFORM ADMIN HOOK
// ================================

export const usePlatformAdmin = () => {
  const [state, setState] = useState({
    metrics: null as PlatformMetrics | null,
    tenants: [] as TenantListItem[],
    selectedTenant: null as TenantData | null,
    systemHealth: null as SystemHealth | null,
    featureFlags: [] as FeatureFlag[],
    revenueReport: null as RevenueReport | null,

    // Loading states
    isLoadingMetrics: false,
    isLoadingTenants: false,
    isLoadingHealth: false,
    isLoadingFlags: false,
    isLoadingReport: false,

    // Filters
    tenantFilters: {
      status: undefined as SubscriptionStatus | undefined,
      plan: undefined as SubscriptionPlan | undefined,
      search: undefined as string | undefined,
    },

    // Error handling
    error: null as string | null,
  });

  // ================================
  // PLATFORM METRICS
  // ================================

  const fetchMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingMetrics: true, error: null }));

    try {
      logger.debug("[usePlatformAdmin] Fetching platform metrics");
      const metrics = await platformAdminService.fetchPlatformMetrics();

      setState((prev) => ({
        ...prev,
        metrics,
        isLoadingMetrics: false,
      }));

      logger.debug("[usePlatformAdmin] Platform metrics fetched successfully");
    } catch (error) {
      logger.error("[usePlatformAdmin] Error fetching metrics:", error);
      setState((prev) => ({
        ...prev,
        isLoadingMetrics: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch metrics",
      }));
    }
  }, []);

  const fetchGrowthTrends = useCallback(
    async (period: "7d" | "30d" | "90d" | "1y") => {
      try {
        logger.debug(
          "[usePlatformAdmin] Fetching growth trends for period:",
          period,
        );
        const trends = await platformAdminService.fetchGrowthTrends(period);

        // Update metrics with growth trends
        setState((prev) => ({
          ...prev,
          metrics: prev.metrics
            ? {
                ...prev.metrics,
                revenueTimeSeries: trends.revenueGrowth.map((item) => ({
                  date: item.date,
                  revenue: item.revenue,
                  subscriptions: 0, // Will be populated from actual data
                })),
              }
            : null,
        }));

        return trends;
      } catch (error) {
        logger.error("[usePlatformAdmin] Error fetching growth trends:", error);
        throw error;
      }
    },
    [],
  );

  // ================================
  // TENANT MANAGEMENT
  // ================================

  const fetchTenants = useCallback(
    async (filters = state.tenantFilters) => {
      setState((prev) => ({ ...prev, isLoadingTenants: true, error: null }));

      try {
        logger.debug(
          "[usePlatformAdmin] Fetching tenants with filters:",
          filters,
        );
        const { tenants } = await platformAdminService.fetchTenants(filters);

        setState((prev) => ({
          ...prev,
          tenants,
          tenantFilters: filters,
          isLoadingTenants: false,
        }));

        logger.debug("[usePlatformAdmin] Tenants fetched successfully", {
          count: tenants.length,
        });
      } catch (error) {
        logger.error("[usePlatformAdmin] Error fetching tenants:", error);
        setState((prev) => ({
          ...prev,
          isLoadingTenants: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch tenants",
        }));
      }
    },
    [state.tenantFilters],
  );

  const fetchTenantDetails = useCallback(async (tenantId: string) => {
    try {
      logger.debug("[usePlatformAdmin] Fetching tenant details for:", tenantId);
      const tenant = await platformAdminService.fetchTenantDetails(tenantId);

      setState((prev) => ({
        ...prev,
        selectedTenant: tenant,
      }));

      logger.debug("[usePlatformAdmin] Tenant details fetched successfully");
      return tenant;
    } catch (error) {
      logger.error("[usePlatformAdmin] Error fetching tenant details:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tenant details",
      }));
      throw error;
    }
  }, []);

  const updateTenantStatus = useCallback(
    async (
      tenantId: string,
      action: "suspend" | "activate" | "delete",
      reason?: string,
    ) => {
      try {
        logger.debug("[usePlatformAdmin] Updating tenant status:", {
          tenantId,
          action,
          reason,
        });
        await platformAdminService.updateTenantStatus(tenantId, action, reason);

        // Refresh tenants list
        await fetchTenants();

        logger.debug("[usePlatformAdmin] Tenant status updated successfully");
      } catch (error) {
        logger.error("[usePlatformAdmin] Error updating tenant status:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update tenant status",
        }));
        throw error;
      }
    },
    [fetchTenants],
  );

  const createTenant = useCallback(
    async (tenantData: {
      hotelName: string;
      subdomain: string;
      plan: SubscriptionPlan;
      adminEmail: string;
      adminName: string;
    }) => {
      try {
        logger.debug("[usePlatformAdmin] Creating new tenant:", tenantData);
        const tenant = await platformAdminService.createTenant(tenantData);

        // Refresh tenants list and metrics
        await Promise.all([fetchTenants(), fetchMetrics()]);

        logger.debug("[usePlatformAdmin] Tenant created successfully");
        return tenant;
      } catch (error) {
        logger.error("[usePlatformAdmin] Error creating tenant:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to create tenant",
        }));
        throw error;
      }
    },
    [fetchTenants, fetchMetrics],
  );

  // ================================
  // SYSTEM HEALTH
  // ================================

  const fetchSystemHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingHealth: true, error: null }));

    try {
      logger.debug("[usePlatformAdmin] Fetching system health");
      const health = await platformAdminService.fetchSystemHealth();

      setState((prev) => ({
        ...prev,
        systemHealth: health,
        isLoadingHealth: false,
      }));

      logger.debug("[usePlatformAdmin] System health fetched successfully");
    } catch (error) {
      logger.error("[usePlatformAdmin] Error fetching system health:", error);
      setState((prev) => ({
        ...prev,
        isLoadingHealth: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch system health",
      }));
    }
  }, []);

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        logger.debug("[usePlatformAdmin] Acknowledging alert:", alertId);
        await platformAdminService.acknowledgeAlert(alertId);

        // Refresh system health
        await fetchSystemHealth();

        logger.debug("[usePlatformAdmin] Alert acknowledged successfully");
      } catch (error) {
        logger.error("[usePlatformAdmin] Error acknowledging alert:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to acknowledge alert",
        }));
        throw error;
      }
    },
    [fetchSystemHealth],
  );

  // ================================
  // FEATURE FLAGS
  // ================================

  const fetchFeatureFlags = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingFlags: true, error: null }));

    try {
      logger.debug("[usePlatformAdmin] Fetching feature flags");
      const flags = await platformAdminService.fetchFeatureFlags();

      setState((prev) => ({
        ...prev,
        featureFlags: flags,
        isLoadingFlags: false,
      }));

      logger.debug("[usePlatformAdmin] Feature flags fetched successfully");
    } catch (error) {
      logger.error("[usePlatformAdmin] Error fetching feature flags:", error);
      setState((prev) => ({
        ...prev,
        isLoadingFlags: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch feature flags",
      }));
    }
  }, []);

  const updateFeatureFlag = useCallback(
    async (
      flagId: string,
      updates: {
        enabled?: boolean;
        rolloutPercentage?: number;
        targetAudience?: FeatureFlag["targetAudience"];
      },
    ) => {
      try {
        logger.debug("[usePlatformAdmin] Updating feature flag:", {
          flagId,
          updates,
        });
        await platformAdminService.updateFeatureFlag(flagId, updates);

        // Refresh feature flags
        await fetchFeatureFlags();

        logger.debug("[usePlatformAdmin] Feature flag updated successfully");
      } catch (error) {
        logger.error("[usePlatformAdmin] Error updating feature flag:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update feature flag",
        }));
        throw error;
      }
    },
    [fetchFeatureFlags],
  );

  const createFeatureFlag = useCallback(
    async (flag: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">) => {
      try {
        logger.debug("[usePlatformAdmin] Creating feature flag:", flag);
        const newFlag = await platformAdminService.createFeatureFlag(flag);

        // Refresh feature flags
        await fetchFeatureFlags();

        logger.debug("[usePlatformAdmin] Feature flag created successfully");
        return newFlag;
      } catch (error) {
        logger.error("[usePlatformAdmin] Error creating feature flag:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create feature flag",
        }));
        throw error;
      }
    },
    [fetchFeatureFlags],
  );

  // ================================
  // REPORTS
  // ================================

  const generateRevenueReport = useCallback(
    async (period: { start: Date; end: Date }) => {
      setState((prev) => ({ ...prev, isLoadingReport: true, error: null }));

      try {
        logger.debug(
          "[usePlatformAdmin] Generating revenue report for period:",
          period,
        );
        const report = await platformAdminService.generateRevenueReport(period);

        setState((prev) => ({
          ...prev,
          revenueReport: report,
          isLoadingReport: false,
        }));

        logger.debug(
          "[usePlatformAdmin] Revenue report generated successfully",
        );
        return report;
      } catch (error) {
        logger.error(
          "[usePlatformAdmin] Error generating revenue report:",
          error,
        );
        setState((prev) => ({
          ...prev,
          isLoadingReport: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate revenue report",
        }));
        throw error;
      }
    },
    [],
  );

  const exportData = useCallback(
    async (type: "tenants" | "usage" | "revenue", format: "csv" | "json") => {
      try {
        logger.debug("[usePlatformAdmin] Exporting data:", { type, format });
        const blob = await platformAdminService.exportData(type, format);

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}_export_${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        logger.debug("[usePlatformAdmin] Data exported successfully");
      } catch (error) {
        logger.error("[usePlatformAdmin] Error exporting data:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to export data",
        }));
        throw error;
      }
    },
    [],
  );

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateTenantFilters = useCallback(
    (filters: Partial<typeof state.tenantFilters>) => {
      setState((prev) => ({
        ...prev,
        tenantFilters: { ...prev.tenantFilters, ...filters },
      }));
    },
    [],
  );

  // ================================
  // RETURN API
  // ================================

  return {
    // State
    ...state,

    // Platform Metrics
    fetchMetrics,
    fetchGrowthTrends,

    // Tenant Management
    fetchTenants,
    fetchTenantDetails,
    updateTenantStatus,
    createTenant,

    // System Health
    fetchSystemHealth,
    acknowledgeAlert,

    // Feature Flags
    fetchFeatureFlags,
    updateFeatureFlag,
    createFeatureFlag,

    // Reports
    generateRevenueReport,
    exportData,

    // Utilities
    clearError,
    updateTenantFilters,
  };
};

// ================================
// SPECIALIZED HOOKS
// ================================

export const usePlatformMetrics = () => {
  const { metrics, isLoadingMetrics, fetchMetrics, fetchGrowthTrends, error } =
    usePlatformAdmin();

  // Auto-fetch metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading: isLoadingMetrics,
    fetchMetrics,
    fetchGrowthTrends,
    error,
  };
};

export const useSystemHealth = () => {
  const {
    systemHealth,
    isLoadingHealth,
    fetchSystemHealth,
    acknowledgeAlert,
    error,
  } = usePlatformAdmin();

  // Auto-fetch health on mount
  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchSystemHealth, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  return {
    health: systemHealth,
    isLoading: isLoadingHealth,
    fetchHealth: fetchSystemHealth,
    acknowledgeAlert,
    error,
  };
};

export const useTenantManagement = () => {
  const {
    tenants,
    selectedTenant,
    tenantFilters,
    isLoadingTenants,
    fetchTenants,
    fetchTenantDetails,
    updateTenantStatus,
    createTenant,
    updateTenantFilters,
    error,
  } = usePlatformAdmin();

  // Auto-fetch tenants on mount
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    selectedTenant,
    filters: tenantFilters,
    isLoading: isLoadingTenants,
    fetchTenants,
    fetchTenantDetails,
    updateTenantStatus,
    createTenant,
    updateFilters: updateTenantFilters,
    error,
  };
};
