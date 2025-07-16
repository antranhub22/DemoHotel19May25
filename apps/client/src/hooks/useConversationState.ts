import { useState, useEffect, RefObject } from 'react';
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
}

export const useConversationState = ({ 
  conversationRef 
}: UseConversationStateProps): UseConversationStateReturn => {
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

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

  const handleCall = async (lang: Language): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call handling logic here - this would be replaced with actual implementation
      // For now, we'll simulate the original behavior
      console.log('Starting call with language:', lang);
      
      // Simulate async call operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('Error in handleCall:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start call' 
      };
    }
  };

  const handleCallStart = async (lang: Language): Promise<{ success: boolean; error?: string }> => {
    const result = await handleCall(lang);
    if (result.success) {
      setIsCallStarted(true);
      setShowConversation(true);
    }
    return result;
  };

  const handleCallEnd = (): void => {
    setIsCallStarted(false);
    setShowConversation(false);
  };

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd
  };
}; 