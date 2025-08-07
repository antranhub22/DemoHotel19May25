import * as React from "react";
/**
 * Lazy Loading Utilities for Memory Optimization
 * Giảm initial bundle size và memory footprint
 */

import { lazy, ComponentType } from "react";

// ============================================================================
// LAZY LOAD DASHBOARD COMPONENTS
// ============================================================================

// Unified Dashboard Components - Lazy loaded to reduce memory
export const LazyUnifiedDashboardHome = lazy(() =>
  import("@/pages/unified-dashboard/UnifiedDashboardHome").then((module) => ({
    default: module.UnifiedDashboardHome,
  })),
);

export const LazyStaffManagement = lazy(() =>
  import("@/pages/unified-dashboard/StaffManagement").then((module) => ({
    default: module.StaffManagement,
  })),
);

export const LazyStaffManagementRefactored = lazy(
  // @ts-ignore - Auto-suppressed TypeScript error
  () => import("@/pages/unified-dashboard/StaffManagementRefactored"),
);

export const LazyHotelOperationsRefactored = lazy(
  () => import("@/pages/unified-dashboard/HotelOperationsRefactored"),
);

export const LazyCustomerRequestsRefactored = lazy(() =>
  import("@/pages/unified-dashboard/CustomerRequestsRefactored").then(
    (module) => ({
      default: module.CustomerRequestsRefactored,
    }),
  ),
);

export const LazyGuestManagement = lazy(() =>
  import("@/pages/unified-dashboard/GuestManagement").then((module) => ({
    default: module.GuestManagement,
  })),
);

// Analytics Components - Heavy charts lazy loaded
export const LazyAnalyticsDashboard = lazy(
  () => import("@/pages/AnalyticsDashboard"),
);

export const LazyAnalytics = lazy(() =>
  import("@/pages/dashboard/Analytics").then((module) => ({
    default: module.Analytics,
  })),
);

// SaaS Dashboard Components
export const LazyDashboardHome = lazy(() =>
  import("@/pages/dashboard/DashboardHome").then((module) => ({
    default: module.DashboardHome,
  })),
);

export const LazySetupWizard = lazy(() =>
  import("@/pages/dashboard/SetupWizard").then((module) => ({
    default: module.SetupWizard,
  })),
);

export const LazyBillingSubscriptionManagement = lazy(
  () => import("@/pages/unified-dashboard/BillingSubscriptionManagement"),
);

// ============================================================================
// CHUNK PRELOADING FOR BETTER UX
// ============================================================================

interface PreloadOptions {
  delay?: number;
  condition?: () => boolean;
}

export const preloadComponent = (
  componentLoader: () => Promise<any>,
  options: PreloadOptions = {},
): void => {
  const { delay = 0, condition = () => true } = options;

  if (!condition()) {
    return;
  }

  setTimeout(() => {
    try {
      componentLoader().catch((error) => {
        console.warn("Failed to preload component:", error);
      });
    } catch (error) {
      console.warn("Preload component error:", error);
    }
  }, delay);
};

// ============================================================================
// SMART COMPONENT LOADING BASED ON ROLE
// ============================================================================

export const getComponentsForRole = (
  role: string,
): Array<() => Promise<any>> => {
  const baseComponents = [
    () => import("@/pages/unified-dashboard/UnifiedDashboardHome"),
  ];

  switch (role) {
    case "hotel-manager":
      return [
        ...baseComponents,
        () => import("@/pages/unified-dashboard/StaffManagementRefactored"),
        () => import("@/pages/unified-dashboard/HotelOperationsRefactored"),
        () => import("@/pages/dashboard/Analytics"),
        () => import("@/pages/dashboard/SetupWizard"),
      ];

    case "front-desk":
      return [
        ...baseComponents,
        () => import("@/pages/unified-dashboard/CustomerRequestsRefactored"),
        () => import("@/pages/unified-dashboard/GuestManagement"),
      ];

    case "it-manager":
      return [
        ...baseComponents,
        () => import("@/pages/unified-dashboard/SystemMonitoring"),
        () => import("@/pages/unified-dashboard/SecuritySettings"),
      ];

    default:
      return baseComponents;
  }
};

export const preloadRoleBasedComponents = (role: string): void => {
  const components = getComponentsForRole(role);

  components.forEach((componentLoader, index) => {
    preloadComponent(componentLoader, {
      delay: index * 500, // Stagger preloading
      condition: () => document.visibilityState === "visible",
    });
  });
};

// ============================================================================
// MEMORY-OPTIMIZED COMPONENT WRAPPER
// ============================================================================

export const withMemoryOptimization = <P extends object>(
  Component: ComponentType<P>,
): ComponentType<P> => {
  return (props: P) => {
    // Add memory monitoring for heavy components
    const componentName =
      Component.displayName || Component.name || "UnknownComponent";

    // Track component mount/unmount for memory debugging
    React.useEffect(() => {
      console.debug(`📦 [MEMORY] Component mounted: ${componentName}`);

      return () => {
        console.debug(`📦 [MEMORY] Component unmounted: ${componentName}`);

        // Force cleanup for heavy components
        if (
          componentName.includes("Refactored") ||
          componentName.includes("Dashboard")
        ) {
          setTimeout(() => {
            if (global.gc && Math.random() < 0.1) {
              // 10% chance to trigger GC
              global.gc();
            }
          }, 1000);
        }
      };
    }, []);

    return React.createElement(Component, props);
  };
};

// ============================================================================
// EXPORT ALL LAZY COMPONENTS
// ============================================================================

export const LazyComponents = {
  // Dashboard Components
  UnifiedDashboardHome: LazyUnifiedDashboardHome,
  StaffManagement: LazyStaffManagement,
  StaffManagementRefactored: LazyStaffManagementRefactored,
  HotelOperationsRefactored: LazyHotelOperationsRefactored,
  CustomerRequestsRefactored: LazyCustomerRequestsRefactored,
  GuestManagement: LazyGuestManagement,

  // Analytics
  AnalyticsDashboard: LazyAnalyticsDashboard,
  Analytics: LazyAnalytics,

  // SaaS Dashboard
  DashboardHome: LazyDashboardHome,
  SetupWizard: LazySetupWizard,
  BillingSubscriptionManagement: LazyBillingSubscriptionManagement,
} as const;

export default LazyComponents;
