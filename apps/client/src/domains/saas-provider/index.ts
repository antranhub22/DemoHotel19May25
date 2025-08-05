/**
 * SaaS Provider Domain - Barrel File
 * Centralized exports for multi-tenant and subscription management
 */

// Types
export type {
  ApiKeyConfig,
  BillingCycle,
  FeatureFlag,
  PlatformAdminState,
  // Platform Admin Types
  PlatformMetrics,
  RevenueReport,
  SaasProviderEvents,
  SubscriptionPlan,
  SubscriptionPlanDetails,
  SubscriptionStatus,
  SystemAlert,
  SystemHealth,
  TeamMember,
  TenantConfig,
  TenantData,
  TenantListItem,
  UsageAlert,
  WhiteLabelConfig,
} from "./types/saasProvider.types";

// Redux Store
export {
  addUsageAlert,
  checkFeatureAccess,
  clearCurrentTenant,
  fetchCurrentTenant,
  fetchPlatformMetrics,
  removeUsageAlert,
  selectCanAccessFeature,
  selectCurrentTenant,
  selectFeatureAccess,
  selectPlatformMetrics,
  selectTenantError,
  selectTenantFeatures,
  selectTenantLimits,
  selectTenantLoading,
  selectTenantUsage,
  selectUsageAlerts,
  setCurrentTenant,
  setError,
  setLoading,
  setTenantSearchFilters,
  setTenantSearchQuery,
  setTenantSearchResults,
  setWhiteLabelConfig,
  tenantSlice,
  updatePlatformMetrics,
  updateRealTimeUsage,
  updateSubscriptionPlan,
  updateTenantUsage,
} from "./store/tenantSlice";

// Services
export { platformAdminService } from "./services/platformAdminService";
export { TenantManagementService } from "./services/tenantManagementService";

// Hooks
export {
  useFeatureGating,
  usePlatformAnalytics,
  useSubscriptionManagement,
  useTenantManagement,
  useUsageMonitoring,
} from "./hooks/useTenantManagement";

// Platform Admin Hooks
export {
  usePlatformAdmin,
  usePlatformMetrics,
  useTenantManagement as usePlatformTenantManagement,
  useSystemHealth,
} from "./hooks/usePlatformAdmin";

// Components
export {
  AdvancedAnalyticsGate,
  ApiAccessGate,
  FeatureAvailability,
  FeatureGate,
  FeatureList,
  VoiceCloningGate,
  WhiteLabelGate,
} from "./components/FeatureGate";

export { UsageDashboard } from "./components/UsageDashboard";

// Platform Admin Components
export {
  FeatureRolloutManager,
  MetricsOverview,
  PlatformAdminDashboard,
  RevenueAnalytics,
  SystemHealthMonitor,
  TenantManagementPanel,
} from "./components/admin";

// Re-export for convenience
export { default as PlatformAdminDashboardComponent } from "./components/admin";
export { default as FeatureGateComponent } from "./components/FeatureGate";
export { default as UsageDashboardComponent } from "./components/UsageDashboard";
