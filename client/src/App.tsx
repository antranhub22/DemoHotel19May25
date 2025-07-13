import React, { Suspense, useState, useEffect } from "react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Switch, Route, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import VoiceAssistant from "@/components/VoiceAssistant";
import { AssistantProvider } from "@/context/AssistantContext";
import { AuthProvider, useAuth, useTenantDetection } from "@/context/AuthContext";
import { HotelProvider } from "@/context/HotelContext";
import NotFound from "@/pages/not-found";
import { useWebSocket } from '@/hooks/useWebSocket';
import StaffPage from '@/pages/staff';
import { BrowserRouter } from 'react-router-dom';
import StaffDashboard from './pages/StaffDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Dashboard pages
import { 
  DashboardLayout, 
  DashboardHome, 
  SetupWizard, 
  AssistantManager, 
  Analytics, 
  Settings 
} from '@/pages/dashboard';

// ============================================
// Protected Route Component
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'manager' | 'staff';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requiredRole,
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (requiredRole && user && user.role !== requiredRole) {
      setLocation('/unauthorized');
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requiredRole, redirectTo, setLocation]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};



// ============================================
// Lazy-loaded Components
// ============================================

const CallHistory = React.lazy(() => import('@/pages/CallHistory'));
const CallDetails = React.lazy(() => import('@/pages/CallDetails'));

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
          <h1 className="text-2xl font-bold text-gray-800">Kiểm tra Tính năng Email</h1>
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
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
            Hoặc{' '}
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
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
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Địa chỉ email"
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
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
      <p className="text-gray-600 mb-6">Bạn không có quyền truy cập vào trang này.</p>
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
  console.log('[DEBUG] Router render', { tenantInfo, isAuthenticated });

  if (!tenantInfo) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={VoiceAssistant} />
        <Route path="/call-history" component={CallHistory} />
        <Route path="/call-details/:callId" component={CallDetails} />
        <Route path="/email-test" component={EmailTestPage} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/staff/dashboard" component={StaffDashboard} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        <Route path="/login" component={LoginPage} />
        <Route path="/unauthorized" component={UnauthorizedPage} />
        
        <Route path="/dashboard">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/setup">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <SetupWizard />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/assistant">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <AssistantManager />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/analytics">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/settings">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/billing">
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Thanh toán & Đăng ký</h1>
                <p className="text-gray-600">Trang quản lý thanh toán đang được phát triển...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard/team">
          <ProtectedRoute requireAuth={true} requiredRole="admin">
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Quản lý Nhóm</h1>
                <p className="text-gray-600">Trang quản lý nhóm đang được phát triển...</p>
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
  console.log('[DEBUG] AppContent render');
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
  console.log('[DEBUG] App render');
  return (
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <AssistantProvider>
            <AppContent />
          </AssistantProvider>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
