import { UserRole } from './auth';
// Re-export types for easier imports
export type { UserRole } from './auth';

// Permission Matrix - Defines what each role can do
export const PERMISSION_MATRIX: PermissionMatrix = {
  'hotel-manager': {
    dashboard: ['view', 'edit', 'view_client_interface'],
    analytics: ['view', 'export', 'advanced', 'view_advanced'],
    billing: ['view', 'edit'],
    staff: ['view', 'edit', 'delete', 'invite', 'manage'],
    settings: ['view', 'edit'],
    calls: ['view', 'join', 'transfer', 'end', 'override'],
    system: ['view', 'monitor'], // Can see basic system info
    assistant: ['configure', 'manage'],
    notifications: ['view', 'manage'],
    requests: ['view', 'manage'],
    guests: ['view', 'manage'],
    security: ['view', 'manage'],
    integrations: ['view', 'manage'],
    logs: ['view', 'export'],
  },
  'front-desk': {
    dashboard: ['view'],
    calls: ['view', 'join', 'transfer', 'end'],
    analytics: ['view_basic'], // Limited analytics
    profile: ['view', 'edit'],
    guests: ['view', 'edit', 'checkin', 'checkout', 'manage'],
    requests: ['view', 'manage'], // Can handle guest requests
    notifications: ['view'], // Can see notifications
    system: [], // No system access
  },
  'it-manager': {
    dashboard: ['view'],
    system: ['view', 'edit', 'debug', 'restart', 'monitor'],
    integrations: ['view', 'edit', 'test', 'manage'],
    logs: ['view', 'export', 'debug'],
    calls: ['view', 'debug'], // Technical call debugging
    analytics: ['view', 'technical'], // System performance analytics
    billing: [], // No billing access
    staff: [], // No staff management
    security: ['view', 'manage'], // IT security access
    notifications: ['view'], // System notifications
  },
  // Legacy role mappings for backward compatibility
  admin: {
    dashboard: ['view', 'edit', 'view_client_interface'],
    analytics: ['view', 'export', 'advanced', 'view_advanced'],
    billing: ['view', 'edit'],
    staff: ['view', 'edit', 'delete', 'invite', 'manage'],
    settings: ['view', 'edit'],
    calls: ['view', 'join', 'transfer', 'end', 'override'],
    system: ['view', 'monitor'],
    assistant: ['configure', 'manage'],
    notifications: ['view', 'manage'],
    requests: ['view', 'manage'],
    guests: ['view', 'manage'],
    security: ['view', 'manage'],
    integrations: ['view', 'manage'],
    logs: ['view', 'export'],
  },
  staff: {
    dashboard: ['view'],
    calls: ['view', 'join', 'transfer', 'end'],
    analytics: ['view_basic'],
    profile: ['view', 'edit'],
    guests: ['view', 'edit', 'checkin', 'checkout', 'manage'],
    requests: ['view', 'manage'],
    notifications: ['view'],
    system: [],
  },
  manager: {
    dashboard: ['view', 'edit', 'view_client_interface'],
    analytics: ['view', 'export', 'advanced', 'view_advanced'],
    billing: ['view', 'edit'],
    staff: ['view', 'edit', 'delete', 'invite', 'manage'],
    settings: ['view', 'edit'],
    calls: ['view', 'join', 'transfer', 'end', 'override'],
    system: ['view', 'monitor'],
    assistant: ['configure', 'manage'],
    notifications: ['view', 'manage'],
    requests: ['view', 'manage'],
    guests: ['view', 'manage'],
    security: ['view', 'manage'],
    integrations: ['view', 'manage'],
    logs: ['view', 'export'],
  },
  frontdesk: {
    dashboard: ['view'],
    calls: ['view', 'join', 'transfer', 'end'],
    analytics: ['view_basic'],
    profile: ['view', 'edit'],
    guests: ['view', 'edit', 'checkin', 'checkout', 'manage'],
    requests: ['view', 'manage'],
    notifications: ['view'],
    system: [],
  },
  itmanager: {
    dashboard: ['view'],
    system: ['view', 'edit', 'debug', 'restart', 'monitor'],
    integrations: ['view', 'edit', 'test', 'manage'],
    logs: ['view', 'export', 'debug'],
    calls: ['view', 'debug'],
    analytics: ['view', 'technical'],
    billing: [],
    staff: [],
    security: ['view', 'manage'],
    notifications: ['view'],
  },
  'super-admin': {
    dashboard: ['view', 'edit', 'view_client_interface'],
    analytics: ['view', 'export', 'advanced', 'view_advanced'],
    billing: ['view', 'edit'],
    staff: ['view', 'edit', 'delete', 'invite', 'manage'],
    settings: ['view', 'edit'],
    calls: ['view', 'join', 'transfer', 'end', 'override'],
    system: ['view', 'monitor', 'edit', 'debug', 'restart'],
    assistant: ['configure', 'manage'],
    notifications: ['view', 'manage'],
    requests: ['view', 'manage'],
    guests: ['view', 'manage'],
    security: ['view', 'manage'],
    integrations: ['view', 'manage'],
    logs: ['view', 'export'],
  },
  guest: {
    dashboard: ['view'], // Basic dashboard access for guests
    profile: ['view', 'edit'], // Can view and edit their own profile
    requests: ['view'], // Can view their own requests
    notifications: ['view'], // Can see their notifications
    system: [], // No system access
    analytics: [], // No analytics access
    billing: [], // No billing access
    staff: [], // No staff management
    calls: [], // No call management
    settings: [], // No settings access
    assistant: [], // No assistant configuration
    guests: [], // No guest management
    security: [], // No security access
    integrations: [], // No integrations access
    logs: [], // No logs access
  },
};

