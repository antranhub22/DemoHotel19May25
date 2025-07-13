import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';

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
  console.log('[DEBUG] AuthProvider render');
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[DEBUG] AuthProvider useEffect - checking token');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[DEBUG] AuthProvider - no token found, setting loading false');
      setIsLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] AuthProvider - decoding token');
      const decoded = jwtDecode(token) as JwtPayload;
      console.log('[DEBUG] AuthProvider - token decoded:', { user: decoded.user, tenant: decoded.tenant });
      
      setUser(decoded.user);
      setTenant(decoded.tenant);
    } catch (error) {
      console.log('[DEBUG] AuthProvider - token decode error:', error);
      localStorage.removeItem('token');
    } finally {
      console.log('[DEBUG] AuthProvider - setting loading false');
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: AuthUser, tenantData: TenantData) => {
    console.log('[DEBUG] AuthProvider login called:', { user: userData, tenant: tenantData });
    setUser(userData);
    setTenant(tenantData);
  }, []);

  const logout = useCallback(() => {
    console.log('[DEBUG] AuthProvider logout called');
    setUser(null);
    setTenant(null);
    localStorage.removeItem('token');
  }, []);

  console.log('[DEBUG] AuthProvider state:', { user, tenant, isLoading });
  
  return (
    <AuthContext.Provider value={{ user, tenant, isLoading, login, logout }}>
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