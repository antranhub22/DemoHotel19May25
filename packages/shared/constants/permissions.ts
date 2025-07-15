import { PermissionMatrix, MenuItemConfig, RoleConfig, UserRole, Permission } from '../types/auth';

// Re-export types for easier imports
export type { UserRole, Permission } from '../types/auth';

// Permission Matrix - Defines what each role can do
export const PERMISSION_MATRIX: PermissionMatrix = {
  'hotel-manager': {
    dashboard: ['view', 'edit'],
    analytics: ['view', 'export', 'advanced'],
    billing: ['view', 'edit'],
    staff: ['view', 'edit', 'delete', 'invite'],
    settings: ['view', 'edit'],
    calls: ['view', 'join', 'transfer', 'end', 'override'],
    system: ['view'] // Can see basic system info
  },
  'front-desk': {
    dashboard: ['view'],
    calls: ['view', 'join', 'transfer', 'end'],
    analytics: ['view_basic'], // Limited analytics
    profile: ['view', 'edit'],
    guests: ['view', 'edit', 'checkin', 'checkout'],
    system: [] // No system access
  },
  'it-manager': {
    dashboard: ['view'],
    system: ['view', 'edit', 'debug', 'restart'],
    integrations: ['view', 'edit', 'test'],
    logs: ['view', 'export', 'debug'],
    calls: ['view', 'debug'], // Technical call debugging
    analytics: ['view', 'technical'], // System performance analytics
    billing: [], // No billing access
    staff: [] // No staff management
  }
};

// Menu Configuration for each role
export const ROLE_MENU_CONFIG: Record<UserRole, MenuItemConfig[]> = {
  'hotel-manager': [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/dashboard',
      requiredPermission: 'dashboard.view'
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/dashboard/calls',
      requiredPermission: 'calls.view',
      children: [
        {
          key: 'calls-live',
          label: 'Cuộc gọi trực tiếp',
          icon: '🔴',
          path: '/dashboard/calls/live',
          requiredPermission: 'calls.view'
        },
        {
          key: 'calls-history',
          label: 'Lịch sử cuộc gọi',
          icon: '📋',
          path: '/dashboard/calls/history',
          requiredPermission: 'calls.view'
        }
      ]
    },
    {
      key: 'analytics',
      label: 'Phân tích',
      icon: '📈',
      path: '/dashboard/analytics',
      requiredPermission: 'analytics.view'
    },
    {
      key: 'staff',
      label: 'Nhân viên',
      icon: '👥',
      path: '/dashboard/staff',
      requiredPermission: 'staff.view'
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      path: '/dashboard/settings',
      requiredPermission: 'settings.view'
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      icon: '💰',
      path: '/dashboard/billing',
      requiredPermission: 'billing.view'
    }
  ],

  'front-desk': [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/dashboard',
      requiredPermission: 'dashboard.view'
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/dashboard/calls',
      requiredPermission: 'calls.view',
      children: [
        {
          key: 'calls-live',
          label: 'Cuộc gọi trực tiếp',
          icon: '🔴',
          path: '/dashboard/calls/live',
          requiredPermission: 'calls.view'
        }
      ]
    },
    {
      key: 'guests',
      label: 'Khách hàng',
      icon: '🏨',
      path: '/dashboard/guests',
      requiredPermission: 'guests.view'
    },
    {
      key: 'analytics',
      label: 'Thống kê cơ bản',
      icon: '📊',
      path: '/dashboard/analytics/basic',
      requiredPermission: 'analytics.view_basic'
    },
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: '👤',
      path: '/dashboard/profile',
      requiredPermission: 'profile.view'
    }
  ],

  'it-manager': [
    {
      key: 'dashboard',
      label: 'System Dashboard',
      icon: '🔧',
      path: '/dashboard',
      requiredPermission: 'dashboard.view'
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: '⚙️',
      path: '/dashboard/system',
      requiredPermission: 'system.view',
      children: [
        {
          key: 'system-status',
          label: 'Trạng thái hệ thống',
          icon: '🟢',
          path: '/dashboard/system/status',
          requiredPermission: 'system.view'
        },
        {
          key: 'system-config',
          label: 'Cấu hình',
          icon: '⚙️',
          path: '/dashboard/system/config',
          requiredPermission: 'system.edit'
        }
      ]
    },
    {
      key: 'integrations',
      label: 'Tích hợp',
      icon: '🔗',
      path: '/dashboard/integrations',
      requiredPermission: 'integrations.view'
    },
    {
      key: 'logs',
      label: 'Logs',
      icon: '📄',
      path: '/dashboard/logs',
      requiredPermission: 'logs.view'
    },
    {
      key: 'analytics',
      label: 'Performance',
      icon: '📈',
      path: '/dashboard/analytics/technical',
      requiredPermission: 'analytics.technical'
    }
  ]
};

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: UserRole) => {
  const rolePermissions = PERMISSION_MATRIX[role];
  const permissions = [];
  
  for (const [module, actions] of Object.entries(rolePermissions)) {
    for (const action of actions) {
      permissions.push({
        module,
        action,
        allowed: true
      });
    }
  }
  
  return permissions;
};

// Helper function to check if a role has a specific permission
export const hasRolePermission = (role: UserRole, module: string, action: string): boolean => {
  const rolePermissions = PERMISSION_MATRIX[role];
  return rolePermissions[module]?.includes(action) || false;
};

// Get menu items for a specific role
export const getMenuForRole = (role: UserRole): MenuItemConfig[] => {
  return ROLE_MENU_CONFIG[role] || [];
};

// Dashboard component mapping for each role
export const DASHBOARD_COMPONENTS: Record<UserRole, string[]> = {
  'hotel-manager': [
    'RevenueChart',
    'CallsOverview', 
    'OperationalMetrics',
    'StaffPerformance',
    'FinancialSummary'
  ],
  'front-desk': [
    'ActiveCalls',
    'GuestRequests',
    'RoomStatus',
    'QuickActions',
    'ShiftSummary'
  ],
  'it-manager': [
    'SystemHealth',
    'PerformanceMetrics',
    'ErrorLogs',
    'IntegrationStatus',
    'SecurityAlerts'
  ]
}; 