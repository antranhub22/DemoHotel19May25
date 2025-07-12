import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================
// Types & Interfaces
// ============================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: 'admin' | 'manager' | 'staff';
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
  hasRole: (role: 'admin' | 'manager' | 'staff') => boolean;
  isWithinLimits: (limitType: string) => boolean;
}

// ============================================
// Context Creation
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Auth Hook
// ============================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// Auth Provider Component
// ============================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get authentication token
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || localStorage.getItem('staff_token');
  };

  // Refresh authentication state
  const refreshAuth = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setTenant(data.tenant);
      } else if (response.status === 401) {
        // Token invalid, clear storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('staff_token');
        setUser(null);
        setTenant(null);
      } else {
        console.error('Auth refresh failed:', response.statusText);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      // Don't clear tokens on network error, just set loading to false
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setTenant(data.tenant);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('staff_token');
    setUser(null);
    setTenant(null);
    
    // Redirect to main page
    window.location.href = '/';
  };

  // Feature access checker
  const hasFeature = (feature: string): boolean => {
    if (!tenant || !tenant.features) return false;
    return tenant.features[feature as keyof typeof tenant.features] || false;
  };

  // Role checker
  const hasRole = (role: 'admin' | 'manager' | 'staff'): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      'staff': 1,
      'manager': 2,
      'admin': 3
    };
    
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[role];
    
    return userLevel >= requiredLevel;
  };

  // Limits checker
  const isWithinLimits = (limitType: string): boolean => {
    if (!tenant || !tenant.limits || !tenant.usage) return false;
    
    switch (limitType) {
      case 'calls':
        return tenant.usage.currentMonth < tenant.limits.maxCalls;
      case 'assistants':
        // This would need to be implemented based on actual usage data
        return true;
      case 'languages':
        // This would need to be implemented based on actual usage data
        return true;
      default:
        return true;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // Periodic token refresh (every 10 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    user,
    tenant,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    hasFeature,
    hasRole,
    isWithinLimits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
    const isMainDomain = hostname === 'talk2go.online' || hostname === 'www.talk2go.online';
    
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
    const isMiNhon = isLocalhost || 
                     hostname === 'minhotel.talk2go.online' || 
                     hostname === 'talk2go.online' ||
                     hostname === 'www.talk2go.online' ||
                     subdomain === 'minhon';

    setTenantInfo({
      subdomain,
      isMiNhon,
      isSubdomain,
      customDomain
    });
  }, []);

  return tenantInfo;
};

// ============================================
// Protected Route Hook
// ============================================

export const useRequireAuth = (requireAuth: boolean = true, requiredRole?: 'admin' | 'manager' | 'staff') => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const canAccess = () => {
    if (isLoading) return null; // Still loading
    
    if (requireAuth && !isAuthenticated) {
      return false; // Not authenticated
    }
    
    if (requiredRole && user && user.role !== requiredRole) {
      const roleHierarchy = {
        'staff': 1,
        'manager': 2,
        'admin': 3
      };
      
      const userLevel = roleHierarchy[user.role];
      const requiredLevel = roleHierarchy[requiredRole];
      
      return userLevel >= requiredLevel;
    }
    
    return true; // Access granted
  };

  return {
    canAccess: canAccess(),
    isLoading,
    user,
    isAuthenticated
  };
};

export default AuthContext; 