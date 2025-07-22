/// <reference types="vite/client" />

// Type declaration for import.meta


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { logger } from '@shared/utils/logger';
import { CallDetails } from '@/types';
// Dynamic imports for code splitting - loaded when needed
import { getVapiPublicKeyByLanguage,  } from '@/hooks/useHotelConfiguration';
// Dynamic import for code splitting - resetVapi loaded when needed

export interface VapiContextType {
  // Vapi state
  micLevel: number;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails | null) => void;

  // Vapi actions
  initializeVapi: (
    language: string,
    hotelConfig?: HotelConfiguration | null
  ) => Promise<void>;
  startVapiCall: (assistantId: string) => Promise<any>;
  stopVapi: () => void;
  setMuted: (muted: boolean) => void;
}

const VapiContext = createContext<VapiContextType | undefined>(undefined);

export function VapiProvider({ children }: { children: React.ReactNode }) {
  logger.debug('[VapiProvider] Initializing...', 'Component');

  const [micLevel, setMicLevel] = useState<number>(0);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);

  // Refs for cleanup
  const isMountedRef = useRef(true);

  // Initialize Vapi with language and configuration
  const initializeVapi = async (
    language: string,
    hotelConfig?: HotelConfiguration | null
  ) => {
    try {
      logger.debug(
        '[VapiContext] Initializing Vapi for language:',
        'Component',
        language
      );

      // Get public key based on language
      let publicKey: string | undefined;
      try {
        publicKey = hotelConfig
          ? await getVapiPublicKeyByLanguage(language as any, hotelConfig)
          : language === 'fr'
            ? import.meta.env.VITE_VAPI_PUBLIC_KEY_FR
            : language === 'zh'
              ? import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH
              : language === 'ru'
                ? import.meta.env.VITE_VAPI_PUBLIC_KEY_RU
                : language === 'ko'
                  ? import.meta.env.VITE_VAPI_PUBLIC_KEY_KO
                  : language === 'vi'
                    ? import.meta.env.VITE_VAPI_PUBLIC_KEY_VI
                    : import.meta.env.VITE_VAPI_PUBLIC_KEY;
      } catch (configError) {
        logger.error(
          '[VapiContext] Error getting public key from config:',
          'Component',
          configError
        );
        publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      }

      if (!publicKey) {
        throw new Error(
          `Vapi public key not configured for language: ${language}`
        );
      }

      if (!publicKey.startsWith('pk_')) {
        throw new Error(
          'Invalid Vapi public key format. Key should start with "pk_"'
        );
      }

      // Initialize Vapi - Dynamic import for code splitting
      const { initVapi } = await import('@/lib/vapiClient');
      const vapi = await initVapi(publicKey);

      if (!vapi) {
        throw new Error('Failed to initialize Vapi');
      }

      // Setup event listeners
      setupVapiEventListeners(vapi);

      logger.debug('[VapiContext] Vapi initialized successfully', 'Component');
    } catch (error) {
      logger.error(
        '[VapiContext] Error initializing Vapi:',
        'Component',
        error
      );
      throw error;
    }
  };

  // Setup Vapi event listeners
  const setupVapiEventListeners = (vapi: any) => {
    // Throttle micLevel updates to prevent excessive re-renders
    let lastMicLevelUpdate = 0;
    const MIC_LEVEL_THROTTLE = 100; // Only update every 100ms

    vapi.on('volume-level', (level: number) => {
      try {
        const now = Date.now();
        if (now - lastMicLevelUpdate > MIC_LEVEL_THROTTLE) {
          setMicLevel(level);
          lastMicLevelUpdate = now;
        }
      } catch (error) {
        logger.warn(
          '[VapiContext] Error handling volume-level:',
          'Component',
          error
        );
      }
    });

    vapi.on('error', (error: any) => {
      logger.error('[VapiContext] Vapi error:', 'Component', error);
    });
  };

  // Start Vapi call with assistant ID
  const startVapiCall = async (assistantId: string) => {
    try {
      logger.debug(
        '[VapiContext] Starting Vapi call with assistant:',
        'Component',
        assistantId
      );

      // Dynamic import for code splitting
      const { getVapiInstance } = await import('@/lib/vapiClient');
      const vapi = getVapiInstance();
      if (!vapi) {
        throw new Error('Vapi instance not initialized');
      }

      if (!assistantId.startsWith('asst_')) {
        throw new Error(
          'Invalid assistant ID format. ID should start with "asst_"'
        );
      }

      const call = await vapi.start(assistantId);

      if (!call) {
        throw new Error('Failed to start Vapi call');
      }

      logger.debug(
        '[VapiContext] Vapi call started successfully:',
        'Component',
        call?.id || 'unknown'
      );
      return call;
    } catch (error) {
      logger.error(
        '[VapiContext] Error starting Vapi call:',
        'Component',
        error
      );
      throw error;
    }
  };

  // Stop Vapi
  const stopVapi = async () => {
    try {
      logger.debug('[VapiContext] Stopping Vapi...', 'Component');

      // Dynamic import for code splitting
      const { getVapiInstance } = await import('@/lib/vapiClient');
      const vapi = getVapiInstance();
      if (vapi) {
        vapi.stop();

        // Additional cleanup if available
        if (typeof vapi.cleanup === 'function') {
          vapi.cleanup();
        }

        if (typeof vapi.disconnect === 'function') {
          vapi.disconnect();
        }
      }

      // Reset mic level
      setMicLevel(0);

      logger.debug('[VapiContext] Vapi stopped successfully', 'Component');
    } catch (error) {
      logger.error('[VapiContext] Error stopping Vapi:', 'Component', error);
    }
  };

  // Set muted state
  const setMuted = async (muted: boolean) => {
    try {
      // Dynamic import for code splitting
      const { getVapiInstance } = await import('@/lib/vapiClient');
      const vapi = getVapiInstance();
      if (vapi && typeof vapi.setMuted === 'function') {
        vapi.setMuted(muted);
        logger.debug('[VapiContext] Mute state set to:', 'Component', muted);
      }
    } catch (error) {
      logger.error(
        '[VapiContext] Error setting mute state:',
        'Component',
        error
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopVapi();
    };
  }, []);

  const value: VapiContextType = {
    micLevel,
    callDetails,
    setCallDetails,
    initializeVapi,
    startVapiCall,
    stopVapi,
    setMuted,
  };

  return <VapiContext.Provider value={value}>{children}</VapiContext.Provider>;
}

export function useVapi() {
  const context = useContext(VapiContext);
  if (context === undefined) {
    throw new Error('useVapi must be used within a VapiProvider');
  }
  return context;
}
