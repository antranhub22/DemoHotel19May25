/**
 * App with Domain Architecture
 * Testing version of App.tsx with Guest Experience domain integration
 * This is a safe testing ground before fully migrating main App.tsx
 */

import VoiceAssistantRefactored from "@/components/business/VoiceAssistantRefactored";
import { UnifiedDashboardLayout } from "@/components/features/dashboard/unified-dashboard";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import {
  AuthProvider,
  useAuth,
  useTenantDetection,
} from "@/context/AuthContext";
import { HotelProvider } from "@/context/HotelContext";
import { RefactoredAssistantProvider } from "@/context/RefactoredAssistantContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import NotFound from "@/pages/not-found";
import StaffPage from "@/pages/staff";
import VapiTest from "@/pages/VapiTest";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { logger } from "@shared/utils/logger";
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Link, Route, Switch, useLocation } from "wouter";

// Platform Admin Dashboard
import { PlatformAdminDashboard } from "@/domains/saas-provider";

// ✅ NEW: SaaS-Integrated Voice Assistant
import VoiceAssistantWithSaaS from "@/components/business/VoiceAssistantWithSaaS";

// Lazy load Analytics Dashboard to split charts bundle
const AnalyticsDashboard = React.lazy(
  () => import("./pages/AnalyticsDashboard"),
);

// Dashboard pages

// Unified Dashboard (Phase 3)
import StaffDashboard from "@/pages/StaffDashboard";
import { UnifiedDashboardHome } from "@/pages/unified-dashboard";
import BillingSubscriptionManagement from "@/pages/unified-dashboard/BillingSubscriptionManagement";
import { CustomerRequests } from "@/pages/unified-dashboard/CustomerRequests";
// import { CustomerRequestsRefactored } from "@/pages/unified-dashboard/CustomerRequestsRefactored"; // TEMPORARILY DISABLED
import HotelOperationsRefactored from "@/pages/unified-dashboard/HotelOperationsRefactored";
import { StaffManagementRefactored } from "@/pages/unified-dashboard/StaffManagementRefactored";

// Lazy load charts-heavy dashboard components
const AdvancedAnalytics = React.lazy(() =>
  import("@/pages/unified-dashboard/AdvancedAnalytics").then((module) => ({
    default: module.AdvancedAnalytics,
  })),
);
const SystemMonitoring = React.lazy(() =>
  import("@/pages/unified-dashboard/SystemMonitoring").then((module) => ({
    default: module.SystemMonitoring,
  })),
);

// ============================================
// Protected Route Component (unchanged)
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "manager" | "staff";
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = "/login",
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    requiredRole,
    redirectTo,
    setLocation,
  ]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

// ============================================
// Loading Fallback
// ============================================

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// ============================================
// Login Page (simplified for testing)
// ============================================

const LoginPage = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào hệ thống
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link
              href="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              quay lại trang chính
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Tên đăng nhập hoặc email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// Unauthorized Page
// ============================================

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Không có quyền truy cập
      </h2>
      <p className="text-gray-600 mb-6">
        Bạn không có quyền truy cập vào trang này.
      </p>
      <Link href="/" className="text-indigo-600 hover:text-indigo-500">
        Quay lại trang chính
      </Link>
    </div>
  </div>
);

// ============================================
// Main Router Component (with Domain Integration)
// ============================================

function Router() {
  const tenantInfo = useTenantDetection();
  const { isAuthenticated } = useAuth();
  logger.debug("[DEBUG] Router render (Domain Version)", "Component", {
    tenantInfo,
    isAuthenticated,
  });

  if (!tenantInfo) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* ✅ NEW: Use refactored VoiceAssistant with domain architecture */}
        <Route path="/" component={VoiceAssistantRefactored} />
        <Route path="/interface1" component={VoiceAssistantRefactored} />

        {/* ✅ NEW: SaaS-Integrated Voice Assistant (test route) */}
        <Route path="/voice-saas" component={VoiceAssistantWithSaaS} />

        <Route path="/vapi-test" component={VapiTest} />

        {/* Keep existing routes for backward compatibility */}
        <Route path="/staff" component={StaffPage} />
        <Route path="/staff/dashboard" component={StaffDashboard} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        <Route path="/login" component={LoginPage} />
        <Route path="/unauthorized" component={UnauthorizedPage} />

        {/* Hotel Dashboard Routes */}
        <Route path="/hotel-dashboard">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <UnifiedDashboardHome />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/requests">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <CustomerRequests />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* ✅ NEW: Refactored Customer Requests with Redux Domain */}
        <Route path="/hotel-dashboard/requests-refactored">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              {/* <CustomerRequestsRefactored /> TEMPORARILY DISABLED */}
              <div>Component temporarily disabled for debugging</div>
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/staff-refactored">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <StaffManagementRefactored />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* ✅ NEW: Hotel Operations with Redux Domain */}
        <Route path="/hotel-dashboard/operations-refactored">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <HotelOperationsRefactored />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* ✅ NEW: Billing & Subscription Management with Redux Domain */}
        <Route path="/hotel-dashboard/billing">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <BillingSubscriptionManagement />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* Platform Admin Dashboard - SaaS Provider management */}
        <Route path="/platform-admin">
          <ProtectedRoute requireAuth={true} requireRole="saas_admin">
            <PlatformAdminDashboard />
          </ProtectedRoute>
        </Route>

        {/* Add more routes as needed */}

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// ============================================
// App Content Component (with Domain Integration)
// ============================================

function AppContent() {
  const {} = useWebSocket();

  return (
    <ErrorBoundary>
      <Router />
      <Toaster />
    </ErrorBoundary>
  );
}

// ============================================
// Main App Component with Domain Architecture
// ============================================

function AppWithDomains() {
  logger.debug("[DEBUG] AppWithDomains render", "Component");
  return (
    <BrowserRouter>
      {/* ✅ NEW: Redux Provider for Domain Architecture */}
      <ReduxProvider>
        <AuthProvider>
          <HotelProvider>
            <RefactoredAssistantProvider>
              <AppContent />
            </RefactoredAssistantProvider>
          </HotelProvider>
        </AuthProvider>
      </ReduxProvider>
    </BrowserRouter>
  );
}

export default AppWithDomains;
