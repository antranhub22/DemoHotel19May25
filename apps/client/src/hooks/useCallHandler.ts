import { useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration, getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage } from '@/hooks/useHotelConfiguration';
import { Language } from '@/types/interface1.types';

export const useCallHandler = () => {
  const { 
    setCurrentInterface,
    setTranscripts,
    setModelOutput,
    setCallDetails,
    setCallDuration,
    setEmailSentForCurrentSession,
    setLanguage
  } = useAssistant();

  const { config: hotelConfig } = useHotelConfiguration();

  const handleCall = useCallback(async (lang: Language) => {
    console.log('[useCallHandler] handleCall called with language:', lang);
    
    if (!hotelConfig) {
      console.error('[useCallHandler] Hotel configuration not loaded');
      return { success: false, error: 'Hotel configuration not loaded' };
    }

    console.log('[useCallHandler] Starting call with language:', lang);

    setEmailSentForCurrentSession(false);
    setCallDetails({
      id: `call-${Date.now()}`,
      roomNumber: '',
      duration: '',
      category: '',
      language: lang
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
    
    const publicKey = getVapiPublicKeyByLanguage(lang, hotelConfig);
    const assistantId = getVapiAssistantIdByLanguage(lang, hotelConfig);
    
    console.log('[useCallHandler] Vapi configuration:', { publicKey, assistantId, lang });
    
    // Development mode: Skip Vapi validation and directly switch interface for testing
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if ((!publicKey || !assistantId) && isDevelopment) {
      console.warn('[useCallHandler] DEVELOPMENT MODE: Vapi keys missing, skipping call but switching interface for testing');
      setLanguage(lang);
      setCurrentInterface('interface2');
      return { success: true, isDevelopment: true };
    }
    
    if (!publicKey || !assistantId) {
      const error = `Vapi configuration not available for language: ${lang}`;
      console.error('[useCallHandler]', error);
      return { success: false, error };
    }
    
    try {
      console.log('[useCallHandler] Initializing Vapi with public key:', publicKey);
      setLanguage(lang);
      
      if (assistantId) {
        console.log('[useCallHandler] Starting Vapi call with assistant ID:', assistantId);
        
        console.log('[useCallHandler] 🔄 CALLING setCurrentInterface("interface2")');
        setCurrentInterface('interface2');
        console.log('[useCallHandler] ✅ setCurrentInterface("interface2") called');
        
        return { success: true };
      } else {
        const error = 'Failed to get Vapi instance or assistant ID';
        console.error('[useCallHandler]', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('[useCallHandler] Error starting Vapi call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }, [hotelConfig, setEmailSentForCurrentSession, setCallDetails, setTranscripts, setModelOutput, setCallDuration, setLanguage, setCurrentInterface]);

  return { handleCall };
}; 