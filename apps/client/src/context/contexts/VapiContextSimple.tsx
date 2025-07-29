// 🎯 SIMPLIFIED VAPI CONTEXT - Using Official Pattern
// Replaces complex VapiContext with simple, official implementation
// ✅ UPDATED: Now uses vapiOfficial.ts instead of vapiSimple.ts

import { useTenantDetection } from '@/context/AuthContext';
import { HotelConfiguration } from '@/hooks/useHotelConfiguration';
import {
  CallOptions,
  VapiOfficial,
  VapiOfficialConfig,
} from '@/lib/vapiOfficial';
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

export const VapiProvider: React.FC<VapiProviderProps> = ({ children }) => {
  // State management
  const [isCallActive, setIsCallActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  // Refs
  const vapiClientRef = useRef<VapiOfficial | null>(null);

  // Context dependencies
  const { addTranscript } = useTranscript();
  const tenantInfo = useTenantDetection();

  // Get tenant ID function
  const getTenantId = (): string => {
    if (tenantInfo?.subdomain) {
      return `tenant-${tenantInfo.subdomain}`;
    }
    if (tenantInfo?.customDomain) {
      return `tenant-${tenantInfo.customDomain.replace(/\./g, '-')}`;
    }
    return 'tenant-default';
  };

  // ✅ UPDATED: Using VapiOfficial instead of VapiSimple
  const initializeVapi = (language: string): VapiOfficial => {
    // Get environment variables with proper validation
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

    // Language-specific assistant IDs
    const assistantIds: Record<string, string> = {
      en: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
      vi:
        import.meta.env.VITE_VAPI_ASSISTANT_ID_VI ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        '',
      fr:
        import.meta.env.VITE_VAPI_ASSISTANT_ID_FR ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        '',
      zh:
        import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        '',
      ru:
        import.meta.env.VITE_VAPI_ASSISTANT_ID_RU ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        '',
      ko:
        import.meta.env.VITE_VAPI_ASSISTANT_ID_KO ||
        import.meta.env.VITE_VAPI_ASSISTANT_ID ||
        '',
    };

    const assistantId = assistantIds[language] || assistantIds.en;

    if (!publicKey || !assistantId) {
      throw new Error(
        `Missing Vapi credentials for language ${language}: publicKey=${!!publicKey}, assistantId=${!!assistantId}`
      );
    }

    logger.debug(
      '🔧 [VapiProvider] Initializing VapiOfficial:',
      'VapiProvider',
      {
        language,
        publicKey: publicKey.substring(0, 10) + '...',
        assistantId: assistantId.substring(0, 15) + '...',
      }
    );

    // ✅ UPDATED: Create VapiOfficial config with error handling
    const config: VapiOfficialConfig = {
      publicKey,
      assistantId,
      onCallStart: () => {
        logger.debug('📞 [VapiProvider] Call started', 'VapiProvider');
        setIsCallActive(true);
        setMicLevel(0);
        // Generate new call ID when call starts
        const newCallId = `call-${Date.now()}`;
        setCurrentCallId(newCallId);
        logger.debug(
          '🆔 [VapiProvider] Call started with new call ID:',
          'VapiProvider',
          newCallId
        );
      },
      onCallEnd: () => {
        logger.debug('📞 [VapiProvider] Call ended', 'VapiProvider');
        setIsCallActive(false);
        setMicLevel(0);
        // Keep call ID for a bit to allow final transcripts, then reset
        setTimeout(() => {
          logger.debug(
            '🆔 [VapiProvider] Resetting call ID after call end',
            'VapiProvider'
          );
          setCurrentCallId(null);
        }, 2000); // 2 second delay to allow final transcripts
      },
      onMessage: message => {
        if (message.type === 'transcript') {
          // ✅ FIX: Use consistent call ID throughout the call session
          const callId = currentCallId || `call-${Date.now()}`;
          if (!currentCallId) {
            setCurrentCallId(callId);
            logger.debug(
              '🆔 [VapiProvider] Setting new call ID:',
              'VapiProvider',
              callId
            );
          }

          // ✅ DEBUG: Enhanced logging for transcript handling
          console.log('📝 [VapiProvider] Received transcript message:', {
            type: message.type,
            role: message.role,
            transcript: message.transcript?.substring(0, 50) + '...',
            callId,
            timestamp: new Date().toISOString(),
          });

          // Update call details with transcript
          setCallDetails(
            prev =>
              ({
                id: callId, // ✅ FIXED: Use consistent call ID
                roomNumber: prev?.roomNumber || 'Unknown',
                duration: prev?.duration || '0:00',
                category: prev?.category || 'voice-assistant',
                language: language as Language,
                transcript: message.transcript,
                role: message.role,
              }) as CallDetails
          );

          logger.debug(
            '📝 [VapiProvider] Adding transcript with consistent call ID:',
            'VapiProvider',
            {
              callId,
              role: message.role,
              content: message.transcript.substring(0, 50) + '...',
              tenantId: getTenantId(),
            }
          );

          // ✅ FIX: Use consistent call ID and proper tenant ID
          console.log('📝 [VapiProvider] About to call addTranscript:', {
            callId,
            content: message.transcript?.substring(0, 50) + '...',
            role: message.role,
            tenantId: getTenantId(),
          });

          addTranscript({
            callId: callId, // ✅ FIXED: Use consistent call ID
            content: message.transcript,
            role: message.role as 'user' | 'assistant',
            tenantId: getTenantId(), // ✅ FIXED: Use dynamic tenant ID
          });

          console.log('✅ [VapiProvider] addTranscript called successfully');
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
        // Reset call ID on error
        setCurrentCallId(null);
      },
      onSpeechStart: () => {
        logger.debug('🗣️ Speech started', 'VapiProvider');
        setMicLevel(0.8); // Simulate mic level
      },
      onSpeechEnd: () => {
        logger.debug('🔇 Speech ended', 'VapiProvider');
        setMicLevel(0);
      },
    };

    // ✅ UPDATED: Create VapiOfficial instance
    const vapi = new VapiOfficial(config);

    vapiClientRef.current = vapi;
    setCurrentLanguage(language);
    return vapi;
  };

  // Start call function
  const startCall = async (
    language: string = 'en',
    assistantId?: string
  ): Promise<void> => {
    try {
      // ✅ NEW: Enhanced debug logging for VapiContextSimple
      console.log('🎨 [DEBUG] VapiContextSimple.startCall called:', {
        language,
        assistantId,
        timestamp: new Date().toISOString(),
        isCallActive,
        currentLanguage,
        vapiClientExists: !!vapiClientRef.current,
      });

      // Update current language
      setCurrentLanguage(language);

      // End any existing call first
      if (vapiClientRef.current && isCallActive) {
        console.log('🔄 [DEBUG] Ending existing call before starting new one');
        await vapiClientRef.current.endCall();
        vapiClientRef.current.destroy();
      }

      // ✅ NEW: Debug before initializing client
      console.log('🚀 [DEBUG] Initializing new Vapi client:', {
        language,
        timestamp: new Date().toISOString(),
      });

      // Initialize new client
      vapiClientRef.current = initializeVapi(language);

      if (!vapiClientRef.current) {
        throw new Error('Failed to initialize Vapi client');
      }

      // ✅ NEW: Debug after client initialization
      console.log('✅ [DEBUG] Vapi client initialized successfully:', {
        language,
        clientExists: !!vapiClientRef.current,
        timestamp: new Date().toISOString(),
      });

      // ✅ UPDATED: Use CallOptions interface from vapiOfficial
      const options: CallOptions = {
        timeout: 5 * 60 * 1000, // 5 minutes timeout
        metadata: {
          language,
          timestamp: new Date().toISOString(),
          source: 'hotel-voice-assistant',
        },
      };

      // Only add assistantId if explicitly provided
      if (assistantId) {
        options.assistantId = assistantId;
      }

      console.log('🚀 [DEBUG] Starting call with options:', {
        options: {
          ...options,
          assistantId: options.assistantId?.substring(0, 15) + '...',
        },
        timestamp: new Date().toISOString(),
      });

      // ✅ UPDATED: Start call using VapiOfficial
      await vapiClientRef.current.startCall(options);

      console.log('✅ [DEBUG] Call started successfully');
    } catch (error) {
      console.error('❌ [DEBUG] Error starting call:', error);
      logger.error('❌ Failed to start call', 'VapiProvider', error);
      throw error;
    }
  };

  // End call function
  const endCall = async (): Promise<void> => {
    try {
      if (vapiClientRef.current) {
        console.log('🛑 [DEBUG] Ending call via VapiOfficial');
        await vapiClientRef.current.endCall();
        console.log('✅ [DEBUG] Call ended successfully');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error ending call:', error);
      logger.error('❌ Failed to end call', 'VapiProvider', error);
      throw error;
    }
  };

  // Reinitialize for language change
  const reinitializeForLanguage = (language: string): void => {
    if (isCallActive) {
      logger.warn('⚠️ Cannot reinitialize during active call', 'VapiProvider');
      return;
    }

    try {
      // Destroy current instance
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
      }

      // Initialize for new language
      vapiClientRef.current = initializeVapi(language);
      setCurrentLanguage(language);

      logger.debug('🔄 Reinitialized for language:', 'VapiProvider', language);
    } catch (error) {
      logger.error(
        '❌ Failed to reinitialize for language:',
        'VapiProvider',
        error
      );
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (!vapiClientRef.current) {
      try {
        vapiClientRef.current = initializeVapi(currentLanguage);
      } catch (error) {
        logger.error(
          '❌ Failed to initialize Vapi on mount:',
          'VapiProvider',
          error
        );
      }
    }

    // Cleanup on unmount
    return () => {
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
        vapiClientRef.current = null;
      }
    };
  }, []);

  const value: VapiContextType = {
    isCallActive,
    micLevel,
    callDetails,
    currentLanguage,
    startCall,
    endCall,
    setCallDetails,
    reinitializeForLanguage,
  };

  return <VapiContext.Provider value={value}>{children}</VapiContext.Provider>;
};
