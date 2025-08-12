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
  TenantData,
  TenantListItem,
  UsageAlert,
  WhiteLabelConfig,
} from "./types/saasProvider.types.ts";

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
} from "./store/tenantSlice.ts";

// Services
// NOTE: Service exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

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
} from "./components/FeatureGate.tsx";

export { UsageDashboard } from "./components/UsageDashboard.tsx";

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
export { default as FeatureGateComponent } from "./components/FeatureGate.tsx";
export { default as UsageDashboardComponent } from "./components/UsageDashboard.tsx";
