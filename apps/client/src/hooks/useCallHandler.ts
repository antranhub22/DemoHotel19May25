import { useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { logger } from '@shared/utils/logger';
import {
  useHotelConfiguration,
  getVapiPublicKeyByLanguage,
  getVapiAssistantIdByLanguage,
} from '@/hooks/useHotelConfiguration';
import { Language } from '@/types/interface1.types';

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
      logger.debug('[useCallHandler] handleCall called with language:', 'Component', lang);

      if (!hotelConfig) {
        logger.error('[useCallHandler] Hotel configuration not loaded', 'Component');
        return { success: false, error: 'Hotel configuration not loaded' };
      }

      logger.debug('[useCallHandler] Starting call with language:', 'Component', lang);

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

      const publicKey = await getVapiPublicKeyByLanguage(lang, hotelConfig);
      const assistantId = await getVapiAssistantIdByLanguage(lang, hotelConfig);

      logger.debug('[useCallHandler] Vapi configuration:', 'Component', {
        publicKey,
        assistantId,
        lang,
      });

      // Development mode: Skip Vapi validation and directly switch interface for testing
      const isDevelopment =
        import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
      if ((!publicKey || !assistantId) && isDevelopment) {
        logger.warn('[useCallHandler] DEVELOPMENT MODE: Vapi keys missing, skipping call but switching interface for testing', 'Component');
        setLanguage(lang);
        return { success: true, isDevelopment: true };
      }

      if (!publicKey || !assistantId) {
        const error = `Vapi configuration not available for language: ${lang}`;
        logger.error('[useCallHandler]', 'Component', error);
        return { success: false, error };
      }

      try {
        logger.debug('[useCallHandler] Initializing Vapi with public key:', 'Component', publicKey);
        setLanguage(lang);

        if (assistantId) {
          logger.debug('[useCallHandler] Starting Vapi call with assistant ID:', 'Component', assistantId);

          return { success: true };
        } else {
          const error = 'Failed to get Vapi instance or assistant ID';
          logger.error('[useCallHandler]', 'Component', error);
          return { success: false, error };
        }
      } catch (error) {
        logger.error('[useCallHandler] Error starting Vapi call:', 'Component', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
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
