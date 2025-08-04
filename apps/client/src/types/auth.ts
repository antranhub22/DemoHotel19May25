export type UserRole = "admin" | "manager" | "staff" | "guest" | "super_admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
}
