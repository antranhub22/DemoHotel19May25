import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useHotelConfig, HotelConfig, getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage, hasFeature, getSupportedLanguages, getAvailableServices } from '../hooks/useHotelConfig'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// Hotel context interfaces
interface HotelContextValue {
  // Configuration state
  config: HotelConfig | null
  loading: boolean
  error: string | null
  isDefaultConfig: boolean
  
  // Configuration management
  reload: () => Promise<void>
  clearError: () => void
  updateConfig: (updates: Partial<HotelConfig>) => void
  
  // Helper functions
  getVapiPublicKey: (language: string) => string
  getVapiAssistantId: (language: string) => string
  hasFeature: (feature: keyof HotelConfig['features']) => boolean
  getSupportedLanguages: () => string[]
  getAvailableServices: (category?: string) => HotelConfig['services']
  
  // Theme utilities
  getThemeColors: () => {
    primary: string
    secondary: string
    accent: string
  }
  getFontFamilies: () => {
    primary: string
    secondary: string
  }
  
  // Contact information
  getContactInfo: () => HotelConfig['contact'] | null
  
  // Location utilities
  getLocation: () => HotelConfig['location'] | null
  getTimezone: () => string
  getCurrency: () => string
}

// Create context
const HotelContext = createContext<HotelContextValue | undefined>(undefined)

// Error boundary component for hotel configuration
interface HotelErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

class HotelErrorBoundary extends React.Component<
  HotelErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: HotelErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Hotel configuration error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Configuration Error
            </h2>
            <p className="text-gray-600 mb-4">
              Failed to load hotel configuration. Please try refreshing the page.
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
    }

    return this.props.children
  }
}

// Loading component
const HotelConfigLoader: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config, loading, error, reload, clearError } = useHotelConfig()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading hotel configuration...</p>
        </div>
      </div>
    )
  }
  
  if (error && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => clearError()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Dismiss
            </button>
            <button
              onClick={() => reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

// Hotel context provider
interface HotelProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

export const HotelProvider: React.FC<HotelProviderProps> = ({ children, fallback }) => {
  console.log('[DEBUG] HotelProvider render');

  // Sử dụng hook useHotelConfig để lấy đúng context value
  const hotelConfigHook = useHotelConfig();
  const {
    config,
    loading,
    error,
    isDefaultConfig,
    reload,
    clearError,
    updateConfig
  } = hotelConfigHook;

  // Helper functions sử dụng config hiện tại
  const getVapiPublicKey = (language: string) => getVapiPublicKeyByLanguage(config, language);
  const getVapiAssistantId = (language: string) => getVapiAssistantIdByLanguage(config, language);
  const hasFeatureFn = (feature: keyof HotelConfig['features']) => hasFeature(config, feature);
  const getSupportedLanguagesFn = () => getSupportedLanguages(config);
  const getAvailableServicesFn = (category?: string) => getAvailableServices(config, category);
  const getThemeColors = () => ({
    primary: config?.branding.primaryColor || '#2E7D32',
    secondary: config?.branding.secondaryColor || '#FFC107',
    accent: config?.branding.accentColor || '#FF6B6B'
  });
  const getFontFamilies = () => ({
    primary: config?.branding.primaryFont || 'Inter',
    secondary: config?.branding.secondaryFont || 'Roboto'
  });
  const getContactInfo = () => config?.contact || null;
  const getLocation = () => config?.location || null;
  const getTimezone = () => config?.timezone || 'UTC';
  const getCurrency = () => config?.currency || 'USD';

  return (
    <HotelContext.Provider value={{
      config,
      loading,
      error,
      isDefaultConfig,
      reload,
      clearError,
      updateConfig,
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
      getCurrency
    }}>
      {children}
    </HotelContext.Provider>
  );
};

// Custom hook to use hotel context
export const useHotel = (): HotelContextValue => {
  const context = useContext(HotelContext)
  
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  
  return context
}

// Additional utility hooks
export const useHotelTheme = () => {
  const { getThemeColors, getFontFamilies } = useHotel()
  
  return {
    colors: getThemeColors(),
    fonts: getFontFamilies()
  }
}

export const useHotelFeatures = () => {
  const { hasFeature } = useHotel()
  
  return {
    hasFeature,
    isMultiLanguage: hasFeature('multiLanguage'),
    hasCallHistory: hasFeature('callHistory'),
    hasRoomService: hasFeature('roomService'),
    hasConcierge: hasFeature('concierge'),
    hasVoiceCloning: hasFeature('voiceCloning'),
    hasAnalytics: hasFeature('analytics')
  }
}

export const useHotelServices = (category?: string) => {
  const { getAvailableServices } = useHotel()
  
  return {
    services: getAvailableServices(category),
    getServicesByCategory: (cat: string) => getAvailableServices(cat)
  }
}

export const useHotelVapi = () => {
  const { getVapiPublicKey, getVapiAssistantId, getSupportedLanguages } = useHotel()
  
  return {
    getPublicKey: getVapiPublicKey,
    getAssistantId: getVapiAssistantId,
    supportedLanguages: getSupportedLanguages()
  }
}

// Export types for external use
export type { HotelConfig } from '../hooks/useHotelConfig'
export type { HotelContextValue }

export default HotelProvider 