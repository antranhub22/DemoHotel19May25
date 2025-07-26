// 🎯 SIMPLIFIED VAPI CONTEXT - Using Official Pattern
// Replaces complex VapiContext with simple, official implementation

import { HotelConfiguration } from '@/hooks/useHotelConfiguration';
import { CallOptions, VapiConfig, VapiSimple } from '@/lib/vapiSimple';
import { CallDetails } from '@/types';
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

  // Actions
  startCall: (language?: string, assistantId?: string) => Promise<void>;
  endCall: () => Promise<void>;
  setCallDetails: (details: CallDetails | null) => void;
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

  // Add transcript integration
  const { addTranscript } = useTranscript();

  // Refs
  const vapiClientRef = useRef<VapiSimple | null>(null);

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

    return { publicKey, assistantId };
  };

  // Initialize Vapi client
  const initializeVapiClient = (language: string = 'en') => {
    const credentials = getCredentials(language);

    if (!credentials.publicKey) {
      logger.error('❌ No Vapi public key available', 'VapiProvider', {
        language,
      });
      return null;
    }

    const config: VapiConfig = {
      publicKey: credentials.publicKey,
      assistantId: credentials.assistantId,

      onCallStart: () => {
        logger.debug('🎙️ Call started', 'VapiProvider');
        setIsCallActive(true);
      },

      onCallEnd: () => {
        logger.debug('📞 Call ended', 'VapiProvider');
        setIsCallActive(false);
        setMicLevel(0);
      },

      onMessage: message => {
        logger.debug('📨 Message received', 'VapiProvider', {
          type: message.type,
          role: message.role,
        });

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

          // ✅ ADD: Add transcript to transcript context for realtime chat popup
          addTranscript({
            callId: `call-${Date.now()}`, // Same as callDetails id
            content: message.transcript,
            role: message.role as 'user' | 'assistant',
            tenantId: 'default', // Will be updated later
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
        logger.debug('🤐 Speech ended', 'VapiProvider');
        setMicLevel(0.2);
      },
    };

    return new VapiSimple(config);
  };

  // Start call function
  const startCall = async (
    language: string = 'en',
    assistantId?: string
  ): Promise<void> => {
    try {
      // End any existing call first
      if (vapiClientRef.current && isCallActive) {
        await vapiClientRef.current.endCall();
        vapiClientRef.current.destroy();
      }

      // Initialize new client
      vapiClientRef.current = initializeVapiClient(language);

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
        assistantId,
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
    isCallActive,
    micLevel,
    callDetails,
    startCall,
    endCall,
    setCallDetails,
  };

  return (
    <VapiContext.Provider value={contextValue}>{children}</VapiContext.Provider>
  );
};

export default VapiProvider;
