import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { logger } from '@shared/utils/logger';
import { getPermissionsForRole,  } from '@shared/constants/permissions';
// ============================================
// Types & Interfaces
// ============================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: UserRole; // Updated to use UserRole type
  permissions: Permission[];
  avatar?: string;
}

export interface TenantData {
  id: string;
  hotelName: string;
  subdomain: string;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  trialEndsAt?: Date;
  remainingDays?: number;
  customDomain?: string;
  features?: {
    voiceCloning: boolean;
    multiLocation: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
  };
  limits?: {
    maxCalls: number;
    maxAssistants: number;
    maxLanguages: number;
    dataRetentionDays: number;
  };
  usage?: {
    totalCalls: number;
    currentMonth: number;
    remainingCalls: number;
  };
}

export interface AuthContextType {
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
    logger.warn(
      'useAuth used outside AuthProvider - returning safe defaults',
      'Component'
    );
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
  logger.debug('[DEBUG] AuthProvider render', 'Component');

  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logger.debug(
      '[DEBUG] AuthProvider useEffect - checking token',
      'Component'
    );
    const token = localStorage.getItem('token');
    if (!token) {
      logger.debug(
        '[DEBUG] AuthProvider - no token found, setting loading false',
        'Component'
      );
      setIsLoading(false);
      return;
    }

    try {
      logger.debug('[DEBUG] AuthProvider - decoding token', 'Component');
      const decoded = jwtDecode<MyJwtPayload>(token);
      logger.debug(
        '[DEBUG] AuthProvider - token decoded:',
        'Component',
        decoded
      );

      // Tạo user object từ token payload
      const mappedRole = mapLegacyRole(decoded.role);
      const userFromToken: AuthUser = {
        id: decoded.username, // Use username as id
        name: decoded.username,
        email: decoded.username,
        tenantId: decoded.tenantId,
        role: mappedRole,
        permissions: getPermissionsForRole(mappedRole),
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
      logger.debug(
        '[DEBUG] AuthProvider - token decode error:',
        'Component',
        error
      );
      localStorage.removeItem('token');
    } finally {
      logger.debug('[DEBUG] AuthProvider - setting loading false', 'Component');
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
        {throw new Error('Không nhận được token từ server');}
      localStorage.setItem('token', data.token);

      // Reset auto-login attempts after successful manual login
      const { resetAutoLoginAttempts } = await import('@/lib/authHelper');
      resetAutoLoginAttempts();

      // Sử dụng user data từ unified auth response
      const userFromResponse: AuthUser = {
        id: data.user.id,
        name: data.user.displayName || data.user.username,
        email: data.user.email,
        tenantId: data.user.tenantId,
        role: data.user.role,
        permissions: data.user.permissions || [],
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
    logger.debug('[DEBUG] AuthProvider logout called', 'Component');
    setUser(null);
    setTenant(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  // Permission checking function
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user || !user.permissions) {return false;}

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

  logger.debug('[DEBUG] AuthProvider state:', 'Component', {
    user,
    tenant,
    isLoading,
  });

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
    if (typeof window === 'undefined') {return;}

    // const _host = window.location.host;
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
    if (isLoading) {return null;} // Still loading

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
