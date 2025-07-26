// 🎯 SIMPLIFIED VAPI CONTEXT - Using Official Pattern
// Replaces complex VapiContext with simple, official implementation

import { useTenantDetection } from '@/context/AuthContext';
import { HotelConfiguration } from '@/hooks/useHotelConfiguration';
import { CallOptions, VapiSimple } from '@/lib/vapiSimple';
import { CallDetails, Language } from '@/types';
import { logger } from '@shared/utils/logger';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranscript } from './TranscriptContext';

export interface VapiContextType {
  // Call state
  isCallActive: boolean;
  micLevel: number;
  callDetails: CallDetails | null;
  currentLanguage: string; // Add current language tracking

  // Actions
  startCall: (language?: string, assistantId?: string) => Promise<void>;
  endCall: () => Promise<void>;
  setCallDetails: (details: CallDetails | null) => void;
  reinitializeForLanguage: (language: string) => void; // Add language reinitialization
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
  hotelConfig?: HotelConfiguration | null;
}

export const VapiProvider: React.FC<VapiProviderProps> = ({
  children,
  hotelConfig,
}) => {
  // State
  const [isCallActive, setIsCallActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en'); // Track current language

  // References
  const vapiClientRef = useRef<VapiSimple | null>(null);
  const { addTranscript } = useTranscript();

  // ✅ FIX: Get proper tenant ID from subdomain
  const tenantInfo = useTenantDetection();

  // Get tenant ID - priority: subdomain -> customDomain -> default
  const getTenantId = (): string => {
    if (tenantInfo?.subdomain) {
      return `tenant-${tenantInfo.subdomain}`;
    }
    if (tenantInfo?.customDomain) {
      return `tenant-${tenantInfo.customDomain.replace(/\./g, '-')}`;
    }
    return 'tenant-default';
  };

  // Get environment credentials
  const getCredentials = (language: string = 'en') => {
    // Try hotel config first
    if (hotelConfig?.vapiPublicKey) {
      return {
        publicKey: hotelConfig.vapiPublicKey,
        assistantId: hotelConfig.vapiAssistantId,
      };
    }

    // Fallback to environment variables
    const publicKey =
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

    const assistantId =
      language === 'vi'
        ? import.meta.env.VITE_VAPI_ASSISTANT_ID_VI
        : language === 'fr'
          ? import.meta.env.VITE_VAPI_ASSISTANT_ID_FR
          : language === 'zh'
            ? import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH
            : language === 'ru'
              ? import.meta.env.VITE_VAPI_ASSISTANT_ID_RU
              : language === 'ko'
                ? import.meta.env.VITE_VAPI_ASSISTANT_ID_KO
                : import.meta.env.VITE_VAPI_ASSISTANT_ID;

    logger.debug(
      '🔑 [VapiProvider] Getting credentials for language:',
      'VapiProvider',
      {
        language,
        publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING',
        assistantId: assistantId
          ? `${assistantId.substring(0, 15)}...`
          : 'MISSING',
      }
    );

    return { publicKey, assistantId };
  };

  // Initialize Vapi
  const initializeVapi = (language: string = 'en') => {
    // ✅ REVERT: Remove async
    const credentials = getCredentials(language);
    const { publicKey, assistantId } = credentials;

    if (!publicKey) {
      logger.error('❌ [VapiProvider] Missing Vapi public key', 'VapiProvider');
      return null;
    }

    logger.debug('🚀 [VapiProvider] Initializing Vapi client', 'VapiProvider', {
      language,
      assistantId: assistantId
        ? `${assistantId.substring(0, 15)}...`
        : 'MISSING',
    });

    // ✅ FIX: Use correct VapiConfig structure
    const vapi = new VapiSimple({
      publicKey: publicKey,
      assistantId: assistantId,
      onMessage: message => {
        // Handle different message types
        if (message.type === 'transcript') {
          // Update call details with transcript
          setCallDetails(
            prev =>
              ({
                id: prev?.id || `call-${Date.now()}`,
                roomNumber: prev?.roomNumber || 'Unknown',
                duration: prev?.duration || '0:00',
                category: prev?.category || 'voice-assistant',
                language: language as Language,
                transcript: message.transcript,
                role: message.role,
              }) as CallDetails
          );

          // ✅ FIX: Use proper tenant ID from subdomain detection
          addTranscript({
            callId: `call-${Date.now()}`, // Same as callDetails id
            content: message.transcript,
            role: message.role as 'user' | 'assistant',
            tenantId: getTenantId(), // ✅ FIXED: Use dynamic tenant ID
          });
        }

        if (message.type === 'function-call') {
          // Handle function calls (room service, etc.)
          logger.debug('🔧 Function call', 'VapiProvider', message);
        }
      },

      onError: error => {
        logger.error('❌ Vapi error', 'VapiProvider', error);
        setIsCallActive(false);
        setMicLevel(0);
      },

      onSpeechStart: () => {
        logger.debug('🗣️ Speech started', 'VapiProvider');
        setMicLevel(0.8); // Simulate mic level
      },

      onSpeechEnd: () => {
        logger.debug('🔇 Speech ended', 'VapiProvider');
        setMicLevel(0);
      },

      onCallStart: () => {
        logger.debug('📞 Call started', 'VapiProvider');
        setIsCallActive(true);
        setMicLevel(0);
      },

      onCallEnd: () => {
        logger.debug('📴 Call ended', 'VapiProvider');
        setIsCallActive(false);
        setMicLevel(0);
        setCallDetails(null);
      },
    });

    return vapi;
  };

  // Start call function
  const startCall = async (
    language: string = 'en',
    assistantId?: string
  ): Promise<void> => {
    try {
      // Update current language
      setCurrentLanguage(language);

      // End any existing call first
      if (vapiClientRef.current && isCallActive) {
        await vapiClientRef.current.endCall();
        vapiClientRef.current.destroy();
      }

      // Initialize new client
      vapiClientRef.current = initializeVapi(language);

      if (!vapiClientRef.current) {
        throw new Error('Failed to initialize Vapi client');
      }

      // Prepare call options
      const options: CallOptions = {
        assistantId,
        timeout: 5 * 60 * 1000, // 5 minutes timeout
        metadata: {
          language,
          timestamp: new Date().toISOString(),
          source: 'hotel-voice-assistant',
        },
      };

      // Start the call
      await vapiClientRef.current.startCall(options);

      logger.debug('✅ Call started successfully', 'VapiProvider', {
        language,
        assistantId: assistantId
          ? `${assistantId.substring(0, 15)}...`
          : 'from-config',
      });
    } catch (error) {
      logger.error('❌ Failed to start call', 'VapiProvider', error);
      setIsCallActive(false);
      throw error;
    }
  };

  // End call function
  const endCall = async (): Promise<void> => {
    try {
      if (vapiClientRef.current) {
        await vapiClientRef.current.endCall();
        logger.debug('✅ Call ended successfully', 'VapiProvider');
      }
    } catch (error) {
      logger.error('❌ Failed to end call', 'VapiProvider', error);
    } finally {
      setIsCallActive(false);
      setMicLevel(0);
    }
  };

  // ✅ NEW: Reinitialize Vapi for language change
  const reinitializeForLanguage = (language: string): void => {
    logger.debug(
      '🌐 [VapiProvider] Reinitializing for language change',
      'VapiProvider',
      {
        oldLanguage: currentLanguage,
        newLanguage: language,
      }
    );

    // Only reinitialize if language actually changed
    if (language !== currentLanguage) {
      // Destroy existing client if active
      if (vapiClientRef.current) {
        if (isCallActive) {
          vapiClientRef.current.endCall().catch(error => {
            logger.error(
              '❌ Error ending call during language switch',
              'VapiProvider',
              error
            );
          });
        }
        vapiClientRef.current.destroy();
      }

      // Update current language
      setCurrentLanguage(language);

      // Initialize new client for the language (but don't start call)
      vapiClientRef.current = initializeVapi(language);

      logger.debug(
        '✅ [VapiProvider] Vapi reinitialized for language',
        'VapiProvider',
        {
          language,
          clientReady: !!vapiClientRef.current,
        }
      );
    } else {
      logger.debug(
        '⚠️ [VapiProvider] Language unchanged, skipping reinitialize',
        'VapiProvider',
        { language }
      );
    }
  };

  // ✅ REMOVED: Duplicate useEffect - only keep one clean initialization

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
      }
    };
  }, []);

  // Context value
  const contextValue: VapiContextType = {
    // Call state
    isCallActive,
    micLevel,
    callDetails,
    currentLanguage, // Expose current language

    // Call functions
    startCall,
    endCall,
    setCallDetails, // ✅ FIX: Add missing function from interface
    reinitializeForLanguage, // ✅ NEW: Add language reinitialization
  };

  return (
    <VapiContext.Provider value={contextValue}>{children}</VapiContext.Provider>
  );
};

export default VapiProvider;
