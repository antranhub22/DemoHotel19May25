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
// NOTE: Hooks exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// Platform Admin Hooks
// NOTE: Hooks exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

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
