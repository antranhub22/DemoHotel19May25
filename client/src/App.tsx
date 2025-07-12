import React, { Suspense, useState, useEffect } from "react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Switch, Route, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import VoiceAssistant from "@/components/VoiceAssistant";
import { AssistantProvider } from "@/context/AssistantContext";
import { AuthProvider, useAuth, useTenantDetection } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import EmailTester from "@/components/EmailTester";
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
        <EmailTester />
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
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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

  if (!tenantInfo) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* ============================================ */}
        {/* EXISTING MI NHON ROUTES (Backward Compatibility) */}
        {/* ============================================ */}
        
        {/* Main voice assistant - works for Mi Nhon and subdomains */}
        <Route path="/" component={VoiceAssistant} />
        
        {/* Mi Nhon specific routes */}
        <Route path="/call-history" component={CallHistory} />
        <Route path="/call-details/:callId" component={CallDetails} />
        <Route path="/email-test" component={EmailTestPage} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/staff/dashboard" component={StaffDashboard} />
        <Route path="/analytics" component={AnalyticsDashboard} />

        {/* ============================================ */}
        {/* AUTHENTICATION ROUTES */}
        {/* ============================================ */}
        
        <Route path="/login" component={LoginPage} />
        <Route path="/unauthorized" component={UnauthorizedPage} />

        {/* ============================================ */}
        {/* PROTECTED DASHBOARD ROUTES */}
        {/* ============================================ */}
        
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

        {/* Premium Routes */}
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

        {/* ============================================ */}
        {/* FALLBACK ROUTES */}
        {/* ============================================ */}
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// ============================================
// Main App Component
// ============================================

function App() {
  // Initialize WebSocket globally to keep connection across routes
  useWebSocket();
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantProvider>
          <ErrorBoundary>
            <Router />
            <Toaster />
          </ErrorBoundary>
        </AssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
