import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HotelConfiguration } from '@/hooks/useHotelConfiguration';
import { CallDetails } from '@/types';
import { logger } from '@shared/utils/logger';
// Dynamic imports for code splitting - loaded when needed
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
  endVapiCall: () => void;
  resetVapi: () => Promise<void>;
}

const VapiContext = createContext<VapiContextType | undefined>(undefined);

export const useVapi = (): VapiContextType => {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error('useVapi must be used within a VapiProvider');
  }
  return context;
};

interface VapiProviderProps {
  children: React.ReactNode;
}

export const VapiProvider: React.FC<VapiProviderProps> = ({ children }) => {
  // Vapi state
  const [micLevel, setMicLevel] = useState<number>(0);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);

  // Refs for Vapi instance and cleanup
  const vapiInstanceRef = useRef<any>(null);
  const eventListenersRef = useRef<{ [key: string]: Function }>({});

  // ✅ Initialize Vapi with hotel configuration
  const initializeVapi = async (
    language: string = 'en',
    hotelConfig?: HotelConfiguration | null
  ): Promise<void> => {
    try {
      logger.debug(
        '[VapiContext] Initializing Vapi with language:',
        'Component',
        language
      );

      // Determine public key from hotel configuration or environment
      let publicKey: string | undefined;

      if (hotelConfig?.vapiPublicKey) {
        publicKey = hotelConfig.vapiPublicKey;
        logger.debug(
          '[VapiContext] Using hotel config public key',
          'Component'
        );
      } else {
        // Fallback to environment variables by language
        publicKey =
          language === 'vi'
            ? import.meta.env.VITE_VAPI_PUBLIC_KEY_VI
            : language === 'fr'
              ? import.meta.env.VITE_VAPI_PUBLIC_KEY_FR
              : language === 'zh'
                ? import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH
                : language === 'ru'
                  ? import.meta.env.VITE_VAPI_PUBLIC_KEY_RU
                  : language === 'ko'
                    ? import.meta.env.VITE_VAPI_PUBLIC_KEY_KO
                    : import.meta.env.VITE_VAPI_PUBLIC_KEY;
        logger.debug(
          '[VapiContext] Using environment public key for language:',
          'Component',
          language
        );
      }

      if (!publicKey) {
        throw new Error(
          `No Vapi public key available for language: ${language}`
        );
      }

      // Dynamic import to reduce initial bundle size
      const { initVapi } = await import('@/lib/vapiClient');

      // Initialize Vapi with the public key
      const vapiInstance = await initVapi(publicKey);
      vapiInstanceRef.current = vapiInstance;

      // Set up event listeners for Vapi events
      const speechStartListener = () => {
        logger.debug('[VapiContext] Speech started', 'Component');
      };

      const speechEndListener = () => {
        logger.debug('[VapiContext] Speech ended', 'Component');
        setMicLevel(0);
      };

      const volumeListener = (volume: { level: number }) => {
        setMicLevel(volume.level || 0);
      };

      const callStartListener = () => {
        logger.debug('[VapiContext] Call started', 'Component');
      };

      const callEndListener = () => {
        logger.debug('[VapiContext] Call ended', 'Component');
        setMicLevel(0);
      };

      const errorListener = (error: any) => {
        logger.error('[VapiContext] Vapi error:', 'Component', error);
      };

      // Add event listeners
      vapiInstance.on('speech-start', speechStartListener);
      vapiInstance.on('speech-end', speechEndListener);
      vapiInstance.on('volume-level', volumeListener);
      vapiInstance.on('call-start', callStartListener);
      vapiInstance.on('call-end', callEndListener);
      vapiInstance.on('error', errorListener);

      // Store event listeners for cleanup
      eventListenersRef.current = {
        speechStartListener,
        speechEndListener,
        volumeListener,
        callStartListener,
        callEndListener,
        errorListener,
      };

      logger.debug('[VapiContext] Vapi initialized successfully', 'Component');
    } catch (error) {
      logger.error(
        '[VapiContext] Failed to initialize Vapi:',
        'Component',
        error
      );
      throw error;
    }
  };

  // ✅ Start Vapi call using proxy to bypass CORS
  const startVapiCall = async (assistantId: string): Promise<any> => {
    try {
      logger.debug(
        '[VapiContext] Starting Vapi call via proxy for assistant:',
        'Component',
        assistantId?.substring(0, 15) + '...'
      );

      // ✅ NEW: Enhanced debug logging
      console.log('🚀 [DEBUG] VapiContext starting call via proxy:', {
        assistantId: assistantId?.substring(0, 15) + '...',
        timestamp: new Date().toISOString(),
      });

      // Validate assistant ID format
      if (
        !assistantId ||
        !assistantId.match(
          /^(asst_|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
        )
      ) {
        throw new Error(
          'Invalid assistant ID format. ID should start with "asst_" or be a valid UUID'
        );
      }

      // ✅ FIXED: Use Vapi proxy instead of direct SDK call
      const { startVapiCallViaProxy } = await import('@/lib/vapiProxyClient');

      // Get public key - try multiple sources
      let publicKey: string | undefined;

      // Try to get from current Vapi instance if available
      if (vapiInstanceRef.current?.publicKey) {
        publicKey = vapiInstanceRef.current.publicKey;
      } else {
        // Fallback to environment variable
        publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      }

      if (!publicKey) {
        throw new Error('No Vapi public key available');
      }

      console.log('🔄 [DEBUG] VapiContext calling proxy...');

      const result = await startVapiCallViaProxy(assistantId, publicKey, {
        metadata: { source: 'vapi-context' },
      });

      console.log('📡 [DEBUG] VapiContext proxy result:', {
        success: result.success,
        error: result.error,
        callId: result.data?.id,
        timestamp: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to start Vapi call via proxy');
      }

      logger.debug(
        '[VapiContext] Vapi call started successfully via proxy:',
        'Component',
        result.data?.id || 'unknown'
      );

      console.log(
        '✅ [DEBUG] VapiContext call started successfully via proxy!'
      );

      return result.data;
    } catch (error) {
      logger.error(
        '[VapiContext] Error starting Vapi call:',
        'Component',
        error
      );

      console.error('❌ [DEBUG] VapiContext call error:', {
        error: error instanceof Error ? error.message : String(error),
        assistantId: assistantId?.substring(0, 15) + '...',
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  };

  // ✅ End Vapi call
  const endVapiCall = (): void => {
    try {
      logger.debug('[VapiContext] Ending Vapi call', 'Component');

      if (vapiInstanceRef.current) {
        vapiInstanceRef.current.stop();
        logger.debug('[VapiContext] Vapi call ended', 'Component');
      } else {
        logger.warn(
          '[VapiContext] No active Vapi instance to end',
          'Component'
        );
      }
    } catch (error) {
      logger.error('[VapiContext] Error ending Vapi call:', 'Component', error);
    }
  };

  // ✅ Reset Vapi instance and clean up
  const resetVapi = async (): Promise<void> => {
    try {
      logger.debug('[VapiContext] Resetting Vapi instance', 'Component');

      // Clean up event listeners
      if (vapiInstanceRef.current && eventListenersRef.current) {
        const vapi = vapiInstanceRef.current;
        const listeners = eventListenersRef.current;

        vapi.off('speech-start', listeners.speechStartListener);
        vapi.off('speech-end', listeners.speechEndListener);
        vapi.off('volume-level', listeners.volumeListener);
        vapi.off('call-start', listeners.callStartListener);
        vapi.off('call-end', listeners.callEndListener);
        vapi.off('error', listeners.errorListener);
      }

      // Reset state
      vapiInstanceRef.current = null;
      eventListenersRef.current = {};
      setMicLevel(0);
      setCallDetails(null);

      logger.debug('[VapiContext] Vapi instance reset complete', 'Component');
    } catch (error) {
      logger.error('[VapiContext] Error resetting Vapi:', 'Component', error);
      throw error;
    }
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      resetVapi();
    };
  }, []);

  const contextValue: VapiContextType = {
    // State
    micLevel,
    callDetails,
    setCallDetails,

    // Actions
    initializeVapi,
    startVapiCall,
    endVapiCall,
    resetVapi,
  };

  return (
    <VapiContext.Provider value={contextValue}>{children}</VapiContext.Provider>
  );
};
