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
  console.log('[DEBUG] useHotelConfiguration hook called');
  const [config, setConfig] = useState<HotelConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tenantInfo = useTenantDetection();

  // Nhận diện subdomain giống useHotelConfig
  const extractHotelIdentifier = (): { type: 'default' | 'subdomain' | 'custom', identifier: string } => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocalhost) {
      return { type: 'default', identifier: 'mi-nhon-hotel' };
    }
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[parts.length - 2] === 'talk2go' && parts[parts.length - 1] === 'online') {
      return { type: 'subdomain', identifier: parts[0] };
    }
    return { type: 'custom', identifier: hostname };
  };

  const loadConfiguration = useCallback(async () => {
    console.log('[DEBUG] loadConfiguration called');
    try {
      setIsLoading(true);
      setError(null);
      const { type, identifier } = extractHotelIdentifier();
      console.log('[DEBUG] extractHotelIdentifier', { type, identifier });
      if (type === 'default') {
        setConfig(MI_NHON_DEFAULT_CONFIG);
        return;
      }
      if (type === 'subdomain') {
        // Gọi API public lấy config
        const endpoint = `/api/hotels/by-subdomain/${identifier}`;
        console.log('[DEBUG] Fetching hotel config from', endpoint);
        try {
          const response = await fetch(endpoint);
          console.log('[DEBUG] fetch response', response);
          if (!response.ok) throw new Error('Failed to load hotel configuration');
          const hotelData = await response.json();
          console.log('[DEBUG] hotelData', hotelData);
          setConfig({
            hotelName: hotelData.name,
            logoUrl: hotelData.branding.logo,
            primaryColor: hotelData.branding.primaryColor,
            headerText: hotelData.name,
            vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
            vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
            branding: {
              ...hotelData.branding,
              colors: {
                primary: hotelData.branding.primaryColor || '#2E7D32',
                secondary: hotelData.branding.secondaryColor || '#FFC107',
                accent: hotelData.branding.accentColor || '#FF6B6B',
              },
              fonts: {
                primary: hotelData.branding.PrimaryFont || 'Inter',
                secondary: hotelData.branding.SecondaryFont || 'Roboto',
              }
            },
            features: hotelData.features,
            services: hotelData.services,
            supportedLanguages: hotelData.supportedLanguages
          });
          return;
        } catch (err) {
          console.error('[DEBUG] fetch hotel config error', err);
        }
      }
      // Nếu là custom domain hoặc fallback, dùng config mặc định
      setConfig(MI_NHON_DEFAULT_CONFIG);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      setConfig(MI_NHON_DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  return {
    config,
    isLoading,
    error,
    reload: loadConfiguration,
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