// ============================================
// BACKWARD COMPATIBILITY RE-EXPORT
// ============================================
// This file maintains backward compatibility for components 
// that still import from @shared/constants/permissions

// DISABLED: auth-system excluded from TypeScript compilation
// Re-export everything from the new location in auth-system
// export * from '../../auth-system/types/permissions';

// ============================================
// FALLBACK PERMISSIONS FOR FRONTEND
// ============================================

export type UserRole = 
  | 'hotel-manager' 
  | 'front-desk' 
  | 'it-manager'
  | 'admin' 
  | 'staff' 
  | 'manager'
  | 'frontdesk'
  | 'itmanager'
  | 'super-admin';

export interface Permission {
  module: string;
  action: string;
  allowed: boolean;
}

// Simple permission matrix for frontend
export const PERMISSION_MATRIX: Record<UserRole, Record<string, string[]>> = {
  'hotel-manager': {
    dashboard: ['view', 'edit'],
    analytics: ['view', 'export'],
    calls: ['view', 'manage'],
    requests: ['view', 'manage'],
  },
  'front-desk': {
    dashboard: ['view'],
    calls: ['view'],
    requests: ['view', 'manage'],
  },
  'it-manager': {
    dashboard: ['view'],
    system: ['view', 'debug'],
    calls: ['view'],
  },
  'admin': {
    dashboard: ['view', 'edit'],
    analytics: ['view', 'export'],
    calls: ['view', 'manage'],
    requests: ['view', 'manage'],
  },
  'staff': {
    dashboard: ['view'],
    requests: ['view'],
  },
  'manager': {
    dashboard: ['view', 'edit'],
    analytics: ['view', 'export'],
    calls: ['view', 'manage'],
    requests: ['view', 'manage'],
  },
  'frontdesk': {
    dashboard: ['view'],
    calls: ['view'],
    requests: ['view', 'manage'],
  },
  'itmanager': {
    dashboard: ['view'],
    system: ['view', 'debug'],
    calls: ['view'],
  },
  'super-admin': {
    dashboard: ['view', 'edit'],
    analytics: ['view', 'export'],
    calls: ['view', 'manage'],
    requests: ['view', 'manage'],
    system: ['view', 'debug', 'manage'],
  }
};

export const getPermissionsForRole = (role: UserRole): Permission[] => {
  const rolePermissions = PERMISSION_MATRIX[role] || {};
  const permissions: Permission[] = [];
  
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

export const hasRolePermission = (role: UserRole, module: string, action: string): boolean => {
  const rolePermissions = PERMISSION_MATRIX[role] || {};
  return rolePermissions[module]?.includes(action) || false;
}; 