// Menu Configuration for each role
export const ROLE_MENU_CONFIG: Record<UserRole, MenuItemConfig[]> = {
  'hotel-manager': [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
      children: [
        {
          key: 'calls-live',
          label: 'Cuộc gọi trực tiếp',
          icon: '🔴',
          path: '/saas-dashboard/calls/live',
          requiredPermission: 'calls.view',
        },
        {
          key: 'calls-history',
          label: 'Lịch sử cuộc gọi',
          icon: '📋',
          path: '/hotel-dashboard/calls/history',
          requiredPermission: 'calls.view',
        },
      ],
    },
    {
      key: 'analytics',
      label: 'Phân tích',
      icon: '📈',
      path: '/saas-dashboard/analytics',
      requiredPermission: 'analytics.view',
    },
    {
      key: 'staff',
      label: 'Nhân viên',
      icon: '👥',
      path: '/saas-dashboard/staff',
      requiredPermission: 'staff.view',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      path: '/saas-dashboard/settings',
      requiredPermission: 'settings.view',
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      icon: '💰',
      path: '/saas-dashboard/billing',
      requiredPermission: 'billing.view',
    },
  ],

  'front-desk': [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
      children: [
        {
          key: 'calls-live',
          label: 'Cuộc gọi trực tiếp',
          icon: '🔴',
          path: '/saas-dashboard/calls/live',
          requiredPermission: 'calls.view',
        },
      ],
    },
    {
      key: 'guests',
      label: 'Khách hàng',
      icon: '🏨',
      path: '/saas-dashboard/guests',
      requiredPermission: 'guests.view',
    },
    {
      key: 'analytics',
      label: 'Thống kê cơ bản',
      icon: '📊',
      path: '/saas-dashboard/analytics/basic',
      requiredPermission: 'analytics.view_basic',
    },
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: '👤',
      path: '/saas-dashboard/profile',
      requiredPermission: 'profile.view',
    },
  ],

  'it-manager': [
    {
      key: 'dashboard',
      label: 'System Dashboard',
      icon: '🔧',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: '⚙️',
      path: '/saas-dashboard/system',
      requiredPermission: 'system.view',
      children: [
        {
          key: 'system-status',
          label: 'Trạng thái hệ thống',
          icon: '🟢',
          path: '/saas-dashboard/system/status',
          requiredPermission: 'system.view',
        },
        {
          key: 'system-config',
          label: 'Cấu hình',
          icon: '⚙️',
          path: '/saas-dashboard/system/config',
          requiredPermission: 'system.edit',
        },
      ],
    },
    {
      key: 'integrations',
      label: 'Tích hợp',
      icon: '🔗',
      path: '/saas-dashboard/integrations',
      requiredPermission: 'integrations.view',
    },
    {
      key: 'logs',
      label: 'Logs',
      icon: '📄',
      path: '/saas-dashboard/logs',
      requiredPermission: 'logs.view',
    },
    {
      key: 'analytics',
      label: 'Performance',
      icon: '📈',
      path: '/saas-dashboard/analytics/technical',
      requiredPermission: 'analytics.technical',
    },
  ],
  // Legacy role menu mappings for backward compatibility
  admin: [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
    },
    {
      key: 'analytics',
      label: 'Phân tích',
      icon: '📈',
      path: '/saas-dashboard/analytics',
      requiredPermission: 'analytics.view',
    },
    {
      key: 'staff',
      label: 'Nhân viên',
      icon: '👥',
      path: '/saas-dashboard/staff',
      requiredPermission: 'staff.view',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      path: '/saas-dashboard/settings',
      requiredPermission: 'settings.view',
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      icon: '💰',
      path: '/saas-dashboard/billing',
      requiredPermission: 'billing.view',
    },
  ],
  staff: [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
    },
    {
      key: 'guests',
      label: 'Khách hàng',
      icon: '🏨',
      path: '/saas-dashboard/guests',
      requiredPermission: 'guests.view',
    },
    {
      key: 'analytics',
      label: 'Thống kê cơ bản',
      icon: '📊',
      path: '/saas-dashboard/analytics/basic',
      requiredPermission: 'analytics.view_basic',
    },
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: '👤',
      path: '/saas-dashboard/profile',
      requiredPermission: 'profile.view',
    },
  ],
  manager: [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
    },
    {
      key: 'analytics',
      label: 'Phân tích',
      icon: '📈',
      path: '/saas-dashboard/analytics',
      requiredPermission: 'analytics.view',
    },
    {
      key: 'staff',
      label: 'Nhân viên',
      icon: '👥',
      path: '/saas-dashboard/staff',
      requiredPermission: 'staff.view',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      path: '/saas-dashboard/settings',
      requiredPermission: 'settings.view',
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      icon: '💰',
      path: '/saas-dashboard/billing',
      requiredPermission: 'billing.view',
    },
  ],
  frontdesk: [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
    },
    {
      key: 'guests',
      label: 'Khách hàng',
      icon: '🏨',
      path: '/saas-dashboard/guests',
      requiredPermission: 'guests.view',
    },
    {
      key: 'analytics',
      label: 'Thống kê cơ bản',
      icon: '📊',
      path: '/saas-dashboard/analytics/basic',
      requiredPermission: 'analytics.view_basic',
    },
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: '👤',
      path: '/saas-dashboard/profile',
      requiredPermission: 'profile.view',
    },
  ],
  itmanager: [
    {
      key: 'dashboard',
      label: 'System Dashboard',
      icon: '🔧',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: '⚙️',
      path: '/saas-dashboard/system',
      requiredPermission: 'system.view',
    },
    {
      key: 'integrations',
      label: 'Tích hợp',
      icon: '🔗',
      path: '/saas-dashboard/integrations',
      requiredPermission: 'integrations.view',
    },
    {
      key: 'logs',
      label: 'Logs',
      icon: '📄',
      path: '/saas-dashboard/logs',
      requiredPermission: 'logs.view',
    },
    {
      key: 'analytics',
      label: 'Performance',
      icon: '📈',
      path: '/saas-dashboard/analytics/technical',
      requiredPermission: 'analytics.technical',
    },
  ],
  'super-admin': [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/saas-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'calls',
      label: 'Cuộc gọi',
      icon: '📞',
      path: '/saas-dashboard/calls',
      requiredPermission: 'calls.view',
    },
    {
      key: 'analytics',
      label: 'Phân tích',
      icon: '📈',
      path: '/saas-dashboard/analytics',
      requiredPermission: 'analytics.view',
    },
    {
      key: 'staff',
      label: 'Nhân viên',
      icon: '👥',
      path: '/saas-dashboard/staff',
      requiredPermission: 'staff.view',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      path: '/saas-dashboard/settings',
      requiredPermission: 'settings.view',
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      icon: '💰',
      path: '/saas-dashboard/billing',
      requiredPermission: 'billing.view',
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: '⚙️',
      path: '/saas-dashboard/system',
      requiredPermission: 'system.view',
    },
  ],
  guest: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/guest-dashboard',
      requiredPermission: 'dashboard.view',
    },
    {
      key: 'profile',
      label: 'My Profile',
      icon: '👤',
      path: '/guest-dashboard/profile',
      requiredPermission: 'profile.view',
    },
    {
      key: 'requests',
      label: 'My Requests',
      icon: '📋',
      path: '/guest-dashboard/requests',
      requiredPermission: 'requests.view',
    },
  ],
};

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: UserRole) => {
  const rolePermissions = PERMISSION_MATRIX[role];
  const permissions = [];

  for (const [module, actions] of Object.entries(rolePermissions)) {
    for (const action of actions as any[]) {
      permissions.push({
        module,
        action,
        allowed: true,
      });
    }
  }

  return permissions;
};

