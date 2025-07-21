import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  useHotelConfiguration,
  HotelConfiguration,
} from '@/hooks/useHotelConfiguration';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '@shared/utils/logger';

// Hotel context interfaces
interface HotelContextValue {
  // Configuration state
  config: any | null; // Changed from HotelConfig to any as per new_code
  loading: boolean;
  error: string | null;

  // Configuration management
  reload: () => Promise<void>;

  // Helper functions
  getVapiPublicKey: (language: string) => string;
  getVapiAssistantId: (language: string) => string;
  hasFeature: (feature: keyof HotelConfiguration['features']) => boolean; // Changed from HotelConfig to any
  getSupportedLanguages: () => string[];
  getAvailableServices: (category?: string) => any['services']; // Changed from HotelConfig to any

  // Theme utilities
  getThemeColors: () => {
    primary: string;
    secondary: string;
    accent: string;
  };
  getFontFamilies: () => {
    primary: string;
    secondary: string;
  };

  // Contact information
  getContactInfo: () => any | null; // Changed from HotelConfig to any

  // Location utilities
  getLocation: () => any | null; // Changed from HotelConfig to any
  getTimezone: () => string;
  getCurrency: () => string;
}

// Create context
const HotelContext = createContext<HotelContextValue | undefined>(undefined);

// Error boundary component for hotel configuration
interface HotelErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class HotelErrorBoundary extends React.Component<
  HotelErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: HotelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Hotel configuration error: ${error.message}`, 'Component', errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Configuration Error
              </h2>
              <p className="text-gray-600 mb-4">
                Failed to load hotel configuration. Please try refreshing the
                page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

interface HotelProviderProps {
  children: React.ReactNode;
}

// Xóa hoàn toàn HotelConfigLoader và mọi logic liên quan đến loading/error ở cấp context
// Trong HotelProvider, chỉ cần:
export const HotelProvider: React.FC<HotelProviderProps> = ({ children }) => {
  logger.debug('[DEBUG] HotelProvider rendered', 'Component');
  const hotelConfigHook = useHotelConfiguration();
  const { config, isLoading, error, reload } = hotelConfigHook;

  // Helper functions sử dụng config hiện tại
  const getVapiPublicKey = (_language: string) => '';
  const getVapiAssistantId = (_language: string) => '';
  const hasFeatureFn = (feature: keyof HotelConfiguration['features']) => {
    return (
      config?.features?.[feature as keyof HotelConfiguration['features']] ??
      false
    );
  };
  const getSupportedLanguagesFn = () => config?.supportedLanguages || [];
  const getAvailableServicesFn = (_category?: string) => config?.services || [];
  const getThemeColors = () => ({
    primary: config?.branding?.colors.primary || '#2E7D32',
    secondary: config?.branding?.colors.secondary || '#FFC107',
    accent: config?.branding?.colors.accent || '#FF6B6B',
  });
  const getFontFamilies = () => ({
    primary: config?.branding?.fonts.primary || 'Inter',
    secondary: config?.branding?.fonts.secondary || 'Roboto',
  });
  const getContactInfo = () => null;
  const getLocation = () => null;
  const getTimezone = () => 'UTC';
  const getCurrency = () => 'USD';

  return (
    <HotelContext.Provider
      value={{
        config,
        loading: isLoading,
        error,
        reload: async () => {},
        getVapiPublicKey,
        getVapiAssistantId,
        hasFeature: hasFeatureFn,
        getSupportedLanguages: getSupportedLanguagesFn,
        getAvailableServices: getAvailableServicesFn,
        getThemeColors,
        getFontFamilies,
        getContactInfo,
        getLocation,
        getTimezone,
        getCurrency,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

// Custom hook to use hotel context
export const useHotel = (): HotelContextValue => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    logger.warn('useHotel used outside HotelProvider - returning safe defaults', 'Component');
    // Return safe defaults instead of throwing
    return {
      config: null,
      loading: false,
      error: null,
      reload: async () => {},
      getVapiPublicKey: () => '',
      getVapiAssistantId: () => '',
      hasFeature: () => false,
      getSupportedLanguages: () => [],
      getAvailableServices: () => [],
      getThemeColors: () => ({
        primary: '#2E7D32',
        secondary: '#FFC107',
        accent: '#FF6B6B',
      }),
      getFontFamilies: () => ({ primary: 'Inter', secondary: 'Roboto' }),
      getContactInfo: () => null,
      getLocation: () => null,
      getTimezone: () => 'UTC',
      getCurrency: () => 'USD',
    };
  }
  return context;
};

// Additional utility hooks
export const useHotelTheme = () => {
  const { getThemeColors, getFontFamilies } = useHotel();

  return {
    colors: getThemeColors(),
    fonts: getFontFamilies(),
  };
};

export const useHotelFeatures = () => {
  const { hasFeature } = useHotel();
  return {
    hasFeature,
    isMultiLanguage: hasFeature('multiLanguage'),
    hasCallHistory: hasFeature('callHistory'),
    hasAnalytics: hasFeature('analytics'),
  };
};

export const useHotelServices = (category?: string) => {
  const { getAvailableServices } = useHotel();

  return {
    services: getAvailableServices(category),
    getServicesByCategory: (cat: string) => getAvailableServices(cat),
  };
};

export const useHotelVapi = () => {
  const { getVapiPublicKey, getVapiAssistantId, getSupportedLanguages } =
    useHotel();

  return {
    getPublicKey: getVapiPublicKey,
    getAssistantId: getVapiAssistantId,
    supportedLanguages: getSupportedLanguages(),
  };
};

// Export types for external use
export type { HotelContextValue };

export default HotelProvider;
