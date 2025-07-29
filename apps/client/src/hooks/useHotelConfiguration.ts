/// <reference types="vite/client" />

// Type declaration for import.meta

import { logger } from '@shared/utils/logger';
import { useCallback, useEffect, useState } from 'react';
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
  primaryColor: '#2C3E50', // Changed to luxury dark blue for main header
  headerText: 'Mi Nhon Hotel Mui Ne',

  vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',

  branding: {
    logo: '/assets/references/images/minhon-logo.jpg',
    colors: {
      primary: '#2C3E50', // Changed to luxury dark blue for main header
      secondary: '#34495E', // Changed to lighter dark blue for main header
      accent: '#E74C3C', // Changed to coral red accent for main header
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Inter',
    },
  },

  features: {
    callHistory: true,
    multiLanguage: true,
    analytics: true,
    customization: true,
  },

  services: [
    { type: 'room_service', name: 'Room Service', enabled: true },
    { type: 'concierge', name: 'Concierge', enabled: true },
    { type: 'housekeeping', name: 'Housekeeping', enabled: true },
    { type: 'maintenance', name: 'Maintenance', enabled: true },
    { type: 'restaurant', name: 'Restaurant', enabled: true },
  ],

  supportedLanguages: ['en', 'fr', 'zh', 'ru', 'ko', 'vi'],
};

// ============================================
// Hotel Configuration Hook
// ============================================

export const useHotelConfiguration = () => {
  logger.debug('[DEBUG] useHotelConfiguration hook called', 'Component');
  const [config, setConfig] = useState<HotelConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nhận diện subdomain giống useHotelConfig
  const extractHotelIdentifier = (): {
    type: 'default' | 'subdomain' | 'custom';
    identifier: string;
  } => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocalhost) {
      return { type: 'default', identifier: 'mi-nhon-hotel' };
    }
    const parts = hostname.split('.');
    if (
      parts.length >= 3 &&
      parts[parts.length - 2] === 'talk2go' &&
      parts[parts.length - 1] === 'online'
    ) {
      return { type: 'subdomain', identifier: parts[0] };
    }
    return { type: 'custom', identifier: hostname };
  };

  const loadConfiguration = useCallback(async () => {
    logger.debug('[DEBUG] loadConfiguration called', 'Component');
    try {
      setIsLoading(true);
      setError(null);
      const { type, identifier } = extractHotelIdentifier();
      logger.debug('[DEBUG] extractHotelIdentifier', 'Component', {
        type,
        identifier,
      });
      if (type === 'default') {
        setConfig(MI_NHON_DEFAULT_CONFIG);
        return;
      }
      if (type === 'subdomain') {
        // ✅ FIXED: Use existing endpoint that doesn't require authentication
        const endpoint = `/api/hotel/by-subdomain/${identifier}`;
        logger.debug(
          '[DEBUG] Fetching hotel config from existing endpoint',
          'Component',
          endpoint
        );
        try {
          const response = await fetch(endpoint);
          logger.debug('[DEBUG] fetch response', 'Component', response);
          if (!response.ok) {
            logger.warn(
              '[DEBUG] Hotel config endpoint failed, using default config',
              'Component',
              {
                status: response.status,
                statusText: response.statusText,
                endpoint,
              }
            );
            // Fall back to default config instead of throwing error
            setConfig(MI_NHON_DEFAULT_CONFIG);
            return;
          }
          const hotelData = await response.json();
          logger.debug('[DEBUG] hotelData', 'Component', hotelData);
          setConfig({
            hotelName: hotelData.name,
            logoUrl:
              hotelData.branding?.logo ||
              `https://via.placeholder.com/200x80/2C3E50/FFFFFF?text=${encodeURIComponent(hotelData.name)}`,
            primaryColor: hotelData.branding?.primaryColor || '#2C3E50',
            headerText: hotelData.name,
            vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
            vapiAssistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
            branding: {
              logo:
                hotelData.branding?.logo ||
                `https://via.placeholder.com/200x80/2C3E50/FFFFFF?text=${encodeURIComponent(hotelData.name)}`,
              colors: {
                primary: hotelData.branding?.primaryColor || '#2C3E50',
                secondary: hotelData.branding?.secondaryColor || '#34495E',
                accent: hotelData.branding?.accentColor || '#E74C3C',
              },
              fonts: {
                primary: hotelData.branding?.PrimaryFont || 'Inter',
                secondary: hotelData.branding?.SecondaryFont || 'Roboto',
              },
            },
            features: hotelData.features || {
              hasVoiceAssistant: true,
              hasMultiLanguage: true,
              hasRoomService: true,
              hasSpa: true,
              hasPool: true,
              hasRestaurant: true,
            },
            services: hotelData.services || [
              'Room Service',
              'Spa & Wellness',
              'Swimming Pool',
              'Restaurant',
              'Beach Access',
              'Concierge',
            ],
            supportedLanguages: hotelData.supportedLanguages || [
              'en',
              'vi',
              'fr',
              'zh',
              'ru',
              'ko',
            ],
          });
          return;
        } catch (err) {
          logger.error('[DEBUG] fetch hotel config error', 'Component', err);
          // Fall back to default config on fetch error
          setConfig(MI_NHON_DEFAULT_CONFIG);
          return;
        }
      }
      // Nếu là custom domain hoặc fallback, dùng config mặc định
      setConfig(MI_NHON_DEFAULT_CONFIG);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load configuration'
      );
      setConfig(MI_NHON_DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();

    // no cleanup needed
  }, [loadConfiguration]);

  return {
    config,
    isLoading,
    error,
    reload: loadConfiguration,
    isMiNhon: false,
  };
};

