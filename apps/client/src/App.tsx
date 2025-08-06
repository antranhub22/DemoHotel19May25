import VoiceAssistant from "@/components/business/VoiceAssistant";
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

import DummyTest from "@/debug/DummyTest";
import ModuleTest from "@/debug/ModuleTest";
import SimpleTest from "@/debug/SimpleTest";
import { useWebSocket } from "@/hooks/useWebSocket";
import NotFound from "@/pages/not-found";
import StaffPage from "@/pages/staff";
import VapiTest from "@/pages/VapiTest";
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Link, Route, Switch, useLocation } from "wouter";
// Lazy load Analytics Dashboard to split charts bundle
const AnalyticsDashboard = React.lazy(
  () => import("./pages/AnalyticsDashboard"),
);

// Dashboard pages
import {
  Analytics,
  AssistantManager,
  DashboardHome,
  DashboardLayout,
  Settings,
  SetupWizard,
} from "@/pages/dashboard";

// Unified Dashboard (Phase 3)
import StaffDashboard from "@/pages/StaffDashboard";
import { UnifiedDashboardHome } from "@/pages/unified-dashboard";
import BillingSubscriptionManagement from "@/pages/unified-dashboard/BillingSubscriptionManagement";
import { CustomerRequests } from "@/pages/unified-dashboard/CustomerRequests";
// import { CustomerRequestsRefactored } from "@/pages/unified-dashboard/CustomerRequestsRefactored"; // TEMPORARILY DISABLED
import { GuestManagement } from "@/pages/unified-dashboard/GuestManagement";
import HotelOperationsRefactored from "@/pages/unified-dashboard/HotelOperationsRefactored";
import { Integrations } from "@/pages/unified-dashboard/Integrations";
import { SecuritySettings } from "@/pages/unified-dashboard/SecuritySettings";
import { Settings as UnifiedSettings } from "@/pages/unified-dashboard/Settings";
import { StaffManagement } from "@/pages/unified-dashboard/StaffManagement";
import { StaffManagementRefactored } from "@/pages/unified-dashboard/StaffManagementRefactored";
import { SystemLogs } from "@/pages/unified-dashboard/SystemLogs";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { logger } from "@shared/utils/logger";
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
// Protected Route Component
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

    // Remove legacy role checking - we use RBAC permission system now
    // if (requiredRole && user && user.role !== requiredRole) {
    //   setLocation('/unauthorized');
    //   return;
    // }
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

  // Remove legacy role checking - we use RBAC permission system now
  // if (requiredRole && user && user.role !== requiredRole) {
  //   return null;
  // }

  return <>{children}</>;
};

// ============================================
// Lazy-loaded Components
// ============================================

const CallHistory = React.lazy(() => import("@/pages/CallHistory"));
const CallDetails = React.lazy(() => import("@/pages/CallDetails"));

// ============================================
// Loading Fallback
// ============================================

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500">Đang tải...</p>
    </div>
  </div>
);

// ============================================
// Email Test Page
// ============================================

const EmailTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Kiểm tra Tính năng Email
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Quay lại Trang Chính
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Login Page
// ============================================

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      // Redirect to modern hotel dashboard instead of legacy dashboard
      setLocation("/hotel-dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
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
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Không có quyền truy cập
      </h1>
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
// Main Router Component
// ============================================

function Router() {
  const tenantInfo = useTenantDetection();
  const { isAuthenticated } = useAuth();
  logger.debug("[DEBUG] Router render", "Component", {
    tenantInfo,
    isAuthenticated,
  });

  if (!tenantInfo) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={VoiceAssistant} />
        <Route path="/interface1" component={VoiceAssistant} />
        <Route path="/vapi-test" component={VapiTest} />
        <Route path="/simple-test" component={SimpleTest} />
        <Route path="/module-test" component={ModuleTest} />
        <Route path="/dummy-test" component={DummyTest} />
        {/* DISABLED: Legacy interface routes - use / for Interface1 only
        <Route path="/interface3" component={VoiceAssistant} />
        <Route path="/interface4" component={VoiceAssistant} />
        */}
        <Route path="/call-history" component={CallHistory} />
        <Route path="/call-details/:callId" component={CallDetails} />
        <Route path="/email-test" component={EmailTestPage} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/staff/dashboard" component={StaffDashboard} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        <Route path="/login" component={LoginPage} />
        <Route path="/unauthorized" component={UnauthorizedPage} />

        {/* Hotel Dashboard Routes - Role-based Hotel Management System */}
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

        <Route path="/hotel-dashboard/analytics">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <AdvancedAnalytics />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/staff-management">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <StaffManagement />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/system-monitoring">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <SystemMonitoring />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/settings">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <UnifiedSettings />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/guest-management">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <GuestManagement />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/security">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <SecuritySettings />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/logs">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <SystemLogs />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/hotel-dashboard/integrations">
          <ProtectedRoute requireAuth={true}>
            <UnifiedDashboardLayout>
              <Integrations />
            </UnifiedDashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* SaaS Provider Dashboard Routes - For SaaS platform management */}
        <Route path="/saas-dashboard">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/setup">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <SetupWizard />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/assistant">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <AssistantManager />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/analytics">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/settings">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/billing">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                  Thanh toán & Đăng ký
                </h1>
                <p className="text-gray-600">
                  Trang quản lý thanh toán đang được phát triển...
                </p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/saas-dashboard/team">
          <ProtectedRoute requireAuth={true} requiredRole="admin">
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Quản lý Nhóm</h1>
                <p className="text-gray-600">
                  Trang quản lý nhóm đang được phát triển...
                </p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// ============================================
// Main App Content (WebSocket + ErrorBoundary)
// ============================================

function AppContent() {
  logger.debug("[DEBUG] AppContent render", "Component");

  useWebSocket();

  return (
    <ErrorBoundary>
      <Router />
      <Toaster />
    </ErrorBoundary>
  );
}

// ============================================
// Main App Component
// ============================================

function App() {
  logger.debug("[DEBUG] App render", "Component");
  return (
    <ReduxProvider>
      <BrowserRouter>
        <AuthProvider>
          <HotelProvider>
            <RefactoredAssistantProvider>
              <AppContent />
            </RefactoredAssistantProvider>
          </HotelProvider>
        </AuthProvider>
      </BrowserRouter>
    </ReduxProvider>
  );
}

export default App;
