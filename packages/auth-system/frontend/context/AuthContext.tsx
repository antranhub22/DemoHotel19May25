import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserRole, getPermissionsForRole } from '../../types/permissions';
import { AuthUser, TenantData } from '../../types/auth';

// ============================================
// Types & Interfaces
// ============================================

interface AuthContextType {
  user: AuthUser | null;
  tenant: TenantData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (module: string, action: string) => boolean;
  isWithinLimits: (limitType: string) => boolean;
}

// ============================================
// Context Creation
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Auth Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth used outside AuthProvider - returning safe defaults');
    // Return safe defaults instead of throwing
    return {
      user: null,
      tenant: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
      hasPermission: () => false,
      hasRole: () => false,
      refreshAuth: async () => {},
      hasFeature: () => false,
      isWithinLimits: () => true,
    };
  }
  return context;
};

// ============================================
// Auth Provider Component
// ============================================

type MyJwtPayload = {
  username: string;
  tenantId: string;
  role: string;
  permissions: string[];
  [key: string]: any;
};

// Map legacy roles to new RBAC roles
const mapLegacyRole = (legacyRole: string): UserRole => {
  switch (legacyRole) {
    case 'admin':
    case 'manager':
    case 'hotel-manager':
      return 'hotel-manager';
    case 'staff':
    case 'front-desk':
      return 'front-desk';
    case 'it':
    case 'tech':
    case 'it-manager':
      return 'it-manager';
    default:
      return 'front-desk'; // Default fallback
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log('[DEBUG] AuthProvider render');

  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[DEBUG] AuthProvider useEffect - checking token');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log(
        '[DEBUG] AuthProvider - no token found, setting loading false'
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] AuthProvider - decoding token');
      const decoded = jwtDecode<MyJwtPayload>(token);
      console.log('[DEBUG] AuthProvider - token decoded:', decoded);

      // Tạo user object từ token payload
      const mappedRole = mapLegacyRole(decoded.role);
      const userFromToken: AuthUser = {
        id: decoded.username, // Use username as id
        username: decoded.username,
        displayName: decoded.username,
        email: decoded.username,
        tenantId: decoded.tenantId,
        role: mappedRole,
        permissions: getPermissionsForRole(mappedRole),
        isActive: true,
      };

      // Tạo tenant object từ token payload
      const tenantFromToken: TenantData = {
        id: decoded.tenantId,
        hotelName: 'Mi Nhon Hotel', // Default name
        subdomain: 'minhonmuine',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
      };

      setUser(userFromToken);
      setTenant(tenantFromToken);
    } catch (error) {
      console.log('[DEBUG] AuthProvider - token decode error:', error);
      localStorage.removeItem('token');
    } finally {
      console.log('[DEBUG] AuthProvider - setting loading false');
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        throw new Error('Sai tài khoản hoặc mật khẩu');
      }
      const data = await res.json();
      if (!data.success || !data.token)
        throw new Error('Không nhận được token từ server');
      localStorage.setItem('token', data.token);

      // Sử dụng user data từ unified auth response
      const userFromResponse: AuthUser = {
        id: data.user.id,
        username: data.user.username,
        displayName: data.user.displayName || data.user.username,
        email: data.user.email,
        tenantId: data.user.tenantId,
        role: data.user.role,
        permissions: data.user.permissions || [],
        isActive: true,
      };

      // Tạo tenant object từ user data
      const tenantFromResponse: TenantData = {
        id: data.user.tenantId,
        hotelName: 'Mi Nhon Hotel', // Default name
        subdomain: 'minhonmuine',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
      };

      setUser(userFromResponse);
      setTenant(tenantFromResponse);
    } catch (err: any) {
      localStorage.removeItem('token');
      setUser(null);
      setTenant(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('[DEBUG] AuthProvider logout called');
    setUser(null);
    setTenant(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  // Permission checking function
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user || !user.permissions) return false;

      return user.permissions.some(
        permission =>
          permission.module === module &&
          permission.action === action &&
          permission.allowed
      );
    },
    [user]
  );

  // Role checking function
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.role === role;
    },
    [user]
  );

  console.log('[DEBUG] AuthProvider state:', { user, tenant, isLoading });

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        login, // dùng hàm login thực tế
        logout,
        isAuthenticated: !!user,
        refreshAuth: async () => {}, // dummy async refreshAuth
        hasFeature: () => false,
        hasRole,
        hasPermission,
        isWithinLimits: () => true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Tenant Detection Hook
// ============================================

export const useTenantDetection = () => {
  const [tenantInfo, setTenantInfo] = useState<{
    subdomain: string | null;
    isMiNhon: boolean;
    isSubdomain: boolean;
    customDomain?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const host = window.location.host;
    const hostname = window.location.hostname;

    // Check if it's a subdomain (not localhost, IP, or main domain)
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
    const isMainDomain =
      hostname === 'talk2go.online' || hostname === 'www.talk2go.online';

    let subdomain: string | null = null;
    let isSubdomain = false;
    let customDomain: string | undefined = undefined;

    if (!isLocalhost && !isIP && !isMainDomain) {
      // Check if it's a custom domain or subdomain
      if (hostname.includes('.talk2go.online')) {
        // It's a subdomain
        const parts = hostname.split('.');
        if (parts.length > 2) {
          subdomain = parts[0];
          isSubdomain = true;
        }
      } else {
        // It's a custom domain
        customDomain = hostname;
        isSubdomain = false;
      }
    }

    // Check if it's Mi Nhon Hotel (for backward compatibility)
    const isMiNhon =
      isLocalhost ||
      hostname === 'minhotel.talk2go.online' ||
      hostname === 'talk2go.online' ||
      hostname === 'www.talk2go.online' ||
      subdomain === 'minhon';

    setTenantInfo({
      subdomain,
      isMiNhon,
      isSubdomain,
      customDomain,
    });
  }, []);

  return tenantInfo;
};

// ============================================
// Protected Route Hook
// ============================================

export const useRequireAuth = (
  requireAuth: boolean = true,
  requiredRole?: UserRole
) => {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } =
    useAuth();

  const canAccess = () => {
    if (isLoading) return null; // Still loading

    if (requireAuth && !isAuthenticated) {
      return false; // Not authenticated
    }

    if (requiredRole && user && !hasRole(requiredRole)) {
      // For new RBAC system, roles are more specific and don't have hierarchy
      // Each role has specific permissions instead
      return false;
    }

    return true; // Access granted
  };

  return {
    canAccess: canAccess(),
    isLoading,
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
  };
};

export default AuthContext;