// ============================================
// Helper Functions
// ============================================

// Cache for Vapi configurations to avoid repeated API calls
const vapiConfigCache: {
  [key: string]: { publicKey: string; assistantId: string; fallback: boolean };
} = {};

const fetchVapiConfig = async (
  language: string
): Promise<{ publicKey: string; assistantId: string; fallback: boolean }> => {
  // Check cache first
  if (vapiConfigCache[language]) {
    return vapiConfigCache[language];
  }

  try {
    const response = await fetch(`/api/vapi/config/${language}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Vapi config: ${response.status}`);
    }

    const config = await response.json();
    logger.debug(
      '🔧 [fetchVapiConfig] Received config for ${language}:',
      'Component',
      {
        publicKey: config.publicKey
          ? `${config.publicKey.substring(0, 10)}...`
          : 'NOT SET',
        assistantId: config.assistantId
          ? `${config.assistantId.substring(0, 10)}...`
          : 'NOT SET',
        fallback: config.fallback,
      }
    );

    // Cache the result
    vapiConfigCache[language] = config;
    return config;
  } catch (error) {
    logger.error(
      '[fetchVapiConfig] Error fetching Vapi config for ${language}:',
      'Component',
      error
    );

    // Fallback to build-time environment variables if API fails
    const fallbackConfig = {
      publicKey:
        language === 'en'
          ? import.meta.env.VITE_VAPI_PUBLIC_KEY || ''
          : import.meta.env[`VITE_VAPI_PUBLIC_KEY_${language.toUpperCase()}`] ||
            import.meta.env.VITE_VAPI_PUBLIC_KEY ||
            '',
      assistantId:
        language === 'en'
          ? import.meta.env.VITE_VAPI_ASSISTANT_ID || ''
          : import.meta.env[
              `VITE_VAPI_ASSISTANT_ID_${language.toUpperCase()}`
            ] ||
            import.meta.env.VITE_VAPI_ASSISTANT_ID ||
            '',
      fallback: true,
    };

    logger.debug(
      '[fetchVapiConfig] Using fallback config for ${language}:',
      'Component',
      {
        publicKey: fallbackConfig.publicKey
          ? `${fallbackConfig.publicKey.substring(0, 10)}...`
          : 'NOT SET',
        assistantId: fallbackConfig.assistantId
          ? `${fallbackConfig.assistantId.substring(0, 10)}...`
          : 'NOT SET',
      }
    );

    vapiConfigCache[language] = fallbackConfig;
    return fallbackConfig;
  }
};

export const getVapiPublicKeyByLanguage = async (
  language: string,
  config: HotelConfiguration
): Promise<string> => {
  // For Mi Nhon Hotel, use language-specific keys from API
  if (config.hotelName === 'Mi Nhon Hotel Mui Ne') {
    try {
      const vapiConfig = await fetchVapiConfig(language);
      return vapiConfig.publicKey || config.vapiPublicKey;
    } catch (error) {
      logger.error(
        '[getVapiPublicKeyByLanguage] Error for ${language}:',
        'Component',
        error
      );
      return config.vapiPublicKey;
    }
  }

  // For other tenants, use the single assistant
  return config.vapiPublicKey || import.meta.env.VITE_VAPI_PUBLIC_KEY;
};

export const getVapiAssistantIdByLanguage = async (
  language: string,
  config: HotelConfiguration
): Promise<string> => {
  // For Mi Nhon Hotel, use language-specific assistant IDs from API
  if (config.hotelName === 'Mi Nhon Hotel Mui Ne') {
    try {
      const vapiConfig = await fetchVapiConfig(language);
      logger.debug(
        '🤖 [getVapiAssistantIdByLanguage] Selected assistant for ${language}:',
        'Component',
        {
          assistantId: vapiConfig.assistantId
            ? `${vapiConfig.assistantId.substring(0, 10)}...`
            : 'NOT SET',
          fallback: vapiConfig.fallback,
        }
      );
      return vapiConfig.assistantId || config.vapiAssistantId;
    } catch (error) {
      logger.error(
        '[getVapiAssistantIdByLanguage] Error for ${language}:',
        'Component',
        error
      );
      return config.vapiAssistantId;
    }
  }

  // For other tenants, use the single assistant
  return config.vapiAssistantId || import.meta.env.VITE_VAPI_ASSISTANT_ID;
};
