import { useState, useEffect, RefObject, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { INTERFACE_CONSTANTS } from '@/constants/interfaceConstants';
import { Language } from '@/types/interface1.types';

interface UseConversationStateProps {
  conversationRef: RefObject<HTMLDivElement>;
}

interface UseConversationStateReturn {
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (lang: Language) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;
}

export const useConversationState = ({ 
  conversationRef 
}: UseConversationStateProps): UseConversationStateReturn => {
  // Use AssistantContext for real vapi integration
  const { 
    startCall, 
    endCall, 
    callDuration,
    setCurrentInterface,
    transcripts,
    setLanguage
  } = useAssistant();
  
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Sync with AssistantContext call state using callDuration
  useEffect(() => {
    const isActive = callDuration > 0;
    setIsCallStarted(isActive);
    setShowConversation(isActive || transcripts.length > 0);
  }, [callDuration, transcripts.length]);

  // Auto scroll to conversation when it appears
  useEffect(() => {
    if (showConversation && conversationRef.current) {
      setTimeout(() => {
        conversationRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, INTERFACE_CONSTANTS.AUTO_SCROLL_DELAY);
    }
  }, [showConversation, conversationRef]);

  const handleCallStart = useCallback(async (lang: Language): Promise<{ success: boolean; error?: string }> => {
    console.log('🎤 [useConversationState] Starting call with language:', lang);
    
    // Check if we should force VAPI calls in development
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;
    
    // DEV MODE: Skip actual API calls UNLESS forced or credentials available
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      console.log('🚧 [DEV MODE] Simulating call start - no API calls (no credentials or force flag)');
      setIsCallStarted(true);
      return { success: true };
    }
    
    // If we have credentials or force flag, proceed with real VAPI call
    if (isDevelopment && (forceVapiInDev || hasVapiCredentials)) {
      console.log('🔥 [DEV MODE] FORCING REAL VAPI CALL - credentials available or forced');
    }
    
    try {
      await startCall();
      setIsCallStarted(true);
      
      // DISABLED: Focus on Interface1 development only
      // setCurrentInterface('interface2');
      console.log('📝 [DEV MODE] Staying in Interface1 - Interface2/3/4 disabled');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [useConversationState] Error starting call:', error);
      setIsCallStarted(false);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start call' 
      };
    }
  }, [startCall]);

  const handleCallEnd = useCallback(() => {
    console.log('🛑 [useConversationState] Ending call');
    
    // Check if we should force VAPI calls in development
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;
    
    // DEV MODE: Skip API calls UNLESS forced or credentials available
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      console.log('🚧 [DEV MODE] Simulating call end - no API calls');
      setIsCallStarted(false);
      return;
    }
    
    // If we have credentials or force flag, proceed with real VAPI call end
    if (isDevelopment && (forceVapiInDev || hasVapiCredentials)) {
      console.log('🔥 [DEV MODE] FORCING REAL VAPI CALL END - credentials available or forced');
    }
    
    endCall();
    setIsCallStarted(false);
    
    // DISABLED: Focus on Interface1 development only  
    // setCurrentInterface('interface1');
    console.log('📝 [DEV MODE] Staying in Interface1 - No interface switching');
  }, [endCall]);

  const handleCancel = useCallback(() => {
    console.log('❌ [useConversationState] Canceling call - FULL RESET');
    
    try {
      // End call immediately
      endCall();
      
      // Reset all local states
      setIsCallStarted(false);
      setShowConversation(false);
      
      console.log('✅ [useConversationState] Cancel completed - all states reset');
      console.log('📊 [useConversationState] Final state: isCallStarted=false, showConversation=false');
    } catch (error) {
      console.error('❌ [useConversationState] Error in handleCancel:', error);
    }
  }, [endCall]);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useConversationState] Confirming call - PROCESSING SUMMARY');
    
    try {
      // End call and prepare for summary  
      endCall();
      
      // Update states
      setIsCallStarted(false);
      // Keep showConversation true temporarily for summary processing
      
      console.log('✅ [useConversationState] Confirm completed - ready for summary');
      console.log('📊 [useConversationState] Final state: isCallStarted=false, preparing summary...');
    } catch (error) {
      console.error('❌ [useConversationState] Error in handleConfirm:', error);
      // Fallback reset
      setIsCallStarted(false);
      setShowConversation(false);
    }
  }, [endCall]);

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    handleConfirm
  };
}; 