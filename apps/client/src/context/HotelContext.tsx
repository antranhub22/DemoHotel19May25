import {
  HotelConfiguration,
  useHotelConfiguration,
} from "@/hooks/useHotelConfiguration";
import logger from "@shared/utils/logger";
// removed unused icons
import React, { createContext } from "react";

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
  hasFeature: (feature: keyof HotelConfiguration["features"]) => boolean; // Changed from HotelConfig to any
  getSupportedLanguages: () => string[];
  getAvailableServices: (category?: string) => any["services"]; // Changed from HotelConfig to any

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
// removed unused HotelErrorBoundaryProps

interface HotelProviderProps {
  children: React.ReactNode;
}

// Xóa hoàn toàn HotelConfigLoader và mọi logic liên quan đến loading/error ở cấp context
// Trong HotelProvider, chỉ cần:
export const HotelProvider: React.FC<HotelProviderProps> = ({ children }) => {
  logger.debug("[DEBUG] HotelProvider rendered", "Component");
  const hotelConfigHook = useHotelConfiguration();
  const { config, isLoading, error } = hotelConfigHook;

  // Helper functions sử dụng config hiện tại
  const getVapiPublicKey = (_language: string) => "";
  const getVapiAssistantId = (_language: string) => "";
  const hasFeatureFn = (feature: keyof HotelConfiguration["features"]) => {
    return (
      config?.features?.[feature as keyof HotelConfiguration["features"]] ??
      false
    );
  };
  const getSupportedLanguagesFn = () => config?.supportedLanguages || [];
  const getAvailableServicesFn = (_category?: string) => config?.services || [];
  const getThemeColors = () => ({
    primary: config?.branding?.colors.primary || "#2E7D32",
    secondary: config?.branding?.colors.secondary || "#FFC107",
    accent: config?.branding?.colors.accent || "#FF6B6B",
  });
  const getFontFamilies = () => ({
    primary: config?.branding?.fonts.primary || "Inter",
    secondary: config?.branding?.fonts.secondary || "Roboto",
  });
  const getContactInfo = () => null;
  const getLocation = () => null;
  const getTimezone = () => "UTC";
  const getCurrency = () => "USD";

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
    logger.warn(
      "useHotel used outside HotelProvider - returning safe defaults",
      "Component",
    );
    // Return safe defaults instead of throwing
    return {
      config: null,
      loading: false,
      error: null,
      reload: async () => {},
      getVapiPublicKey: () => "",
      getVapiAssistantId: () => "",
      hasFeature: () => false,
      getSupportedLanguages: () => [],
      getAvailableServices: () => [],
      getThemeColors: () => ({
        primary: "#2E7D32",
        secondary: "#FFC107",
        accent: "#FF6B6B",
      }),
      getFontFamilies: () => ({ primary: "Inter", secondary: "Roboto" }),
      getContactInfo: () => null,
      getLocation: () => null,
      getTimezone: () => "UTC",
      getCurrency: () => "USD",
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
    isMultiLanguage: hasFeature("multiLanguage"),
    hasCallHistory: hasFeature("callHistory"),
    hasAnalytics: hasFeature("analytics"),
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
// Removed duplicate interface declaration
