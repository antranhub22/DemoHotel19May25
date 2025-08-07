import { Shield, Lock } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string; // Format: "module.action" e.g., "analytics.view"
  requiredRole?: string; // Role-based access
  fallback?: React.ReactNode;
  showFallback?: boolean; // Whether to show fallback or hide completely
}

interface NoPermissionMessageProps {
  requiredPermission?: string;
  requiredRole?: string;
  variant?: 'alert' | 'placeholder' | 'minimal';
}

// Default no permission message component
const NoPermissionMessage: React.FC<NoPermissionMessage> = ({ requiredPermission, requiredRole, variant = "default" }) => {
  if (variant === 'minimal') {
    return (
      <div className="text-gray-400 text-sm flex items-center gap-2">
        <Lock className="h-4 w-4" />
        <span>Không có quyền truy cập</span>
      </div>
    );
  }

  if (variant === 'placeholder') {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Quyền truy cập bị hạn chế
        </h3>
        <p className="text-gray-500">
          {requiredPermission && `Cần quyền: ${requiredPermission}`}
          {requiredRole && `Cần vai trò: ${requiredRole}`}
        </p>
      </div>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Shield className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Không có quyền truy cập.</strong>{' '}
        {requiredPermission && `Cần quyền: ${requiredPermission}. `}
        {requiredRole && `Cần vai trò: ${requiredRole}. `}
        Vui lòng liên hệ quản trị viên để được cấp quyền.
      </AlertDescription>
    </Alert>
  );
};

/**
 * PermissionGuard - Protects UI elements based on user permissions
 *
 * Usage examples:
 *
 * // Protect by permission
 * <PermissionGuard requiredPermission="analytics.view">
 *   <AnalyticsChart />
 * </PermissionGuard>
 *
 * // Protect by role
 * <PermissionGuard requiredRole="hotel-manager">
 *   <BillingSection />
 * </PermissionGuard>
 *
 * // Custom fallback
 * <PermissionGuard
 *   requiredPermission="billing.edit"
 *   fallback={<div>Chỉ manager mới có thể chỉnh sửa</div>}
 * >
 *   <EditBillingForm />
 * </PermissionGuard>
 *
 * // Hide completely without fallback
 * <PermissionGuard requiredPermission="system.debug" showFallback={false}>
 *   <DebugPanel />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  showFallback = true,
}) => {
  const { user, hasPermission } = useAuth();

  // If no user is authenticated, don't show anything
  if (!user) {
    return showFallback ? (
      <NoPermissionMessage
        requiredPermission={requiredPermission}
        requiredRole={requiredRole}
        variant="minimal"
      />
    ) : null;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return showFallback
      ? fallback || (
          <NoPermissionMessage requiredRole={requiredRole} variant="alert" />
        )
      : null;
  }

  // Check permission-based access
  if (requiredPermission) {
    // Handle both dot notation (standard) and colon notation (legacy)
    let module: string, action: string;

    if (requiredPermission.includes(':')) {
      // Legacy colon notation: "analytics:view_advanced"
      [module, action] = requiredPermission.split(':');
    } else {
      // Standard dot notation: "analytics.view"
      [module, action] = requiredPermission.split('.');
    }

    if (!hasPermission(module, action)) {
      return showFallback
        ? fallback || (
            <NoPermissionMessage
              requiredPermission={requiredPermission}
              variant="alert"
            />
          )
        : null;
    }
  }

  // User has permission, render children
  return <>{children}</>;
};

// Specialized guards for common use cases

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback }) => (
  <PermissionGuard requiredRole="hotel-manager" fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface StaffOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const StaffOnly: React.FC<StaffOnlyProps> = ({ children, fallback }) => (
  <PermissionGuard requiredRole="front-desk" fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface ITOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ITOnly: React.FC<ITOnlyProps> = ({ children, fallback }) => (
  <PermissionGuard requiredRole="it-manager" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Hook for conditional rendering based on permissions
export const usePermissionCheck = () => {
  const { user, hasPermission } = useAuth();

  const canAccess = (permission: string) => {
    if (!user) {
      return false;
    }
    const [module, action] = permission.split('.');
    return hasPermission(module, action);
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isManager = () => hasRole('hotel-manager');
  const isStaff = () => hasRole('front-desk');
  const isIT = () => hasRole('it-manager');

  return {
    canAccess,
    hasRole,
    isManager,
    isStaff,
    isIT,
    user,
  };
};

export default PermissionGuard;
