// RBAC Types for Unified Dashboard
export type UserRole = 'hotel-manager' | 'front-desk' | 'it-manager';

export interface Permission {
  module: string; // 'dashboard', 'analytics', 'billing', 'system', 'calls'
  action: string; // 'view', 'edit', 'delete', 'export', 'debug'
  allowed: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  hotelId: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  path: string;
  requiredPermission?: string;
  children?: MenuItemConfig[];
}

export interface RoleConfig {
  role: UserRole;
  permissions: Permission[];
  menuItems: MenuItemConfig[];
  dashboardComponents: string[];
}

// Permission Matrix Type
export type PermissionMatrix = Record<UserRole, Record<string, string[]>>;

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  getMenuItems: () => MenuItemConfig[];
  switchRole?: (newRole: UserRole) => Promise<void>; // For demo/testing
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  hotelId: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
} 