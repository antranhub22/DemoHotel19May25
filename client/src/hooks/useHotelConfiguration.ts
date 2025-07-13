import { useState, useEffect, useCallback } from 'react';
import { useTenantDetection } from '@/context/AuthContext';
import { DashboardApi, HotelProfile } from '@/services/dashboardApi';

// ============================================
// Hotel Configuration Interface
// ============================================

export interface HotelConfiguration {
  // Basic hotel info
  hotelName: string;
  logoUrl: string;
  primaryColor: string;
  headerText: string;
  
  // Vapi configuration
  vapiPublicKey: string;
  vapiAssistantId: string;
  
  // Branding
  branding: {
    logo: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  
  // Features
  features: {
    callHistory: boolean;
    multiLanguage: boolean;
    analytics: boolean;
    customization: boolean;
  };
  
  // Services available
  services: Array<{
    type: string;
    name: string;
    enabled: boolean;
  }>;
  
  // Language support
  supportedLanguages: string[];
}

// ============================================
// Mi Nhon Hotel Default Configuration
// ============================================

const MI_NHON_DEFAULT_CONFIG: HotelConfiguration = {
  hotelName: 'Mi Nhon Hotel Mui Ne',
  logoUrl: '/assets/references/images/minhon-logo.jpg',
  primaryColor: '#1e40af',
  headerText: 'Mi Nhon Hotel Mui Ne',
  
  vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  
  branding: {
    logo: '/assets/references/images/minhon-logo.jpg',
    colors: {
      primary: '#1e40af',
      secondary: '#d4af37',
      accent: '#f59e0b'
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Inter'
    }
  },
  
  features: {
    callHistory: true,
    multiLanguage: true,
    analytics: true,
    customization: true
  },
  
  services: [
    { type: 'room_service', name: 'Room Service', enabled: true },
    { type: 'concierge', name: 'Concierge', enabled: true },
    { type: 'housekeeping', name: 'Housekeeping', enabled: true },
    { type: 'maintenance', name: 'Maintenance', enabled: true },
    { type: 'restaurant', name: 'Restaurant', enabled: true }
  ],
  
  supportedLanguages: ['en', 'fr', 'zh', 'ru', 'ko', 'vi']
};

// ============================================
// Hotel Configuration Hook
// ============================================

export const useHotelConfiguration = () => {
  const [config, setConfig] = useState<HotelConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenantDetection();

  const extractHotelIdentifier = (): { type: 'default' | 'subdomain' | 'custom', identifier: string } => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { type: 'default', identifier: 'localhost' };
    }
    
    if (hostname.includes('.talk2go.online')) {
      const subdomain = hostname.split('.')[0];
      return { type: 'subdomain', identifier: subdomain };
    }
    
