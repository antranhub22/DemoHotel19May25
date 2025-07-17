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
    endCall();
    setIsCallStarted(false);
    
    // DISABLED: Focus on Interface1 development only  
    // setCurrentInterface('interface1');
    console.log('📝 [DEV MODE] Staying in Interface1 - No interface switching');
  }, [endCall]);

  const handleCancel = useCallback(() => {
    console.log('❌ [useConversationState] Canceling call');
    
    // End call immediately
    endCall();
    setIsCallStarted(false);
    setShowConversation(false);
    
    // Reset to initial state - stay in Interface1
    console.log('📝 [DEV MODE] Call canceled - staying in Interface1');
  }, [endCall]);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useConversationState] Confirming call');
    
    // End call and prepare for summary
    endCall(); 
    setIsCallStarted(false);
    
    // In Interface1 dev mode, we stay here instead of going to Interface2/3
    console.log('📝 [DEV MODE] Call confirmed - staying in Interface1');
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