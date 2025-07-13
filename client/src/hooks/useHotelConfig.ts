import { useState, useEffect, useCallback } from 'react'

// Hotel configuration interfaces
export interface HotelConfig {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  branding: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    logo: string
    favicon?: string
    primaryFont: string
    secondaryFont: string
  }
  contact: {
    phone: string
    email: string
    address: string
    website?: string
  }
  features: {
    multiLanguage: boolean
    callHistory: boolean
    roomService: boolean
    concierge: boolean
    voiceCloning: boolean
    analytics: boolean
  }
  services: Array<{
    id: string
    name: string
    category: string
    available: boolean
    price?: number
    description?: string
  }>
  supportedLanguages: string[]
  vapiConfig: {
    publicKeys: Record<string, string>
    assistantIds: Record<string, string>
  }
  timezone: string
  currency: string
  location: {
    city: string
    country: string
    latitude?: number
    longitude?: number
  }
}

interface HotelConfigState {
  config: HotelConfig | null
  loading: boolean
  error: string | null
  isDefaultConfig: boolean
}

interface HotelConfigHook extends HotelConfigState {
  reload: () => Promise<void>
  clearError: () => void
  updateConfig: (updates: Partial<HotelConfig>) => void
}

// Default Mi Nhon Hotel configuration for backward compatibility
const getMiNhonDefaultConfig = (): HotelConfig => ({
  id: 'mi-nhon-default',
  name: 'Mi Nhon Hotel',
  subdomain: 'minhon',
  branding: {
    primaryColor: '#2E7D32',
    secondaryColor: '#FFC107',
    accentColor: '#FF6B6B',
    logo: '/assets/haily-logo1.jpg',
    primaryFont: 'Inter',
    secondaryFont: 'Roboto'
  },
  contact: {
    phone: '+84 123 456 789',
    email: 'info@minhonhotel.com',
    address: 'Mui Ne, Phan Thiet, Vietnam'
  },
  features: {
    multiLanguage: true,
    callHistory: true,
    roomService: true,
    concierge: true,
    voiceCloning: false,
    analytics: true
  },
  services: [
    { id: 'room-service', name: 'Room Service', category: 'dining', available: true },
    { id: 'concierge', name: 'Concierge', category: 'service', available: true },
    { id: 'spa', name: 'Spa Services', category: 'wellness', available: true },
    { id: 'tour', name: 'Tour Booking', category: 'activities', available: true }
  ],
  supportedLanguages: ['en', 'vi', 'fr'],
  vapiConfig: {
    publicKeys: {
      en: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
      vi: import.meta.env.VITE_VAPI_PUBLIC_KEY_VI || '',
      fr: import.meta.env.VITE_VAPI_PUBLIC_KEY_FR || ''
    },
    assistantIds: {
      en: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
      vi: import.meta.env.VITE_VAPI_ASSISTANT_ID_VI || '',
      fr: import.meta.env.VITE_VAPI_ASSISTANT_ID_FR || ''
    }
  },
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  location: {
    city: 'Phan Thiet',
    country: 'Vietnam',
    latitude: 10.9280,
    longitude: 108.1020
  }
})

// Hotel identifier extraction utilities
const extractHotelIdentifier = (): { type: 'default' | 'subdomain' | 'custom', identifier: string } => {
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  // Default Mi Nhon Hotel (localhost or minhon domain)
  if (isLocalhost || hostname.includes('minhon') || hostname.includes('localhost')) {
    return { type: 'default', identifier: 'mi-nhon-hotel' }
  }
  
  // Subdomain detection (format: hotel.talk2go.online)
  const parts = hostname.split('.')
  if (parts.length >= 3 && parts[parts.length - 2] === 'talk2go' && parts[parts.length - 1] === 'online') {
    return { type: 'subdomain', identifier: parts[0] }
  }
  
  // Custom domain
  return { type: 'custom', identifier: hostname }
}

// API call to load hotel configuration
const loadHotelConfiguration = async (identifier: string, type: string): Promise<HotelConfig> => {
  if (type === 'default') {
    return getMiNhonDefaultConfig()
  }
  
  const endpoint = type === 'subdomain' 
    ? `/api/hotels/by-subdomain/${identifier}`
    : `/api/hotels/by-domain/${identifier}`
  
  const response = await fetch(endpoint)
  
  if (!response.ok) {
    throw new Error(`Failed to load hotel configuration: ${response.status}`)
  }
  
  const hotelData = await response.json()
  
  if (!hotelData) {
    throw new Error('Hotel not found')
  }
  
  return hotelData
}

// Configuration cache
const configCache = new Map<string, { config: HotelConfig, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useHotelConfig = (): HotelConfigHook => {
  const [state, setState] = useState<HotelConfigState>({
    config: null,
    loading: true,
    error: null,
    isDefaultConfig: false
  })

  const loadConfig = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { type, identifier } = extractHotelIdentifier()
      const cacheKey = `${type}-${identifier}`
      
      // Check cache first
      const cached = configCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setState({
          config: cached.config,
          loading: false,
          error: null,
          isDefaultConfig: type === 'default'
        })
        return
      }
      
      // Load from API
      const config = await loadHotelConfiguration(identifier, type)
      
      // Cache the result
      configCache.set(cacheKey, { config, timestamp: Date.now() })
      
      setState({
        config,
        loading: false,
        error: null,
        isDefaultConfig: type === 'default'
      })
    } catch (error) {
      console.error('Failed to load hotel configuration:', error)
      
      // Fallback to default config on error
      const defaultConfig = getMiNhonDefaultConfig()
      setState({
        config: defaultConfig,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load hotel configuration',
        isDefaultConfig: true
      })
    }
  }, [])

  const reload = useCallback(async () => {
    // Clear cache and reload
    configCache.clear()
    await loadConfig()
  }, [loadConfig])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const updateConfig = useCallback((updates: Partial<HotelConfig>) => {
    setState(prev => ({
      ...prev,
      config: prev.config ? { ...prev.config, ...updates } : null
    }))
  }, [])

  // Load configuration on mount
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    ...state,
    reload,
    clearError,
    updateConfig
  }
}

// Helper functions for Vapi integration
export const getVapiPublicKeyByLanguage = (config: HotelConfig | null, language: string): string => {
  if (!config) return ''
  return config.vapiConfig.publicKeys[language] || config.vapiConfig.publicKeys['en'] || ''
}

export const getVapiAssistantIdByLanguage = (config: HotelConfig | null, language: string): string => {
  if (!config) return ''
  return config.vapiConfig.assistantIds[language] || config.vapiConfig.assistantIds['en'] || ''
}

// Feature checking utilities
export const hasFeature = (config: HotelConfig | null, feature: keyof HotelConfig['features']): boolean => {
  return config?.features[feature] ?? false
}

export const getSupportedLanguages = (config: HotelConfig | null): string[] => {
  return config?.supportedLanguages ?? ['en']
}

export const getAvailableServices = (config: HotelConfig | null, category?: string): HotelConfig['services'] => {
  if (!config) return []
  
  const services = config.services.filter(service => service.available)
  
  if (category) {
    return services.filter(service => service.category === category)
  }
  
  return services
}

export default useHotelConfig 