// Helper function to check if a role has a specific permission
export const hasRolePermission = (
  role: UserRole,
  module: string,
  action: string
): boolean => {
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
    'FinancialSummary',
  ],
  'front-desk': [
    'ActiveCalls',
    'GuestRequests',
    'RoomStatus',
    'QuickActions',
    'ShiftSummary',
  ],
  'it-manager': [
    'SystemHealth',
    'PerformanceMetrics',
    'ErrorLogs',
    'IntegrationStatus',
    'SecurityAlerts',
  ],
  // Legacy role dashboard component mappings
  admin: [
    'RevenueChart',
    'CallsOverview',
    'OperationalMetrics',
    'StaffPerformance',
    'FinancialSummary',
  ],
  staff: [
    'ActiveCalls',
    'GuestRequests',
    'RoomStatus',
    'QuickActions',
    'ShiftSummary',
  ],
  manager: [
    'RevenueChart',
    'CallsOverview',
    'OperationalMetrics',
    'StaffPerformance',
    'FinancialSummary',
  ],
  frontdesk: [
    'ActiveCalls',
    'GuestRequests',
    'RoomStatus',
    'QuickActions',
    'ShiftSummary',
  ],
  itmanager: [
    'SystemHealth',
    'PerformanceMetrics',
    'ErrorLogs',
    'IntegrationStatus',
    'SecurityAlerts',
  ],
  'super-admin': [
    'RevenueChart',
    'CallsOverview',
    'OperationalMetrics',
    'StaffPerformance',
    'FinancialSummary',
    'SystemHealth',
    'SecurityAlerts',
  ],
  guest: ['GuestProfile', 'MyRequests', 'BasicInfo'],
};
