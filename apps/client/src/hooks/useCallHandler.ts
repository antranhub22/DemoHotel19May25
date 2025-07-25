/// <reference types="vite/client" />

// Type declaration for import.meta

import { useCallback } from 'react';
import { useAssistant } from '@/context';
import {
  getVapiAssistantIdByLanguage,
  getVapiPublicKeyByLanguage,
  useHotelConfiguration,
} from '@/hooks/useHotelConfiguration';
import { Language } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';

export const useCallHandler = () => {
  const {
    // setCurrentInterface, // ✅ REMOVED: Interface switching (focus Interface1 only)
    setTranscripts,
    setModelOutput,
    setCallDetails,
    setCallDuration,
    setEmailSentForCurrentSession,
    setLanguage,
  } = useAssistant();

  const { config: hotelConfig } = useHotelConfiguration();

  const handleCall = useCallback(
    async (lang: Language) => {
      logger.debug(
        '[useCallHandler] handleCall called with language:',
        'Component',
        lang
      );

      // ✅ NEW: Enhanced debug logging for call handler
      console.log('🎯 [DEBUG] useCallHandler.handleCall called:', {
        language: lang,
        timestamp: new Date().toISOString(),
        hotelConfig: !!hotelConfig,
        hotelConfigDetails: hotelConfig ? {
          hotelName: hotelConfig.hotelName,
          hasVapiPublicKey: !!hotelConfig.vapiPublicKey,
          hasVapiAssistantId: !!hotelConfig.vapiAssistantId
        } : null
      });

      if (!hotelConfig) {
        logger.error(
          '[useCallHandler] Hotel configuration not loaded',
          'Component'
        );

        // ✅ NEW: Enhanced error debug
        console.error('❌ [DEBUG] Hotel configuration missing:', {
          hotelConfig,
          timestamp: new Date().toISOString()
        });

        return { success: false, error: 'Hotel configuration not loaded' };
      }

      logger.debug(
        '[useCallHandler] Starting call with language:',
        'Component',
        lang
      );

      setEmailSentForCurrentSession(false);
      setCallDetails({
        id: `call-${Date.now()}`,
        roomNumber: '',
        duration: '',
        category: '',
        language: lang,
      });
      setTranscripts([]);
      setModelOutput([]);
      setCallDuration(0);

      // ✅ NEW: Debug before getting Vapi keys
      console.log('🔑 [DEBUG] Getting Vapi keys:', {
        language: lang,
        timestamp: new Date().toISOString()
      });

      const publicKey = await getVapiPublicKeyByLanguage(lang, hotelConfig);
      const assistantId = await getVapiAssistantIdByLanguage(lang, hotelConfig);

      // ✅ NEW: Enhanced Vapi config debug
      console.log('🔑 [DEBUG] Vapi keys retrieved:', {
        publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING',
        assistantId: assistantId ? `${assistantId.substring(0, 15)}...` : 'MISSING',
        language: lang,
        timestamp: new Date().toISOString(),
        publicKeyLength: publicKey?.length,
        assistantIdLength: assistantId?.length
      });

      logger.debug('[useCallHandler] Vapi configuration:', 'Component', {
        publicKey,
        assistantId,
        lang,
      });

      // Development mode: Skip Vapi validation and directly switch interface for testing
      const isDevelopment =
        import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

      // ✅ NEW: Debug development mode check
      console.log('🔧 [DEBUG] Development mode check:', {
        isDevelopment,
        envDEV: import.meta.env.DEV,
        nodeEnv: import.meta.env.NODE_ENV,
        hasPublicKey: !!publicKey,
        hasAssistantId: !!assistantId,
        timestamp: new Date().toISOString()
      });

      if ((!publicKey || !assistantId) && isDevelopment) {
        logger.warn(
          '[useCallHandler] DEVELOPMENT MODE: Vapi keys missing, skipping call but switching interface for testing',
          'Component'
        );

        // ✅ NEW: Debug development mode bypass
        console.warn('🔧 [DEBUG] Development mode bypass activated:', {
          reason: 'Missing Vapi keys',
          publicKeyMissing: !publicKey,
          assistantIdMissing: !assistantId,
          timestamp: new Date().toISOString()
        });

        setLanguage(lang);
        return { success: true, isDevelopment: true };
      }

      if (!publicKey || !assistantId) {
        const error = `Vapi configuration not available for language: ${lang}`;
        logger.error('[useCallHandler]', 'Component', error);

        // ✅ NEW: Enhanced missing keys error debug
        console.error('❌ [DEBUG] Vapi keys missing error:', {
          error,
          publicKeyMissing: !publicKey,
          assistantIdMissing: !assistantId,
          language: lang,
          timestamp: new Date().toISOString()
        });

        return { success: false, error };
      }

      try {
        logger.debug(
          '[useCallHandler] Starting Vapi call via proxy (CORS bypass):',
          'Component',
          publicKey
        );

        // ✅ NEW: Debug before Vapi proxy call
        console.log('🚀 [DEBUG] Starting Vapi call via proxy (CORS bypass):', {
          publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING',
          assistantId: assistantId ? `${assistantId.substring(0, 15)}...` : 'MISSING',
          language: lang,
          timestamp: new Date().toISOString()
        });

        setLanguage(lang);

        if (assistantId) {
          logger.debug(
            '[useCallHandler] Starting Vapi call via server proxy:',
            'Component',
            assistantId
          );

          // ✅ NEW: Debug Vapi proxy call start
          console.log('📞 [DEBUG] About to start Vapi call via proxy:', {
            assistantId: assistantId ? `${assistantId.substring(0, 15)}...` : 'MISSING',
            language: lang,
            timestamp: new Date().toISOString()
          });

          // ✅ FIXED: Use Vapi proxy instead of direct SDK call
          const { startVapiCallViaProxy } = await import('@/lib/vapiProxyClient');

          console.log('🔄 [DEBUG] Calling Vapi proxy...');

          const result = await startVapiCallViaProxy(assistantId, publicKey, {
            metadata: { language: lang, source: 'siri-button' }
          });

          console.log('📡 [DEBUG] Vapi proxy result:', {
            success: result.success,
            error: result.error,
            callId: result.data?.id,
            timestamp: new Date().toISOString()
          });

          if (result.success) {
            console.log('✅ [DEBUG] Vapi call started successfully via proxy!');
            return { success: true, data: result.data };
          } else {
            console.error('❌ [DEBUG] Vapi proxy call failed:', result.error);
            return { success: false, error: result.error || 'Vapi proxy call failed' };
          }
        } else {
          const error = 'Failed to get assistant ID';
          logger.error('[useCallHandler]', 'Component', error);

          // ✅ NEW: Debug assistant ID missing
          console.error('❌ [DEBUG] Assistant ID missing:', {
            error,
            assistantId,
            timestamp: new Date().toISOString()
          });

          return { success: false, error };
        }
      } catch (error) {
        logger.error(
          '[useCallHandler] Error starting Vapi call via proxy:',
          'Component',
          error
        );

        // ✅ NEW: Enhanced error debug
        console.error('❌ [DEBUG] Vapi proxy call error details:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : 'No stack',
          language: lang,
          timestamp: new Date().toISOString()
        });

        const errorMessage =
          error instanceof Error
            ? (error as any)?.message || String(error)
            : String(error);
        return { success: false, error: errorMessage };
      }
    },
    [
      hotelConfig,
      setEmailSentForCurrentSession,
      setCallDetails,
      setTranscripts,
      setModelOutput,
      setCallDuration,
      setLanguage,
    ]
  ); // Fixed: Removed incorrect startCall dependency

  return { handleCall };
};
