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

  const handleCallStart = useCallback(async (lang: Language) => {
    console.log('🎤 [useConversationState] Starting call with language:', lang);
    try {
      await startCall(lang);
      setIsCallStarted(true);
      
      // DISABLED: Focus on Interface1 development only
      // setCurrentInterface('interface2');
      console.log('📝 [DEV MODE] Staying in Interface1 - Interface2/3/4 disabled');
    } catch (error) {
      console.error('❌ [useConversationState] Error starting call:', error);
      setIsCallStarted(false);
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

  const handleCancel = (): void => {
    console.log('❌ [useConversationState] Cancel call - Stop and refresh system');
    
    // End the call first
    endCall();
    
    // Force refresh to interface1 (this will trigger full system reset in AssistantContext)
    setCurrentInterface('interface1');
    
    console.log('✅ [useConversationState] System refreshed - all states reset');
  };

  const handleConfirm = (): void => {
    console.log('✅ [useConversationState] Confirm call - Stop and prepare summary');
    
    // End the call but preserve transcripts for summary
    endCall();
    
    // Reset call state but keep conversation data
    setIsCallStarted(false);
    setShowConversation(false);
    
    // TODO: Show summary popup (will be implemented later)
    console.log('🔄 [TODO] Show summary popup for conversation');
    console.log('📝 [TODO] Conversation data preserved:', { transcriptsCount: transcripts.length });
    
    // For now, stay on interface1 (later this will show summary popup)
    setCurrentInterface('interface1');
  };

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    handleConfirm
  };
}; 