    return { type: 'custom', identifier: hostname };
  };

  const fetchHotelConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { type, identifier } = extractHotelIdentifier();
      
      // Fallback config for minhonmuine
      if (identifier === 'minhonmuine') {
        const fallbackConfig: HotelConfiguration = {
          hotelName: 'Mi Nhon Hotel Mui Ne',
          logoUrl: '/assets/haily-logo1.jpg',
          primaryColor: '#2E7D32',
          headerText: 'Welcome to Mi Nhon Hotel',
          vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
          vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
          branding: {
            logo: '/assets/haily-logo1.jpg',
            colors: {
              primary: '#2E7D32',
              secondary: '#FFC107',
              accent: '#FF6B6B'
            },
            fonts: {
              primary: 'Inter',
              secondary: 'Roboto'
            }
          },
          features: {
            callHistory: true,
            multiLanguage: true,
            analytics: true,
            customization: true
          },
          services: [],
          supportedLanguages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko']
        };
        
        setConfig(fallbackConfig);
        setIsLoading(false);
        return;
      }
      
      // Try to fetch from API
      let response;
      try {
        if (type === 'subdomain') {
          response = await fetch(`/api/hotels/by-subdomain/${identifier}`);
        } else {
          response = await fetch(`/api/hotels/by-domain/${identifier}`);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        const hotelConfig: HotelConfiguration = {
          hotelName: data.name || 'Hotel',
          logoUrl: data.branding?.logo || '/assets/hotel-default-logo.png',
          primaryColor: data.branding?.primaryColor || '#2E7D32',
          headerText: `Welcome to ${data.name || 'Hotel'}`,
          vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
          vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
          branding: {
            logo: data.branding?.logo || '/assets/hotel-default-logo.png',
            colors: {
              primary: data.branding?.primaryColor || '#2E7D32',
              secondary: data.branding?.secondaryColor || '#FFC107',
              accent: data.branding?.accentColor || '#FF6B6B'
            },
            fonts: {
              primary: data.branding?.primaryFont || 'Inter',
              secondary: data.branding?.secondaryFont || 'Roboto'
            }
          },
          features: {
            callHistory: data.features?.callHistory ?? true,
            multiLanguage: data.features?.multiLanguage ?? true,
            analytics: data.features?.analytics ?? true,
            customization: data.features?.customization ?? true
          },
          services: data.services || [],
          supportedLanguages: data.supportedLanguages || ['en', 'vi']
        };
        
        setConfig(hotelConfig);
      } catch (apiError) {
        console.warn('Failed to fetch hotel config, using fallback:', apiError);
        
        // Use fallback config
        const fallbackConfig: HotelConfiguration = {
          hotelName: 'Mi Nhon Hotel Mui Ne',
          logoUrl: '/assets/haily-logo1.jpg',
          primaryColor: '#2E7D32',
          headerText: 'Welcome to Mi Nhon Hotel',
          vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
          vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
          branding: {
            logo: '/assets/haily-logo1.jpg',
            colors: {
              primary: '#2E7D32',
              secondary: '#FFC107',
              accent: '#FF6B6B'
            },
            fonts: {
              primary: 'Inter',
              secondary: 'Roboto'
            }
          },
          features: {
            callHistory: true,
            multiLanguage: true,
            analytics: true,
            customization: true
          },
          services: [],
          supportedLanguages: ['en', 'vi', 'fr', 'zh', 'ru', 'ko']
        };
        
        setConfig(fallbackConfig);
      }
    } catch (error) {
      console.error('Error in fetchHotelConfiguration:', error);
      setError(error instanceof Error ? error.message : 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant]);

  useEffect(() => {
    fetchHotelConfiguration();
  }, [fetchHotelConfiguration]);

  return {
    config,
    isLoading,
    error,
    reload: fetchHotelConfiguration,
    isMiNhon: false
  };
};

// ============================================
// Helper Functions
// ============================================

export const getVapiPublicKeyByLanguage = (language: string, config: HotelConfiguration): string => {
  // For Mi Nhon Hotel, use language-specific keys
  if (config.hotelName === 'Mi Nhon Hotel Mui Ne') {
    switch (language) {
      case 'fr':
        return import.meta.env.VITE_VAPI_PUBLIC_KEY_FR || config.vapiPublicKey;
      case 'zh':
        return import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH || config.vapiPublicKey;
      case 'ru':
        return import.meta.env.VITE_VAPI_PUBLIC_KEY_RU || config.vapiPublicKey;
      case 'ko':
        return import.meta.env.VITE_VAPI_PUBLIC_KEY_KO || config.vapiPublicKey;
      case 'vi':
        return import.meta.env.VITE_VAPI_PUBLIC_KEY_VI || config.vapiPublicKey;
      case 'en':
      default:
        return import.meta.env.VITE_VAPI_PUBLIC_KEY || config.vapiPublicKey;
    }
  }
  
  // For other tenants, use the single assistant
  return config.vapiPublicKey || import.meta.env.VITE_VAPI_PUBLIC_KEY;
};

export const getVapiAssistantIdByLanguage = (language: string, config: HotelConfiguration): string => {
  // For Mi Nhon Hotel, use language-specific assistant IDs
  if (config.hotelName === 'Mi Nhon Hotel Mui Ne') {
    switch (language) {
      case 'fr':
        return import.meta.env.VITE_VAPI_ASSISTANT_ID_FR || config.vapiAssistantId;
      case 'zh':
        return import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH || config.vapiAssistantId;
      case 'ru':
        return import.meta.env.VITE_VAPI_ASSISTANT_ID_RU || config.vapiAssistantId;
      case 'ko':
        return import.meta.env.VITE_VAPI_ASSISTANT_ID_KO || config.vapiAssistantId;
      case 'vi':
        return import.meta.env.VITE_VAPI_ASSISTANT_ID_VI || config.vapiAssistantId;
      case 'en':
      default:
        return import.meta.env.VITE_VAPI_ASSISTANT_ID || config.vapiAssistantId;
    }
  }
  
  // For other tenants, use the single assistant
  return config.vapiAssistantId || import.meta.env.VITE_VAPI_ASSISTANT_ID;
}; 