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
  const tenantInfo = useTenantDetection();

  const loadConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If no tenant info yet, wait
      if (!tenantInfo) {
        return;
      }
      
      // For Mi Nhon Hotel (backward compatibility)
      if (tenantInfo.isMiNhon) {
        console.log('🏨 Loading Mi Nhon Hotel configuration (backward compatibility)');
        setConfig(MI_NHON_DEFAULT_CONFIG);
        return;
      }
      
      // For other tenants, load from API
      if (tenantInfo.subdomain || tenantInfo.customDomain) {
        console.log('🏨 Loading tenant configuration for:', tenantInfo.subdomain || tenantInfo.customDomain);
        
        try {
          const dashboardApi = new DashboardApi();
          const profileResponse = await dashboardApi.getHotelProfile();
          
          if (profileResponse.success && profileResponse.profile) {
            const profile = profileResponse.profile;
            
                         // Convert hotel profile to configuration
             const tenantConfig: HotelConfiguration = {
               hotelName: profile.researchData.name,
               logoUrl: '/assets/hotel-default-logo.png',
               primaryColor: '#1e40af',
               headerText: profile.researchData.name,
               
               vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
               vapiAssistantId: profile.vapiAssistantId || '',
               
               branding: {
                 logo: '/assets/hotel-default-logo.png',
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
                callHistory: profileResponse.features.advancedAnalytics || true,
                multiLanguage: profile.assistantConfig.languages?.length > 1 || true,
                analytics: profileResponse.features.advancedAnalytics || true,
                customization: profileResponse.features.whiteLabel || true
              },
              
              services: profile.researchData.services?.map(service => ({
                type: service.type,
                name: service.name,
                enabled: true
              })) || [],
              
              supportedLanguages: profile.assistantConfig.languages || ['en']
            };
            
            setConfig(tenantConfig);
          } else {
            throw new Error('Hotel profile not found');
          }
        } catch (apiError) {
          console.error('❌ Failed to load tenant configuration:', apiError);
          
          // Fallback to basic configuration for error cases
          const fallbackConfig: HotelConfiguration = {
            hotelName: tenantInfo.subdomain ? `${tenantInfo.subdomain.charAt(0).toUpperCase()}${tenantInfo.subdomain.slice(1)} Hotel` : 'Hotel',
            logoUrl: '/assets/hotel-default-logo.png',
            primaryColor: '#1e40af',
            headerText: tenantInfo.subdomain ? `${tenantInfo.subdomain.charAt(0).toUpperCase()}${tenantInfo.subdomain.slice(1)} Hotel` : 'Hotel',
            
            vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
            vapiAssistantId: '', // Will need to be created
            
            branding: {
              logo: '/assets/hotel-default-logo.png',
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
              callHistory: false,
              multiLanguage: false,
              analytics: false,
              customization: false
            },
            
            services: [
              { type: 'concierge', name: 'Concierge', enabled: true }
            ],
            
            supportedLanguages: ['en']
          };
          
          setConfig(fallbackConfig);
          setError('Configuration loaded with limited features. Please complete hotel setup.');
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading hotel configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      
      // Fallback to Mi Nhon configuration on error
      setConfig(MI_NHON_DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, [tenantInfo]);

  // Load configuration when tenant info changes
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  return {
    config,
    isLoading,
    error,
    reload: loadConfiguration,
    isMiNhon: tenantInfo?.isMiNhon || false
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
      default:
        return config.vapiPublicKey;
    }
  }
  
  // For other tenants, use the single assistant
  return config.vapiPublicKey;
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
      default:
        return config.vapiAssistantId;
    }
  }
  
  // For other tenants, use the single assistant
  return config.vapiAssistantId;
}; 